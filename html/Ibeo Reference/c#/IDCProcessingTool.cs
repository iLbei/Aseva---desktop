using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Windows.Forms;
using ASEva;
using System.IO;
using System.Diagnostics;
using System.Threading;

namespace PluginIBEO
{
  public partial class IDCProcessingTool : Form
  {
    private AppLanguage appLanguage = AppLanguage.Language;

    private bool isDrawing = false;

    private CircularQueue cq = new CircularQueue();
    private Color oddColor = Color.FromArgb(207, 213, 234);//奇数行颜色
    private Color evenColor = Color.FromArgb(233, 235, 245);//偶数行颜色

    private SessionPathManager sessionPathManager = new SessionPathManager();
    private Dictionary<SingleRowComponent, SessionEctContext> sessionContextDictionary = new Dictionary<SingleRowComponent, SessionEctContext>();

    private IBEOReferenceConfig config = new IBEOReferenceConfig();

    private IbeoSDK.EnvironmentBase environment = new IbeoSDK.WindowsEnvironment();//在进行evsClient进行数据处理前的环境准备

    public IDCProcessingTool(IBEOReferenceConfig config)
    {
      InitializeComponent();
      //
      ASEva.Agency.Print("IBEO:" + IbeoSDK.Agency.getVersion().ToString());
      //
      this.config = config;
      //
      bool isChLanguage = appLanguage.GetLanguage() == "ch";
      if (isChLanguage)
      {
        evsExePathLabel.Text = "EVS的exe文件";
        mongoDbExePathLabel.Text = "Mongo DB的exe文件";
        sessionManagerLabel.Text = "管理";
        rawPrimaryDeleteAllLabel.Text = "删除";
        rawSecondaryDeleteAllLabel.Text = "删除";
        processedDeleteAllLabel.Text = "删除";
        deleteArrivalTimeSyncToCSVModeLabel.Text = "删除";
        deletePtpSyncToCSVModeLabel.Text = "删除";
        deleteGnssSyncToCSVModeLabel.Text = "删除";
        deleteParseToIdcModeLabel.Text = "删除";
      }

      Color linkColor = Color.Red;
      String text = isChLanguage ? "无效" : "Invalid";
      if (Directory.Exists(this.config.evaluationSuiteExeInstallFolder))
      {
        linkColor = Color.Green;
        text = SystemIO.AbbreviatePath(this.config.evaluationSuiteExeInstallFolder);
      }
      else
      {
        linkColor = Color.Red;
        text = isChLanguage ? "无效" : "Invalid";
      }
      evsExePathLinkLabel.LinkColor = linkColor;
      evsExePathLinkLabel.Text = text;
      //
      if (Directory.Exists(this.config.mongoDBExeInstallFolder))
      {
        linkColor = Color.Green;
        text = SystemIO.AbbreviatePath(this.config.mongoDBExeInstallFolder);
      }
      else
      {
        linkColor = Color.Red;
        text = isChLanguage ? "无效" : "Invalid";
      }
      mongoDbExePathLinkLabel.LinkColor = linkColor;
      mongoDbExePathLinkLabel.Text = text;
      //
      if (IbeoSDK.Agency.GetEnvironmentType() == IbeoSDK.Environment.Linux)
      {
        environment = new IbeoSDK.LinuxEnvironment();
        mongoDbExePathLabel.Text = "databaseInitialize Executable File:";
      }
      else
      {
        var tempPath = ASEva.Agency.GetTempFilesRoot();
        if (Directory.Exists(tempPath)) Directory.CreateDirectory(tempPath);
        IbeoSDK.Agency.TempFilesRoot = tempPath;
        environment = new IbeoSDK.WindowsEnvironment();
        mongoDbExePathLabel.Text = "Mongo DB Executable File:";
      }
      //
      environment.mongoDBExeInstallFolder = this.config.mongoDBExeInstallFolder;
      environment.evaluationSuiteExeInstallFolder = this.config.evaluationSuiteExeInstallFolder;
      environment.pathUpdated = true;
      environment.processLanes = false;
      //
      cq.setMax(2);
      //
      titleItem.PrimaryEvsProcessClick += PrimaryEvsProcess;
      titleItem.SecondaryEvsProcessClick += SecondaryEvsProcess;
      titleItem.ArriveTimeSyncModeClick += ParseAll;
      titleItem.PtpSyncModeClick += ParseAll;
      titleItem.GnssSyncModeClick += ParseAll;
      titleItem.ParseToIdcModeClick += ParseAll;
      titleItem.parseMode = this.config.parseMode;
    }

