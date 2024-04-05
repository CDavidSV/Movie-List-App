import multer from "multer";

// Multer config
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

export default upload;