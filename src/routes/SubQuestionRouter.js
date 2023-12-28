import express from 'express';
import SubQuestionController from '../controllers/SubQuestionController.js';

const router = express.Router();

router.use('', SubQuestionController);

export default router;
