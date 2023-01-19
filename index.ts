import { httpServer } from './src/http_server/index';
import { ServerSocket } from './src/socket_server';
import { ISocketServer } from './src/socket_server/interfaces';


const HTTP_PORT = 8181;
const SOCKET_PORT = 8080;

console.log(`Start static http server on the ${HTTP_PORT} port!`);
httpServer.listen(HTTP_PORT);

const socket: ISocketServer = new ServerSocket(SOCKET_PORT);
socket.start();
