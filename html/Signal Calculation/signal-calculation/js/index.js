var not_config = "",
  not_select = "",
  dialogConfig = {};
var canvas = $('#canvas')[0],
  ctx = canvas.getContext('2d');
var compareArr = ["=", "<", ">=", ">", "<=", "!="];
var id = 0,
  leftLocal = 0,
  topLocal = 0;
var boxArr = [],
  editFlag = false,
  flag = false,
  lineArr = [];
var initTop = 24,
  initLeft = 35,
  initInterval = 10;
var oldLeft = 0,
  oldTop = 0;
var minLeft = 0,
  minTop = 0;
var edit = false;
var selected_arr = [];

var binary_operators = {
  "and": {
    name: "and",
    type: 'Logical and'
  },
  "or": {
    name: "or",
    type: 'Logical or'
  },
  "add_signal": {
    name: "+",
    type: 'Add signal'
  },
  "sub_signal": {
    name: "sub_signal",
    type: 'Subtract signal'
  },
  "mul_signal": {
    name: "mul_signal",
    type: 'Multiply signal'
  },
};

$("[name]").change(function () {
  var name = $(this).attr("name");
  var type = $(this).attr("type");
  var val = "";
  if (type == "checkbox") {
    val = $(this).is(":checked") ? "yes" : "no";
  } else if (type == "number") {
    val = compareVal(this, $(this).val());
  }
  dialogConfig[name] = val;
  setConfig();
});
//鼠标移入
canvas.onmousemove = function (e) {
  e = e || window.event;
  if (flag) {
    setTimeout(() => {
      var left = e.clientX - leftLocal + oldLeft;
      var top = e.clientY - topLocal + oldTop;
      left = left < minLeft ? minLeft : left;
      left = left > 0 ? 0 : left;
      top = top < minTop ? minTop : top;
      top = top > 0 ? 0 : top;
      $('.container>.left>div').css({
        'left': left + "px",
        'top': top + "px"
      });
    });
  }
};
//鼠标移开
canvas.onmouseleave = function () {
  flag = false;
};
//鼠标按下
canvas.onmousedown = function (e) {
  e = e || window.event;
  flag = true;
  leftLocal = e.clientX;
  topLocal = e.clientY;
};
//鼠标松开
canvas.onmouseup = function () {
  flag = false;
  oldLeft = $('.container>.left>div').position().left;
  oldTop = $('.container>.left>div').position().top;
};
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
//点
class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}
class Constant extends Box {
  constructor(width, height, name, type, id, className, rank, top, left, parentIds, sonIds, isModified, typeValue, value) {
    super(width, height, name, type, id, className, rank, top, left, parentIds, sonIds, isModified, typeValue)
    this.value = value;
  }
}
class SignalOutput extends Box {
  constructor(width, height, name, type, id, className, rank, top, left, parentIds, sonIds, isModified, typeValue, value) {
    super(width, height, name, type, id, className, rank, top, left, parentIds, sonIds, isModified, typeValue)
    this.value = value;
  }
}
class InputSignal extends Box {
  constructor(width, height, name, type, id, className, rank, top, left, parentIds, sonIds, isModified, typeValue, signal, signalName, interpolation) {
    super(width, height, name, type, id, className, rank, top, left, parentIds, sonIds, isModified, typeValue)
    this.signal = signal;
    this.signalName = signalName;
    this.interpolation = interpolation;
  }
}
class Condition extends Box {
  constructor(width, height, name, type, id, className, rank, top, left, parentIds, sonIds, isModified, typeValue, first, num1, second, num2, flag) {
    super(width, height, name, type, id, className, rank, top, left, parentIds, sonIds, isModified, typeValue)
    this.first = first;
    this.num1 = num1;
    this.second = second;
    this.num2 = num2;
    this.flag = flag;
  }
}
class Add extends Box {
  constructor(width, height, name, type, id, className, rank, top, left, parentIds, sonIds, isModified, typeValue, value) {
    super(width, height, name, type, id, className, rank, top, left, parentIds, sonIds, isModified, typeValue)
    this.value = value;
  }
}
class Multiply extends Box {
  constructor(width, height, name, type, id, className, rank, top, left, parentIds, sonIds, isModified, typeValue, value) {
    super(width, height, name, type, id, className, rank, top, left, parentIds, sonIds, isModified, typeValue)
    this.value = value;
  }
}
class Power extends Box {
  constructor(width, height, name, type, id, className, rank, top, left, parentIds, sonIds, isModified, typeValue, power, defaultV) {
    super(width, height, name, type, id, className, rank, top, left, parentIds, sonIds, isModified, typeValue)
    this.power = power;
    this.defaultV = defaultV;
  }
}
class SignalHolder extends Box {
  constructor(width, height, name, type, id, className, rank, top, left, parentIds, sonIds, isModified, typeValue, value) {
    super(width, height, name, type, id, className, rank, top, left, parentIds, sonIds, isModified, typeValue)
    this.value = value;
  }
}
class MapNumber extends Box {
  constructor(width, height, name, type, id, className, rank, top, left, parentIds, sonIds, isModified, typeValue, defaultValue, value, input, output) {
    super(width, height, name, type, id, className, rank, top, left, parentIds, sonIds, isModified, typeValue)
    this.defaultValue = defaultValue;
    this.value = value;
    this.input = input;
    this.output = output;
  }
}
class OrderLPF extends Box {
  constructor(width, height, name, type, id, className, rank, top, left, parentIds, sonIds, isModified, typeValue, value) {
    super(width, height, name, type, id, className, rank, top, left, parentIds, sonIds, isModified, typeValue)
    this.value = value;
  }
}
class Mod extends Box {
  constructor(width, height, name, type, id, className, rank, top, left, parentIds, sonIds, isModified, typeValue, value) {
    super(width, height, name, type, id, className, rank, top, left, parentIds, sonIds, isModified, typeValue)
    this.value = value;
  }
}
class Decide extends Box {
  constructor(width, height, name, type, id, className, rank, top, left, parentIds, sonIds, isModified, typeValue, value) {
    super(width, height, name, type, id, className, rank, top, left, parentIds, sonIds, isModified, typeValue)
    this.value = value;
  }
}
class ConditionWith extends Box {
  constructor(width, height, name, type, id, className, rank, top, left, parentIds, sonIds, isModified, typeValue, value) {
    super(width, height, name, type, id, className, rank, top, left, parentIds, sonIds, isModified, typeValue)
    this.value = value;
  }
}

