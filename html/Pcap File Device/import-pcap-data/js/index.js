var not_config = "",
  pcap_channel = "",
  dialogConfig = {},
  reg = /^[a-zA-Z]:/;
$('.container').on("change", "[name],select", function () {
  changeVal(this);
});
$("a").click(function () {
  biSelectPath($(this).attr("name"), BISelectPathType.Directory, null);
})
$('button').click(function () {
  var name = $(this).attr("language");
  switch (name) {
    case "add": {
      biSelectPath("context_list", BISelectPathType.OpenFile, {
        ".pcap": "pcap"
      });
      break;
    }
    case "clear": {
      dialogConfig["context_list"] = [];
      $(".content").empty();
      setConfig();
      break;
    }
    case "convert": {
      if ($("[name=output_data_path]").val().indexOf(not_config) == -1) {
        biRunStandaloneTask("Import Pcap Data", "import-pcap-data-task.aspluginpcap", getConfig())
      }
      break;
    }
  }
})
//仅步长=精确位数-1时适用
$(".container").on("input", "input[type=number]", function (e) {
  var v = $(this).val();
  if (isNaN(e.which)) {
    $(this).attr("value", compareVal(this, v)).val(compareVal(this, v))
  } else {
    $(this).attr("value", v);
  }
  changeVal(this);
});
$(".container").on("blur", "input[type=number]", function () {
  $(this).attr("value", compareVal(this, $(this).val())).val(compareVal(this, $(this).val()));
});

function compareVal(obj, val) {
  var newVal = 0;
  var step = $(obj).attr("step").length - 1;
  var name = $(obj).attr("name");
  if (isNaN(val) || !Boolean(val)) {
    newVal = Number($(obj).attr('value'));
  } else {
    var min = 0,
      max = 0;
    switch (name) {
      case "pcap_interval": {
        max = 1000000;
        min = 0;
        break;
      }
      case "time_ratio": {
        max = 10;
        min = 0.000001;
        break;
      }
      case "load_speed": {
        step = step - 1;
        max = 10;
        min = 0.01;
        break;
      }
      case "loop_count": {
        max = 100000;
        min = 1;
        break;
      }
      default:
        break;
    }
    if (val > max) {
      val = max;
    } else if (val < min) {
      val = min;
    }
    //解决为负数时末尾输入5不能进行四舍五入
    if (name == "time_ratio") {
      newVal = Math.round(Math.abs(val) * Math.pow(10, 6)) / Math.pow(10, 6);
    } else {
      newVal = Math.round(Math.abs(val) * Math.pow(10, step)) / Math.pow(10, step);
    }
    if (val < 0) newVal = -newVal;
  }
  if (name == "time_ratio") {
    return step > 0 ? newVal.toFixed(6) : newVal;
  } else {
    return step > 0 ? newVal.toFixed(step) : newVal;
  }
}

function getConfig() {
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root><config ";
  for (var i in dialogConfig) {
    if (i == "context_list") {
      if (dialogConfig[i] != "") {
        text += i + "=\"" + dialogConfig[i].join("|") + "\" ";
      }
    } else {
      text += i + "=\"" + dialogConfig[i] + "\" ";
    }
  }
  text += "/></root>";
  return text;
}

function setConfig() {
  biSetModuleConfig("import-pcap-data.aspluginpcap", getConfig());
}

function biOnInitEx(config, moduleConfigs) {
  var lang = biGetLanguage() == 1 ? en : cn;
  $('[language]').each(function () {
    var value = $(this).attr('language');
    $(this).text(lang[value]);
  });
  not_config = lang["not_config"];
  pcap_channel = lang["pcap_channel"];
  for (var key in moduleConfigs) {
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(moduleConfigs[key], "text/xml");
    var root = xmlDoc.getElementsByTagName('root');
    var keys = root[0].childNodes[0].attributes;
    for (var i = 0; i < keys.length; i++) {
      if (keys[i].nodeName == "context_list") {
        dialogConfig[keys[i].nodeName] = keys[i].nodeValue != "" ? keys[i].nodeValue.split("|") : [];
      } else {
        dialogConfig[keys[i].nodeName] = keys[i].nodeValue;
      }
    }
    loadConfig();
  }
}

