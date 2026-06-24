import SecurityUtils from "@/core/security";
import UserRepository from "@/modules/user/user.repository";
import { r2StorageProvider, imageService } from "@/infra/storage";
import UserModel from "@/modules/user/user.model";
import {
  UserUpdateInput,
  UserResponse,
  UserResponseSchema,
  UserUpdateInputSchema,
} from "./user.schema";

export default class UserService {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  async get(publicId: string): Promise<UserResponse> {
    const user = await this.userRepository.getByPublicId(publicId);
    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }

    return UserResponseSchema.parse({
      publicId: user.publicId,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      isActive: user.isActive,
      createdAt: new Date(user.createdAt).toISOString(),
      updatedAt: new Date(user.updatedAt).toISOString(),
    });
  }

  async updateClient(
    publicId: string,
    data: UserUpdateInput,
  ): Promise<UserResponse> {
    const validatedData = UserUpdateInputSchema.parse(data);

    const user = await this.userRepository.getByPublicId(publicId);
    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }

    let avatarUrlUpdate: string | null = user.avatarUrl;

    if (validatedData.avatarBuffer) {
      const processedImages = await imageService.processAvatar(
        validatedData.avatarBuffer,
      );
      const keys = imageService.generateAvatarKeys(publicId);

      await r2StorageProvider.upload({
        key: keys.large,
        body: processedImages.large,
        contentType: processedImages.contentType,
      });

      avatarUrlUpdate = keys.large;
    }

    let password = undefined;
    if (validatedData.password) {
      password = await SecurityUtils.hashPassword(validatedData.password);
    }

    const updatedUser = new UserModel(
      user.id,
      user.publicId,
      validatedData.email ?? user.email,
      validatedData.fullName ?? user.fullName,
      validatedData.phone ?? user.phone,
      avatarUrlUpdate,
      user.isActive,
      user.createdAt,
      new Date().toISOString(),
    );

    const result = await this.userRepository.update(updatedUser, password);

    return UserResponseSchema.parse({
      publicId: result.publicId,
      fullName: result.fullName,
      email: result.email,
      phone: result.phone,
      avatarUrl: result.avatarUrl,
      isActive: result.isActive,
      createdAt: new Date(result.createdAt).toISOString(),
      updatedAt: new Date(result.updatedAt).toISOString(),
    });
  }

  async deleteClient(publicId: string): Promise<void> {
    const user = await this.userRepository.getByPublicId(publicId);
    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }
    await this.userRepository.deleteByPublicId(publicId);
  }
}