$('[type=number]').bind('input propertychange', function () {
  dialogConfig[$(this).attr("name")] = $(this).val();
  setConfig();
})

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

//根据id查找box
function findById(id) {
  var box = undefined;
  for (var i = 0; i < boxArr.length; i++) {
    var o = boxArr[i];
    if (o.id == id) {
      box = o;
      break;
    }
  }
  return box;
}

function sortBox(a, b) {
  return a.rank - b.rank;
}

/**
 * 画线-两点一线
 * @param {*} p1 点
 * @param {*} p2 点
 * @param {*} width 线宽度
 * @param {*} color 颜色
 * @param {*} ctx 画图上下文
 */
function drawLine(arr, ctx, opacity) {
  ctx.beginPath();
  ctx.lineWidth = 1;
  ctx.moveTo(arr[0].x, arr[0].y);
  for (var i = 1; i < arr.length; i++) {
    ctx.lineTo(arr[i].x, arr[i].y);
  }
  ctx.strokeStyle = 'rgba(255, 255, 255, ' + opacity + ')';
  ctx.stroke();
}
//画线
function drawLines(lineArr) {
  clearCanvas();
  for (var i = 0; i < lineArr.length; i++) {
    var line = lineArr[i];
    drawLine(line.arr, ctx, line.opacity);
  }
}

function createBox(box, arr, rank) {
  $box = undefined;
  if (box.type == "Input signal" || box.type == "Input constant") {
    $box = $('.blue').clone(true);
  } else if (box.type == "Output signal") {
    $box = $('.green').clone(true);
  } else {
    $box = $('.orange').clone(true);
  }
  var text_name = box.name;
  if (box.type == "1st-order low pass filter") {
    text_name = box.name + "s LPF1";
  } else if (box.type == "Logical and") {
    text_name = box.name + " (&)";
  } else if (box.type == "Logical or") {
    text_name = box.name + " (|)";
  } else if (box.type == "Add signal") {
    text_name = "+";
  } else if (box.type == "Multiply signal") {
    text_name = "x";
  }
  $box.text(text_name).attr("title", text_name);
  $box.css({
    "top": box.top,
    "left": box.left
  });
  if (arr.indexOf(box.id) != -1) {
    $box.attr('id', 'border');
  } else {
    $box.removeAttr('id');
  }

  if (box.parentIds.length != 0) {
    for (var i = 0; i < box.parentIds.length; i++) {
      var arr = [];
      var parent = findById(box.parentIds[i]);
      if (parent == undefined) continue;
      parent.sonIds.push(box.id);
      if (box.rank == -1) {
        if (rank == 0) {
          arr.push(new Point(parent.width + parent.left, parent.top + parent.height / 2));
          arr.push(new Point(box.left, box.top + box.height / 2));
        } else {
          var interval = rank - parent.rank;
          if (interval == 0) {
            arr.push(new Point(parent.width + parent.left, parent.top + parent.height / 2));
            arr.push(new Point(box.left, box.top + box.height / 2));
          } else {
            arr.push(new Point(parent.width + parent.left, parent.top + parent.height / 2));
            arr.push(new Point(parent.width + parent.left + 35 / 2, parent.top + parent.height / 2));
            arr.push(new Point(parent.width + parent.left + 35 / 2, 12));
            arr.push(new Point(box.left - 35 / 2, 12));
            arr.push(new Point(box.left - 35 / 2, box.top + box.height / 2));
            arr.push(new Point(box.left, box.top + box.height / 2));
          }
        }
      } else {
        var interval = box.rank - parent.rank;
        if (interval == 1) {
          arr.push(new Point(parent.width + parent.left, parent.top + parent.height / 2));
          arr.push(new Point(box.left, box.top + box.height / 2));
        } else {
          arr.push(new Point(parent.width + parent.left, parent.top + parent.height / 2));
          arr.push(new Point(parent.width + parent.left + 35 / 2, parent.top + parent.height / 2));
          arr.push(new Point(parent.width + parent.left + 35 / 2, 12));
          arr.push(new Point(box.left - 35 / 2, 12));
          arr.push(new Point(box.left - 35 / 2, box.top + box.height / 2));
          arr.push(new Point(box.left, box.top + box.height / 2));
        }
      }
      var line = {
        opacity: 0.4,
        id: parent.id + "" + box.id,
        arr: arr
      }
      lineArr.push(line);
    }
  }
  $box.attr('num', box.id);
  $('.container>.left>div').append($box[0]);
}

function mouserOver(obj) {
  var box = findById($(obj).attr('num'));
  var arr = [];
  for (var i = 0; i < box.parentIds.length; i++) {
    var parent_id = box.parentIds[i] + "" + box.id;
    arr.push(parent_id);
  }
  for (var i = 0; i < lineArr.length; i++) {
    var parent_id = lineArr[i].id;
    if (arr.indexOf(parent_id) != -1) {
      lineArr[i].opacity = 0.9;
    }
  }
  drawLines(lineArr);
}

