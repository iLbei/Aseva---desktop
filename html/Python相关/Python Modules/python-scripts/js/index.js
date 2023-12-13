var modules = [],
  remove_modules = [],
  bi_common_js = 0,
  inputs = "",
  none = "",
  reg = /^[A-Za-z_][A-Za-z_0-9]{0,}$/im,
  regID = /^[A-Za-z0-9][A-Za-z0-9-]{0,}$/im,
  input_signal = "",
  input_sample = "",
  output_siganl = "",
  output_sample = "",
  output_scene = "",
  output_report = "",
  import_paths = "",
  add_python_module = "",
  overwritefreqtitle,
  overwriteparamtitle,
  activeIndex = 0, //选中模块的索引
  templateNames = {}, //获取所有的模板id和模板名称
  nowTemplateConfig = [], //当前模板配置
  newModule = false,
  templateMode = "",
  nowParams = [], //使用模板时当前模板的参数
  IDs = {}, //一般模式,修改模板 moduleID
  normalName = {},
  posixIDs = {}, //模板模式id后缀
  nowID = 0,
  nowName = 0,
  languageType = 1;
$(function () {
  if ($('.module_content>p.active').length == 0) {
    aDisabled('')
  }
  $('.param_val').attr('disabled', true);
})

//模板列表点击切换
$('.module_content').on('click', 'p', function () {
  if ($(this).hasClass("disabled_a")) return;
  $(this).addClass('active').siblings().removeClass('active');
  activeIndex = $(this).index();
  $("[language=export_module]").removeClass("disabled_a");
  // 不同模式
  if (modules[activeIndex][0]["template"] != undefined && modules[activeIndex][0]["template"] != "") { //使用模板
    templateMode = "use_mode";
    biQueryPythonTemplateInfo(modules[activeIndex][0]["template"]);
    if (modules[activeIndex][0]["template_postfix"].indexOf("default") != -1) {
      if (modules[activeIndex][0]["template_postfix"] == "default") {
        nowID = 0;
      } else {
        nowID = modules[activeIndex][0]["template_postfix"].substring(modules[activeIndex][0]["template_postfix"].lastIndexOf("-") + 1,);
      }
    }
  } else { //一般模式|修改模板|导入的模块
    getContentVal(modules[activeIndex]);
    //name
    var name2 = languageType == 1 ? modules[activeIndex][0]["name"] : (Boolean(modules[activeIndex][0]["name_ch"]) ? modules[activeIndex][0]["name_ch"] : modules[activeIndex][0]["name"]);
    for (let i in normalName) {
      if (name2.indexOf(i) != -1) {
        if (normalName[name2] != undefined) {
          nowName = 0;
        } else {
          nowName = name2.substring(name2.lastIndexOf(" ") + 1,);
        }
        break;
      }
    }
    //moduleID
    for (let i in IDs) {
      if (modules[activeIndex][0]["id"].indexOf(i) != -1) {
        if (IDs[modules[activeIndex][0]["id"]] != undefined) {
          nowID = 0;
        } else {
          nowID = modules[activeIndex][0]["id"].substring(modules[activeIndex][0]["id"].lastIndexOf("-") + 1,);
        }
        break;
      }
    }
  }
})
// language
$('a').on('click', function () {
  if ($(this).hasClass("disabled_a")) return;
  var lang = $(this).attr('language');
  switch (lang) {
    case 'remove_module':
      var msg = (biGetLanguage() == 1 ? "Are you sure to remove the module\"" : "是否移除模块\"") + $('.module_content>p.active>span:eq(1)').text() + "\"?";
      biConfirm("remove_module", msg, "Confirm");
      break;
    case 'add_module':
      biOpenChildDialog("python-scripts.addmodule.html", add_python_module, new BISize(284, 140));
      break;
    case 'import_code':
      biSelectPath('import_code', BISelectPathType.OpenFile, {
        '.py': 'Python script'
      });
      break;
    case 'export_code':
      biSelectPath('export_code', BISelectPathType.Directory);
      break;
    case 'import_module':
      biSelectPath('import_module', BISelectPathType.OpenFile, {
        '.asmc': '*.asmc'
      });
      break;
    case 'export_module':
      biSelectPath('export_module', BISelectPathType.CreateFile, {
        '.asmc': 'Aseva Module Config'
      });
      break;
    case 'save':
      for (var j = 0; j < $('.loop_list_content>div').length; j++) {
        var name = $('.loop_list>li').eq(j).attr('language');
        modules[activeIndex][0][name] = $('.loop_list_content>.item:eq(' + j + ')>textarea').val();
      }
      break;
    case 'abort':
      for (var j = 0; j < $('.loop_list_content>div').length; j++) {
        var name = $('.loop_list>li').eq(j).attr('language');
        $('.loop_list_content>.item').eq(j).find('textarea').val(modules[activeIndex][0][name] == undefined ? '' : modules[activeIndex][0][name]);
      }
      break;
  }
  if (["save", "abort"].includes(lang)) {
    $('.module_content>p,[language="add_module"],[language="import_module"],[language="export_module"],[language="export_code"],[language="remove_module"]').removeClass('disabled_a');
    $('[language=save],[language=abort]').addClass('disabled_a');
    setConfig();
  }
})
//  I/O  
$('a').on('click', function () {
  if ($(this).hasClass("disabled_a")) return;
  switch ($(this).attr('class')) {
    case 'in':
      biOpenChildDialog("python-scripts.in.html", input_signal, new BISize(555, 271), activeIndex);
      break;
    case 'sample_in':
      biOpenChildDialog("python-scripts.samplein.html", input_sample, new BISize(414, 313), activeIndex);
      break;
    case 'out':
      biOpenChildDialog("python-scripts.out.html", output_siganl, new BISize(255, 294), activeIndex);
      break;
    case 'sample_out':
      biOpenChildDialog("python-scripts.sampleout.html", output_sample, new BISize(640, 248), activeIndex);
      break;
    case 'scene_out':
      biOpenChildDialog("python-scripts.sceneout.html", output_scene, new BISize(500, 188), activeIndex);
      break;
    case 'report_out':
      biOpenChildDialog("python-scripts.reportout.html", output_report, new BISize(723, 540), activeIndex);
      break;
    case "import_path":
      biOpenChildDialog("python-scripts.importpath.html", import_paths, new BISize(700, 260), activeIndex);
      break;
    case "overwritedef": {
      biOpenChildDialog("python-scripts.overwritefreq.html", overwritefreqtitle, new BISize(290, 80), activeIndex);
      break;
    }
    case "overwriteparam": {
      biOpenChildDialog("python-scripts.overwriteparam.html", overwriteparamtitle, new BISize(432, 169), activeIndex + "|" + JSON.stringify(nowParams));
      break;
    }
  }
})

