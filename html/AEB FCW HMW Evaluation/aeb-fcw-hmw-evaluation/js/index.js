// 2023/12/12 v2.1.0 新增两个信号配置Left DTLC,Right DTLC
var not_config = "";

function onClickEnabled(obj) {
  if ($(obj).get(0).checked) {
    enAbled();
    if ($('.message_id').text().indexOf(not_config) != -1) $('.message_id').addClass('red');
    $('.container>div:nth-of-type(4) [type=checkbox]').each(function () {
      checkClick(this);
    });
  } else {
    disAbled();
  }
}
//检查文本框的值
function checkTextValue(obj) {
  var str = $(obj).val();
  if (str.indexOf(',') != -1) {
    var flag = false;
    var arr = str.split(","),
      newArr = [];
    for (var i = 0; i < arr.length; i++) {
      if (arr[i] == "") {
        flag = true;
        break;
      }
      var v = Number(arr[i]);
      if (arr[i] != "") {
        if (isNaN(v)) {
          flag = true;
          break;
        }
      }
      newArr.push(v);
    }
    if (flag) {
      $(obj).addClass('red').removeClass('green');
    } else {
      $(obj).addClass('green').attr('value', newArr.join());
    }
  } else {
    var v = Number(str);
    if (!isNaN(v) && str != "") { //green
      $(obj).addClass('green').attr('value', v);
    } else if (str != "") { //red
      $(obj).addClass('red').removeClass('green');
    }
  }
}
$('.container').on("input", "[type=text]", function () {
  if (!$(this).hasClass('text')) {
    checkTextValue($(this));
  }
  setConfig();
}).blur(function () {
  if (!$(this).hasClass('text')) {
    if ($(this).hasClass('green')) {
      var str = $(this).val();
      if (str.indexOf(",") != -1) {
        var arr = str.split(','),
          newArr = [];
        for (var i = 0; i < arr.length; i++) {
          var v = Number(arr[i]);
          newArr.push(v);
        }
        $(this).val(newArr.join()).attr('value', newArr.join());
      } else {
        if (str != "") {
          var v = Number(str);
          $(this).val(v).attr('value', v);
        } else {
          var v = $(this).attr('value');
          $(this).val(v).attr('value', v);
        }
      }
    } else if ($(this).hasClass('red')) {
      var v = $(this).attr('value');
      $(this).val(v).removeClass('red').addClass('green');
    }
  }
});

function checkBlur(obj) {
  var str = $(obj).val();
  if (str != "") {
    if (str.indexOf(',') != -1) {
      var arr = str.split(','),
        flag = false;
      for (var i = 0; i < arr.length; i++) {
        var t = arr[i];
        if (t.indexOf('.') != -1 && i < arr.length - 1) {
          flag = true;
          break;
        } else {
          var v = Number(t);
          if (isNaN(v)) {
            flag = true;
            break;
          }
        }
      }
      flag ? $(obj).addClass('red') : $(obj).removeClass('red');
    } else {
      var v = Number(str);
      isNaN(v) ? $(obj).addClass('red') : $(obj).removeClass('red');
    }
  }
}
/**
 * 点击GT 
 */
function checkClick(obj) {
  var index = $(obj).parent().parent().index();
  if ($(obj).is(":checked")) {
    $(obj).next().next().removeAttr("disabled").removeClass('a');
    $(obj).next().next().children('a').removeClass('a');
    $(obj).parent().next().find('input').removeAttr("disabled").removeClass("disabled_background");
    $('.container>div:last-of-type>ul>li:eq(' + index + ') input').attr("disabled", true).addClass("disabled_background");
    $('.container>div:last-of-type>ul>li:eq(' + index + ') [language],.container>div:last-of-type>ul>li:eq(' + index + ') span,.container>div:last-of-type>ul>li:eq(' + index + ') a,.container>div:last-of-type>ul>li:eq(' + index + ') div[language]').addClass("disabled_a");
    $(".container>div:last-of-type>ul>li:eq(" + index + ") [class^=table] input,.container>div:last-of-type>ul>li:eq(" + index + ") td").addClass("disabled_background");
    $("#div" + (Number(index) + 1)).addClass("disBC");
  } else {
    $(obj).next().next().attr("disabled", true).addClass('a');
    $(obj).next().next().children('a').addClass('a');
    $(obj).parent().next().find('input').attr("disabled", true).addClass('disabled_background');
    $('.container>div:last-of-type>ul>li:eq(' + index + ') input').removeAttr("disabled").removeClass("disabled_background");
    $('.container>div:last-of-type>ul>li:eq(' + index + ') [language],.container>div:last-of-type>ul>li:eq(' + index + ') span,.container>div:last-of-type>ul>li:eq(' + index + ') a,.container>div:last-of-type>ul>li:eq(' + index + ') div[language]').removeClass("disabled_a");
    $(".container>div:last-of-type>ul>li:eq(" + index + ") [class^=table] input,.container>div:last-of-type>ul>li:eq(" + index + ") td").removeClass("disabled_background");
    $(obj).next().next().removeClass('green');
    $("#div" + (Number(index) + 1)).removeClass("disBC");
  }
}
$('[name]').click(function () {
  setConfig();
});
$('input[type=number]').on({
  "change": function () {
    $(this).val(compareVal(this, $(this).val()));
  },
  'input': function (e) {
    if (e.which == undefined) {
      var step = $(this).attr("step").length - 2;
      var val = Number($(this).val());
      $(this).val(step > 0 ? val.toFixed(step) : val);
    }
    setConfig();
  },
  'keypress': function (e) {
    if (!(e.charCode >= 48 && e.charCode <= 57) && !(e.charCode == 45 || e.charCode == 46)) {
      return false;
    }
  }
})

