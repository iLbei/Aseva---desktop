$('input').on('change', function () {
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
$('[name="savepath"]').on('click', function () {
  biSelectPath("OpenFilePath:1", BISelectPathType.Directory, null);
});

function loadConfig(config) {
  if (config == null) return;
  //多选框和单选框
  $('input').each(function () {
    var type = $(this).attr('type');
    var name = $(this).attr('name');
    if (type == 'checkbox' && name != "channelFiltering") {
      $(this).attr('checked', config[name] == 1);
    } else if (type == "number") {
      $(this).val(compareVal(this, config[name]));
    }
  })
  $("input[type=radio][value=" + config["format"] + "]").prop('checked', true);
  var channelFiltering = config['channelFiltering'].split(",");
  $('[name =channelFiltering]').prop('checked', false);
  for (var j of channelFiltering) {
    if (j != "") {
      $('#' + j).prop("checked", true);
    }
  }
}

function setConfig() {
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root";
  // checkbox
  $('input').each(function () {
    var name = $(this).attr('name');
    if (name == 'format') {
      if ($(this).is(':checked')) {
        text += " " + name + "=\"" + $(this).attr('value') + "\"";
      }
    } else if (name != "channelFiltering") {
      var val = 0;
      if ($(this).attr("type") == "number") {
        val = compareVal(this, $(this).val());
      } else {
        val = $(this).is(':checked') ? 1 : 0;
      }
      text += " " + name + "=\"" + val + "\"";
    }
  })
  var channelFiltering = "";
  $("[name =channelFiltering]").each(function () {
    if ($(this).is(":checked")) channelFiltering += $(this).attr("id") + ',';
  })
  text += " channelFiltering=\"" + channelFiltering.substr(0, channelFiltering.length - 1) + "\"";
  text += " app_mode=\"" + biGetRunningMode() + "\" ";
  var myDate = new Date();
  var now = myDate.getFullYear() + getNow(myDate.getMonth() + 1).toString() + getNow(myDate.getDate()) + "-" + getNow(myDate.getHours()) + '-' + getNow(myDate.getMinutes()) + "-" + getNow(myDate.getSeconds());
  text += " starttime=\"" + now + "\"/>";
  biSetModuleConfig("pcd-export-fileio.aspluginpcdexport", text);
}

function getNow(s) {
  return s < 10 ? '0' + s : s;
}

function biOnInitEx(config, moduleConfigs) {
  $('[language]').each(function () {
    var value = $(this).attr('language');
    if (biGetLanguage() == 1) {
      $(this).html(en[value]);
    } else {
      $(this).html(cn[value]);
    }
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
    loadConfig(obj);
  }
}

function biOnSelectedPath(key, path) {
  if (path == null) {
    $('[name=savepath]').removeClass('green');
    return;
  }
  if (key.indexOf("OpenFilePath") != -1) {
    var strs = key.split(":");
    if (strs[1] == 1) {
      $('[name=savepath]').html(path).attr("title", path).addClass('green');
    }
  }
  setConfig();
}