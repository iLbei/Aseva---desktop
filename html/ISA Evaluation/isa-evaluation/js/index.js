// 2023/10/18 v1.0.0 首个版本 
// 2023/10/24 v1.1.0 移除scfDisableSignal
var not_config = "";

/*----------配置读取与存储-----------*/
$('[name]').on("change", function () {
  if ($(this).attr("name") == "isaEvaluationEnable") {
    checkboxChange(this);
  }
  setConfig();
});

$("a").on("click", function () {
  if (!$(this).hasClass("disabled_a")) {
    var name = $(this).attr("name");
    var id = $(this).attr("id");
    var scale = $(this).attr("scale");
    biSelectSignal(name, id, false, null, true, scale, null);
  }
})

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
      var txt = "null";
      var scale = 1;
      if ($(this).text().indexOf(not_config) == -1) {
        txt = $(this).attr("id");
        scale = $(this).attr("scale");
      }
      text += name + "=\"" + txt + "\" ";
      text += name + "_scale=\"" + scale + "\" ";
    } else {
      text += name + "=\"" + val + "\" ";
    }
  });
  text += " /></root>";
  biSetModuleConfig("isa-evaluation.aspluginisaevaluation", text);
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
    var name = $(this).attr("name");
    var val = obj[name];
    if (!Boolean(val)) return;
    var type = $(this).attr('type');
    if (type == 'checkbox') {
      $(this).prop('checked', val == 'yes');
      checkboxChange(this);
    } else if ($(this).is('a')) {
      val = val == "" || val == "null" ? not_config : val;
      if (val != "") {
        biQuerySignalInfo(name, val);
        $(this).attr({ "title": val, "id": val, "scale": obj[$(this).attr("name") + "_scale"] }).text(val);
      }
    }
  })
}

//部分界面Enable控制界面是否启用
function checkboxChange(obj) {
  if (!$(obj).is(':checked')) {
    $("ul>li [language]").addClass('disabled_a');
  } else {
    $("ul>li [language]").removeClass('disabled_a');
  }
}

function biOnSelectedSignal(key, valueSignalInfo, signBitSignalInfo, scale) {
  if (valueSignalInfo == null) {
    $('[name=' + key + ']').removeAttr('title id scale').text(not_config).removeClass("green red");
  } else {
    var id = valueSignalInfo.id;
    if (valueSignalInfo.typeName == null) {
      $('[name=' + key + ']').html(id).addClass("red").removeClass("green");
    } else {
      var signalName = valueSignalInfo.signalName;
      $('[name=' + key + ']').html(signalName).addClass("green").removeClass("red");
    }
    $('[name=' + key + ']').attr({ 'title': id, "scale": scale, "id": id });
  }
  setConfig();
}

//加载界面时判断信号是否存在
function biOnQueriedSignalInfo(key, signalInfo) {
  if (signalInfo) {
    $("[name=" + key + "]").text(signalInfo.signalName).addClass("green");
  } else {
    $("[name=" + key + "]").text($("[name=" + key + "]").attr("id")).addClass("red");
  }
}