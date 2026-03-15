import { format } from "date-fns";

export function formatDisplayDate(value: string) {
  return format(new Date(value), "yyyy.MM.dd");
}
