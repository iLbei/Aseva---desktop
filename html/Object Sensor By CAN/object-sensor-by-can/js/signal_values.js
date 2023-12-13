var childIndex = 0,
  dialogConfig = [],
  signal_values = [
    [],
    []
  ];
$('[type=text]').bind("input propertychange", function () {
  checkTextValue($(this));
  if (!$(this).hasClass("red")) {
    changeVal();
    setConfig();
  }
}).blur(function () {
  var name = $(this).attr('name');
  if (name == "alias" || name == "msg") return
  if (!$(this).hasClass('text')) {
    if ($(this).hasClass('green')) {
      var str = $(this).val();
      if (str.indexOf(",") != -1) {
        var arr = str.split(','),
          newArr = [];
        for (var i = 0; i < arr.length; i++) {
          var v = Number(arr[i]);
          newArr.push(v);
        }
        $(this).val(newArr.join()).attr('value', newArr.join());
      } else {
        if (str != "") {
          var v = Number(str);
          $(this).val(v).attr('value', v);
        } else {
          var v = $(this).attr('value');
          $(this).val(v).attr('value', v);
        }
      }
    } else if ($(this).hasClass('red')) {
      var v = $(this).attr('value');
      $(this).val(v).removeClass('red').addClass('green');
    }
  }
});

function checkTextValue(obj) {
  var str = $(obj).val();
  if (str.indexOf(',') != -1) {
    var flag = false;
    var arr = str.split(","),
      newArr = [];;
    for (var i = 0; i < arr.length; i++) {
      if (arr[i] == "") {
        flag = true;
        break;
      }
      var v = Number(arr[i]);
      if (arr[i] != "") {
        if (isNaN(v)) {
          flag = true;
          break;
        }
      }
      newArr.push(v);
    }
    if (flag) {
      $(obj).addClass('red').removeClass('green');
    } else {
      $(obj).addClass('green').removeClass("red").attr('value', newArr.join());
    }
  } else {
    var v = Number(str);
    if (!isNaN(v) && str != "") { //green
      $(obj).addClass('green').attr('value', v);
    } else if (str != "") { //red
      $(obj).addClass('red').removeClass('green');
    } else if (str == "" && $(obj).hasClass('class_signal_value')) {
      $(obj).attr('value', "");
      $(obj).val("");
    }
  }
}

