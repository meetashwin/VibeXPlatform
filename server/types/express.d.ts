import { DecodedToken } from '../middleware/auth';

declare global {
  namespace Express {
    interface Request {
      user?: DecodedToken;
    }
  }
}