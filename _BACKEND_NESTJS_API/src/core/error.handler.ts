import { HttpException, HttpStatus } from '@nestjs/common';

export class ErrorHandler extends Error {
  constructor({
    type,
    message,
  }: {
    type: keyof typeof HttpStatus;
    message: string;
  }) {
    super(`${type} :: ${message}`);
  }
  public static handleNotFoundError(message: string) {
    throw new HttpException(message, HttpStatus.NOT_FOUND);
  }
  public static handleUnauthorizedError(message: string) {
    throw new HttpException(message, HttpStatus.UNAUTHORIZED);
  }
  public static handleBadRequestError(message: string) {
    throw new HttpException(message, HttpStatus.BAD_REQUEST);
  }

  public static createSignatureError(message: string) {
    const name = message.split(' :: ')[0];
    if (name) {
      throw new HttpException(message, HttpStatus[name]);
    } else {
      throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
