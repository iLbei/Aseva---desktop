var not_config = "",
  dialogConfig = [],
  reg = /^[a-zA-Z]:/,
  channels = [],
  not_available = "",
  newChannels = [];

/*---------------input [type=number]--------------*/
$('input[type=number]').on({
  "change": function () {
    $(this).val(compareVal(this, $(this).val()));
  },
  'input': function (e) {
    if (e.which == undefined) {
      var step = $(this).attr("step").length - 2;
      var val = Number($(this).val());
      $(this).val(step > 0 ? val.toFixed(step) : val);
    }
    changeVal(this);
  },
  'keypress': function (e) {
    if (!(e.charCode >= 48 && e.charCode <= 57) && !(e.charCode == 45 || e.charCode == 46)) {
      return false;
    }
  }
})

/*----------配置读取与存储-----------*/
$('[name]').change(function () {
  changeVal(this);
});

$("button").click(function () {
  biOpenChildDialog("v2v-offline-sync.import.html", "Object Data Import Tool", new BISize(520, 422, ""))
})

function compareVal(obj, val) {
  var step = $(obj).attr('step').length > 2 ? $(obj).attr('step').length - 2 : 0,
    v = Number(val),
    newVal = 0;
  if (isNaN(v)) {
    newVal = Number($(obj).attr('value'));
  } else {
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

function changeVal(obj) {
  var type = $(obj).attr("type");
  var val = $(obj).val();
  if (type == 'checkbox') {
    val = $(obj).is(':checked') ? "yes" : "no";
  } else if (type == "number") {
    val = compareVal(obj, val);
  }
  dialogConfig[$(obj).parents("li")[$(obj).parents("li").length - 1].id][$(obj).attr("name")] = val;
  setConfig();
}

function setConfig() {
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root";
  for (var i in dialogConfig[0]) {
    text += " " + i + "=\"" + dialogConfig[0][i] + "\"";
  }
  text += ">"
  for (var i = 1; i < dialogConfig.length; i++) {
    text += i < 6 ? "<config" : "<importConfig";
    for (var j in dialogConfig[i]) {
      text += " " + j + "=\"" + dialogConfig[i][j] + "\"";
    }
    text += "/>"
  }
  text += "</root>";
  biSetModuleConfig("v2v-offline-sync.pluginv2vutilities", text);
}

function biOnInitEx(config, moduleConfigs) {
  var data_path = biGetDataPath();
  biQueryDirsInDirectory(data_path);
  let lang = biGetLanguage() == 1 ? en : cn;
  $('[language]').each(function () {
    var value = $(this).attr('language');
    $(this).text(lang[value])
  });
  not_available = lang["not_available"];
  not_config = lang["not_config"];
  for (var key in moduleConfigs) {
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(moduleConfigs[key], "text/xml");
    var child = xmlDoc.childNodes[0].childNodes;
    var root = xmlDoc.childNodes[0].attributes;
    var obj = new Object()
    for (var i = 0; i < root.length; i++) {
      obj[root[i].nodeName] = root[i].nodeValue;
    }
    dialogConfig.push(obj);
    for (var i = 0; i < child.length; i++) {
      var key = child[i].attributes;
      obj = new Object();
      for (var j = 0; j < key.length; j++) {
        obj[key[j].nodeName] = key[j].nodeValue;
      }
      dialogConfig.push(obj);
    }
  }
  loadConfig();
}

function loadConfig() {
  var text = "";
  for (var i = 65; i < 72; i++) {
    text += "<option value = \"" + (i - 65) + "\" > Channel " + String.fromCharCode(i) + (newChannels.indexOf(i - 65) == -1 || newChannels.length == 0 ? not_available : "") + " </option>";
  }
  $("[name=SubjectGNSS_IMUChannel]").empty().append(text);
  $('.processing>ul>li').each(function (i) {
    $(this).find("[name]").each(function () {
      var val = dialogConfig[i][$(this).attr('name')];
      var type = $(this).attr('type');
      if (Boolean(val)) {
        if (type == 'checkbox') {
          $(this).prop('checked', val == 'yes');
        } else if (type == "number") {
          $(this).val(compareVal(this, val));
        } else {
          $(this).val(val);
        }
      };
    })
  })
}

function biOnQueriedDirsInDirectory(dirs, path) {
  var dir = dirs[0].split("\n");
  var dirs_paths = [];
  for (var i in dir) {
    dirs_paths.push(dir[i] + (reg.test(path) ? "\\output\\online\\sample" : "/output/online/sample"));
  }
  for (var i of dirs_paths) {
    biQueryFilesInDirectory(i);
  }
}

function biOnQueriedFilesInDirectory(files, path) {
  var newfiles = "";
  if (files != null) {
    newfiles = files[0].split("\n");
    for (var i of newfiles) {
      if (i.indexOf("gnssimu-sample-v5") != -1 || i.indexOf("gnssimu-sample-v6") != -1 || i.indexOf("gnssimu-sample-v7") != -1) channels.push(Number(i.substr(i.indexOf("@") + 1, 1)))
    }
    newChannels = channels.filter((ele, i, arr) => {
      return arr.indexOf(ele) === i;
    });
    loadConfig()
  };
}

function biOnClosedChildDialog(htmlNmae, result) {
  if (biGetLocalVariable("v2v-offline-sync") != null) {
    dialogConfig = JSON.parse(biGetLocalVariable("v2v-offline-sync"));
  }
}