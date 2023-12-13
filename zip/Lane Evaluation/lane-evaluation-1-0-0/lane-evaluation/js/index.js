let absZeroPowerLimitEnd = "00",
  absFirstPowerLimitEnd = "00",
  absSecondPowerLimitEnd = "00",
  absThirdPowerLimitEnd = "00";
$('input[type=number]').on({
  'keypress': function (e) {
    console.log(1);
    if (e.charCode == 101 || e.charCode == 43) {
      return false;
    }
  },
  "input": function (e) {
    console.log(e.which);
    let name = $(this).attr("name");
    if (e.which == 0) {//e.which==0输入 e.which==undefined上下箭头
      switch (name) {
        case "absZeroPowerLimit": {
          absZeroPowerLimitEnd = $(this).val().substring($(this).val().indexOf('.') + 7);
          if (absZeroPowerLimitEnd.length == 1) absZeroPowerLimitEnd += '0';
          break;
        }
        case "absFirstPowerLimit": {
          absFirstPowerLimitEnd = $(this).val().substring($(this).val().indexOf('.') + 7);
          if (absFirstPowerLimitEnd.length == 1) absFirstPowerLimitEnd += '0';
          break;
        }
        case "absSecondPowerLimit": {
          absSecondPowerLimitEnd = $(this).val().substring($(this).val().indexOf('.') + 7);
          if (absSecondPowerLimitEnd.length == 1) absSecondPowerLimitEnd += '0';
          break;
        }
        case "absThirdPowerLimit": {
          absThirdPowerLimitEnd = $(this).val().substring($(this).val().indexOf('.') + 7);
          if (absThirdPowerLimitEnd.length == 1) absThirdPowerLimitEnd += '0';
          break;
        }
        default:
          return;
      }
    } else {
      switch (name) {
        case "absZeroPowerLimit": {
          absZeroPowerLimitEnd = absZeroPowerLimitEnd == "" ? "00" : absZeroPowerLimitEnd.substr(0, 2);
          if ($(this).val() >= $(this).attr("max") || $(this).val() <= $(this).attr("min")) absZeroPowerLimitEnd == "00";
          $(this).val(compareVal(this, $(this).val(), absZeroPowerLimitEnd));
          break;
        }
        case "absFirstPowerLimit": {
          absFirstPowerLimitEnd = absFirstPowerLimitEnd == "" ? "00" : absFirstPowerLimitEnd.substr(0, 2);
          if ($(this).val() >= $(this).attr("max") || $(this).val() <= $(this).attr("min")) absFirstPowerLimitEnd == "00";
          $(this).val(compareVal(this, $(this).val(), absFirstPowerLimitEnd));
          break;
        }
        case "absSecondPowerLimit": {
          absSecondPowerLimitEnd = absSecondPowerLimitEnd == "" ? "00" : absSecondPowerLimitEnd.substr(0, 2);
          if ($(this).val() >= $(this).attr("max") || $(this).val() <= $(this).attr("min")) absSecondPowerLimitEnd == "00";
          $(this).val(compareVal(this, $(this).val(), absSecondPowerLimitEnd));
          break;
        }
        case "absThirdPowerLimit": {
          absThirdPowerLimitEnd = absThirdPowerLimitEnd == "" ? "00" : absThirdPowerLimitEnd.substr(0, 2);
          if ($(this).val() >= $(this).attr("max") || $(this).val() <= $(this).attr("min")) absThirdPowerLimitEnd == "00";
          $(this).val(compareVal(this, $(this).val(), absThirdPowerLimitEnd));
          break;
        }
        default:
          return;
      }
    }

    setConfig();
  },
  "blur": function () {
    console.log(3);
    $(this).val(compareVal(this, $(this).val(), $(this).val().substring($(this).val().indexOf('.') + 7, $(this).val().indexOf('.') + 9)))
  }
})
//有input type=number 情况下比较大小
function compareVal(obj, val, nameEnd) {
  if (!nameEnd) nameEnd = "00";
  let step = $(obj).attr('step'),
    v = Number(val),
    min = Number($(obj).attr('min')),
    max = Number($(obj).attr('max')),
    name = $(obj).attr("name");
  if (isNaN(v)) { v = Number($(obj).attr('value')); }
  v = v < min ? min : v;
  v = v > max ? max : v;
  if (name.indexOf("PowerLimit") != -1) {
    v = v.toFixed(step.length - 2);
    if (v >= max || v <= min) {
      switch (name) {
        case "absZeroPowerLimit": {
          absZeroPowerLimitEnd = "00";
          break;
        }
        case "absFirstPowerLimit": {
          absFirstPowerLimitEnd = "00";
          break;
        }
        case "absSecondPowerLimit": {
          absSecondPowerLimitEnd = "00";
          break;
        }
        case "absThirdPowerLimit": {
          absThirdPowerLimitEnd = "00";
          break;
        }
        default:
          return;
      }
      nameEnd = "00";
    } else {
      nameEnd = nameEnd;
    }
    return v + nameEnd;
  } else {
    return v.toFixed(0)
  }
}

