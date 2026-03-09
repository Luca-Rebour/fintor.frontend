import { apiPost } from "./api.client";
import { clearAuthToken, getAuthToken, saveAuthToken } from "./token.storage";
import {
  LoginResponseDTO,
  SignUpRequestDTO,
  SignUpResponseDTO,
} from "../types/api/auth";
import {
  mapAuthUserDtoToModel,
  mapLoginInputModelToRequestDto,
  mapLoginResponseDtoToModel,
  mapSignUpInputModelToRequestDto,
  mapSignUpResponseDtoToModel,
} from "../mappers/auth.mapper";
import { AuthUserModel as User, LoginModel, SignUpModel } from "../types/models/auth.model";
import { isApiError } from "../types/api/api-error";

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

function normalizeMeResponse(payload: unknown): User {
  const data = payload as { user?: unknown } | unknown;
  const rawUser =
    data && typeof data === "object" && "user" in (data as Record<string, unknown>)
      ? (data as { user?: unknown }).user
      : data;

  const normalized = mapAuthUserDtoToModel((rawUser ?? {}) as LoginResponseDTO["user"]);

  return {
    id: normalized.id,
    name: normalized.name,
    lastName: normalized.lastName,
    email: normalized.email,
    baseCurrencyCode: normalized.baseCurrencyCode,
  };
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

function mapLoginModelToLegacy(model: LoginModel): { user: User; token: string } {
  return {
    token: model.token,
    user: {
      id: model.user.id,
      name: model.user.name,
      lastName: model.user.lastName,
      email: model.user.email,
      baseCurrencyCode: model.user.baseCurrencyCode,
    },
  };
}

function mapSignUpModelToLegacy(model: SignUpModel): { user: User; token: string } {
  return {
    token: model.token,
    user: {
      id: model.user.id,
      name: model.user.name,
      lastName: model.user.lastName,
      email: model.user.email,
      baseCurrencyCode: model.user.baseCurrencyCode,
    },
  };
}

export async function signInWithEmail(email: string, password: string): Promise<{ user: User; token: string }> {
  const loginRequest = mapLoginInputModelToRequestDto({ email, password });

  if (!loginRequest.email || !loginRequest.password.trim()) {
    throw new Error("Email and password are required");
  }

  try {
    const data = await apiPost<LoginResponseDTO>("/auth/login", loginRequest);
    const loginModel = mapLoginResponseDtoToModel(data);
    const token = await persistAuthToken(loginModel.token);

    const normalizedUser: User = {
      id: loginModel.user.id,
      name: loginModel.user.name,
      lastName: loginModel.user.lastName,
      email: loginModel.user.email,
      baseCurrencyCode: loginModel.user.baseCurrencyCode,
    };

    setAuthUser(normalizedUser);

    return mapLoginModelToLegacy({ ...loginModel, token });
  }catch (error: unknown) {
    if (isApiError(error)) {
      throw error;
    }

    if (error instanceof Error) {
      throw error;
    }

    throw {
      message: "Network error - please check your connection",
      status: 0,
      code: "NETWORK_ERROR",
    };
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
): Promise<{ user: User; token: string }> {
  const signUpRequest: SignUpRequestDTO = mapSignUpInputModelToRequestDto({
    name: firstName,
    lastName,
    email,
    password,
    dateOfBirth,
    baseCurrencyCode,
  });

  if (!signUpRequest.name || !signUpRequest.lastName || !signUpRequest.email || !signUpRequest.password.trim() || !signUpRequest.dateOfBirth) {
    throw new Error("All fields are required");
  }

  if (!signUpRequest.email.includes("@") || signUpRequest.email.length < 5) {
    throw new Error("Please enter a valid email address");
  }

  if (signUpRequest.password.length < 6) {
    throw new Error("Password must be at least 6 characters");
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(signUpRequest.dateOfBirth)) {
    throw new Error("Date of birth must use YYYY-MM-DD format");
  }

  try {
    const data = await apiPost<SignUpResponseDTO>("/users/create-user", signUpRequest);
    const signUpModel = mapSignUpResponseDtoToModel(data);
    const token = await persistAuthToken(signUpModel.token);

    const normalizedUser: User = {
      id: signUpModel.user.id,
      name: signUpModel.user.name,
      lastName: signUpModel.user.lastName,
      email: signUpModel.user.email,
      baseCurrencyCode: signUpModel.user.baseCurrencyCode,
    };

    setAuthUser(normalizedUser);

    return mapSignUpModelToLegacy({ ...signUpModel, token });
  } catch (error: unknown) {
    if (isApiError(error)) {
      throw error;
    }

    if (error instanceof Error) {
      throw error;
    }

    throw {
      message: "Network error - please check your connection",
      status: 0,
      code: "NETWORK_ERROR",
    };
  }
}

export async function me(): Promise<User> {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    const data = await apiPost<unknown>("/auth/me", {});
    const user = normalizeMeResponse(data);
    setAuthUser(user);
    return user;
  } catch (error: unknown) {
    if (isApiError(error)) {
      throw error;
    }

    if (error instanceof Error) {
      throw error;
    }

    throw {
      message: "Network error - please check your connection",
      status: 0,
      code: "NETWORK_ERROR",
    };
  }
}
