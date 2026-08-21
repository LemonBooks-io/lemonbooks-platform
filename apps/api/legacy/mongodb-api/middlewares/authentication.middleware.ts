import httpStatus from "http-status";
import SecurityService from "../helpers/security";
import { NextFunction, Request, Response } from "express";
import ApiError from "../utilities/error.base";
import { ITokenData } from "../interfaces/token.interface";
import { TokenType } from "../enums/token.enum";


class AuthenticationMiddleware {

  constructor() {
  }

  //Bearer token splitter
  static getTokenFromHeader(req: Request) {
    const authHeader = req.headers["authorization"] ?? null;
    if (!authHeader || authHeader.split(" ")[0] !== "Bearer")
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Authentication token is required"
      );
    return authHeader.split(" ")[1];
  }
 

  static AuthenticateUser({ allowTemporary = false } = {}) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
      const token = AuthenticationMiddleware.getTokenFromHeader(req);
      const decodedToken: ITokenData = (await SecurityService.VerifyAuthToken(token as string)) as ITokenData;

        if (!decodedToken) {
          throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid or expired token");
        }

        
        if (decodedToken.type === TokenType.TEMPORARY) {
          if (!allowTemporary) {
            throw new ApiError(httpStatus.UNAUTHORIZED, "Temporary tokens are not allowed for this endpoint");
          }
        }
  

        res.locals.user = { ...decodedToken };
        next();
      } catch (error) {
        next(error);
      }
    };
  }

  // ✅ usage: AuthenticationMiddleware.allowTemporary.AuthenticateUser
  static get allowTemporary() {
    return {
      AuthenticateUser: this.AuthenticateUser({ allowTemporary: true }),
    };
  }

  public static async GetDeviceInfo(req: any, _: Response, next: NextFunction) {
    try {
      const userAgent = req.headers['user-agent'] || "";
      const ipAddress = req.ip || "";
      req.deviceInfo = {
        userAgent,
        ipAddress
      }


      next();
    } catch (error: any) {
      next(error);
    }
  }

  
}

export default AuthenticationMiddleware;
