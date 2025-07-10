import multer from "multer";
import path from 'path'

const storage = multer.diskStorage({
    destination: (req, res, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + "-" + file.originalname
        cb(null, uniqueName)
    }
})

const fileFilter = (req, file, cb) => {
    const allowed = '/png/jpeg/jpg'
    const isImage = allowed.test(path.extname(file.originalname).toLowerCase())
    if (isImage) cb(null, true);
    else cb(new Error("Only images are allowed!"));
}

const upload=({storage,fileFilter})

export default upload