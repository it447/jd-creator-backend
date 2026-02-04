export default async function handler(req, res) {
  // Allow only POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    // Get prompt from request
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "No prompt provided" });
    }

    // Call OpenAI
    const openaiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: prompt
      })
    });

    const data = await openaiResponse.json();

    // Safely extract text from ANY valid OpenAI response
    let text = "No text returned from OpenAI";

    if (typeof data.output_text === "string") {
      text = data.output_text;
    } else if (
      data.output &&
      Array.isArray(data.output) &&
      data.output[0]?.content &&
      Array.isArray(data.output[0].content)
    ) {
      for (const block of data.output[0].content) {
        if (block.type === "output_text" && block.text) {
          text = block.text;
          break;
        }
      }
    }

    // Return clean JSON
    return res.status(200).json({ text });

  } catch (error) {
    return res.status(500).json({
      error: "Backend error",
      details: error.message
    });
  }
}

