import EventEmitter from "./eventEmitter";

interface CommunicationEvent {
  receiveApp: 'all' | string | string[];
  recipientMessage: any;
  timestamp?: string | number;
  sender?: string;
}

interface appOption {
  name: string,
  receiveScopeApp: 'all' | string | string[];
}

interface AppEventEmitter {
  onPrivateCommunication: (listener: (event: CommunicationEvent) => void) => void;
  offPrivateCommunication: (listener: (event: CommunicationEvent) => void) => void;
  oncePrivateCommunication: (listener: (event: CommunicationEvent) => void) => void;
  removeAllPrivateCommunication: () => void;
  emitPrivateCommunication: (receiveApp: 'all' | string | string[], recipientMessage: any) => void;
}

/**
 * 私密独立通信服务
 */
class PrivateCommunication {
  // 子应用
  private apps = new Map<string, any>();
  // 订阅事件名称
  private eventName = "PRIVATE_COMMUNICATION";
  // 发布订阅服务中心
  private eventEmitterCenter = new EventEmitter();

  constructor(appList: appOption[] = []) {
    console.log('初始化 PrivateCommunication 服务...');
    if (appList && appList.length > 0) {
      appList.forEach((app: appOption) => {
        const { name, receiveScopeApp } = app
        this.createPrivateCommunication(name, receiveScopeApp)
      })
    }
    this.initPrivateCommunication();
    console.log('PrivateCommunication 服务初始化完成');
  }

  /**
   * 初始化私密独立通信服务
   */
  private initPrivateCommunication() {
    console.log(`订阅事件: ${this.eventName}`);
    this.eventEmitterCenter.on(this.eventName, this.onEventEmitterCenter.bind(this));
  }

  /**
   * 订阅事件, 私密并发布到需要发布的应用
   * @param info 信息
   */
  private onEventEmitterCenter(info: CommunicationEvent) {
    try {
      console.groupCollapsed(`📨 收到消息 (${info.sender || 'unknown'} -> ${info.receiveApp})`);
      console.log('消息内容:', info.recipientMessage);
      console.log('时间戳:', info.timestamp);

      // 如果没有应用，直接返回
      if (this.apps.size === 0) {
        console.log('没有注册的应用');
        console.groupEnd();
        return;
      }

      const { receiveApp, sender } = info;

      // 发送给所有应用
      if (receiveApp === 'all') {
        console.log(`发送给所有应用 (${this.apps.size} 个)`);
        for (const [appName, appEventEmitter] of this.apps) {
          // 跳过发送者自身
          if (sender !== appName && this.isReceiveScopeApp(appName, sender)) {
            console.log(`   -> ${appName}`);
            appEventEmitter.emitAppEventEmitter(info);
          } else {
            console.warn(`应用 ${appName} 不存在${sender}设置接收范围`);
          }
        }
      }
      // 发送给多个应用
      else if (Array.isArray(receiveApp)) {
        console.log(`发送给 ${receiveApp.length} 个应用:`, receiveApp);
        receiveApp.forEach((appName) => {
          if (!this.hasApp(appName)) {
            console.warn(`应用 ${appName} 不存在`);
            return
          }
          if (this.isReceiveScopeApp(appName, sender)) {
            // 跳过发送者自身
            if (sender !== appName) {
              console.log(`   -> ${appName}`);
              const app = this.apps.get(appName);
              app.emitAppEventEmitter(info);
            }
          } else {
            console.warn(`应用 ${appName} 不存在${sender}设置接收范围`);
          }
        });
      }
      // 发送给单个应用
      else if (typeof receiveApp === 'string') {
        console.log(`发送给单个应用: ${receiveApp}`);
        if (!this.hasApp(receiveApp)) {
          console.warn(`应用 ${receiveApp} 不存在`);
          return
        }
        if (this.isReceiveScopeApp(receiveApp, sender)) {
          // 跳过发送者自身
          if (sender !== receiveApp) {
            const app = this.apps.get(receiveApp);
            app.emitAppEventEmitter(info);
          }
        } else {
          console.warn(`应用 ${receiveApp} 不存在${sender}设置接收范围`);
        }
      }
      else {
        throw new Error('receiveApp 参数错误，必须是 "all"、字符串或字符串数组');
      }

      console.groupEnd();
    } catch (error) {
      console.error('发送失败:', error);
      throw new Error(`发送失败: ${(error as Error).message}`);
    }
  }

  /**
   * 发布事件
   * @param info 信息
   */
  private emitEventEmitterCenter(info: CommunicationEvent) {
    console.log(`发布事件: ${info.sender || 'system'} -> ${info.receiveApp}`);
    this.eventEmitterCenter.emit(this.eventName, info);
  }

  // /**
  //  * 全局收到消息事件
  //  * @param event 
  //  */
  // allRecipientMessage = (event: CommunicationEvent) => {
  //   console.log(`应用 ${name} 收到消息:`, {
  //     sender: event.sender,
  //     type: typeof event.recipientMessage,
  //     timestamp: event.timestamp
  //   });
  // };

