//2023/9/18 v1.1.1 修复:number值最小值为0，配置编辑器内保存为负数，重新打开界面显示0；
$(function () {
  for (var i = 0; i < 12; i++) {
    $(".content>ul:nth-child(1)").append("<li><span language=\"lmc_input_channel_pts\"></span><select name=\"lmc_input_channel_pts\"><option value=\"-1\">(Disabled)</option><option value=\"0\">Channel A</option><option value=\"1\">Channel B</option><option value=\"2\">Channel C</option><option value=\"3\">Channel D</option><option value=\"4\">Channel E</option><option value=\"5\">Channel F</option><option value=\"6\">Channel G</option><option value=\"7\">Channel H</option><option value=\"8\">Channel I</option><option value=\"9\">Channel J</option><option value=\"10\">Channel K</option><option value=\"11\">Channel L</option></select></li>");
    $(".content>ul:nth-child(2)").append("<li><span language=\"lmc_output_channel_pts\"></span><select name=\"lmc_output_channel_pts\"><option value=\"-1\">(Disabled)</option><option value=\"0\">Channel A</option><option value=\"1\">Channel B</option><option value=\"2\">Channel C</option><option value=\"3\">Channel D</option><option value=\"4\">Channel E</option><option value=\"5\">Channel F</option><option value=\"6\">Channel G</option><option value=\"7\">Channel H</option><option value=\"8\">Channel I</option><option value=\"9\">Channel J</option><option value=\"10\">Channel K</option><option value=\"11\">Channel L</option></select></li>");
    $(".content>ul:nth-child(3)").append("<li><span language=\"lmc_angle\"></span><input type=\"number\" name=\"lmc_angle\" value=\"0\" step=\"0.1\"></li>")
    $(".content>ul:nth-child(4)").append("<li><span language=\"lmc_fov\"></span><input type=\"number\" name=\"lmc_fov\" value=\"120\" step=\"0.1\"></li>")
    $(".content>ul:nth-child(5)").append("<li><span language=\"lmc_video_channel\"></span><select name=\"lmc_video_channel\"><option value=\"-1\">(Disabled)</option><option value=\"0\">Channel A</option><option value=\"1\">Channel B</option><option value=\"2\">Channel C</option><option value=\"3\">Channel D</option><option value=\"4\">Channel E</option><option value=\"5\">Channel F</option><option value=\"6\">Channel G</option><option value=\"7\">Channel H</option><option value=\"8\">Channel I</option><option value=\"9\">Channel J</option><option value=\"10\">Channel K</option><option value=\"11\">Channel L</option></select></li>");
    $(".content>ul:nth-child(6)").append("<li><span language=\"compensate_mode\"></span><select name=\"compensate_mode\"><option value=\"0\">Sequential Exposure</option><option value=\"1\">Simultaneous Exposure</option></select></li>");
    $(".content>ul:nth-child(7)").append("<li><span language=\"lmc_delay\"></span><input type=\"number\" name=\"lmc_delay\" value=\"0.125\" step=\"0.01\"></li>")
  }
})
$(".content").on("keypress", "input[type=number]", function (e) {
  if (e.charCode < 45 || e.charCode > 57) return false;
});
$(".content").on("input", "input[type=number]", function (e) {
  let v = $(this).val();
  if (isNaN(e.which)) {
    $(this).attr("value", compareVal(this, v)).val(compareVal(this, v));
  } else {
    $(this).attr("value", v);
  }
  setConfig();
});
$(".content").on("blur", "input[type=number]", function () {
  $(this).attr("value", compareVal(this, $(this).val())).val(compareVal(this, $(this).val()));
});
$('.container').on("change", "[name]", function () {
  if ($(this).attr("name") == "lmc_enable") checkboxChange(this);
  setConfig();
});
function biOnInitEx(config, moduleConfigs) {
  var lang = biGetLanguage() == 1 ? en : cn;
  $('[language]').each(function () {
    var value = $(this).attr('language');
    $(this).html(lang[value]);
  });
  for (var key in moduleConfigs) {
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(moduleConfigs[key], "text/xml");
    var countrys = xmlDoc.getElementsByTagName('root');
    var children = countrys[0].childNodes;
    var arr = [];
    for (var i = 0; i < children.length; i++) {
      var obj = new Object();
      var keys = children[i].attributes;
      for (var j in keys) {
        obj[keys[j].nodeName] = keys[j].nodeValue;
      }
      arr.push(obj);
    }
    loadConfig(arr);
  }
}
function loadConfig(config) {
  if (config == null) return;
  $("[name=lmc_enable]").prop("checked", config[0]["lmc_enable"] == "yes" ? true : false);
  $('.content [name]').each(function () {
    var name = $(this).attr('name'),
      type = $(this).attr("type"),
      val = config[$(this).parent().index() + 1][name];
    if (type == "number") {
      $(this).val(compareVal(this, val)).attr("value", compareVal(this, val));
    } else {
      $(this).val(val);
    }
  });
  checkboxChange($('[name=lmc_enable]'));
}
function setConfig() {
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root><config lmc_enable=\"" + ($("[name=\"lmc_enable\"]").is(":checked") ? "yes" : "no") + "\" />";
  for (var i = 0; i < 12; i++) {
    text += "<lmc" + (i + 1);
    for (var j = 0; j < $(".content>ul").length; j++) {
      var name = $(".content>ul:eq(" + j + ")>li:eq(" + i + ") [name]").attr("name");
      var type = $(".content>ul:eq(" + j + ")>li:eq(" + i + ") [name]").attr("type");
      var val = $(".content>ul:eq(" + j + ")>li:eq(" + i + ") [name]").val();
      if (type == "number") {
        text += " " + name + "=\"" + compareVal($(".content>ul:eq(" + j + ")>li:eq(" + i + ") [name]"), val) + "\"";
      } else {
        text += " " + name + "=\"" + val + "\"";
      }
    }
    text += "/>"
  }
  text += "</root>";
  biSetModuleConfig("lidar-motion-compensate.aspluginlidarmotioncompensate", text);
}
function checkboxChange(obj) {
  if (!$(obj).is(':checked')) {
    $('.content [name]').addClass('disabled disabled_background').attr('disabled', true);
    $(".content span").addClass('disabled');
  } else {
    $('.content [name]').removeClass('disabled disabled_background').attr('disabled', false);
    $(".content span").removeClass('disabled');
  }
}
//仅步长=精确位数-1时适用
function compareVal(obj, val) {
  let name = $(obj).attr("name"), step = $(obj).attr("step").length - 1;
  if (isNaN(Number(val))) {
    newVal = Number($(obj).attr('value'));
  } else {
    let min = 0, max = 0;
    switch (name) {
      case "lmc_angle": {
        max = 360;
        min = 0;
        break;
      }
      case "lmc_fov": {
        max = 720;
        min = 0;
        break;
      }
      case "lmc_delay": {
        max = 10;
        min = -10;
        break;
      }
      default:
        break;
    }
    if (val > max) {
      val = max.toFixed(step);
    } else if (val < min) {
      val = min.toFixed(step);
    }
    newVal = Math.round(Math.abs(val) * Math.pow(10, step)) / Math.pow(10, step);
    if (val < 0) newVal = -newVal;
  }
  return newVal.toFixed(step);
}