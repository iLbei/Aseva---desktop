var child_config = {},
  sub_data_path_arr = [];
$('[name],select').on('change', function () {
  var val = $(this).val();
  if ($(this).parents().hasClass("pos")) {
    var subindex = "";
    $('.video>.pos select').each(function () {
      subindex += $(this).val() + ',';
    })
    subindex = subindex.substring(0, subindex.length - 1);
    child_config["write_video_subindex"] = subindex;
  } else {
    child_config[$(this).attr("name")] = val;
  }
  setConfig();
});

function loadConfig(config) {
  $("[name]").each(function () {
    $(this).val(config[$(this).attr("name")]);
  })
  var video = config['write_video_subindex'].split(',');
  var text = "<option value=\"-1\" language=\"main_data_path\"></option>";
  for (var i in sub_data_path_arr) {
    text += "<option value=\"" + i + "\">" + sub_data_path + " " + (Number(i) + 1) + "" + (sub_data_path_arr[i] == "null" || !Boolean(sub_data_path_arr[i]) ? Unavailable : "") + "</option>";
  }
  $('.pos select').each(function (i) {
    $(this).html(text);
    $(this).val(video[i]);
  })
  
  if (biGetLanguage() == 1) {
    $('[language]').each(function () {
      var value = $(this).attr('language');
      $(this).html(en[value]);
    });
  } else {
    $('[language]').each(function () {
      var value = $(this).attr('language');
      $(this).html(cn[value]);
    });
  }
}

function setConfig() {
  var file = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root ";
  for (var i in child_config) {
    file += " " + i + "=\"" + child_config[i] + "\"";
  }
  file += "/>";
  biSetModuleConfig("default-video-file-io.plugindefaultvideofileio", file);
}

function biOnInitEx(config, moduleConfigs) {
  if (biGetLanguage() == 1) {
    sub_data_path = "Sub Data Path";
    Unavailable = "(Unavailable)";
  } else {
    sub_data_path = "子数据目录";
    Unavailable = "(不可用)";
  }
  sub_data_path_arr = biGetSubDataPaths();
  var parser = new DOMParser();
  var xmlDoc = parser.parseFromString(moduleConfigs["default-video-file-io.plugindefaultvideofileio"], "text/xml");
  var countrys = xmlDoc.getElementsByTagName('root');
  var keys = countrys[0].attributes;
  for (var i = 0; i < keys.length; i++) {
    child_config[keys[i].nodeName] = keys[i].nodeValue;
  }
  loadConfig(child_config);
}