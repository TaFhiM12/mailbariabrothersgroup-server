import { Response } from "express";

type SendResponseArgs<T> = {
  res: Response;
  statusCode: number;
  message: string;
  data?: T;
};

export const sendResponse = <T>({
  res,
  statusCode,
  message,
  data,
}: SendResponseArgs<T>) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};