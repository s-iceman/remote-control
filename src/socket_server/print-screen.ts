import { IService, Result } from './interfaces';
import { Region, screen, mouse } from '@nut-tree/nut-js'
import Jimp from 'jimp';

enum Commands {
  PRINT_SCREEN = 'scrn',
  INVALID = 'invalid'
};

export class PrintScreenService implements IService {
  private imgSize: number;

  constructor() {
    this.imgSize = 200;
  }

  static getKey(): string {
    return 'prnt';
  }

  async process(data: Buffer): Promise<Result> {
    const commandType = this.parseData(data);
    if (commandType === Commands.INVALID) {
      return { command: 'Invalid command' };
    }
    return await this.createPrintScreen();
  }

  private async createPrintScreen(): Promise<Result> {
    const point = await mouse.getPosition();
    const x = point.x < this.imgSize / 2 ? 0 : point.x - this.imgSize / 2;
    const y = point.y < this.imgSize / 2 ? 0 : point.y - this.imgSize / 2;
    const region = new Region(x, y, this.imgSize, this.imgSize);
    const image = await (await screen.grabRegion(region)).toRGB();
    const jimp = new Jimp(image);
    const buff = await jimp.getBufferAsync(Jimp.MIME_PNG);
    return {
      command: 'prnt_screen',
      answerData: `prnt_scrn ${buff.toString('base64')}`
    }
  }

  private parseData(data: Buffer): Commands {
    const command = data.toString();
    return (command === Commands.PRINT_SCREEN) ? Commands.PRINT_SCREEN : Commands.INVALID;
  }

};
