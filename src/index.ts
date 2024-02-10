import "dotenv/config";
import mongoose from "mongoose";
import { GroupsParser, ScheduleParser, SemesterParser, SiteParser, WeeksParser } from "./parsers";
import { FIVE_SECONDS, READY_EVENT } from "./utils";
import { Telegram } from "./telegram";

mongoose.connect(`mongodb://${process.env.MONGODB_HOST || "localhost"}:${process.env.MONGODB_PORT || "27017"}/`, {
  dbName: process.env.MONGO_INITDB_DATABASE || "students",
  auth: {
    username: process.env.MONGO_INITDB_ROOT_USERNAME,
    password: process.env.MONGO_INITDB_ROOT_PASSWORD,
  },
});

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
  console.log("Бот запущен!");
  new Telegram(scheduleParser);
};

siteParser.once(READY_EVENT, () => setTimeout(run, FIVE_SECONDS));
