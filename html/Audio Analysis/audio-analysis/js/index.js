// 2023/12/8 v2.2.0 1.移除删除按钮和添加按钮，新增降噪模式
var lang = 1;
var configs = {};
var addFreq = "";
var clearSamples = "";
$('.container').on('change', '[name]', function () {
  var name = $(this).attr("name");
  switch (name) {
    case "Enabled": {
      check(this);
      break;
    }
    case "SendBus": {
      checkSendBus(this);
      break;
    }
    case "Mode": {
      checkMode(this);
      break;
    }
    case "IsEnhance": {
      checkEnhance($(this).is(":checked"));
      break;
    }
    default:
      break;
  }
  setVal(this);
})

$("[language=add]").click(function () {
  biOpenChildDialog("audio-analysis.add.html", addFreq, new BISize(238, 150),);
})

function biOnClosedChildDialog(name, result) {
  var val = "";
  if (biGetLocalVariable("Audio-analysis-add")) {
    val = JSON.parse(biGetLocalVariable("Audio-analysis-add"));
  }
  if (val) {
    var upper = val["upper"];
    var lower = val["lower"];
    var freq = val["freq"];
    var newFreq = freq + "," + lower + "," + upper;
    $box = $('.box').clone(true);
    $box.children('.a').val(freq);
    $box.children('.b').val(lower);
    $box.children('.c').val(upper);
    if (configs["FreVsdB"].length == 0) {
      configs["FreVsdB"].push(newFreq);
      $(".border").append($box[0]);
      setVal();
    } else {
      for (var i = 0; i < configs["FreVsdB"].length; i++) {
        var addVal = Number(freq), configsVal = Number(configs["FreVsdB"][i].split(",")[0]);
        if (configsVal > addVal) {
          $(".border>div").eq(i).after($box[0]);
          configs["FreVsdB"].splice(i, 0, newFreq);
          setVal();
          return;
        } else if (i == configs["FreVsdB"].length - 1 && configsVal < addVal) {
          configs["FreVsdB"].push(newFreq);
          $(".border").append($box[0]);
          setVal();
          return;
        } else if (configsVal == addVal) {
          configs["FreVsdB"].splice(i, 1, newFreq);
          $(".border>div").eq(i + 1).find(".a").val(freq);
          $(".border>div").eq(i + 1).find(".b").val(lower);
          $(".border>div").eq(i + 1).find(".c").val(upper);
          setVal();
          return;
        }
      }
    }
  }
}

//Audio enhance
function checkEnhance(flag) {
  if (flag) {
    $("[name=EnhanceTimes]").removeAttr("disabled").removeClass("disabled_background");
    $('[language=EnhanceTimes]').removeClass("disabled_a");
  } else {
    $('[name=EnhanceTimes]').attr("disabled", true).addClass("disabled_background");
    $('[language=EnhanceTimes]').addClass("disabled_a");
  }
}

// Send signal by can
function checkSendBus(obj) {
  if ($(obj).is(":checked")) {
    $('.content>div:nth-child(4)>div input').removeAttr("disabled").removeClass("disabled_background");
    $('.content>div:nth-child(4)>div span').removeClass("disabled_a");
  } else {
    $('.content>div:nth-child(4)>div input').attr("disabled", true).addClass("disabled_background");
    $('.content>div:nth-child(4)>div span').addClass("disabled_a");
  }
}

// Noise reduction mode 切换
function checkMode(obj) {
  if ($(obj).val() != "1") {
    $(".bottom>li:not(:nth-child(1)) [language],.NoiseSamples").addClass("disabled_a");
    $(".bottom>li:not(:nth-child(1)) [name]").addClass("disabled_background").attr("disabled", true);
  } else {
    $(".bottom>li:not(:nth-child(1)) [language],.NoiseSamples").removeClass("disabled_a");
    $(".bottom>li:not(:nth-child(1)) [name]").removeClass("disabled_background").removeAttr("disabled");
    checkEnhance($("[name=IsEnhance]").is(":checked"));
  }
}

