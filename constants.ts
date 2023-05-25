import 'dotenv'

export const IS_DEV = Deno.env.get('STAGE') === 'dev'
