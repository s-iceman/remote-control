import { IService } from './interfaces';
import { mouse, right, left, up, down } from '@nut-tree/nut-js';

type commandParams = {
  direction: string,
  offset: number,
};

enum Directions {
  LEFT = 'left',
  RIGHT = 'right',
  UP = 'up',
  DOWN = 'down'
};


export class MouseNavService implements IService {
  mouseCommands: {[key in Directions]: (px: number) => any};

  constructor() {
    this.mouseCommands = {
      [Directions.LEFT]: left,
      [Directions.RIGHT]: right,
      [Directions.UP]: up,
      [Directions.DOWN]: down
    };
  }

  static getKey(): string {
    return 'mouse';
  }

  async process(data: Buffer): Promise<void> {
    const {direction, offset} = this.parseData(data);
    await mouse.move(this.mouseCommands[direction]?.(offset));
  }

  private parseData(data: Buffer): commandParams {
    const sepPos = data.indexOf(' ');
    const direction: Buffer = data.slice(0, sepPos);
    const offset: Buffer = data.slice(sepPos + 1);
    return {
      direction: direction.toString(),
      offset: +offset.toString(),
    };
  }

};
