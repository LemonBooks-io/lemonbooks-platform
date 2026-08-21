import csvParser from "csv-parser";
import { Readable } from "stream";
import ApiError from "../utilities/error.base";
import httpStatus from "http-status";

class CsvUploadHelper {
  static async csvParserHelper<T>(
    csv: Express.Multer.File,
    expectedHeaders: string[]
  ): Promise<T[]> {
    const items: T[] = [];

    try {
      if(!csv || !csv.buffer){
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          "Upload is either a non-csv format or empty."
        )
      }
      // Create a readable stream from the buffer
      const stream = Readable.from(csv.buffer);

      await new Promise<void>((resolve, reject) => {
        stream
          .pipe(csvParser({ mapHeaders: ({ header }) => header.trim() }))
          .on("headers", (headers: string[]) => {
            const valid = headers.every((h) => expectedHeaders.includes(h));
            if (!valid) {
              return reject(
                new ApiError(
                  httpStatus.BAD_REQUEST,
                  `Invalid CSV headers. Expected: ${expectedHeaders.join(", ")}`
                )
              );
            }
          })
          .on("data", (data: T) => {
            items.push(data);
          })
          .on("end", () => resolve())
          .on("error", (err) => reject(err));
      });

      return items;
    } catch (error) {
      console.log("CSV parse error:", error);
      throw error;
    }
  }
}

export default CsvUploadHelper;
