var channels = [];
$('input:text').on('keyup', function () {
  $(this).addClass('green');
  if ($(this).attr('name') == 'send_port') {
    if (!(Number($(this).val()))) {
      $(this).removeClass('green').addClass('red');
    } else {
      $(this).addClass('green').removeClass('red');
    }
  }
  if ($(this).hasClass('red')) return;
  setConfig();
})
$('[name=connect],[name=send_ip],[name=send_port]').change(function () {
  setConfig();
});
$('.channel input:checkbox').on('change', function () {
  var id = $(this).attr('id');
  if ($(this).is(':checked')) {
    channels.push(id);
  } else {
    for (var i in channels) {
      if (channels[i] == id) channels.splice(i, 1);
    }
  }
  setConfig();
})
$('[language=cancel]').on('click', function () {
  channels = [];
  $('.channel input:checkbox:checked').removeAttr('checked');
  setConfig();
})
function setConfig() {
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root";
  text += " connect" + "=\"" + ($('[name=connect]').get(0).checked == true ? "yes" : "no") + "\"";
  text += " send_ip" + "=\"" + $('[name=send_ip]').val() + "\"";
  text += " send_port" + "=\"" + ($('[name=send_port]').val() != '' ? parseInt($('[name=send_port]').val()) : "") + "\"";
  text += " channel_num" + "=\"" + channels.length + "\"";
  for (var i in channels) {
    text += " channel_" + i + "=\"" + channels[i] + "\"";
  }
  text += " car=\"-1\"/>";
  biSetModuleConfig("upload-image.upimageapp", text);
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
      if (keys[i].nodeValue == "null") {
        obj[keys[i].nodeName] = "";
      } else {
        obj[keys[i].nodeName] = keys[i].nodeValue;
      }
    }
    loadConfig(obj);
  }
}
function loadConfig(val) {
  if (val == null) return;
  $('[name=send_ip]').val(val['send_ip']);
  $('[name=send_port]').val(val['send_port']);
  if (val['connect'] == "yes") $('[name=connect]').attr('checked', true);
  for (key in val) {
    if (key.indexOf('channel_') != -1 && key != 'channel_num') {
      $('#' + val[key]).attr('checked', true);
      channels.push(val[key]);
    }
  }
  $('input:text').addClass('green');
}