/**
 * CallStateListener 接口定义了监听通话状态变化的方法。
 * 
 * 通话状态的变化是通信过程中常见的事件，此接口提供了一个标准化的方法来监听这些变化。
 * 实现这个接口的类可以被用来自动处理通话状态的变化，例如记录通话日志、更新用户界面等。
 */
import { CallState } from "./CallState";

export interface CallStateListener {
    /**
     * 当通话状态发生变化时调用此方法。
     * 
     * @param before 状态变化前的通话状态。
     * @param after 状态变化后的通话状态。
     * 
     * 此方法的调用者负责在状态变化时触发，监听者可以根据传入的状态值执行相应的逻辑处理。
     */
    onStateChanged(before: CallState, after: CallState): void;
}