// b_center
$('.b_center input[type=checkbox]').on('change', function () {
  var name = $(this).attr('name');
  if ($(this).is(':checked')) {
    modules[activeIndex][0][name] = 'yes';
    if (name == 'enabled') $('.module_content .active>span:nth-child(1)').text('(O)');
  } else {
    modules[activeIndex][0][name] = 'no';
    if (name == 'enabled') $('.module_content .active>span:nth-child(1)').text('(X)');
  }

})
$('.b_center [name=freq]').change(function () {
  modules[activeIndex][0]['freq'] = compareVal(this, $(this).val());
  setConfig();
})
$('.b_center [name=name]').on({
  'input': function () {
    var count = 0;
    for (let i in modules) {
      if ((languageType == 1 ? modules[i][0]["name"] : modules[i][0]["name_ch"]) == $(this).val()) {
        count++;
      }
    }
    if ($(this).val().trim().length == 0 || count != 0) {
      $(this).addClass("red")
    } else {
      $(this).removeClass("red")
    }
  },
  'change': function () {
    var count = 0;
    for (var i in remove_modules) {
      if (remove_modules[i] == $('.module_content>p.active').attr('id')) count++;
    }
    if (count == 0) {
      remove_modules.push(Number($('.module_content .active').eq(0).attr('id')));
      $('.module_content>p.active').removeAttr('id');
    }
  },
  'blur': function () {
    if (!$(this).hasClass("red")) {
      $('.module_content>p.active').find('span:nth-child(2)').text($(this).val()).attr("value", $(this).val());
      $('.module_content>p.active').attr("title", $(this).val())
      if (templateMode == "normal_mode") {
        modules[activeIndex][0]["name"] = $(this).val();
        modules[activeIndex][0]["name_ch"] = $(this).val();
      } else {
        if (languageType == 1) {
          modules[activeIndex][0]["name"] = $(this).val();
        } else {
          modules[activeIndex][0]["name_ch"] = $(this).val();
        }
      }
      var name = "";
      for (let j in normalName) {
        if ($(this).val().indexOf(j) != -1) {
          name = j;
          break;
        }
      }
      var index = $(this).val().split(name + " ")[1];
      if (!isNaN(Number(nowName)) && Number(index)) {
        normalName[name] = JSON.parse(JSON.stringify(normalName[name]).replace(Number(nowName), Number(index)));
        normalName[name].sort((a, b) => {
          return a - b
        });
      }
      var name2 = languageType == 1 ? modules[activeIndex][0]["name"] : modules[activeIndex][0]["name_ch"];
      nowName = name2.substring(name2.lastIndexOf(" ") + 1,);
      setConfig();
    } else {
      $(this).val($(this).attr("value")).removeClass('red');
    }
  }
})
$("[name=id]").on({
  "input": function () {
    idPostfixCompare($(this).val());
  },
  "blur": function () {
    if ($(this).val().trim().length == 0 || $(this).hasClass("red")) {
      $(this).removeClass("red").addClass("green");
    } else {
      var modulesName = "";
      for (let j in IDs) {
        if ($(this).val().indexOf(j) != -1) {
          modulesName = j;
          break;
        }
      }
      if (modulesName != "") {
        var index = $(this).val().split(modulesName + "-")[1];
        if (!isNaN(Number(nowID)) && Number(index)) {
          IDs[modulesName] = JSON.parse(JSON.stringify(IDs[modulesName]).replace(Number(nowID), Number(index)));
          IDs[modulesName].sort((a, b) => {
            return a - b
          });
        }
        nowID = modules[activeIndex][0]["id"].substring(modules[activeIndex][0]["id"].lastIndexOf("-") + 1,);
      }
    }
    $(this).val(modules[activeIndex][0]["id"]);
    // modules[activeIndex][0]["id"] = $(this).attr("value");
    setConfig();
  }
})
$('input[type=number]').on({
  'change': function () {
    $(this).val(compareVal(this, $(this).val()));
  },
  'input': function (e) {
    if (e.which == undefined) {
      var step = $(this).attr("step").length - 2;
      var val = Number($(this).val());
      $(this).val(step > 0 ? val.toFixed(step) : val);
    }
    setConfig();
  },
  'keypress': function (e) {
    if (!(e.charCode >= 48 && e.charCode <= 57) && !(e.charCode == 45 || e.charCode == 46)) return false;
  }
})
//idpostfix模板id后缀
$("[name=template_postfix]").on({
  "input": function () {
    idPostfixCompare(modules[activeIndex][0]["template"] + $(this).val());
  },
  "blur": function () {
    if ($(this).val().trim().length == 0 || $(this).hasClass("red")) {
      $(this).removeClass("red").addClass("green");
    } else if ($(this).val().indexOf("default") != -1) {
      var modulesName = modules[activeIndex][0]["template"];
      var index = $(this).val() == "default" ? 0 : $(this).val().split("default" + "-")[1];
      if (Number(index)) {
        posixIDs[modulesName] = JSON.parse(JSON.stringify(posixIDs[modulesName]).replace(Number(nowID), Number(index)));
        posixIDs[modulesName].sort((a, b) => {
          return a - b
        });
      }
    }
    $(this).val($(this).attr("value"));
    modules[activeIndex][0]["template_postfix"] = $(this).attr("value");
    setConfig();
  }

})
$('.b_center [name]').change(function () {
  setConfig()
})
//判断id是否重复
function idPostfixCompare(nowVal) {
  if (modules[activeIndex][0]["template"] != "") {
    if (regID.test(nowVal)) {
      for (var i in modules) {
        if (nowVal === modules[i][0]["template"] + modules[i][0]["template_postfix"] && i != activeIndex) {
          $("[name=template_postfix]").addClass("red").removeClass("green");
          return;
        }
      }
      $("[name=template_postfix]").removeClass("red").addClass("green").attr("value", $("[name=template_postfix]").val());
      modules[activeIndex][0]["template_postfix"] = $("[name=template_postfix]").attr("value");
    } else {
      $("[name=template_postfix]").addClass("red").removeClass("green");
    }
  } else { //一般模式|修改模式
    if (regID.test(nowVal)) {
      for (var i in modules) {
        if (nowVal === modules[i][0]["id"] && i != activeIndex) {
          $("[name=id]").addClass("red").removeClass("green");
          return;
        }
      }
      $("[name=id]").removeClass("red").addClass("green");
      modules[activeIndex][0]["id"] = $("[name=id]").val();
    } else {
      $("[name=id]").addClass("red").removeClass("green");
    }
  }
}
//parameters
$('.parameters>div>.table').on('click', 'ul>li>span', function () {
  if (modules[activeIndex][0]["template"] != "") return;
  if ($(this).parent().parent().hasClass('blue')) {
    if ($(this).next().length != 0) {
      $(this).parent().parent().removeClass('blue').siblings().removeClass('blue blue2');
      $(this).next().show().val($(this).text()).select();
      $(this).hide();
    }
  } else {
    $(this).parents('.table').find('ul').removeClass('blue').find('li').removeClass('blue').find('span').removeClass('white');
    $(this).parent().parent().addClass('blue');
    $(this).parent().removeClass('blue').siblings().addClass('blue');
  }
  $('.parameters>div>.table>.title>div').eq($(this).parent().index()).addClass('blue2').siblings().removeClass('blue2');
  if ($(this).parent().parent().find('li').eq(0).find('span').text() == '') {
    $('.param_val').val('').attr('disabled', true).addClass("disabled_background");
  } else {
    $('.param_val').attr('disabled', false).removeClass("disabled_background");
    var paramI = modules[activeIndex][0]['param'][$('.parameters li.blue').parent().index()];
    if (paramI == undefined) {
      $('.param_val').val('');
      return;
    } else {
      var val = paramI['val'];
      if (val == '' || val == undefined) {
        $('.param_val').val('')
      } else {
        $('.param_val').val(val)
      }
    }
  }
})
$('.parameters>div>.table').on('input', 'input', function () {
  if ($(this).parent().index() == 0 && !reg.test($(this).val())) {
    $(this).addClass("red");
  } else {
    $(this).removeClass("red").attr("value", $(this).val());
  }
  if ($(this).parent().parent().index() + 1 == $('.parameters>div>.table>.table_content>ul').length) {
    $('.parameters>div>.table>.table_content').append("<ul class=\"fixclear\"><li><span></span><input type=\"text\" ></li><li><span></span><input type=\"text\" ></li></ul>");
  }
})
$('.parameters>div>.table>.table_content').on('blur', 'ul>li>input', function () {
  var eq = $(this).parent().parent().index(); //ul索引
  var lieq = $(this).parent().index(); //li索引
  if (!Boolean(modules[activeIndex][0]['param']) || modules[activeIndex][0]['param'][eq] == undefined) {
    modules[activeIndex][0]['param'].push({
      "name": "",
      "value": "",
      "val": ""
    });
  }
  if (lieq == 0) {
    modules[activeIndex][0]['param'][eq]['name'] = $(this).attr("value");
  } else if (lieq == 1) {
    modules[activeIndex][0]['param'][eq]['value'] = $(this).attr("value");
  }
  $(this).prev().show().text($(this).attr("value")).removeClass('white').attr('title', $(this).attr("value"));
  $(this).hide();
  setConfig();
})
$('.parameters .table>div:nth-child(1)>div').click(function () {
  if (modules[activeIndex][0]["template"] != "") return;
  if ($(this).find('span').eq(1).text() == '') {
    $(this).find('span').eq(1).text('▲').removeClass('up').addClass('down');
    $(this).siblings().find('span').eq(1).text('').removeClass('down up');
  }
  var param = modules[activeIndex][0]['param'];
  if ($(this).find('span').eq(1).hasClass('up')) {
    $(this).find('span').eq(1).text('▲').removeClass('up').addClass('down');
  } else {
    $(this).find('span').eq(1).text('▼').removeClass('down').addClass('up');
  }
  param.reverse();
  var text = '';
  var idx = param.length - $('.parameters .table_content>ul.blue').index() - 1;
  for (var i in param) {
    text += "<ul class=\"fixclear\"><li><span>" + param[i]['name'] + "</span><input type=\"text\"></li><li><span>" + param[i]['value'] + "</span><input type=\"text\"></li></ul>"
  }
  text += "<ul class=\"fixclear\"><li><span></span><input type=\"text\"></li><li><span></span><input type=\"text\"></li></ul>"
  $('.parameters .table_content').empty().append(text);
  $('.parameters .table_content>ul').eq(idx).addClass('blue');
})
$('.parameters').on('blur', 'input', function () {
  var param = '';
  if (modules[activeIndex][0]['param'] == undefined) {
    modules[activeIndex][0]['param'] = [];
    param = modules[activeIndex][0]['param'];
  } else {
    param = modules[activeIndex][0]['param'];
  }
  var index = $('.parameters li.blue').parent().index();
  if (param[index] == undefined) {
    param.push({
      'name': $('.parameters li.blue').parent().find('li').eq(0).find('span').text(),
      'value': $('.parameters li.blue').parent().find('li').eq(1).find('span').text(),
      'val': ''
    });
  } else {
    param[index]['name'] = $('.parameters li.blue').parent().find('li').eq(0).find('span').text();
    param[index]['value'] = $('.parameters li.blue').parent().find('li').eq(1).find('span').text();
    param[index]['val'] = param[index]['val'];
  }
  setConfig();
})
$('.parameters textarea').on('blur', function () {
  var param = modules[activeIndex][0]['param'];
  var index = $('.parameters li.blue').parent().index();
  if (param[index] != undefined) {
    param[index]['val'] = $('.parameters textarea').val();
  }
  setConfig();
})

