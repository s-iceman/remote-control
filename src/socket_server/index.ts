import { WebSocketServer } from 'ws';
import { ISocketServer, IService } from './interfaces';
import { MouseNavService } from './navigation';
import { DrawingService } from './drawing';


export class ServerSocket implements ISocketServer {
  socket: WebSocketServer;
  timerId: NodeJS.Timer;
  services: Map<string, IService>;

  constructor(port: number) {
    this.socket = new WebSocketServer({port: port});
    this.services = new Map();
    this.services.set(MouseNavService.getKey(), new MouseNavService());
    this.services.set(DrawingService.getKey(), new DrawingService());
  }

  start(): void {
    this.socket.on('connection', (ws, req) => {
      console.log(`HttpServer connected to WebSocketServer on port ${this.socket.options.port} successful`);
      this.timerId = setInterval(() => {}, 100);

      ws.on('message', (data: Buffer) => {
        this.processData(data).then(res => {
          ws.send(res);
        });
        
      });
    });
    this.addCloseListeners();
  }

  private async processData(data: Buffer): Promise<string> {
    const sepPos = data.indexOf('_');
    const command = data.slice(0, sepPos).toString();
    const processor: IService | undefined = this.services.get(command);
    if (!processor) {
      return '';
    }
    const res = await processor.process(data.slice(sepPos + 1));
    return `${command}_${res}`;
  }

  private addCloseListeners(): void {
    this.socket.on('close', () => {
      console.log('disconnected');
      clearInterval(this.timerId);
      this.services = null;
    });
  }
}
