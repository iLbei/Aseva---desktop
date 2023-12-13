// 2020/7/1: 首个版本
// 2020/8/26: 支持v3
// 2020/11/6: 新增气压、相对湿度、能见度、风向、风速、PM10、道路状况、车道交通状况、灾害情况等字段。道路交通状况更名
// 2021/7/7: 新增envSampleProtocols

// 天气类型
var WeatherType = {
  Unknown: 0, // 未知
  Sunny: 1, // 晴
  Cloudy: 2, // 阴
  Rainy: 3, // 雨
  Snowy: 4, // 雪
  Foggy: 5, // 雾
  Sand: 6, // 沙尘
};

// 道路类型
var RoadType = {
  Unknown: 0, // 未知
  Highway: 1, // 高速路，无红绿灯，80~120KPH
  CityExpress: 2, // 城市快速路，无红绿灯，60~80KPH
  CityMain: 3, // 城市主干道，有红绿灯，推荐60KPH
  GeneralRoad: 4, // 一般道路，有红绿灯，推荐40KPH
  CountryRoad: 5, // 乡村道路，无红绿灯，~40KPH
};

// 场所类型
var SpotType = {
  Unknown: 0, // 未知
  TollGate: 1, // 收费站
  ServiceArea: 2, // 服务区
  Tunnel: 3, // 隧道
  Accident: 4, // 事故
  Crossing: 5, // 路口
  Roundabout: 7, // 环岛
  HighwayEntrance: 8, // 高速入口
  HighwayExit: 9, // 高速出口
  Bridge: 10, // 桥
  ExpressEntrance: 11, // 快速路入口
  ExpressExit: 12, // 快速路出口
};

// 场所信息构造函数
function Spot() {
  this.type = SpotType.Unknown; // 场所类型
  this.distance = 0; // 到场所的距离 m
}

// 交通状况
var TrafficStatus = {
  Unknown: 0, // 未知
  Open: 1, // 畅通
  Slow: 2, // 缓慢
  Crowded: 3, // 拥挤
  Reverse: 4, // 逆向（仅限相邻车道交通状况）
};

// 风向
var WindDirection = {
  Unknown: 0, // 未知
  East: 1, // 东风
  South: 2, // 南风
  West: 3, // 西风
  North: 4, // 北风
  SouthEast: 5, // 东南风
  NorthEast: 6, // 东北风
  SouthWest: 7, // 西南风
  NorthWest: 8, // 西北风
};

// 路面状况
var RoadSurfaceStatus = {
  Unknown: 0, // 未知
  Dry: 1, // 干燥
  Wet: 2, // 湿滑
  SnowCovered: 3, // 积雪
  Frozen: 4, // 结冰
};

// 灾害状况
var DisasterStatus = {
  Unknown: 0, // 未知
  No: 1, // 无灾害
  Yes: 2, // 有灾害
};

// 环境信息样本构造函数
function EnvSample(session, time) {
  this.session = session;
  this.time = time;
  this.weatherType = WeatherType.Unknown; // 天气类型
  this.temperature = null; // 温度 °C
  this.humidity = null; // 相对湿度 %
  this.pressure = null; // 气压 mb
  this.pm25 = null; // PM 2.5 ug/m³
  this.pm10 = null; // ug/m
  this.visibility = null; // 能见度 KM
  this.illumination = null; // 光照强度 lux
  this.windSpeed = null; // 风速 m/s
  this.windDirection = WindDirection.Unknown; // 风向
  this.typhoonStatus = DisasterStatus.Unknown; // 台风状况
  this.tornadoStatus = DisasterStatus.Unknown; // 龙卷风状况
  this.lightningStatus = DisasterStatus.Unknown; // 雷电状况
  this.hailStatus = DisasterStatus.Unknown; // 冰雹状况
  this.roadName = null; // 道路名称
  this.speedLimit = null; // 道路限速 KPH
  this.roadType = RoadType.Unknown; // 道路类型
  this.roadSurfaceStatus = RoadSurfaceStatus.Unknown; // 路面状况
  this.roadTraffic = TrafficStatus.Unknown; // 道路交通状况
  this.currentLaneTraffic = TrafficStatus.Unknown; // 本车道交通状况
  this.leftLaneTraffic = TrafficStatus.Unknown; // 左车道交通状况
  this.rightLaneTraffic = TrafficStatus.Unknown; // 右车道交通状况
  this.spots = []; // 场所列表
}

// 环境信息样本支持解析的协议
var envSampleProtocols = [
  "env-sample-v2",
  "env-sample-v3",
];

