import { Middleware } from '../deps.ts'
import { EndpointError } from '../EndpointError.ts'

export const errorResponse: Middleware = async (ctx, next) => {
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
}
