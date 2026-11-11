/* Chat service for ChatWidget. The widget only ever calls `sendMessage()`,
   so the backend can be swapped without touching the UI.

   Replies are made of blocks the widget knows how to draw:
     { type: "text",  text }                      safe markdown: **bold**, "- " bullets
     { type: "card",  title, body, button: { label, href } }
     { type: "steps", items: [string] }
     { type: "code",  lang, code }
   plus optional `sources: [string]` (file names, shown as pills).

   Routing: a question that matches one of the INTENTS below (pricing, demo,
   talking to a human, how it works, embedding) gets a canned reply; anything
   else goes to the live RAG API. Set USE_MOCK_ONLY to true to run fully
   offline on canned replies. */

export const CHAT_API = "https://edgexpert-b526.tailbb0629.ts.net/chat";
export const USE_MOCK_ONLY = false;

// Where "Book a demo" / "Talk to a human" buttons go. The site's own
// Request a Demo links are still "#" (see SiteHeader.jsx), so this is too
// until there is a real contact page or address.
export const CONTACT_URL = "#";

// Chips under the greeting. `icon` is display only; `label` is what gets sent.
export const QUICK_REPLIES = [
  { icon: "🏢", label: "About ZEN" },
  { icon: "📅", label: "Book a demo" },
  { icon: "🌴", label: "Berapa hari cuti tahunan?" },
];

export const ERROR_TEXT = "Maaf, sistem tidak dapat dihubungi. Sila cuba lagi.";

const INTENTS = [
  {
    match: /pric|harga|cost|kos|quote|sebut ?harga|berapa (harga|kos)/i,
    reply: () => ({
      blocks: [
        { type: "text", text: "Pricing depends on how AIOffice is deployed and how many people will use it:\n- **On-premise** on your own NVIDIA DGX Spark, with your data staying in-house\n- **Number of users** and which AIO modules you need (ZARA, AIO Form, AIO Verify, AIO Insight...)\n\nOur team prepares a quote for your organisation." },
        { type: "card", title: "Get a quote", body: "Tell us about your team and we'll send pricing within one working day.", button: { label: "Request a quote", href: CONTACT_URL } },
      ],
    }),
  },
  {
    match: /demo/i,
    reply: () => ({
      blocks: [
        { type: "text", text: "Happy to show you! A live demo takes about **30 minutes** and covers ZARA plus the AIO modules that fit your work." },
        { type: "card", title: "Book a demo", body: "Pick a time that suits you and we'll walk you through it on your own use case.", button: { label: "Request a Demo", href: CONTACT_URL } },
      ],
    }),
  },
  {
    match: /human|person|orang|staff|agent|manusia|talk to (someone|sales)|hubungi/i,
    reply: () => ({
      blocks: [
        { type: "text", text: "Of course. Our team at Zen Computer Systems can take it from here." },
        { type: "card", title: "Talk to our team", body: "Leave your details and a person will get back to you during office hours.", button: { label: "Contact us", href: CONTACT_URL } },
      ],
    }),
  },
  {
    match: /how (does|do) (it|this|you) work|macam ?mana|bagaimana/i,
    reply: () => ({
      blocks: [
        { type: "text", text: "Here's how ZARA answers your questions:" },
        { type: "steps", items: [
          "You ask in Bahasa Melayu or English, the way you'd ask a colleague.",
          "ZARA searches your organisation's own documents: policies, guides and forms.",
          "It writes an answer and shows the **sources** it used, so you can check them.",
          "Your thumbs up or down helps us keep improving the answers.",
        ] },
      ],
    }),
  },
  {
    match: /embed|integrat|api|script|install|pasang/i,
    reply: () => ({
      blocks: [
        { type: "text", text: "ZARA talks to a simple HTTP API, so you can call it from any system:" },
        { type: "code", lang: "js", code: `const res = await fetch("${CHAT_API}", {\n  method: "POST",\n  headers: { "Content-Type": "application/json" },\n  body: JSON.stringify({ message: "Berapa hari cuti tahunan?", history: [] }),\n});\nconst { answer, sources } = await res.json();` },
      ],
    }),
  },
];

const FALLBACK = () => ({
  blocks: [{ type: "text", text: "I can help with **pricing**, **demos**, **how ZARA works**, or connect you with our team. What would you like to know?" }],
});

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/* Sends one user message. `history` is the API's own shape:
   [{ role: "user" | "assistant", content }]. Resolves to { blocks, sources };
   rejects when the service can't be reached. */
export async function sendMessage(text, history) {
  const intent = INTENTS.find((i) => i.match.test(text));
  if (intent || USE_MOCK_ONLY) {
    await wait(400);
    return (intent ? intent.reply : FALLBACK)();
  }

  const r = await fetch(CHAT_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: text, history }),
  });
  const j = await r.json();
  if (!r.ok) return { blocks: [{ type: "text", text: j.detail || "Maaf, ralat berlaku." }] };
  return { blocks: [{ type: "text", text: j.answer }], sources: j.sources || [] };
}
