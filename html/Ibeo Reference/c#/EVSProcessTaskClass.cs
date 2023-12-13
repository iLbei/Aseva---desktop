using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using ASEva;

namespace PluginIBEO
{
    class EVSProcessTaskClass : TaskClass
    {
        public override Task CreateTask()
        {
            return new EVSProcessTask();
        }
        public override String GetTaskClassID()
        {
            return "ibeo-evs-process";
        }
        public override Dictionary<String, String> GetTaskTitle()
        {
            return new Dictionary<String, String>
            {
                {"en", "Process IDC"},
                {"ch", "IDC后处理"}
            };
        }
        public override bool IsNativeTask()
        {
            return false;
        }
    }
}
