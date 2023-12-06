import { Request,Response } from "express";
import { IUser } from "../Models/user.model";

declare global {
    namespace Express {
       export interface Request {
            user?: IUser;
        }
        export interface Response {
            user ? : IUser;
        }
    }
}