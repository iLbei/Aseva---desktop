var not_select = "",
  dialogConfig = [{}, {}, {}, {}, {}];

$(".top button").click(function () {
  getVal($(this).index());
  $(this).addClass("active").siblings().removeClass("active");
})
//仅步长=精确位数-1时适用
$(".content").on("input", "input[type=number]", function (e) {
  var v = $(this).val();
  if (isNaN(e.which)) {
    $(this).attr("value", compareVal(this, v)).val(compareVal(this, v))
  } else {
    $(this).attr("value", v);
  }
  setVal(this);
});
$(".content").on("blur", "input[type=number]", function () {
  $(this).attr("value", compareVal(this, $(this).val())).val(compareVal(this, $(this).val()));
});

$("input[type=text]").on("input", function () {
  setVal(this);
})
$("a").click(function () {
  var name = $(this).attr("name");
  biSelectPath(name, BISelectPathType.Directory, "");
})

function compareVal(obj, val) {
  var newVal = 0;
  if (isNaN(val) || !Boolean(val)) {
    newVal = Number($(obj).attr('value'));
  } else {
    var step = "";
    var max = "";
    var min = "";
    switch ($(obj).attr("name")) {
      case "events_per_sec": {
        step = $(obj).attr("step").length;
        max = 100000;
        min = 0.1;
        break;
      }
      default: {
        max = Number($(obj).attr("max"));
        min = Number($(obj).attr("min"));
        step = $(obj).attr("step").length > 2 ? $(obj).attr("step").length - 2 : 0;
      }
      break;
    }
    if (val > max) {
      val = max;
    } else if (val < min) {
      val = min;
    }
    //解决为负数时末尾输入5不能进行四舍五入
    newVal = Math.round(Math.abs(val) * Math.pow(10, step)) / Math.pow(10, step);
    if (val < 0) newVal = -newVal;
  };
  return step > 0 ? newVal.toFixed(step) : newVal;
}

/*----------配置读取与存储-----------*/
$('.container').on("change", "[name]", function () {
  setVal(this);
});
//保存配置
function setConfig() {
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root ";
  for (var i in dialogConfig) {
    for (var j in dialogConfig[i]) {
      text += j + "_" + i + "=\"" + dialogConfig[i][j] + "\" ";
    }
  }
  text += "/>";
  biSetModuleConfig("ASPackerSHUsbCam5", text);
}

function biOnInitEx(config, moduleConfigs) {
  if (biGetLanguage() == 1) {
    $('[language]').each(function () {
      var value = $(this).attr('language');
      $(this).text(en[value]);
    });
    not_select = "<Not Selected>";
  } else {
    $('[language]').each(function () {
      var value = $(this).attr('language');
      $(this).text(cn[value]);
      not_select = "<Not Selected>";
    });
  }
  for (var key in moduleConfigs) {
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(moduleConfigs[key], "text/xml");
    var root = xmlDoc.getElementsByTagName('root');
    var keys = root[0].attributes;
    for (var i = 0; i < keys.length; i++) {
      //获取root自身字节的属性
      var nodeName = keys[i].nodeName;
      var name = nodeName.substr(0, nodeName.lastIndexOf("_"));
      var val = keys[i].nodeValue;
      if (nodeName.indexOf("_0") != -1) {
        dialogConfig[0][name] = val;
      } else if (nodeName.indexOf("_1") != -1) {
        dialogConfig[1][name] = val;
      } else if (nodeName.indexOf("_2") != -1) {
        dialogConfig[2][name] = val;
      } else if (nodeName.indexOf("_3") != -1) {
        dialogConfig[3][name] = val;
      } else if (nodeName.indexOf("_4") != -1) {
        dialogConfig[4][name] = val;
      }
    }
    getVal($(".active").index());
  }
}

function getVal(i) {
  $('.content [name]').each(function () {
    var val = dialogConfig[i][$(this).attr('name')];
    var type = $(this).attr('type');
    if (type == 'checkbox') {
      $(this).prop('checked', val == '1');
    } else if (type == "number") {
      $(this).val(compareVal(this, val)).attr("value", compareVal(this, val));
    } else if ($(this).is('a')) {
      $(this).attr("title", val == "" || val == "null" ? not_select : val).text(val == "" || val == "null" ? not_select : val);
    } else {
      $(this).val(val);
    }
  })
}

function setVal(obj) {
  var i = $(".active").index();
  var val = 0;
  var type = $(obj).attr('type');
  if (type == 'checkbox') {
    val = $(obj).is(":checked") ? "1" : " 0";
  } else if (type == "number") {
    val = compareVal(obj, $(obj).val());
  } else if ($(obj).is('a')) {
    val = $(obj).text().indexOf(not_select) == -1 ? $(obj).text() : "";
  } else {
    val = $(obj).val();
  }
  dialogConfig[i][$(obj).attr('name')] = val;
  setConfig();
}

function biOnSelectedPath(key, path) {
  if (path == null) {
    $('[name=' + key + ']').removeAttr('title').text(not_select);
  } else {
    $('[name=' + key + ']').attr('title', path).text(path);
  };
  setVal($('[name=' + key + ']'));
}