/**
 * 选择报文
 */
$('.message_id').click(function () {
  if (!$('[name=enabled]').get(0).checked) return;
  var originID = $(this).text().lastIndexOf('(') != -1 ? null : $(this).attr('val');
  biSelectBusMessage("TargetMessage", originID);
});

function biOnSelectedBusMessage(key, info) {
  if ($('.message_id').hasClass("disabled_a")) return;
  if (key == "TargetMessage") {
    if (info == null) {
      $('.message_id').removeAttr("val title");
      $('.message_id').text(not_config);
      $('.message_id').removeClass('green');
    } else {
      $('.message_id').attr({ "val": info.id, "title": info.name });
      $('.message_id').text(info.name);
      $('.message_id').addClass('green');
    }
  }
  setConfig();
}
//监听键盘del键
$('body').keydown(function (event) {
  var e = event || window.event;
  if (e.keyCode == 46) {
    if ($('.flag').hasClass('all')) {
      var i = 0;
      while (i < $('.flag').parent().parent().parent().next().children().length - 1) {
        $('.flag').parent().parent().parent().next().children()[i].remove();
        i = 0;
      }
    } else {
      $('.flag').parent().remove();
    }
    setConfig();
  }
});
/**
 * 左边移入移出
 * @param {} obj 
 */
function onMouseOver(obj) {
  var val = $(obj).hasClass('left') ? $(obj).next().find('input').attr('disabled') : $(obj).parent().parent().parent().next().find('input').attr('disabled');
  if (val == undefined) $(obj).css('background-color', 'rgba(80, 177, 241, 0.2)');
}

function onMouseOut(obj) {
  $(obj).css('background-color', '');
}

/**
 * 文本框输入字符
 * @param {*} obj  当前元素
 */
function keyPress(obj) {
  var parentIdName = $(obj).parent().parent().parent().attr('id');
  var val = "";
  if (parentIdName == "div3") {
    val = "<div class=\"fixclear\"><div class=\"left select\" onclick=\"onSelectClick(this)\" onmouseover=\"onMouseOver(this)\" onmouseout=\"onMouseOut(this)\"></div>" +
      "<div class=\"left\"><input type=\"text\" onclick=\"checkClick2(this)\" onblur=\"checkBlur(this)\"  class=\"text\" onkeypress=\"keyPress(this)\" name=\"\" id=\"\"></div>" +
      "<div class=\"left\"><input type=\"text\" onclick=\"checkClick2(this)\" class=\"text\" onblur=\"checkBlur(this)\" onkeypress=\"keyPress(this)\" name=\"\" id=\"\"></div></div>";
  } else {
    val = "<div class=\"fixclear\"><div class=\"left select\" onclick=\"onSelectClick(this)\" onmouseover=\"onMouseOver(this)\" onmouseout=\"onMouseOut(this)\"></div>" +
      "<div class=\"left\"><input type=\"text\" class=\"text\" onclick=\"checkClick2(this)\" onblur=\"checkBlur(this)\" onkeypress=\"keyPress(this)\" name=\"\" id=\"\"></div>" +
      "<div class=\"left\"><input type=\"text\" class=\"text\" onclick=\"checkClick2(this)\" onblur=\"checkBlur(this)\" onkeypress=\"keyPress(this)\" name=\"\" id=\"\"></div>" +
      "<div class=\"left\"><input type=\"text\" class=\"text\" onclick=\"checkClick2(this)\" onblur=\"checkBlur(this)\" onkeypress=\"keyPress(this)\" name=\"\" id=\"\"></div>" +
      "<div class=\"left\"><input type=\"text\" class=\"text\" onclick=\"checkClick2(this)\" onblur=\"checkBlur(this)\" onkeypress=\"keyPress(this)\" name=\"\" id=\"\"></div></div>";
  }
  $(obj).parent().parent().children("div:first-of-type").removeClass('flag');
  $(obj).parent().parent().parent().parent().find('.all').removeClass('flag');
  var flag = $(obj).parent().parent().next()[0];
  if (!flag) {
    $(obj).parent().parent().parent().append(val);
  }
}


