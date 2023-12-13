var modules = [],
  childIndex = 0;

//output report
$('.report_out_content').on('click', '.hist_list>li', function () {
  $(this).removeClass('hist_list_li_other').siblings().addClass('hist_list_li_other');
  $(this).parent().next().find('.item').eq($(this).index()).show().siblings().hide();
})

$('.report_out_bottom>div>a').on('click', function () {
  if(!$(this).hasClass("disabled_a")){
    var lang = $(this).attr('language');
  switch (lang) {
    case 'add_single_val':
      $('.report_out_content').append("<div class=\"single_val fixclear\" id=\"1\"><div><div class=\"left\"><span language=\"report_name\" class=\"left\" name=\"id\">" + $('[name=report_id]').val() + "</span><span language=\"SingleValue\" class=\"right\" type=\"SingleValue\"></span><br><span language=\"title\"></span><input type=\"text\" name=\"report_title\" value=\"Value report\"></div><div class=\"right\"><button class=\"del\">DEL</button></div></div></div>");
      break;
    case 'add_histogram':
      $('.report_out_content').append("<div class=\"histogram fixclear\" id=\"2\"><div class=\"fixclear\"><div class=\"left\"><span language=\"report_name\" class=\"left\" name=\"id\">" + $('[name=report_id]').val() + "</span><span language=\"hist_report\" class=\"right\" type=\"HistAndLine\"></span><br><span language=\"title\"></span><input type=\"text\" name=\"report_title\" value=\"Hist-line report\"></div><div class=\"right\"> <button class=\"del\">DEL</button></div></div><div class=\"left title_left\"><span language=\"x_title\"></span><input type=\"text\" name=\"hist_x_title\" value=\"X title\"><span language=\"mode\"></span><select name=\"histogram_mode\"><option value=\"Sum\">Sum</option><option value=\"Aver\">Aver</option><option value=\"Min\">Min</option><option value=\"Max\">Max</option><option value=\"Percentage\">Percentage</option><option value=\"HitRatio\">HitRatio</option><option value=\"SumAndSum\">SumAndSum</option><option value=\"MinAndMin\">MinAndMin</option><option value=\"MinAndMax\">MinAndMax</option><option value=\"MaxAndMax\">MaxAndMax</option><option value=\"AverAndMin\">AverAndMin</option><option value=\"AverAndMax\">AverAndMax</option><option value=\"AverAndAver\">AverAndAver</option><option value=\"AverAndDev\">AverAndDev</option></select><span language=\"hist_title\"></span><input type=\"text\" name=\"column_titles\" value=\"Hist title\"><span language=\"histogram_title\"></span><input type=\"text\" name=\"column_titles\" class=\"histogram_disabled disabled_background\" value=\"Line title\" disabled></div><div class=\"left\"><span language=\"x_values\">刻度:</span><ul class=\"hist_list fixclear\"><li language=\"numeric_mode\">数值</li><li class=\"hist_list_li_other\" language=\"label_mode\">文字</li></ul><div class=\"hist_list_content\"><div class=\"item\"><span language=\"xiayan\">下沿</span><input type=\"text\" name=\"XValues\" value=\"0\"><span language=\"jiange\">间隔</span><input type=\"text\" name=\"XValues\" value=\"10\"><span language=\"geshu\">格数</span><input type=\"text\" name=\"XValues\" value=\"10\"></div><div class=\"item\"><span language=\"title_split\">文字标签(逗号分隔):</span><input type=\"text\" name=\"XLabels\"></div></div><span language=\"default_val\"></span><input type=\"text\"  name=\"hist_defaultval\" value=\"0\" ><br><span language=\"default_val\"></span><input type=\"text\" value=\"0\" name=\"hist_defaultval\" class=\"histogram_disabled disabled_background\" disabled></div></div>");
      break;
    case 'add_scatter_diagram':
      $('.report_out_content').append("<div class=\"scatter_diagram fixclear\" id=\"3\"><div class=\"fixclear\"><div class=\"left\"><span language=\"report_name\" class=\"left\" name=\"id\">" + $('[name=report_id]').val() + "</span><span language=\"scatter_report\" class=\"right\" type=\"ScatterPoints\">散点图报告</span><br><span language=\"title\"></span><input type=\"text\" name=\"report_title\" value=\"Scatter report\"></div><div class=\"right\"><button class=\"del\">DEL</button></div></div><div class=\"left title_left\"><span language=\"x_title\"></span><input type=\"text\" name=\"scatter_title\" value=\"X title\"><span language=\"y_title\">Y轴标题</span><input type=\"text\" name=\"scatter_title\" value=\"Y title\"></div><div class=\"left\"><span language=\"x_xiayan\">范围下沿:</span><input type=\"text\"  value=\"-50\" name=\"scatter_configs\"><span language=\"x_shangyan\">范围上沿:</span><input type=\"text\"  value=\"50\" name=\"scatter_configs\"><span language=\"x_geshu\">X格数:</span><input type=\"text\"  value=\"10\" name=\"scatter_configs\"><span language=\"y_xiayan\">Y轴范围下沿:</span><input type=\"text\"  value=\"-50\" name=\"scatter_configs\"><span language=\"y_shangyan\">Y轴范围上沿:</span><input type=\"text\"  value=\"50\" name=\"scatter_configs\"><span language=\"y_geshu\">Y格数:</span><input type=\"text\"  value=\"10\" name=\"scatter_configs\"></div></div>");
      break;
    case 'add_matrix_diagram':
      $('.report_out_content').append("<div class=\"matrix_diagram fixclear\" id=\"4\"><div class=\"fixclear\"><div class=\"left\"><span language=\"report_name\" class=\"left\" name=\"id\">" + $('[name=report_id]').val() + "</span><span language=\"MatrixTable\" class=\"right\" type=\"MatrixTable\">矩阵热力图报告</span><br><span language=\"title\"></span><input type=\"text\" name=\"report_title\" value=\"Matrix table report\"></div><div class=\"right\"><button class=\"del\">DEL</button></div></div><div class=\"left title_left\"><span language=\"x_title\"></span><input type=\"text\" name=\"martrix_title\" value=\"X title\"><span language=\"y_title\">Y轴标题</span><input type=\"text\" name=\"martrix_title\" value=\"Y title\"><span language=\"mode\"></span><select name=\"matrix_mode\"><option value=\"Sum\">Sum</option><option value=\"Aver\">Aver</option><option value=\"Min\">Min</option><option value=\"Max\">Max</option><option value=\"Percentage\">Percentage</option></select></div><div class=\"left\"><span language=\"xiayan\">下沿</span><input type=\"text\" name=\"matrix_val\" value=\"0\"><span language=\"jiange\">间隔</span><input type=\"text\" name=\"matrix_val\" value=\"10\"><span language=\"geshu\">格数</span><input type=\"text\" name=\"matrix_val\" value=\"10\"><span language=\"xiayan\">下沿</span><input type=\"text\" name=\"matrix_val\" value=\"0\"><span language=\"jiange\">间隔</span><input type=\"text\" name=\"matrix_val\" value=\"10\"><span language=\"geshu\">格数</span><input type=\"text\" name=\"matrix_val\" value=\"10\"><div class=\"bottom\"><span language=\"matrix_fanwei\">数值显示范围:</span><input type=\"text\" value=\"0\" name=\"matrix_range\">~<input type=\"text\" value=\"100\"  name=\"matrix_range\"><span language=\"default_val\">默认值</span><input type=\"text\" value=\"0\" name=\"matrix_defaultval\"></div></div></div>");
      break;
    case 'add_table_diagram':
      $('.report_out_content').append("<div class=\"table_diagram fixclear\" id=\"5\"><div class=\"fixclear\"><div class=\"left\"><span language=\"report_name\" class=\"left\" name=\"id\">" + $('[name=report_id]').val() + "</span><span language=\"LabelTable\" class=\"right\" type=\"LabelTable\">表格热力图报告</span><br><span language=\"title\"></span><input type=\"text\" name=\"report_title\" value=\"Label table report\"></div><div class=\"right\"><button class=\"del\">DEL</button></div></div><div class=\"left title_left\"><span language=\"x_title\"></span><input type=\"text\" name=\"label_title\" value=\"X title\"><span language=\"y_title\">Y轴标题</span><input type=\"text\" name=\"label_title\" value=\"Y title\"><span language=\"mode\"></span><select name=\"label_mode\"><option value=\"Sum\">Sum</option><option value=\"Aver\">Aver</option><option value=\"Min\">Min</option><option value=\"Max\">Max</option><option value=\"Percentage\">Percentage</option></select></div><div class=\"left\"><span language=\"title_split\">文字标签(逗号分隔)</span><input type=\"text\" name=\"label_word\" value=\"X1,X2,X3\"><span language=\"title_split\">文字标签(逗号分隔)</span><input type=\"text\" name=\"label_word\" value=\"Y1,Y2,Y3\"><div class=\"bottom\"><span language=\"val_direction\">数值方向:</span><select name=\"label_val\"><option value=\"0\">Positive</option><option value=\"1\">Negative</option><option value=\"2\">Bidirectional</option></select><span language=\"default_val\">默认值:</span><input type=\"text\" name=\"label_defaultval\" value=\"0\"></div></div></div>");
      break;
  }
  $('[language]').each(function () {
    var value = $(this).attr('language');
    $(this).text(biGetLanguage() == 1 ? en[value] : cn[value]);
  });
  $('.report_out_bottom a').addClass('disabled_a');
  changeVal();
  }
})

