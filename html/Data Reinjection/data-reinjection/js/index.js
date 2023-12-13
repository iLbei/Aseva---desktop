var reg = /^([1-9]|([1-9][0-9])|(1[0-9][0-9])|(2[0-4][0-9])|(25[0-5]))(\.([0-9]|([1-9][0-9])|(1[0-9][0-9])|(2[0-4][0-9])|(25[0-5]))){3}$/;
//正则验证 ip
$('input[type=text]').on("keyup", function () {
  var val = $(this).val();
  if (["server_ip","local_ip"].includes($(this).attr("name"))) {
    reg.test(val) ? $(this).addClass('green').attr("value", $(this).val()).removeClass('red') : $(this).removeClass('green').addClass('red');
  } else if ($(this).attr("name") == "bus_msgid") {
    !isNaN(val) ? $(this).addClass('green').attr("value", $(this).val()).removeClass('red') : $(this).removeClass('green').addClass('red');
  }
  if (!$(this).hasClass('red')) setConfig();
}).blur(function () {
  if ($(this).val() == "" || $(this).hasClass('red')) {
    $(this).val($(this).attr('value')).addClass('green').removeClass('red');
  } else {
    setConfig();
  }
})

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
$('[name]').change(function () {
  if (!(["server_ip","local_ip"].includes($(this).attr("name")))) {
    setConfig();
  }
});
//保存配置
function setConfig() {
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root>";
  for (var i = 1; i <= $(".container>div.bus>ul").length; i++) {
    $('.container>div').each(function () {
      var tag = $(this).find('p').attr("language") + i;
      text += "<" + tag;
      $(this).find('ul.fixclear:eq(' + (i - 1) + ') [name]').each(function () {
        var name = $(this).attr("name");
        var val = $(this).val();
        var type = $(this).attr('type');
        if (type == 'checkbox') {
          text += " " + name + "=\"" + ($(this).is(':checked') ? "yes" : "no") + "\"";
        } else if (type == "number") {
          text += " " + name + "=\"" + compareVal(this, val) + "\"";
        } else {
          text += " " + name + "=\"" + val + "\"";
        }
      })
      text += "/>";
    })
  }
  text += "</root>";
  biSetModuleConfig("data-reinjection.asplugindatareinjection", text);
}
//初始化
function biOnInitEx(config, moduleConfigs) {
  $('[language]').each(function () {
    var value = $(this).attr('language');
    $(this).html(biGetLanguage() == 1 ? en[value] : cn[value])
  });
  var arr = [];
  for (var i = 0; i < $(".container>div.bus>ul").length; i++) {
    arr.push([]);
  };
  for (var key in moduleConfigs) {
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(moduleConfigs[key], "text/xml");
    var child = xmlDoc.getElementsByTagName('root')[0].childNodes;
    for (var i = 1; i <= $(".container>div.bus>ul").length; i++) {
      for (var count = i * 3 - 3; count < i * 3; count++) {
        var obj = {};
        var keys = child[count].attributes;
        for (var j in keys) {
          obj[keys[j].nodeName] =keys[j].nodeValue;
        }
        switch (count % 3) {
          case 0: {
            arr[i - 1]["bus"] = obj;
            break;
          }
          case 1: {
            arr[i - 1]["video"] = obj;
            break;
          }
          case 2: {
            arr[i - 1]["ethernet"] = obj;
            break;
          }
        }
      }
    }
    loadConfig(arr);
  }
}
function loadConfig(arr) {
  if (arr == null) return;
  $('.container>div').each(function () {
    var parentName = $(this).find("p").attr("language");
    $(this).find("[name]").each(function () {
      var i = $(this).parents("ul.fixclear").index() - 1;
      var name = $(this).attr("name");
      var val = arr[i][parentName][name];
      var type = $(this).attr('type');
      if (type == 'checkbox') {
        $(this).prop('checked', val == 'yes' ? true : false);
      } else if (type == "number") {
        $(this).val(compareVal(this, val));
      } else {
        $(this).val(val);
        if (["server_ip","local_ip"].includes(name)) {
          reg.test(val) ? $(this).addClass('green').removeClass('red') : $(this).removeClass('green').addClass('red');
        } else if (name == "bus_msgid") {
          !isNaN(val) ? $(this).addClass('green').removeClass('red') : $(this).removeClass('green').addClass('red');
        }
      }
    })

  })
}