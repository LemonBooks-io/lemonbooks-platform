import httpStatus from "http-status";
import {
  IOffering,
  IOfferingRepository,
} from "../../interfaces/offering.interface";
import { ICategoryRepository } from "../../interfaces/categories.interface";
import ApiError from "../../utilities/error.base";
import OfferingRepository from "../../repositories/offering.repository";
import CategoryRepository from "../../repositories/category.repository";
import { OfferingDTO, UploadOfferingDTO } from "../../dtos/offeringDTO";
import CsvUploadHelper from "../../helpers/csv.parser";
import { IBusiness } from "../../interfaces/business.interface";

export default class OfferingService {
  private offeringRepository: IOfferingRepository;
  private CategoryRepository: ICategoryRepository;

  constructor() {
    this.offeringRepository = new OfferingRepository();
    this.CategoryRepository = new CategoryRepository();
  }
  /**
   *
   * @param offering
   * @param type
   * @returns
   */
  async CreateOffering(
    offering: IOffering,
    type: "PRODUCT" | "SERVICE",
    businessId: string,
    creatorId: string,
    businessConfig: Partial<IBusiness> // from auth token
  ): Promise<OfferingDTO> {
    if (!businessConfig.currency)
      throw new ApiError(
        httpStatus.UNPROCESSABLE_ENTITY,
        "Business has not yet set default currency, please set currency"
      );

    let _offering = await this.offeringRepository.findOne({
      name: { $regex: new RegExp(`^${offering.name}$`, "i") },
      businessId,
    });

    if (_offering)
      throw new ApiError(httpStatus.CONFLICT, "Offering already exists");

    let _category = await this.CategoryRepository.findById(offering.categoryId);

    if (!_category) {
      throw new ApiError(httpStatus.NOT_FOUND, "Category does not exists");
    }

    if (
      type === "SERVICE" &&
      (!offering.serviceCycle || !offering.billingCycle)
    ) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Creating a service requires 'service cycle & billing cycle'"
      );
    }

    _offering = await this.offeringRepository.create({
      ...offering,
      currency: businessConfig.currency!,
      categoryId: _category._id! as any,
      type,
      businessId,
      createdBy: creatorId,
    });

    return new OfferingDTO(_offering);
  }

  /**
   *
   * @param offset
   * @param limit
   * @param filters
   * @returns
   */
  async GetOfferings(
    offset: number = 1,
    limit: number = 10,
    filters: any
  ): Promise<{ offerings: OfferingDTO[]; totalCount: number }> {
    const offerings = await this.offeringRepository.findAll(
      filters,
      offset,
      limit
    );

    const offeringDto = offerings.data.map(
      (offering) => new OfferingDTO(offering)
    );
    return {
      offerings: offeringDto,
      totalCount: offerings.totalCount,
    };
  }

  /**
   *
   * @param offeringId
   * @param offering
   * @returns
   */
  async EditOffering(
    offeringId: string,
    offering: IOffering
  ): Promise<OfferingDTO> {
    const _offering = await this.offeringRepository.update(
      { _id: offeringId },
      offering
    );
    if (!_offering)
      throw new ApiError(httpStatus.NOT_FOUND, "Item does not exist");

    return new OfferingDTO(_offering);
  }

  /**
   *
   * @param csvFile
   * @param businessId
   * @param userId
   * @returns
   */
  async createOfferingFromCsv(
    csvFile: Express.Multer.File,
    businessId: string,
    userId: string // the creator id
  ): Promise<{ failedRecords: object[]; failedCount: number }> {
    const expectedHeaders = [
      "name",
      "description",
      "cost",
      "currency",
      "type",
      "category",
      "billingCycleUnit",
      "billingCycleDuration",
      "serviceCycleUnit",
      "serviceCycleDuration",
    ];

    const rawData = await CsvUploadHelper.csvParserHelper(
      csvFile!,
      expectedHeaders
    );
    // Filter out empty rows - a row is considered empty if all its values are empty strings or undefined
    const data = rawData.filter((item: any) =>
      Object.values(item).some(
        (value) => value && value.toString().trim() !== ""
      )
    );

    // Validate categories and map category names to IDs
    const uploadData = await this._validateAndMapCategories(data);

    const offerings = uploadData.map(
      (offering) => new UploadOfferingDTO(offering, userId, businessId)
    );

    const result = await this.offeringRepository.bulkCreate(
      offerings as IOffering[]
    );

    return result;
  }

  /**
   * Batch fetch offerings by array of IDs, returns all fields for each offering
   * @param offeringIds Array of offering IDs
   * @returns Array of full offering objects
   */
  async GetBatchOfferingsById(offeringIds: string[]): Promise<IOffering[]> {
    if (!Array.isArray(offeringIds) || offeringIds.length === 0) {
      throw new ApiError(httpStatus.BAD_REQUEST, "No offering IDs provided");
    }
    const offerings = await this.offeringRepository.find({
      _id: { $in: offeringIds },
    });
    if (!offerings || offerings.length === 0) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "No offerings found for provided IDs"
      );
    }
    return offerings;
  }

  /**
   * Validates categories and maps category names to category IDs
   * @param data Array of offering data from CSV
   * @returns Array of offering data with categoryId mapped
   */
  private async _validateAndMapCategories(data: any[]): Promise<any[]> {
    const _categoryNames = Array.from(
      new Set(data.map((item: any) => item.category))
    );

    // Fetch matching categories using case-insensitive regex
    const _category = await this.CategoryRepository.findAll(
      {
        name: {
          $in: _categoryNames.map((name) => new RegExp(`^${name}$`, "i")),
        },
      },
      1,
      _categoryNames.length
    );

    // Create a Map for fast lookups, with case-insensitive keys
    const categoryMap = new Map(
      _category.data.map((cat: any) => [
        cat.name.toLowerCase(),
        cat._id.toString(),
      ])
    );
    // Check for invalid categories
    const invalidCategoryNames = data
      .map((item: any) => item.category?.toLowerCase())
      .filter((name) => name && !categoryMap.has(name)); // Only check non-empty categories

    if (invalidCategoryNames.length > 0) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        `The following categories do not exist: ${invalidCategoryNames.join(
          ", "
        )}`
      );
    }

    // Map the categoryId to the original data
    return data.map((record: any) => {
      const categoryId = categoryMap.get(record.category?.toLowerCase());
      const result = {
        ...record,
        categoryId,
      };
      delete result.categoryName;
      return result;
    });
  }
}
