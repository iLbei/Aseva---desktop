//2023/9/22 v2.1.0 在获取input/etc/数据/.pcd文件的基础上，获取所选文件夹下的pcd文件
var aPath = '', not_config = "";
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
    var val = '';
    val = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root><config ";
    $('a').each(function () {
      val += $(this).attr('name') + "=\"" + ($(this).text().indexOf(not_config) != -1 ? '' : $(this).html() + '\\') + "\" ";
    });
    val += " format=\"" + $('[name=format]').val() + "\" " + "file_list" + "=\"" + (aPath.length > 1 ? aPath.substring(0, aPath.length - 1) : '') + "\"/></root>";
    biSetViewConfig(val)
    if ($('[name=input_data_path]').text().indexOf(not_config) == -1 && $('[name=output_data_path]').text().indexOf(not_config) == -1 && $('[name=format]').val() != 0) {
      biRunStandaloneTask('PCDConvertProc', 'pcd-convert-task.aspluginpcdexport', val);
    }
  },
  "mousedown": function () {
    $(this).parent().addClass('border2').removeClass('border1')
  },
  "mouseup": function () {
    $(this).parent().removeClass('border2').addClass('border1')
  }
})
var nowState = false;//用来标记是获取的input/etc/.pcd(true),还是直接获取的文件夹下的pcd(false)
function biOnQueriedDirsInDirectory(dirs, path) {
  if (dirs[0] != '') {
    var dir = dirs[0].split('\n');
    for (var i in dir) {
      nowState = true;
      biQueryFilesInDirectory(dir[i]);
    }
  }
}
function biOnQueriedFilesInDirectory(files, path) {
  var filesArr = [];
  files = files[0].split('\n');
  for (var i in files) {
    var index = files[i].lastIndexOf('\\');
    if (nowState) {//获取input/etc/.pcd时
      var str = files[i].substring(0, index);
      index = str.lastIndexOf('\\') + 1;
      str = files[i].substring(index);
      filesArr.push(str);
    } else {
      var str2 = files[i].substring(index + 1);
      if(str2.indexOf(".pcd")!=-1)filesArr.push(str2);
    }
  }
  nowState = false;
  aPath += filesArr.join(',') + ',';
}
function biOnSelectedPath(key, path) {
  if (path) {
    $('[name=' + key + ']').html(path).attr("title", path);
  } else {
    $('[name=' + key + ']').text(not_config);
  }
  setConfig();
  aPath = '';
  biQueryFilesInDirectory($('[name=input_data_path]').html());//获取选中文件夹下的所有.pcd文件
  biQueryDirsInDirectory($('[name=input_data_path]').html());
}
function loadConfig(config) {
  if (config == null) return;
  $('[name=format]').val(config['format']);
  $('a').each(function () {
    var val = config[$(this).attr('name')];
    if (val == '') {
      $(this).text(not_config);
    } else {
      $(this).text(val).attr("title", val);
    }
  });
}
function setConfig() {
  text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root><config ";
  $('a').each(function () {
    text += $(this).attr('name') + "=\"" + ($(this).text().indexOf(not_config) != -1 ? '' : $(this).html()) + "\" ";
  });
  text += " format=\"" + $('[name=format]').val() + "\"/></root>";
  biSetModuleConfig("pcd-convert.aspluginpcdexport", text);
}
function biOnInitEx(config, moduleConfigs) {
  if (biGetLanguage() == 1) {
    $('[language]').each(function () {
      var value = $(this).attr('language');
      $(this).html(en[value]);
    });
    not_config = "<Not configured>";
  } else {
    $('[language]').each(function () {
      var value = $(this).attr('language');
      $(this).html(cn[value]);
      not_config = "<未配置>";
    })
  }
  for (var key in moduleConfigs) {
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(moduleConfigs[key], "text/xml");
    var obj = new Object();
    var root = xmlDoc.getElementsByTagName('root');
    var keys = root[0].childNodes[0].attributes;
    for (var i = 0; i < keys.length; i++) {
      //获取root自身字节的属性
      obj[keys[i].nodeName] = keys[i].nodeValue;
    }
    loadConfig(obj);
    if (keys['input_data_path'].nodeValue) {
      aPath = '';
      biQueryFilesInDirectory($('[name=input_data_path]').html());//获取选中文件夹下的所有.pcd文件
      biQueryDirsInDirectory($('[name=input_data_path]').html());
    }
  }
}