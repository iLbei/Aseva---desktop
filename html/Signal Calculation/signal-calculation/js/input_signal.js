var not_config = "",
  dialogConfig = {},
  boxArr = [],
  boxId = "",
  selected_node_id = 0,
  flag = false;
edit = "";
var compareArr = ["=", "<", ">=", ">", "<=", "!="];
class Box {
  constructor(width, height, name, type, id, className, rank, top, left, parentIds, sonIds, isModified, typeValue) {
    this.width = width;
    this.height = height;
    this.name = name;
    this.type = type;
    this.id = id;
    this.className = className;
    this.rank = rank;
    this.top = top;
    this.left = left;
    this.parentIds = parentIds;
    this.sonIds = sonIds;
    this.isModified = isModified;
    this.typeValue = typeValue;
  }
}
class InputSignal extends Box {
  constructor(width, height, name, type, id, className, rank, top, left, parentIds, sonIds, isModified, typeValue, signal, signalName, interpolation) {
    super(width, height, name, type, id, className, rank, top, left, parentIds, sonIds, isModified, typeValue)
    this.signal = signal;
    this.signalName = signalName;
    this.interpolation = interpolation;
  };
}
$("[name]").change(function () {
  changeVal();
})

//获取总线协议文件绑定的通道
function biOnQueriedBusProtocolFileChannel(busFileProtocolID, busChannel) {
  if (busChannel == 0) {
    var val = $('.input_signal').find('a').attr("val");
    $('.input_signal').find('a').text(val);
    $('.input_signal').find('a').removeClass('springgreen').addClass("red");
  } else {
    var arr = $('.input_signal').find('a').attr("val").split(":");
    $('.input_signal').find('a').text(arr[2]);
    $('.input_signal').find('a').addClass('springgreen').removeClass("red");
  }
}

$("a").click(function () {
  var originID = null;
  if ($(this).text().indexOf(not_config) == -1) {
    originID = $(this).attr("val");
  }
  biSelectSignal("", originID, false, null, false, 1, "[m]");
})

function biOnSelectedSignal(key, valueInfo, signBitInfo, scale) {
  if (valueInfo == null) {
    $("a").removeClass('springgreen').addClass('red');
    $("a").text(not_config);
    $("a").removeAttr("val title");
  } else {
    $("a").text(valueInfo.signalName);
    $("a").attr({
      "val": valueInfo.id,
      "title": valueInfo.id
    });
    $("a").addClass('springgreen').removeClass('red');
  }
  changeVal();
}

function changeVal() {
  if ($("a").text().indexOf(not_config) == -1) {
    var id = $("a").attr("val");
    var name = "";
    if ($("a").hasClass('red')) {
      if (id.indexOf(":") != -1) name = id.split(":")[2];
    } else {
      name = id.split(":")[2];
    }
    var val = $('a').attr('val');
    var interpolation = $('[name=interpolation]').val() == "nearest" ? "yes" : "no";
    if (edit == "false") {
      if (!flag) {
        var box = new InputSignal(120, 30, name, "Input signal", selected_node_id, "blue", 0, 0, 0, [], [], true, 'input', val, name, interpolation);
        boxArr.push(box);
      } else {
        boxArr[boxArr.length - 1] = new InputSignal(120, 30, name, "Input signal", selected_node_id, "blue", 0, 0, 0, [], [], true, 'input', val, name, interpolation);
      }
    } else {
      boxArr[findById(boxId)].signal = val;
      boxArr[findById(boxId)].name = name;
      boxArr[findById(boxId)].signalName = name;
      boxArr[findById(boxId)].interpolation = interpolation;
    }
  }
  flag = true;
  setConfig();
}
/**
 * 写配置
 */

