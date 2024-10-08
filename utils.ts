import { AllSelection } from 'https://cdn.jsdelivr.net/npm/kysely/dist/esm/parser/select-parser.js'
import { queryBuilder } from './database.ts'
import { DB } from './DatabaseType.ts'
import { CreateOrderType } from './deps.ts'
import { EndpointError } from './EndpointError.ts'
import { MAIL_SENDER } from './constants.ts'
import { RESEND_API_KEY } from './constants.ts'

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

export const getStoreFromRid = async (rid: string | number) => {
    if (rid != (+rid).toString()) throw new Error('Invalid rid')

    const result = await queryBuilder
        .selectFrom('store')
        .selectAll()
        .where('rid', '=', +rid)
        .limit(1)
        .execute()

    return result[0]
}

export const getStoreInfoForMailFromRid = async (rid: number) =>
    await queryBuilder
        .selectFrom('store')
        .leftJoin('auth.users', 'store.owner_id', 'auth.users.id')
        .select(['store.name as storeName', 'auth.users.email as ownerEmail'])
        .where('rid', '=', rid)
        .limit(1)
        .executeTakeFirstOrThrow()

export const getProductFromMultipleUUIDs = async (_uuids: string[]) => {
    const uuids = _uuids.map((uuid) =>
        uuid.toLowerCase().replaceAll(/[^a-f0-9]/g, '')
    )

    if (uuids.some((uuid) => !checkIsValidUUID(uuid)))
        throw new Error('Invalid UUID')

    const queryResult = await queryBuilder
        .selectFrom('product')
        .selectAll()
        .where('id', 'in', uuids)
        .execute()

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
    productByIdMap: Map<string, AllSelection<DB, 'product'>>
) => {
    const transactionResult = await queryBuilder
        .transaction()
        .execute(async (transaction) => {
            const orderSheet = await transaction
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
                .returningAll()
                .executeTakeFirstOrThrow()

            await transaction
                .insertInto('order_item')
                .values(
                    body.cart.map((item) => ({
                        product_id: item.product_id,
                        amount: item.amount,
                        selected_options: item.selectedOptions,
                        order_id: orderSheet.id,
                        product: JSON.stringify(
                            productByIdMap.get(item.product_id)
                        ),
                    }))
                )
                .execute()

            return orderSheet
        })

    return transactionResult
}

export const sendMail = (to: string, subject: string, html: string) =>
    fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
            from: MAIL_SENDER,
            to,
            subject,
            html,
        }),
    })

export const getOrderFromId = async (id: string, hash: string) => {
    if (!checkIsValidUUID(id)) throw new Error('Invalid UUID')

    const [record] = await queryBuilder
        .selectFrom('order_sheet')
        .selectAll()
        .where('id', '=', id)
        .limit(1)
        .execute()

    if (!record) throw new EndpointError('주문을 찾을 수 없습니다', 404)
    if (!(await isValidOrderHash(hash, record))) throw new Error('Invalid hash')

    return record
}

async function isValidOrderHash(
    hash: string,
    record: AllSelection<DB, 'order_sheet'>
) {
    const computedHash = await createOrderRecordHash(record)
    return hash === computedHash
}

export async function createOrderRecordHash(
    record: AllSelection<DB, 'order_sheet'>
) {
    const hashContent = record.id + record.rid + record.orderer_phone

    const computedHash = await crypto.subtle.digest(
        'SHA-512',
        new TextEncoder().encode(hashContent)
    )

    const cipher = Array.from(new Uint8Array(computedHash))
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join('')
        .slice(0, 27)

    return cipher
}
