import { IService, Result } from './interfaces';
import { mouse, right, left, up, down, Point } from '@nut-tree/nut-js';

type commandParams = {
  direction: string,
  offset: number,
};

type commandInfo = {
  commandType: Commands;
  params?: commandParams;
}

type moveFunc = (px: number) => Promise<Point[]>;

enum Commands {
  INVALID = 'invalid',
  MOVE = 'move',
  GET_POS = 'position',
}

enum Directions {
  LEFT = 'left',
  RIGHT = 'right',
  UP = 'up',
  DOWN = 'down',
}


export class MouseNavService implements IService {
  private moveCommands: {[key in Directions]: moveFunc};

  constructor() {
    this.moveCommands = {
      [Directions.LEFT]: left,
      [Directions.RIGHT]: right,
      [Directions.UP]: up,
      [Directions.DOWN]: down
    };
  }

  static getKey(): string {
    return 'mouse';
  }

  async process(data: Buffer): Promise<Result> {
    const { commandType, params } = this.parseData(data);
    if (commandType === Commands.MOVE) {
      const {direction, offset} = params;
      const command = <moveFunc>this.moveCommands[direction];
      await mouse.move(command(offset));
      return { command: `mouse_${direction}_${offset}` };
    } else if (commandType === Commands.GET_POS) {
      const pos = await mouse.getPosition();
      return {
        command: `mouse_${commandType}_${pos.x},${pos.y}`,
        answerData: `mouse_position ${pos.x},${pos.y}`
      };
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
}
