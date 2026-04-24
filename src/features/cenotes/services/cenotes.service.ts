import { cenotesContentEs } from "../../../content/cenotes/es";
import { cenotesContentEn } from "../../../content/cenotes/en";
import type { CenotesPageContent } from "../types/cenotes.types";

export function getCenotesPageContent(
  locale: "es" | "en"
): CenotesPageContent {
  return locale === "en" ? cenotesContentEn : cenotesContentEs;
}