var busChannelTypes =["Invalid", "CAN", "CAN-FD", "LIN", "Flexray", "Ethernet","SOME/IP"],
  busList = [],
  deviceConfig = [],
  bds = [],
  index, bdsI = '',
  message_binding = "";
for (var i = 0; i < 16; i++) {
  if (i < 8) {
    $('.protocolList:eq(0)').append("<li><div class=\"left\"><span>CH" + (i + 1) + "</span><br><a href=\"javascript:;\" language=\"add_channel_protocol\" class=\"ch" + i + "\"></a></div> <div class=\"right\" id=\"ch" + i + "\"></div></li>")
  } else {
    $('.protocolList:eq(1)').append("<li><div class=\"left\"><span>CH" + (i + 1) + "</span><br><a href=\"javascript:;\" language=\"add_channel_protocol\" class=\"ch" + i + "\"></a></div> <div class=\"right\" id=\"ch" + i + "\"></div></li>")
  }
}

$('.busList').on('click', '[name=icon]', function () {
  if ($(this).hasClass('bcRed')) {
    $(this).removeClass('bcRed').addClass('bcGreen').attr('enabled', 'yes');
  } else if ($(this).hasClass('bcGreen')) {
    $(this).removeClass('bcGreen').addClass('bcRed').attr('enabled', 'no');
  }
  mapChannelChange();
  setConfig();
})

//点击添加，选择协议文件
$('[language="add_channel_protocol"]').click(function () {
  var arr = [];
  $('.protocolList>li>div.right a').each(function () {
    var id = $(this).attr('id');
    var md5 = $(this).attr('md5');
    arr.push({
      'fileName': id,
      'md5': md5
    })
  })
  biSelectBusProtocols($(this).attr('class'), arr)
})

function biOnSelectedBusProtocols(key, busProtocols) {
  $(".protocolList>li>div.right>a").each(function () {
    var i = $(this).index();
    var parentId = $(this).parent().attr("id");
    var id = $(this).attr("id");
    var md5 = $(this).attr("md5");
    biQueryBusProtocolInfo(parentId + ">a:eq(" + i + ")", {
      "fileName": id,
      "md5": md5
    });
  })
  if (key.indexOf('ch') != -1 && busProtocols.length > 0) {
    for (var i = 0; i < busProtocols.length; i++) {
      $('div#' + key).append('<a href="javascript:;" id="' + busProtocols[i]['fileName'] + '" md5="' + busProtocols[i]['md5'] + '">' + busProtocols[i]['fileName'] + '</a>');
    }
  }
  $(".message_bindings_content").empty();
  for (var i in bds) {
    biQueryBusMessageInfo(bds[i][0]['message'], bds[i][0]['message']);
  }
  for (var i = 0; i < bds.length; i++) {
    for (var j = 1; j < bds[i].length - 1; j++) {
      if (bds[i][j]['source'] != '' && bds[i][j]['source'] != "null") {
        biQuerySignalInfo(i, bds[i][j]['source']);
      }
    }
  }
  setConfig();
}
//Channel protocols
$('.protocolList>li>div.right').on('click', 'a', function () {
  $(this).addClass("active");
  var text = (biGetLanguage() == 1 ? 'Are you sure to remove protocol file \"' : '是否移除协议文件 \"') + $(this).attr("id") + '\"?'
  biConfirm($(this).attr("id"), text, "确定");
})

//message bindings
$('.message_bindings_content').on('click', 'a', function () {
  if ($(this).hasClass('red')) {
    $(this).addClass("active");
    var text = biGetLanguage() == 1 ? 'Do you want to delete the wrong binding?' : '是否删除有错误的绑定?'
    biConfirm($(this).attr("id"), text, "确定");
  } else {
    bdsI = $(this).index();
    biOpenChildDialog("bus.addbinding.html", "发送报文协议绑定", new BISize(810, 595), bdsI);
  }
})

//Channel protocols/message bindings删除
function biOnResultOfConfirm(key, result) {
  if (result) {
    if ($(".active").parent().hasClass('message_bindings_content')) {
      bds.splice($(".active").index(), 1);
    }
    $(".active").remove();
    setConfig();
  } else {
    $(".active").removeClass("active");
  }
}

