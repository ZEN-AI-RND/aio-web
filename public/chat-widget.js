(function () {
  const API = "https://edgexpert-b526.tailbb0629.ts.net/chat";
  const history = [];
  // Styled with the site's own tokens (tailwind.config.js + src/index.css):
  // brand green #50C040 (hover #6FD45E), page #050810, glass panels
  // rgba(10,15,26,.95) + blur, hairlines white/10, Inter body, Poppins
  // headings, rounded-md (6px) buttons, rounded-2xl (16px) cards, green glow.
  // Light theme follows the header toggle via [data-theme="light"] on <html>.
  // Shown on the home page only: the React app sets data-page="home" on <html>
  // once the splash has finished; everywhere else the widget stays hidden.
  const css = `
  #aio-btn,#aio-panel{display:none}
  html[data-page="home"] #aio-btn{display:flex}
  html[data-page="home"] #aio-panel{display:flex}
  #aio-btn{position:fixed;right:20px;bottom:20px;width:56px;height:56px;border-radius:50%;
    border:1px solid #50C040;background:#50C040;color:#000;font-size:24px;cursor:pointer;
    align-items:center;justify-content:center;
    box-shadow:0 0 20px rgba(80,192,64,.35);transition:background-color .3s,transform .3s,box-shadow .3s;z-index:9999}
  #aio-btn:hover{background:#6FD45E;transform:translateY(-4px);box-shadow:0 0 28px rgba(80,192,64,.55)}
  #aio-panel{position:fixed;top:0;right:-400px;width:380px;max-width:100%;height:100%;
    background:rgba(10,15,26,.95);-webkit-backdrop-filter:blur(24px);backdrop-filter:blur(24px);
    border-left:1px solid #50C040;box-shadow:-4px 0 20px rgba(80,192,64,.35);
    flex-direction:column;transition:right .3s;z-index:10000;color:#fff;
    font-family:Inter,sans-serif;-webkit-font-smoothing:antialiased;letter-spacing:-0.016em}
  #aio-panel.open{right:0}
  #aio-head{padding:16px 20px;display:flex;justify-content:space-between;align-items:center;
    border-bottom:1px solid rgba(255,255,255,.1);font-family:Poppins,sans-serif;font-weight:700;
    font-size:1.0625rem;letter-spacing:-0.022em;color:#fff}
  #aio-head span::before{content:"";display:inline-block;width:8px;height:8px;margin-right:10px;
    border-radius:50%;background:#50C040;box-shadow:0 0 8px #50C040;vertical-align:middle}
  #aio-head button{background:none;border:0;color:#9ca3af;font-size:22px;line-height:1;cursor:pointer;
    width:32px;height:32px;border-radius:6px;transition:background-color .3s,color .3s}
  #aio-head button:hover{background:rgba(255,255,255,.1);color:#fff}
  #aio-msgs{flex:1;overflow-y:auto;padding:16px 20px;background:transparent}
  .aio-m{margin:10px 0;padding:10px 14px;border-radius:16px;max-width:85%;line-height:1.42859;font-size:14px}
  .aio-u{background:#50C040;color:#000;margin-left:auto;white-space:pre-wrap;font-weight:500}
  .aio-b{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);color:#d1d5db}
  .aio-b strong{color:#fff}
  .aio-li{padding-left:14px;text-indent:-10px}
  .aio-src{font-size:12px;color:#9ca3af;margin-top:6px;letter-spacing:-0.01em}
  #aio-form{display:flex;gap:8px;padding:12px 20px 16px;border-top:1px solid rgba(255,255,255,.1)}
  #aio-in{flex:1;min-width:0;border:1px solid rgba(255,255,255,.1);border-radius:6px;background:rgba(255,255,255,.05);
    color:#fff;padding:10px 14px;font:inherit;font-size:14px;outline:none;transition:border-color .3s}
  #aio-in::placeholder{color:#9ca3af}
  #aio-in:focus{border-color:#50C040}
  #aio-form button{border:0;border-radius:6px;background:#50C040;color:#000;padding:10px 20px;
    font:inherit;font-size:14px;font-weight:500;cursor:pointer;transition:background-color .3s}
  #aio-form button:hover{background:#6FD45E}
  [data-theme="light"] #aio-panel{background:rgba(255,255,255,.97);color:#10151f}
  [data-theme="light"] #aio-head{color:#10151f;border-bottom-color:rgba(16,21,31,.12)}
  [data-theme="light"] #aio-head button{color:#475569}
  [data-theme="light"] #aio-head button:hover{background:rgba(16,21,31,.08);color:#10151f}
  [data-theme="light"] .aio-b{background:#fff;border-color:rgba(16,21,31,.12);color:#334155}
  [data-theme="light"] .aio-b strong{color:#10151f}
  [data-theme="light"] .aio-src{color:#475569}
  [data-theme="light"] #aio-form{border-top-color:rgba(16,21,31,.12)}
  [data-theme="light"] #aio-in{background:#fff;border-color:rgba(16,21,31,.12);color:#10151f}
  [data-theme="light"] #aio-in::placeholder{color:#475569}
  [data-theme="light"] #aio-in:focus{border-color:#50C040}`;

  const el = (tag, props = {}, kids = []) => {
    const e = Object.assign(document.createElement(tag), props);
    kids.forEach(k => e.appendChild(k)); return e;
  };

  // Safe markdown: **bold**, "- " / "* " bullets, line breaks. Text only, no innerHTML.
  function inline(line, parent) {
    line.split(/\*\*(.+?)\*\*/g).forEach((part, i) => {
      if (!part) return;
      parent.appendChild(i % 2 ? el("strong", { textContent: part }) : document.createTextNode(part));
    });
  }
  function render(text, box) {
    text.split("\n").forEach(raw => {
      const line = raw.trimEnd();
      if (!line.trim()) { box.appendChild(el("div", { style: "height:6px" })); return; }
      const m = line.match(/^(\s*)[-*]\s+(.*)$/);
      const d = el("div", m ? { className: "aio-li", style: `margin-left:${m[1].length * 6}px` } : {});
      if (m) d.appendChild(document.createTextNode("• "));
      inline(m ? m[2] : line, d);
      box.appendChild(d);
    });
  }

  document.head.appendChild(el("style", { textContent: css }));
  const msgs = el("div", { id: "aio-msgs" });
  const input = el("input", { id: "aio-in", placeholder: "Tanya saya... / Ask me...", autocomplete: "off" });
  const form = el("form", { id: "aio-form" }, [input, el("button", { textContent: "Hantar" })]);
  const close = el("button", { textContent: "×" });
  const panel = el("div", { id: "aio-panel" }, [
    el("div", { id: "aio-head" }, [el("span", { textContent: "ZARA" }), close]), msgs, form]);
  const btn = el("button", { id: "aio-btn", textContent: "💬", title: "Chat" });
  document.body.append(btn, panel);

  function add(text, who, sources) {
    const m = el("div", { className: "aio-m " + (who === "u" ? "aio-u" : "aio-b") });
    if (who === "u") m.textContent = text; else render(text, m);
    if (sources && sources.length)
      m.appendChild(el("div", { className: "aio-src", textContent: "Sumber: " + sources.join(", ") }));
    msgs.appendChild(m); msgs.scrollTop = msgs.scrollHeight; return m;
  }

  btn.onclick = () => panel.classList.add("open");
  close.onclick = () => panel.classList.remove("open");
  add("Hai! Saya ZARA, pembantu AI AIOffice, Zen Computer Systems. Apa yang boleh saya bantu?\nHi! I'm ZARA. How can I help you?", "b");

  form.onsubmit = async e => {
    e.preventDefault();
    const text = input.value.trim(); if (!text) return;
    input.value = ""; add(text, "u");
    const wait = add("…", "b");
    try {
      const r = await fetch(API, { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history }) });
      const j = await r.json();
      wait.remove();
      if (!r.ok) { add(j.detail || "Maaf, ralat berlaku.", "b"); return; }
      add(j.answer, "b", j.sources);
      history.push({ role: "user", content: text }, { role: "assistant", content: j.answer });
    } catch {
      wait.remove(); add("Maaf, sistem tidak dapat dihubungi. Sila cuba lagi.", "b");
    }
  };
})();
