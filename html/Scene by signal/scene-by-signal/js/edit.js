var boxIndex = -1; //记录box下标
var dialogConfig = [];
var reg = /[a-zA-Z0-9-]$/im;
//ok
function editSceneOK() {
  var name = $('.edit_scene').find('[name=name]').val();
  var id = $('.edit_scene').find('#id').text();
  dialogConfig[boxIndex].name = name;
  dialogConfig[boxIndex].id = id;
  setConfig();
  biCloseChildDialog();
}

/**
 * 加载配置
 */
function loadConfig() {
  var box = dialogConfig[boxIndex];
  $('.edit_scene').find('[name=name]').val(box.name).select();
  $('.edit_scene').find('#id').text(box.id).attr("title", box.id);
}

$('[name=name]').on({
  "input":function(e){
    var val = $(this).val().toLowerCase();
    if(val.length<3){
      $("button").attr("disabled",true).addClass("disabled_background");
    }else{
      $("button").removeAttr("disabled").removeClass("disabled_background");
    }
    $("#id").text(val.replace(/[^a-z0-9]/ig, "-"));
  }
});
/**
 * 写配置
 */
function setConfig() {
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root>";
  for (var i in dialogConfig) {
    text += "<s "
    for (var j in dialogConfig[i]) {
      if (j != "arr") {
        text += j + "=\"" + dialogConfig[i][j] + "\" ";
      }
    }
    if (dialogConfig[i]["arr"].length > 0) {
      text += ">";
      for (var j in dialogConfig[i]["arr"]) {
        text += "<property key=\"" + dialogConfig[i]["arr"][j].key + "\" value=\"" + dialogConfig[i]["arr"][j].value + "\" />";
      }
      text += "</s>";

    } else {
      text += "/>";
    }
  }
  text += "</root>";
  biSetLocalVariable("scene-by-signal", JSON.stringify(dialogConfig));
  biSetModuleConfig("scene-by-signal.system", text);
}

function biOnInitEx(config, moduleConfigs) {
  boxIndex = Number(config);
  var lang = biGetLanguage() == 1 ? en : cn;
  $('[language]').each(function () {
    var value = $(this).attr('language');
    $(this).text(lang[value])
  });
  for (var key in moduleConfigs) {
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(moduleConfigs[key], "text/xml");
    var countrys = xmlDoc.getElementsByTagName('root');
    for (var i = 0; i < countrys[0].childNodes.length; i++) {
      var keyss = countrys[0].childNodes[i].attributes;
      var obj = new Object();
      for (var j = 0; j < keyss.length; j++) {
        obj[keyss[j].nodeName] = keyss[j].nodeValue;
      }
      var array = [];
      for (var j = 0; j < countrys[0].childNodes[i].childNodes.length; j++) {
        var keysss = countrys[0].childNodes[i].childNodes[j].attributes;
        var object = new Object();
        for (var k = 0; k < keysss.length; k++) {
          object[keysss[k].nodeName] = keysss[k].nodeValue;
        }
        array.push(object);
      }
      obj.arr = array;
      dialogConfig.push(obj);
    }
    loadConfig();
  }
}