//loop
$('.loop_list>li').on('click', function () {
  if ($('.loop_list_content>.item>textarea').attr('disabled')) return;
  $(this).removeClass('loop_list_other').addClass('checked').siblings().addClass('loop_list_other').removeClass('checked');
  $('.loop_list_content>.item').eq($(this).index()).show().siblings().hide();
})

$('.loop_list_content textarea').on({
  'input': function () {
    $('[language="save"],[language="abort"]').removeClass('disabled_a');
    $('.module_content>p,[language="add_module"],[language="import_module"],[language="export_module"],[language="export_code"],[language="remove_module"]').addClass('disabled_a')
  }
})

$('body').on('input', '[name=default_val]', function () {
  isNaN(Number($(this).val())) ? $(this).addClass('red') : $(this).removeClass('red');
})

//ctrl+s保存
$(window).keydown(function (e) {
  if (e.keyCode == 83 && e.ctrlKey) {
    for (var j = 0; j < $('.loop_list_content>div').length; j++) {
      var name = $('.loop_list>li').eq(j).attr('language');
      modules[activeIndex][0][name] = $('.loop_list_content>.item:eq(' + j + ')>textarea').val();
    }
    $('.module_content>p,[language="add_module"],[language="import_module"],[language="export_module"],[language="export_code"],[language="remove_module"]').removeClass('disabled_a');
    $('[language=save],[language=abort]').addClass('disabled_a');
    setConfig();
  }
});
//选中一行删掉一行
$('body').keydown(function (event) {
  var e = event || window.event;
  if (e.keyCode == 46) {
    if ($('.all').hasClass('flag')) {
      var i = 0;
      while (i < $('.table>ul').length - 1) {
        $('.table>ul')[i].remove();
        i = 0;
      }
    } else {
      if ($(".table_content>ul").length - 1 == $(".table_content>ul.blue").index()) return;
      if ($('.blue2').parents().hasClass('parameters')) {
        modules[activeIndex][0]['param'].splice($('.parameters .table_content>ul.blue').index(), 1);
        $('.parameters .table_content>ul.blue').remove();
        setConfig();
      } else {
        if ($('.blue2').parents().hasClass('sample_out') && $('[name="output_protocal"]').val() != '') {
          $('[language="output_add_sample"]').removeAttr('disabled');
        }
        $('.blue2').parent().remove();
      }
    }
  }
  $('.all').removeClass('flag');
});
//页面启用/禁用，去掉input,textarea,span,a,save,abort的disabled
function aDisabled(enabled) {
  if (enabled == 'enabled') {
    $('input,textarea').removeAttr('disabled').removeClass("disabled_background");
    $('.container span,.container a:not(.overwritedef,.overwriteparam),label,p,.loop_list>li').removeClass('disabled_a');
    $('a[language="save"],a[language="abort"]').addClass('disabled_a');
    $(".table>.title>div,.table_content>ul>li").addClass("bc_white");
  } else {
    $('input,textarea').attr('disabled', true).addClass("disabled_background");
    $('textarea').val('');
    $('.io a').text(none);
    $('.container span,.container a:not(.overwritedef,.overwriteparam),label,p,.loop_list>li').addClass('disabled_a');
    $('[language="add_module"],[language=import_module],[language=import_path]').removeClass('disabled_a');
    $(".table>.title>div,.table_content>ul>li").removeClass("bc_white");
  }
}

