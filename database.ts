import {
    Kysely,
    PostgresAdapter,
    PostgresIntrospector,
    Client as Postgres,
    Pool as PostgresPool,
    PostgresQueryCompiler,
    QueryResult,
    CompiledQuery,
    DatabaseConnection,
    TransactionSettings,
} from './deps.ts'
import { DB } from './DatabaseType.ts'

export const client = await new PostgresPool(
    {
        tls: {
            caCertificates: [Deno.env.get('PEM')!.split('\\n').join('\n')],
        },
    },
    3,
    true
).connect()

const querySample = (
    (await client.queryObject("SELECT 'Hello world!' as test")).rows[0] as {
        test: string
    }
).test

if (querySample !== 'Hello world!')
    throw new Error('Database connection failed')

console.log('🤠 Connected to database successfully')

export const queryBuilder = new Kysely<DB>({
    dialect: {
        createAdapter() {
            return new PostgresAdapter()
        },
        createDriver() {
            return {
                acquireConnection() {
                    return Promise.resolve({
                        async executeQuery<O>(
                            compiledQuery: CompiledQuery
                        ): Promise<QueryResult<O>> {
                            const result = await client.queryObject<O>(
                                compiledQuery.sql,
                                [...compiledQuery.parameters]
                            )

                            if (
                                result.command === 'UPDATE' ||
                                result.command === 'DELETE'
                            ) {
                                return {
                                    numUpdatedOrDeletedRows: BigInt(
                                        result.rowCount!
                                    ),
                                    rows: result.rows ?? [],
                                }
                            }

                            return {
                                rows: result.rows ?? [],
                            }
                        },
                        streamQuery() {
                            throw new Error('Not supported')
                        },
                    })
                },
                async beginTransaction(
                    connection: DatabaseConnection,
                    settings: TransactionSettings
                ): Promise<void> {
                    if (settings.isolationLevel) {
                        await connection.executeQuery(
                            CompiledQuery.raw(
                                `start transaction isolation level ${settings.isolationLevel}`
                            )
                        )
                    } else {
                        await connection.executeQuery(
                            CompiledQuery.raw('begin')
                        )
                    }
                },

                async commitTransaction(
                    connection: DatabaseConnection
                ): Promise<void> {
                    await connection.executeQuery(CompiledQuery.raw('commit'))
                },

                async rollbackTransaction(
                    connection: DatabaseConnection
                ): Promise<void> {
                    await connection.executeQuery(CompiledQuery.raw('rollback'))
                },
                async releaseConnection() {
                    // No need to do anything here
                },
                async destroy() {
                    await client.end()
                },
                async init() {
                    // No need to do anything here
                },
            }
        },
        createIntrospector(db: Kysely<unknown>) {
            return new PostgresIntrospector(db)
        },
        createQueryCompiler() {
            return new PostgresQueryCompiler()
        },
    },
})
