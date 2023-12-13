// 2020/6/18: 首个版本
// 2020/7/14: 修正解析v4无位置模式问题
// 2020/11/6: 增加卫星时间类型，新增gnssTimeUTC函数
// 2021/7/7: 新增gnssImuSampleProtocols
// 2021/12/2: 支持v7
// 2021/12/16: 增加横向误差和垂直误差

// 位置模式
var GnssImuLocationMode = {
  NoLocation: 0, // 无位置信息
  Normal: 1, // 默认模式
  RTKFixed: 2, // RTK固定解
  RTKFloat: 3, // RTK浮动解
  RTD: 4, // RTD
  IMUOnly: 5, // 仅惯导
  Modified: 6, // 后期修正
};

// 卫星时间类型
var GnssTimeType = {
  UTC: 0, // UTC时间
  GPS: 1, // GPS时间
};

// 组合惯导数据样本构造函数
function GnssImuSample(session, time) {
  this.session = session;
  this.time = time;
  this.locationMode = GnssImuLocationMode.NoLocation;  // 位置模式
  this.satelliteCount = null;  // 卫星数量
  this.longitude = null;  // 车前保中心地面经度 deg 东经为正
  this.latitude = null;  // 车前保中心地面纬度 deg 北纬为正
  this.altitude = null;  // 车前保中心地面海拔 m
  this.antennaLongitude = null;  // 天线位置经度 deg 东经为正
  this.antennaLatitude = null;  // 天线位置纬度 deg 北纬为正
  this.antennaAltitude = null;  // 天线位置海拔 m
  this.horizontalError = null; // 水平位置误差 m
  this.verticalError = null; // 垂直位置误差 m
  this.speed = null;  // 车速 kph
  this.orientation = null;  // 朝向 deg CCW为正, 北为0, -180~180
  this.pitch = null;  // 俯仰角 deg 车头朝下为正
  this.roll = null;  // 横滚角 deg 右侧朝下为正
  this.yawRate = null;  // 横摆角速度 deg/s CCW为正
  this.pitchRate = null;  // 俯仰角速度 deg/s 车头朝下为正
  this.rollRate = null;  // 横滚角速度 deg/s 右侧朝下为正
  this.ax = null;  // 纵向加速度 m/s2 朝前为正
  this.ay = null;  // 横向加速度 m/s2 朝左为正
  this.az = null;  // 天向加速度 m/s2 朝上为正
  this.slipAngle = null;  // 侧偏角 deg 左转时为正
  this.jerkX = null;  // 纵向急动度 m/s3 朝前为正
  this.jerkY = null;  // 横向急动度 m/s3 朝左为正
  this.arrivalTime = null;  // 数据到达时间戳（相对Session开始时间） 秒
  this.gnssTimeType = GnssTimeType.UTC; // 卫星时间类型
  this.gnssTime = null;  // 卫星时间
  this.gnssTimeUTC = function () { // 获取UTC卫星时间
    if (this.gnssTime != null) {
      if (this.gnssTimeType == GnssTimeType.UTC) return this.gnssTime;
      else if (this.gnssTimeType == GnssTimeType.GPS) {
        var utcms = this.gnssTime.getTime() - 18000;
        var utcTime = new Date()
        utcTime.setTime(utcms);
        return utcTime;
      }
    }
    return null;
  }
}

// 组合惯导数据样本支持解析的协议
var gnssImuSampleProtocols = [
  "gnssimu-sample-v4",
  "gnssimu-sample-v5",
  "gnssimu-sample-v6",
  "gnssimu-sample-v7",
];

// 解析gnssimu-sample-v4协议
function convGnssImuSampleV4(gs) {
  if (gs.values.length != 18) return null;

  var sample = new GnssImuSample(gs.session, gs.time);
  sample.longitude = gs.values[0];
  sample.latitude = gs.values[1];
  sample.antennaAltitude = gs.values[2];
  sample.speed = gs.values[3];
  sample.orientation = gs.values[4];
  sample.pitch = gs.values[5];
  sample.roll = gs.values[6];
  sample.yawRate = gs.values[7];
  sample.ax = gs.values[8];
  sample.ay = gs.values[9];
  sample.az = gs.values[10];

  sample.locationMode = sample.longitude != null && sample.latitude != null ? GnssImuLocationMode.Normal : GnssImuLocationMode.NoLocation;

  sample.arrivalTime = gs.time;
  if (gs.values[11] != null &&
    gs.values[12] != null &&
    gs.values[13] != null &&
    gs.values[14] != null &&
    gs.values[15] != null &&
    gs.values[16] != null &&
    gs.values[17] != null) {
    try {
      sample.gnssTime = new Date(gs.values[11], gs.values[12] - 1, gs.values[13], gs.values[14], gs.values[15], gs.values[16], gs.values[17]);
    }
    catch (err) { }
  }

  return sample;
}

