// zaraStream.js: call ZARA and get the answer word by word (streaming).
// Server: POST /public/chat/stream on the DGX Spark (live since 24 Nov). Same body as /public/chat.
export const ZARA_STREAM_URL = "https://edgexpert-b526.tailbb0629.ts.net/public/chat/stream";
export const ZARA_CHAT_URL = "https://edgexpert-b526.tailbb0629.ts.net/public/chat";

// onText(fullTextSoFar) is called each time new words arrive.
// Resolves to { answer, sources } when Zara has finished. Falls back to the old /public/chat if streaming fails.
export async function askZaraStream(message, history, onText) {
  let res;
  try {
    res = await fetch(ZARA_STREAM_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, history }),
    });
  } catch (e) {
    return askZaraOld(message, history);
  }
  const type = res.headers.get("content-type") || "";
  if (!res.ok || !res.body || !type.includes("ndjson")) {
    const j = await res.json().catch(() => ({}));   // 429 "too many questions" etc.
    return { answer: j.answer || j.detail || "Maaf, ralat berlaku.", sources: j.sources || [] };
  }
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = "", answer = "", sources = [], failed = false;
  // One NDJSON line. A line that isn't valid JSON is skipped, not fatal.
  const handle = (raw) => {
    const line = raw.trim();
    if (!line) return;
    let o;
    try {
      o = JSON.parse(line);
    } catch {
      return;
    }
    if (o.type === "sources") sources = o.sources || [];
    else if (o.type === "delta" && o.text) { answer += o.text; onText(answer); }
    else if (o.type === "error") failed = true;
  };
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      let nl;
      while ((nl = buf.indexOf("\n")) >= 0) {
        handle(buf.slice(0, nl));
        buf = buf.slice(nl + 1);
        if (failed) break;
      }
      if (failed) break;
    }
    if (!failed) handle(buf + dec.decode()); // last line without a trailing newline
  } catch {
    failed = true; // connection dropped mid-answer
  }
  if (failed) reader.cancel().catch(() => {});
  // Keep whatever already arrived; only start over when nothing did.
  if (!answer) return askZaraOld(message, history);
  return { answer, sources };
}

async function askZaraOld(message, history) {
  const r = await fetch(ZARA_CHAT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history }),
  });
  const j = await r.json().catch(() => ({}));
  return { answer: j.answer || j.detail || "Maaf, ralat berlaku.", sources: j.sources || [] };
}