    private void IDCProcessingTool_Load(object sender, EventArgs e)
    {
      //获取所有的session
      var sessionList = Agency.GetSessionList();
      foreach (var session in sessionList)
      {
        var session_file = Agency.GetSessionPath(session);

        SessionContext sc = new SessionContext();
        sc.sessionTime = session;
        sc.sessionPath = session_file + System.IO.Path.DirectorySeparatorChar;
        sc.parentFolder = System.IO.Directory.GetParent(session_file).FullName + System.IO.Path.DirectorySeparatorChar;
        sessionPathManager.sessionContextList.Add(sc);
      }

      UpdateComponentList();

      loopTimer.Start();
    }
    private void UpdateComponentList()
    {
      lock (sessionContextDictionary)
      {
        sessionContextDictionary.Clear();
        flowLayoutPanel1.Controls.Clear();

        foreach (var sc in sessionPathManager.sessionContextList)
        {
          SingleRowComponent li = new SingleRowComponent();
          li.SessionPath = sc.sessionPath;
          li.ComponentColor = cq.getNum() % 2 == 0 ? evenColor : oddColor;
          li.FirstText = sc.sessionTime.ToString("yyyy-MM-dd HH:mm:ss");
          li.Margin = new System.Windows.Forms.Padding(0, 0, 0, 1);
          li.FontColor = Color.Black;
          flowLayoutPanel1.Controls.Add(li);

          var context = new SessionEctContext();
          context.sessionContext.sessionTime = sc.sessionTime;
          context.sessionContext.parentFolder = sc.parentFolder;
          context.sessionContext.sessionPath = sc.sessionPath;
          context.etcPath = sc.sessionPath + "input" + System.IO.Path.DirectorySeparatorChar + "etc" + System.IO.Path.DirectorySeparatorChar;
          context.rawPath = sc.sessionPath + "input" + System.IO.Path.DirectorySeparatorChar + "raw" + System.IO.Path.DirectorySeparatorChar;
          context.ClearExistFileList();

          sessionContextDictionary.Add(li, context);
        }
      }
    }
    private void evsExePathLinkLabel_LinkClicked(object sender, LinkLabelLinkClickedEventArgs e)
    {
      OpenFileDialog openFileDialog = new OpenFileDialog();
      openFileDialog.Filter = "|*.exe";
      if (openFileDialog.ShowDialog() != System.Windows.Forms.DialogResult.OK) return;
      var fileName = openFileDialog.FileName;
      var parentFolder = System.IO.Directory.GetParent(fileName).FullName;

      evsExePathLinkLabel.LinkColor = Color.Green;
      evsExePathLinkLabel.Text = SystemIO.AbbreviatePath(parentFolder);
      this.config.evaluationSuiteExeInstallFolder = parentFolder;
      environment.evaluationSuiteExeInstallFolder = parentFolder;
      environment.pathUpdated = true;
    }

    private void mongoDbExePathLinkLabel_LinkClicked(object sender, LinkLabelLinkClickedEventArgs e)
    {
      OpenFileDialog openFileDialog = new OpenFileDialog();
      openFileDialog.Filter = "|*.exe";
      if (openFileDialog.ShowDialog() != System.Windows.Forms.DialogResult.OK) return;
      var fileName = openFileDialog.FileName;
      var parentFolder = System.IO.Directory.GetParent(fileName).FullName;

      mongoDbExePathLinkLabel.LinkColor = Color.Green;
      mongoDbExePathLinkLabel.Text = SystemIO.AbbreviatePath(parentFolder);
      this.config.mongoDBExeInstallFolder = parentFolder;
      environment.mongoDBExeInstallFolder = parentFolder;
      environment.pathUpdated = true;
    }

