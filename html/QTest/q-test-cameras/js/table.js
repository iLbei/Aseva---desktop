$('.table').on('click', 'input', function () {
  $('input').each(function () {
    $(this).removeClass('blue2');
  })
  $('.c-1').each(function () {
    $(this).removeClass('blue');
  })
  $(this).addClass('blue2');
})

$('.content').on('input', 'input', function () {
  editInput(this);
  var i = $(this).parent().parent().index();
  var cam_id = $("div.bottom>div:nth-child(" + i + ")>div:nth-child(2)>input").val();
  var rear = $("div.bottom>div:nth-child(" + i + ")>div:nth-child(3)>input").val();
  var front = $("div.bottom>div:nth-child(" + i + ")>div:nth-child(4)>input").val();
  dialogConfig[1][i] = { "cam_id": cam_id, "rear": rear, "front": front }
  changeVal();
  $(this).removeClass('blue2');
})

function loadConfig() {
  var txt = "";
  for (var i = 0; i < dialogConfig[1].length; i++) {
    var o = dialogConfig[1][i];
    txt += "<div class=\"fixclear\">";
    txt += "<div class=\"c-1 left\" onclick=\"onClick(this)\"></div>";
    txt += "<div class=\"left\"><input type=\"text\" value=\"" + o["cam_id"] + "\" name=\"cam_id\"></div>";
    txt += "<div class=\"left\"><input type=\"text\" value=\"" + o["rear"] + "\" name=\"rear\"></div>";
    txt += "<div class=\"left\"><input type=\"text\" value=\"" + o["front"] + "\" name=\"front\"></div>";
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

function changeVal() {
  dialogConfig[1]=[];
  $("div.bottom>div").each(function (i) {
    if ($(this).find("[name=cam_id]").val() != "" && $(this).find("[name=rear]").val() != "" && $(this).find("[name=front]").val() != "") {
      var obj = {};
      $(this).find("[name]").each(function () {
        var name = $(this).attr("name");
        var val = $(this).val();
        obj[name] = val
      })
      dialogConfig[1].push(obj) ;
    }
  })
  biSetLocalVariable("q-test-cameras-table",JSON.stringify(dialogConfig));
  setConfig();
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
  var i = $("div.blue").parent().index();
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
  if (i === -1) return;
  dialogConfig[1].splice(i, 1);
  biSetLocalVariable("q-test-cameras-table",JSON.stringify(dialogConfig));
  setConfig();
})