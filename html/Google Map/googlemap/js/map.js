// 2023/10/16 v1.0.0 首个版本
//  2023/10/20 v1.0.1 1.光照度添加单位;2.地图支持解锁锚点后进行拖动;3.解决无效打印；4.画线问题;5.卫星地图问题
//  2023/11/7  v1.0.2 修复画线问题
var map;
var channel = 0;
var PI = 3.1415926535897932384626;
var a = 6378245.0;
var ee = 0.00669342162296594323;
//地图类型
function initialize() {
  var mapOpt = {
    zoom: 4,
    center: { lat: 40, lng: 105 },//默认打开定位中国,
    mapId: "79e8a7dcd8d907a3",
    mapTypeId: google.maps.MapTypeId.ROADMAP,//地图显示类型：ROADMAP矢量图; SATELLITE卫星图
    navigationControl: false,//不显示地图控件
    scaleControl: false,//不显示地图控件
    mapTypeControl: false,//不显示地图控件
    disableDefaultUI: true,//禁用默认 UI 控件,没有缩放控件或街景视图图标
  };
  nowZoom = mapOpt.zoom;
  map = new google.maps.Map(document.getElementById("allmap0"), mapOpt);
}

//开启google
window.onload = function () {
  $('#map>.top_operation>ul:nth-of-type(1)>li:eq(' + 0 + ')').css('background-color', "rgb(255,255,255)").css('border', '1px solid #657fff').siblings().css("background-color", "#808080").css('border', '1px solid #808080');
  //初始化地图
  initialize();
  //界面首次打开，默认矢量地图，禁止拖拽与车辆信息选中
  toolStripOnlineMap(document.getElementById("picture1"), map);
  toolStripLockToCenter(document.getElementById("picture4"), map);
  toolStripShowingGPSData(document.getElementById("picture5"));
  //谷歌地图选择
  $('#map>.top_operation>ul:nth-of-type(1)>li').click(function () {
    if ($(this).hasClass('green')) $(this).removeClass('green');
    channel = mapChannel($(this).find(".map_channel").text());
    $(this).css('background-color', "rgb(255,255,255)").css('border', '1px solid #657fff').siblings().css("background-color", "#808080").css('border', '1px solid #808080');
    clearEnv();//清除详细信息
  });
  //鼠标经过菜单栏，菜单栏图标加背景色
  $("#map>.top_operation>ul:nth-of-type(2)>li").on("mouseover", function (e) {
    $(this).find("div").addClass("pic-wrap");
  });
  $("#map>.top_operation>ul:nth-of-type(2)>li").on("mouseleave", function (e) {
    $(this).find("div").removeClass("pic-wrap");
  });
  $('.map_channel').mouseover(function () {
    $(this).next().show();
  }).mouseout(function () {
    $(this).next().hide();
  });
};

/*------------菜单栏------------*/
var nowZoom;
//矢量地图 ROADMAP
function toolStripOnlineMap(obj) {
  if ($(obj).css("border").substr($(obj).css("border").toString().indexOf("solid ") + 6) == "rgb(255, 255, 255)") {
    $(obj).css("border", "1px solid #657fff");
    $("#picture2").css("border", "1px solid rgb(255, 255, 255)");
    $("#picture3").css("border", "1px solid rgb(255, 255, 255)");
  }
  map.setMapTypeId(google.maps.MapTypeId.ROADMAP);//切换至矢量图
}

//卫星地图 SATELLITE
function toolStripSatelliteMap(obj) {
  if ($(obj).css("border").substr(($(obj).css("border").toString()).indexOf("solid ") + 6) == "rgb(255, 255, 255)") {
    $(obj).css("border", "1px solid #657fff");
    $("#picture1").css("border", "1px solid rgb(255, 255, 255)");
    $("#picture3").css("border", "1px solid rgb(255, 255, 255)");
  }
  map.setMapTypeId(google.maps.MapTypeId.SATELLITE);//切换至卫星图
}

var pantoFlag = false;//判断是否开启平滑移动地图，禁止拖拽时开启为true
//将地图锁定
function toolStripLockToCenter(obj) {
  if ($(obj).css("border").substr($(obj).css("border").toString().indexOf("solid ") + 6) == "rgb(255, 255, 255)") {
    pantoFlag = true;
    map.setOptions({ "gestureHandling": "none", "keyboardShortcuts": false });//禁止拖拽和箭头键的使用
    $(obj).css("border", "1px solid #657fff");
  } else {
    pantoFlag = false;
    map.setOptions({ "gestureHandling": "", "keyboardShortcuts": true });//启用拖拽和箭头键的使用
    $(obj).css("border", "1px solid rgb(255, 255, 255)");
  }
}

