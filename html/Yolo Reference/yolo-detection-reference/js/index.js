// 2023/10/26 v1.0.0 首个版本
// 2023/10/27 v1.1.0 新增参数：mosaicProcess
//  2023/10/31 v1.1.1 修复:超链接无法选文件
var not_config = "";
var xml;
$("a").on("click", function () {
  if (!$(this).hasClass("disabled_a")) {
    var name = $(this).attr("name");
    if (name == "modelPath") {
      biSelectPath(name, 1, { ".onnx": "model file" });
    } else if (name == "classNamesPath") {
      biSelectPath(name, 1, { ".txt": "model file" });
    } else if (name == "inputPath") {
      biSelectPath(name, 3, null);
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
  getXml();
});

$("body").on("blur", "input[type=number]", function () {
  $(this).attr("value", compareVal(this, $(this).val())).val(compareVal(this, $(this).val()));
});

$('[name]').on("change", function () {
  getXml();
});

$('button').on({
  'click': function () {
    if ($("[name=inputPath]").text()) biRunStandaloneTask("YoloDetectionReference", "yolo-detection-task.pluginyolodetection", xml)
  }
})

function biOnSelectedPath(key, path) {
  if (path == null) {
    $('[name=' + key + ']').removeAttr('title').text(not_config);
  } else {
    var txt = path;
    if (key == "inputPath") {
      var split = /[a-zA-Z]:/.test(path) ? "\\" : "/";
      txt = path + split;
    }
    $('[name=' + key + ']').attr('title', txt).text(txt);
  }
  getXml();
}

//获取供保存配置和独立任务使用的xml
function getXml() {
  xml = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root ";
  $('.container [name]').each(function () {
    var name = $(this).attr('name');
    var val = $(this).val();
    var type = $(this).attr('type');
    if (type == 'checkbox') {
      xml += name + "=\"" + ($(this).is(':checked') ? "yes" : "no") + "\" ";
    } else if (type == "number") {
      xml += name + "=\"" + compareVal(this, val) + "\" ";
    } else if ($(this).is("a")) {
      var txt = "null";
      if ($(this).text().indexOf(not_config) == -1) {
        txt = $(this).text();
      }
      xml += name + "=\"" + txt + "\" ";
    } else {
      xml += name + "=\"" + val + "\" ";
    }
  });
  xml += " />";
  setConfig();
}

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

//保存配置
function setConfig() {
  biSetModuleConfig("yolo-detection-reference.pluginyolodetection", xml);
}

function biOnInitEx(config, moduleConfigs) {
  var lang = biGetLanguage() == 1 ? en : zh;
  $('[language]').each(function () {
    var value = $(this).attr('language');
    $(this).text(lang[value])
  });
  not_config = lang["not_config"];
  xml = moduleConfigs["yolo-detection-reference.pluginyolodetection"];
  var parser = new DOMParser();
  var xmlDoc = parser.parseFromString(xml, "text/xml");
  var obj = new Object();
  var root = xmlDoc.getElementsByTagName('root');
  var keys = root[0].attributes;
  for (var i = 0; i < keys.length; i++) {
    //获取root自身字节的属性
    obj[keys[i].nodeName] = keys[i].nodeValue;
  }
  loadConfig(obj);
}

function loadConfig(obj) {
  $('.container [name]').each(function () {
    var name = $(this).attr("name");
    var val = obj[name];
    if (!Boolean(val)) return;
    var type = $(this).attr('type');
    if (type == 'checkbox') {
      $(this).prop('checked', val == 'yes');
      // if (name == "referenceEnable") checkboxChange(this);
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