import { ColumnType, Buffer } from './deps.ts'

export type AalLevel = 'aal1' | 'aal2' | 'aal3'

export type FactorStatus = 'unverified' | 'verified'

export type FactorType = 'totp' | 'webauthn'

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
    ? ColumnType<S, I | undefined, U>
    : ColumnType<T, T | undefined, T>

export type Int8 = ColumnType<
    string,
    string | number | bigint,
    string | number | bigint
>

export type Json = ColumnType<JsonValue, string, string>

export type JsonArray = JsonValue[]

export type JsonObject = {
    [K in string]?: JsonValue
}

export type JsonPrimitive = boolean | null | number | string

export type JsonValue = JsonArray | JsonObject | JsonPrimitive

export type KeyStatus = 'default' | 'expired' | 'invalid' | 'valid'

export type KeyType =
    | 'aead-det'
    | 'aead-ietf'
    | 'auth'
    | 'generichash'
    | 'hmacsha256'
    | 'hmacsha512'
    | 'kdf'
    | 'secretbox'
    | 'secretstream'
    | 'shorthash'
    | 'stream_xchacha20'

export type Timestamp = ColumnType<Date, Date | string, Date | string>

export interface AuthAuditLogEntries {
    instance_id: string | null
    id: string
    payload: Json | null
    created_at: Timestamp | null
    ip_address: Generated<string>
}

export interface AuthIdentities {
    id: string
    user_id: string
    identity_data: Json
    provider: string
    last_sign_in_at: Timestamp | null
    created_at: Timestamp | null
    updated_at: Timestamp | null
    email: Generated<string | null>
}

export interface AuthInstances {
    id: string
    uuid: string | null
    raw_base_config: string | null
    created_at: Timestamp | null
    updated_at: Timestamp | null
}

export interface AuthMfaAmrClaims {
    session_id: string
    created_at: Timestamp
    updated_at: Timestamp
    authentication_method: string
    id: string
}

export interface AuthMfaChallenges {
    id: string
    factor_id: string
    created_at: Timestamp
    verified_at: Timestamp | null
    ip_address: string
}

export interface AuthMfaFactors {
    id: string
    user_id: string
    friendly_name: string | null
    factor_type: FactorType
    status: FactorStatus
    created_at: Timestamp
    updated_at: Timestamp
    secret: string | null
}

export interface AuthRefreshTokens {
    instance_id: string | null
    id: Generated<Int8>
    token: string | null
    user_id: string | null
    revoked: boolean | null
    created_at: Timestamp | null
    updated_at: Timestamp | null
    parent: string | null
    session_id: string | null
}

export interface AuthSamlProviders {
    id: string
    sso_provider_id: string
    entity_id: string
    metadata_xml: string
    metadata_url: string | null
    attribute_mapping: Json | null
    created_at: Timestamp | null
    updated_at: Timestamp | null
}

export interface AuthSamlRelayStates {
    id: string
    sso_provider_id: string
    request_id: string
    for_email: string | null
    redirect_to: string | null
    from_ip_address: string | null
    created_at: Timestamp | null
    updated_at: Timestamp | null
}

export interface AuthSchemaMigrations {
    version: string
}

export interface AuthSessions {
    id: string
    user_id: string
    created_at: Timestamp | null
    updated_at: Timestamp | null
    factor_id: string | null
    aal: AalLevel | null
    not_after: Timestamp | null
}

export interface AuthSsoDomains {
    id: string
    sso_provider_id: string
    domain: string
    created_at: Timestamp | null
    updated_at: Timestamp | null
}

export interface AuthSsoProviders {
    id: string
    resource_id: string | null
    created_at: Timestamp | null
    updated_at: Timestamp | null
}