function mouserOut(obj) {
  var box = findById($(obj).attr('num'));
  var arr = [];
  for (var i = 0; i < box.parentIds.length; i++) {
    var parent_id = box.parentIds[i] + "" + box.id;
    arr.push(parent_id);
  }
  for (var i = 0; i < lineArr.length; i++) {
    var parent_id = lineArr[i].id;
    if (arr.indexOf(parent_id) != -1) {
      lineArr[i].opacity = 0.4;
    }
  }
  drawLines(lineArr);
}

function checkBorder() {
  var borders = [];
  $('.container>.left>div>div').each(function (i, v) {
    if ($(this).attr('id') != undefined) {
      var parent_id = $(this).attr('num');
      var box = findById(parent_id);
      borders.push(box);
    }
  });
  if (borders.length == 1) {
    if (borders[0].className != "green") {
      $('.unary_operators').find('a').each(function () {
        $(this).removeClass('disabled_a');
      });
      $('.unary_operators').find('p').each(function () {
        $(this).removeClass('not_p');
      });
      $('.signal_i_o').find('a').each(function () {
        $(this).removeClass('disabled_a');
      });
    } else {
      $('.unary_operators').find('a').each(function () {
        $(this).addClass('disabled_a');
      });
      $('.unary_operators').find('p').each(function () {
        $(this).addClass('not_p');
      });
      $('[language=output_signal]').addClass('disabled_a');
    }
    var box = findById(borders[0].id);
    box.isModified ? $('#edit').removeClass('disabled_a') : $('#edit').addClass('disabled_a');
    $('#remove').removeClass('disabled_a');
    $('#id').text(borders[0].id);
    var tt = biGetLanguage() == 1 ? box.type : cn2[box.type];
    $('#type').text(tt);
    $('.binary_operators').find('a').each(function () {
      $(this).addClass('disabled_a');
    });
    $('.binary_operators').find('p').each(function () {
      $(this).addClass('not_p');
    });
    $('.multivariate_operators').find('a').each(function () {
      $(this).addClass('disabled_a');
    });
    $('.multivariate_operators').find('p').each(function () {
      $(this).addClass('not_p');
    });
    $('.temary_operators').find('a').each(function () {
      $(this).addClass('disabled_a');
    });
    $('.temary_operators').find('p').each(function () {
      $(this).addClass('not_p');
    });
  } else if (borders.length != 0) {
    $('#edit').addClass('disabled_a');
    $('#remove').addClass('disabled_a');
    $('#id').text(not_select);
    $('#type').text(not_select);
    var flag = false;
    for (var i = 0; i < borders.length; i++) {
      var box = borders[i];
      if (box.className == "green") {
        flag = true;
        break;
      }
    }
    if (!flag) {
      if (borders.length == 2) {
        $('.binary_operators').find('a').each(function () {
          $(this).removeClass('disabled_a');
        });
        $('.binary_operators').find('p').each(function () {
          $(this).removeClass('not_p');
        });
        $('.temary_operators').find('a').each(function () {
          $(this).addClass('disabled_a');
        });
      } else if (borders.length == 3) {
        $('.binary_operators').find('a').each(function () {
          $(this).addClass('disabled_a');
        });
        $('.binary_operators').find('p').each(function () {
          $(this).addClass('not_p');
        });
        $('.temary_operators').find('a').each(function () {
          $(this).removeClass('disabled_a');
        });
        $('.temary_operators').find('p').each(function () {
          $(this).removeClass('not_p');
        });
      } else {
        $('.unary_operators').find('a').each(function () {
          $(this).addClass('disabled_a');
        });
        $('.unary_operators').find('a').each(function () {
          $(this).addClass('disabled_a');
        });
        $('.binary_operators').find('p').each(function () {
          $(this).addClass('not_p');
        });
        $('.temary_operators').find('a').each(function () {
          $(this).addClass('disabled_a');
        });
        $('.temary_operators').find('p').each(function () {
          $(this).addClass('not_p');
        });
      }
      $('.signal_i_o').find('a').each(function () {
        $(this).addClass('disabled_a');
      });
      $('.unary_operators').find('a').each(function () {
        $(this).addClass('disabled_a');
      });
      $('.unary_operators').find('p').each(function () {
        $(this).addClass('not_p');
      });
      $('[language=output_signal]').addClass('disabled_a');
      $('[language=remove]').removeClass('disabled_a');
      $('.multivariate_operators').find('a').each(function () {
        $(this).removeClass('disabled_a');
      });
      $('.multivariate_operators').find('p').each(function () {
        $(this).removeClass('not_p');
      });
    } else {
      $('#remove').removeClass('disabled_a');
      $('.unary_operators').find('a').each(function () {
        $(this).addClass('disabled_a');
      });
      $('.unary_operators').find('p').each(function () {
        $(this).addClass('not_p');
      });
      $('.binary_operators').find('a').each(function () {
        $(this).addClass('disabled_a');
      });
      $('.binary_operators').find('p').each(function () {
        $(this).addClass('not_p');
      });
      $('.temary_operators').find('a').each(function () {
        $(this).addClass('disabled_a');
      });
      $('.temary_operators').find('p').each(function () {
        $(this).addClass('not_p');
      });
      $('.multivariate_operators').find('a').each(function () {
        $(this).addClass('disabled_a');
      });
      $('.multivariate_operators').find('p').each(function () {
        $(this).addClass('not_p');
      });
      $('[language=output_signal]').addClass('disabled_a');
    }
  } else {
    $('#id').text(not_select);
    $('#type').text(not_select);
    $('.unary_operators').find('a').each(function () {
      $(this).addClass('disabled_a');
    });
    $('.unary_operators').find('p').each(function () {
      $(this).addClass('not_p');
    });
    $('.binary_operators').find('a').each(function () {
      $(this).addClass('disabled_a');
    });
    $('.binary_operators').find('p').each(function () {
      $(this).addClass('not_p');
    });
    $('.temary_operators').find('a').each(function () {
      $(this).addClass('disabled_a');
    });
    $('.temary_operators').find('p').each(function () {
      $(this).addClass('not_p');
    });
    $('[language=output_signal]').addClass('disabled_a');
    $('#edit').addClass('disabled_a');
    $('#remove').addClass('disabled_a');
  }
}

