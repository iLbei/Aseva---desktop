var channels = [];
$('[name]').change(function () {
  if ($(this).attr('name') == 'ip') return;
  setConfig();
});

function compareVal(obj, val) {
  var step = $(obj).attr('step').length > 2 ? $(obj).attr('step').length - 2 : 0,
    v = Number(val);
  if (isNaN(val) || !Boolean(val)) {
    newVal = Number($(obj).attr('value'));
  } else {
    var v = Number(val);
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
/*---------------input [type=number]--------------*/
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

function setConfig() {
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root";
  text += " enable" + "=\"" + ($('[name=connect]').get(0).checked == true ? "true" : "false") + "\"";
  text += " ip" + "=\"" + $('[name=ip]').val() + "\"";
  text += " port" + "=\"" + ($('[name=port]').val() != '' ? parseInt($('[name=port]').val()) : "") + "\"";
  text += "/>";
  biSetModuleConfig("audio-upload.aspluginaudioupload", text);
}

function biOnInitEx(config, moduleConfigs) {
  $('[language]').each(function () {
    var value = $(this).attr('language');
    $(this).html(biGetLanguage() == 1 ? en[value] : cn[value])
  });
  for (var key in moduleConfigs) {
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(moduleConfigs[key], "text/xml");
    var obj = new Object();
    var root = xmlDoc.getElementsByTagName('root');
    var keys = root[0].attributes;
    for (var i = 0; i < keys.length; i++) {
      if (root[0].getAttribute(keys[i]) == "null") {
        obj[keys[i]] = "";
      } else {
        obj[keys[i].nodeName] = keys[i].nodeValue;
      }
    }
    loadConfig(obj);
  }
}

function loadConfig(val) {
  if (val == null) return;
  $('[name=ip]').val(["", "null"].includes(val['ip']) ? "" : val['ip']).addClass('green');
  $('[name=port]').val(compareVal($('[name=port]'), val['port']));
  if (val['enable'] == "true") $('[name=connect]').attr('checked', true);
}
$('[type=text]').on("keyup", function () {
  var reg = /^([1-9]|([1-9][0-9])|(1[0-9][0-9])|(2[0-4][0-9])|(25[0-5]))(\.([0-9]|([1-9][0-9])|(1[0-9][0-9])|(2[0-4][0-9])|(25[0-5]))){3}$/;
  var reg2 = /(http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&amp;:/~\+#]*[\w\-\@?^=%&amp;/~\+#])?/;
  var val = $(this).val();
  reg.test(val) || reg2.test(val) ? $(this).addClass('green').attr('value', val).removeClass('red') : $(this).removeClass('green').addClass('red');
  if (!$(this).hasClass('red')) setConfig();
}).blur(function () {
  if ($(this).val() == "" || $(this).hasClass('red')) {
    $(this).val($(this).attr('value')).addClass('green').removeClass('red');
  } else {
    setConfig();
  }
})