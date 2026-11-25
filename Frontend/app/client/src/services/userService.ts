import type { User, GetUserResponse } from "shared-utils/types/user";
import { API } from "shared-utils/core/APIroutes";
import { authFetch } from "./httpClient.ts";

export interface UpdateMyProfileInput {
    fullName: string;
    email: string;
    phone?: string | null;
}

export async function updateMyProfile(input: UpdateMyProfileInput): Promise<User> {
    const trimmedPhone = input.phone?.trim();
    const response = await authFetch(API.Users.UptadeMe, {
        method: "PUT",
        body: JSON.stringify({
            fullName: input.fullName.trim(),
            email: input.email.trim(),
            phone: trimmedPhone ? trimmedPhone : null,
        }),
    });

    if (!response.ok) {
        let message = `Falha ao atualizar perfil (${response.status}).`;
        try {
            const err = (await response.json()) as { error?: { message?: string }; message?: string };
            message = err.error?.message ?? err.message ?? message;
        } catch {
            // keep fallback
        }
        throw new Error(message);
    }

    const payload = (await response.json()) as GetUserResponse;
    localStorage.setItem("user", JSON.stringify(payload.data));
    return payload.data;
}
