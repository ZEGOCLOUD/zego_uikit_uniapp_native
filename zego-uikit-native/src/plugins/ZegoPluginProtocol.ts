import { ZegoPluginType } from "./ZegoPluginType";

export interface ZegoPluginProtocol {
    
    getPluginType(): ZegoPluginType;

    getVersion(): string;
}