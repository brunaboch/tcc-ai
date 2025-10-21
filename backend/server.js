import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";

const app = express();
app.use(cors());
app.use(express.json());

const storage = multer.diskStorage({
    destination: function (req, file, cb){
        cb(null, "uploads/");
    },
    filename: function (req, file, cb){
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + "-" + uniqueSuffix + ext);
    }
});

const upload = multer({ storage: storage});

import fs from "fs";
if(!fs.existsSync("uploads")){
    fs.mkdirSync("uploads");
}

app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

app.post("/upload", upload.single("image"), (req, res) => {
    if(!req.file){
        return res.status(400).json({ error: "Nenhum upload de arquivo!"});
    }

    res.json({
        message: "Upload concluído com sucesso!",
        filename: req.file.filename,
        path: req.file.path
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});