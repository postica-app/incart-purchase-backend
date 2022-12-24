import { client } from './database.ts'

const UUID_REGEX =
    /[a-f0-9]{8}-?[a-f0-9]{4}-?4[a-f0-9]{3}-?[89ab][a-f0-9]{3}-?[a-f0-9]{12}/

function checkIsValidUUID(source: string) {
    const hasProperLength = source.replaceAll('-', '').length === 32
    const isMatchToRegex = UUID_REGEX.test(source)

    return hasProperLength && isMatchToRegex
}

export const getProductFromUUID = async (uuid: string) => {
    if (!checkIsValidUUID(uuid)) throw new Error('Invalid UUID')

    const queryResult = (
        await client.queryObject(
            `SELECT * FROM product WHERE id='${uuid}' LIMIT 1`
        )
    ).rows[0]

    return queryResult as Record<string, string>
}

export const getStoreFromUUID = async (uuid: string) => {
    if (!checkIsValidUUID(uuid)) throw new Error('Invalid UUID')

    const queryResult = (
        await client.queryObject(
            `SELECT * FROM store WHERE id='${uuid}' LIMIT 1`
        )
    ).rows[0]

    return queryResult as Record<string, string>
}