function loadConfig() {
  $(".container [name]").each(function () {
    var name = $(this).attr("name");
    var val = dialogConfig[name];
    if ($(this).is("a")) {
      if (["", "null"].includes(val)) {
        $("[name=" + name + "]").text(not_config);
      } else {
        $("[name=" + name + "]").text(val).attr("title", val);
        biQueryDirectoryExist(val);
      }
    } else {
      $(this).val(compareVal(this, val)).attr("value", compareVal(this, val));
    }
  })

  if (dialogConfig["context_list"].length > 0) {
    for (var i in dialogConfig["context_list"]) {
      var val = dialogConfig["context_list"][i].split(",");
      $(".content").append("<div class=\"box\"><ul><li class=\"fixclear\"><a href=\"javascript:;\" class=\"left\">" + val[0] + "</a><img src=\"import-pcap-data/img/del.png\" class=\"right\" onclick=\"remove(this)\" alt=\"delete\"></li><li><span>" + pcap_channel + "</span><select><option value=\"-1\">(Disabled)</option><option value=\"1\">CH1</option><option value=\"2\">CH2</option><option value=\"3\">CH3</option><option value=\"4\">CH4</option><option value=\"5\">CH5</option><option value=\"6\">CH6</option><option value=\"7\">CH7</option><option value=\"8\">CH8</option><option value=\"9\">CH9</option><option value=\"10\">CH10</option><option value=\"11\">CH11</option><option value=\"12\">CH12</option><option value=\"13\">CH13</option><option value=\"14\">CH14</option><option value=\"15\">CH15</option><option value=\"16\">CH16</option></select></li></ul></div>");
      $(".content>.box").eq(i).find("select").val(Number(Boolean(val[1]) ? val[1] : -1));
      biQueryFileExist(val[0]);
    }
  }
}

function remove(obj) {
  var i = $(obj).parents(".box").index();
  dialogConfig["context_list"].splice(i, 1);
  $(obj).parents(".box").remove();
  setConfig();
}

function changeVal(obj) {
  if ($(obj).is("select")) {
    var i = $(obj).parents(".box").index();
    var val = dialogConfig["context_list"][i];
    dialogConfig["context_list"][i] = val.substr(0, val.indexOf(",") + 1) + $(obj).val()
  } else if ($(obj).attr("type") == "number") {
    dialogConfig[$(obj).attr("name")] = compareVal(obj, $(obj).val())
  } else {
    dialogConfig[$(obj).attr("name")] = $(obj).val()
  }
  setConfig();
}

function biOnSelectedPath(key, path) {
  if (key == "context_list") {
    if (!Boolean(path)) return;
    var count = 0;
    if (dialogConfig["context_list"] != "") {
      for (var i of dialogConfig["context_list"]) {
        var val = i.substr(0, i.indexOf(","));
        if (path == val) {
          count++;
          return;
        }
      }
    }
    if (count == 0) {
      dialogConfig["context_list"].push(path + ",-1");
      $(".content").append("<div class=\"box\"><ul><li class=\"fixclear\"><a href=\"javascript:;\" class=\"left\">" + path + "</a><img src=\"import-pcap-data/img/del.png\" class=\"right\" onclick=\"remove(this)\" alt=\"delete\"></li><li><span>" + pcap_channel + "</span><select><option value=\"-1\">(Disabled)</option><option value=\"1\">CH1</option><option value=\"2\">CH2</option><option value=\"3\">CH3</option><option value=\"4\">CH4</option><option value=\"5\">CH5</option><option value=\"6\">CH6</option><option value=\"8\">CH7</option><option value=\"9\">CH8</option><option value=\"9\">CH9</option><option value=\"10\">CH10</option><option value=\"11\">CH11</option><option value=\"12\">CH12</option><option value=\"13\">CH13</option><option value=\"14\">CH14</option><option value=\"15\">CH15</option><option value=\"16\">CH16</option></select></li></ul></div>");
    }
  } else {
    if (!Boolean(path)) {
      $('[name=' + key + ']').removeAttr('title').text(not_config).removeClass("red");
      dialogConfig[key] = path;
    } else {
      var text = path + (reg.test(path) ? '\\' : '\/');
      $('[name=' + key + ']').attr('title', text).text(text).removeClass("red");
      dialogConfig[key] = text;
    }
  }
  setConfig();
}

function biOnQueriedFileExist(exist, path) {
  if (!exist) {
    $(".content a").each(function () {
      if ($(this).text() == path) {
        $(this).addClass("red");
        return;
      }
    })
  }
}

function biOnQueriedDirectoryExist(exist, path) {
  if (!exist) $("[name=output_data_path]").addClass("red");
}