var sessionList = []; //sessionList同时存储path，time
var sessionListPath = [];//sessionListPath存储path
var file;
var dialogConfig = {};
var not_config = "";
var split = "";
var SessionExist = [];
var newExist = [];//将放了所有判断的数组分割为多组
var platform = "";
var dataTypeId = {
  DataType_Unknown: 0x0000,
  DataType_CanMessage1002: 0x1002, //!< A single can message that has been received via Ethernet.
  DataType_FrameEndSeparator1100: 0x1100,
  DataType_Command2010: 0x2010,
  DataType_Reply2020: 0x2020,
  DataType_Notification2030: 0x2030, //!< Not implemented in SDK. error and warning messages sent by ibeo LUX/Scala family sensors
  DataType_Scan2202: 0x2202, //!< scan data sent by Ibeo LUX/Scala (before B2) family sensors
  DataType_Scan2205: 0x2205, //!< scan data sent by Ibeo ECU devices
  DataType_Scan2208: 0x2208, //!< Scan data sent by Ibeo Scala B2 and Ibeo MiniLux sensors
  DataType_Scan2209: 0x2209, //!< Identical to 2205 except it can hold more than 65535 points
  DataType_ObjectList2221: 0x2221, //!< objects sent by Ibeo LUX family sensors
  DataType_ObjectList2225: 0x2225, //!< objects sent by Ibeo ECU devices
  DataType_ObjectList2270: 0x2270, //!< send by Scala family sensors (starting with B2)
  DataType_ObjectList2271: 0x2271, //!< send by Scala family sensors (starting with B2)
  DataType_ObjectList2280: 0x2280, //!< send by ECU devices
  DataType_ObjectList2281: 0x2281, //!< send by ECU devices
  DataType_ObjectList2290: 0x2290, //!< generate by the Evaluation Suite
  DataType_ObjectList2291: 0x2291, //!< generate by the Evaluation Suite
  DataType_Scan2310: 0x2310, //! Uninterpreted Scala raw data from the FPGA
  DataType_Scan2321: 0x2321, //! Lidar Scan in Velodyne raw format
  DataType_Image2403: 0x2403, //!< An image
  DataType_PositionWgs84_2604: 0x2604, //!< GPS position
  DataType_OxtsMessage2610: 0x2610, //!<
  DataType_OxtsStatus2611: 0x2611, //!<
  DataType_MeasurementList2821: 0x2821, //!< Data type that contains a single measurement list.
  DataType_VehicleStateBasic2805: 0x2805, //!< send by LUX/Scala
  DataType_VehicleStateBasic2806: 0x2806, //!< send by ECU
  DataType_VehicleStateBasic2807: 0x2807, //!< send by ECU
  DataType_VehicleStateBasic2808: 0x2808, //!< send by ECU
  DataType_ObjectAssociationList4001: 0x4001,
  DataType_IdcTrailer6120: 0x6120, //!< Trailer Message in an IDC file
  DataType_IdSequence3500: 0x3500,
  DataType_PositionWgs84Sequence3510: 0x3510,
  DataType_Destination3520: 0x3520,
  DataType_MissionHandlingStatus3530: 0x3530, ///< Information about the state of mission handling module
  DataType_MissionResponse3540: 0x3540,
  DataType_TrafficLight3600: 0x3600,
  DataType_FrameIndex6130: 0x6130, //!< Index over IDC file
  DataType_DeviceStatus6301: 0x6301,
  DataType_DeviceStatus6303: 0x6303,
  DataType_SyncBoxStatus6320: 0x6320, //!< State for ibeo SyncBox
  DataType_LogError6400: 0x6400,
  DataType_LogWarning6410: 0x6410,
  DataType_LogNote6420: 0x6420,
  DataType_LogDebug6430: 0x6430,
  DataType_ObjectLabel6503: 0x6503,
  DataType_SystemMonitoringCanStatus6700: 0x6700,
  DataType_SystemMonitoringDeviceStatus6701: 0x6701,
  DataType_SystemMonitoringSystemStatus6705: 0x6705,
  DataType_LogPolygonList2dFloat6817: 0x6817, //!< List of informational polygons with text label
  DataType_CarriageWayList6970: 0x6970, //!< Basic CarriageWayList
  DataType_CarriageWayList6972: 0x6972, //!< CarriageWayList with additional LaneSegment marking properties
  DataType_EventTag7000: 0x7000,
  DataType_IbeoEvent7001: 0x7001,
  DataType_ContentSeparator7100: 0x7100,
  DataType_MetaInformationList7110: 0x7110,
  DataType_PointCloud7500: 0x7500, //!< PointCloudGlobal
  DataType_PointCloud7510: 0x7510, //!< PointCloudPlane
  DataType_TimeRecord9000: 0x9000,
  DataType_GpsImu9001: 0x9001,
  DataType_Odometry9002: 0x9002,
  DataType_TimeRelationsList9010: 0x9010, //!< Time Relations
  DataType_TimeRelationsList9011: 0x9011, //!< Time Relations9011
  DataType_VehicleControl9100: 0x9100,
  DataType_StateOfOperation9110: 0x9110,
  DataType_LastId: 0xFFFF
}
function formatDate(d) {
  var date = new Date(d);
  var YY = date.getFullYear() + '-';
  var MM = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
  var DD = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
  var hh = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
  var mm = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':';
  var ss = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
  return YY + MM + DD + " " + hh + mm + ss;
}

