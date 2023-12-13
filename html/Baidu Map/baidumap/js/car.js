var carMarkers = [];
var carDatas = [];
var currProCarIds = [];
var click = new Map();
var gray_car_icon = new BMap.Icon("../static/monitor/img/gray_car.png", new BMap.Size(32, 37));
var green_car_icon = new BMap.Icon("../static/monitor/img/green_car.png", new BMap.Size(32, 37));
var red_car_icon = new BMap.Icon("../static/monitor/img/red_car.png", new BMap.Size(32, 37));
var yellow_car_icon = new BMap.Icon("../static/monitor/img/yellow_car.png", new BMap.Size(32, 37));
var circle_icon = new BMap.Icon("../static/monitor/img/circle-8x8.png", new BMap.Size(8, 8));

//创建SearchInfoWindow
var infoWindow;
var infoWindowCarIdx = -1; //即cardataidx

function getCenterBottomPoint() {
  var bounds = map.getBounds();
  var sw = bounds.getSouthWest();
  var ne = bounds.getNorthEast();
  var point = new BMap.Point((sw.lng + ne.lng) / 2, sw.lat);
  return point;
}

function openInfoWindow(p, carDataIdx) {
  infoWindowCarIdx = -1;
  infoWindow.disableAutoPan();
  if (p != null) {
    for (var i = 0; i < carMarkers.length; i++) {
      var loc = carMarkers[i].marker.getPosition();
      if (p.lng == loc.lng && p.lat == loc.lat) {
        infoWindow.open(p);
        infoWindowCarIdx = carMarkers[i].cardataidx;
        break;
      }
    }
    $(".BMapLib_SearchInfoWindow .BMapLib_trans").css("display", "block"); //显示小箭头
  } else {
    infoWindow.open(getCenterBottomPoint());
    infoWindowCarIdx = carDataIdx;
    $(".BMapLib_SearchInfoWindow .BMapLib_trans").css("display", "none"); //没有marker不显示小箭头
  }
  if (infoWindowCarIdx != -1) {
    infoWindow.setTitle(carDatas[infoWindowCarIdx].vin);
    infoWindow.setContent(carDatas[infoWindowCarIdx].content);
  }
}

function updateInfoWindow(carDataIdx) {
  if (infoWindowCarIdx == carDataIdx) {
    infoWindow.setContent(carDatas[carDataIdx].content);
    var markeridx = carDatas[carDataIdx].carmarkeridx;
    if (markeridx >= 0) {
      infoWindow.setPosition(carMarkers[markeridx].marker.getPosition());
      $(".BMapLib_SearchInfoWindow .BMapLib_trans").css("display", "block"); //显示小箭头
    } else {
      infoWindow.setPosition(getCenterBottomPoint());
    }
  }
}

function getrealtimeStatus(carid, status) {
  var parent = $("#car_li_" + carid).parent();
  var item = parent.find(".radioBtn a[data-title='" + status + "']");
  item.parent().find('a').removeClass("btn-warning");
  if (item.hasClass("active") == false) {
    item.addClass('btn-warning');
  }
}

function statuschange(carid, sel) {
  click.set(carid, sel);
  var parent = $("#car_li_" + carid).parent();
  var otherItems = parent.find(".radioBtn a");
  $(otherItems).each(function () {
    if ($(this).attr("data-title") == sel) {
      $(this).removeClass('active').addClass("btn-warning");
    } else {
      $(this).removeClass('active').removeClass('btn-success').removeClass('btn-warning');
    }
  });
  sendMessage("setExpectClientStatus?carid=" + carid + "&expectclientstatus=" + sel);
}

