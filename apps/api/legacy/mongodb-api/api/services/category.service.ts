import httpStatus from "http-status";
import { ICategory, ICategoryRepository } from "../../interfaces/categories.interface";
import ApiError from "../../utilities/error.base";
import CategoryRepository from "../../repositories/category.repository";
import { CreateCategoryDTO, UploadCategoryDTO } from "../../dtos/CategoryDTO";
import CsvUploadHelper from "../../helpers/csv.parser";

export default class CategoryService {
  private categoryRepository: ICategoryRepository;

  constructor() {
    this.categoryRepository = new CategoryRepository();
  }

  /**
   * 
   * @param category 
   * @param businessId 
   * @returns 
   */
  async CreateCategory(category: ICategory, businessId: string):Promise<CreateCategoryDTO> {
    let _category = await this.categoryRepository.findOne({
      name: { $regex: new RegExp(`^${category.name}$`, "i") },
      businessId
    });

    if (_category)
      throw new ApiError(httpStatus.CONFLICT, "Category already exists");

    _category = await this.categoryRepository.create({
      ...category,
      businessId
    });
    return new CreateCategoryDTO(category);
  }

  /**
   * 
   * @param offset 
   * @param limit 
   * @param filters 
   * @returns 
   */
  async GetCategories(offset: number = 1, limit: number = 10,  businessId : string) {
    const categories = await this.categoryRepository.findAll({
      businessId
    }, offset, limit);
    return {
      categories: categories.data,
      totalCount: categories.totalCount,
    };
  }

  /**
   * 
   * @param categoryId 
   * @param category 
   * @returns 
   */
  async EditCategory(categoryId: string, category: ICategory) {
    let _category = await this.categoryRepository.update({ _id: categoryId }, category);
    
        if (!_category)
          throw new ApiError(httpStatus.NOT_FOUND, "Category does not exists");
    
    
    return _category;
  }

  async uploadCategoryFromCsv(
    csvFile: Express.Multer.File,
    businessId: string,
  ):Promise<{ failedRecords: object[], failedCount : number }>{

    const expectedHeaders = [
      'name', 
      'description'
    ]
    const data = await CsvUploadHelper.csvParserHelper(csvFile, expectedHeaders);

    const categories = (data as ICategory[]).map((category : ICategory) => new UploadCategoryDTO(category, businessId))

    const result = await this.categoryRepository.bulkCreate(categories as any);
    return result;
  }
}
