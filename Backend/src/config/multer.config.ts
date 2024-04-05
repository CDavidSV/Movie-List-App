import multer from "multer";

// Multer config
const createMulterInstance = (limit: number) => {
    const storage = multer.memoryStorage();
    return multer({
        storage: storage,
        limits: {
            fileSize: limit * 1024 * 1024,
        },
    });
};

export default createMulterInstance;