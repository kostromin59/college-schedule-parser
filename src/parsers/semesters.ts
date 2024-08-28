import { IsReady, Option, READY_EVENT, UPDATE_EVENT } from "../utils";
import { SiteParser } from "./site";

export class SemesterParser implements IsReady {
  semester: Option | null = null;
  isReady: boolean = false;

  constructor(private readonly siteParser: SiteParser) {
    this.siteParser.once(READY_EVENT, () => this.getSemesters());
    this.siteParser.on(UPDATE_EVENT, () => this.getSemesters());
  }

  private getSemesters() {
    if (!this.siteParser.document) {
      setTimeout(() => this.getSemesters(), 1000);
      return console.log("[SemestrParser] Документ пустой!");
    }
    const container = this.siteParser.document.getElementById("termdiv");

    const select = container?.querySelector("select#term");
    if (!select) {
      setTimeout(() => this.getSemesters(), 1000);
      return console.log("[SemestrParser] Элемент не найден!");
    }
    
    const option = Array.from(select.querySelectorAll("option")).find((opt) => opt.hasAttribute("selected"));
    if (!option) {
      setTimeout(() => this.getSemesters(), 1000);
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

    this.isReady = true;
  }
}
