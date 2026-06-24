export default class UserModel {
  id: number;
  publicId: string;
  email: string;
  fullName: string;
  phone: string | null;
  avatarUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;

  constructor(
    id: number,
    publicId: string,
    email: string,
    fullName: string,
    phone: string | null,
    avatarUrl: string | null,
    isActive: boolean,
    createdAt: string,
    updatedAt: string,
  ) {
    this.id = id;
    this.publicId = publicId;
    this.email = email;
    this.fullName = fullName;
    this.phone = phone;
    this.avatarUrl = avatarUrl;
    this.isActive = isActive;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromDatabase(client: any): UserModel {
    const toStr = (v: any): string =>
      v instanceof Date ? v.toISOString() : String(v ?? "");

    return new UserModel(
      client.id,
      client.publicId,
      client.email,
      client.fullName ?? "",
      client.phone ?? null,
      client.avatarUrl ?? null,
      client.isActive ?? true,
      toStr(client.createdAt),
      toStr(client.updatedAt),
    );
  }
}
