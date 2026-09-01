// src/components/assessment/assessment-io.ts
//
// The save path shared by every screen that submits assessment answers:
// uploading files, surfacing backend conflict warnings, and reading the
// missing-required-fields list out of a 400. Extracted from the wizard's
// module step when the post-registration dialogs started needing exactly
// the same three behaviours — two copies of the file-upload safety net
// below is one copy too many.

import { toast } from "sonner";
import { StorageService } from "@/lib/services/storage-service";
import type { Manifest } from "./AssessmentFieldRenderer";

/** One entry of the `warnings` array the assessment API returns. */
export interface AssessmentWarning {
  code: string;
  severity: "blocking" | "warning";
  title: string;
  message: string;
  guidance: string;
  fields: string[];
  blocks?: string[];
}

/**
 * Scans answers for File objects (file / file_multi fields), uploads them
 * to the object store, and returns an answers object where every File has
 * been replaced by its storage object key.
 */
export async function uploadPendingFiles(
  answers: Record<string, any>,
  manifest: Manifest | null,
  projectId: string,
  moduleKey: string,
): Promise<Record<string, any>> {
  const payload: Record<string, any> = { ...answers };
  const path = `project_assessment/${projectId}/${moduleKey}/`;

  for (const [fieldKey, value] of Object.entries(payload)) {
    const def = manifest?.fields?.[fieldKey];
    if (!def) continue;

    if (def.inputType === "file" && value instanceof File) {
      payload[fieldKey] = await StorageService.uploadFile(value, path);
    }

    if (def.inputType === "file_multi" && Array.isArray(value)) {
      const uploadedPaths: string[] = [];
      for (const item of value) {
        if (item instanceof File) {
          uploadedPaths.push(await StorageService.uploadFile(item, path));
        } else if (typeof item === "string") {
          uploadedPaths.push(item); // already uploaded — keep it
        }
      }
      payload[fieldKey] = uploadedPaths;
    }
  }

  // Final safety net: no File/Blob should survive to this point for ANY
  // field, not just ones the manifest currently tags as file/file_multi.
  // If one does (stale manifest, a field whose inputType got typoed, a
  // network hiccup that left an upload half-applied), axios's JSON
  // serializer silently turns it into `{}` and the backend rejects it with
  // an opaque "expected string, received object" — the failure mode that
  // prompted this guard. Fail loudly here instead, with the actual field
  // name, so it's fixable in seconds rather than re-diagnosed from a
  // generic 400.
  const stillBinary = Object.entries(payload).filter(([, value]) => {
    if (value instanceof File || value instanceof Blob) return true;
    if (Array.isArray(value)) {
      return value.some((v) => v instanceof File || v instanceof Blob);
    }
    return false;
  });
  if (stillBinary.length > 0) {
    const fieldNames = stillBinary.map(([key]) => key).join(", ");
    throw new Error(
      `Upload didn't complete for: ${fieldNames}. Please retry before saving.`,
    );
  }

  return payload;
}

/**
 * Surfaces the backend's answer-conflict warnings.
 *
 * These exist because the scoring engine runs AFTER the save request has
 * returned: a project owner who reported burned waste plus waterlogged
 * decomposition used to get a success toast and, minutes later, an empty
 * baseline on the project page with nothing anywhere saying why. The
 * backend now detects that at save time and returns it; this is where the
 * person who caused it finally hears about it.
 *
 * Blocking conflicts are shown as errors with a long duration — the
 * guidance names the field to change, and it is worth reading. Warnings
 * get the shorter, softer treatment.
 */
export function toastAssessmentWarnings(warnings?: AssessmentWarning[]) {
  if (!warnings?.length) return;

  for (const warning of warnings) {
    const description = `${warning.message}\n\n${warning.guidance}`;
    if (warning.severity === "blocking") {
      toast.error(warning.title, { description, duration: 15_000 });
    } else {
      toast.warning(warning.title, { description, duration: 10_000 });
    }
  }
}

/**
 * Pulls the field list out of the backend's "missing required fields: a, b"
 * 400 so the form can highlight them. Returns null when the error is
 * something else entirely.
 */
export function parseMissingRequiredFields(raw: string): string[] | null {
  if (!raw.toLowerCase().includes("missing required fields")) return null;
  const match = raw.match(/missing required fields: (.+)/i);
  if (!match) return [];
  return match[1].split(",").map((s) => s.trim().replace(/\.$/, ""));
}
