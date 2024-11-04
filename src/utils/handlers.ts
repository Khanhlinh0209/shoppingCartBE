//file này lưu hàm wrapAsync
//wrapAsync sẽ nhận vào 'Req Handler A'
//sau đó trả ra 'Req Handler B' có cấu trúc try catch

import { Request, Response, NextFunction, RequestHandler } from 'express'

//và chạy 'Req handler A' bên trong try '
export const wrapAsync = (func: RequestHandler) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await func(req, res, next)
    } catch (error) {
      next(error)
    }
  }
}
