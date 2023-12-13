$('.container').on('change', 'input', function () {
  if ($(this).attr('type') == 'number') $(this).val(compareVal(this, $(this).val()));
  if ($(this).attr("name") == "enable") checkboxChange(this);
})

function checkboxChange(obj) {
  if (!$(obj).is(':checked')) {
    $('.container>div:nth-child(2) [name]').addClass('disabled_background').attr('disabled', true);
    $(".container>div:nth-child(2) span,p").addClass('disabled_a');
  } else {
    $('.container>div:nth-child(2) [name]').removeClass('disabled_background').attr('disabled', false);
    $(".container>div:nth-child(2) span,p").removeClass('disabled_a');
  }
}
$('.container').on('input', 'input', function () {
  setConfig();
})

$(function () {
  for (var i = 1; i <= 16; i++) {
    $('.container>div:nth-child(2)').append("<ul class=\"fixclear\"><li><span><b language=\"channel\"> </b>" + i + "</span></li><li><span>nomBrp:</span><input type=\"number\" name=\"nomBrp\" value=\"1\" max=\"100\" min=\"0\" step=\"1\"></li><li><span>nomTseg1:</span><input type=\"number\" name=\"nomTseg1\" value=\"1\" max=\"100\" min=\"0\" step=\"1\"></li><li><span>nomTseg2:</span><input type=\"number\" name=\"nomTseg2\" value=\"1\" max=\"100\" min=\"0\" step=\"1\"></li><li><span>nomSjw:</span><input type=\"number\" name=\"nomSjw\" value=\"1\" max=\"100\" min=\"0\" step=\"1\"></li><li><span>dataBrp:</span><input type=\"number\" name=\"dataBrp\" value=\"1\" max=\"100\" min=\"0\" step=\"1\"></li><li><span>dataTseg1:</span><input type=\"number\" name=\"dataTseg1\" value=\"1\" max=\"100\" min=\"0\" step=\"1\"></li><li><span>dataTseg2:</span><input type=\"number\" name=\"dataTseg2\" value=\"1\" max=\"100\" min=\"0\" step=\"1\"></li><li><span>dataSjw:</span><input type=\"number\" name=\"dataSjw\" value=\"1\" max=\"100\" min=\"0\" step=\"1\"></li><li><span>fclockmhz:</span><input type=\"number\" name=\"fclockmhz\" value=\"40\" max=\"100\" min=\"0\" step=\"1\"></li></ul>");
  }
})

function loadConfig(config) {
  if (config == null) return;
  $(".container>div:nth-child(1) [name]").each(function () {
    config[$(this).attr("name")] == "yes" ? $(this).prop('checked', true) : $(this).removeAttr('checked');
    checkboxChange(this);
  })
  var arr = config.arr;
  for (var k in arr) {
    $(".container>div:nth-child(2)>ul:nth-child(" + (Number(k) + 2) + ")").find('input').each(function () {
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
  $('.container>div:nth-child(2)>ul').each(function (i) {
    text += "<arm_can" + (i + 1) + " ";
    $(this).find('[name]').each(function () {
      text += " " + $(this).attr('name') + "=\"" + $(this).val() + "\"";
    });
    text += " />";
  });
  text += "</root>";
  biSetModuleConfig("arm-can-transmitter.aspluginarmcantransmitter", text);
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
  if (isNaN(v)) {
    v = Number($(obj).attr('value'));
  }
  v = v < min ? min : v;
  v = v > max ? max : v;
  newVal = Math.round(Math.abs(v) * Math.pow(10, step)) / Math.pow(10, step);
  if (v < 0) newVal = -newVal;
  return newVal.toFixed(step);
}