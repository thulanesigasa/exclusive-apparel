export type WaitlistStoreEnv={SUPABASE_URL?:string;SUPABASE_SERVICE_ROLE_KEY?:string};
export function hasWaitlistStore(env:WaitlistStoreEnv){return Boolean(env.SUPABASE_URL&&env.SUPABASE_SERVICE_ROLE_KEY);}
export async function waitlistRpc(env:WaitlistStoreEnv,action:string,data:Record<string,unknown>={}){
 if(!hasWaitlistStore(env))throw new Error('Waiting-list database is not configured');
 const origin=new URL(env.SUPABASE_URL!);if(origin.protocol!=='https:'||origin.username||origin.password)throw new Error('Invalid database origin');
 const key=env.SUPABASE_SERVICE_ROLE_KEY!;
 const response=await fetch(new URL('/rest/v1/rpc/ea_waitlist_service',origin),{method:'POST',headers:{apikey:key,...(key.startsWith('eyJ')?{Authorization:`Bearer ${key}`}:{}) ,'Content-Type':'application/json'},body:JSON.stringify({action,data}),signal:AbortSignal.timeout(10000)});
 if(!response.ok)throw new Error('Waiting-list database request failed');
 return response.json() as Promise<any>;
}
