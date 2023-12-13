
$(function () {
  var i = $('.table>div>div').length;
  if (i == 1) {
    $('[name=connect]').removeAttr('checked');
    $('[name=connect]').attr("disabled", "disabled").next().addClass('disabled');
  } else {
    $('[name=connect]').attr("disabled", false).next().removeClass('disabled');
  }
})
$('[type=checkbox]').click(function () {
  $('.all').removeClass('flag');
  setConfig()
})
$('body').keydown(function (event) {
  var e = event || window.event;
  if (e.keyCode == 46) {
    if ($('.all').hasClass('flag')) {
      var i = 0;
      while (i < $('.table>div>div').length - 1) {
        $('.table>div>div')[i].remove();
        i = 0;
      }
      $('[name=connect]').removeAttr('checked');
      $('[name=connect]').attr("disabled", "disabled").next().addClass('disabled');
    } else {
      var obj = $('.blue2');
      if ($(obj).html() != undefined) {
        var next = $(obj).parent().next();
        if ($(next).html() != undefined) $(obj).parent().remove();

        var i = $('.table>div>div').length;
        if (i == 1) {
          $('[name=connect]').removeAttr('checked');
          $('[name=connect]').attr("disabled", "disabled").next().addClass('disabled');
        }
      }
    }
  }
  $('.all').removeClass('flag');
  setConfig();
})
$('#table').on('click', '.input>div:nth-child(1)', function () {
  onClick(this);
})
$('#table').on('click', '.input>div>input', function (e) {
  inputClick(this)
})
$('#table').on('keydown', 'input', function () {
  keyUp(this)
});
$('#table').on('input', '.table input', function () {
  setConfig();
  $(this).removeClass('blue')
})
$('#table').on('blur', '.table input[name="ip"]', function () {
  var count = 0;
  $('input[name="ip"]').each(function () { if ($(this).val() == "") { count++ } })
  if (count == $('.table>div>div').length) {
    $('[name="connect"]').attr('disabled', true).prop('checked', false).next().addClass('disabled')
  } else {
    $('[name="connect"]').attr('disabled', false).next().removeClass('disabled')
  }
})
/**
 * 表格最左边点击事件
 */
function onClick(obj) {
  if (!$(obj).hasClass('all')) {
    $('.select').each(function () {
      $(this).removeClass('blue2').siblings().children().removeClass('blue');
    });
    $(obj).addClass('blue2').siblings().children().addClass('blue');
    $('.all').removeClass('flag');
  } else {
    $('.table>div>div').each(function () {
      $(this).children("div:first-of-type").addClass('blue2');
      $(this).find('input').addClass('blue');
    });
    $(obj).addClass('flag');
  }
}
function keyUp(obj) {
  var val = "<div class=\"fixclear input\"><div onclick=\"onClick(this)\" class=\"select\"></div><div><input type=\"text\" name=\"ip\" id=\"\"></div><div><input type=\"text\" name=\"user\" id=\"\"></div><div><input type=\"text\" name=\"pass\" id=\"\"></div></div>";
  var flag = $(obj).parent().parent().next()[0];
  if (!flag) {
    $(obj).parents().find('.table>div').append(val);
  }
  $('.all').removeClass('flag');
}
function inputClick(obj) {
  $('[type=text]').each(function () {
    $(this).removeClass('blue');
  });
  $('.input>div').each(function () {
    $(this).removeClass('blue');
  });
  $(obj).addClass('blue').parent().removeClass('blue2')
  $('.select').each(function () {
    $(this).removeClass('blue2');
  });
  $('.all').removeClass('flag');
}
function removeBlue(obj) {
  $(obj).removeClass('blue')
}
function loadConfig(config) {
  if (config == null) return;
  config.connect == "yes" ? $('[type=checkbox]').attr('checked', true).prop('checked', true) : $('[type=checkbox]').removeAttr('checked');
  var arr = config.arr;
  $('.table>div').html("")
  for (var i = 0; i < arr.length; i++) {
    var v = arr[i];
    var config = "<div class=\"fixclear input\"><div onclick=\"onClick(this)\" class=\"select\"></div><div><input type=\"text\" value=\"" + v.ip + "\" name=\"ip\" id=\"\"></div><div><input type=\"text\" value=\"" + v.user + "\" name=\"user\" id=\"\"></div><div><input type=\"text\" value=\"" + v.pass + "\" name=\"pass\" id=\"\"></div></div>";
    $('.table>div').append(config);
  }
  var valLast = "<div class=\"fixclear input\"><div onclick=\"onClick(this)\" class=\"select\"></div><div><input type=\"text\" name=\"ip\" id=\"\"></div><div><input type=\"text\" name=\"user\" id=\"\"></div><div><input type=\"text\" name=\"pass\" id=\" \"></div></div>";
  $('.table>div').append(valLast);
  var i = $('.table>div>div').length;
  if (i == 1) {
    $('[name=connect]').removeAttr('checked');
    $('[name=connect]').attr("disabled", "disabled").next().addClass('disabled');
  } else {
    $('[name=connect]').attr("disabled", false).next().removeClass('disabled');
  }
}
function setConfig() {
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?>";
  var val = $('[type=checkbox]').get(0).checked == true ? "yes" : "no";
  text += "<root connect=\"" + val + "\" start_end_interval=\"20\">";
  $('.table>div>div:not(:last-of-type)').each(function () {
    text += "<addr";
    $(this).find('[name]').each(function () {
      var key = $(this).attr('name');
      text += " " + key + "=\"" + $(this).val() + "\"";
    });
    text += " />";
  });
  text += "</root>";
  biSetModuleConfig("hanwha-camera.hanwhacamera", text);
}
function biOnInitEx(config, moduleConfigs) {
  $('[language]').each(function () {
    var value = $(this).attr('language');
    $(this).html(biGetLanguage() == 1 ? en[value] : cn[value])
  });
  for (var key in moduleConfigs) {
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(moduleConfigs[key], "text/xml");
    var countrys = xmlDoc.getElementsByTagName('root');
    var keys = countrys[0].attributes;
    var obj = new Object();
    for (var i = 0; i < keys.length; i++) {
      obj[keys[i].nodeName] = keys[i].nodeValue;
    };
    var arr2 = [];
    for (var i = 0; i < countrys[0].childNodes.length; i++) {
      var keyss = countrys[0].childNodes[i].attributes;
      var o = new Object();
      for (var n = 0; n < keyss.length; n++) {
        o[keyss[n].nodeName] = keyss[n].nodeValue;
      };
      arr2.push(o);
    }
    obj.arr = arr2;
    loadConfig(obj);
  }
}
