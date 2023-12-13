var passwordStr = "";
var passwordFlag = false;//判断password是否更改过
var passwordVal = "";//打开页面，password从aspro获取的的值,没有发生更改则直接保存该值
var passwordInputVal = "";
var dialogConfig = {};
$("[name=password]").on({
  "focus": function () {
    passwordInputVal = "";
    $(this).val("");
    passwordVal = "";
    dialogConfig.mail.password="";
    setConfig();
  },
  "input": function () {
    passwordFlag = true;
  }
})
$("input[type=text]").on("input", function (e) {
  var name = $(this).attr("name");
  var v;
  if (name == "password" && e.keyCode !== 32) {
    var val = this.value; //取到输入框的值
    if (val.length > passwordStr.length) {
      //输入值
      passwordStr += val.charAt(val.length - 1);
    } else {
      //回删值
      passwordStr = passwordStr.substr(0, val.length);
    }
    passwordInputVal = passwordStr;
    //将输入框除最后一位的字符替换成*
    this.value =
      val.substr(0, val.length - 1).replace(/./g, "•") +
      val.charAt(val.length - 1);
    /* 取当前输入框长度，用于判断是否正在输入
    停止输入时，一秒后将最后一个字符变成*号 */
    var len = this.value.length;
    /*这时的this指向在延迟器触发时输入框的状态，
  而不是延迟器创建时的状态*/
    if (this.value.length == len) {
      //一秒后输入框的值长度不变，将所有字符替换为*
      this.value = this.value.replace(/./g, "•");
      $(this).attr(this.value);
    }
    if (passwordFlag) {
      v = "[[SRC]]" + passwordInputVal + "[[SRC]]";
    } else {
      v = passwordVal;
    }
    $(this).val(this.value).attr("value", passwordInputVal);
  } else {
    v = $(this).val();
  }
  dialogConfig.mail[name] = v;
  setConfig();
  checkText(this);
// }).on("blur", function () {
//   if ($(this).attr("name") !== "password") {
//     // $(this).val($(this).attr('value'));
//     checkText(this);
//   } else {
//     setConfig();
//   }
})

$("input[type=checkbox]").change(function () {
  var name = $(this).attr("name");
  var v;
  if (name == "enabled") {
    checkMail();
  }
  if (name == "remember") {
    localStorage.setItem("eventMailRemember", $(this).is(":checked"));
  } else {
    v = $(this).is(":checked") ? "yes" : "no";
    dialogConfig.mail[name] = v;
    setConfig();
  }
})

function checkText(obj) {
  var reg = "";
  var name = $(obj).attr("name");
  if (["from", "to"].includes(name)) {
    reg = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  } else {
    reg = /.+/;
  }
  if (reg.test($(obj).val())) {
    $(obj).attr("value", $(obj).val());
    $(obj).prev().addClass("green").removeClass("red");
  } else {
    $(obj).prev().addClass("red").removeClass("green");
  }
}

function checkMail() {
  var flag = $(".mail>.content").find("[name=enabled]").is(":checked");
  $(".mail>.content>div:not(:first-of-type)").each(function () {
    $(this)
      .find("[name]")
      .each(function () {
        !flag ? $(this).attr("disabled", true).addClass("disabled_background") : $(this).removeAttr("disabled").removeClass("disabled_background");
      });
    $(this)
      .find("[language]")
      .each(function () {
        !flag ? $(this).addClass("disabled_a") : $(this).removeClass("disabled_a");
      });
  });
}

/**
 * 设置配置
 * @param {*} object
 */
function setConfig() {
  var arrBox = dialogConfig.arr;
  var textInfo = '<?xml version="1.0" encoding="utf-8"?>';
  textInfo +=
    '<root location_source="' + dialogConfig.location_source + '"' + ">";
  for (var i = 0; i < arrBox.length; i++) {
    var box = arrBox[i];
    textInfo += '<e name="' + box.name + '"';
    textInfo += ' enabled="' + box.enabled + '"';
    textInfo += ' condition="' + box.condition + '"';
    textInfo += ' send_mail="' + box.send_mail + '"';
    textInfo += ' binding_video="' + box.binding_video + '"';
    textInfo += ' binding_obj_sensor="' + box.binding_obj_sensor + '"';
    textInfo += ' binding_lane_sensor="' + box.binding_lane_sensor + '"';
    textInfo += ' rec_bus_enabled="' + box.rec_bus_enabled + '"';
    textInfo += ' rec_bus_positive="' + box.rec_bus_positive + '"';
    textInfo += ' rec_bus_negative="' + box.rec_bus_negative + '"';
    if (box.tablesigArr.length == 0 && box.transmsgArr.length == 0) {
      textInfo += " />";
    } else {
      textInfo += " >";
      for (var j = 0; j < box.tablesigArr.length; j++) {
        var tablesig = box.tablesigArr[j];
        textInfo += '<tablesig name="' + tablesig.name + '"';
        textInfo += ' signal="' + tablesig.signal + '"';
        textInfo += ' scale="' + tablesig.scale + '"/>';
      }
      for (var j = 0; j < box.transmsgArr.length; j++) {
        var transmsg = box.transmsgArr[j];
        textInfo += '<transmsg ch="' + transmsg.ch + '"';
        textInfo += ' id="' + transmsg.id + '"';
        textInfo += ' data="' + transmsg.data + '"/>';
      }
      textInfo += "</e>";
    }
  }
  textInfo += "<mail_config";
  var mail = dialogConfig.mail;
  for (var i in mail) {
    textInfo += " " + i + '="' + mail[i] + '"';
  }
  textInfo += " /></root>";
  biSetModuleConfig("event.system", textInfo);
  biSetLocalVariable("event_configuration", JSON.stringify(dialogConfig));
}

