import axios from "axios";
import { HOUR, READY_EVENT, SITE_URL } from "../utils";
import { JSDOM } from "jsdom";
import { EventEmitter } from "node:events";


export class SiteParser extends EventEmitter {
  document: Document | null = null;
  site: string = "";

  constructor() {
    super();
    setInterval(() => this.getDocument(), HOUR);
    this.getDocument().then(() => this.emit(READY_EVENT));
  }

  private async getDocument() {
    try {
      const { data } = await axios.get<string>(SITE_URL);
      const { document } = new JSDOM(data).window;

      if (!document.querySelector(".container")) {
        throw new Error();
      }

      this.document = document;
      this.site = data;
    } catch (e) {
      console.log(e);
      console.log("[SiteParser] Ошибка получения сайта");
    }
  }

  extractStudyYearId() {
    const regex = /studyyear_id\s*:\s*'(\d+)'/;
    const match = this.site.match(regex);
    return match ? match[1] : null;
  }
}
