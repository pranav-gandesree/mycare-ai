// src/routes/tools.ts
import express from 'express';
import prisma from '../lib/prisma';

const router = express.Router();

// POST /tools - Create a new tool entry
router.post('/', async (req, res) => {
  try {
    const { questionId, mainQuestion, question, answer, type, options } = req.body;

    console.log('Received data:', {
      questionId, mainQuestion, question, answer, type, options
    })


    const newTool = await prisma.tools.create({
      data: {
        questionId,
        mainQuestion,
        question,
        answer,
        type,
        options,
      },
    });

    res.status(201).json(newTool);
  } catch (error) {
    console.error('Error creating tool:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /tools - Get all tool entries
router.get('/', async (_req, res) => {
  try {
    const tools = await prisma.tools.findMany();
    res.json(tools);
  } catch (error) {
    console.error('Error fetching tools:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