$('[name=report_id]').on('input', function () {
  changeColor();
})

$('.report_out_content').on('click', '.del', function () {
  $(this).parent().parent().parent().remove();
  changeColor();
  changeVal();
})

$('.report_out_content').on('change', "[name],input,select", function () {
  changeVal();
})

$('.report_out_content').on('change', '[name=histogram_mode]', function () {
  histogramModeChange(this);
})

function changeColor() {
  var count = 0;
  $('.report_out_content>div [language=report_name]').each(function () {
    if ($(this).text() == $('[name=report_id]').val()) count++;
  })
  if (count == 0 && $("[name=report_id]").val().trim().length > 0) {
    $('.report_out_bottom a').removeClass('disabled_a');
  } else {
    $('.report_out_bottom a').addClass('disabled_a');
  }
}

function histogramModeChange(obj) {
  var i = 0;
  $(obj).children().each(function () {
    if ($(this).attr('value') == $(obj).val()) {
      i = $(this).index();
      return;
    }
  })
  if (i < 6) {
    $(obj).parent().parent().find('.histogram_disabled').attr('disabled', true).addClass("disabled_background");
  } else {
    $(obj).parent().parent().find('.histogram_disabled').removeAttr('disabled').removeClass("disabled_background");
  }

}

function changeVal() {
  var arr = [];
  for (var i = 0; i < $('.report_out_content>div').length; i++) {
    var boxVal = [];
    var id = Number($('.report_out_content>div').eq(i).attr('id'))
    var obj = {};
    obj['id'] = $('.report_out_content>div').eq(i).find('[name=id]').text();
    obj['type'] = $('.report_out_content>div').eq(i).find('div>div:nth-child(1)>span:nth-child(2)').attr('type');
    if (!$('.report_out_content>div').eq(i).find('[name=report_title]').hasClass('red')) {
      obj['title'] = $('.report_out_content>div').eq(i).find('[name=report_title]').val();
    }
    switch (id) {
      case 1:
        obj['configs'] = '';
        obj['column_titles'] = "Value";
        break;
      case 2:
        var XLabels = $('.report_out_content>div').eq(i).find('[name="XLabels"]').val();
        boxVal = [$('.report_out_content>div').eq(i).find('[name="histogram_mode"]').val(), $('.report_out_content>div').eq(i).find('[name=hist_x_title]').val(), $('.report_out_content>div').eq(i).find('[name="hist_defaultval"]').eq(0).val(), $('.report_out_content>div').eq(i).find('[name="hist_defaultval"]').eq(1).val(), 'XValues', ($('.report_out_content>div').eq(i).find('[name="XValues"]').eq(0).val() + ',' + $('.report_out_content>div').eq(i).find('[name="XValues"]').eq(1).val() + ',' + $('.report_out_content>div').eq(i).find('[name="XValues"]').eq(2).val())]
        if (XLabels != '') boxVal.push('XLabels', XLabels);
        obj['configs'] = boxVal;
        obj['column_titles'] = [$('.report_out_content>div').eq(i).find('[name="column_titles"]').eq(0).val(), 'Aux', $('.report_out_content>div').eq(i).find('[name="column_titles"]').eq(1).val(), 'Aux'];
        break;
      case 3:
        obj['configs'] = [$('.report_out_content>div').eq(i).find('[name=scatter_configs]').eq(0).val(), $('.report_out_content>div').eq(i).find('[name=scatter_configs]').eq(1).val(), $('.report_out_content>div').eq(i).find('[name=scatter_configs]').eq(3).val(), $('.report_out_content>div').eq(i).find('[name=scatter_configs]').eq(4).val(), $('.report_out_content>div').eq(i).find('[name=scatter_configs]').eq(2).val(), $('[name=scatter_configs]').eq(5).val()];
        obj['column_titles'] = [$('.report_out_content>div').eq(i).find('[name=scatter_title]').eq(0).val(), $('.report_out_content>div').eq(i).find('[name=scatter_title]').eq(1).val()];
        break;
      case 4:
        obj['configs'] = [$('.report_out_content>div').eq(i).find('[name=matrix_mode]').val()];
        for (var j = 0; j < 6; j++) {
          obj['configs'].push($('.report_out_content>div').eq(i).find('[name=matrix_val]').eq(j).val());
        }
        obj['configs'].push($('.report_out_content>div').eq(i).find('[name=matrix_range]').eq(0).val(), $('.report_out_content>div').eq(i).find('[name=matrix_range]').eq(1).val(), $('.report_out_content>div').eq(i).find('[name="martrix_title"]').eq(0).val(), $('.report_out_content>div').eq(i).find('[name="martrix_title"]').eq(1).val(), $('.report_out_content>div').eq(i).find('[name="matrix_defaultval"]').val())
        obj['column_titles'] = "Value,Aux";
        break;
      case 5:
        obj['configs'] = [$('.report_out_content>div').eq(i).find('[name=label_mode]').val(), 1, 1, $('.report_out_content>div').eq(i).find('[name=label_val]').val(), $('.report_out_content>div').eq(i).find('[name="label_defaultval"]').val(), $('.report_out_content>div').eq(i).find('[name="label_title"]').eq(0).val(), $('.report_out_content>div').eq(i).find('[name="label_title"]').eq(1).val(), $('.report_out_content>div').eq(i).find('[name="label_word"]').eq(0).val(), $('.report_out_content>div').eq(i).find('[name="label_word"]').eq(1).val()];
        obj['column_titles'] = "Value,Aux";
        break;
    }
    arr.push(obj);
  }
  modules[childIndex][1]['content']['report_out'] = arr;
  biSetLocalVariable("python_script_reportout" + childIndex, JSON.stringify(modules[childIndex][1]['content']["report_out"]));
  setConfig();
}

