import { Schedule } from "./types/schedule";

export const buildScheduleMessage = (schedules: Record<string, Schedule[]>): string[] => {
  const messages = Object.entries(schedules).sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime()).map(([date, schedules]) => {
    const dayWeek = Intl.DateTimeFormat("ru-RU", { weekday: "long" }).format(new Date(date.split(".").reverse().join("-")));
    if (!schedules) return "";

    const todaySchedules = schedules.sort((a, b) => a.daytime_start.localeCompare(b.daytime_start)).map((schedule, index) => {
      return `<b>${index + 1})</b> ${schedule.discipline_name} (${schedule.classtype_name})\nПреподаватель: ${schedule.teacher_fio}\nВремя: ${schedule.daytime_name}\nКабинет: ${schedule.cabinet_fullnumber_wotype}`;
    }).join("\n\n");

    const message = `📆 <b>${dayWeek.toUpperCase()} (${date})</b>\n${todaySchedules}`;
    return message;
  });

  const message = messages.join("\n\n\n");

  if (message.length > 4096) {
    const midpoint = Math.ceil(messages.length / 2);
    const splittedMessages = [messages.slice(0, midpoint).join("\n\n"), messages.slice(midpoint).join("\n\n")];
    return splittedMessages;
  }
  return [message];
};
