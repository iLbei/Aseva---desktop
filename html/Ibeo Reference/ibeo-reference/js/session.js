/**
 * @param {Array} sessionList session列表(包含time和path)
 */
var sessionList = [];
/**
 * @param {Array} default_session_path 默认文件路径
 */
var default_session_path = [];
/**
* @param {Array} processingList 从processing拿到的数据列表,processing列表里的所有路径(均包含meta.xml文件)
*/
// var processingList = [];
var flag = false;//true:判断导入文件格式是否正确；false:判断文件processing所需文件是否存在
var reg = /^[a-zA-Z]:/; //判断linux或者windows，应该/ 还是\
function formatDate(date) {
  date = new Date(date);
  var YY = date.getFullYear() + '-';
  var MM = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
  var DD = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
  var hh = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
  var mm = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':';
  var ss = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
  return YY + MM + DD + " " + hh + mm + ss;
}

//移除单个
function removeBox(obj) {
  $(obj).parent().remove();
}

function ok() {
  sessionList = [];
  for (let i = 1; i < $(".content>.center>div.box").length; i++) {
    var text = $(".content>.center>div.box").eq(i).find('a').text();
    biQueryFileText(text + (reg.test(text) ? "\\" : "/") + "meta.xml");
  }
}
var split = "";
function biOnQueriedFileText(text, path) {
  split = reg.test(path) ? "\\" : "/";
  var parser = new DOMParser();
  var xmlDoc = parser.parseFromString(text, "text/xml");
  var conf = xmlDoc.getElementsByTagName('root');
  var time = conf[0].attributes["session_id"].nodeValue.split("-");
  var fatherPath = path.split(split + "meta.xml")[0];
  sessionList.push({ "path": fatherPath, "time": time[0] + "-" + time[1] + "-" + time[2] + " " + time[3] + ":" + time[4] + ":" + time[5] });
  var paths = [fatherPath + split + "input" + split + "etc" + split + "raw_channel_primary.idc",
  fatherPath + split + "input" + split + "etc" + split + "raw_channel_primary.idcx",
  fatherPath + split + "input" + split + "etc" + split + "raw_channel_secondary.idc",
  fatherPath + split + "input" + split + "etc" + split + "raw_channel_secondary.idcx",
  fatherPath + split + "input" + split + "etc" + split + "processed.idc",
  fatherPath + split + "input" + split + "etc" + split + "processed_primary",
  fatherPath + split + "input" + split + "etc" + split + "processed_secondary",
  fatherPath + split + "input" + split + "raw" + split + "ibeo-ref-at-v1.csv",
  fatherPath + split + "input" + split + "raw" + split + "ibeo-ref-at-v2.csv",
  fatherPath + split + "input" + split + "etc" + split + "ibeo-ref-ptp-v1.csv",
  fatherPath + split + "input" + split + "etc" + split + "ibeo-ref-ptp-v2.csv",
  fatherPath + split + "input" + split + "raw" + split + "ibeo-ref-gnss-v1.csv",
  fatherPath + split + "input" + split + "raw" + split + "ibeo-ref-gnss-v2.csv",
  fatherPath + split + "input" + split + "etc" + split + "parsed_objects.idc",
  fatherPath + split + "input" + split + "etc" + split + "parsed_objects.idcx",
  fatherPath + split + "input" + split + "etc" + split + "index_objects.txt",
  fatherPath + split + "input" + split + "etc" + split + "parsed_groundpts.idc",
  fatherPath + split + "input" + split + "etc" + split + "index_groundpts.txt",
  fatherPath + split + "input" + split + "etc" + split + "parsed_primary.txt",
  fatherPath + split + "input" + split + "etc" + split + "parsed_secondary.txt"];
  for (let k in paths) {
    biQueryFileExist(paths[k]);
  }
}

var SessionExist = [];
function biOnQueriedFileExist(exist, path) {
  if (flag) {
    flag = false;
    var p = path.split((reg.test(path) ? "\\" : "/") + "meta.xml")[0];
    if (exist) {
      var $box = $('.session>.content>.center>.box').eq(0).clone(true);
      $box.find('a').text(p).attr({ "title": p });
      $('.session>.content>.center').append($box[0]);
    } else {
      biAlert("Error path!")
    }
  } else {
    if (exist) {
      SessionExist.push(true);
    } else {
      SessionExist.push(false);
    }
    if (sessionList.length == $(".content>.center>div.box:not(:nth-child(1))").length) {
      biSetLocalVariable("ibeo-reference-session", JSON.stringify(sessionList));
      biSetLocalVariable("ibeo-reference-processing-SessionExist", JSON.stringify(SessionExist));
      biCloseChildDialog();
    }
  }
}

//加载session文件夹
function loadBox() {
  $(".shadow").show();
  biSelectPath("SelectMultipleFiles", BISelectPathType.Directory, null);
}

function biOnSelectedPath(key, path) {
  var count = 0;
  $(".content>.center>.box").each(function () {
    try {
      if ($(this).find("a").html() == path) {
        count++;
        throw "err"
      }
    } catch (err) { return }
  })
  if (count == 0) {
    flag = true;
    biQueryFileExist(path + (reg.test(path) ? "\\" : "/") + "meta.xml");
  }
  $(".shadow").hide();
}

//移除全部
function clearBox(obj) {
  $(obj).parent().next().find('.box:not(:first-child)').remove();
}

function defaultLoad() {
  $('.session>.content>.center>div:not(:first-child)').remove();
  for (var n = 0; n < default_session_path.length; n++) {
    $box = $('.session>.content>.center>.box').clone(true);
    $box.find('a').text(default_session_path[n]["path"]).attr({ "title": default_session_path[n]["path"] });
    $('.session>.content>.center').append($box[0]);
  }
}

function setConfig() {
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root>";
  text += "<config";
  $('[name]').each(function () {
    var key = $(this).attr('name');
    var type = $(this).attr('type');
    if (type == "checkbox") {
      var val = $(this).get(0).checked == true ? "1" : "0";
      text += " " + key + "=\"" + val + "\"";
    } else if (type == 'radio' && $(this).is(":checked")) {
      text += " " + key + "=\"" + $(this).val() + "\"";
    } else if (type == "number") {
      text += " " + key + "=\"" + $(this).attr("value") + "\"";
    } else if (type != 'radio') {
      text += " " + key + "=\"" + $(this).val() + "\"";
    }
  });
  text += " evs_exe_folder_path=\"" + ($('#evs_exe_folder_path').hasClass('green') ? $('#evs_exe_folder_path').text() : "") + "\"";
  text += " mongo_db_exe_folder_path=\"" + ($('#mongo_db_exe_folder_path').hasClass('green') ? $('#mongo_db_exe_folder_path').text() : "") + "\"";
  text += " /></root>";
  biSetModuleConfig("ibeo-reference.pluginibeo", text);
}

function biOnInitEx(config, moduleConfigs) {
  biSetLocalVariable("ibeo-reference-session", config);
  sessionList = JSON.parse(config);
  default_session_path = JSON.parse(biGetLocalVariable("ibeo-reference-processing-sessionList"));
  var lang = biGetLanguage() == 1 ? en : cn;
  $('[language]').each(function () {
    var value = $(this).attr('language');
    $(this).text(lang[value]);
  });
  for (var n = 0; n < sessionList.length; n++) {
    $box = $('.content>.center>.box:first-child').clone(true);
    $box.find('a').text(sessionList[n]["path"]).attr({ "title": sessionList[n]["path"] });
    $('.content>.center').append($box);
  }
}
function openFile() {
  biSelectPath("sessionPathViewer", BISelectPathType.OpenFile, "");
}