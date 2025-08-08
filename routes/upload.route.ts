import { Router } from "express";
import multer from "multer";
import * as uploadController from "../controllers/upload.controller";
import { storage } from "../helpers/cloudinary.helper";

const router = Router();

const upload = multer({
    storage: storage
})

router.post(
    '/image',
    upload.single("file"),
    uploadController.imagePost
)

export default router;