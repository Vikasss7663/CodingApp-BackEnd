import express from 'express';
import { child, query, orderByChild, startAt, endAt, equalTo, get, set, update, remove } from "firebase/database";
import { dbRef } from '../../config/firebase-config.js';
import { join, dirname } from 'path';
import ProblemModel from "../models/ProblemModel.js";

const problemRef = child(dbRef, 'Problems');
const router = express.Router();
const currPath = dirname(new URL(import.meta.url).pathname);

const defaultProblemModel = new ProblemModel();

router.get('/problemByTag', async (req, res) => {
  try {
    
      const tag = "%" + req.query.tag + "%";

      // Create a query for filtering based on problemTags
      const tagQuery = query(problemRef, orderByChild('problemTags').startAt(tag).endAt(tag + "\uf8ff"));

      // Execute the query
      const snapshot = await get(tagQuery);

      if (snapshot.exists()) {
          const problemsData = snapshot.val();
          res.send(problemsData);
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

router.get('/public', async (req, res) => {
  const filePath = join(currPath, "../views/problem.ejs");
  try {
      let snapshot = await get(problemRef);

      if (snapshot.exists()) {
          let problemsData = Object.values(snapshot.val());

          if (req.query.search !== undefined) {
            // Search based on problemTitle
            const searchPattern = req.query.search.toLowerCase();
            problemsData = problemsData.filter(item =>
              item.problemTitle.toLowerCase().includes(searchPattern)
            );
          }
          
          if(req.query.tag !== undefined) {
              // Filter based on problemTags
            const tagPattern = req.query.tag.toLowerCase();
            problemsData = problemsData.filter(item =>
              item.problemTags.toLowerCase().includes(tagPattern)
            );
          }

          res.render(filePath, { problems: problemsData, search: req.query.search });
      } else {
          res.render(filePath, { problems: defaultProblemModel, search: req.query.search });
      }
  } catch (error) {
      console.error('Error occurred:', error);
      res.send(error);
  } finally {
      res.end();
  }
});

router.get('/allProblem', async (req, res) => {
  try {
      const snapshot = await get(problemRef);

      if (snapshot.exists()) {
          const problemsData = snapshot.val();
          res.send(problemsData);
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

router.get('/createProblem', (req, res) => {
  const filePath = join(currPath, "../views/form/form_problem.ejs");
  res.render(filePath, {obj: defaultProblemModel});
});

router.get('/createProblem/:problemId', async (req, res) => {
  const filePath = join(currPath, "../views/form/form_problem.ejs");
  try {
      const problemId = req.params.problemId;
      const dataRef = child(problemRef, problemId);
      const snapshot = await get(dataRef);

      if (snapshot.exists()) {
          const problemData = snapshot.val();
          res.render(filePath, { obj: problemData });
      } else {
          res.render(filePath, { obj: defaultProblemModel });
      }
  } catch (error) {
      console.error("Some error occurred", error);
      res.send(null);
  } finally {
      res.end();
  }
});

router.post('/createProblem', (req, res) => {

  const filePath = join(currPath, "../views/form/form_problem.ejs");

  const problemId = req.body.id;
  const type = req.body.submit;

  const problemModel = new ProblemModel(
      problemId,
      req.body.title,
      req.body.detail,
      req.body.tag
  );

  // Assuming 'problemId' is the key for your data
  const dataRef = child(problemRef, problemId);

  // Check if the data exists
  if (type === 'update') {
      // Update existing problem
      update(dataRef, problemModel).then(() => {
          res.render(filePath, { obj: problemModel });
      }).catch((err) => {
          console.log("Some error occurred", err);
          res.render(filePath, { obj: defaultProblemModel });
      });
  } else if (type === 'delete') {
      // Delete existing problem
      remove(dataRef).then(() => {
          res.render(filePath, { obj: problemModel });
      }).catch((err) => {
          console.log("Some error occurred", err);
          res.render(filePath, { obj: defaultProblemModel });
      });
  } else {
      // Insert new problem
      set(dataRef, problemModel).then(() => {
          res.render(filePath, { obj: problemModel });
      }).catch((err) => {
          console.log("Some error occurred", err);
          res.render(filePath, { obj: defaultProblemModel });
      });
  }
});

export default router;
