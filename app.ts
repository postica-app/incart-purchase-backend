import { routeWithCaptcha, routeWithoutCaptcha } from './routes.ts'
import { Oak } from './deps.ts'
import { IS_DEV } from './constants.ts'
import greeting from './greeting.ts'
import { errorResponse } from './middlewares/index.ts'

if (IS_DEV) {
    console.log(greeting.logo)
    console.log(greeting.typo)
    console.log(greeting.warning)
}

const app = new Oak()

const ALLOWED_HOSTS = [
    'http://localhost',
    'http://127.0.0.1',
    'https://purchase.incart.me',
    'https://embed.incart.me',
    'https://rycont.loca.lt',
    'https://t5176.incart.me',
    ...(IS_DEV ? ['https://hoppscotch.io'] : []),
]

app.use(errorResponse)
app.use((ctx, next) => {
    let origin = ctx.request.headers.get('origin')

    if (IS_DEV) {
        origin = 'http://localhost'
    }

    if (!origin) {
        ctx.response.status = 301
        return
    }

    if (ALLOWED_HOSTS.includes(origin)) {
        ctx.response.headers.set('Access-Control-Allow-Origin', origin)
    } else {
        ctx.response.status = 301
        return
    }

    ctx.response.headers.set('Access-Control-Allow-Headers', '*')
    ctx.response.headers.set(
        'Access-Control-Allow-Methods',
        'GET, POST, OPTIONS'
    )

    return next()
})

app.use(routeWithoutCaptcha.allowedMethods())
app.use(routeWithoutCaptcha.routes())
app.use(routeWithCaptcha.allowedMethods())
app.use(routeWithCaptcha.routes())

console.log('Server is running on port 8000')
await app.listen({ port: 8000 })
