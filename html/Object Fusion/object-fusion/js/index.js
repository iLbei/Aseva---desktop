//2023/10/17 v2.1.0 文本内容更新;bi-common.js->2023/8/30,common.css更新到2023/10/17 
$(function () {
  $('.container>div:nth-of-type(1)>input').each(function () {
    $(this).attr("disabled", true).next().addClass("disabled_a");
  });
  checkBoxChange();
});

$('[name]').change(function () {
  if ($(this).attr("type") == "checkbox") checkBoxChange();
  setConfig();
});

$('[type=text]').bind("input propertychange", function () {
  var value = $(this).val();
  var v = Number(value);
  if (value.indexOf(",") == -1 && value.indexOf(".") == -1) {
    isNaN(v) ? $(this).addClass('red') : $(this).removeClass('red');
  }
  if (value.indexOf(".") != -1) {
    var a = value.split(".");
    if (a.length > 2) {
      $(this).addClass('red')
    } else {
      if (a[0].indexOf(',') == -1) {
        if (a[0] == "" || a[1] == "" || isNaN(Number(a[0])) || isNaN(Number(a[1]))) {
          $(this).addClass('red');
        } else {
          $(this).removeClass('red');
        }
      } else {
        var b = a[0].split(","),
          flag;
        for (var i = 0; i < b.length; i++) {
          if (isNaN(Number(b[i]))) {
            flag = true;
            break;
          }
        }
        if (flag || a[1] == "" || isNaN(Number(a[1]))) {
          $(this).addClass('red');
        } else {
          $(this).removeClass('red');
        }
      }
    }
  }
  if (value.indexOf(",") != -1 && value.indexOf(".") == -1) {
    var a = value.split(","),
      flag = false;
    for (var i = 0; i < a.length; i++) {
      if (isNaN(Number(a[i]))) {
        flag = true;
        break;
      }
    }
    flag ? $(this).addClass('red') : $(this).removeClass('red');
  }
  $(this).attr('value', value);
  setConfig();
});

$('.container').on("change", "input[type=number]", function () {
  $(this).val(compareVal(this, $(this).val()));
}).on('input', "input[type=number]", function (e) {
  if (e.which == undefined) {
    $(this).attr("value", $(this).val());
  } else {
    $(this).attr("value", compareVal(this, $(this).val()))
  }
  setConfig();
}).on('keypress', "input[type=number]", function (e) {
  if (!(e.charCode >= 48 && e.charCode <= 57) && !(e.charCode == 45 || e.charCode == 46)) return false;
})

$('input[type=text]').on({
  'blur': function () {
    var total = 0,
      name = $(this).attr('name'),
      flag = false;
    $('[name=' + name + ']').each(function () {
      var a = $(this).val().replace(/,/g, "");
      if ($(this).val() == "" || $(this).hasClass('red') || a.indexOf("-") != -1) flag = true;
      total += Number(a);
    });
    if (total != 0 && !flag) {
      $('[name=' + name + ']').each(function () {
        var b = $(this).val().replace(/,/g, "");
        var a = accMul((Number(b) / total).toFixed(3), 100);
        $(this).val(Number(b) + "(" + a + "%)");
      });
    }
  },
  'focus': function () {
    var name = $(this).attr('name');
    $('[name=' + name + ']').each(function () {
      var val = $(this).attr('value');
      if (val < 0) val = 0;
      $(this).val(val);
    });
  }
})

function accMul(arg1, arg2) {
  var m = 0,
    s1 = arg1.toString(),
    s2 = arg2.toString();
  try { m += s1.split(".")[1].length } catch (e) { }
  try { m += s2.split(".")[1].length } catch (e) { }
  return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m)
}

function checkBoxChange() {
  var arr = [];
  $('.container>div:nth-of-type(1)>input').each(function (i, v) {
    if (!$(this).get(0).checked || $(this).attr('disabled') != undefined) {
      arr.push(i);
    }
  });
  $('[name=exist_selected_index]').each(function (i, v) {
    if (arr.indexOf(i) != -1) {
      $(this).attr('disabled', true).addClass("disabled_background");
    } else {
      $(this).removeAttr('disabled').removeClass("disabled_background");
    }
  });
  $('.container>div').each(function (i) {
    var name = $(this).attr('class');
    if (name == undefined || name.indexOf('_') == -1) return;
    var total = 0;
    $(this).find("[name='" + name + "']").each(function (j) {
      if (arr.indexOf(j) != -1) {
        $(this).attr('disabled', true).addClass("disabled_background").val('0');
      } else {
        $(this).removeAttr('disabled').removeClass('red disabled_background');
      }
      var a = ($(this).val()).substr(0, $(this).val().indexOf('('));
      total += Number(a);
    })
    $(this).find("[name='" + name + "']").each(function (j) {
      var val = Number(($(this).val()).substr(0, $(this).val().indexOf('(')));
      var a = total == 0 ? 0 : accMul((val / total).toFixed(3), 100);
      $(this).val(val + "(" + a + "%)").attr('value', val);
    })
  })
  setConfig();
}

