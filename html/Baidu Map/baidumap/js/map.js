var flagMap = false;
//圆周率
var pi = 3.14159265358979324;

//卫星椭球坐标投影到平面坐标系的投影因子
var a = 6378245.0;

//椭球的偏心率
var ee = 0.00669342162296594323;

//圆周率转换量
var x_pi = 3.14159265358979324 * 3000.0 / 180.0;

var arrTime = [undefined, undefined, undefined, undefined, undefined, undefined];
var catcheArr = [
  [],
  [],
  [],
  [],
  [],
  []
];
var channelArr = [false, false, false, false, false, false];
var arr = [0, 0, 0, 0, 0, 0];
window.onload = function () {
  $('#map>.top-operation>ul:nth-of-type(1)>li:eq(' + channel + ')').css('background-color', "rgb(255,255,255)").css('border', '1px solid #657fff').siblings().css("background-color", "#808080").css('border', '1px solid #808080');
  //初始化地图
  load_map();

  set_center_and_zoom(116.404, 39.915, 12);
  //开启操作
  enable_operations();
  //online
  toolStripOnlineMap(document.getElementById("picture1"));
  //lockToCenter
  toolStripLockToCenter(document.getElementById("picture4"));
  //初始化picture5选中
  toolStripShowingGPSData(document.getElementById("picture5"));
  //百度地图选择
  $('#map>.top-operation>ul:nth-of-type(1)>li').click(function () {
    if ($(this).hasClass('green')) $(this).removeClass('green');
    channel = mapChannel($(this).find(".map-channel").text());
    $(this).css('background-color', "rgb(255,255,255)").css('border', '1px solid #657fff').siblings().css("background-color", "#808080").css('border', '1px solid #808080');
    var cache = catcheArr[channel];
    if (cache.length == 0) {
      var allOverlay = map.getOverlays();
      for (var i = 0; i < allOverlay.length; i++) {
        if (allOverlay[i]["layerType"] == "pointType") {
          map.removeOverlay(allOverlay[i]);
        }
      }
    } else {
      if (carMarker == undefined) return
      var marker = carMarker.marker;
      marker["layerType"] = "pointType";
      map.addOverlay(marker); //添加marker
      marker.setAnimation(BMAP_ANIMATION_BOUNCE);
    }
  });

  $("#map>.top-operation>ul:nth-of-type(2)>li").on("mouseover", function (e) {
    $(this).find("div").addClass("pic-wrap");
  });

  $("#map>.top-operation>ul:nth-of-type(2)>li").on("mouseleave", function (e) {
    $(this).find("div").removeClass("pic-wrap");
  });
  // $('.allmap').on('mousewheel DOMMouseScroll', function(e) {
  //     e.preventDefault();
  //     if (!flagMap) return;
  //     var wheel = e.originalEvent.wheelDelta || -e.originalEvent.detail;
  //     var delta = Math.max(-1, Math.min(1, wheel));
  //     if (delta < 0) { //向下滚动
  //         zoom_out();
  //     } else { //向上滚动
  //         zoom_in();
  //     }
  // });
  $('.map-channel').mouseover(function () {
    $(this).next().show();
  }).mouseout(function () {
    $(this).next().hide();
  });
};

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
var carData, carMarker, index = -1;

/**
 * WGS坐标转百度坐标
 * @param lat 纬度
 * @param lon 经度
 * @return
 */
function wgs2bd(lat, lon) {
  var mid = wgs2gcj(lat, lon);
  return gcj2bd(mid[0], mid[1]);
}

/**
 *  GCJ坐标转百度坐标
 * @param lat 纬度
 * @param lon 经度
 * @return
 */
function gcj2bd(lat, lon) {
  var x = lon,
    y = lat;
  var z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * x_pi);
  var theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * x_pi);
  var bd_lon = z * Math.cos(theta) + 0.0065;
  var bd_lat = z * Math.sin(theta) + 0.006;
  return [bd_lat, bd_lon];
}

function transformLat(lat, lon) {
  var ret = -100.0 + 2.0 * lat + 3.0 * lon + 0.2 * lon * lon + 0.1 * lat * lon + 0.2 * Math.sqrt(Math.abs(lat));
  ret += (20.0 * Math.sin(6.0 * lat * pi) + 20.0 * Math.sin(2.0 * lat * pi)) * 2.0 / 3.0;
  ret += (20.0 * Math.sin(lon * pi) + 40.0 * Math.sin(lon / 3.0 * pi)) * 2.0 / 3.0;
  ret += (160.0 * Math.sin(lon / 12.0 * pi) + 320 * Math.sin(lon * pi / 30.0)) * 2.0 / 3.0;
  return ret;
}

