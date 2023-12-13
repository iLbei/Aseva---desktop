// 2020/6/16: 首个版本
// 2020/8/21: 插件2.0支持。调用未实现的功能函数弹异常。标准化注释
// 2020/8/27: 插件2.1支持
// 2020/10/20: 插件2.3支持
// 2020/12/21: 插件2.4支持
// 2021/1/5: 插件2.5支持
// 2021/1/29: biSelectPath输入filter支持完整文件名过滤
// 2021/2/1: 插件2.6支持
// 2021/7/2: 插件4.0支持
// 2022/4/12: 插件4.4支持。部分函数直接返回默认值
// 2022/4/13: 修正BIVideoDeviceInfo, biQueryGlobalPath/Variable, biOnQueriedGlobalPath, biSetGlobalPath
// 2022/4/26: 新增BIWebEngine.WKWebView，BIPlatform.ClientMacOS
// 2022/7/29: 插件5.1支持
// 2022/8/16: 修正拼写
// 2022/8/22: 更新BIWebEngine注释
// 2022/9/13: 插件5.2支持
// 2022/9/16: 插件6.0支持，biSetViewSize弃用
// 2022/9/20: 插件6.1支持
// 2022/10/11: 增加BISystemStatus.FileRead/WriteThreadLoopTime
// 2022/12/15: 增加BIVideoDeviceInfoX和biOnQueriedVideoDevicesInfoX。扩充BIVideoCodec类型
// 2023/2/15: 增加VideoDataCodec.RAW16/Y16

// 枚举类型 //////////////////////////////////////////////////////////////////

/**
 * 语言
 * @enum
 */
var BILanguage = {
  English: 1, // 英文
  Chinese: 2, // 中文
}

/**
 * 运行平台
 * @enum
 */
var BIPlatform = {
  Web: 3, // Web端
  ClientWindows: 1, // Windows客户端
  ClientLinux: 2, // Linux客户端
  ClientMacOS: 4, // MacOS客户端
}

/**
 * Web引擎
 * @enum
 */
var BIWebEngine = {
  Any: 1, // 使用浏览器
  WebView2: 2, // WebView2引擎
  WebKit2: 3, // WebKit2引擎
  WebKit2Legacy: 4, // 已弃用，应使用 BIWebEngine.WebKit2
  WKWebView: 5, // 已弃用，应使用 BIWebEngine.WebKit2
}

/**
 * UI框架
 * @enum
 */
var BIUIBackend = {
  Web: 1, // 使用浏览器
  Unknown: 2, // 未知
  Winform: 3, // Windows Winform
  WPF: 4, // Windows WPF
  GtkX11: 5, // Linux Gtk X11
  GtkWayland: 6, // Linux Gtk Wayland
  MonoMac: 7, // MacOS MonoMac
}

/**
 * 运行模式 
 * @enum
 */
var BIRunningMode = {
  Offline: 1, // 离线模式（含回放模式）
  Online: 2, // 在线模式
}

/**
 * 选择路径类型 
 * @enum
 */
var BISelectPathType = {
  OpenFile: 1, // 用于打开文件
  CreateFile: 2, // 用于创建文件
  Directory: 3, // 用于获取文件夹路径
  MultipleFiles: 4, // 用于获取多个文件路径
}

/**
 * 独立任务运行结果 
 * @enum
 */
var BITaskResult = {
  RunOK: 1, // 运行成功
  RunFailed: 2, // 运行失败
  TaskTypeNotFound: 3, // 无法找到任务类型
  TaskInitFailed: 4, // 任务初始化失败
  NotIdle: 5, // 非空闲状态无法运行
}

/**
 * 清单信息等级 
 * @enum
 */
var BILogLevel = {
  Info: 1, // 消息
  Warning: 2, // 警告
  Error: 3, // 错误
}

/**
 * 总线通道类型
 * @enum
 */
var BIBusChannelType = {
  Invalid: 0, // 无效值
  Can: 1, // CAN
  CanFD: 2, // CAN-FD
  Lin: 3, // LIN
  Flexray: 4, // Flexray
  Ethernet: 5, // 以太网
}

/**
 * 视频编码类型
 * @enum
 */
var BIVideoCodec = {
  Invalid: 0, // 无效值
  MJPEG: 1, // MJPEG：有损编码，帧间独立
  H264: 2, // H.264：有损编码，帧间依赖
  YUV411: 3, // YUV411：无损编码，帧间独立，格式为每8像素(U0 Y0 V0 Y1 U4 Y2 V4 Y3 Y4 Y5 Y6 Y7)，每数值8bit
  YUV420: 4, // YUV420：无损编码，帧间独立，格式为每2x2像素(U V Y00 Y01 Y10 Y11)，每数值8bit
  H265: 5, // H.265：有损编码，帧间依赖
  YUV422: 6, // YUV422：无损编码，帧间独立，格式为每2像素(Y0 U Y1 V)，每数值8bit
  RAW: 7, // RAW：无损编码，帧间独立，格式为奇数行BG，偶数行GR，每数值8bit
  RAW12: 8, // RAW12：无损编码，帧间独立，格式为奇数行BG，偶数行GR，每数值12bit按小字序依次存储
  RAW14: 9, // RAW14：无损编码，帧间独立，格式为奇数行BG，偶数行GR，每数值14bit按小字序依次存储
  RAW16: 10, // RAW16：无损编码，帧间独立，格式为奇数行BG，偶数行GR，每数值16bit按大字序依次存储
  Y16: 11, // Y16：无损编码，帧间独立，每数值16bit按大字序依次存储
}

/**
 * 系统状态
 * @enum
 */