function setConfig() {
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?>";
  text += "<root enabled=\"" + dialogConfig["enabled"] + "\" rate=\"" + dialogConfig["enabled"] + "\">";
  var blueArr = [],
    orangeArr = [],
    greenArr = [];
  for (var i = 0; i < boxArr.length; i++) {
    var box = boxArr[i];
    if (box.className == "blue") {
      blueArr.push(box);
    } else if (box.className == "orange") {
      orangeArr.push(box);
    } else {
      greenArr.push(box);
    }
  }
  if (blueArr.length != 0) {
    text += "<input>";
    for (var i = 0; i < blueArr.length; i++) {
      var box = blueArr[i];
      text += nodeText(box);
    }
    text += "</input>";
  } else {
    text += "<input />";
  }
  if (greenArr.length != 0) {
    text += "<output>";
    for (var i = 0; i < greenArr.length; i++) {
      var box = greenArr[i];
      text += nodeText(box);
    }
    text += "</output>";
  } else {
    text += "<output />";
  }
  var newOrangeArr = [];
  for (var i = 0; i < orangeArr.length; i++) {
    var arr = [],
      flag = false;
    for (var j = 0; j < orangeArr.length; j++) {
      var box = orangeArr[j];
      if (box.rank == (i + 1)) {
        arr.push(box);
        flag = true;
      }
    }
    if (!flag) {
      break;
    }
    newOrangeArr.push(arr);
  }
  for (var i = 0; i < newOrangeArr.length; i++) {
    var arr = newOrangeArr[i];
    text += "<layer>";
    for (var j = 0; j < arr.length; j++) {
      var box = arr[j];
      text += nodeText(box);
    }
    text += "</layer>";
  }
  text += "</root>";
  biSetLocalVariable("signal-calculation", JSON.stringify(boxArr));
  biSetModuleConfig("signal-calculation.system", text);
}

