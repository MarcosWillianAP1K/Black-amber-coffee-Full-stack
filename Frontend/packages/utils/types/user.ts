/**
 * User (client) domain types aligned with backend user schema.
 */

/** Represents a client user (flat shape from API) */
export interface User {
    publicId: string;
    fullName: string;
    email: string;
    phone: string | null;
    avatarUrl: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface UserUpdateInput {
    fullName?: string;
    email?: string;
    phone?: string;
    password?: string;
}

export interface GetUserResponse {
    data: User;
}

export interface UpdateUserResponse {
    data: User;
    message?: string;
}