/*----------配置读取与存储-----------*/
$(function () {
  $('[language]').each(function () {
    let value = $(this).attr('language');
    $(this).html(biGetLanguage() == 1 ? en[value] : cn[value])
  });
})
// 表单内容改变保存配置
$('[name]').change(function () {
  if ($(this).attr("name") == "leEnable") enabledChange();
  setConfig();
});
function enabledChange() {
  if ($("[name=leEnable]").is(":checked")) {
    $('.container>ul').find('span').removeClass('disabled');
    $('.container>ul [name]').attr('disabled', false).removeClass('disabled');
  } else {
    $('.container>ul').find('span').addClass('disabled');
    $('.container>ul [name]').attr('disabled', true).addClass('disabled');
  }
}
//保存配置
function setConfig() {
  let text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root><config ";
  $('.container [name]').each(function () {
    let name = $(this).attr('name');
    let val = $(this).val();
    if ($(this).attr('type') == 'checkbox') {
      text += name + "=\"" + ($(this).is(':checked') ? "yes" : "no") + "\" ";
    } else if ($(this).attr("type") == "number") {
      let end = $(this).val().substr($(this).val().indexOf('.') + 7, 2);
      text += name + "=\"" + compareVal(this, val, end) + "\" ";
    } else {
      text += name + "=\"" + val + "\" ";
    }
  });
  text += " /></root>";
  biSetModuleConfig("lane-evaluation.aspluginlaneevaluation", text);
}
//初始化
function biOnInitEx(config, moduleConfigs) {
  biSetViewSize(313, 338);
  $('[language]').each(function () {
    let value = $(this).attr('language');
    $(this).html(biGetLanguage() == 1 ? en[value] : cn[value])
  });
  for (let key in moduleConfigs) {
    let parser = new DOMParser();
    let xmlDoc = parser.parseFromString(moduleConfigs[key], "text/xml");
    let obj = new Object();
    let root = xmlDoc.getElementsByTagName('config');
    let keys = root[0].getAttributeNames();
    for (let i = 0; i < keys.length; i++) {
      //获取root自身字节的属性
      obj[keys[i]] = root[0].getAttribute(keys[i]);
    }
    loadConfig(obj);
  }
}
function loadConfig(obj) {
  if (obj == null) return;
  $('.container [name]').each(function () {
    let val = obj[$(this).attr('name')];
    let type = $(this).attr('type');
    if (type == 'checkbox') {
      $(this).prop('checked', val == 'yes' ? true : false);
    } else if (type == "number") {
      switch ($(this).attr("name")) {
        case "absZeroPowerLimit": {
          absZeroPowerLimitEnd = val.substring(val.indexOf('.') + 7);
          $(this).val(compareVal(this, val, absZeroPowerLimitEnd));
          break;
        }
        case "absFirstPowerLimit": {
          absFirstPowerLimitEnd = val.substring(val.indexOf('.') + 7);
          $(this).val(compareVal(this, val, absFirstPowerLimitEnd));
          break;
        }
        case "absSecondPowerLimit": {
          absSecondPowerLimitEnd = val.substring(val.indexOf('.') + 7);
          $(this).val(compareVal(this, val, absSecondPowerLimitEnd));
          break;
        }
        case "absThirdPowerLimit": {
          absThirdPowerLimitEnd = val.substring(val.indexOf('.') + 7);
          $(this).val(compareVal(this, val, absThirdPowerLimitEnd));
          break;
        }
        default:
          $(this).val(compareVal(this, val, 0));
          return;
      }
    } else {
      $(this).val(val);
    }
  })
  enabledChange();
}