function biOnInitEx(config, moduleConfigs) {
  childIndex = config;
  $('[language]').each(function () {
    var value = $(this).attr('language');
    $(this).text(biGetLanguage() == 1 ? en[value] : cn[value])
  });
  for (var key in moduleConfigs) {
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(moduleConfigs[key], "text/xml");
    var root = xmlDoc.getElementsByTagName('root');
    var childNodes = root[0].childNodes;
    for (var i = 0; i < childNodes.length; i++) {
      var keys = childNodes[i].attributes;
      var obj = {};
      for (var j = 0; j < keys.length; j++) {
        // 获取root自身字节的属性
        obj[keys[j].nodeName] = keys[j].nodeValue;
      }
      var childKeys = childNodes[i].childNodes;
      var child = {
        "fov": [],
        "class_signal_value": [],
        object: []
      };
      for (var j = 0; j < childKeys.length; j++) {
        var name = childKeys[j].nodeName;
        var childKeysAttrs = childKeys[j].attributes;
        var childAttr = {}
        for (var k = 0; k < childKeysAttrs.length; k++) {
          childAttr[childKeysAttrs[k].nodeName] = childKeysAttrs[k].nodeValue;
        }
        if (name == "fov") {
          child.fov.push(childAttr)
        } else if (name == "class_signal_value") {
          if (i == config) {
            if (["2", "3", "4", "5"].includes(childAttr["type"])) {
              signal_values[0].push(childAttr);
            } else {
              signal_values[1].push(childAttr)
            }
          } else {
            child.class_signal_value.push(childAttr);
          }
        } else if (name == "object") {
          child.object.push(childAttr);
        }
      }
      dialogConfig.push({
        "attr": obj,
        "childAttr": child
      });
    }
    if (signal_values[1].length == 0) {
      signal_values[1].push({
        type: '11',
        values: 'null'
      }, {
        type: '12',
        values: 'null'
      }, {
        type: '13',
        values: 'null'
      }, {
        type: '21',
        values: 'null'
      }, {
        type: '22',
        values: 'null'
      }, {
        type: '23',
        values: 'null'
      }, {
        type: '24',
        values: 'null'
      }, {
        type: '25',
        values: 'null'
      }, {
        type: '26',
        values: 'null'
      }, {
        type: '31',
        values: 'null'
      }, {
        type: '32',
        values: 'null'
      }, {
        type: '33',
        values: 'null'
      }, {
        type: '34',
        values: 'null'
      }, {
        type: '41',
        values: 'null'
      }, {
        type: '42',
        values: 'null'
      }, {
        type: '43',
        values: 'null'
      }, {
        type: '44',
        values: 'null'
      }, {
        type: '51',
        values: 'null'
      }, {
        type: '52',
        values: 'null'
      }, {
        type: '53',
        values: 'null'
      }, {
        type: '54',
        values: 'null'
      }, {
        type: '6',
        values: 'null'
      }, {
        type: '61',
        values: 'null'
      }, {
        type: '62',
        values: 'null'
      }, {
        type: '7',
        values: 'null'
      }, {
        type: '71',
        values: 'null'
      }, {
        type: '72',
        values: 'null'
      }, {
        type: '73',
        values: 'null'
      }, {
        type: '8',
        values: 'null'
      }, {
        type: '81',
        values: 'null'
      }, {
        type: '82',
        values: 'null'
      }, {
        type: '83',
        values: 'null'
      }, {
        type: '84',
        values: 'null'
      }, {
        type: '9',
        values: 'null'
      }, {
        type: '91',
        values: 'null'
      }, {
        type: '92',
        values: 'null'
      }, {
        type: '93',
        values: 'null'
      }, {
        type: '94',
        values: 'null'
      });
    }
    loadConfig(signal_values[1]);
  }
}

function loadConfig(arr) {
  if (arr.length == 0) {
    signal_values[0] = [{
      type: '2',
      values: 'null'
    }, {
      type: '3',
      values: 'null'
    }, {
      type: '4',
      values: 'null'
    }, {
      type: '5',
      values: 'null'
    }];
    $(".container input[name]").each(function () {
      signal_values[1].push({
        type: $(this).attr("name"),
        values: 'null'
      })
    })
  }
  for (var j = 0; j < arr.length; j++) {
    var name = arr[j].type;
    $("[name=" + name + "]").val(arr[j].values == "null" ? "" : arr[j].values).addClass("green");
  }
}

function changeVal() {
  for (var i = 0; i < signal_values[1].length; i++) {
    var name = signal_values[1][i]["type"];
    signal_values[1][i]["values"] = $("[name=" + name + "]").val() ? $("[name=" + name + "]").val() : "null";
  }
  dialogConfig[childIndex]["childAttr"]["class_signal_value"] = signal_values[0].concat(signal_values[1]);
  biSetLocalVariable("object_sensor_by_can", JSON.stringify(dialogConfig));
}

function setConfig() {
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root>";
  for (var i = 0; i < dialogConfig.length; i++) {
    text += "<c" + (i + 1) + " ";
    for (var j in dialogConfig[i]["attr"]) {
      text += j + "=\"" + dialogConfig[i]["attr"][j] + "\" ";
    }
    if (dialogConfig[i]["childAttr"].length == 0) {
      text += "/>";
    } else {
      text += ">";
      for (var j in dialogConfig[i]["childAttr"]) {
        for (var k in dialogConfig[i]["childAttr"][j]) {
          text += "<" + j + " ";
          for (var l in dialogConfig[i]["childAttr"][j][k]) {
            text += l + "=\"" + dialogConfig[i]["childAttr"][j][k][l] + "\" ";
          }
          text += "/>"
        }
      }
      text += "</c" + (i + 1) + ">";
    }
  }
  text += "</root>";
  biSetModuleConfig("object-sensor-by-can.pluginsensor", text)
}