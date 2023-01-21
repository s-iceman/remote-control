import { IService } from './interfaces';
import { mouse, right, left, up, down, screen } from '@nut-tree/nut-js';

type commandParams = {
  direction: string,
  offset: number,
};

type commandInfo = {
  commandType: Commands;
  params?: commandParams;
}

enum Commands {
  INVALID = 'invalid',
  MOVE = 'move',
  GET_POS = 'position',
};

enum Directions {
  LEFT = 'left',
  RIGHT = 'right',
  UP = 'up',
  DOWN = 'down',
};


export class MouseNavService implements IService {
  moveCommands: {[key in Directions]: [(px: number) => any, null]};
  constructor() {
    this.moveCommands = {
      [Directions.LEFT]: [left, null],
      [Directions.RIGHT]: [right, null],
      [Directions.UP]: [up, null],
      [Directions.DOWN]: [down, null]
    };
  }

  static getKey(): string {
    return 'mouse';
  }

  async process(data: Buffer): Promise<string> {
    const { commandType, params } = this.parseData(data);
    if (commandType === Commands.MOVE) {
      const {direction, offset} = params;
      const [command, correctedOffset] = this.moveCommands[direction];
      await mouse.move(command?.(offset));
      return `${direction}_${offset}`;
    } else if (commandType === Commands.GET_POS) {
      const pos = await mouse.getPosition();
      return `${commandType}_${pos.x},${pos.y}`;
    }
  }

  private parseData(data: Buffer): commandInfo {
    const sepPos = data.indexOf(' ');
    if (sepPos !== -1) {
      const direction: Buffer = data.slice(0, sepPos);
      const offset: Buffer = data.slice(sepPos + 1);
      return {
        commandType: Commands.MOVE,
        params: {
          direction: direction.toString(),
          offset: +offset.toString(),
        }
      }
    }
    if (data.includes('position')) {
      return {commandType: Commands.GET_POS};
    }
    return {commandType: Commands.INVALID};
  }

  private async calcLeftOffset(offset: number): Promise<number> {
    const width = await screen.width();
    return offset;
  }
};
