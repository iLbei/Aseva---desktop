var busList = [],
  chList = [],
  bds = [],
  not_config = "",
  bdsI = '',
  add_message_flag = false,
  crc8 = "";
$('.message_binding_content').on('click', 'a', function () {
  var name = $(this).attr('class');
  var id = $(this).attr('id');
  var scale = $(this).attr('scale');
  biSelectSignal(name, id, false, null, true, scale, null);
})
$(".add_binding").on("change", "[name]", function () {
  if ($(this).attr("name") == "validator_type") {
    if ($(this).val() == "xor") {
      bds[bdsI][bds[bdsI].length - 1] = {
        "type": "xor"
      }
    } else {
      bds[bdsI][bds[bdsI].length - 1] = {
        "type": "xor",
        "origin": 0,
        "poly": 0,
        "inversion": "no"
      }
    }
  }
  updataVal();
  setConfig();
});

function biOnInitEx(config, moduleConfigs) {
  bdsI = Boolean(config) ? Number(config) : "";
  $('[language]').each(function () {
    var value = $(this).attr('language');
    if (biGetLanguage() == 1) {
      $(this).text(en[value]);
      not_config = '<Not Configured>';
      crc8 = "CRC8 Parameters";
    } else {
      $(this).text(cn[value]);
      not_config = '<未配置>';
      crc8 = "CRC8参数";
    }
  });
  for (var key in moduleConfigs) {
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(moduleConfigs[key], "text/xml");
    var countrys = xmlDoc.getElementsByTagName('root');
    for (var i = 0; i < countrys[0].childNodes.length; i++) {
      var keys = countrys[0].childNodes[i].getAttributeNames();
      if (countrys[0].childNodes[i].nodeName.indexOf('device') != -1) {
        var obj = {};
        for (var n = 0; n < keys.length; n++) {
          obj[keys[n]] = countrys[0].childNodes[i].getAttribute(keys[n]);
        }
        busList.push(obj);
      }
      if (countrys[0].childNodes[i].nodeName.indexOf('ch') != -1) {
        if (countrys[0].childNodes[i].childNodes.length == 0) {
          chList.push("");
        } else {
          var ch = [];
          for (var j = 0; j < countrys[0].childNodes[i].childNodes.length; j++) {
            var o = {};
            for (var k in countrys[0].childNodes[i].childNodes[j].getAttributeNames()) {
              var key = countrys[0].childNodes[i].childNodes[j].getAttributeNames()[k];
              var val = countrys[0].childNodes[i].childNodes[j].getAttribute(key);
              o[key] = val;
            }
            ch.push(o);
          }
          chList.push(ch);
        }
      }
      if (countrys[0].childNodes[i].nodeName.indexOf('bd') != -1) {
        var bd = [];
        bd.push({
          "message": countrys[0].childNodes[i].getAttribute('message')
        });
        for (var j = 0; j < countrys[0].childNodes[i].childNodes.length; j++) {
          var o = {};
          for (var k in countrys[0].childNodes[i].childNodes[j].getAttributeNames()) {
            var key = countrys[0].childNodes[i].childNodes[j].getAttributeNames()[k];
            var val = countrys[0].childNodes[i].childNodes[j].getAttribute(key);
            o[key] = val;
          }
          bd.push(o);
        }
        bds.push(bd);
      }
    }
  }
  if (config != "") biQuerySignalsInBusMessage('open_message', bds[Number(config)][0]['message']);
  config != "" ? $(".del_message").show() : $(".del_message").hide();
}

