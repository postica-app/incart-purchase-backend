import 'https://deno.land/x/dotenv@v3.2.0/load.ts'
export const IS_DEV = Deno.env.get('STAGE') === 'dev'
