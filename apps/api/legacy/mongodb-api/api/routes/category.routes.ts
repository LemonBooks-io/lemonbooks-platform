import AuthenticationMiddleware from "../../middlewares/authentication.middleware";
import MulterMediaHandler from "../../middlewares/multer.middleware";
import RequestValidator from "../../middlewares/schema.middleware";
import BaseRoute from "../../utilities/base.router";
import { CategoryController } from "../controllers/category.controller";
import { createCategory } from "../validators/category.validator";

export default class CategoryRoutes extends BaseRoute {
    constructor() {
        super();

    }

    protected override setupRoutes(): void {
        const categoryController: CategoryController = new CategoryController();

        this.router.post(
            "/category/create",
            RequestValidator.validateRequestSchema(createCategory),
            AuthenticationMiddleware.AuthenticateUser(),
            categoryController.CreateCategory
        );

        this.router.get(
            "/category/all",
            AuthenticationMiddleware.AuthenticateUser(),
            categoryController.GetCategories
        );

        this.router.patch(
            "/category/edit/:categoryId",
            RequestValidator.validateRequestSchema(createCategory),
            AuthenticationMiddleware.AuthenticateUser(),
            categoryController.EditCategory
        );

        this.router.post(
            "/category/bulk",
            AuthenticationMiddleware.AuthenticateUser(),
            MulterMediaHandler.UploadCSVFile(),
            categoryController.uploadCategoryFromCsv
        );
    }
    
}