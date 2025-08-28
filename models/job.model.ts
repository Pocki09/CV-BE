import e from "express";
import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    companyId: String,
    title: String,
    salaryMin: Number,
    salaryMax: Number,
    position: String,
    workingForm: String,
    technologies: Array,
    description: String,
    images: Array,
  },
  { timestamps: true }
);

const job = mongoose.model("job", schema, "jobs");
export default job;