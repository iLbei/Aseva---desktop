var childIndex = 0,
  modules = [],
  not_config = "",
  reg = /^[A-Za-z_][A-Za-z_0-9]{0,}$/im;
var option = "";

$(".in").on("change", "[name]", function () {
  if ($(this).attr("name").indexOf("source_signal") != -1) {
    signalChange($(this).parent("div"), $(this).attr("id"));
  }
  changeVal();
})

$('.in').on('click', '.signal_list', function () {
  $(this).addClass('bdBlack').siblings().removeClass('bdBlack');
})

// addremove
$('a').on('click', function () {
  var name = $(this).attr('language');
  switch (name) {
    case 'input_remove_signal':
      $('.bdBlack').remove();
      changeVal();
      break;
    case 'input_add_signal':
      var leng = $('.in>div').find('div').length;
      $('.in>div').append("<div class=\"signal_list\"><span class=\"red\" language=\"in_param_name\"></span><input type=\"text\" name=\"param\"><span language=\"default_val\"></span><input type=\"text\" value=\"0\" name=\"default_val\" class=\"green\"><input type=\"radio\" name=\"nearest" + leng + "\" id=\"nearest_1" + leng + "\" value=\"no\"><label for=\"nearest_1" + leng + "\" language=\"nearest\"></label><input type=\"radio\" name=\"nearest" + leng + "\" id=\"nearest_2" + leng + "\" value=\"yes\" checked><label for=\"nearest_2" + leng + "\" language=\"chazhi\"></label><br><span language=\"source_signal\"></span><input type=\"radio\" name=\"source_signal_" + leng + "\" id=\"id_" + leng + "\" checked><label for=\"id_" + leng + "\" language=\"signal\"></label><a href=\"javascript:;\" language=\"not_config\" class=\"red\" name=\"signal\">" + not_config + "</a><input type=\"radio\" name=\"source_signal_" + leng + "\" id=\"parameter_" + leng + "\" ><label for=\"parameter_" + leng + "\" language=\"parameter\"></label><select name=\"signal\">" + option + "</select></div>");
      signalChange($(".in>div>div:last-child"), "id");
      $('.in>div>div:last-child [language]').each(function () {
        var value = $(this).attr('language');
        $(this).text(biGetLanguage() == 1 ? en[value] : cn[value]);
      });
      break;
  }
})

//select signal 
$('.in>div').on('click', 'div a[name = signal]', function () {
  if ($(this).hasClass("disabled_a")) return;
  var key = $(this).parent().index();
  var id = $(this).attr('id');
  biSelectSignal(key, id, false, false, false, false, false);
})

$('.in').on('input', '.signal_list [name="param"]', function () {
  $(this).val() != '' ? $(this).prev().removeClass('red') : $(this).prev().addClass('red');
  if (reg.test($(this).val())) {
    $(this).removeClass('red').addClass("green").attr("value", $(this).val());
  } else {
    $(this).addClass('red').removeClass("green");
  }
  changeVal();
}).on("blur", '.signal_list [name="param"]', function () {
  if ($(this).hasClass("red")) $(this).val($(this).attr("value")).removeClass("red").addClass("green");
  if ($(this).val().trim().length != 0) {
    $(this).prev().removeClass("red");
  } else {
    $(this).prev().addClass("red");
  }
})

$('body').on('input', '[name=default_val]', function () {
  isNaN(Number($(this).val())) ? $(this).addClass('red').removeClass("green") : $(this).removeClass('red').addClass("green").attr("value", $(this).val());
}).on("blur", '[name=default_val]', function () {
  if ($(this).hasClass("red")) $(this).val($(this).attr("value")).removeClass("red").addClass("green");
})

function biOnSelectedSignal(key, valueSignalInfo, signBitSignalInfo, scale) {
  if (valueSignalInfo != null && valueSignalInfo.typeName == null) return;
  if (valueSignalInfo == null) {
    $('.in>div>div').eq(key).find('a[name=signal]').text(not_config).addClass('red').removeClass('green').removeAttr('id title');
  } else {
    $('.in>div>div').eq(key).find('a[name=signal]').text(valueSignalInfo.typeName + ':' + valueSignalInfo.signalName).removeClass('red').addClass('green').attr('id', valueSignalInfo.id).attr('title', valueSignalInfo.typeName + ':' + valueSignalInfo.signalName);
  }
  changeVal();
}

function biOnQueriedSignalInfo(key, signalInfo) {
  var signal = $('.in>div>div').eq(Number(key)).find('a[name=signal]');
  if (signalInfo == null) {
    signal.text(signal.attr('id')).addClass('red').removeClass('green');
  } else {
    signal.text(signalInfo.typeName + ":" + signalInfo.signalName).attr("title", signalInfo.typeName + ":" + signalInfo.signalName).addClass('green').removeClass('red');
  }
}

