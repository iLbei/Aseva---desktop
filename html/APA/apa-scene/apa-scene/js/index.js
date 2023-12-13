//  2023/10/24 v2.0.4 修复拼写错误:edeg->edge;bi-common.js,common.css更新到最新
$('.container [name]').change(function () {
  setConfig();
  biSetGlobalParameter("APAScene." + $(this).siblings('span').attr('language'), $(this).val());
});
$('button').click(function () {
  var name = $(this).attr('language');
  if (name == 'load') {
    biSelectPath('load', BISelectPathType.OpenFile, {
      '.csv': '*.csv'
    });
  } else if (name == 'save') {
    biSelectPath('save', BISelectPathType.Directory, {
      '.csv': '*.csv'
    });
  }
})

function biOnSelectedPath(key, path) {
  if (key == 'load') {
    biQueryFileText(path);
  } else if (key == 'save') {
    var text = '',
      date = new Date,
      year = date.getFullYear(),
      month = (date.getMonth() + 1) < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1),
      day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate(),
      hours = date.getHours() < 10 ? '0' + date.getHours() : date.getHours(),
      minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes(),
      seconds = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds(),
      fileName = (/^[a-zA-Z]:((\\)[\S].+\s?)*\\$/.test(path) ? '\\' : '\/') + 'apa_scene_' + year + month + day + '-' + hours + '-' + minutes + '-' + seconds + '.csv';
    $('span[language]').each(function () {
      text += $(this).html() + ',';
    })
    text = text.substr(0, text.length - 1) + '\n';
    $('select').each(function () {
      var name = $(this).attr('name');
      text += $('[name=' + name + '] option:selected').html() + ',';
    })
    text = text.substr(0, text.length - 1);
    biWriteFileText(path + fileName, text);
  }
}

function biOnQueriedFileText(text, path) {
  var txt = text.split("\n");
  var textCharCode = txt[0].split(",")[0].charCodeAt();
  var vals = txt[1].split(',');
  $('select').each(function (i) {
    var val = 0;
    $(this).find('option').each(function () {
      if (Boolean($(this).attr("language")) && (textCharCode > 255 ? zh[$(this).attr("language")] == vals[i] : en[$(this).attr("language")] == vals[i])) val = Number($(this).attr('value'));
    })
    $(this).val(val);
  })
  setConfig();
}

function biOnInitEx(config, moduleConfigs) {
  var lang = biGetLanguage() == 1 ? en : zh;
  $('[language]').each(function () {
    var value = $(this).attr('language');
    $(this).html(lang[value]);
  });
  for (var key in moduleConfigs) {
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(moduleConfigs[key], "text/xml");
    var country = xmlDoc.getElementsByTagName('config');
    var keys = country[0].attributes;
    var obj = new Object();
    for (var i = 0; i < keys.length; i++) {
      obj[keys[i].nodeName] = keys[i].nodeValue;
    }
    loadConfig(obj);
  }
}

function loadConfig(val) {
  $('.container [name]').each(function () {
    if (["", "null"].includes(val[$(this).attr('name')])) $(this).val(0);
    $(this).val(val[$(this).attr('name')])
  });
}

function setConfig() {
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root><config ";
  $('.container [name]').each(function () {
    text += $(this).attr('name') + "=\"" + $(this).val() + "\" ";
  });
  text += " /></root>";
  biSetModuleConfig("apa-scene.aspluginapaevaluation", text);
}