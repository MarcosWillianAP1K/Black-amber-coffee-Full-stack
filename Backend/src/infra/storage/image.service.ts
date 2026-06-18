import sharp from "sharp";

export interface ProcessedImages {
  large: Buffer;
  contentType: string;
}

export interface ImageDimensions {
  large: { width: number; height: number };
}

const DEFAULT_DIMENSIONS: ImageDimensions = {
  large: { width: 512, height: 512 },
};

export const imageService = {
  async processAvatar(
    buffer: Buffer,
    dimensions: ImageDimensions = DEFAULT_DIMENSIONS,
  ): Promise<ProcessedImages> {
    const largeBuffer = await sharp(buffer)
      .resize(dimensions.large.width, dimensions.large.height, {
        fit: "cover",
        position: "center",
      })
      .webp({ quality: 85 })
      .toBuffer();

    return {
      large: largeBuffer,
      contentType: "image/webp",
    };
  },

  generateAvatarKeys(userPublicId: string): { large: string } {
    const timestamp = Date.now();
    return {
      large: `images/${userPublicId}/${timestamp}-lg.webp`,
    };
  },
};
