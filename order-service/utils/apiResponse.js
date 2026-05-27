class apiResponse {
    constructor(message = "Success", statsucode = 200, data) {
        this.message = message;
        this.statuscode = statsucode;
        this.data = data;
        this.success = statsucode < 400;
    }
}

export { apiResponse }