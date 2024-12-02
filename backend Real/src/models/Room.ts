import { prop, getModelForClass } from "@typegoose/typegoose";
import type { Ref } from "@typegoose/typegoose";
import { User } from "./User";

class Room {
  @prop({ required: true })
  name!: string;

  @prop({ ref: () => User })
  owner!: Ref<User>;

  @prop({ ref: () => User })
  members!: Ref<User>[];

  @prop()
  imageUrl?: string;

  @prop({ default: () => new Date() })
  createdAt!: Date;

  @prop({ default: () => new Date() })
  updatedAt!: Date;
}

export const RoomModel = getModelForClass(Room);
