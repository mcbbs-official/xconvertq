# XconvertQ.js

XconvertQ是使用nodejs重写的改进 [官方转换工具](https://discuz.com/docs/Discuzto.html) 效率的转换工具 

# Why

官方转换工具基本不具备转换中大型站点的能力

![xconvertq-php](doc/xconvertq-php.jpg)
 - 三百万用户转换耗时11小时
 - 67万主题，转换至6小时，进度83%时，耗尽测试环境主机内存(4GB)，PHP进程OOM崩溃

本工具转换速度是官方的十倍

![xconvertq.js](doc/xconvertq.js.png)
 - 三百万用户转换大约只需要一小时多

![thread](doc/xconvertq.js-thread.png)
 - 主题只需要不到半小时
 
![img.png](doc/xconvertq.js-post.png)
 - 回复转换使用多线程,1700万回复帖转换耗时一个半小时

## Tradeoff
- 由于异步并发插入，所以没法支持断点续传，如果出现错误，需要清空相关数据表重新导入

# 支持版本
源站： 
- DiscuzX3.5

目标站
- v2.3.210412
- v3.0.211104

以上版本为项目开发中使用的版本，如果有其他版本能成功，
可以在<https://github.com/mcbbs-official/xconvertq/discussions>中提出

如果有不成功的，可以携带错误日志和版本提交issue，如果能提供测试数据or环境更佳

# 安装
## 二进制
从 [Release](https://github.com/mcbbs-official/xconvertq/releases) 挑一个最新版本下载

## 源码
1. git clone
2. npm ci
3. npm run build
4. node dist/main.js

# 使用

## mysql 参数调整
由于使用了批量插入，若帖子内存在大量长贴，可能会导致超出mysql包大小限制，可以使用一下命令临时修改mysql包大小限制
```sql 
set global max_allowed_packet = 1073741824;
```
若没有mysql管理员权限，无法修改包大小限制，则需要降低批量大小 详见 `BATCH_SIZE`参数

~~即使`BATCH_SIZE=1`也比官方更快更省内存什么的~~

## 步骤
1. 首先按照 [官方步骤](https://discuz.com/docs/Discuzto.html) 的3、4、5，修改数据库和dzq文件并且安置附件
2. 执行./xconvertq convert
3. 按照官方步骤7修改rewrite，跳转旧链接

## 参数
## 栗子
见 [参数栗子](./.env.defaults)

## 设置参数
参数可以读取当前目录的.env文件，也可以使用环境变量传入

## 说明
|key|默认值|说明|
|---|---|---|
|X_MYSQL|-|DiscuzX的mysql连接串 mysql://user:pass@host/db
|X_PRE|-|DiscuzX的表前缀
|Q_MYSQL|-|DiscuzQ的mysql连接串
|Q_PRE|-|DiscuzQ的表前缀
|SKIP_ANONYMOUS|true|是否跳过DiscuzX的匿名贴转换，若保留匿名贴，则发帖用户会成为uid=1的用户，因为dzq不支持匿名贴
|BATCH_SIZE|1000|批量插入大小
|MAX_THREAD|0|转换帖子时使用的线程数量，为0使用所有核心
|CONVERT_MODE|html|转化模式，可选html或markdown

## 命令
###  转换所有
- convert
- convert all
### 部分转换
- convert user
- convert category
- convert attachment
- convert emoji
- convert thread
- convert post
- convert setting
