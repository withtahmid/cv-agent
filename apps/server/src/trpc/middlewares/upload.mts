import multer from "multer";
const upload = multer({ storage: multer.memoryStorage() });
export default upload;
export type UploadMiddleware = typeof upload;
export type UploadFile = Express.Multer.File;
