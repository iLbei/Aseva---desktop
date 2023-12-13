// 2023/10/20 v2.3.0 字段更改:vflip -> vertical_flip,invert -> inversion
var index = 0,
  channelList = [],
  deviceList = [],
  videoCodec = [],
  general_settings = {},
  reset_param = "",
  confirm = "",
  deviceListOrder = [],
  intrinsics = false,
  language = 1;
$(function () {
  for (var i = 65; i <= 88; i++) {
    $('.video_channel_list').append("<li id=\"" + (i - 65) + "\"><ul class=\"fixclear\"><li class=\"fixclear\"><span class=\"left\">" + String.fromCharCode(i) + "</span><a href=\"javascript:;\" language=\"cha\" name='name' class=\"left channel\">Channel " + String.fromCharCode(i) + "</a> <input type=\"text\" name=\"\" class=\"channelInput left\"><a href=\"javascript:;\" class=\"right\" language=\"extrinsics\"></a><a href=\"javascript:;\" pan class=\"right\" language=\"intrinsics\"></a></li><li class=\"fixclear\"><span class=\"left\" language=\"basic\"></span><input type=\"checkbox\" name=\"inversion\" id=\"inversion_" + i + "\"><label for=\"inversion_" + i + "\" language=\"inversion\"></label><input type=\"checkbox\" name=\"vertical_flip\" id=\"vertical_flip_" + i + "\"><label for=\"vertical_flip_" + i + "\" language=\"vertical_flip\"></label><input type=\"checkbox\" name=\"undistort\" id=\"undistort_" + i + "\"><label for=\"undistort_" + i + "\" class=\"disabled_a\" language=\"undistort\"></label><a href=\"javascript:;\" class=\"right\" language=\"reset\"></a></li><li><span class=\"left\" language=\"rectify\"></span><input type=\"checkbox\" name=\"rectify_roll\" id=\"rectify_roll_" + i + "\" disabled><label for=\"rectify_roll_" + i + "\" language=\"roll\" class=\"disabled_a\"></label><input type=\"checkbox\" name=\"rectify_pitch\" id=\"rectify_pitch_" + i + "\" disabled><label for=\"rectify_pitch_" + i + "\" language=\"pitch\" class=\"disabled_a\"></label><input type=\"checkbox\" name=\"rectify_yaw\" id=\"rectify_yaw_" + i + "\" disabled><label for=\"rectify_yaw_" + i + "\" language=\"yaw\" class=\"disabled_a\"></label><a href=\"javascript:;\" class=\"right\" language=\"switch\"></a></li></ul></li>");
  }
})
/*------------------Video devices------------------*/
//点击视频设备左边的红色圆点改变颜色
$('.video_list').on('click', 'li span.icon', function () {
  var deviceNow = deviceList[deviceListOrder[$(this).parent().index()]];
  if ($(this).hasClass('bcRed')) {
    $(this).removeClass('bcRed').addClass('bcGreen');
    deviceNow['enabled'] = 'yes';
    if ($(this).hasClass("output_modes")) {
      $(this).text("O");
      deviceNow['mode'] = "2";
      // 输出模式rec.fps禁用,aligned_fps禁用
      $(this).parent().find("[name=fps]").attr("disabled", true).prev().addClass("disabled_a");
      $(this).parent().find("[name=aligned_fps]").attr({
        "disabled": true,
        "checked": false
      }).next().addClass("disabled_a");
    } else {
      $(this).parent().find("[name=fps]").attr("disabled", false).prev().removeClass("disabled_a");
      $(this).text("I");
      deviceNow['mode'] = "1";
      $(this).parent().find("[language=output_mode]").text(biGetLanguage() == 1 ? "Input mode:" : "输入模式:").attr("language", "input_mode");
      $(this).parent().find("[name=input_mode] option.inputmode").show();
      $(this).parent().find("[name=input_mode] option.outputmode").hide();
      input_mode_change($(this).parent().find("[name=input_mode]"));
    }
  } else if ($(this).hasClass('bcGreen')) {
    if ($(this).hasClass("all_modes") && $(this).text() == "I") {
      // 输出模式rec.fps禁用,aligned_fps禁用
      $(this).parent().find("[name=fps]").attr("disabled", true).prev().addClass("disabled_a");
      $(this).parent().find("[name=aligned_fps]").attr({
        "disabled": true,
        "checked": false
      }).next().addClass("disabled_a");
      $(this).text("O");
      deviceNow['mode'] = "2";
      $(this).parent().find("[language=input_mode]").text(biGetLanguage() == 1 ? "Output mode:" : "输出模式:").attr("language", "output_mode");
      $(this).parent().find("[name=input_mode] option.outputmode").show();
      $(this).parent().find("[name=input_mode] option.inputmode").hide();
      var val = "",
        count = 0;
      $(this).parent().find("[name=input_mode] option").each(function () {
        if ($(this).attr("value").indexOf("o:") != -1 && count == 0) {
          val = $(this).attr("value");
          count++;
        };
      })
      $(this).parent().find("[name=input_mode]").val(val)
    } else {
      if ($(this).hasClass("all_modes")) {
        $(this).parent().find("[language=output_mode]").text(biGetLanguage() == 1 ? "Input mode:" : "输入模式:").attr("language", "input_mode");
        $(this).parent().find("[name=input_mode] option.inputmode").show();
        $(this).parent().find("[name=input_mode] option.outputmode").hide();
        var val = "",
          count = 0;
        $(this).parent().find("[name=input_mode] option").each(function () {
          if ($(this).attr("value").indexOf("i:") != -1 && count == 0) {
            val = $(this).attr("value");
            count++;
          };
        })
        $(this).parent().find("[name=input_mode]").val(val);
      }
      $(this).parent().find("[name=fps]").attr("disabled", false).prev().removeClass("disabled_a");
      input_mode_change($(this).parent().find("[name=input_mode]"));
      $(this).removeClass('bcGreen').addClass('bcRed').text("");
      deviceNow['enabled'] = 'no';
      deviceNow['mode'] = "0";
    }
  }
  if (deviceNow["mode"] == 2) {
    deviceList[$(this).parent().index()]['output_width'] = $(this).parent().find('[name=input_mode] option:selected').attr('output_width');
    deviceList[$(this).parent().index()]['output_height'] = $(this).parent().find('[name=input_mode] option:selected').attr('output_height');
    deviceList[$(this).parent().index()]['output_codec'] = $(this).parent().find('[name=input_mode] option:selected').attr('output_codec');
  } else {
    deviceList[$(this).parent().index()]['input_width'] = $(this).parent().find('[name=input_mode] option:selected').attr('input_width');
    deviceList[$(this).parent().index()]['input_height'] = $(this).parent().find('[name=input_mode] option:selected').attr('input_height');
    deviceList[$(this).parent().index()]['input_codec'] = $(this).parent().find('[name=input_mode] option:selected').attr('input_codec');
  }
  setConfig();
  mapChannelChange()
})
$('.video_list').on('change', '[name]', function () {
  var name = $(this).attr('name');
  var index = deviceListOrder[$(this).parent().parent().parent().index()];
  if ($(this).is('select')) {
    if (name == 'channel') {
      index = deviceListOrder[$(this).parent().parent().parent().parent().index()];
      mapChannelChange();
      deviceList[index][name] = $(this).val();
    } else if (name == 'input_mode') {
      if (deviceList[index]["mode"] == 2) {
        deviceList[index]['output_width'] = $(this).find('option:selected').attr('output_width');
        deviceList[index]['output_height'] = $(this).find('option:selected').attr('output_height');
        deviceList[index]['output_codec'] = $(this).find('option:selected').attr('output_codec');
      } else {
        deviceList[index]['input_width'] = $(this).find('option:selected').attr('input_width');
        deviceList[index]['input_height'] = $(this).find('option:selected').attr('input_height');
        deviceList[index]['input_codec'] = $(this).find('option:selected').attr('input_codec');
      }

    } else {
      deviceList[index][name] = $(this).val();
    }
  } else if ($(this).attr('type') == 'checkbox') {
    deviceList[index][name] = $(this).is(':checked') ? 'yes' : 'no';
  }
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
  $('.video_list>li').each(function () {
    if ($(this).children('span.icon').hasClass('bcGreen')) {
      arr[Number($(this).find('[name=channel]').val())].push($(this).index());
      $(this).find('[name=channel]').prev().removeClass('red');
    } else if ($(this).find('span.icon').hasClass('bcRed')) {
      $(this).find('[name=channel]').prev().removeClass('red');
    }
  })
  for (var i in arr) {
    if (arr[i].length > 1) {
      for (var j in arr[i]) {
        $('.video_list>li').eq(arr[i][j]).find('[name=channel]').prev().addClass('red');
      }
      $('.video_list>li').eq(arr[i][0]).find('[name=channel]').prev().removeClass('red');
    }
  }
}
// 获取视频设备
function biOnQueriedVideoDevicesInfoX(devicesInfo) {
  var option = '';
  $('a.channel').each(function (i) {
    option += "<option value=\"" + i + "\">" + $(this).text() + "</option>";
  })
  var devices = JSON.parse(JSON.stringify(devicesInfo)),
    device2 = JSON.parse(JSON.stringify(deviceList)),
    deviceExistIndex = [],
    deviceExist = [],
    deviceIndex = [];
  // aspro里面有设备
  for (var i = 0; i < deviceList.length; i++) {
    var deviceName = deviceList[i].cam_type + ' ' + deviceList[i].local_id;
    for (var j in devicesInfo) {
      var deviceInfoName = devicesInfo[j].type + ' ' + devicesInfo[j].localID;
      // 如果aspro里和获取到的设备一样，就把他删掉，留着已经移除的设备变灰色
      if (deviceInfoName == deviceName) {
        devices.splice(j, 1, '')
        //删除掉aspro里面已经存在的设备,留下新增设备但是aspro里面没有的
        deviceIndex.push(i);
        //将aspro里面存在的设备放在deviceexist里面,方便读取数据
        deviceExist.push(deviceList[i]);
        deviceExistIndex.push(Number(j));
        deviceListOrder.push(Number(i));
      }
    }
  }
  // 读取到设备,aspro里面也有,读取数据
  for (var i = 0; i < deviceExistIndex.length; i++) {
    var k = deviceExistIndex[i];
    var name = devicesInfo[k].type + ' ' + devicesInfo[k].localID + (devicesInfo[k].description ? (' (' + devicesInfo[k].description + ')') : "");
    var inputModes = devicesInfo[k]['inputModes'];
    var outputModes = devicesInfo[k]['outputModes'];
    var mode = '';
    if (inputModes.length > 0) {
      for (var j in inputModes) {
        var width = inputModes[j]['size']['width'];
        var height = inputModes[j]['size']['height'];
        mode += "<option value=\"i:" + width + 'x' + height + videoCodec[inputModes[j]['codec']] + "\" input_width=\"" + width + "\" input_height=\"" + height + "\" input_codec=\"" + inputModes[j]['codec'] + "\" class=\"inputmode\">";
        mode += width + "x" + height + " " + videoCodec[inputModes[j]['codec']];
        mode += "</option>";
      }
    }
    if (outputModes.length > 0) {
      for (var j in outputModes) {
        var width = outputModes[j]['size']['width'];
        var height = outputModes[j]['size']['height'];
        mode += "<option value=\"o:" + width + 'x' + height + videoCodec[outputModes[j]['codec']] + "\" output_width=\"" + width + "\" output_height=\"" + height + "\" output_codec=\"" + outputModes[j]['codec'] + "\" class=\"outputmode\">";
        mode += width + "x" + height + " " + videoCodec[outputModes[j]['codec']];
        mode += "</option>";
      }
    }
    var select_disabled = "";
    var icon_mode = "";
    if (outputModes.length == 0 && inputModes.length == 0) {
      select_disabled = "disabled"
    } else {
      if (outputModes.length == 0 && inputModes.length != 0) {
        icon_mode = "input_modes"
      } else if (outputModes.length != 0 && inputModes.length == 0) {
        icon_mode = "output_modes"
      } else {
        icon_mode = "all_modes"
      }
    };
    $('.video_list').append("<li class=\"fixclear\"><span class=\"left icon " + icon_mode + "\"></span><ul class=\"left\"><li class=\"fixclear\"><div class=\"left\"><span class=\"name\" cam_type=\"" + devicesInfo[k].type + "\" local_id=\"" + devicesInfo[k].localID + "\" title=\"" + name + "\">" + name + "</span></div><div class=\"right\"><span language=\"channel\"></span><select name=\"channel\">" + option + "</select></div></li><li><span language=\"input_mode\"></span><select name=\"input_mode\" " + select_disabled + ">" + mode + "</select><span language=\"recfps\"></span><select name=\"fps\"><option value=\"10\">10fps</option><option value=\"12\">12fps</option><option value=\"15\">15fps</option><option value=\"16\">16fps</option><option value=\"18\">18fps</option><option value=\"20\">20fps</option><option value=\"24\">24fps</option><option value=\"25\">25fps</option><option value=\"30\">30fps</option><option value=\"33\">33fps</option><option value=\"36\">36fps</option><option value=\"40\">40fps</option><option value=\"45\">45fps</option><option value=\"48\">48fps</option><option value=\"50\">50fps</option><option value=\"60\">60fps</option><option value=\"72\">72fps</option><option value=\"75\">75fps</option><option value=\"80\">80fps</option><option value=\"90\">90fps</option><option value=\"96\">96fps</option><option value=\"100\">100fps</option><option value=\"108\">108fps</option><option value=\"120\">120fps</option></select><input type=\"checkbox\" name=\"aligned_fps\" id=\"aligned_fps_" + i + "\"><label for=\"aligned_fps_" + i + "\" language=\"aligned\"></label></li></ul></li>");
  }
  // 读取到设备,但aspro里面没有,新增设备
  for (var i = 0; i < devices.length; i++) {
    if (devices[i] != '') {
      var name = devicesInfo[k].type + ' ' + devicesInfo[k].localID + ' ' + '(' + devicesInfo[k].description + ')',
        inputModes = devicesInfo[k]['inputModes'],
        mode = '';
      for (var j in inputModes) {
        var width = inputModes[j]['size']['width'];
        var height = inputModes[j]['size']['height'];
        mode += "<option value=\"" + width + 'x' + height + videoCodec[inputModes[j]['codec']] + "\" input_width=\"" + width + "\" input_height=\"" + height + "\" input_codec=\"" + inputModes[j]['codec'] + "\">";
        mode += width + "x" + height + " " + videoCodec[inputModes[j]['codec']];
        mode += "</option>";
      }
      var option = '';
      $('a.channel').each(function (i) {
        option += "<option value=\"" + i + "\">" + $(this).text() + "</option>";
      })
      $('.video_list').append("<li class=\"fixclear\"><span class=\"left icon red\"></span><ul class=\"left\"><li class=\"fixclear\"><div class=\"left\"><span class=\"name\" cam_type=\"" + devicesInfo[k].type + "\" local_id=\"" + devicesInfo[k].localID + "\" title=\"" + name + "\">" + name + "</span></div><div class=\"right\"><span language=\"channel\"></span><select name=\"channel\"> " + option + "</select></div></li><li><span language=\"input_mode\"></span><select name=\"input_mode\">" + mode + "</select><span language=\"recfps\"></span><select name=\"fps\"><option value=\"10\">10fps</option><option value=\"12\">12fps</option><option value=\"15\">15fps</option><option value=\"16\">16fps</option><option value=\"18\">18fps</option><option value=\"20\">20fps</option><option value=\"24\">24fps</option><option value=\"25\">25fps</option><option value=\"30\">30fps</option><option value=\"33\">33fps</option><option value=\"36\">36fps</option><option value=\"40\">40fps</option><option value=\"45\">45fps</option><option value=\"48\">48fps</option><option value=\"50\">50fps</option><option value=\"60\">60fps</option><option value=\"72\">72fps</option><option value=\"75\">75fps</option><option value=\"80\">80fps</option><option value=\"90\">90fps</option><option value=\"96\">96fps</option><option value=\"100\">100fps</option><option value=\"108\">108fps</option><option value=\"120\">120fps</option></select><input type=\"checkbox\" name=\"aligned_fps\"><span language=\"aligned\"></span></li></ul></li>");
    };
  }
  for (var i in deviceIndex) {
    device2.splice(deviceIndex[i], 1, '');
  }
  // 没有读取到设备,但是aspro里面有的,icon变灰色
  for (var i in device2) {
    if (device2[i] != '') {
      // 获取到的设备得名称
      var deviceListName = device2[i].cam_type + ' ' + device2[i].local_id;
      // 没有读取到设备,但是aspro里面有的,icon变灰色
      var width = device2[i]['input_width'];
      var height = device2[i]['input_height'];
      var option = '';
      var aligned_fps_checked = device2[i]['aligned_fps'] == 'yes' ? 'checked' : '';
      $('a.channel').each(function (i) {
        option += "<option value=\"" + i + "\">" + $(this).text() + "</option>";
      })
      $('.video_list').append("<li class=\"fixclear\"><span class=\"left icon bcGray\"></span><ul class=\"left\"><li class=\"fixclear\"><div class=\"left\"><span class=\"name\" cam_type=\"" + device2[i].cam_type + "\" local_id=\"" + device2[i].local_id + "\" title=\"" + deviceListName + "\">" + deviceListName + "</span></div><div class=\"right\"><span language=\"channel\"></span><select name=\"channel\">" + option + "</select></div></li><li><span language=\"input_mode\"></span><select name=\"input_mode\" disabled><option value=\"" + width + 'x' + height + videoCodec[device2[i]['input_codec']] + "\" input_width=\"" + width + "\" input_height=\"" + height + "\" input_codec=\"" + device2[i]['input_codec'] + "\">" + width + "x" + height + " " + videoCodec[device2[i]['input_codec']] + "</option></select><span language=\"recfps\"></span><select name=\"fps\"  disabled><option value=\"" + device2[i]['fps'] + "\">" + device2[i]['fps'] + "fps</option></select><input type=\"checkbox\" name=\"aligned_fps\"  disabled " + aligned_fps_checked + "><span language=\"aligned\" class=\"disabled_a\"></span></li></ul><img src=\"video/img/del.png\" class=\"removevideoDevice right\"></li>");
      $('.video_list>li:last-child').find('[name=channel]').val(device2[i]['channel']);
      deviceListOrder.push(Number(i));
    }
  }
  //页面加载值更新
  $('.video_list>li').each(function () {
    if (!$(this).children('span.icon').hasClass('bcGray')) {
      var i = deviceListOrder[$(this).index()];
      var deviceListName = deviceList[i]['cam_type'] + deviceList[i]['local_id'];
      var deviceExistName = $(this).find('span.name').attr('cam_type') + $(this).find('span.name').attr('local_id');
      if (deviceListName == deviceExistName) {
        $(this).find('[name]').each(function () {
          var name = $(this).attr('name');
          if ($(this).attr('type') == 'checkbox') {
            $(this).attr('checked', deviceList[i][name] == 'yes');
          } else if (name == 'input_mode') {
            var value = "";
            if (deviceList[i]['mode'] == 2) { //仅在为输出模式时,输入模式隐藏
              value = "o:" + deviceList[i]['output_width'] + 'x' + deviceList[i]['output_height'] + videoCodec[deviceList[i]['output_codec']];
              if ($(this).parents("li.fixclear").find(".icon").hasClass("all_modes")) $(this).find("option.inputmode").hide();
              // 输出模式rec.fps禁用,aligned_fps禁用
              $(this).parent().find("[name=fps]").attr("disabled", true).prev().addClass("disabled_a");
              $(this).parent().find("[name=aligned_fps]").attr({
                "disabled": true,
                "checked": false
              }).next().addClass("disabled_a");
            } else { //其他模式下，输出模式隐藏
              value = "i:" + deviceList[i]['input_width'] + 'x' + deviceList[i]['input_height'] + videoCodec[deviceList[i]['input_codec']];
              if ($(this).parents("li.fixclear").find(".icon").hasClass("all_modes")) $(this).find("option.outputmode").hide();
            }
            $(this).val(value);
            if ($(this).val() == null) {
              if ($(this).parents("li.fixclear").find(".icon").hasClass("output_modes")) {
                $(this).val($(this).find("option[value^=o]").eq(0).attr("value"))
              } else {
                $(this).val($(this).find("option[value^=i]").eq(0).attr("value"))
              }
            };
            if (deviceList[i]['mode'] != 2) input_mode_change(this);
          } else {
            $(this).val(deviceList[i][name]);
          }
        })
        if (deviceList[i]['mode'] == '0') {
          $(this).children('span').addClass('bcRed');
        } else {
          $(this).children('span').addClass('bcGreen').html(deviceList[i]['mode'] == 1 ? "I" : "O");
        }
        if ($(this).find(".icon").hasClass("output_modes") || ($(this).find(".icon").hasClass("all_modes") && deviceList[i]['mode'] == 2)) {
          $(this).find("[language=input_mode]").attr("language", "output_mode")
        }
      }
    }
  })
  mapChannelChange();
  $('.video_list [language]').each(function () {
    var value = $(this).attr('language');
    $(this).text(biGetLanguage() == 1 ? en[value] : cn[value]);
  });
}
$('.video_list').on('click', '.removevideoDevice', function () {
  deviceList.splice(deviceListOrder[$(this).parent().index()], 1);
  $(this).parent().remove();
  setConfig();
})
//获取设备信息
$('[language=video_information]').click(function () {
  var versions = biGetNativeModuleVersions(3);
  var txt = "";
  if (versions == '') {
    txt = language == 1 ? '(NO)' : '(无)';
  } else {
    for (var i in versions) {
      txt += i + ': v' + versions[i] + "\n";
    }
  }
  biAlert(txt, "Message");
})
$('.video_list').on('change', '[name=input_mode]', function () {
  input_mode_change(this);
})
//输入模式改变，采集帧率禁用
function input_mode_change(obj) {
  //obj为[name=input_mode]下拉框
  if ($(obj).val().indexOf('H264') != -1 || $(obj).val().indexOf('H265') != -1) {
    $(obj).parent().find('[name =aligned_fps]').attr({
      'disabled': true,
      "checked": false
    }).next().addClass('disabled_a');
  } else {
    $(obj).parent().find('[name=aligned_fps]').attr('disabled', false).next().removeClass("disabled_a");
  }
}

/*------------------Channel Options------------------*/
// Channel name 改变，视频通道的值更新
$('.video_channel_list').on('blur', 'input.channelInput', function () {
  videoChannlChange(this);
})
$("body").keydown(function (e) {
  if (e.keyCode == 13) {
    videoChannlChange($(".channel_input"));
  }
})

function videoChannlChange(obj) {
  if ($(obj).val() != "" && $(obj).val().trim().length > 0) {
    $(obj).prev().text($(obj).val());
    var option = '';
    $('a.channel').each(function (i) {
      option += "<option value=\"" + i + "\">" + $(this).text() + "</option>";
    })
    $('.video_list select[name=channel]').each(function () {
      var i = deviceListOrder[$(this).parent().parent().parent().parent().index()];
      $(this).empty();
      $(this).html(option).val(deviceList[i]['channel']);
    })
    channelList[index][0]['name'] = $(".video_channel_list>li").eq(index).find(".channelInput").val();
    setConfig();
  }
  $(obj).prev().show();
  $(obj).removeClass("channel_input").hide();
}
//channel options > a cha/intrinsics/extrinsics/reset/switch 打开显示，更新数据
$('.video_channel_list').on('click', 'a', function () {
  intrinsics = false;
  var lang = $(this).attr('language');
  index = $(this).parent().parent().parent().attr('id');
  var param_name = channelList[index][0]['param_type'];
  switch (lang) {
    case 'cha': {
      $(this).hide();
      $(this).next().show().val($(this).text()).addClass("channel_input").focus().select();
      break;
    }
    case 'intrinsics': {
      var title = "";
      if (param_name == "fisheye") {
        title = language == 1 ? en["fisheye_intrinsics"] : cn["fisheye_intrinsics"];
      } else {
        title = language == 1 ? en["normal_camera_intrinsics"] : cn["normal_camera_intrinsics"];
      }
      biOpenChildDialog("video.intrinsics.html", title, new BISize(252, 502), index);
      intrinsics = true;
      break;
    }
    case 'extrinsics': {
      switch (param_name) {
        case 'normal':
        case "fisheye": {
          var title = "";
          if (param_name == "fisheye") {
            title = language == 1 ? en["fisheye_camera"] : cn["fisheye_camera"];
          } else {
            title = language == 1 ? en["normal_camera"] : cn["normal_camera"];
          }
          biOpenChildDialog("video.normal.html", title, new BISize(444, 356), index);
          break;
        }
        case 'bs': {
          var title = "";
          title = language == 1 ? en["blind_spot_camera"] : cn["blind_spot_camera"];
          biOpenChildDialog("video.bs.html", title, new BISize(356, 274), index);
          break;
        }
        case 'line': {
          var title = "";
          title = language == 1 ? en["lane_line_camera"] : cn["lane_line_camera"];
          biOpenChildDialog("video.line.html", title, new BISize(356, 180), index);
          break;
        }
      }
      break;
    }
    //点击reset,intrinsics/extrinsics的值恢复为默认值
    case 'reset': {
      biConfirm("reset," + index, reset_param, confirm)
      break;
    }
    case 'switch': {
      var title = language == 1 ? en["switch"] : cn["switch"];
      biOpenChildDialog("video.switch.html", title, new BISize(568,65), index);
      break;
    }
    default:
      return;
  }
  // $('[language]').each(function () {
  //   var value = $(this).attr('language');
  //   $(this).text(biGetLanguage() == 1 ? en[value] : cn[value]);
  // });
})

function biOnResultOfConfirm(key, result) {
  if (key.indexOf("reset") != -1) {
    var index = key.split(",")[1];
    if (result) {
      var param_type = channelList[index][0]["param_type"];
      if (param_type == 'fisheye') param_type = 'normal';
      $('.video_channel_list>li').eq(index).find("input[type=checkbox]").each(function () {
        var name = $(this).attr("name");
        if (name == "vertical_flip" || name == "inversion" || (name == "undistort" && channelList[index][0]["param_type"] == "fisheye")) {
          $(this).attr({
            "checked": false,
            "disabled": false
          }).next().removeClass("disabled_a");
        } else {
          $(this).attr({
            "checked": false,
            "disabled": true
          }).next().addClass("disabled_a");
        }
      })
      channelList[index][1] = {};
      biSetLocalVariable("video", JSON.stringify(channelList));
      //获取basic 和 rectify数据
      $('.video_channel_list>li').eq(index).find('input[type=checkbox]').each(function () {
        channelList[index][1][$(this).attr('name')] = $(this).is(':checked') ? 1 : 0;
      })
      setConfig();
    }
  }
}

function biOnClosedChildDialog(htmlName) {
  var old_param_name = channelList[index][0]["param_type"];
  if (Boolean(biGetLocalVariable("video")) && biGetLocalVariable("video") != "null") {
    channelList = JSON.parse(biGetLocalVariable("video"));
  }
  var new_param_name = channelList[index][0]["param_type"];
  if (htmlName == "video.switch.html") {
    if (old_param_name != new_param_name) {
      channelList[index][1] = {};
      $(".video_channel_list>li").eq(index).find("[name=inversion],[name=vertical_flip]").attr("checked", false);
    }
  }
  undistortDis(new_param_name, index);
  rectifyInputChange(index);
  setConfig();
}

//rectify input启用及选中条件
function rectifyInputChange(index) {
  if ($(".video_channel_list>li").eq(index).find("ul>li [name=undistort]").is(":checked")) {
    $(".video_channel_list>li").eq(index).find("ul>li:nth-child(3) input").prop({
      "disabled": true,
      "checked": false
    }).next().addClass('disabled_a');
    if (channelList[index][1]["special_hint"] != 0) {
      //roll
      if (channelList[index][1]["roll"] != 0 && Math.abs(channelList[index][1]["roll"]) <= 15) {
        $('.video_channel_list>li').eq(index).find("ul>li:nth-child(3)>input[name=rectify_roll]").prop("disabled", false).next().removeClass("disabled_a");
        if (channelList[index][1]["rectify_roll"] == 1) {
          $('.video_channel_list>li').eq(index).find("ul>li:nth-child(3)>input[name=rectify_roll]").prop("checked", true).next().removeClass("disabled_a");
        } else {
          channelList[index][1]["rectify_pitch"] = 0;
        }
      } else {
        channelList[index][1]["rectify_roll"] = 0;
      }
      //pitch
      if (channelList[index][1]["pitch"] != 0 && (channelList[index][1]["roll"] == 0 || channelList[index][1]["rectify_roll"] == 1) && Math.abs(channelList[index][1]["pitch"]) <= channelList[index][1]["hfov"] * 0.1) {
        $('.video_channel_list>li').eq(index).find("ul>li:nth-child(3)>input[name=rectify_pitch]").prop("disabled", false).next().removeClass("disabled_a");
        if (channelList[index][1]["rectify_pitch"] == 1) {
          $('.video_channel_list>li').eq(index).find("ul>li:nth-child(3)>input[name=rectify_pitch]").prop("checked", true);
        } else {
          channelList[index][1]["rectify_yaw"] = 0;
        }
      } else {
        channelList[index][1]["rectify_pitch"] = 0;
      }
      //yaw
      if (channelList[index][1]["yaw"] != 0 && (channelList[index][1]["pitch"] == 0 || channelList[index][1]["rectify_pitch"] == 1) && ((channelList[index][1]["pitch"] > -180 && channelList[index][1]["yaw"] <= Number(channelList[index][1]["hfov"] * 0.15) - 180) || (channelList[index][1]["yaw"] >= -Number(channelList[index][1]["hfov"] * 0.15) && channelList[index][1]["yaw"] <= Number(channelList[index][1]["hfov"] * 0.15)))) {
        $('.video_channel_list>li').eq(index).find("ul>li:nth-child(3)>input[name=rectify_yaw]").prop("disabled", false).next().removeClass("disabled_a");
        if (channelList[index][1]["rectify_yaw"] == 1) {
          $('.video_channel_list>li').eq(index).find("ul>li:nth-child(3)>input[name=rectify_yaw]").prop("checked", true);
        } else {
          $('.video_channel_list>li').eq(index).find("ul>li:nth-child(3)>input[name=rectify_yaw]").removeAttr("checked");
        }
      } else {
        channelList[index][1]["rectify_yaw"] = 0;
      }
    }
    $(".video_channel_list>li").eq(index).find("ul>li:nth-child(3) input").each(function () {
      channelList[index][1][$(this).attr('name')] = $(this).is(":checked") ? 1 : 0;
    })
  } else {
    disRectify(index);
  }
}
//undistort未勾选时，rectify所有禁用且取消勾选
function disRectify(i) {
  $(".video_channel_list>li#" + i + ">ul>li:nth-child(3)").find("input").prop("checked", false).attr("disabled", true).next("label").addClass("disabled_a");
  channelList[i][1]["rectify_roll"] = 0;
  channelList[i][1]["rectify_pitch"] = 0;
  channelList[i][1]["rectify_yaw"] = 0;
}

function undistortDis(param_name, index) {
  var obj = channelList[index][1];
  if (param_name == 'fisheye' || (obj["aspectratio"] != 1 && !isNaN(obj["aspectratio"]) || obj["k1"] != 0 && !isNaN(obj["k1"]) || obj["k2"] != 0 && !isNaN(obj["k2"]) || obj["k3"] != 0 && !isNaN(obj["k3"]) || obj["k4"] != 0 && !isNaN(obj["k4"]) || obj["k5"] != 0 && !isNaN(obj["k5"]) || obj["k6"] != 0 && !isNaN(obj["k6"]) || obj["p1"] != 0 && !isNaN(obj["p1"]) || obj["p2"] != 0 && !isNaN(obj["p2"]))) {
    $(".video_channel_list>li").eq(index).find("[name=undistort]").attr({
      "disabled": false,
      "checked": obj["undistort"] == 1
    }).next().removeClass("disabled_a")
  } else {
    $(".video_channel_list>li").eq(index).find("[name=undistort]").attr({
      'disabled': true,
      'checked': false
    }).next().addClass('disabled_a');
  }
}
//video_channel_list 下checkbox更改，改变list
$('.video_channel').on('change', 'input[type=checkbox]', function () {
  var name = $(this).attr('name');
  index = $(this).parent().parent().parent().index();
  channelList[index][1][name] = $(this).is(':checked') ? 1 : 0;
  if (name == "rectify_pitch" || name == "rectify_roll" || name == "rectify_yaw") {
    rectifyInputChange($(this).parent().parent().parent().index())
  } else if (name == "undistort") {
    if ($(this).is(":checked")) {
      rectifyInputChange($(this).parent().parent().parent().index())
    } else {
      disRectify(index);
    }
  }
  biSetLocalVariable("video", JSON.stringify(channelList));
  setConfig();
})

/*------------------Config------------------*/
//配置读取与存储 [type=number]值校正
$('.container').on('change', '[name]', function () {
  setConfig();
})
$('body').on('blur', '[type = number]', function () {
  $(this).val(compareVal(this, $(this).val()));
  setConfig();
})

function setConfig() {
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?>";
  text += "<root ";
  $('.general_settings input').each(function () {
    var key = $(this).attr('name');
    text += " " + key + "=\"" + (key == "hires_buffer_max_size" ? Number($(this).val()) * 1000000 : $(this).val()) + "\"";
  });
  text += "\>";
  // device
  for (var i in deviceList) {
    text += "<device ";
    for (var j in deviceList[i]) {
      text += j + "=\"" + deviceList[i][j] + "\" ";
    }
    text += " />";
  }
  // channel
  for (var i = 0; i < channelList.length; i++) {
    text += "<ch" + i + " ";
    for (var j in channelList[i][0]) {
      text += j + "=\"" + channelList[i][0][j] + "\" ";
    }
    text += ">";
    text += "<param "
    for (var j in channelList[i][1]) {
      text += j + "=\"1:" + channelList[i][1][j] + "\" ";
    }
    text += "/>"
    text += "</ch" + i + ">";
  }
  text += "</root>";
  biSetModuleConfig("video.system", text);
}

function compareVal(obj, val) {
  var step = $(obj).attr('step').length > 2 ? $(obj).attr('step').length - 2 : 0,
    newVal = 0;
  if (isNaN(val) || !Boolean(val)) {
    newVal = Number($(obj).attr('value'));
  } else {
    var v = Number(val);
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

function biOnInitEx(config, moduleConfigs) {
  language = biGetLanguage();
  for (var key in moduleConfigs) {
    channelList = [], deviceList = [];
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(moduleConfigs[key], "text/xml");
    var countrys = xmlDoc.getElementsByTagName('root');
    var rootAttr = countrys[0].attributes;
    //Genaral setting
    for (var i = 0; i < rootAttr.length; i++) {
      general_settings[rootAttr[i].nodeName] = rootAttr[i].nodeValue;
    }
    for (var k = 0; k < countrys[0].childNodes.length; k++) {
      //channel option
      if (countrys[0].childNodes[k].nodeName.indexOf('ch') != -1) {
        var obj = {};
        var arrConfig = [];
        var keys = countrys[0].childNodes[k].attributes;
        for (var n = 0; n < keys.length; n++) {
          obj[keys[n].nodeName] = keys[n].nodeValue;
        }
        arrConfig.push(obj, {});
        var param = countrys[0].childNodes[k].childNodes[0];
        for (var j = 0; j < param.attributes.length; j++) {
          var param_name = param.attributes[j].nodeName;
          var param_val = param.attributes[j].nodeValue;
          arrConfig[1][param_name] = param_val.substr(2, param_val.length - 1);
        }
        channelList.push(arrConfig);
      } else if (countrys[0].childNodes[k].nodeName.indexOf('device') != -1) {
        //video devices
        var obj = {};
        var keys = countrys[0].childNodes[k].attributes;
        for (var n = 0; n < keys.length; n++) {
          obj[keys[n].nodeName] = keys[n].nodeValue;
        }
        deviceList.push(obj);
      }
    }
    if (biGetLanguage() == 1) {
      $('[language]').each(function () {
        var value = $(this).attr('language');
        $(this).text(en[value])
      });
      reset_param = en["reset_param"];
      confirm = en["confirm"];
    } else {
      $('[language]').each(function () {
        var value = $(this).attr('language');
        $(this).text(cn[value])
      });
      reset_param = cn["reset_param"];
      confirm = cn["confirm"];
    }
  }
  loadConfig();
}

function loadConfig() {
  biQueryVideoDevicesInfo();
  for (var k in BIVideoCodec) {
    videoCodec.push(k);
  }
  $('.general_settings input[type=number]').each(function () {
    var name = $(this).attr("name");
    var val = general_settings[name];
    $(this).val(name == "hires_buffer_max_size" ? compareVal(this, val / 1000000) : val);
  })
  $('.video_channel_list>li').each(function () {
    var i = $(this).index();
    $(this).find('[name]').each(function () {
      var name = $(this).attr('name');
      if ($(this).is('a')) {
        if (channelList[i][0]['name'].trim().length > 0) $(this).text(channelList[i][0]['name']);
      } else if ($(this).attr('type') == 'checkbox') {
        if (channelList[i][1][name] == undefined) {
          $(this).attr({
            'disabled': true,
            'checked': false
          }).next().addClass('disabled_a');
        } else {
          var val = channelList[i][1][name];
          if (name == 'inversion' || name == 'vertical_flip') {
            $(this).attr('checked', val == 1 ? true : false);
          } else if (name == 'undistort') {
            undistortDis(channelList[i][0]['param_type'], i);
            if ($(this).is(":checked")) {
              rectifyInputChange(i);
            } else {
              disRectify(i);
            }
          }
        }
      }
    })
  })
  if (biGetRunningMode() == 1) {
    $('h5').show();
    $('.video_list').hide();
  } else {
    $('.video_list').show();
    $('.h5').show();
  };
}