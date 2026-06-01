class apiResponse {
    constructor(message = "Success", statuscode = 200, data) {
        this.message = message;
        this.statuscode = statuscode;
        this.data = data;
        this.success = statuscode < 400;
    }
}

export { apiResponse }