function biOnInitEx(config, moduleConfigs) {
  $('[language]').each(function () {
    var value = $(this).attr('language');
    if (biGetLanguage() == 1) {
      $(this).text(en[value]);
      message_binding = "Message binding";
    } else {
      $(this).text(cn[value]);
      message_binding = "发送报文协议绑定";
    }

  });
  if (biGetRunningMode() != 1) {
    $('.busList,a[language="add_binding"]').show();
    $('.message_bindings_content').show();
  } else {
    $('h5').show();
    $('.busList,a[language="add_binding"]').hide();
  };
  for (var key in moduleConfigs) {
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(moduleConfigs[key], "text/xml");
    var countrys = xmlDoc.getElementsByTagName('root');
    var arr = [],
      chList = [];
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
    arr.push(busList, chList);
    loadConfig(arr);
  }
  biQueryBusDevicesInfo();
}

function loadConfig(config) {
  for (var i = 0; i < config[0].length; i++) {
    deviceConfig.push(config[0][i]);
  }
  for (var i in bds) {
    biQueryBusMessageInfo(bds[i][0]['message'], bds[i][0]['message']);
  }
  for (var i = 0; i < bds.length; i++) {
    for (var j = 1; j < bds[i].length - 1; j++) {
      if (bds[i][j]['source'] != '' && bds[i][j]['source'] != "null") {
        biQuerySignalInfo(i, bds[i][j]['source']);
      }
    }
  }
  for (var i in config[1]) {
    if (config[1][i] != '') {
      for (var j in config[1][i]) {
        $("#ch" + i).append("<a href=\"javascript:;\" id=\"" + config[1][i][j]["id"] + "\" md5=\"" + config[1][i][j]["md5"] + "\">" + config[1][i][j]["id"] + "</a>");
      }
    };
  }
  $(".protocolList>li>div.right>a").each(function () {
    var i = $(this).index();
    var id = $(this).attr("id");
    var parentId = $(this).parent().attr("id");
    var md5 = $(this).attr("md5");
    biQueryBusProtocolInfo(parentId + ">a:eq(" + i + ")", {
      "fileName": id,
      "md5": md5
    });
  })
}

function biOnQueriedBusProtocolInfo(key, busProtocolInfo) {
  if (busProtocolInfo["path"] == "null" || busProtocolInfo.status != 1) {
    $('#' + key).addClass('red');
  } else {
    $('#' + key).removeClass('red');
  }
}

function biOnQueriedBusMessageInfo(key, busMessageInfo) {
  if (busMessageInfo == null) {
    $('.message_bindings_content').append("<a href=\"javascript:;\" class=\"red\" id=\"" + key + "\">" + key + "</a>");
  } else {
    $('.message_bindings_content').append("<a href=\"javascript:;\" id=\"" + busMessageInfo.id + "\">" + busMessageInfo.protocol + ":" + busMessageInfo.name + "</a>");
  }
}

