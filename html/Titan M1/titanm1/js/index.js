var configs = [];
$('[name]').change(function () {
  if ($(this).attr('name') == 'ip') return;
  changeVal(this);
});

function setConfig() {
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root app_mode=\"" + biGetRunningMode() + "\">";
  for (var i in configs) {
    text += "<c" + i + " ";
    for (var j in configs[i]) {
      text += j + "=\"" + configs[i][j] + "\" "
    }
    text += "/>";
  }
  text += "</root>";
  biSetModuleConfig("titanm1.asplugintitanm1", text);
}

function biOnInitEx(config, moduleConfigs) {
  $('[language]').each(function () {
    var value = $(this).attr('language');
    $(this).html(biGetLanguage() == 1 ? en[value] : cn[value])
  });
  for (var key in moduleConfigs) {
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(moduleConfigs[key], "text/xml");
    var root = xmlDoc.getElementsByTagName('root');
    var keys = root[0].childNodes;
    for (var i = 0; i < keys.length; i++) {
      var obj = {};
      for (var j = 0; j < keys[i].attributes.length; j++) {
        var attr = keys[i].attributes[j];
        obj[attr.nodeName] = root[0].getAttribute(attr) == "null" ? "" : attr.nodeValue;
      }
      configs.push(obj);
    }
    loadConfig();
  }
}

function loadConfig() {
  getContentVal(0);
}
$('input[type=number]').on({
  'blur': function () {
    $(this).val(compareVal(this, $(this).val()));
  },
  'input': function () {
    changeVal(this);
  },
  'keypress': function (e) {
    changeVal(this);
    if (e.charCode == 43) return false;
  }
});
$('[type=text]').on("keyup", function () {
  var reg = /^([1-9]|([1-9][0-9])|(1[0-9][0-9])|(2[0-4][0-9])|(25[0-5]))(\.([0-9]|([1-9][0-9])|(1[0-9][0-9])|(2[0-4][0-9])|(25[0-5]))){3}$/;
  var val = $(this).val();
  reg.test(val) ? $(this).addClass('green').attr('value', val).removeClass('red') : $(this).removeClass('green').addClass('red');
  if (!$(this).hasClass('red')) changeVal(this);
}).blur(function () {
  if ($(this).val() == "" || $(this).hasClass('red')) {
    $(this).val($(this).attr('value')).addClass('green').removeClass('red');
  } else {
    changeVal(this);
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
  return newVal.toFixed(step);
}
$(".item>li").click(function () {
  $(this).addClass("active").siblings().removeClass("active");
  var i = $(".active").index();
  getContentVal(i);
})

function getContentVal(i) {
  $('.content [name]').each(function () {
    var val = configs[i][$(this).attr('name')];
    if (!Boolean(val)) return;
    var type = $(this).attr('type');
    if (type == 'checkbox') {
      $(this).prop('checked', val == 'yes');
    } else if (type == "number") {
      $(this).val(compareVal(this, val));
    } else {
      $(this).val(val);
    }
  })
}

function changeVal(obj) {
  var i = $(".active").index();
  var name = $(obj).attr('name');
  var val = $(obj).val();
  var type = $(obj).attr('type');
  if (type == 'checkbox') {
    val = $(obj).is(':checked') ? "yes" : "no";
  } else if (type == "number") {
    val = compareVal(obj, val);
  }
  configs[i][name] = val;
  setConfig();
}