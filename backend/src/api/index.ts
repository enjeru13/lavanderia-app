// backend/api/index.ts
import app from '../../src/index';

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  return app(req, res);
}
