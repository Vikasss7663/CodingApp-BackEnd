const express = require('express');

const router = express.Router();

const objObjQuestion = {questionId: "", question: "", optionA: "",
    optionB: "",optionC: "",optionD: "",
    answer: "1", questionTags: "", explanation: ""};

    
router.get('/v2/objQuestion', (req, res) => {
    pool.getConnection((err,conn) => {
        if(err) {
            console.log("Some error occurred");
            res.send(null);
            res.end();
            return;
        }
        const tag = "%" + req.query.tag + "%";
        const sql = "SELECT * FROM objquestion WHERE questionTags LIKE ?";
        conn.query(sql,tag,(err,results,fields) => {
            if(err) {
                res.send(err);
            } else {
                res.send(results);
            }
            res.end();
        })
    });
}); 
router.get('/v2/allObjQuestion', (req, res) => {
    pool.getConnection((err,conn) => {
        if(err) {
            console.log("Some error occurred");
            res.send(null);
            res.end();
            return;
        }
        const sql = "SELECT * FROM objquestion";
        conn.query(sql,(err,results,fields) => {
            if(err) {
                res.send(null);
            } else {
                res.send(results);
            }
            res.end();
        })
    });
});
router.get('/v2/createObjQuestion',(req,res) => {
    const filePath = path.join(currPath, "form_obj_question.ejs");
    res.render(filePath, {obj: objObjQuestion});
});
router.get('/v2/createObjQuestion/:questionId', (req, res) => {
    const filePath = path.join(currPath, "form_obj_question.ejs");
    pool.getConnection((err,conn) => {
        if(err) {
            console.log("Some error occurred");
            res.send(null);
            res.end();
            return;
        }
        var questionId = req.params.questionId;
        const sql = "SELECT * FROM objquestion WHERE questionId = ?";
        conn.query(sql, questionId, (err,results,fields) => {
            if(err) {
                res.send(err);
                res.end();
            } else {
                var firstRow = results[0];
                if(firstRow == undefined) firstRow = objObjQuestion;
                res.render(filePath, {obj: firstRow});
            }
        })
    });
});
router.post('/v2/createObjQuestion',(req,res) => {

    const filePath = path.join(currPath, "form_obj_question.ejs");

    insertData = null

    const questionId = Number(req.body.questionid);
    const type = req.body.submit;

    insertData = {
        questionId : Number(req.body.questionid),
        question : req.body.question,
        optionA : req.body.optiona,
        optionB : req.body.optionb,
        optionC : req.body.optionc,
        optionD : req.body.optiond,
        answer : Number(req.body.answer),
        explanation : req.body.explanation,
        questionTags : req.body.tag,
    }

    pool.getConnection((err,conn) => {
        if(err) {
            console.log(err);
            res.render(filePath, {obj: objObjQuestion});
        }
        
        if(type == "delete") {
            const sql = "DELETE FROM objquestion WHERE questionId = ?";
            conn.query(sql, questionId, (err,results,fields) => {
                conn.release;
                if(err) {
                    console.log("Some error occurred");
                }
                res.render(filePath, {obj: objObjQuestion});
            });
        } else if(type == "update") {
            const sqlQuery = "UPDATE objquestion SET ? WHERE questionId = ?";
            conn.query(sqlQuery, [insertData, questionId], (err,results,fields) => {
                conn.release;
                if(err) {
                    console.log("Some error occurred");
                }
                res.render(filePath, {obj: insertData});
            });
        } else {
            sqlQuery = "insert into objquestion SET ?";
            conn.query(sqlQuery , insertData ,(err,results,fields) => {
                conn.release;
                if(err) {
                    console.log(err);
                }
                res.render(filePath, {obj: insertData});
            });
        }

    }); 
}); 

module.exports = router;