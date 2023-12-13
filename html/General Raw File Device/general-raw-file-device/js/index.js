var not_config = "";
var reg = /^[a-zA-Z]:/;
$("a").click(function () {
  var name = $(this).attr("name");
  biSelectPath(name, 3, null)
})

//仅步长=精确位数-1时适用
$(".container").on("input", "input[type=number]", function (e) {
  var v = $(this).val();
  if (isNaN(e.which)) {
    $(this).attr("value", compareVal(this, v)).val(compareVal(this, v))
  } else {
    $(this).attr("value", v);
  }
});
$(".container").on("blur", "input[type=number]", function () {
  $(this).attr("value", compareVal(this, $(this).val())).val(compareVal(this, $(this).val()));
});

function compareVal(obj, val) {
  var newVal = 0;
  var step = $(obj).attr("step").length - 1;
  var name = $(obj).attr("name");
  if (isNaN(val) || !Boolean(val)) {
    newVal = Number($(obj).attr('value'));
  } else {
    var min = 0,
      max = 0;
    switch (name) {
      case "time_ratio": {
        max = 10;
        min = 0.000001;
        break;
      }
      case "load_speed": {
        step = step - 1;
        max = 10;
        min = 0.01;
        break;
      }
      default:
        break;
    }
    if (val > max) {
      val = max;
    } else if (val < min) {
      val = min;
    }
    //解决为负数时末尾输入5不能进行四舍五入
    if (name == "time_ratio") {
      newVal = Math.round(Math.abs(val) * Math.pow(10, 6)) / Math.pow(10, 6);
    } else {
      newVal = Math.round(Math.abs(val) * Math.pow(10, step)) / Math.pow(10, step);
    }
    if (val < 0) newVal = -newVal;
  }
  if (name == "time_ratio") {
    return step > 0 ? newVal.toFixed(6) : newVal;
  } else {
    return step > 0 ? newVal.toFixed(step) : newVal;
  }
}

//保存配置
function setConfig() {
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root><config ";
  $('.container [name]').each(function () {
    var name = $(this).attr('name');
    var val = $(this).val();
    var type = $(this).attr('type');
    if (type == 'checkbox') {
      text += name + "=\"" + ($(this).is(':checked') ? "yes" : "no") + "\" ";
    } else if (type == "number") {
      text += name + "=\"" + compareVal(this, val) + "\" ";
    } else if ($(this).is("a")) {
      text += name + "=\"" + ($(this).text().indexOf(not_config) != -1 ? "" : $(this).text()) + "\" ";
    } else {
      text += name + "=\"" + val + "\" ";
    }
  });
  text += " /></root>";
  biSetModuleConfig("general-raw-file-device.asplugingeneralrawfiledevice", text);
}

$(function () {
  if (biGetLanguage() == 1) {
    $('[language]').each(function () {
      var value = $(this).attr('language');
      $(this).text(en[value])
    });
    not_config = en["not_config"];
  } else {
    $('[language]').each(function () {
      var value = $(this).attr('language');
      $(this).text(cn[value]);
    });
    not_config = cn["not_config"];
  }
})

function biOnInitEx(config, moduleConfigs) {
  if (biGetLanguage() == 1) {
    $('[language]').each(function () {
      var value = $(this).attr('language');
      $(this).text(en[value])
    });
    not_config = en["not_config"];
  } else {
    $('[language]').each(function () {
      var value = $(this).attr('language');
      $(this).text(cn[value]);
    });
    not_config = cn["not_config"];
  }
  for (var key in moduleConfigs) {
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(moduleConfigs[key], "text/xml");
    var obj = new Object();
    var root = xmlDoc.getElementsByTagName('root');
    var keys = root[0].childNodes[0].attributes;
    for (var i = 0; i < keys.length; i++) {
      //获取root自身字节的属性
      obj[keys[i].nodeName] = keys[i].nodeValue;
    }
    loadConfig(obj);
  }
}

function loadConfig(obj) {
  $('.container [name]').each(function () {
    var val = obj[$(this).attr('name')];
    if (!Boolean(val)) return;
    var type = $(this).attr('type');
    if (type == 'checkbox') {
      $(this).prop('checked', val == 'yes');
    } else if (type == "number") {
      $(this).val(compareVal(this, val)).attr("value",compareVal(this, val));
    } else if ($(this).is('a')) {
      $(this).attr("title", val == "" || val == "null" ? not_config : val).text(val == "" || val == "null" ? not_config : val);
    } else {
      $(this).val(val);
    }
  })
}

function biOnSelectedPath(key, path) {
  if (path != null) {
    $('[name=' + key + ']').attr('title', path + (reg.test(path) ? '\\' : '\/')).text(path + (reg.test(path) ? '\\' : '\/'));
    // } else {
    //   $('[name=' + key + ']').removeAttr('title').text(not_config);
  };
  setConfig();
}

$("[name]").change(function () {
  setConfig();
})