//选择文件
function loadFile(obj) {
  var filter = {
    ".exe": "(*.exe)"
  };
  file = obj;
  biSelectPath($(obj).attr("name"), BISelectPathType.OpenFile, filter);
}

//运行独立任务Parse,加载进度条
function parseAll(id, parse) {
  var protocol = "";
  var protocolExist = "";
  var xml = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root>";
  var taskID = "";
  var parseMode = 0;
  switch (id) {
    case "ArrivalTimeSyncToCSVMode": {
      protocol = "ibeo-ref-at-v2";
      taskID = "arrival-time-sync-to-csv.pluginibeo";
      parseMode = 0;
      break;
    }
    case "PTPSyncToCSVMode": {
      protocol = "ibeo-ref-ptp-v2";
      taskID = "ptp-sync-to-csv.pluginibeo";
      parseMode = 1;
      break;
    }
    case "GnssSyncToCSVMode": {
      protocol = "ibeo-ref-gnss-v2";
      taskID = "gnss-sync-to-csv.pluginibeo";
      parseMode = 2;
      break
    }
    case "GnssSyncToIDCMode": {
      protocol = "";
      taskID = "gnss-sync-to-idc.pluginibeo";
      parseMode = 3;
      break
    }
  }
  // var taskConfigList = [];
  /*
    0:raw_channel_primary.idc
    4:processed.idc
    5:processed_primary.txt
    6:processed_secondary.idc
    13:parsed_object.idc
    15:index_object.txt
    16:parsed_groundpt.idc
    17:index_groundpt.idc
    18:parsed_primary.idc
    19:parsed_secondary.idc
   */

  for (var i in sessionList) {
    if (parse) {//parse
      if (id == "GnssSyncToIDCMode") {
        /*
          如果以下六个文件(13，15，16，17必须存在，18/19至少存在一个)不完全存在，则可能是误操作，删除所有文件
        */
        if (!(newExist[i][13] && newExist[i][15] && newExist[i][16] && newExist[i][17] && (newExist[i][18] || newExist[i][19]))) {
          biFileDelete(sessionList[i]["path"] + split + "input" + split + "etc" + split + "parsed_objects.idc", true);
          biFileDelete(sessionList[i]["path"] + split + "input" + split + "etc" + split + "parsed_groundpts.idc", true);
          biFileDelete(sessionList[i]["path"] + split + "input" + split + "etc" + split + "index_objects.txt", true);
          biFileDelete(sessionList[i]["path"] + split + "input" + split + "etc" + split + "index_groundpts.txt", true);
          biFileDelete(sessionList[i]["path"] + split + "input" + split + "etc" + split + "parsed_primary", true);
          biFileDelete(sessionList[i]["path"] + split + "input" + split + "etc" + split + "processed_secondary", true);
        }
      } else if (id == "Primary") {
        if (newExist[i][0]) {
          if (newExist[i][5] && newExist[i][4]) {
            continue;
          } else if (newExist[i][5]) {
            biFileDelete(sessionList[i]["path"] + split + "input" + split + "etc" + split + "processed_primary.txt", true);
          } else if (newExist[i][4]) {
            biFileDelete(sessionList[i]["path"] + split + "input" + split + "etc" + split + "processed.idc", true);
          }
        }
      } else if (id == "Secondary") {
        if (newExist[i][0]) {
          if (newExist[i][6] && newExist[i][4]) {
            continue;
          } else if (newExist[i][6]) {
            biFileDelete(sessionList[i]["path"] + split + "input" + split + "etc" + split + "processed_secondary.txt", true);
          } else if (newExist[i][4]) {
            biFileDelete(sessionList[i]["path"] + split + "input" + split + "etc" + split + "processed.idc", true);
          }
        }
      } else {
        switch (id) {
          case "ArrivalTimeSyncToCSVMode": {
            protocolExist = newExist[i][8];//"ibeo-ref-at-v2.csv"
            break;
          }
          case "PTPSyncToCSVMode": {
            protocolExist = newExist[i][10];//"ibeo-ref-ptp-v2.csv"
            break;
          }
          case "GnssSyncToCSVMode": {
            protocolExist = newExist[i][12];//"ibeo-ref-gnss-v2.csv"
            break
          }
        }
        if (protocolExist) continue;
      }
      xml += "<session"
      /*
        4必须存在，5/6至少存在一个,否则不能成功parse
      */
      if (newExist[i][4] && (newExist[i][5] || newExist[i][6])) {
        xml += ">";
        var taskConfig = {};
        var mark = 0;
        mark += newExist[i][5] ? 1 : 0;
        mark += newExist[i][6] ? 2 : 0;
        taskConfig.etc_path = sessionList[i]["path"] + split + "input" + split + "etc" + split;
        taskConfig.raw_path = sessionList[i]["path"] + split + "input" + split + "raw" + split;
        taskConfig.session_path = sessionList[i]["path"] + split;
        taskConfig.session_meta_file = sessionList[i]["path"] + split + "meta.xml";
        taskConfig.parse_mode = parseMode;
        taskConfig.processed_file = "processed.idc";
        taskConfig.raw_csv_file = "raw.csv";
        taskConfig.ref_csv_protocol = protocol;
        var markName = "";
        markName = mark == 1 || mark == 3 ? "parsed_primary.txt" : mark == 2 ? "parsed_secondary.txt" : "";
        if (markName != "") taskConfig.mark_name = markName;
        for (var j in taskConfig) {
          xml += "<" + j;
          if (taskConfig[j] === "") {
            xml += "/>"
          } else {
            xml += ">";
            xml += taskConfig[j];
            xml += "</" + j + ">";
          }
        }
        var config = [];
        config.push({
          parsed_idc_name: "parsed_objects.idc", index_file_name: "index_objects.txt", data_type_id_list: [dataTypeId.DataType_GpsImu9001, dataTypeId.DataType_PositionWgs84_2604, dataTypeId.DataType_VehicleStateBasic2808, dataTypeId.DataType_ObjectList2281]
        });
        config.push({
          parsed_idc_name: "parsed_groundpts.idc", index_file_name: "index_groundpts.txt", data_type_id_list: [dataTypeId.DataType_GpsImu9001, dataTypeId.DataType_PositionWgs84_2604, dataTypeId.DataType_VehicleStateBasic2808, dataTypeId.DataType_PointCloud7510]
        });
        config.push({
          parsed_idc_name: "parsed_lanes.idc", index_file_name: "index_lanes.txt", data_type_id_list: [dataTypeId.DataType_GpsImu9001, dataTypeId.DataType_PositionWgs84_2604, dataTypeId.DataType_VehicleStateBasic2808, dataTypeId.DataType_CarriageWayList6972]
        });
        xml += "<classfication_config>";
        // taskConfigList.push(taskConfig);
        for (var k in config) {
          xml += "<config ";
          for (var m in config[k]) {
            xml += m + "=\"" + config[k][m] + "\" ";
          }
          xml += "/>";
        }
        xml += "</classfication_config>"
        xml += "</session>";
      } else {
        xml += "/>";
      }
    } else {
      if (newExist[i][0]) {
        if (newExist[i][4] && newExist[i][5]) continue;
        if (newExist[i][4]) {
          biFileDelete(sessionList[i]["path"] + split + "input" + split + "etc" + split + "processed.idc", true);
        } else if (newExist[i][5]) {
          biFileDelete(sessionList[i]["path"] + split + "input" + split + "etc" + split + "processed_primary", true);
        }
        taskConfig.parent_folder_path = sessionList[i]["path"] + split + "input" + split + "etc" + split;
        taskConfig.process_file_name_list = ["raw_channel_primary.idc"];
        taskConfig.output_file_name = "processed.idc";
        if (platform == 2) {
          taskConfig.exe_file = sessionList[i] + split + "ibeoESClient";
        } else {
          taskConfig.exe_file = sessionList[i] + split + "ibeoESClient.exe";
        }
        taskConfig.mark_file_name = "processed_primary";
        taskConfig.job_definition_file = ""
        taskConfig.export_definition_file = ""
      }
    }
  }
  xml += "</root>";
  biRunStandaloneTask("IBEOReference", taskID, xml);
}