function getContentVal(moduleConfig) {
  modeChange(moduleConfig[0]["template"]);
  aDisabled('enabled');
  $(".loop_list>li:first-child").removeClass('loop_list_other').addClass('checked').siblings().addClass('loop_list_other').removeClass('checked');
  $('.loop_list_content>.item').eq(0).show().siblings().hide();
  if ($('.module_content>p.active').length == 0) {
    $('.b_center [name=enabled]').prop('checked', false);
    $('.b_center [name=freq]').val(20);
    $('.b_center [name=name]').val('');
    $('.b_center [name=id]').val('');
    $('.parameters .table_content').empty().append("<ul class=\"fixclear\"><li><span></span><input type=\"text\" tabindex=-1></li><li><span></span><input type=\"text\" tabindex=-1></li></ul>");
    $('.param_val').val('');
    return;
  } else {
    // 不同模式禁用
    if (moduleConfig[0]["template"] == "" || !Boolean(moduleConfig[0]["template"])) { //一般模式，无禁用
      $(".b_center>.content,.c_right").find("[name],input,textarea").removeClass("disabled_background").attr("disabled", false);
      $(".b_center>.content,.c_right>.top>.loop_list").find("span,[language],li,p").removeClass("disabled_a");
      $("[language=import_code],[language=export_code]").removeClass("disabled_a");
    }
    $('.b_center [name]').each(function () {
      var name = $(this).attr('name');
      var type = $(this).attr('type');
      if (type == 'checkbox') {
        if (name == "id_legacy_mode") {
          if (moduleConfig[0]["id_legacy_mode"] == "no") {
            $(this).prop("checked", false)
          } else {
            moduleConfig[0]["id_legacy_mode"] = "yes";
            $(this).prop("checked", true)
          }
        } else {
          $('[name="' + name + '"]').prop('checked', moduleConfig[0][name] == 'yes');
        }
      } else {
        if (name == "name") {
          var text = biGetLanguage() == 1 ? moduleConfig[0]["name"] : (Boolean(moduleConfig[0]["name_ch"]) ? moduleConfig[0]["name_ch"] : moduleConfig[0]["name"]);
          $('[name=name]').val(text).attr("value", text);
        } else {
          if (name != "freq") {
            $('[name="' + name + '"]').val(moduleConfig[0][name]);
            if (type == "text") {
              $('[name="' + name + '"]').attr("value", moduleConfig[0][name]);
            }
          }
        }
      }
    })

    //模板模式
    // if (moduleConfig[0]["template"] != "" && templateMode == "use_mode") {
    if (moduleConfig[0]["template"] != "") {
      $(".templateval").text(templateNames[moduleConfig[0]["template"]]);
      $("[name=template_postfix]").val(moduleConfig[0]["template_postfix"]).attr("value", moduleConfig[0]["template_postfix"]);
      idPostfixCompare(moduleConfig[0]["template"] + moduleConfig[0]["template_postfix"]);
      if (Boolean(moduleConfig[0]["overwrite_param"])) {
        var length = moduleConfig[0]["overwrite_param"].length > 1 ? moduleConfig[0]["overwrite_param"].length + inputs : (moduleConfig[0]["overwrite_param"].length == 1 ? moduleConfig[0]["overwrite_param"][0]["name"] : none);
        $(".overwriteparam").text(length);
      } else {
        $(".overwriteparam").text(none);
      }
      if (moduleConfig[0]["overwrite_freq"] == "yes" || !Boolean(moduleConfig[0]["overwrite_freq"])) {
        $("[language=templateDefault]").text(languageType == 1 ? en["templateDefault"] : cn["templateDefault"]);
      } else {
        $("[language=templateDefault]").text(moduleConfig[0]["overwrite_freq"] + " " + (languageType == 1 ? en["hz"] : cn["hz"]));
      }
    } else {
      //一般模式
      $("[name=id]").val(moduleConfig[0]["id"]);
      $('[name="freq"]').val(moduleConfig[0]["freq"]);
      idPostfixCompare($("[name=id]").attr("value"));
    }
    var pName = biGetLanguage() == 1 ? moduleConfig[0]["name"] : (Boolean(moduleConfig[0]["name_ch"]) ? moduleConfig[0]["name_ch"] : moduleConfig[0]["name"]);
    $(".module_content>p.active>span:last-child").text(pName);
    $(".module_content>p.active").attr("title", pName);
    $('.loop_list_content textarea').each(function () {
      var name = $(this).attr('name');
      if (moduleConfig[0][name] != undefined) {
        $(this).val(moduleConfig[0][name]);
      } else {
        $(this).val('');
      }
    })
    $('.param_val').val('');
    $('.io a').each(function () {
      var name = $(this).attr('class');
      name = name.replace(/ disabled_a/g, "")
      var config = moduleConfig[1]['content'][name];
      if (config == undefined || config.length == 0) {
        $(this).text(none).removeAttr("title");
      } else if (config.length == 1) {
        if (name == 'sample_out' || name == 'report_out' || name == 'scene_out') {
          $(this).text(config[0]['id']);
        } else if (name == 'in') {
          $(this).text(config[0]['param']);
        } else if (name == 'sample_in') {
          $(this).text(config[0]);
        } else if (name == 'out') {
          $(this).text(config[0]['param']);
        }
        if (!$(this).hasClass("disabled_a") && $(this).text().indexOf(none) == -1) {
          $(this).attr("title", $(this).text());
        } else {
          $(this).removeAttr("title");
        }
      } else {
        $(this).text(config.length + inputs).removeAttr("title");
      }
    })
    if (moduleConfig[0]['param'] == undefined) {
      $('.parameters .table_content').html("<ul class=\"fixclear\"><li><span></span><input type=\"text\" tabindex=-1></li><li><span></span><input type=\"text\" tabindex=-1></li></ul>");
      return;
    }
    $('.parameters .table_content').empty();
    var disabledA = moduleConfig[0]["template"] == "" ? "" : "disabled_a";
    for (var j = 0; j < moduleConfig[0]['param'].length; j++) {
      $('.parameters .table_content').append("<ul class=\"fixclear\"><li><span class=\"" + disabledA + "\" title=\"" + moduleConfig[0]['param'][j]['name'] + "\">" + moduleConfig[0]['param'][j]['name'] + "</span><input type=\"text\" tabindex=-1></li><li><span class=\"" + disabledA + "\" title=\"" +
        moduleConfig[0]['param'][j]['value'] +
        "\">" + moduleConfig[0]['param'][j]['value'] + "</span><input type=\"text\" tabindex=-1></li></ul>")
    }
    if (moduleConfig[0]["template"] != "") {
      $('.parameters .table>.title>div').removeClass('blue2');
      $('.parameters .table_content>ul:nth-child(1)>li').removeClass('blue');
    } else {
      $('.parameters .table>.title>div:nth-child(1)').addClass('blue2');
      $('.parameters .table_content>ul:nth-child(1)>li').addClass('blue');
    }
    if (moduleConfig[0]['param'].length != 0) {
      $('.param_val').val(moduleConfig[0]['param'][0]['val']);
      if (moduleConfig[0]["template"] == "") $('.param_val').removeAttr('disabled');
    }
    $('.parameters .table_content').append("<ul class=\"fixclear\"><li><span></span><input type=\"text\" tabindex=-1></li><li><span></span><input type=\"text\" tabindex=-1></li></ul>");
  }
}

function loadConfig(config) {
  templateNames = biGetPythonTemplateNames();
  biQueryGlobalPath("PythonImportPaths");
  languageType = biGetLanguage();
  for (let i in templateNames) {
    IDs[i] = [];
    normalName[templateNames[i]] = []
  }
  IDs["unknown-script"] = [];
  normalName["Unknown Script"] = [];
  none = lang["none"];
  overwritefreqtitle = lang["overwritefreqtitle"];
  overwriteparamtitle = lang["overwriteparamtitle"];
  import_paths = lang["import_paths"];
  add_python_module = lang["add_python_module"];
  if (languageType == 1) {
    inputs = " inputs";
    input_signal = "Input Signal";
    input_sample = "Input Sample";
    output_siganl = "Output Signal";
    output_sample = "Output Sample";
    output_scene = "Output Scene";
    output_report = "Output Report";
  } else {
    inputs = "个输入";
    input_signal = "输入信号";
    input_sample = "输入样本";
    output_siganl = "输出信号";
    output_sample = "输出样本";
    output_scene = "输出场景";
    output_report = "输出报告";
  }
  if (modules.length < 1) {
    $("[name=freq]").val(10);
  } else {
    for (var i in modules) {
      var o = modules[i][0]['enabled'] == 'yes' ? '(O)' : '(X)';
      var pName = biGetLanguage() == 1 ? modules[i][0]['name'] : (Boolean(modules[i][0]["name_ch"]) ? modules[i][0]["name_ch"] : modules[i][0]["name"]);
      $('.module_content').append("<p title=\"" + pName + "\"><span>" + o + "</span><span>" + pName + "</span></p>");
      //一般模式 模板模式 modulesID
      if (modules[i][0]["template"] == "") {
        if (IDs[modules[i][0]["id"]] != undefined) {
          IDs[modules[i][0]["id"]].push(0);
        } else {
          var modulesName = "";
          for (let j in IDs) {
            if (modules[i][0]["id"].indexOf(j) != -1) {
              modulesName = j;
              break;
            }
          }
          if (modulesName != "") {
            var index = modules[i][0]["id"].split(modulesName + "-");
            if (Number(index[1])) {
              IDs[modulesName].push(Number(index[1]));
            }
          }
        }
      } else if (modules[i][0]["template"] != "" && modules[i][0]["template_postfix"].indexOf("default") != -1) {
        if (posixIDs[modules[i][0]["template"]] == undefined) {
          posixIDs[modules[i][0]["template"]] = [];
        }
        if (modules[i][0]["template_postfix"] == "default") {
          posixIDs[modules[i][0]["template"]].push(0);
        } else {
          var index = modules[i][0]["template_postfix"].split("default-");
          if (!isNaN(Number(index[1]))) {
            posixIDs[modules[i][0]["template"]].push(Number(index[1]));
          }
        }
      }
      //判断名字中已经存在的值
      var name = languageType == 1 ? modules[i][0]["name"] : (Boolean(modules[i][0]["name_ch"]) ? modules[i][0]["name_ch"] : modules[i][0]["name"]);
      if (normalName[name] != undefined) {
        normalName[name].push(0);
      } else {
        for (var j in normalName) {
          if (name.indexOf(j) != -1) {
            var index = name.split(j + " ");
            if (!isNaN(Number(index[1]))) {
              normalName[j].push(Number(index[1]));
            }
          }
        }
      }
    }
  }
  for (let i in posixIDs) {
    posixIDs[i].sort((a, b) => {
      return a - b
    });
  }
  for (let i in IDs) {
    IDs[i].sort((a, b) => {
      return a - b
    });
  }
  for (let i in normalName) {
    normalName[i].sort((a, b) => {
      return a - b
    });
  }
}

function biOnQueriedGlobalPath(id, paths) {
  if (paths.length == 0) $('[language=cant_find]').show().removeClass('disabled_a').addClass('red').text(biGetLanguage() == 1 ? en['cant_find'] : cn['cant_find']);
  for (var i = 0; i < paths.length; i++) {
    biQueryFilesInDirectory(paths[i]);
  }
  setTimeout(function () {
    bi_common_js == 0 ? $('[language=cant_find').show().removeClass('disabled_a') : $('[language=cant_find').hide();
  }, 150);
}

