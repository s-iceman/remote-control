import { IService, Result } from './interfaces';
import { mouse, straightTo, Point, Button } from '@nut-tree/nut-js';


enum Commands {
  DRAW_CIRCLE = 'circle',
  DRAW_SQUARE = 'square',
  DRAW_RECTANGLE = 'rectangle',
  INVALID = 'invalid'
}


type commandInfo = {
  commandType: Commands;
  params?: Array<number>;
}

type processFunc = (params: Array<number>) => Promise<void>;

export class DrawingService implements IService {
  private drawCommands: {[key in Exclude<Commands, Commands.INVALID>]: processFunc};

  constructor() {
    this.drawCommands = {
      [Commands.DRAW_CIRCLE]: <processFunc>this.drawCircle.bind(this),
      [Commands.DRAW_SQUARE]: <processFunc>this.drawSquare.bind(this),
      [Commands.DRAW_RECTANGLE]: <processFunc>this.drawRectangle.bind(this),
    };
  }

  static getKey(): string {
    return 'draw';
  }

  async process(data: Buffer): Promise<Result> {
    const { commandType, params } = this.parseData(data);
    const func = <processFunc>this.drawCommands[commandType];
    await func(params);
    return { command: `draw_${commandType}` };
  }

  private parseData(data: Buffer): commandInfo {
    let sepPos = data.indexOf(' ');
    if (sepPos !== -1) {
      const command: Buffer = data.slice(0, sepPos);
      const args: Buffer = data.slice(sepPos + 1);
      sepPos = args.indexOf(' ');
      const params = (sepPos !== -1) ? [+args.slice(0, sepPos), +args.slice(sepPos + 1)] : [+args];
      return {
        commandType: command.toString() as Commands,
        params
      }
    }
    return {
      commandType: Commands.INVALID
    }
  }

  private async drawCircle(params: Array<number>): Promise<void> {
    const [r] = params;
    const point = await mouse.getPosition();

    const points = [];
    for (let i = 0; i <= 360; i += 6) {
      if (i % 6 == 0){
        const angleRad = i * (Math.PI / 180);
        points.push(
          new Point(
            point.x + r * Math.cos(angleRad),
            point.y + r * Math.sin(angleRad)
          )
        );
      }
    }
    await mouse.setPosition(<Point>points[0]);
    mouse.config.mouseSpeed = 60;
    await mouse.pressButton(Button.LEFT);
    await mouse.move(points.slice(1));
    await mouse.releaseButton(Button.LEFT);
  }

  private async drawSquare(params: Array<number>): Promise<void> {
    const [side] = params;
    await this.drawRectangle([side, side]);
  }

  private async drawRectangle(params: Array<number>): Promise<void> {
    const [x, y] = params;
    const point = await mouse.getPosition();

    mouse.config.mouseSpeed = 400;
    await mouse.pressButton(Button.LEFT);
    await mouse.move(straightTo(new Point(point.x + x, point.y)));
    await mouse.move(straightTo(new Point(point.x + x, point.y - y)));
    await mouse.move(straightTo(new Point(point.x, point.y - y)));
    await mouse.move(straightTo(new Point(point.x, point.y)));
    await mouse.releaseButton(Button.LEFT);
  }
}
