import { Server } from "socket.io";
import { Request,Response } from "express";
import { IUser } from "../Models/user.model";

declare global {
    namespace Express {
       export interface Request {
            user?: IUser;
            io?:Server;
        }
        export interface Response {
            user ? : IUser;
        }
    }
}