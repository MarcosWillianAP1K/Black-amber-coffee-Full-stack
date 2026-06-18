import SecurityUtils from "@/core/security";
import authRepository from "@/modules/auth/auth.repository";
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
  private authRepository: authRepository;
  private userRepository: UserRepository;

  constructor(authRepository: authRepository, userRepository: UserRepository) {
    this.authRepository = authRepository;
    this.userRepository = userRepository;
  }

  async get(publicId: string): Promise<UserResponse> {
    const user = await this.userRepository.getByPublicId(publicId);
    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }

    return UserResponseSchema.parse({
      publicId: user.publicId,
      name: user.profile.fullName,
      email: user.email,
      profile: {
        fullName: user.profile.fullName,
        phone: user.profile.phone,
        avatarImage: user.profile.avatarImage,
        createdAt: new Date(user.profile.createdAt).toISOString(),
        updatedAt: new Date(user.profile.updatedAt).toISOString(),
      },
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

    let avatarImageUpdate: string | null = user.profile.avatarImage;

    if (validatedData.profile.avatarBuffer) {
      const processedImages = await imageService.processAvatar(
        validatedData.profile.avatarBuffer,
      );
      const keys = imageService.generateAvatarKeys(publicId);

      await r2StorageProvider.upload({
        key: keys.large,
        body: processedImages.large,
        contentType: processedImages.contentType,
      });

      avatarImageUpdate = keys.large;
    }

    let password = undefined;
    if (validatedData.password) {
      password = await SecurityUtils.hashPassword(validatedData.password);
    }

    const updatedUser = new UserModel(
      user.id,
      user.publicId,
      validatedData.email ?? user.email,
      user.createdAt,
      new Date().toISOString(),
      {
        fullName: validatedData.fullName ?? user.profile.fullName,
        phone: validatedData.phone ?? user.profile.phone,
        avatarImage: avatarImageUpdate,
        createdAt: user.profile.createdAt,
        updatedAt: new Date().toISOString(),
      },
    );

    const result = await this.userRepository.update(updatedUser, password);

    return UserResponseSchema.parse({
      publicId: result.publicId,
      name: result.profile.fullName,
      email: result.email,
      profile: {
        fullName: result.profile.fullName,
        phone: result.profile.phone,
        avatarImage: result.profile.avatarImage,
        createdAt: new Date(result.profile.createdAt).toISOString(),
        updatedAt: new Date(result.profile.updatedAt).toISOString(),
      },
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
