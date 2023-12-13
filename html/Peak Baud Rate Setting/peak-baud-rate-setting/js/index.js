$('.container').on('change', 'input', function () {
  if ($(this).attr('type') == 'number') $(this).val(compareVal(this,$(this).val()));
})
$('.container').on('input', 'input', function () {
  setConfig();
})
$(function () {
  for (var i = 1; i <= 16; i++) {
    $('.container').append("<ul class=\"fixclear\"><li><span><b language=\"channel\"> </b>" + i + "</span></li><li><span>can_ps:</span><input type=\"number\" name=\"can_ps\" value=\"1\" max=\"128\" min=\"1\" step=\"1\"></li><li><span>can_tseg1:</span><input type=\"number\" name=\"can_tseg1\" value=\"1\" max=\"512\" min=\"1\" step=\"1\"></li><li><span>can_tseg2:</span><input type=\"number\" name=\"can_tseg2\" value=\"1\" max=\"512\" min=\"1\" step=\"1\"></li><li><span>can_sjw:</span><input type=\"number\" name=\"can_sjw\" value=\"1\" max=\"128\" min=\"1\" step=\"1\"></li><li><span>canFD_ps:</span><input type=\"number\" name=\"canFD_ps\" value=\"1\" max=\"128\" min=\"1\" step=\"1\"></li><li><span>canFD_tseg1:</span><input type=\"number\" name=\"canFD_tseg1\" value=\"1\" max=\"512\" min=\"1\" step=\"1\"></li><li><span>canFD_tseg2:</span><input type=\"number\" name=\"canFD_tseg2\" value=\"1\" max=\"512\" min=\"1\" step=\"1\"></li><li><span>canFD_sjw:</span><input type=\"number\" name=\"canFD_sjw\" value=\"1\" max=\"128\" min=\"1\" step=\"1\"></li><li><span>f_clock_mhz:</span><input type=\"number\" name=\"clock_frequency\" value=\"40\" max=\"80\" min=\"20\" step=\"1\"></li></ul>");
  }
})
function loadConfig(config) {
  if (config == null) return;
  $(".container>div:nth-child(1) [name]").each(function () {
    config[$(this).attr("name")] == "yes" ? $(this).prop('checked', true) : $(this).removeAttr('checked');
  })
  var arr = config.arr;
  for (var k in arr) {
    $(".container>ul:nth-child(" + (Number(k) + 2) + ")").find('input').each(function () {
      $(this).val(compareVal(this, arr[k][$(this).attr('name')]));
    })
  }
}
function setConfig() {
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?>";
  text += "<root"
  $('input[type=checkbox]').each(function () {
    var val = $(this).is(':checked') ? "yes" : "no";
    text += " " + $(this).attr('name') + "=\"" + val + "\"";
  })
  text += ">";
  $('.container>ul').each(function () {
    text += "<parameterConfig ID=\"Channel " + $(this).index() + "\"";
    $(this).find('[name]').each(function () {
      text += " " + $(this).attr('name') + "=\"" + $(this).val() + "\"";
    });
    text += " />";
  });
  text += "</root>";
  biSetModuleConfig("peak-baud-rate-setting.peak", text);
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
    max = Number($(obj).attr('max')),
    newVal = 0;
  if (isNaN(v)) { v = Number($(obj).attr('value')); }
  v = v < min ? min : v;
  v = v > max ? max : v;
  newVal = Math.round(Math.abs(v) * Math.pow(10, step)) / Math.pow(10, step);
  if (v < 0) newVal = -newVal;
  return newVal.toFixed(step);
}