function biOnInitEx(config, moduleConfigs) {
  var lang = biGetLanguage() == 1 ? en : cn;
  $("[language]").each(function () {
    var value = $(this).attr("language");
    $(this).text(lang[value]);
  });
  for (var key in moduleConfigs) {
    xmlParse(moduleConfigs[key]);
  }
}

function xmlParse(text) {
  if (text == null) return;
  var parser = new DOMParser();
  var xmlDoc = parser.parseFromString(text, "text/xml");
  var countries = xmlDoc.getElementsByTagName("root");
  var object = new Object();
  object.location_source = $(countries).attr("location_source");
  var arr = [];
  for (var i = 0; i < countries[0].children.length; i++) {
    var keys1 = countries[0].children[i].attributes;
    var obj = new Object();
    for (var j = 0; j < keys1.length; j++) {
      obj[keys1[j].nodeName] = keys1[j].nodeValue;
    }
    var arr2 = [],
      arr3 = [];
    for (var n = 0; n < countries[0].children[i].children.length; n++) {
      var o = new Object();
      var keys2 = countries[0].children[i].children[n].attributes;
      for (var m = 0; m < keys2.length; m++) {
        o[keys2[m].nodeName] = keys2[m].nodeValue;
      }
      if (o.name != undefined) {
        arr2.push(o);
      } else {
        arr3.push(o);
      }
    }
    if (obj.from == undefined) {
      obj.tablesigArr = arr2;
      obj.transmsgArr = arr3;
      arr.push(obj);
    } else {
      object.mail = obj;
    }
  }
  object.arr = arr;
  dialogConfig = object;
  if (localStorage.getItem("eventMailRemember") !== "true" || !dialogConfig.mail.password) {
    dialogConfig.mail.password = "";
    // localStorage.setItem("eventMailRemember", false)
    var arrBox = dialogConfig.arr;
    var textInfo = '<?xml version="1.0" encoding="utf-8"?>';
    textInfo +=
      '<root location_source="' + dialogConfig.location_source + '"' + ">";
    for (var i = 0; i < arrBox.length; i++) {
      var box = arrBox[i];
      textInfo += '<e name="' + box.name + '"';
      textInfo += ' enabled="' + box.enabled + '"';
      textInfo += ' condition="' + box.condition + '"';
      textInfo += ' send_mail="' + box.send_mail + '"';
      textInfo += ' binding_video="' + box.binding_video + '"';
      textInfo += ' binding_obj_sensor="' + box.binding_obj_sensor + '"';
      textInfo += ' binding_lane_sensor="' + box.binding_lane_sensor + '"';
      textInfo += ' rec_bus_enabled="' + box.rec_bus_enabled + '"';
      textInfo += ' rec_bus_positive="' + box.rec_bus_positive + '"';
      textInfo += ' rec_bus_negative="' + box.rec_bus_negative + '"';
      if (box.tablesigArr.length == 0 && box.transmsgArr.length == 0) {
        textInfo += " />";
      } else {
        textInfo += " >";
        for (var j = 0; j < box.tablesigArr.length; j++) {
          var tablesig = box.tablesigArr[j];
          textInfo += '<tablesig name="' + tablesig.name + '"';
          textInfo += ' signal="' + tablesig.signal + '"';
          textInfo += ' scale="' + tablesig.scale + '"/>';
        }
        for (var j = 0; j < box.transmsgArr.length; j++) {
          var transmsg = box.transmsgArr[j];
          textInfo += '<transmsg ch="' + transmsg.ch + '"';
          textInfo += ' id="' + transmsg.id + '"';
          textInfo += ' data="' + transmsg.data + '"/>';
        }
        textInfo += "</e>";
      }
    }
    textInfo += "<mail_config";
    var mail = dialogConfig.mail;
    for (var i in mail) {
      textInfo += " " + i + '="' + mail[i] + '"';
    }
    textInfo += " /></root>";
    biSetModuleConfig("event.system", textInfo);
  }
  loadConfig();
}

function loadConfig() {
  $(".mail [name]").each(function () {
    var name = $(this).attr("name");
    var type = $(this).attr("type");
    var val = dialogConfig.mail[name];
    if (type == "checkbox") {
      if (name == "remember") {
        $(this).attr("checked", localStorage.getItem("eventMailRemember")=="true");
      } else {
        $(this).attr("checked", val == "yes");
      }
    } else if (type == "text") {
      if (name == "password") {
        if (val != undefined && val != "") {
          passwordVal = val;
          $(this).val("••••••••");
        }
      } else {
        var text = dialogConfig.mail[name] == "null" ? "" : dialogConfig.mail[name];
        $(this).val(text);
      }
      checkText(this);
    }
  });
  checkMail();
}