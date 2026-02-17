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
    // Wywołanie OpenRouter
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

    // OpenRouter free tier czasem zwraca "choices", czasem [0].generated_text
    let resultText = "";
    if (data.choices && data.choices[0].message) {
      resultText = data.choices[0].message.content;
    } else if (Array.isArray(data) && data[0]?.generated_text) {
      resultText = data[0].generated_text;
    } else {
      resultText = "Brak odpowiedzi z AI";
    }

    res.status(200).json({ result: resultText });

  } catch (error) {
    console.error("Błąd API:", error);
    res.status(500).json({ error: "Błąd serwera" });
  }
}
