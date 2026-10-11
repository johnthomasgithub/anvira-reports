import { CB, ReportPage, Sig, TitleRow, type ReportProps } from "@/components/report/ReportPage";
import { fmtDate, fmtDateTime, str } from "@/components/report/format";
import { BDS_SERVICE_TYPES, BDS_SET_PARAMS } from "./fields";

const BreakdownReport = ({ data, formNo, signatures }: ReportProps) => {
  const s = (key: string) => str(data, key);
  const reportNoDate = [s("reportNo"), fmtDate(s("reportDate"))].filter(Boolean).join(" & ");

  return (
    <ReportPage>
      <TitleRow
        title="Break Down Service Report."
        rows={[
          ["Form No:", formNo],
          ["Report No & Date", reportNoDate],
        ]}
      />

      <table className="rt">
        <colgroup>
          <col style={{ width: "25%" }} />
          <col style={{ width: "22%" }} />
          <col style={{ width: "20%" }} />
          <col style={{ width: "33%" }} />
        </colgroup>
        <tbody>
          <tr>
            <td colSpan={2} rowSpan={6}>
              <div className="l" style={{ textDecoration: "underline" }}>Client :</div>
              <div style={{ fontWeight: 700, marginTop: 3 }}>{s("clientName")}</div>
              <div className="pre">{s("clientAddress")}</div>
            </td>
            <td className="l">Job No</td>
            <td>{s("jobNo")}</td>
          </tr>
          <tr>
            <td className="l">Equipment:</td>
            <td>{s("equipment")}</td>
          </tr>
          <tr>
            <td className="l">Location:</td>
            <td>{s("location")}</td>
          </tr>
          <tr>
            <td className="l">Person Called</td>
            <td>{s("personCalled")}</td>
          </tr>
          <tr>
            <td className="l">Customer Contact Number</td>
            <td>{s("customerContact")}</td>
          </tr>
          <tr>
            <td className="l">Equipment Number</td>
            <td>{s("equipmentNumber")}</td>
          </tr>
          <tr>
            <td className="h">Date &amp; Time of Complaint</td>
            <td className="h">Date &amp; Time Attended</td>
            <td className="h">Service Closed Time</td>
            <td className="h">PM Service Due date</td>
          </tr>
          <tr>
            <td className="c">{fmtDateTime(s("complaintAt"))}</td>
            <td className="c">{fmtDateTime(s("attendedAt"))}</td>
            <td className="c">{fmtDateTime(s("closedAt"))}</td>
            <td className="c">{fmtDate(s("pmDueDate"))}</td>
          </tr>
          <tr>
            <td colSpan={2} className="xtall">
              <div className="l">Nature of Complaint</div>
              <div className="pre">{s("natureOfComplaint")}</div>
            </td>
            <td colSpan={2} className="xtall">
              <div className="l">Brief Report of inspection</div>
              <div className="pre">{s("inspectionReport")}</div>
            </td>
          </tr>
          <tr>
            <td colSpan={2} className="xtall">
              <div className="l">Service Rendered</div>
              <div className="pre">{s("serviceRendered")}</div>
            </td>
            <td colSpan={2} className="xtall">
              <div className="l">Reason for Failure &amp; Pending works</div>
              <div className="pre">{s("failureReason")}</div>
            </td>
          </tr>
          <tr>
            <td className="l" style={{ verticalAlign: "middle" }}>Type Of Service</td>
            <td>
              {BDS_SERVICE_TYPES.map((t) => (
                <div key={t.value}>
                  <CB checked={s("typeOfService") === t.value} label={t.label} />
                </div>
              ))}
            </td>
            <td colSpan={2}>
              <div className="l">Materials Used</div>
              <div className="pre">{s("materialsUsed")}</div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Voltage & amps */}
      <table className="rt">
        <colgroup>
          <col style={{ width: "25%" }} />
          <col style={{ width: "22%" }} />
          <col style={{ width: "20%" }} />
          <col style={{ width: "8.25%" }} />
          <col style={{ width: "8.25%" }} />
          <col style={{ width: "8.25%" }} />
          <col style={{ width: "8.25%" }} />
        </colgroup>
        <tbody>
          <tr>
            <td />
            <td className="h">R-Y</td>
            <td className="h">Y-B</td>
            <td colSpan={4} className="h">B-R</td>
          </tr>
          <tr>
            <td className="l">Line Voltage</td>
            <td className="c">{s("voltageRY")}</td>
            <td className="c">{s("voltageYB")}</td>
            <td colSpan={4} className="c">{s("voltageBR")}</td>
          </tr>
          <tr>
            <td className="l">Compressor Motor - (A)</td>
            <td className="c">{s("compAmpsRY")}</td>
            <td className="c">{s("compAmpsYB")}</td>
            <td colSpan={4} className="c">{s("compAmpsBR")}</td>
          </tr>
          <tr>
            <td className="l">Room Temperature</td>
            <td className="l">Condenser Fan - (A)</td>
            <td className="l">Evaporator Fan - (A)</td>
            <td className="h">SP</td>
            <td className="h">DP</td>
            <td className="h">IMP</td>
            <td className="h">OP</td>
          </tr>
          <tr>
            <td className="c">{s("roomTempReading")}</td>
            <td className="c">{s("condFanAmps")}</td>
            <td className="c">{s("evapFanAmps")}</td>
            <td className="c">{s("sp")}</td>
            <td className="c">{s("dp")}</td>
            <td className="c">{s("imp")}</td>
            <td className="c">{s("op")}</td>
          </tr>
        </tbody>
      </table>

      {/* Temperatures | oil, defrost, room */}
      <table className="rt">
        <colgroup>
          <col style={{ width: "23.5%" }} />
          <col style={{ width: "23.5%" }} />
          <col style={{ width: "20%" }} />
          <col style={{ width: "33%" }} />
        </colgroup>
        <tbody>
          <tr>
            <td colSpan={2} className="h">Evaporator Temperature</td>
            <td className="l">Compressor Oil Level</td>
            <td>{s("compressorOilLevel")}</td>
          </tr>
          <tr>
            <td className="h">IN</td>
            <td className="h">OUT</td>
            <td className="l">Liquid Indication Level</td>
            <td>{s("liquidIndicationLevel")}</td>
          </tr>
          <tr>
            <td className="c">{s("evapTempIn")}</td>
            <td className="c">{s("evapTempOut")}</td>
            <td className="l">Type of Defrost</td>
            <td>{s("typeOfDefrost")}</td>
          </tr>
          <tr>
            <td colSpan={2} className="h">Condenser Temperature</td>
            <td className="l">No of Defrost / Day</td>
            <td>{s("defrostsPerDay")}</td>
          </tr>
          <tr>
            <td className="h">IN</td>
            <td className="h">OUT</td>
            <td className="l">Room Temperature</td>
            <td>{s("roomTemperature")}</td>
          </tr>
          <tr>
            <td className="c">{s("condTempIn")}</td>
            <td className="c">{s("condTempOut")}</td>
            <td className="l">Room Relative Humidity</td>
            <td>{s("roomRH")}</td>
          </tr>
        </tbody>
      </table>

      {/* Set parameters */}
      <table className="rt">
        <colgroup>
          <col style={{ width: "23.5%" }} />
          <col style={{ width: "23.5%" }} />
          <col style={{ width: "20%" }} />
          <col style={{ width: "16.5%" }} />
          <col style={{ width: "16.5%" }} />
        </colgroup>
        <tbody>
          <tr>
            <td className="l">Set Parameters</td>
            {BDS_SET_PARAMS.map((p) => (
              <td key={p.key} className="h">{p.label}</td>
            ))}
          </tr>
          {(["CutIn", "CutOut"] as const).map((which) => (
            <tr key={which}>
              <td className="l">{which === "CutIn" ? "Cut In" : "Cut Out"}</td>
              {BDS_SET_PARAMS.map((p) => (
                <td key={p.key} className="c">{s(`set_${p.key}${which}`)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Remarks & signatures */}
      <table className="rt">
        <colgroup>
          <col style={{ width: "47%" }} />
          <col style={{ width: "53%" }} />
        </colgroup>
        <tbody>
          <tr>
            <td className="tall">
              <div className="l">Remarks from Service Person</div>
              <div className="pre">{s("servicePersonRemarks")}</div>
            </td>
            <td className="tall">
              <div className="l">Remarks from Customer</div>
              <div className="pre">{s("customerRemarks")}</div>
            </td>
          </tr>
          <tr>
            <td>
              <div className="l">Name &amp; Signature: <span style={{ fontWeight: 400 }}>{s("servicePersonName")}</span></div>
              <Sig src={signatures.servicePersonSignature} />
            </td>
            <td>
              <div className="l">Signature with Name &amp; Seal: <span style={{ fontWeight: 400 }}>{s("customerName")}</span></div>
              <Sig src={signatures.customerSignature} />
            </td>
          </tr>
          <tr>
            <td><span className="l">Date:</span> {fmtDate(s("servicePersonDate"))}</td>
            <td><span className="l">Date:</span> {fmtDate(s("customerDate"))}</td>
          </tr>
          <tr>
            <td colSpan={2} className="bar">Official use only</td>
          </tr>
          <tr>
            <td><span className="l">Verified by:</span> {s("verifiedBy")}</td>
            <td />
          </tr>
          <tr>
            <td><span className="l">Date:</span> {fmtDate(s("verifiedDate"))}</td>
            <td />
          </tr>
        </tbody>
      </table>
    </ReportPage>
  );
};

export default BreakdownReport;