$(".blue,.orange,.green").unbind("mousedown").bind("contextmenu", function (e) {
  e.preventDefault();
  return false;
});

$(".blue,.orange,.green").unbind("mousedown").bind("mousedown", function (event) {
  if (event.which == 3) { //右键
    if ($(this).attr('id') == undefined) {
      $(this).attr('id', 'border');
      selected_arr.push($(this).attr("num"));
    } else {
      selected_arr = filter_id(this);
      $(this).removeAttr('id');
    }
  } else if (event.which == 1) { //左键
    $(this).attr('id', 'border').siblings().removeAttr('id');
    selected_arr = [$(this).attr("num")];
  }
  checkBorder();
});

function filter_id(obj) {
  var arr = [];
  arr = selected_arr.filter((val, i) => {
    return val != $(obj).attr("num")
  });
  return arr;
}
$('#canvas').click(function () {
  resetting();
  $('.container>.left>div>div').each(function () {
    if ($(this).attr('id') != undefined) $(this).removeAttr('id');
  });
  selected_arr = [];
})

function remove(obj) {
  if ($(obj).hasClass('disabled_a')) return
  var arr = [];
  //选出选中的节点
  $('.container>.left>div>div').each(function () {
    if ($(this).attr('id') != undefined) {
      var parent_id = $(this).attr('num');
      var box = findById(parent_id);
      arr.push(box);
    }
  });
  arr.sort(sortBox);
  var indexArr = [];
  for (var i = 0; i < arr.length; i++) {
    var box = arr[i];
    var parent_id = box.id;
    if (box.rank == -1) {
      arr.splice(i, 1);
      deleteById(box.id);
      indexArr.push(parent_id);
      i--;
    }
  }
  for (var i = boxArr.length - 1; i >= 0; i--) {
    var box = boxArr[i];
    var arr2 = box.sonIds;
    var flag = false;
    for (var k = arr2.length - 1; k >= 0; k--) {
      var box = findById(arr2[k]);
      if (box != undefined) {
        flag = true;
      } else {
        boxArr.splice(arr2[k], 1);
        arr.splice(arr2[k], 1);
        arr2.splice(k, 1);
      }
    }
    for (var j = 0; j < arr.length; j++) {
      if (box.id == arr[j].id && !flag) {
        indexArr.push(box.id);
        arr.splice(j, 1);
        boxArr.splice(i, 1);
        break;
      }
    }
  }
  $('.container>.left>div>div').each(function () {
    if ($(this).attr('id') != undefined) {
      var parent_id = $(this).attr('num');
      if (indexArr.indexOf(Number(parent_id)) != -1) {
        $(this).remove();
      }
    }
  });
  if (arr.length != 0) {
    var txt = biGetLanguage() == 1 ? "Can't remove some nodes because of dependency." : "无法移除被依赖的节点.";
    var t = biGetLanguage() == 1 ? "Notice" : "消息";
    biAlert(txt, t);
  }
  resetting();
  boxChange();
  setConfig();
}

