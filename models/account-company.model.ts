import { any } from "joi";
import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    companyName: String,
    email: String,
    password: String,
    city: String,
    address: String,
    companyModel: String,
    workingTime: String,
    workingOverTime: String,
    phone: String,
    description: String,
    logo: String,
    companyEmployees: any,
    workOvertime: any,
  },
  {
    timestamps: true, // Tự động sinh ra trường createdAt và updatedAt
  }
);

const AccountCompany = mongoose.model('AccountCompany', schema, "accounts-company");

export default AccountCompany;