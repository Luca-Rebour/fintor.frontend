export type SignUpResponse = {
    user: User;
    token: string;
};

export type SignUpRequest = {
  name: string;
  lastName: string;
  email: string;
  password: string;
  dateOfBirth: string;
  baseCurrencyCode: string;
};

export type User = {
    id: string;
    name: string;
    lastName: string;
    email: string;
    baseCurrencyCode: string;
};

