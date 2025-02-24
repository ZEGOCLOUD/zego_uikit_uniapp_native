
import { I18n } from '@/uni_modules/zego-UIKitCore/utils/i18n'

import zhMsg from './locales/zh-message'

const i18n = new I18n('zh')

i18n.config(
    {
        zh: zhMsg
    }
)


export function t(key: string, params?: Record<string, any>) {
    return i18n.translate(key, params)
}