    private void PrimaryEvsProcess(object sender, EventArgs e)
    {
      try
      {
        environment.processLanes = processLanesCheckBox.Checked;

        environment.Init();
        if (!environment.okState)
        {
          environment.Start();
          if (IbeoSDK.Agency.GetEnvironmentType() == IbeoSDK.Environment.Windows)
          {
            if (environment.initState)
            {
              if (IbeoSDK.EnvironmentBase.IsProcessRunning("ibeoESServer", 10000.0) == null)
              {
                Agency.Log("ibeoESServer start failed", LogLevel.Error);
                return;
              }
            }
          }
          if (!environment.okState)
          {
            Agency.Log("Environment prepare failed", LogLevel.Error);
            return;
          }
        }

        IbeoSDK.EVSTaskParams task_params = new IbeoSDK.EVSTaskParams();
        //List<IbeoSDK.TaskContext> tc_list = new List<IbeoSDK.TaskContext>();
        var keyList = sessionContextDictionary.Keys;
        foreach (var key in keyList)
        {
          var context = sessionContextDictionary[key];
          if (context.ContainTargetFile(("raw_channel_primary.idc").ToLower()))
          {
            if (context.ContainTargetFile(("processed_primary").ToLower()) && context.ContainTargetFile(("processed.idc").ToLower())) continue;

            if (context.ContainTargetFile(("processed_primary").ToLower())) context.DeleteTargetFile("processed_primary");
            if (context.ContainTargetFile(("processed.idc").ToLower())) context.DeleteTargetFile(("processed.idc").ToLower());

            IbeoSDK.TaskContext tc = new IbeoSDK.TaskContext();
            tc.parentFolderPath = context.etcPath;
            tc.processFileNameList.Add("raw_channel_primary.idc");
            tc.outputFileName = "processed.idc";
            String ibeoESClient_exe = "";
            if (IbeoSDK.Agency.GetEnvironmentType() == IbeoSDK.Environment.Linux)
            {
              ibeoESClient_exe = this.config.evaluationSuiteExeInstallFolder + System.IO.Path.DirectorySeparatorChar + "ibeoESClient";
            }
            else
            {
              ibeoESClient_exe = this.config.evaluationSuiteExeInstallFolder + System.IO.Path.DirectorySeparatorChar + "ibeoESClient.exe";
            }
            tc.exeFile = ibeoESClient_exe;
            tc.markFileName = "processed_primary";
            tc.jobdefinitionFile = environment.jobDefinitionFilePath;
            tc.exportdefinitionFile = environment.exportDefinitionFilePath;

            task_params.AddTaskContext(tc);
          }
        }

        EVSProcessTask task = new EVSProcessTask();

        Agency.RunStandaloneTask("PrimaryEvsProcess IDC", task, task_params.ToInnerXml());

        //Agency.RunStandaloneTask("ibeo-evs-process", task_params.ToInnerXml());
      }
      catch (Exception exp)
      {
        ASEva.Agency.Print("evs process exception," + exp.ToString());
      }
    }

    private void SecondaryEvsProcess(object sender, EventArgs e)
    {
      try
      {
        environment.processLanes = processLanesCheckBox.Checked;

        environment.Init();
        if (!environment.okState)
        {
          environment.Start();
          if (IbeoSDK.Agency.GetEnvironmentType() == IbeoSDK.Environment.Windows)
          {
            if (environment.initState)
            {
              if (IbeoSDK.EnvironmentBase.IsProcessRunning("ibeoESServer", 10000.0) == null)
              {
                Agency.Log("ibeoESServer start failed", LogLevel.Error);
                return;
              }
            }
          }
          if (!environment.okState)
          {
            Agency.Log("Environment prepare failed", LogLevel.Error);
            return;
          }
        }

        IbeoSDK.EVSTaskParams task_params = new IbeoSDK.EVSTaskParams();
        var keyList = sessionContextDictionary.Keys;
        foreach (var key in keyList)
        {
          var context = sessionContextDictionary[key];
          if (context.ContainTargetFile(("raw_channel_secondary.idc").ToLower()))
          {
            if (context.ContainTargetFile(("processed_secondary").ToLower()) && context.ContainTargetFile(("processed.idc").ToLower())) continue;

            if (context.ContainTargetFile(("processed_secondary").ToLower())) context.DeleteTargetFile("processed_secondary");
            if (context.ContainTargetFile(("processed.idc").ToLower())) context.DeleteTargetFile(("processed.idc").ToLower());

            IbeoSDK.TaskContext tc = new IbeoSDK.TaskContext();
            tc.parentFolderPath = context.etcPath;
            tc.processFileNameList.Add("raw_channel_secondary.idc");
            tc.outputFileName = "processed.idc";
            String ibeoESClient_exe = "";
            if (IbeoSDK.Agency.GetEnvironmentType() == IbeoSDK.Environment.Linux)
            {
              ibeoESClient_exe = this.config.evaluationSuiteExeInstallFolder + System.IO.Path.DirectorySeparatorChar + "ibeoESClient";
            }
            else
            {
              ibeoESClient_exe = this.config.evaluationSuiteExeInstallFolder + System.IO.Path.DirectorySeparatorChar + "ibeoESClient.exe";
            }
            tc.exeFile = ibeoESClient_exe;
            tc.markFileName = "processed_secondary";
            tc.jobdefinitionFile = environment.jobDefinitionFilePath;
            tc.exportdefinitionFile = environment.exportDefinitionFilePath;

            task_params.AddTaskContext(tc);
          }
        }

        EVSProcessTask task = new EVSProcessTask();

        Agency.RunStandaloneTask("SecondaryEvsProcess IDC", task, task_params.ToInnerXml());
      }
      catch (Exception exp)
      {
        ASEva.Agency.Print("evs process exception," + exp.ToString());
      }
    }

