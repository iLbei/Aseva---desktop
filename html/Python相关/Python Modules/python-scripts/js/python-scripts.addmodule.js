var text,
  childIndex = 0,
  mode = ",";

$("button").on("click", function () {
  biSetLocalVariable("python_script_addmode", mode + ",true");
  biCloseChildDialog();
})

function biOnInit(config) {
  childIndex = config;
  var lang = biGetLanguage() == 1 ? en : cn;
  $("[language]").each(function () {
    var value = $(this).attr("language");
    $(this).text(lang[value]);
  });
  var obj = biGetPythonTemplateNames();
  setTimeout(function () {
    for (let i in obj) {
      console.log(i);
      $("[name=template]").append("<option value=\"" + i + "\">" + obj[i] + "</option>")
    }
  }, 200);
  addModeChange();
  biSetLocalVariable("python_script_addmode", "");
}
$("select").on("change",function () {
  mode = "";
  var name = $(this).attr("name");
  if (name == "add_module") {
    addModeChange();
  }
  if ($("[name=add_module]").val() !== "0") {
    mode = $("[name=add_module]").val() + "," + $("[name=template]").val() + "," + $("[name=template] option:selected").text();
  }
})

function addModeChange() {
  if ($("[name=add_module]").val() === "0") {
    $("[name=template]").attr("disabled", true).addClass("disabled_background");
  } else {
    $("[name=template]").removeAttr("disabled").removeClass("disabled_background");
  }
}