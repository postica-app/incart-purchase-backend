export class EndpointError extends Error {
    status = 400
    message: string
    code: string

    constructor(
        message: string,
        status: number = 400,
        code: string = 'endpoint_error'
    ) {
        super(message)
        this.status = status
        this.message = message
        this.code = code
    }
}