var BISystemStatus = {
  ActualReplaySpeed: 1, // 实际回放速度（倍速） 
  TargetReplaySpeed: 2, // 目标回放速度（倍速）   
  CurrentLoggerMessage: 3, // 最新清单消息
  DisplayLag: 4, // 显示延迟，单位毫秒
  ContinuousFileWriteQueue: 5, // 连续数据或缓存数据写入队列长度，单位秒
  EventFileWriteQueue: 6, // 事件数据写入队列长度，单位秒
  VideoProcessQueueCapacity: 7, // 视频处理队列长度限制
  VideoProcessQueue: 8, // 视频处理队列长度
  AudioVolume: 9, // 音量（倍数）
  CPUUsage: 10, // CPU使用率，单位百分比
  CPUUsageRatio: 11, // CPU使用率的乘数
  MemoryCapacity: 12, // 内存总容量，单位字节
  MemoryFree: 13, // 内存可用容量，单位字节
  MemoryWarningThreshold: 14, // 内存可用容量的警告阈值，单位字节
  MemoryErrorThreshold: 15, // 内存可用容量的最小阈值，单位字节
  StorageCapacity: 16, // 当前数据目录所在磁盘的总容量，单位字节
  StorageFree: 17, // 当前数据目录所在磁盘可用容量，单位字节
  StorageFreeHours: 18, // 根据当前数据目录所在磁盘可用容量预估的时长，单位小时
  StorageWarningThreshold: 19, // 当前数据目录所在磁盘可用容量的警告阈值，单位字节
  StorageErrorThreshold: 20, // 当前数据目录所在磁盘可用容量的最小阈值，单位字节
  WorkthreadHeartBeatTime: 21, // 最近一次基础线程心跳时间，格式为yyyyMMddHHmmss.fff
  WorkthreadCurrentLocation: 22, // 基础线程当前运行位置
  WorkthreadLoopTime: 23, // 基础线程循环平均运行时间（最近），单位毫秒
  ProcthreadHeartBeatTime: 24, // 最近一次处理线程心跳时间，格式为yyyyMMddHHmmss.fff
  ProcthreadCurrentLocation: 25, // 处理线程当前运行位置
  ProcthreadLoopTime: 26, // 处理线程循环平均运行时间（最近），单位毫秒
  MainthreadLoopTime: 27, // 主线程循环平均运行时间（最近），单位毫秒
  BusDataFlow: 28, // 总线数据流量，单位字节
  BusDeviceReadTime: 29, // 总线设备接收一帧数据的最大耗时，单位微秒
  VideoDataFlow: 30, // 视频数据流量，单位像素数
  VideoDeviceReadTime: 31, // 视频设备接收一帧数据的最大耗时，单位微秒
  StartSessionTime: 32, // 开始session耗时，单位毫秒
  StopSessionTime: 33, // 结束session耗时，单位毫秒
  ReplayNeck: 34, // 回放速度瓶颈
  FileReadThreadLoopTime: 35, // 文件读取线程循环平均运行时间（最近），单位毫秒
  FileWriteThreadLoopTime: 36, // 文件写入线程循环平均运行时间（最近），单位毫秒
}

/**
 * 原生模块类别
 * @enum
 */
var BINativeCategory = {
  Native: 1, // 一般原生模块
  Bus: 2, // 总线设备模块
  Video: 3, // 视频设备模块
  Device: 4, // 一般设备模块
  Processor: 5, // 数据处理模块
  File: 6, // 文件读写模块
}

/**
 * 总线协议状态
 * @enum
 */
var BIBusProtocolState = {
  OK: 1, // OK
  FileNotExist: 2, // 协议文件不存在
  MD5NotCorrect: 3, // 协议MD5不匹配
}

// 构造函数 //////////////////////////////////////////////////////////////////

/**
 * 二维尺寸构造函数
 * @constructor
 * @param {Number} width 宽度
 * @param {Number} height 高度
 */
function BISize(width, height) {
  this.width = width;
  this.height = height;
}

/**
 * 二维点构造函数
 * @constructor
 * @param {Number} x x轴坐标
 * @param {Number} y y轴坐标
 */
function BIPoint(x, y) {
  this.x = x;
  this.y = y;
}

/**
 * 通用样本构造函数
 * @constructor
 * @param {String} protocol 样本协议
 * @param {Number} channel 样本通道，可为null
 * @param {Date} session 所属session
 * @param {Number} time 在session中的相对时间戳，单位秒
 * @param {Array} values 可为Number及String类型的数组：样本值
 */
function BIGeneralSample(protocol, channel, session, time, values) {
  this.protocol = protocol;
  this.channel = channel;
  this.session = session;
  this.time = time;
  this.values = values;
}

/**
 * 通用样本对构造函数
 * @constructor
 * @param {BIGeneralSample} sample1 较早的最近样本
 * @param {Number} weight1 sample1的权重
 * @param {BIGeneralSample} sample2 较晚的最近样本
 * @param {Number} weight2 sample2的权重
 */
function BIGeneralSamplePair(sample1, weight1, sample2, weight2) {
  this.sample1 = sample1;
  this.weight1 = weight1;
  this.sample2 = sample2;
  this.weight2 = weight2;
}

/**
 * 总线报文信息构造函数
 * @constructor
 * @param {String} id 总线报文ID
 * @param {String} protocol 报文所属协议
 * @param {Number} idInProtocol 在协议中的ID
 * @param {String} name 报文名称
 */
function BIBusMessageInfo(id, protocol, idInProtocol, name) {
  this.id = id;
  this.protocol = protocol;
  this.idInProtocol = idInProtocol;
  this.name = name;
}

