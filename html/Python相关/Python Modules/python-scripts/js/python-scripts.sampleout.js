var text,
  modules = [],
  childIndex = 0,
  reg = /^[A-Za-z][A-Za-z0-9-]{0,}$/im;

//选中一行删掉一行
$('body').keydown(function (event) {
  var e = event || window.event;
  if (e.keyCode == 46) {
    if ($('.blue2').parents().hasClass('sample_out') && $('[name="output_protocal"]').val() != '') {
      $('[language="output_add_sample"]').removeAttr('disabled').removeClass("disabled_background");
    }
    $('.blue2').parent().remove();
    changeVal();
  }
});

//选中输出通道别名，protocal和channel获取到值并改变
$('.sample_out>.table>.table_content').on('click', 'ul>li:nth-child(1)', function () {
  $(this).addClass('blue2').siblings().addClass('blue');
  $(this).siblings().find('span').addClass('white');
  $(this).parent().siblings().find('span').removeClass('white');
  $(this).parent().siblings().find('li').removeClass('blue blue2');
  var text = $(this).next().find('span').html();
  var proVal = text.indexOf('@') == -1 ? text.length : text.indexOf('@');
  var chaVal = text.indexOf('@') == -1 ? -1 : text.substr(text.indexOf('@') + 1);
  // if (chaVal.indexOf("{") != -1 && chaVal.indexOf("}") != -1) {
  //   chaVal = chaVal.replace(/{|}/g, "");
  // }
  $('[name=output_protocal]').val(text.substr(0, proVal)).removeClass("red");
  $('[name = output_protocal_channel]').val(chaVal);
  $("button").addClass("disabled_background").attr("disabled", true);
})

$('.sample_out>.table>.table_content').on('click', 'ul>li>span', function () {
  if ($(this).parent().hasClass('blue') && $(this).parents('ul').find('.blue2').length == 0) {
    if ($(this).next().length != 0) {
      $(this).parent().removeClass('blue').siblings().removeClass('blue blue2');
      $(this).next().removeAttr('maxlength').show().val($(this).html()).select();
      $(this).hide();
    }
  } else {
    $(this).parents('.table').find('li').removeClass('blue blue2');
    $(this).parents('.table').find('span').removeClass('white');
    $(this).addClass('white').parent().addClass('blue').siblings().removeClass('blue2');
  }
})

$('.sample_out>.table>.table_content').on('blur', 'ul>li>input', function () {
  $(this).prev().show().html($(this).val()).removeClass('white').attr('title', $(this).val());
  $(this).hide().attr('maxlength', 0);
  changeVal();
})
//添加/更新样本
$('.sample_out button').on('click', function () {
  var name = $(this).attr('language');
  switch (name) {
    case 'output_add_sample': //添加
      var html = $('[name="output_protocal"]').val() + ($('[name=output_protocal_channel]').val() == -1 ? '' : '@' + $('[name=output_protocal_channel]').val());
      var val = "<ul class=\"fixclear\"><li class=\"select\"></li><li><span title=\"" + html + "\" id=\"" + html + "\">" + html + "</span></li><li><span title=\"Unnamed Sample\" name=\"name\">Unnamed Sample</span><input type=\"text\" tabindex=-1></li><li><span></span> <input type=\"text\" class=\"text\" tabindex=-1></li></ul>";
      $(this).parents('.sample_out').find('.table>.table_content').append(val);
      break;
    case 'output_reload_sample': //更新
      var text = $('[name="output_protocal"]').val() + ($('[name=output_protocal_channel]').val() == -1 ? '' : '@' + $('[name=output_protocal_channel]').val());
      $('.sample_out .blue2').next().html("<span title=\"" + text + "\">" + text + "</span>");
      break;
  }
  $('.sample_out button').attr('disabled', true).addClass("disabled_background");
  changeVal();
})

