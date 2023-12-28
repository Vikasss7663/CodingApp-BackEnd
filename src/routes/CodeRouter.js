import express from 'express';
import CodeController from '../controllers/CodeController.js';

const router = express.Router();

router.use('', CodeController);

export default router;
