import { defineConfig } from "vite";
import uni from "@dcloudio/vite-plugin-uni";
// https://vitejs.dev/config/

const customElements = [
    'ZegoExpress-Remote-View',
    'ZegoExpress-Local-View',
]

export default defineConfig({
    plugins: [
        uni({
            vueOptions: {
                template: {
                    compilerOptions: {
                        isCustomElement: tag => customElements.includes(tag)
                    },
                },
            },
        }),
    ],
});