  /**
   * 为对应子应用创建私密独立发布订阅服务
   * @param name 子应用注册名称
   * @param scope 设置子应用内容接收范围
   * @returns 应用的事件发射器接口
   */
  createPrivateCommunication(name: string, receiveScopeApp: 'all' | string | string[] = 'all'): AppEventEmitter {
    console.log(`为应用 ${name} 创建通信服务`);

    if (this.hasApp(name)) {
      console.warn(`应用 ${name} 已存在，返回现有实例`);
      return this.apps.get(name);
    }

    const appEventEmitter = new EventEmitter();

    const returnEventEmitter: any = {
      // 默认应用内容接收范围为全部
      receiveScopeApp,
      // 监听私有通信消息
      onPrivateCommunication: (listener: (event: CommunicationEvent) => void) => {
        console.log(`应用 ${name} 注册消息监听器`);
        return appEventEmitter.on(this.eventName, listener);
      },

      // 取消监听
      offPrivateCommunication: (listener: (event: CommunicationEvent) => void) => {
        console.log(`应用 ${name} 取消消息监听器`);
        return appEventEmitter.off(this.eventName, listener);
      },

      // 一次性监听
      oncePrivateCommunication: (listener: (event: CommunicationEvent) => void) => {
        console.log(`应用 ${name} 注册一次性消息监听器`);
        return appEventEmitter.once(this.eventName, listener);
      },

      // 移除所有监听器
      removeAllPrivateCommunication: () => {
        console.log(`应用 ${name} 移除所有监听器`);
        return appEventEmitter.removeAllListeners();
      },

      // 发送消息（通过主服务转发）
      emitPrivateCommunication: (receiveApp: 'all' | string | string[], recipientMessage: any) => {
        console.log(`应用 ${name} 发送消息到: ${receiveApp}`);
        const info: CommunicationEvent = {
          receiveApp,
          recipientMessage,
          sender: name,
          timestamp: Date.now(),
        };

        // 通过主服务转发消息
        this.emitEventEmitterCenter(info);
      }
    };

    // 存储应用所有实例
    const allEventEmitter = {
      ...returnEventEmitter,
      emitAppEventEmitter: (param: CommunicationEvent) => {
        appEventEmitter.emit(this.eventName, param)
      },
    };

    // 初始监听器
    // appEventEmitter.on(this.eventName, this.allRecipientMessage);

    // 存储应用实例
    this.apps.set(name, allEventEmitter);

    console.log(`应用 ${name} 通信服务创建成功`);

    return returnEventEmitter;
  }

  /**
   * 设置子应用内容接收范围
   * @param name 应用名称
   */
  setReceiveScopeApp(name: string, scope: 'all' | string | string[]) {
    if (!this.hasApp(name)) {
      console.warn(`应用 ${name} 不存在`);
      return
    }
    const app = this.apps.get(name);
    this.apps.set(name, { ...app, receiveScopeApp: scope })
  }

  /**
   * 判断是否符合子应用内容接收范围
   * @param name 应用名称
   * @returns
   */
  private isReceiveScopeApp(name: string, sender: string | any) {
    const { receiveScopeApp } = this.apps.get(sender);
    console.log('---', receiveScopeApp);

    if (typeof receiveScopeApp === 'string') {
      if (receiveScopeApp === 'all') {
        return true;
      }
      return receiveScopeApp === name;
    }
    if (Array.isArray(receiveScopeApp)) {
      return receiveScopeApp.includes(name);
    }
    return false;
  }


  /**
   * 注销应用
   * @param name 应用名称
   */
  unregisterApp(name: string): boolean {
    if (this.hasApp(name)) {
      const app = this.apps.get(name);
      // 清理监听器
      if (app.removeAllPrivateCommunication) {
        app.removeAllPrivateCommunication();
      }

      this.apps.delete(name);
      console.log(`注销应用: ${name}`);
      return true;
    }

    console.warn(`应用 ${name} 不存在，无法注销`);
    return false;
  }

  /**
   * 获取所有注册的应用
   */
  getRegisteredApps(): string[] {
    return Array.from(this.apps.keys());
  }

  /**
   * 获取应用数量
   */
  getAppCount(): number {
    return this.apps.size;
  }

  /**
   * 检查应用是否存在
   */
  hasApp(name: string): boolean {
    return this.apps.has(name);
  }

  /**
   * 获取对应应用
   */
  getApp(name: string): boolean {
    if (!this.hasApp(name)) {
      console.warn(`应用 ${name} 不存在`);
    }
    return this.apps.get(name);
  }

  /**
   * 清空所有应用
   */
  clearAllApps(): number {
    const count = this.apps.size;

    // 清理所有应用的监听器
    for (const [name, app] of this.apps) {
      if (app.removeAllPrivateCommunication) {
        app.removeAllPrivateCommunication();
      }
    }

    this.apps.clear();
    console.log(`清空所有应用 (${count} 个)`);
    return count;
  }

  /**
   * 获取系统状态
   */
  getSystemStatus() {
    return {
      totalApps: this.apps.size,
      registeredApps: this.getRegisteredApps(),
      isInitialized: true,
      eventName: this.eventName
    };
  }

  /**
   * 销毁通信服务
   */
  destroy() {
    console.log('销毁 PrivateCommunication 服务');

    // 清理所有应用
    this.clearAllApps();

    // 清理主事件发射器
    this.eventEmitterCenter.removeAllListeners();

    console.log('PrivateCommunication 服务已销毁');
  }
}

export default PrivateCommunication;
