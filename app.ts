import { router } from './routes.ts'
import { Oak, oakCors } from './deps.ts'
import { EndpointError } from './EndpointError.ts'

const IS_DEV = Deno.env.get('STAGE') === 'dev'

if (IS_DEV) {
    console.log(
        `
     ══════════
    /  //════//
   /  //                            
  /  //    _____
 /  //    /__  |
/══//        | |
             | |_______________
             | //:::::::::::::/
             |//:::::::::::::/
             \\--------------/ 
              \\____________/      ════
               |----------|      /  //
               0          0     /  //
                               /  //
                      /═══════/  //
                     /══════════//
`
    )
    console.log(`
                                       
    ┌═┐┌═┐ ┌═┐ .═══.   /‾‾\\  .════. |‾‾‾‾‾|
    ‖ ‖‖  '| ‖/  ___} /_()_\\ ‖ ‖\\  } ‾‖ ‖‾
    ‖ ‖‖ |\\  ‖\\  ‾‾‾}/  /\\  \\‖ |‾\\ \\  ‖ ‖  
    └═┘└═┘ └═┘ '═══' ╰═╯  ╰═╯└═┘  '═' └═┘
    `)
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
    'embed.incart.me',
    'rycont.loca.lt',
    'tidy-rat-99.loca.lt',
]

app.use(
    oakCors({
        origin: (host) => {
            if (!host) return false

            const url = new URL(host)
            return ALLOWED_HOSTS.includes(url.hostname)
        },
    })
)

app.use(async (ctx, next) => {
    try {
        return await next()
    } catch (e) {
        if (e instanceof EndpointError) {
            ctx.response.status = e.status
            ctx.response.body = {
                message: e.message,
                code: e.code,
            }
            console.error(e)
        } else {
            ctx.response.status = 500
            ctx.response.body = {
                message:
                    '알 수 없는 문제가 발생했습니다. 다시 한번 시도해주세요.',
                code: 'internal_server_error',
            }
            console.error(e)
        }
    }
})

app.use(async (ctx, next) => {
    const captcha = ctx.request.headers.get('X-Captcha-Token')

    if (ctx.request.method === 'OPTIONS') return await next()

    if (!captcha) {
        if (IS_DEV) {
            console.log('⚠️ PLEASE CHECK!! ⚠️')
            console.log(
                "Captcha token is not provided. If you are testing, please check 'X-Captcha-Token' header."
            )

            return await next()
        } else {
            throw new EndpointError('Forbidden', 403, 'required_captcha')
        }
    }

    const response = await (
        await fetch(
            'https://challenges.cloudflare.com/turnstile/v0/siteverify',
            {
                method: 'POST',
                body: new URLSearchParams({
                    secret: Deno.env.get('TURNSTILE_SECRET_KEY')!,
                    response: captcha,
                }),
            }
        )
    ).json()

    console.log(response)

    return await next()
})

app.use(router.allowedMethods())
app.use(router.routes())

await app.listen({ port: 8000 })

console.log('Server is running on port 8000')
