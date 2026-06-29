export type TreeNode = {
  id: number;
  x: number;
  y: number;
  level: 0 | 1 | 2 | 3;
  label: string;
  sub: string;
};

export type NetworkTree = {
  nodes: TreeNode[];
  edges: [number, number][];
};

const L1_LABELS = ["0x71C...492", "0x3A8...12D", "0x9FE...88A"];
const L1_SUBS = ["$42.3K", "$18.4K", "$9.2K"];
const L2_LABELS = [
  "0xB4D",
  "0xA2E",
  "0xC8F",
  "0xD7B",
  "0xF93",
  "0xE11",
  "0x81E",
  "0x4FA",
  "0x22D",
];
const L2_SUBS = [
  "$1.2K",
  "$890",
  "$440",
  "$2.1K",
  "$670",
  "$310",
  "$430",
  "$180",
  "$90",
];

export function buildNetworkTree(width: number): NetworkTree {
  const nodes: TreeNode[] = [];
  const edges: [number, number][] = [];

  nodes.push({
    id: 0,
    x: width / 2,
    y: 46,
    level: 0,
    label: "You",
    sub: "Elite Hunter",
  });

  const l1Xs = [width * 0.18, width * 0.5, width * 0.82];
  for (let i = 0; i < 3; i++) {
    nodes.push({
      id: 1 + i,
      x: l1Xs[i],
      y: 138,
      level: 1,
      label: L1_LABELS[i],
      sub: L1_SUBS[i],
    });
    edges.push([0, 1 + i]);
  }

  const l2Offsets = [-0.115, 0, 0.115];
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const id = 4 + i * 3 + j;
      nodes.push({
        id,
        x: l1Xs[i] + l2Offsets[j] * width,
        y: 228,
        level: 2,
        label: L2_LABELS[i * 3 + j],
        sub: L2_SUBS[i * 3 + j],
      });
      edges.push([1 + i, id]);
    }
  }

  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 2; j++) {
      const id = 13 + i * 2 + j;
      const parentNode = nodes[4 + i];
      const xOff = (j === 0 ? -0.052 : 0.052) * width;
      nodes.push({
        id,
        x: parentNode.x + xOff,
        y: 304,
        level: 3,
        label: "",
        sub: "",
      });
      edges.push([4 + i, id]);
    }
  }

  return { nodes, edges };
}