//加载session文件夹
function loadBox() {
  biSelectPath("", BISelectPathType.Directory, null);
}

function biOnSelectedPath(key, path) {
  if (path != null) {
    $(file).text(path).attr("title", path).addClass('green');
    changeVal($("[name=" + key + "]"));
  }
}

/**
 *  页面加载时,读取本地配置
 */
function loadConfig() {
  SessionExist = JSON.parse(biGetLocalVariable("ibeo-reference-processing-SessionExist"));
  sessionList = JSON.parse(biGetLocalVariable("ibeo-reference-processing-sessionList"));
  if (split == "") split = /[a-zA-Z]:/.test(sessionList[0]["path"]) ? "\\" : "/";
  $('[name]').each(function () {
    var name = $(this).attr('name');
    var type = $(this).attr('type');
    var value = dialogConfig[name];
    if (type == 'checkbox') {
      $(this).attr('checked', value == "1");
    } else if (type == 'radio') {
      if (value == $(this).attr("value")) {
        $(this).prop("checked", true);
      }
    } else if ($(this).is("a")) {
      if (!["", "null"].includes(value)) $(this).text(value).attr("title", value).addClass("green").removeClass("red");
    } else {
      $(this).val(value);
    }
  });
  for (var n = 0; n < sessionList.length; n++) {
    $box = $('.container2>.content>.center>.box').clone(true);
    $box.find('.time').text(sessionList[n].time);
    $box.children('.path').text(sessionList[n].path);
    $('.container2>.content>.center').append($box[0]);
  }
  reloadFiles();
}

