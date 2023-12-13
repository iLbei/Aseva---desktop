var driver_id = [],
  driver_name = [],
  modObj = {};

$('[name=record_driver]').change(function () {
  $(this).val() == 0 ? $('[name="record_device"]').attr('disabled', true) : $('[name="record_device"]').attr('disabled', false);
})
function loadConfig(config) {
  //多选框和单选框
  $('.container [name]').each(function () {
    var name = $(this).attr('name');
    if (config[name] == 'null') {
      if(name=="record_driver"){
        $(this).val(config[name]);
      }else{
         $(this).val($(this).children().eq(0).attr("value"));
      }
    } else {
      $(this).val(config[name]);
    };
  })
}
function setConfig() {
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root ";
  $('[name]').each(function () {
    text += $(this).attr('name') + "=\"" + $(this).val() + "\" "
  })
  text += "/>";
  biSetModuleConfig("audio.system", text);
}
function biOnInitEx(config, moduleConfigs) {
  // 获取音频驱动列表
  if (biGetRunningMode() == 1) {
    $('.offline').show();
    $('.online').hide();
  } else {
    $('.offline').hide();
    $('.online').show();
  }
  biQueryAudioDriversInfo();
  $('[language]').each(function () {
    var value = $(this).attr('language');
    $(this).html(biGetLanguage() == 1 ? en[value] : cn[value]);
  });
  for (var key in moduleConfigs) {
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(moduleConfigs[key], "text/xml");
    var countrys = xmlDoc.getElementsByTagName('root');
    var keys = countrys[0].attributes;
    modObj = new Object();
    for (var i = 0; i < keys.length; i++) {
      modObj[keys[i].nodeName] = keys[i].nodeValue;
    }
  }
}
function biOnQueriedAudioDriversInfo(driversInfo) {
}
function BIAudioDriverInfo(driverID, driverName, recordDevices, replayDevices) {
  driver_id = [], driver_name = [];
  driver_id.push(driverID);
  driver_name.push(driverName);
  $('[name="record_device"]').empty();
  for (var i in driver_id) {
    $('[name="record_driver"]').append("<option value=\"" + driverID + "\">" + driver_name[i] + "</option>");
  }
  for (var i in recordDevices) {
    $('[name="record_device"]').append("<option value=\"" + recordDevices[i]["deviceID"] + "\">" + recordDevices[i]['deviceName'] + "</option>");
  }
  if (replayDevices.length != 0) {
    $('[name="replay_driver"]').append("<option value=\"" + driverID + "\">" + driverName + "</option>");
  }
  for (var i in replayDevices) {
    $('[name="replay_device"]').append("<option value=\"" + replayDevices[i]['deviceID'] + "\">" + replayDevices[i]['deviceName'] + "</option>");
  }
  loadConfig(modObj);
  if ($('[name=record_driver]').val() == 'null') {
    $('[name="record_device"]').val('').attr('disabled', true)
  }
}
$('[name = record_driver]').change(function () {
  driverChange();
  setConfig();
})
function driverChange() {
  if ($('[name=record_driver]').val() == 'null') {
    $('[name="record_device"]').val('').attr('disabled', true)
  } else {
    $('[name="record_device"]').attr('disabled', false);
    $('[name="record_device"]').val($('[name="record_device"] option:eq(0)').attr("value"));
  }
}
$('[name]').on('change', function () {
  setConfig();
});