//显示车辆详细信息：gps数据..
function toolStripShowingGPSData(obj) {
  if ($(obj).css("border").substr(($(obj).css("border").toString()).indexOf("solid ") + 6) == "rgb(255, 255, 255)") {
    $('.location-road-info').css("display", "block");
    $('.altitude').css("display", "block");
    $('.weather').css("display", "block");
    $('.vehicle-info').css("display", "block");
    $('#allmap').removeClass("allmap");
    $(obj).css("border", "1px solid #657fff");
  } else {
    $('.location-road-info').css("display", "none");
    $('.altitude').css("display", "none");
    $('.weather').css("display", "none");
    $('.vehicle-info').css("display", "none");
    $('#allmap').addClass("allmap");
    $(obj).css("border", "1px solid rgb(255, 255, 255)");
  }
}

//放大
function toolStripZoomIn() {
  nowZoom = map.zoom;
  map.setZoom(nowZoom < 16 ? nowZoom + 1 : nowZoom);
}

//缩小
function toolStripZoomOut() {
  nowZoom = map.zoom;
  map.setZoom(nowZoom > 1 ? nowZoom - 1 : nowZoom);
}

//返回video通道
function mapChannel(channel) {
  var num = -1;
  switch (channel) {
    case "A":
      num = 0;
      break;
    case "B":
      num = 1;
      break;
    case "C":
      num = 2;
      break;
    case "D":
      num = 3;
      break;
    case "E":
      num = 4;
      break;
    case "F":
      num = 5;
      break;
  }
  return num;
}

/*------------详细信息------------*/
var session;
var catchArr = [[], [], [], [], [], []];//每个通道对应的gnss样本数据
var channelArr = [false, false, false, false, false, false];//通道是否可用
var protocols = ['gnssimu-sample-v7', 'gnssimu-sample-v6', 'gnssimu-sample-v5', 'gnssimu-sample-v4', 'env-sample-v2', 'env-sample-v3'];
//记录每个sample的纬经度---折线路径
var marker;//添加标记点，删除标记点时需要
var flightPath;//画线的点
var removeFlight = [];
var carMarker = [];
var carData = [];
var sessionTimeArr = [];

