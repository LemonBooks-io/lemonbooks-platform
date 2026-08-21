import { v2 as cloudinary } from "cloudinary";
import httpStatus from "http-status";
import config from "config";
import { IFileUpload } from "../interfaces/cloudinary.interface";
import ApiError from "../utilities/error.base";

class CloudinaryUploader {
  constructor() {
    this.SetupCloudinary();
  }

  private SetupCloudinary() {
    const cloudName = config.get("CLOUD_NAME");
    const cloudApiKey = config.get("CLOUD_API_KEY");
    const cloudApiSecret = config.get("CLOUD_API_SECRET");

    return cloudinary.config({
      cloud_name: (cloudName as string) ?? "",
      api_key: (cloudApiKey as string) ?? "",
      api_secret: (cloudApiSecret as string) ?? "",
    });
  }

  /**
   *
   * @param imagePath
   * @param filename
   * @returns
   */
  private uploadToCloudinary(
    imagePath: Buffer,
    filename: string
  ): Promise<any> {
    const options = {
      public_id: filename,
      unique_filename: false,
      overwrite: true,
    };

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        options,
        (error, results) => {
          if (error) {
            reject(error);
          } else {
            resolve(results);
          }
        }
      );

      uploadStream.end(imagePath);
    });
  }

  /**
   *
   * @param buffer
   * @param imagePath
   * @param imagePrefix
   * @returns
   */
  public async uploadSingleMedia(
    buffer: Buffer | null,
    imagePath: string,
    imagePrefix: string
  ): Promise<{secure_url : string, url : string,folder : string}> {
    try {
      if (buffer === null) throw new Error("No Image file added");
      const data = await this.uploadToCloudinary(
        buffer,
        `${imagePath}/${imagePrefix}`
      );
      return data;
    } catch (error: any) {
      console.log("File could not be uploaded:" + error.message);

      throw new ApiError(httpStatus.UNPROCESSABLE_ENTITY, error.message);
    }
  }
  /**
   *
   * @param buffer
   * @param imagePath
   * @param imagePrefix
   * @returns
   */
  public async uploadMultipleMedia(media: IFileUpload[]): Promise<any> {
    try {
      if (media.length < 1){
        throw new Error("Add image buffer data to proceed with upload");
      }
      
      const uploadPromises = media.map(async (mediaItem) => {
        const mediaUrl = await this.uploadToCloudinary(
          mediaItem.buffer,
          `${mediaItem.path}/${mediaItem.prefix}`
        );
  
        return {
          url: mediaUrl.secure_url,
          mimeType: `${mediaUrl.resource_type}/${mediaUrl.format}`,
        };
      });
  
      const imageUrlData = await Promise.all(uploadPromises);

      return imageUrlData;
    } catch (error: any) {
      console.log("File could not be uploaded:" + error.message);

      throw new ApiError(httpStatus.UNPROCESSABLE_ENTITY, error.message);
    }
  }
}

export default CloudinaryUploader;