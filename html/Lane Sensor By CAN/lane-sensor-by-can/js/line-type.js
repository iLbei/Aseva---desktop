var dialogConfig = [], currentI;
$("[type=text]").on("keyup", function () {
  if ($(this).is(":valid")) {
    $(this).attr("value", $(this).val());
    changeVal(this);
  }
}).on("blur", function () {
  $(this).val($(this).attr('value'));
})


function changeVal(obj) {
  var index = Number($(obj).attr("name")) - 2;
  dialogConfig[currentI]["typesLanes"]["class_sv"][index] = { "type": $(obj).attr("name"), "values": $(obj).val() };
  setConfig();
}

function setConfig() {
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root>";
  for (var i in dialogConfig) {
    text += "<c" + (Number(i) + 1) + " ";
    for (var j in dialogConfig[i]) {
      if (j != "typesLanes") {
        text += j + "=\"" + dialogConfig[i][j] + "\" ";
      }
    }
    text += ">"
    for (var j in dialogConfig[i]["typesLanes"]) {
      for (var k in dialogConfig[i]["typesLanes"][j]) {
        text += "<" + j + " ";
        for (var m in dialogConfig[i]["typesLanes"][j][k]) {
          text += m + "=\"" + dialogConfig[i]["typesLanes"][j][k][m] + "\" ";
        }
        text += "/>"
      }
    }
    text += "</c" + (Number(i) + 1) + ">";
  }
  text += "</root>";
  biSetModuleConfig("lane-sensor-by-can.pluginsensor", text);
  biSetLocalVariable("lane_sensor_by_can_dialog", JSON.stringify(dialogConfig));
}

function biOnInitEx(config, moduleConfigs) {
  currentI = config;
  language = biGetLanguage() == 1;
  var lang = language ? en : cn;
  $('[language]').each(function () {
    var value = $(this).attr('language');
    $(this).text(lang[value]);
  });
  for (var key in moduleConfigs) {
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(moduleConfigs[key], "text/xml");
    var countrys = xmlDoc.getElementsByTagName('root');
    for (var i = 0; i < countrys[0].childNodes.length; i++) {
      var nodeName = countrys[0].childNodes[i].nodeName;
      var conu = xmlDoc.getElementsByTagName(nodeName);
      var keyss = conu[0].attributes;
      var obj = {},
        line = [],
        color_sv = [],
        class_sv = [];
      for (var j = 0; j < keyss.length; j++) {
        obj[keyss[j].nodeName] = keyss[j].nodeValue;
      }
      for (var k = 0; k < conu[0].childNodes.length; k++) {
        var eKeys = conu[0].childNodes[k].attributes;
        var nodeName = conu[0].childNodes[k].nodeName;
        var eObj = new Object();
        for (var n = 0; n < eKeys.length; n++) {
          eObj[eKeys[n].nodeName] = eKeys[n].nodeValue;
        }
        if (nodeName == "class_sv") {
          class_sv.push(eObj);
        } else if (nodeName == "color_sv") {
          color_sv.push(eObj);
        } else {
          line.push(eObj);
        }
      }
      if (class_sv.length == 0) {
        class_sv.push({
          type: "2",
          values: "null"
        }, {
          type: "3",
          values: "null"
        })
      }
      if (color_sv.length == 0) {
        color_sv.push({
          type: "2",
          values: "null"
        }, {
          type: "3",
          values: "null"
        })
      }
      obj["typesLanes"] = { color_sv, class_sv, line };
      dialogConfig.push(obj);
    }
  }
  loadConfig();
}

function loadConfig() {
  var classArr = dialogConfig[currentI]["typesLanes"]["class_sv"];
  $('input').each(function () {
    var name = $(this).attr("name");
    var count = 0;
    for (var i in classArr) {
      if (classArr[i]["type"] == name) {
        count++;
        return;
      }
    }
    if (count == 0) {
      classArr.push({
        "nodeName": "class_sv",
        "type": name,
        "values": "null"
      })
    }
  })
  for (var i in classArr) {
    var v = classArr[i]["values"] == "null" ? "" : classArr[i]["values"];
    $("input[name=" + classArr[i]["type"] + "]").val(v).attr("value",v);
  }
}