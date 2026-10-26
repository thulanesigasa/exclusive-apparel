import {sendWaitlistEmails} from '../server/waitlist-email';
import {waitlist} from '../server/waitlist';
import {prelaunchResponse} from '../server/prelaunch';
import handler from 'vinext/server/fetch-handler';
import {commerce,sendPending} from '../server/commerce';
import {customerAuth} from '../server/customer-auth';
import {seoRedirect,llmResource,secureResponse} from '../server/seo-resources';
export default {async scheduled(_event:ScheduledController,env:Cloudflare.Env,ctx:ExecutionContext){ctx.waitUntil(sendWaitlistEmails(env));},async fetch(request:Request,env:Cloudflare.Env,ctx:ExecutionContext){const redirect=seoRedirect(request);if(redirect)return secureResponse(request,redirect);if(env.ASSETS&&new URL(request.url).pathname.startsWith('/photos/')&&['GET','HEAD'].includes(request.method))return secureResponse(request,await env.ASSETS.fetch(request));const reference=llmResource(request);if(reference)return secureResponse(request,reference);const gate=prelaunchResponse(request,env);if(gate)return secureResponse(request,gate);const waiting=await waitlist(request,env,task=>ctx.waitUntil(task));if(waiting)return secureResponse(request,waiting);const account=await customerAuth(request,env);if(account)return secureResponse(request,account);const response=await commerce(request,env);if(response){if(response.ok&&env.DB&&env.RESEND_API_KEY&&env.EMAIL_FROM&&['POST','PATCH'].includes(request.method))ctx.waitUntil(sendPending(env.DB,env));return secureResponse(request,response);}return secureResponse(request,await handler.fetch(request,env,ctx));}};
