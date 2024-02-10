import { IsReady, Option, READY_EVENT, UPDATE_EVENT } from "../utils";
import { SiteParser } from "./site";

const PLACEHOLDER = "Выберите поток";

export class GroupsParser implements IsReady {
  groups: Option[] = [];
  isReady: boolean = false;

  constructor(private readonly siteParser: SiteParser) {
    this.siteParser.once(READY_EVENT, () => this.getGroups());
    this.siteParser.on(UPDATE_EVENT, () => this.getGroups());
  }

  private getGroups() {
    if (!this.siteParser.document) {
      setTimeout(() => this.getGroups(), 1000);
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
    this.isReady = true;
  }
}
