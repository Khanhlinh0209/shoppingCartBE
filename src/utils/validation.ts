//viết hàm validate nhận vào checkShema
//Hàm sẽ trả middleware xử lý lỗi
//ai gọi validate(checkSchema) thì nhận được middleware

import { ValidationChain, validationResult } from 'express-validator'
import { RunnableValidationChains } from 'express-validator/lib/middlewares/schema'
import { Request, Response, NextFunction } from 'express'

export const validate = (validation: RunnableValidationChains<ValidationChain>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await validation.run(req) //ghi lỗi vào req
    const errors = validationResult(req) //lấy lỗi trong req
    if (errors.isEmpty()) {
      return next()
    } else {
      res.status(422).json({
        message: 'Validation value',
        errors: errors.mapped()
      })
    }
  }
}
