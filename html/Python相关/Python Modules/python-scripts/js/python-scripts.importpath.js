$('.import_path_content').on('click', 'p', function () {
  $(this).addClass('active').siblings().removeClass('active');
  $('.remove_path').attr('disabled', false).removeClass("button_disabled");
})

$('.import_path button').click(function () {
  var lang = $(this).attr('language');
  switch (lang) {
    case 'remove_path': {
      $('.import_path_content>p.active').remove();
      $(this).attr('disabled', true).addClass("button_disabled");
      setConfig();
      break;
    }
    case 'add_path': {
      biSelectPath('add_path', BISelectPathType.Directory, 'null');
      break;
    }
  }
})

function biOnSelectedPath(key, path) {
  if (path != null) {
    var count = 0;
    for (var i = 0; i < $('.import_path_content>p').length; i++) {
      if ($('.import_path_content>p').eq(i).text() == path) count++;
    }
    if (count == 0) {
      $('.import_path_content').append('<p>' + path + '</p>');
      setConfig();
    } else {
      biAlert('Path already exists.')
    }
  }
}

function setConfig() {
  var text = [];
  for (var i = 0; i < $('.import_path_content>p').length; i++) {
    var html = $('.import_path_content>p').eq(i).text();
    text.push(html);
  }
  biSetGlobalPath("PythonImportPaths", text)
}

function biOnInitEx(config, moduleConfigs) {
  biQueryGlobalPath("PythonImportPaths");
  $('[language]').each(function () {
    var value = $(this).attr('language');
    $(this).text(biGetLanguage() == 1 ? en[value] : cn[value]);
  });
}

function biOnQueriedGlobalPath(id, paths) {
  for (var i = 0; i < paths.length; i++) {
    $('.import_path_content').append("<p title='" + paths[i] + "'>" + paths[i] + "</p>");
  }
}