import { ClientSession, FilterQuery, Model, PopulateOptions } from "mongoose";
import IGenericRepository from "../interfaces/generic.repository.interface";

export default class GenericRepository<T> implements IGenericRepository<T> {
  private model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }
  async create(item: T, session?: ClientSession): Promise<T> {
    const createdItem = session
      ? await this.model.create([item], { session })
      : await this.model.create(item);
    return Array.isArray(createdItem)
      ? (createdItem[0] as T)
      : (createdItem as T);
  }

  async findById(
    id: string,
    populate?: string | PopulateOptions | (string | PopulateOptions)[]
  ): Promise<T | null> {
    let query = this.model.findById(id);
    if (populate) {
      if (typeof populate === "string")
        query = query.populate({ path: populate });
      else query = query.populate(populate);
    }
    return await query.exec();
  }

  async findAll(
    filterQuery: FilterQuery<T> = {},
    offset: number = 1,
    limit: number = 20,
    populate?: string | PopulateOptions | (string | PopulateOptions)[]
  ): Promise<{ data: T[]; totalCount: number }> {
    const skip = (offset - 1) * limit;

    const query = this.model
      .find(filterQuery)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    if (populate) {
      if (typeof populate === "string") query.populate({ path: populate });
      else query.populate(populate);
    }

    const [data, totalCount] = await Promise.all([
      query.exec(),
      this.model.countDocuments(filterQuery),
    ]);

    return { data, totalCount };
  }

  async find(
    filterQuery: FilterQuery<T> = {},
    populate?: string | PopulateOptions | (string | PopulateOptions)[]
  ): Promise<T[]> {
    let query = this.model.find(filterQuery).sort({ createdAt: -1 });
    if (populate) {
      if (typeof populate === "string")
        query = query.populate({ path: populate });
      else query = query.populate(populate);
    }
    return await query.exec();
  }

  async findOne(
    filterQuery: FilterQuery<T>,
    populate?: string | PopulateOptions | (string | PopulateOptions)[]
  ): Promise<T | null> {
    let query = this.model.findOne(filterQuery);
    if (populate) {
      if (typeof populate === "string")
        query = query.populate({ path: populate });
      else query = query.populate(populate);
    }
    return await query.exec();
  }

  /**
   * * this update method also does the find method
   * * * If no document is found it returns null
   * @param filter
   * @param updateData
   * @returns
   */
  async update(
    filter: FilterQuery<T>,
    updateData: Partial<T>,
    session?: ClientSession
  ): Promise<T | null> {
    return session
      ? await this.model.findOneAndUpdate(
          filter,
          { ...updateData },
          { session, new: true }
        )
      : await this.model.findOneAndUpdate(
          filter,
          { ...updateData },
          { new: true }
        );
  }

  async updateMany(
    filter: FilterQuery<T>,
    updateData: Partial<T>
  ): Promise<{ modifiedCount: number }> {
    const result = await this.model.updateMany(filter, { ...updateData });
    return { modifiedCount: result.modifiedCount };
  }

  /**
   *
   * @param id
   */
  async delete(id: string): Promise<void> {
    await this.model.deleteOne({ _id: id });
  }

  // async bulkCreate(
  //   data: T[]
  // ): Promise<{ failedRecords: object[]; failedCount: number }> {
  //   try {
  //     await this.model.insertMany(data, { ordered: false });
  //     return {
  //       failedRecords: [],
  //       failedCount: 0,
  //     };
  //   } catch (error: any) {
  //     const failedRec = error.writeErrors.map((e: any) => data[e.index]);
  //     return {
  //       failedRecords: failedRec,
  //       failedCount: failedRec.length,
  //     };
  //   }
  // }

  async bulkCreate(
    data: T[]
  ){
    try {
      const createdDocs = await this.model.insertMany(data, { ordered: false });
      return {
        failedRecords: [],
        failedCount: 0,
        successfulRecords: createdDocs,
        successfulCount: createdDocs.length,
      };
    } catch (error: any) {
      const failedRec = error.writeErrors.map((e: any) => data[e.index]);
      return {
        failedRecords: failedRec,
        failedCount: failedRec.length,
        successfulRecords: error.insertedDocs || [],
        successfulCount: (error.insertedDocs || []).length,
      };
    }
  }
}
