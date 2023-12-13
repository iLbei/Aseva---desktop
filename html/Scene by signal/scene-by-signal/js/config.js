var boxIndex = -1; //记录box下标
var dialogConfig = [];
var opt = ["=", "<", ">=", ">", "<=", "!="];
var not_config = "";
var dialogConfig = [];
class Property {
  constructor(key, value) {
    this.key = key;
    this.value = value;
  }
}

$('.edit_scene [name=name]').on('input', function () {
  var val = $(this).val();
  $(this).parent().next().find('#id').text(val.toLowerCase());
});

//关闭
function closeEditScene() {
  $('.edit_scene').find('[name=name]').val('Unknown scene');
  $('.edit_scene').find('#id').text('unknown scene');
  $('.shadow').hide();
  $('.edit_scene').hide();
  setConfig();
}

//openConfig
function openConfig(obj) {
  boxIndex = $(obj).parent().parent().parent().parent().index();
  var box = dialogConfig[boxIndex - 1];
  var arr = box.arr;
  for (var i = 0; i < arr.length; i++) {
    var property = arr[i];
    $tableBox = $('.config>.content>.table>.body>div:first-of-type').clone(true);
    $tableBox.find('[name=key]').val(property.key);
    $tableBox.find('[name=value]').val(property.value);
    $('.config>.content>.table>.body>div:last-of-type').before($tableBox[0]);
  }
  $('.shadow').show();
  $('.config').show();
}

//ok
function configOK() {
  var arr = [];
  var len = $('.config>.content>.table>.body>div').length;
  var flag = false;
  $('.config>.content>.table>.body>div').each(function (i) {
    if (i != 0 && i < len) {
      var key = $(this).find('[name=key]').val();
      var value = $(this).find('[name=value]').val();
      if ($(this).find('[name=key]').hasClass('red')) {
        flag = true;
        return
      }
      if (key != "" && value != "" && !$(this).find('[name=key]').hasClass('red')) {
        var property = new Property(key, value);
        arr.push(property);
      }
    }
  });
  if (flag) {
    var language = biGetLanguage();
    var txt = language == 1 ? "The Key should not be repeat." : "Key不应该重复.";
    var t = language == 1 ? "Error" : "错误";
    biAlert(txt, t);
    return
  }
  dialogConfig[boxIndex].arr = arr;
  setConfig();
  biCloseChildDialog();
}

var busChannelKeyArr = [],
  busChannelArr = [];
/**
 * 加载配置
 */
function loadConfig() {
  var arr = dialogConfig[boxIndex].arr;
  for (var i = 0; i < arr.length; i++) {
    var property = arr[i];
    $tableBox = $('.config>.content>.table>.body>div:first-of-type').clone(true);
    $tableBox.find('[name=key]').val(property.key);
    $tableBox.find('[name=value]').val(property.value);
    $('.config>.content>.table>.body>div:last-of-type').before($tableBox[0]);
  }
}

/**
 * 写配置
 */
function setConfig() {
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root>";
  for (var i in dialogConfig) {
    text += "<s "
    for (var j in dialogConfig[i]) {
      if (j != "arr") {
        text += j + "=\"" + dialogConfig[i][j] + "\" ";
      }
    }
    if (dialogConfig[i]["arr"].length > 0) {
      text += ">";
      for (var j in dialogConfig[i]["arr"]) {
        text += "<property key=\"" + dialogConfig[i]["arr"][j].key + "\" value=\"" + dialogConfig[i]["arr"][j].value + "\" />";
      }
      text += "</s>";

    } else {
      text += "/>";
    }
  }
  text += "</root>";
  biSetLocalVariable("scene-by-signal", JSON.stringify(dialogConfig));
  biSetModuleConfig("scene-by-signal.system", text);
}
//gridview    
function selectOneRow(obj) {
  $('.config>.content>.table>.body>div').each(function () {
    $(this).children('div:first-of-type').removeClass('blue2');
    $(this).find('input').removeClass('blue1');
  });
  $('.config>.content>.table>.top>div:first-of-type').removeClass('all');
  $(obj).addClass('blue2');
  $(obj).next().children().addClass('blue1');
  $(obj).next().next().children().addClass('blue1');
}
//监听键盘del键
$('body').keydown(function (event) {
  var e = event || window.event;
  if (e.keyCode == 46) {
    if ($('.config>.content>.table>.top>div:first-of-type').hasClass('all')) {
      var i = 1;
      while (i < $('.config>.content>.table>.body>div').length - 1) {
        $('.config>.content>.table>.body>div')[i].remove();
        i = 1;
      }
    } else {
      if ($('.blue2').parent().next().text() != undefined) {
        $('.blue2').parent().remove();
      }
    }
  }
});

function wipeBlue(obj) {
  $(obj).parent().parent().children('div:first-of-type').removeClass('blue2');
  $(obj).parent().parent().children('div:nth-of-type(2)').children().removeClass('blue1');
  $(obj).parent().parent().children('div:nth-of-type(3)').children().removeClass('blue1');
}

function selectAll() {
  $('.config>.content>.table>.body>div').each(function (i, v) {
    if (i != 0) {
      $(this).children('div:first-of-type').addClass('blue2');
      $(this).find('input').addClass('blue1');
    }
  });
  $('.config>.content>.table>.top>div:first-of-type').addClass('all');
}

function keyPress(obj) {
  var parent = $(obj).parent().parent();
  if ($(parent).next().length == 0) {
    $tableBox = $('.config>.content>.table>.body>div:first-of-type').clone(true);
    $('.config>.content>.table>.body').append($tableBox[0]);
  }
  var len = $('.config>.content>.table>.body>div').length;
  for (var i = 1; i < len - 1; i++) {
    var div = $('.config>.content>.table>.body>div:eq(' + i + ')');
    var m = $(div).find('[name=key]').val();
    var flag = false;
    for (var j = 1; j < len - 1 && j != i; j++) {
      var div2 = $('.config>.content>.table>.body>div:eq(' + j + ')');
      var n = $(div2).find('[name=key]').val();
      if (m == n && m != "") {
        $(div).find('[name=key]').addClass('red');
        $(div2).find('[name=key]').addClass('red');
        flag = true;
        break;
      }
    }
    if (!flag) $(div).find('[name=key]').removeClass('red');
  }
}

function biOnInitEx(config, moduleConfigs) {
  boxIndex = Number(config);
  var lang = biGetLanguage() == 1 ? en : cn;
  $('[language]').each(function () {
    var value = $(this).attr('language');
    $(this).text(lang[value])
  });
  not_config = lang["not_config"];
  for (var key in moduleConfigs) {
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(moduleConfigs[key], "text/xml");
    var countrys = xmlDoc.getElementsByTagName('root');
    for (var i = 0; i < countrys[0].childNodes.length; i++) {
      var keyss = countrys[0].childNodes[i].attributes;
      var obj = new Object();
      for (var j = 0; j < keyss.length; j++) {
        obj[keyss[j].nodeName] = keyss[j].nodeValue;
      }
      var array = [];
      for (var j = 0; j < countrys[0].childNodes[i].childNodes.length; j++) {
        var keysss = countrys[0].childNodes[i].childNodes[j].attributes;
        var object = new Object();
        for (var k = 0; k < keysss.length; k++) {
          object[keysss[k].nodeName] = keysss[k].nodeValue;
        }
        array.push(object);
      }
      obj.arr = array;
      dialogConfig.push(obj);
    }
    loadConfig(dialogConfig);
  }
}