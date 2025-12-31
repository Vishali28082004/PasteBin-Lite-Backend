import { v4 as uuidv4 } from "uuid"; 

export const generatePasteId = () => {
  return uuidv4().substring(0, 8);
};

export const isValidContent = (content) => {
  return typeof content === "string" && content.trim().length > 0;
};

export const isValidTTL = (ttl) => {
  if (ttl === undefined || ttl === null) return true;
  return Number.isInteger(ttl) && ttl >= 1;
};

export const isValidMaxViews = (maxViews) => {
  if (maxViews === undefined || maxViews === null) return true;
  return Number.isInteger(maxViews) && maxViews >= 1;
};

export const sanitizeContent = (content) => {
  return content
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
};

