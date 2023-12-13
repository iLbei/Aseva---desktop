var configs = [];
$('.container').on("input", "input[type=text]", function () {
  changeContentVal(this);
}).blur(function () {
  changeContentVal(this);
})

$('.container').on("change", "input[type=number]", function () {
  $(this).val(compareVal(this, $(this).val()));
}).on('input', "input[type=number]", function (e) {
  changeContentVal(this);
}).on("keypress", 'input[type=number]', function (e) {
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
  changeContentVal(this);
});

//保存配置
function setConfig() {
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root>";
  for (var i in configs) {
    text += "<com" + (Number(i) + 1) + " ";
    for (var j in configs[i]) {
      text += " " + j + "=\"" + configs[i][j] + "\"";
    }
    text += "/>";
  }
  text += "</root>";
  biSetModuleConfig("com-transmitter.asplugincomtransmitter", text);
}

//初始化
function biOnInitEx(config, moduleConfigs) {
  var lang = biGetLanguage() == 1 ? en : cn;
  $('[language]').each(function () {
    var value = $(this).attr('language');
    $(this).html(lang[value]);
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
    getContentVal(0);
  }
}

$(".item>li").click(function () {
  $(this).addClass("active").siblings().removeClass("active");
  var i = $(".active").index();
  getContentVal(i);
})

function getContentVal(i) {
  $('.content ul').find("[name]").each(function () {
    var name = $(this).attr("name");
    var val = configs[i][name];
    var type = $(this).attr('type');
    if (type == 'checkbox') {
      $(this).prop('checked', val == 'yes' ? true : false);
    } else if (type == "number") {
      $(this).val(compareVal(this, val));
    } else {
      $(this).val(val);
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