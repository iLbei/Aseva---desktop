var dialogIndex = "", childConfig = [];
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
      newVal = Math.round(Math.abs(v) * Math.pow(10, step)) / Math.pow(10, step);
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
  $('.calib [name]').each(function () {
    var name = $(this).attr('name');
    var val = $(this).val();
    var type = $(this).attr('type');
    if ((type == 'radio' && $(this).is(":checked")) || type == "number") {
      childConfig[1][dialogIndex][name] = type == 'radio' ? $(this).attr("value") : val;
    }
  });
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root ";
  for (var i in childConfig) {
    for (var j in childConfig[i]) {
      if (Array.isArray(childConfig[i])) {
        for (var k in childConfig[i][j]) {
          text += k + "_" + j + "=\"" + childConfig[i][j][k] + "\" ";
        }
      } else {
        text += j + "=\"" + childConfig[i][j] + "\" ";
      }
    }
  }
  text += " />";
  biSetModuleConfig("generate-calib-truth.app", text);
}

function biOnInitEx(config, moduleConfigs) {
  dialogIndex = config;
  $('[language]').each(function () {
    var value = $(this).attr('language');
    $(this).html(biGetLanguage() == 1 ? en[value] : cn[value]);
  });
  for (var key in moduleConfigs) {
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(moduleConfigs[key], "text/xml");
    var root = xmlDoc.getElementsByTagName('root');
    var keys = root[0].attributes;
    var obj = {}, arr = [];
    for (var i = 0; i < (keys.length - 2) / 8; i++) {
      arr.push({})
    }
    for (var i = 0; i < keys.length; i++) {
      //获取root自身字节的属性
      var name = keys[i].nodeName;
      var val = keys[i].nodeValue;
      if (name.substr(name.length - 2, 1) == "_") {
        var index = name.substr(name.length - 1, 1);
        name = name.substring(0, name.length - 2);
        arr[index][name] = val;
      } else {
        obj[keys[i].nodeName] = val;
      }
    }
    childConfig.push(obj, arr);
  }
  loadConfig(childConfig[1][config]);
}
function loadConfig(arr) {
  for (var i in arr) {
    if (i == "model") {
      $(".calib [name=model][value=" + arr[i] + "]").prop("checked", true);
    } else {
      $(".calib [name=" + i + "]").val(compareVal($("[name=" + i + "]"), arr[i]));
    }
  }
}