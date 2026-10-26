/**
 * src/api/space.ts
 * ----------------
 * Connection to the Rooted backend, which runs as a Hugging Face ZeroGPU
 * Space (backend/gradio_app.py). Every API module calls the backend through
 * callSpace() instead of fetch().
 *
 * VITE_SPACE is either:
 *   - the Space id, e.g. "jamieleeserhuan/rooted-api" (production), or
 *   - a URL, e.g. "http://localhost:7860" (running gradio_app.py locally)
 *
 * The browser must talk to the Space directly (never through a proxy server):
 * ZeroGPU gives each visitor their own daily GPU quota, and a proxy would make
 * every visitor share one.
 */

import { Client } from '@gradio/client';

const SPACE = import.meta.env.VITE_SPACE || '';

let clientPromise: Promise<Client> | null = null;

function getClient(): Promise<Client> {
  if (!SPACE) {
    return Promise.reject(new Error('VITE_SPACE is not set. Point it at the Rooted Space.'));
  }
  if (!clientPromise) {
    // Reuse one connection for the whole session. If connecting fails (for
    // example the Space is waking up), forget it so the next call retries.
    clientPromise = Client.connect(SPACE).catch((err) => {
      clientPromise = null;
      throw err;
    });
  }
  return clientPromise;
}

/**
 * Call a named endpoint on the Space and return its single output.
 * Errors raised in the backend with gr.Error arrive here with their message,
 * so callers can show it to the user.
 */
export async function callSpace<T>(endpoint: string, payload: Record<string, unknown>): Promise<T> {
  const client = await getClient();
  const result = await client.predict(endpoint, payload);
  return (result.data as unknown[])[0] as T;
}
