var reg = /^[a-zA-Z]:/,
  input_data_path_list = '',
  output_data_path_list = '',//用来接收独立任务中output_data_path_list的内容
  data_path = '',
  task_config = '',
  not_config = '',
  count = 0,
  dataLength = 0,
  split = "";
$('a').on('click', function () {
  switch ($(this).attr('name')) {
    case "input_data_path": {
      biSelectPath("input_data_path", BISelectPathType.Directory, null);
      break;
    }
    case "output_data_path": {
      biSelectPath("output_data_path", BISelectPathType.Directory, null);
      break;
    }
  }
});
$('[name]').on('change', function () {
  setConfig();
});
$('button').on({
  'click': function () {
    times = 0, existCount = 0, count = 0;
    var input_path = $('[name=input_data_path]').text().indexOf(not_config) != -1 ? "" : $('[name=input_data_path]').text();
    var output_path = $('[name=output_data_path]').text().indexOf(not_config) != -1 ? "" : $('[name=output_data_path]').text();
    var local_path = $('[name=local_path]').is(":checked") ? 'yes' : 'no',
      split = reg.test(data_path == '' ? input_path : data_path) ? '\\' : '/',
      path = '';
    task_config = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root><config ";
    input_data_path_list = input_path;
    //获取output_data_path_list
    if (local_path == 'no') {
      //截取input路径片段：最后文件夹名称
      output_data_path_list = input_data_path_list.substr(0, input_data_path_list.lastIndexOf(split));
      var name = output_data_path_list.substr(output_data_path_list.lastIndexOf(split) + 1, output_data_path_list.length);
      output_data_path_list = output_path + name + split + ';';
    } else {
      output_data_path_list = data_path;
    }
    $('a').each(function () {
      var name = $(this).attr('name');
      var value = $(this).text();
      if (name == "output_data_path") {
        value = output_data_path_list.substr(0, output_data_path_list.length - 1);
      } else if (name == 'input_data_path') {
        if ($("[name=local_path]").is(":checked")) {
          value = data_path.substr(0, data_path.length - 1);
        } else {
          value = input_data_path_list;
        }
      }
      if (name.indexOf('data_path') != -1) name += '_list';
      task_config += name + "=\"" + value + "\" ";
    })
    $('select').each(function () {
      var name = $(this).attr('name');
      task_config += name + "=\"" + $(this).val() + "\" ";
    })
    task_config += " local_path=\"" + local_path + "\" ";
    task_config += "/></root>";
    biSetViewConfig(task_config);
    if (!$('[name=local_path]').is(':checked')) {
      biQueryDirectoryExist(input_data_path_list + 'pcd_Merge');
    }
    path = output_data_path_list.substr(0, output_data_path_list.length - 1).split(';')
    dataLength = path.length;//获取数据文件夹下文件夹的个数
    for (var i in path) {
      biQueryDirectoryExist(path[i] + 'pcd_Merge');
    }
  }
})

function biOnSelectedPath(key, path) {
  if (path == null) {
    $('[name=' + key + ']').removeAttr('title').text(not_config);
  } else {
    $('[name=' + key + ']').attr('title', path + (reg.test(path) ? '\\' : '\/')).text(path + (reg.test(path) ? '\\' : '\/'));
  };
  setConfig();
}
function loadConfig(config) {
  if (config == null) return;
  $('[name]').each(function () {
    var val = config[$(this).attr('name')];
    if ($(this).is('a')) {
      if (val == '') {
        $(this).text(not_config).removeAttr("title")
      } else {
        $(this).text(val).attr('title', val)
      }
    } else if ($(this).is('input[type=checkbox]')) {
      $(this).prop('checked', val == 'yes' ? true : false);
    } else {
      $(this).val(val);
    }
  })
  data_path = biGetDataPath();
  split = reg.test(data_path) ? '\\' : '\/';
  data_path = '';
  biQuerySessionList(false);
}

function biOnQueriedSessionList(list, filtered) {
  for (var i in list) {
    biQuerySessionPath(list[i])
  }
}
function biOnQueriedSessionPath(path, session) {
  biQueryDirectoryExist(path + split + 'input' + split + 'etc')
}
var times = 0, existCount = 0;//times:查询文件夹次数，existCount：有pcd_merge个数
function biOnQueriedDirectoryExist(exist, path) {
  if (path.indexOf('etc') != -1 && path.length - path.indexOf('etc') == 3) {
    if (exist) data_path += path + split + ';';
  } else if (path.indexOf('pcd_Merge') != -1) {
    times++;
    if (($('[name=local_path]').is(':checked') || ($('[name=output_data_path]').text().indexOf(not_config) == -1)) && $('[name="format"]').val() != 0) {
      if (count == 0 && dataLength == times) {
        count++;
        biRunStandaloneTask('PCDMergeProc', 'pcd-merge-task.aspluginpcdmerge', task_config);
      }
    }
  }
}

function setConfig() {
  text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root><config ";
  $('[name]').each(function () {
    var name = $(this).attr('name');
    if ($(this).is('select')) {
      text += name + "=\"" + $(this).val() + "\" ";
    } else if ($(this).is('a')) {
      text += name + "=\"" + ($(this).text().indexOf(not_config) != -1 ? '' : $(this).text()) + "\" ";
    } else if ($(this).is('input[type=checkbox]')) {
      text += name + "=\"" + ($(this).is(":checked") ? 'yes' : 'no') + "\" ";
    }
  });
  text += "/></root>";
  biSetModuleConfig("pcd-merge.aspluginpcdmerge", text);
}
function biOnInitEx(config, moduleConfigs) {
  var lang = biGetLanguage() == 1 ? en : cn;
  $('[language]').each(function () {
    var value = $(this).attr('language');
    $(this).text(lang[value])
  });
  not_config = lang["not_config"];
  for (var key in moduleConfigs) {
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(moduleConfigs[key], "text/xml");
    var countrys = xmlDoc.getElementsByTagName('root');
    var keys = countrys[0].childNodes[0].attributes;
    var obj = new Object();
    for (var i = 0; i < keys.length; i++) {
      obj[keys[i].nodeName] = keys[i].nodeValue;
    }
    loadConfig(obj);
  }
}