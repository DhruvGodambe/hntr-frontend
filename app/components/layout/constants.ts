import type { ActivityTemplate } from "./types";

export const MOBILE_MQ = "(max-width: 900px)";

export const ACTIVITY_TEMPLATES: ActivityTemplate[] = [
  { icon: "🐧", name: "Pudgy Penguin #3362", action: "DEPOSITED", val: "2.4 ETH", pos: true, kind: "other" },
  { icon: "🦧", name: "BAYC #9112", action: "LISTED", val: "$19,400", pos: true, kind: "sale" },
  { icon: "👾", name: "CryptoPunk #7804", action: "SOLD", val: "$91,000", pos: true, kind: "sale" },
  { icon: "🐧", name: "Pudgy Penguin #1021", action: "BID PLACED", val: "3.1 ETH", pos: true, kind: "bid" },
  { icon: "🦧", name: "BAYC #5678", action: "RENEWED", val: "+14% APY", pos: true, kind: "other" },
  { icon: "🎨", name: "Normie #2265", action: "SOLD", val: "$4,200", pos: true, kind: "sale" },
  { icon: "👾", name: "CryptoPunk #3100", action: "BID PLACED", val: "$110,000", pos: true, kind: "bid" },
  { icon: "⚡", name: "Kaito Genesis #441", action: "LISTED", val: "1.4 ETH", pos: false, kind: "sale" },
  { icon: "🦧", name: "BAYC #1142", action: "WITHDRAWN", val: "3.2 ETH", pos: false, kind: "other" },
  { icon: "🐧", name: "Pudgy Penguin #884", action: "BID PLACED", val: "2.7 ETH", pos: true, kind: "bid" },
  { icon: "🎨", name: "Bored Ape Yacht Club #3362", action: "BID PLACED", val: "2.5 ETH", pos: true, kind: "bid" },
  { icon: "💎", name: "Pudgy Penguins #8721", action: "SALE", val: "4.2 ETH", pos: true, kind: "sale" },
  { icon: "🔥", name: "Azuki #5234", action: "BID DECLINED", val: "3.1 ETH", pos: false, kind: "bid" },
  { icon: "⚡", name: "Doodles #1523", action: "POOL FUNDED", val: "1.8 ETH", pos: true, kind: "other" },
  { icon: "🎯", name: "CloneX #9841", action: "BID PLACED", val: "5.5 ETH", pos: true, kind: "bid" },
  { icon: "💫", name: "Moonbirds #2341", action: "SALE", val: "6.7 ETH", pos: true, kind: "sale" },
];
