export type LoginResponseDTO = {
    token: string;
    user: LoginUserDTO;
};

export type LoginUserDTO = {
    id: string;
    name: string;
    lastName: string;
    email: string;
    baseCurrencyCode: string;
};

export type LoginRequestDTO = {
    email: string;
    password: string;
};

export type SignUpResponseDTO = {
    user: SignUpUserDTO;
    token: string;
};

export type SignUpUserDTO = {
    id: string;
    name: string;
    lastName: string;
    email: string;
    baseCurrencyCode: string;
};

export type SignUpRequestDTO = {
  name: string;
  lastName: string;
  email: string;
  password: string;
  dateOfBirth: string;
  baseCurrencyCode: string;
};