    private void loopTimer_Tick(object sender, EventArgs e)
    {
      if (isDrawing) return;
      isDrawing = true;
      //
      lock (sessionContextDictionary)
      {
        foreach (var component in sessionContextDictionary.Keys)
        {
          var context = sessionContextDictionary[component];
          context.Update();
          //制定文件的校验
          component.SecondText = context.ContainTargetFile(("raw_channel_primary.idc").ToLower()) ? "O" : "X";
          component.ThirdText = context.ContainTargetFile(("raw_channel_secondary.idc").ToLower()) ? "O" : "X";
          //
          int processed_primary_exist = (context.ContainTargetFile(("processed_primary").ToLower()) && context.ContainTargetFile(("processed.idc").ToLower())) ? 1 : 0;
          int processed_secondary_exist = (context.ContainTargetFile(("processed_secondary").ToLower()) && context.ContainTargetFile(("processed.idc").ToLower())) ? 2 : 0;
          int processed_sum = processed_primary_exist + processed_secondary_exist;
          component.ForthText = (processed_sum == 0) ? "X" : ((processed_sum == 1) ? "Primary" : ((processed_sum == 2) ? "Secondary" : "Both"));
          //
          bool contain_ref_at_file = context.ContainTargetFile(("ibeo-ref-at-v1.csv")) || context.ContainTargetFile(("ibeo-ref-at-v2.csv"));
          component.FifthText = contain_ref_at_file ? "O" : "X";
          //
          bool contain_ref_ptp_file = context.ContainTargetFile(("ibeo-ref-ptp-v1.csv")) || context.ContainTargetFile(("ibeo-ref-ptp-v2.csv"));
          component.SixthText = contain_ref_ptp_file ? "O" : "X";
          //
          bool contain_ref_gnss_file = context.ContainTargetFile(("ibeo-ref-gnss-v1.csv")) || context.ContainTargetFile(("ibeo-ref-gnss-v2.csv"));
          component.SeventhText = contain_ref_gnss_file ? "O" : "X";
          //
          bool contain_parsed_idc_files = context.ContainTargetFile(("parsed_objects.idc").ToLower()) &&
             context.ContainTargetFile(("parsed_groundpts.idc").ToLower()) &&
             /*context.ContainTargetFile(("parsed_lanes.idc").ToLower()) &&*/
             context.ContainTargetFile(("index_objects.txt").ToLower()) &&
             context.ContainTargetFile(("index_groundpts.txt").ToLower()) /*&&
                       context.ContainTargetFile(("index_lanes.txt").ToLower())*/;
          int parsed_primary_exist = (context.ContainTargetFile(("parsed_primary.txt").ToLower()) && contain_parsed_idc_files) ? 1 : 0;
          int parsed_secondary_exist = (context.ContainTargetFile(("parsed_secondary.txt").ToLower()) && contain_parsed_idc_files) ? 2 : 0;
          int parsed_sum = parsed_primary_exist + parsed_secondary_exist;
          component.EighthText = (parsed_sum == 0) ? "X" : ((parsed_sum == 1) ? "Primary" : ((parsed_sum == 2) ? "Secondary" : "Both"));
        }
      }
      //
      isDrawing = false;
    }

