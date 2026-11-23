import { readGuestFromLocation } from "./personalize";

/** The current guest, resolved once from the URL (?guest=…&seats=…). */
export const guest = readGuestFromLocation();