function updataVal() {
  //点击messagebinding的a打开弹窗更新数据
  if (bdsI !== "") {
    for (var i = 0; i < $('.message_binding_content>ul>li').length; i++) {
      if ($('[name=counter_signal]>option').eq($('[name=counter_signal]').val()).text() == $('.message_binding_content>ul>li').eq(i).find('span').eq(0).text()) {
        bds[bdsI][i + 1]['type'] = "Counter";
      } else if ($('[name=validator_signal]>option').eq($('[name=validator_signal]').val()).text() == $('.message_binding_content>ul>li').eq(i).find('span').eq(0).text()) {
        bds[bdsI][i + 1]['type'] = "Validator";
      } else {
        bds[bdsI][i + 1]['type'] = "Normal";
      }
      bds[bdsI][i + 1]['source'] = $('.message_binding_content>ul>li').eq(i).find('a').attr('id');
      bds[bdsI][i + 1]['signal'] = $('a.message').attr('id') + ':' + $('.message_binding_content>ul>li').eq(i).find('span:eq(0)').text();
      bds[bdsI][i + 1]['scale'] = $('.message_binding_content>ul>li').eq(i).find('a').attr('scale');
      bds[bdsI][i + 1]['default'] = $('.message_binding_content>ul>li').eq(i).find('input').val();
    }
    bds[bdsI][bds[bdsI].length - 1] = $('[name=validator_type]').val() == 'xor' ? {
      "type": "xor"
    } : {
      "type": "crc8",
      "origin": bds[bdsI][3]["origin"],
      "poly": bds[bdsI][3]["poly"],
      'inversion': bds[bdsI][3]["inversion"]
    };
  } else {
    if ($('a.message').text().indexOf(not_config) != -1) return;
    //点击addbinding的a打开弹窗新增数据
    var bd = [];
    bd.push({
      'message': $('a.message').attr('id')
    });
    for (var i = 0; i < $('.message_binding_content>ul>li').length; i++) {
      var obj = {};
      if ($('[name=counter_signal]>option').eq($('[name=counter_signal]').val()).text() == $('.message_binding_content>ul>li').eq(i).find('span').eq(0).text()) {
        obj['type'] = "Counter";
      } else if ($('[name=validator_signal]>option').eq($('[name=validator_signal]').val()).text() == $('.message_binding_content>ul>li').eq(i).find('span').eq(0).text()) {
        obj['type'] = "Validator";
      } else {
        obj['type'] = "Normal";
      }
      obj['source'] = $('.message_binding_content>ul>li').eq(i).find('a').attr('id');
      obj['signal'] = $('a.message').attr('id') + ':' + $('.message_binding_content>ul>li').eq(i).find('span:eq(0)').text();
      obj['scale'] = $('.message_binding_content>ul>li').eq(i).find('a').attr('scale');
      obj['default'] = $('.message_binding_content>ul>li').eq(i).find('input').val();
      bd.push(obj);
    }
    var validator_type = $('[name=validator_type]').val() == 'xor' ? {
      "type": "xor"
    } : {
      "type": "crc8",
      "origin": 0,
      "poly": 0,
      'inversion': 'no'
    }
    bd.push(validator_type);
    if (add_message_flag) {
      bds.splice(bds.length - 1, 1);
    }
    bds.push(bd);
  }
}

