import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  Check,
  Copy,
  ExternalLink,
  Mic,
  Paperclip,
  SendHorizontal,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  X,
} from "lucide-react";
import ChatMascot from "./ChatMascot";
import { MAINTENANCE, QUICK_REPLIES, chipLang, detectLang, errorText, sendMessage } from "./chatService";
import "./ChatWidget.css";

/* Floating AI chat, bottom-right, on every page (mounted once in main.jsx).
   Talks only to `sendMessage()` in chatService.js; this file is the UI. */

export const ASSISTANT_NAME = "ZARA";
export const ASSISTANT_STATUS = "Your AI Buddy! ✨";
export const GREETING = "Welcome to AIO! 👋 Hi! I'm ZARA, your AI buddy. Ask me anything...";

const STORE = "aio-chat";
const TOOLTIP_MS = 2000;
const UNREAD_MS = 5000;
const WAVE_MS = 1950; // length of the zara-wave clip (plays once)
const THINK_MIN_MS = 1000; // the thinking shimmer shows at least this long
const GREET_MS = 900;
const WORD_MS = 35; // streaming speed, per word

const reducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

let seq = 0;
const newId = () => `${Date.now().toString(36)}-${(seq++).toString(36)}`;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// Shown beside the dots while ZARA waits on an answer, in the language of
// the question (detectLang); steps through once and stays on the last line
// however long the reply takes.
const THINKING_LINES = {
  ms: ["Sila tunggu, saya sedang berfikir...", "Sedang mengumpul maklumat...", "Menyemak dokumen kami...", "Hampir siap..."],
  en: ["Please wait, I'm thinking...", "Gathering information...", "Checking our documents...", "Almost there..."],
  manglish: ["Jap ah, let me think...", "Tengah cari info for you...", "Checking the documents kejap...", "Almost siap already..."],
};
const THINKING_STEP_MS = 2200;

function ThinkingText({ lang }) {
  const lines = THINKING_LINES[lang] || THINKING_LINES.en;
  const [i, setI] = useState(0);
  useEffect(() => {
    if (i >= lines.length - 1) return;
    const t = setTimeout(() => setI(i + 1), THINKING_STEP_MS);
    return () => clearTimeout(t);
  }, [i, lines.length]);
  // key: each new line fades in
  return <span key={i} className="zc-typing-text">{lines[i]}</span>;
}

function loadMessages() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORE) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

const textOf = (m) =>
  m.role === "user"
    ? m.text
    : (m.blocks || [])
        .map((b) =>
          b.type === "text" ? b.text
          : b.type === "steps" ? b.items.map((s, i) => `${i + 1}. ${s}`).join("\n")
          : b.type === "code" ? b.code
          : b.type === "card" ? `${b.title}\n${b.body}`
          : ""
        )
        .filter(Boolean)
        .join("\n\n");

// The API's history shape, without the greeting.
const toHistory = (messages) =>
  messages
    .filter((m) => m.id !== "greet")
    .map((m) => ({ role: m.role === "user" ? "user" : "assistant", content: textOf(m) }));

/* Safe markdown: **bold**, "- " / "* " bullets, line breaks. Builds React
   elements from text; bot text never goes through innerHTML. */
function Inline({ line }) {
  return line
    .split(/\*\*(.+?)\*\*/g)
    .map((part, i) => (part ? i % 2 ? <strong key={i}>{part}</strong> : <React.Fragment key={i}>{part}</React.Fragment> : null));
}
function Markdown({ text }) {
  return text.split("\n").map((raw, i) => {
    const line = raw.trimEnd();
    if (!line.trim()) return <div key={i} style={{ height: 6 }} />;
    const m = line.match(/^(\s*)[-*]\s+(.*)$/);
    return m ? (
      <div key={i} className="zc-li" style={{ marginLeft: m[1].length * 6 }}>
        {"• "}
        <Inline line={m[2]} />
      </div>
    ) : (
      <div key={i}>
        <Inline line={line} />
      </div>
    );
  });
}