function deleteById(parent_id) {
  for (var i = 0; i < boxArr.length; i++) {
    var box = boxArr[i];
    if (parent_id == box.id) {
      boxArr.splice(i, 1);
      break;
    }
  }
}
//重置
function resetting() {
  $('#edit').addClass('disabled_a');
  $('#remove').addClass('disabled_a');
  $('#id').text(not_select);
  $('#type').text(not_select);
  $('.signal_i_o').find('a').each(function () {
    $(this).removeClass('disabled_a');
  });
  $('[language=output_signal]').addClass('disabled_a');
  $('.unary_operators').find('a').each(function () {
    $(this).addClass('disabled_a');
  });
  $('.unary_operators').find('p').each(function () {
    $(this).addClass('not_p');
  });
  $('.binary_operators').find('a').each(function () {
    $(this).addClass('disabled_a');
  });
  $('.binary_operators').find('p').each(function () {
    $(this).addClass('not_p');
  });
  $('.temary_operators').find('a').each(function () {
    $(this).addClass('disabled_a');
  });
  $('.temary_operators').find('p').each(function () {
    $(this).addClass('not_p');
  });
  $('.multivariate_operators').find('a').each(function () {
    $(this).addClass('disabled_a');
  });
  $('.multivariate_operators').find('p').each(function () {
    $(this).addClass('not_p');
  });
}
//改变box位置
function boxChange() {
  var borderArr = [];
  $('.container>.left>div>div').each(function () {
    var num = $(this).attr('num');
    num = parseInt(num);
    if ($(this).attr('id') != undefined) borderArr.push(num);
  });
  $('.container>.left>div>div').each(function () {
    $(this).remove();
  });
  lineArr = [];
  var blueArr = [],
    orangeArr = [],
    greenArr = [];
  var maxLen = 0;
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
    if (arr.length > maxLen) maxLen = arr.length;
  }
  if (blueArr.length > maxLen) maxLen = blueArr.length;
  var len = newOrangeArr.length != 0 ? 90 : 0;
  if (greenArr.length != 0) {
    var m = initLeft + 120 + initLeft + (newOrangeArr.length) * (len + initLeft) + 120 + 20;
    if (m > 750) {
      minLeft = 750 - m;
      $('.container>.left>div').css({
        "width": m + "px"
      });
      canvas.width = m;
    } else if (canvas.width > 750) {
      $('.container>.left>div').css({
        "width": 750 + "px",
        "left": 0 + "px"
      });
      canvas.width = 750;
      minLeft = 0;
    }
  } else if (newOrangeArr.length != 0) {
    var box = newOrangeArr[newOrangeArr.length - 1][0];
    var m = initLeft + 120 + (parseInt(box.rank) - 1) * 125 + initLeft + 90 + 20;
    if (m > 750) {
      minLeft = 750 - m;
      $('.container>.left>div').css({
        "width": m + "px"
      });
      canvas.width = m;
    } else if (canvas.width > 750) {
      $('.container>.left>div').css({
        "width": 750 + "px",
        "left": 0 + "px"
      });
      canvas.width = 750;
      minLeft = 0;
    }
  }
  var h = initTop + (initInterval + 30) * (maxLen - 1) + 30 + 20;
  if (h > 622) {
    minTop = 622 - h;
    $('.container>.left>div').css({
      "height": h + "px"
    });
    canvas.height = h;
  } else if (canvas.height > 622) {
    $('.container>.left>div').css({
      "height": 622 + "px",
      "top": 0 + "px"
    });
    canvas.height = 622;
    minTop = 0
  }
  var blueLen = blueArr.length;
  if (blueLen > maxLen) maxLen = blueLen;
  var greenLen = greenArr.length;
  if (greenLen > maxLen) maxLen = greenLen;
  //blue
  for (var i = 0; i < blueArr.length; i++) {
    var box = blueArr[i],
      top;
    if (blueLen == maxLen) {
      top = initTop + (initInterval + box.height) * i;
    } else {
      var scale = maxLen / blueLen;
      top = initTop + (scale - 1) * 20 + i * scale * 40
    }
    box.top = top;
    box.left = initLeft;
    createBox(box, borderArr, newOrangeArr.length);
  }
  //orange
  for (var i = 0; i < newOrangeArr.length; i++) {
    var arr = newOrangeArr[i];
    for (var j = 0; j < arr.length; j++) {
      var box = arr[j],
        top;
      if (arr.length == maxLen) {
        top = initTop + (initInterval + box.height) * j;
      } else {
        var scale = maxLen / arr.length;
        top = initTop + (scale - 1) * 20 + j * scale * 40;
      }
      var width = (parseInt(box.rank) - 1) * 125;
      box.top = top;
      box.left = initLeft + 120 + width + initLeft;
      createBox(box, borderArr, newOrangeArr.length);
    }
  }
  //green
  for (var i = 0; i < greenArr.length; i++) {
    var box = greenArr[i],
      top;
    if (greenLen == maxLen) {
      top = initTop + (initInterval + box.height) * i;
    } else {
      var scale = maxLen / greenLen;
      top = initTop + (scale - 1) * 20 + i * scale * 40;
    }
    box.top = top;
    box.left = initLeft + box.width + initLeft + (newOrangeArr.length) * (len + initLeft);
    createBox(box, borderArr, newOrangeArr.length);
  }
  drawLines(lineArr);
  setConfig();
}
//清除画布
function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

/**
 * 加载配置
 */
function loadConfig(obj) {
  if (obj == null) return;
  obj.enabled == "yes" ? $('.container>.right [name=enabled]').attr('checked', true) : $('.container>.right [name=enabled]').removeAttr('checked');
  $('.container>.right [name=rate]').val(compareVal($("[name=rate]"), obj.rate));
}

