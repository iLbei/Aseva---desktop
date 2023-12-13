var reg = /^[a-zA-Z]:/,
  data_path = [],
  dir = [],
  input_file = [], //数据文件夹路径
  session_length = [],
  session_start_utc = [],
  flexray_data_path = [],
  start_cpu_tick = [],
  cpu_tick_per_second = [],
  session_id = [],
  not_config = "",
  asc = [];

$('[name]').change(function () {
  setConfig()
})
$('a').click(function () {
  biSelectPath('flexray_data_path', BISelectPathType.Directory, 'null');
})
//选择flexray数据路径
function biOnSelectedPath(key, path) {
  if (path == null) return;
  if (key == "flexray_data_path") $('[name=flexray_data_path]').text(path).attr('title', path);
  asc = [];
  biQueryFilesInDirectory(path);
  setConfig();
}
$('button').click(function () {
  if (input_file.length == 0 || $("[name=flexray_data_path]").text().indexOf(not_config) != -1) {
    biAlert('There is no session for the current path,Please choose right Data path!', '');
  } else {
    var config = '';
    config = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root bus_channel=\"" + $("[name=bus_channel]").val() + "\" flexray_data_path=\"" + $("[name=flexray_data_path]").text() + "\">";
    for (var i in input_file) {
      config += "<DataSession ";
      config += " data_path" + "=\"" + input_file[i] + "\"";
      config += " session_length" + "=\"" + session_length[i] + "\"";
      config += " session_start_utc" + "=\"" + session_start_utc[i] + "\"";
      config += " start_cpu_tick" + "=\"" + start_cpu_tick[i] + "\"";
      config += " cpu_tick_per_second" + "=\"" + cpu_tick_per_second[i] + "\"";
      config += " session_id" + "=\"" + session_id[i] + "\"";
      config += "/>";
    }
    let newAsc = asc.sort();
    for (var i in newAsc) {
      config += "<flexray_session flexray_file_path=\"" + newAsc[i] + "\"/>";
    }
    config += "</root>";
    biSetViewConfig(config);
    biRunStandaloneTask('FlexrayDataConvert', 'flexray-data-convert-task.FlexrayDataConvertTask', config);
  }
})

function sort(a, b) {
  return a - b
}

function biOnQueriedDirsInDirectory(dirs, path) {
  dir = [];
  dir = dirs[0].split('\n');
  var new_dir = dir.sort();
  for (var i in new_dir) {
    if (input_file.length == 0) {
      biQueryFilesInDirectory(new_dir[i]);
    }
  }
}

function biOnResultOfStandaloneTask(key, result, returnValue) {
  if (result == 1) {
    biAlert('Import flexray data success!', '')
  } else {
    biAlert('Failed', '')
  }
}

function biOnQueriedFileText(text, path) {
  if (!path) return;
  var parser = new DOMParser();
  var xmlDoc = parser.parseFromString(text, "text/xml");
  var countrys = xmlDoc.getElementsByTagName('root')
  var keys = countrys[0].attributes;
  var obj = new Object();
  for (var n = 0; n < keys.length; n++) {
    obj[keys[n].nodeName] = keys[n].nodeValue;
  }
  session_length.push(!Boolean(obj.length) || ["", "undefined", 'null'].includes(obj.length) ? 0 : obj.length);
  session_start_utc.push(!Boolean(obj.start_posix_gnss) || ["", "undefined", 'null'].includes(obj.start_posix_gnss) ? 0 : obj.start_posix_gnss);
  start_cpu_tick.push(!Boolean(obj.start_cpu_tick) || ["", "undefined", 'null'].includes(obj.start_cpu_tick) ? 0 : obj.start_cpu_tick);
  cpu_tick_per_second.push(!Boolean(obj.cpu_ticks_per_second) || ["", "undefined", 'null'].includes(obj.cpu_ticks_per_second) ? 0 : obj.cpu_ticks_per_second);
  session_id.push(!Boolean(obj.session_id) || ["", "undefined", 'null'].includes(obj.session_id) ? 0 : obj.session_id);
}

function biOnQueriedFilesInDirectory(files, path) {
  var file = files[0].split('\n');
  for (var i in file) {
    if (file[i].indexOf('meta.xml') != -1) {
      var path = file[i].substr(0, file[i].length - 9);
      input_file.push(path);
      biQueryFileText(path + (reg.test(path) ? "\\" : "/") + "meta.xml");
    } else if (file[i].indexOf(".asc") != -1) {
      asc.push(file[i]);
    }
  }
}

function setConfig() {
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root ";
  $('.container [name]').each(function () {
    var key = $(this).attr('name');
    var type = $(this).attr('type');
    var value = $(this).val();
    if (type == 'checkbox') {
      text += " " + key + "=\"" + ($(this).is(':checked') ? "yes" : "no") + "\"";
    } else if ($(this).is('a')) {
      text += " " + key + "=\"" + ($(this).text().indexOf(not_config) == -1 ? $(this).text() : '') + "\"";
    } else {
      text += " " + key + "=\"" + value + "\"";
    }
  });
  text += ">";
  for (var i in input_file) {
    text += "<DataSession ";
    text += " data_path" + "=\"" + input_file[i] + "\"";
    text += " session_length" + "=\"" + session_length[i] + "\"";
    text += " session_start_utc" + "=\"" + session_start_utc[i] + "\"";
    text += " start_cpu_tick" + "=\"" + start_cpu_tick[i] + "\"";
    text += " cpu_tick_per_second" + "=\"" + cpu_tick_per_second[i] + "\"";
    text += " session_id" + "=\"" + session_id[i] + "\"";
    text += "/>";
  }
  text += "</root>";
  biSetModuleConfig("flexray-dataconvert.pluginflexray", text);
}

function biOnInitEx(config, moduleConfigs) {
  biQueryDirsInDirectory(biGetDataPath());
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
    var countrys = xmlDoc.getElementsByTagName('root')
    var keys = countrys[0].attributes;
    var obj = new Object();
    for (var n = 0; n < keys.length; n++) {
      obj[keys[n].nodeName] = keys[n].nodeValue;
    }
    loadConfig(obj);
  }
}

function loadConfig(config) {
  $(".container [name]").each(function () {
    var name = $(this).attr('name');
    var type = $(this).attr('type');
    var val = config[name];
    if (val == "null" || val == "") return;
    if ($(this).is('select') || type == "number" || type == "text") {
      if (val) {
        if (type == "number") {
          $(this).val(compareVal(this, val));
        } else {
          $(this).val(val);
        }
      }
    } else if (type == "checkbox" && val == "yes") {
      $(this).attr('checked', true)
    } else if ($(this).is('a')) {
      $(this).text(val).attr('title', val)
    }
  })
  // flexray_data_path下的asc文件
  biQueryFilesInDirectory(config['flexray_data_path']);
}