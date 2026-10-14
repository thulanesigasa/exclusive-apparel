import handler from 'vinext/server/fetch-handler';
import {commerce,sendPending} from '../server/commerce';
export default {async fetch(request:Request,env:Cloudflare.Env,ctx:ExecutionContext){const response=await commerce(request,env);if(response){if(response.ok&&env.DB&&env.RESEND_API_KEY&&env.EMAIL_FROM&&['POST','PATCH'].includes(request.method))ctx.waitUntil(sendPending(env.DB,env));return response;}return handler.fetch(request,env,ctx);}};
