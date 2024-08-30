import {
    getProductFromMultipleUUIDs,
    getProductFromUUID,
    getStoreFromRid,
    getOrderFromId,
    createOrder,
    sendMail,
    getStoreInfoForMailFromRid,
    createOrderRecordHash,
} from './utils.ts'
import { Router, CreateOrderType, ProductType } from './deps.ts'
import { EndpointError } from './EndpointError.ts'
import { captcha } from './middlewares/index.ts'
import { orderMail } from './mail/order.ts'
import { orderNotificationMail } from './mail/order_notification.ts'

export const routeWithCaptcha = new Router()
export const routeWithoutCaptcha = new Router()

routeWithoutCaptcha.get('/product/:uuid', async (ctx) => {
    const uuid = ctx.params.uuid
    const product = await getProductFromUUID(uuid)

    ctx.response.body = product
})

routeWithCaptcha.use(captcha)
routeWithCaptcha
    .get('/store/:rid', async (ctx) => {
        const uuid = ctx.params.rid
        const store = await getStoreFromRid(uuid)

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

            if (product.deleted_at)
                throw new EndpointError('삭제된 상품입니다', 400)

            const options = product.options as unknown as ProductType['options']

            const hasSameLength =
                item.selectedOptions.length === (options?.length || 0)

            if (!hasSameLength)
                throw new EndpointError('선택한 옵션이 잘못되었습니다', 400)

            const isOptionsInProvided = item.selectedOptions.every(
                (selection, index) =>
                    options[index].items.find(
                        (option) => option.name === selection
                    )
            )

            if (!isOptionsInProvided)
                throw new EndpointError('존재하지 않는 옵션입니다', 400)
        }

        const orderSheet = await createOrder(body, productByIdMap)
        const orderSheetHash = await createOrderRecordHash(orderSheet)

        if (!orderSheet.created_at) orderSheet.created_at = new Date()

        const orderedAt = orderSheet.created_at.toLocaleString('ko-KR', {
            timeZone: 'Asia/Seoul',
        })

        const store = await getStoreInfoForMailFromRid(
            fetchedProducts[0].store_rid
        )

        await sendMail(
            body.orderer.email,
            '주문이 완료되었습니다',
            orderMail({
                store: store.storeName,
                orderedAt,
                orderId: orderSheet.rid!,
                detailURI: `https://order.incart.me/${orderSheet.id}?r=${orderSheetHash}`,
            })
        )

        if (store.ownerEmail)
            await sendMail(
                store.ownerEmail,
                '새 주문이 접수되었습니다',
                orderNotificationMail({
                    orderedAt,
                    orderRid: orderSheet.rid!,
                    store: store.storeName,
                })
            )

        ctx.response.status = 201
        ctx.response.body = {
            success: true,
        }
    })
    .get('/order/:id', async (ctx) => {
        const id = ctx.params.id
        const hash = ctx.request.url.searchParams.get('hash')

        if (!hash) throw new EndpointError('해시값이 필요합니다', 400)

        const order = await getOrderFromId(id, hash)

        ctx.response.body = order
    })
