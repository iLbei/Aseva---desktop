var boxArr = [],
  boxId = "",
  selected_node_id = 0,
  edit = false,
  rank = "";

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

class MapNumber extends Box {
  constructor(width, height, name, type, id, className, rank, top, left, parentIds, sonIds, isModified, typeValue, defaultValue, value, input, output) {
    super(width, height, name, type, id, className, rank, top, left, parentIds, sonIds, isModified, typeValue)
    this.defaultValue = defaultValue;
    this.value = value;
    this.input = input;
    this.output = output;
  };
}

$('[type=text]').on('input', function () {
  changeVal();
});
$('[name]').on('change', function () {
  changeVal();
});

function compareVal(obj, val) {
  var step = $(obj).attr('step').length > 2 ? $(obj).attr('step').length - 2 : 0,
    v = Number(val);
  if (isNaN(val) || !Boolean(val)) {
    newVal = Number($(obj).attr('value'));
  } else {
    var v = Number(val);
    var min = Number($(obj).attr('min')),
      max = Number($(obj).attr('max'));
    v = v < min ? min : v;
    v = v > max ? max : v;
    if (step > 0) {
      newVal = Math.round((Math.abs(v) * Math.pow(10, step)).toFixed(1)) / Math.pow(10, step);
      if (v < 0) newVal = -newVal;
    } else {
      newVal = Math.floor(v);
    }
  }
  return step > 0 ? newVal.toFixed(step) : newVal;
}

function changeVal() {
  var input = [],
    output = [];
  $('.map>.table>.body>div').each(function (i, v) {
    if (i > 0 && i < $('.map>.table>.body>div').length - 1) {
      var int = isNaN(Number($(this).find('[name=input]').val())) == false ? $(this).find('[name=input]').val() : 0;
      input.push(int);
      var out = isNaN(Number($(this).find('[name=output]').val())) == false ? $(this).find('[name=output]').val() : 0;
      output.push(out);
    }
  })
  var defaultValue = $('input[name=map]:checked').val();
  var value = $('[name=mapValue]').val();
  if (!edit) {
    boxArr[boxArr.length - 1] = new MapNumber(90, 30, "map", "Number mapping", selected_node_id, "orange", rank, 0, 0, [boxId], [], true, 'map', defaultValue, value, input, output);
  } else {
    boxArr[findById(boxId)].defaultValue = defaultValue;
    boxArr[findById(boxId)].value = value;
    boxArr[findById(boxId)].input = input;
    boxArr[findById(boxId)].output = output;
  }
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
  edit = str[4] == "true" ? true : false;
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
  if (edit) {
    loadConfig()
  } else {
    rank = boxArr[findById(boxId)].rank == "0" ? 1 : parseInt(boxArr[findById(boxId)].rank) + 1;
    var box = new MapNumber(90, 30, "map", "Number mapping", selected_node_id, "orange", rank, 0, 0, [boxId], [], true, 'map', "constant", "0", [0], [0]);
    boxArr.push(box);
    setConfig();
  }
}

function loadConfig() {
  var box = boxArr[findById(boxId)];
  $('.map>.table>.body>div:first-of-type').each(function () {
    $(this).remove();
  });
  for (var i = 0; i < box.input.length; i++) {
    $tableBox = $('.map>.table>.body>div:first-of-type').clone(true);
    $tableBox.find('[name=input]').val(box.input[i]);
    $tableBox.find('[name=output]').val(box.output[i]);
    $('.map>.table>.body').append($tableBox[0]);
  }
  if (box.defaultValue == "constant") {
    $('.map').find('#map1').removeAttr('checked');
    $('.map').find('#map2').attr('checked', true);
  } else {
    $('.map').find('#map2').removeAttr('checked');
    $('.map').find('#map1').attr('checked', true);
  }
  $('.map').find('[name=mapValue]').val(box.value)
  $tableBox = $('.map>.table>.body>div:first-of-type').clone(true);
  $('.map>.table>.body').append($tableBox[0]);
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

function selectOneRow(obj) {
  $('.map>.table>.body>div').each(function () {
    $(this).children('div:first-of-type').removeClass('blue2');
    $(this).find('input').removeClass('blue1');
  });
  $('.map>.table>.top>div:first-of-type').removeClass('all');
  $(obj).addClass('blue2');
  $(obj).next().children().addClass('blue1');
  $(obj).next().next().children().addClass('blue1');
}
//监听键盘del键
$('body').keydown(function (event) {
  var e = event || window.event;
  if (e.keyCode == 46) {
    if ($(".tableBox").length <= 2) return;
    if ($('.map>.table>.top>div:first-of-type').hasClass('all')) {
      var i = 1;
      while (i < $('.map>.table>.body>div').length - 1) {
        $('.map>.table>.body>div')[i].remove();
        i = 1;
      }
    } else {
      if ($('.blue2').parent().next().text() != undefined) {
        $('.blue2').parent().remove();
      }
    }
  }
});

function wipeBlue(obj) {
  $(obj).parent().parent().children('div:first-of-type').removeClass('blue2');
  $(obj).parent().parent().children('div:nth-of-type(2)').children().removeClass('blue1');
  $(obj).parent().parent().children('div:nth-of-type(3)').children().removeClass('blue1');
}

function selectAll() {
  $('.map>.table>.body>div').each(function () {
    $(this).children('div:first-of-type').addClass('blue2');
    $(this).find('input').addClass('blue1');
  });
  $('.map>.table>.top>div:first-of-type').addClass('all');
}

function keyPress(obj) {
  if ($(obj).parent().parent().next().length == 0) {
    $tableBox = $('.map>.table>.body>div:first-of-type').clone(true);
    $('.map>.table>.body').append($tableBox[0]);
  }
}