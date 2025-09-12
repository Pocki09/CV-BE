import { Request, Response } from "express";
import job from "../models/job.model";
import AccountCompany from "../models/account-company.model";
import CV from "../models/cv.model";

export const detail = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    const record = await job.findOne({
      _id: id,
    });

    if (!record) {
      res.json({
        code: "error",
        message: "Thất bại!",
      });
      return;
    }

    const jobDetail = {
      id: record.id,
      title: record.title,
      companyName: "",
      salaryMin: record.salaryMin,
      salaryMax: record.salaryMax,
      images: record.images,
      position: record.position,
      workingForm: record.workingForm,
      companyAddress: "",
      technologies: record.technologies,
      description: record.description,
      companyLogo: "",
      companyId: record.companyId,
      companyModel: "",
      companyEmployees: "",
      companyWorkingTime: "",
      companyWorkOvertime: "",
    };

    const infoCompany = await AccountCompany.findOne({
      _id: record.companyId,
    });

    if (infoCompany) {
      jobDetail.companyName = `${infoCompany.companyName}`;
      jobDetail.companyAddress = `${infoCompany.address}`;
      jobDetail.companyLogo = `${infoCompany.logo}`;
      jobDetail.companyModel = `${infoCompany.companyModel}`;
      jobDetail.companyEmployees = `${infoCompany.get("companyEmployees")}`;
      jobDetail.companyWorkingTime = `${infoCompany.workingTime}`;
      jobDetail.companyWorkOvertime = `${infoCompany.workingOverTime}`;
    }

    res.json({
      code: "success",
      message: "Thành công!",
      jobDetail: jobDetail,
    });
  } catch (error) {
    res.json({
      code: "error",
      message: "Thất bại!",
    });
  }
};

export const applyPost = async (req: Request, res: Response) => {
  if (!req.file) {
    res.json({
      code: "error",
      message: "Vui lòng gửi kèm file CV!",
    });
    return;
  }

  req.body.fileCV = req.file.path;

  const newRecord = new CV(req.body);
  await newRecord.save();

  res.json({
    code: "success",
    message: "Đã gửi CV thành công!",
  });
}
