/**
 * User domain types aligned with backend user schema.
 */

export interface UserProfile {
    fullName: string;
    phone: string | null;
    avatarBuffer?: ArrayBuffer | Uint8Array;
    avatarImage: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface User {
    publicId: string;
    name: string;
    email: string;
    profile: UserProfile;
    createdAt: string;
    updatedAt: string;
}

export interface UserUpdateInput {
    fullName?: string;
    email?: string;
    phone?: string;
    password?: string;
    profile: UserProfile;
}

export interface GetUserResponse {
    data: User;
}

export interface UpdateUserResponse {
    data: User;
    message?: string;
}