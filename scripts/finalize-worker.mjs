import {existsSync,readFileSync,readdirSync,writeFileSync} from 'node:fs';
import path from 'node:path';

// Vinext 1.2 emits these modules at the Worker root but leaves chunk-local
// external imports. Resolve against their actual locations before packaging.
const root=path.resolve('dist/server');
const generated=/(["'])(\.\/(?:__vinext_(?:cacheability_manifest|cacheability_request_projection|pregenerated_concrete_paths)|vinext-client-assets)\.js)\1/g;
function visit(directory){for(const entry of readdirSync(directory,{withFileTypes:true})){const filename=path.join(directory,entry.name);if(entry.isDirectory()){visit(filename);continue;}if(!entry.name.endsWith('.js'))continue;const source=readFileSync(filename,'utf8');const updated=source.replace(generated,(_,quote,importPath)=>{const target=path.join(root,path.basename(importPath));if(!existsSync(target))throw new Error(`Missing generated Worker module: ${path.basename(target)}`);let relative=path.relative(path.dirname(filename),target).split(path.sep).join('/');if(!relative.startsWith('.'))relative='./'+relative;return quote+relative+quote;});if(updated!==source)writeFileSync(filename,updated);}}
if(existsSync(root)){
 visit(root);
 function verify(directory){for(const entry of readdirSync(directory,{withFileTypes:true})){const filename=path.join(directory,entry.name);if(entry.isDirectory()){verify(filename);continue;}if(!entry.name.endsWith('.js'))continue;const source=readFileSync(filename,'utf8');for(const match of source.matchAll(/(?:from|import\()\s*["'](\.[^"']+)["']/g)){const target=path.resolve(path.dirname(filename),match[1]);if(!existsSync(target))throw new Error(`Unresolved Worker module: ${path.relative(root,filename)} → ${match[1]}`);}}}
 verify(root);
}