function useCopy() {
  const [copied, setCopied] = useState(null);
  const copy = useCallback((key, text) => {
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied((k) => (k === key ? null : k)), 1500);
    });
  }, []);
  return [copied, copy];
}

function Blocks({ msg, streamText, copied, copy }) {
  const blocks = msg.blocks || [];
  if (streamText !== undefined) return <Markdown text={streamText} />;
  return blocks.map((b, i) => {
    if (b.type === "text") return <Markdown key={i} text={b.text} />;
    if (b.type === "card")
      return (
        <div key={i} className="zc-card">
          <div className="zc-card-title">{b.title}</div>
          <p>{b.body}</p>
          {b.button && (
            <a className="zc-btn" href={b.button.href}>
              {b.button.label}
              <ExternalLink size={14} aria-hidden="true" />
            </a>
          )}
        </div>
      );
    if (b.type === "steps")
      return (
        <ol key={i} className="zc-steps">
          {b.items.map((s, j) => (
            <li key={j}>
              <span>
                <Inline line={s} />
              </span>
            </li>
          ))}
        </ol>
      );
    if (b.type === "code") {
      const key = `${msg.id}-code-${i}`;
      return (
        <div key={i} className="zc-code">
          <div className="zc-code-head">
            <span>{b.lang || "code"}</span>
            <button type="button" className="zc-icon-btn" aria-label="Copy code" onClick={() => copy(key, b.code)}>
              {copied === key ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
            </button>
          </div>
          <pre>
            <code>{b.code}</code>
          </pre>
        </div>
      );
    }
    return null;
  });
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(loadMessages);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [typing, setTyping] = useState(null); // null | "dots" | "thinking"
  const [askLang, setAskLang] = useState("en"); // language of the question being answered
  const [stream, setStream] = useState(null); // { id, tokens, n }
  const [happy, setHappy] = useState(false);
  const [tooltip, setTooltip] = useState(false);
  const [unread, setUnread] = useState(false);
  const [atBottom, setAtBottom] = useState(true);
  const [notice, setNotice] = useState("");
  const [listening, setListening] = useState(false);
  const [hoverLauncher, setHoverLauncher] = useState(false); // ZARA smiles and winks
  const [waving, setWaving] = useState(false); // hello wave, once, when the widget first shows
  const [copied, copy] = useCopy();

  const panelRef = useRef(null);
  const listRef = useRef(null);
  const inputRef = useRef(null);
  const launcherRef = useRef(null);
  const openRef = useRef(open);
  const genRef = useRef(0); // bumped by "clear chat" so in-flight replies are dropped
  const recogRef = useRef(null);
  const everOpened = useRef(false);

  openRef.current = open;

  // Persist the conversation.
  useEffect(() => {
    try {
      localStorage.setItem(STORE, JSON.stringify(messages));
    } catch {
      /* storage off: the chat just won't survive a reload */
    }
  }, [messages]);

  // Once the widget first shows (App sets <html data-chat="on"> after the
  // splash): ZARA waves hello once; the "Ask ZARA" tooltip fades in after 2s
  // and then stays up whenever the chat is closed; the unread dot comes
  // after 5s, until the first open.
  useEffect(() => {
    const timers = [];
    const start = () => {
      setWaving(true);
      timers.push(
        setTimeout(() => setWaving(false), WAVE_MS),
        setTimeout(() => setTooltip(true), TOOLTIP_MS),
        setTimeout(() => !everOpened.current && setUnread(true), UNREAD_MS)
      );
    };
    const html = document.documentElement;
    let observer;
    if (html.dataset.chat === "on") start();
    else {
      observer = new MutationObserver(() => {
        if (html.dataset.chat !== "on") return;
        observer.disconnect();
        start();
      });
      observer.observe(html, { attributes: true, attributeFilter: ["data-chat"] });
    }
    return () => {
      observer?.disconnect();
      timers.forEach(clearTimeout);
    };
  }, []);

  const addBot = useCallback((reply, id = newId()) => {
    const msg = { id, role: "bot", blocks: reply.blocks, sources: reply.sources || [], ts: Date.now() };
    setMessages((ms) => [...ms, msg]);
    const first = reply.blocks[0];
    if (first?.type === "text" && !reducedMotion()) {
      setStream({ id, tokens: first.text.split(/(\s+)/), n: 0 });
    }
    if (!openRef.current) setUnread(true);
  }, []);

  // Greeting: typing dots, then the streamed welcome, whenever the chat is empty.
  useEffect(() => {
    if (!open || messages.length) return;
    setTyping("dots");
    const t = setTimeout(() => {
      setTyping(null);
      addBot({ blocks: [{ type: "text", text: GREETING }] }, "greet");
    }, reducedMotion() ? 0 : GREET_MS);
    return () => clearTimeout(t);
  }, [open, messages.length, addBot]);

  // Word-by-word streaming.
  useEffect(() => {
    if (!stream) return;
    if (stream.n >= stream.tokens.length) {
      setStream(null);
      return;
    }
    const t = setTimeout(() => setStream((s) => s && { ...s, n: s.n + 2 }), WORD_MS);
    return () => clearTimeout(t);
  }, [stream]);

  // Follow new content while the reader is at the bottom.
  useEffect(() => {
    const list = listRef.current;
    if (list && atBottom) list.scrollTop = list.scrollHeight;
  }, [messages, stream, typing, atBottom]);

  const onScroll = () => {
    const l = listRef.current;
    setAtBottom(l.scrollHeight - l.scrollTop - l.clientHeight < 40);
  };
  const toLatest = () => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: reducedMotion() ? "auto" : "smooth" });
  };

  const stopMic = () => {
    recogRef.current?.stop();
    setListening(false);
  };

  const show = useCallback((next) => {
    setOpen(next);
    if (next) {
      everOpened.current = true;
      setUnread(false);
    }
  }, []);
  const hide = () => {
    stopMic();
    show(false);
    requestAnimationFrame(() => launcherRef.current?.focus());
  };

  // Closed panel is inert (no focus, no screen reader); open focuses the input.
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    if (open) {
      panel.removeAttribute("inert");
      const t = setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 50);
      return () => clearTimeout(t);
    }
    panel.setAttribute("inert", "");
  }, [open]);

  // Esc closes from anywhere while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") {
        stopMic();
        show(false);
        requestAnimationFrame(() => launcherRef.current?.focus());
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, show]);

  // Focus trap.
  const onPanelKeyDown = (e) => {
    if (e.key !== "Tab") return;
    const items = [...panelRef.current.querySelectorAll(
      'button:not([disabled]), a[href], textarea, [tabindex]:not([tabindex="-1"])'
    )].filter((el) => el.offsetParent !== null);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const submit = async (raw, chipLanguage) => {
    const text = raw.trim();
    if (!text || busy) return;
    setStream(null); // finish any reply still streaming
    setDraft("");
    setAtBottom(true);
    const history = toHistory(messages);
    const lang = chipLanguage || detectLang(text);
    setAskLang(lang);
    setMessages((ms) => [...ms, { id: newId(), role: "user", text, lang, ts: Date.now() }]);
    setBusy(true);
    setTyping("thinking");
    const mine = genRef.current;
    const started = Date.now();
    let reply;
    try {
      reply = await sendMessage(text, history, lang);
    } catch {
      reply = { blocks: [{ type: "text", text: errorText(lang) }] };
    }
    await wait(Math.max(0, THINK_MIN_MS - (Date.now() - started)));
    if (mine !== genRef.current) return;
    setTyping(null);
    setBusy(false);
    addBot(reply);
  };

  const clearChat = () => {
    genRef.current++;
    setStream(null);
    setTyping(null);
    setBusy(false);
    setMessages([]);
    setAtBottom(true);
    inputRef.current?.focus();
  };

  const rate = (id, value) => {
    setMessages((ms) => ms.map((m) => (m.id === id ? { ...m, feedback: m.feedback === value ? null : value } : m)));
    if (value === "up") {
      setHappy(true);
      setTimeout(() => setHappy(false), 1600);
    }
  };

  // Auto-growing textarea.
  useEffect(() => {
    const ta = inputRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`;
  }, [draft]);

  const onInputKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit(draft);
    }
  };

  const Speech = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);
  const toggleMic = () => {
    if (listening) return stopMic();
    const r = new Speech();
    r.lang = navigator.language || "ms-MY";
    r.interimResults = false;
    r.onresult = (e) => setDraft((d) => `${d}${d && !d.endsWith(" ") ? " " : ""}${e.results[0][0].transcript}`);
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
    recogRef.current = r;
    r.start();
    setListening(true);
  };

  const flash = (text) => {
    setNotice(text);
    setTimeout(() => setNotice((n) => (n === text ? "" : n)), 3500);
  };

  const mood = happy ? "happy" : typing === "thinking" ? "thinking" : stream ? "talking" : "idle";
  const time = (ts) => new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const ready = draft.trim().length > 0 && !busy;
  const chips = chipLang(messages); // chips follow the language of the latest question

  return (
    <div className="zc-root">
      {tooltip && !open && (
        <div className="zc-tooltip" onClick={() => show(true)} aria-hidden="true">
          Ask ZARA ✨
        </div>
      )}

      <button
        ref={launcherRef}
        type="button"
        className="zc-launcher"
        // mouse only: a tap fires enter but never leave, so the wink would stick
        onPointerEnter={(e) => e.pointerType === "mouse" && setHoverLauncher(true)}
        onPointerLeave={() => setHoverLauncher(false)}
        aria-label={open ? `Close ${ASSISTANT_NAME} chat` : `Chat with ${ASSISTANT_NAME}`}
        aria-expanded={open}
        aria-controls="zc-panel"
        onClick={() => (open ? hide() : show(true))}
      >
        {!open && <span className="zc-ring" aria-hidden="true" />}
        {open ? <X className="zc-launcher-x" aria-hidden="true" /> : <ChatMascot mood={hoverLauncher ? "happy" : waving ? "wave" : "idle"} />}
        {unread && !open && <span className="zc-unread" aria-hidden="true" />}
      </button>

      <div
        ref={panelRef}
        id="zc-panel"
        className="zc-panel"
        data-open={open}
        role="dialog"
        aria-modal="false"
        aria-label={`${ASSISTANT_NAME} chat`}
        onKeyDown={onPanelKeyDown}
      >
        <div className="zc-head">
          <ChatMascot mood={mood} />
          <div className="zc-head-text">
            <div className="zc-name">{ASSISTANT_NAME}</div>
            <div className="zc-status">{ASSISTANT_STATUS}</div>
          </div>
          <button type="button" className="zc-icon-btn" aria-label="Clear chat" title="Clear chat" onClick={clearChat}>
            <Trash2 aria-hidden="true" />
          </button>
          <button type="button" className="zc-icon-btn" aria-label="Close chat" title="Close" onClick={hide}>
            <X aria-hidden="true" />
          </button>
        </div>

        <div className="zc-body">
          <div
            ref={listRef}
            className="zc-list"
            role="log"
            aria-live="polite"
            aria-busy={!!(stream || typing)}
            onScroll={onScroll}
          >
            {messages.map((m) => {
              const streaming = stream?.id === m.id;
              if (m.role === "user")
                return (
                  <div key={m.id} className="zc-row zc-row-user">
                    <div className="zc-col">
                      <div className="zc-bubble zc-bubble-user">{m.text}</div>
                      <time className="zc-time" dateTime={new Date(m.ts).toISOString()}>{time(m.ts)}</time>
                    </div>
                  </div>
                );
              return (
                <React.Fragment key={m.id}>
                <div className="zc-row">
                  <ChatMascot mood={streaming ? "talking" : "idle"} still={!streaming} />
                  <div className="zc-col">
                    <div className="zc-bubble zc-bubble-bot">
                      <Blocks
                        msg={m}
                        streamText={streaming ? stream.tokens.slice(0, stream.n).join("") : undefined}
                        copied={copied}
                        copy={copy}
                      />
                      {!streaming && m.sources?.length > 0 && (
                        <div className="zc-sources" aria-label="Sources">
                          {m.sources.map((s) => (
                            <span key={s} className="zc-pill">{String(s).replace(/\.txt$/i, "")}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    {!streaming && (
                      <div className="zc-actions">
                        <button type="button" className="zc-icon-btn" aria-label="Good answer" aria-pressed={m.feedback === "up"} onClick={() => rate(m.id, "up")}>
                          <ThumbsUp aria-hidden="true" />
                        </button>
                        <button type="button" className="zc-icon-btn" aria-label="Bad answer" aria-pressed={m.feedback === "down"} onClick={() => rate(m.id, "down")}>
                          <ThumbsDown aria-hidden="true" />
                        </button>
                        <button type="button" className="zc-icon-btn" aria-label="Copy message" onClick={() => copy(m.id, textOf(m))}>
                          {copied === m.id ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
                        </button>
                        <time className="zc-time" dateTime={new Date(m.ts).toISOString()}>{time(m.ts)}</time>
                      </div>
                    )}
                  </div>
                </div>
                {/* Quick replies live under the greeting and scroll with the chat;
                    none while ZARA is in maintenance mode. */}
                {m.id === "greet" && !streaming && !MAINTENANCE && (
                  <div className="zc-chips" role="group" aria-label="Suggested questions">
                    {QUICK_REPLIES[chips].map((q, i) => (
                      <button
                        key={q.label}
                        type="button"
                        className="zc-chip"
                        style={{ animationDelay: `${i * 60}ms` }}
                        disabled={busy}
                        onClick={() => submit(q.label, q.lang || chips)}
                      >
                        <span aria-hidden="true">{q.icon}</span> {q.label}
                      </button>
                    ))}
                  </div>
                )}
                </React.Fragment>
              );
            })}

            {typing && (
              <div className="zc-row">
                <ChatMascot mood={typing === "thinking" ? "thinking" : "idle"} />
                <div
                  className={`zc-bubble zc-bubble-bot zc-typing ${typing === "thinking" ? "zc-thinking" : ""}`}
                  aria-label={`${ASSISTANT_NAME} is ${typing === "thinking" ? "thinking" : "typing"}`}
                >
                  <i /><i /><i />
                  {typing === "thinking" && <ThinkingText lang={askLang} />}
                </div>
              </div>
            )}

          </div>

          {!atBottom && (
            <button type="button" className="zc-to-latest" onClick={toLatest}>
              <ArrowDown aria-hidden="true" /> Latest
            </button>
          )}
        </div>

        <form
          className="zc-foot"
          onSubmit={(e) => {
            e.preventDefault();
            submit(draft);
          }}
        >
          {notice && <div className="zc-notice" role="status">{notice}</div>}
          <div className="zc-input">
            <textarea
              ref={inputRef}
              rows={1}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onInputKey}
              placeholder="Tanya saya... / Ask me..."
              aria-label={`Message ${ASSISTANT_NAME}`}
            />
            <button
              type="button"
              className="zc-icon-btn"
              aria-label="Attach a file"
              title="Attach"
              onClick={() => flash("Lampiran belum disokong. / Attachments aren't supported yet.")}
            >
              <Paperclip aria-hidden="true" />
            </button>
            <button
              type="button"
              className={`zc-icon-btn ${listening ? "zc-mic-on" : ""}`}
              aria-label={listening ? "Stop voice input" : "Voice input"}
              aria-pressed={listening}
              title={Speech ? "Voice input" : "Voice input isn't supported in this browser"}
              disabled={!Speech}
              onClick={toggleMic}
            >
              <Mic aria-hidden="true" />
            </button>
            <button type="submit" className="zc-send" data-ready={ready} disabled={!ready} aria-label="Send">
              <SendHorizontal aria-hidden="true" />
            </button>
          </div>
          <p className="zc-disclaimer">✨ {ASSISTANT_NAME} is AI and can make mistakes.</p>
          <p className="zc-powered">Powered by AIO</p>
        </form>
      </div>
    </div>
  );
}
