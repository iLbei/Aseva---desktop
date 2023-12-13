var busList = [],
  chList = [],
  bds = [],
  validation = {},
  bdsI = '';
$('.validation_parameters').on('input', 'input[type=number]', function () {
  $(this).attr("value", compareVal(this, $(this).val()));
  validation[$(this).attr("name")] = $(this).attr("value");
  biSetLocalVariable("bus-validation", JSON.stringify(validation));
})
$('.validation_parameters').on('blur', 'input[type=number]', function () {
  $(this).val($(this).attr("value"));
  $(this).next().text('0x' + Number($(this).val()).toString(16));
})
$("[name]").change(function () {
  var val = 0;
  var type = $(this).attr("type");
  if (type == "checkbox") {
    val = $(this).is(":checked") ? "yes" : "no"
  } else if (type == "number") {
    val = $(this).attr("value");
  }
  validation[$(this).attr("name")] = val;
  biSetLocalVariable("bus-validation", JSON.stringify(validation));
})

function biOnInitEx(config, moduleConfigs) {
  var lang = biGetLanguage() == 1 ? en : cn;
  $('[language]').each(function () {
    var value = $(this).attr('language');
    $(this).text(lang[value]);
  })
  validation = JSON.parse(config);
  $('.validation_parameters [name]').each(function () {
    var name = $(this).attr('name');
    if (validation[name] == undefined) {
      validation[name] = "";
    } else {
      var type = $(this).attr('type');
      var val = validation[name];
      if (type == 'number') {
        $(this).val(compareVal(this, val)).attr("value", compareVal(this, val)).next().text('0x' + Number(!val ? 0 : compareVal(this, val)).toString(16));
      } else if (type == 'checkbox') {
        $(this).prop('checked', val == 'yes');
      }
    }
  })
}

function compareVal(obj, val) {
  var step = $(obj).attr('step').length > 2 ? $(obj).attr('step').length - 2 : 0,
    v = Number(val),
    newVal = 0;
  if (isNaN(v)) {
    newVal = Number($(obj).attr('value'));
  } else {
    var min = Number($(obj).attr('min')),
      max = Number($(obj).attr('max'));
    v = v < min ? min : v;
    v = v > max ? max : v;
    newVal = Math.round(Math.abs(v) * Math.pow(10, step)) / Math.pow(10, step);
    if (v < 0) newVal = -newVal;
  }
  return newVal.toFixed(step);
}