var empty = "";
$('input').on('change', function () {
  if ($(this).attr("name") == "offline_process") modeChange();
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
$('[name="other_path"]').on('click', function () {
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
    } else if (type == "radio" && $(this).attr("value") == config[name]) {
      $(this).prop('checked', true);
    }
  })
  var channelFiltering = config['channelFiltering'].split(",");
  $('[name =channelFiltering]').prop('checked', false);
  for (var j of channelFiltering) {
    if (j != "") {
      $('#' + j).prop("checked", true);
    }
  }
  //a标签
  var text = config['other_path'] == '' ? empty : config['other_path'].substring(0, config['other_path'].length - 1);
  $('[name=other_path]').text(text).attr("title", text);
  if ($('[name=other_path]').text().indexOf(empty) == -1) {
    $('[name=other_path]').addClass('green');
  }
  modeChange();
}

function setConfig() {
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root";
  // checkbox
  $('input').each(function () {
    var name = $(this).attr('name');
    if (name == 'format' || name == "time_sync_type") {
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
  var other_path = $('[name="other_path"]').text();
  text += " other_path=\"" + (other_path.indexOf(empty) != -1 ? '' : (other_path + (/^[a-zA-Z]:/.test(other_path) ? '\\' : '\/'))) + "\"";
  biSetModuleConfig("pcd-export-fileio.aspluginpcdexport", text + "/>");
  var myDate = new Date();
  var now = myDate.getFullYear() + getNow(myDate.getMonth() + 1).toString() + getNow(myDate.getDate()) + "-" + getNow(myDate.getHours()) + '-' + getNow(myDate.getMinutes()) + "-" + getNow(myDate.getSeconds());
  text += " starttime=\"" + now + "\" ";
  text += "/>";
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

  // for (var key in moduleConfigs) {
  var parser = new DOMParser();
  var xmlDoc = parser.parseFromString(moduleConfigs["pcd-export-process.aspluginpcdexport"], "text/xml");
  var countrys = xmlDoc.getElementsByTagName('root');
  var keys = countrys[0].attributes;
  var obj = new Object();
  for (var i = 0; i < keys.length; i++) {
    obj[keys[i].nodeName] = keys[i].nodeValue;
  }
  loadConfig(obj);
  // }
}

function biOnSelectedPath(key, path) {
  if (path == null) {
    $('[name=other_path]').removeClass('green').text(empty);
    setConfig();
    return;
  }
  if (key.indexOf("OpenFilePath") != -1) {
    var strs = key.split(":");
    if (strs[1] == 1) {
      $('[name=other_path]').text(path).attr("title", path).addClass('green');
      setConfig();
    }
  }
}

function modeChange() {
  if (!$("[name=offline_process]").is(":checked")) {
    $("[language=local_path],[language=other_path],[name=other_path]").addClass("disabled_a");
    $("[name=local_path],[name=other_path]").attr("disabled", true);
    $("[name=local_path]").attr("checked", false);
    $("[name=other_path]").text(empty);
  } else {
    $("[language=local_path],[language=other_path],[name=other_path]").removeClass("disabled_a");
    $("[name=local_path],[name=other_path]").attr("disabled", false);
  }
}