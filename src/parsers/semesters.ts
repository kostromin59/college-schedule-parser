import { HOUR, Option } from "../utils";
import { SiteParser } from "./site";

export class SemesterParser {
  semester: Option | null = null;

  constructor(private readonly siteParser: SiteParser) {
    this.getSemesters();

    setInterval(() => this.getSemesters(), HOUR);
  }

  private getSemesters() {
    if (!this.siteParser.document) {
      return console.log("[SemestrParser] Документ пустой!");
    }
    const container = this.siteParser.document.getElementById("termdiv");

    const select = container?.querySelector("select#term");
    if (!select) {
      return console.log("[SemestrParser] Элемент не найден!");
    }

    const option = Array.from(select.querySelectorAll("option")).at(-1);
    if (!option) {
      return console.log("[SemestrParser] Элемент не найден!");
    }

    const label = option.textContent;
    const value = option.getAttribute("value");

    if (!value || !label) {
      return console.log("[SemestrParser] Значения не получены!");
    }

    this.semester = {
      value,
      label
    };
  }
}
