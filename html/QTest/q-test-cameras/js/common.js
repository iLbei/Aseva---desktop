
var dialogConfig = [[], []];
function biOnInitEx(config, moduleConfigs) {
  var lang = biGetLanguage() == 1 ? en : cn;
  $('[language]').each(function () {
    var value = $(this).attr('language');
    $(this).text(lang[value])
  });
  for (var key in moduleConfigs) {
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(moduleConfigs[key], "text/xml");
    var obj = new Object();
    var root = xmlDoc.getElementsByTagName('root');
    var keys = root[0].attributes;
    for (var i = 0; i < keys.length; i++) {
      //获取root自身字节的属性
      obj[keys[i].nodeName] = keys[i].nodeValue;
    }
    dialogConfig[0] = obj;
    if (root[0].childNodes.length > 0) {
      var child = root[0].childNodes;
      for (var i of child) {
        var keyss = i.attributes;
        var obj2 = {};
        for (var j of keyss) {
          obj2[j.nodeName] = j.nodeValue;
        }
        dialogConfig[1].push(obj2);
      }
    }
  }
  loadConfig();
}

function setConfig() {
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root ";
  for (var i in dialogConfig[0]) {
    text += " " + i + "=\"" + dialogConfig[0][i] + "\"";
  }
  if (dialogConfig[1].length > 0) {
    text += ">"
    for (var i in dialogConfig[1]) {
      text += "<line_bound ";
      for (var j in dialogConfig[1][i]) {
        text += j + "=\"" + dialogConfig[1][i][j] + "\" ";
      }
      text += "/>"
    }
    text += "</root>";
  } else {
    text += "/>"
  }
  biSetModuleConfig("q-test-cameras.qtest", text);
}