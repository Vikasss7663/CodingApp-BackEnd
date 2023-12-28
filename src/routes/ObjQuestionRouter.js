import express from 'express';
import ObjQuestionController from '../controllers/ObjQuestionController.js';

const router = express.Router();

router.use('', ObjQuestionController);

export default router;
