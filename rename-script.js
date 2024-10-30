const fs = require('fs');
const path = require('path');
const package = require('./package.json');

const dir = './dist/' + package.name; // build 出來的目錄
const oldName = 'main.js'; // 原本的檔案名稱
const newName = 'main.securejs'; // 更名後的檔案名稱

// 更名 main.js 檔案
fs.renameSync(path.join(dir, oldName), path.join(dir, newName));

// 修改 index.html 檔案裡的 script 標籤 src 屬性
const indexFilePath = path.join(dir, 'index.html');
let indexFileContent = fs.readFileSync(indexFilePath, 'utf8');
indexFileContent = indexFileContent.replace(oldName, newName);
fs.writeFileSync(indexFilePath, indexFileContent, 'utf8');

console.log(`Renamed ${oldName} to ${newName}`);
