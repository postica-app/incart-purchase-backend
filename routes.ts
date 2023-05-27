import {
    getProductFromMultipleUUIDs,
    getProductFromUUID,
    getStoreFromUUID,
    createOrder,
} from './utils.ts'
import { Router, CreateOrderType } from './deps.ts'
import { EndpointError } from './EndpointError.ts'
import { captcha } from './middlewares/index.ts'

export const routeWithCaptcha = new Router()
export const routeWithoutCaptcha = new Router()

routeWithoutCaptcha.get('/product/:uuid', async (ctx) => {
    console.log('이게 들어가야되는거 아니에요?')
    console.log('이게 왜 실행됨?')

    const uuid = ctx.params.uuid
    const product = await getProductFromUUID(uuid)

    ctx.response.body = product
})

routeWithCaptcha.use(captcha)
routeWithCaptcha
    .get('/store/:rid', async (ctx) => {
        const uuid = ctx.params.rid
        const store = await getStoreFromUUID(uuid)

        ctx.response.body = store
    })
    .post('/order', async (ctx) => {
        const body = (await ctx.request.body().value) as CreateOrderType
        const cart = body.cart

        // Quantity should be under 10

        if (cart.length > 6) {
            throw new EndpointError(
                '한 번에 최대 6 종류의 상품을 구매할 수 있습니다'
            )
        }

        // Check if all products has same store

        const productIds = body.cart.map((item) => item.product_id)
        const productByIdMap = await getProductFromMultipleUUIDs(productIds)
        const fetchedProducts = [...productByIdMap.values()]

        const storeRid = fetchedProducts[0].store_rid

        for (const product of fetchedProducts) {
            if (product.store_rid !== storeRid)
                throw new EndpointError(
                    '상품은 같은 가게에서만 구매할 수 있습니다',
                    400
                )
        }

        // Check if all options are valid

        for (const item of cart) {
            const product = productByIdMap.get(item.product_id)

            if (!product)
                throw new EndpointError('상품 정보를 찾을 수 없습니다', 400)

            const hasSameLength =
                item.selectedOptions.length === (product.options?.length || 0)

            if (!hasSameLength)
                throw new EndpointError('선택한 옵션이 잘못되었습니다', 400)

            const isOptionsInProvided = item.selectedOptions.every(
                (selection, index) =>
                    product.options[index].items.find(
                        (option) => option.name === selection
                    )
            )

            if (!isOptionsInProvided)
                throw new EndpointError('존재하지 않는 옵션입니다', 400)
        }

        await createOrder(body, productByIdMap)

        ctx.response.status = 201
        ctx.response.body = {
            success: true,
        }
    })
