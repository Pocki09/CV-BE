import { Request, Response } from "express";
import job from "../models/job.model";
import AccountCompany from "../models/account-company.model";
import City from "../models/city.model";

export const search = async (req: Request, res: Response) => {
  const dataFinal = [];

  if (Object.keys(req.query).length > 0) {
    const find: any = {};

    if (req.query.language) {
      find.technologies = req.query.language;
    }

    const jobs = await job.find(find).sort({
      createAt: "desc",
    });

    for (const item of jobs) {
      const itemFinal = {
        id: item.id,
        companyLogo: "",
        title: item.title,
        companyName: "",
        salaryMin: item.salaryMin,
        salaryMax: item.salaryMax,
        position: item.position,
        workingForm: item.workingForm,
        cityName: "",
        technologies: item.technologies,
      };

      const infoCompany = await AccountCompany.findOne({
        _id: item.companyId,
      });

      if (infoCompany) {
        itemFinal.companyLogo = `${infoCompany.logo}`;
        itemFinal.companyName = `${infoCompany.companyName}`;

        const city = await City.findOne({
          _id: infoCompany.city,
        });
        itemFinal.cityName = `${city?.name}`;
      }

      dataFinal.push(itemFinal);
    }
  }

  res.json({
    code: "success",
    message: "Thành công!",
    jobs: dataFinal
  });
};
