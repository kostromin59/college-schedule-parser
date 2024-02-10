import axios from "axios";
import { IsReady, READY_EVENT, UPDATE_EVENT, WeekDate } from "../utils";
import { SiteParser } from "./site";

const URL = "https://psi.thinkery.ru/shedule/public/get_weekdates";

export class WeeksParser implements IsReady {
  weeks: WeekDate[] = [];
  isReady: boolean = false;

  constructor(private readonly siteParser: SiteParser) {
    this.siteParser.once(READY_EVENT, () => this.getWeeks());
    this.siteParser.on(UPDATE_EVENT, () => this.getWeeks());
  }

  private async getWeeks() {
    try {
      const { data } = await axios.get<WeekDate[]>(URL, {
        data: {
          studyyear_id: this.siteParser.extractStudyYearId()
        }
      });
      this.weeks = data;
      this.isReady = true;
    } catch {
      console.log("[WeeksParser] Ошибка запроса!");
      setTimeout(() => this.getWeeks(), 1000);
    }
  }

  getCurrentWeek(): WeekDate | null {
    const selectedIndex = this.weeks.findIndex(({ selected }) => selected);
    if (selectedIndex === -1) return null;

    const today = new Date(Date.now());

    if (today.getDay() === 6 || today.getDay() === 7) {
      const element = this.weeks[selectedIndex + 1];
      if (!element) return this.weeks[selectedIndex];

      return element;
    }

    return this.weeks[selectedIndex];
  }
}
