type EventCallback = (...args: any[]) => void;
type EventMap = Map<string, Set<EventCallback>>;

class EventEmitter {
  private events: EventMap = new Map();
  private onceEvents: Map<string, Set<EventCallback>> = new Map();

  /**
   * 订阅事件
   * @param eventName 事件名称
   * @param callback 回调函数
   * @returns 取消订阅的函数
   */
  on(eventName: string, callback: EventCallback): () => void {
    if (!this.events.has(eventName)) {
      this.events.set(eventName, new Set());
    }
    this.events.get(eventName)!.add(callback);
    
    // 返回取消订阅的函数
    return () => this.off(eventName, callback);
  }

  /**
   * 取消订阅事件
   * @param eventName 事件名称
   * @param callback 回调函数（可选，不传则移除所有监听器）
   */
  off(eventName: string, callback?: EventCallback): void {
    if (!callback) {
      // 移除该事件的所有监听器
      this.events.delete(eventName);
      this.onceEvents.delete(eventName);
      return;
    }

    // 从常规事件中移除
    const callbacks = this.events.get(eventName);
    if (callbacks) {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        this.events.delete(eventName);
      }
    }

    // 从一次性事件中移除
    const onceCallbacks = this.onceEvents.get(eventName);
    if (onceCallbacks) {
      onceCallbacks.delete(callback);
      if (onceCallbacks.size === 0) {
        this.onceEvents.delete(eventName);
      }
    }
  }

  /**
   * 订阅一次性事件
   * @param eventName 事件名称
   * @param callback 回调函数
   * @returns 取消订阅的函数
   */
  once(eventName: string, callback: EventCallback): () => void {
    if (!this.onceEvents.has(eventName)) {
      this.onceEvents.set(eventName, new Set());
    }
    this.onceEvents.get(eventName)!.add(callback);
    
    // 返回取消订阅的函数
    return () => this.off(eventName, callback);
  }

  /**
   * 触发事件
   * @param eventName 事件名称
   * @param args 传递给回调函数的参数
   */
  emit(eventName: string, ...args: any[]): void {
    // 执行常规事件监听器
    const callbacks = this.events.get(eventName);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(...args);
        } catch (error) {
          console.error(`Error executing callback for event "${eventName}":`, error);
        }
      });
    }

    // 执行一次性事件监听器，执行后移除
    const onceCallbacks = this.onceEvents.get(eventName);
    if (onceCallbacks) {
      onceCallbacks.forEach(callback => {
        try {
          callback(...args);
        } catch (error) {
          console.error(`Error executing once callback for event "${eventName}":`, error);
        }
      });
      // 清空一次性事件
      onceCallbacks.clear();
      this.onceEvents.delete(eventName);
    }
  }

  /**
   * 获取事件的所有监听器数量
   * @param eventName 事件名称
   */
  listenerCount(eventName: string): number {
    const regularCount = this.events.get(eventName)?.size || 0;
    const onceCount = this.onceEvents.get(eventName)?.size || 0;
    return regularCount + onceCount;
  }

  /**
   * 移除所有事件监听器
   */
  removeAllListeners(): void {
    this.events.clear();
    this.onceEvents.clear();
  }

  /**
   * 获取所有已注册的事件名称
   */
  eventNames(): string[] {
    const regularEvents = Array.from(this.events.keys());
    const onceEvents = Array.from(this.onceEvents.keys());
    return Array.from(new Set([...regularEvents, ...onceEvents]));
  }
}

export default EventEmitter;