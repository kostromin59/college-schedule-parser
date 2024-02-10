import mongoose from "mongoose";

const Schema = mongoose.Schema;

const studentSchema = new Schema({
  telegramId: { type: String, required: true },
  groupId: String,
  subgroup: String
});

export const StudentModel = mongoose.model("Student", studentSchema);
