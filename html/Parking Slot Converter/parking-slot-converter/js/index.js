var not_config = "";
$('[name]').change(function () {
  setConfig();
});

$('[type=text]').bind("input propertychange", function () {
  setConfig();
})

function onClick(obj) {
  var filter = {
    ".json": "json (*.json)"
  };
  biSelectPath("OpenFilePath", BISelectPathType.OpenFile, filter);
}

function biOnSelectedPath(key, path) {
  if (path == null) return;
  if (key == "OpenFilePath") {
    $('a').text(path).attr("title", path);
  }
  setConfig();
}

function loadConfig(val) {
  if (val == null) return;
  $('[name]').each(function () {
    var value = $(this).attr('name');
    $(this).val(val[value]);
  });
  if (Boolean(val['ParkingSlotFilePath'])) $('#ParkingSlotFilePath').text(val['ParkingSlotFilePath']).attr("title", val['ParkingSlotFilePath']);
}

function setConfig() {
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root ";
  $('[name]').each(function () {
    var key = $(this).attr('name');
    text += " " + key + "=\"" + $(this).val() + "\"";
  });
  text += " ParkingSlotFilePath" + "=\"" + ($('#ParkingSlotFilePath').text().indexOf(not_config) != -1 ? "null" : $('#ParkingSlotFilePath').text()) + "\"";
  text += " />";
  biSetModuleConfig("parking-slot-converter.aspluginparkingslotconverter", text);
}

function biOnInitEx(config, moduleConfigs) {
  if (biGetLanguage() == 1) {
    $('[language]').each(function () {
      var value = $(this).attr('language');
      $(this).text(en[value]);
    });
    not_config = en["not_config"];
  } else {
    $('[language]').each(function () {
      var value = $(this).attr('language');
      $(this).text(cn[value]);
    });
    not_config = cn["not_config"];
  }
  for (var key in moduleConfigs) {
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(moduleConfigs[key], "text/xml");
    var countrys = xmlDoc.getElementsByTagName('root');
    var keys = countrys[0].attributes;
    var obj = new Object();
    for (var i = 0; i < keys.length; i++) {
      obj[keys[i].nodeName] = keys[i].nodeValue;
    };
    loadConfig(obj);
  }
}