function biOnQueriedBusDevicesInfo(devicesInfo) {
  var devices = JSON.parse(JSON.stringify(devicesInfo)),
    busList2 = JSON.parse(JSON.stringify(busList)),
    busListExistIndex = [],
    busListExist = [],
    busListIndex = [];
  // aspro里面有设备
  if (busList.length > 0) {
    for (var i = 0; i < busList.length; i++) {
      // var busListName = busList[i].device_type + (busList[i].device_serial == 0 ? busList[i].device_channel : busList[i].device_serial) + busList[i].device_channel;
      var busListName = busList[i].device_type + busList[i].device_serial + busList[i].device_channel;
      for (var j in devicesInfo) {
        // var deviceInfoName = devicesInfo[j].type + (devicesInfo[j].serial == 0 ? devicesInfo[j].index : devicesInfo[j].serial) + devicesInfo[j].index;
        var deviceInfoName = devicesInfo[j].type + devicesInfo[j].serial + devicesInfo[j].index;
        // 如果aspro里和获取到的设备一样，就把他删掉，留着已经移除的设备变灰色
        if (deviceInfoName == busListName) {
          devices.splice(j, 1, '')
          //删除掉aspro里面已经存在的设备,留下新增设备但是aspro里面没有的
          busListIndex.push(i);
          //将aspro里面存在的设备放在buslistexist里面,方便读取数据
          busListExist.push(busList[i]);
          busListExistIndex.push(Number(j));
          break;
        }
      }
    }
    // 读取到设备,aspro里面也有,读取数据
    for (var i = 0; i < busListExistIndex.length; i++) {
      var name1 = devicesInfo[busListExistIndex[i]].description,
        type_option = "",
        support_types = devicesInfo[busListExistIndex[i]].supportedTypes,
        serial = devicesInfo[busListExistIndex[i]].serial,
        index = String.fromCharCode(String(busListExist[i].device_channel).charCodeAt() + 17),
        type = devicesInfo[busListExistIndex[i]].type,
        name2 = type + (serial.length > 1 ? '#' + serial : '') + '-' + index;
      for (var k in support_types) {
        type_option += "<option value=\"" + support_types[k] + "\">" + busChannelTypes[support_types[k]] + "</option>";
      }
      $('.busList').append("<li class=\"fixclear\"><span class=\"left bcRed\" name=\"icon\" enabled=\"no\"></span><ul class=\"left\"><li class=\"fixclear\"><div class=\"left\"><p class=\"name1\" title=\"" + name1 + "\">" + name1 + "</p><span class=\"name2\" device_type=\"" + type + "\"device_serial=\"" + serial + "\" device_channel=\"" + busListExist[i].device_channel + "\">" + name2 + "</span></div><div class=\"right\"><span language=\"channel\">软件通道:</span><select name=\"map_channel\"><option value=\"1\">CH1</option><option value=\"2\">CH2</option><option value=\"3\">CH3</option><option value=\"4\">CH4</option><option value=\"5\">CH5</option><option value=\"6\">CH6</option><option value=\"7\">CH7</option><option value=\"8\">CH8</option><option value=\"9\">CH9</option><option value=\"10\">CH10</option><option value=\"11\">CH11</option><option value=\"12\">CH12</option><option value=\"13\">CH13</option><option value=\"14\">CH14</option><option value=\"15\">CH15</option><option value=\"16\">CH16</option></select></div></li><li><span language=\"type\">类型:</span><select name=\"channel_type\">" + type_option + "</select><span language=\"rate\">速率:</span><select name=\"bit_rate\"></select><span language=\"bit_rate_sub\">子速率:</span><select name=\"bit_rate_sub\"></select></li></ul></li>");
    }
    // 读取到设备,但aspro里面没有,新增设备
    for (var i = 0; i < devices.length; i++) {
      if (devices[i] != '') {
        var name1 = devicesInfo[i].description,
          type_option = "",
          support_types = devicesInfo[i].supportedTypes,
          serial = devicesInfo[i].serial,
          index = String.fromCharCode(String(devicesInfo[i].index).charCodeAt() + 17),
          name2 = devicesInfo[i].type + (serial.length > 1 ? '#' + serial : '') + '-' + index,
          type = devicesInfo[i].type,
          idx = devicesInfo[i].index;
        for (var k in support_types) {
          var type = busChannelTypes[support_types[k]];
          type_option += "<option value=\"" + support_types[k] + "\">" + type + "</option>";
        }
        $('.busList').append("<li class=\"fixclear\"><span class=\"left bcRed\" name=\"icon\" enabled=\"no\"></span><ul class=\"left\"><li class=\"fixclear\"><div class=\"left\"><p class=\"name1\" title=\"" + name1 + "\">" + name1 + "</p><span class=\"name2\" device_type=\"" + type + "\"device_serial=\"" + serial + "\" device_channel=\"" + idx + "\">" + name2 + "</span></div><div class=\"right\"><span language=\"channel\">软件通道:</span><select name=\"map_channel\"><option value=\"1\">CH1</option><option value=\"2\">CH2</option><option value=\"3\">CH3</option><option value=\"4\">CH4</option><option value=\"5\">CH5</option><option value=\"6\">CH6</option><option value=\"7\">CH7</option><option value=\"8\">CH8</option><option value=\"9\">CH9</option><option value=\"10\">CH10</option><option value=\"11\">CH11</option><option value=\"12\">CH12</option><option value=\"13\">CH13</option><option value=\"14\">CH14</option><option value=\"15\">CH15</option><option value=\"16\">CH16</option></select></div></li><li><span language=\"type\">类型:</span><select name=\"channel_type\">" + type_option + "</select><span language=\"rate\">速率:</span><select name=\"bit_rate\"></select><span language=\"bit_rate_sub\">子速率:</span><select name=\"bit_rate_sub\" disabled></select></li></ul></li>");
      };
    }
    for (var i in busListIndex) {
      busList2.splice(busListIndex[i], 1, '');
    }
    // 没有读取到设备,但是aspro里面有的,icon变灰色
    for (var i in busList2) {
      if (busList2[i] != '') {
        var name = busList[i].device_type + (busList2[i].device_serial.length > 1 ? ' #' + busList2[i].device_serial : '') + '-' + String.fromCharCode(String(busList2[i].device_channel).charCodeAt() + 17);
        var option = '';
        for (var j = 1; j <= 16; j++) {
          select = j == Number(busList2[i].map_channel) ? 'selected' : '';
          option += "<option value=\"" + j + "\"" + select + ">CH" + j + "</option>";
        }
        $('.busList').append("<li class=\"fixclear\"><span class=\"left bcGray\" name=\"icon\" enabled=\"no\"></span><ul class=\"left\"><li class=\"fixclear\"><div class=\"left\"><span class=\"name2\" title=\"" + name + "\" device_type=\"" + busList2[i].device_type + "\" device_serial=\"" + busList2[i].device_serial + "\" device_channel=\"" + busList2[i].device_channel + "\">" + name + "</span></div><div class=\"right\"><span language=\"channel\">软件通道:</span><select name=\"map_channel\">" + option + "</select></div></li><li><span language=\"type\">类型:</span><select name=\"channel_type\" disabled></select><span language=\"rate\">速率:</span><select name=\"bit_rate\" disabled></select><span language=\"bit_rate_sub\">子速率:</span><select name=\"bit_rate_sub\" disabled></select></li></ul><img src=\"bus/img/del.png\" class=\"removeBusDevice right\"></li>");
      }
    }
    // aspro里面没设备
  } else {
    //aseva里面无设备
    for (var i in devicesInfo) {
      var name1 = devicesInfo[i].description,
        type_option = "",
        support_types = devicesInfo[i].supportedTypes,
        serial = devicesInfo[i].serial,
        index = String.fromCharCode(String(devicesInfo[i].index).charCodeAt() + 17),
        name2 = devicesInfo[i].type + (serial.length > 1 ? '#' + serial : '') + '-' + index;
      for (var j in support_types) {
        var type = busChannelTypes[support_types[j]];
        type_option += "<option value=\"" + support_types[k] + "\">" + type + "</option>";
      }
      $('.busList').append("<li class=\"fixclear\"><span class=\"left bcRed\" name=\"icon\" enabled=\"no\"></span><ul class=\"left\"><li class=\"fixclear\"><div class=\"left\"><p class=\"name1\" title=\"" + name1 + "\">" + name1 + "</p><span class=\"name2\" device_type=\"" + devicesInfo[i].type + "\" device_serial=\"" + serial + "\" device_channel=\"" + devicesInfo[i].index + "\">" + name2 + "444</span></div><div class=\"right\"><span language=\"channel\">软件通道:</span><select name=\"map_channel\"><option value=\"1\">CH1</option><option value=\"2\">CH2</option><option value=\"3\">CH3</option><option value=\"4\">CH4</option><option value=\"5\">CH5</option><option value=\"6\">CH6</option><option value=\"7\">CH7</option><option value=\"8\">CH8</option><option value=\"9\">CH9</option><option value=\"10\">CH10</option><option value=\"11\">CH11</option><option value=\"12\">CH12</option><option value=\"13\">CH13</option><option value=\"14\">CH14</option><option value=\"15\">CH15</option><option value=\"16\">CH16</option></select></div></li><li><span language=\"type\">类型:</span><select name=\"channel_type\">" + type_option + "</select><span language=\"rate\">速率:</span><select name=\"bit_rate\"></select><span language=\"bit_rate_sub\">子速率:</span><select name=\"bit_rate_sub\"></select></li></ul></li>");
    }
  }
  for (var i in busListIndex) {
    var obj = deviceConfig[busListIndex[i]];
    if (obj.enabled == 'yes' && !$('.busList>li').eq(i).find('[name="icon"]').hasClass('bcGray')) {
      $('.busList>li').eq(i).find('[name="icon"]').removeClass('bcRed').addClass('bcGreen').attr('enabled', obj.enabled);
    } else if (obj.enabled == 'no' && !$('.busList>li').eq(i).find('[name="icon"]').hasClass('bcGray')) {
      $('.busList>li').eq(i).find('[name="icon"]').removeClass('bcGreen').addClass('bcRed');
    }
    $('.busList>li').eq(i).find('[name="map_channel"]').val(obj.map_channel == '0' ? 1 : obj.map_channel);
    $('.busList>li').eq(i).find('[name="channel_type"]').val(obj.channel_type);
    var type = obj.channel_type,
      bit_rate = '',
      bit_rate_sub = '';
    if (type == '1') {
      bit_rate = '<option value="1">5K</option><option value="2">10K</option><option value="3">20K</option><option value="18">33K</option><option value="4">40K</option><option value="5">50K</option><option value="6">62K</option><option value="7">80K</option><option value="8">83K</option><option value="9">100K</option><option value="10">125K</option><option value="11">200K</option><option value="12">250K</option><option value="13">400K</option><option value="14">500K</option><option value="15">666K</option><option value="16">800K</option><option value="17">1M</option>';
      bit_rate_sub = '';
    } else if (type == '2') {
      bit_rate = '<option value="101">500K</option><option value="102">1M</option><option value="103">2M</option><option value="107">2.5M</option><option value="104">4M</option><option value="108">5M</option><option value="106">6M</option><option value="105">8M</option>';
      bit_rate_sub = "<option value=\"14\">500K</option><option value=\"17\">1M</option>";
    } else if (type == "3") {
      bit_rate = "<option value=\"201\">1K</option><option value=\"202\">9.6K</option><option value=\"203\">16.5k</option><option value=\"204\">19.2K</option><option value=\"205\">20k</option>";
      bit_rate_sub = '';
    } else if (type == '4') {
      bit_rate = '<option value="301">2.5M</option><option value="302">5M</option><option value="303">10M</option>';
      bit_rate_sub = '';
    } else if (["0", "5", "6"].includes(type)) {
      bit_rate = '';
      bit_rate_sub = '';
    }
    if (bit_rate == "") {
      $('.busList>li').eq(i).find('[name="bit_rate"],[name="bit_rate_sub"]').attr('disabled', true);
    } else {
      $('.busList>li').eq(i).find('[name=bit_rate]').empty().append(bit_rate).val(obj.bit_rate);
    }
    if (bit_rate_sub == "") {
      $('.busList>li').eq(i).find('[name="bit_rate_sub"]').attr('disabled', true);
    } else {
      $('.busList>li').eq(i).find('[name="bit_rate_sub"]').empty().append(bit_rate_sub).val(obj.bit_rate_sub);
      $('.busList>li').eq(i).find('[name="bit_rate_sub"]').attr('disabled', ["101", "107"].includes(obj.bit_rate));
    }
  }
  mapChannelChange();
  $('[language]').each(function () {
    var value = $(this).attr('language');
    $(this).text(biGetLanguage() == 1 ? en[value] : cn[value]);
  });
}

