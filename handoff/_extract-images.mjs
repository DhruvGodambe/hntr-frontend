import fs from "fs";

const src = "d:/internship/stellar-code/hntr-frontend-v2/hntr-frontend/handoff/HNTR Docs.html";
const outDir = "d:/internship/stellar-code/hntr-frontend/hntr-frontend/public/images/learn";
fs.mkdirSync(outDir, { recursive: true });

const s = fs.readFileSync(src, "utf8");

function extractPng(id, filename) {
  const key = `"${id}":{"mime":"image/png"`;
  const i = s.indexOf(key);
  if (i < 0) {
    console.log("missing", id);
    return;
  }
  const dataIdx = s.indexOf('"data":"', i);
  const start = dataIdx + '"data":"'.length;
  const end = s.indexOf('"', start);
  const b64 = s.slice(start, end);
  fs.writeFileSync(`${outDir}/${filename}`, Buffer.from(b64, "base64"));
  console.log(filename, Buffer.from(b64, "base64").length, "bytes");
}

extractPng("1ff00a6f-66ab-404b-abb3-946ec19bb7ce", "hntr-mark.png");
extractPng("a1b2c3d4-wm00-4e5f-9a8b-hntrwordmark1", "hntr-wordmark.png");
