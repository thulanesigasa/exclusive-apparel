import handler from 'vinext/server/fetch-handler';
import {commerce,sendPending} from '../server/commerce';
import {customerAuth} from '../server/customer-auth';
import {seoRedirect,llmResource,secureResponse} from '../server/seo-resources';
export default {async fetch(request:Request,env:Cloudflare.Env,ctx:ExecutionContext){const redirect=seoRedirect(request);if(redirect)return secureResponse(request,redirect);const reference=llmResource(request);if(reference)return secureResponse(request,reference);const account=await customerAuth(request,env);if(account)return secureResponse(request,account);const response=await commerce(request,env);if(response){if(response.ok&&env.DB&&env.RESEND_API_KEY&&env.EMAIL_FROM&&['POST','PATCH'].includes(request.method))ctx.waitUntil(sendPending(env.DB,env));return secureResponse(request,response);}return secureResponse(request,await handler.fetch(request,env,ctx));}};