function changeOutChannel(obj) {
  var a = $(obj).find("option:selected").text();
  if (a.indexOf(":") != -1) {
    $(obj).val("-1");
  }
}

function loadConfig(config) {
  if (config == null) return;
  biQueryChannelNames("1", "obj-sensor-sample-v6", 12);
  var val = config;
  $('[name=out_channel]').val(val['out_channel']);
  $('[name=frequency]').val(val['frequency']);
  $('[name=output_mode]').each(function () {
    $(this).val() == val['output_mode'] ? $(this).prop('checked', true) : $(this).prop('checked', false);
  });
  var f = parseFloat(val['fusion_distance']).toFixed(1);
  var s = parseFloat(val['separation_distance']).toFixed(1);
  $('[name=fusion_distance]').val(f);
  $('[name=separation_distance]').val(s);
  var arr1 = val['in_channels'];
  $('[name=in_channels]').each(function (i) {
    var n = arr1.split('0').length - 1;
    if (n > 1) return;
    if (arr1.indexOf(i.toString()) != -1) $(this).attr('checked', true);
  });

  var arr2 = val['exist_selected_index'].split(",");
  $('[name=exist_selected_index]').each(function (i, v) {
    $(this).val(arr2[i]);
  });
  var arr3 = val['classification_weight'].split(","),
    flag3 = false,
    total3 = 0;
  for (var i = 0; i < arr3.length; i++) {
    if (arr3[i] == "" || isNaN(Number(arr3[i]))) {
      flag3 = true;
      break;
    }
    total3 += Number(arr3[i]);
  }
  $('[name=classification_weight]').each(function (i, v) {
    if (arr3[i] != "" && isNaN(Number(arr3[i]))) {
      $(this).addClass('red');
    } else if (arr3[i] == "") {
      $(this).val(arr3[i]);
    } else if (!flag3 && total3 != 0) {
      var a = accMul((Number(arr3[i]) / total3).toFixed(3), 100);
      $(this).val(arr3[i] + "(" + a + "%)").attr('value', arr3[i]);
    }
  });
  var arr4 = val['position_weight'].split(","),
    flag4 = false,
    total4 = 0;
  for (var j = 0; j < arr4.length; j++) {
    if (arr4[j] == "" || isNaN(Number(arr4[j]))) {
      flag4 = true;
      break;
    }
    total4 += Number(arr4[j]);
  }
  $('[name=position_weight]').each(function (i) {
    if (arr4[i] != "" && isNaN(Number(arr4[i]))) {
      $(this).addClass('red');
    } else if (arr4[i] == "") {
      $(this).val(arr4[i]);
    } else if (!flag4 && total4 != 0) {
      var a = accMul((Number(arr4[i]) / total4).toFixed(3), 100);
      $(this).val(arr4[i] + "(" + a + "%)").attr('value', arr4[i]);
    }
  });

  var arr5 = val['velocity_weight'].split(","),
    flag5 = false,
    total5 = 0;
  for (var k = 0; k < arr5.length; k++) {
    if (arr5[k] == "" || isNaN(Number(arr5[k]))) {
      flag5 = true;
      break;
    }
    total5 += Number(arr5[k]);
  }
  $('[name=velocity_weight]').each(function (i) {
    if (arr5[i] != "" && isNaN(Number(arr5[i]))) {
      $(this).addClass('red');
    } else if (arr5[i] == "") {
      $(this).val(arr5[i]);
    } else if (!flag5 && total5 != 0) {
      var a = accMul((Number(arr5[i]) / total5).toFixed(3), 100);
      $(this).val(arr5[i] + "(" + a + "%)").attr('value', arr5[i]);
    }
  });

  var arr6 = val['size_weight'].split(","),
    flag6 = false,
    total6 = 0;
  for (var l = 0; l < arr6.length; l++) {
    if (arr6[l] == "" || isNaN(Number(arr6[l]))) {
      flag6 = true;
      break;
    }
    total6 += Number(arr6[l]);
  }
  $('[name=size_weight]').each(function (i, v) {
    if (arr6[i] != "" && isNaN(Number(arr6[i]))) {
      $(this).addClass('red');
    } else if (arr6[i] == "") {
      $(this).val(arr6[i]);
    } else if (!flag6 && total6 != 0) {
      var a = accMul((Number(arr6[i]) / total6).toFixed(3), 100);
      $(this).val(arr6[i] + "(" + a + "%)").attr('value', arr6[i]);
    }
  });
}

