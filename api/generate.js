export default async function handler(req, res) {
  // Solo permitimos peticiones POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { prompt } = req.body;
  const MISTRAL_KEY = process.env.MISTRAL_KEY; // Esto se configura en Vercel

  try {
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MISTRAL_KEY}`
      },
      body: JSON.stringify({
        model: "open-mistral-7b",
        messages: [
          { role: "system", content: "Eres el generador de palabras del juego El Impostor. Solo respondes en formato JSON puro." },
          { role: "user", content: prompt }
        ],
        temperature: 0.9,
        response_format: { type: "json_object" } 
      })
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("Error en servidor:", error);
    res.status(500).json({ error: "Error conectando con Mistral" });
  }
}