/**
 * 信号信息构造函数
 * @constructor
 * @param {String} id 信号ID
 * @param {String} category 信号所属大类
 * @param {String} typeID 信号所属小类ID
 * @param {String} typeName 信号小类名称
 * @param {String} signalName 信号名称
 */
function BISignalInfo(id, category, typeID, typeName, signalName) {
  this.id = id;
  this.category = category;
  this.typeID = typeID;
  this.typeName = typeName;
  this.signalName = signalName;
}

/**
 * 缓存范围构造函数
 * @constructor
 * @param {Date} lowerSession 缓存范围下限所属session
 * @param {Number} lowerTime 缓存范围下限在所属session中的时间
 * @param {Date} upperSession 缓存范围上限所属session
 * @param {Number} upperTime 缓存范围上限在所属session中的时间
 */
function BIBufferRangeX(lowerSession, lowerTime, upperSession, upperTime) {
  this.lowerSession = lowerSession;
  this.lowerTime = lowerTime;
  this.upperSession = upperSession;
  this.upperTime = upperTime;
}

/**
 * 音频设备信息
 * @constructor
 * @param {String} deviceID 设备ID
 * @param {String} deviceName 设备名称
 */
function BIAudioDeviceInfo(deviceID, deviceName) {
  this.deviceID = deviceID;
  this.deviceName = deviceName;
}

/**
 * 音频驱动信息
 * @constructor
 * @param {String} driverID 驱动ID
 * @param {String} driverName 驱动名称
 * @param {Array} recordDevices BIAudioDeviceInfo数组：音频采集设备列表
 * @param {Array} replayDevices BIAudioDeviceInfo数组：音频回放设备列表
 */
function BIAudioDriverInfo(driverID, driverName, recordDevices, replayDevices) {
  this.driverID = driverID;
  this.driverName = driverName;
  this.recordDevices = recordDevices;
  this.replayDevices = replayDevices;
}

/**
 * 总线设备信息
 * @constructor
 * @param {String} type 总线设备的原生模块类型ID
 * @param {String} serial 总线设备序列号
 * @param {Number} index 在该序列号设备中的通道序号
 * @param {String} description 设备信息描述
 * @param {Array} supportedTypes BIBusChannelType数组：支持的总线通道类型
 */
function BIBusDeviceInfo(type, serial, index, description, supportedTypes) {
  this.type = type;
  this.serial = serial;
  this.index = index;
  this.description = description;
  this.supportedTypes = supportedTypes;
}

/**
 * 视频输入模式
 * @constructor
 * @param {BIVideoCodec} codec 视频编码
 * @param {BISize} size 图像分辨率
 */
function BIVideoInputMode(codec, size) {
  this.codec = codec;
  this.size = size;
}

/**
 * 视频输出模式
 * @constructor
 * @param {BIVideoCodec} codec 视频编码
 * @param {BISize} size 图像分辨率
 */
function BIVideoOutputMode(codec, size) {
  this.codec = codec;
  this.size = size;
}

/**
 * 视频设备信息
 * @constructor
 * @param {String} type 视频设备的原生模块类型ID
 * @param {String} localID 在该类型下的设备ID
 * @param {String} description 设备信息描述
 * @param {Array} supportedModes BIVideoInputMode数组：支持的视频输入模式
 */
function BIVideoDeviceInfo(type, localID, description, supportedModes) {
  this.type = type;
  this.localID = localID;
  this.description = description;
  this.supportedModes = supportedModes;
}

/**
 * 视频设备信息(扩展)
 * @constructor
 * @param {String} type 视频设备的原生模块类型ID
 * @param {String} localID 在该类型下的设备ID
 * @param {String} description 设备信息描述
 * @param {Array} inputModes BIVideoInputMode数组：支持的视频输入模式
 * @param {Array} outputModes BIVideoOutputMode数组：支持的视频输出模式
 */
function BIVideoDeviceInfoX(type, localID, description, inputModes, outputModes) {
  this.type = type;
  this.localID = localID;
  this.description = description;
  this.inputModes = inputModes;
  this.outputModes = outputModes;
}

/**
 * 总线协议ID
 * @constructor
 * @param {String} fileName 文件名（全小写）
 * @param {String} md5 文件的MD5
 */
function BIBusProtocolID(fileName, md5) {
  this.fileName = fileName;
  this.md5 = md5;
}

/**
 * 总线协议信息
 * @constructor
 * @param {BIBusProtocolID} id 总线协议ID
 * @param {BIBusProtocolState} status 总线协议状态
 * @param {Number} channel 当前绑定总线通道，值为1～16,若未绑定则为0
 * @param {String} path 协议文件路径
 */
function BIBusProtocolInfo(id, status, channel, path) {
  this.id = id;
  this.status = status;
  this.channel = channel;
  this.path = path;
}

// 功能函数 //////////////////////////////////////////////////////////////////

function biUnimplemented(funcName) {}

function biDeprecated(funcName) {}

/**
 * 添加窗口至工作空间
 * @param {String} windowTypeID 窗口组件ID
 * @param {String} config 窗口配置
 * @param {Boolean} newWorkspaceIfNeeded 若空间不足是否在新工作空间中添加
 */
function biAddWindow(windowTypeID, config, newWorkspaceIfNeeded) {
  biUnimplemented("biAddWindow");
}

/**
 * 弹出对话框显示消息
 * @param {Any} msg 需要显示的消息
 * @param {String} title 对话框标题
 */
function biAlert(msg, title) {
  biUnimplemented("biAlert");
}

/**
 * 关闭当前子对话框
 * @param {String} result 子对话框的运行结果
 */
function biCloseChildDialog(result) {
  biUnimplemented("biCloseChildDialog");
}

