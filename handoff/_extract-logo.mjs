import fs from "fs";

const src = "d:/internship/stellar-code/hntr-frontend-v2/hntr-frontend/handoff/HNTR Docs.html";
const dests = [
  "d:/internship/stellar-code/hntr-frontend-v2/hntr-frontend/public/learn/images",
  "d:/internship/stellar-code/hntr-frontend/hntr-frontend/public/images/learn",
];

const s = fs.readFileSync(src, "utf8");
const id = "1ff00a6f-66ab-404b-abb3-946ec19bb7ce";
const key = `"${id}":{"mime":"image/png"`;
const i = s.indexOf(key);
if (i < 0) throw new Error("logo not found");
const dataIdx = s.indexOf('"data":"', i) + 8;
const end = s.indexOf('"', dataIdx);
const buf = Buffer.from(s.slice(dataIdx, end), "base64");

for (const dir of dests) {
  fs.mkdirSync(dir, { recursive: true });
  const file = `${dir}/hntr-mark.png`;
  fs.writeFileSync(file, buf);
  console.log("wrote", file, buf.length);
}
