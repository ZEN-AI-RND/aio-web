// Which questions get a canned reply and which go to ZARA.
// Run: node tools/intent-check.mjs   (exits 1 if any case is wrong)
import { matchIntent } from "../src/components/chatService.js";

const CASES = [
  // [question, expected: intent name or "zara"]
  ["Can I talk to a human?", "human"],
  ["I want to speak with someone from sales", "human"],
  ["Nak cakap dengan orang", "human"],
  ["human agent please", "human"],
  ["how many zen staff", "zara"],
  ["Bagaimana saya boleh hubungi pasukan anda?", "zara"],
  ["How does ZARA work?", "how-zara-works"],
  ["how do you work", "how-zara-works"],
  ["Macam mana ZARA jawab soalan?", "how-zara-works"],
  ["Macam mana nak contact your team?", "zara"],
  ["How do I embed the widget on my site?", "embed"],
  ["Is there an API?", "embed"],
  ["Bolehkah anda memasang pelayan AI?", "zara"],
  ["Berapa harga AI Office?", "pricing"],
  ["What is the pricing?", "pricing"],
  ["Can I get a quote?", "pricing"],
  ["Can I book a demo?", "demo"],
  ["What services do you offer?", "zara"],
  ["Office you all buka pukul berapa?", "zara"],
  ["Do you have a rapid deployment option?", "zara"], // "api" inside "rapid"
  ["how much does it cost", "pricing"],
  ["request a quotation", "pricing"],
  ["costume party ideas", "zara"],
  ["what is my quota", "zara"],
];

let bad = 0;
for (const [q, want] of CASES) {
  const got = matchIntent(q)?.name || "zara";
  const ok = got === want;
  if (!ok) bad++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${got.padEnd(15)} ${q}${ok ? "" : `   (expected ${want})`}`);
}
console.log(`\n${CASES.length - bad}/${CASES.length} passed`);
process.exit(bad ? 1 : 0);