// 解析env-sample-v2协议
function convEnvSampleV2(gs) {
  if (gs.values.length < 2) return null;

  var roadNameSize = gs.values[0] == null ? 0 : gs.values[0];
  var spotCount = gs.values[1] == null ? 0 : gs.values[1];
  if (gs.values.length != 10 + 2 * spotCount + roadNameSize) return null;

  var sample = new EnvSample(gs.session, gs.time);
  if (gs.values[2] != null) sample.weatherType = gs.values[2];
  sample.temperature = gs.values[3];
  sample.pm25 = gs.values[4];
  sample.speedLimit = gs.values[5];
  if (gs.values[6] != null) sample.roadType = gs.values[6];
  sample.illumination = gs.values[7];
  sample.windSpeed = gs.values[8];
  if (gs.values[9] != null) sample.roadTraffic = gs.values[9];

  for (var i = 0; i < spotCount; i++) {
    if (gs.values[10 + 2 * i] == null || gs.values[11 + 2 * i] == null) continue;
    var spot = new Spot();
    spot.type = gs.values[10 + 2 * i];
    spot.distance = gs.values[11 + 2 * i];
    sample.spots.push(spot);
  }

  if (roadNameSize > 0) {
    var roadName = '';
    var roadNameBase = 10 + 2 * spotCount;
    for (var i = 0; i < roadNameSize; i++) {
      var code = gs.values[roadNameBase + i];
      if ((240 & code) == 240) {
        var code1 = gs.values[roadNameBase + i + 1],
          code2 = gs.values[roadNameBase + i + 2],
          code3 = gs.values[roadNameBase + i + 3];
        roadName += String.fromCodePoint(((code & 7) << 18) | ((code1 & 63) << 12) | ((code2 & 63) << 6) | (code3 & 63));
        i += 3;
      } else if ((224 & code) == 224) {
        var code1 = gs.values[roadNameBase + i + 1],
          code2 = gs.values[roadNameBase + i + 2];
        roadName += String.fromCodePoint(((code & 15) << 12) | ((code1 & 63) << 6) | (code2 & 63));
        i += 2;
      } else if ((192 & code) == 192) {
        var code1 = gs.values[roadNameBase + i + 1];
        roadName += String.fromCodePoint(((code & 31) << 6) | (code1 & 63));
        i++;
      } else if ((128 & code) == 0) {
        roadName += String.fromCharCode(code);
      }
    }
    sample.roadName = roadName;
  }

  return sample;
}

// 解析env-sample-v3协议
function convEnvSampleV3(gs) {
  if (gs.values.length < 2) return null;

  var roadNameSize = gs.values[0] == null ? 0 : gs.values[0];
  var spotCount = gs.values[1] == null ? 0 : gs.values[1];
  if (gs.values.length != 64 + 2 * spotCount + roadNameSize) return null;

  var sample = new EnvSample(gs.session, gs.time);
  if (gs.values[2] != null) sample.weatherType = gs.values[2];
  sample.temperature = gs.values[3];
  sample.pm25 = gs.values[4];
  sample.speedLimit = gs.values[5];
  if (gs.values[6] != null) sample.roadType = gs.values[6];
  sample.illumination = gs.values[7];
  sample.windSpeed = gs.values[8];
  if (gs.values[9] != null) sample.roadTraffic = gs.values[9];

  sample.pressure = gs.values[11];
  sample.humidity = gs.values[12];
  sample.visibility = gs.values[13];
  if (gs.values[14] != null) sample.windDirection = gs.values[14];
  sample.pm10 = gs.values[15];
  if (gs.values[16] != null) sample.roadSurfaceStatus = gs.values[16];
  if (gs.values[17] != null) sample.currentLaneTraffic = gs.values[17];
  if (gs.values[18] != null) sample.leftLaneTraffic = gs.values[18];
  if (gs.values[19] != null) sample.rightLaneTraffic = gs.values[19];
  if (gs.values[20] != null) sample.typhoonStatus = gs.values[20];
  if (gs.values[21] != null) sample.tornadoStatus = gs.values[21];
  if (gs.values[22] != null) sample.lightningStatus = gs.values[22];
  if (gs.values[23] != null) sample.hailStatus = gs.values[23];

  for (var i = 0; i < spotCount; i++) {
    if (gs.values[64 + 2 * i] == null || gs.values[65 + 2 * i] == null) continue;
    var spot = new Spot();
    spot.type = gs.values[64 + 2 * i];
    spot.distance = gs.values[65 + 2 * i];
    sample.spots.push(spot);
  }

  if (gs.values[10] != null) {
    sample.roadName = gs.values[10];
  } else if (roadNameSize > 0) {
    var roadName = '';
    var roadNameBase = 64 + 2 * spotCount;
    for (var i = 0; i < roadNameSize; i++) {
      var code = gs.values[roadNameBase + i];
      if ((240 & code) == 240) {
        var code1 = gs.values[roadNameBase + i + 1],
          code2 = gs.values[roadNameBase + i + 2],
          code3 = gs.values[roadNameBase + i + 3];
        roadName += String.fromCodePoint(((code & 7) << 18) | ((code1 & 63) << 12) | ((code2 & 63) << 6) | (code3 & 63));
        i += 3;
      } else if ((224 & code) == 224) {
        var code1 = gs.values[roadNameBase + i + 1],
          code2 = gs.values[roadNameBase + i + 2];
        roadName += String.fromCodePoint(((code & 15) << 12) | ((code1 & 63) << 6) | (code2 & 63));
        i += 2;
      } else if ((192 & code) == 192) {
        var code1 = gs.values[roadNameBase + i + 1];
        roadName += String.fromCodePoint(((code & 31) << 6) | (code1 & 63));
        i++;
      } else if ((128 & code) == 0) {
        roadName += String.fromCharCode(code);
      }
    }
    sample.roadName = roadName;
  }

  return sample;
}

// 获取指定session指定时刻最近的环境信息样本
function getEnvSample(session, time) {
  if (session !== null && time && time > 0) {
    var pairV3 = biGetGeneralSamplePair('env-sample-v3', null, session, time, 1);
    var pairV2 = biGetGeneralSamplePair('env-sample-v2', null, session, time, 1);
    if (pairV3 != null) {
      return pairV3.weight1 > pairV3.weight2 ? convEnvSampleV3(pairV3.sample1) : convEnvSampleV3(pairV3.sample2);
    } else if (pairV2 != null) {
      return pairV2.weight1 > pairV2.weight2 ? convEnvSampleV2(pairV2.sample1) : convEnvSampleV2(pairV2.sample2);
    } else return null;
  }
}