var not_config = "";

/*---------------input [type=text] 正则验证 ip--------------*/
$('[type=text]').on("keyup", function (e) {
  var val = $(this).val();
  Number(val) || val == 0 ? $(this).addClass('green').attr('value', val).removeClass('red') : $(this).removeClass('green').addClass('red');
  if (!$(this).hasClass('red')) setConfig();
})

/*---------------input [type=number]--------------*/
$('input[type=number]').on({
  "change": function () {
    $(this).val(compareVal(this, $(this).val()));
  },
  'input': function (e) {
    if (e.which == undefined) {
      var step = $(this).attr("step").length - 2;
      var val = Number($(this).val());
      $(this).val(step > 0 ? val.toFixed(step) : val);
    }
    setConfig();
  },
  'keypress': function (e) {
    if (!(e.charCode >= 48 && e.charCode <= 57) && !(e.charCode == 45 || e.charCode == 46)) {
      return false;
    }
  }
})

function compareVal(obj, val) {
  var step = $(obj).attr('step').length > 2 ? $(obj).attr('step').length - 2 : 0,
    v = Number(val),
    newVal = 0;
  if (isNaN(v)) {
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

/*----------配置读取与存储-----------*/
$('[name]').change(function () {
  setConfig();
});

//保存配置
function setConfig() {
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root ";
  $('.container [name]').each(function () {
    var name = $(this).attr('name');
    var val = $(this).val();
    var type = $(this).attr('type');
    if (!["cal_dx", "cal_dy"].includes(name)) {
      if (type == 'checkbox') {
        text += name + "=\"" + ($(this).is(':checked') ? "yes" : "no") + "\" ";
      } else if (type == "number") {
        text += name + "=\"" + compareVal(this, val) + "\" ";
      } else if ($(this).is("a")) {
        text += name + "=\"" + $(this).html() + "\" ";
      } else {
        text += name + "=\"" + val + "\" ";
      }
    }
  });
  text += " />";
  biSetModuleConfig("v2v-object-converter.pluginv2vutilities", text);
}

$(function () {
  if (biGetLanguage() == 1) {
    $('[language]').each(function () {
      var value = $(this).attr('language');
      $(this).text(en[value])
    });
  } else {
    $('[language]').each(function () {
      var value = $(this).attr('language');
      $(this).text(cn[value]);
    });
  }
})

function biOnInitEx(config, moduleConfigs) {
  if (biGetLanguage() == 1) {
    $('[language]').each(function () {
      var value = $(this).attr('language');
      $(this).text(en[value])
    });
  } else {
    $('[language]').each(function () {
      var value = $(this).attr('language');
      $(this).text(cn[value]);
    });
  }
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
  $('.container [name]').each(function () {
    var val = obj[$(this).attr('name')];
    if (!Boolean(val)) return;
    var type = $(this).attr('type');
    if (type == 'checkbox') {
      $(this).prop('checked', val == 'yes');
    } else if (type == "number") {
      $(this).val(compareVal(this, val));
    } else if ($(this).is('a')) {
      $(this).attr("title", val == "" || val == "null" ? not_config : val).html(val == "" || val == "null" ? not_config : val);
    } else {
      $(this).val(val);
    }
  })
  $("input[type = text]").addClass('green');
}

$("button").click(function () {
  var x = Number($("[name=cal_dx]").val());
  var y = Number($("[name=cal_dy]").val());
  $(".angle").val(Math.round(Math.atan2(y, x) * 180 / Math.PI * 100) / 100)
})