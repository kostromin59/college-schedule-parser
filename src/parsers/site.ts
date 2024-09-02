import axios from "axios";
import { JSDOM } from "jsdom";
import { EventEmitter } from "node:events";
import { FIVE_SECONDS, HOUR, IsReady, READY_EVENT, SITE_URL, UPDATE_EVENT } from "../utils";

export class SiteParser extends EventEmitter implements IsReady {
  document: Document | null = null;
  site: string = "";
  isReady: boolean = false;

  constructor() {
    super();

    this.getDocument();
    setInterval(() => this.getDocument(), HOUR);
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

      if (!this.isReady) {
        this.isReady = true;
        return this.emit(READY_EVENT);
      }

      this.emit(UPDATE_EVENT);
    } catch (e){
      console.log("[SiteParser] Ошибка получения сайта");
      console.log(e);
      setTimeout(() => this.getDocument(), FIVE_SECONDS);
    }
  }

  extractStudyYearId() {
    const regex = /studyyear_id\s*:\s*'(\d+)'/;
    const match = this.site.match(regex);
    return match ? match[1] : null;
  }
}
