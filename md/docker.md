# 概念
Docker是一个开源的应用容器引擎,可以让开发者打包他们的应用以及依赖包到一个可移植的容器中,然后发布到任何流行的linux机器上.实现虚拟化.
docker三大核心: 镜像、容器、仓库
# 轻量级原因
Docker运行容器时,会在计算机上设置一个资源隔离的环境.然后将打包的应用程序和关联的文件复制到NameSpace内的文件系统中,此时环境的配置就完成了.之后Docker会执行设定的命令运行程序.
# 快速开始
1. 新建Dockerfile
2. 准备Nginx镜像
3. 创建nginx配置文件,
4. 配置dockerfile镜像
   ```
    FROM nginx // 基于nginx镜像苟江
    COPY dist/ /user/share/nginx/html/ 将项目dist文件夹中所有文件复制到镜像nginx指定目录下
    COPY default.conf /etc/nginx/conf.d/default.conf // 用本地配置替换nginx镜像默认配置
   ```
5. 构建镜像 Docker build -t jartto-docker-demo
6. 运行镜像
   docker run -d -p 3000:80 --name docker-vue jartto-docker-demo
