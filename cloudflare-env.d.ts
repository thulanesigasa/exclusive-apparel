declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    ASSETS?: Fetcher;
    SUPABASE_URL?: string;
    SUPABASE_PUBLISHABLE_KEY?: string;
    AUTH_SESSION_KEY?: string;
    CUSTOMER_AUTH_READY?: string;
    ADMIN_EMAILS?: string;
    STORE_SETUP_SECRET?: string;
    STORE_MODE?: string;
    PAYFAST_MERCHANT_ID?: string;
    PAYFAST_MERCHANT_KEY?: string;
    PAYFAST_PASSPHRASE?: string;
    PAYFAST_SANDBOX?: string;
    RESEND_API_KEY?: string;
    EMAIL_FROM?: string;
    BUCKET?: R2Bucket;
  }
}
