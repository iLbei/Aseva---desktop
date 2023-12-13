var cn = {
        enabled: "启用",
        frequency: "采样频率[HZ]:",
        front_overhang: "前悬[m]:",
        engine_speed: "引擎转速[rpm]:",
        engine_torque: "引擎扭矩[Nm]:",
        speed_fl: "左前轮速[KPH]:",
        speed_fr: "右前轮速[KPH]:",
        turn_left_signal: "左转向灯信号:",
        turn_left_values: "数值:",
        steer_angle_ratio: "方向盘传动比: ",
        not_configured: "<未配置>",
        steer: "方向盘",
        steer_angle: "方向盘转角[deg]: ",
        brake: "刹车踏板位置[%]: ",
        throttle: "油门踏板位置[%]: ",
        wheel_base: "轴距[m]: ",
        speed: "X轴车速[KPH]:",
        imu_channel: "IMU来源: ",
        speed_rl: "左后轮速[KPH]",
        rear_tread: "轮距[m]: ",
        vehicle_width: "车宽[m]: ",
        speed_rr: "右后轮速[KPH]: ",
        vehicle_length: "车长[m]: ",
        turn_right_signal: "右转向灯信号:",
        gear_signal: "挡位信号:",
        gear_p_values: "P: ",
        gear_n_values: "N: ",
        gear_r_values: "R: ",
        gear_d_values: "D: ",
        other_settings: "其他配置",
        import: "导入配置",
        export: "导出配置",
        configure_can_output: "配置CAN报文转发",
        output_sample_version: "输出样本协议版本:",
        parameters: "车辆参数",
        vehicle_height: "车辆高度: ",
        steer_rate: "方向盘速率[%/s]:",
        steer_torque: "方向盘扭矩[Nm]:",
        signal: "信号:",
        horn: "喇叭",
        horn_values: "数值:",
        value: "数值:",
        head_light: "大灯",
        far: "远光:",
        near: "近光:",
        wiper: "雨刮",
        single: "单次:",
        slow: "慢档:",
        med: "中档:",
        fast: "快档:",
        wiper_slow_level_signal: "慢档子信号:",
        slow1: "慢1:",
        slow2: "慢2:",
        slow3: "慢3:",
        slow4: "慢4:",
        slow5: "慢5:",
        low_frequency_signals: "低频信号",
        lowfreq_brake: "刹车",
        lowfreq_throttle: "油门",
        lowfreq_turn: "转向灯",
        lowfreq_gear: "挡位",
        lowfreq_horn: "喇叭",
        lowfreq_wiper: "雨刮",
        lowfreq_headlight: "大灯",
        contour: "轮廓",
        reset: "重置",
        add_prev: "添加前点",
        add_next: "添加后点",
        remove: "移除点",
        speed_steer_yaw: "车速, 方向盘转角, 横摆角速度",
        can_channel: "CAN通道: ",
        output_can_msgid: "报文ID:",
        turn_signal_brake: "转向灯,刹车",
        output_can_turn_left: "左转向灯激活发送值:",
        output_can_brake: "刹车激活发送值:",
        output_can_turn_right: "右转向灯激活发送值:",
        output_can_brake_thresh: "刹车激活阈值:",
        disabled: "(禁用)",
        canTitle: "车辆状态CAN输出(仅在线模式)",
        scale_small:"比例:小范围"
    },
    en = {
        canTitle: "CAN output of vehicle states (Online mode only)",
        disabled: "(Disabled)",
        enabled: "Enabled",
        frequency: "Sampling freq. [HZ]:",
        front_overhang: "Front overhang [m]:",
        engine_speed: "Eng.speed [rpm]:",
        engine_torque: "Eng.torque [Nm]:",
        speed_fl: "LR speed [KPH]:",
        speed_fr: "FR speed [KPH]:",
        turn_left_signal: "Turn left:",
        turn_left_values: "Value:",
        steer_angle_ratio: "Steer angle radio: ",
        not_configured: "<Not Configured>",
        steer: "Steer",
        steer_angle: "Steer angle [deg]: ",
        brake: "Brake pedal [%]: ",
        throttle: "Throttle pedal [%]: ",
        wheel_base: "Wheel base [m]: ",
        speed: "VX [KPH]:",
        imu_channel: "IMU source: ",
        speed_rl: "LR speed [KPH]:",
        rear_tread: "Rear tread [m]: ",
        vehicle_width: "Vehicle width [m]: ",
        speed_rr: "RR speed [KPH]: ",
        vehicle_length: "Vehicle length [m]: ",
        turn_right_signal: "Turn Right:",
        value: "Value:",
        gear_signal: "Gear Position:",
        gear_p_values: "P: ",
        gear_n_values: "N: ",
        gear_r_values: "R: ",
        gear_d_values: "D: ",
        other_settings: "Other settings",
        import: "Import",
        export: "Export",
        configure_can_output: "Configure CAN output",
        output_sample_version: "Output sample version:",
        parameters: "Parameters",
        vehicle_height: "Vehicle height: ",
        steer_rate: "Steer rate[°/s]:",
        steer_torque: "Steer torque[Nm]:",
        signal: "Signal:",
        horn: "Horn",
        horn_values: "Value:",
        head_light: "Head light",
        far: "Far:",
        near: "Near:",
        wiper: "Wiper",
        single: "Single:",
        slow: "Slow:",
        med: "Med:",
        fast: "Fast:",
        wiper_slow_level_signal: "Slow level:",
        slow1: "Slow1:",
        slow2: "Slow2:",
        slow3: "Slow3:",
        slow4: "Slow4:",
        slow5: "Slow5:",
        low_frequency_signals: "Low-frequency signals",
        lowfreq_brake: "Brake",
        lowfreq_throttle: "Throttle",
        lowfreq_turn: "Turn signal",
        lowfreq_gear: "Gear",
        lowfreq_horn: "Horn",
        lowfreq_wiper: "Wiper",
        lowfreq_headlight: "Head light",
        contour: "Contour",
        reset: "Reset",
        add_prev: "Add prev",
        add_next: "Add next",
        remove: "Remove",
        speed_steer_yaw: "Speed,steer angle,yaw rate",
        can_channel: "CAN channel: ",
        output_can_msgid: "Message ID:",
        turn_signal_brake: "Turn signal,brake",
        output_can_turn_left: "Turn left active value:",
        output_can_brake: "Brake active value:",
        output_can_turn_right: "Turn right active value:",
        output_can_brake_thresh: "Brake active thresh.:",
        scale_small:"Scale:Small"
    };