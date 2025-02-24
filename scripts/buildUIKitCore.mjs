import path from 'path'
import fsa from 'fs-extra'
import { execaCommandSync } from 'execa'

function main() {
    try {
        execaCommandSync('rimraf ' + path.resolve(process.cwd(), './uni_modules/zego-UIKitCore'))

        process.chdir(path.resolve(process.cwd(), './zego-uikit-native'))
        execaCommandSync('pnpm install')
        execaCommandSync('pnpm run deploy:sync')
    } catch (error) {
        console.log(error.message)
    }
}

main()