function setConfig() {
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?>";
  text += "<root enabled=\"" + dialogConfig["enabled"] + "\" rate=\"" + dialogConfig["rate"] + "\">";
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
      case "devide_signal":
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
  if (biGetLanguage() == 1) {
    $('[language]').each(function () {
      var value = $(this).attr('language');
      $(this).text(en[value])
    });
    not_config = en["not_config"];
    not_select = en["not_select"];
  } else {
    $('[language]').each(function () {
      var value = $(this).attr('language');
      $(this).text(cn[value])
    });
    not_config = cn["not_config"];
    not_select = cn["not_select"];
  }
  for (var key in moduleConfigs) {
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(moduleConfigs[key], "text/xml");
    var countrys = xmlDoc.getElementsByTagName('root');
    var keys = countrys[0].attributes;
    for (var i = 0; i < keys.length; i++) {
      dialogConfig[keys[i].nodeName] = keys[i].nodeValue;
    }
    var num = 0;
    for (var i = 0; i < countrys[0].childNodes.length; i++) {
      var ele = countrys[0].childNodes[i];
      var rank = 0;
      if (i > 1) rank = i - 1;
      for (var j = 0; j < ele.childNodes.length; j++) {
        var parent_id = parseInt(ele.childNodes[j].getAttribute("id"));
        if (parent_id > num) num = parent_id;
        var type = ele.childNodes[j].getAttribute("type");
        var box;
        if (type == "constant") {
          var v = ele.childNodes[j].getAttribute("value");
          var name = v == "" ? 0 : v;
          box = new Constant(120, 30, name, "Input constant", parent_id, "blue", 0, 0, 0, [], [], true, type, v);
        } else if (type == "input") {
          var signal = ele.childNodes[j].getAttribute("signal");
          var interpolation = ele.childNodes[j].getAttribute("nearest");
          var arr = signal.split(":")
          box = new InputSignal(120, 30, arr[2], "Input signal", parent_id, "blue", 0, 0, 0, [], [], true, type, signal, arr[2], interpolation);
        } else if (type == "output") {
          var slot = ele.childNodes[j].getAttribute("name");
          var source = ele.childNodes[j].getAttribute("source");
          box = new SignalOutput(120, 30, slot, "Output signal", parent_id, "green", -1, 0, 0, [source], [], true, type, slot);
        } else if (type == "unary_condition") {
          var source = ele.childNodes[j].getAttribute("source");
          var compare = ele.childNodes[j].getAttribute("compare");
          var values = ele.childNodes[j].getAttribute("values");
          var use_reset = ele.childNodes[j].getAttribute("use_reset");
          var reset_compare = ele.childNodes[j].getAttribute("reset_compare");
          var reset_values = ele.childNodes[j].getAttribute("reset_values");
          var name = compareArr[Number(compare)] + values + "(" + compareArr[Number(reset_compare)] + reset_values + ")";
          box = new Condition(90, 30, name, "Condition with number", parent_id, "orange", rank, 0, 0, [source], [], true, type, compare, values, reset_compare, reset_values, (use_reset == "yes" ? true : false));
        } else if (type == "add_number") {
          var source = ele.childNodes[j].getAttribute("source");
          var value = ele.childNodes[j].getAttribute("value");
          var name = value >= 0 ? "+" + value : value;
          box = new Add(90, 30, name, "Add / Subtract number", parent_id, "orange", rank, 0, 0, [source], [], true, type, value);
        } else if (type == "mul_number") {
          var source = ele.childNodes[j].getAttribute("source");
          var value = ele.childNodes[j].getAttribute("value");
          var name = value >= 0 ? "x" + value : "x" + "(" + value + ")";
          box = new Add(90, 30, name, "Multiply number", parent_id, "orange", rank, 0, 0, [source], [], true, type, value);
        } else if (type == "abs") {
          var source = ele.childNodes[j].getAttribute("source");
          box = new Box(90, 30, "abs", "Absolute", parent_id, "orange", rank, 0, 0, [source], [], false, type);
        } else if (type == "power") {
          var source = ele.childNodes[j].getAttribute("source");
          var value = ele.childNodes[j].getAttribute("value");
          var defaul = ele.childNodes[j].getAttribute("default");
          var name = "^" + value;
          box = new Power(90, 30, name, "Power", parent_id, "orange", rank, 0, 0, [source], [], true, type, value, defaul);
        } else if (type == "holder") {
          var source = ele.childNodes[j].getAttribute("source");
          var duration = ele.childNodes[j].getAttribute("duration");
          var name = "hold " + duration + "s";
          box = new SignalHolder(90, 30, name, "Signal holder", parent_id, "orange", rank, 0, 0, [source], [], true, type, duration);
        } else if (type == "ceiling") {
          var source = ele.childNodes[j].getAttribute("source");
          box = new Box(90, 30, "ceil", "Ceiling", parent_id, "orange", rank, 0, 0, [source], [], false, type);
        } else if (type == "floor") {
          var source = ele.childNodes[j].getAttribute("source");
          box = new Box(90, 30, "floor", "Floor", parent_id, "orange", rank, 0, 0, [source], [], false, type);
        } else if (type == "round") {
          var source = ele.childNodes[j].getAttribute("source");
          box = new Box(90, 30, "round", "Round", parent_id, "orange", rank, 0, 0, [source], [], false, type);
        } else if (type == "average") {
          var source = ele.childNodes[j].getAttribute("source");
          box = new Box(90, 30, "avg", "Average", parent_id, "orange", rank, 0, 0, [source], [], false, type);
        } else if (type == "integral") {
          var source = ele.childNodes[j].getAttribute("source");
          box = new Box(90, 30, "integral", "Integral", parent_id, "orange", rank, 0, 0, [source], [], false, type);
        } else if (type == "map") {
          var source = ele.childNodes[j].getAttribute("source");
          var defaultValue = ele.childNodes[j].getAttribute("default_mode_passthrough") == "yes" ? "passthrough" : "constant";
          var value = ele.childNodes[j].getAttribute("default_constant");
          var map_values = ele.childNodes[j].getAttribute("map_values");
          var arr = map_values.split(",");
          var input = [],
            output = [];
          for (var m = 0; m < arr.length; m++) {
            if (m % 2 == 0) input.push(arr[m]);
            if (m % 2 != 0) output.push(arr[m]);
          }
          box = new MapNumber(90, 30, "map", "Number mapping", parent_id, "orange", rank, 0, 0, [source], [], true, 'map', defaultValue, value, input, output);
        } else if (type == "lpf_1st") {
          var source = ele.childNodes[j].getAttribute("source");
          var time_coef = ele.childNodes[j].getAttribute("time_coef");
          var name = time_coef;
          box = new OrderLPF(90, 30, name, "1st-order low pass filter", parent_id, "orange", rank, 0, 0, [source], [], true, 'lpf_1st', time_coef);
        } else if (type == "mod") {
          var source = ele.childNodes[j].getAttribute("source");
          var mod_number = ele.childNodes[j].getAttribute("mod_number");
          var name = "%" + mod_number;
          box = new Mod(90, 30, name, "Mod number", parent_id, "orange", 1, 0, 0, [source], [], true, 'mod', mod_number);
        } else if (type == "and" || type == "or" || type == "add_signal" || type == "mul_signal") {
          var source1 = ele.childNodes[j].getAttribute("source1");
          var source2 = ele.childNodes[j].getAttribute("source2");
          var name = binary_operators[type].name;
          var typeV = binary_operators[type].type;
          box = new Box(90, 30, name, typeV, parent_id, "orange", rank, 0, 0, [source1, source2], [], false, type);
        } else if (type == "devide_signal") {
          var source1 = ele.childNodes[j].getAttribute("source1");
          var source2 = ele.childNodes[j].getAttribute("source2");
          var value = ele.childNodes[j].getAttribute("default");
          var name = "{" + source1 + "} / {" + source2 + "}";
          box = new Decide(90, 30, name, "Divide", parent_id, "orange", rank, 0, 0, [source1, source2], [], true, 'devide_signal', value);
        } else if (type == "binary_condition") {
          var source1 = ele.childNodes[j].getAttribute("source1");
          var source2 = ele.childNodes[j].getAttribute("source2");
          var compare = ele.childNodes[j].getAttribute("compare");
          var name = "{" + source1 + "} " + compareArr[Number(compare)] + " " + "{" + source2 + "}";
          box = new ConditionWith(90, 30, name, "Condition with signal", parent_id, "orange", rank, 0, 0, [source1, source2], [], true, 'binary_condition', compare);
        } else if (type == "weight_average") {
          var source1 = ele.childNodes[j].getAttribute("source1");
          var source2 = ele.childNodes[j].getAttribute("source2");
          box = new Box(90, 30, "avg {" + source1 + "}", "Weighted average", parent_id, "orange", rank, 0, 0, [source1, source2], [], true, type);
        } else if (type == "reset_integral") {
          var source1 = ele.childNodes[j].getAttribute("source1");
          var source2 = ele.childNodes[j].getAttribute("source2");
          box = new Box(90, 30, "integral {" + source1 + "}", "Resettable integeral", parent_id, "orange", rank, 0, 0, [source1, source2], [], true, type);
        } else if (type == "ifelse_condition") {
          var source1 = ele.childNodes[j].getAttribute("source1");
          var source2 = ele.childNodes[j].getAttribute("source2");
          var source3 = ele.childNodes[j].getAttribute("source3");
          var name = "{" + source1 + "}=0?" + "{" + source2 + "}:" + "{" + source3 + "}";
          box = new Box(90, 30, name, "If-else condition", parent_id, "orange", rank, 0, 0, [source1, source2, source3], [], true, type);
        } else if (type == "in_range") {
          var source1 = ele.childNodes[j].getAttribute("source1");
          var source2 = ele.childNodes[j].getAttribute("source2");
          var source3 = ele.childNodes[j].getAttribute("source3");
          var name = "in {" + source2 + "} ~ " + "{" + source3 + "}";
          box = new Box(90, 30, name, "In-range condition", parent_id, "orange", rank, 0, 0, [source1, source2, source3], [], true, type);
        } else if (type == "clamp") {
          var source1 = ele.childNodes[j].getAttribute("source1");
          var source2 = ele.childNodes[j].getAttribute("source2");
          var source3 = ele.childNodes[j].getAttribute("source3");
          var name = "clamp {" + source2 + "} ~ " + "{" + source3 + "}";
          box = new Box(90, 30, name, "Clamp signal", parent_id, "orange", rank, 0, 0, [source1, source2, source3], [], true, type);
        } else if (type == "min") {
          var arr = ele.childNodes[j].textContent.split(",");
          box = new Box(90, 30, "min", "Minimum", parent_id, "orange", rank, 0, 0, arr, [], false, type);
        } else if (type == "max") {
          var arr = ele.childNodes[j].textContent.split(",");
          box = new Box(90, 30, "max", "Maximum", parent_id, "orange", rank, 0, 0, arr, [], false, type);
        } else if (type == "sub_signal") {
          var source1 = ele.childNodes[j].getAttribute("source1");
          var source2 = ele.childNodes[j].getAttribute("source2");
          var name = "{" + source1 + "}-{" + source2 + "}";
          box = new Box(90, 30, name, "Subtract signal", parent_id, "orange", rank, 0, 0, [source1, source2], [], true, type);
        }
        boxArr.push(box);
      }
    }
    id = num;
    loadConfig(dialogConfig);
    boxChange();
  }
}

