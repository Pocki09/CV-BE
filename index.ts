import express from 'express';
import cors from "cors";
import routes from "./routes/index.route";
import dotenv from "dotenv";
import { connectDB } from './config/database';
import cookieParser from 'cookie-parser';

const app = express();
const port = 4000;

// Load biến môi trường từ .env
dotenv.config();

// Kết nối đến MongoDB
connectDB();

// Cấu hình CORS
app.use(cors({
  origin: "http://localhost:3000", // Phải chỉ định 1 tên miền cụ thể,
  credentials: true, // Cho phép gửi cookie
  methods: ["GET", "POST", "PATCH", "DELETE"], // Các phương thức được phép
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Cho phép gửi data lên dạng json
app.use(express.json());

// Cấu hình lấy được cookie
app.use(cookieParser());

// Thiết lập đường dẫn
app.use("/", routes);

app.listen(port, () => {
  console.log(`Website đang chạy trên cổng ${port}`);
});