export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "No prompt provided" });
    }

    const openaiResponse = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4.1-mini",
          input: prompt
        })
      }
    );

    const data = await openaiResponse.json();

    // 🚨 SHOW OPENAI ERRORS CLEARLY
    if (data.error) {
      return res.status(500).json({
        error: "OpenAI error",
        details: data.error.message || JSON.stringify(data.error)
      });
    }

    let text = null;

    if (typeof data.output_text === "string") {
      text = data.output_text;
    } else if (
      data.output &&
      Array.isArray(data.output) &&
      data.output[0]?.content
    ) {
      for (const block of data.output[0].content) {
        if (block.type === "output_text" && block.text) {
          text = block.text;
          break;
        }
      }
    }

    if (!text) {
      return res.status(500).json({
        error: "No text found",
        raw: JSON.stringify(data)
      });
    }

    return res.status(200).json({ text });

  } catch (err) {
    return res.status(500).json({
      error: "Backend crash",
      details: err.message
    });
  }
}

