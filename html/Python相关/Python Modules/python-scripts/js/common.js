var lang;
var modules = [];

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

function biOnInitEx(config, moduleConfigs) {
  lang = biGetLanguage() == 1 ? en : cn;
  $('[language]').each(function () {
    if (this.tagName !== "html") {
      var value = $(this).attr('language');
      $(this).text(lang[value]);
    }
  });
  var parser = new DOMParser();
  var xmlDoc = parser.parseFromString(moduleConfigs["python-scripts.pluginpython"], "text/xml");
  var countrys = xmlDoc.getElementsByTagName('root');
  for (var k = 0; k < countrys[0].childNodes.length; k++) {
    var obj = {};
    var arrConfig = [];
    var keys = countrys[0].childNodes[k].attributes;
    for (var n = 0; n < keys.length; n++) {
      obj[keys[n].nodeName] = keys[n].nodeValue;
    }
    arrConfig.push(obj, {
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
    for (var j = 0; j < countrys[0].childNodes[k].childNodes.length; j++) {
      var keyss = countrys[0].childNodes[k].childNodes[j].attributes;
      obj = {};
      var nodeName = countrys[0].childNodes[k].childNodes[j].localName;
      var innerHtml = countrys[0].childNodes[k].childNodes[j].innerHTML;
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
        case "overwrite_param": {
          for (var i of keyss) {
            obj[i.nodeName] = i.nodeValue;
          }
          overwrite_param.push(obj);
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
      arrConfig[1].content['in'] = signal_in;
      arrConfig[1].content['scene_out'] = scene_out;
      arrConfig[1].content['sample_out'] = sample_out;
      arrConfig[1].content['out'] = signal_out;
      arrConfig[1].content['report_out'] = report_out;
      arrConfig[1].content['sample_in'] = sample_in;
      arrConfig[0]['cmd'] = cmd;
      arrConfig[0]['cmd_start'] = cmd_start;
      arrConfig[0]['cmd_end'] = cmd_end;
      arrConfig[0]["param"] = param;
      if (overwrite_param.length > 0) {
        arrConfig[0]['overwrite_param'] = overwrite_param;
      }
      if (arrConfig[0]["id_legacy_mode"] == undefined) arrConfig[0]["id_legacy_mode"] = "yes"
    }
    modules.push(arrConfig);
  }
  lang = biGetLanguage() == 1 ? en : cn;
  loadConfig(config);
}

function setConfig() {
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root>";
  for (var i in modules) {
    text += "<s "
    for (var j in modules[i][0]) {
      if (j != 'param' && j != 'cmd' && j != 'cmd_start' && j != 'cmd_end' && j != "overwrite_param") {
        text += j + "=\"" + modules[i][0][j] + "\" ";
      }
    }
    text += ">"
    for (var j in modules[i][1]['content']) {
      switch (j) {
        case 'in': {
          for (var k in modules[i][1]['content'][j]) {
            text += "<in signal=\"" + modules[i][1]['content'][j][k]['signal'] + "\" nearest=\"" + modules[i][1]['content'][j][k]['nearest'] + "\" param=\"" + modules[i][1]['content'][j][k]['param'] + "\" default_val=\"" + modules[i][1]['content'][j][k]['default_val'] + "\" />";
          }
          break;
        }
        case 'out': {
          for (var k in modules[i][1]['content'][j]) {
            text += "<out param=\"" + modules[i][1]['content'][j][k]['param'] + "\" />";
          }
          break;
        }
        case 'sample_in': {
          for (var k in modules[i][1]['content'][j]) {
            text += "<sample_in>" + modules[i][1]['content'][j][k] + "</sample_in>";
          }
          break;
        }
        case 'sample_out': {
          for (var k in modules[i][1]['content'][j]) {
            text += "<sample_out id=\"" + modules[i][1]['content'][j][k]['id'] + "\" name=\"" + (modules[i][1]['content'][j][k]['name'] == undefined ? '' : modules[i][1]['content'][j][k]['name']) + "\">" + (modules[i][1]['content'][j][k]['val'] == undefined ? '' : modules[i][1]['content'][j][k]['val']) + "</sample_out>";
          }
          break;
        }
        case 'scene_out': {
          for (var k in modules[i][1]['content'][j]) {
            text += "<scene_out id=\"" + modules[i][1]['content'][j][k]['id'] + "\">" + (modules[i][1]['content'][j][k]['val'] == undefined ? '' : modules[i][1]['content'][j][k]['val']) + "</scene_out>";
          }
          break;
        }
        case 'report_out': {
          for (var k in modules[i][1]['content'][j]) {
            text += "<report_out id=\"" + modules[i][1]['content'][j][k]['id'] + "\" type=\"" + modules[i][1]['content'][j][k]['type'] + "\" title=\"" + modules[i][1]['content'][j][k]['title'] + "\" configs=\"" + modules[i][1]['content'][j][k]['configs'] + "\" column_titles=\"" + modules[i][1]['content'][j][k]['column_titles'] + "\" />"
          }
          break;
        }
      }
    }
    for (var k in modules[i][0]['param']) {
      text += "<param name=\"" + modules[i][0]['param'][k]['name'] + "\"" + " value=\"" + modules[i][0]['param'][k]['value'] + "\">" + modules[i][0]['param'][k]['val'] + "</param>";
    }
    if (Boolean(modules[i][0]['cmd'])) text += "<cmd>" + getEncode64(modules[i][0]['cmd']) + "</cmd>";
    if (Boolean(modules[i][0]['cmd_start'])) text += "<cmd_start>" + getEncode64(modules[i][0]['cmd_start']) + "</cmd_start>";
    if (Boolean(modules[i][0]['cmd_end'])) text += "<cmd_end>" + getEncode64(modules[i][0]['cmd_end']) + "</cmd_end>";
    if (Boolean(modules[i][0]['overwrite_param']) && modules[i][0]['overwrite_param'].length > 0) {
      for (var k in modules[i][0]['overwrite_param']) {
        text += "<overwrite_param name=\"" + modules[i][0]['overwrite_param'][k]['name'] + "\"" + " value=\"" + modules[i][0]['overwrite_param'][k]['value'] + "\"/>";
      }
    }
    text += "</s>"
  }
  text += "</root>";
  biSetModuleConfig("python-scripts.pluginpython", text);
}