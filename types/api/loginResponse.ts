export type LoginResponse = {
    user: User;
    token: string;
};

export type User = {
    id: string;
    name: string;
    lastName: string;
    email: string;
    
};

