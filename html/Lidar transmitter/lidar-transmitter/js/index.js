var reg = /^([1-9]|([1-9][0-9])|(1[0-9][0-9])|(2[0-4][0-9])|(25[0-5]))(\.([0-9]|([1-9][0-9])|(1[0-9][0-9])|(2[0-4][0-9])|(25[0-5]))){3}$/;
var configs = [];
//正则验证 ip
$('.container').on("keyup", "input[type=text]", function () {
  var val = $(this).val();
  if (["server_ip", "local_ip"].includes($(this).attr("name"))) {
    reg.test(val) ? $(this).addClass('green').attr("value", $(this).val()).removeClass('red') : $(this).removeClass('green').addClass('red');
  }
  if (!$(this).hasClass('red')) changeContentVal(this);
}).on("blur", "input[type=text]", function () {
  if ($(this).val() == "" || $(this).hasClass('red')) {
    $(this).val($(this).attr('value')).addClass('green').removeClass('red');
  } else {
    changeContentVal(this);
  }
})

$('.container').on("change", "input[type=number]", function () {
  $(this).val(compareVal(this, $(this).val()));
}).on('input', "input[type=number]", function (e) {
  if (e.which == undefined) {
    var step = $(this).attr("step").length - 2;
    var val = Number($(this).val());
    $(this).val(step > 0 ? val.toFixed(step) : val);
  }
  changeContentVal(this);
}).on('keypress', "input[type=number]", function (e) {
  if (!(e.charCode >= 48 && e.charCode <= 57) && !(e.charCode == 45 || e.charCode == 46)) return false;
})

//有input type=number 情况下比较大小
function compareVal(obj, val) {
  var step = $(obj).attr('step').length > 2 ? $(obj).attr('step').length - 2 : 0,
    v = Number(val),
    newVal = 0;
  if (isNaN(v)) {
    newVal = Number($(obj).attr('value'));
  } else {
    var min = Number($(obj).attr('min')),
      max = Number($(obj).attr('max'));
    v = v < min ? min : v;
    v = v > max ? max : v;
    if (step > 0) {
      newVal = Math.round(Math.abs(v) * Math.pow(10, step)) / Math.pow(10, step);
      if (v < 0) newVal = -newVal;
    } else {
      newVal = Math.floor(v);
    }
  }
  return step > 0 ? newVal.toFixed(step) : newVal;
}

/*----------配置读取与存储-----------*/
// 表单内容改变保存配置
$('.container').on("change", "[name]", function () {
  if (!["server_ip", "local_ip"].includes($(this).attr("name"))) {
    changeContentVal(this);
  }
});
//保存配置
function setConfig() {
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root>";
  for (var i in configs) {
    text += "<ethernet" + (Number(i) + 1) + " ";
    for(var j in configs[i]){
      text += " " + j + "=\"" +configs[i][j] + "\"";
    }
    text += "/>";
  }
  text += "</root>";
  biSetModuleConfig("lidar-transmitter.aspluginlidartransmitter", text);
}
//初始化
function biOnInitEx(config, moduleConfigs) {
  $('[language]').each(function () {
    var value = $(this).attr('language');
    $(this).html(biGetLanguage() == 1 ? en[value] : cn[value])
  });
  for (var key in moduleConfigs) {
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(moduleConfigs[key], "text/xml");
    var child = xmlDoc.getElementsByTagName('root')[0].childNodes;
    for (var i = 0; i < child.length; i++) {
      var obj = {};
      var keys = child[i].attributes;
      for (var j in keys) {
        obj[keys[j].nodeName] = keys[j].nodeValue;
      }
      configs.push(obj);
    }
    loadConfig();
  }
}

function loadConfig() {
  getContentVal(0);
}

//tab分页
$(".item>li").click(function () {
  $(this).addClass("active").siblings().removeClass("active");
  var i = $(".active").index();
  getContentVal(i);
})

function getContentVal(i) {
  $('.content .ethernet>ul').find("[name]").each(function () {
    var name = $(this).attr("name");
    var val = configs[i][name];
    var type = $(this).attr('type');
    if (type == 'checkbox') {
      $(this).prop('checked', val == 'yes' ? true : false);
    } else if (type == "number") {
      $(this).val(compareVal(this, val));
    } else {
      $(this).val(val);
      if (["server_ip", "local_ip"].includes(name)) {
        reg.test(val) ? $(this).addClass('green').removeClass('red') : $(this).removeClass('green').addClass('red');
      }
    }
  })
}

function changeContentVal(obj) {
  var i = $(".active").index();
  var name = $(obj).attr("name");
  var val = $(obj).val();
  var type = $(obj).attr('type');
  if (type == 'checkbox') {
    val = $(obj).is(':checked') ? "yes" : "no";
  } else if (type == "number") {
    val = compareVal(obj, val);
  }
  configs[i][name] = val;
  setConfig();
}