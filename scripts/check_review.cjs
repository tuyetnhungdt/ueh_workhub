const fs = require('fs');
const content = fs.readFileSync('src/data/seed.js', 'utf8');
const lines = content.split('\n');
let cur = {};
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes("id: '")) {
    const id = line.match(/id:\s*'([^']+)'/)?.[1];
    cur = { id, line: i };
  }
  if (line.includes("title: '")) {
    cur.title = line.match(/title:\s*'([^']+)'/)?.[1];
  }
  if (line.includes("categoryId: '")) {
    cur.cat = line.match(/categoryId:\s*'([^']+)'/)?.[1];
  }
  if (line.includes("status: 'review'")) {
    console.log(cur.id, cur.cat, cur.title);
  }
}