function changeVal() {
  modules[childIndex][1]["content"]["in"] = [];
  $(".in>div>div").each(function (i) {
    modules[childIndex][1]["content"]["in"].push({});
    if ($(this).find('[name=param]').val() != '' && ($(this).find('a[name=signal]').text().indexOf(not_config) == -1 || $(this).find("[id^=parameter]").is(":checked") && $("select[name=signal]").val() != null) && !($(this).find('[name="param"]').hasClass('red') || $(this).find('[name="default_val"]').hasClass('red'))) {
      $(".in>div>div").eq(i).find("[name]").each(function () {
        var name = $(this).attr("name");
        var type = $(this).attr("type");
        if (name != "signal" && name.indexOf("source_signal") == -1) {
          if (type == "number" || type == "text") {
            modules[childIndex][1]["content"]["in"][i][name] = $(this).attr("value");
          } else if (type == "radio" && $(this).is(":checked")) {
            name = name.substring(0, name.length - 1);
            modules[childIndex][1]["content"]["in"][i][name] = $(this).attr("value");
          } else if ($(this).is("a")) {
            modules[childIndex][1]["content"]["in"][i][name] = $(this).attr('id');
          }
        }
      })
      if ($(this).find("[id^=parameter]").is(":checked")) {
        modules[childIndex][1]["content"]["in"][i]["signal"] = "{" + $(this).find("select[name=signal]").val() + "}";
      } else {
        modules[childIndex][1]["content"]["in"][i]["signal"] = $(this).find("a[name=signal]").attr("id");
      }
    }
  })
  biSetLocalVariable("python_script_in" + childIndex, JSON.stringify(modules[childIndex][1]['content']["in"]));
  setConfig();
}

function loadConfig(config) {
  childIndex = config;
  not_config = lang["not_config"];
  var val = modules[childIndex][1]['content']["in"];
  var params = modules[childIndex][0]['param'];
  if (Boolean(params) && params.length != 0) {
    for (var i in params) {
      option += "<option value=\"" + params[i]["name"] + "\">" + params[i]["name"] + "</option>"
    }
  }
  if (Boolean(val) && val.length > 0) {
    for (var i in val) {
      $('.in>div').append("<div class=\"signal_list\"><span language=\"in_param_name\"></span><input type=\"text\" name=\"param\" value=\"" + val[i]['param'] + "\"><span language=\"default_val\"></span><input type=\"text\" name=\"default_val\" value=\"" + val[i]['default_val'] + "\"><input type=\"radio\" name=\"nearest" + i + "\" id=\"nearest_1" + i + "\" value=\"no\"><label for=\"nearest_1" + i + "\" language=\"nearest\"></label><input type=\"radio\" name=\"nearest" + i + "\" id=\"nearest_2" + i + "\" value=\"yes\"><label for=\"nearest_2" + i + "\" language=\"chazhi\"></label><br><span language=\"source_signal\"></span><input type=\"radio\" name=\"source_signal_" + i + "\" id=\"id_" + i + "\" checked><label for=\"id_" + i + "\" language=\"signal\"></label><a href=\"javascript:;\" language=\"not_config\" name=\"signal\"></a><input type=\"radio\" name=\"source_signal_" + i + "\" id=\"parameter_" + i + "\"><label for=\"parameter_" + i + "\" language=\"parameter\"></label><select name=\"signal\"></select></div>");
      $(".in>div>div").eq(i).find('[name=param]').addClass(reg.test(val[i]['param']) ? "green" : "red");
      if (option == "") {
        $(".in>div>div").eq(i).find("select[name=signal]").attr("disabled", true).addClass("disabled_background");
      } else {
        $(".in>div>div").eq(i).find("select[name=signal]").append(option);
      }
      if (val[i]["signal"].indexOf("{") != -1 && val[i]["signal"].indexOf("}") != -1) {
        $(".in>div>div").eq(i).find("[id^=parameter]").prop("checked", true);
        $(".in>div>div").eq(i).find("select[name=signal]").val(val[i]["signal"].replace(/{|}/g, ""));
        signalChange($(".in>div>div").eq(i), "parameter");
      } else {
        $(".in>div>div").eq(i).find("[id^=id]").prop("checked", true);
        $(".in>div>div").eq(i).find("a[name=signal]").attr("id", val[i]['signal']);
        biQuerySignalInfo(i, val[i]['signal']);
        signalChange($(".in>div>div").eq(i), "id");
      }
      $("[name='nearest" + i + "'][value='" + val[i]["nearest"] + "']").prop('checked', true);
      $(".in>div>div").eq(i).find('[language]').each(function () {
        var value = $(this).attr('language');
        if (value != "not_config" || $(".in>div>div").eq(i).find("[id^=parameter]").is(":checked")) {
          $(this).text(lang[value]);
        }
      })
    }
    $('[name=default_val]').each(function () {
      isNaN(Number($(this).val())) ? $(this).addClass('red').removeClass("green") : $(this).removeClass('red').addClass("green");
    })
    $(".in>div>div:last-child").addClass("bdBlack");
  }
}

function signalChange(div, name) {
  if (name.indexOf("parameter") != -1) {
    $(div).find("label[for^=id],a[name=signal]").addClass("disabled_a");
    $(div).find("label[for^=parameter]").removeClass("disabled_a");
    if (Boolean(modules[childIndex][0]["param"]) && modules[childIndex][0]["param"].length > 0) {
      $(div).find("select[name=signal]").attr("disabled", false).removeClass("disabled_background");
    }else{
      $(div).find("select[name=signal]").attr("disabled", true).addClass("disabled_background");
    }
    $(div).find("a[name=signal]").text(not_config).removeClass("green").addClass("red");
  } else if (name.indexOf("id") != -1) {
    $(div).find("label[for^=id],a[name=signal]").removeClass("disabled_a");
    $(div).find("select[name=signal]").attr("disabled", true).addClass("disabled_background").val($(div).find("[name=signal] option").eq(0).text());
    $(div).find("label[for^=parameter]").addClass("disabled_a");
  }
}