import fetch from "node-fetch";

export default async function handler(req, res) {
  // Akceptujemy tylko POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { question } = req.body;
  if (!question || question.trim() === "") {
    return res.status(400).json({ error: "Brak pytania" });
  }

  try {
    // Wywołanie OpenRouter z kluczem z Vercel
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

    // obsługa różnych formatów odpowiedzi free tier
    let resultText = "";
    if (data.choices?.[0]?.message?.content) {
      resultText = data.choices[0].message.content;
    } else if (Array.isArray(data) && data[0]?.generated_text) {
      resultText = data[0].generated_text;
    } else if (data.output_text) {
      resultText = data.output_text;
    } else {
      resultText = "Brak odpowiedzi z AI";
      console.log("Odpowiedź OpenRouter:", JSON.stringify(data, null, 2));
    }

    res.status(200).json({ result: resultText });

  } catch (err) {
    console.error("Błąd API:", err);
    res.status(500).json({ error: "Błąd serwera" });
  }
}
