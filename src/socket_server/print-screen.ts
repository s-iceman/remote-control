import { IService } from './interfaces';

enum Commands {
  PRINT_SCREEN = 'scrn',
  INVALID = 'invalid'
};

export class PrintScreenService implements IService {
  commands: {[key in Commands]: () => any};
  constructor() {
    this.commands = {
      [Commands.PRINT_SCREEN]: this.makePrintScreen.bind(this),
      [Commands.INVALID]: () => {}
    };
  }

  static getKey(): string {
    return 'prnt';
  }

  async process(data: Buffer): Promise<string> {
    const commandType = this.parseData(data);
    await this.commands[commandType]();
    return `${commandType}`;
  }

  private parseData(data: Buffer): Commands {
    const command = data.toString();
    if (command == Commands.PRINT_SCREEN) {
      return Commands.PRINT_SCREEN;
    }
    return Commands.INVALID;
  }

  private async makePrintScreen(): Promise<string> {
    console.log('PRNT SCREEN');
    return '';
  }

};
