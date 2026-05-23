import { AppError } from "./app-error.js";

const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;
const ALLOWED_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png", ".webp", ".zip"];

export interface AttachedFileInput {
  fileName: string;
  bytes: Uint8Array;
}

/**
 * Apply an uploaded attachment to a contract row in place. Validates size and
 * extension before assigning. Used by both lending and borrowing handlers, so
 * the rules stay identical and defense-in-depth lives in one place.
 */
export function applyAttachment(
  contract: { fileName?: string; fileBlob?: Buffer },
  attached: AttachedFileInput,
) {
  if (attached.bytes.byteLength > MAX_ATTACHMENT_BYTES) {
    throw new AppError("errors.document.tooLarge");
  }
  const ext = attached.fileName
    .slice(attached.fileName.lastIndexOf("."))
    .toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    throw new AppError("errors.document.unsupportedType");
  }
  contract.fileName = attached.fileName;
  contract.fileBlob = Buffer.from(attached.bytes);
}
