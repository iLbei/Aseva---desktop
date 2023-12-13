//2023/10/9 v1.8.0 新增realTimeThread;ip/port由js判定改为css+js
//  2023/10/13 v1.8.1 界面文本框对齐问题
var configs = [];
var realTimeThread = false;
//tab分页
$(".item>li").on("click", function () {
  $(this).addClass("active").siblings().removeClass("active");
  var i = $(".active").index();
  getContentVal(i);
})

function getContentVal(i) {
  $('.content>fieldset').each(function () {
    var parentName = $(this).find("legend").attr("language");
    $(this).find("[name]").each(function () {
      var name = $(this).attr("name");
      var val = configs[i][parentName][name];
      var type = $(this).attr('type');
      if (type == 'checkbox') {
        $(this).prop('checked', val == 'yes' ? true : false);
      } else if (type == "number") {
        $(this).val(compareVal(this, val));
      } else {
        $(this).val(val);
        if (["srcIP", "srcPort"].includes(name)) $(this).attr("value", val);
      }
    })
  })
}

$("body").on("input", "input[type=number]", function (e) {
  var v = $(this).val();
  if (isNaN(e.which)) {
    $(this).attr("value", compareVal(this, v)).val(compareVal(this, v))
  } else {
    $(this).attr("value", v);
  }
  setConfig();
});

$("body").on("blur", "input[type=number]", function () {
  $(this).attr("value", compareVal(this, $(this).val())).val(compareVal(this, $(this).val()));
});

$("[name=srcIP],[name=srcPort]").on("keyup", function () {
  if ($(this).is(":valid")) {
    $(this).attr("value", $(this).val());
    changeVal(this);
  }
}).on("blur", function () {
  $(this).val($(this).attr('value'));
  changeVal(this);
})

/*--------------不能使用统一的替换！---------------*/
//有input type=number 情况下比较大小
function compareVal(obj, val) {
  var step = $(obj).attr('step').length > 2 ? $(obj).attr('step').length - 2 : 0,
    v = Number(val),
    newVal = 0;
  if (isNaN(v)) {
    newVal = Number($(obj).attr('value'));
  } else {
    var min = Number($(obj).attr('min'));
    if (!["cutoff_time_length", "cutoff_start_time"].includes($(obj).attr("name"))) {
      var max = Number($(obj).attr('max'));
      v = v > max ? max : v;
    }
    v = v < min ? min : v;
    if (step > 0) {
      newVal = Math.round(Math.abs(v) * Math.pow(10, step)) / Math.pow(10, step);
      if (v < 0) newVal = -newVal;
    } else {
      newVal = Math.floor(v);
    }
  }
  return step > 0 ? newVal.toFixed(step) : newVal;
}

/*----------配置读取与存储-----------*/
// 表单内容改变保存配置
$(".container").on("change", "[name]", function () {
  var name = $(this).attr("name");
  if (name == "realTimeThread") {
    setConfig();
  } else {
    changeVal(this);
  }
});

function changeVal(obj) {
  var i = $(".active").index();
  var key = $(obj).parents("ul").parent().find('legend').attr("language");
  var name = $(obj).attr("name");
  var val = $(obj).val();
  var type = $(obj).attr('type');
  if (type == 'checkbox') {
    configs[i][key][name] = $(obj).is(':checked') ? "yes" : "no";
  } else if (type == "number") {
    configs[i][key][name] = compareVal(obj, val);
  } else {
    configs[i][key][name] = val;
  }
  setConfig();
}

//保存配置
function setConfig() {
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root";
  text += " realTimeThread=\"" + ($("[name=realTimeThread]").is(":checked") ? "yes" : "no") + "\">";
  for (var i = 0; i < configs.length; i++) {
    for (let j in configs[i]) {
      text += "<" + j + (i + 1);
      for (let k in configs[i][j]) {
        text += " " + k + "=\"" + configs[i][j][k] + "\"";
      }
      text += "/>";
    }
  }
  text += "</root>";
  biSetModuleConfig("data-dispatcher.asplugindatadispatcher", text);
}

//初始化
function biOnInitEx(config, moduleConfigs) {
  var lang = biGetLanguage() == 1 ? en : zh;
  $('[language]').each(function () {
    var value = $(this).attr('language');
    $(this).text(lang[value]);
  });
  for (var i = 0; i < $(".item>li").length; i++) {
    configs.push([]);
  }
  for (var key in moduleConfigs) {
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(moduleConfigs[key], "text/xml");
    realTimeThread = xmlDoc.getElementsByTagName('root')[0].attributes[0].nodeValue == "yes";
    var child = xmlDoc.getElementsByTagName('root')[0].childNodes;
    for (var j = 1; j <= configs.length; j++) {
      for (var count = j * 4 - 4; count < j * 4; count++) {
        var obj = {};
        var keys = child[count].attributes;
        for (var k in keys) {
          obj[keys[k].nodeName] = keys[k].nodeValue;
        }
        switch (count % 4) {
          case 0: {
            configs[j - 1]["bus"] = obj;
            break;
          }
          case 1: {
            configs[j - 1]["video"] = obj;
            break;
          }
          case 2: {
            configs[j - 1]["ethernet"] = obj;
            break;
          }
          case 3: {
            configs[j - 1]["general"] = obj;
            break;
          }
        }
      }
    }
    loadConfig();
  }
}

function loadConfig() {
  if (configs == null) return;
  getContentVal($(".active").index());
  $("[name=realTimeThread]").attr("checked", realTimeThread);
}