import { formatDistanceToNowStrict } from "date-fns";

export const formatDistanceToNow = (value) => {
  const date = typeof value === "number" || typeof value === "string" ? new Date(value) : value;
  if (!date || Number.isNaN(date.getTime())) return "";

  return formatDistanceToNowStrict(date, { addSuffix: false });
};

