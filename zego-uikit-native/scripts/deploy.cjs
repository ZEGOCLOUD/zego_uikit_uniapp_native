const fs = require('fs');
const path = require('path');
const Rsync = require('rsync')

const packageJson = require('../package.json')
const projName = packageJson.id
const workspace = path.resolve(__dirname, '..')
console.log('[*] CWD: ' + workspace)

// 从命令行读取是否有带 --link 参数
console.log('[*] Checking if --link is set...')
const isLink = process.argv.includes('--link');
console.log('[*] Checking if --sync is set...')
const isSync = process.argv.includes('--sync');

const sourceDir = path.join(workspace, 'dist');
const distDir = path.join(workspace, '..', 'uni_modules', projName);
console.log('[*] Dist dir: ' + distDir)

if (isLink) {
    if (fs.existsSync(distDir)) {
        fs.rmSync(distDir, { recursive: true });
    }
    // 只要把 ./src 软连到 distDir 就行
    console.log('[*] Linking src to ' + distDir)

    fs.symlinkSync(path.join(workspace, 'src'), distDir, 'dir');
    console.log(`[*] ${projName} link successfully.`)
} else if (isSync) {
    // 增量同步
    console.log('[*] Incremental sync...')
    const rsync = new Rsync().source(sourceDir + '/').destination(distDir).recursive().update()
    console.log('[*] Rsync: ' + rsync.command())
    rsync.execute((err, code, cmd) => {
        if (err) {
            console.error(`[!] ${projName} rsync error: ${err}`)
        } else {
            console.log(`[*] ${projName} rsync successfully.`)
        }
    })
} else {
    // 先删除 distDir
    if (fs.existsSync(distDir)) {
        fs.rmSync(distDir, { recursive: true });
        // 把 sourceDir 下的内容拷贝到 distDir, 如果目标目录存在, 则覆盖掉
        fs.cpSync(sourceDir, distDir, { recursive: true, force: true });
    }

    console.log(`[*] ${projName} deploy successfully.`)
}