function biOnSetInterest(ses, time) {
  if (flightPath) flightPath.setMap(null);
  biListenGeneralSample(protocols, null);
  for (var i = 0; i < 6; i++) {
    biListenGeneralSample(protocols, i);
  }
  var sessionTime = ses.getTime();
  if (sessionTimeArr.length == 0) sessionTimeArr.push(sessionTime);
  var sampleLast = getGnssImuSample(channel, ses, time, false);
  for (var i = 0; i < catchArr.length; i++) {
    var catches = catchArr[i];
    var sample = getGnssImuSample(i, ses, time, false);
    if (sample != null && !findTime(catches, sample.time)) {
      channelArr[i] = true;
      if (sample.latitude != null && sample.longitude != null) {
        if (catches.length == 0 || sample.time > catches[catches.length - 1].time && sample.time - catches[catches.length - 1].time > 2) {
          catches.push(sample);
        }
      }
    }
  }
  if (session != undefined && session != sessionTime) {
    sessionTimeArr.push(sessionTime);
    sessionTimeArr = sessionTimeArr.filter(function (value, index, self) {
      return self.indexOf(value) === index;
    });
    for (var i = 0; i < catchArr.length; i++) {
      catchArr[i].length = 0;
    }
    carMarker.carmarkeridx = -1;
  }
  session = sessionTime;
  var g = setTimeout(() => {
    var sampleEnv = getEnvSample(ses, time);//获取指定session指定时刻最近的环境信息样本
    //当前管道数据的详细信息
    if (sampleEnv != null) {
      var roadName = "(Unknown road)";
      var pm25 = "---";
      var temperature = "---";
      var wind = "---";
      var illumination = "---";
      var speedLimit = "N.A";
      if (sampleEnv.roadName != null) {
        roadName = sampleEnv.roadName;
      }
      $("#road-name").text(roadName);
      $("#road-type").text(getRoadType(sampleEnv.roadType));
      var weather = getWeather(sampleEnv.weatherType, new Date(ses.getTime() + time * 1000));
      var traffic = getTraffic(sampleEnv.roadTraffic);
      $("#weather").attr("src", weather);
      $("#traffic").attr("src", traffic);
      if (sampleEnv.speedLimit != null) {
        speedLimit = sampleEnv.speedLimit;
      }
      $("#speedLimit").text(speedLimit);
      if (sampleEnv.pm25 != null) {
        pm25 = parseFloat(sampleEnv.pm25).toFixed(1);
      }
      if (sampleEnv.temperature != null) {
        temperature = parseFloat(sampleEnv.temperature).toFixed(1) + "&deg;C";
      }
      if (sampleEnv.windSpeed != null) {
        wind = parseFloat(sampleEnv.windSpeed).toFixed(1);
      }
      if (sampleEnv.illumination != null) {
        illumination = parseFloat(sampleEnv.illumination).toFixed(1);
      }
      $("#pm25").text(pm25);
      $("#timg").html(temperature);
      $("#wind").text(wind);
      $("#light").text(illumination + " lux");
      $('.temporary').remove();
      if (sampleEnv.spots != null && sampleEnv.spots.length > 0) {
        var spots = sampleEnv.spots.sort(compare("distance"));
        var types = [];
        $.each(spots, function (index, value) {
          if (types.indexOf(value.type) == -1) {
            types.push(value.type);
            var src = getSpotType(value.type);
            if (src != null) {
              var temporary = $("<div class='temporary'></div>");
              temporary.html("<img src=\"" + src + "\" width=\"41\" height=\"27\" alt=\"\"><span>" + parseInt(value.distance) + "m</span>");
              $('.weather').append(temporary);
            }
          }
        })
      }
    }
    //通道可用时变绿
    for (var i = 0; i < channelArr.length; i++) {
      if (i != channel && channelArr[i]) {
        if (!$('#map>.top_operation>ul:nth-of-type(1)>li:eq(' + i + ')').hasClass('green')) {
          $('#map>.top_operation>ul:nth-of-type(1)>li:eq(' + i + ')').addClass('green');
        }
      }
    }
    var arrSample = [],
      index = catchArr[channel].length == 0 ? 0 : binarySearch(catchArr[channel], time),
      index2 = -1;
    for (var n = 0; n < index; n++) {
      var point = catchArr[channel][n];
      if (n == 0) arrSample.push(point);//获取首个惯导样本数据
      var last = arrSample[arrSample.length - 1];//获取最后一个惯导样本数据
      if (Math.abs(point.latitude - last.latitude) > 0.00001 || Math.abs(point.longitude - last.longitude) > 0.00001) {
        arrSample.push(point);
      }
    }
    // arrSample.push(catchArr[channel][index]);
    for (var i = 0; i < arrSample.length; i++) {
      var sample = arrSample[i];
      if (sample == null) continue;
      var sessionTime = sample.session.getTime();
      if (sessionTime == session) {
        index2 = i;
        break;
      }
    }
    if (carMarker != undefined && carMarker.length > 0) carMarker.polyline.setPath([]);
    if (index2 != -1) {
      for (var k = index2; k < arrSample.length; k++) {
        var sample1 = arrSample[k];
        if (sample1 == null) continue;
        var longitude = sample1.longitude;
        var latitude = sample1.latitude;
        var cardataidx = -1;
        if (carData != undefined) {
          if (channel == carData.session_guid) { //数据已经存在
            cardataidx = carData.cardataidx;
            carData.newsession = false;
            carData.session_guid = channel;
            carData.hasgps = longitude != null;
          }
        }
        if (cardataidx == -1) {
          carData = {
            newsession: true,
            session_guid: channel,
            hasgps: longitude != null,
            datavalid: true,
            content: "",
            carmarkeridx: -1
          };
          cardataidx = 0;
        }
        var nowPoint = null;
        //当切换兴趣点时
        if (flightPath && carData.newsession) {
          flightPath.setMap(null);
          flightPath.setPath([]);
          flightPath = null;
          catchArr = [[], [], [], [], [], []];
          arrSample = [];
        }
        nowPoint = new google.maps.Point(longitude, latitude); //获得Google经纬度
        var carmarkeridx = -1;
        if (carMarker != undefined && carMarker.length > 0) {
          carmarkeridx = carMarker.carmarkeridx;
        }
        if (carData != undefined && !carData.newsession) {
          if (carmarkeridx == -1 && carData.hasgps) {
            var trip = [];
            var newPoint;//获取经过转为gcj或者wgs的坐标
            if (map.mapTypeId == "roadmap") {//矢量地图需要将gnss的坐标(wgs)转为国测局坐标
              newPoint = wgs84togcj02(nowPoint.x, nowPoint.y);
            } else if (map.mapTypeId == "satellite") {
              newPoint = [nowPoint.x, nowPoint.y];//卫星地图可以直接使用gnss的坐标(wgs)
            }
            var nowPoint1 = new google.maps.LatLng(newPoint[1], newPoint[0]);
            if (flightPath && flightPath !== undefined && flightPath.map != null) {
              trip = flightPath.getPath();
              trip.push(nowPoint1);//当前经纬度坐标
            } else {
              trip.push(nowPoint1);//当前经纬度坐标
              flightPath = new google.maps.Polyline({
                path: trip,//折线坐标，为数组
                strokeColor: "#0000FF",
                strokeOpacity: 0.8,
                strokeWeight: 2
              });//创建折线
              flightPath.setMap(map);//画折线
            }
            //标记中心点
            if (marker && marker.map) {
              marker.setPosition(nowPoint1);//仅首次添加标记,其他情况下改变标记位置就行,这样就不用再进行标记删除了
            } else {
              marker = new google.maps.Marker({//在地图里添加或删除标记用marker'
                position: nowPoint1,
                animation: google.maps.Animation.BOUNCE,//标记点弹跳
              });
              map.setZoom(16);//仅首次将地图放大为14
              marker.setMap(map);//在当前位置添加标记
            }
            if (pantoFlag) map.panTo(nowPoint1);//地图平滑的平移
            //将车辆id，对应marker，cardataidx，保存至web本地carMarkers
            carMarker = {
              id: channel,
              session_guid: channel,
              marker: marker,
              polyline: flightPath,
              carmarkeridx: cardataidx
            };
            carmarkeridx = 0;
          }
        }
      }
    }
    if (sampleLast != null) {
      var sample = sampleLast;
      var antennaAltitude = "---";
      var altitude = "---";
      var speed = "---";
      var ax = "---";
      var ay = "---";
      var heading = "---";
      var pitch = "---";
      var roll = "---";
      var yawRate = "---";
      var location = "";
      if (sample.locationMode != null) {
        location += getGnssImuLocationMode(sample.locationMode);
      }
      if (sample.longitude != null && sample.latitude != null) {
        location += "(" + gpsLongtitudeToString(sample.longitude) + "," + gpsLatitudeToString(sample.latitude) + ")";
      }
      $("#location").html(location).attr("title", location);
      if (sample.gnssTime != null) {
        var gnssTime = sample.gnssTime;
        var year = gnssTime.getFullYear();
        var month = gnssTime.getMonth() + 1 + "";
        month = month.length == 1 ? "0" + month : month;
        var date = gnssTime.getDate() + "";
        date = date.length == 1 ? "0" + date : date;
        var hour = gnssTime.getHours() + "";
        hour = hour.length == 1 ? "0" + hour : hour;
        var minute = gnssTime.getMinutes() + "";
        minute = minute.length == 1 ? "0" + minute : minute;
        var second = gnssTime.getSeconds() + "";
        second = second.length == 1 ? "0" + second : second;
        var milliseconds = gnssTime.getMilliseconds();
        var txt = year + "/" + month + "/" + date + " " + hour + ":" + minute + ":" + second + "+" + milliseconds + "ms UTC";
        $("#gnssTime").text(txt).attr("title", txt);
      } else {
        $("#gnssTime").text("(Unknown time)");
      }
      if (sample.antennaAltitude != null) {
        antennaAltitude = parseFloat(sample.antennaAltitude).toFixed(1) + "m";
      }
      if (sample.altitude != null) {
        altitude = parseFloat(sample.altitude).toFixed(1);
        $('.altitude>div:nth-of-type(1)').css("border-bottom", "solid " + parseFloat($('.altitude').css("height")) * (altitude / 5000) + "px yellow");
        altitude += "m";
      } else {
        $('.altitude>div:nth-of-type(1)').css("border-bottom", "unset");
      }
      if (sample.speed != null) {
        speed = parseFloat(sample.speed).toFixed(1) + "KPH";
      }
      if (sample.ax != null) {
        ax = parseFloat(sample.ax).toFixed(1);
      }
      if (sample.ay != null) {
        ay = parseFloat(sample.ay).toFixed(1);
      }
      if (sample.orientation != null) {
        heading = parseFloat(sample.orientation).toFixed(1);
        $('#head-img').css("transform", "rotate(" + (-heading) + "deg)");
        heading += "&deg;";
      } else {
        $('#head-img').css("transform", "rotate(0deg)");
      }
      if (sample.pitch != null) {
        pitch = parseFloat(sample.pitch).toFixed(1);
        $('#pitch-img').css("transform", "rotate(" + (pitch) + "deg)");
        pitch += "&deg;";
      } else {
        $('#pitch-img').css("transform", "rotate(0deg)");
      }
      if (sample.roll != null) {
        roll = parseFloat(sample.roll).toFixed(1);
        $('#roll-img').css("transform", "rotate(" + (roll) + "deg)");
        roll += "&deg;";
      } else {
        $('#roll-img').css("transform", "rotate(0deg)");
      }
      if (sample.yawRate != null) {
        yawRate = parseFloat(sample.yawRate).toFixed(1);
        if (yawRate >= 0) {
          $('.left-triangle').css("color", "rgb(0,128,0)");
          $('.right-triangle').css("color", "rgb(196,196,196)");
        } else {
          $('.left-triangle').css("color", "rgb(196,196,196)");
          $('.right-triangle').css("color", "rgb(0,128,0)");
        }
      } else {
        $('.left-triangle').css("color", "rgb(196,196,196)");
        $('.right-triangle').css("color", "rgb(196,196,196)");
      }
      $("#antennaAltitude").text(antennaAltitude);
      $("#altitude").text(altitude);
      $("#speed").text(speed);
      $("#ax").text(ax);
      $("#ay").text(ay);
      $("#heading").html(heading);
      $("#pitch").html(pitch);
      $("#roll").html(roll);
      $("#rate").text(yawRate);
    }
    clearTimeout(g);
  });
}

