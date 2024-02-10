import { HOUR, Option } from "../utils";
import { SiteParser } from "./site";

const PLACEHOLDER = "Выберите поток";

export class GroupsParser {
  groups: Option[] = [];
  constructor(private readonly siteParser: SiteParser) {
    this.getGroups();

    setInterval(() => this.getGroups(), HOUR);
  }

  private getGroups() {
    if (!this.siteParser.document) {
      return console.log("[GroupsParser] Документ не найден!");
    }

    const container = this.siteParser.document.getElementById("stream_iddiv");
    const select = container?.querySelector("select");

    const groups: Option[] = [];
    const options = select?.querySelectorAll("option");

    options?.forEach((element) => {
      {
        const label = element.textContent?.trim();
        const value = element.getAttribute("value");

        if (!value || !label) return;
        if (label === PLACEHOLDER) return;

        groups.push({ label, value });
      }
    });

    this.groups = groups;
  }
}
