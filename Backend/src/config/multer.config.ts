import multer from "multer";
import path from "path";

// Multer config
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, path.join(__dirname, 'public/images'));
    },
    filename: (req, file, callback) => {
        callback(null, file.fieldname);
    }
});
const upload = multer({ storage: storage });

export default upload;