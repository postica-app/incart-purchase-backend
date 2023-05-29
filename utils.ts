import { queryBuilder } from './database.ts'
import { CreateOrderType, Doc, ProductType } from './deps.ts'
import { EndpointError } from './EndpointError.ts'

const UUID_REGEX =
    /[a-f0-9]{8}-?[a-f0-9]{4}-?4[a-f0-9]{3}-?[89ab][a-f0-9]{3}-?[a-f0-9]{12}/

function checkIsValidUUID(source: string) {
    const hasProperLength = source.replaceAll('-', '').length === 32
    const isMatchToRegex = UUID_REGEX.test(source)

    return hasProperLength && isMatchToRegex
}

export const getProductFromUUID = async (uuid: string) => {
    if (!checkIsValidUUID(uuid)) throw new Error('Invalid UUID')

    const result = await queryBuilder
        .selectFrom('product')
        .selectAll()
        .where('id', '=', uuid)
        .limit(1)
        .execute()

    return result[0]
}

export const getStoreFromUUID = async (rid: string) => {
    if (rid != (+rid).toString()) throw new Error('Invalid rid')

    const result = await queryBuilder
        .selectFrom('store')
        .selectAll()
        .where('rid', '=', +rid)
        .limit(1)
        .execute()

    return result[0]
}

export const getProductFromMultipleUUIDs = async (_uuids: string[]) => {
    const uuids = _uuids.map((uuid) =>
        uuid.toLowerCase().replaceAll(/[^a-f0-9]/g, '')
    )

    if (uuids.some((uuid) => !checkIsValidUUID(uuid)))
        throw new Error('Invalid UUID')

    const queryResult = (await queryBuilder
        .selectFrom('product')
        .selectAll()
        .where('id', 'in', uuids)
        .execute()) as unknown as Doc<ProductType>[]

    if (queryResult.length !== uuids.length)
        throw new EndpointError(
            '일부 상품의 정보를 찾을 수 없습니다',
            400,
            'PRODUCT_FETCH_FAILED'
        )

    return new Map(queryResult.map((product) => [product.id, product]))
}

export const createOrder = async (
    body: CreateOrderType,
    productByIdMap: Map<string, Doc<ProductType>>
) => {
    const transactionResult = await queryBuilder
        .transaction()
        .execute(async (transaction) => {
            const { id } = await transaction
                .insertInto('order_sheet')
                .values({
                    orderer_email: body.orderer.email,
                    orderer_name: body.orderer.name,
                    orderer_phone: body.orderer.phoneNumber,
                    receiver_name: body.receiver.name,
                    receiver_phone: body.receiver.phoneNumber,
                    shipping_info: JSON.stringify(body.shipping),
                    store_rid: productByIdMap.values().next().value.store_rid,
                })
                .returning('id')
                .executeTakeFirstOrThrow()

            return await transaction
                .insertInto('order_item')
                .values(
                    body.cart.map((item) => ({
                        product_id: item.product_id,
                        amount: item.amount,
                        selected_options: JSON.stringify(item.selectedOptions),
                        order_id: id,
                        product: JSON.stringify(
                            productByIdMap.get(item.product_id)
                        ),
                    }))
                )
                .execute()
        })

    const isSuccessful = transactionResult.length === body.cart.length

    if (!isSuccessful) throw new Error('Transaction failed')

    return true
}
