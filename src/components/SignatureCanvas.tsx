import { useRef, useEffect } from "react";
import ReactSignatureCanvas from "react-signature-canvas";
import { Button } from "@/components/ui/button";

interface SignatureCanvasProps {
  value?: string;
  onChange: (dataUrl: string) => void;
  label?: string;
}

const SignatureCanvas = ({ value, onChange, label = "Sign here" }: SignatureCanvasProps) => {
  const sigRef = useRef<ReactSignatureCanvas>(null);

  useEffect(() => {
    if (value && sigRef.current && sigRef.current.isEmpty()) {
      sigRef.current.fromDataURL(value);
    }
  }, [value]);

  const handleEnd = () => {
    if (sigRef.current) {
      onChange(sigRef.current.toDataURL("image/png"));
    }
  };

  const handleClear = () => {
    sigRef.current?.clear();
    onChange("");
  };

  return (
    <div className="space-y-2">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="border border-input rounded-md bg-background overflow-hidden">
        <ReactSignatureCanvas
          ref={sigRef}
          penColor="#222"
          canvasProps={{
            className: "w-full",
            style: { width: "100%", height: 120, touchAction: "none" },
          }}
          onEnd={handleEnd}
        />
      </div>
      <Button type="button" variant="ghost" size="sm" onClick={handleClear}>
        Clear Signature
      </Button>
    </div>
  );
};

export default SignatureCanvas;
