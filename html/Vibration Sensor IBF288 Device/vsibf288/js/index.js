//2023/11/13 

/*---------------正则验证 ip/port --------------*/
$("input").on("keyup", function () {
  if (["ip", "id"].includes($(this).attr("name"))) {
    if ($(this).is(":valid")) {
      if ($(this).attr("name") == "id") {
        var v = "0x" + Number($(this).val()).toString(16);
        $(".id").text(v).attr("title", v);
      }
      $(this).attr("value", $(this).val());
      setConfig();
    }
  } else {
    setConfig()
  }

}).on("blur", function () {
  $(this).val($(this).attr('value'));
  setConfig();
})

/*----------配置读取与存储-----------*/
$('[name]').on("change", function () {
  setConfig();
});

/*---------------input [type=number]--------------*/
$('.VSIBF288').on("change", "input[type=number]", function () {
  $(this).val(compareVal(this, $(this).val()));
}).on('input', "input[type=number]", function (e) {
  if (e.which == undefined) {
    $(this).attr("value", $(this).val());
  } else {
    $(this).attr("value", compareVal(this, $(this).val()))
  }
  setConfig();
}).on('keypress', "input[type=number]", function (e) {
  if (!(e.charCode >= 48 && e.charCode <= 57) && !(e.charCode == 45 || e.charCode == 46)) return false;
})

function compareVal(obj, val) {
  var step = $(obj).attr('step').length > 2 ? $(obj).attr('step').length - 2 : 0;
  var v = Number(val);
  var newVal = "";
  if (isNaN(val) || !Boolean(val)) {
    newVal = Number($(obj).attr('value'));
  } else {
    var min = Number($(obj).attr('min')),
      max = Number($(obj).attr('max'));
    v = v < min ? min : v;
    v = v > max ? max : v;
    if (step > 0) {
      newVal = Math.round((Math.abs(v) * Math.pow(10, step)).toFixed(1)) / Math.pow(10, step);
      if (v < 0) newVal = -newVal;
    } else {
      newVal = Math.floor(v);
    }
  }
  return step > 0 ? newVal.toFixed(step) : newVal;
}

//保存配置
function setConfig() {
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root  ";
  $('.VSIBF288 [name]').each(function () {
    var name = $(this).attr('name');
    var val = $(this).val();
    var type = $(this).attr('type');
    if (type == 'checkbox') {
      text += name + "=\"" + ($(this).is(':checked') ? "yes" : "no") + "\" ";
    } else if (type == "number") {
      text += name + "=\"" + compareVal(this, val) + "\" ";
    } else {
      text += name + "=\"" + val + "\" ";
    }
  });
  text += " triggervalues=\"";
  $(".triggerVal").each(function (i) {
    var v = $(this).val().trim() == "" ? 0 : $(this).val();
    text += v + (i < 7 ? "," : "");
  })
  text += "\"";
  text += " />";
  biSetModuleConfig("VSIBF288", text);
}

function biOnInitEx(config, moduleConfigs) {
  var lang = biGetLanguage() == 1 ? en : zh;
  $('[language]').each(function () {
    var value = $(this).attr('language');
    $(this).text(lang[value])
  });
  for (var key in moduleConfigs) {
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(moduleConfigs[key], "text/xml");
    var obj = new Object();
    var root = xmlDoc.getElementsByTagName('root');
    var keys = root[0].attributes;
    for (var i = 0; i < keys.length; i++) {
      //获取root自身字节的属性
      obj[keys[i].nodeName] = keys[i].nodeValue;
    }
    loadConfig(obj);
  }
}

function loadConfig(obj) {
  $('.VSIBF288 [name]').each(function () {
    var name = $(this).attr("name");
    var val = obj[name];
    if (!Boolean(val)) return;
    var type = $(this).attr('type');
    if (type == 'checkbox') {
      $(this).prop('checked', val == 'yes');
    } else if (type == "text") {
      if (name == "id") {
        $(this).val(val);
        var v = "0x" + Number(val).toString(16);
        $(".id").text(v).attr("title", "0x" + v);
      } else {
        $(this).val(val);
      }
    }else {
      $(this).val(val);
    }
  })
  var triggerVal = obj["triggervalues"].split(",");
  $(".triggerVal").each(function (i) {
    $(this).val(compareVal(this, triggerVal[i]));
  })
}
