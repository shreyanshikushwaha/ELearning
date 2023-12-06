import { NextFunction, Request, Response } from 'express';
import Errorhandler from '../utils/Errorhandler';

export const ErrorMiddleware  = (err: any, req: Request, res: Response, next: NextFunction) => {
    // Ensure err is an object with properties statusCode and message
    if (typeof err !== 'object') {
        err = { statusCode: 500, message: 'Internal server error' };
    } else {
        err.statusCode = err.statusCode || 500;
        err.message = err.message || 'Internal server error';
    }

    // wrong mongodbID from frontend is called CastError
    if (err.name === 'CastError') {
        const message = `Resource not found. Invalid: ${err.path}`;
        err = new Errorhandler(message, 400);
    }

    // Duplicate key error
    if (err.code === 11000) {
        const message = `Duplicate ${Object.keys(err.keyValue)} entered`;
        err = new Errorhandler(message, 400);
    }

    // wrong jwt token
    if (err.name === 'JsonWebTokenError') {
        const message = 'JSON web token is invalid, try again';
        err = new Errorhandler(message, 400);
    }

    // JWT expired error
    if (err.name === 'TokenExpiredError') {
        const message = 'JSON web token is expired, try again';
        err = new Errorhandler(message, 400);
    }

    res.status(err.statusCode).json({
        success: false,
        message: err.message
    });
};
