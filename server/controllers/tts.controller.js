const deepseekService = require("../config/deepseek.config");

const generateTTS = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    const audioBuffer = await deepseekService.generateTTS(text);

    res.setHeader("Content-Type", "audio/mpeg");
    res.send(audioBuffer);
  } catch (error) {
    console.error("TTS generation error:", error);
    res.status(500).json({ error: "Failed to generate TTS audio" });
  }
};

module.exports = {
  generateTTS,
};
