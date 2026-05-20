export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');

  const { prompt } = req.body;
  // Usamos la variable de entorno que configuraste en Vercel
  const API_KEY = process.env.MISTRAL_KEY; 

  try {
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: "open-mistral-7b",
        messages: [
          { role: "system", content: "Eres el generador de palabras del juego El Impostor. Responde solo en JSON puro." },
          { role: "user", content: prompt }
        ],
        temperature: 0.9,
        response_format: { type: "json_object" }
      })
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Error en la conexión con Mistral" });
  }
}