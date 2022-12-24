import { router } from './routes.ts'
import { Oak } from './deps.ts'

const stage = Deno.env.get('STAGE')

if (stage === 'dev') {
    console.log(
        // Align is little bit off, but it's okay. :D
        `
┌───────────────────────────────── ┐
│         😊 CAUTION!!😊           │
│                                  │
│  YOU ARE IN DEV MODE             │
│  But nothing bad will happen :)  │
│  Just go ahead and develop! And  │
|  don't forget to run real        │
│  server without devmode off      │
│                                  │
│  - 2022.12.24,                   │
│    By Rycont in Christmas Eve    │
└──────────────────────────────────┘
    `.trim()
    )
}

const app = new Oak()

const ALLOWED_HOSTS = [
    'localhost',
    '127.0.0.1',
    'purchase.incart.me',
    'rycont.loca.lt',
]

app.use((ctx, next) => {
    const origin = new URL(ctx.request.headers.get('Origin')!)

    if (ALLOWED_HOSTS.includes(origin.hostname)) {
        ctx.response.headers.set('Access-Control-Allow-Origin', origin.origin)
        ctx.response.headers.set(
            'Access-Control-Allow-Headers',
            'Content-Type, Authorization'
        )
    }

    return next()
})

app.use(router.routes())
app.use(router.allowedMethods())

await app.listen({ port: 8000 })

console.log('Server is running on port 8000')