function biOnClosedChildDialog(htmlName, result) {
  switch (htmlName) {
    case "python-scripts.importpath.html": {
      bi_common_js = 0;
      biQueryGlobalPath("PythonImportPaths");
      break;
    }
    case "python-scripts.in.html": {
      var val = JSON.parse(biGetLocalVariable("python_script_in" + activeIndex));
      if (val != null) {
        var arr = [];
        for (let i in val) {
          if (!$.isEmptyObject(val[i])) arr.push(val[i])
        }
        modules[activeIndex][1]["content"]["in"] = arr;
        var length = arr.length > 1 ? arr.length + inputs : (arr.length == 1 ? arr[0]["param"] : none);
        $(".in").text(length);
      }
      break;
    }
    case "python-scripts.samplein.html": {
      var val = JSON.parse(biGetLocalVariable("python_script_samplein" + activeIndex));
      if (val != null) {
        modules[activeIndex][1]["content"]["sample_in"] = val;
        var length = val.length > 1 ? val.length + inputs : (val.length == 1 ? val[0] : none);
        $(".sample_in").text(length);
      }
      break;
    }
    case "python-scripts.out.html": {
      var val = JSON.parse(biGetLocalVariable("python_script_out" + activeIndex));
      if (val != null) {
        modules[activeIndex][1]["content"]["out"] = val;
        var length = val.length > 1 ? val.length + inputs : (val.length == 1 ? val[0]["param"] : none);
        $(".out").text(length);
      }
      break;
    }
    case "python-scripts.sampleout.html": {
      var val = JSON.parse(biGetLocalVariable("python_script_sampleout" + activeIndex));
      if (val != null) {
        modules[activeIndex][1]["content"]["sample_out"] = val;
        var length = val.length > 1 ? val.length + inputs : (val.length == 1 ? val[0]["id"] : none);
        $(".sample_out").text(length);
      }
      break;
    }
    case "python-scripts.sceneout.html": {
      var val = JSON.parse(biGetLocalVariable("python_script_sceneout" + activeIndex));
      if (val != null) {
        modules[activeIndex][1]["content"]["scene_out"] = val;
        var length = val.length > 1 ? val.length + inputs : (val.length == 1 ? val[0]["id"] : none);
        $(".scene_out").text(length);
      }
      break;
    }
    case "python-scripts.reportout.html": {
      var val = JSON.parse(biGetLocalVariable("python_script_reportout" + activeIndex));
      if (val != null) {
        modules[activeIndex][1]["content"]["report_out"] = val;
        var length = val.length > 1 ? val.length + inputs : (val.length == 1 ? val[0]["id"] : none);
        $(".report_out").text(length);
      }
      break;
    }
    case "python-scripts.addmodule.html": {
      var mode = "";
      if (biGetLocalVariable("python_script_addmode") != "") {
        newModule = true;
        mode = biGetLocalVariable("python_script_addmode").split(",");
        if (mode[0] === "1") { //使用模板
          templateMode = "use_mode";
          biQueryPythonTemplateInfo(mode[1]);
        } else if (mode[0] === "2") { //修改模板
          templateMode = "modify_mode";
          biQueryPythonTemplateInfo(mode[1]);
        } else { //修改模板
          modeChange(mode[0]);
          modules.push([{
            'enabled': 'no',
            'id': "",
            'name': "",
            "name_ch": "",
            "template": "",
            'param': [],
            'type_auto_conversion': "yes",
            "id_legacy_mode": "no",
            'freq': "20",
          }, {
            'content': {}
          }]);
          templateMode = "normal_mode";
          //module_content p的内容
          var normalNameI = 0;
          if (normalName["Unknown Script"].length == 0) {
            normalNameI = normalName["Unknown Script"].length;
            normalName["Unknown Script"].push(0);
          } else {
            for (let i in normalName["Unknown Script"]) {
              if (normalName["Unknown Script"][i] != i) {
                normalNameI = Number(i);
                normalName["Unknown Script"].splice(i, 0, normalNameI);
                break;
              } else {
                if (Number(i) + 1 == normalName["Unknown Script"].length) {
                  normalNameI = normalName["Unknown Script"].length;
                  normalName["Unknown Script"].push(normalNameI);
                }
              }
            }
          }
          var normalNameV = normalNameI == 0 ? "Unknown Script" : "Unknown Script " + normalNameI;
          modules[modules.length - 1][0]["name"] = normalNameV;
          modules[modules.length - 1][0]["name_ch"] = normalNameV;
          $('.module_content').append("<p><span>(X)</span><span>" + normalNameV + "</span></p>");
          $('.b_center [name=name]').val(normalNameV);
          $('.module_content>p:last-child').addClass('active').siblings().removeClass('active');
          modules[$(".module_content>p.active").index()][0]["name"] = $(".module_content>p.active>span:last-child").text();
          modules[$(".module_content>p.active").index()][0]["name_ch"] = $(".module_content>p.active>span:last-child").text();
          activeIndex = $(".module_content>p.active").index();
          modules[activeIndex][0]["id"] = "unknown-script";
          var modulesName = "";
          for (let j in IDs) {
            if (modules[activeIndex][0]["id"].indexOf(j) != -1) {
              modulesName = j;
              break;
            }
          }
          var index = 0;
          if (IDs[modulesName].length == 0) {
            IDs[modulesName].push(0);
          } else {
            for (let i in IDs[modulesName]) {
              if (IDs[modulesName][i] != i) {
                index = Number(i);
                IDs[modulesName].splice(i, 0, index);
                break;
              } else {
                if (Number(i) + 1 == IDs[modulesName].length) {
                  index = IDs[modulesName].length;
                  IDs[modulesName].push(index);
                }
              }
            }
          }
          var unknownScriptV = index == 0 ? modulesName : modulesName + "-" + index;
          modules[modules.length - 1][0]["id"] = unknownScriptV;
          getContentVal(modules[$('.module_content>p').length - 1]);
        }
      }
      setConfig();
      break;
    }
    case "python-scripts.overwritefreq.html": {
      var val = JSON.parse(biGetLocalVariable("python_script_overwritefreq" + activeIndex));
      if (val != null) {
        modules[activeIndex][0] = val;
        if (val["overwrite_freq"] == "yes" || !Boolean(val["overwrite_freq"])) {
          $("[language=templateDefault]").text(languageType == 1 ? en["templateDefault"] : cn["templateDefault"]);
        } else {
          $("[language=templateDefault]").text(val["overwrite_freq"] + " " + (languageType == 1 ? en["hz"] : cn["hz"]));
        }
      }
      break;
    }
    case "python-scripts.overwriteparam.html": {
      var arr = JSON.parse(biGetLocalVariable("python_script_overwriteparam" + activeIndex));
      if (arr != null) {
        modules[activeIndex][0]["overwrite_param"] = arr;
        var length = arr.length > 1 ? arr.length + inputs : (arr.length == 1 ? arr[0]["name"] : none);
        $(".overwriteparam").text(length);
      }
      break;
    }
  }
  if (!["python-scripts.overwriteparam.html", "python-scripts.overwritefreq.html"].includes(htmlName)) {
    $(".io a").each(function () {
      if ($(this).text().indexOf(none) == -1 && $(this).text().indexOf(" inputs") == -1 && $(this).text().indexOf("个输入") == -1) {
        $(this).attr("title", $(this).text());
      } else {
        $(this).removeAttr("title");
      }
    })
  }
  setConfig();
}

