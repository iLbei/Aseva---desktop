var reg = /^[a-zA-Z]:/,
  configs = '',
  not_config = '';
$('a').on('click', function () {
  biSelectPath($(this).attr("name"), BISelectPathType.Directory, null);
});

$('[name]').on('change', function () {
  setConfig();
});

$('button').on({
  'click': function () {
    biSetViewConfig(configs);
    biRunStandaloneTask('RobosensePCDMergeProc', 'robosense-pcd-merge-task.aspluginrobosensepcdmerge', configs);
  }
})

$('.container').on("change", "input[type=number]", function () {
  $(this).val(compareVal(this, $(this).val()));
}).on('input', "input[type=number]", function (e) {
  if (e.which == undefined) {
    $(this).attr("value", $(this).val());
  } else {
    $(this).attr("value", compareVal(this, $(this).val()))
  }
  setConfig();
}).on('keypress', "input[type=number]", function (e) {
  if (!(e.charCode >= 48 && e.charCode <= 57) && !(e.charCode == 45 || e.charCode == 46)) return false;
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

function biOnSelectedPath(key, path) {
  if (path == null) {
    $('[name=' + key + ']').removeAttr('title').text(not_config);
  } else {
    $('[name=' + key + ']').attr('title', path + (reg.test(path) ? '\\' : '/')).text(path + (reg.test(path) ? '\\' : '/'));
  }
  setConfig();
}

function loadConfig(config) {
  if (config == null) return;
  $('[name]').each(function () {
    var val = config[$(this).attr('name')];
    var type = $(this).attr("type")
    if ($(this).is('a')) {
      if (val == '') {
        $(this).text(not_config).removeAttr("title")
      } else {
        $(this).text(val).attr('title', val)
      }
    } else if (type == "checkbox") {
      $(this).prop('checked', val == 'yes' ? true : false);
    } else if (type == "number") {
      $(this).val(compareVal(this, val));
    } else {
      $(this).val(val);
    }
  })
}

function setConfig() {
  configs = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root><config ";
  $('[name]').each(function () {
    var name = $(this).attr('name');
    if ($(this).is('select')) {
      configs += name + "=\"" + $(this).val() + "\" ";
    } else if ($(this).is('a')) {
      configs += name + "=\"" + ($(this).text().indexOf(not_config) != -1 ? '' : $(this).text()) + "\" ";
    } else if ($(this).is('input[type=checkbox]')) {
      configs += name + "=\"" + ($(this).is(":checked") ? 'yes' : 'no') + "\" ";
    } else if ($(this).attr("type") == "number") {
      configs += name + "=\"" + compareVal(this, $(this).val()) + "\" ";
    }
  });
  configs += "/></root>";
  biSetModuleConfig("robosense-pcd-merge.aspluginrobosensepcdmerge", configs);
}

function biOnInitEx(config, moduleConfigs) {
  var lang = biGetLanguage() == 1 ? en : cn;
  $('[language]').each(function () {
    var value = $(this).attr('language');
    $(this).text(lang[value])
  });
  not_config = lang["not_config"];
  configs = moduleConfigs["robosense-pcd-merge.aspluginrobosensepcdmerge"];
  var parser = new DOMParser();
  var xmlDoc = parser.parseFromString(configs, "text/xml");
  var countrys = xmlDoc.getElementsByTagName('root');
  var keys = countrys[0].childNodes[0].attributes;
  var obj = {};
  for (var i = 0; i < keys.length; i++) {
    obj[keys[i].nodeName] = keys[i].nodeValue;
  }
  loadConfig(obj);
}