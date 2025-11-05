import multer from 'multer';
import { env } from '@/config/env';

// Configure multer to use memory storage
const storage = multer.memoryStorage();

// File filter for images
const imageFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = env.ALLOWED_FILE_TYPES.split(',');

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`));
  }
};

// File filter for PDFs
const pdfFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['application/pdf'];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'));
  }
};

// File filter for images AND PDFs (for budget and invoice)
const imageAndPdfFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = [...env.ALLOWED_FILE_TYPES.split(','), 'application/pdf'];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`));
  }
};

// Create multer instance for images
export const upload = multer({
  storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: env.MAX_FILE_SIZE,
    files: env.MAX_FILES_PER_UPLOAD,
  },
});

// Create multer instance for PDFs (larger file size limit)
export const uploadPDF = multer({
  storage,
  fileFilter: pdfFilter,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB for PDFs
    files: 10, // Max 10 PDFs per upload
  },
});

// Create multer instance for images AND PDFs (for budget and invoice)
export const uploadImageOrPDF = multer({
  storage,
  fileFilter: imageAndPdfFilter,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB to support PDFs
    files: 1,
  },
});
