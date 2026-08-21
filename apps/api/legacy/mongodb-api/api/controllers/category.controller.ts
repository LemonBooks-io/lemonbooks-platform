import { NextFunction, Request, Response } from 'express';
import BaseController from '../../utilities/base.controller';
import CategoryService from '../services/category.service';
import httpStatus from 'http-status';
import { CreateCategoryDTO } from '../../dtos/CategoryDTO';


export class CategoryController extends BaseController {
    private categoryService: CategoryService;

    constructor() {
        super();
        this.categoryService = new CategoryService();
    }

    /**
     * 
     */
   CreateCategory = this.wrapAsync(
    async (req: Request, res: Response, _ : NextFunction) => {
      const {businessId} = res.locals.user;
      const content = await this.categoryService.CreateCategory(req.body, businessId);
      this.sendResponse<CreateCategoryDTO>(res, httpStatus.OK, {
        success: true,
        message: "Category created",
        data: content,
      });
    });

    /**
     * 
     */
    GetCategories = this.wrapAsync(
        async (req: Request, res: Response, _ : NextFunction) => {
          const { offset, limit, } = req.query;
          const { businessId } = res.locals.user
          const content = await this.categoryService.GetCategories(
            isNaN(Number(offset)) ? 1 : Number(offset), 
            isNaN(Number(limit)) ? 20 : Number(limit), 
            businessId
            );
          this.sendResponse(res, httpStatus.OK, {
            success: true,
            message: "Categories fetched",
            data: content,
          });
        });
    
    /**
     * 
     */
    EditCategory = this.wrapAsync(
        async (req: Request, res: Response, _ : NextFunction) => {
          const {categoryId} = req.params;
          const content = await this.categoryService.EditCategory(String(categoryId), req.body);
          this.sendResponse(res, httpStatus.OK, {
            success: true,
            message: "Category updated",
            data: content,
          });
        });

     /**
      * create multiple categories from csv (bulk upload)
      */
        uploadCategoryFromCsv = this.wrapAsync(
            async (req: Request, res: Response, _: NextFunction) => {
              const { businessId,} = res.locals.user
              const content = await this.categoryService.uploadCategoryFromCsv(req.file!, businessId)
              this.sendResponse(res, httpStatus.OK, {
                success: true,
                message: "Bulk operation finished",
                data: content,
              });
            }
    );
}