/**
 * 打开对话框配置数据加密选项
 */
function biConfigDataEncryption() {
  biUnimplemented("biConfigDataEncryption");
}

/**
 * 弹出对话框请求用户确认，有结果后会回调biOnResultOfConfirm
 * @param {String} key 用于确定确认信息的标识符，与biOnResultOfConfirm的输入key一致
 * @param {Any} msg 需要显示的消息
 * @param {String} title 对话框标题
 */
function biConfirm(key, msg, title) {
  biUnimplemented("biConfirm");
}

/**
 * 删除文件夹
 * @param {String} path 删除文件夹路径
 * @param {Boolean} toRecycleBin 是否删除至回收站
 */
function biDirectoryDelete(path, toRecycleBin) {
  biUnimplemented("biDirectoryDelete");
}

/**
 * 创建文件夹
 * @param {String} path 创建文件夹路径
 */
function biDirectoryMake(path) {
  biUnimplemented("biDirectoryMake");
}

function biFileClose(handle) {
  biDeprecated("biFileClose");
}

function biFileCreate(path) {
  biDeprecated("biFileCreate");
  return null;
}

/**
 * 删除文件
 * @param {String} path 删除文件路径
 * @param {Boolean} toRecycleBin 是否删除至回收站
 */
function biFileDelete(path, toRecycleBin) {
  biUnimplemented("biFileDelete");
}

function biFileOpen(path) {
  biDeprecated("biFileOpen");
  return null;
}

function biFileReadLine(handle) {
  biDeprecated("biFileReadLine");
  return null;
}

function biFileWriteLine(handle, text) {
  biDeprecated("biFileWriteLine");
}

function biGetBufferRange() {
  biDeprecated("biGetBufferRange");
  return null;
}

/**
 * 获取当前缓存范围
 * @return {BIBufferRangeX} 缓存范围，若缓存为空返回null
 */
function biGetBufferRangeX() {
  biUnimplemented("biGetBufferRangeX");
  return null;
}

/**
 * 获取数据文件夹根路径
 * @return {String} 数据文件夹根路径，若未设置则返回null
 */
function biGetDataPath() {
  biUnimplemented("biGetDataPath");
  return null;
}

function biGetDirsInDirectory(path) {
  biDeprecated("biGetDirsInDirectory");
  return null;
}

function biGetFilesInDirectory(path) {
  biDeprecated("biGetFilesInDirectory");
  return null;
}

/**
 * 获取指定协议、通道、时间对应的通用样本对
 * @param {String} protocol 样本协议
 * @param {Number} channel 样本通道，可为null
 * @param {Date} session 所属session
 * @param {Number} time 在session中的相对时间戳，单位秒
 * @param {Number} maxGap 与前后帧间的最大时间差，单位秒
 * @return {BIGeneralSamplePair} 目标的通用样本对，若找不到有效数据则返回null
 */
function biGetGeneralSamplePair(protocol, channel, session, time, maxGap) {
  biUnimplemented("biGetGeneralSamplePair");
  return null;
}

function biGetGenerationPath(session, generationID) {
  biDeprecated("biGetGenerationPath");
  return null;
}

/**
 * 获取当前软件指定使用的语言
 * @return {BILanguage} 语言
 */
function biGetLanguage() {
  return BILanguage.English;
}

/**
 * 获取本地变量
 * @param {String} id 本地变量ID
 * @param {String} defaultValue 不存在时的默认值
 * @return {String} 本地变量值
 */
function biGetLocalVariable(id, defaultValue) {
  biUnimplemented("biGetLocalVariable");
  return null;
}

/**
 * 获取所有手动触发器通道的名称
 * @return {Array} String数组：手动触发器通道名称列表，长度未触发器通道个数
 */
function biGetManualTriggerNames() {
  biUnimplemented("biGetManualTriggerNames");
  return null;
}

/**
 * 获取指定类别的所有原生模块版本表
 * @param {BINativeCategory} category 原生模块类别
 * @returns {Object} String到String的映射：键为原生模块类型ID，值为版本
 */
function biGetNativeModuleVersions(category) {
  biUnimplemented("biGetNativeModuleVersions");
  return null;
}

/**
 * 获取运行当前脚本的平台
 * @return {BIPlatform} 运行平台
 */
function biGetPlatform() {
  return BIPlatform.Web;
}

/**
 * 获取当前的运行模式
 * @return {BIRunningMode} 运行模式
 */
function biGetRunningMode() {
  biUnimplemented("biGetRunningMode");
  return null;
}

function biGetSessionPath(session) {
  biDeprecated("biGetSessionPath");
  return null;
}

/**
 * 获取子数据文件夹根路径列表
 * @return {Array} String数组：子数据文件夹根路径列表，未设置的部分为null
 */
function biGetSubDataPaths() {
  biUnimplemented("biGetSubDataPaths");
  return null;
}

/**
 * 获取系统状态信息
 * @param {BISystemStatus} status 系统状态类别
 * @returns {String} 系统状态信息
 */
function biGetSystemStatus(status) {
  biUnimplemented("biGetSystemStatus");
  return null;
}

/**
 * 获取当前运行的UI框架
 * @returns {BIUIBackend} UI框架
 */
function biGetUIBackend() {
  return BIUIBackend.Web;
}

/**
 * 获取运行当前脚本的Web引擎
 * @returns {BIWebEngine} Web引擎
 */
function biGetWebEngine() {
  return BIWebEngine.Any;
}

function biIsFileExist(path) {
  biDeprecated("biIsFileExist");
  return null;
}

function biIsDirectoryExist(path) {
  biDeprecated("biIsDirectoryExist");
  return null;
}