function findTime(arr, time) {
  var flag = false;
  for (var i = 0; i < arr.length; i++) {
    var sample = arr[i];
    if (sample.time == time) {
      flag = true;
      break;
    }
  }
  return flag;
}

/**
 * 经度转化
 * @param longitude
 * @returns {string}
 */
function gpsLongtitudeToString(longitude) {
  var lon = parseFloat(longitude).toFixed(6);
  if (longitude >= 0) {
    lon += "&deg;E";
  } else {
    lon += "&deg;W";
  }
  return lon;
}

/**
 * 纬度转化
 * @param latitude
 * @returns {string}
 */
function gpsLatitudeToString(latitude) {
  var lat = parseFloat(latitude).toFixed(6);
  if (latitude >= 0) {
    lat += "&deg;N";
  } else {
    lat += "&deg;S";
  }
  return lat;
}

function getSpotType(number) {
  var src = null;
  switch (number) {
    case 1:
      src = "googlemap/images/toll gate.png"; // 收费站
      break;
    case 2:
      src = "googlemap/images/service area.png"; // 服务区
      break;
    case 3:
      src = "googlemap/images/tunnel.png"; // 隧道
      break;
    case 4:
      src = "googlemap/images/accident.png"; // 事故
      break;
    case 5:
      src = "googlemap/images/crossing.png"; // 路口
      break;
    case 7:
      src = "googlemap/images/roundabout.png"; // 环岛
      break;
    case 8:
      src = "googlemap/images/highway entrance.png"; // 高速入口
      break;
    case 9:
      src = "googlemap/images/highway exit.png"; // 高速出口
      break;
    case 10:
      src = "googlemap/images/bridge.png"; // 桥
      break;
    case 11:
      src = "googlemap/images/express entrance.png"; // 快速路入口
      break;
    case 12:
      src = "googlemap/images/express exit.png"; // 快速路出口
      break;
    default:
      break;
  }
  return src;
}