    private void IDCProcessingTool_FormClosing(object sender, FormClosingEventArgs e)
    {
      loopTimer.Stop();
      environment.Stop();
      environment.Deinit();
    }

    private void ParseAll(object sender, EventArgs e)
    {
      ParseTaskListConfig configList = new ParseTaskListConfig();

      var keylist = sessionContextDictionary.Keys;

      foreach (var key in keylist)
      {
        var context = sessionContextDictionary[key];
        if (!context.ContainTargetFile(("processed.idc").ToLower())) continue;
        if (!context.ContainTargetFile(("processed_primary").ToLower()) && !(context.ContainTargetFile(("processed_secondary").ToLower()))) continue;

        RefParseMode mode = titleItem.parseMode;
        String protocol = "";
        switch (mode)
        {
          case RefParseMode.RPM_GnssSyncToIDC:
            break;
          case RefParseMode.RPM_ArrivalTimeSyncToCSV:
            protocol = "ibeo-ref-at-v2";
            break;
          case RefParseMode.RPM_GnssSyncToCSV:
            protocol = "ibeo-ref-gnss-v2";
            break;
          case RefParseMode.RPM_PTPSyncToCSV:
            protocol = "ibeo-ref-ptp-v2";
            break;
        }
        if (mode == RefParseMode.RPM_GnssSyncToIDC)
        {
          if (context.ContainTargetFile(("parsed_objects.idc").ToLower()) && context.ContainTargetFile(("parsed_groundpts.idc").ToLower()) /*&& context.ContainTargetFile(("parsed_lanes.idc").ToLower()) */&&
              context.ContainTargetFile(("index_objects.txt").ToLower()) && context.ContainTargetFile(("index_groundpts.txt").ToLower()) /*&& context.ContainTargetFile(("index_lanes.txt").ToLower())*/ &&
              (context.ContainTargetFile(("parsed_primary.txt").ToLower()) || context.ContainTargetFile(("parsed_secondary.txt").ToLower())))
            continue;
          //如果不完全包含以下六个文件,则可能是误操作,得删除掉那些零碎的文件
          if (context.ContainTargetFile(("parsed_objects.idc").ToLower())) context.DeleteTargetFile("parsed_objects.idc");
          if (context.ContainTargetFile(("index_objects.txt").ToLower())) context.DeleteTargetFile("index_objects.txt");
          if (context.ContainTargetFile(("parsed_groundpts.idc").ToLower())) context.DeleteTargetFile("parsed_groundpts.idc");
          if (context.ContainTargetFile(("index_groundpts.txt").ToLower())) context.DeleteTargetFile("index_groundpts.txt");
          if (context.ContainTargetFile(("parsed_lanes.idc").ToLower())) context.DeleteTargetFile("parsed_lanes.idc");
          if (context.ContainTargetFile(("index_lanes.txt").ToLower())) context.DeleteTargetFile("index_lanes.txt");
          if (context.ContainTargetFile(("parsed_primary.txt").ToLower())) context.DeleteTargetFile("parsed_primary.txt");
          if (context.ContainTargetFile(("parsed_secondary.txt").ToLower())) context.DeleteTargetFile("parsed_secondary.txt");
        }
        else
        {
          //如果已经包含了生成的ref文件,则无需再进行生成
          if (context.ContainTargetFile(protocol + ".csv"))
            continue;
        }

        ParseTaskConfig taskConfig = new ParseTaskConfig();
        configList.AddTaskConfig(taskConfig);
        taskConfig.EtcPath = context.etcPath;//有"//"
        taskConfig.RawPath = context.rawPath;//有"//"
        taskConfig.SessionPath = context.sessionContext.sessionPath;//有"//"
        var session_meta_file = context.sessionContext.sessionPath + "meta.xml";
        taskConfig.SessionMetaFile = SystemIO.FileExist(session_meta_file) ? session_meta_file : "";
        taskConfig.ParseMode = mode;

        taskConfig.ProcessedFile = "processed.idc";
        taskConfig.RawCsvFile = "raw.csv";
        taskConfig.RefCsvProtocol = protocol;//与raw path组合成生成保存路径

        int mark = 0;
        mark += (context.ContainTargetFile(("processed_primary").ToLower()) ? 1 : 0);
        mark += (context.ContainTargetFile(("processed_secondary").ToLower()) ? 2 : 0);
        var markName = (mark == 1) ? "parsed_primary.txt" : (mark == 2 ? "parsed_secondary.txt" : "");
        taskConfig.MarkName = markName;

        ClassficationConfig c1 = new ClassficationConfig();
        c1.ParsedIdcName = "parsed_objects.idc";
        c1.IndexFileName = "index_objects.txt";
        c1.AddDataTypeId((UInt16)DataTypeId.DataType_GpsImu9001); //GPS数据包
        c1.AddDataTypeId((UInt16)DataTypeId.DataType_PositionWgs84_2604);//20200420
        c1.AddDataTypeId((UInt16)DataTypeId.DataType_VehicleStateBasic2808); //车辆状态数据包
        c1.AddDataTypeId((UInt16)DataTypeId.DataType_ObjectList2281); //目标物数据包
        taskConfig.AddConfig(c1);

        ClassficationConfig c2 = new ClassficationConfig();
        c2.ParsedIdcName = "parsed_groundpts.idc";
        c2.IndexFileName = "index_groundpts.txt";
        c2.AddDataTypeId((UInt16)DataTypeId.DataType_GpsImu9001); //GPS数据包
        c2.AddDataTypeId((UInt16)DataTypeId.DataType_PositionWgs84_2604);//20200420
        c1.AddDataTypeId((UInt16)DataTypeId.DataType_VehicleStateBasic2808); //车辆状态数据包
                                                                             //c2.AddDataTypeId((UInt16)DataTypeId.DataType_Scan2209); //ibeo点云
        c2.AddDataTypeId((UInt16)DataTypeId.DataType_PointCloud7510);//地面点云数据包
        taskConfig.AddConfig(c2);

        //增加车道线的相关文件
        ClassficationConfig c3 = new ClassficationConfig();
        c3.ParsedIdcName = "parsed_lanes.idc";
        c3.IndexFileName = "index_lanes.txt";
        c3.AddDataTypeId((UInt16)DataTypeId.DataType_GpsImu9001); //GPS数据包
        c3.AddDataTypeId((UInt16)DataTypeId.DataType_PositionWgs84_2604);//
        c3.AddDataTypeId((UInt16)DataTypeId.DataType_VehicleStateBasic2808); //车辆状态数据包
        c3.AddDataTypeId((UInt16)DataTypeId.DataType_CarriageWayList6972); //车道线数据包,20220508
        taskConfig.AddConfig(c3);
      }

      String taskName = "ParseTask";
      switch (titleItem.parseMode)
      {
        case RefParseMode.RPM_GnssSyncToIDC:
          taskName = "GnssSyncToIDCMode";
          break;
        case RefParseMode.RPM_ArrivalTimeSyncToCSV:
          taskName = "ArrivalTimeSyncToCSVMode";
          break;
        case RefParseMode.RPM_GnssSyncToCSV:
          taskName = "GnssSyncToCSVMode";
          break;
        case RefParseMode.RPM_PTPSyncToCSV:
          taskName = "PTPSyncToCSVMode";
          break;
      }
      //ASEva.Agency.Print(configList.ToXml().InnerXml);
      Agency.RunStandaloneTask("IBEOReference", taskName, configList.ToXml().InnerXml);
    }

