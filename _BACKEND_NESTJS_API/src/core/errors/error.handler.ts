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
    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR; // Por defecto, código de estado de error interno
    let errorMessage = message; // Por defecto, el mensaje de error comp

    const errorParts = message.split(' :: ');
    if (errorParts.length === 2) {
      const typeName = errorParts[0].trim();
      const customStatus = HttpStatus[typeName as keyof typeof HttpStatus];
      if (customStatus) {
        statusCode = customStatus;
        errorMessage = errorParts[1].trim();
      }
    }
    throw new HttpException(errorMessage, statusCode);
  }
}
