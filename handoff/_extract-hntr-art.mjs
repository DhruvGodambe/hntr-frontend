import fs from "fs";

const src = "d:/internship/stellar-code/hntr-frontend-v2/hntr-frontend/handoff/HNTR Docs.html";
const s = fs.readFileSync(src, "utf8");

const start = s.indexOf("<!-- hntr-art -->");
const end = s.indexOf("<!-- nft -->", start);
const chunk = s.slice(start, end > 0 ? end : start + 12000);
const un = chunk.replace(/\\n/g, "\n").replace(/\\"/g, '"');
fs.writeFileSync(
  "d:/internship/stellar-code/hntr-frontend-v2/hntr-frontend/handoff/_hntr-art-extract.html",
  un,
);

const navIdx = s.indexOf("What even is an NFT?");
fs.writeFileSync(
  "d:/internship/stellar-code/hntr-frontend-v2/hntr-frontend/handoff/_nav-snippet.txt",
  s.slice(Math.max(0, navIdx - 1500), navIdx + 400).replace(/\\n/g, "\n").replace(/\\"/g, '"'),
);

const logoId = "1ff00a6f-66ab-404b-abb3-946ec19bb7ce";
const wmId = "a1b2c3d4-wm00-4e5f-9a8b-hntrwordmark1";
console.log("articleLen", un.length, "navIdx", navIdx, "logo", s.includes(logoId + '":{"mime"'), "wordmark", s.includes(wmId));
console.log("---ARTICLE---");
console.log(un);
