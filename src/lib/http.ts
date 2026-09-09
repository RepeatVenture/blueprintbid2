export async function boundedBody(req: Request, max: number) {
  const reader = req.body?.getReader();
  if (!reader) return new Uint8Array();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > max) {
        await reader.cancel();
        throw new Error("Request too large");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  return bytes;
}
// A per-process resource guard. Deploy a distributed edge limit before public launch.
const windows = new Map<string, { start: number; count: number }>();
export function rateLimit(key: string, limit: number, now = Date.now()) {
  const current = windows.get(key);
  if (!current || now - current.start >= 60000) {
    windows.set(key, { start: now, count: 1 });
    if (windows.size > 10000)
      for (const [k, v] of windows)
        if (now - v.start >= 60000) windows.delete(k);
    return;
  }
  if (current.count >= limit) throw new Error("Rate limit exceeded");
  current.count++;
}