function changeVal(obj) {
  var key = $(obj).attr('name');
  var type = $(obj).attr('type');
  var val = $(obj).val();
  if (type == "checkbox") {
    dialogConfig[key] = $(obj).is(":checked") ? "1" : "0";
  } else if (type == 'radio' && $(obj).is(":checked")) {
    dialogConfig[key] = val;
  } else if ($(obj).is("a")) {
    dialogConfig[key] = $(obj).text() == not_config ? "" : $(obj).text();
  }
  setConfig();
}
/**
 * 写配置
 */
function setConfig() {
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root>";
  text += "<config";
  for (let i in dialogConfig) {
    text += " " + i + "=\"" + dialogConfig[i] + "\"";
  }
  text += " /></root>";
  biSetModuleConfig("ibeo-reference.pluginibeo", text);
  biSetLocalVariable("ibeo-reference", JSON.stringify(dialogConfig));
}

function biOnInitEx(config, moduleConfigs) {
  var lang = biGetLanguage() == 1 ? en : cn;
  platform = biGetPlatform();
  $('[language]').each(function () {
    var value = $(this).attr('language');
    $(this).text(lang[value])
  });
  not_config = lang["not_config"];
  for (var key in moduleConfigs) {
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(moduleConfigs[key], "text/xml");
    var conf = xmlDoc.getElementsByTagName('config');
    var keys = conf[0].attributes;
    for (var i = 0; i < keys.length; i++) {
      dialogConfig[keys[i].nodeName] = keys[i].nodeValue == "null" ? "" : keys[i].nodeValue;
    }
    loadConfig();
  }
}

function manager() {
  biSetLocalVariable("ibeo-reference-session", JSON.stringify(sessionListPath));
  biOpenChildDialog("ibeo-reference.session.html", "Session Manager", new BISize(480, 500), JSON.stringify(sessionList));
}
$(".path").click(function () {
  biOpenChildDialog("ibeo-reference.path.html", "Session Path Viewer", new BISize(390, 100), $(this).text());
})