function check(obj) {
  if ($(obj).is(":checked")) {
    $('.content input,.content button').removeAttr("disabled").removeClass("disabled_background");
    $('.content [language]').removeClass('disabled_a');
    checkSendBus($('[name=SendBus]'));
  } else {
    $('.content input,.content button').attr("disabled", true).addClass("disabled_background");
    $('.content [language]').addClass('disabled_a');
  }
}

function clearBox() {
  // biConfirm("","","")
  $(".content>.border>div:not(:first-child)").remove();
  configs["FreVsdB"] = [];
  setVal();
}

$(".clearSample").click(function () {
  !$(this).hasClass("disabled_a") && Number($(".NoiseSamples").text()) > 0 && biConfirm("clear", clearSamples,);
})

function biOnResultOfConfirm(key, result) {
  if (result) {
    configs["NoiseSamples"] = [];
    $(".NoiseSamples").text("0");
    if (lang == 1) $("[language=NoiseSamples]").text("sample)");
    setVal();
  }
}

function idChange() {
  var num = Number($('[name=ID]').val());
  var v = num.toString(16);
  if (v.length == 1) v = "0" + v;
  $('.id2').val(v).attr("value", v);
}

/*---------------input [type=number]--------------*/
$('.container').on("change", "input[type=number]", function () {
  var v = compareVal(this, $(this).val());
  var name = $(this).attr("name");
  $(this).val(v).attr("value", v);
  if (name == "ID") {
    var v16 = v.toString(16);
    var val = v16.length > 1 ? v16 : "0" + v16;
    $(".id2").val(val).attr("value", val);
  }
}).on('input', "input[type=number]", function (e) {
  var name = $(this).attr("name");
  var val = $(this).val();
  if (e.which == undefined) {
    if (name == "ID") {
      var v = Number($(this).val()).toString(16);
      var v16 = v.toString(16);
      var val = v16.length > 1 ? v16 : "0" + v16;
      $(".id2").val(val).attr("value", val);
    }
  }
  if (name == "SampleCount" && lang == 1) {
    if (val <= 1) {
      $("[language=SampleCount]").text("frame as sample)");
    } else {
      $("[language=SampleCount]").text("frames as sample)");
    }

  } else
    setVal(this);
}).on('keypress', "input[type=number]", function (e) {
  if (!(e.charCode >= 48 && e.charCode <= 57) && !(e.charCode == 45 || e.charCode == 46)) return false;
})

//16进制ID转为10进制
$('.id2').bind("input propertychange", function () {
  var v = $(this).val();
  var arr = v.split("");
  for (var i = 0; i < arr.length; i++) {
    if (arr[i] == 0) {
      arr.shift();
      i--;
    }
  }
  if (!Number("0x" + v) || arr.length >= 4 || parseInt(Number("0x" + $(this).attr("value")), 10) > 2047) { //包含汉字
    $(this).addClass("red");
  } else {
    $(this).removeClass("red");
    $(this).attr('value', v);
  }
}).blur(function () {
  var val = $(this).attr("value").length > 1 ? $(this).attr("value") : "0" + $(this).attr("value");
  $(this).attr("value", val);
  $(this).val($(this).attr("value")).removeClass("red").parent().prev().find("input").val(parseInt(Number("0x" + $(this).attr("value")), 10));
  setVal($("[name=ID]"));
});

$('[name=ID]').focus(function () {
  var num = Number($(this).val());
  var v = num.toString(16);
  if (v.length == 1) v = "0" + v;
  $('.id2').val(v);
  $('.id2').attr('value', v);
  $('.id2').removeClass('red');
});

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

