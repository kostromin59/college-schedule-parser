import { Menu } from "@grammyjs/menu";
import { Bot, Keyboard, session } from "grammy";
import { StudentModel } from "./models/student";
import { ScheduleParser } from "./parsers";
import { BotContext, GET_TODAY, GET_WEEK, SETTINGS, SessionData, buildScheduleMessage } from "./utils";

export class Telegram {
  private bot: Bot<BotContext>;
  private settings: Menu<BotContext>;
  private keyboard: Keyboard;

  constructor(private readonly scheduleParser: ScheduleParser) {
    const bot = new Bot<BotContext>(process.env.TELEGRAM_TOKEN || "");

    bot.use(session({
      initial(): SessionData {
        return { isWaitingSubgroup: false };
      }
    }));

    this.bot = bot;
    this.settings = this.buildSettings();
    this.keyboard = this.buildKeyboard();
    this.bindEvents();

    this.bot.start();
  }

  private buildKeyboard() {
    const keyboard = new Keyboard();
    keyboard.text(GET_WEEK).row();
    keyboard.text(GET_TODAY).row();
    keyboard.text(SETTINGS).row();
    keyboard.resized();
    return keyboard;
  }

  private buildSettings() {
    const settings = new Menu<BotContext>("settings").submenu("Группы", "groups");
    settings.text("Подгруппа", async (ctx) => {
      await ctx.reply("Введите подгруппу (скопируйте с сайта):");
      ctx.session.isWaitingSubgroup = true;
    }).row();

    settings.text("Проверить данные", async (ctx) => {
      if (ctx.session.isWaitingSubgroup) return;

      const id = ctx.from.id;
      const student = await StudentModel.findOne({ telegramId: id });

      if (student && student.groupId && student.subgroup) return await ctx.reply("Выберите пункт в меню", { reply_markup: this.keyboard });

      return await ctx.reply("Ещё не все данные указаны!");
    }).row();

    const groupsMenu = new Menu<BotContext>("groups");

    const groups = this.scheduleParser.groupsParser.groups;
    groups.forEach((group) => {
      groupsMenu.text(group.label, async (ctx) => {
        const id = ctx.from.id;

        const student = await StudentModel.findOne({ telegramId: id });
        if (!student) return await ctx.reply("Для начала воспользуйтесь командой /start");

        await student.updateOne({ telegramId: student.telegramId, groupId: group.value, subgroup: student.subgroup, id: student.id }).exec();

        ctx.menu.back();
        await ctx.reply(`Вы выбрали ${group.label}`);
      }).row();
    });

    groupsMenu.back("Назад");

    this.bot.use(settings);
    settings.register(groupsMenu);
    return settings;
  }

  private bindEvents() {
    this.bot.catch((err) => {
      console.log(err);
      err.ctx.reply("Произошла ошибка! Попробуйте позже или сообщите разработчику!");
    });

    this.bot.command("start", async (ctx) => {
      const id = ctx.message?.from.id;
      if (!id) return await ctx.reply("Произошла ошибка! Попробуйте ещё раз ввести команду /start");

      const student = await StudentModel.findOne({ telegramId: id });
      if (student && student.groupId && student.subgroup) return await ctx.reply("Вам доступно меню!", { reply_markup: this.keyboard });

      const newStudent = new StudentModel({ telegramId: id });
      await newStudent.save();

      await ctx.reply("Укажите группу и подгруппу:", { reply_markup: this.settings });
    });

    this.bot.on("message:text", async (ctx) => {
      const student = await StudentModel.findOne({ telegramId: ctx.from.id });

      // Сохранить подгруппу
      if (ctx.session.isWaitingSubgroup) {
        const subgroup = ctx.message.text;

        if (!student) {
          ctx.session.isWaitingSubgroup = false;
          return await ctx.reply("Для начала воспользуйтесь командой /start");
        }

        await student.updateOne({ telegramId: student.telegramId, groupId: student.groupId, id: student.id, subgroup }).exec();

        await ctx.reply(`Подгруппа ${subgroup} сохранена!`);

        ctx.session.isWaitingSubgroup = false;
      }

      // Получить расписание на неделю
      else if (ctx.message.text === GET_WEEK) {
        if (!student || !student.groupId || !student.subgroup) return await ctx.answerCallbackQuery("Начните с команды /start");

        const schedules = this.scheduleParser.findByGroup(student.groupId, student.subgroup);
        if (!schedules) return await ctx.reply("Расписание не найдено!");

        const messages = buildScheduleMessage(schedules);
        if (!messages) return await ctx.reply("Расписание не найдено!");

        for await (const message of messages) {
          await ctx.reply(message, { parse_mode: "HTML" });
        }

        return;
      }

      // Открыть настройки
      else if (ctx.message.text === SETTINGS) {
        return await ctx.reply("Настройки", { reply_markup: this.settings });
      }

      // Получить расписание на сегодня
      else if (ctx.message.text === GET_TODAY) {
        if (!student || !student.groupId || !student.subgroup) return await ctx.answerCallbackQuery("Начните с команды /start");

        const schedules = this.scheduleParser.findToday(student.groupId, student.subgroup);
        if (!schedules) return await ctx.reply("Расписание не найдено!");

        const messages = buildScheduleMessage(schedules);
        if (!messages) return await ctx.reply("Расписание не найдено!");

        for await (const message of messages) {
          await ctx.reply(message, { parse_mode: "HTML" });
        }

        return;
      }
    });
  }
}
