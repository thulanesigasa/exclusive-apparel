/** Inspect container structure and dimensions before serving untrusted raster files. */
export function validateUpload(bytes:Uint8Array,mime:string){
 if(bytes.length<24||bytes.length>5*1024*1024)throw new Error('Choose a complete image smaller than 5 MB.');
 const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength),ascii=(start:number,length:number)=>String.fromCharCode(...bytes.subarray(start,start+length));let width=0,height=0;
 if(mime==='image/png'){
  if(![137,80,78,71,13,10,26,10].every((b,i)=>bytes[i]===b)||ascii(12,4)!=='IHDR'||view.getUint32(8)!==13)throw new Error('Invalid PNG image.');
  width=view.getUint32(16);height=view.getUint32(20);let offset=8,ended=false,data=false;
  while(offset+12<=bytes.length){const size=view.getUint32(offset),type=ascii(offset+4,4);if(size>bytes.length-offset-12)throw new Error('Truncated PNG image.');if(type==='IDAT')data=true;if(type==='IEND'){if(size!==0||offset+12!==bytes.length)throw new Error('Invalid PNG ending.');ended=true;break;}offset+=12+size;}
  if(!ended||!data)throw new Error('Incomplete PNG image.');
 }else if(mime==='image/jpeg'){
  if(bytes[0]!==255||bytes[1]!==216||bytes.at(-2)!==255||bytes.at(-1)!==217)throw new Error('Invalid JPEG image.');let offset=2;
  while(offset+4<bytes.length){if(bytes[offset++]!==255)throw new Error('Invalid JPEG marker.');while(bytes[offset]===255)offset++;const marker=bytes[offset++];if(marker===218)break;if(marker===1||(marker>=208&&marker<=217))continue;const length=view.getUint16(offset);if(length<2||offset+length>bytes.length)throw new Error('Truncated JPEG image.');if([192,193,194,195,197,198,199,201,202,203,205,206,207].includes(marker)){if(length<8)throw new Error('Invalid JPEG dimensions.');height=view.getUint16(offset+3);width=view.getUint16(offset+5);}offset+=length;}
 }else if(mime==='image/webp'){
  if(ascii(0,4)!=='RIFF'||ascii(8,4)!=='WEBP'||view.getUint32(4,true)+8!==bytes.length)throw new Error('Invalid WebP image.');const kind=ascii(12,4),size=view.getUint32(16,true);if(size+20>bytes.length)throw new Error('Truncated WebP image.');
  if(kind==='VP8X'&&size>=10){width=1+bytes[24]+(bytes[25]<<8)+(bytes[26]<<16);height=1+bytes[27]+(bytes[28]<<8)+(bytes[29]<<16);}
  else if(kind==='VP8 '&&size>=10&&bytes[23]===157&&bytes[24]===1&&bytes[25]===42){width=view.getUint16(26,true)&16383;height=view.getUint16(28,true)&16383;}
  else if(kind==='VP8L'&&size>=5&&bytes[20]===47){width=1+(((bytes[22]&63)<<8)|bytes[21]);height=1+(((bytes[24]&15)<<10)|(bytes[23]<<2)|(bytes[22]>>6));}
  else throw new Error('Unsupported WebP image.');
 }else throw new Error('Use a JPEG, PNG or WebP image.');
 if(!width||!height||width>10000||height>10000||width*height>40000000)throw new Error('Image dimensions are too large or invalid.');return {width,height};
}
