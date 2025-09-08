import { Request, Response } from "express";
import job from "../models/job.model";
import AccountCompany from "../models/account-company.model";
import City from "../models/city.model";

export const search = async (req: Request, res: Response) => {
  const dataFinal = [];
  let totalPage = 1;

  if (Object.keys(req.query).length > 0) {
    const find: any = {};

    if (req.query.language) {
      find.technologies = req.query.language;
    }

    if (req.query.city) {
      const city = await City.findOne({
        name: req.query.city,
      });

      if (city) {
        const listAccountCompanyInCity = await AccountCompany.find({
          city: city.id,
        });
        const listIdAccountCompany = listAccountCompanyInCity.map(
          (item) => item.id
        );
        find.companyId = { $in: listIdAccountCompany };
      }
    }

    if (req.query.company) {
      const accountCompany = await AccountCompany.findOne({
        companyName: req.query.company,
      });
      find.companyId = accountCompany?.id;
    }

    if (req.query.keyword) {
      const keywordRegex = new RegExp(`${req.query.keyword}`, "i"); // 'i' for case-insensitive
      find.title = keywordRegex;
    }

    if (req.query.position) {
      find.position = req.query.position;
    }

    if (req.query.workingForm) {
      find.workingForm = req.query.workingForm;
    }

    const limitItems = 2;
    let page = 1;
    if (req.query.page) {
      const currentPage = parseInt(`${req.query.page}`);
      if (currentPage > 0) {
        page = currentPage;
      }
    }
    const totalRecord = await job.countDocuments(find);
    totalPage = Math.ceil(totalRecord / limitItems);
    if (page > totalPage) {
      page = 1;
    }
    const skip = (page - 1) * limitItems;

    const jobs = await job
      .find(find)
      .sort({
        createAt: "desc",
      })
      .limit(limitItems)
      .skip(skip);

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
    jobs: dataFinal,
    totalPage: totalPage
  });
};