/**
 * WGS坐标转GCJ坐标
 * @param lat 纬度
 * @param lon 经度
 * @return
 */
function wgs2gcj(lat, lon) {
  var dLat = transformLat(lon - 105.0, lat - 35.0);
  var dLon = transformLon(lon - 105.0, lat - 35.0);
  var radLat = lat / 180.0 * pi;
  var magic = Math.sin(radLat);
  magic = 1 - ee * magic * magic;
  var sqrtMagic = Math.sqrt(magic);
  dLat = (dLat * 180.0) / ((a * (1 - ee)) / (magic * sqrtMagic) * pi);
  dLon = (dLon * 180.0) / (a / sqrtMagic * Math.cos(radLat) * pi);
  var mgLat = lat + dLat;
  var mgLon = lon + dLon;
  var loc = [mgLat, mgLon];
  return loc;
}

function transformLon(lat, lon) {
  var ret = 300.0 + lat + 2.0 * lon + 0.1 * lat * lat + 0.1 * lat * lon + 0.1 * Math.sqrt(Math.abs(lat));
  ret += (20.0 * Math.sin(6.0 * lat * pi) + 20.0 * Math.sin(2.0 * lat * pi)) * 2.0 / 3.0;
  ret += (20.0 * Math.sin(lat * pi) + 40.0 * Math.sin(lat / 3.0 * pi)) * 2.0 / 3.0;
  ret += (150.0 * Math.sin(lat / 12.0 * pi) + 300.0 * Math.sin(lat / 30.0 * pi)) * 2.0 / 3.0;
  return ret;
}
//重置
function biOnStartSession() {
  reset();
}
var session, inTime = 0;
var sesssionTimeArr = [];
//重置数据
function reset() {
  for (var i = 0; i < 6; i++) {
    catcheArr[i] = [];
    $('#map>.top-operation>ul:nth-of-type(1)>li:eq(' + i + ')').removeClass('green');
  }
  channelArr = [false, false, false, false, false, false];
  try {
    map.clearOverlays();
  } catch (e) {
    // biPrint(map)
  }
  sesssionTimeArr = [];
  session = undefined;
  carMarker = undefined;
  carData = undefined;
  clearEnv();
}
var protocols = ['gnssimu-sample-v7', 'gnssimu-sample-v6', 'gnssimu-sample-v5', 'gnssimu-sample-v4', 'env-sample-v2', 'env-sample-v3'];

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

