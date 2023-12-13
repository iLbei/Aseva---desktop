$('input').change(function () {
  if ($(this).attr('type') != 'number') {
    setConfig();
  }
})

$('.container').on("change", "input[type=number]", function () {
  $(this).val(compareVal(this, $(this).val()));
}).on('input', "input[type=number]", function (e) {
  if (e.which == undefined) {
    var step = $(this).attr("step").length - 2;
    var val = Number($(this).val());
    $(this).val(step > 0 ? val.toFixed(step) : val);
  }
  setConfig();
}).on('keypress', "input[type=number]", function (e) {
  if (!(e.charCode >= 48 && e.charCode <= 57) && !(e.charCode == 45 || e.charCode == 46)) return false;
})

function loadConfig(config) {
  if (config == null) return;
  config.enabled == "yes" ? $('[name=enabled]').prop('checked', true) : $('[name=enabled]').removeAttr('checked');
  var arr = config.arr;
  for (var k in arr) {
    $(".container>div:nth-child(" + (Number(k) + 2) + ") input").each(function () {
      $(this).val(compareVal(this, arr[k][$(this).attr('name')]));
    })
  }
}

function setConfig() {
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?>";
  var val = $('[name=enabled]').get(0).checked == true ? "yes" : "no";
  text += "<root enabled=\"" + val + "\">";
  $('.container>div:not(:nth-child(1))').each(function (i) {
    text += "<parameterConfig ID=\"Channel " + (i + 1) + "\"";
    $(this).find('[name]').each(function () {
      var key = $(this).attr('name');
      text += " " + key + "=\"" + $(this).val() + "\"";
    });
    text += " />";
  });
  text += "</root>";
  biSetModuleConfig("set-kvaser-baud-rate-parameters.kvaserconnectremote", text);
}

function biOnInitEx(config, moduleConfigs) {
  $('[language]').each(function () {
    var value = $(this).attr('language');
    $(this).html(biGetLanguage() == 1 ? en[value] : cn[value])
  });
  for (var key in moduleConfigs) {
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(moduleConfigs[key], "text/xml");
    var countrys = xmlDoc.getElementsByTagName('root');
    var keys = countrys[0].attributes;
    var obj = new Object();
    for (var i = 0; i < keys.length; i++) {
      obj[keys[i].nodeName] = keys[i].nodeValue;
    }
    var arr2 = [];
    for (var i = 0; i < countrys[0].childNodes.length; i++) {
      var keyss = countrys[0].childNodes[i].attributes;
      var o = new Object();
      for (var n = 0; n < keyss.length; n++) {
        o[keyss[n].nodeName] = keyss[n].nodeValue;
      }
      arr2.push(o);
    }
    obj.arr = arr2;
    loadConfig(obj);
  }
}

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