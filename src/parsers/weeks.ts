import axios from "axios";
import { HOUR, WeekDate } from "../utils";

const URL = "https://psi.thinkery.ru/shedule/public/get_weekdates";

export class WeeksParsers {
  weeks: WeekDate[] = [];
  constructor(private readonly studyYearId: string) {
    this.getWeeks();

    setInterval(() => this.getWeeks(), HOUR);
  }

  private async getWeeks() {
    try {
      const { data } = await axios.get<WeekDate[]>(URL, {
        data: {
          studyyear_id: this.studyYearId
        }
      });
      this.weeks = data;
    } catch (e) {
      console.log(e);
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
