import { ReportPage, Sig, TitleRow, type ReportProps } from "@/components/report/ReportPage";
import { fmtDate, str } from "@/components/report/format";
import { CR_SET_PARAMS } from "./fields";

const CommissioningReport = ({ data, formNo, signatures }: ReportProps) => {
  const s = (key: string) => str(data, key);

  /** A header row followed by a value row. Each cell: [label, field key, colSpan]. */
  const pair = (cells: [string, string, number?][]) => (
    <>
      <tr>
        {cells.map(([label, , span]) => (
          <td key={label} colSpan={span} className="h">{label}</td>
        ))}
      </tr>
      <tr>
        {cells.map(([label, key, span]) => (
          <td key={label} colSpan={span} className="c">{s(key)}</td>
        ))}
      </tr>
    </>
  );

  return (
    <ReportPage>
      <TitleRow
        title="Commissioning Report."
        rows={[
          ["Form No:", formNo],
          ["Report No:", s("reportNo")],
        ]}
      />

      <table className="rt">
        <colgroup>
          <col style={{ width: "45%" }} />
          <col style={{ width: "19%" }} />
          <col style={{ width: "36%" }} />
        </colgroup>
        <tbody>
          <tr>
            <td rowSpan={5}>
              <div className="l" style={{ textDecoration: "underline" }}>Client :</div>
              <div style={{ fontWeight: 700, marginTop: 3 }}>{s("clientName")}</div>
              <div className="pre">{s("clientAddress")}</div>
            </td>
            <td>Job No:</td>
            <td>{s("jobNo")}</td>
          </tr>
          <tr>
            <td>Customer PO No:</td>
            <td>{s("customerPoNo")}</td>
          </tr>
          <tr>
            <td>Customer PO Date:</td>
            <td>{fmtDate(s("customerPoDate"))}</td>
          </tr>
          <tr>
            <td>Equipment:</td>
            <td>{s("equipment")}</td>
          </tr>
          <tr>
            <td>Location:</td>
            <td>{s("location")}</td>
          </tr>
        </tbody>
      </table>

      {/* Equipment details */}
      <table className="rt">
        <colgroup>
          <col style={{ width: "25%" }} />
          <col style={{ width: "20%" }} />
          <col style={{ width: "19%" }} />
          <col style={{ width: "13%" }} />
          <col style={{ width: "11.5%" }} />
          <col style={{ width: "11.5%" }} />
        </colgroup>
        <tbody>
          {pair([
            ["Condensing Unit Model/SL No", "condensingUnitModelSlNo"],
            ["Compressor Make", "compressorMake"],
            ["Compressor Model", "compressorModel"],
            ["Compressor Sl No", "compressorSlNo", 3],
          ])}
          {pair([
            ["Evaporator Make", "evaporatorMake"],
            ["Evaporator Model No", "evaporatorModelNo"],
            ["Evaporator Sl No", "evaporatorSlNo"],
            ["Refrigerant", "refrigerant"],
            ["Qty used", "refrigerantQty", 2],
          ])}
          {pair([
            ["Type of system", "typeOfSystem"],
            ["No of Units", "noOfUnits"],
            ["Humidifier Make", "humidifierMake"],
            ["Humidifier Model No / Sl No", "humidifierModelSlNo", 3],
          ])}
          {pair([
            ["De-Humidifier Make/Model", "dehumidifierMakeModel"],
            ["De-Humidifier Sr.No", "dehumidifierSrNo"],
            ["Type of De-Humid Heater", "dehumidHeaterType"],
            ["Qty", "dehumidHeaterQty"],
            ["Watts", "dehumidHeaterWatts"],
            ["Amps", "dehumidHeaterAmps"],
          ])}
        </tbody>
      </table>

      {/* Voltage & current */}
      <table className="rt">
        <colgroup>
          <col style={{ width: "25%" }} />
          <col style={{ width: "20%" }} />
          <col style={{ width: "19%" }} />
          <col style={{ width: "36%" }} />
        </colgroup>
        <tbody>
          <tr>
            <td />
            <td className="h">R-Y</td>
            <td className="h">Y-B</td>
            <td className="h">B-R</td>
          </tr>
          <tr>
            <td>Line Voltage</td>
            <td className="c">{s("voltageRY")}</td>
            <td className="c">{s("voltageYB")}</td>
            <td className="c">{s("voltageBR")}</td>
          </tr>
          <tr>
            <td>Compressor Motor - (A)</td>
            <td className="c">{s("compAmpsRY")}</td>
            <td className="c">{s("compAmpsYB")}</td>
            <td className="c">{s("compAmpsBR")}</td>
          </tr>
        </tbody>
      </table>
      <table className="rt">
        <colgroup>
          <col style={{ width: "25%" }} />
          <col style={{ width: "20%" }} />
          <col style={{ width: "19%" }} />
          <col style={{ width: "9%" }} />
          <col style={{ width: "9%" }} />
          <col style={{ width: "9%" }} />
          <col style={{ width: "9%" }} />
        </colgroup>
        <tbody>
          {pair([
            ["Compressor Motor - (A)", "compMotorAmps"],
            ["Condenser Fan - (A)", "condFanAmps"],
            ["Evaporator Fan - (A)", "evapFanAmps"],
            ["SP", "sp"],
            ["DP", "dp"],
            ["IMP", "imp"],
            ["OP", "op"],
          ])}
        </tbody>
      </table>

      {/* Ambient, coil temperatures, oil, defrost */}
      <table className="rt">
        <colgroup>
          <col style={{ width: "25%" }} />
          <col style={{ width: "20%" }} />
          <col style={{ width: "19%" }} />
          <col style={{ width: "16%" }} />
          <col style={{ width: "20%" }} />
        </colgroup>
        <tbody>
          <tr>
            <td rowSpan={2} className="c">Ambient Conditions</td>
            <td className="h">DB</td>
            <td className="h">WB</td>
            <td colSpan={2} className="h">RH</td>
          </tr>
          <tr>
            <td className="c">{s("ambDB")}</td>
            <td className="c">{s("ambWB")}</td>
            <td colSpan={2} className="c">{s("ambRH")}</td>
          </tr>
          <tr>
            <td>Evaporator coil Air IN Temp</td>
            <td className="c">{s("evapAirInTemp")}</td>
            <td className="h">Compressor Oil Level</td>
            <td className="h">Liquid Level</td>
            <td className="h">Type of Defrost</td>
          </tr>
          <tr>
            <td>Evaporator coil Air Out Temp</td>
            <td className="c">{s("evapAirOutTemp")}</td>
            <td className="c">{s("compressorOilLevel")}</td>
            <td className="c">{s("liquidLevel")}</td>
            <td className="c">{s("typeOfDefrost")}</td>
          </tr>
          <tr>
            <td>Condenser Coil Air IN Temp</td>
            <td className="c">{s("condAirInTemp")}</td>
            <td className="h">No of Defrost / Day</td>
            <td className="h">Room Temp</td>
            <td className="h">Room RH</td>
          </tr>
          <tr>
            <td>Condenser Coil Air Out Temp</td>
            <td className="c">{s("condAirOutTemp")}</td>
            <td className="c">{s("defrostsPerDay")}</td>
            <td className="c">{s("roomTemp")}</td>
            <td className="c">{s("roomRH")}</td>
          </tr>
          {pair([
            ["Type of Heater Tray & Coil", "heaterTrayCoilType"],
            ["Tray Heater (A)", "trayHeaterAmps"],
            ["Coil Heater (A)", "coilHeaterAmps"],
            ["Drain Heater (A)", "drainHeaterAmps"],
            ["Door Heater (A)", "doorHeaterAmps"],
          ])}
        </tbody>
      </table>

      {/* Set parameters */}
      <table className="rt">
        <colgroup>
          <col style={{ width: "25%" }} />
          <col style={{ width: "20%" }} />
          <col style={{ width: "19%" }} />
          <col style={{ width: "16%" }} />
          <col style={{ width: "20%" }} />
        </colgroup>
        <tbody>
          <tr>
            <td>Set Parameters</td>
            {CR_SET_PARAMS.map((p) => (
              <td key={p.key} className="h">{p.label}</td>
            ))}
          </tr>
          {(["CutIn", "CutOut"] as const).map((which) => (
            <tr key={which}>
              <td>{which === "CutIn" ? "Cut In" : "Cut Out"}</td>
              {CR_SET_PARAMS.map((p) => (
                <td key={p.key} className="c">{s(`set_${p.key}${which}`)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Remarks, PM schedule, signatures */}
      <table className="rt">
        <colgroup>
          <col style={{ width: "25%" }} />
          <col style={{ width: "20%" }} />
          <col style={{ width: "27.5%" }} />
          <col style={{ width: "27.5%" }} />
        </colgroup>
        <tbody>
          <tr>
            <td colSpan={2} className="xtall">
              <div>Remarks from Commissioning Engineer</div>
              <div className="pre">{s("engineerRemarks")}</div>
            </td>
            <td colSpan={2} className="xtall">
              <div>Remarks from Customer</div>
              <div className="pre">{s("customerRemarks")}</div>
            </td>
          </tr>
          <tr>
            <td colSpan={4} className="green-bar">Preventive Maintenance Service Schedule</td>
          </tr>
          <tr>
            <td className="h">Date-Q1</td>
            <td className="h">Date-Q2</td>
            <td className="h">Date-Q3</td>
            <td className="h">Date-Q4</td>
          </tr>
          <tr>
            <td className="c">{fmtDate(s("pmQ1"))}</td>
            <td className="c">{fmtDate(s("pmQ2"))}</td>
            <td className="c">{fmtDate(s("pmQ3"))}</td>
            <td className="c">{fmtDate(s("pmQ4"))}</td>
          </tr>
          <tr>
            <td colSpan={2}>
              Signature:
              <Sig src={signatures.engineerSignature} />
            </td>
            <td colSpan={2}>
              Signature:
              <Sig src={signatures.customerSignature} />
            </td>
          </tr>
          <tr>
            <td colSpan={2}>Date: {fmtDate(s("engineerSignDate"))}</td>
            <td colSpan={2}>Date: {fmtDate(s("customerSignDate"))}</td>
          </tr>
          <tr>
            <td colSpan={4} className="bar">Official use only</td>
          </tr>
          <tr>
            <td colSpan={2}>Verified by: {s("verifiedBy")}</td>
            <td colSpan={2} />
          </tr>
          <tr>
            <td colSpan={2}>Date: {fmtDate(s("verifiedDate"))}</td>
            <td colSpan={2} />
          </tr>
        </tbody>
      </table>
    </ReportPage>
  );
};

export default CommissioningReport;
