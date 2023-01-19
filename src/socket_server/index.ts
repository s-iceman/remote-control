import { WebSocketServer } from 'ws';
import { Readable } from 'node:stream';
import { ISocketServer, IService } from './interfaces';
import { MouseNavService } from './navigation';


export class ServerSocket implements ISocketServer {
  socket: WebSocketServer;
  timerId: NodeJS.Timer;
  services: Map<string, IService>;

  constructor(port: number) {
    this.socket = new WebSocketServer({port: port});
    this.services = new Map();
    this.services.set(MouseNavService.getKey(), new MouseNavService());
  }

  start(): void {
    this.socket.on('connection', (ws, req) => {
      console.log(`HttpServer connected to WebSocketServer ${req.socket.remoteAddress} successful`);
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
    await processor.process(data.slice(sepPos + 1));
    return data.toString('utf8').replace(' ', '_');
  }

  private addCloseListeners(): void {
    this.socket.on('close', () => {
      console.log('disconnected');
      clearInterval(this.timerId);
      this.services = null;
    });
  }
}