function getRoadType(number) {
  var roadType = "(Unknown type)";
  switch (number) {
    case 1:
      roadType = "Highway";
      break;
    case 2:
      roadType = "City Express";
      break;
    case 3:
      roadType = "City Main";
      break;
    case 4:
      roadType = "General Road";
      break;
    case 5:
      roadType = "Country Road";
      break;
    default:
      break;
  }
  return roadType;
}

function getWeather(number, gnssTime) {
  var src = "googlemap/images/weather_unknown.png";
  switch (number) {
    case 1:
      if (gnssTime != null && (gnssTime.getHours() >= 23 || gnssTime.getHours() < 7)) {
        src = "googlemap/images/weather_sunny_night.png";
      } else {
        src = "googlemap/images/weather_sunny_day.png";
      }
      break;
    case 2:
      if (gnssTime != null && (gnssTime.getHours() >= 23 || gnssTime.getHours() < 7)) {
        src = "googlemap/images/weather_cloudy_night.png";
      } else {
        src = "googlemap/images/weather_cloudy_day.png";
      }
      break;
    case 3:
      if (gnssTime != null && (gnssTime.getHours() >= 23 || gnssTime.getHours() < 7)) {
        src = "googlemap/images/weather_rainy_night.png";
      } else {
        src = "googlemap/images/weather_rainy_day.png";
      }
      break;
    case 4:
      if (gnssTime != null && (gnssTime.getHours() >= 23 || gnssTime.getHours() < 7)) {
        src = "googlemap/images/weather_snowy_night.png";
      } else {
        src = "googlemap/images/weather_snowy_day.png";
      }
      break;
    case 5:
      if (gnssTime != null && (gnssTime.getHours() >= 23 || gnssTime.getHours() < 7)) {
        src = "googlemap/images/weather_foggy_night.png";
      } else {
        src = "googlemap/images/weather_foggy_day.png";
      }
      break;
    case 6:
      if (gnssTime != null && (gnssTime.getHours() >= 23 || gnssTime.getHours() < 7)) {
        src = "googlemap/images/weather_sandstorm_night.png";
      } else {
        src = "googlemap/images/weather_sandstorm_day.png";
      }
      break;
    default:
      break;
  }
  return src;
}

