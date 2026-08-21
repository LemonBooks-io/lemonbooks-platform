import {Request, Response, NextFunction, Application} from "express";
import ApiError from "../utilities/error.base";
import { IResponse } from "../interfaces/response.interfaces";


class ErrorMiddleware {
    app: Application;
    
    constructor(app: Application){
        this.app = app
    }
    public static async handleNotFound(req: Request, _: Response, next: NextFunction){
        const error = new ApiError(404, `Endpoint Not Found - ${req.originalUrl}`);
        next(error); // Pass the error to next middleware
    }

    public static async errorHandler<T>(error: any, _: Request, res: Response, __:NextFunction){
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Internal Server Error';
        console.log(error);
        const data : IResponse<T> = {
            success: false, 
            message : "An error occurred",
            error: message,
        }
        
        res.status(statusCode).json(data);
    }
}

export  {ErrorMiddleware};
