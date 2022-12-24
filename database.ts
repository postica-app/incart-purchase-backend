import { Client } from './deps.ts'

export const client = new Client({
    tls: {
        caCertificates: [Deno.env.get('PEM')!.split('\\n').join('\n')],
    },
})

await client.connect()
const querySample = (
    (await client.queryObject("SELECT 'Hello world!' as test")).rows[0] as {
        test: string
    }
).test

if (querySample !== 'Hello world!')
    throw new Error('Database connection failed')

console.log('🤠 Connected to database successfully')