    private void sessionManagerLabel_Click(object sender, EventArgs e)
    {
      SessionManager session_manager_dialog = new SessionManager(sessionPathManager.sessionContextList);
      if (session_manager_dialog.ShowDialog() != System.Windows.Forms.DialogResult.OK) return;

      sessionPathManager.sessionContextList.Clear();
      sessionPathManager.sessionContextList.AddRange(session_manager_dialog.sessionContextList);

      UpdateComponentList();
    }

    private void rawPrimaryDeleteAllLabel_Click(object sender, EventArgs e)
    {
      var keyList = sessionContextDictionary.Keys;
      foreach (var key in keyList)
      {
        var context = sessionContextDictionary[key];
        if (context.ContainTargetFile(("raw_channel_primary.idc").ToLower()))
        {
          context.DeleteTargetFile("raw_channel_primary.idc");
        }
      }
    }

    private void rawSecondaryDeleteAllLabel_Click(object sender, EventArgs e)
    {
      var keyList = sessionContextDictionary.Keys;
      foreach (var key in keyList)
      {
        var context = sessionContextDictionary[key];
        if (context.ContainTargetFile(("raw_channel_secondary.idc").ToLower()))
        {
          context.DeleteTargetFile("raw_channel_secondary.idc");
        }
      }
    }

