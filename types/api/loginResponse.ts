export type LoginResponse = {
    token: string;
    user: User;

};

export type User = {
    id: string;
    name: string;
    lastName: string;
    email: string;
    BaseCurrencyCode: string;
};

