var activeIndex = "";
var overwrite_params = [];
var modules = [];
$("button").on("click", function () {
  var language = $(this).attr("language");
  if (language == "input_add_signal") {
    var text = $("[name=overwriteParamter]").val() + "='" + $("[name=overwriteValue]").val() + "'";
    $(".params").append("<p name=\"" + $("[name=overwriteParamter]").val() + "\" value=\"" + $("[name=overwriteValue]").val() + "\" title=\"" + text + "\">" + text + "</p>")
    $(".params>p:last-child").addClass("active").siblings().removeClass("active");
  } else if (language == "input_remove_signal") {
    if ($(".params>p").length > 1) {
      if ($("P.active").index() == $(".params>p").length - 1) {
        $("p.active").prev().addClass("active").siblings().removeClass("active");
        $("p.active").next().remove();
      } else {
        $("p.active").next().addClass("active").siblings().removeClass("active");
        $("p.active").prev().remove();
      }
    } else {
      $("p.active").remove();
    }
  }
  addDisabled($("[name=overwriteParamter]").val());
  if (language == "input_add_signal") {
    $(this).addClass("disabled_background").attr("disabled", true);
  }
  changeVal();
})
$("select").change(function () {
  addDisabled($(this).val());
})

function addDisabled(val) {
  var count = 0;
  for (var i in modules[activeIndex][0]["overwrite_param"]) {
    if (modules[activeIndex][0]["overwrite_param"][i]["name"] == val) count++;
  }
  if (count != 0) {
    $("[language=input_add_signal]").addClass("disabled_background").attr("disabled", true);
  } else {
    $("[language=input_add_signal]").removeClass("disabled_background").removeAttr("disabled");
  }
  if ($(".params>p").length == 0) {
    $("[language=input_remove_signal]").addClass("disabled_background").attr("disabled", true);
  } else {
    $("[language=input_remove_signal]").removeClass("disabled_background").removeAttr("disabled");
  }
}
$(".params").on("click", "p", function () {
  $(this).addClass("active").siblings().removeClass("active");
})

function loadConfig(config) {
  activeIndex = config.split("|")[0];
  var params = [];
  params = JSON.parse(config.split("|")[1]);
  var options = "";
  for (var i in params) {
    options += "<option value=\"" + params[i]["name"] + "\">" + params[i]["name"] + "</option>";
  }
  $("[name=overwriteParamter]").append(options);
  if (Boolean(modules[activeIndex][0]["overwrite_param"]) && modules[activeIndex][0]["overwrite_param"].length != 0) {
    for (var i in modules[activeIndex][0]["overwrite_param"]) {
      var text = modules[activeIndex][0]["overwrite_param"][i]["name"] + "='" + modules[activeIndex][0]["overwrite_param"][i]["value"] + "'";
      $("div.params").append("<p name=\"" + modules[activeIndex][0]["overwrite_param"][i]["name"] + "\" value=\"" + modules[activeIndex][0]["overwrite_param"][i]["value"] + "\" title=\"" + text + "\">" + text + "\</p>");
    }
    $("div.params>p").eq(0).addClass("active");
  }
  addDisabled($("select>option:first-child").text());
}

function changeVal() {
  overwrite_params = [];
  $(".params>p").each(function () {
    var name = $(this).attr("name");
    var value = $(this).attr("value");
    overwrite_params.push({
      "name": name,
      "value": value
    });
  })
  modules[activeIndex][0]["overwrite_param"] = overwrite_params;
  biSetLocalVariable("python_script_overwriteparam" + activeIndex, JSON.stringify(modules[activeIndex][0]["overwrite_param"]));
  setConfig(modules);
}