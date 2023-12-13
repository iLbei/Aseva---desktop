var childIndex = 0,
  modules = [],
  reg = /^[A-Za-z_][A-Za-z_0-9]{0,}$/im;

// language
$('a').on('click', function () {
  var name = $(this).attr('language');
  switch (name) {
    case 'output_add_sample':
      $('.out>div').append("<div class=\"out_list fixclear\"><span language=\"in_param_name\" class=\"red left\" ></span><input type=\"text\" name=\"param\" class=\"right\"></div>");
      $('.out>div>div').eq($('.out>div>div').length - 1).addClass('bdBlack').siblings().removeClass('bdBlack');
      $('[language]').each(function () {
        var value = $(this).attr('language');
        $(this).text(biGetLanguage() == 1 ? en[value] : cn[value]);
      });
      break;
    case 'output_remove_sample':
      if (Boolean(modules[childIndex][1]['content']["out"][2])) {
        modules[childIndex][1]['content']["out"].splice($('.bdBlack').index(), 1);
      }
      $('.bdBlack').remove();
      changeVal();
      break;
    default:
      return;
  }
})

$('.out').on('click', '.out_list', function () {
  $(this).addClass('bdBlack').siblings().removeClass('bdBlack');
})
$('.out').on('input', 'input', function () {
  $(this).val() != '' ? $(this).prev().removeClass('red') : $(this).prev().addClass('red');
  if (reg.test($(this).val())) {
    $(this).removeClass('red').addClass("green").attr("value", $(this).val());
  } else {
    $(this).addClass('red').removeClass("green");
  }
  modules[childIndex][1]['content']["out"] = [];
  $(".out>div>div").each(function (i) {
    if (!$(this).find("[name=param]").hasClass("red") && !$(this).find("[language=in_param_name]").hasClass("red")) {
      modules[childIndex][1]['content']["out"][i] = {
        "param": $(this).find("[name=param]").attr("value")
      };
    }
  })
  changeVal();
}).on('blur', 'input', function () {
  if ($(this).hasClass("red")) $(this).val($(this).attr("value")).removeClass("red").addClass("green");
  if ($(this).val().trim().length != 0) {
    $(this).prev().removeClass("red");
  } else {
    $(this).prev().addClass("red");
  }
})

function changeVal() {
  biSetLocalVariable("python_script_out" + childIndex, JSON.stringify(modules[childIndex][1]['content']["out"]));
  setConfig();
}

function loadConfig(index) {
  childIndex = index;
  var val = modules[index][1]['content']["out"];
  for (var i in val) {
    $('.out>div').append("<div class=\"out_list fixclear\"><span language=\"in_param_name\" class=\"left\"></span><input type=\"text\" name=\"param\" value=\"" + val[i]['param'] + "\" class=\"right\"></div>");
    $('.out>div>div').eq(i).find("[name=param]").addClass(reg.test(val[i]['param']) ? "green" : "red");
  }
  var lang = biGetLanguage() == 1 ? en : cn;
  $('[language]').each(function () {
    var value = $(this).attr('language');
    $(this).text(lang[value]);
  });
}