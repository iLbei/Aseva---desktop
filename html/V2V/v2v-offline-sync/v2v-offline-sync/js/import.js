var not_config = "",
  dialogConfig = [],
  not_available = "",
  newChannels = [],
  reg = /^[a-zA-Z]:/,
  channels = [],
  count = 0,
  taskConfig = "";
$(function () {
  for (var i = 0; i < 5; i++) {
    $(".processing>ul").append("<li class=\"fixclear\" id=\"" + (i + 6) + "\"> <div class = \"left\" ><span language=\"object\"> Object </span>#" + (i + 1) + "</div><div class= \"right\"><ul><li><span language = \"data_path\"> </span> <a href = \"javascript:;\" language = \"not_config\" name=\"dataPath\"> </a> </li><li><span language=\"import_gnss\"></span> <select name = \"GNSS_IMUChannel\" class = \"right\"></select></li></ul></div></li>")
  }
})
/*----------配置读取与存储-----------*/
$('.processing').on("change", "select", function () {
  changeVal(this);
});
$('.processing').on("click", "a", function () {
  biSelectPath($(this).parents("div.right").parent("li").index(), 3, null);
})
$("button").click(function () {
  biSetViewConfig(taskConfig);
  biRunStandaloneTask("Data Import", "v2v-offline-sync-task.V2VOfflineSyncTask", taskConfig);
})

function biOnResultOfStandaloneTask(key, result, returnValue) {
  if (result == 1) {
    biAlert("OK!");
  } else {
    biAlert("Failed!");
  }
}

function changeVal(obj) {
  var type = $(obj).attr("type");
  var val = $(obj).val();
  if (type == 'checkbox') {
    val = $(obj).is(':checked') ? "yes" : "no";
  } else if ($(obj).is("a")) {
    val = $(obj).text().indexOf(not_config) == -1 ? $(obj).text() : "";
  }
  dialogConfig[$(obj).parents("li")[$(obj).parents("li").length - 1].id][$(obj).attr("name")] = val;
  biSetLocalVariable("v2v-offline-sync", JSON.stringify(dialogConfig));
  setConfig();
}

function biOnSelectedPath(key, path) {
  if (path != null) {
    $(".processing>ul>li").eq(key).find("a").html(path).attr("title", path);
    biQueryDirsInDirectory(path);
  }
  changeVal($(".processing>ul>li").eq(key).find("a"));
}
//保存配置
function setConfig() {
  var config = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root";
  for (var i in dialogConfig[0]) {
    config += " " + i + "=\"" + dialogConfig[0][i] + "\"";
  }
  config += ">"
  for (var i = 1; i < dialogConfig.length; i++) {
    config += i < 6 ? "<config" : "<importConfig";
    for (var j in dialogConfig[i]) {
      config += " " + j + "=\"" + dialogConfig[i][j] + "\"";
    }
    config += "/>"
  }
  config += "</root>";
  taskConfig = config;
  biSetModuleConfig("v2v-offline-sync.pluginv2vutilities", config);
}

function biOnInitEx(config, moduleConfigs) {
  var lang = biGetLanguage() == 1 ? en : cn;
  $('[language]').each(function () {
    var value = $(this).attr('language');
    $(this).text(lang[value])
  });
  not_config = lang["not_config"];
  not_available = lang["not_available"];
  for (var key in moduleConfigs) {
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(moduleConfigs[key], "text/xml");
    if (moduleConfigs[key] != "") taskConfig = moduleConfigs[key];
    var child = xmlDoc.childNodes[0].childNodes;
    var root = xmlDoc.childNodes[0].attributes;
    var obj = new Object()
    for (var i = 0; i < root.length; i++) {
      obj[root[i].nodeName] = root[i].nodeValue;
    }
    dialogConfig.push(obj);
    for (var i = 0; i < child.length; i++) {
      var key = child[i].attributes;
      obj = new Object();
      for (var j = 0; j < key.length; j++) {
        obj[key[j].nodeName] = key[j].nodeValue;
      }
      dialogConfig.push(obj);
    }
    loadConfig(dialogConfig);
  }
}

function loadConfig(obj) {
  $('.processing>ul>li').each(function (i) {
    $(this).find("[name]").each(function () {
      var val = obj[i + 6][$(this).attr('name')];
      if ($(this).is('a')) {
        var text = "";
        for (var j = 65; j < 72; j++) {
          text += "<option value = \"" + (j - 65) + "\" > Channel " + String.fromCharCode(j) + not_available + " </option>";
        }
        $(this).parent().next().find("select").html(text);
        if (!["", "null", "(Not configured)"].includes(val)) {
          $(this).attr("title", val).html(val);
          biQueryDirsInDirectory(val);
        }
      } else {
        $(this).val(val);
      }
    })
  })
}

function biOnQueriedDirsInDirectory(dirs, path) {
  var dir = dirs[0].split("\n");
  var dirs_paths = [];
  for (var i in dir) {
    dirs_paths.push(dir[i] + (reg.test(path) ? "\\output\\online\\sample" : "/output/online/sample"));
  }
  for (var i of dirs_paths) {
    newChannels = [], channels = [];
    biQueryFilesInDirectory(i);
  }
}

function biOnQueriedFilesInDirectory(files, path) {
  var output = reg.test(path) ? "\\output\\online\\sample" : "/output/online/sample";
  var newfiles = "";
  if (files != null) {
    newfiles = files[0].split("\n");
    for (var i of newfiles) {
      if (i.indexOf("gnssimu-sample-v5") != -1 || i.indexOf("gnssimu-sample-v6") != -1 || i.indexOf("gnssimu-sample-v7") != -1) {
        channels.push(Number(i.substr(i.indexOf("@") + 1, 1)));
      }
    }
    newChannels = channels.filter((ele, i, arr) => {
      return arr.indexOf(ele) === i;
    });
    $(".processing>ul>li").each(function (i) {
      if ($(this).find("a").html() == path.split(output)[0].substr(0, path.split(output)[0].lastIndexOf(reg.test(path) ? "\\" : "/"))) {
        $(this).find("select").empty();
        var text = "";
        for (var j = 65; j < 72; j++) {
          text += "<option value = \"" + (j - 65) + "\" > Channel " + String.fromCharCode(j) + (newChannels.indexOf(j - 65) == -1 ? not_available : "") + " </option>";
        }
        $(this).find("select").html(text).val(dialogConfig[i + 6][$(this).find("select").attr("name")]);
      }
    })
  }
}