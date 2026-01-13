import pool from "../config/db.js";

export const autoGenerateCode = (lastCode, prefix, digits) => {
  if (!lastCode) return `${prefix}-${"1".padStart(digits, "0")}`;

  const numberCode = parseInt(lastCode.slice(prefix.length + 1), 10);
  const nextNumberCode = numberCode + 1;
  return `${prefix}-${String(nextNumberCode).padStart(digits, "0")}`;
};
