var childIndex = 0,
  modules = [],
  reg = /^[A-Za-z][A-Za-z0-9-]{0,}$/im;

$('a[language=input_remove_sample]').on('click', function () {
  $('.sample_in button').attr('disabled', true).addClass("button_disabled");
  $('[language=add_sample]').removeAttr('disabled').removeClass("button_disabled");
  $('.sample_in .active').remove();
  changeVal();
})

$('.sample_in button').on('click', function () {
  var name = $(this).attr('language');
  switch (name) {
    case 'add_sample':
      var html = $('[name="protocal"]').val() + ($('[name=protocal_channel]').val() == -1 ? '' : '@' + $('[name=protocal_channel]').val());
      $('.sample_content').append('<p name="' + html + '" title="' + html + '">' + html + '</p>');
      $('.sample_content>p:last-child').addClass("active").siblings().removeClass("active");
      break;
    case 'reload_sample':
      $('.sample_in .active').eq(0).html($('[name="protocal"]').val() + ($('[name=protocal_channel]').val() == -1 ? '' : '@' + $('[name=protocal_channel]').val()));
      break;
  }
  $('.sample_in button').attr('disabled', true).addClass("button_disabled");
  changeVal();
})

$('[name=protocal]').on('input', function () {
  if ($(this).val() == '' || !reg.test($(this).val())) {
    $("[name=protocal]").addClass("red");
    $('[language = add_sample],[language="reload_sample"]').attr('disabled', true).addClass("button_disabled");
  } else {
    $("[name=protocal]").removeClass("red");
    var val = $(this).val() + ($('[name=protocal_channel]').val() == -1 ? '' : ('@' + $('[name=protocal_channel]').val()));
    if ($('.sample_content>p').length > 0) {
      var count = 0;
      $('.sample_content>p').each(function () {
        if (val == $(this).html()) count++;
      })
      if (count == 0) {
        if ($('.sample_in .active').html()) {
          $('.sample_in button').removeAttr('disabled').removeClass("button_disabled");
        } else {
          $('[language = add_sample]').removeAttr('disabled').removeClass("button_disabled");
        }
      } else {
        $('.sample_in button').attr('disabled', true).addClass("button_disabled");
      }
    } else {
      $('[language = add_sample]').removeAttr('disabled').removeClass("button_disabled");
    }
  }
})

$('[name="protocal_channel"]').change(function () {
  if ($('[name="protocal"]').val() == '' || !reg.test($('[name="protocal"]').val())) {
    $('[language = add_sample],[language="reload_sample"]').attr('disabled', true).addClass("button_disabled");
  } else {
    var val = $('[name=protocal]').val() + ($(this).val() == -1 ? '' : ('@' + $(this).val()));
    if ($('.sample_content>p').length > 0) {
      var count = 0;
      $('.sample_content>p').each(function () {
        if (val == $(this).html()) count++;
      })
      if (count == 0) {
        if ($('.sample_in .active').html()) {
          $('.sample_in button').removeAttr('disabled').removeClass("button_disabled");
        } else {
          $('[language = add_sample]').removeAttr('disabled').removeClass("button_disabled");
        }
      } else {
        $('.sample_in button').attr('disabled', true).addClass("button_disabled");
      }
    } else {
      $('[language = add_sample]').removeAttr('disabled').removeClass("button_disabled");
    }
  }
})

$('.sample_content').on('click', 'p', function () {
  var proVal = $(this).html().indexOf('@') == -1 ? $(this).html().length : $(this).html().indexOf('@');
  var chaVal = $(this).html().indexOf('@') == -1 ? -1 : $(this).html().substr($(this).html().indexOf('@') + 1);
  $(this).addClass('active').siblings().removeClass('active');
  $('[name=protocal]').val($(this).html().substr(0, proVal)).removeClass("red");
  $('[name = protocal_channel]').val(chaVal);
  $(".sample_in button").attr("disabled", true).addClass("button_disabled");
})

function changeVal() {
  var arr = [];
  for (var i = 0; i < $('.sample_content>p').length; i++) {
    arr.push($('.sample_content>p').eq(i).html());
  }
  modules[childIndex][1]['content']['sample_in'] = arr;
  biSetLocalVariable("python_script_samplein" + childIndex, JSON.stringify(modules[childIndex][1]['content']["sample_in"]));
  setConfig();
}

function loadConfig(config) {
  childIndex = config;
  var val = modules[childIndex][1]['content']["sample_in"];
  for (var i in val) {
    $('.sample_in .sample_content').append("<p title=\"" + val[i] + "\">" + val[i] + "</p>");
  }
  var params = modules[childIndex][0]["param"];
  if (Boolean(params) && params.length > 0) {
    for (var i in params) {
      $("[name=protocal_channel]").append("<option value=\"{" + params[i]["name"] + "}\">" + params[i]["name"] + "</option>")
    }
  }
  $(".sample_in button").attr("disabled", true).addClass("button_disabled");
  $('[name=default_val]').each(function () {
    isNaN(Number($(this).val())) ? $(this).addClass('red') : $(this).removeClass('red');
  })
}