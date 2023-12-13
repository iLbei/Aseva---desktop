$("input").on("keydown", function (e) {
  e.preventDefault();
}).on("input", function () {
  if (Number($("[name=upper]").val()) < Number($("[name=lower]").val())) {
    $(this).siblings("input").val($(this).val());
  }
})

$("button").click(function(){
  var val = {"freq":$("[name=freq]").val(),"upper":$("[name=upper]").val(),"lower":$("[name=lower]").val()};
  biSetLocalVariable("Audio-analysis-add",JSON.stringify(val));
  biCloseChildDialog();
})


function biOnInitEx(config, moduleConfigs) {
  var language = biGetLanguage() == 1 ? en : cn;
  $('[language]').each(function () {
    var value = $(this).attr('language');
    $(this).text(language[value])
  });
}