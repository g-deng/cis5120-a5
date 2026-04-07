const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdfParse = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const pool = require('../db');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// POST /api/projects/:id/parse-pdf
router.post('/:id/parse-pdf', upload.single('pdf'), async (req, res) => {
  const client = await pool.connect();

  try {
    // Validate file
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    // Validate project exists
    const projectResult = await client.query(
      'SELECT * FROM projects WHERE id = $1',
      [req.params.id]
    );
    if (projectResult.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Extract text from PDF
    const pdfData = await pdfParse(req.file.buffer);
    const pdfText = pdfData.text;

    // Send extracted text to Gemini for structuring
    console.log('--- PDF Text Length:', pdfText.length, 'characters ---');
    console.log('--- PDF Text Preview (first 500 chars) ---');
    console.log(pdfText.substring(0, 500));
    console.log('--- End Preview ---');

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const response = await model.generateContent([
      {
        text: `You are parsing a knitting/crochet pattern. Here is the text extracted from the PDF:\n\n${pdfText}\n\nExtract the following as JSON:
{
  "total_yards": <number or null>,
  "total_rows": <number>,
  "sections": [
    {
      "title": "<section name>",
      "position": <1-based>,
      "rows": [
        {
          "row_number": <number>,
          "instruction": "<full instruction text>",
          "position": <global 1-based position across entire pattern>
        }
      ]
    }
  ]
}
Return ONLY valid JSON, no markdown fences, no explanation. If you are unsure about any of the fields, DO NOT RETURN NULL and estimate the value based on the text.`,
      },
    ]);

    // Parse Gemini's response
    let parsed;
    let responseText = response.response.text().trim();
    // Strip markdown fences if present
    if (responseText.startsWith('```')) {
      responseText = responseText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }
    parsed = JSON.parse(responseText);

    // Write to database in a transaction
    await client.query('BEGIN');

    // Update project with totals
    await client.query(
      'UPDATE projects SET total_yards = $1, total_rows = $2 WHERE id = $3',
      [parsed.total_yards, parsed.total_rows, req.params.id]
    );

    // Insert sections and rows
    for (const section of parsed.sections) {
      const sectionResult = await client.query(
        'INSERT INTO sections (project_id, title, position) VALUES ($1, $2, $3) RETURNING id',
        [req.params.id, section.title, section.position]
      );
      const sectionId = sectionResult.rows[0].id;

      for (const row of section.rows) {
        await client.query(
          'INSERT INTO rows (section_id, row_number, instruction, position) VALUES ($1, $2, $3, $4)',
          [sectionId, row.row_number, row.instruction, row.position]
        );
      }
    }

    await client.query('COMMIT');
    res.json(parsed);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;
