import { Request, Response, NextFunction } from 'express';
import TenantRepository from '../repositories/tenant.repository';
import ApiError from '../utilities/error.base';
import httpStatus from 'http-status';


/**
 * Middleware to handle tenant identification and validation.
 * It checks for the presence of the X-Tenant-Domain header in the request,
 */
export default class TenancyMiddleware {
    private static tenantRepository = new TenantRepository();
    public static async GetTenant(req: Request, _: Response, next: NextFunction) {
        try {
            // Extract tenant domain from the request header
            // The header should contain the tenant domain name
            const tenantId = req.header('X-Tenant-Id');

            if (!tenantId) {
                throw new ApiError(httpStatus.FORBIDDEN, 'No tenant information provided');
            }
        
            // Check if the tenant exists in the database
            const tenant = await TenancyMiddleware.tenantRepository.findOne(
                {
                   tenantId : { $regex: new RegExp(`^${tenantId}$`, "i") }
                })

            if (!tenant) {
                throw new ApiError(
                    httpStatus.NOT_FOUND,
                    "Tenant not found"
                )
            }

            // Attach tenant to the request object for further use
            (req as any).tenantId = tenant.tenantId;


            next();
        } catch (error) {
            next(error)
        }
    }
}