function setConfig() {
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root>";
  for (var i in busList) {
    text += "<device "
    for (var j in busList[i]) {
      text += j + "=\"" + busList[i][j] + "\" ";
    }
    text += "/>";
  }
  for (var i in chList) {
    var ch = "ch" + i;
    if (chList[i] == "") {
      text += "<" + ch + "/>";
    } else {
      text += "<" + ch + ">";
      for (var j in chList[i]) {
        text += "<protocol_file "
        text += " id=\"" + chList[i][j]['id'] + "\"";
        text += " md5=\"" + chList[i][j]['md5'] + "\"";
        text += "/>";
      }
      text += "</" + ch + ">";
    }
  }
  for (var i in bds) {
    text += "<bd message=\"" + bds[i][0]['message'] + "\">";
    for (var j = 1; j < bds[i].length - 1; j++) {
      text += "<sg signal=\"" + bds[i][j]['signal'] + "\" ";
      text += "type=\"" + bds[i][j]['type'] + "\" ";
      text += "source=\"" + bds[i][j]['source'] + "\" ";
      text += "scale=\"" + bds[i][j]['scale'] + "\" ";
      text += "default=\"" + bds[i][j]['default'] + "\" ";
      text += "/>";
    }
    if (bds[i][bds[i].length - 1]['type'] == 'xor') {
      text += "<vd type=\"xor\"/>";
    } else if (bds[i][bds[i].length - 1]['type'] == 'crc8') {
      text += "<vd type=\"" + bds[i][bds[i].length - 1]['type'] + "\" ";
      text += "origin=\"" + bds[i][bds[i].length - 1]['origin'] + "\" ";
      text += "poly=\"" + bds[i][bds[i].length - 1]['poly'] + "\" ";
      text += "inversion=\"" + bds[i][bds[i].length - 1]['inversion'] + "\" ";
      text += "/>";
    }
    text += "</bd>";
  }
  text += "</root>";
  biSetModuleConfig("bus.system", text);
}
// 点击Message选择报文
$('body').on('click', 'a.message', function () {
  var id = $(this).attr('id');
  var name = $(this).attr('class');
  biSelectBusMessage(name, id);
})
// 选择报文
function biOnSelectedBusMessage(key, busMessageInfo) {
  switch (key) {
    case 'message': {
      for (var i in bds) {
        if (bds[i][0]["message"] == busMessageInfo.id) {
          biAlert('The message is already binded.');
          return;
        }
      }
      $('.' + key).text(busMessageInfo.name).attr({
        'id': busMessageInfo.id,
        'val': busMessageInfo.protocol + ':' + busMessageInfo.name,
        'title': busMessageInfo.name
      });
      biQuerySignalsInBusMessage('add_message', busMessageInfo.id);
      $('[name="counter_signal"],[name="validator_signal"],.message_binding_content>ul').empty();
      $('[name="counter_signal"],[name="validator_signal"]').append('<option value="0">(Disabled)</option>');
      $('[language="validation_parameters"]').removeClass('span_disabled a_disabled');
      $(".del_message").show();
      break;
    }
  }
}

function biOnQueriedSignalsInBusMessage(key, signalIDList) {
  switch (key) {
    case 'add_message': {
      for (var i in signalIDList) {
        var signalName = signalIDList[i].split(":")[2];
        $('.message_binding_content>ul').append("<li class=\"fixclear\"><span>" + signalName + "</span><span language=\"source_signal\"></span><a href=\"javascript:;\" language=\"not_config\" class=\"a" + i + "\" id=\"\" scale=\"1\"></a><input type=\"text\" name=\"default\" value=\"0\" class=\"right\"><span language=\"default_val\" class=\"right\"></span></li>");
        $('[name="counter_signal"],[name="validator_signal"]').append('<option value="' + (Number(i) + 1) + '">' + signalName + '</option>');
      }
      updataVal();
      add_message_flag = true;
      setConfig();
      break;
    }
    case 'open_message': {
      var counter = 0,
        validator = 0;
      biQueryBusMessageInfo("", bds[bdsI][0]["message"]);
      for (var i = 1; i <= bds[bdsI].length - 2; i++) {
        var signalName = signalIDList[i - 1].split(":")[2];
        var source = bds[bdsI][i]['source'] == '' || bds[bdsI][i]['source'] == undefined || bds[bdsI][i]['source'] == 'null' ? not_config : bds[bdsI][i]['source'].slice(bds[bdsI][i]['source'].indexOf(':') + 1, bds[bdsI][i]['source'].length);
        if (bds[bdsI][i]['type'] == "Counter") counter = i;
        if (bds[bdsI][i]['type'] == "Validator") validator = i;
        $('.message_binding_content>ul').append("<li class=\"fixclear\"><span>" + signalName + "</span><span language=\"source_signal\"></span><a href=\"javascript:;\" language=\"not_config\" class=\"a" + i + "\" scale=\"" + bds[bdsI][i]['scale'] + "\" id=\"" + bds[bdsI][i]['source'] + "\">" + source + "</a><input type=\"text\" name=\"default\" value=\"" + bds[bdsI][i]['default'] + "\" class=\"right\"><span language=\"default_val\" class=\"right\"></span></li>");
        $('[name="counter_signal"],[name="validator_signal"]').append('<option value="' + i + '">' + signalName + '</option>').val();
        biQuerySignalInfo("a" + i, bds[bdsI][i]['source']);
      }
      $('[name="counter_signal"]').val(counter);
      $('[name="validator_signal"]').val(validator);
      bindingSelectChange([counter, validator]);
      $('[name="validator_type"]').val(bds[bdsI][bds[bdsI].length - 1]['type']);
      $('[name="validator_type"]').val() == 'crc8' ? $('[language="validation_parameters"]').show() : $('[language="validation_parameters"]').hide();
      break;
    }
  }
  $(".message_binding_content [language]").each(function () {
    var name = $(this).attr("language");
    if (name != "not_config") {
      $(this).text(biGetLanguage() == 1 ? en[name] : cn[name]);
    } else {
      if (name == "not_config" && $(this).text() == "") {
        $(this).text(not_config);
      }
    }
  })
}

