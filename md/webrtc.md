# 从0到1打造一个 WebRTC 应用

> 张宇航，微医云服务团队前端工程师，一个不文艺的处女座程序员。

## 前言

2020 年初突如其来的新冠肺炎疫情让线下就医渠道几乎被切断，在此背景下，微医作为数字健康行业的领军者通过在线问诊等形式快速解决了大量急需就医人们的燃眉之急。而作为微医 Web 端在线问诊中重要的一环-医患之间的视频问诊正是应用了接下来讲述的 WebRTC 技术。

## WebRTC 是什么

WebRTC(Web Real-Time Communication)是 Google 在 2010 年以 6820 万美元收购 VoIP 软件开发商 Global IP Solutions 的 GIPS 引擎，并改名为“WebRTC”于 2011 年将其开源的旨在建立一个互联网浏览器之间的音视频和数据实时通信的平台。

那么 WebRTC 能做些什么呢？除了上述提到的医疗领域中的在线问诊/远程门诊/远程会诊，还有时下较为流行的电商互动直播解决方案、教育行业解决方案，除此之外，伴随着 5G 的快速建设，WebRTC 也为云游戏提供了很好的技术支撑。

## WebRTC 架构

下图是来自[WebRTC 官网](https://webrtc.github.io/webrtc-org/architecture/)的 WebRTC 整体架构图

![image](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/901bc7a2e23147898e17b739e622da6f~tplv-k3u1fbpfcp-zoom-1.image)

从图中不难看出，整个 WebRTC 架构设计大致可以分为以下 3 部分：

1. 紫色提供给 Web 前端开发使用的 API
2. 蓝色实线部分提供各大浏览器厂商使用的 API
3. 蓝色虚线部分包含 3 部分：音频引擎、视频引擎、网络传输 (Transport)。都可以自定义实现

## WebRTC 点对点通信原理

> 要实现两个不同网络环境（具有麦克风、摄像头设备）的客户端（可能是不同的 Web 浏览器或者手机 App）之间的实时音视频通信的难点在哪里、需要解决哪些问题？

1. 怎么知道彼此的存在也就是如何发现对方？
2. 彼此音视频编解码能力如何沟通？
3. 音视频数据如何传输，怎么能让对方看得自己？

**对于问题 1**：WebRTC 虽然支持端对端通信，但是这并不意味着 WebRTC 不再需要服务器。在点对点通信的过程中，双方需要交换一些元数据比如媒体信息、网络数据等等信息。我们通常称这一过程叫做：信令(signaling)。对应的服务器即**信令服务器 (signaling server)**。通常也有人将之称为房间服务器，因为它不仅可以交换彼此的媒体信息和网络信息，同样也可以管理房间信息，比如通知彼此 who 加入了房间,who 离开了房间，告诉第三方房间人数是否已满是否可以加入房间。 为了避免出现冗余，并最大限度地提高与已有技术的兼容性，WebRTC 标准并没有规定信令方法和协议。在本文接下来的实践章节会利用 Koa 和 Socket.io 技术实现一个信令服务器。

**对于问题 2**：我们首先要知道的是，不同浏览器对于音视频的编解码能力是不同的。比如: Peer-A 端支持 H264、VP8 等多种编码格式,而 Peer-B 端支持 H264、VP9 等格式。为了保证双方都可以正确的编解码，最简单的办法即取它们所都支持格式的交集-H264。在 WebRTC 中，有一个专门的协议，称为**Session Description Protocol(SDP)**,可以用于描述上述这类信息。因此参与音视频通讯的双方想要了解对方支持的媒体格式，必须要交换 SDP 信息。而交换 SDP 的过程，通常称之为**媒体协商**。

**对于问题 3**：其本质上就是**网络协商**的过程：参与音视频实时通信的双方要了解彼此的网络情况，这样才有可能找到一条相互通讯的链路。理想的网络情况是每个浏览器的电脑都有自己的私有公网 IP 地址，这样的话就可以直接进行点对点连接。但实际上出于网络安全和 IPV4 地址不够的考虑，我们的电脑与电脑之间或大或小都是在某个局域网内，需要**NAT(Network Address Translation, 网络地址转换)**。在 WebRTC 中我们使用 ICE 机制建立网络连接。那么何为 ICE？

**ICE (Interactive Connecctivity Establishment, 交互式连接建立)**，ICE 不是一种协议，而是整合了 STUN 和 TURN 两种协议的框架。其中**STUN(Sesssion Traversal Utilities for NAT, NAT 会话穿越应用程序)**，它允许位于 NAT（或多重 NAT）后的客户端找出自己对应的公网 IP 地址和端口，也就是俗称的“打洞”。但是，如果 NAT 类型是对称型的话，那么就无法打洞成功。这时候 TURN 就派上用场了，**TURN**(Traversal USing Replays around NAT)是 STUN/RFC5389 的一个拓展协议在其基础上添加了 Replay(中继)功能，简单来说其目的就是解决对称 NAT 无法穿越的问题，在 STUN 分配公网 IP 失败后，可以通过 TURN 服务器请求公网 IP 地址作为中继地址。

在 WebRTC 中有三种类型的 ICE 候选者，它们分别是：

- 主机候选者
- 反射候选者
- 中继候选者

**主机候选者**，表示的是本地局域网内的 IP 地址及端口。它是三个候选者中优先级最高的，也就是说在 WebRTC 底层，首先会尝试本地局域网内建立连接。

**反射候选者**，表示的是获取 NAT 内主机的外网 IP 地址和端口。其优先级低于 主机候选者。也就是说当 WebRTC 尝试本地连接不通时，会尝试通过反射候选者获得的 IP 地址和端口进行连接。

**中继候选者**，表示的是中继服务器的 IP 地址与端口，即通过服务器中转媒体数据。当 WebRTC 客户端通信双方无法穿越 P2P NAT 时，为了保证双方可以正常通讯，此时只能通过服务器中转来保证服务质量了。

![网络传输](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/35f0234ac05940cda9929c2ee69fd2ea~tplv-k3u1fbpfcp-zoom-1.image)

从上图我们可以看出，在非本地局域网内 WebRTC 通过 STUN server 获得自己的外网 IP 和端口，然后通过信令服务器与远端的 WebRTC 交换网络信息。之后双方就可以尝试建立 P2P 连接了。当 NAT 穿越不成功时，则会通过 Relay server (TURN)中转。

值得一提的是，在 WebRTC 中网络信息通常用**candidate**来描述，而上述图中的 STUN server 和 Replay server 也都可以是同一个 server。在文末的实践章节即是采用了集成了 STUN(打洞)和 TURN(中继)功能的开源项目 coturn。

综上对三个问题的解释我们可以用下图来说明 WebRTC 点对点通信的基本原理：

![WebRTC signaling](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d0028c7d842141c686f7062bbaf7cbe6~tplv-k3u1fbpfcp-zoom-1.image)

简而言之就是通过 WebRTC 提供的 API 获取各端的媒体信息 SDP 以及 网络信息 candidate ，并通过信令服务器交换，进而建立了两端的连接通道完成实时视频语音通话。

## WebRTC 几个重要的 API

### 音视频采集 API

> [MediaDevices.getUserMedia()](https://developer.mozilla.org/zh-CN/docs/Web/API/MediaDevices/getUserMedia)

```js
const constraints = {
        video: true,
        audio: true
    
};
//   非安全模式（非https/localhost）下 navigator.mediaDevices 会返回 undefined
try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        document.querySelector('video').srcObject = stream;
    }   catch (error) {
        console.error(error);
    }
复制代码
```

### 获取音视频设备输入输出列表

> [MediaDevices.enumerateDevices()](https://developer.mozilla.org/zh-CN/docs/Web/API/MediaDevices/enumerateDevices)

```js
try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        this.videoinputs = devices.filter(device => device.kind === 'videoinput');
        this.audiooutputs = devices.filter(device => device.kind === 'audiooutput');
        this.audioinputs = devices.filter(device => device.kind === 'audioinput');
      } catch (error) {
        console.error(error);
      }
复制代码
```

### RTCPeerConnection

> RTCPeerConnection 作为创建点对点连接的 API,是我们实现音视频实时通信的关键。（[参考MDN 文档](https://developer.mozilla.org/zh-CN/docs/Web/API/RTCPeerConnection)）

在本文的实践章节中主要运用到 RTCPeerConnection 的以下方法：

#### 媒体协商方法

- createOffer
- createAnswer
- setLocalDesccription
- setRemoteDesccription

#### 重要事件

- onicecandidate
- onaddstream

在上个章节的描述中可以知道 P2P 通信中最重要的一个环节就是交换媒体信息

![媒体协商](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b2fd9992749d493c96b8e0b4d0cff044~tplv-k3u1fbpfcp-zoom-1.image)

从上图不难发现，整个媒体协商过程可以简化为三个步骤对应上述四个媒体协商方法：

- 呼叫端 Amy 创建 Offer(createOffer)并将 offer 消息（内容是呼叫端 Amy 的 SDP 信息）通过信令服务器传送给接收端 Bob,同时调用 setLocalDesccription 将含有本地 SDP 信息的 Offer 保存起来
- 接收端 Bob 收到对端的 Offer 信息后调用 setRemoteDesccription 方法将含有对端 SDP 信息的 Offer 保存起来，并创建 Answer(createAnswer)并将 Answer 消息（内容是接收端 Bob 的 SDP 信息）通过信令服务器传送给呼叫端 Amy
- 呼叫端 Amy 收到对端的 Answer 信息后调用 setRemoteDesccription 方法将含有对端 SDP 信息的 Answer 保存起来

经过上述三个步骤，则完成了 P2P 通信过程中的媒体协商部分，实际上在呼叫端以及接收端调用 setLocalDesccription 同时也开始了收集各端自己的网络信息(candidate)，然后各端通过监听事件 onicecandidate 收集到各自的 candidate 并通过信令服务器传送给对端，进而打通 P2P 通信的网络通道，并通过监听 onaddstream 事件拿到对方的视频流进而完成了整个视频通话过程。

## WebRTC 实践

### coturn 服务器的搭建

> 注意：如果只是本地局域网测试则无需搭建 coturn 服务器，如果需要外网访问在搭建 coturn 服务器之前你需要购买一台云主机以及绑定支持 https 访问的域名。以下是笔者自己搭建测试 WebRTC 的网站: [webrtc-demo](https://hartea.cn/)

coturn 服务器的搭建主要是为了解决 NAT 无法穿越的问题，其安装也较为简单：

```bash
1. git clone https://github.com/coturn/coturn.git
2. cd coturn/
3. ./configure --prefix=/usr/local/coturn
4. make -j 4
5. make install
// 生成 key
6. openssl req -x509 -newkey rsa:2048 -keyout /etc/turn_server_pkey.pem -out /etc/turn_server_cert.pem -days 99999 -nodes 
复制代码
```

### coturn 服务配置

```bash
vim /usr/local/coturn/etc/turnserver.conf

listening-port=3478
external-ip=xxx.xxx // 你的主机公网 IP
user=xxx:xxx // 账号: 密码
realm=xxx.com // 你的域名

复制代码
```

### 启动 coturn 服务

```bash
1. cd /usr/local/coturn/bin/

2. ./turnserver -c ../etc/turnserver.conf

// 注意：云主机内的 TCP 和 UDP 的 3478 端口都要开启
复制代码
```

### 实践代码

在编写代码之前，结合上述章节 WebRTC 点对点通信的基本原理，可以得出以下流程图：

![P2P 连接流程](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/89242eaf31074c1c88ad0ac91b093d2e~tplv-k3u1fbpfcp-zoom-1.image)

从图中不难看出，假设 PeerA 为发起方，PeerB 为接收方要实现 WebRTC 点对点的实时音视频通信，信令(Signal)服务器是必要的，以管理房间信息以及转发网络信息和媒体信息的，在本文中是利用 koa 及 socket.io 搭建的信令服务器：

```js
// server 端 server.js
const Koa = require('koa');
const socket = require('socket.io');
const http = require('http');
const app = new Koa();
const httpServer = http.createServer(app.callback()).listen(3000, ()=>{});
socket(httpServer).on('connection', (sock)=>{
    // ....
});

// client 端 socket.js
import io from 'socket.io-client';
const socket = io.connect(window.location.origin);
export default socket;
复制代码
```

在搭建好信令服务器后，结合流程图，有以下步骤：

1. PeerA 和 PeerB 端分别连接信令服务器，信令服务器记录房间信息

```js
// server 端 server.js
socket(httpServer).on('connection', (sock)=>{
    // 用户离开房间
    sock.on('userLeave',()=>{
        // ...
    });
    // 检查房间是否可加入
    sock.on('checkRoom',()=>{
        // ...
    });
    // ....
});
// client 端 Room.vue
import socket from '../utils/socket.js';

// 服务端告知用户是否可加入房间
socket.on('checkRoomSuccess',()=>{
        // ...
});
// 服务端告知用户成功加入房间
socket.on('joinRoomSuccess',()=>{
        // ...
});
//....

复制代码
```

1. A 端作为发起方向接收方 B 端发起视频邀请，在得到 B 同意视频请求后，双方都会创建本地的 RTCPeerConnection，添加本地视频流，其中发送方会创建 offer 设置本地 sdp 信息描述，并通过信令服务器将自己的 SDP 信息发送给对端

```js
socket.on('answerVideo', async (user) => {
        VIDEO_VIEW.showInvideoModal();
        // 创建本地视频流信息
        const localStream = await this.createLocalVideoStream();
        this.localStream = localStream;
        document.querySelector('#echat-local').srcObject = this.localStream;
        this.peer = new RTCPeerConnection();
        this.initPeerListen();
        this.peer.addStream(this.localStream);
        if (user.sockId === this.sockId) {
          // 接收方
        } else {
          // 发送方 创建 offer
          const offer = await this.peer.createOffer(this.offerOption);
          await this.peer.setLocalDescription(offer);
          socket.emit('receiveOffer', { user: this.user, offer });
        }
 });
复制代码
```

1. 前面提起过其实在调用 setLocalDescription 的同时，也会开始收集自己端的网络信息(candidate)，如果在非局域网内或者网络“打洞”不成功，还会尝试向 Stun/Turn 服务器发起请求，也就是收集“中继候选者”，因此在创建 RTCPeerConnection 我们还需要监听 ICE 网络候选者的事件：

```js
initPeerListen () {
      // 收集自己的网络信息并发送给对端
      this.peer.onicecandidate = (event) => {
        if (event.candidate) { socket.emit('addIceCandidate', { candidate: event.candidate, user: this.user }); }
      };
      // ....
    }
复制代码
```

1. 当接收方 B 端通过信令服务器拿到对端发送方 A 端的含有 SDP 的 offer 信息后则会调用 setRemoteDescription 存储对端的 SDP 信息，创建及设置本地的 SDP 信息,并通过信令服务器传送含有本地 SDP 信息的 answer

```js
socket.on('receiveOffer', async (offer) => {
        await this.peer.setRemoteDescription(offer);
        const answer = await this.peer.createAnswer();
        await this.peer.setLocalDescription(answer);
        socket.emit('receiveAnsewer', { answer, user: this.user });
 });
复制代码
```

1. 当发起方 A 通过信令服务器接收到接收方 B 的 answer 信息后则也会调用 setRemoteDescription，这样双方就完成了 SDP 信息的交换

```js
socket.on('receiveAnsewer', (answer) => {
        this.peer.setRemoteDescription(answer);
      });
复制代码
```

1. 当双方 SDP 信息交换完成并且监听 icecandidate 收集到网络候选者通过信令服务器交换后，则会拿到彼此的视频流。

```js
socket.on('addIceCandidate', async (candidate) => {
        await this.peer.addIceCandidate(candidate);
});
this.peer.onaddstream = (event) => {
        // 拿到对方的视频流
        document.querySelector('#remote-video').srcObject = event.stream;
};
复制代码
```

![发起视频](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/fc3dff05dd1c4af48802355d1822cc52~tplv-k3u1fbpfcp-zoom-1.image) ![接收视频](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/30501729562e4b2d92fa2d0b857744ed~tplv-k3u1fbpfcp-zoom-1.image) ![视频中](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0cc7a703d71e4a10b4759935f43d4665~tplv-k3u1fbpfcp-zoom-1.image)

## 总结

经过上个章节的6个步骤即可完成一次完整的 P2P 视频实时通话，代码可通过[learn-webrtc](https://gitee.com/sevenzyh/learn-webrtc)下载，值得一提的是，代码中的 VIDEO_VIEW 是专注于视频UI层的JS SDK，包含了发起视频 Modal、接收视频 Modal、视频中 Modal，其是从微医线上 Web 视频问诊所使用的 JS SDK 抽离出来的。本文只是简单地介绍了WebRTC P2P的通信基本原理，事实上生产环境所使用的 SDK 不仅支持点对点通信，还支持多人视频通话，屏幕共享等功能这些都是基于WebRTC实现的。

## 参考文章

- [WebRTC in the real world: STUN, TURN and signaling](https://www.html5rocks.com/en/tutorials/webrtc/infrastructure)
- [WebRTC 信令控制与 STUN/TURN 服务器搭建](https://juejin.im/post/6844903844904697864)
