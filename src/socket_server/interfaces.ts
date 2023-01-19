interface ISocketServer {
  start(): void;
};

interface IService {
  process(data: Buffer): Promise<void>;
}

export {
  ISocketServer,
  IService,
}