/**
 * 监听通用样本，随后可通过biGetGeneralSamplePair获取样本
 * @param {Array} protocols String数组：通用样本的协议（一般为多个，对应不同版本）
 * @param {Number} channel 样本通道，null表示无通道
 */
function biListenGeneralSample(protocols, channel) {
  biUnimplemented("biListenGeneralSample");
}

/**
 * 记录信息至清单
 * @param {String} msg 需要记录的信息
 * @param {BILogLevel} level 清单信息等级
 */
function biLog(msg, level) {
  biUnimplemented("biLog");
}

/**
 * 打开子对话框，子对话框将共享本地变量，关闭后会回调biOnClosedChildDialog
 * @param {String} htmlName HTML文件名
 * @param {String} title 对话框标题
 * @param {BISize} size 对话框面板大小
 * @param {String} config HTML对话框配置
 */
function biOpenChildDialog(htmlName, title, size, config) {
  biUnimplemented("biOpenChildDialog");
}

/**
 * 打开对话框
 * @param {String} dialogTypeID 对话框组件ID
 * @param {String} config 对话框配置
 */
function biOpenDialog(dialogTypeID, config) {
  biUnimplemented("biOpenDialog");
}

/**
 * 打开HTML对话框
 * @param {String} entryName HTML对话框入口名称（无需加.html）
 * @param {String} config HTML对话框配置
 */
function biOpenHTMLDialog(entryName, config) {
  biUnimplemented("biOpenHTMLDialog");
}

/**
 * 打印消息至Debugger
 * @param {Any} msg 打印的消息
 */
function biPrint(msg) {
  biUnimplemented("biPrint");
}

/**
 * 获取音频驱动信息列表，获取完毕后会调用biOnQueriedAudioDriversInfo
 */
function biQueryAudioDriversInfo() {
  biUnimplemented("biQueryAudioDriversInfo");
}

/**
 * 获取总线设备信息列表，获取完毕后会调用biOnQueriedBusDevicesInfo
 */
function biQueryBusDevicesInfo() {
  biUnimplemented("biQueryBusDevicesInfo");
}

/**
 * 获取总线报文信息，获取完毕后会回调biOnQueriedBusMessageInfo
 * @param {String} key 用于确定获取报文的标识符，与biOnQueriedBusMessageInfo的输入key一致
 * @param {String} busMessageID 总线报文ID
 */
function biQueryBusMessageInfo(key, busMessageID) {
  biUnimplemented("biQueryBusMessageInfo");
}

/**
 * 获取总线协议文件绑定的通道，获取完毕后会回调biOnQueriedBusProtocolFileChannel
 * （建议使用biQueryBusProtocolInfo）
 * @param {String} busProtocolFileName 总线协议文件名（全小写）
 */
function biQueryBusProtocolFileChannel(busProtocolFileName) {
  biUnimplemented("biQueryBusProtocolFileChannel");
}

/**
 * 获取总线协议信息，获取完毕后会回调biOnQueriedBusProtocolInfo
 * @param {String} key 用于确定获取总线协议的标识符，与biOnQueriedBusProtocolInfo的输入key一致
 * @param {BIBusProtocolID} busProtocolID 总线协议ID
 */
function biQueryBusProtocolInfo(key, busProtocolID) {
  biUnimplemented("biQueryBusProtocolInfo");
}

/**
 * 获取指定协议下指定数目的所有通道名称，获取完毕后会回调biOnQueriedChannelNames
 * @param {String} key 用于确定获取通道协议的标识符，与biOnQueriedChannelNames的输入key一致
 * @param {String} protocol 协议名，如"vehicle-sample-v4"，视频通道协议名为video
 * @param {Number} channelCount 需要获取的通道数目(有效范围1~64)，如4表示获取0~3(A~D)通道名称，输入null表示获取唯一通道名称
 */
function biQueryChannelNames(key, protocol, channelCount) {
  biUnimplemented("biQueryChannelNames");
}

/**
 * 获取指定文件夹是否存在，获取完毕后会回调biOnQueriedDirectoryExist
 * @param {String} path 文件夹路径
 */
function biQueryDirectoryExist(path) {
  biUm("biQueryDirectoryExist");
}

/**
 * 获取指定文件夹内的所有文件夹路径，获取完毕后会回调biOnQueriedDirsInDirectory
 * @param {String} path 文件夹路径
 */
function biQueryDirsInDirectory(path) {
  biUnimplemented("biQueryDirsInDirectory");
}

/**
 * 获取指定文件是否存在，获取完毕后会回调biOnQueriedFileExist
 * @param {String} path 文件路径
 */
function biQueryFileExist(path) {
  biUnimplemented("biQueryFileExist");
}

/**
 * 获取指定文件夹内的所有文件路径，获取完毕后会回调biOnQueriedFilesInDirectory
 * @param {String} path 文件夹路径
 */
function biQueryFilesInDirectory(path) {
  biUnimplemented("biQueryFilesInDirectory");
}

/**
 * 获取指定文件的所有文本内容，获取完毕后会回调biOnQueriedFileText
 * @param {String} path 文件路径
 */
function biQueryFileText(path) {
  biUnimplemented("biQueryFileText");
}

/**
 * 获取generation列表，获取完毕后会回调biOnQueriedGenerationList
 */
function biQueryGenerationList() {
  biUnimplemented("biQueryGenerationList");
}

/**
 * 获取指定session下指定generation的路径，获取完毕后会回调biOnQueriedGenerationPath
 * @param {Date} session 指定session
 * @param {String} generationID 指定generation的ID
 */
function biQueryGenerationPath(session, generationID) {
  biUnimplemented("biQueryGenerationPath");
}

