// 2023/11/28 v2.7.0 底部新增两个checkbox(asc/blf)
var audio = [],
  default_file_io = {},
  default_video_file_io = {},
  bus_record_format = "",
  video_record_config = "",
  audio_config = "";
$('a').click(function () {
  var lang = $(this).attr('language');
  switch (lang) {
    case "data_password":
      biConfigDataEncryption();
      break;
    case "bus": {
      biOpenChildDialog("default-file-io.bus.html", bus_record_format, new BISize(630, 267), "");
      break;
    }
    case "video": {
      biOpenChildDialog("default-file-io.video.html", video_record_config, new BISize(950, 494), "");
      break;
    }
    case "audio": {
      biOpenChildDialog("default-file-io.audio.html", audio_config, new BISize(310, 80), "");
      break;
    }
    default:
      break;
  }
})

$('.bottom button').click(function () {
  $('input[type=checkbox]').prop('checked', false);
  if ($(this).hasClass('restore')) {
    $('.top .default').prop('checked', true).removeAttr('disabled').next().removeClass('disabled');
  }
  $('[name$="audio"],[name$="binary"]').each(function () {
    audioChange(this);
  })
  $('[name$="signal"]').each(function () {
    signalVal(this);
  })
  // $('.top .default').prop('checked', $(this).hasClass('restore'))
  setConfig();
})

$('[name$="signal"]').click(function () {
  signalVal(this);
})

function signalVal(obj) {
  if ($(obj).is(':checked')) {
    $(obj).parent().next().find('input').prop('disabled', false).attr('checked', false).siblings().removeClass('disabled');
  } else {
    $(obj).parent().next().find('input').prop('disabled', true).attr('checked', false).siblings().addClass('disabled');
  }
}
$("input").on('change', function () {
  audioChange(this);
  setConfig();
});

function audioChange(obj) {
  var name = $(obj).attr('name');
  var value = $(obj).is(':checked') ? 'yes' : 'no';
  switch (name) {
    case 'online_write_audio':
      biSetGlobalParameter('System.OnlineWriteAudio', value);
      break;
    case 'from_raw_read_audio':
      biSetGlobalParameter('System.FromRawReadAudio', value);
      break;
    case 'offline_from_gen_read_audio':
      biSetGlobalParameter('System.OfflineFromGenReadAudio', value);
      break;
    case 'replay_from_gen_read_audio':
      biSetGlobalParameter('System.ReplayFromGenReadAudio', value);
      break;
    case 'online_write_raw_binary':
      biSetGlobalParameter('System.OnlineWriteRawBinary', value);
      break;
    case 'from_raw_read_raw_binary':
      biSetGlobalParameter('System.FromRawReadRawBinary', value);
      break;
    case 'offline_from_gen_read_raw_binary':
      biSetGlobalParameter('System.OfflineFromGenReadRawBinary', value);
      break;
    case 'replay_from_gen_read_raw_binary':
      biSetGlobalParameter('System.ReplayFromGenReadRawBinary', value);
      break;
    default:
      break;
  }
}

function biOnQueriedGlobalParameter(id, value) {
  audio.push(value);
  if (audio.length == 8) loadConfig(default_file_io);
}

function loadConfig(config) {
  $('[name]').each(function () {
    var name = $(this).attr('name'),
      val = config[name];
    if (val == undefined) return;
    if (name.indexOf('signal') != -1 && name.indexOf('audio') == -1 && name.indexOf("binary") == -1) {
      if (val == '1') {
        $(this).prop('checked', true).parent().next().find('input').prop('disabled', false).next().removeClass('disabled')
      } else if (val == '2') {
        $(this).prop('checked', true);
        $(this).parent().next().find('input').prop({
          'checked': true,
          "disabled": false
        }).next().removeClass('disabled');
      } else if (val == 0) {
        $(this).parent().next().find('input').prop('disabled', true).next().addClass('disabled');
      }
    } else {
      $(this).attr('checked', val == 'yes');
    }
  })
  $('[name$=audio]').each(function (i) {
    $(this).prop('checked', audio[i] == 'yes');
  })
  $('[name$=video]').each(function (i) {
    $(this).prop('checked', default_video_file_io[$(this).attr("name")] == 'yes');
  })
  $('[name$=binary]').each(function (i) {
    $(this).prop('checked', audio[i + 4] == 'yes');
  })
}

function setConfig() {
  $("[name]").each(function () {
    var name = $(this).attr("name");
    if (name.indexOf('signal') != -1) {
      default_file_io[name] = $(this).is(':checked') ? ($(this).parent().next().find('input').is(":checked") ? 2 : 1) : 0;
    } else if (name.indexOf("video") != -1) {
      default_video_file_io[name] = $(this).is(':checked') ? "yes" : "no";
    } else if (name.indexOf("binary") == -1 && name.indexOf("audio") == -1) {
      default_file_io[name] = $(this).is(':checked') ? "yes" : "no";
    }
  })
  default_video_file_io["record_legacy_style"] = $("[name=record_legacy_style]").is(':checked') ? "yes" : "no";
  var file = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root ";
  for (var i in default_file_io) {
    file += i + "=\"" + default_file_io[i] + "\" ";
  }
  file += "/>";
  biSetModuleConfig("default-file-io.plugindefaultfileio", file);
  var video_file = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root ";
  for (var i in default_video_file_io) {
    video_file += i + "=\"" + default_video_file_io[i] + "\" ";
  }
  video_file += "/>";
  biSetModuleConfig("default-video-file-io.plugindefaultvideofileio", video_file);
}

function biOnInitEx(config, moduleConfigs) {
  audio = [];
  biQueryGlobalParameter('System.OnlineWriteAudio', 'no');
  biQueryGlobalParameter('System.FromRawReadAudio', 'no');
  biQueryGlobalParameter('System.OfflineFromGenReadAudio', 'no');
  biQueryGlobalParameter('System.ReplayFromGenReadAudio', 'no');
  biQueryGlobalParameter('System.OnlineWriteRawBinary', 'no');
  biQueryGlobalParameter('System.FromRawReadRawBinary', 'no');
  biQueryGlobalParameter('System.OfflineFromGenReadRawBinary', 'no');
  biQueryGlobalParameter('System.ReplayFromGenReadRawBinary', 'no');
  $('[language]').each(function () {
    var value = $(this).attr('language');
    if (biGetLanguage() == 1) {
      $(this).html(en[value]);
      bus_record_format = en["bus_record_format"];
      video_record_config = en["video_record_config"];
      audio_config = en["audio_config"];
    } else {
      $(this).html(cn[value]);
      bus_record_format = cn["bus_record_format"];
      video_record_config = cn["video_record_config"];
      audio_config = cn["audio_config"];
    }
  });
  var parser = new DOMParser();
  var xmlDoc1 = parser.parseFromString(moduleConfigs["default-file-io.plugindefaultfileio"], "text/xml");
  var countrys1 = xmlDoc1.getElementsByTagName('root');
  var keys1 = countrys1[0].attributes;
  for (var i = 0; i < keys1.length; i++) {
    default_file_io[keys1[i].nodeName] = keys1[i].nodeValue;
  }
  var xmlDoc2 = parser.parseFromString(moduleConfigs["default-video-file-io.plugindefaultvideofileio"], "text/xml");
  var countrys2 = xmlDoc2.getElementsByTagName('root');
  var keys2 = countrys2[0].attributes;
  for (var i = 0; i < keys2.length; i++) {
    default_video_file_io[keys2[i].nodeName] = keys2[i].nodeValue;
  }
}