$("a").click(function () {
  if ($(this).hasClass("disabled_a")) return;
  var type = $(this).attr('type');
  if (["Maximum", "Minimum", "Logical and", "Logical or", "Add signal", "Absolute", "Ceiling", "Floor", "Round", "Average", "Integral", "Multiply signal"].includes(type)) {
    editFlag = false;
    if ($(this).hasClass('disabled_a')) return;
    id++;
    var name = $(this).attr('language');
    var typeValue = $(this).attr('typeValue');
    var borders = [],
      arr = [];
    $('.container>.left>div>div').each(function () {
      if ($(this).attr('id') != undefined) {
        var box = findById($(this).attr('num'));
        borders.push(box);
        arr.push(box.id);
      }
    });
    borders.sort(sortBox);
    var rank = borders[borders.length - 1].rank == "0" ? 1 : parseInt(borders[borders.length - 1].rank) + 1;
    var box = new Box(90, 30, name, type, id, "orange", rank, 0, 0, arr, [], false, typeValue);
    boxArr.push(box);
    boxChange();
  } else {
    var lang = $(this).attr("language");
    var text_id = $("#id").text();
    edit = lang == "edit";
    switch (lang == "edit" ? findById(text_id).type : type) {
      case "Input signal":
        openDialog("input_signal", text_id);
        break;
      case "Output signal":
        openDialog("output_signal", text_id);
        break;
      case "Input constant":
        openDialog("constant", text_id);
        break;
      case "Condition with number":
        openDialog("condition", text_id);
        break;
      case "Add / Subtract number":
        openDialog("add", text_id);
        break;
      case "Multiply number":
        openDialog("multiply", text_id);
        break;
      case "Power":
        openDialog("power", text_id);
        break;
      case "Signal holder":
        openDialog("holder", text_id);
        break;
      case "Number mapping":
        openDialog("map", text_id);
        break;
      case "1st-order low pass filter":
        openDialog("st_order", text_id);
        break;
      case "Mod number":
        openDialog("mod", text_id);
        break;
      case "Subtract signal":
        openDialog("subtract", text_id);
        break;
      case "Divide":
        openDialog("divide", text_id);
        break;
      case "Condition with signal":
        openDialog("condition_with", text_id);
        break;
      case "Weighted average":
        openDialog("weighted", text_id);
        break;
      case "Resettable integeral":
        openDialog("resettable", text_id);
        break;
      case "If-else condition":
        openDialog("if_else", text_id);
        break;
      case "In-range condition":
        openDialog("in_range", text_id);
        break;
      case "Clamp signal":
        openDialog("clamp", text_id);
        break;
    }
  }
})

