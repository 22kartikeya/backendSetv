import {z} from 'zod';
export interface User {
    name: string;
    email: string;
}

export interface JwtPayload {
    email: string;
}