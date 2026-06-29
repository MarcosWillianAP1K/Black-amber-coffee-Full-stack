import multer from "multer";
import type { Request, Response, NextFunction } from "express";
import helpers from "../helpers";

const storage = multer.memoryStorage();

export const avatarUpload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

    if (!allowedMimeTypes.has(file.mimetype)) {
      cb(new Error("INVALID_FILE_TYPE"));
      return;
    }

    cb(null, true);
  },
});

export function avatarUploadMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  avatarUpload.single("avatar")(req, res, (err) => {
    if (!err) {
      next();
      return;
    }

    const code =
      err instanceof multer.MulterError
        ? err.code
        : err instanceof Error
          ? err.message
          : "INVALID_REQUEST";

    const mapped = helpers[code] ?? {
      status: 400,
      message: "Falha ao processar upload da imagem.",
    };

    res.status(mapped.status).json({
      error: {
        code: mapped.status === 500 ? "INTERNAL_ERROR" : code,
        message: mapped.message,
      },
    });
  });
}
