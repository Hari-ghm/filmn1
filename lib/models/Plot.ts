import mongoose from "mongoose";

const PlotSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true },
    story: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

export const Plot =
  (mongoose.models.Plot as mongoose.Model<{ title?: string; story: string }>) ||
  mongoose.model("Plot", PlotSchema);

