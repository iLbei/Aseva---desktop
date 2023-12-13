var modules = [],
  childIndex = 0,
  regEn = /[\s+`~!@#$%^&*()_+<>?:"{},.\/;'[\]]/im,
  regCn = /[\s+·！#￥（——）：；“”‘、，|《。》？、【】[\]]/im,
  regNum = /[\u4e00-\u9fa5]/;

$('.scene_out>.table').on('click', 'ul>li>span', function (e) {
  if ($(this).parent().hasClass('blue') && $(this).parents('ul').find('.blue2').length == 0) {
    if ($(this).next().length != 0) {
      $(this).parent().removeClass('blue').siblings().removeClass('blue blue2');
      $(this).next().show().val($(this).html()).select();
      $(this).hide();
    }
  } else {
    $(this).parents('.table').find('li').removeClass('blue blue2').find('span').removeClass('white');
    $(this).addClass('white').parent().addClass('blue').siblings().removeClass('blue2');
  }
})

$('.scene_out>.table').on('input', 'input', function () {
  if ($(this).parent().parent().index() + 1 == $('.scene_out>.table>.table_content>ul').length) {
    $('.scene_out>.table>.table_content').append("<ul class=\"fixclear\"><li></li><li><span></span><input type=\"text\" name=\"id\" tabindex=-1></li><li><span></span><input type=\"text\" tabindex=-1></li></ul>");
  }
  $(this).prev().html($(this).val());
  changeVal();
})

$('.scene_out>.table>.table_content').on('click', 'ul>li:nth-child(1)', function () {
  $(this).addClass('blue2').siblings().addClass('blue');
  $(this).siblings().find('span').addClass('white');
  $(this).parent().siblings().find('span').removeClass('white');
  $(this).parent().siblings().find('li').removeClass('blue blue2');
})

$('.scene_out>.table>.table_content').on('blur', 'ul>li>input', function (e) {
  $(this).prev().show().removeClass('white').attr('title', $(this).val());
  $(this).hide();
})

$('body').keydown(function (event) {
  var e = event || window.event;
  if (e.keyCode == 46 && $(".blue2").parent().index() < $(".table_content>ul").length - 1) {
    $(".blue2").parent().remove();
    changeVal();
  }
});

function changeVal() {
  var arr = [];
  for (var i = 0; i < $('.scene_out .table_content>ul').length - 1; i++) {
    var out_sample_obj = {};
    var span = $('.scene_out .table_content>ul').eq(i).find('li').eq(1).find('span').html();
    if (span != '' && !regEn.test(span) && !regCn.test(span) && !regNum.test(span)) {
      out_sample_obj['id'] = span;
      out_sample_obj['val'] = $('.scene_out .table_content>ul').eq(i).find('li').eq(2).find('span').html();
      arr.push(out_sample_obj);
    };
  }
  modules[childIndex][1]['content']['scene_out'] = arr;
  biSetLocalVariable("python_script_sceneout" + childIndex, JSON.stringify(modules[childIndex][1]['content']["scene_out"]));
  setConfig();
}

function loadConfig(config) {
  childIndex = config;
  var val = modules[config][1]['content']["scene_out"];
  for (var i in val) {
    $('.scene_out .table_content').append("<ul class=\"fixclear\"><li></li><li><span title=\"" + val[i]['id'] + "\">" + val[i]['id'] + "</span><input type=\"text\" name=\"id\" tabindex=-1></li><li><span>" + (val[i]['val'] == undefined ? '' : val[i]['val']) + "</span><input type=\"text\" tabindex=-1></li></ul>");
  }
  $('.scene_out .table_content').append("<ul class=\"fixclear\"><li></li><li><span></span><input type=\"text\" name=\"id\"></li><li><span></span><input type=\"text\"></li></ul>");
}