function getTraffic(number) {
  var src = "googlemap/images/traffic unknown.png";
  switch (number) {
    case 1:
      src = "googlemap/images/traffic open.png";
      break;
    case 2:
      src = "googlemap/images/traffic slow.png";
      break;
    case 3:
      src = "googlemap/images/traffic crowded.png";
      break;
    default:
      break;
  }
  return src;
}

//降序排序算法
function compare(property) {
  return function (a, b) {
    var value1 = a[property];
    var value2 = b[property];
    return value1 - value2;
  }
}

//计算地球上两点距离
function getDistance(lat1, lng1, lat2, lng2) {
  lat1 = lat1 || 0;
  lng1 = lng1 || 0;
  lat2 = lat2 || 0;
  lng2 = lng2 || 0;

  var rad1 = lat1 * Math.PI / 180.0;
  var rad2 = lat2 * Math.PI / 180.0;
  var a = rad1 - rad2;
  var b = lng1 * Math.PI / 180.0 - lng2 * Math.PI / 180.0;
  var r = 6378137;
  var distance = r * 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) + Math.cos(rad1) * Math.cos(rad2) * Math.pow(Math.sin(b / 2), 2)));
  return distance;
}

function getGnssImuLocationMode(number) {
  var locationMode = "(Unknown location)";
  switch (number) {
    case 1:
      locationMode = "Normal";
      break;
    case 2:
      locationMode = "RTKFixed";
      break;
    case 3:
      locationMode = "RTKFloat";
      break;
    case 4:
      locationMode = "RTD";
      break;
    case 5:
      locationMode = "IMUOnly";
      break;
    case 6:
      locationMode = "Modified";
      break;
    default:
      break;
  }
  return locationMode;
}

/**
 * 二分法查找最近点
 * @param {*} arr 
 * @param {*} num 
 * @returns 
 */
function binarySearch(arr, num) {
  var left = 0;
  var right = arr.length - 1;
  while (left <= right) {
    var middle = Math.floor((right + left) / 2);
    if (right - left <= 1) {
      break;
    }
    var val = arr[middle].time;
    if (val === num) {
      return middle;
    } else if (val > num) {
      right = middle;
    } else {
      left = middle;
    }
  }
  var leftValue = arr[left].time;
  var rightValue = arr[right].time;
  return rightValue - num > num - leftValue ? left : right;
}

