var child_config = {};
$('[name]').on('change', function () {
  var val = $(this).val();
  var type = $(this).attr("type");
  if (type == 'checkbox') {
    val = $(this).is(":checked") ? "yes" : "no";
  } else if ($(this).is("select")) {
    $(this).next().attr("disabled", ["3", "13"].includes($(this).val()));
  }
  child_config[$(this).attr("name")] = val;
  checkAscBlf();
  setConfig();
});

function checkAscBlf() {
  var count1 = false, checked1 = false, count2 = false, checked2 = false;//是否有值为mixed type的select
  $("select").each(function () {
    if ($(this).val() == "3") {
      count1 = true;
      if ($(this).next().is(":checked")) checked1 = true;
    } else if ($(this).val() == "13") {
      count2 = true;
      if ($(this).next().is(":checked")) checked2 = true;
    }
  })
  if (!count1) {
    $("#asc").prop({ "disabled": true, "checked": false });
  } else {
    $("#asc").prop({ "disabled": false, "checked": checked1 });
  }
  if (!count2) {
    $("#blf").prop({ "disabled": true, "checked": false })
  } else {
    $("#blf").prop({ "disabled": false, "checked": checked2 });
  }
}

$("#asc,#blf").change(function () {
  var flag = $(this).is(":checked");
  if ($(this).attr("id") == "asc") {
    $("select").each(function () {
      if ($(this).val() == "3") {
        $(this).next().prop("checked", flag);
        child_config[$(this).next().attr("name")] = flag ? "yes" : "no";
      }
    })
  } else {
    $("select").each(function () {
      if ($(this).val() == "13") {
        $(this).next().prop("checked", flag);
        child_config[$(this).next().attr("name")] = flag ? "yes" : "no";
      }
    })
  }
  setConfig();
})

function loadConfig(config) {
  $("[name]").each(function () {
    var type = $(this).attr("type"),
      val = config[$(this).attr("name")];
    if (type == 'checkbox') {
      $(this).prop('checked', val == 'yes' ? true : false);
      if ($(this).is(":checked") && ["3", "13"].includes($(this).prev().val())) {
        //只要有选择mixed asc或者mixed blf的,最后一排对应的input:checkbox就会选中
        if ($(this).prev().val() == "3") {
          $("#asc").prop("checked", true);
        } else if ($(this).prev().val() == "13") {
          $("#blf").prop("checked", true);
        }
      }
    } else {
      $(this).val(val);
      if (["3", "13"].includes(val)) {
        $(this).next().attr("disabled", true);
      }
    }
  })
  checkAscBlf();
}

function setConfig() {
  var file = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root";
  for (var i in child_config) {
    file += " " + i + "=\"" + child_config[i] + "\"";
  }
  file += "/>";
  biSetModuleConfig("default-file-io.plugindefaultfileio", file);
}

function biOnInitEx(config, moduleConfigs) {
  $('[language]').each(function () {
    var value = $(this).attr('language');
    $(this).html(biGetLanguage() == 1 ? en[value] : cn[value]);
  });
  var parser = new DOMParser();
  var xmlDoc = parser.parseFromString(moduleConfigs["default-file-io.plugindefaultfileio"], "text/xml");
  var countrys = xmlDoc.getElementsByTagName('root');
  var keys = countrys[0].attributes;
  for (var i = 0; i < keys.length; i++) {
    child_config[keys[i].nodeName] = keys[i].nodeValue;
  }
  loadConfig(child_config);
}