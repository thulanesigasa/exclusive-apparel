declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    ASSETS?: Fetcher;
    SUPABASE_URL?: string;
    SUPABASE_SERVICE_ROLE_KEY?: string;
    FORMSUBMIT_ENABLED?: string;
    FORMSUBMIT_TOKEN?: string;
    SUPABASE_PUBLISHABLE_KEY?: string;
    AUTH_SESSION_KEY?: string;
    CUSTOMER_AUTH_READY?: string;
    ADMIN_EMAILS?: string;
    STORE_SETUP_SECRET?: string;
    STORE_MODE?: string;
    STOREFRONT_MODE?: string;
    WAITLIST_ADMIN_SECRET?: string;
    PAYFAST_MERCHANT_ID?: string;
    PAYFAST_MERCHANT_KEY?: string;
    PAYFAST_PASSPHRASE?: string;
    PAYFAST_SANDBOX?: string;
    RESEND_API_KEY?: string;
    WAITLIST_SITE_URL?: string;
    EMAIL_FROM?: string;
    BUCKET?: R2Bucket;
  }
}
