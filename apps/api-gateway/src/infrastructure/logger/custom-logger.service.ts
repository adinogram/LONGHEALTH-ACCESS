/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LoggerService, Injectable } from '@nestjs/common';

@Injectable()
export class CustomLoggerService implements LoggerService {
  log(message: any, ...optionalParams: any[]) {
    const timestamp = new Date().toISOString();
    console.log(`[\x1b[34mINFO\x1b[0m]  [${timestamp}] \x1b[32m${message}\x1b[0m`, ...optionalParams);
  }

  error(message: any, ...optionalParams: any[]) {
    const timestamp = new Date().toISOString();
    console.error(`[\x1b[31mERROR\x1b[0m] [${timestamp}] \x1b[31m${message}\x1b[0m`, ...optionalParams);
  }

  warn(message: any, ...optionalParams: any[]) {
    const timestamp = new Date().toISOString();
    console.warn(`[\x1b[33mWARN\x1b[0m]  [${timestamp}] \x1b[33m${message}\x1b[0m`, ...optionalParams);
  }

  debug(message: any, ...optionalParams: any[]) {
    const timestamp = new Date().toISOString();
    console.debug(`[\x1b[35mDEBUG\x1b[0m] [${timestamp}] ${message}`, ...optionalParams);
  }

  verbose(message: any, ...optionalParams: any[]) {
    console.log(`[\x1b[36mVERBOSE\x1b[0m] ${message}`, ...optionalParams);
  }
}
