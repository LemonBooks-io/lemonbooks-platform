import {Request, Response, NextFunction} from "express";
import { IResponse } from "../interfaces/response.interfaces";

class BaseController {
    protected wrapAsync(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>): (req: Request, res: Response, next: NextFunction) => Promise<void> {
        return async (req: Request, res: Response, next: NextFunction) => {
            try {
                await fn(req, res, next);
            } catch (error) {
                next(error);
            }
        };
    }

    protected sendResponse<T>(res: Response, statusCode: number, response: IResponse<T>): void {
        res.status(statusCode).json(response);
    }
}

export default BaseController;