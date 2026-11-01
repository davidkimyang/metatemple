import { sqliteTable, text, integer, real, index, uniqueIndex } from "drizzle-orm/sqlite-core";

export const visitors = sqliteTable("visitors", {
  id: text("id").primaryKey(),
  room: text("room").notNull(),
  x: real("x").notNull(),
  z: real("z").notNull(),
  yaw: real("yaw").notNull(),
  action: text("action").notNull(),
  updated: integer("updated").notNull(),
  slot: integer("slot"),
  cushion: integer("cushion"),
  joined: integer("joined"),
  event: text("event"),
  eventAt: integer("event_at").notNull().default(0),
  bowAt: integer("bow_at").notNull().default(0),
  nickname: text("nickname"),
  speech: text("speech"),
  speechAt: integer("speech_at").notNull().default(0),
  speechUntil: integer("speech_until").notNull().default(0),
}, (table) => [index("visitors_room_updated").on(table.room, table.updated), index("visitors_updated").on(table.updated), uniqueIndex("visitors_room_slot").on(table.room,table.slot), uniqueIndex("visitors_room_cushion").on(table.room,table.cushion)]);
