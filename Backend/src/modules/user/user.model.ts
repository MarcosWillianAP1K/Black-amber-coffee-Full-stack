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

  static fromDatabase(client: any, profile: any): UserModel {
    return new UserModel(
      client.id,
      client.publicId,
      client.email,
      client.createdAt,
      client.updatedAt,
      {
        fullName: profile?.fullName ?? "",
        phone: profile?.phone ?? null,
        avatarImage: profile?.avatarImage ?? null,
        createdAt: profile?.createdAt ?? client.createdAt,
        updatedAt: profile?.updatedAt ?? client.updatedAt,
      },
    );
  }
}
