var empty = "";
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
    } else if (type == "radio") {
      $("[name=" + name + "][value=" + config[name] + "]").prop("checked", true)
    }
  })
  // $("input[type=radio][value=" + config["time_sync_type"] + "]").prop('checked', true);
  var channelFiltering = config['channelFiltering'].split(",");
  $('[name =channelFiltering]').prop('checked', false);
  for (var j of channelFiltering) {
    if (j != "") {
      $('#' + j).prop("checked", true);
    }
  }
  //a标签
  var html = config['savepath'] == '' ? empty : config['savepath'].substring(0, config['savepath'].length - 1);
  $('[name=savepath]').text(html).attr("title", html);
  if ($('[name=savepath]').text().indexOf(empty) == -1) {
    $('[name=savepath]').addClass('green');
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
      var type = $(this).attr("type");
      if (type == "number") {
        text += " " + name + "=\"" + compareVal(this, $(this).val()) + "\"";
      } else if (type == 'radio') {
        if ($(this).is(":checked")) {
          text += " " + name + "=\"" + $(this).val() + "\"";
        }
      } else {
        text += " " + name + "=\"" + ($(this).is(':checked') ? 1 : 0) + "\"";
      }
    }
  })
  var channelFiltering = "";
  $("[name =channelFiltering]").each(function () {
    if ($(this).is(":checked")) channelFiltering += $(this).attr("id") + ',';
  })
  text += " channelFiltering=\"" + channelFiltering.substr(0, channelFiltering.length - 1) + "\"";
  text += " app_mode=\"" + biGetRunningMode() + "\" ";
  var savepath = $('[name="savepath"]').text();
  text += " savepath=\"" + (savepath.indexOf(empty) != -1 ? '' : (savepath + (/^[a-zA-Z]:/.test(savepath) ? '\\' : '\/'))) + "\"";
  var myDate = new Date();
  var now = myDate.getFullYear() + getNow(myDate.getMonth() + 1).toString() + getNow(myDate.getDate()) + "-" + getNow(myDate.getHours()) + '-' + getNow(myDate.getMinutes()) + "-" + getNow(myDate.getSeconds());
  text += " starttime=\"" + now + "\"/>";
  biSetModuleConfig("pcd-export-process.aspluginpcdexport", text);
}

function getNow(s) {
  return s < 10 ? '0' + s : s;
}

function biOnInitEx(config, moduleConfigs) {
  var lang = biGetLanguage() == 1 ? en : cn;
  $('[language]').each(function () {
    var value = $(this).attr('language');
    $(this).text(lang[value]);
    empty = lang["empty"];
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
      $('[name=savepath]').text(path).attr("title", path).addClass('green');
    }
  }
  setConfig();
}