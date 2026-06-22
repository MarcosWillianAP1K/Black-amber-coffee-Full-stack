interface UserProfile {
  fullName: string;
  phone: string | null;
  avatarImage: string | null;
  createdAt: string;
  updatedAt: string;
}

export default class UserModel {
  id: number;
  publicId: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  profile: UserProfile;

  constructor(
    id: number,
    publicId: string,
    email: string,
    createdAt: string,
    updatedAt: string,
    profile: UserProfile,
  ) {
    this.id = id;
    this.publicId = publicId;
    this.email = email;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.profile = profile;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromDatabase(client: any, profile: any): UserModel {
    const toStr = (v: any): string =>
      v instanceof Date ? v.toISOString() : String(v ?? "");

    return new UserModel(
      client.id,
      client.publicId,
      client.email,
      toStr(client.createdAt),
      toStr(client.updatedAt),
      {
        fullName: profile?.fullName ?? "",
        phone: profile?.phone ?? null,
        avatarImage: profile?.avatarImage ?? null,
        createdAt: toStr(profile?.createdAt ?? client.createdAt),
        updatedAt: toStr(profile?.updatedAt ?? client.updatedAt),
      },
    );
  }
}