/**
 * 表格最左边点击事件
 */
function onSelectClick(obj) {
  var val = $(obj).hasClass('left') ? $(obj).next().find('input').attr('disabled') : $(obj).parent().parent().parent().next().find('input').attr('disabled');
  if (val == "disabled") return;
  if ($(obj).hasClass('all')) {
    $(obj).parent().parent().parent().next().children('div').each(function () {
      $(this).children('div:first-of-type').addClass('blue2');
      $(this).find('input').addClass('blue');
    });
    $('.table').each(function () {
      $(this).find('td').removeClass('flag');
    });
    $(obj).addClass('flag');
  } else {
    $(obj).parent().parent().children('div').each(function () {
      $(this).children("div:first-of-type").removeClass('blue2');
      $(this).find('input').removeClass('blue');
    });
    $(obj).addClass('blue2');
    $(obj).parent().find('input').addClass('blue');
    $('.table').each(function () {
      $(this).children('div').find('.select').removeClass('flag');
      $(this).find('td').removeClass('flag');
    });
    if (!$(obj).parent().next()[0]) return
    $(obj).addClass('flag');
  }
}

/**
 * 禁用表单元素
 */
function disAbled() {
  $('.container>div:not(:first-of-type) [name]').attr("disabled", true).addClass("disabled_background");
  $('.container>div:not(:first-of-type) label, span,p,a,div[language],a').addClass("disabled_a");
  $("[class^=table] input,td").addClass("disabled_background").attr("disabled", true);
  $("[id^=div]").addClass("disBC");
}
/**
 * 启用
 */
function enAbled() {
  $('.container>div:not(:first-of-type) [name]').removeAttr("disabled").removeClass("disabled_background");
  $('.container>div:not(:first-of-type) label, span,p,div[language],a').removeClass('disabled_a');
  $("[class^=table] input,td").removeClass("disabled_background").attr("disabled", false);
  $("[id^=div]").removeClass("disBC");
}

/**
 * 加载配置
 */
