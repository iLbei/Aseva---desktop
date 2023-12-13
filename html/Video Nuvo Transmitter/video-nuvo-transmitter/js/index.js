var configs = [];
$('.container').on("change", "[name]", function () {
  changeContentVal(this);
});
//保存配置
function setConfig() {
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root>";
  for (var i in configs) {
    text += "<video" + (Number(i) + 1) + " ";
    for (var j in configs[i]) {
      text += " " + j + "=\"" + configs[i][j] + "\"";
    }
    text += "/>";
  }
  text += "</root>";
  biSetModuleConfig("video-nuvo-transmitter.aspluginvideonuvotransmitter", text);
}
//初始化
function biOnInitEx(config, moduleConfigs) {
  $('[language]').each(function () {
    var value = $(this).attr('language');
    $(this).html(biGetLanguage() == 1 ? en[value] : cn[value])
  });
  for (var key in moduleConfigs) {
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(moduleConfigs[key], "text/xml");
    var child = xmlDoc.getElementsByTagName('root')[0].childNodes;
    for (var i = 0; i < child.length; i++) {
      var obj = {};
      var keys = child[i].attributes;
      for (var j in keys) {
        obj[keys[j].nodeName] = keys[j].nodeValue;
      }
      configs.push(obj);
    }
    getContentVal(0);
  }
}


$(".item>li").click(function () {
  $(this).addClass("active").siblings().removeClass("active");
  var i = $(".active").index();
  getContentVal(i);
})

function getContentVal(i) {
  $('.content .video>ul').find("[name]").each(function () {
    var name = $(this).attr("name");
    var val = configs[i][name];
    var type = $(this).attr('type');
    if (type == 'checkbox') {
      $(this).prop('checked', val == 'yes' ? true : false);
    } else if (type == "number") {
      $(this).val(compareVal(this, val));
    } else {
      $(this).val(val);
    }
  })
}

function changeContentVal(obj) {
  var i = $(".active").index();
  var name = $(obj).attr("name");
  var val = $(obj).val();
  var type = $(obj).attr('type');
  if (type == 'checkbox') {
    val = $(obj).is(':checked') ? "yes" : "no";
  } else if (type == "number") {
    val = compareVal(obj, val);
  }
  configs[i][name] = val;
  setConfig();
}