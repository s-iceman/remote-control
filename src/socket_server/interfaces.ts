type Result = {
  command: string,
  answerData?: string
}

interface ISocketServer {
  start(): void;
}

interface IService {
  process(data: Buffer): Promise<Result>;
}

export {
  ISocketServer,
  IService,
  Result
}