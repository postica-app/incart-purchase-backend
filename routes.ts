import { Router } from './deps.ts'
import { getProductFromUUID, getStoreFromUUID } from './utils.ts'

export const router = new Router()

router
    .get('/product/:uuid', async (ctx) => {
        const uuid = ctx.params.uuid
        const product = await getProductFromUUID(uuid)

        ctx.response.body = product
    })
    .get('/store/:uuid', async (ctx) => {
        const uuid = ctx.params.uuid
        const store = await getStoreFromUUID(uuid)

        ctx.response.body = store
    })
    .post('/order', (ctx) => {})