function biOnQueriedChannelNames(key, channelNames) {
  if (key == "1") {
    var channel = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];
    var arr = [],
      i = 0;
    for (var j in channelNames) {
      if (channelNames[j] != '' && channelNames[j] != null) {
        arr.push(i);
      }
      i++;
    }
    $(".container>div:first-of-type>input").each(function (i, v) {
      if (arr.indexOf(i) != -1) $(this).removeAttr('disabled').next("label").removeClass("disabled_a");
    });
    var type = biGetLanguage();
    $('[name=out_channel]').children().each(function (i, v) {
      var value = Number($(this).attr('value'));
      var language = $(this).attr('language');
      if (arr.indexOf(value) != -1) {
        var t = type == 1 ? "Disabled" : "禁用";
        $(this).html(channel[value] + ": " + t);
      } else {
        var txt = type == 1 ? en[language] : zh[language];
        $(this).text(txt);
      }
    });
    checkBoxChange();
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

function setConfig() {
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root ";
  var arrInChannels = [],
    arrExist = [],
    arrClass = [],
    arrPos = [],
    arrVel = [],
    arrSize = [];
  $('[name=in_channels]').each(function (i) {
    if ($(this).is(":checked")) arrInChannels.push(i);
  });
  text += "in_channels=\"" + arrInChannels.toString() + "\"";

  $('[name=exist_selected_index]').each(function () {
    arrExist.push($(this).val());
  });
  text += " exist_selected_index=\"" + arrExist.toString() + "\"";

  $('[name=classification_weight]').each(function () {
    var val = $(this).val();
    val = val.replace(",", "");
    var v = val.indexOf("(") == -1 ? val : val.substring(0, val.indexOf("("));
    arrClass.push(v);
  });
  text += " classification_weight=\"" + arrClass.toString() + "\"";

  $('[name=velocity_weight]').each(function () {
    var val = $(this).val();
    val = val.replace(",", "");
    var v = val.indexOf("(") == -1 ? val : val.substring(0, val.indexOf("("));
    arrVel.push(v);
  });
  text += " velocity_weight=\"" + arrVel.toString() + "\"";

  $('[name=position_weight]').each(function () {
    var val = $(this).val();
    val = val.replace(",", "");
    var v = val.indexOf("(") == -1 ? val : val.substring(0, val.indexOf("("));
    arrPos.push(v);
  });
  text += " position_weight=\"" + arrPos.toString() + "\"";
  $('[name=size_weight]').each(function () {
    var val = $(this).val();
    val = val.replace(",", "");
    var v = val.indexOf("(") == -1 ? val : val.substring(0, val.indexOf("("));
    arrSize.push(v);
  });
  text += " size_weight=\"" + arrSize.toString() + "\"";
  text += " out_channel=\"" + $('[name=out_channel]').val() + "\"";
  text += " frequency=\"" + $('[name=frequency]').val() + "\"";
  text += " output_mode=\"" + $('input[name=output_mode]:checked').val() + "\"";
  text += " fusion_distance=\"" + compareVal($('[name=fusion_distance]'), $('[name=fusion_distance]').val()) + "\"";
  text += " separation_distance=\"" + compareVal($('[name=separation_distance]'), $('[name=separation_distance]').val()) + "\"";
  text += " />";
  biSetModuleConfig("object-fusion.pluginobjectfusion", text);
}

function biOnInitEx(config, moduleConfigs) {
  var lang = biGetLanguage() == 1 ? en : zh;
  $('[language]').each(function () {
    var value = $(this).attr('language');
    $(this).text(lang[value]);
  });
  for (var key in moduleConfigs) {
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(moduleConfigs[key], "text/xml");
    var countrys = xmlDoc.getElementsByTagName('root');
    var keys = countrys[0].attributes;
    var obj = {};
    for (var i = 0; i < keys.length; i++) {
      obj[keys[i].nodeName] = keys[i].nodeValue;
    }
    loadConfig(obj);
  }
}