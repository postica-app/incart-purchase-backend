import 'https://deno.land/x/dotenv@v3.2.0/load.ts'
export const IS_DEV = Deno.env.get('STAGE') === 'dev'
export const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
export const MAIL_SENDER = Deno.env.get('MAIL_SENDER')