// 解析gnssimu-sample-v5协议
function convGnssImuSampleV5(gs) {
  if (gs.values.length != 19) return null;

  var sample = new GnssImuSample(gs.session, gs.time);
  if (gs.values[0] != null) sample.locationMode = gs.values[0];
  sample.longitude = gs.values[1];
  sample.latitude = gs.values[2];
  sample.antennaAltitude = gs.values[3];
  sample.speed = gs.values[4];
  sample.orientation = gs.values[5];
  sample.pitch = gs.values[6];
  sample.roll = gs.values[7];
  sample.yawRate = gs.values[8];
  sample.ax = gs.values[9];
  sample.ay = gs.values[10];
  sample.az = gs.values[11];

  sample.arrivalTime = gs.time;
  if (gs.values[12] != null &&
    gs.values[13] != null &&
    gs.values[14] != null &&
    gs.values[15] != null &&
    gs.values[16] != null &&
    gs.values[17] != null &&
    gs.values[18] != null) {
    try {
      sample.gnssTime = new Date(gs.values[12], gs.values[13] - 1, gs.values[14], gs.values[15], gs.values[16], gs.values[17], gs.values[18]);
    }
    catch (err) { }
  }

  return sample;
}

// 解析gnssimu-sample-v6协议
function convGnssImuSampleV6(gs) {
  if (gs.values.length != 28) return null;

  var sample = new GnssImuSample(gs.session, gs.time);
  if (gs.values[0] != null) sample.locationMode = gs.values[0];
  sample.longitude = gs.values[1];
  sample.latitude = gs.values[2];
  sample.altitude = gs.values[3];
  sample.speed = gs.values[4];
  sample.orientation = gs.values[5];
  sample.pitch = gs.values[6];
  sample.roll = gs.values[7];
  sample.yawRate = gs.values[8];
  sample.ax = gs.values[9];
  sample.ay = gs.values[10];
  sample.az = gs.values[11];
  sample.slipAngle = gs.values[12];
  sample.jerkX = gs.values[13];
  sample.jerkY = gs.values[14];
  sample.satelliteCount = gs.values[15];
  sample.antennaLongitude = gs.values[16];
  sample.antennaLatitude = gs.values[17];
  sample.antennaAltitude = gs.values[18];

  if (gs.values[19] != null) sample.gnssTimeType = gs.values[19];
  if (gs.values[20] != null) sample.arrivalTime = gs.values[20];
  if (gs.values[21] != null &&
    gs.values[22] != null &&
    gs.values[23] != null &&
    gs.values[24] != null &&
    gs.values[25] != null &&
    gs.values[26] != null &&
    gs.values[27] != null) {
    try {
      sample.gnssTime = new Date(gs.values[21], gs.values[22] - 1, gs.values[23], gs.values[24], gs.values[25], gs.values[26], gs.values[27]);
    }
    catch (err) { }
  }

  return sample;
}

