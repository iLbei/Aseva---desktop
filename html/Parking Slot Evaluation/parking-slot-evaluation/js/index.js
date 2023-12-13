var not_config = "",
  dialogConfig = {};
$("a").click(function () {
  var name = $(this).attr("name");
  var originValueID = $(this).attr("id");
  var scale = $(this).attr("scale");
  biSelectSignal(name, originValueID, false, "", true, scale, "");
})

function biOnSelectedSignal(key, valueSignalInfo, signBitSignalInfo, scale) {
  if (Boolean(valueSignalInfo)) {
    if (!Boolean(valueSignalInfo.typeName)) {
      return;
    } else {
      $("[name=" + key + "]").text(valueSignalInfo.signalName).addClass("green").removeClass("red").attr({
        "scale": scale,
        "id": valueSignalInfo.id,
        "title": valueSignalInfo.id
      });
    }

  } else {
    $("[name=" + key + "]").removeClass("green red").removeAttr("title").text(not_config).attr({
      "scale": "1",
      "id": ""
    });
  }
  setConfig();
}
/*----------配置读取与存储-----------*/
$('[name]').change(function () {
  if ($(this).is("input[type=checkbox]")) checkboxChange(this);
  setConfig();
});
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
      text += name + "=\"" + ($(this).attr("id") == "" ? "null" : $(this).attr("id")) + "\" ";
      text += name + "_scale" + "=\"" + $(this).attr("scale") + "\" ";
    } else {
      text += name + "=\"" + val + "\" ";
    }
  });
  text += " /></root>";
  biSetModuleConfig("parking-slot-evaluation.aspluginparkingslotevaluation", text);
}

function biOnInitEx(config, moduleConfigs) {
  if (biGetLanguage() == 1) {
    $('[language]').each(function () {
      var value = $(this).attr('language');
      $(this).text(en[value]);
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
    var root = xmlDoc.getElementsByTagName('root');
    var keys = root[0].children[0].attributes;
    for (var i = 0; i < keys.length; i++) {
      //获取root自身字节的属性
      dialogConfig[keys[i].nodeName] = keys[i].nodeValue;
    }
    loadConfig(dialogConfig);
  }
}

function loadConfig(obj) {
  $('.container [name]').each(function () {
    var name = $(this).attr('name');
    var val = obj[name];
    var scale = obj[name + "_scale"];
    if (!Boolean(val)) return;
    var type = $(this).attr('type');
    if (type == 'checkbox') {
      $(this).prop('checked', val == 'yes');
      checkboxChange(this);
    } else if (type == "number") {
      $(this).val(compareVal(this, val));
    } else if ($(this).is('a')) {
      if (val == "" || val == "null") {
        $(this).text(not_config);
      } else {
        $(this).attr("scale", scale);
        biQuerySignalInfo(name, val);
      }
    } else {
      $(this).val(val);
    }
  })
}

function biOnQueriedSignalInfo(key, signalInfo) {
  if (Boolean(signalInfo)) {
    $("[name =" + key + "]").attr({
      "title": signalInfo.id,
      "id": signalInfo.id
    }).text(signalInfo.signalName).addClass("green");
  } else {
    $("[name =" + key + "]").attr({
      "id": dialogConfig[key],
      "title": dialogConfig[key]
    }).text(dialogConfig[key]).addClass("red");
  }

}
//部分界面Enable控制界面是否启用
function checkboxChange(obj) {
  if (!$(obj).is(':checked')) {
    $(".content [language],p,a").addClass('disabled');
  } else {
    $(".content [language],p,a").removeClass('disabled');
  }
}