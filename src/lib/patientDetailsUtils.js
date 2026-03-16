const MAX_FILES_REPORTS = 15;
const MAX_FILES_BILLS = 5;
const MAX_FILES_PRESCRIPTIONS = 5;

export const GENERIC_PROCESSING_ERROR =
  "This document could not be processed. Please review the file and try again.";

export function getMaxFiles(type) {
  const limits = {
    reports: MAX_FILES_REPORTS,
    bills: MAX_FILES_BILLS,
    prescriptions: MAX_FILES_PRESCRIPTIONS,
  };
  return limits[type] || 5;
}

export function parseStructuredError(response) {
  if (response?.failure?.error_code) {
    return {
      error_code: response.failure.error_code,
      message:
        response.failure.reason ||
        response.failure.error_title ||
        GENERIC_PROCESSING_ERROR,
      error_type: response.failure.error_type,
      title: response.failure.error_title,
      context: response.failure.context,
      action: response.failure.action,
    };
  }
  return null;
}

export function extractStatusFailureMessage(statusPayload) {
  if (statusPayload?.failure?.reason) return statusPayload.failure.reason;
  if (statusPayload?.failure?.error_title)
    return statusPayload.failure.error_title;

  const directMessage =
    typeof statusPayload?.error === "string"
      ? statusPayload.error
      : typeof statusPayload?.detail === "string"
        ? statusPayload.detail
        : typeof statusPayload?.message === "string"
          ? statusPayload.message
          : null;

  if (directMessage) return directMessage;

  const nestedCandidates = [
    statusPayload?.failed_file?.error,
    statusPayload?.failed_file?.detail,
    statusPayload?.failure?.error,
    statusPayload?.failure?.detail,
    statusPayload?.error_detail,
  ];

  for (const candidate of nestedCandidates) {
    if (typeof candidate === "string" && candidate.trim()) return candidate;
  }

  return GENERIC_PROCESSING_ERROR;
}
