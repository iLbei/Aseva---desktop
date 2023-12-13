var empty = '';
$('[name]').change(function () {
  setConfig();
});
$('[name="savepath"]').click(function () {
  biSelectPath("savepath", BISelectPathType.Directory, null);
})
function loadConfig(config) {
  if (config == null) return;
  //多选框和单选框
  $('input').each(function () {
    var type = $(this).attr('type');
    var name = $(this).attr('name');
    if (type == 'checkbox' && name != "channelFiltering") {
      config[name] == 1 ? $(this).attr('checked', true) : $(this).removeAttr('checked');
    }
  })
  //radio
  $("[name=format][value=" + config["format"] + "]").prop("checked", true);
  var channelFiltering = config['channelFiltering'].split(",");
  //channel filtering
  $('[name =channelFiltering]').prop('checked', false);
  for (var j of channelFiltering) {
    if (j != "") $('#' + j).prop("checked", true);
  }
  //empty
  let path = "";
  if (config['savepath'] == '') {
    path = empty;
  } else {
    path = config['savepath'].substring(0, config['savepath'].length - 1);
    $('[name=savepath]').attr("title", path).addClass('green');
  }
  $('[name=savepath]').text(path);
}
function setConfig() {
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root";
  $('input').each(function () {
    var name = $(this).attr('name');
    if ($(this).attr("type") == "checkbox" && name != "channelFiltering") {
      text += " " + name + "=\"" + ($(this).is(':checked') ? 1 : 0) + "\"";
    }
  })
  //radio
  text += " format" + "=\"" + $("[name=format]:checked").attr("value") + "\"";
  // channelFilter
  var channelFiltering = "";
  $("[name =channelFiltering]").each(function () {
    if ($(this).is(":checked")) channelFiltering += $(this).attr("id") + ',';
  })
  text += " channelFiltering=\"" + channelFiltering.substr(0, channelFiltering.length - 1) + "\"";
  //a
  var savepath = $('[name="savepath"]').text();
  text += " savepath=\"" + (savepath.indexOf(empty) != -1 ? '' : savepath + (/^[a-zA-Z]:/.test(savepath) ? '\\' : '\/')) + "\"";
  text += "/>";
  biSetModuleConfig("export-as-pcd.aspluginpcdexport", text);
}
function biOnSelectedPath(key, path) {
  if (path == null) {
    $('[name=savepath]').text(empty).removeAttr("title").removeClass('green');
  } else {
    $('[name=savepath]').html(path).attr("title", path).addClass('green');
  }
  setConfig();
}
function biOnInitEx(config, moduleConfigs) {
  biSetViewSize(424, 169);
  $('[language]').each(function () {
    var value = $(this).attr('language');
    if (biGetLanguage() == 1) {
      empty = "<Empty>";
      $(this).html(en[value]);
    } else {
      empty = "<空>";
      $(this).html(cn[value]);
    }
  });
  for (var key in moduleConfigs) {
    var parser = new DOMParser();//创建一个空的xml文档对象
    var xmlDoc = parser.parseFromString(moduleConfigs[key], "text/xml");//把名为modeleConfigs的字符串载入到解析器中
    var countrys = xmlDoc.getElementsByTagName('root');//获取setconfig里面的root标签
    var keys = countrys[0].attributes;//获取root标签的属性名
    var obj = new Object();
    for (var i = 0; i < keys.length; i++) {
      obj[keys[i].nodeName] = keys[i].nodeValue;
    }
    loadConfig(obj);
  }
}