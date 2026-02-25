import * as SecureStore from "expo-secure-store";

import { User } from "../types/user";

const AUTH_TOKEN_KEY = "auth.jwt";

export type AuthSession = {
    user: User;
    token: string;
};

export async function signInWithEmail(email: string, password: string): Promise<AuthSession> {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password.trim()) {
        throw new Error("Email and password are required");
    }

    try {
        const response = await fetch('https://dummyjson.com/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: normalizedEmail,
                password: password,
                expiresInMins: 30,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Login failed: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.accessToken) {
            throw new Error("Invalid authentication response");
        }

        // Save the real JWT token
        await SecureStore.setItemAsync(AUTH_TOKEN_KEY, data.accessToken);

        // Map the API response to our User type
        const user: User = {
            id: data.id?.toString() || "unknown",
            name: `${data.firstName || ""} ${data.lastName || ""}`.trim() || data.username,
            email: data.email || normalizedEmail,
            avatarUrl: data.image || `https://i.pravatar.cc/200?img=${data.id || 12}`,
        };

        return {
            user,
            token: data.accessToken,
        };
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Network error - please check your connection");
    }
}

export async function getStoredJwt(): Promise<string | null> {
    return SecureStore.getItemAsync(AUTH_TOKEN_KEY);
}

export async function clearStoredJwt(): Promise<void> {
    await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
}

export async function signUpWithEmail(fullName: string, email: string, password: string): Promise<AuthSession> {
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
        const response = await fetch('https://dummyjson.com/users/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                firstName: fullName.split(' ')[0],
                lastName: fullName.split(' ').slice(1).join(' ') || '',
                email: normalizedEmail,
                password: password,
                username: normalizedEmail,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Signup failed: ${response.status}`);
        }

        const data = await response.json();
        
        // For signup, create a mock session since DummyJSON doesn't return a token for new users
        const mockToken = `signup_${Date.now()}_${data.id}`;
        await SecureStore.setItemAsync(AUTH_TOKEN_KEY, mockToken);

        const user: User = {
            id: data.id?.toString() || "new_user",
            name: fullName,
            email: normalizedEmail,
            avatarUrl: `https://i.pravatar.cc/200?img=${data.id || Math.floor(Math.random() * 70)}`,
        };

        return {
            user,
            token: mockToken,
        };
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Network error - please check your connection");
    }
}

export async function getCurrentSession(): Promise<AuthSession | null> {
    try {
        const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
        if (!token) return null;

        // For demo purposes, create a session from stored token
        // In a real app, you'd validate the token with your backend
        return {
            user: {
                id: "stored_user",
                name: "Current User", 
                email: "user@example.com",
                avatarUrl: "https://i.pravatar.cc/200?img=20",
            },
            token,
        };
    } catch {
        return null;
    }
}