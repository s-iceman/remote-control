import { WebSocketServer, WebSocket } from 'ws';
import { ISocketServer, IService, Result } from './interfaces';
import { MouseNavService } from './navigation';
import { DrawingService } from './drawing';
import { PrintScreenService } from './print-screen';


export class ServerSocket implements ISocketServer {
  private socket: WebSocketServer;
  private timerId: NodeJS.Timer;
  private services: Map<string, IService>;

  constructor(port: number) {
    this.socket = new WebSocketServer({port: port});
    this.services = new Map();
    this.services.set(MouseNavService.getKey(), new MouseNavService());
    this.services.set(DrawingService.getKey(), new DrawingService());
    this.services.set(PrintScreenService.getKey(), new PrintScreenService());
  }

  start(): void {
    this.socket.on('connection', (ws: WebSocket) => {
      console.log(`HttpServer connected to WebSocketServer on port ${this.socket.options.port} successful`);

      this.timerId = setInterval(() => {}, 100);
      const duplex = WebSocket.createWebSocketStream(ws, {decodeStrings: false});

      duplex.on('error', (err: Event) => console.log(err));

      duplex.on('data', async (data: Buffer) => {
        await this.processData(data).then(res => {
          const { command, answerData } = res;
          console.log(`Processed: ${command}`);
          if (answerData) {
            duplex.write(answerData);
          } else {
            duplex.write(command);
          }
        });
      });
    });

    this.addCloseListeners();
  }

  private async processData(data: Buffer): Promise<Result> {
    const sepPos = data.indexOf('_');
    const command = data.slice(0, sepPos).toString();
    const processor: IService | undefined = this.services.get(command);
    if (!processor) {
      return { command: 'Invalid command' };
    }
    return await processor.process(data.slice(sepPos + 1));
  }

  private addCloseListeners(): void {
    this.socket.on('close', () => {
      console.log('disconnected');
      clearInterval(this.timerId);
      this.services = null;
    });
  }
}
