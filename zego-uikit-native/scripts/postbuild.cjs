const fs = require('fs');
const path = require('path');
const glob = require('glob').glob;
const workspace = path.resolve(__dirname, '..')
console.log(`[*] Workspace: ${workspace}`)

const config = require(`${workspace}/config.json`)
const packageJson = require(`${workspace}/package.json`)
const projName = packageJson.id
console.log(`[*] Project Name: ${projName}`)

// 异步函数来复制文件
async function copyFiles(config) {
    console.log(`[*] Copy Files`)
    for (const rule of config.copyRules) {
        const source = path.join(workspace, rule.source);
        const destinationDir = path.join(workspace, rule.destination);

        // 确保目标目录存在
        fs.mkdirSync(destinationDir, { recursive: true });

        const sourceStat = fs.statSync(source)
        if (sourceStat.isDirectory()) {
            // 使用glob-promise来匹配所有文件并排除指定的文件
            const files = await glob(`${source}/**/*`, {
                ignore: rule.exclude.map(excluded => `${source}/${excluded}`)
            });

            // 复制每个文件到目标目录
            for (const file of files) {
                const relativePath = path.relative(source, file);
                const destPath = path.join(destinationDir, relativePath);
                const stat = fs.statSync(file)
                if (stat.isDirectory()) {
                    fs.mkdirSync(destPath, { recursive: true });
                } else {
                    fs.copyFileSync(file, destPath);
                }
            }
        } else {
            const destPath = path.join(destinationDir, rule.source);
            fs.copyFileSync(source, destPath);
        }
    }
}

function incrementBuildVerion(version) {
    // 分割版本号
    const parts = version.split('.').map(Number); // 转换为数字数组

    // 检查第三个部分是否存在
    if (parts.length < 3) {
        throw new Error('Invalid version format');
    }
    // 增加第三部分的版本号
    parts[2]++;
    
    // 返回新的版本号字符串
    return parts.join('.');
}

// 更新 package.json 的 "main" 字段并写入到 dist 目录
async function updateAndCopyPackageJson() {
    console.log('[*] Update package.json')
    // 先更新版本号
    // packageJson.version = incrementBuildVerion(packageJson.version)
    console.log(`[*] New Version: ${packageJson.version}`)
    
    // 写回原来的json里先
    fs.writeFileSync(path.join(workspace, 'package.json'), JSON.stringify(packageJson, null, 2), 'utf8');

    // 检查 "main" 字段是否存在并更新它
    if (packageJson.main) {
        packageJson.main = 'index.js';
    } else {
        throw new Error('"main" field is missing in package.json');
    }

    delete packageJson.scripts

    // 写入更新后的 package.json 到 dist 目录
    const distPackageJsonPath = path.join(workspace, 'dist', 'package.json');
    fs.mkdirSync(path.dirname(distPackageJsonPath), { recursive: true }); // 确保 dist 目录存在
    fs.writeFileSync(distPackageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8');
}

// 执行复制操作
copyFiles(config)
    .then(updateAndCopyPackageJson())
    .then(() => console.log(`[*] ${projName} build successfully.`))
    .catch((err) => console.error('[!] Error occurred:', err));
