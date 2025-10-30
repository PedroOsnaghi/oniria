import { IDreamContext } from '../domain/interfaces/dream-context.interface';
import 'express-session';

declare module 'express-session' {
  interface SessionData {
    dreamContext?: IDreamContext;
  }
}

declare global {
  namespace Express {
    interface Session {
      dreamContext?: IDreamContext;
    }

    interface Request {
      session: Session & {
        save(cb: (err?: Error) => void): void;
      };
    }
  }
}

export {};
