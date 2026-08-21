import multer, { FileFilterCallback } from "multer";
import { Request } from "express";
import httpStatus from "http-status";
import ApiError from "../utilities/error.base";

/**
 *
 */
class MulterMediaHandler {
    /**
     *
     * @param _
     * @param file
     * @param cb
     * @returns
     * @description This function filters the files based on their mime types.
     * It only allows images and videos to be uploaded.
     */
    private static fileFilter(_: Request, file: Express.Multer.File, cb: FileFilterCallback): void {
        const allowedMimeTypes = [
            "image/png",
            "image/jpg",
            "image/jpeg",
            // "video/mp4",
            // "video/mpeg",
        ];
        if (allowedMimeTypes.includes(file.mimetype)) {
            return cb(null, true);
        }
        cb(null, false);
    }
    
    private static csvFileFilter(_: Request, file: Express.Multer.File, cb: FileFilterCallback): void {
        const allowedMimeTypes = [
            "text/csv",
        ];
        if (allowedMimeTypes.includes(file.mimetype)) {
            return cb(null, true);
        }
        cb(null, false);
    }

    private static _memoryStorage = multer.memoryStorage();

    /**
     *
     * @returns
     */
    public static UploadMultipleFiles = () => {
        return multer({
            storage: MulterMediaHandler._memoryStorage,
            fileFilter: MulterMediaHandler.fileFilter,
            limits: { fileSize: 5 * 1024 * 1024 },
        }).array("media", 4);
    }

    /**
     * 
     * @param _ 
     * @param file 
     * @param cb 
     * @description This function filters the files based on their mime types.
     * It only allows images to be uploaded.
     */
    private static imageFileFilter(_: Request, file: Express.Multer.File, cb: FileFilterCallback): void {
        console.log("Logging content type",_.headers["content-type"])
        const allowedMimeTypes = ["image/png", "image/jpg", "image/jpeg"];
        if (allowedMimeTypes.includes(file.mimetype)) {
            return cb(null, true);
        }
        cb(new ApiError(httpStatus.BAD_REQUEST, "Only PNG, JPG, and JPEG files are allowed 🥺"));
    }

    /**
     *
     * @returns
     */
    public static UploadSingleImageFile = () => {
        return multer({
            storage: MulterMediaHandler._memoryStorage,
            fileFilter: MulterMediaHandler.imageFileFilter,
            limits: { fileSize: 5 * 1024 * 1024 },
        }).single("image");
    }

    public static obtainMediaFileFromReq = (req: Request) => {
        if (req.file) {
            return {
                buffer: req.file.buffer,
                mimetype: req.file.mimetype,
            }
        }
        else if (req.files && Array.isArray(req.files)) {
            return req.files.map((i: Express.Multer.File) => ({
                buffer: i.buffer,
                mimetype: i.mimetype,
                originalname: i.originalname,
            }))
        }
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            "Upload is not an accepted image file format 🥺"
        )
    }

    /**
     * Upload handler for a CSV file.
     * @returns
     */
    public static UploadCSVFile = () => {
        return multer({
            storage: MulterMediaHandler._memoryStorage, // Changed to memory storage
            fileFilter: MulterMediaHandler.csvFileFilter,
            limits: { fileSize: 5 * 1024 * 1024 }, // Limit size to 5MB
        }).single("csv");
    };
}

export default MulterMediaHandler;
