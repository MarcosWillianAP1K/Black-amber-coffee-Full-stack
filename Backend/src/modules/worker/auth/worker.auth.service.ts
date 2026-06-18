import JWTservice from "@/core/jwt.service";
import SecurityUtils from "@/core/security";
import authRepository from "@/modules/auth/auth.repository";
import {
  WorkerLoginInput,
  WorkerLoginResponse,
  WorkerLoginResponseSchema,
  WorkerLoginSchema,
} from "../worker.schema";

export default class WorkerAuthService {
  private authRepository: authRepository;
  private jwtService: JWTservice;

  constructor(authRepository: authRepository, jwtService: JWTservice) {
    this.authRepository = authRepository;
    this.jwtService = jwtService;
  }

  async login(data: WorkerLoginInput): Promise<WorkerLoginResponse> {
    const validatedData = WorkerLoginSchema.parse(data);

    const authEntity = await this.authRepository.getByEmail(
      validatedData.email,
    );
    if (!authEntity || authEntity.type !== "worker" || !authEntity.role) {
      throw new Error("INVALID_CREDENTIALS");
    }

    const isPasswordValid = await SecurityUtils.comparePassword(
      validatedData.password,
      authEntity.user.password,
    );
    if (!isPasswordValid) {
      throw new Error("INVALID_CREDENTIALS");
    }

    const accessToken = this.jwtService.generateToken({
      id: authEntity.user.id,
      email: authEntity.user.email,
      publicId: authEntity.user.publicId,
      isAdmin: authEntity.isAdmin,
    });

    const refreshToken = this.jwtService.generateRefreshToken(
      authEntity.user.publicId,
    );

    return WorkerLoginResponseSchema.parse({
      data: {
        accessToken,
        refreshToken,
        user: {
          publicId: authEntity.user.publicId,
          role: authEntity.role,
          profile: {
            fullName: authEntity.user.name,
            phone: authEntity.user.phone ?? null,
            avatarImage: null,
            email: authEntity.user.email,
            createdAt: authEntity.user.createdAt,
            updatedAt: authEntity.user.updatedAt,
          },
        },
      },
    });
  }
}
