import express from 'express';
import CompilerController from '../controllers/CompilerController.js';

const router = express.Router();

router.use('', CompilerController);

export default router;