function biOnInitEx(config, moduleConfigs) {
  lang = biGetLanguage();
  var language = lang == 1 ? en : cn;
  $('[language]').each(function () {
    var value = $(this).attr('language');
    $(this).text(language[value])
  });
  addFreq = language["addFreq"];
  clearSamples = language["clearSamples"];
  for (var key in moduleConfigs) {
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(moduleConfigs[key], "text/xml");
    var countrys = xmlDoc.getElementsByTagName('root');
    var keys = countrys[0].attributes;
    for (var i = 0; i < keys.length; i++) {
      configs[keys[i].nodeName] = keys[i].nodeValue;
    }
    var NoiseSamples = {}, FreVsdB = [];
    if (countrys[0].children.length != 0) {
      for (var j = 0; j < countrys[0].children.length; j++) {
        var name = countrys[0].children[j].nodeName;
        var attr = countrys[0].children[j].attributes;
        if (name == "NoiseSamples") {
          var sampleFreq = [], sampleLoud = [];
        }
        for (var k = 0; k < attr.length; k++) {
          var name2 = attr[k].nodeName;
          if (name2.indexOf("sampleFreq") != -1) {
            sampleFreq.push(attr[k].nodeValue);
          } else if (name2.indexOf("sampleLoud") != -1) {
            sampleLoud.push(attr[k].nodeValue);
          } else if (name2.indexOf("element") != -1) {
            FreVsdB.push(attr[k].nodeValue);
          }
        }
        if (name == "NoiseSamples") {
          NoiseSamples["sampleFreq"] = sampleFreq;
          NoiseSamples["sampleLoud"] = sampleLoud;
        }
      }
    }
    configs["NoiseSamples"] = NoiseSamples;
    configs["FreVsdB"] = FreVsdB;
  }
  loadConfig();
}

function loadConfig() {
  $('.container [name]').each(function () {
    var name = $(this).attr('name');
    var val = configs[name];
    if (!Boolean(val)) return;
    var type = $(this).attr('type');
    if (type == 'checkbox') {
      $(this).prop('checked', val == 'yes');
    } else if (type == "number") {
      $(this).val(compareVal(this, val));
      if (name == "SampleCount" && lang == 1 && val <= 1) $("[language=SampleCount]").text("frame as sample)");
    } else if (type == "radio") {
      if ($(this).attr("value") == val) {
        $(this).prop("checked", true);
      }
    } else {
      $(this).val(val);
    }
  })
  $(".NoiseSamples").text(configs["NoiseSamples"]["sampleFreq"].length);
  if (lang == 1) $("[language=NoiseSamples]").text(configs["NoiseSamples"]["sampleFreq"].length > 1 ? "samples)" : "sample)")
  idChange();
  var arr = configs["FreVsdB"];
  if (arr) {
    for (var i = 0; i < arr.length; i++) {
      var array = arr[i].split(",");
      $box = $('.box').clone(true);
      $box.children('.a').val(array[0]);
      $box.children('.b').val(array[1]);
      $box.children('.c').val(array[2]);
      $('.border').append($box[0]);
    }
  }
  check($('[name=Enabled]'));
  checkMode($("[name=Mode]:checked"));
}

function setVal(obj) {
  var name = $(obj).attr("name");
  var type = $(obj).attr("type");
  var val = $(obj).val();
  if (type == 'checkbox') {
    val = $(obj).is(':checked') ? "yes" : "no";
  } else if (type == "radio") {
    val = $(obj).attr("value");
  } else if (type == "number") {
    val = compareVal(obj, val);
  }
  configs[name] = val;
  setConfig();
}

function setConfig() {
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root ";
  for (var i in configs) {
    i != "FreVsdB" && i != "NoiseSamples" && (text += i + "=\"" + configs[i] + "\" ");
  }
  text += " >";
  text += "<NoiseSamples ";
  if (!$.isEmptyObject(configs["NoiseSamples"])) {
    for (var j = 0; j < configs["NoiseSamples"]["sampleFreq"].length; j++) {
      text += "sampleFreq" + j + "=\"" + configs["NoiseSamples"]["sampleFreq"][j] + "\" ";
      text += "sampleLoud" + j + "=\"" + configs["NoiseSamples"]["sampleLoud"][j] + "\" ";
    }
  }
  text += " />";
  text += "<FreVsdB ";
  for (var k = 0; k < configs["FreVsdB"].length; k++) {
    text += "element" + k + "=\"" + configs["FreVsdB"][k] + "\" ";
  }
  text += " />";
  text += "</root>";
  biSetModuleConfig("audio-analysis.aspluginaudioanalysis", text);
}