/**
 * 获取全局参数，获取完毕后会回调biOnQueriedGlobalParameter
 * @param {String} id 全局参数ID
 * @param {String} defaultValue 不存在时的默认值
 */
function biQueryGlobalParameter(id, defaultValue) {
  biUnimplemented("biQueryGlobalParameter");
}

/**
* 获取全局路径，获取完毕后会回调biOnQueriedGlobalPath
* @param {String} id 全局路径ID

*/
function biQueryGlobalPath(id) {
  biUnimplemented("biQueryGlobalPath");
}

/**
 * 获取全局变量，获取完毕后会回调biOnQueriedGlobalVariable
 * @param {String} id 全局变量ID
 * @param {String} defaultValue 不存在时的默认值
 */
function biQueryGlobalVariable(id, defaultValue) {
  biUnimplemented("biQueryGlobalVariable");
}

/**
 * 获取session列表，获取完毕后会回调biOnQueriedSessionList
 * @param {Boolean} filtered 是否为筛选后的列表
 */
function biQuerySessionList(filtered) {
  biUnimplemented("biQuerySessionList");
}

/**
 * 获取指定session的路径，获取完毕后会回调biOnQueriedSessionPath
 * @param {Date} session 指定session
 */
function biQuerySessionPath(session) {
  biUnimplemented("biQuerySessionPath");
}

/**
 * 获取信号信息，获取完毕后会回调biOnQueriedSignalInfo
 * @param {String} key 用于确定获取信号的标识符，与biOnQueriedSignalInfo的输入key一致
 * @param {String} signalID 信号ID
 */
function biQuerySignalInfo(key, signalID) {
  biUnimplemented("biQuerySignalInfo");
}

/**
* 获取指定总线报文的信号列表，获取完毕后会回调biOnQueriedSignalsInBusMessage
* @param {String} key 用于确定获取信号列表的标识符，与biOnQueriedSignalsInBusMessage的输入key一致
* @param {String} busMessageID 总线报文ID

*/
function biQuerySignalsInBusMessage(key, busMessageID) {
  biUnimplemented("biQuerySignalsInBusMessage");
}

/**
 * 获取视频设备信息列表，获取完毕后会调用biOnQueriedVideoDevicesInfo
 */
function biQueryVideoDevicesInfo() {
  biUnimplemented("biQueryVideoDevicesInfo");
}

/**
 * 运行独立任务，运行后会回调biOnResultOfStandaloneTask
 * @param {String} key 用于确定运行任务的标识符，与biOnResultOfStandaloneTask的输入key一致
 * @param {String} taskTypeID 任务组件ID
 * @param {String} config 任务配置
 */
function biRunStandaloneTask(key, taskTypeID, config) {
  biUnimplemented("biRunStandaloneTask");
}

/**
 * 打开选择总线报文对话框，选择完毕后会回调biOnSelectedBusMessage
 * @param {String} key 用于确定选择报文的标识符，与biOnSelectedBusMessage的输入key一致
 * @param {String} originID 初始选择的总线报文ID
 */
function biSelectBusMessage(key, originID) {
  biUnimplemented("biSelectBusMessage");
}

/**
 * 打开选择总线协议对话框，选择完毕后会回调biOnSelectedBusProtocols
 * @param {String} key 用于确定选择总线协议的标识符，与biOnSelectedBusProtocols的输入key一致
 * @param {Array} selected BIBusProtocolID数组：已选择的总线协议
 */
function biSelectBusProtocols(key, selected) {
  biUnimplemented("biSelectBusProtocols");
}

/**
 * 打开对话框选择路径，选择完毕后会回调biOnSelectedPath(es)
 * @param {String} key 用于确定选择路径的标识符，与biOnSelectedPath(es)的输入key一致
 * @param {BISelectPathType} type 选择路径的类型，当类型为OpenFile/CreateFile/MultipleFiles时下述filter有效
 * @param {Object} filter String到String的映射：文件筛选，null表示不筛选；键为以'.'开头的全小写后缀或完整文件名，值为文字说明
 */
function biSelectPath(key, type, filter) {
  biUnimplemented("biSelectPath");
}

/**
 * 打开选择信号对话框，选择完毕后会回调biOnSelectedSignal
 * @param {String} key 用于确定选择信号的标识符，与biOnSelectedSignal的输入key一致
 * @param {String} originValueID 初始选择的值信号ID
 * @param {Boolean} withSignBit 是否需要选择符号位信号
 * @param {String} originSignBitID 初始选择的符号位信号ID，仅当withSignBit为true时有效
 * @param {Boolean} withScale 是否需要配置值系数
 * @param {Number} originScale 初始的值系数，仅当withScale为true时有效
 * @param {String} unit 值单位，仅当withScale为true时有效
 */
function biSelectSignal(key, originValueID, withSignBit, originSignBitID, withScale, originScale, unit) {
  biUnimplemented("biSelectSignal");
}

/**
 * 打开选择信号对话框，选择完毕后会回调biOnSelectedSignals
 * @param {String} key 用于确定选择信号的标识符，与biOnSelectedSignals的输入key一致
 * @param {Array} selected String数组：已选中的信号ID列表
 * @param {Number} availableCount 可新选中的信号个数
 */
function biSelectSignals(key, selected, availableCount) {
  biUnimplemented("biSelectSignals");
}

/**
 * 更新全局参数值
 * @param {String} id 全局参数ID，若为null或空字符串则不执行
 * @param {String} value 全局参数值，若为null则不执行
 */
function biSetGlobalParameter(id, value) {
  biUnimplemented("biSetGlobalParameter");
}

