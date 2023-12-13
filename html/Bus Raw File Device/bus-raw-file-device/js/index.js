var not_config = "",
  dialogConfig = {},
  reg = /^[a-zA-Z]:/;

$(".container").on("input", "input[type=number]", function (e) {
  var v = $(this).val();
  if (isNaN(e.which)) {
    $(this).attr("value", compareVal(this, v)).val(compareVal(this, v));
  } else {
    $(this).attr("value", v);
  }
  dialogConfig[$(this).attr("name")] = $(this).val();
  setConfig();
});

$(".container").on("blur", "input[type=number]", function () {
  $(this).attr("value", compareVal(this, $(this).val())).val(compareVal(this, $(this).val()));
  dialogConfig[$(this).attr("name")] = $(this).val();
  setConfig();
});

$("a").click(function () {
  biSelectPath($(this).attr("name"), BISelectPathType.Directory, null);
})

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
$('.container').on("change", "[name]", function () {
  changeVal(this);
});
$('button').click(function () {
  var name = $(this).attr("language");
  switch (name) {
    case "add": {
      biSelectPath("context_list", BISelectPathType.OpenFile, {
        ".asc": "asc",
        ".blf": "blf"
      });
      break;
    }
    case "clear": {
      dialogConfig["context_list"] = [];
      $(".content").empty();
      setConfig();
      break;
    }
  }
})

function getConfig() {
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root><config ";
  for (var i in dialogConfig) {
    if (i == "context_list") {
      text += i + "=\"" + dialogConfig[i].join("|") + "\" ";
    } else {
      text += i + "=\"" + dialogConfig[i] + "\" ";
    }
  }
  text += "/></root>";
  return text;
}

function setConfig() {
  biSetModuleConfig("bus-raw-file-device.aspluginbusrawfile", getConfig());
}

function biOnInitEx(config, moduleConfigs) {
  var lang = biGetLanguage() == 1 ? en : cn;
  $('[language]').each(function () {
    var value = $(this).attr('language');
    $(this).text(lang[value]);
  });
  not_config = lang["not_config"];
  for (var key in moduleConfigs) {
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(moduleConfigs[key], "text/xml");
    var root = xmlDoc.getElementsByTagName('root');
    var keys = root[0].childNodes[0].attributes;
    for (var i = 0; i < keys.length; i++) {
      //获取root自身字节的属性
      if (keys[i].nodeName == "context_list") {
        dialogConfig["context_list"] = Boolean(keys[0].value) ? keys[0].value.split("|") : [];
      } else {
        dialogConfig[keys[i].nodeName] = keys[i].nodeValue;
      }
    }
    loadConfig();
  }
}

function loadConfig() {
  if (dialogConfig["context_list"].length > 0) {
    for (var i in dialogConfig["context_list"]) {
      var val = dialogConfig["context_list"][i].split(",");
      $(".content").append("<div class=\"box fixclear\"><a href=\"javascript:;\" class=\"left\">" + val[0] + "</a><img src=\"bus-raw-file-device/img/del.png\" class=\"right\" onclick=\"remove(this)\" alt=\"delete\"></div>");
      biQueryFileExist(val[0]);
    }
  }
  $('.container [name]').each(function () {
    var val = dialogConfig[$(this).attr('name')];
    if (!Boolean(val)) return;
    var type = $(this).attr('type');
    if (type == 'checkbox') {
      $(this).prop('checked', val == 'yes');
    } else if (type == "number") {
      $(this).val(compareVal(this, val)).attr("value", compareVal(this, val));
    } else if ($(this).is('a')) {
      $(this).attr("title", val == "" || val == "null" ? not_config : val).text(val == "" || val == "null" ? not_config : val);
    } else {
      $(this).val(val);
    }
  })
}

function remove(obj) {
  var i = $(obj).parents(".box").index();
  dialogConfig["context_list"].splice(i, 1);
  $(obj).parents(".box").remove();
  setConfig();
}

function changeVal(obj) {
  if ($(obj).is("select")) {
    var i = $(obj).parents(".box").index();
    var val = dialogConfig["context_list"][i];
    dialogConfig["context_list"][i] = val.substr(0, val.indexOf(",") + 1) + $(obj).val()
  }
  setConfig();
}

function biOnSelectedPath(key, path) {
  if (key == "context_list") {
    if (!Boolean(path)) return;
    var count = 0;
    for (var i of dialogConfig["context_list"]) {
      var val = i.substr(0, i.indexOf(","));
      if (path == val) {
        count++;
        return;
      }
    }
    if (count == 0) {
      dialogConfig["context_list"].push(path + ",0");
      $(".content").append("<div class=\"box fixclear\"><a href=\"javascript:;\" class=\"left\">" + path + "</a><img src=\"bus-raw-file-device/img/del.png\" class=\"right\" onclick=\"remove(this)\" alt=\"delete\"></div>");
    }
  } else {
    if (!Boolean(path)) {
      $('[name=' + key + ']').removeAttr('title').text(not_config).removeClass("red");
      dialogConfig[key] = path;
    } else {
      var text = path + (reg.test(path) ? "\\" : "/");
      $('[name=' + key + ']').attr('title', text).text(text).removeClass("red");
      dialogConfig[key] = text;
    }
  }
  setConfig();
}

function biOnQueriedFileExist(exist, path) {
  if (!exist) {
    $(".content a").each(function () {
      if ($(this).text() == path) {
        $(this).addClass("red");
        return;
      }
    })
  }
}