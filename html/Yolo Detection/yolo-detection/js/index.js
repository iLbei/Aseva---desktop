//2023/10/12 v1.0.0 首个版本
//2023/10/13 v1.1.0 新增detection area
//2023/10/17 v1.2.0 新增参数：Image width、Image height
//2023/10/18 v1.3.0 新增参数:distanceThresh、minContourSize
//2023/10/19 v1.4.0 新增参数:outputBatch,outputWidth,outputHeight
//  2023/10/19 v1.4.1 更改outputWidth和outputHeight位置
//  2023/10/19 v1.4.2 更改confidenceThresh,nmsThresh,objectThresh为保留小数点后三位的值
//2023/10/19 v1.5.0 新增参数:borderWidth, borderHeight, maxRectangleWidth, maxRectangleHeight
//  2023/10/19 v1.5.1 除前三个以外，其他最大值由10000改为100000
//  2023/11/1 v1.5.2 修复超链接点击无法打开弹窗问题
// 2023/11/8 1.6.0 新增preProcess
var not_config = "";
$("a").on("click", function () {
  if (!$(this).hasClass("disabled_a")) {
    var name = $(this).attr("name");
    if (name == "modelPath") {
      biSelectPath(name, 1, { ".onnx": "model file" });
    } else if (name == "classNamesPath") {
      biSelectPath(name, 1, { ".txt": "model file" });
    }
  }
})
//仅步长=精确位数-1时适用
$("body").on("input", "input[type=number]", function (e) {
  var v = $(this).val();
  if (isNaN(e.which)) {
    $(this).attr("value", compareVal(this, v)).val(compareVal(this, v))
  } else {
    if (v !== 0 && Boolean(v)) $(this).attr("value", v);
  }
  setConfig();
});
$("body").on("blur", "input[type=number]", function () {
  $(this).attr("value", compareVal(this, $(this).val())).val(compareVal(this, $(this).val()));
});

function compareVal(obj, val) {
  var newVal = 0;
  var step = Number($(obj).attr("step").length) - 1;
  if (val !== 0 && (isNaN(val) || !Boolean(val))) {
    newVal = Number($(obj).attr('value'));
    return newVal.toFixed(step);
  } else {
    var min = 0,
      max = 1;
    if (["imageWidth", "imageHeight", "distanceThresh", "minContourSize", "outputBatch", "outputHeight", "outputWidth", "borderWidth", "borderHeight", "maxRectangleWidth", "maxRectangleHeight"].includes($(obj).attr("name"))) {
      min = 1; max = 1000000;
    }
    if (["confidenceThresh", "nmsThresh", "objectThresh"].includes($(obj).attr("name"))) {
      step = 3;
    }
    if (val > max) {
      return max.toFixed(step);
    } else if (val < min) {
      return min.toFixed(step);
    } else {
      //解决为负数时末尾输入5不能进行四舍五入
      newVal = Math.round(Math.abs(val) * Math.pow(10, step)) / Math.pow(10, step);
      if (val < 0) newVal = -newVal;
      if (step > 0) {
        var newValString = newVal.toString();
        var index = newValString.indexOf(".");
        if (index == -1) {
          return newVal.toFixed(step);
        } else {
          if (newValString.substring(index + 1).length == step) {
            return newVal;
          } else {
            return newVal + "0".repeat(step - (newValString.length - 2));
          }
        }
      } else {
        return newVal;
      }
    }
  }
}

/*----------配置读取与存储-----------*/
$('[name]').on("change", function () {
  if ($(this).attr("name") == "detectionEnable") {
    checkboxChange(this);
  }
  setConfig();
});

//保存配置
function setConfig() {
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root ";
  $('.container [name]').each(function () {
    var name = $(this).attr('name');
    var val = $(this).val();
    var type = $(this).attr('type');
    if (type == 'checkbox') {
      text += name + "=\"" + ($(this).is(':checked') ? "yes" : "no") + "\" ";
    } else if (type == "number") {
      text += name + "=\"" + compareVal(this, val) + "\" ";
    } else if ($(this).is("a")) {
      var txt = "null";
      if ($(this).text().indexOf(not_config) == -1) {
        txt = $(this).text();
      }
      text += name + "=\"" + txt + "\" ";
    } else {
      text += name + "=\"" + val + "\" ";
    }
  });
  text += " />";
  biSetModuleConfig("yolo-detection.pluginyolodetection", text);
}

function biOnInitEx(config, moduleConfigs) {
  var lang = biGetLanguage() == 1 ? en : zh;
  $('[language]').each(function () {
    var value = $(this).attr('language');
    $(this).text(lang[value])
  });
  not_config = lang["not_config"];
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
    var name = $(this).attr("name");
    var val = obj[name];
    if (!Boolean(val)) return;
    var type = $(this).attr('type');
    if (type == 'checkbox') {
      $(this).prop('checked', val == 'yes');
      if (name == "detectionEnable") checkboxChange(this);
    } else if (type == "number") {
      var v = compareVal(this, val);
      $(this).val(v).attr("value", v);
    } else if ($(this).is('a')) {
      val = val == "" || val == "null" ? not_config : val;
      if (val != "") {
        $(this).attr({ "title": val }).text(val);
      }
    } else {
      $(this).val(val);
    }
  })
}

//部分界面Enable控制界面是否启用
function checkboxChange(obj) {
  if (!$(obj).is(':checked')) {
    $('ul>li input,ul>li select').addClass('disabled_background').attr('disabled', true);
    $("ul>li [language],ul>li a").addClass('disabled_a');
  } else {
    $('ul>li input,ul>li select').removeClass('disabled_background').attr('disabled', false);
    $("ul>li [language],ul>li a").removeClass('disabled_a');
  }
}

function biOnSelectedPath(key, path) {
  if (path == null) {
    $('[name=' + key + ']').removeAttr('title').text(not_config);
  } else {
    $('[name=' + key + ']').attr('title', path).text(path);
  }
  setConfig();
}