/**
 * 更新全局路径
 * @param {String} id 全局路径ID，若为null或空字符串则不执行
 * @param {Array} paths String数组：全局路径（可多个，仅设置路径存在的部分）
 */
function biSetGlobalPath(id, paths) {
  biUnimplemented("biSetGlobalPath");
}

/**
 * 更新全局变量值
 * @param {String} id 全局变量ID，若为null或空字符串则不执行
 * @param {String} value 全局变量值，若为null则不执行
 */
function biSetGlobalVariable(id, value) {
  biUnimplemented("biSetGlobalVariable");
}

/**
 * 更新本地变量值
 * @param {String} id 本地变量ID，若为null或空字符串则不执行
 * @param {String} value 本地变量值，若为null则不执行
 */
function biSetLocalVariable(id, value) {
  biUnimplemented("biSetLocalVariable");
}

/**
 * 更新指定ID模块的配置
 * @param {String} moduleClassID 需要更新的模块类别ID
 * @param {String} config 模块配置信息（在插件版本2.4以上，需要加密的文字段可用此格式包裹：[[SRC]]xxx[[SRC]]）
 */
function biSetModuleConfig(moduleClassID, config) {
  biUnimplemented("biSetModuleConfig");
}

/**
 * 更新当前页面的配置
 * @param {String} config 页面配置信息
 */
function biSetViewConfig(config) {
  biUnimplemented("biSetViewConfig");
}

function biSetViewSize(width, height) {
  biDeprecated("biSetViewSize");
}

/**
 * 开启进程运行
 * @param {String} target 需要运行的目标，如文件、文件夹、网页等
 */
function biStartProcess(target) {
  biUnimplemented("biStartProcess");
}

/**
 * 写入文本内容至指定路径的文件，若文件已存在则删除并重新写入
 * @param {String} path 文件路径
 * @param {String} text 文本内容
 */
function biWriteFileText(path, text) {
  biUnimplemented("biWriteFileText");
}

// 回调函数 //////////////////////////////////////////////////////////////////

/**
 * 在子对话框关闭后被调用
 * @param {String} htmlName 子对话框的HTML文件名
 * @param {String} result 子对话框的运行结果，用户点关闭按钮关闭时则为null
 */
function biOnClosedChildDialog(htmlName, result) {}

/**
 * 在初始化时被调用，与biOnInitEx二选一实现即可
 * @param {String} config 页面配置信息
 */
function biOnInit(config) {}

/**
 * 在初始化时被调用，与biOnInit二选一实现即可
 * @param {String} config 页面配置信息
 * @param {Object} moduleConfigs String到String的映射：关联模块的配置信息，键为模块类别ID，值为模块配置信息
 */
function biOnInitEx(config, moduleConfigs) {}

/**
 * 在调用biQueryAudioDriversInfo返回结果后被调用
 * @param {Array} driversInfo BIAudioDriverInfo数组：音频驱动信息列表
 */
function biOnQueriedAudioDriversInfo(driversInfo) {}

/**
 * 在调用biQueryBusDevicesInfo返回结果后被调用
 * @param {Array} devicesInfo BIBusDeviceInfo数组：总线设备信息列表
 */
function biOnQueriedBusDevicesInfo(devicesInfo) {}

/**
 * 在调用biQueryBusMessageInfo返回结果后被调用
 * @param {String} key 用于确定获取报文的标识符
 * @param {BIBusMessageInfo} busMessageInfo 获取的总线报文信息，若获取失败则为null
 */
function biOnQueriedBusMessageInfo(key, busMessageInfo) {}

/**
 * 在调用biQueryBusProtocolFileChannel返回结果后被调用
 * @param {String} busProtocolFileName 总线文件协议文件名（全小写）
 * @param {Number} busChannel 绑定的总线通道，范围为1~16，0表示未绑定
 */
function biOnQueriedBusProtocolFileChannel(busProtocolFileName, busChannel) {}

/**
 * 在调用biQueryBusProtocolInfo返回结果后被调用
 * @param {String} key 用于确定获取总线协议的标识符
 * @param {BIBusProtocolInfo} busProtocolInfo 总线协议信息
 */
function biOnQueriedBusProtocolInfo(key, busProtocolInfo) {}

/**
 * 在调用biQueryChannelNames返回结果后被调用
 * @param {String} key 用于确定获取通道协议的标识符
 * @param {Dictionary} channelNames String到String的映射：获取的通道名称信息，键为通道协议，值为通道名称（null表示该通道无效）
 */
function biOnQueriedChannelNames(key, channelNames) {}

/**
 * 在调用biQueryDirectoryExist返回结果后被调用
 * @param {Boolean} exist 文件夹是否存在
 * @param {String} path 文件夹路径
 */
function biOnQueriedDirectoryExist(exist, path) {}

/**
 * 在调用biQueryDirsInDirectory返回结果后被调用
 * @param {Array} dirs String数组：文件夹内的所有文件夹路径，若文件夹不存在则为null
 * @param {String} path 文件夹路径
 */
function biOnQueriedDirsInDirectory(dirs, path) {}

/**
 * 在调用biQueryFileExist返回结果后被调用
 * @param {Boolean} exist 文件是否存在
 * @param {String} path 文件路径
 */
function biOnQueriedFileExist(exist, path) {}

/**
 * 在调用biQueryFilesInDirectory返回结果后被调用
 * @param {Array} files String数组：文件夹内的所有文件路径，若文件夹不存在则为null
 * @param {String} path 文件夹路径
 */
function biOnQueriedFilesInDirectory(files, path) {}

/**
 * 在调用biQueryFileText返回结果后被调用
 * @param {String} text 文件中的所有文本内容，若文件不存在则为null
 * @param {String} path 文件路径
 */
