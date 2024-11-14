import { pick } from 'lodash'
import { Request, Response, NextFunction } from 'express'
//hàm mod lại req.body theo mảng các key mình muốn
export const filterMiddleare = <T>(filterKeys: Array<keyof T>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    req.body = pick(req.body, filterKeys)
    next()
  }
}
