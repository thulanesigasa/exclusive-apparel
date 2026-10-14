import vinext from 'vinext';
import {defineConfig} from 'vite';
import hostingConfig from './.openai/hosting.json' with { type: 'json' };
import {readExecutionProfile} from './scripts/execution-profile.mjs';
import {sites} from './build/sites-vite-plugin';
const managedLinux=readExecutionProfile()==='managed-linux';
export default defineConfig(async()=>{
 process.env.CLOUDFLARE_CF_FETCH_ENABLED??='false';process.env.WRANGLER_SEND_METRICS??='false';
 process.env.WRANGLER_WRITE_LOGS??='false';process.env.WRANGLER_LOG_PATH??='.wrangler/logs';process.env.WRANGLER_REGISTRY_PATH??='.wrangler/dev-registry';process.env.MINIFLARE_REGISTRY_PATH??='.wrangler/registry';
 const {cloudflare}=await import('@cloudflare/vite-plugin');
 return {server:managedLinux?{host:'0.0.0.0',allowedHosts:['terminal.local']}:{host:'0.0.0.0'},plugins:[vinext(),sites({mockAuth:!managedLinux}),cloudflare({viteEnvironment:{name:'rsc',childEnvironments:['ssr']},inspectorPort:false,config:{main:'./build/sites-worker.ts',assets:{binding:'ASSETS',run_worker_first:['/photos/*']},compatibility_flags:['nodejs_compat'],d1_databases:[{binding:hostingConfig.d1,database_name:'exclusive-apparel',database_id:'00000000-0000-4000-8000-000000000000'}],r2_buckets:[{binding:hostingConfig.r2,bucket_name:'exclusive-apparel-photos'}]}})]};
});
