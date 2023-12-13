var not_config = "";
var input_path = [];
var session_path = [];
var reg = /^[a-zA-Z]:/; //判断linux或者windows，应该/ 还是\
var listLength = 0; //接收session列表长度
// 表单内容改变保存配置
$('[name]').change(function () {
  setConfig();
});
$("a").click(function () {
  var name = $(this).attr("name");
  biSelectPath(name, 3, );
})

function biOnSelectedPath(key, path) {
  if (path == null) {
    $(this).text(not_config).removeAttr("title");
  } else {
    $("[name=" + key + "]").text(path).attr("title", path);
  }
  setConfig();
}

function getXml() {
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root ";
  $('.container [name]').each(function () {
    var name = $(this).attr('name');
    var type = $(this).attr("type");
    var val = $(this).val();
    if (type == 'checkbox') {
      text += name + "=\"" + ($(this).is(':checked') ? "yes" : "no") + "\" ";
    } else if (type == "number") {
      text += name + "=\"" + compareVal(this, val) + "\" ";
    } else if ($(this).is("a")) {
      text += name + "=\"" + ($(this).text().indexOf(not_config) == -1 ? $(this).text() : "") + "\" ";
    } else {
      text += name + "=\"" + val + "\" ";
    }
  });
  if (input_path != "") {
    text += ">";
    for (var i in input_path) {
      text += "<rosbag_file rosbag_file_path=\"" + input_path[i] + "\"/>"
    }
    text += " </root>";
  } else {
    text += " />";
  }
  return text;
}
//保存配置
function setConfig() {
  biSetModuleConfig("export-rosbag-file.ExportRosbagFile", getXml());
}

//初始化
function biOnInitEx(config, moduleConfigs) {
  biQuerySessionList();
  var lang = biGetLanguage() == 1 ? en : cn;
  $('[language]').each(function () {
    var value = $(this).attr('language');
    $(this).text(lang[value]);
  });
  not_config = lang["not_config"];
  for (var key in moduleConfigs) {
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(moduleConfigs[key], "text/xml");
    var obj = new Object();
    var root = xmlDoc.getElementsByTagName('root');
    var keys = root[0].attributes;
    for (var i = 0; i < keys.length; i++) {
      //获取root自身字节的属性
      obj[keys[i].nodeName] = keys[i].nodeValue;
    }
    loadConfig(obj);
  }
}

function loadConfig(obj) {
  if (obj == null) return;
  $('.container [name]').each(function () {
    var val = obj[$(this).attr('name')];
    var type = $(this).attr("type");
    if (type == 'checkbox') {
      $(this).prop('checked', val == 'yes');
    } else if (type == "number") {
      $(this).val(compareVal(this, val));
    } else if ($(this).is('a')) {
      val = val == "" || val == "null" ? not_config : val;
      if (val != not_config) $(this).attr("title", val);
      $(this).text(val);
    } else {
      $(this).val(val);
    }
  })
}

function biOnQueriedSessionList(list, filtered) {
  listLength = list.length;
  for (var i in list) {
    biQuerySessionPath(list[i]);
  }
}

$('button').on({
  'click': function () {
    if ($("[name=pixelFormat]").val() != 0) {
      biSetViewConfig(getXml());
      biRunStandaloneTask("Export Rosbag File", "export-rosbag-file-task.ExportRosbagFileTask", getXml())
    }
  }
})

function biOnQueriedSessionPath(path, session) {
  var split = reg.test(path) ? "\\" : "/";
  session_path.push(path);
  if (session_path.length == listLength) {
    for (var i of session_path.values()) {
      //优先判断online是否存在ros文件夹
      biQueryDirectoryExist(i + split + "output" + split + "online" + split + "ros");
    }
  }
}

function biOnQueriedDirectoryExist(exist, path) {
  //如果找的是offline文件夹
  if (path.indexOf("online") == -1) { //如果是offline文件夹
    if (!exist) { //
      biQueryFilesInDirectory(path);
    }
  } else { //如果找的是online文件夹
    if (exist) { //如果存在ros文件夹，去查找ros文件夹内所有文件
      biQueryFilesInDirectory(path);
    } else { //如果不存在，就去查找output文件夹内的所有文件夹
      biQueryDirsInDirectory(path.split("online")[0]);
    }
  }
}
//获取文件夹内的所有文件夹
function biOnQueriedDirsInDirectory(dirs, path) {
  var split = reg.test(path) ? "\\" : "/";
  var dir = dirs[0].split("\n").sort(); //对获取到的文件夹列表数组进行降序，最新的在前面
  if (dir[dir.length-1].indexOf("online") == -1) {
    biQueryFilesInDirectory(dir[dir.length-1] + split + "ros");
  } else {
    biQueryFilesInDirectory(dir[dir.length-2] + split + "ros");
  }

}
// 获取文件夹内的所有文件路径
function biOnQueriedFilesInDirectory(files, path) {
  var file = files[0].split("\n");
  for (var i in file) {
    if (file[i].indexOf(".bag") != -1 && file[i].indexOf(".bag.xml") == -1) {
      input_path.push(file[i]);
    }
  }
}

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