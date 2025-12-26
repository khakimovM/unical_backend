import { BadRequestException } from '@nestjs/common';

export class ErpException extends BadRequestException {
  constructor(code: string, message: string, field?: string) {
    super({ code, message, field });
  }
}
