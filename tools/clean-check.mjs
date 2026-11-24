// Answer clean-up (cleanAnswer): list items keep their text, only links go.
// Run: node tools/clean-check.mjs   (exits 1 if any case is wrong)
import { cleanAnswer } from "../src/components/chatService.js";

const CASES = [
  // [ZARA's raw answer, expected after clean-up]
  [
    "Zen menawarkan empat perkhidmatan:\n- Infrastruktur (https://www.zen.com.my/a/)\n- Aplikasi (https://www.zen.com.my/b/)\n\nSila layari laman web kami.",
    "Zen menawarkan empat perkhidmatan:\n- Infrastruktur\n- Aplikasi",
  ],
  [
    "Services:\n1. Perkhidmatan Infrastruktur (https://www.zen.com.my/infrastructure-offering/)\n2. [Applications](https://zen.com.my/app)\n* SaaS www.zen.com.my/saas",
    "Services:\n1. Perkhidmatan Infrastruktur\n2. Applications\n* SaaS",
  ],
  [
    "Pilihan:\n- (https://www.zen.com.my/only-a-link/)\n- Aplikasi",   // an item that is only a link goes
    "Pilihan:\n- Aplikasi",
  ],
  [
    "Kami buka 8 pagi. Sila hubungi kami untuk maklumat lanjut.",
    "Kami buka 8 pagi.",
  ],
];

let bad = 0;
for (const [input, want] of CASES) {
  const got = cleanAnswer(input);
  const ok = got === want;
  if (!ok) bad++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${JSON.stringify(input).slice(0, 70)}`);
  if (!ok) console.log(`  expected ${JSON.stringify(want)}\n  got      ${JSON.stringify(got)}`);
}
console.log(`\n${CASES.length - bad}/${CASES.length} passed`);
process.exit(bad ? 1 : 0);
