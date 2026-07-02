import { validationResult } from "express-validator";
import { apiError } from "../utils/apiError.js";

const validateRequest = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map((err) => err.msg);
        throw new apiError(errorMessages.join(", "), 400, errorMessages);
    }

    next();
};

export { validateRequest };