function loadConfig(val) {
  $('[name]').each(function () {
    var value = $(this).attr('name');
    var type = $(this).attr('type');
    if (type == 'checkbox') {
      if (val[value] == "True" || val[value] == "yes") $(this).attr('checked', true);
    } else if (type == 'number') {
      $(this).val(compareVal(this, val[value]));
    } else if (type == 'radio') {
      if (val[value] == $(this).val()) $(this).attr("checked", true);
    } else if (type == 'text') {
      if (val[value] != undefined) {
        var v = val[value].substring(0, val[value].lastIndexOf(","));
        $(this).val(v);
        $(this).attr('value', v);
      }
    } else {
      $(this).val(val[value]);
    }
  });
  $('a').each(function () {
    var id = $(this).attr('id');
    if (id == "message_id" && val[id] != 'null') {
      $(this).attr('val', val[id]);
      biQueryBusMessageInfo("TargetMessage", val[id]);
    } else {
      if (val[id] != "null") {
        biQuerySignalInfo(id, val[id]);
        $(this).attr('val', val[id]);
        if ($(this).hasClass('red')) {
          $(this).text(val[id]).attr("title", val[id]);
        } else {
          $(this).addClass('green');
          $(this).text(val[id].substring(val[id].lastIndexOf(":") + 1)).attr("title", val[id].substring(val[id].lastIndexOf(":") + 1));
        }
        if (id == "aeb_target_ax_id") $(this).attr('scaleVal', val["aeb_target_ax_scale"]);
      }
    }
  });
  $('.table').each(function (index, v) {
    var value = val[$(this).attr('id')];
    if (value == "") return;
    var arr = value.split(":");
    var str = "";
    for (var i = 0, len = arr.length - 1; i < len; i++) {
      str += "<div class=\"fixclear\">";
      str += "<div class=\"left select\" onclick=\"onSelectClick(this)\" onmouseover=\"onMouseOver(this)\" onmouseout=\"onMouseOut(this)\"></div>";
      var arrNew = arr[i].split(",");
      for (var j = 0; j < arrNew.length; j++) {
        var v = arrNew[j] == "null" ? "" : arrNew[j];
        str += "<div class=\"left\"><input type=\"text\" value=\"" + v + "\" onclick=\"checkClick2(this)\" onblur=\"checkBlur(this)\" onkeypress=\"keyPress(this)\" name=\"\" id=\"\"></div>";
      }
      str += "</div>";
    }
    str += "<div class=\"fixclear\">";
    str += "<div class=\"left select\" onclick=\"onSelectClick(this)\" onmouseover=\"onMouseOver(this)\" onmouseout=\"onMouseOut(this)\"></div>";
    str += "<div class=\"left\"><input type=\"text\" class=\"text\" onclick=\"checkClick2(this)\" onblur=\"checkBlur(this)\" onkeypress=\"keyPress(this)\" name=\"\" id=\"\"></div>";
    if (index != 2) str += "<div class=\"left\"><input type=\"text\" class=\"text\" onclick=\"checkClick2(this)\" onblur=\"checkBlur(this)\" onkeypress=\"keyPress(this)\" name=\"\" id=\"\"></div>";
    if (index != 2) str += "<div class=\"left\"><input type=\"text\" class=\"text\" onclick=\"checkClick2(this)\" onblur=\"checkBlur(this)\" onkeypress=\"keyPress(this)\" name=\"\" id=\"\"></div>";
    str += "<div class=\"left\"><input type=\"text\" class=\"text\" onclick=\"checkClick2(this)\" onblur=\"checkBlur(this)\" onkeypress=\"keyPress(this)\" name=\"\" id=\"\"></div></div>";
    $(this).children('div').html(str);
  });
  if ($('[name=enabled]').get(0).checked) {
    enAbled();
    if ($('.message_id').text().lastIndexOf('(') != -1) $('.message_id').addClass('red');
    $('.container>div:nth-of-type(4) [type=checkbox]').each(function () {
      checkClick(this);
    });
  } else {
    disAbled();
  }
  onClickEnabled($('[name=enabled]'));
}

function biOnQueriedSignalInfo(key, signalInfo) {
  if (signalInfo != null) {
    $('#' + key).addClass('green').removeClass('red').attr('title', signalInfo.typeName + ':' + signalInfo.signalName);
  } else {
    $('#' + key).addClass('red').removeClass('green').text($('#' + key).attr('val'));

  }
}

function biOnQueriedBusMessageInfo(key, busMessageInfo) {
  if (key == "TargetMessage") {
    if (busMessageInfo == null) {
      $('#message_id').text($('#message_id').attr('val'));
      $('#message_id').removeClass('green').addClass('red');
    } else {
      $('#message_id').attr("val", busMessageInfo.id);
      $('#message_id').text(busMessageInfo.name);
      $('#message_id').addClass('green').attr('title', busMessageInfo.name)
    }
  }
  setConfig();
}

function checkClick2(obj) {
  var table = $(obj).parent().parent().parent().parent();
  $(table).find('.all').removeClass('blue2');
  $(table).children('div').children('div').each(function () {
    $(this).find('.select').removeClass('blue2');
    $(this).find('input').removeClass('blue');
  });
}
/**
 * 写配置
 */

