import { Request, Response } from "express";
import AccountCompany from "../models/account-company.model";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AccountRequest } from "../interfaces/request.interface";
import job from "../models/job.model";
import City from "../models/city.model";

export const registerPost = async (req: Request, res: Response) => {
  const { companyName, email, password } = req.body;

  const existAccount = await AccountCompany.findOne({
    email: email,
  });

  if (existAccount) {
    res.json({
      code: "error",
      message: "Email đã tồn tại trong hệ thống!",
    });
    return;
  }

  // Mã hóa mật khẩu với bcrypt
  const salt = await bcrypt.genSalt(10); // Tạo salt - Chuỗi ngẫu nhiên có 10 ký tự
  const hashedPassword = await bcrypt.hash(password, salt); // Mã hóa mật khẩu

  const newAccount = new AccountCompany({
    companyName: companyName,
    email: email,
    password: hashedPassword,
  });

  await newAccount.save();

  res.json({
    code: "success",
    message: "Đăng ký tài khoản thành công!",
  });
};

export const loginPost = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Kiểm tra xem email có tồn tại không
  const existAccount = await AccountCompany.findOne({
    email: email,
  });

  if (!existAccount) {
    res.json({
      code: "error",
      message: "Email không tồn tại trong hệ thống!",
    });
    return;
  }

  // Kiểm tra mật khẩu
  const isPasswordValid = await bcrypt.compare(
    password,
    `${existAccount.password}`
  );
  if (!isPasswordValid) {
    res.json({
      code: "error",
      message: "Mật khẩu không đúng!",
    });
    return;
  }

  // Tạo JWT
  const token = jwt.sign(
    {
      id: existAccount.id,
      email: existAccount.email,
    },
    `${process.env.JWT_SECRET}`,
    { expiresIn: "1d" } // Token có thời hạn 1 ngày
  );

  // Lưu token vào cookie
  res.cookie("token", token, {
    maxAge: 24 * 60 * 60 * 1000, // Token có hiệu lực trong 1 ngày
    httpOnly: true, // Chỉ cho phép cookie được truy cập bởi server
    secure: process.env.NODE_ENV === "production", // true nếu môi trường production, false nếu môi trường development
    sameSite: "lax", // Cho phép gửi cookie giữa các domain
  });

  res.json({
    code: "success",
    message: "Đăng nhập thành công!",
  });
};

export const profilePatch = async (req: AccountRequest, res: Response) => {
  if (req.file) {
    req.body.logo = req.file.path; // Lưu đường dẫn ảnh vào body
  } else {
    delete req.body.logo; // Xóa logo nếu không có ảnh
  }

  await AccountCompany.updateOne(
    {
      _id: req.account.id, // Sử dụng id của tài khoản đã xác thực
    },
    req.body // Cập nhật thông tin từ body
  );
  res.json({
    code: "success",
    message: "Cập nhật thông tin thành công!",
  });
};

export const createJobPost = async (req: AccountRequest, res: Response) => {
  req.body.companyId = req.account.id;
  req.body.salaryMin = req.body.salaryMin ? parseInt(req.body.salaryMin) : 0;
  req.body.salaryMax = req.body.salaryMax ? parseInt(req.body.salaryMax) : 0;
  req.body.technologies = req.body.technologies
    ? req.body.technologies.split(",")
    : [];
  req.body.images = [];

  if (req.files) {
    for (const file of req.files as any[]) {
      req.body.images.push(file.path);
    }
  }

  const newRecord = new job(req.body);
  await newRecord.save();

  res.json({
    code: "success",
    message: "Tạo công việc thành công!",
  });
};

export const listJob = async (req: AccountRequest, res: Response) => {
  const find = {
    companyId: req.account.id,
  };

  const limitItems = 2;
  let page = 1;
  if (req.query.page) {
    const currentPage = parseInt(`${req.query.page}`);
    if (currentPage > 0) {
      page = currentPage;
    }
  }

  const totalRecord = await job.countDocuments(find);
  const totalPages = Math.ceil(totalRecord / limitItems);
  const skip = (page - 1) * limitItems;

  const jobs = await job
    .find(find)
    .sort({
      createdAt: "desc",
    })
    .limit(limitItems)
    .skip(skip);

  const city = await City.findOne({
    _id: req.account.id,
  });

  const dataFinal = [];

  for (const item of jobs) {
    dataFinal.push({
      id: item.id,
      companyLogo: req.account.logo,
      title: item.title,
      companyName: req.account.companyName,
      salaryMin: item.salaryMin,
      salaryMax: item.salaryMax,
      position: item.position,
      workingForm: item.workingForm,
      companyCity: city?.name,
      technologies: item.technologies,
    });
  }

  res.json({
    code: "success",
    message: "Lấy danh sách công việc thành công!",
    jobs: dataFinal,
    totalPages: totalPages,
  });
};

export const editJob = async (req: AccountRequest, res: Response) => {
  try {
    const id = req.params.id;

    const jobDetail = await job.findOne({
      _id: id,
      companyId: req.account.id,
    });

    if (!jobDetail) {
      res.json({
        code: "error",
        message: "Id không hợp lệ!",
      });
      return;
    }

    res.json({
      code: "success",
      message: "Thành công!",
      jobDetail: jobDetail,
    });
  } catch (error) {
    res.json({
      code: "error",
      message: "Id không hợp lệ!",
    });
  }
};

export const editJobPatch = async (req: AccountRequest, res: Response) => {
  try {
    const id = req.params.id;
    req.body.salaryMin = req.body.salaryMin ? parseInt(req.body.salaryMin) : 0;
    req.body.salaryMax = req.body.salaryMax ? parseInt(req.body.salaryMax) : 0;
    req.body.technologies = req.body.technologies
      ? req.body.technologies.split(", ")
      : [];
    req.body.images = [];

    if (req.files) {
      for (const file of req.files as any[]) {
        req.body.images.push(file.path);
      }
    }

    await job.updateOne(
      {
        _id: id,
        companyId: req.account.id,
      },
      req.body
    );

    res.json({
      code: "success",
      message: "Cập nhật công việc thành công!",
    });
  } catch (error) {
    res.json({
      code: "error",
      message: "Id không hợp lệ!",
    });
  }
};

export const deleteJobDel = async (req: AccountRequest, res: Response) => {
  try {
    const id = req.params.id;

    await job.deleteOne({
      _id: id,
      companyId: req.account.id,
    });

    res.json({
      code: "success",
      message: "Xóa công việc thành công!",
    });
  } catch (error) {
    res.json({
      code: "error",
      message: "Id không hợp lệ!",
    });
  }
};

export const list = async (req: Request, res: Response) => {
  let limitItems = 12;
  if (req.query.limitItems) {
    limitItems = parseInt(`${req.query.limitItems}`);
  }

  const companyList = await AccountCompany.find({}).limit(limitItems);

  const companyListFinal = [];

  for(const item of companyList) {
    const dataItemFinal = {
      id: item.id,
      companyName: item.companyName,
      logo: item.logo,
      cityName: "",
      totalJob: 0
    }

    const city = await City.findOne({
      _id: item.city
    })
    dataItemFinal.cityName = `${city?.name}`;

    const totalJob = await job.countDocuments({
      companyId: item.id
    })
    dataItemFinal.totalJob = totalJob;

    companyListFinal.push(dataItemFinal);
  }

  res.json({
    code: "success",
    message: "Lấy danh sách công ty thành công!",
    companyList: companyListFinal
  })
}