//每次重新回放会重置数据
function biOnStartSession() {
  for (var i = 0; i < 6; i++) {
    $('#map>.top_operation>ul:nth-of-type(1)>li:eq(' + i + ')').removeClass('green');
  }
  channelArr = [false, false, false, false, false, false];
  catchArr = [[], [], [], [], [], []];
  session = undefined;
  carData = undefined;
  removeFlight.push(marker);
  for (let i in removeFlight) {
    if (removeFlight[i]) removeFlight[i].setMap(null);
  }
  removeFlight = [];
  clearEnv();
}

function clearEnv() {
  $('.weather').append();
  $('.weather>div').each(function (i, v) {
    if (i >= 2) $(this).remove();
  });
  $("#weather").attr("src", "googlemap/images/weather_unknown.png");
  $("#traffic").attr("src", "googlemap/images/traffic unknown.png");
  $("#speedLimit").text("N.A");
  $("#pm25").text("---");
  $("#timg").html("---");
  $("#wind").text("---");
  $("#light").text("---");
  $('.temporary').remove();
  $('.altitude>div:nth-of-type(1)').css("border-bottom", "unset");
  $('#head-img').css("transform", "rotate(0deg)");
  $('#pitch-img').css("transform", "rotate(0deg)");
  $('#roll-img').css("transform", "rotate(0deg)");
  $('#location').html('(Unknown location)');
  $('#gnssTime').html('(Unknown time)');
  $('#road-name').html('(Unknown road)');
  $('#road-type').html('(Unknown type)');
  $('#head-img').css("transform", "rotate(0deg)");
  $('.left-triangle').css("color", "rgb(196,196,196)");
  $('.right-triangle').css("color", "rgb(196,196,196)");
  $("#antennaAltitude").text("---");
  $("#altitude").text("---");
  $("#speed").text("---");
  $("#ax").text("---");
  $("#ay").text("---");
  $("#heading").html("---");
  $("#pitch").html("---");
  $("#roll").html("---");
  $("#rate").text("---");
}

// 坐标转换  GCJ->WGS
function wgs84togcj02(lng, lat) {
  if (out_of_china(lng, lat)) {
    return [lng, lat]
  } else {
    var dlat = transformlat(lng - 105.0, lat - 35.0);
    var dlng = transformlng(lng - 105.0, lat - 35.0);
    var radlat = lat / 180.0 * PI;
    var magic = Math.sin(radlat);
    magic = 1 - ee * magic * magic;
    var sqrtmagic = Math.sqrt(magic);
    dlat = (dlat * 180.0) / ((a * (1 - ee)) / (magic * sqrtmagic) * PI);
    dlng = (dlng * 180.0) / (a / sqrtmagic * Math.cos(radlat) * PI);
    var mglat = lat + dlat;
    var mglng = lng + dlng;
    return [mglng, mglat]
  }
}

/**
 * 判断是否在国内，不在国内则不做偏移
 * @param lng
 * @param lat
 * @returns {boolean}
 */
function out_of_china(lng, lat) {
  return (lng < 72.004 || lng > 137.8347) || ((lat < 0.8293 || lat > 55.8271) || false);
}

function transformlat(lng, lat) {
  var ret = -100.0 + 2.0 * lng + 3.0 * lat + 0.2 * lat * lat + 0.1 * lng * lat + 0.2 * Math.sqrt(Math.abs(lng));
  ret += (20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0 / 3.0;
  ret += (20.0 * Math.sin(lat * PI) + 40.0 * Math.sin(lat / 3.0 * PI)) * 2.0 / 3.0;
  ret += (160.0 * Math.sin(lat / 12.0 * PI) + 320 * Math.sin(lat * PI / 30.0)) * 2.0 / 3.0;
  return ret
}

function transformlng(lng, lat) {
  var ret = 300.0 + lng + 2.0 * lat + 0.1 * lng * lng + 0.1 * lng * lat + 0.1 * Math.sqrt(Math.abs(lng));
  ret += (20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0 / 3.0;
  ret += (20.0 * Math.sin(lng * PI) + 40.0 * Math.sin(lng / 3.0 * PI)) * 2.0 / 3.0;
  ret += (150.0 * Math.sin(lng / 12.0 * PI) + 300.0 * Math.sin(lng / 30.0 * PI)) * 2.0 / 3.0;
  return ret
}