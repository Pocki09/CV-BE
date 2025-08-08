import { Request, Response } from 'express';
import AccountUser from '../models/account-user.model';
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AccountRequest } from '../interfaces/request.interface';

export const registerPost = async (req: Request, res: Response) => {
  const { fullName, email, password } = req.body;

  const existAccount = await AccountUser.findOne({
    email: email
  });

  if(existAccount) {
    res.json({
      code: "error",
      message: "Email đã tồn tại trong hệ thống!"
    });
    return;
  }

  // Mã hóa mật khẩu với bcrypt
  const salt = await bcrypt.genSalt(10); // Tạo salt - Chuỗi ngẫu nhiên có 10 ký tự
  const hashedPassword = await bcrypt.hash(password, salt); // Mã hóa mật khẩu

  const newAccount = new AccountUser({
    fullName: fullName,
    email: email,
    password: hashedPassword
  });

  await newAccount.save();

  res.json({
    code: "success",
    message: "Đăng ký tài khoản thành công!"
  })
}

export const loginPost = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Kiểm tra xem email có tồn tại không
  const existAccount = await AccountUser.findOne({
    email: email
  });

  if(!existAccount) {
    res.json({
      code: "error",
      message: "Email không tồn tại trong hệ thống!"
    });
    return;
  }

  // Kiểm tra mật khẩu
  const isPasswordValid = await bcrypt.compare(password, `${existAccount.password}`);
  if (!isPasswordValid) {
    res.json({
      code: "error",
      message: "Mật khẩu không đúng!"
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
    { expiresIn: '1d' } // Token có thời hạn 1 ngày
  );

  // Lưu token vào cookie
  res.cookie("token", token, {
    maxAge: 24 * 60 * 60 * 1000, // Token có hiệu lực trong 1 ngày
    httpOnly: true, // Chỉ cho phép cookie được truy cập bởi server
    sameSite: "lax", // Cho phép gửi cookie giữa các tên miền
    secure: process.env.NODE_ENV === "production" // true: web có https, false: web không có https
  });

  res.json({
    code: "success",
    message: "Đăng nhập thành công!",
  });
}

export const profilePatch = async (req: AccountRequest, res: Response) => {
  if(req.file) {
    req.body.avatar = req.file.path;
  } else {
    delete req.body.avatar;
  }

  await AccountUser.updateOne({
    _id: req.account.id
  }, req.body);
  
  res.json({
    code: "success",
    message: "Cập nhật thành công!"
  });
}