function setConfig() {
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root>";
  $('.busList>li').each(function () {
    text += "<device"
    text += " device_type=\"" + $(this).find('.name2').attr('device_type') + "\"";
    text += " device_serial=\"" + $(this).find('.name2').attr('device_serial') + "\" ";
    text += " device_channel=\"" + $(this).find('.name2').attr('device_channel') + "\" ";
    $(this).find('select').each(function () {
      text += $(this).attr('name') + "=\"" + ($(this).val() == undefined ? "" : $(this).val()) + "\" ";
    });
    text += "enabled=\"" + $(this).find('[name=icon]').attr('enabled') + "\" ";
    text += "/>";
  })
  $('.protocol>ul>li').each(function () {
    var ch = $(this).find('div.right').attr('id');
    if ($(this).find('div.right').find('a').length == 0) {
      text += "<" + ch + "/>";
    } else {
      text += "<" + ch + ">";
      $(this).find('div.right a').each(function () {
        text += "<protocol_file "
        text += " id=\"" + $(this).attr('id') + "\"";
        text += " md5=\"" + $(this).attr('md5') + "\"";
        text += "/>";
      })
      text += "</" + ch + ">";
    }
  })
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
$('.bus').on('click', '.removeBusDevice', function () {
  $(this).parent().remove();
  setConfig();
})
$('.container').on('change', '[name=channel_type]', function () {
  var type = $(this).val();
  var bit_rate = '',
    bit_rate_sub = '';
  switch (type) {
    case "1": {
      bit_rate = '<option value="1">5K</option><option value="2">10K</option><option value="3">20K</option><option value="18">33K</option><option value="4">40K</option><option value="5">50K</option><option value="6">62K</option><option value="7">80K</option><option value="8">83K</option><option value="9">100K</option><option value="10">125K</option><option value="11">200K</option><option value="12">250K</option><option value="13">400K</option><option value="14">500K</option><option value="15">666K</option><option value="16">800K</option><option value="17">1M</option>';
      break;
    }
    case "2": {
      bit_rate = '<option value="101">500K</option><option value="102">1M</option><option value="103">2M</option><option value="107">2.5M</option><option value="104">4M</option><option value="108">5M</option><option value="106">6M</option><option value="105">8M</option>';
      break;
    }
    case "3": {
      bit_rate = "<option value=\"201\">1K</option><option value=\"202\">9.6K</option><option value=\"203\">16.5k</option><option value=\"204\">19.2K</option><option value=\"205\">20k</option>";
      break;
    }
    case "4": {
      bit_rate = '<option value="301">2.5M</option><option value="302">5M</option><option value="303">10M</option>';
      break;
    }
    default: {
      bit_rate = '';
      break;
    }
  }
  switch (type) {
    case "2": {
      bit_rate_sub = "<option value=\"14\">500K</option><option value=\"17\">1M</option>";
      break;
    }
    default: {
      bit_rate_sub = '';
      break;
    }
  }
  if (bit_rate == '') {
    $(this).parent().find('[name="bit_rate"]').empty().attr('disabled', true);
  } else {
    $(this).parent().find('[name=bit_rate]').empty().append(bit_rate).removeAttr('disabled');
  }
  if (bit_rate_sub == '') {
    $(this).parent().find('[name="bit_rate_sub"]').empty().attr('disabled', true);
  } else {
    $(this).parent().find('[name="bit_rate_sub"]').empty().append(bit_rate_sub).removeAttr('disabled');
  }
  if (type == '1') {
    $(this).parent().find('[name="bit_rate"]').val(14);
    $(this).parent().find('[name="bit_rate_sub"]').attr('disabled', true);
  } else if (type == '2') {
    $(this).parent().find('[name="bit_rate"]').val(103);
    $(this).parent().find('[name="bit_rate_sub"]').val(14);
  } else if (type == '3') {
    $(this).parent().find('[name="bit_rate"]').val(202);
    $(this).parent().find('[name="bit_rate_sub"]').attr('disabled', true);
  } else if (type == '4') {
    $(this).parent().find('[name="bit_rate"]').val(303);
    $(this).parent().find('[name="bit_rate_sub"]').attr('disabled', true);
  }
})
$('.container').on('change', '[name=bit_rate]', function () {
  if ($(this).parent().find('[name=channel_type]').val() != 2) return;
  $(this).parent().find('[name=bit_rate_sub]').val(14).attr('disabled', ["101", "107"].includes($(this).val()));
})

function mapChannelChange() {
  var arr = [
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    []
  ];
  $('.busList>li').each(function () {
    if ($(this).find('span[name=icon]').hasClass('bcGreen')) {
      arr[Number($(this).find('[name=map_channel]').val())-1].push($(this).index());
      $(this).find('[name=map_channel]').prev().removeClass('red');
    } else if ($(this).find('span[name=icon]').hasClass('bcRed')) {
      $(this).find('[name=map_channel]').prev().removeClass('red');
    }
  })
  for (var i in arr) {
    if (arr[i].length > 1) {
      for (var j in arr[i]) {
        $('.busList>li').eq(arr[i][j]).find('[name=map_channel]').prev().addClass('red');
      }
      $('.busList>li').eq(arr[i][0]).find('[name=map_channel]').prev().removeClass('red');
    }
  }
}
$('.container').on('change', '[name=map_channel]', function () {
  mapChannelChange();
})
$('.container').on('change', '[name]', function () {
  setConfig();
})


function biOnQueriedSignalInfo(key, signalInfo) {
  // if (Number(key) && signalInfo == null) {
  if (signalInfo == null) {
    $('.message_bindings_content>a').eq(Number(key)).addClass('red').text($('.message_bindings_content>a').eq(Number(key)).attr('id'));
  } else {
    $("." + key).text(signalInfo.typeName + ":" + signalInfo.signalName)
  }
}

$('a').click(function () {
  var name = $(this).attr('language');
  switch (name) {
    case 'add_binding': {
      biOpenChildDialog("bus.addbinding.html", message_binding, new BISize(810, 595), "")
      break;
    }
    case "bus_information": {
      var versions = biGetNativeModuleVersions(2);
      var text = "";
      for (var i in versions) {
        text += i + '：v' + versions[i] + "\n";
      }
      biAlert(text);
    }
  }
})

function biOnClosedChildDialog(htmlName, result) {
  switch (htmlName) {
    case "bus.addbinding.html": {
      history.go(0);
      break;
    }
  }
}