function biOnClosedChildDialog(htmlName, result) {
  if (htmlName == "ibeo-reference.session.html") {
    var path = JSON.parse(biGetLocalVariable("ibeo-reference-session"));
    if (path.length > 0 && path && path != "null") {
      sessionList = path;
      SessionExist = JSON.parse(biGetLocalVariable("ibeo-reference-processing-SessionExist"));
      $('.container2>.content>.center>.box:not(:nth-child(1))').remove();
      for (var n = 0; n < sessionList.length; n++) {
        $box = $('.container2>.content>.center>.box').clone(true);
        $box.find('.time').text(sessionList[n].time);
        $box.children('.path').text(sessionList[n].path);
        $('.container2>.content>.center').append($box[0]);
      }
      reloadFiles();
    }
  }

}
function biOnQueriedFileText(text, path) {
  var parser = new DOMParser();
  var xmlDoc = parser.parseFromString(text, "text/xml");
  var conf = xmlDoc.getElementsByTagName('root');
  sessionList.push({ "path": path, "time": conf[0].attributes["session_id"] })
}
function del(name) {
  for (var i in sessionList) {
    var path = sessionList[i]["path"];
    switch (name) {
      case "primary": {
        biFileDelete(path + split + "input" + split + "etc" + split + "raw_channel_primary.idc", true);
        biFileDelete(path + split + "input" + split + "etc" + split + "raw_channel_primary.idcx", true);
        break;
      }
      case "secondary": {
        biFileDelete(path + split + "input" + split + "etc" + split + "raw_channel_secondary.idc", true);
        biFileDelete(path + split + "input" + split + "etc" + split + "raw_channel_secondary.idcx", true);
        break;
      }
      case "process": {
        biFileDelete(path + split + "input" + split + "etc" + split + "processed.idc", true);
        biFileDelete(path + split + "input" + split + "etc" + split + "processed.idcx", true);
        biFileDelete(path + split + "input" + split + "etc" + split + "processed_primary", true);
        biFileDelete(path + split + "input" + split + "etc" + split + "processed_secondary", true);
        break;
      }
      case "arrivalTime": {
        biFileDelete(path + split + "input" + split + "raw" + split + "ibeo-ref-at-v1.csv", true);
        biFileDelete(path + split + "input" + split + "raw" + split + "ibeo-ref-at-v2.csv", true);
        biFileDelete(path + split + "input" + split + "raw" + split + "ibeo-ref-at-v2.ext.dat", true);
        break;
      }
      case "ptp": {
        biFileDelete(path + split + "input" + split + "etc" + split + "ibeo-ref-ptp-v1.csv", true);
        biFileDelete(path + split + "input" + split + "etc" + split + "ibeo-ref-ptp-v2.csv", true);
        break;
      }
      case "gnss": {
        biFileDelete(path + split + "input" + split + "raw" + split + "ibeo-ref-gnss-v1.csv", true);
        biFileDelete(path + split + "input" + split + "raw" + split + "ibeo-ref-gnss-v1.ext.dat", true);
        biFileDelete(path + split + "input" + split + "raw" + split + "ibeo-ref-gnss-v2.csv", true);
        biFileDelete(path + split + "input" + split + "raw" + split + "ibeo-ref-gnss-v2.ext.dat", true);
        break;
      }
      case "idc": {
        biFileDelete(path + split + "input" + split + "etc" + split + "parsed_objects.idc", true);
        biFileDelete(path + split + "input" + split + "etc" + split + "parsed_objects.idcx", true);
        biFileDelete(path + split + "input" + split + "etc" + split + "index_objects.txt", true);
        biFileDelete(path + split + "input" + split + "etc" + split + "parsed_groundpts.idc", true);
        biFileDelete(path + split + "input" + split + "etc" + split + "index_groundpts.txt", true);
        biFileDelete(path + split + "input" + split + "etc" + split + "parsed_primary.txt", true);
        biFileDelete(path + split + "input" + split + "etc" + split + "parsed_secondary.txt", true);
        biFileDelete(path + split + "input" + split + "etc" + split + "parsed_lanes.idc", true);
        biFileDelete(path + split + "input" + split + "etc" + split + "index_lanes.txt", true);
        break;
      }
      default:
        break;
    }
    $("div.center>div").eq(Number(i) + 1).find("div." + name).html("x");
  }
}
function reloadFiles() {
  newExist = [];
  var newIndex = 0;
  for (let i = 0; i < sessionList.length; i++) {
    var length = SessionExist.length / sessionList.length;
    newExist.push(SessionExist.slice(newIndex, newIndex + length));
    newIndex = newIndex + length;
  }
  for (let i = 0; i < newExist.length; i++) {
    var index = i + 1;
    var path = newExist[i];
    //(raw_channel_primary.idc/raw_channel_primary.idcx全部删除显示X,存在显示O)
    $("div.center>div").eq(index).find("div:nth-child(1)>div:nth-child(2)").html(!(path[0] && path[1]) ? "x" : "o");
    //(raw_channel_secondary.idc/raw_channel_secondary.idcx全部删除显示X,存在任意一个显示O)
    $("div.center>div").eq(index).find("div:nth-child(1)>div:nth-child(3)").html(!(path[2] && path[3]) ? "x" : "o");
    //受processed_primary影响(存在显示Primary,删除显示X),如果processed_secondary存在显示Both，不存在仅显示primary
    $("div.center>div").eq(index).find("div:nth-child(1)>div:nth-child(4)").html(path[5] && path[6] ? "Both" : (path[6] && !path[5] ? "Secondary" : (path[5] && !path[6] ? "primary" : "x")));
    //arrive time sync csv:不受ibeo-ref-at-v2.ext.dat影响(存在显示O,删除显示X)
    $("div.center>div").eq(index).find("div:nth-child(1)>div:nth-child(5)").html(path[7] || path[8] ? "o" : "x");
    //PTP sync csv :ibeo-ref-gnss-v1.csv/ibeo-ref-gnss-v2.csv存在任意一个就显示o
    $("div.center>div").eq(index).find("div:nth-child(1)>div:nth-child(6)").html(path[9] || path[10] ? "o" : "x");
    //GNSS sync csv :ibeo-ref-ptp-v1.csv/ibeo-ref-ptp-v2.csv存在任意一个就显示o
    $("div.center>div").eq(index).find("div:nth-child(1)>div:nth-child(7)").html(path[11] || path[12] ? "o" : "x");
    //parsedIDC : 在"index_objects.txt,parsed_groundpts.idc,index_groundpts.txt"同时存在的基础上，parsed_objects.idc,parsed_objects.idcx必须存在一个,如果parsed_primary.txt存在显示Primary，如果parsed_secondary.txt存在显示Secondary，如果两个都存在显示Both；否则显示x
    $("div.center>div").eq(index).find("div:nth-child(1)>div:nth-child(8)").html(path[15] && path[16] && path[17] && (path[13] || path[14]) ? (path[18] && path[19] ? "Both" : (path[18] && !path[19]) ? "Primary" : (!path[18] && path[19]) ? "Secondary" : "x") : "x");
  }
}

