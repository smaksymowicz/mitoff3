import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { question } = req.body;
  if (!question) return res.status(400).json({ error: "Brak pytania" });

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
            { role: "system", content: "Jesteś ekspertem EBM. Odpowiedz w formacie WERDYKT, PRAWDOPODOBIEŃSTWO, WYJAŚNIENIE, ŹRÓDŁA" },
            { role: "user", content: question }
          ],
          temperature: 0.2
        })
      }
    );

    const data = await response.json();
    let resultText = data.choices?.[0]?.message?.content || "Brak odpowiedzi";
    res.status(200).json({ result: resultText });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Błąd serwera" });
  }
}