function biOnQueriedFileText(text, path) {}

/**
 * 在调用biQueryGenerationList返回结果后被调用
 * @param {Array} list String数组：Generation ID列表
 */
function biOnQueriedGenerationList(list) {}

/**
 * 在调用biQueryGenerationPath返回结果后被调用
 * @param {String} path generation的根目录，若不存在则为null
 * @param {Date} session 指定session
 * @param {String} generationID 指定generation的ID
 */
function biOnQueriedGenerationPath(path, session, generationID) {}

/**
 * 在调用biQueryGlobalParameter返回结果后被调用
 * @param {String} id 全局参数ID
 * @param {String} value 全局参数值
 */
function biOnQueriedGlobalParameter(id, value) {}

/**
 * 在调用biQueryGlobalPath返回结果后被调用
 * @param {String} id 全局路径ID
 * @param {Array} paths String数组：全局路径（可多个，仅输入路径存在的部分）
 */
function biOnQueriedGlobalPath(id, paths) {}

/**
 * 在调用biQueryGlobalVariable返回结果后被调用
 * @param {String} id 全局变量ID
 * @param {String} value 全局变量值
 */
function biOnQueriedGlobalVariable(id, value) {}

/**
 * 在调用biQuerySessionList返回结果后被调用
 * @param {Array} list Date数组：Session列表
 * @param {Boolean} filtered 是否为筛选后的列表
 */
function biOnQueriedSessionList(list, filtered) {}

/**
 * 在调用biQuerySessionPath返回结果后被调用
 * @param {String} path session的根目录，若不存在则为null
 * @param {Date} session 指定session
 */
function biOnQueriedSessionPath(path, session) {}

/**
 * 在调用biQuerySignalInfo返回结果后被调用
 * @param {String} key 用于确定获取信号的标识符
 * @param {BISignalInfo} signalInfo 获取的信号信息，若获取失败则为null
 */
function biOnQueriedSignalInfo(key, signalInfo) {}

/**
 * 在调用biQuerySignalsInBusMessage返回结果后被调用
 * @param {String} key 用于确定获取信号列表的标识符
 * @param {Array} signalIDList String数组：信号ID列表，若获取失败则为null
 */
function biOnQueriedSignalsInBusMessage(key, signalIDList) {}

/**
 * 在调用biQueryVideoDevicesInfo返回结果后被调用
 * @param {Array} devicesInfo BIVideoDeviceInfo数组：视频设备信息列表
 */
function biOnQueriedVideoDevicesInfo(devicesInfo) {}

/**
 * 在调用biQueryVideoDevicesInfo返回结果后被调用
 * @param {Array} devicesInfo BIVideoDeviceInfoX数组：视频设备信息列表
 */
function biOnQueriedVideoDevicesInfoX(devicesInfo) {}

/**
 * 在调用biConfirm返回结果后被调用
 * @param {String} key 用于确定确认信息的标识符
 * @param {Boolean} result 确认结果
 */
function biOnResultOfConfirm(key, result) {}

/**
 * 在调用biRunStandaloneTask返回结果后被调用
 * @param {String} key 用于确定运行任务的标识符
 * @param {BITaskResult} result 任务运行结果
 * @param {String} returnValue 任务运行返回值
 */
function biOnResultOfStandaloneTask(key, result, returnValue) {}

/**
 * 在调用biSelectBusMessage返回结果后被调用
 * @param {String} key 用于确定选择报文的标识符
 * @param {BIBusMessageInfo} busMessageInfo 选择的总线报文信息，当在对话框中点击删除后则为null
 */
function biOnSelectedBusMessage(key, busMessageInfo) {}

/**
 * 在调用biSelectBusProtocols返回结果后被调用
 * @param {String} key 用于确定选择总线协议的标识符
 * @param {Array} busProtocols BIBusProtocolID数组：选择的总线协议ID列表
 */
function biOnSelectedBusProtocols(key, busProtocols) {}

/**
 * 在调用biSelectPath返回结果后被调用 (type为OpenFile/CreateFile/Directory时)
 * @param {String} key 用于确定选择路径的标识符
 * @param {String} path 选择的路径，若取消则为null
 */
function biOnSelectedPath(key, path) {}

/**
 * 在调用biSelectPath返回结果后被调用 (type为MultipleFiles时)
 * @param {String} key 用于确定选择路径的标识符
 * @param {Array} paths String数组：选择的路径列表，若取消则为null
 */
function biOnSelectedPathes(key, paths) {}

/**
 * 在调用biSelectSignal返回结果后被调用
 * @param {String} key 用于确定选择信号的标识符
 * @param {BISignalInfo} valueSignalInfo 选择的值信号信息，当在对话框中点击删除后则为null
 * @param {BISignalInfo} signBitSignalInfo 选择的符号位信号信息，当在对话框中点击删除后或withSignBit为false时为null
 * @param {Number} scale 配置的值系数，当在对话框中点击删除后或withScale为false时为null
 */
function biOnSelectedSignal(key, valueSignalInfo, signBitSignalInfo, scale) {}

/**
 * 在调用biSelectSignals返回结果后被调用
 * @param {String} key 用于确定选择信号的标识符
 * @param {Array} signalsInfo String数组：新选中的信号信息列表
 */
function biOnSelectedSignals(key, signalsInfo) {}

/**
 * 在设置兴趣点时间时被调用
 * @param {Date} session 兴趣点所在session
 * @param {Number} time 兴趣点在该session中的相对时间戳，单位秒
 */
function biOnSetInterest(session, time) {}

/**
 * 在开始session时被调用
 */
function biOnStartSession() {}

/**
 * 在结束session时被调用
 */
function biOnStopSession() {}