function biOnQueriedBusMessageInfo(key, busMessageInfo) {
  $('a.message').text(busMessageInfo.name).addClass('a_disabled span_disabled').attr('id', busMessageInfo.id);
  $(".del_message").show();
}

function biOnQueriedSignalInfo(key, signalInfo) {
  $("." + key).text(signalInfo.typeName + ":" + signalInfo.signalName).attr("title", signalInfo.typeName + ":" + signalInfo.signalName)
}
// 选信号
function biOnSelectedSignal(key, valueSignalInfo, signBitSignalInfo, scale) {
  if (valueSignalInfo == null) {
    $('.' + key).text(not_config).attr('scale', 1).removeAttr('id title');
  } else {
    if (valueSignalInfo.typeName == undefined) {
      $('.' + key).text(not_config).attr('scale', 1).removeAttr('id title');
    } else {
      var html = valueSignalInfo.typeName + ':' + valueSignalInfo.signalName;
      $('.' + key).text(html).attr({
        'id': valueSignalInfo.id,
        'scale': scale,
        "title": html
      });
    }
  }
  updataVal();
  setConfig();
}
//点击delete关闭当前弹窗
$('.del_message').on('click', function () {
  if (bdsI !== "") {
    bds.length == 1 ? bds = [] : bds.splice(bdsI, 1);
    setConfig();
    setTimeout(function () {
      biCloseChildDialog(bds);
    }, 50)
  }
})

//底部两个select改变时切换message_binding_content种对应信号的颜色
$('.add_binding_bottom select').change(function () {
  bindingSelectChange([$('[name =counter_signal ]').val(), $('[name="validator_signal"]').val()]);
})

function bindingSelectChange(val) {
  $('.message_binding_content>ul>li>span').removeClass('span_disabled')
  $('.message_binding_content>ul>li>a').removeClass('a_disabled');
  $('.message_binding_content>ul>li>input').attr('disabled', false).removeClass('span_disabled');
  for (var i in val) {
    var index = Number(val[i]) - 1;
    if (index >= 0) {
      $('.message_binding_content>ul>li:eq(' + index + ')').find('span').addClass('span_disabled').siblings('a').addClass('a_disabled').siblings('input').attr('disabled', true).addClass('span_disabled');
    }
  }
}

//validation type切换改变a标签状态
$('[name="validator_type"]').change(function () {
  $(this).val() == 'crc8' ? $(this).next().show() : $(this).next().hide();
  if ($('.message_binding_content>ul>li').length > 0) {
    $(this).next().removeClass('span_disabled adisabled');
  } else {
    $(this).next().addClass('span_disabled a_disabled');
  }
})

// validation parameters点击打开弹窗
$("a[language=validation_parameters]").click(function () {
  var i = "";
  if (bdsI === "") {
    i = bds.length - 1;
  } else {
    i = bdsI;
  }
  biOpenChildDialog("bus.validation.html", crc8, new BISize(240, 130), JSON.stringify(bds[i][bds[i].length - 1]));
})

function biOnClosedChildDialog(htmlName, result) {
  if (htmlName == "bus.validation.html") {
    var i = "";
    if (bdsI === "") {
      i = bds.length - 1
    } else {
      i = bdsI;
    }
    if (biGetLocalVariable("bus-validation") != "null") {
      var obj = JSON.parse(biGetLocalVariable("bus-validation"));
      bds[i][bds[i].length - 1] = obj;
    }
  }
  setConfig();
}