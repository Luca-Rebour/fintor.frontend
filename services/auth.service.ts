import { apiPost } from "./api.client";
import { clearAuthToken, getAuthToken, saveAuthToken } from "./token.storage";
import { LoginResponse } from "../types/api/loginResponse";
import { SignUpRequest, SignUpResponse, User } from "../types/api/signUp";

type AuthUserObserver = (user: User | null) => void;

let authUserStore: User | null = null;
const authUserObservers = new Set<AuthUserObserver>();

function notifyAuthUserObservers() {
    for (const observer of authUserObservers) {
        observer(authUserStore);
    }
}

function setAuthUser(user: User | null) {
    authUserStore = user;
    notifyAuthUserObservers();
}

function normalizeUser(payload: unknown): User {
    const raw = (payload ?? {}) as Record<string, unknown>;

    const firstName = typeof raw.firstName === "string" ? raw.firstName.trim() : "";
    const name = typeof raw.name === "string" ? raw.name.trim() : "";
    const lastName = typeof raw.lastName === "string" ? raw.lastName.trim() : "";
    const email = typeof raw.email === "string" ? raw.email.trim() : "";
    const id = raw.id != null ? String(raw.id) : "";
    const rawBaseCurrency =
        (typeof raw.BaseCurrencyCode === "string" && raw.BaseCurrencyCode.trim())
            ? raw.BaseCurrencyCode
            : (typeof raw.baseCurrencyCode === "string" && raw.baseCurrencyCode.trim())
                ? raw.baseCurrencyCode
                : "USD";

    return {
        id,
        name: name || firstName,
        lastName,
        email,
        baseCurrencyCode: rawBaseCurrency.trim().toUpperCase(),
    };
}

function normalizeMeResponse(payload: unknown): User {
    const data = payload as { user?: User } | User;

    if (data && typeof data === "object" && "user" in data && data.user) {
        return normalizeUser(data.user);
    }

    return normalizeUser(data as User);
}

export function subscribeToAuthUser(observer: AuthUserObserver): () => void {
    authUserObservers.add(observer);
    observer(authUserStore);

    return () => {
        authUserObservers.delete(observer);
    };
}

export function getAuthUserSnapshot(): User | null {
    return authUserStore;
}

export async function loadAuthenticatedUser(): Promise<User | null> {
    const token = await getAuthToken();

    if (!token) {
        setAuthUser(null);
        return null;
    }

    try {
        const user = await me();
        setAuthUser(user);
        return user;
    } catch (error) {
        setAuthUser(null);
        throw error;
    }
}

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
        const normalizedUser = normalizeUser(data.user);
        setAuthUser(normalizedUser);

        return {
            user: normalizedUser as unknown as LoginResponse["user"],
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
    setAuthUser(null);
}

export async function signUpWithEmail(
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    dateOfBirth: string,
    baseCurrencyCode: string,
): Promise<SignUpResponse> {    
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedFirstName = firstName.trim();
    const normalizedLastName = lastName.trim();
    const normalizedDateOfBirth = dateOfBirth.trim();
    const normalizedBaseCurrencyCode = baseCurrencyCode.trim().toUpperCase() || "USD";

    if (!normalizedFirstName || !normalizedLastName || !normalizedEmail || !password.trim() || !normalizedDateOfBirth) {
        throw new Error("All fields are required");
    }

    if (!normalizedEmail.includes('@') || normalizedEmail.length < 5) {
        throw new Error("Please enter a valid email address");
    }

    if (password.length < 6) {
        throw new Error("Password must be at least 6 characters");
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(normalizedDateOfBirth)) {
        throw new Error("Date of birth must use YYYY-MM-DD format");
    }

    try {
        const signUpRequest: SignUpRequest = {
            name: normalizedFirstName,
            lastName: normalizedLastName,
            email: normalizedEmail,
            password: password,
            dateOfBirth: normalizedDateOfBirth,
            baseCurrencyCode: normalizedBaseCurrencyCode,
        };
        
        console.log(signUpRequest);
        
        const data = await apiPost<any>("/users/create-user", signUpRequest);

        const token = await persistAuthToken(data.token);
        const normalizedUser = normalizeUser(data.user);
        setAuthUser(normalizedUser);

        return {
            user: normalizedUser,
            token,
        };
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Network error - please check your connection");
    }
}

export async function me(): Promise<User> {
    try {
        const token = await getAuthToken();
        if (!token) {
            throw new Error("No authentication token found");
        }
        const data = await apiPost<unknown>("/auth/me", {});
        console.log("ME data:", data);
        
        const user = normalizeMeResponse(data);
        setAuthUser(user);
        return user;
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Network error - please check your connection");
    }
}
