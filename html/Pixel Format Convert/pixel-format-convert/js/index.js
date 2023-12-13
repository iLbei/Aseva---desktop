var not_config = "",
  reg = /^[a-zA-Z]:/,
  data = { "start_posix_time": "", "time_ratio": "" },
  split = "",
  start_posix_utc = [],
  time_ratio_to_utc = [],
  start_posix_local = [],
  time_ratio_to_local = [],
  configs = "";
$("a[name=inputPath]").click(function () {
  biSelectPath("inputPath", BISelectPathType.Directory, null);
})

function biOnSelectedPath(key, path) {
  data = { "start_posix_time": "", "time_ratio": "" };
  start_posix_utc = [],
    time_ratio_to_utc = [],
    start_posix_local = [],
    time_ratio_to_local = [];
  if (path == null) {
    $('[name=' + key + ']').removeAttr('title').text(not_config);
  } else {
    $('[name=' + key + ']').attr('title', path + split).text(path + split);
    biQueryDirsInDirectory(path);
  }
  $(".utc").prop({ "checked": true });
  setTimeout(function () {
    setConfig();
  }, 300);
}

$('button').on({
  'click': function () {
    if ($("[name=pixelFormat]").val() != 0) {
      biRunStandaloneTask("Pixel Format", "pixel-format-convert-task.aspluginpixelformatconvert", configs)
    }
  }
})
/*----------配置读取与存储-----------*/
// 表单内容改变保存配置
$('[name],input').change(function () {
  if ($(this).attr("type") == "radio" && ($(this).is(".utc") || $(this).is(".local"))) {
    var name = $(this).attr("class");
    switch (name) {
      case "utc": {
        data = { "start_posix_time": start_posix_utc, "time_ratio": time_ratio_to_utc };
        break;
      }
      case "local": {
        data = { "start_posix_time": start_posix_local, "time_ratio": time_ratio_to_local };
        break;
      }
      default:
        break;
    }
    // utcDis(name);
    biSetGlobalParameter("ASPluginPixelFormatConvert.start_posix_time", data["start_posix_time"]);
    biSetGlobalParameter("ASPluginPixelFormatConvert.time_ratio", data["time_ratio"]);
    biSetGlobalParameter("ASPluginPixelFormatConvert.flag", $(this).is(".utc") ? 1 : 2);
  }
  setConfig();
});

//保存配置
function setConfig() {
  configs = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root><config ";
  $('.container [name]').each(function () {
    var name = $(this).attr('name');
    var val = $(this).val();
    if ($(this).is("a")) {
      configs += name + "=\"" + ($(this).text().indexOf(not_config) == -1 ? $(this).text() : "") + "\" ";
    } else if ($(this).is("select")) {
      configs += name + "=\"" + val + "\" ";
    }
  });
  for (var i in data) {
    configs += i + "=\"" + (Array.isArray(data[i]) ? data[i].join(",") : data[i]) + "\" ";
  }
  var videoChannels = "";
  $(".container>ul>li:nth-child(4) input:checked").each(function () {
    videoChannels += $(this).attr("value") + ",";
  });
  configs += "videoChannels=\"" + videoChannels.substring(0, videoChannels.length - 1) + "\" ";
  configs += "flag=\"" + ($(".utc").is(":checked") ? 1 : ($(".local").is(":checked") ? 2 : "")) + "\" ";
  configs += " /></root>";
  biSetModuleConfig("pixel-format-convert.aspluginpixelformatconvert", configs);
}

//初始化
function biOnInitEx(config, moduleConfigs) {
  var lang = biGetLanguage() == 1 ? en : cn;
  $('[language]').each(function () {
    var value = $(this).attr('language');
    $(this).text(lang[value]);
  });
  not_config = lang["not_config"];
  configs = moduleConfigs["pixel-format-convert.aspluginpixelformatconvert"];
  var parser = new DOMParser();
  var xmlDoc = parser.parseFromString(configs, "text/xml");
  var obj = {};
  var root = xmlDoc.getElementsByTagName('root');
  var keys = root[0].childNodes[0].attributes;
  for (var i = 0; i < keys.length; i++) {
    //获取root自身字节的属性
    obj[keys[i].nodeName] = keys[i].nodeValue;
  }
  loadConfig(obj);
}

function biOnQueriedDirsInDirectory(dirs, path) {
  var lists = dirs[0].split("\n");
  for (var i of lists) {
    biQueryFileExist(i + split + "meta.xml");
  }
}

function biOnQueriedFileExist(exist, path) {
  if (exist) {
    biQueryFileText(path);
  }
}

function biOnQueriedFileText(text, path) {
  var parser = new DOMParser();
  var xmlDoc = parser.parseFromString(text, "text/xml");
  var root = xmlDoc.getElementsByTagName('root');
  var start_posix_utc1 = root[0].getAttribute("start_posix_utc");
  var time_ratio_to_utc1 = root[0].getAttribute("time_ratio_to_utc");
  var start_posix_local1 = root[0].getAttribute("start_posix_local");
  var time_ratio_to_local1 = root[0].getAttribute("time_ratio_to_local");
  start_posix_utc.push(start_posix_utc1);
  time_ratio_to_utc.push(time_ratio_to_utc1);
  start_posix_local.push(start_posix_local1);
  time_ratio_to_local.push(time_ratio_to_local1);
  data = { "start_posix_time": start_posix_utc, "time_ratio": time_ratio_to_utc };
}

function loadConfig(obj) {
  if (obj == null) return;
  $('.container [name]').each(function () {
    var val = obj[$(this).attr('name')];
    if ($(this).is('a')) {
      if (val.trim().length > 0 && val != "null") {
        $(this).attr("title", val).text(val);
        split = reg.test(val) ? "\\" : "/";
        biQueryDirsInDirectory(val);
      } else {
        $(this).text(not_config);
      }
    } else if ($(this).is("select")) {
      $(this).val(val);
    }
  });
  if (obj["videoChannels"].length > 0) {
    if (obj["videoChannels"].length > 2 && obj["videoChannels"].indexOf(",") != -1) {
      var val = obj["videoChannels"].split(",");
      for (let i in val) {
        $(".container>ul>li:nth-child(4) input[value=" + val[i] + "]").attr("checked", true);
      }
    } else if (obj["videoChannels"].length <= 2 && obj["videoChannels"].indexOf(",") == -1) {
      $(".container>ul>li:nth-child(4) input[value=" + obj["videoChannels"] + "]").attr("checked", true);
    }
  }
  biQueryGlobalParameter("ASPluginPixelFormatConvert.flag");
}

function biOnQueriedGlobalParameter(id, value) {
  if (value == 1) {
    $(".utc").attr({ "checked": true });
    // utcDis("utc");
    setTimeout(function () {
      data = { "start_posix_time": start_posix_utc, "time_ratio": time_ratio_to_utc };
    }, 300)
  } else if (value == 2) {
    $(".local").attr({ "checked": true });
    // utcDis("local");
    setTimeout(function () {
      data = { "start_posix_time": start_posix_local, "time_ratio": time_ratio_to_local };
    }, 300)
  }
}