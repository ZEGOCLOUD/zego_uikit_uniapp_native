import { SessionStorage } from "../utils";
import { ZegoSignalingPlugin } from "./signaling/ZegoSignalingPlugin";
import { ZegoSignalingPluginProtocol } from "./signaling/ZegoSignalingPluginProtocol";
import { ZegoPluginProtocol } from "./ZegoPluginProtocol";
import { ZegoPluginType } from "./ZegoPluginType";

export class ZegoPluginAdapter {

    private static mPlugins: Map<ZegoPluginType, ZegoPluginProtocol> = new Map();

    // TypeScript 方法没有返回类型时可省略，静态方法不需要实例化
    public static installPlugins(plugins: ZegoPluginProtocol[]) {
        if (plugins) {
            plugins.forEach(plugin => {
                this.mPlugins.set(plugin.getPluginType(), plugin);
                // SessionStorage.set('ZegoPluginAdapter.mPlugins.' + plugin.getPluginType(), plugin)
            });
        }
    }

    // 返回值类型为可能的 undefined，表示可能没有找到插件
    public static getPlugin(pluginType: ZegoPluginType): ZegoPluginProtocol | null {
        return this.mPlugins.get(pluginType) || null; // || SessionStorage.get('ZegoPluginAdapter.mPlugins.' + pluginType) || null;
    }

    public static signalingPlugin(): ZegoSignalingPluginProtocol {
        let plugin = this.getPlugin(ZegoPluginType.Signling) as ZegoSignalingPluginProtocol;
        if (!plugin) {
            plugin = new ZegoSignalingPlugin()
            this.installPlugins([plugin]);
        }
        return plugin;
    }

}