    private void processedDeleteAllLabel_Click(object sender, EventArgs e)
    {
      var keyList = sessionContextDictionary.Keys;
      foreach (var key in keyList)
      {
        var context = sessionContextDictionary[key];
        if (context.ContainTargetFile(("processed.idc").ToLower()))
        {
          context.DeleteTargetFile("processed.idc");
        }
        if (context.ContainTargetFile(("processed_primary").ToLower()))
        {
          context.DeleteTargetFile("processed_primary");
        }
        if (context.ContainTargetFile(("processed_secondary").ToLower()))
        {
          context.DeleteTargetFile("processed_secondary");
        }
      }
    }

    private void deleteArrivalTimeSyncToCSVModeLabel_Click(object sender, EventArgs e)
    {
      var keyList = sessionContextDictionary.Keys;
      foreach (var key in keyList)
      {
        List<String> file_name_list = new List<String>();
        file_name_list.Add(("ibeo-ref-at-v1.csv").ToLower());
        file_name_list.Add(("ibeo-ref-at-v1.ext.dat").ToLower());
        file_name_list.Add(("ibeo-ref-at-v2.csv").ToLower());
        file_name_list.Add(("ibeo-ref-at-v2.ext.dat").ToLower());

        var context = sessionContextDictionary[key];
        foreach (var name in file_name_list)
        {
          if (context.ContainTargetFile(name))
          {
            context.DeleteTargetFile(name);
          }
        }
      }
    }

    private void deletePtpSyncToCSVModeLabel_Click(object sender, EventArgs e)
    {
      var keyList = sessionContextDictionary.Keys;
      foreach (var key in keyList)
      {
        List<String> file_name_list = new List<String>();
        file_name_list.Add(("ibeo-ref-ptp-v1.csv").ToLower());
        file_name_list.Add(("ibeo-ref-ptp-v1.ext.dat").ToLower());
        file_name_list.Add(("ibeo-ref-ptp-v2.csv").ToLower());
        file_name_list.Add(("ibeo-ref-ptp-v2.ext.dat").ToLower());

        var context = sessionContextDictionary[key];
        foreach (var name in file_name_list)
        {
          if (context.ContainTargetFile(name))
          {
            context.DeleteTargetFile(name);
          }
        }
      }
    }

    private void deleteGnssSyncToCSVModeLabel_Click(object sender, EventArgs e)
    {
      var keyList = sessionContextDictionary.Keys;
      foreach (var key in keyList)
      {
        List<String> file_name_list = new List<String>();
        file_name_list.Add(("ibeo-ref-gnss-v1.csv").ToLower());
        file_name_list.Add(("ibeo-ref-gnss-v1.ext.dat").ToLower());
        file_name_list.Add(("ibeo-ref-gnss-v2.csv").ToLower());
        file_name_list.Add(("ibeo-ref-gnss-v2.ext.dat").ToLower());

        var context = sessionContextDictionary[key];
        foreach (var name in file_name_list)
        {
          if (context.ContainTargetFile(name))
          {
            context.DeleteTargetFile(name);
          }
        }
      }
    }

    private void deleteParseToIdcModeLabel_Click(object sender, EventArgs e)
    {
      var keyList = sessionContextDictionary.Keys;
      foreach (var key in keyList)
      {
        List<String> file_name_list = new List<String>();
        file_name_list.Add(("parsed_objects.idc").ToLower());
        file_name_list.Add(("index_objects.txt").ToLower());
        file_name_list.Add(("parsed_groundpts.idc").ToLower());
        file_name_list.Add(("index_groundpts.txt").ToLower());
        file_name_list.Add(("parsed_lanes.idc").ToLower());
        file_name_list.Add(("index_lanes.txt").ToLower());
        file_name_list.Add(("parsed_primary.txt").ToLower());
        file_name_list.Add(("parsed_secondary.txt").ToLower());

        var context = sessionContextDictionary[key];
        foreach (var name in file_name_list)
        {
          if (context.ContainTargetFile(name))
          {
            context.DeleteTargetFile(name);
          }
        }
      }
    }
  }
}