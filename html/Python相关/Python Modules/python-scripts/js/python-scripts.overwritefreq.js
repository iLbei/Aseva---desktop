var modules = [],
  activeIndex = 0;
$('input[type=number]').on({
  'input': function () {
    modules[activeIndex][0]["overwrite_freq"] = compareVal($("[name=overwrite_freq]"), $("[name=overwrite_freq]").val());
    biSetLocalVariable("python_script_overwritefreq" + activeIndex, JSON.stringify(modules[activeIndex][0]));
    setConfig();
  },
  'keypress': function (e) {
    if (!(e.charCode >= 48 && e.charCode <= 57) && !(e.charCode == 45 || e.charCode == 46)) return false;
  },
  "blur": function () {
    $(this).val(compareVal(this, $(this).val()));
  }
})

$("[name=overwritedef]").change(function () {
  if ($(this).is(":checked")) {
    var v = $("[name=overwrite_freq]").attr("value");
    $("[name=overwrite_freq]").val(v);
    modules[activeIndex][0]["overwrite_freq"] = "yes";
  } else {
    modules[activeIndex][0]["overwrite_freq"] = $("[name=overwrite_freq]").val();
  }
  useDefault();
  biSetLocalVariable("python_script_overwritefreq" + activeIndex, JSON.stringify(modules[activeIndex][0]));
  setConfig();
})

function useDefault() {
  if ($("[name=overwritedef]").is(":checked")) {
    $("[name=overwrite_freq]").val($("[name=overwrite_freq]").attr("value")).addClass("disabled_background").attr("disabled", true);
    $("[language=overwrite_freq]").addClass("disabled_a");
  } else {
    $("[name=overwrite_freq]").removeClass("disabled_background").attr("disabled", false);
    $("[language=overwrite_freq]").removeClass("disabled_a");
  }
}

function loadConfig(config) {
  activeIndex = Number(config);
  if (modules[activeIndex][0]["overwrite_freq"] == undefined || modules[activeIndex][0]["overwrite_freq"] == "yes") {
    $("[name=overwritedef]").attr("checked", true);
  } else {
    $("[name=overwritedef]").attr("checked", false);
    $("[name=overwrite_freq]").val(compareVal($("[name=overwrite_freq]"), modules[config][0]["overwrite_freq"]));
  }
  biQueryPythonTemplateInfo(modules[activeIndex][0]["template"]);
}

function biOnQueriedPythonTemplateInfo(templateID, infoXmlBase64) {
  var info = getDecode(infoXmlBase64);
  var parser = new DOMParser();
  var countrys = parser.parseFromString(info, "text/xml");
  // 获取值
  for (var k = 0; k < countrys.childNodes.length; k++) {
    var v = countrys.childNodes[k].attributes["freq"].value;
    $("[name=overwrite_freq]").attr("value", v);
    useDefault();
  }
}