import express from 'express';
import { child, query, orderByChild, equalTo, get, set, update, remove } from "firebase/database";
import { dbRef } from '../../config/firebase-config.js';
import { join, dirname } from 'path';
import SubQuestionModel from '../models/SubQuestionModel.js';

const subQuestionRef = child(dbRef, 'SubQuestions');
const router = express.Router();
const currPath = dirname(new URL(import.meta.url).pathname);

const defaultSubQuestionModel = new SubQuestionModel();

router.get('/view', async (req, res) => {
    const filePath = join(currPath, "../views/sub_question.ejs");
    try {
        let snapshot = await get(subQuestionRef);
  
        if (snapshot.exists()) {
            let subQuestionData = Object.values(snapshot.val());
            console.log(subQuestionData);
  
            if (req.query.search !== undefined) {
              // Search based on problemTitle
              const searchPattern = req.query.search.toLowerCase();
              subQuestionData = subQuestionData.filter(item =>
                item.question.toLowerCase().includes(searchPattern)
              );
            }
            
            if(req.query.tag !== undefined) {
                // Filter based on problemTags
              const tagPattern = req.query.tag.toLowerCase();
              subQuestionData = subQuestionData.filter(item =>
                item.questionTags.toLowerCase().includes(tagPattern)
              );
            }
  
            res.render(filePath, { subQuestions: subQuestionData, search: req.query.search });
        } else {
            res.render(filePath, { subQuestions: defaultSubQuestionModel, search: req.query.search });
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
      const snapshot = await get(subQuestionRef);

      if (snapshot.exists()) {
          const subQuestionData = snapshot.val();
          res.send(subQuestionData);
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
  const filePath = join(currPath, "../views/form/form_sub_question.ejs");
  res.render(filePath, {obj: defaultSubQuestionModel});
});

router.get('/create/:questionId', async (req, res) => {
  const filePath = join(currPath, "../views/form/form_sub_question.ejs");
  try {
      const questionId = req.params.questionId;
      const dataRef = child(subQuestionRef, questionId);
      const snapshot = await get(dataRef);

      if (snapshot.exists()) {
          const subQuestionData = snapshot.val();
          res.render(filePath, { obj: subQuestionData });
      } else {
          res.render(filePath, { obj: defaultSubQuestionModel });
      }
  } catch (error) {
      console.error("Some error occurred", error);
      res.send(null);
  } finally {
      res.end();
  }
});

router.post('/create', (req, res) => {
  const filePath = join(currPath, '../views/form/form_sub_question.ejs');
  const questionId = req.body.questionid;
  const type = req.body.submit;

  console.log(req.body);

  const subQuestionModel = {
    questionId: Number(questionId),
    question: req.body.question,
    answer: req.body.answer,
    questionTags: req.body.tag,
  };

  const dataRef = child(subQuestionRef, questionId);

  if (type === 'update') {
    // Update existing problem
    update(dataRef, subQuestionModel).then(() => {
        res.render(filePath, { obj: subQuestionModel });
    }).catch((err) => {
        console.log("Some error occurred", err);
        res.render(filePath, { obj: defaultSubQuestionModel });
    });
} else if (type === 'delete') {
    // Delete existing problem
    remove(dataRef).then(() => {
        res.render(filePath, { obj: subQuestionModel });
    }).catch((err) => {
        console.log("Some error occurred", err);
        res.render(filePath, { obj: defaultSubQuestionModel });
    });
} else {
    // Insert new problem
    set(dataRef, subQuestionModel).then(() => {
        res.render(filePath, { obj: subQuestionModel });
    }).catch((err) => {
        console.log("Some error occurred", err);
        res.render(filePath, { obj: defaultSubQuestionModel });
    });
}
});

export default router;
