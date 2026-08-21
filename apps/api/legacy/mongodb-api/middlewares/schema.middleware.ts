import { NextFunction, Request, Response } from "express";
import Joi from "joi";
import httpStatus from "http-status";
import ApiError from "../utilities/error.base";

/**
 * * * RequestValidator class provides methods to validate incoming requests using Joi schemas.
 * * * It helps ensure that the data received in requests adheres to the expected structure and format.
 * * * * @class RequestValidator
 */
class RequestValidator {
    /**
     * * * Validates the request data against a specified Joi schema.
     * * * This method can be used as middleware in Express routes to validate incoming requests.
     * * * @param {Joi.ObjectSchema<any>} schema - The Joi schema to validate against.
     * * * @param {'body' | 'params' | 'query'} path - The part of the request to validate (default is 'body').
     * * @returns {Function} - Middleware function for Express routes.
     */
    public static validateRequestSchema = (schema: Joi.ObjectSchema<any>, path: 'body' | 'params' | 'query' = 'body') => (req: Request, _: Response, next: NextFunction) => {
        const data = req[path];
        // console.log("Validating data:", data);
    
        const { error } : any = schema.validate(data);
    
        if (error) {
          throw new ApiError(httpStatus.BAD_REQUEST, error.details[0].message)
        }
    
        return next();
      };
}

export default RequestValidator;