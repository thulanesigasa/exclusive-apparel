import lifestyleAssets from './lifestyle-photo-assets.json';
import assets from './cap-photo-assets.json';
import apparelAssets from './apparel-photo-assets.json';
export const lifestylePhotos=lifestyleAssets.map(asset=>({...asset,src:`/photos/lifestyle/${asset.file}`,small:`/photos/lifestyle/${asset.file.replace('.webp','-384.webp')}`}));
export const capPhotos=[...assets.map(asset=>({src:`/photos/caps/${asset.file}`,small:`/photos/caps/${asset.file.replace('.webp','-384.webp')}`,width:asset.width,height:asset.height,alt:asset.file==='adult-1.webp'?'Black Exclusive Apparel cap photographed on its own':asset.file.startsWith('women')?'Woman wearing a black Exclusive Apparel cap':asset.file.startsWith('kids')?'Child wearing a black Exclusive Apparel cap':'Adult wearing a black Exclusive Apparel cap'})),...lifestylePhotos];
export const capMain=capPhotos.find(p=>p.src.endsWith('/adult-1.webp'))!;
export const apparelPhotos=apparelAssets.map(asset=>({...asset,src:`/photos/apparel/${asset.file}`,small:`/photos/apparel/${asset.file.replace('.webp','-384.webp')}`}));
export const productPhotoGroups:Record<string,string>={'signature-tee':'men-tees','boxy-tee':'women-tees','junior-tee':'kids-tees','crown-beanie':'beanies','relaxed-sweatpants':'sweatpants','track-pants':'trackpants'};
export const collectionPhotos={Men:capPhotos.find(p=>p.src.endsWith('/adult-2.webp'))!,Women:capPhotos.find(p=>p.src.endsWith('/women-1.webp'))!,Kids:apparelPhotos.find(p=>p.file==='kids-tees-3.webp')!};
export const collectionProducts={Men:'everyday-cap',Women:'everyday-cap',Kids:'junior-tee'};
export function photoDetails(src:string){return [...capPhotos,...apparelPhotos].find(p=>p.src===src);}
/** Upgrade legacy demo media without overwriting photographs uploaded by the owner. */
export function withProductPhotography<T extends {id:string;image:string;gallery?:string[]}>(product:T):T&{photography?:boolean}{
 const photos=product.id==='everyday-cap'?capPhotos:apparelPhotos.filter(p=>p.group===productPhotoGroups[product.id]);
 if(!photos.length)return product;
 const main=product.id==='everyday-cap'?capMain:photos[0];
 if(photos.some(p=>p.src===product.image))return {...product,gallery:[...new Set([product.image,...(product.gallery||[]),...photos.map(p=>p.src)])],photography:true};
 if(![`/products/${product.id}.svg`,`/products/${product.id}.webp`].includes(product.image))return product;
 const ownerGallery=(product.gallery||[]).filter(src=>!src.startsWith(`/products/${product.id}.`)&&!photos.some(p=>p.src===src));
 return {...product,image:main.src,gallery:[main.src,...photos.filter(p=>p!==main).map(p=>p.src),...ownerGallery],photography:true};
}