function biOnQueriedFileExist(exist, path) {
  if (exist) {
    SessionExist.push(true);
  } else {
    SessionExist.push(false);
  }
  if (SessionExist.length % 20 == 0) {
    reloadFiles();
  }
}

//文件夹文件删除和监视回收站文件还原
setInterval(function () {
  if (sessionList.length > 0) {
    SessionExist = [];
    for (var i in sessionList) {
      var session = sessionList[i]["path"];
      var path = [session + split + "input" + split + "etc" + split + "raw_channel_primary.idc",//0
      session + split + "input" + split + "etc" + split + "raw_channel_primary.idcx",//1
      session + split + "input" + split + "etc" + split + "raw_channel_secondary.idc",//2
      session + split + "input" + split + "etc" + split + "raw_channel_secondary.idcx",//3
      session + split + "input" + split + "etc" + split + "processed.idc",//4
      session + split + "input" + split + "etc" + split + "processed_primary",//5
      session + split + "input" + split + "etc" + split + "processed_secondary",//6
      session + split + "input" + split + "raw" + split + "ibeo-ref-at-v1.csv",//7
      session + split + "input" + split + "raw" + split + "ibeo-ref-at-v2.csv",//8
      session + split + "input" + split + "etc" + split + "ibeo-ref-ptp-v1.csv",//9
      session + split + "input" + split + "etc" + split + "ibeo-ref-ptp-v2.csv",//10
      session + split + "input" + split + "raw" + split + "ibeo-ref-gnss-v1.csv",//11
      session + split + "input" + split + "raw" + split + "ibeo-ref-gnss-v2.csv",//12
      session + split + "input" + split + "etc" + split + "parsed_objects.idc",//13
      session + split + "input" + split + "etc" + split + "parsed_objects.idcx",//14
      session + split + "input" + split + "etc" + split + "index_objects.txt",//15
      session + split + "input" + split + "etc" + split + "parsed_groundpts.idc",//16
      session + split + "input" + split + "etc" + split + "index_groundpts.txt",//17
      session + split + "input" + split + "etc" + split + "parsed_primary.txt",//18
      session + split + "input" + split + "etc" + split + "parsed_secondary.txt"];//19
      for (let k in path) {
        biQueryFileExist(path[k]);
      }
    }
  }

}, 2000)