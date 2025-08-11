declare module "@vercel/node" {
  import type { IncomingMessage, ServerResponse } from "http";

  export interface VercelRequest extends IncomingMessage {
    query: { [key: string]: string | undefined };
    cookies: { [key: string]: string };
    body: any;
    env: { [key: string]: string };
  }

  export interface VercelResponse extends ServerResponse {}
}