$('[name=output_protocal]').on('input', function () {
  if ($(this).val() == '' || !reg.test($(this).val())) {
    $("[name=output_protocal]").addClass("red");
    $('[language = output_add_sample],[language="output_reload_sample"]').attr('disabled', true).addClass("disabled_background");
  } else {
    $("[name=output_protocal]").removeClass("red");
    var val = $(this).val() + ($('[name=output_protocal_channel]').val() == -1 ? '' : ('@' + $('[name=output_protocal_channel]').val()));
    if ($('.sample_out>.table>.table_content>ul').length > 0) {
      var count = 0,
        selectCount = 0;
      $('.sample_out>.table>.table_content>ul>li:nth-child(2)>span').each(function () {
        if (val == $(this).html()) count++;
      })
      $('.sample_out>.table>.table_content>ul>li:nth-child(1)').each(function () {
        if ($(this).hasClass('blue2')) selectCount++;
      })
      if (count == 0) {
        $('[language = output_add_sample]').removeAttr('disabled').removeClass("disabled_background");
        if (selectCount != 0) $('[language="output_reload_sample"]').removeAttr('disabled').removeClass("disabled_background");
      } else {
        $('.sample_out button').attr('disabled', true).addClass("disabled_background");
      }
    } else {
      $('[language = output_add_sample]').removeAttr('disabled').removeClass("disabled_background");
    }
  }
})

$('[name="output_protocal_channel"]').change(function () {
  if ($('[name="output_protocal"]').val() == '' || !reg.test($('[name="output_protocal"]').val())) {
    $('[language = output_add_sample],[language="output_reload_sample"]').attr('disabled', true).addClass("disabled_background");
  } else {
    var val = $('[name=output_protocal]').val() + ($(this).val() == -1 ? '' : ('@' + $(this).val()));
    if ($('.sample_out>.table>.table_content>ul').length > 0) {
      var count = 0,
        selectCount = 0;
      $('.sample_out>.table>.table_content>ul>li:nth-child(2)>span').each(function () {
        if (val == $(this).html()) count++;
      })
      $('.sample_out>.table>.table_content>ul>li:nth-child(1)').each(function () {
        if ($(this).hasClass('blue2')) selectCount++;
      })
      if (count == 0) {
        $('[language = output_add_sample]').removeAttr('disabled').removeClass("disabled_background");
      } else {
        $('[language = output_add_sample]').attr('disabled', true).addClass("disabled_background");
      }
      if (val != $('.blue2').next().html() && selectCount != 0 && count == 0) {
        $('.sample_out [language=output_reload_sample]').removeAttr('disabled').removeClass("disabled_background");
      } else {
        $('.sample_out [language=output_reload_sample]').attr('disabled', true).addClass("disabled_background");
      }
    } else {
      $('[language = output_add_sample]').removeAttr('disabled').removeClass("disabled_background");
    }
  }
})

function changeVal() {
  var arr = [];
  for (var i = 0; i < $('.sample_out .table_content>ul').length; i++) {
    var out_sample_obj = {};
    out_sample_obj['id'] = $('.sample_out .table_content>ul').eq(i).find('li').eq(1).find('span').html();
    out_sample_obj['name'] = $('.sample_out .table_content>ul').eq(i).find('li').eq(2).find('span').html();
    out_sample_obj['val'] = $('.sample_out .table_content>ul').eq(i).find('li').eq(3).find('span').html();
    arr.push(out_sample_obj);
  }
  modules[childIndex][1]['content']['sample_out'] = arr;
  biSetLocalVariable("python_script_sampleout" + childIndex, JSON.stringify(modules[childIndex][1]['content']["sample_out"]));
  setConfig();
}

function loadConfig(config) {
  childIndex = config;
  var val = modules[config][1]['content']["sample_out"];
  for (var i in val) {
    for (var k in val[i]) {
      if (val[i][k] == undefined || val[i][k] == '') val[i][k] == '';
    }
    if (val[i]['val'] == "undefined" || val[i]['val'] == undefined || val[i]['val'] == '') val[i]['val'] = '';
    $('.sample_out .table_content').append("<ul class=\"fixclear\"><li class=\"select\"></li><li><span title=\"" + val[i]['id'] + "\" id=\"" + val[i]['id'] + "\">" + val[i]['id'] + "</span></li><li><span title=\"" + val[i]['name'] + "\" name=\"name\">" + val[i]['name'] + "</span><input type=\"text\" tabindex=-1></li><li><span>" + val[i]['val'] + "</span> <input type=\"text\" class=\"text\" tabindex=-1></li></ul>");
  }
  var params = modules[config][0]["param"];
  if (Boolean(params) && params.length > 0) {
    for (var i in params) {
      $("[name=output_protocal_channel]").append("<option value=\"{" + params[i]["name"] + "}\">" + params[i]["name"] + "</option>")
    }
  }
  $('[name=default_val]').each(function () {
    isNaN(Number($(this).val())) ? $(this).addClass('red') : $(this).removeClass('red');
  })
}