// 解析gnssimu-sample-v7协议
function convGnssImuSampleV7(gs) {
  if (gs.values.length != 40) return null;

  var sample = new GnssImuSample(gs.session, gs.time);
  if (gs.values[0] != null) sample.locationMode = gs.values[0];
  sample.longitude = gs.values[1];
  sample.latitude = gs.values[2];
  sample.altitude = gs.values[3];
  sample.speed = gs.values[4];
  sample.orientation = gs.values[5];
  sample.pitch = gs.values[6];
  sample.roll = gs.values[7];
  sample.yawRate = gs.values[8];
  sample.ax = gs.values[9];
  sample.ay = gs.values[10];
  sample.az = gs.values[11];
  sample.slipAngle = gs.values[12];
  sample.jerkX = gs.values[13];
  sample.jerkY = gs.values[14];
  sample.satelliteCount = gs.values[15];
  sample.antennaLongitude = gs.values[16];
  sample.antennaLatitude = gs.values[17];
  sample.antennaAltitude = gs.values[18];

  if (gs.values[19] != null) sample.gnssTimeType = gs.values[19];
  if (gs.values[20] != null) sample.arrivalTime = gs.values[20];
  if (gs.values[21] != null &&
    gs.values[22] != null &&
    gs.values[23] != null &&
    gs.values[24] != null &&
    gs.values[25] != null &&
    gs.values[26] != null &&
    gs.values[27] != null) {
    try {
      sample.gnssTime = new Date(gs.values[21], gs.values[22] - 1, gs.values[23], gs.values[24], gs.values[25], gs.values[26], gs.values[27]);
    }
    catch (err) { }
  }

  sample.pitchRate = gs.values[28];
  sample.rollRate = gs.values[29];
  sample.horizontalError = gs.values[30];
  sample.verticalError = gs.values[31];

  return sample;
}

// 组合惯导数据样本插值
function interpolateGnssImuSample(session, time, s1, w1, s2, w2) {
  var sample = new GnssImuSample(session, time);
  if (s1.locationMode == s2.locationMode) {
    sample.locationMode = s1.locationMode;
    sample.longitude = s1.longitude == null || s2.longitude == null ? null : s1.longitude * w1 + s2.longitude * w2;
    sample.latitude = s1.latitude == null || s2.latitude == null ? null : s1.latitude * w1 + s2.latitude * w2;
    sample.altitude = s1.altitude == null || s2.altitude == null ? null : s1.altitude * w1 + s2.altitude * w2;
    sample.antennaLongitude = s1.antennaLongitude == null || s2.antennaLongitude == null ? null : s1.antennaLongitude * w1 + s2.antennaLongitude * w2;
    sample.antennaLatitude = s1.antennaLatitude == null || s2.antennaLatitude == null ? null : s1.antennaLatitude * w1 + s2.antennaLatitude * w2;
    sample.antennaAltitude = s1.antennaAltitude == null || s2.antennaAltitude == null ? null : s1.antennaAltitude * w1 + s2.antennaAltitude * w2;
  }
  else {
    sample.locationMode = w1 > w2 ? s1.locationMode : s2.locationMode;
    sample.longitude = w1 > w2 ? s1.longitude : s2.longitude;
    sample.latitude = w1 > w2 ? s1.latitude : s2.latitude;
    sample.altitude = w1 > w2 ? s1.altitude : s2.altitude;
    sample.antennaLongitude = w1 > w2 ? s1.antennaLongitude : s2.antennaLongitude;
    sample.antennaLatitude = w1 > w2 ? s1.antennaLatitude : s2.antennaLatitude;
    sample.antennaAltitude = w1 > w2 ? s1.antennaAltitude : s2.antennaAltitude;
  }
  sample.satelliteCount = w1 > w2 ? s1.satelliteCount : s2.satelliteCount;
  if (s1.orientation != null && s2.orientation != null) {
    var deg2rad = Math.PI / 180;
    var x1 = Math.cos(s1.orientation * deg2rad);
    var y1 = Math.sin(s1.orientation * deg2rad);
    var x2 = Math.cos(s2.orientation * deg2rad);
    var y2 = Math.sin(s2.orientation * deg2rad);
    var xo = x1 * w1 + x2 * w2;
    var yo = y1 * w1 + y2 * w2;
    if (xo != 0 || yo != 0) {
      sample.orientation = Math.atan2(yo, xo) / deg2rad;
    }
  }
  sample.pitch = s1.pitch == null || s2.pitch == null ? null : s1.pitch * w1 + s2.pitch * w2;
  sample.roll = s1.roll == null || s2.roll == null ? null : s1.roll * w1 + s2.roll * w2;
  sample.yawRate = s1.yawRate == null || s2.yawRate == null ? null : s1.yawRate * w1 + s2.yawRate * w2;
  sample.ax = s1.ax == null || s2.ax == null ? null : s1.ax * w1 + s2.ax * w2;
  sample.ay = s1.ay == null || s2.ay == null ? null : s1.ay * w1 + s2.ay * w2;
  sample.az = s1.az == null || s2.az == null ? null : s1.az * w1 + s2.az * w2;
  sample.slipAngle = s1.slipAngle == null || s2.slipAngle == null ? null : s1.slipAngle * w1 + s2.slipAngle * w2;
  sample.jerkX = s1.jerkX == null || s2.jerkX == null ? null : s1.jerkX * w1 + s2.jerkX * w2;
  sample.jerkY = s1.jerkY == null || s2.jerkY == null ? null : s1.jerkY * w1 + s2.jerkY * w2;
  sample.gnssTimeType = s1.gnssTimeType;
  sample.arrivalTime = s1.arrivalTime == null || s2.arrivalTime == null ? null : s1.arrivalTime * w1 + s2.arrivalTime * w2;
  if (s1.gnssTime != null && s2.gnssTime != null) {
    var diffMs = s2.gnssTime.getTime() - s1.gnssTime.getTime();
    var targetMs = s1.gnssTime.getTime() + Math.floor(diffMs * w1 / (w1 + w2));
    sample.gnssTime = new Date();
    sample.gnssTime.setTime(targetMs);
  }
  sample.pitchRate = s1.pitchRate == null || s2.pitchRate == null ? null : s1.pitchRate * w1 + s2.pitchRate * w2;
  sample.rollRate = s1.rollRate == null || s2.rollRate == null ? null : s1.rollRate * w1 + s2.rollRate * w2;
  sample.horizontalError = s1.horizontalError == null || s2.horizontalError == null ? null : s1.horizontalError * w1 + s2.horizontalError * w2;
  sample.verticalError = s1.verticalError == null || s2.verticalError == null ? null : s1.verticalError * w1 + s2.verticalError * w2;
  return sample;
}

