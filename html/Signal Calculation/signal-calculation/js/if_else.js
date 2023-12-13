var boxArr = [],
  boxId = "",
  selected_node_id = 0,
  flag = false,
  edit = false,
  parentId = "",
  swap = false,
  node1 = "",
  node2 = "",
  operator_name = "";


//方块
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
$("button").click(function () {
  swap = true;
  var className = $(this).attr('class');
  if (className == "swap1") {
    var node1 = $('.node1').text();
    var node2 = $('.node2').text();
    $('.node1').text(node2);
    $('.node2').text(node1);
    if (swap)[parentId[0], parentId[1]] = [parentId[1], parentId[0]];
  } else {
    var node2 = $('.node2').text();
    var node3 = $('.node3').text();
    $('.node2').text(node3);
    $('.node3').text(node2);
    if (swap)[parentId[1], parentId[2]] = [parentId[2], parentId[1]];
  }
  changeVal();
})

function changeVal() {
  var node1 = $('.node1').text();
  var node2 = $('.node2').text();
  var node3 = $('.node3').text();
  var n1 = node1.substring(node1.indexOf('#') + 1, node1.indexOf('(') - 1);
  var n2 = node2.substring(node2.indexOf('#') + 1, node2.indexOf('(') - 1);
  var n3 = node3.substring(node3.indexOf('#') + 1, node3.indexOf('(') - 1);
  var name, typeValue;
  switch (operator_name) {
    case "If-else condition":
      typeValue = "ifelse_condition";
      name = "{" + n1 + "}=0?" + "{" + n2 + "}:" + "{" + n3 + "}";
      break;
    case "In-range condition":
      typeValue = "in_range"
      name = "in {" + n2 + "} ~ " + "{" + n3 + "}";
      break;
    case "Clamp signal":
      typeValue = "clamp"
      name = "clamp {" + n2 + "} ~ " + "{" + n3 + "}";
      break;
  }
  var rank = !Boolean(boxArr[findById(boxId)]) || boxArr[findById(boxId)].rank == "0" ? 1 : parseInt(boxArr[findById(boxId)].rank) + 1;

  if (edit == "false") {
    if (!flag) {
      var box = new Box(90, 30, name, operator_name, selected_node_id, "orange", rank, 0, 0, parentId, [], true, typeValue);
      boxArr.push(box);
    } else {
      boxArr[boxArr.length - 1] = new Box(90, 30, name, operator_name, selected_node_id, "orange", rank, 0, 0, parentId, [], true, typeValue);
    }
  } else {
    if (swap)[boxArr[findById(boxId)].parentIds[0], boxArr[findById(boxId)].parentIds[1], boxArr[findById(boxId)].parentIds[2]] = [parentId[0], parentId[1], parentId[2]];
    boxArr[findById(boxId)].name = name;
  }
  flag = true;
  setConfig();
}

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

function biOnInitEx(config, moduleConfigs) {
  var str = config.split("|");
  dialogConfig = JSON.parse(str[0]);
  boxArr = JSON.parse(str[1]);
  boxId = str[2] != "" ? Number(str[2]) : ""; //为选中的box的id，直接点input signal时，打开的弹窗boxId=""
  selected_node_id = Number(str[3]); //为新增的box的id索引
  edit = str[4];
  operator_name = str[6];
  if (edit == "true") {
    parentId = boxArr[findById(boxId)].parentIds;
  } else {
    parentId = str[5].split(",");
  }
  if (biGetLanguage() == 1) {
    $('[language]').each(function () {
      var value = $(this).attr('language');
      $(this).text(en[value])
    });
  } else {
    $('[language]').each(function () {
      var value = $(this).attr('language');
      $(this).text(cn[value])
    });
  }
  loadConfig();
}

function loadConfig() {
  var p1 = boxArr[findById(parentId[0])],
    p2 = boxArr[findById(parentId[1])],
    p3 = boxArr[findById(parentId[2])];
  node1 = "Node #" + p1.id + " (" + p1.name + ")";
  node2 = "Node #" + p2.id + " (" + p2.name + ")";
  node3 = "Node #" + p3.id + " (" + p3.name + ")";
  $('.node1').text(node1);
  $('.node2').text(node2);
  $('.node3').text(node3);
  changeVal();
}

function findById(id) {
  for (var i = 0; i < boxArr.length; i++) {
    var o = boxArr[i];
    if (o.id == id) {
      box = o;
      return i;
    }
  }
}