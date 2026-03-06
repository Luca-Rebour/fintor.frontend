export type AuthUserModel = {
  id: string;
  name: string;
  lastName: string;
  email: string;
  baseCurrencyCode: string;
};

export type LoginModel = {
  token: string;
  user: AuthUserModel;
};

export type SignUpModel = {
  token: string;
  user: AuthUserModel;
};

export type LoginInputModel = {
  email: string;
  password: string;
};

export type SignUpInputModel = {
  name: string;
  lastName: string;
  email: string;
  password: string;
  dateOfBirth: string;
  baseCurrencyCode: string;
};
