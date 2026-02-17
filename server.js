import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.post("/verify", async (req, res) => {
    const question = req.body.question;

    try {
        const response = await fetch(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "openrouter/free",
                    messages: [
                        {
                            role: "system",
                            content: `
Jesteś ekspertem medycyny opartej na dowodach (EBM).
Odpowiedz w formacie:

WERDYKT: PRAWDA lub FAŁSZ
PRAWDOPODOBIEŃSTWO MITU: procent
WYJAŚNIENIE:
ŹRÓDŁA: podaj linki do WHO, CDC, PubMed, Cochrane
                            `
                        },
                        {
                            role: "user",
                            content: question
                        }
                    ],
                    temperature: 0.2
                })
            }
        );

        const data = await response.json();

        if (data.choices) {
            res.json({
                result: data.choices[0].message.content
            });
        } else {
            res.status(500).json({ error: "Brak odpowiedzi z AI" });
        }

    } catch (error) {
        res.status(500).json({ error: "Błąd serwera" });
    }
});

app.listen(PORT, () => {
    console.log(`Serwer działa: http://localhost:${PORT}`);
});
