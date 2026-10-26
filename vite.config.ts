import vinext from 'vinext';
import {defineConfig,loadEnv} from 'vite';
import hostingConfig from './.openai/hosting.json' with { type: 'json' };
import {readExecutionProfile} from './scripts/execution-profile.mjs';
import {sites} from './build/sites-vite-plugin';
const managedLinux=readExecutionProfile()==='managed-linux';
export default defineConfig(async({mode})=>{
 const deployment=loadEnv(mode,process.cwd(),'');
 const option=(key:string)=>process.env[key]||deployment[key]||'';
 const databaseId=option('D1_DATABASE_ID')||'00000000-0000-4000-8000-000000000000';
 process.env.CLOUDFLARE_CF_FETCH_ENABLED??='false';process.env.WRANGLER_SEND_METRICS??='false';
 process.env.WRANGLER_WRITE_LOGS??='false';process.env.WRANGLER_LOG_PATH??='.wrangler/logs';process.env.WRANGLER_REGISTRY_PATH??='.wrangler/dev-registry';process.env.MINIFLARE_REGISTRY_PATH??='.wrangler/registry';
 const {cloudflare}=await import('@cloudflare/vite-plugin');
 return {server:managedLinux?{host:'0.0.0.0',allowedHosts:['terminal.local']}:{host:'0.0.0.0',port:5174},plugins:[vinext(),sites({mockAuth:!managedLinux}),cloudflare({viteEnvironment:{name:'rsc',childEnvironments:['ssr']},inspectorPort:false,config:{main:'./build/sites-worker.ts',triggers:{crons:['*/5 * * * *']},vars:{WAITLIST_SITE_URL:option('NEXT_PUBLIC_SITE_URL')||'https://exclusive-apparel.co.za',STOREFRONT_MODE:option('STOREFRONT_MODE')||'waitlist',STORE_MODE:option('STORE_MODE')||'test'},assets:{binding:'ASSETS',run_worker_first:['/photos/*']},compatibility_flags:['nodejs_compat'],d1_databases:[{binding:hostingConfig.d1,database_name:'exclusive-apparel',database_id:databaseId,migrations_dir:'./drizzle'}],r2_buckets:option('R2_BUCKET_NAME')?[{binding:hostingConfig.r2,bucket_name:option('R2_BUCKET_NAME')}]:[]}})]};
});
