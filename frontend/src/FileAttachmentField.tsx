import { X } from "@phosphor-icons/react";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png", ".webp", ".zip"];
const ACCEPT_ATTR =
  "application/pdf,image/jpeg,image/png,image/webp,application/zip";

interface FileAttachmentFieldProps {
  existingFileName?: string;
  stagedFile: File | null;
  onStage: (file: File | null) => void;
}

function FileAttachmentField({
  existingFileName,
  stagedFile,
  onStage,
}: FileAttachmentFieldProps) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);

  const handlePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Reset the native input so the same file can be re-picked after unstaging.
    e.target.value = "";
    if (!file) return;

    if (file.size > MAX_BYTES) {
      toast.error(t("documents.tooLarge", { fileName: file.name }));
      return;
    }
    const dot = file.name.lastIndexOf(".");
    const ext = dot === -1 ? "" : file.name.slice(dot).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      toast.error(t("documents.unsupportedType", { fileName: file.name }));
      return;
    }
    onStage(file);
  };

  return (
    <div className="flex items-start">
      <label
        className="w-1/3 pt-2 text-sm font-semibold"
        htmlFor="attachedDocument"
      >
        {t("common.attachedDocument")}
      </label>
      <div className="w-full">
        {existingFileName && !stagedFile && (
          <p className="mb-1 text-xs opacity-70">
            {t("documents.currentlyAttached", { fileName: existingFileName })}
          </p>
        )}
        <input
          ref={inputRef}
          type="file"
          id="attachedDocument"
          accept={ACCEPT_ATTR}
          onChange={handlePick}
          className="file-input w-full"
        />
        <p className="mt-1 text-xs opacity-60">{t("documents.pickHint")}</p>
        {stagedFile && (
          <div className="mt-1 flex items-center gap-2 text-xs">
            <span className="font-medium">{stagedFile.name}</span>
            <button
              type="button"
              className="btn btn-ghost btn-xs btn-circle"
              onClick={() => onStage(null)}
              aria-label={t("common.close")}
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default FileAttachmentField;
