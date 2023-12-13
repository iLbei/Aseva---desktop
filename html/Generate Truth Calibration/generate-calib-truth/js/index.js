var arr = "", calib = "", set_parameter = "", dialogConfig = [];

$(".container").on("click", "button", function () {
  var name = $(this).attr("language");
  switch (name) {
    case "add": {
      for (var i in arr) {
        if (arr[i] == "") {
          //content无内容时
          if ($(".content>li").length == 0) {
            $(".content").append("<li class=\"fixclear\" id=\"" + i + "\"><span class=\"left\" title=\"" + calib + (Number(i) + 1) + "\">" + calib + (Number(i) + 1) + "</span><button class=\"right\" language=\"set_parameter\">" + set_parameter + "</button></li>");
          } else {
            //content有内容
            //是第一个则需要在某个元素前面添加
            if (i == 0 && $(".content>li").length > 0) {
              $(".content>li").eq(i).before("<li class=\"fixclear\" id=\"" + i + "\"><span class=\"left\" title=\"" + calib + (Number(i) + 1) + "\">" + calib + (Number(i) + 1) + "</span><button class=\"right\" language=\"set_parameter\">" + set_parameter + "</button></li>");
            } else {
              //其他情况都可以插入到某一个元素后面
              $(".content>li").eq(i - 1).after("<li class=\"fixclear\" id=\"" + i + "\"><span class=\"left\" title=\"" + (Number(i) + 1) + "\">" + calib + (Number(i) + 1) + "</span><button class=\"right\" language=\"set_parameter\">" + set_parameter + "</button></li>");
            }
          }
          $(".content>li:last-child").addClass("active").siblings().removeClass("active");
          arr[i] = {};
          return;
        }
      }
      $(".content").append("<li class=\"fixclear\" id=\"" + arr.length + "\"><span class=\"left\" title=\"" + calib + (arr.length + 1) + "\">" + calib + (arr.length + 1) + "</span><button class=\"right\" language=\"set_parameter\">" + set_parameter + "</button></li>");
      $(".content>li:last-child").addClass("active").siblings().removeClass("active");
      arr.push({});
      setConfig();
      break;
    }
    case "remove": {
      if ($(".content>li").length < 1) return;
      arr[$(".active").attr("id")] = "";
      $(".active").remove();
      $(".content>li:last-child").addClass("active").siblings().removeClass("active");
      setConfig();
      break;
    }
    case "set_parameter": {
      var i = $(this).parent().attr("id");
      biOpenChildDialog("generate-calib-truth.calib.html", calib + (Number(i) + 1), new BISize(271, 382), i);
      break;
    }
  }
})

$(".content").on("click", "li", function () {
  $(this).addClass("active").siblings().removeClass("active");
})

/*----------配置读取与存储-----------*/
$('[name]').change(function () {
  setConfig();
});

//保存配置
function setConfig() {
  dialogConfig[0]["calib_channel"] = $("[name=calib_channel]").val();
  dialogConfig[0]["calib_num"] = $(".content>li").length;
  dialogConfig[1] = arr;
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root ";
  for (var i in dialogConfig) {
    for (var j in dialogConfig[i]) {
      if (Array.isArray(dialogConfig[i])) {
        for (var k in dialogConfig[i][j]) {
          text += k + "_" + j + "=\"" + dialogConfig[i][j][k] + "\" ";
        }
      } else {
        text += j + "=\"" + dialogConfig[i][j] + "\" ";
      }
    }
  }
  text += " />";
  biSetModuleConfig("generate-calib-truth.app", text);
}

function biOnInitEx(config, moduleConfigs) {
  if (biGetLanguage() == 1) {
    $('[language]').each(function () {
      var value = $(this).attr('language');
      $(this).html(en[value]);
    });
    calib = "Calibration Target #";
    set_parameter = "Set Parameters";
  } else {
    $('[language]').each(function () {
      var value = $(this).attr('language');
      $(this).html(cn[value]);
      calib = "标定板";
      set_parameter = "设置参数";
    });
  }
  for (var key in moduleConfigs) {
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(moduleConfigs[key], "text/xml");
    var obj = {}; arr = [];
    var root = xmlDoc.getElementsByTagName('root');
    var keys = root[0].attributes;
    for (var i = 0; i < (keys.length - 2) / 14; i++) {
      arr.push({})
    }
    for (var i = 0; i < keys.length; i++) {
      //获取root自身字节的属性
      var name = keys[i].nodeName;
      var val = keys[i].nodeValue;
      if (name.substr(name.length - 2, 1) == "_") {
        var index = name.substr(name.length - 1, 1);
        name = name.substring(0, name.length - 2);
        arr[index][name] = val;
      } else {
        obj[keys[i].nodeName] = val;
      }
    }
    dialogConfig.push(obj, arr);
    $("[name=calib_channel]").val(dialogConfig[0]["calib_channel"]);
    for (var i = 0; i < arr.length; i++) {
      $(".content").append("<li class=\"fixclear\" id=\"" + i + "\"><span title=\"" + calib + (i + 1) + "\" class=\"left\">" + calib + (i + 1) + "</span><button class=\"right\" language=\"set_parameter\">" + set_parameter + "</button></li>");
    }
  }
  $(".content>li:last-child").addClass("active").siblings().removeClass("active");
}