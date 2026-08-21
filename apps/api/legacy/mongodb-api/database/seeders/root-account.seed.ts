import Tenant from "../models/tenant.model";
import Business from "../models/business.model";
import SecurityHelperService from "../../helpers/security";
import config from "config";
import { AccountType, Roles } from "../../enums/users.enum";
import TransactionContextHandler from "../../utilities/transactionContextHandler";
import User from "../models/user.model";
import Offering from "../models/offering.model";
import Category from "../models/categories.model";
import Subscription from "../models/subscriptions.model";
import { Currency, ServiceDuration } from "../../enums/service.enum";



/**
 * This function seeds the root account (adminstrators) in the database if it doesn't already exist.
 * It creates a new business with the name "adminstrators" and a super admin account with the email "
 */
export default async function seedRootAccount() {
    const _transactionContextHandler = new TransactionContextHandler()
    try {

        // Ensure all collections are created
        await Promise.all([
            Tenant.createCollection?.(),
            Business.createCollection?.(),
            User.createCollection?.(),
            Category.createCollection?.(),
            Offering.createCollection?.(),
            Subscription.createCollection?.(),
        ]);

        await _transactionContextHandler.begin()
        const session = _transactionContextHandler.getSession()
        
        // Check if the root business already exists
        const rootBusiness = await Business.findOne();
        const tapKeys =  SecurityHelperService.aesEncrypt(config.get("TAP_API_KEY"))
        if (!rootBusiness) {
            // Seed the tenant if it doesn't exist
            const business = await Business.create([{
                name : "LemonBooks",
                email : "LemonBooks@yopmail.com",
                currency : Currency.KWD,
                tapEncryptedKeys : {
                    key : tapKeys.encrypted,
                    iv : tapKeys.iv
                }
            }], { session });
            const adminPassword = config.get("SUPER_ADMIN_PASSWORD");


            const hashPassword = await SecurityHelperService.HashPassword(adminPassword as string)

            const user = await User.create(
                [{
                    email: config.get("SUPER_ADMIN_EMAIL") || "superadmin@yopmail.com",
                    name: "Super Admin",
                    isGeneratedPassword : true,
                    password: hashPassword,
                    businessId: business[0]!._id,
                    hasSetPassword: true,
                    role: Roles.Super_Admin,
                    accountType : AccountType.System,
                    permissionSet: ["All"],
                    tenantId : "administrator",
                  }], { session }
            )

            //
            await Tenant.create([{
                tenantId : "administrator",
                businessId : business[0]!._id,
            }], { session })
            

            const category = await Category.create([{
                businessId : business[0]!._id,
                name : "System Service",
                description : "System services"
            }], {session})

            //
            await Offering.create([{
                name : "billings-portal",
                createdBy : user[0]!._id,
                serviceCycle : {
                    unit: 1,
                    duration: ServiceDuration.MONTH
                },
                billingCycle : {
                    unit: 1,
                    duration: ServiceDuration.MONTH
                },
                isSystemService : true,
                businessId : business[0]!._id,
                categoryId : category[0]!._id,
                type : "SERVICE",
                cost : 500,
                description : "Billings portal access"
            }], {session})


            // create billing portal access for business
            // await Subscription.create([{
            //     serviceId : offering[0]!._id,
            //     serviceCode : offering[0]!.serviceCode,
            //     ownerId : business[0]!._id,
            //     isSystemService : offering[0]!.isSystemService,
            // }], {session})

            await _transactionContextHandler.commit()   ;
            console.log("Super Admin created successfully.");

        }
    } catch (error) {
        console.error("Error seeding root account:", error);
        await _transactionContextHandler.rollback()
        process.exit();
    }
}