function loadConfig(config) {
  childIndex = config;
  var val = modules[childIndex][1]['content']["report_out"];
  for (var i in val) {
    var configs = val[i]['configs'].toString(),
      XValues = ['', '', ''],
      XLabels = '';
    var XValuesIndex = configs.indexOf('XValues');
    var XLabelsIndex = configs.indexOf('XLabels');
    if (XLabelsIndex != -1) {
      XLabels = configs.substr(XLabelsIndex + 8, configs.length);
      configs = configs.substr(0, XLabelsIndex - 1);
    }
    if (XValuesIndex != -1) {
      XValues = configs.substr(XValuesIndex + 8, configs.length).split(',');
      if (XValues.length == 1) XValues = ['', '', ''];
      configs = configs.substr(0, XValuesIndex - 1);
    }
    configs = Array.isArray(configs) ? configs : configs.split(',');
    var column_titles = Array.isArray(val[i]['column_titles']) ? val[i]['column_titles'] : val[i]['column_titles'].split(',');
    switch (val[i]['type']) {
      case 'SingleValue':
        $('.report_out_content').append("<div class=\"single_val fixclear\" id=\"1\"><div><div class=\"left\"><span language=\"report_name\" class=\"left\" name=\"id\">" + val[i]['id'] + "</span><span language=\"SingleValue\" class=\"right\" type=\"SingleValue\">" + val[i]['type'] + "</span><br><span language=\"title\"></span><input type=\"text\" name=\"report_title\" value=\"" + val[i]['title'] + "\"></div><div class=\"right\"><button class=\"del\">DEL</button></div></div></div>");
        break;
      case "HistAndLine":
        $('.report_out_content').append("<div class=\"histogram fixclear\" id=\"2\"><div class=\"fixclear\"><div class=\"left\"><span language=\"report_name\" class=\"left\" name=\"id\">" + val[i]['id'] + "</span><span language=\"hist_report\" class=\"right\" type=\"HistAndLine\"></span><br><span language=\"title\"></span><input type=\"text\" name=\"report_title\" value=\"" + val[i]['title'] + "\"></div><div class=\"right\"><button class=\"del\">DEL</button></div></div><div class=\"left title_left\"><span language=\"x_title\"></span><input type=\"text\" name=\"hist_x_title\" value=\"" + configs[1] + "\"><span language=\"mode\"></span><select name=\"histogram_mode\"><option value=\"Sum\">Sum</option><option value=\"Aver\">Aver</option><option value=\"Min\">Min</option><option value=\"Max\">Max</option><option value=\"Percentage\">Percentage</option><option value=\"HitRatio\">HitRatio</option><option value=\"SumAndSum\">SumAndSum</option><option value=\"MinAndMin\">MinAndMin</option><option value=\"MinAndMax\">MinAndMax</option><option value=\"MaxAndMax\">MaxAndMax</option><option value=\"AverAndMin\">AverAndMin</option><option value=\"AverAndMax\">AverAndMax</option><option value=\"AverAndAver\">AverAndAver</option><option value=\"AverAndDev\">AverAndDev</option></select><span language=\"hist_title\"></span><input type=\"text\" name=\"column_titles\" value=\"" + column_titles[0] + "\"><span language=\"histogram_title\"></span><input type=\"text\" name=\"column_titles\" class=\"histogram_disabled disabled_background\" value=\"" + (column_titles[2] == undefined ? 'Line title' : column_titles[2]) + "\" disabled></div><div class=\"left\"><span language=\"x_values\">刻度:</span><ul class=\"hist_list fixclear\"><li language=\"numeric_mode\">数值</li><li class=\"hist_list_li_other\" language=\"label_mode\">文字</li></ul><div class=\"hist_list_content\"><div class=\"item\"><span language=\"xiayan\">下沿</span><input type=\"text\" name=\"XValues\" value=\"" + XValues[0] + "\"><span language=\"jiange\">间隔</span><input type=\"text\" name=\"XValues\" value=\"" + XValues[1] + "\"><span language=\"geshu\">格数</span><input type=\"text\" name=\"XValues\" value=\"" + XValues[2] + "\"></div><div class=\"item\"><span language=\"title_split\">文字标签(逗号分隔):</span><input type=\"text\" name=\"XLabels\" value=\"" + XLabels + "\"></div></div><span language=\"hist_def_val\">默认值:</span><input type=\"text\"  name=\"hist_defaultval\" value=\"" + configs[2] + "\" ><br><span language=\"line_def_val\">默认值:</span><input type=\"text\" value=\"" + configs[3] + "\" name=\"hist_defaultval\" class=\"histogram_disabled disabled_background\" disabled></div></div>");
        $('.report_out_content>div').eq($('.report_out_content>div').length - 1).find('[name="histogram_mode"]').val(configs[0]);
        break;
      case 'ScatterPoints':
        $('.report_out_content').append("<div class=\"scatter_diagram fixclear\" id=\"3\"><div class=\"fixclear\"><div class=\"left\"><span language=\"report_name\" class=\"left\" name=\"id\">" + val[i]['id'] + "</span><span language=\"scatter_report\" class=\"right\" type=\"ScatterPoints\">散点图报告</span><br><span language=\"title\"></span><input type=\"text\" name=\"report_title\" value=\"" + val[i]['title'] + "\"></div><div class=\"right\"><button class=\"del\">DEL</button></div></div><div class=\"left title_left\"><span language=\"x_title\"></span><input type=\"text\" name=\"scatter_title\" value=\"" + column_titles[0] + "\"><span language=\"y_title\">Y轴标题</span><input type=\"text\" name=\"scatter_title\" value=\"" + column_titles[1] + "\"></div><div class=\"left\"><span language=\"x_xiayan\">范围下沿:</span><input type=\"text\"  value=\"" + configs[0] + "\" name=\"scatter_configs\"><span language=\"x_shangyan\">范围上沿:</span><input type=\"text\"  value=\"" + configs[1] + "\" name=\"scatter_configs\"><span language=\"x_geshu\">X格数:</span><input type=\"text\"  value=\"" + configs[4] + "\" name=\"scatter_configs\"><span language=\"y_xiayan\">Y轴范围下沿:</span><input type=\"text\"  value=\"" + configs[2] + "\" name=\"scatter_configs\"><span language=\"y_shangyan\">Y轴范围上沿:</span><input type=\"text\"  value=\"" + configs[3] + "\" name=\"scatter_configs\"><span language=\"y_geshu\">Y格数:</span><input type=\"text\"  value=\"" + configs[5] + "\" name=\"scatter_configs\"></div></div>");
        break;
      case 'MatrixTable':
        $('.report_out_content').append("<div class=\"matrix_diagram fixclear\" id=\"4\"><div class=\"fixclear\"><div class=\"left\"><span language=\"report_name\" class=\"left\" name=\"id\">" + val[i]['id'] + "</span><span language=\"MatrixTable\" class=\"right\" type=\"MatrixTable\">矩阵热力图报告</span><br><span language=\"title\"></span><input type=\"text\" name=\"report_title\" value=\"" + val[i]['title'] + "\"></div><div class=\"right\"><button class=\"del\">DEL</button></div></div><div class=\"left title_left\"><span language=\"x_title\"></span><input type=\"text\" name=\"martrix_title\" value=\"" + configs[9] + "\"><span language=\"y_title\">Y轴标题</span><input type=\"text\" name=\"martrix_title\" value=\"" + configs[10] + "\"><span language=\"mode\"></span><select name=\"matrix_mode\"><option value=\"Sum\">Sum</option><option value=\"Aver\">Aver</option><option value=\"Min\">Min</option><option value=\"Max\">Max</option><option value=\"Percentage\">Percentage</option></select></div><div class=\"left\"><span language=\"xiayan\">下沿</span><input type=\"text\" name=\"matrix_val\" value=\"" + configs[1] + "\"><span language =\"jiange\">间隔</span><input type=\"text\" name=\"matrix_val\" value=\"" + configs[2] + "\"><span language =\"geshu\">格数</span><input type=\"text\" name=\"matrix_val\" value=\"" + configs[3] + "\"> <span language =\"xiayan\">下沿</span><input type=\"text\" name=\"matrix_val\" value=\"" + configs[4] + "\"><span language =\"jiange\">间隔</span><input type=\"text\" name=\"matrix_val\" value=\"" + configs[5] + "\"><span language =\"geshu\">格数</span><input type=\"text\" name=\"matrix_val\" value=\"" + configs[6] + "\"><div class=\"bottom\"><span language=\"matrix_fanwei\">数值显示范围:</span><input type=\"text\" value=\"" + configs[7] + "\" name=\"matrix_range\">~<input type=\"text\" value=\"" + configs[8] + "\"  name=\"matrix_range\"><span language=\"default_val\">默认值</span><input type=\"text\" value=\"" + configs[11] + "\" name=\"matrix_defaultval\"></div></div></div>");
        $('.report_out_content>div').eq($('.report_out_content>div').length - 1).find('[name="matrix_mode"]').val(configs[0])
        break;
      case 'LabelTable':
        $('.report_out_content').append("<div class=\"table_diagram fixclear\" id=\"5\"><div class=\"fixclear\"><div class=\"left\"><span language=\"report_name\" class=\"left\" name=\"id\">" + val[i]['id'] + "</span><span language=\"LabelTable\" class=\"right\" type=\"LabelTable\">表格热力图报告</span><br><span language=\"title\"></span><input type=\"text\" name=\"report_title\" value=\"" + val[i]['title'] + "\"></div><div class=\"right\"><button class=\"del\">DEL</button></div></div><div class=\"left title_left\"><span language=\"x_title\"></span><input type=\"text\" name=\"label_title\" value=\"" + configs[5] + "\"><span language=\"y_title\">Y轴标题</span><input type=\"text\" name=\"label_title\" value=\"" + configs[6] + "\"><span language=\"mode\"></span><select name=\"label_mode\"><option value=\"Sum\">Sum</option><option value=\"Aver\">Aver</option><option value=\"Min\">Min</option><option value=\"Max\">Max</option><option value=\"Percentage\">Percentage</option></select></div><div class=\"left\"><span language=\"title_split\">文字标签(逗号分隔)</span><input type=\"text\" name=\"label_word\" value=\"" + configs[7] + "\"><span language=\"title_split\">文字标签(逗号分隔)</span><input type=\"text\" name=\"label_word\" value=\"" + configs[8] + "\"><div class=\"bottom\"><span language=\"val_direction\">数值方向:</span><select name=\"label_val\"><option value=\"0\">Positive</option><option value=\"1\">Negative</option><option value=\"2\">Bidirectional</option></select><span language=\"default_val\">默认值:</span><input type=\"text\" name=\"label_defaultval\" value=\"" + configs[4] + "\"></div></div></div>");
        $('.report_out_content>div').eq($('.report_out_content>div').length - 1).find('[name="label_mode"]').val(configs[0]);
        $('.report_out_content>div').eq($('.report_out_content>div').length - 1).find('[name="label_val"]').val(configs[3]);
        break;
    }
  }
  $('[name="histogram_mode"]').each(function () {
    histogramModeChange(this);
  })
  $('.report_out_bottom a').addClass('disabled_a');
  if (biGetLanguage() == 1) {
    inputs = " inputs";
    none = '<None></None>';
  } else {
    inputs = "个输入";
    none = '<无>';
  }
  lang = biGetLanguage() == 1 ? en : cn;
  $('[language]').each(function () {
    if (this.tagName !== "html") {
      var value = $(this).attr('language');
      $(this).text(lang[value]);
    }
  });
}