function openDialog(name, boxId) {
  if (!edit) id++;
  //boxId为selectnode 的id.text()
  var config = JSON.stringify(dialogConfig) + "|" + JSON.stringify(boxArr) + "|" + boxId + "|" + id + "|" + edit;
  switch (name) {
    case "input_signal": {
      biOpenChildDialog("signal-calculation." + name + ".html", "Input Signal", new BISize(238, 100), config);
      break;
    }
    case "output_signal": {
      biOpenChildDialog("signal-calculation." + name + ".html", "Output Signal", new BISize(271, 70), config);
      break;
    }
    case "constant": {
      biOpenChildDialog("signal-calculation." + name + ".html", "Input constant", new BISize(250, 70), config);
      break;
    }
    case "condition": {
      biOpenChildDialog("signal-calculation." + name + ".html", "Condition sidth number", new BISize(297, 140), config);
      break;
    }
    case "add": {
      biOpenChildDialog("signal-calculation." + name + ".html", "Add Number", new BISize(205, 80), config);
      break;
    }
    case "multiply": {
      biOpenChildDialog("signal-calculation." + name + ".html", "Multiply Number", new BISize(225, 57), config);
      break;
    }
    case "power": {
      biOpenChildDialog("signal-calculation." + name + ".html", "Power", new BISize(204, 108), config);
      break;
    }
    case "holder": {
      biOpenChildDialog("signal-calculation." + name + ".html", "Signal Holder", new BISize(252, 75), config);
      break;
    }
    case "map": {
      biOpenChildDialog("signal-calculation." + name + ".html", "Number Mapping", new BISize(356, 208), config);
      break;
    }
    case "st_order": {
      biOpenChildDialog("signal-calculation." + name + ".html", "1st-order low pass filter", new BISize(300, 80), config);
      break;
    }
    case "mod": {
      biOpenChildDialog("signal-calculation." + name + ".html", "Mod number", new BISize(210, 70), config);
      break;
    }
    case "subtract": {
      var str = "";
      if (edit) {
        str = findById(boxId).parentIds.join();
      } else {
        str = selected_arr.join();
      }
      biOpenChildDialog("signal-calculation." + name + ".html", "Subtract signal", new BISize(306, 86), config + "|" + str);
      break;
    }
    case "divide": {
      var str = "";
      if (edit) {
        str = findById(boxId).parentIds.join();
      } else {
        str = selected_arr.join();
      }
      biOpenChildDialog("signal-calculation." + name + ".html", "Divide signal", new BISize(388, 130), config + "|" + str);
      break;
    }
    case "condition_with": {
      var str = "";
      if (edit) {
        str = findById(boxId).parentIds.join();
      } else {
        str = selected_arr.join();
      }
      biOpenChildDialog("signal-calculation." + name + ".html", "Condition with signal", new BISize(362, 58), config + "|" + str);
      break;
    }
    case "weighted": {
      var str = "";
      if (edit) {
        str = findById(boxId).parentIds.join();
      } else {
        str = selected_arr.join();
      }
      biOpenChildDialog("signal-calculation." + name + ".html", "Weighted average", new BISize(349, 80), config + "|" + str);
      break;
    }
    case "resettable": {
      var str = "";
      if (edit) {
        str = findById(boxId).parentIds.join();
      } else {
        str = selected_arr.join();
      }
      biOpenChildDialog("signal-calculation." + name + ".html", "Resettable integral", new BISize(349, 100), config + "|" + str);
      break;
    }
    case "if_else":
    case "in_range":
    case "clamp": {
      var name2 = name == "if_else" ? "If-else condition" : (name == "in_range" ? "In-range condition" : "Clamp signal");
      var str = "";
      var str = "";
      if (edit) {
        str = findById(boxId).parentIds.join();
      } else {
        str = selected_arr.join();
      }
      biOpenChildDialog("signal-calculation." + name + ".html", name2, new BISize(319, 154), config + "|" + str + "|" + name2);
      break;
    }
  }
}

function biOnClosedChildDialog(name, res) {
  var config = biGetLocalVariable("signal-calculation");
  if (Boolean(JSON.parse(config)) && config != "null") {
    boxArr = JSON.parse(config);
    boxChange();
  }
}