function biOnQueriedPythonTemplateInfo(templateID, infoXmlBase64) {
  if (infoXmlBase64 == null) {
    if (templateMode == "modify_mode" || newModule) {
      biAlert("Error!");
    } else {
      //不可挪动位置
      $("div.io,div.parameters,.c_right>.top").find("span,[language],li,p").addClass("disabled_a");
      modeChange(templateID);
      $("div.basic,div.templatemode").find("[name],input").addClass("disabled_background").attr("disabled", true);
      $("div.basic,div.templatemode").find("label,p,span,a").addClass("disabled_a");
      $("[language=export_module]").addClass("disabled_a");
      $(".templateval").text(templateID + (biGetLanguage() == 1 ? "(Not found)" : "(未找到)"));
      $("[language=none]").text(none);
      $(".b_center,.c_right").find("input,textarea").val("");
      $("div.io,div.parameters,.c_right").find("[name],input,textarea").addClass("disabled_background").attr("disabled", true);
      $("[language=import_code],[language=export_code]").addClass("disabled_a");
      $("[language=remove_module]").removeClass("disabled_a");
      $(".parameters>div>div.table>div.table_content>ul:not(:last-child)").remove();
    }
  } else {
    if (newModule && templateMode == "use_mode") {
      $('.module_content').append("<p><span>(X)</span><span></span></p>");
      //模板模式
      modules.push([{
        'enabled': "no",
        'name': "",
        "name_ch": "",
        "template": templateID,
        "template_postfix": ""
        // 'param': [],
      }, {
        'content': {}
      }]);
      var defaultI = 0;
      var arrID = modules[$('.module_content>p').length - 1][0]["template"];
      if (posixIDs[arrID] == undefined || posixIDs[arrID].length == 0) {
        posixIDs[arrID] = [0];
      } else {
        for (let i in posixIDs[arrID]) {
          if (posixIDs[arrID][i] != i) {
            defaultI = Number(i);
            posixIDs[arrID].splice(i, 0, defaultI);
            break;
          } else {
            if (Number(i) + 1 == posixIDs[arrID].length) {
              defaultI = posixIDs[arrID].length;
              posixIDs[arrID].push(defaultI);
            }
          }
        }
      }
      var defaultV = defaultI == 0 ? "default" : "default-" + defaultI;
      modules[$('.module_content>p').length - 1][0]["template_postfix"] = defaultV;
      $('.module_content>p:last-child').addClass('active').siblings().removeClass('active');
      activeIndex = $(".module_content>p.active").index();
    } else if (newModule && templateMode == "modify_mode") {
      modules.push([{
        'enabled': 'no',
        'id': "",
        'name': "",
        "name_ch": "",
        "template": "",
        'param': [],
        'type_auto_conversion': "yes",
        "id_legacy_mode": "no",
        'freq': "20",
      }, {
        'content': {}
      }]);
      $('.module_content').append("<p><span>(X)</span><span></span></p>");
      $('.module_content>p:last-child').addClass('active').siblings().removeClass('active');
      activeIndex = $(".module_content>p.active").index();
    }
    nowTemplateConfig = [];
    var info = getDecode(infoXmlBase64);
    var parser = new DOMParser();
    var countrys = parser.parseFromString(info, "text/xml");
    // 获取值
    for (var k = 0; k < countrys.childNodes.length; k++) {
      if (newModule) {
        var keys = countrys.childNodes[k].attributes;
        for (var n = 0; n < keys.length; n++) {
          if (['enabled', 'name', "name_ch", "template", "template_postfix", "overwrite_freq"].includes(keys[n].nodeName)) modules[activeIndex][0][keys[n].nodeName] = keys[n].nodeValue;
        }
        if (newModule) {
          // name
          var name = "";
          for (let j in normalName) {
            if ((languageType == 1 ? modules[activeIndex][0]["name"] : modules[activeIndex][0]["name_ch"]).indexOf(j) != -1) {
              name = j;
              break;
            }
          }
          var normalNameI = 0;
          if (normalName[name].length == 0) {
            normalNameI = normalName[name].length;
            normalName[name].push(0);
          } else {
            for (let i in normalName[name]) {
              if (normalName[name][i] != i) {
                normalNameI = Number(i);
                normalName[name].splice(i, 0, normalNameI);
                break;
              } else {
                if (Number(i) + 1 == normalName[name].length) {
                  normalNameI = normalName[name].length;
                  normalName[name].push(normalNameI);
                }
              }
            }
          }
          var normalNameV = normalNameI == 0 ? "" : " " + normalNameI;
          modules[modules.length - 1][0]["name"] = modules[modules.length - 1][0]["name"] + normalNameV;
          modules[modules.length - 1][0]["name_ch"] = modules[modules.length - 1][0]["name_ch"] + normalNameV;
        }
        if (templateMode == "use_mode") {
          setConfig();
        } else {
          // modulesID
          var modulesName = "";
          for (let j in IDs) {
            if (templateID.indexOf(j) != -1) {
              modulesName = j;
              break;
            }
          }
          if (modulesName != "") {
            var index = 0;
            if (IDs[modulesName].length == 0) {
              IDs[modulesName].push(0);
            } else {
              for (let i in IDs[modulesName]) {
                if (IDs[modulesName][i] != i) {
                  index = Number(i);
                  IDs[modulesName].splice(i, 0, index);
                  break;
                } else {
                  if (Number(i) + 1 == IDs[modulesName].length) {
                    index = IDs[modulesName].length;
                    IDs[modulesName].push(index);
                  }
                }
              }
            }
          }
          var unknownScriptV = index == 0 ? modulesName : modulesName + "-" + index;
          modules[activeIndex][0]["id"] = unknownScriptV;
          modules[activeIndex][0]["id_legacy_mode"] = "no";
        }
      }
      if (templateMode == "use_mode") {
        if (countrys.childNodes[k].attributes["can_overwrite_freq"].value == "yes") {
          $(".overwritedef").removeClass("disabled_a")
        } else {
          $(".overwritedef").addClass("disabled_a")
        }
      } else {
        modules[activeIndex][0]["freq"] = countrys.childNodes[k].attributes["freq"].value;
      }
      $(".io [name=freq]").val(countrys.childNodes[k].attributes["freq"].value);
      nowTemplateConfig.push(JSON.parse(JSON.stringify(modules[activeIndex][0])), {
        'content': {}
      });
      var sample_in = [],
        scene_out = [],
        sample_out = [],
        signal_in = [],
        signal_out = [],
        report_out = [],
        // overwrite_param = [],
        param = [],
        cmd = '',
        cmd_start = '',
        cmd_end = '';
      for (var j = 0; j < countrys.childNodes[k].childNodes.length; j++) {
        var keyss = countrys.childNodes[k].childNodes[j].attributes;
        var obj = {};
        var nodeName = countrys.childNodes[k].childNodes[j].localName;
        var innerHtml = countrys.childNodes[k].childNodes[j].innerHTML;
        switch (nodeName) {
          case 'sample_in': {
            sample_in.push(innerHtml)
            break;
          }
          case 'scene_out': {
            for (var i of keyss) {
              obj[i.nodeName] = i.nodeValue;
              obj['val'] = innerHtml;
            }
            scene_out.push(obj);
            break;
          }
          case 'sample_out': {
            for (var i of keyss) {
              obj[i.nodeName] = i.nodeValue;
              obj['val'] = innerHtml;
            }
            sample_out.push(obj);
            break;
          }
          case 'report_out': {
            for (var i of keyss) {
              obj[i.nodeName] = i.nodeValue;
            }
            report_out.push(obj);
            break;
          }
          case 'in': {
            for (var i of keyss) {
              obj[i.nodeName] = i.nodeValue;
            }
            signal_in.push(obj);
            break;
          }
          case 'out': {
            for (var i of keyss) {
              obj[i.nodeName] = i.nodeValue;
            }
            signal_out.push(obj);
            break;
          }
          case 'param': {
            for (var i of keyss) {
              obj[i.nodeName] = i.nodeValue;
            }
            obj['val'] = innerHtml;
            param.push(obj);
            break;
          }
          case 'cmd': {
            cmd += getDecode(innerHtml) + "\n\n";
            break;
          }
          case 'cmd_start': {
            cmd_start = getDecode(innerHtml) + "\n\n";
            break;
          }
          case 'cmd_end': {
            cmd_end = getDecode(innerHtml) + "\n\n";
            break;
          }
          default:
            break;
        }
        nowTemplateConfig[1].content['in'] = signal_in;
        nowTemplateConfig[1].content['scene_out'] = scene_out;
        nowTemplateConfig[1].content['sample_out'] = sample_out;
        nowTemplateConfig[1].content['out'] = signal_out;
        nowTemplateConfig[1].content['report_out'] = report_out;
        nowTemplateConfig[1].content['sample_in'] = sample_in;
        nowTemplateConfig[0]['cmd'] = cmd;
        nowTemplateConfig[0]['cmd_start'] = cmd_start;
        nowTemplateConfig[0]['cmd_end'] = cmd_end;
        nowTemplateConfig[0]["param"] = param;
        nowParams = param;
      }
    }
    if (templateMode == "modify_mode") {
      modeChange("2");
      modules[activeIndex] = nowTemplateConfig;
      getContentVal(modules[activeIndex]);
      setConfig();
    } else {
      if (nowTemplateConfig[0]["param"].length == 0) {
        $(".overwriteparam").addClass("disabled_a");
      } else {
        $(".overwriteparam").removeClass("disabled_a")
      }
      getContentVal(nowTemplateConfig);
      //不可挪动位置
      $("div.io,div.parameters,.c_right>.top").find("span,[language],li,p").addClass("disabled_a");
      $("div.basic,div.templatemode").find("[name]").removeClass("disabled_background");
      $("div.basic,div.templatemode").find("label,p,span").removeClass("disabled_a");
      $("[language=export_module]").removeClass("disabled_a");
      $("div.io,div.parameters,.c_right").find("[name],input,textarea").addClass("disabled_background").attr("disabled", true);
      $("[language=import_code],[language=export_code]").addClass("disabled_a");
    }
  }
  newModule = false;
}
//import path
function biOnQueriedFilesInDirectory(files, path) {
  if (files != "") {
    var dir = files[0].split('\n');
    for (var i in dir) {
      if (dir[i].indexOf('bi_common.py') != -1) {
        bi_common_js++;
      }
    }
  }
}

