import { Context, SessionFlavor } from "grammy";

export type BotContext = Context & SessionFlavor<SessionData>
export type SessionData = { isWaitingSubgroup: boolean }
