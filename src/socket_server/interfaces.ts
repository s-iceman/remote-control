interface ISocketServer {
  start(): void;
};

interface IService {
  process(data: Buffer): Promise<string>;
}

export {
  ISocketServer,
  IService,
}