$('.container').on('change', 'input', function () {
  if ($(this).attr('type') == 'number') $(this).val(compareVal(this,$(this).val()));
  setConfig();
})
$('.container').on('input', 'input', function () {
  setConfig();
})
$(function () {
  for (var i = 0; i <= 23; i++) {
    $('.container').append("<ul class=\"fixclear\"><li><span><b language=\"channel\"> </b>" + i + "</span></li><li><span>nomBrp:</span><input type=\"number\" name=\"nomBrp\" value=\"1\" max=\"1024\" min=\"1\" step=\"1\"></li><li><span>nomTseg1:</span><input type=\"number\" name=\"nomTseg1\" value=\"1\" max=\"256\" min=\"1\" step=\"1\"></li><li><span>nomTseg2:</span><input type=\"number\" name=\"nomTseg2\" value=\"1\" max=\"128\" min=\"1\" step=\"1\"></li><li><span>nomSjw:</span><input type=\"number\" name=\"nomSjw\" value=\"1\" max=\"128\" min=\"1\" step=\"1\"></li><li><span>dataBrp:</span><input type=\"number\" name=\"dataBrp\" value=\"1\" max=\"1024\" min=\"1\" step=\"1\"></li><li><span>dataTseg1:</span><input type=\"number\" name=\"dataTseg1\" value=\"1\" max=\"32\" min=\"1\" step=\"1\"></li><li><span>dataTseg2:</span><input type=\"number\" name=\"dataTseg2\" value=\"1\" max=\"16\" min=\"1\" step=\"1\"></li><li><span>dataSjw:</span><input type=\"number\" name=\"dataSjw\" value=\"1\" max=\"16\" min=\"1\" step=\"1\"></li><li><span>fclockmhz:</span><input type=\"number\" name=\"fclockmhz\" value=\"40\" max=\"80\" min=\"20\" step=\"1\"></li></ul>");
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
    text += " " + $(this).attr('name') + "=\"" + ($(this).is(':checked') ? "yes" : "no") + "\"";
  })
  text += ">";
  $('.container>ul').each(function (i) {
    text += "<parameterConfig ID=\"Channel " + (i+1) + "\"";
    $(this).find('[name]').each(function () {
      text += " " + $(this).attr('name') + "=\"" + $(this).val() + "\"";
    });
    text += " />";
  });
  text += "</root>";
  biSetModuleConfig("armcan-baud-rate-setting.armcan", text);
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
  return newVal.toFixed(step);
}