export interface AuthUsers {
    instance_id: string | null
    id: string
    aud: string | null
    role: string | null
    email: string | null
    encrypted_password: string | null
    email_confirmed_at: Timestamp | null
    invited_at: Timestamp | null
    confirmation_token: string | null
    confirmation_sent_at: Timestamp | null
    recovery_token: string | null
    recovery_sent_at: Timestamp | null
    email_change_token_new: string | null
    email_change: string | null
    email_change_sent_at: Timestamp | null
    last_sign_in_at: Timestamp | null
    raw_app_meta_data: Json | null
    raw_user_meta_data: Json | null
    is_super_admin: boolean | null
    created_at: Timestamp | null
    updated_at: Timestamp | null
    phone: Generated<string | null>
    phone_confirmed_at: Timestamp | null
    phone_change: Generated<string | null>
    phone_change_token: Generated<string | null>
    phone_change_sent_at: Timestamp | null
    confirmed_at: Generated<Timestamp | null>
    email_change_token_current: Generated<string | null>
    email_change_confirm_status: Generated<number | null>
    banned_until: Timestamp | null
    reauthentication_token: Generated<string | null>
    reauthentication_sent_at: Timestamp | null
    is_sso_user: Generated<boolean>
}

export interface Order {
    created_at: Generated<Timestamp | null>
    store_id: string
    shipping_info: Json
    orderer_name: string
    orderer_phone: string
    orderer_email: string
    receiver_name: string
    receiver_phone: string
    id: Generated<string>
}

export interface OrderItem {
    id: Generated<string>
    created_at: Generated<Timestamp | null>
    product_id: string
    amount: number
    selected_options: Json | null
    order_id: string
    product: Json
}

export interface Owner {
    created_at: Generated<Timestamp | null>
    name: string
    id: string
    store_id: string | null
}

export interface PgsodiumKey {
    id: Generated<string>
    status: Generated<KeyStatus | null>
    created: Generated<Timestamp>
    expires: Timestamp | null
    key_type: KeyType | null
    key_id: Generated<Int8 | null>
    key_context: Generated<Buffer | null>
    name: string | null
    associated_data: Generated<string | null>
    raw_key: Buffer | null
    raw_key_nonce: Buffer | null
    parent_key: string | null
    comment: string | null
    user_data: string | null
}

export interface Product {
    id: Generated<string>
    created_at: Generated<Timestamp | null>
    name: string
    price: number
    options: Generated<Json>
    store_id: string
    info: string | null
}

export interface StorageBuckets {
    id: string
    name: string
    owner: string | null
    created_at: Generated<Timestamp | null>
    updated_at: Generated<Timestamp | null>
    public: Generated<boolean | null>
}

export interface StorageMigrations {
    id: number
    name: string
    hash: string
    executed_at: Generated<Timestamp | null>
}

export interface StorageObjects {
    id: Generated<string>
    bucket_id: string | null
    name: string | null
    owner: string | null
    created_at: Generated<Timestamp | null>
    updated_at: Generated<Timestamp | null>
    last_accessed_at: Generated<Timestamp | null>
    metadata: Json | null
    path_tokens: Generated<string[] | null>
}

export interface Store {
    id: Generated<string>
    created_at: Generated<Timestamp | null>
    owner_id: string
    name: string
    payment_receive_account: Json
    shipping_method: Generated<Json>
}

export interface DB {
    'auth.audit_log_entries': AuthAuditLogEntries
    'auth.identities': AuthIdentities
    'auth.instances': AuthInstances
    'auth.mfa_amr_claims': AuthMfaAmrClaims
    'auth.mfa_challenges': AuthMfaChallenges
    'auth.mfa_factors': AuthMfaFactors
    'auth.refresh_tokens': AuthRefreshTokens
    'auth.saml_providers': AuthSamlProviders
    'auth.saml_relay_states': AuthSamlRelayStates
    'auth.schema_migrations': AuthSchemaMigrations
    'auth.sessions': AuthSessions
    'auth.sso_domains': AuthSsoDomains
    'auth.sso_providers': AuthSsoProviders
    'auth.users': AuthUsers
    order: Order
    order_item: OrderItem
    owner: Owner
    'pgsodium.key': PgsodiumKey
    product: Product
    'storage.buckets': StorageBuckets
    'storage.migrations': StorageMigrations
    'storage.objects': StorageObjects
    store: Store
}