function biOnSelectedPath(key, path) {
  switch (key) {
    case 'import_module': {
      biQueryFileText(path);
      break;
    }
    case 'import_code': {
      if (path != null) {
        biRunStandaloneTask("import_code", "code-import-task.pluginpython", path);
      }
      // biQueryFileText(path);
      break;
    }
    // case 'export_code': {
    //   biRunStandaloneTask("import_code", "code-export-task.pluginpython", path);
    //   // var i = $('.loop_list>li.checked').index();
    //   // var val = $('.loop_list_content>div').eq(i).find('textarea').val();
    //   // biWriteFileText(path, val);
    //   break;
    // }
    case 'export_code':
    case 'export_module': {
      if (path != null) {
        var outHtml = '',
          text = '';
        outHtml += "<?xml version=\"1.0\" encoding=\"utf-8\"?><root type=\"python-script-function\">";
        text = "<?xml version=\"1.0\" encoding=\"utf-8\"?>";
        var moduleI = modules[activeIndex][0]["template"] == "" ? modules[activeIndex] : [modules[activeIndex][0], {
          "content": {}
        }];
        text += "<root "
        for (var j in moduleI[0]) {
          if (j != 'param' && j != 'cmd' && j != 'cmd_start' && j != 'cmd_end' && j != "overwrite_param") {
            text += j + "=\"" + moduleI[0][j] + "\" ";
          }
        }
        if (key == "export_code") text += "output_dir=\"" + path + "\" ";
        text += ">"
        for (var j in moduleI[0]['param']) {
          text += "<param name=\"" + moduleI[0]['param'][j]['name'] + "\"" + " value=\"" + moduleI[0]['param'][j]['value'] + "\">" + moduleI[0]['param'][j]['val'] + "</param>";
        }
        if (Boolean(moduleI[0]['overwrite_param']) && moduleI[0]['overwrite_param'].length > 0) {
          for (var k in moduleI[0]['overwrite_param']) {
            text += "<overwrite_param name=\"" + moduleI[0]['overwrite_param'][k]['name'] + "\"" + " value=\"" + moduleI[0]['overwrite_param'][k]['value'] + "\"/>";
          }
        }
        if (moduleI[1]['content'] == '') return;
        for (var j in moduleI[1]['content']) {
          switch (j) {
            case 'in': {
              for (var k in moduleI[1]['content'][j]) {
                text += "<in signal=\"" + moduleI[1]['content'][j][k]['signal'] + "\" nearest=\"" + moduleI[1]['content'][j][k]['nearest'] + "\" param=\"" + moduleI[1]['content'][j][k]['param'] + "\" default_val=\"" + moduleI[1]['content'][j][k]['default_val'] + "\" />";
              }
              break;
            }
            case 'out': {
              for (var k in moduleI[1]['content'][j]) {
                text += "<out param=\"" + moduleI[1]['content'][j][k]['param'] + "\" />";
              }
              break;
            }
            case 'sample_in': {
              for (var k in moduleI[1]['content'][j]) {
                text += "<sample_in>" + moduleI[1]['content'][j][k] + "</sample_in>";
              }
              break;
            }
            case 'sample_out': {
              for (var k in moduleI[1]['content'][j]) {
                text += "<sample_out id=\"" + moduleI[1]['content'][j][k]['id'] + "\" name=\"" + moduleI[1]['content'][j][k]['name'] + "\"></sample_out>";
              }
              break;
            }
            case 'scene_out': {
              for (var k in moduleI[1]['content'][j]) {
                text += "<scene_out id=\"" + moduleI[1]['content'][j][k]['id'] + "\">" + moduleI[1]['content'][j][k]['val'] + "</scene_out>";
              }
              break;
            }
            case 'report_out': {
              for (var k in moduleI[1]['content'][j]) {
                text += "<report_out id=\"" + moduleI[1]['content'][j][k]['id'] + "\" type=\"" + moduleI[1]['content'][j][k]['type'] + "\" title=\"" + moduleI[1]['content'][j][k]['title'] + "\" configs=\"" + moduleI[1]['content'][j][k]['configs'] + "\" column_titles=\"" + moduleI[1]['content'][j][k]['column_titles'] + "\" />"
              }
              break;
            }
          }
        }
        text += "<cmd>" + (moduleI[0]['cmd'] == '' || moduleI[0]['cmd'] == undefined ? '' : getEncode64(moduleI[0]['cmd'])) + "</cmd>";
        text += "<cmd_start>" + (moduleI[0]['cmd_start'] == '' || moduleI[0]['cmd_start'] == undefined ? '' : getEncode64(moduleI[0]['cmd_start'])) + "</cmd_start>";
        text += "<cmd_end>" + (moduleI[0]['cmd_end'] == '' || moduleI[0]['cmd_end'] == undefined ? '' : getEncode64(moduleI[0]['cmd_end'])) + "</cmd_end>";
        text += "</root>"
        outHtml += getEncode64(text);
        outHtml += "</root>";
        if (key == "export_module") {
          biWriteFileText(path, outHtml);
        } else if (key == "export_code") {
          biRunStandaloneTask("export_code", "code-export-task.pluginpython", text);
        }

      }
    }
      break;
  }
}
//remove module
function biOnResultOfConfirm(key, result) {
  switch (key) {
    case "remove_module": {
      if (result) {
        var activeI = $('.module_content .active').index();
        if ($('.module_content>p').length == 0) return;
        if ($('.module_content .active').eq(0).attr('id') != undefined) {
          remove_modules.push($('.module_content .active').eq(0).attr('id') == '' ? 1 : Number($('.module_content .active').eq(0).attr('id')))
        }
        if ($('.module_content>p').length == 1) {
          aDisabled('')
          $('.module_content .active').eq(0).remove();
          $('.io a').text(none)
          $('[language="add_module"],[language=import_module]').removeClass('disabled_a');
          $('.b_center input[type=radio]').prop('checked', false);
          $('.b_center [name=freq]').val(20);
          $('.b_center input[type=text]').val('');
          $('.parameters .table_content').empty().append("<ul class=\"fixclear\"><li><span></span><input type=\"text\"></li><li><span></span><input type=\"text\"></li></ul>");
          $('.param_val').val('');
          modules = [];
          $(".normalmode").show();
          $(".templatemode").hide();
          posixIDs = {};
          for (let i in templateNames) {
            IDs[i] = [];
          }
          IDs["unknown-script"] = [];
          normalName["Unknown Script"] = [];
        } else {
          if (modules[activeI][0]["template"] == "" || !Boolean(modules[activeI][0]["template"])) {
            if (IDs[modules[activeI][0]["id"]] != undefined) {
              IDs[modules[activeI][0]["id"]] = IDs[modules[activeI][0]["id"]].filter(v => v !== 0);
            } else {
              var modulesName = "";
              for (let i in IDs) {
                if (modules[activeI][0]["id"].indexOf(i) != -1) {
                  modulesName = i;
                  break;
                }
              }
              if (modulesName != "") {
                var index = modules[activeI][0]["id"].split(modulesName + "-");
                if (Number(index[1])) {
                  IDs[modulesName] = IDs[modulesName].filter(v => v != Number(index[1]));
                }
              }
            }
          } else if (modules[activeI][0]["template"] != "" && modules[activeI][0]["template_postfix"].indexOf("default") != -1) {
            if (modules[activeI][0]["template_postfix"] == "default") {
              posixIDs[modules[activeI][0]["template"]] = posixIDs[modules[activeI][0]["template"]].filter(v => v !== 0);
            } else {
              var index = modules[activeI][0]["template_postfix"].split("default-");
              if (!isNaN(Number(index[1]))) {
                posixIDs[modules[activeI][0]["template"]] = posixIDs[modules[activeI][0]["template"]].filter(v => v != Number(index[1]));
              }
            }
          }
          //在normalName移除掉移除的名字
          var name = "";
          var name2 = languageType == 1 ? modules[activeI][0]["name"] : (Boolean(modules[activeI][0]["name_ch"]) ? modules[activeI][0]["name_ch"] : modules[activeI][0]["name"]); //当前模块Name
          for (var j in normalName) {
            if (name2.indexOf(j) != -1) {
              name = j;
            }
          }
          if (name2.indexOf(name) != -1) {
            if (name2 == name) {
              normalName[name] = normalName[name].filter(v => v !== 0);
            } else {
              var index = name2.split(name);
              if (!isNaN(Number(index[1]))) {
                normalName[name] = normalName[name].filter(v => v != Number(index[1]));
              }
            }
          }
          if ($('.module_content .active').eq(0).next().length == 0) {
            modules.splice($('.module_content .active').eq(0).index(), 1);
            $('.module_content .active').prev().addClass('active');
            $('.module_content .active').eq(1).remove();
          } else {
            modules.splice($('.module_content .active').eq(0).index(), 1);
            $('.module_content .active').next().addClass('active');
            $('.module_content .active').eq(0).remove();
          }
          activeIndex = $(".module_content>p.active").index();
          if (modules[activeIndex][0]["template"] == "") {
            getContentVal(modules[activeIndex]);
          } else {
            biQueryPythonTemplateInfo(modules[activeIndex][0]["template"]);
          }
        }
        // idPostfixCompare(modules[activeIndex][0]["template"]+modules[activeIndex][0]["template_postfix"]);
        setConfig();
      }
      break;
    }
  }
}
//import module
function biOnQueriedFileText(text, path) {
  if (path.indexOf('.asmc') != -1) {
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(text, "text/xml");
    var config = getDecode(xmlDoc.childNodes[0].innerHTML);
    xmlDoc = parser.parseFromString(config, "text/xml")
    var countrys = xmlDoc.getElementsByTagName('root');
    var obj = {};
    var nowTemplateConfig = [];
    var count = 0;
    var keys = countrys[0].getAttributeNames();
    for (var n = 0; n < keys.length; n++) {
      obj[keys[n]] = countrys[0].getAttribute(keys[n]);
      if (keys[n] == 'id') {
        var id = countrys[0].getAttribute(keys[n]);
        for (var i in modules) {
          if (modules[i][0]['id'] == id) count++;
        }
      } else if (keys[n] == 'template') {
        var template = countrys[0].getAttribute("template") + countrys[0].getAttribute("template_postfix");
        for (var i in modules) {
          if (modules[i][0]['template'] + modules[i][0]['template_postfix'] == template) count++;
        }
      }
    }
    if (count != 0) {
      biAlert('Module with the same ID and the same name exist:' + path, 'Error');
    } else {
      aDisabled('enabled');
      nowTemplateConfig.push(obj, {
        'content': {}
      });
      var sample_in = [],
        scene_out = [],
        sample_out = [],
        signal_in = [],
        signal_out = [],
        report_out = [],
        param = [],
        overwrite_param = [],
        cmd = '',
        cmd_start = '',
        cmd_end = '';
      for (var j = 0; j < countrys[0].childNodes.length; j++) {
        var keyss = countrys[0].childNodes[j].attributes;
        var innerHtml = countrys[0].childNodes[j].innerHTML;
        obj = {};
        var nodeName = countrys[0].childNodes[j].localName;
        switch (nodeName) {
          case 'sample_in': {
            sample_in.push(innerHtml)
            break;
          }
          case 'scene_out': {
            for (var i of keyss) {
              obj[i.nodeName] = i.nodeValue;
              obj['val'] = innerHtml;
            }
            scene_out.push(obj);
            break;
          }
          case 'sample_out': {
            for (var i of keyss) {
              obj[i.nodeName] = i.nodeValue;
            }
            sample_out.push(obj);
            break;
          }
          case 'report_out': {
            for (var i of keyss) {
              obj[i.nodeName] = i.nodeValue;
            }
            report_out.push(obj);
            break;
          }
          case 'in': {
            for (var i of keyss) {
              obj[i.nodeName] = i.nodeValue;
            }
            signal_in.push(obj);
            break;
          }
          case 'out': {
            for (var i of keyss) {
              obj[i.nodeName] = i.nodeValue;
            }
            signal_out.push(obj);
            break;
          }
          case 'param': {
            for (var i of keyss) {
              obj[i.nodeName] = i.nodeValue;
            }
            obj['val'] = innerHtml;
            param.push(obj);
            break;
          }
          case "overwrite_param": {
            for (var i of keyss) {
              obj[i.nodeName] = i.nodeValue;
            }
            overwrite_param.push(obj);
            break;
          }
          case 'cmd': {
            cmd += getDecode(innerHtml) + '\n\n';
            break;
          }
          case 'cmd_start': {
            cmd_start += getDecode(innerHtml) + '\n\n';
            break;
          }
          case 'cmd_end': {
            cmd_end += getDecode(innerHtml) + '\n\n';
            break;
          }
        }
      }
      nowTemplateConfig[0]['param'] = param;
      nowTemplateConfig[1].content['in'] = signal_in;
      nowTemplateConfig[1].content['scene_out'] = scene_out;
      nowTemplateConfig[1].content['sample_out'] = sample_out;
      nowTemplateConfig[1].content['out'] = signal_out;
      nowTemplateConfig[1].content['report_out'] = report_out;
      nowTemplateConfig[1].content['sample_in'] = sample_in;
      nowTemplateConfig[0]['cmd'] = cmd;
      nowTemplateConfig[0]['cmd_start'] = cmd_start;
      nowTemplateConfig[0]['cmd_end'] = cmd_end;
      nowTemplateConfig[0]["overwrite_param"] = overwrite_param;
      $('.module_content>p').removeClass('active');
      $('.module_content').append('<p class="active"><span>' + (nowTemplateConfig[0]['enabled'] == 'yes' ? '(O)' : '(X)') + '</span><span>' + nowTemplateConfig[0]['name'] + '</span></p>');
      activeIndex = $(".module_content>p.active").index();
      if (nowTemplateConfig[0]["template"] == "" || !Boolean(nowTemplateConfig[0]["template"])) {
        // if (nowTemplateConfig[0]["template"] == "" || Boolean(nowTemplateConfig[0]["template"])) {//2.1.x
        modules.push(nowTemplateConfig);
        getContentVal(modules[activeIndex]);
      } else {
        modules.push([nowTemplateConfig[0], {
          "content": {}
        }]);
        templateMode == "use_mode"
        biQueryPythonTemplateInfo(nowTemplateConfig[0]["template"]);
      }
      $('.parameters .title>.left').addClass('blue2');
      $('.parameters .table_content>ul').eq(0).addClass('blue');
    }
  } else if (path.indexOf('.py') != -1) {
    var i = $('.loop_list>li.checked').index();
    $('.loop_list_content>div').eq(i).find('textarea').val(text);
    $('[language="save"],[language="abort"]').removeClass('disabled_a');
    $('.module_content>p,[language="add_module"],[language="import_module"],[language="export_module"],[language="export_code"],[language="remove_module"]').addClass('disabled_a');
  }
  setConfig();
}

