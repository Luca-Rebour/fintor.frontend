import {
  LoginRequestDTO,
  LoginResponseDTO,
  SignUpRequestDTO,
  SignUpResponseDTO,
} from "../types/api/auth";
import {
  AuthUserModel,
  LoginInputModel,
  LoginModel,
  SignUpInputModel,
  SignUpModel,
} from "../types/models/auth.model";

export function mapAuthUserDtoToModel(dto: LoginResponseDTO["user"] | SignUpResponseDTO["user"]): AuthUserModel {
  return {
    id: String(dto.id ?? ""),
    name: String(dto.name ?? "").trim(),
    lastName: String(dto.lastName ?? "").trim(),
    email: String(dto.email ?? "").trim().toLowerCase(),
    baseCurrencyCode: String(dto.baseCurrencyCode ?? "USD").trim().toUpperCase() || "USD",
  };
}

export function mapLoginResponseDtoToModel(dto: LoginResponseDTO): LoginModel {
  return {
    token: String(dto.token ?? ""),
    user: mapAuthUserDtoToModel(dto.user),
  };
}

export function mapSignUpResponseDtoToModel(dto: SignUpResponseDTO): SignUpModel {
  return {
    token: String(dto.token ?? ""),
    user: mapAuthUserDtoToModel(dto.user),
  };
}

export function mapLoginInputModelToRequestDto(model: LoginInputModel): LoginRequestDTO {
  return {
    email: model.email.trim().toLowerCase(),
    password: model.password,
  };
}

export function mapSignUpInputModelToRequestDto(model: SignUpInputModel): SignUpRequestDTO {
  return {
    name: model.name.trim(),
    lastName: model.lastName.trim(),
    email: model.email.trim().toLowerCase(),
    password: model.password,
    dateOfBirth: model.dateOfBirth.trim(),
    baseCurrencyCode: model.baseCurrencyCode.trim().toUpperCase() || "USD",
  };
}
