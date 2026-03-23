import mongoose from "mongoose";

const PlotSchema = new mongoose.Schema(
  {
    story: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

export const Plot =
  (mongoose.models.Plot as mongoose.Model<{ story: string }>) ||
  mongoose.model("Plot", PlotSchema);

