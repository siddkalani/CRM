const express = require('express');
const router = express.Router();
const multer = require('multer');
const speech = require('@google-cloud/speech');

const upload = multer();
const client = new speech.SpeechClient({ keyFilename: './google-credentials.json' });

router.post('/speech-to-text', upload.single('audio'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No audio file provided' });
  }

  const audioBytes = req.file.buffer.toString('base64');

  const request = {
    audio: { content: audioBytes },
    config: {
      encoding: 'LINEAR16', // WAV format uses LINEAR16 encoding
      sampleRateHertz: 44100,
      languageCode: 'en-US',
    },
  };

  try {
    const [response] = await client.recognize(request);
    const transcription = response.results
      .map(result => result.alternatives[0].transcript)
      .join('\n');

    res.json({ transcription });
  } catch (err) {
    console.error('Speech-to-Text Error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
