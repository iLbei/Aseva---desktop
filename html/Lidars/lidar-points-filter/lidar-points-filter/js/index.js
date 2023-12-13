var conf = [];
$(function () {
  for (var i = 0; i < 128; i++) {
    let br = ( i % 16 == 15) ? "<br>" : "";
    $(".ids").append("<input type=\"checkbox\" id=\"" + i + "\"><label for=\"" + i + "\">" + (i + 1) + "</label>" + br)
  }
})
$('.container>ul>li').click(function () {
  setVal($(".white").index());
  $(this).addClass('white');
  $(this).siblings().removeClass('white');
  getVal($(".white").index());
})

//仅步长=精确位数-1时适用
$(".content").on("input", "input[type=number]", function (e) {
  var v = $(this).val();
  if (isNaN(e.which)) {
    $(this).attr("value", compareVal(this, v)).val(compareVal(this, v))
  } else {
    $(this).attr("value", v);
  }
  setVal($(".white").index());
  setConfig();
});
$(".content").on("blur", "input[type=number]", function () {
  $(this).attr("value", compareVal(this, $(this).val())).val(compareVal(this, $(this).val()));
});

$('.container').on("change", "[name],input", function () {
  setVal($(".white").index());
  setConfig();
});

function compareVal(obj, val) {
  var newVal = 0,
    step = $(obj).attr("step").length - 1;
  if (isNaN(Number(val))) {
    newVal = Number($(obj).attr('value'));
  } else {
    var min = 0,
      max = 0;
    switch ($(obj).attr("name")) {
      case "minRange":
      case "maxRange": {
        max = 500;
        min = 0;
        break;
      }
      case "minAngle":
      case "maxAngle": {
        max = 360;
        min = 0;
        break;
      }
      case "minPitchAngle":
      case "maxPitchAngle": {
        max = 180;
        min = -180;
      }
    }
    if (val > max) {
      val = max.toFixed(step);
    } else if (val < min) {
      val = min.toFixed(step);
    }
    //解决为负数时末尾输入5不能进行四舍五入
    newVal = Math.round(Math.abs(val) * Math.pow(10, step)) / Math.pow(10, step);
    if (val < 0) newVal = -newVal;
  };
  return newVal.toFixed(step);
}
function setVal(i) {
  $('.content [name]').each(function () {
    var name = $(this).attr('name');
    var val = $(this).val();
    var type = $(this).attr('type');
    if (type == 'checkbox') {
      val = $(this).is(':checked') ? "1" : "0";
    }
    conf[i][name] = val;
  });
  var ids = "";
  $(".ids>input[type=checkbox]:checked").each(function (i) {
    ids += $(this).attr("id") + ",";
  });
  conf[i]["laserIDList"] = ids.substring(0, ids.length - 1);
}
function getVal(i) {
  $("input[type =checkbox]").attr("checked", false);
  $("select").val(-1);
  $("input[type =number]").val(0.000);
  $('.content [name]').each(function () {
    var name = $(this).attr('name');
    var type = $(this).attr('type');
    var val = conf[i][name];
    if (Boolean(val)) {
      if (type == 'checkbox') {
        $(this).prop('checked', val == "1");
      } else if (type == "number") {
        $(this).attr("value", compareVal(this, val)).val(compareVal(this, val));
      } else {
        $(this).val(val)
      }
    }
  });
  if (Boolean(conf[i]["laserIDList"])) {
    var ids = conf[i]["laserIDList"].split(",");
    for (var i of ids) {
      $(".ids>input[type=checkbox]#" + Number(i)).prop("checked", true);
    }
  }
}

//保存配置
function setConfig() {
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root>";
  for (var i in conf) {
    text += "<lidarpointsfilter" + (Number(i) + 1);
    for (var j in conf[i]) {
      text += " " + j + "=\"" + conf[i][j] + "\"";
    }
    text += " />"
  };
  text += "</root>";
  biSetModuleConfig("lidar-points-filter.aspluginlidarpointsfilter", text);
}
function biOnInitEx(config, moduleConfigs) {
  $('[language]').each(function () {
    var value = $(this).attr('language');
    $(this).html(biGetLanguage() == 1 ? en[value] : cn[value])
  });
  for (var key in moduleConfigs) {
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(moduleConfigs[key], "text/xml");
    var rootChild = xmlDoc.getElementsByTagName('root')[0].childNodes;
    for (var i = 0; i < rootChild.length; i++) {
      var obj = new Object();
      var keys = rootChild[i].attributes;
      for (var j = 0; j < keys.length; j++) {
        //获取root自身字节的属性
        obj[keys[j].nodeName] = keys[j].nodeValue;
      }
      conf.push(obj);
    }
  }
  getVal($(".white").index());
}