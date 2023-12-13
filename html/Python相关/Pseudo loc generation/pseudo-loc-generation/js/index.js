var moduleName = "";
/*----------配置读取与存储-----------*/
$('input[type=checkbox],select').change(function () {
  setConfig();
})
$('.container').on("blur", "input[type=text]", function () {
  if ($(this).hasClass("red")) $(this).val($(this).attr("value")).removeClass("red").addClass("green");
}).on('input', "input[type=text]", function () {
  compareTextVal(this);
  setConfig();
});
//保存配置
function setConfig() {
  var config = {};
  var overwriteParams = {};
  $(".container [name]").each(function () {
    var name = $(this).attr("name");
    var val = $(this).val();
    var type = $(this).attr("type");
    if (type == "checkbox") {
      config.enabled = $(this).is(":checked");
    } else if (type == "text") {
      overwriteParams[name] = $(this).attr("value");
    } else {
      overwriteParams[name] = val;
    }
  });
  config.moduleName = moduleName;
  config.overwriteFreq = "";
  config.overwriteParams = overwriteParams;
  biSetPythonModuleConfig("pseudo-loc-generation", "default", config);
}

function biOnInitEx(config, moduleConfigs) {
  var lang = biGetLanguage() == 1 ? en : cn;
  $('[language]').each(function () {
    var value = $(this).attr('language');
    $(this).text(lang[value])
  });
  moduleName = lang["moduleName"];
  biQueryPythonModuleConfig("pseudo-loc-generation", "default");
}

function biOnQueriedPythonModuleConfig(templateID, idPostfix, config) {
  $(".container [name]").each(function () {
    var val = config["overwriteParams"][$(this).attr("name")];
    var type = $(this).attr("type");
    if (type == "checkbox") {
      $(this).attr("checked", config["enabled"]);
    } else if (type == "text") {
      $(this).val(val).attr("value", val).addClass("green");
    } else {
      $(this).val(val);
    }
  });
}

function compareTextVal(obj) {
  var name = $(obj).attr("name");
  var val = $(obj).val();
  if (isNaN(val)) {
    $(obj).addClass("red").removeClass("green");
  } else {
    var min = 0,
      max = 0;
    val = Number(val);
    switch (name) {
      case "origin_lng": {
        min = -180;
        max = 180;
        break;
      }
      case "origin_lat": {
        min = -80;
        max = 80;
        break;
      }
      case "origin_hd": {
        min = -180;
        max = 180;
        break;
      }
    }
    if (val < min || val > max) {
      $(obj).addClass("red").removeClass("green");
    } else {
      $(obj).addClass("green").removeClass("red").attr("value", $(obj).val());
    }
  }
}