//模块切换
function modeChange(val) {
  if (val === "" || val === "0" || val === "2" || val == undefined) { //一般模式|修改模板
    $(".templatemode").hide();
    $(".normalmode").show();
  } else { //使用模板
    $(".templatemode").show();
    $(".normalmode").hide();
  }
}

//独立任务 import_code导入代码 export_code导出代码
function biOnResultOfStandaloneTask(key, result, returnValue) {
  if (key == "import_code") {
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(returnValue, "text/xml");
    var config = xmlDoc.childNodes[0].childNodes;
    var obj = { "cmd": [], "cmd_start": [], "cmd_end": [] };
    if (config.length < 0) return;
    for (var n = 0; n < config.length; n++) {
      obj[config[n].nodeName].push(getDecode(config[n].innerHTML));
    }
    //禁用
    $('.loop_list_content>div').each(function () {
      var text = "";
      for (var j of obj[$(this).find('textarea').attr("name")]) {
        j = j.replace(/\n/ig, "\n\n");
        text += j + "\n\n";
      }
      $(this).find('textarea').val(text);
    });
    $('[language="save"],[language="abort"]').removeClass('disabled_a');
    $('.module_content>p,[language="add_module"],[language="import_module"],[language="export_module"],[language="export_code"],[language="remove_module"]').addClass('disabled_a');
  }
}