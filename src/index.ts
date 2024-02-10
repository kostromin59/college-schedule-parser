import { GroupsParser, SemesterParser, SiteParser, WeeksParsers } from "./parsers";
import { READY_EVENT } from "./utils";

const siteParser = new SiteParser();

siteParser.once(READY_EVENT, () => {
  const semestersParser = new SemesterParser(siteParser);
  const weeksParser = new WeeksParsers(siteParser.extractStudyYearId() || "");
  const groupsParser = new GroupsParser(siteParser);
});
