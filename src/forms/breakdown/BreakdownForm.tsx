import { AreaField, ClientField, DateField, Group, RadioField, Section, SignatureField, TextField } from "@/components/form/fields";
import { CLIENT_OPTIONS } from "@/forms/clients";
import { BDS_SERVICE_TYPES, BDS_SET_PARAMS } from "./fields";

const BreakdownForm = () => (
  <>
    <Section title="Report Details">
      <Group cols={2}>
        <TextField name="reportNo" label="Report No." />
        <DateField name="reportDate" label="Report Date" />
        <TextField name="jobNo" label="Job No." />
      </Group>
    </Section>

    <Section title="Client & Equipment">
      <ClientField name="clientName" label="Client" options={CLIENT_OPTIONS} />
      <AreaField name="clientAddress" label="Client Address" rows={2} />
      <Group cols={2}>
        <TextField name="equipment" label="Equipment" />
        <TextField name="location" label="Location" />
        <TextField name="personCalled" label="Person Called" />
        <TextField name="customerContact" label="Customer Contact Number" type="tel" />
        <TextField name="equipmentNumber" label="Equipment Number" />
      </Group>
    </Section>

    <Section title="Complaint Timeline">
      <Group cols={2}>
        <DateField name="complaintAt" label="Date & Time of Complaint" mode="datetime-local" />
        <DateField name="attendedAt" label="Date & Time Attended" mode="datetime-local" />
        <DateField name="closedAt" label="Service Closed Time" mode="datetime-local" />
        <DateField name="pmDueDate" label="PM Service Due Date" />
      </Group>
    </Section>

    <Section title="Complaint & Service">
      <AreaField name="natureOfComplaint" label="Nature of Complaint" />
      <AreaField name="inspectionReport" label="Brief Report of Inspection" />
      <AreaField name="serviceRendered" label="Service Rendered" />
      <AreaField name="failureReason" label="Reason for Failure & Pending Works" />
      <RadioField name="typeOfService" label="Type of Service" options={BDS_SERVICE_TYPES} />
      <AreaField name="materialsUsed" label="Materials Used" />
    </Section>

    <Section title="Electrical Readings">
      <Group label="Line Voltage">
        <TextField small name="voltageRY" label="R-Y" />
        <TextField small name="voltageYB" label="Y-B" />
        <TextField small name="voltageBR" label="B-R" />
      </Group>
      <Group label="Compressor Motor (A)">
        <TextField small name="compAmpsRY" label="R-Y" />
        <TextField small name="compAmpsYB" label="Y-B" />
        <TextField small name="compAmpsBR" label="B-R" />
      </Group>
      <Group cols={3}>
        <TextField small name="roomTempReading" label="Room Temperature" />
        <TextField small name="condFanAmps" label="Condenser Fan (A)" />
        <TextField small name="evapFanAmps" label="Evaporator Fan (A)" />
      </Group>
      <Group label="Pressures" cols={4}>
        <TextField small name="sp" label="SP" />
        <TextField small name="dp" label="DP" />
        <TextField small name="imp" label="IMP" />
        <TextField small name="op" label="OP" />
      </Group>
    </Section>

    <Section title="Temperatures & Defrost">
      <Group label="Evaporator Temperature" cols={2}>
        <TextField small name="evapTempIn" label="IN" />
        <TextField small name="evapTempOut" label="OUT" />
      </Group>
      <Group label="Condenser Temperature" cols={2}>
        <TextField small name="condTempIn" label="IN" />
        <TextField small name="condTempOut" label="OUT" />
      </Group>
      <Group cols={2}>
        <TextField name="compressorOilLevel" label="Compressor Oil Level" />
        <TextField name="liquidIndicationLevel" label="Liquid Indication Level" />
        <TextField name="typeOfDefrost" label="Type of Defrost" />
        <TextField name="defrostsPerDay" label="No. of Defrost / Day" />
        <TextField name="roomTemperature" label="Room Temperature" />
        <TextField name="roomRH" label="Room Relative Humidity" />
      </Group>
    </Section>

    <Section title="Set Parameters">
      {(["CutIn", "CutOut"] as const).map((which) => (
        <Group key={which} label={which === "CutIn" ? "Cut In" : "Cut Out"} cols={4}>
          {BDS_SET_PARAMS.map((p) => (
            <TextField key={p.key} small name={`set_${p.key}${which}`} label={p.label} />
          ))}
        </Group>
      ))}
    </Section>

    <Section title="Service Person">
      <AreaField name="servicePersonRemarks" label="Remarks from Service Person" />
      <Group cols={2}>
        <TextField name="servicePersonName" label="Name" />
        <DateField name="servicePersonDate" label="Date" />
      </Group>
      <SignatureField name="servicePersonSignature" label="Signature" />
    </Section>

    <Section title="Customer">
      <AreaField name="customerRemarks" label="Remarks from Customer" />
      <Group cols={2}>
        <TextField name="customerName" label="Name" />
        <DateField name="customerDate" label="Date" />
      </Group>
      <SignatureField name="customerSignature" label="Signature with Name & Seal" />
    </Section>

    <Section title="Official Use Only">
      <Group cols={2}>
        <TextField name="verifiedBy" label="Verified by" />
        <DateField name="verifiedDate" label="Date" />
      </Group>
    </Section>
  </>
);

export default BreakdownForm;
