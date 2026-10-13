import {
  AreaField,
  CheckField,
  CheckYesNoField,
  ClientField,
  DateField,
  Group,
  RadioField,
  Section,
  SignatureField,
  TextField,
} from "@/components/form/fields";
import { CLIENT_OPTIONS } from "@/forms/clients";
import {
  PM_CHECK_COLUMNS,
  PM_READING_COLUMNS,
  PM_READING_ROWS,
  PM_SET_PARAMS,
  PM_YES_NO_CHECKS,
  readingKey,
  setParamKey,
} from "./fields";

const PmForm = () => (
  <>
    <Section title="Report Details">
      <Group cols={2}>
        <TextField name="reportNo" label="Report No." placeholder="ISB…/20…" />
        <DateField name="date" label="Date" />
        <TextField name="jobNo" label="Job No." />
        <RadioField
          name="typeOfService"
          label="Type of Service"
          options={[
            { value: "warranty", label: "Warranty" },
            { value: "amc", label: "AMC" },
          ]}
        />
      </Group>
    </Section>

    <Section title="Client & Equipment">
      <ClientField name="clientName" label="Client" options={CLIENT_OPTIONS} />
      <AreaField name="clientAddress" label="Client Address" rows={2} />
      <Group cols={2}>
        <TextField name="equipmentSerialNo" label="Equipment Serial No." />
        <TextField name="location" label="Location" />
        <DateField name="nextServiceDue" label="Next Service Due Date" />
      </Group>
      <RadioField
        name="serviceFor"
        label="This Service for"
        options={[
          { value: "Q1", label: "Q1" },
          { value: "Q2", label: "Q2" },
          { value: "Q3", label: "Q3" },
          { value: "Q4", label: "Q4" },
        ]}
      />
      <RadioField
        name="condenserType"
        label="Type of Condenser"
        options={[
          { value: "air", label: "Air cooled" },
          { value: "water", label: "Water cooled" },
        ]}
      />
      <Group cols={2}>
        <TextField name="condSlNo" label="Cond Sl No." />
        <TextField name="evapSlNo" label="Evap Sl No." />
        <TextField name="compMake" label="Comp Make" />
        <TextField name="compModelNo" label="Comp Model No." />
        <TextField name="compSlNo" label="Comp Sl No." />
      </Group>
    </Section>

    <Section title="Voltage & Temperatures">
      <Group label="Line Voltage">
        <TextField small name="voltageRY" label="RY" />
        <TextField small name="voltageYB" label="YB" />
        <TextField small name="voltageBR" label="BR" />
      </Group>
      <Group label="Amb Temp">
        <TextField small name="ambDB" label="DB" />
        <TextField small name="ambWB" label="WB" />
        <TextField small name="ambRH" label="RH" />
      </Group>
      <Group label="Room / Process Temp" cols={2}>
        <TextField small name="roomDES" label="DES" />
        <TextField small name="roomMEA" label="MEA" />
      </Group>
    </Section>

    <Section title="Readings">
      {PM_READING_ROWS.map((row) => (
        <Group key={row} label={`Reading ${row}`} cols={6}>
          {PM_READING_COLUMNS.map((c) =>
            c.key === "time" ? (
              <DateField key={c.key} small mode="time" name={readingKey(row, c.key)} label={c.label} />
            ) : (
              <TextField key={c.key} small name={readingKey(row, c.key)} label={c.label} />
            ),
          )}
        </Group>
      ))}
      <Group label="Evaporator Coil" cols={2}>
        <TextField small name="evapCoilIn" label="IN" />
        <TextField small name="evapCoilOut" label="OUT" />
      </Group>
      <Group label="Condenser Coil" cols={2}>
        <TextField small name="condCoilIn" label="IN" />
        <TextField small name="condCoilOut" label="OUT" />
      </Group>
    </Section>

    <Section title="Compressor, Defrost & Heaters">
      <Group cols={2}>
        <TextField name="compressorOilLevel" label="Compressor Oil Level" />
        <TextField name="liquidIndicationLevel" label="Liquid Indication Level" />
        <TextField name="typeOfDefrost" label="Type of Defrost" />
        <TextField name="defrostsPerDay" label="No. of Defrost / Day" />
        <TextField name="frequency" label="Frequency" />
        <TextField name="humidifierAmps" label="Humidifier Amps" />
        <TextField name="dehumidifierAmps" label="De-Humidifier Amps" />
      </Group>
      <Group label="Drain Heater" cols={2}>
        <TextField small name="drainHeaterLength" label="Length" />
        <TextField small name="drainHeaterAmps" label="Amps" />
      </Group>
    </Section>

    <Section title="Set Parameters">
      {(["CutIn", "CutOut"] as const).map((which) => (
        <Group key={which} label={which === "CutIn" ? "Cut In" : "Cut Out"} cols={6}>
          {PM_SET_PARAMS.map((p) => (
            <TextField key={p.key} small name={setParamKey(p.key, which)} label={p.label} />
          ))}
        </Group>
      ))}
    </Section>

    <Section title="Checks">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
        {PM_CHECK_COLUMNS.flat().map((c) =>
          PM_YES_NO_CHECKS.has(c.key) ? (
            <CheckYesNoField key={c.key} name={c.key} label={c.label} />
          ) : (
            <CheckField key={c.key} name={c.key} label={c.label} />
          ),
        )}
      </div>
    </Section>

    <Section title="Visit & Materials">
      <TextField name="technicianName" label="Name of Technician" readOnly />
      <Group cols={2}>
        <DateField name="reportingTime" label="Technician Reporting Time" mode="time" />
        <DateField name="departureTime" label="Departure Time" mode="time" />
      </Group>
      <AreaField name="materialsUsed" label="Materials Used" />
      <RadioField
        name="materialCharge"
        label="Materials"
        options={[
          { value: "chargeable", label: "Chargeable" },
          { value: "nonChargeable", label: "Non Chargeable" },
        ]}
      />
    </Section>

    <Section title="Customer">
      <AreaField name="customerRemark" label="Customer's Remark" />
      <TextField name="customerName" label="Name" />
      <SignatureField name="customerSignature" label="Signature with Seal" />
    </Section>

    <Section title="Technician">
      <AreaField name="technicianRemark" label="Technician's Remark" />
      <SignatureField name="technicianSignature" label="Technician Signature" />
    </Section>

    <Section title="Official Use Only">
      <Group cols={2}>
        <TextField name="verifiedBy" label="Verified by" />
        <DateField name="verifiedDate" label="Date" />
      </Group>
    </Section>
  </>
);

export default PmForm;