function biOnSetInterest(ses, time) {
  biListenGeneralSample(protocols, null);
  for (var i = 0; i < 6; i++) {
    biListenGeneralSample(protocols, i);
  }

  inTime = time;
  var sessionTime = ses.getTime();
  if (sesssionTimeArr.length == 0) sesssionTimeArr.push(sessionTime);
  var sampleLast = getGnssImuSample(channel, ses, time, false);
  for (var i = 0; i < catcheArr.length; i++) {
    var catche = catcheArr[i];
    var sample = getGnssImuSample(i, ses, time, false);
    if (sample != null && !findTime(catche, sample.time)) {
      channelArr[i] = true;
      if (sample.latitude != null && sample.longitude != null) catche.push(sample);
    }
  }
  if (session != undefined && session != sessionTime) {
    sesssionTimeArr.push(sessionTime);
    sesssionTimeArr = sesssionTimeArr.filter(function (value, index, self) {
      return self.indexOf(value) === index;
    });
    var allOverlay = map.getOverlays();
    for (var i = 0; i < allOverlay.length; i++) {
      if (allOverlay[i]["layerType"] == "pointType") {
        map.removeOverlay(allOverlay[i]);
      }
    }
    for (var i = 0; i < catcheArr.length; i++) {
      catcheArr[i].length = 0;
    }
    carMarker.carmarkeridx = -1;
  }
  // var bufferRange = biGetBufferRangeX();
  session = sessionTime;
  // if (bufferRange != null) {
  //     var lower = bufferRange.lower;
  //     var upper = bufferRange.upper;
  //     // for (var i = 0; i < catcheArr.length; i++) {
  //     //     var arr = catcheArr[i];
  //     //     for (var j = 0; j < arr.length; j++) {
  //     //         var sample = arr[j];
  //     //         if (sample.time < lower) arr.splice(j, 1);
  //     //     }
  //     // }
  // }
  var g = setTimeout(() => {
    var sampleEnv = getEnvSample(ses, time);
    //env
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
    for (var i = 0; i < channelArr.length; i++) {
      if (i != channel && channelArr[i]) {
        if (!$('#map>.top-operation>ul:nth-of-type(1)>li:eq(' + i + ')').hasClass('green')) {
          $('#map>.top-operation>ul:nth-of-type(1)>li:eq(' + i + ')').addClass('green');
        }
      }
    }
    var arrSample = [],
      index = catcheArr[channel].length == 0 ? 0 : binarySearch(catcheArr[channel], time),
      index2 = -1;
    for (var n = 0; n < index; n++) {
      var first = catcheArr[channel][n];
      if (n == 0) arrSample.push(first);
      var last = arrSample[arrSample.length - 1];
      var distance = getDistance(first.latitude, first.longitude, last.latitude, last.longitude);
      if (distance >= 15 * arrSample.length) {
        arrSample.push(first);
      }
    }
    arrSample.push(catcheArr[channel][index]);
    for (var i = 0; i < arrSample.length; i++) {
      var sample = arrSample[i];
      if (sample == null) continue;
      var sessionTime = sample.session.getTime();
      if (sessionTime == session) {
        index2 = i;
        break;
      }
    }
    if (carMarker != undefined) carMarker.polyline.setPath([]);
    if (index2 != -1) {
      for (var n = index2; n < arrSample.length; n++) {
        var sample = arrSample[n];
        if (sample == null) continue;
        var sessionTime = sample.session.getTime();
        if (!(sample.latitude >= 4 && sample.latitude <= 53 && sample.longitude <= 135 && sample.longitude >= 74)) continue;
        var arr = wgs2bd(sample.latitude, sample.longitude);
        var longitude = arr[1];
        var latitude = arr[0];
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
        var point = null;
        if (carData != undefined) {
          if (carData.hasgps) {
            point = new BMap.Point(longitude, latitude); //获得baidu经纬度
          }
        }
        var carmarkeridx = -1;
        if (carMarker != undefined) {
          carmarkeridx = carMarker.carmarkeridx;
          if (carData.hasgps) {
            carMarker.marker.setPosition(point);
            var path;
            if (carData.newsession) { //Session 发生变化
              path = new Array(point);
            } else {
              path = carMarker.polyline.getPath();
              path.push(point);
            }
            carMarker.polyline.setPath(path);
          }
        }
        if (carData != undefined) {
          if (carmarkeridx == -1 && carData.hasgps) {
            var marker = carMarker != undefined ? carMarker.marker : new BMap.Marker(point);
            marker["layerType"] = "pointType";
            var polyline = new BMap.Polyline([point], {
              strokeColor: "blue",
              strokeWeight: 4,
              strokeOpacity: 0.5
            }); //创建折线
            if (sesssionTimeArr.indexOf(sessionTime) == sesssionTimeArr.length - 1) {
              map.addOverlay(marker); //添加marker
              map.addOverlay(polyline); //添加polyline
              marker.setAnimation(BMAP_ANIMATION_BOUNCE);
            }
            map.panTo(point);
            //将车辆id，对应marker，cardataidx，保存至web本地carMarkers
            carMarker = {
              id: channel,
              session_guid: channel,
              marker: marker,
              polyline: polyline,
              carmarkeridx: cardataidx
            };
            carmarkeridx = 0;
          }
        }
      }
      if (arrSample[arrSample.length - 1] != null) {
        var sample = arrSample[arrSample.length - 1];
        if (sample.latitude == null) return;
        var arr = wgs2bd(sample.latitude, sample.longitude);
        var longitude = arr[1];
        var latitude = arr[0];
        set_center(longitude, latitude);
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
      $("#location").html(location);
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
        $("#gnssTime").text(year + "/" + month + "/" + date + " " + hour + ":" + minute + ":" + second + "+" + milliseconds + "ms UTC");
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
    } else { }
    clearTimeout(g);
  });
}

function clear() {
  $("#gnssTime").text("(Unknown time)");
  $('.altitude>div:nth-of-type(1)').css("border-bottom", "unset");
  $('#roll-img').css("transform", "rotate(0deg)");
  $('#pitch-img').css("transform", "rotate(0deg)");
  $('#head-img').css("transform", "rotate(0deg)");
  var antennaAltitude = "---";
  var altitude = "---";
  var speed = "---";
  var ax = "---";
  var ay = "---";
  var heading = "---";
  var pitch = "---";
  var roll = "---";
  var yawRate = "---";
  $("#antennaAltitude").text(antennaAltitude);
  $("#altitude").text(altitude);
  $("#speed").text(speed);
  $("#ax").text(ax);
  $("#ay").text(ay);
  $("#heading").html(heading);
  $("#pitch").html(pitch);
  $("#roll").html(roll);
  $("#rate").text(yawRate);
  clearEnv();
}

function clearEnv() {
  $('.weather').append();
  $('.weather>div').each(function (i, v) {
    if (i >= 2) $(this).remove();
  });
  $("#weather").attr("src", "baidumap/images/weather_unknown.png");
  $("#traffic").attr("src", "baidumap/images/traffic unknown.png");
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

//降序排序算法
function compare(property) {
  return function (a, b) {
    var value1 = a[property];
    var value2 = b[property];
    return value1 - value2;
  }
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
      src = "baidumap/images/toll gate.png"; // 收费站
      break;
    case 2:
      src = "baidumap/images/service area.png"; // 服务区
      break;
    case 3:
      src = "baidumap/images/tunnel.png"; // 隧道
      break;
    case 4:
      src = "baidumap/images/accident.png"; // 事故
      break;
    case 5:
      src = "baidumap/images/crossing.png"; // 路口
      break;
    case 7:
      src = "baidumap/images/roundabout.png"; // 环岛
      break;
    case 8:
      src = "baidumap/images/highway entrance.png"; // 高速入口
      break;
    case 9:
      src = "baidumap/images/highway exit.png"; // 高速出口
      break;
    case 10:
      src = "baidumap/images/bridge.png"; // 桥
      break;
    case 11:
      src = "baidumap/images/express entrance.png"; // 快速路入口
      break;
    case 12:
      src = "baidumap/images/express exit.png"; // 快速路出口
      break;
    default:
      break;
  }
  return src;
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
  var src = "baidumap/images/weather_unknown.png";
  switch (number) {
    case 1:
      if (gnssTime != null && (gnssTime.getHours() >= 23 || gnssTime.getHours() < 7)) {
        src = "baidumap/images/weather_sunny_night.png";
      } else {
        src = "baidumap/images/weather_sunny_day.png";
      }
      break;
    case 2:
      if (gnssTime != null && (gnssTime.getHours() >= 23 || gnssTime.getHours() < 7)) {
        src = "baidumap/images/weather_cloudy_night.png";
      } else {
        src = "baidumap/images/weather_cloudy_day.png";
      }
      break;
    case 3:
      if (gnssTime != null && (gnssTime.getHours() >= 23 || gnssTime.getHours() < 7)) {
        src = "baidumap/images/weather_rainy_night.png";
      } else {
        src = "baidumap/images/weather_rainy_day.png";
      }
      break;
    case 4:
      if (gnssTime != null && (gnssTime.getHours() >= 23 || gnssTime.getHours() < 7)) {
        src = "baidumap/images/weather_snowy_night.png";
      } else {
        src = "baidumap/images/weather_snowy_day.png";
      }
      break;
    case 5:
      if (gnssTime != null && (gnssTime.getHours() >= 23 || gnssTime.getHours() < 7)) {
        src = "baidumap/images/weather_foggy_night.png";
      } else {
        src = "baidumap/images/weather_foggy_day.png";
      }
      break;
    case 6:
      if (gnssTime != null && (gnssTime.getHours() >= 23 || gnssTime.getHours() < 7)) {
        src = "baidumap/images/weather_sandstorm_night.png";
      } else {
        src = "baidumap/images/weather_sandstorm_day.png";
      }
      break;
    default:
      break;
  }
  return src;
}

function getTraffic(number) {
  var src = "baidumap/images/traffic unknown.png";
  switch (number) {
    case 1:
      src = "baidumap/images/traffic open.png";
      break;
    case 2:
      src = "baidumap/images/traffic slow.png";
      break;
    case 3:
      src = "baidumap/images/traffic crowded.png";
      break;
    default:
      break;
  }
  return src;
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


//Online视图
function toolStripOnlineMap(obj, map) {
  if ($(obj).css("border").substr(($(obj).css("border").toString()).indexOf("solid ") + 6) == "rgb(255, 255, 255)") {
    $(obj).css("border", "1px solid #657fff");
    $("#picture2").css("border", "1px solid rgb(255, 255, 255)");
    $("#picture3").css("border", "1px solid rgb(255, 255, 255)");
  }
  normal_map();
}

//Satellite视图
function toolStripSatelliteMap(obj) {
  if ($(obj).css("border").substr(($(obj).css("border").toString()).indexOf("solid ") + 6) == "rgb(255, 255, 255)") {
    $(obj).css("border", "1px solid #657fff");
    $("#picture1").css("border", "1px solid rgb(255, 255, 255)");
    $("#picture3").css("border", "1px solid rgb(255, 255, 255)");
  }
  satellite_map(true);
}

//Offline视图
function toolStripOfflineMap(obj) {
  if ($(obj).css("border").substr(($(obj).css("border").toString()).indexOf("solid ") + 6) == "rgb(255, 255, 255)") {
    $(obj).css("border", "1px solid #657fff");
    $("#picture1").css("border", "1px solid rgb(255, 255, 255)");
    $("#picture2").css("border", "1px solid rgb(255, 255, 255)");
  }
}

//将地图锁定
function toolStripLockToCenter(obj) {
  if ($(obj).css("border").substr(($(obj).css("border").toString()).indexOf("solid ") + 6) == "rgb(255, 255, 255)") {
    disable_operations();
    flagMap = false;
    $(obj).css("border", "1px solid #657fff");
  } else {
    enable_operations();
    flagMap = true;
    $(obj).css("border", "1px solid rgb(255, 255, 255)");
  }
}

//显示gps数据
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
  zoom_in();
}

//缩小
function toolStripZoomOut() {
  zoom_out();
}
var map;
var routine;
var channel = 0;
var carDatas = [],
  carMarkers = [];

function load_map() {
  if (typeof (BMap) == 'undefined') return false;
  map = new BMap.Map("allmap0", {
    enableMapClick: false
  });
  map.enableDragging();
  map.enableScrollWheelZoom();
  map.enableDoubleClickZoom();
  map.enableKeyboard();
  return true;
}

function satellite_map(showingSatellite) {
  if (map == null) return;
  map.setMapType(BMAP_SATELLITE_MAP);

}

function normal_map() {
  if (map == null) return;
  map.setMapType(BMAP_NORMAL_MAP);
}

function enable_operations() {
  if (map == null) return;
  map.enableDragging();
  map.enableScrollWheelZoom();
  map.enableDoubleClickZoom();
  map.enableKeyboard();
}

function disable_operations() {
  if (map == null) return;
  map.disableDragging();
  map.disableScrollWheelZoom();
  map.disableDoubleClickZoom();
  map.disableKeyboard();

}

function zoom_in() {
  if (map == null) return;
  map.zoomIn();
}

function zoom_out() {
  if (map == null) return;
  map.zoomOut();
}

function get_zoom() {
  if (map == null) return 12;
  return map.getZoom();
}

function get_center_lng() {
  if (map == null) return 116.404;
  return map.getCenter().lng;
}

function get_center_lat() {
  if (map == null) return 39.915;
  return map.getCenter().lat;
}

function set_center(center_lng, center_lat) {
  if (map == null || flagMap) return;
  map.setCenter(new BMap.Point(center_lng, center_lat));
}

function set_center_and_zoom(center_lng, center_lat, zoom) {
  if (map == null) return;
  map.centerAndZoom(new BMap.Point(center_lng, center_lat), zoom);
}

function set_location_marker(longitude, latitude) {
  if (map == null) return;
  var loc = new BMap.Point(longitude, latitude);
  if (marker == null) {
    marker = new BMap.Marker(loc, {
      enableMassClear: false
    });
    map.addOverlay(marker);
    marker.setAnimation(BMAP_ANIMATION_BOUNCE);
  } else marker.setPosition(loc);
}

function remove_location_marker() {
  if (map == null) return;
  if (marker != null) {
    map.removeOverlay(marker);
    marker = null;
  }
}

function reset_location_marker_animation() {
  if (map == null) return;
  if (marker != null) {
    marker.setAnimation(BMAP_ANIMATION_BOUNCE);
  }
}

function set_routine(newPointsScript) {
  if (map == null) return;
  var pts = eval(newPointsScript);
  if (routine == null) {
    routine = new BMap.Polyline(pts, {
      enableMassClear: false
    });
    map.addOverlay(routine);
  } else routine.setPath(pts);
}

function remove_routine() {
  if (map == null) return;
  if (routine != null) {
    map.removeOverlay(routine);
    routine = null;
  }
}