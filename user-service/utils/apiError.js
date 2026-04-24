class apiError extends Error {
    constructor(
        message = "Something went wrong",
        statuscode,
        errors = [],
        stack = ""
    ) {
        super(message)
        this.statuscode = statuscode || 500;
        this.errors = errors;
        this.data = null;
        this.message = message
        this.success = false
        if (stack) {
            this.stack = stack
        }
        else {
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

export { apiError }