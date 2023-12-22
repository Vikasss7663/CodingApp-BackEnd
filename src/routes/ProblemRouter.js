import express from 'express';
import ProblemController from '../controllers/ProblemController.js';

const router = express.Router();

router.use('/', ProblemController);

export default router;