// 获取指定session指定时刻的组合惯导数据样本，若interpolated为true则优先取插值帧，否则固定为最近帧
function getGnssImuSample(channel, session, time, interpolated) {
  var s1 = null, w1 = null, s2 = null, w2 = null;
  if (session !== null && time && time > 0) {
    var pairV7 = biGetGeneralSamplePair('gnssimu-sample-v7', channel, session, time, 1);
    var pairV6 = biGetGeneralSamplePair('gnssimu-sample-v6', channel, session, time, 1);
    var pairV5 = biGetGeneralSamplePair('gnssimu-sample-v5', channel, session, time, 1);
    var pairV4 = biGetGeneralSamplePair('gnssimu-sample-v4', channel, session, time, 1);
    if (pairV7 != null) {
      if (pairV7.sample1 != null) s1 = convGnssImuSampleV7(pairV7.sample1);
      if (pairV7.sample2 != null) s2 = convGnssImuSampleV7(pairV7.sample2);
      w1 = pairV7.weight1;
      w2 = pairV7.weight2;
    }
    else if (pairV6 != null) {
      if (pairV6.sample1 != null) s1 = convGnssImuSampleV6(pairV6.sample1);
      if (pairV6.sample2 != null) s2 = convGnssImuSampleV6(pairV6.sample2);
      w1 = pairV6.weight1;
      w2 = pairV6.weight2;
    }
    else if (pairV5 != null) {
      if (pairV5.sample1 != null) s1 = convGnssImuSampleV5(pairV5.sample1);
      if (pairV5.sample2 != null) s2 = convGnssImuSampleV5(pairV5.sample2);
      w1 = pairV5.weight1;
      w2 = pairV5.weight2;
    }
    else if (pairV4 != null) {
      if (pairV4.sample1 != null) s1 = convGnssImuSampleV4(pairV4.sample1);
      if (pairV4.sample2 != null) s2 = convGnssImuSampleV4(pairV4.sample2);
      w1 = pairV4.weight1;
      w2 = pairV4.weight2;
    }
    else return null;
    if (s1 == null || s2 == null) {
      return s1 == null ? s2 : s1;
    }
    if (interpolated) {
      return interpolateGnssImuSample(session, time, s1, w1, s2, w2);
    }
    else {
      return w1 > w2 ? s1 : s2;
    }
  }
}