function fillCarDiv(cars) {
  var div = "";
  if (cars != undefined) {
    //解析车辆list到html显示
    for (var i = 0; i < cars.length; i++) {
      currProCarIds.push(cars[i].id);
      div += "<li class='row margin'>" +
        "<div class='col-xs-8' style='padding-right:0px' id='car_li_" + cars[i].id + "' ><a href='javascript:void(0)'>" +
        "<i class='menu-icon fa fa-car bg-gray'></i>" +
        "<div class='menu-info'>" +
        "<h4 class='control-sidebar-subheading' id='car_li_h4_" + cars[i].id + "' style='color: #3C8DBC;width: 175px;'>" +
        cars[i].vin + "</h4>" +
        "<p class='control-sidebar-subheading ' id='car_p_" + cars[i].id + "' style='width: 175px;font-size: 10px;position: absolute; '></p>" +
        "</div>" +
        "</a></div><div class='col-xs-4' style='padding-left:0px' >" +
        '<div class="radioBtn btn-group pull-right">' +
        '<a href="javascript:statuschange(\'' + cars[i].id + '\', \'1\')" data-title="1" class="btn btn-default btn-sm disabled"><i class="fa fa-play"></i></a>' +
        '<a href="javascript:statuschange(\'' + cars[i].id + '\', \'2\')" data-title="2" class="btn btn-default btn-sm disabled"><i class="fa fa-circle"></i></a>' +
        '<a href="javascript:statuschange(\'' + cars[i].id + '\', \'0\')" data-title="0" class="btn btn-default btn-sm disabled"><i class="fa fa-stop"></i></a>' +
        ' <a class="layui-btn btn replayCar" href="javascript:;" onclick="replay(this)"><i class="layui-icon layui-icon-circle-dot"></i></a></div>' +
        "</div>" +
        "</li>";
    }
    return div;
  }
}

function resetAllCarList() {
  var jqcars = $("#carlist-ul > li > div");
  for (var i = 0; i < jqcars.length; i++) {
    var carid = jqcars[i].id.substring(jqcars[i].id.lastIndexOf("_") + 1);
    updateOnlineListLi(carid, false, false, false);
  }
}

function updateOnlineListLi(carid, isOnline, hasGps, datavalid, expectworkstatus, type) {
  if (isOnline) {
    $("#car_li_" + carid + " > a:eq(0)").attr("href", "javascript:moveCarToCenter(\"" + carid + "\");");
    //$("#car_li_" + carid + " > a:eq(0) > i:eq(0)").removeClass("bg-green bg-red bg-yellow");
    if (hasGps && datavalid) {
      $("#car_li_" + carid + " > a:eq(0) > i:eq(0)").addClass("bg-green");
      $("#car_p_" + carid).css("color", "#3C8DBC");
    } else if (datavalid == false) {
      $("#car_li_" + carid + " > a:eq(0) > i:eq(0)").addClass("bg-yellow");
    } else {
      $("#car_li_" + carid + " > a:eq(0) > i:eq(0)").addClass("bg-yellow").removeClass("bg-green");
    }
    if (type === 1 || type === 2) {
      if (!$("#car_li_" + carid).parent().find(".radioBtn a").hasClass("disabled")) {
        $("#car_li_" + carid).parent().find(".radioBtn a").addClass("disabled");
        if (type == 2) {
          if (expectworkstatus != null) {
            statuschange(carid, expectworkstatus); //default status stop
          }
        }
      }
    } else {
      if ($("#car_li_" + carid).parent().find(".radioBtn a").hasClass("disabled")) {
        $("#car_li_" + carid).parent().find(".radioBtn a").removeClass("disabled");
        if (expectworkstatus != null) {
          changestatus(carid, expectworkstatus); //default status stop
        }
      }
    }

  } else {
    $("#car_li_" + carid + " > a:eq(0)").attr("href", 'javascript:void(0)');
    $("#car_li_" + carid + " > a:eq(0) > i:eq(0)").removeClass("bg-green bg-red bg-yellow bg-gray");
    $("#car_li_" + carid + " > a:eq(0) > i:eq(0)").addClass("bg-gray");
    $("#car_p" + carid + "").html("");
  }
}

function clearCarMarkers() {
  for (var j = 0; j < carMarkers.length; j++) {
    if (infoWindowCarIdx == carMarkers[j].cardataidx) {
      infoWindow.close();
    }
    map.removeOverlay(carMarkers[j].marker);
    map.removeOverlay(carMarkers[j].polyline);
  }
}