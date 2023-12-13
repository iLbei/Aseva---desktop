var dialogConfig = {};
$("[name]").change(function () {
  setConfig();
})
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
/**
 * ok后，返回到主页面
 */
function setConfig() {
  $('.canBox>.content').find('[name]').each(function () {
    var name = $(this).attr("name");
    var type = $(this).attr("type");
    var vv = $(this).val();
    if (type == "checkbox") {
      dialogConfig[name] = $(this).is(":checked") ? "yes" : "no";
    } else if (type == "number") {
      dialogConfig[name] = compareVal(this, vv);
    } else {
      dialogConfig[name] = $(this).val();
    }
  });

  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root ";
  var circles = "";
  if (dialogConfig["arr"].length > 0) {
    for (var i = 0; i < dialogConfig["arr"].length; i++) {
      var c = dialogConfig["arr"][i];
      circles += "<" + dialogConfig["arr"][i]["name"] + " x=\"" + c.x + "\"" + " y=\"" + c.y + "\"/>";
    }
  }
  for (j in dialogConfig) {
    text += j + "=\"" + dialogConfig[j] + "\" ";
  }
  text += circles == "" ? "/>" : ">" + circles + "</root>";
  biSetModuleConfig("vehicle.pluginplatform", text);
  biSetLocalVariable("vehicle", JSON.stringify(dialogConfig));
}

function biOnInitEx(config, moduleConfigs) {
  $('[language]').each(function () {
    var value = $(this).attr('language');
    $(this).html(biGetLanguage() == 1 ? en[value] : cn[value]);
  });
  for (var key in moduleConfigs) {
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(moduleConfigs[key], "text/xml");
    dataPlayBack(xmlDoc);
  }
}

function dataPlayBack(xmlDoc) {
  var countrys = xmlDoc.getElementsByTagName('root');
  var oKeys = countrys[0].attributes;
  for (var i = 0; i < oKeys.length; i++) {
    dialogConfig[oKeys[i].nodeName] = oKeys[i].nodeValue;
  }
  var arr = [];
  for (var i = 0; i < countrys[0].childNodes.length; i++) {
    var keyss = countrys[0].childNodes[i].attributes;
    var obj = new Object();
    obj["name"] = countrys[0].childNodes[i].nodeName;
    for (var j = 0; j < keyss.length; j++) {
      obj[keyss[j].nodeName] = keyss[j].nodeValue;
    }
    arr.push(obj);
  }
  dialogConfig["arr"] = arr;
  biSetLocalVariable("vehicle", dialogConfig);
  loadConfig(dialogConfig);
}

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

function loadConfig(config) {
  $('.canBox>.content').find('[name]').each(function () {
    var type = $(this).attr("type");
    var val = config[$(this).attr("name")];
    if (type == "checkbox") {
      $(this).prop("checked", val == "yes");
    } else if (type == "number") {
      $(this).val(compareVal(this, val));
    } else if (type != "number") {
      var t = val == "null" ? 0 : val;
      $(this).val(t);
    }
  });
}