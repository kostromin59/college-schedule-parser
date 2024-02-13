import axios from "axios";
import { JSDOM } from "jsdom";
import { IsReady, Option, READY_EVENT, SUBGROUP_URL, UPDATE_EVENT } from "../utils";
import { SiteParser } from "./site";

const PLACEHOLDER = "Выберите поток";

export class GroupsParser implements IsReady {
  groups: Option[] = [];
  subgroups: Record<string, string[]> = {};
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

  async getSubgroups(semester: string, dateweek: number) {
    if (!this.siteParser.document) {
      setTimeout(() => this.getGroups(), 1000);
      return console.log("[GroupsParser] Документ не найден!");
    }

    for await (const group of this.groups) {
      const { data } = await axios.post<string>(SUBGROUP_URL, {
        studyyear_id: this.siteParser.extractStudyYearId(),
        stream_id: group.value,
        term: semester,
        dateweek
      });

      this.parseSubgroups(data, group.value);
    }
  }

  private parseSubgroups(page: string, groupId: string) {
    const { document } = new JSDOM(page).window;

    const table = document.getElementById("timetable");
    if (!table) return console.log("[GroupsParser] Таблица не найдена!");

    const head = table.querySelector("thead");
    if (!head) return console.log("[GroupsParser] Thead не найден!");

    const tableRows = Array.from(head.querySelectorAll("tr").values());
    if (tableRows.length < 2) return console.log("[GroupsParser] Подгруппы не найдены!");

    const lastTableRow = tableRows.at(-1);
    if (!lastTableRow) return console.log("[GroupsParser] Подгруппы не найдены!");

    const subgroups = Array.from(lastTableRow.querySelectorAll("th").values());

    const labels: string[] = [];
    subgroups.forEach((subgroup) => {
      if (subgroup.textContent) {
        labels.push(subgroup.textContent.trim());
      }
    });

    this.subgroups[groupId] = labels;
  }
}
