var dialogConfig = {}, boxIndex = "";
class Box {
    constructor(name, enabled, send_mail,
        binding_video, binding_obj_sensor,
        binding_lane_sensor, rec_bus_enabled,
        rec_bus_positive, rec_bus_negative,
        condition, tablesigArr, transmsgArr
    ) {
        this.name = name;
        this.enabled = enabled;
        this.send_mail = send_mail;
        this.binding_video = binding_video;
        this.binding_obj_sensor = binding_obj_sensor;
        this.binding_lane_sensor = binding_lane_sensor;
        this.rec_bus_enabled = rec_bus_enabled;
        this.rec_bus_positive = rec_bus_positive;
        this.rec_bus_negative = rec_bus_negative;
        this.condition = condition;
        this.tablesigArr = tablesigArr;
        this.transmsgArr = transmsgArr;
    }
}

$('.trigger').find('[type=text]').bind('input propertychange', function () {
    var text = $(this).val(),
        flag = false;
    var arrBox = dialogConfig.arr;
    for (var i = 0; i < arrBox.length; i++) {
        if (text == arrBox[i].name) {
            flag = true;
            break;
        }
    }
    if (!flag) {
        $('.trigger>.content').find('button').removeAttr('disabled').removeClass("disabled_background");
    } else {
        $('.trigger>.content').find('button').attr('disabled', true).addClass("disabled_background");
    }
    if (text == "") $('.trigger>.content').find('button').attr('disabled', true).addClass("disabled_background");

});

function trigger_ok() {
    var name = $('.trigger>.content').find("[name=name]").val();
    var channel = $('.trigger>.content').find("[name=channel]").val();
    var obj = new Box(name, "no", "no", "", "", "", "no", "0", "0", "", [], []);
    obj.condition = "2|system:manual-trigger:trigger-" + channel + "|1";
    dialogConfig.arr.push(obj);
    biSetLocalVariable("event_configuration", JSON.stringify(dialogConfig));
    setConfig();
    biCloseChildDialog();
}

function biOnInitEx(config, moduleConfigs) {
    boxIndex = config;
    if (biGetLanguage() == 1) {
        $("[language]").each(function () {
            var value = $(this).attr("language");
            $(this).text(en[value]);
        });
    } else {
        $("[language]").each(function () {
            var value = $(this).attr("language");
            $(this).text(cn[value]);
        });
    }
    for (var key in moduleConfigs) {
        xmlParse(moduleConfigs[key]);
    }
}

function xmlParse(text) {
    if (text == null) return;
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(text, "text/xml");
    var countrys = xmlDoc.getElementsByTagName("root");
    var object = new Object();
    object.location_source = $(countrys).attr("location_source");
    var arr = [];
    for (var i = 0; i < countrys[0].children.length; i++) {
        var keyss = countrys[0].children[i].attributes;
        var obj = new Object();
        for (var j = 0; j < keyss.length; j++) {
            obj[keyss[j].nodeName] = keyss[j].nodeValue;
        }
        var arr2 = [],
            arr3 = [];
        for (var n = 0; n < countrys[0].children[i].children.length; n++) {
            var o = new Object();
            var keysss = countrys[0].children[i].children[n].attributes;
            for (var m = 0; m < keysss.length; m++) {
                o[keysss[m].nodeName] = keysss[m].nodeValue;
            }
            if (o.name != undefined) {
                arr2.push(o);
            } else {
                arr3.push(o);
            }
        }
        if (obj.from == undefined) {
            obj.tablesigArr = arr2;
            obj.transmsgArr = arr3;
            arr.push(obj);
        } else {
            object.mail = obj;
        }
    }
    object.arr = arr;
    dialogConfig = object;
    loadConfig();
}

function setConfig() {
    var arrBox = dialogConfig.arr;
    var textInfo = '<?xml version="1.0" encoding="utf-8"?>';
    textInfo +=
        '<root location_source="' + dialogConfig.location_source + '"' + ">";
    for (var i = 0; i < arrBox.length; i++) {
        var box = arrBox[i];
        textInfo += '<e name="' + box.name + '"';
        textInfo += ' enabled="' + box.enabled + '"';
        textInfo += ' condition="' + box.condition + '"';
        textInfo += ' send_mail="' + box.send_mail + '"';
        textInfo += ' binding_video="' + box.binding_video + '"';
        textInfo += ' binding_obj_sensor="' + box.binding_obj_sensor + '"';
        textInfo += ' binding_lane_sensor="' + box.binding_lane_sensor + '"';
        textInfo += ' rec_bus_enabled="' + box.rec_bus_enabled + '"';
        textInfo += ' rec_bus_positive="' + box.rec_bus_positive + '"';
        textInfo += ' rec_bus_negative="' + box.rec_bus_negative + '"';
        if (box.tablesigArr.length == 0 && box.transmsgArr.length == 0) {
            textInfo += " />";
        } else {
            textInfo += " >";
            for (var j = 0; j < box.tablesigArr.length; j++) {
                var tablesig = box.tablesigArr[j];
                textInfo += '<tablesig name="' + tablesig.name + '"';
                textInfo += ' signal="' + tablesig.signal + '"';
                textInfo += ' scale="' + tablesig.scale + '"/>';
            }
            for (var j = 0; j < box.transmsgArr.length; j++) {
                var transmsg = box.transmsgArr[j];
                textInfo += '<transmsg ch="' + transmsg.ch + '"';
                textInfo += ' id="' + transmsg.id + '"';
                textInfo += ' data="' + transmsg.data + '"/>';
            }
            textInfo += "</e>";
        }
    }
    textInfo += "<mail_config";
    var mail = dialogConfig.mail;
    for (var i in mail) {
        textInfo += " " + i + '="' + mail[i] + '"';
    }
    textInfo += " /></root>";
    biSetModuleConfig("event.system", textInfo);
}