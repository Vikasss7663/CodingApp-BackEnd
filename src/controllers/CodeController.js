import express from 'express';
import { child, query, orderByChild, equalTo, get, set, update, remove } from "firebase/database";
import { dbRef } from '../../config/firebase-config.js';
import { join, dirname } from 'path';
import CodeModel from "../models/CodeModel.js";

const codeRef = child(dbRef, 'Codes');
const router = express.Router();
const currPath = dirname(new URL(import.meta.url).pathname);

const defaultCodeModel = new CodeModel();

router.get('', async (req, res) => {
    const problemId = req.query.problemId;
    const codeId = req.query.codeId;

    try {
        if(!isNaN(problemId)) {
            // Query Firebase Realtime Database to get all codes for a specific problemId
            const codeQuery = query(
                codeRef,
                orderByChild('problemId'),
                equalTo(Number(problemId))
            );

            const snapshot = await get(codeQuery);
            if (snapshot.exists()) {
                const codeData = snapshot.val();
                res.send(codeData);
            } else {
                res.send([]);
            }
        } else if(!isNaN(codeId)) {
            const dataRef = child(codeRef, codeId);
            const snapshot = await get(dataRef);
            if (snapshot.exists()) {
                const codeData = snapshot.val();
                res.send(codeData);
            } else {
                res.send("Code not found");
            }
        } else {
            res.send("Please provide code id or problem id as query parameter.");
        }
    } catch (error) {
        console.error('Error occurred:', error);
        res.send(error);
    } finally {
        res.end();
    }
});

router.get('/view', async (req, res) => {
    const filePath = join(currPath, "../views/code.ejs");
    try {
        let problemId = Number(req.query.problemId);
        
        // If req.query.problemId is undefined, set problemId to -1
        if (typeof req.query.problemId === 'undefined') {
            problemId = -1;
        }

        // Query Firebase Realtime Database to get all codes for a specific problemId
        const codeQuery = query(
            codeRef,
            orderByChild('problemId'),
            equalTo(problemId)
        );

        const snapshot = await get(codeQuery);

        if (snapshot.exists()) {
            const codeData = snapshot.val();
            res.render(filePath, { codes: Object.values(codeData) });
        } else {
            res.render(filePath, { codes: [] });
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
        const snapshot = await get(codeRef);
    
        if (snapshot.exists()) {
          const codeData = snapshot.val();
          res.send(codeData);
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

router.get('/create/:codeId', async (req, res) => {
    const filePath = join(currPath, "../views/form/form_code.ejs");
    const codeId = req.params.codeId;

    try {
        const dataRef = child(codeRef, codeId);
        const snapshot = await get(dataRef);
    
        if (snapshot.exists()) {
          const codeData = snapshot.val();
          res.render(filePath, { obj: codeData });
        } else {
          res.render(filePath, { obj: defaultCodeModel });
        }
      } catch (error) {
        console.error('Error occurred:', error);
        res.send(error);
      }
});

router.get('/create', (req,res) => {
    const filePath = join(currPath, "../views/form/form_code.ejs");
    res.render(filePath, {obj: defaultCodeModel});
});

router.post('/create', (req, res) => {

    const filePath = join(currPath, "../views/form/form_code.ejs");
    const codeId = req.body.codeid;
    const type = req.body.submit;

    const codeModel = new CodeModel(
        Number(codeId),
        Number(req.body.problemid),
        req.body.title,
        req.body.detail,
        req.body.code,
        req.body.lang
    );

    // Assuming 'problemId' is the key for your data
    const dataRef = child(codeRef, codeId);

    // Check if the data exists
    if (type === 'update') {
        // Update existing code
        update(dataRef, codeModel).then(() => {
            res.render(filePath, { obj: codeModel });
        }).catch((err) => {
            console.log("Some error occurred", err);
            res.render(filePath, { obj: defaultCodeModel });
        });
    } else if (type === 'delete') {
        // Delete existing code
        remove(dataRef).then(() => {
            res.render(filePath, { obj: codeModel });
        }).catch((err) => {
            console.log("Some error occurred", err);
            res.render(filePath, { obj: defaultCodeModel });
        });
    } else {
        // Insert new code
        set(dataRef, codeModel).then(() => {
            res.render(filePath, { obj: codeModel });
        }).catch((err) => {
            console.log("Some error occurred", err);
            res.render(filePath, { obj: defaultCodeModel });
        });
    }
});

// router.post('/create', async (req, res) => {
//     const codeId = req.body.codeid;
//     const type = req.body.submit;

//     const codeModel = new CodeModel(
//         Number(codeId),
//         Number(req.body.problemid),
//         req.body.title,
//         req.body.detail,
//         req.body.code,
//         req.body.lang
//     );

//     const dataRef = child(codeRef, codeId);

//     try {
//         if (type === 'update') {
//             await update(dataRef, codeModel);
//         } else if (type === 'delete') {
//             await remove(dataRef);
//         } else {
//             await set(dataRef, codeModel);
//         }

//         res.render(filePath, { obj: codeModel });
//     } catch (err) {
//         console.log("Some error occurred", err);
//         res.render(filePath, { obj: defaultCodeModel });
//     } finally {
//         res.end();
//     }
// });

export default router;
