import { AreaField, ClientField, DateField, Group, Section, SignatureField, TextField } from "@/components/form/fields";
import { CLIENT_OPTIONS } from "@/forms/clients";
import { CR_SET_PARAMS } from "./fields";

const CommissioningForm = () => (
  <>
    <Section title="Report Details">
      <Group cols={2}>
        <TextField name="reportNo" label="Report No." />
        <TextField name="jobNo" label="Job No." />
        <TextField name="customerPoNo" label="Customer PO No." />
        <DateField name="customerPoDate" label="Customer PO Date" />
      </Group>
    </Section>

    <Section title="Client & Site">
      <ClientField name="clientName" label="Client" options={CLIENT_OPTIONS} />
      <AreaField name="clientAddress" label="Client Address" rows={2} />
      <Group cols={2}>
        <TextField name="equipment" label="Equipment" />
        <TextField name="location" label="Location" />
      </Group>
    </Section>

    <Section title="Condensing Unit & Compressor">
      <Group cols={2}>
        <TextField name="condensingUnitModelSlNo" label="Condensing Unit Model / Sl No." />
        <TextField name="compressorMake" label="Compressor Make" />
        <TextField name="compressorModel" label="Compressor Model" />
        <TextField name="compressorSlNo" label="Compressor Sl No." />
      </Group>
    </Section>

    <Section title="Evaporator & Refrigerant">
      <Group cols={2}>
        <TextField name="evaporatorMake" label="Evaporator Make" />
        <TextField name="evaporatorModelNo" label="Evaporator Model No." />
        <TextField name="evaporatorSlNo" label="Evaporator Sl No." />
        <TextField name="refrigerant" label="Refrigerant" />
        <TextField name="refrigerantQty" label="Qty Used" />
      </Group>
    </Section>

    <Section title="System, Humidifier & De-Humidifier">
      <Group cols={2}>
        <TextField name="typeOfSystem" label="Type of System" />
        <TextField name="noOfUnits" label="No. of Units" />
        <TextField name="humidifierMake" label="Humidifier Make" />
        <TextField name="humidifierModelSlNo" label="Humidifier Model No. / Sl No." />
        <TextField name="dehumidifierMakeModel" label="De-Humidifier Make / Model" />
        <TextField name="dehumidifierSrNo" label="De-Humidifier Sr. No." />
        <TextField name="dehumidHeaterType" label="Type of De-Humid Heater" />
      </Group>
      <Group label="De-Humid Heater">
        <TextField small name="dehumidHeaterQty" label="Qty" />
        <TextField small name="dehumidHeaterWatts" label="Watts" />
        <TextField small name="dehumidHeaterAmps" label="Amps" />
      </Group>
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
        <TextField small name="compMotorAmps" label="Compressor Motor (A)" />
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
      <Group label="Ambient Conditions">
        <TextField small name="ambDB" label="DB" />
        <TextField small name="ambWB" label="WB" />
        <TextField small name="ambRH" label="RH" />
      </Group>
      <Group cols={2}>
        <TextField name="evapAirInTemp" label="Evaporator Coil Air IN Temp" />
        <TextField name="evapAirOutTemp" label="Evaporator Coil Air OUT Temp" />
        <TextField name="condAirInTemp" label="Condenser Coil Air IN Temp" />
        <TextField name="condAirOutTemp" label="Condenser Coil Air OUT Temp" />
        <TextField name="compressorOilLevel" label="Compressor Oil Level" />
        <TextField name="liquidLevel" label="Liquid Level" />
        <TextField name="typeOfDefrost" label="Type of Defrost" />
        <TextField name="defrostsPerDay" label="No. of Defrost / Day" />
        <TextField name="roomTemp" label="Room Temp" />
        <TextField name="roomRH" label="Room RH" />
      </Group>
    </Section>

    <Section title="Heaters">
      <TextField name="heaterTrayCoilType" label="Type of Heater Tray & Coil" />
      <Group cols={4}>
        <TextField small name="trayHeaterAmps" label="Tray Heater (A)" />
        <TextField small name="coilHeaterAmps" label="Coil Heater (A)" />
        <TextField small name="drainHeaterAmps" label="Drain Heater (A)" />
        <TextField small name="doorHeaterAmps" label="Door Heater (A)" />
      </Group>
    </Section>

    <Section title="Set Parameters">
      {(["CutIn", "CutOut"] as const).map((which) => (
        <Group key={which} label={which === "CutIn" ? "Cut In" : "Cut Out"} cols={4}>
          {CR_SET_PARAMS.map((p) => (
            <TextField key={p.key} small name={`set_${p.key}${which}`} label={p.label} />
          ))}
        </Group>
      ))}
    </Section>

    <Section title="Remarks">
      <AreaField name="engineerRemarks" label="Remarks from Commissioning Engineer" />
      <AreaField name="customerRemarks" label="Remarks from Customer" />
    </Section>

    <Section title="Preventive Maintenance Service Schedule">
      <Group cols={4}>
        <DateField small name="pmQ1" label="Date-Q1" />
        <DateField small name="pmQ2" label="Date-Q2" />
        <DateField small name="pmQ3" label="Date-Q3" />
        <DateField small name="pmQ4" label="Date-Q4" />
      </Group>
    </Section>

    <Section title="Signatures">
      <SignatureField name="engineerSignature" label="Commissioning Engineer Signature" />
      <DateField name="engineerSignDate" label="Date" />
      <SignatureField name="customerSignature" label="Customer Signature" />
      <DateField name="customerSignDate" label="Date" />
    </Section>

    <Section title="Official Use Only">
      <Group cols={2}>
        <TextField name="verifiedBy" label="Verified by" />
        <DateField name="verifiedDate" label="Date" />
      </Group>
    </Section>
  </>
);

export default CommissioningForm;
