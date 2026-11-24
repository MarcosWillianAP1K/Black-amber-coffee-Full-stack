import { SecurityUtils } from "../../../core/security/security.utils.js";
import { imageService } from "../../../core/storage/image.service.js";
import { r2StorageProvider } from "../../../core/storage/bucket.provider.js";
import { UserModel } from "../models/user.model.js";
import type { UpdateUserAdminInput, UpdateUserSelfInput, UserDTO } from "../dtos/user.dto.js";

export class UserService {
  static async listAll(): Promise<UserDTO[]> {
    return UserModel.findAll();
  }

  static async getByPublicId(publicId: string): Promise<UserDTO> {
    const user = await UserModel.findByPublicId(publicId);
    if (!user) throw new Error("USER_NOT_FOUND");
    return user;
  }

  static async updateSelf(
    publicId: string,
    data: UpdateUserSelfInput,
    avatarBuffer?: Buffer,
  ): Promise<UserDTO> {
    const current = await UserModel.findByPublicId(publicId);
    if (!current) throw new Error("USER_NOT_FOUND");

    if (!avatarBuffer && Object.keys(data).length === 0) {
      throw new Error("UPDATE_REQUIRES_FIELDS");
    }

    let avatarUrl: string | undefined;
    if (avatarBuffer) {
      const processed = await imageService.processAvatar(avatarBuffer);
      const key = imageService.generateAvatarKey("clients", publicId);
      const uploaded = await r2StorageProvider.upload({
        key,
        body: processed.large,
        contentType: processed.contentType,
      });
      if (current.avatarUrl) {
        await r2StorageProvider.delete(current.avatarUrl).catch(() => undefined);
      }
      avatarUrl = uploaded.url;
    }

    const hashedPassword = data.password
      ? await SecurityUtils.hashPassword(data.password)
      : undefined;

    const updated = await UserModel.updateByPublicId(publicId, {
      fullName: data.fullName ?? data.name,
      email: data.email,
      phone: data.phone,
      password: hashedPassword,
      avatarUrl,
    });

    if (!updated) throw new Error("USER_NOT_FOUND");
    return updated;
  }

  static async updateAdmin(publicId: string, data: UpdateUserAdminInput): Promise<UserDTO> {
    const current = await UserModel.findByPublicId(publicId);
    if (!current) throw new Error("CLIENT_NOT_FOUND");

    const updated = await UserModel.updateByPublicId(publicId, {
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      isActive: data.isActive,
    });

    if (!updated) throw new Error("CLIENT_NOT_FOUND");
    return updated;
  }

  static async toggleStatus(publicId: string, explicitStatus?: boolean): Promise<UserDTO> {
    const current = await UserModel.findByPublicId(publicId);
    if (!current) throw new Error("CLIENT_NOT_FOUND");

    const nextStatus = explicitStatus !== undefined ? explicitStatus : !current.isActive;
    const updated = await UserModel.updateByPublicId(publicId, { isActive: nextStatus });

    if (!updated) throw new Error("CLIENT_NOT_FOUND");
    return updated;
  }

  static async deleteByPublicId(publicId: string): Promise<void> {
    const deleted = await UserModel.deleteByPublicId(publicId);
    if (!deleted) throw new Error("CLIENT_NOT_FOUND");
  }
}
