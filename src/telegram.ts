import { Bot, Context, SessionFlavor, session } from "grammy";
import { ScheduleParser } from "./parsers";
import { Menu, MenuRange } from "@grammyjs/menu";

type BotContext = Context & SessionFlavor<SessionData>
type SessionData = { isWaitingSubgroup: boolean }

export class Telegram {
  private bot: Bot<BotContext>;
  constructor(private readonly scheduleParser: ScheduleParser) {
    const bot = new Bot<BotContext>(process.env.TELEGRAM_TOKEN || "");

    bot.use(session({
      initial(): SessionData {
        return { isWaitingSubgroup: false };
      }
    }));


    bot.start();

    this.bot = bot;
    this.bindEvents();
  }

  private bindEvents() {
    const menu = new Menu<BotContext>("groups")
      .text("Группа", (ctx) => ctx.reply("Тут будут группы")).row()
      .text("Подгруппа", async (ctx) => {
        await ctx.reply("Введите подгруппу (скопируйте с сайта):");
        ctx.session.isWaitingSubgroup = true;
      });

    this.bot.use(menu);

    this.bot.command("settings", async (ctx) => {
      await ctx.reply("Настройки:", { reply_markup: menu });
    });

    this.bot.command("start", async (ctx) => {
      await ctx.reply("Укажите группу и подгруппу:", { reply_markup: menu });
    });

    this.bot.on("message:text", async (ctx) => {
      if (!ctx.session.isWaitingSubgroup) return;
      await ctx.reply("Подгруппа введена");
      ctx.session.isWaitingSubgroup = false;
    });
  }
}
