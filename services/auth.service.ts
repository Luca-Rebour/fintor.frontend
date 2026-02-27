import { apiPost } from "./api.client";
import { clearAuthToken, getAuthToken, saveAuthToken } from "./token.storage";
import { LoginResponse } from "../types/api/loginResponse";
import { SignUpResponse } from "../types/api/signUpResponse";

async function persistAuthToken(token: unknown): Promise<string> {
    if (typeof token !== "string" || !token.trim()) {
        throw new Error("Invalid authentication token from API");
    }

    const normalizedToken = token.trim();
    await saveAuthToken(normalizedToken);
    return normalizedToken;
}

export async function signInWithEmail(email: string, password: string): Promise<LoginResponse> {
    
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password.trim()) {
        throw new Error("Email and password are required");
    }

    try {
        const data = await apiPost<LoginResponse>("/auth/login", {
            email: normalizedEmail,
            password: password
        });
        console.log(data);
        
        const token = await persistAuthToken(data.token);

        return {
            user: data.user,
            token,
        };
    } catch (error) {
        console.log(error);
        
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Network error - please check your connection");
    }
}

export async function getStoredJwt(): Promise<string | null> {
    return getAuthToken();
}

export async function clearStoredJwt(): Promise<void> {
    await clearAuthToken();
}

export async function signUpWithEmail(fullName: string, email: string, password: string): Promise<SignUpResponse> {
    const normalizedEmail = email.trim().toLowerCase();

    if (!fullName.trim() || !normalizedEmail || !password.trim()) {
        throw new Error("All fields are required");
    }

    if (!normalizedEmail.includes('@') || normalizedEmail.length < 5) {
        throw new Error("Please enter a valid email address");
    }

    if (password.length < 6) {
        throw new Error("Password must be at least 6 characters");
    }

    try {
        const data = await apiPost<any>("/users/create-user", {
            firstName: fullName.split(' ')[0],
            lastName: fullName.split(' ').slice(1).join(' ') || '',
            email: normalizedEmail,
            password: password,
            username: normalizedEmail,
        });
        
        const token = await persistAuthToken(data.token);

        return {
            user: data.user,
            token,
        };
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Network error - please check your connection");
    }
}