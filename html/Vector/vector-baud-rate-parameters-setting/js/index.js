$('input[type=number]').on({
  "change": function () {
    $(this).val(compareVal(this, $(this).val()));
  },
  'input': function (e) {
    setConfig();
  },
  'keypress': function (e) {
    if (e.charCode == 101 || e.charCode == 43) {
      return false;
    }
  }
})
$('[name]').change(function () {
  setConfig();
})

function loadConfig(config) {
  if (config == null) return;
  config.enabled == "yes" ? $('[name=enabled]').prop('checked', true) : $('[name=enabled]').removeAttr('checked');
  var arr = config.arr;
  for (var k in arr) {
    $(".content>div:eq(" + Number(k) + ")").find('input').each(function () {
      $(this).val(compareVal(this,arr[k][$(this).attr('name')]));
    })
  }
}

/**
 * 写配置
 */
function setConfig() {
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?>";
  var val = $('[name=enabled]').get(0).checked == true ? "yes" : "no";
  text += "<root enabled=\"" + val + "\">";
  $('.content>div').each(function (i) {
    text += "<parameterConfig ID=\"Channel " + (i + 1) + "\"";
    $(this).find('[name]').each(function () {
      text += " " + $(this).attr('name') + "=\"" + $(this).val() + "\"";
    });
    text += " />";
  });
  text += "</root>";
  biSetModuleConfig("vector-baud-rate-parameters-setting.vector", text);
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
    };
    var arr2 = [];
    for (var i = 0; i < countrys[0].childNodes.length; i++) {
      var keyss = countrys[0].childNodes[i].attributes;
      var o = new Object();
      for (var n = 0; n < keyss.length; n++) {
        o[keyss[n].nodeName] = keyss[n].nodeValue;
      };
      arr2.push(o);
    }
    obj.arr = arr2;
    loadConfig(obj);
  }
}
function compareVal(obj, val) {
  var step = $(obj).attr('step').length > 2 ? $(obj).attr('step').length - 2 : 0,
    v = Number(val),
    min = Number($(obj).attr('min')),
    max = Number($(obj).attr('max'));
  if (isNaN(v)) { v = Number($(obj).attr('value')); }
  v = v < min ? min : v;
  v = v > max ? max : v;
  return (Math.round(v * Math.pow(10, step)) / Math.pow(10, step)).toFixed(step);
}
