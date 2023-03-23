import { router } from './routes.ts'
import { Oak, oakCors } from './deps.ts'
import { IS_DEV } from './constants.ts'
import greeting from './greeting.ts'
import { errorResponse, captcha } from './middlewares/index.ts'

if (IS_DEV) {
    console.log(greeting.logo)
    console.log(greeting.typo)
    console.log(greeting.warning)
}

const app = new Oak()

const ALLOWED_HOSTS = [
    'localhost',
    '127.0.0.1',
    'purchase.incart.me',
    'embed.incart.me',
    'rycont.loca.lt',
]

app.use(captcha)
app.use(errorResponse)

app.use(
    oakCors({
        origin: (host) => {
            if (!host) return false

            const url = new URL(host)
            return ALLOWED_HOSTS.includes(url.hostname)
        },
    })
)

app.use(router.allowedMethods())
app.use(router.routes())

await app.listen({ port: 8000 })

console.log('Server is running on port 8000')
