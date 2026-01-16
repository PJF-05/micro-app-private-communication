# private-communication

#### Description
问题：
调查并实践了一些微前端框架，发现基本都是共享式通信；例如：如果子应用a想发送一些私密性消息给子应用b, 一但其他子应用订阅了该事件就可以获取到该消息。
解决：
主应用创建全局发布订阅通信，主应用为子应用分别创建订阅发布服务，但其中主应用的发布替代子应用发布功能，而子应用真正的发布功能由主应用就控制。

#### Software Architecture
Software architecture description

#### Installation

1.  xxxx
2.  xxxx
3.  xxxx

#### Instructions

1.  xxxx
2.  xxxx
3.  xxxx

#### Contribution

1.  Fork the repository
2.  Create Feat_xxx branch
3.  Commit your code
4.  Create Pull Request


#### Gitee Feature

1.  You can use Readme\_XXX.md to support different languages, such as Readme\_en.md, Readme\_zh.md
2.  Gitee blog [blog.gitee.com](https://blog.gitee.com)
3.  Explore open source project [https://gitee.com/explore](https://gitee.com/explore)
4.  The most valuable open source project [GVP](https://gitee.com/gvp)
5.  The manual of Gitee [https://gitee.com/help](https://gitee.com/help)
6.  The most popular members  [https://gitee.com/gitee-stars/](https://gitee.com/gitee-stars/)
