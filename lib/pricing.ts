/** Allowed price per therapy session, in rupees. One place to change it. */
export const SESSION_PRICE_MIN = 500;
export const SESSION_PRICE_MAX = 1200;

export const SESSION_PRICE_RANGE = `₹${SESSION_PRICE_MIN.toLocaleString("en-IN")}–₹${SESSION_PRICE_MAX.toLocaleString("en-IN")}`;
