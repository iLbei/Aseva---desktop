$('[name]').on('change', function () {
  var quality = $('[name=quality]:checked').val();
  biSetGlobalParameter('System.OnlineWriteAudioQuality', quality);
});
function biOnQueriedGlobalParameter(id, value) {
  $("[name]").each(function () {
    if ($(this).val() == value) {
      $(this).prop("checked", true)
    }
  })
}
function biOnInitEx(config, moduleConfigs) {
  $('[language]').each(function () {
    var value = $(this).attr('language');
    $(this).html(biGetLanguage() == 1 ? en[value] : cn[value]);
  });
  biQueryGlobalParameter('System.OnlineWriteAudioQuality', 'normal');
}