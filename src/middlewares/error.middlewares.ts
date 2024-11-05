import { omit } from 'lodash'
import HTTP_STATUS from '~/constants/htppStatus'
import { Request, Response, NextFunction } from 'express'
import { ErrorWithStatus } from '~/models/Errors'

export const defaultErrorHandler = (error: any, req: any, res: any, next: any) => {
  //lỗi toàn bộ hệ thống đổ về đây
  if (error instanceof ErrorWithStatus) {
    res.status(error.status).json(omit(error, ['status']))
  } else {
    //lỗi khác ErrorWithStatus, lỗi bth lỗi ko có status
    //lỗi có tùm lum thứ stack, name, ko có status (rớt mạng,....)
    Object.getOwnPropertyNames(error).forEach((key) => {
      Object.defineProperty(error, key, {
        enumerable: true
      })
    })

    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: error.message,
      errorInfor: omit(error, ['stack'])
    })
  }
}
