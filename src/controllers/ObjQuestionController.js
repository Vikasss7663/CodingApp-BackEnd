import express from 'express';
import { child, query, orderByChild, equalTo, get, set, update, remove } from "firebase/database";
import { dbRef } from '../../config/firebase-config.js';
import { join, dirname } from 'path';
import ObjQuestionModel from '../models/ObjQuestionModel.js';

const objQuestionRef = child(dbRef, 'ObjQuestions');
const router = express.Router();
const currPath = dirname(new URL(import.meta.url).pathname);

const defaultObjQuestionModel = new ObjQuestionModel();

router.get('/view', async (req, res) => {
    const filePath = join(currPath, "../views/obj_question.ejs");
    try {
        let snapshot = await get(objQuestionRef);
  
        if (snapshot.exists()) {
            let objQuestionData = Object.values(snapshot.val());
  
            if (req.query.search !== undefined) {
              // Search based on problemTitle
              const searchPattern = req.query.search.toLowerCase();
              objQuestionData = objQuestionData.filter(item =>
                item.question.toLowerCase().includes(searchPattern)
              );
            }
            
            if(req.query.tag !== undefined) {
                // Filter based on problemTags
              const tagPattern = req.query.tag.toLowerCase();
              objQuestionData = objQuestionData.filter(item =>
                item.questionTags.toLowerCase().includes(tagPattern)
              );
            }
  
            res.render(filePath, { objQuestions: objQuestionData, search: req.query.search });
        } else {
            res.render(filePath, { objQuestions: defaultObjQuestionModel, search: req.query.search });
        }
    } catch (error) {
        console.error('Error occurred:', error);
        res.send(error);
    } finally {
        res.end();
    }
});

router.get('/all', async (req, res) => {
    try {
        const snapshot = await get(objQuestionRef);

        if (snapshot.exists()) {
            const objQuestionData = snapshot.val();
            res.send(objQuestionData);
        } else {
            res.send([]);
        }
    } catch (error) {
        console.error('Error occurred:', error);
        res.send(error);
    } finally {
        res.end();
    }
});

router.get('/create',(req,res) => {
    const filePath = join(currPath, "../views/form/form_obj_question.ejs");
    res.render(filePath, {obj: defaultObjQuestionModel});
});

router.get('/create/:questionId', async (req, res) => {
    const filePath = join(currPath, "../views/form/form_obj_question.ejs");
    try {
        const questionId = req.params.questionId;
        const dataRef = child(objQuestionRef, questionId);
        const snapshot = await get(dataRef);

        if (snapshot.exists()) {
            const objQuestionData = snapshot.val();
            res.render(filePath, { obj: objQuestionData });
        } else {
            res.render(filePath, { obj: defaultObjQuestionModel });
        }
    } catch (error) {
        console.error("Some error occurred", error);
        res.send(null);
    } finally {
        res.end();
    }
});

router.post('/create', (req, res) => {
    const filePath = join(currPath, '../views/form/form_obj_question.ejs');
    const questionId = req.body.questionid;
    const type = req.body.submit;

    console.log(req.body);

    const objQuestionModel = {
        questionId: Number(questionId),
        question: req.body.question,
        optionA: req.body.optiona,
        optionB: req.body.optionb,
        optionC: req.body.optionc,
        optionD: req.body.optiond,
        answer: req.body.answer,
        explanation: req.body.explanation,
        questionTags: req.body.tag,
    };

    const dataRef = child(objQuestionRef, questionId);

    if (type === 'update') {
        // Update existing problem
        update(dataRef, objQuestionModel).then(() => {
            res.render(filePath, { obj: objQuestionModel });
        }).catch((err) => {
            console.log("Some error occurred", err);
            res.render(filePath, { obj: defaultObjQuestionModel });
        });
    } else if (type === 'delete') {
        // Delete existing problem
        remove(dataRef).then(() => {
            res.render(filePath, { obj: objQuestionModel });
        }).catch((err) => {
            console.log("Some error occurred", err);
            res.render(filePath, { obj: defaultObjQuestionModel });
        });
    } else {
        // Insert new problem
        set(dataRef, objQuestionModel).then(() => {
            res.render(filePath, { obj: objQuestionModel });
        }).catch((err) => {
            console.log("Some error occurred", err);
            res.render(filePath, { obj: defaultObjQuestionModel });
        });
    }
});

export default router;
