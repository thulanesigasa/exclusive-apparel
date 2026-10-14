export async function boundedBody(request:Request,maxBytes:number){
 const length=Number(request.headers.get('Content-Length'));if(Number.isFinite(length)&&length>maxBytes)throw new Error('Request is too large.');
 const reader=request.body?.getReader();if(!reader)return new Uint8Array();const chunks:Uint8Array[]=[];let size=0;
 while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>maxBytes){await reader.cancel();throw new Error('Request is too large.');}chunks.push(value);}
 const result=new Uint8Array(size);let offset=0;for(const chunk of chunks){result.set(chunk,offset);offset+=chunk.length;}return result;
}
