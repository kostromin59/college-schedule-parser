import { GroupsParser, ScheduleParser, SemesterParser, SiteParser, WeeksParser } from "./parsers";
import { FIVE_SECONDS, READY_EVENT } from "./utils";


const siteParser = new SiteParser();
const parsers = [new GroupsParser(siteParser), new SemesterParser(siteParser), new WeeksParser(siteParser)] as const;

const run = (): void => {
  const [groupsParser, semestersParser, weeksParser] = parsers;

  if (!parsers.every((parser) => parser.isReady)) {
    console.log("Повторная попытка запуска через 5 секунд!");
    setTimeout(run, FIVE_SECONDS);
    return;
  }

  const scheduleParser = new ScheduleParser(groupsParser, semestersParser, weeksParser, siteParser);
};

siteParser.once(READY_EVENT, () => setTimeout(run, FIVE_SECONDS));
