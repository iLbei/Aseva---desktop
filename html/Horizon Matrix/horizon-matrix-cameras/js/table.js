var dialogIndex = 0, dialogConfig = [];
$('.table').on('click', 'input', function (e) {
  $('input').each(function () {
    $(this).removeClass('blue2');
  })
  $('.c-1').each(function () {
    $(this).removeClass('blue');
  })
  $(this).addClass('blue2');
})

$('.content').on('input', 'input', function (e) {
  editInput(this);
  setConfig();
  $(this).removeClass('blue2');
})

function biOnInitEx(config, moduleConfigs) {
  $('[language]').each(function () {
    var value = $(this).attr('language');
    $(this).html(biGetLanguage() == 1 ? en[value] : cn[value])
  });
  dialogIndex = config == 0 ? "" : config;
  for (var key in moduleConfigs) {
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(moduleConfigs[key], "text/xml");
    var obj = new Object();
    var root = xmlDoc.getElementsByTagName('root');
    var keys = root[0].attributes;
    for (var i = 0; i < keys.length; i++) {
      //获取root自身字节的属性
      obj[keys[i].nodeName] = keys[i].nodeValue;
    }
    dialogConfig.push(obj)
    if (root[0].childNodes.length > 0) {
      dialogConfig.push([[], [], [], []]);
      var child = root[0].childNodes;
      for (var i of child) {
        var keys = i.attributes;
        var obj = {};
        for (var j of keys) {
          obj[j.nodeName] = j.nodeValue;
        }
        switch (i.nodeName) {
          case "line_bound": {
            dialogConfig[1][0].push(obj);
            break;
          }
          case "line_bound1": {
            dialogConfig[1][1].push(obj);
            break;
          }
          case "line_bound2": {
            dialogConfig[1][2].push(obj);
            break;
          }
          case "line_bound3": {
            dialogConfig[1][3].push(obj);
            break;
          }
          default:
            break;
        }
      }
      var txt = "";
      for (var i = 0; i < dialogConfig[1][Number(config)].length; i++) {
        var o = dialogConfig[1][Number(config)][i];
        txt += "<div class=\"fixclear\">";
        txt += "<div class=\"c-1 left\" onclick=\"onClick(this)\"></div>";
        txt += "<div class=\"left\"><input type=\"text\" value=\"" + o["cam_id" + dialogIndex] + "\" name=\"cam_id\"></div>";
        txt += "<div class=\"left\"><input type=\"text\" value=\"" + o["rear" + dialogIndex] + "\" name=\"rear\"></div>";
        txt += "<div class=\"left\"><input type=\"text\" value=\"" + o["front" + dialogIndex] + "\" name=\"front\"></div>";
        txt += "</div>";
      }
      txt += "<div class=\"fixclear\">";
      txt += "<div class=\"c-1 left\" onclick=\"onClick(this)\"></div>";
      txt += "<div class=\"left\"><input type=\"text\" name=\"cam_id\"></div>";
      txt += "<div class=\"left\"><input type=\"text\" name=\"rear\"></div>";
      txt += "<div class=\"left\"><input type=\"text\" name=\"front\"></div>";
      txt += "</div>";
      $('.table>.bottom').html(txt);
    }
  }
}

function editInput(obj) {
  var element = $(obj).parent().parent().next()[0];
  if (!element) {
    var text = "<div class=\"fixclear\">";
    text += "<div class=\"c-1 left\" onclick=\"onClick(this)\"></div>";
    text += "<div class=\"left\"><input type=\"text\" name=\"cam_id\"></div>";
    text += "<div class=\"left\"><input type=\"text\" name=\"rear\"></div>";
    text += "<div class=\"left\"><input type=\"text\" name=\"front\"></div>";
    text += "</div>";
    $(obj).parent().parent().parent().append(text);
  }

}

function setConfig() {
  var index = dialogIndex == "" ? 0 : dialogIndex;
  if(!Boolean(dialogConfig[1])) dialogConfig[1]=[];
  dialogConfig[1][index] = [];
  $(".table>.bottom>div:not(:last-child)").each(function (i) {
    if ($(this).find("[name=cam_id]").val() != "" && $(this).find("[name=rear]").val() != "" && $(this).find("[name=front]").val() != "") {
      dialogConfig[1][index].push({});
      $(this).find("[name]").each(function () {
        var  name = $(this).attr("name") + dialogIndex;
        var  val = $(this).val();
        dialogConfig[1][index][i][name] = val;
      })
    };
  })
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root ";
  for (var i in dialogConfig[0]) {
    text += " " + i + "=\"" + dialogConfig[0][i] + "\"";
  }
  if (dialogConfig.length > 1) {
    text += ">"
    for (var i in dialogConfig[1]) {
      for (var j in dialogConfig[1][i]) {
        text += "<line_bound" + (i == 0 ? "" : i) + " ";
        for (var k in dialogConfig[1][i][j]) {
          text += k + "=\"" + dialogConfig[1][i][j][k] + "\" ";
        }
        text += "/>"
      }
    }
    text += "</root>";
  } else {
    text += "/>"
  }
  biSetModuleConfig("horizon-matrix-cameras.horizonmatrix", text);
}

function onClick(obj) {
  if ($(obj).hasClass('all')) {
    $(obj).addClass('flag');
    $('.bottom>div').each(function () {
      $(this).children().each(function () {
        if ($(this).hasClass('c-1')) {
          if (!$(this).hasClass('blue')) $(this).addClass('blue');
        } else {
          if (!$(this).hasClass('blue2')) $(this).children().addClass('blue2');
        }
      })
    });
  } else {
    $('.bottom>div').each(function () {
      $(this).children().each(function () {
        if ($(this).hasClass('c-1')) {
          if ($(this).hasClass('blue')) $(this).removeClass('blue');
        } else {
          if ($(this).children().hasClass('blue2')) $(this).children().removeClass('blue2');
        }
      })
    });
    $(obj).addClass('blue').nextAll().children().addClass('blue2');
  }

}
//监听键盘del键
$('body').keydown(function (event) {
  var e = event || window.event;
  if (e.keyCode == 46) {
    if ($('.all').hasClass('flag')) {
      var i = 0;
      while (i < $('.bottom').children().length - 1) {
        $('.bottom').children()[i].remove();
        i = 0;
      }
    } else {
      var flag = $('.blue').parent().next()[0];
      if (flag) $('.blue').parent().remove();
    }
  }
  setConfig();
})