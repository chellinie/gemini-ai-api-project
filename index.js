const { GoogleGenerativeAI } = require( '@google/generative-ai' );
const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const fs = require('fs');
const path = require('path');

const genAI = new GoogleGenerativeAI( process.env.Gemini_API_KEY );
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

app.post("/generate-text", async (req, res) => {
    try {
        const { prompt } = req.body;
        
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();
        
        res.status(200).json({ output: text });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "An error occurred while generating text" });
    
    }
    
})

const imageGenerativePart = (filePath, mimeType) => ({
    inlineData : {
        data : fs.readFileSync(filePath).toString('base64'),
        mimeType: mimeType
        }
})

app.post('/generate-from-image', upload.single('image'), async (req, res) => {
    try {
        const { prompt } = req.body;
        const image = imageGenerativePart(req.file.path, 'image/png')

        const result = await model.generateContent([prompt, image])
        const response = result.response;
        const text = response.text();

        res.status(200).json({ output: text });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "An error occurred while generating text" });
    } finally {
        fs.unlinkSync(req.file.path);
    }

})

app.post("/generate-from-document", upload.single('document'), async (req, res) => {
    try {
        const filePath = req.file.path;
        const mimeType = req.file.mimetype;
        const document = imageGenerativePart(filePath, mimeType);
        const result = await model.generateContent(['Analyze this document: ', document])
        const response = result.response;
        const text = response.text();

        res.status(200).json({ output: text });

    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "An error occurred while generating from document" });

    } finally {
        fs.unlinkSync(req.file.path);
    }

})

app.post("/generate-from-audio", upload.single('audio'), async (req, res) => {
    try {
        const filePath = req.file.path;
        const mimeType = req.file.mimetype;
        const audio = imageGenerativePart(filePath, mimeType);
        const result = await model.generateContent(['Analyze this audio: ', audio])
        const response = result.response;
        const text = response.text();

        res.status(200).json({ output: text });

    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "An error occurred while generating from audio" });

    } finally {
        fs.unlinkSync(req.file.path);
    }

})

app.listen(port, () => {
  console.log(`Gemini API server is running at http://localhost:${port}`);
});
