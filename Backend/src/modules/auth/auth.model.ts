import { RegisterInput } from "@/modules/auth/auth.schema";
import { generateId } from "@/core/gereteId";

export default class authModel {
  id: number;
  publicId: string;
  name: string;
  email: string;
  password: string;
  phone?: string;
  avatarUrl?: string | null;
  createdAt: string;
  updatedAt: string;

  constructor(
    id: number,
    publicId: string,
    name: string,
    email: string,
    password: string,
    phone?: string,
    avatarUrl?: string | null,
    createdAt?: Date | string,
    updatedAt?: Date | string,
  ) {
    this.id = id;
    this.publicId = publicId;
    this.name = name;
    this.email = email;
    this.password = password;
    this.phone = phone;
    this.avatarUrl = avatarUrl ?? null;
    this.createdAt =
      typeof createdAt === "string"
        ? createdAt
        : (createdAt ?? new Date()).toISOString();
    this.updatedAt =
      typeof updatedAt === "string"
        ? updatedAt
        : (updatedAt ?? new Date()).toISOString();
  }

  static fromCreateData(data: RegisterInput): authModel {
    const now = new Date();
    return new authModel(
      0,
      generateId(),
      data.name,
      data.email,
      data.password,
      data.phone,
      null,
      now.toISOString(),
      now.toISOString(),
    );
  }
}
