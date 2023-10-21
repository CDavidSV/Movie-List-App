import { User } from "./Models/interfaces";

export {};

declare global {
    namespace Express {
        export interface Request {
            user?: User;
        }
    }
}