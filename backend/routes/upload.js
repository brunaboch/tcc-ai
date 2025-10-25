import express from "express";
import multer from "multer";
import fs from "fs";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

//Config GPT
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

//Config pasta de uploads dos diagramas
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

//Config multer
//Faz o intermedio do upload das imagens
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = ["image/png", "image/jpeg", "image/jpg"];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Tipo de arquivo inválido. Envie PNG, JPG ou JPEG."));
    }
    cb(null, true);
  },
});

//Caminho do upload
router.post("/", upload.single("image"), async (req, res) => {
  console.log("Requisição recebida em /upload");

  try {
    if (!req.file) {
      console.log("Nenhum arquivo enviado");
      return res.status(400).json({ error: "Nenhuma imagem enviada." });
    }

    console.log("Arquivo recebido:", req.file.originalname);

    //Prompts: estudante e profissional
    const { promptType } = req.body;
    console.log("Tipo de prompt recebido:", promptType);

    let systemPrompt;
    switch (promptType) {
      case "estudante":
        systemPrompt = "Descreva e explique este diagrama conceitual de banco de dados, incluindo a explicação das representações visuais das entidades apresentadas na imagem, seus atributos e relacionamentos. Foque na interpretação do diagrama da imagem exclusivamente, não sendo necessário explicar o que é um diagrama conceitual de banco de dados. Use uma linguagem simples para que uma pessoa que não tem muito conhecimento sobrebanco de dados e/ou possui deficiência visual consiga entender.Não cloque nenhuma palavra em negrito ou itálico, de forma que o resultado saia com algum caracter especial escondido de forma que prejudique a leitura pelo leitor de tela.";
        break;
      case "profissional":
        systemPrompt = "Descreva e explique este diagrama conceitual de banco de dados. Foque na interpretação do diagrama da imagem exclusivamente, não sendo necessário explicar o que é um diagrama conceitual de banco de dados. Use uma linguagem técnica, própria para a área de banco de dados, voltada a um público com experiência na área e/ou deficiência visual. Não use # e * na resposta. Não coloque palavras em negrito.";
        break;
      default:
        systemPrompt = "Descreva o diagrama conceitual de banco de dados na imagem.";
    }

    //Converter o diagrama pra base64, API do GPT nao consegue acessar os arquivos em localhost
    const imageBase64 = fs.readFileSync(req.file.path, { encoding: "base64" });

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini", //modelo do gpt
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: systemPrompt },
            {
              type: "image_url",
              image_url: { url: `data:${req.file.mimetype};base64,${imageBase64}` },
            },
          ],
        },
      ],
    });

    const description = completion.choices[0].message.content;

    res.json({
      success: true,
      description,
    });
  } catch (error) {
    console.error("Erro ao processar imagem:", error);
    res.status(500).json({ error: "Erro ao gerar descrição da imagem." });
  }
});

export default router;