function setConfig() {
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root enabled=";
  text += "\"" + ($("[name=enabled]").get(0).checked == true ? "yes" : "no") + "\"";
  text += " sensor_source" + "=\"" + $('select').val() + "\"";
  var n = 3;
  while (n <= 5) {
    $('.container>div:nth-of-type(' + n + ') [name]').each(function () {
      var key = $(this).attr('name');
      var type = $(this).attr('type');
      if (type == "checkbox") {
        var val = n == 3 ? ($(this).get(0).checked == true ? "True" : "False") : ($(this).get(0).checked == true ? "yes" : "no");
        text += " " + key + "=\"" + val + "\"";
      } else if (type == "number") {
        text += " " + key + "=\"" + compareVal(this, $(this).val()) + "\"";
      } else if (type == "text" && n != 5) {
        var value = $(this).val();
        if ($(this).hasClass('red') && !$(this).hasClass("green")) {
          value = $(this).attr('value');
        }
        text += " " + key + "=\"" + value + ",\"";
      } else if (type == "radio" && $(this).is(":checked")) {
        text += " " + key + "=\"" + $(this).val() + "\"";
      }
    });
    n++;
  }
  $('.table').each(function () {
    var name = $(this).attr('id');
    text += " " + name + "=\"";
    var div = $(this).children('div').children();
    for (var i = 0, len = $(div).length - 1; i < len; i++) {
      $(div[i]).find('input').each(function (n, v) {
        var val = $(this).val();
        if (n == 0 && val == "" || $(this).hasClass('red')) {
          return false;
        }
      });
    }
    if ($(div).length == 1) {
      text += "\"";
      return;
    }
    for (var i = 0, len = $(div).length - 1; i < len; i++) {
      var arr = [];
      $(div[i]).find('input').each(function () {
        var val = $(this).val() == "" ? "null" : $(this).val();
        arr.push(val);
      });
      if (arr.indexOf('null') != -1) continue;
      text += arr.join(',') + ":";
    }
    text += "\"";
  });
  text += " message_id" + "=\"" + ($('.message_id').attr('val') == undefined ? "null" : $('.message_id').attr('val')) + "\"";
  $('.container>div:nth-of-type(3) a').each(function () {
    var val = $(this).attr('val') == undefined ? null : $(this).attr('val');
    var idName = $(this).attr('id');
    text += " " + idName + "=\"" + val + "\"";
    if (idName == "aeb_target_ax_id") text += " aeb_target_ax_scale" + "=\"" + $(this).attr('scaleVal') + "\"";
  });
  $('.container>div:nth-of-type(4) a').each(function () {
    var val = $(this).attr('val') == undefined ? null : $(this).attr('val');
    var idName = $(this).attr('id');
    text += " " + idName + "=\"" + val + "\"";
  });
  text += " />";
  biSetModuleConfig("aeb-fcw-hmw-evaluation.adasevaluation", text);
}

/**
 * 选择信号
 * @param {} obj 
 */
var idName = null; //选择的元素的id名
function onClick(obj, type) {
  if (!$('[name=enabled]').get(0).checked || $(this).hasClass("disabled_a")) return;
  if ($(obj).hasClass('a')) {
    if (!$(obj).prev().prev().get(0).checked) return;
  }
  var originID = null;
  if ($(obj).text().lastIndexOf('(') == -1) originID = $(obj).attr('val');
  idName = "#" + $(obj).attr('id');
  var scale = $(obj).attr('scaleVal');
  scale = parseInt(scale);
  biSelectSignal("TargetSignal", originID, false, null, type, scale, "[m]");
}

function biOnSelectedSignal(key, valueInfo, signBitInfo, scale) {
  if ($(idName).hasClass("disabled_a")) return;
  if (key == "TargetSignal") {
    if (valueInfo == null) {
      $(idName).removeClass('green red');
      $(idName).text(not_config);
      $(idName).removeAttr("val").removeAttr('title');
      setConfig();
    } else {
      $(idName).text(valueInfo.signalName);
      $(idName).attr("val", valueInfo.id);
      $(idName).attr('scaleVal', scale);
      $(idName).addClass('green').attr('title', valueInfo.typeName + ':' + valueInfo.signalName);
    }
    if (valueInfo.typeName == undefined) {
      $(idName).addClass('red').removeClass('green');
    }
  }
  setConfig();
}

function biOnInitEx(config, moduleConfigs) {
  if (biGetLanguage() == 1) {
    $('[language]').each(function () {
      var value = $(this).attr('language');
      $(this).text(en[value])
    });
    not_config = en["not_config"];
  } else {
    $('[language]').each(function () {
      var value = $(this).attr('language');
      $(this).text(zh[value])
    });
    not_config = zh["not_config"];
    $(".w195>div:nth-child(1)").css("width", "62px")
  }
  for (var key in moduleConfigs) {
    if (moduleConfigs[key] != "") {
      var parser = new DOMParser();
      var xmlDoc = parser.parseFromString(moduleConfigs[key], "text/xml");
      var countrys = xmlDoc.getElementsByTagName('root');
      var keys = countrys[0].attributes;
      var obj = new Object();
      for (var i = 0; i < keys.length; i++) {
        obj[keys[i].nodeName] = keys[i].nodeValue;
      };
      loadConfig(obj);
    }
  }
}

function compareVal(obj, val) {
  var step = $(obj).attr('step').length > 2 ? $(obj).attr('step').length - 2 : 0,
    v = Number(val);
  if (isNaN(val) || !Boolean(val)) {
    newVal = Number($(obj).attr('value'));
  } else {
    var v = Number(val);
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