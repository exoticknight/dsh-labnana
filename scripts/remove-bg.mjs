// 去背景工具：边缘连通域 flood-fill，把与图像边缘连通且接近背景色的像素置为透明。
// 仅用于本地 logo 处理（node scripts/remove-bg.mjs <in> <out> [tolerance]）。
import { PNG } from "pngjs";
import fs from "node:fs";

const [inPath, outPath, tolArg] = process.argv.slice(2);
const tolerance = Number(tolArg ?? 48);

const png = PNG.sync.read(fs.readFileSync(inPath));
const { width, height, data } = png;
const bg = [0, 0, 0]; // 背景色 = 四角平均（近白）
for (const [x, y] of [[0, 0], [width - 1, 0], [0, height - 1], [width - 1, height - 1]]) {
  const i = (y * width + x) * 4;
  for (let c = 0; c < 3; c++) bg[c] += data[i + c];
}
for (let c = 0; c < 3; c++) bg[c] = Math.round(bg[c] / 4);
console.log(`background: rgb(${bg[0]},${bg[1]},${bg[2]}) tolerance=${tolerance}`);

const dist = (i) => {
  let d = 0;
  for (let c = 0; c < 3; c++) {
    const diff = data[i + c] - bg[c];
    d += diff * diff;
  }
  return Math.sqrt(d);
};

// BFS 从边缘向内扩展：颜色接近背景色的连通区域
const visited = new Uint8Array(width * height);
const queue = [];
for (let y = 0; y < height; y++) {
  for (const x of [0, width - 1]) {
    const i = y * width + x;
    if (!visited[i] && dist(i * 4) < tolerance) {
      visited[i] = 1;
      queue.push(i);
    }
  }
}
for (let x = 0; x < width; x++) {
  for (const y of [0, height - 1]) {
    const i = y * width + x;
    if (!visited[i] && dist(i * 4) < tolerance) {
      visited[i] = 1;
      queue.push(i);
    }
  }
}
let head = 0;
while (head < queue.length) {
  const i = queue[head++];
  const x = i % width;
  const y = (i / width) | 0;
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const nx = x + dx;
    const ny = y + dy;
    if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
    const ni = ny * width + nx;
    if (visited[ni]) continue;
    if (dist(ni * 4) < tolerance) {
      visited[ni] = 1;
      queue.push(ni);
    }
  }
}

let removed = 0;
for (let i = 0; i < width * height; i++) {
  if (visited[i]) {
    data[i * 4 + 3] = 0;
    removed++;
  }
}
console.log(`removed ${removed} px (${((removed / (width * height)) * 100).toFixed(1)}%)`);
fs.writeFileSync(outPath, PNG.sync.write(png));
console.log(`written: ${outPath}`);
