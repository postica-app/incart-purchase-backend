import { IS_DEV } from '../constants.ts'
import { Middleware } from '../deps.ts'
import { EndpointError } from '../EndpointError.ts'

export const captcha: Middleware = async (ctx, next) => {
    const captchaHeader = ctx.request.headers.get('X-Captcha-Token')

    if (ctx.request.method === 'OPTIONS') return await next()

    if (!captchaHeader) {
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
                    response: captchaHeader,
                }),
            }
        )
    ).json()

    console.log(response)

    return await next()
}
