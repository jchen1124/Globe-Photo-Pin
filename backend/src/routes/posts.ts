import {Router} from 'express';
import multer from 'multer';

const router = Router();

// Temp storage
const upload = multer({ dest: "uploads/" });


router.post("/", upload.single("image"), (req, res) => {
  const { description, date, latitude, longitude } = req.body;
  const image = req.file;

  console.log("📍 Location:", latitude, longitude);
  console.log("📝 Description:", description);
  console.log("📸 Image:", image?.filename);

  res.status(201).json({
    message: "Post received suåccessfully",
  });
});

export default router;