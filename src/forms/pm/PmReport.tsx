import { CB, ReportPage, Sig, TitleRow, type ReportProps } from "@/components/report/ReportPage";
import { fmtDate, str } from "@/components/report/format";
import {
  PM_CHECK_COLUMNS,
  PM_READING_COLUMNS,
  PM_READING_ROWS,
  PM_SET_PARAMS,
  PM_YES_NO_CHECKS,
  readingKey,
  setParamKey,
} from "./fields";

const PmReport = ({ data, formNo, signatures }: ReportProps) => {
  const s = (key: string) => str(data, key);
  const is = (key: string, value: string) => s(key) === value;

  return (
    <ReportPage compact>
      <TitleRow
        title="Preventive Maintenance Service Report."
        rows={[
          ["Form No:", formNo],
          ["Report No:", s("reportNo")],
        ]}
      />

      {/* Client block + job details */}
      <table className="rt">
        <colgroup>
          <col style={{ width: "50%" }} />
          <col style={{ width: "24%" }} />
          <col style={{ width: "26%" }} />
        </colgroup>
        <tbody>
          <tr>
            <td rowSpan={5}>
              <div className="l" style={{ textDecoration: "underline" }}>Client :</div>
              <div style={{ fontWeight: 700, marginTop: 3 }}>{s("clientName")}</div>
              <div className="pre">{s("clientAddress")}</div>
            </td>
            <td className="l">Job No:</td>
            <td>{s("jobNo")}</td>
          </tr>
          <tr>
            <td className="l">Date</td>
            <td>{fmtDate(s("date"))}</td>
          </tr>
          <tr>
            <td className="l">Type of Service</td>
            <td>
              <CB checked={is("typeOfService", "warranty")} label="Warranty" />
              <CB checked={is("typeOfService", "amc")} label="AMC" />
            </td>
          </tr>
          <tr>
            <td className="l">Equipment Serial No</td>
            <td>{s("equipmentSerialNo")}</td>
          </tr>
          <tr>
            <td className="l">Location:</td>
            <td>{s("location")}</td>
          </tr>
        </tbody>
      </table>

      {/* Service, condenser, temperatures | equipment numbers */}
      <table className="rt">
        <colgroup>
          <col style={{ width: "17%" }} />
          <col style={{ width: "33%" }} />
          <col style={{ width: "24%" }} />
          <col style={{ width: "26%" }} />
        </colgroup>
        <tbody>
          <tr>
            <td className="l">This Service for</td>
            <td>
              {["Q1", "Q2", "Q3", "Q4"].map((q) => (
                <CB key={q} checked={is("serviceFor", q)} label={q} />
              ))}
            </td>
            <td className="l">Next service Due Date</td>
            <td>{fmtDate(s("nextServiceDue"))}</td>
          </tr>
          <tr>
            <td className="l">Type of Condenser</td>
            <td>
              <CB checked={is("condenserType", "air")} label="Air cooled" />
              <CB checked={is("condenserType", "water")} label="Water cooled" />
            </td>
            <td className="l">Cond Sl No:</td>
            <td>{s("condSlNo")}</td>
          </tr>
          <tr>
            <td className="l">Amb Temp</td>
            <td>
              <b>DB</b> {s("ambDB")} &nbsp; <b>WB</b> {s("ambWB")} &nbsp; <b>RH</b> {s("ambRH")}
            </td>
            <td className="l">Evap Sl No:</td>
            <td>{s("evapSlNo")}</td>
          </tr>
          <tr>
            <td className="l">Room/Process Temp</td>
            <td>
              <b>DES</b> {s("roomDES")} &nbsp; <b>MEA</b> {s("roomMEA")}
            </td>
            <td className="l">Comp Make:</td>
            <td>{s("compMake")}</td>
          </tr>
          <tr>
            <td className="l">Line Voltage</td>
            <td>
              <b>RY:</b> {s("voltageRY")} &nbsp; <b>YB:</b> {s("voltageYB")} &nbsp; <b>BR:</b> {s("voltageBR")}
            </td>
            <td className="l">Comp Model No:</td>
            <td>{s("compModelNo")}</td>
          </tr>
          <tr>
            <td colSpan={2} />
            <td className="l">Comp Sl No:</td>
            <td>{s("compSlNo")}</td>
          </tr>
        </tbody>
      </table>

      {/* Readings */}
      <table className="rt">
        <tbody>
          <tr>
            {PM_READING_COLUMNS.map((c) => (
              <td key={c.key} className="h">
                {c.label}
              </td>
            ))}
          </tr>
          {PM_READING_ROWS.map((row) => (
            <tr key={row}>
              {PM_READING_COLUMNS.map((c) => (
                <td key={c.key} className="c">
                  {s(readingKey(row, c.key))}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Coils, oil, defrost */}
      <table className="rt">
        <colgroup>
          <col style={{ width: "18%" }} />
          <col style={{ width: "14%" }} />
          <col style={{ width: "14%" }} />
          <col style={{ width: "24%" }} />
          <col style={{ width: "30%" }} />
        </colgroup>
        <tbody>
          <tr>
            <td className="l">Evaporator Coil</td>
            <td><b>IN</b> {s("evapCoilIn")}</td>
            <td><b>OUT</b> {s("evapCoilOut")}</td>
            <td className="l">Compressor Oil Level:</td>
            <td>{s("compressorOilLevel")}</td>
          </tr>
          <tr>
            <td className="l">Condensor coil</td>
            <td><b>IN</b> {s("condCoilIn")}</td>
            <td><b>OUT</b> {s("condCoilOut")}</td>
            <td className="l">Liquid Indication Level:</td>
            <td>{s("liquidIndicationLevel")}</td>
          </tr>
          <tr>
            <td className="l">Type of Defrost:</td>
            <td colSpan={2}>{s("typeOfDefrost")}</td>
            <td className="l">No of Defrost / Day:</td>
            <td>
              {s("defrostsPerDay")}
              <span style={{ float: "right" }}>
                <b>Frequency</b> {s("frequency")}
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Set parameters | humidifier, drain heater */}
      <table className="rt">
        <colgroup>
          <col style={{ width: "14%" }} />
          {PM_SET_PARAMS.map((p) => (
            <col key={p.key} style={{ width: "7.6%" }} />
          ))}
          <col style={{ width: "24%" }} />
          <col style={{ width: "24%" }} />
        </colgroup>
        <tbody>
          <tr>
            <td className="l">Set Parametrs</td>
            {PM_SET_PARAMS.map((p) => (
              <td key={p.key} className="h">
                {p.label}
              </td>
            ))}
            <td className="l">Humidifier Amps</td>
            <td>{s("humidifierAmps")}</td>
          </tr>
          <tr>
            <td className="l">Cut IN</td>
            {PM_SET_PARAMS.map((p) => (
              <td key={p.key} className="c">
                {s(setParamKey(p.key, "CutIn"))}
              </td>
            ))}
            <td className="l">De-Humidifier Amps</td>
            <td>{s("dehumidifierAmps")}</td>
          </tr>
          <tr>
            <td className="l">Cut Out</td>
            {PM_SET_PARAMS.map((p) => (
              <td key={p.key} className="c">
                {s(setParamKey(p.key, "CutOut"))}
              </td>
            ))}
            <td className="l">Drain Heater Length:</td>
            <td>
              {s("drainHeaterLength")}
              <span style={{ float: "right" }}>
                <b>Amps:</b> {s("drainHeaterAmps")}
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Checks */}
      <table className="rt">
        <colgroup>
          {PM_CHECK_COLUMNS.map((_, i) => (
            <col key={i} style={{ width: "25%" }} />
          ))}
        </colgroup>
        <tbody>
          <tr>
            <td colSpan={4} className="checks-head">
              CHECKS
            </td>
          </tr>
          {PM_CHECK_COLUMNS[0].map((_, row) => (
            <tr key={row}>
              {PM_CHECK_COLUMNS.map((col, i) => {
                const item = col[row];
                return (
                  <td key={i} className="chk" style={{ height: 17, borderTop: row ? "none" : undefined, borderBottom: "none" }}>
                    <CB checked={!!data[item.key]} label={item.label} />
                    {PM_YES_NO_CHECKS.has(item.key) && (
                      <>
                        <CB checked={is(`${item.key}YesNo`, "yes")} label="Yes" />
                        <CB checked={is(`${item.key}YesNo`, "no")} label="No" />
                      </>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Visit, materials, remarks, signatures */}
      <table className="rt">
        <colgroup>
          <col style={{ width: "46%" }} />
          <col style={{ width: "14%" }} />
          <col style={{ width: "18%" }} />
          <col style={{ width: "22%" }} />
        </colgroup>
        <tbody>
          <tr>
            <td>
              <span className="l">Name Of Tech:</span> {s("technicianName")}
            </td>
            <td colSpan={2}>
              <span className="l">Technician Reporting Time:-</span> {s("reportingTime")}
            </td>
            <td>
              <span className="l">Departure Time:-</span> {s("departureTime")}
            </td>
          </tr>
          <tr>
            <td colSpan={2} className="tall">
              <div className="l">Materials Used</div>
              <div className="pre">{s("materialsUsed")}</div>
            </td>
            <td>
              <CB checked={is("materialCharge", "chargeable")} label={<b>Chargeable</b>} />
            </td>
            <td>
              <CB checked={is("materialCharge", "nonChargeable")} label={<b>Non Chargeable</b>} />
            </td>
          </tr>
          <tr>
            <td colSpan={4} className="tall">
              <div className="l">Customer's Remark</div>
              <div className="pre">{s("customerRemark")}</div>
            </td>
          </tr>
          <tr>
            <td colSpan={2}>
              <span className="l">Name</span> &nbsp;{s("customerName")}
            </td>
            <td colSpan={2}>
              <div className="l">Signature with Seal</div>
              <Sig src={signatures.customerSignature} />
            </td>
          </tr>
          <tr>
            <td colSpan={4} className="tall">
              <div className="l">Technician's Remark</div>
              <div className="pre">{s("technicianRemark")}</div>
            </td>
          </tr>
          <tr>
            <td colSpan={2}>
              <span className="l">Name</span> &nbsp;{s("technicianName")}
            </td>
            <td colSpan={2}>
              <div className="l">Signature</div>
              <Sig src={signatures.technicianSignature} />
            </td>
          </tr>
          <tr>
            <td colSpan={4} className="bar">
              Official use only
            </td>
          </tr>
          <tr>
            <td colSpan={2}>
              <span className="l">Verified by:</span> {s("verifiedBy")}
            </td>
            <td colSpan={2}>
              <span className="l">Date</span> &nbsp;{fmtDate(s("verifiedDate"))}
            </td>
          </tr>
        </tbody>
      </table>
    </ReportPage>
  );
};

export default PmReport;
