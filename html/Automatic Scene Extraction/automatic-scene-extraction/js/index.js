$('[name]').change(function () {
  setConfig();
});
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
    newVal = Math.round(Math.abs(v) * Math.pow(10, step)) / Math.pow(10, step);
    if (v < 0) newVal = -newVal;
  }
  return step > 0 ? newVal.toFixed(step) : newVal;
}

/**
 * 写配置
 */
function setConfig() {
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root ";
  var facnames = [];
  $('.container [name]').each(function () {
    var name = $(this).attr('name');
    var val = $(this).val();
    var type = $(this).attr('type');
    if (type == 'checkbox' && name != "enable" && $(this).is(":checked")) {
      facnames.push(name);
    } else if (type == "number") {
      text += name + "=\"" + compareVal(this, val) + "\" ";
    } else if ($(this).is("a")) {
      text += name + "=\"" + $(this).html() + "\" ";
    } else if($(this).is("select")){
      text += name + "=\"" + val + "\" ";
    }
  });
  text += "enable" + "=\"" + $("[name=enable]").is(':checked') + "\" ";
  text += "facnames" + "=\"" + facnames.join(",") + "\" ";
  text += " />";
  biSetModuleConfig("automatic-scene-extraction.pluginautomaticscene", text);
}

/**
 *  页面加载时,读取本地配置
 */
function loadConfig(config) {
  $('.container [name]').each(function () {
    var val = config[$(this).attr('name')];
    if (!Boolean(val)) return;
    var type = $(this).attr('type');
    if (type == 'checkbox') {
      $(this).prop('checked', val == 'true');
    } else if (type == "number") {
      $(this).val(compareVal(this, val));
    } else if ($(this).is('a')) {
      $(this).attr("title", val == "" || val == "null" ? not_config : val).html(val == "" || val == "null" ? not_config : val);
    } else {
      $(this).val(val);
    }
  })
  var facnames = config["facnames"].split(",");
  for (var i of facnames) {
    if (Boolean(i)) $(".container input[name=" + i + "]").prop("checked", true);
  }
}

function biOnInitEx(config, moduleConfigs) {
  $('[language]').each(function () {
    var value = $(this).attr('language');
    $(this).text(biGetLanguage() == 1 ? en[value] : cn[value])
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