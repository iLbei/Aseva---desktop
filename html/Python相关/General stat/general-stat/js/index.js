var moduleName = "";
/*---------------input [type=number]--------------*/
$(".container")
  .on("change", "input[type=number]", function () {
    $(this).val(compareVal(this, $(this).val()));
  })
  .on("input", "input[type=number]", function (e) {
    if (e.which == undefined) {
      var step = $(this).attr("step").length - 2;
      var val = Number($(this).val());
      $(this).val(step > 0 ? val.toFixed(step) : val);
    }
    setConfig();
  })
  .on("keypress", "input[type=number]", function (e) {
    if (
      !(e.charCode >= 48 && e.charCode <= 57) &&
      !(e.charCode == 45 || e.charCode == 46)
    )
      return false;
  });

function compareVal(obj, val) {
  var step =
    $(obj).attr("step").length > 2 ? $(obj).attr("step").length - 2 : 0;
  var v = Number(val);
  var newVal = "";
  if (isNaN(val) || !Boolean(val)) {
    newVal = Number($(obj).attr("value"));
  } else {
    var min = Number($(obj).attr("min")),
      max = Number($(obj).attr("max"));
    v = v < min ? min : v;
    v = v > max ? max : v;
    if (step > 0) {
      newVal =
        Math.round((Math.abs(v) * Math.pow(10, step)).toFixed(1)) /
        Math.pow(10, step);
      if (v < 0) newVal = -newVal;
    } else {
      newVal = Math.floor(v);
    }
  }
  return step > 0 ? newVal.toFixed(step) : newVal;
}

/*----------配置读取与存储-----------*/
$("[name]").change(function () {
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
    } else if (type == "number") {
      overwriteParams[name] = compareVal(this, val);
    }
  });
  config.moduleName = moduleName;
  config.overwriteFreq = "";
  config.overwriteParams = overwriteParams;
  biSetPythonModuleConfig("general-stat", "default", config);
}

function biOnInitEx(config, moduleConfigs) {
  var lang = biGetLanguage() == 1 ? en : cn;
  $("[language]").each(function () {
    var value = $(this).attr("language");
    $(this).text(lang[value]);
  });
  moduleName = lang["moduleName"];
  biQueryPythonModuleConfig("general-stat", "default");
}

function biOnQueriedPythonModuleConfig(templateID, idPostfix, config) {
  $(".container [name]").each(function () {
    var val = config["overwriteParams"][$(this).attr("name")];
    var type = $(this).attr("type");
    if (type == "checkbox") {
      $(this).attr("checked", config["enabled"]);
    } else if (type == "number") {
      $(this).val(compareVal(this, val));
    } else if (type == "text") {
      $(this).val(val).attr("value", val).addClass("green");
    } else {
      $(this).val(val);
    }
  });
}