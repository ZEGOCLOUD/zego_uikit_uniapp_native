import path from 'path'
import { execaCommandSync } from 'execa'

function main() {
    try {
        execaCommandSync('rimraf ' + path.resolve(process.cwd(), './uni_modules/zego-PrebuiltCall'))
    } catch (error) {
        console.log(error.message)
    }

    process.chdir(path.resolve(process.cwd(), './zego-uikit-prebuilt-call'))
    execaCommandSync('pnpm install')
    execaCommandSync('pnpm run deploy:sync')
}

main()
