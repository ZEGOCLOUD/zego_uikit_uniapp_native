const fs = require('fs');
const path = require('path');

const packageJson = require('../package.json')
const projName = packageJson.id
const workspace = path.resolve(__dirname, '..')
console.log('[*] CWD: ' + workspace)

// 从命令行读取是否有带 --sync 参数
console.log('[*] Checking if --sync is set...')
const isSync = process.argv.includes('--sync');

const sourceDir = path.join(workspace, 'dist');
const distDir = path.join(workspace, '..', 'uni_modules', projName);
console.log('[*] Dist dir: ' + distDir)

// 先删除 distDir
if (!isSync && fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true });
}

// 把 sourceDir 下的内容拷贝到 distDir, 如果目标目录存在, 则覆盖掉
fs.cpSync(sourceDir, distDir, { recursive: true, force: true });

console.log(`[*] ${projName} deploy successfully.`)
