import { APIResponse } from "../Models/interfaces";
import { Response } from "express";

const sendResponse = <ResponseData>(res: Response, options: { status: number, message: string, responsePayload?: ResponseData }) => {
    const defaultOptions = { status: 200, message: "Request succeeded" };
    options = { ...defaultOptions, ...options };
    
    const apiResponseStatus = options.status === 200 ? "success" : "error";
    const apiResponseMessage = options.message;

    const respose: APIResponse<ResponseData> = {
        status: apiResponseStatus,
        message: apiResponseMessage,
        responseData: options.responsePayload
    };

    res.status(options.status).send(respose);
}

export { sendResponse };