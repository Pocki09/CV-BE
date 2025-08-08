import { Router } from "express";
import * as companyController from "../controllers/company.controller";
import * as companyValidate from "../validates/company.validate";
import * as authMiddleware from "../middlewares/auth.middleware";
import multer from "multer";
import { storage } from "../helpers/cloudinary.helper";

const router = Router();

const upload = multer({
  storage: storage,
});

router.post(
  '/register', 
  companyValidate.registerPost,
  companyController.registerPost
);

router.post(
  '/login',
  companyValidate.loginPost,
  companyController.loginPost
);

router.patch(
  '/profile',
  authMiddleware.verifyTokenCompany,
  upload.single('avatar'),
  companyController.profilePatch
);

export default router;