function nodeText(box) {
  var text = "";
  var parent_id = box.id;
  var typeValue = box.typeValue;
  var parentIds = box.parentIds;
  if (["abs", "ceiling", "floor", "round", "average", "integral"].includes(box.typeValue)) {
    text = "<node id=\"" + parent_id + "\" type=\"" + typeValue + "\" source=\"" + parentIds[0] + "\" />";
    return text;
  } else if (["and", "or", "add_signal", "sub_signal", "mul_signal", "weight_average", "reset_integral"].includes(box.typeValue)) {
    text = "<node id=\"" + parent_id + "\" type=\"" + typeValue + "\" source1=\"" + parentIds[0] + "\" source2=\"" + parentIds[1] + "\" />";
    return text;
  } else if (["ifelse_condition", "in_range", "clamp"].includes(box.typeValue)) {
    text = "<node id=\"" + parent_id + "\" type=\"" + typeValue + "\" source1=\"" + parentIds[0] + "\" source2=\"" + parentIds[1] + "\" source3=\"" + parentIds[2] + "\" />";
    return text;
  } else if (["min", "max"].includes(box.typeValue)) {
    var n = parentIds[0] + "," + parentIds[1] + "," + parentIds[2];
    text = "<node id=\"" + parent_id + "\" type=\"" + typeValue + "\">" + n + "</node>";
    return text;
  } else {
    switch (box.typeValue) {
      case "output":
        text = "<node id=\"" + parent_id + "\" type=\"" + typeValue + "\" source=\"" + parentIds[0] + "\" name=\"" + box.value + "\" />";
        break;
      case "unary_condition":
        text = "<node id=\"" + parent_id + "\" type=\"" + typeValue + "\" source=\"" + parentIds[0] + "\" compare=\"" + box.first + "\" values=\"" + box.num1 + "\" use_reset=\"" + (box.flag ? "yes" : "no") + "\" reset_compare=\"" + (box.second) + "\" reset_values=\"" + box.num2 + "\" />";
        break;
      case "add_number":
        text = "<node id=\"" + parent_id + "\" type=\"" + typeValue + "\" source=\"" + parentIds[0] + "\" value=\"" + box.value + "\" />";
        break;
      case "mul_number":
        text = "<node id=\"" + parent_id + "\" type=\"" + typeValue + "\" source=\"" + parentIds[0] + "\" value=\"" + box.value + "\" />";
        break;
      case "power":
        text = "<node id=\"" + parent_id + "\" type=\"" + typeValue + "\" source=\"" + parentIds[0] + "\" value=\"" + box.power + "\" default=\"" + box.defaultV + "\" />";
        break;
      case "holder":
        text = "<node id=\"" + parent_id + "\" type=\"" + typeValue + "\" source=\"" + parentIds[0] + "\" duration=\"" + box.value + "\" />";
        break;
      case "map":
        var map_values = "";
        for (var i in box.input) {
          if (box.input[i] !== "" && box.output[i] !== "") {
            map_values += box.input[i] + "," + box.output[i] + ",";
          }
        }
        text = "<node id=\"" + parent_id + "\" type=\"" + typeValue + "\" source=\"" + parentIds[0] + "\" default_mode_passthrough=\"" + (box.defaultValue == "passthrough" ? "yes" : "no") + "\" default_constant=\"" + box.value + "\" map_values=\"" + map_values.substring(0, map_values.length - 1) + "\" />";
        break;
      case "lpf_1st":
        text = "<node id=\"" + parent_id + "\" type=\"" + typeValue + "\" source=\"" + parentIds[0] + "\" time_coef=\"" + box.value + "\" />";
        break;
      case "mod":
        text = "<node id=\"" + parent_id + "\" type=\"" + typeValue + "\" source=\"" + parentIds[0] + "\" mod_number=\"" + box.value + "\" />";
        break;
      case "divide_signal":
        text = "<node id=\"" + parent_id + "\" type=\"" + typeValue + "\" source1=\"" + parentIds[0] + "\" source2=\"" + parentIds[1] + "\" default=\"" + box.value + "\" />";
        break;
      case "binary_condition":
        text = "<node id=\"" + parent_id + "\" type=\"" + typeValue + "\" source1=\"" + parentIds[0] + "\" source2=\"" + parentIds[1] + "\" compare=\"" + box.value + "\" />";
        break;
      case "constant":
        text = "<node id=\"" + box.id + "\" type=\"" + box.typeValue + "\" value=\"" + box.value + "\" />";
        break
      case "input":
        text += "<node id=\"" + box.id + "\" type=\"" + box.typeValue + "\" signal=\"" + box.signal + "\"  nearest=\"" + box.interpolation + "\" />";
        break;
    }
  }
  return text;
}

//根据id查找box
function findById(id) {
  var box = undefined;
  for (var i = 0; i < boxArr.length; i++) {
    var o = boxArr[i];
    if (o.id == id) {
      box = o;
      return i;
    }
  }
}

function biOnInitEx(config, moduleConfigs) {
  var str = config.split("|");
  dialogConfig = JSON.parse(str[0]);
  boxArr = JSON.parse(str[1]);
  boxId = str[2] != "" ? Number(str[2]) : "";
  selected_node_id = Number(str[3]);
  edit = str[4];
  if (biGetLanguage() == 1) {
    $('[language]').each(function () {
      var value = $(this).attr('language');
      $(this).text(en[value])
    });
    not_config = en["not_config"];
  } else {
    $('[language]').each(function () {
      var value = $(this).attr('language');
      $(this).text(cn[value])
    });
    not_config = cn["not_config"];
  }
  if (boxId != "") loadConfig();
}

function loadConfig() {
  var arr = boxArr[findById(boxId)];
  var signal = arr.signal.split(":");
  if (signal[0].indexOf(".dbc") != -1) {
    biQueryBusProtocolFileChannel(signal[0]);
  } else {
    $('.input_signal').find('a').text(signal[2]).attr("title", arr.signal);
    $('.input_signal').find('a').addClass('springgreen').removeClass("red");
  }
  $("[name=interpolation]").val(arr["interpolation"] == "yes" ? "nearest" : "linear");
  $("a").attr("val", arr["signal"]).text(arr["name"]);
}