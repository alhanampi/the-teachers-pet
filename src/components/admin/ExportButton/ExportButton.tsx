import { useState } from "react";
import { Button } from "../../ui/Button";
import type { ButtonVariant } from "../../ui/Button/Button.styles";

interface Props {
  label: string;
  onExport: () => Promise<void>;
  onError: (message: string) => void;
  $variant?: ButtonVariant;
}

export function ExportButton({ label, onExport, onError, $variant }: Props) {
  const [isExporting, setIsExporting] = useState(false);

  const handleClick = () => {
    setIsExporting(true);
    onExport()
      .catch(() => onError("Could not export. Please try again."))
      .finally(() => setIsExporting(false));
  };

  return (
    <Button type="button" $variant={$variant} $compact disabled={isExporting} onClick={handleClick}>
      {isExporting ? "Exporting…" : label}
    </Button>
  );
}
