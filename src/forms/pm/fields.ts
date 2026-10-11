// Field keys shared by the PM form and its printable report.

export const PM_READING_COLUMNS = [
  { key: "time", label: "Time" },
  { key: "rt", label: "RT" },
  { key: "sp", label: "SP" },
  { key: "dp", label: "DP" },
  { key: "op", label: "OP" },
  { key: "imp", label: "IMP" },
  { key: "compA", label: "Comp A" },
  { key: "condA", label: "Cond A" },
  { key: "evapA", label: "Evap A" },
  { key: "trayHA", label: "Tray H A" },
  { key: "stripHA", label: "Strip H A" },
  { key: "coilHA", label: "Coil H A" },
] as const;

export const PM_READING_ROWS = [1, 2] as const;
export const readingKey = (row: number, col: string) => `reading${row}_${col}`;

export const PM_SET_PARAMS = [
  { key: "hp", label: "HP" },
  { key: "lp", label: "LP" },
  { key: "rt", label: "RT" },
  { key: "op", label: "OP" },
  { key: "rh", label: "RH" },
] as const;
export const setParamKey = (param: string, which: "CutIn" | "CutOut") => `set_${param}${which}`;

/** Items that also carry a Yes / No answer (stored as `<key>YesNo`). */
export const PM_YES_NO_CHECKS = new Set(["chkRustOnCabinet", "chkPhysicalDamages"]);

// Four columns, in the order printed on the paper form.
export const PM_CHECK_COLUMNS: { key: string; label: string }[][] = [
  [
    { key: "chkCondCoilCleaning", label: "Condenser coil Cleaning" },
    { key: "chkLooseConnection", label: "Loose connection" },
    { key: "chkContactorKit", label: "Clean contactor kit" },
    { key: "chkHpLpSwitch", label: "HP/LP Switch" },
    { key: "chkLeakChecked", label: "Leak checked" },
    { key: "chkOilTrace", label: "Checked oil trace" },
    { key: "chkRustOnCabinet", label: "Rust on cabinet" },
    { key: "chkSuctionInsulation", label: "Suction line insulation" },
    { key: "chkDoorLock", label: "Door Lock" },
    { key: "chkBearingNoise", label: "Bearing Noise" },
  ],
  [
    { key: "chkDrainWaterFlowing", label: "Water flowing through Drain line" },
    { key: "chkCleanEvapCoil", label: "Clean Evaporator coil" },
    { key: "chkIncomingCables", label: "Incoming Cables" },
    { key: "chkControlWiring", label: "Check control wiring" },
    { key: "chkOss", label: "OSS" },
    { key: "chkFlareNuts", label: "Flare Nuts" },
    { key: "chkDoorGasket", label: "Door Gasket" },
    { key: "chkCondFan", label: "Condenser Fan" },
    { key: "chkCondFanRotation", label: "Rotation of Cond Fans" },
    { key: "chkElectricalPanel", label: "Electrical Panel board" },
  ],
  [
    { key: "chkEvapIce", label: "EVAP Ice formation" },
    { key: "chkWps", label: "WPS" },
    { key: "chkBrazingJoints", label: "Braising Joints" },
    { key: "chkMountingNut", label: "Tightened all Mounting nut" },
    { key: "chkMountingBolts", label: "Tightened all Mounting Bolts" },
    { key: "chkPhysicalDamages", label: "Any physical damages" },
    { key: "chkPipeClamping", label: "Pipe line clamping & Drain line" },
    { key: "chkDoorHeater", label: "Door Heater" },
    { key: "chkEvapFan", label: "EVAP Fan & Rotation" },
    { key: "chkDrainLineFlow", label: "Drain line water flow" },
  ],
  [
    { key: "chkAllConnections", label: "Tightened all connections" },
    { key: "chkPrv", label: "PRV" },
    { key: "chkWfs", label: "WFS" },
    { key: "chkServiceValves", label: "Service Valves" },
    { key: "chkDoorHeaters", label: "Door Heaters" },
    { key: "chkDoorAlignment", label: "Door Alignment" },
    { key: "chkOtherMotors", label: "Other Motors" },
    { key: "chkHumidifier", label: "Humidifier" },
    { key: "chkDehumidifier", label: "De-Humidifier" },
    { key: "chkHeaters", label: "Heaters" },
  ],
];
