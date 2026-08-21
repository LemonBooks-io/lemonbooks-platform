import { ClientSession, FilterQuery, PopulateOptions } from "mongoose";

// This is a generic repository interface that defines the basic CRUD operations for any Mongoose model.
// It uses generics to allow for any type of model to be passed in, making it reusable across different models.
// The interface defines the methods that must be implemented by any class that implements this interface.
export default interface IGenericRepository<T> {
  create(item: T): Promise<T>;
  create(item: T, session?: ClientSession): Promise<T>;
  findById(id: string, populate?: string | PopulateOptions | (string | PopulateOptions)[]): Promise<T | null>;
  findOne(filterQuery: FilterQuery<T>, populate?: string | PopulateOptions | (string | PopulateOptions)[]): Promise<T | null>;
  findAll(
    filterQuery: FilterQuery<T>,
    offset?: number,
    limit?: number,
    populate?: string | PopulateOptions | (string | PopulateOptions)[]
  ): Promise<{ data: T[]; totalCount: number }>;
  find(filterQuery: FilterQuery<T>, populate?: string | PopulateOptions | (string | PopulateOptions)[]): Promise<T[]>;
  update(filter: FilterQuery<T>, updateData: Partial<T>): Promise<T | null>;
  update(filter: FilterQuery<T>, updateData: Partial<T>, session?: ClientSession): Promise<T | null>;
  updateMany(filter: FilterQuery<T>, updateData: Partial<T>): Promise<{ modifiedCount: number }>;
  delete(id: string): Promise<void>;
  bulkCreate(data : T[]) : Promise<any>;
}
