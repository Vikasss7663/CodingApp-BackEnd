import dotenv from 'dotenv';
import express from 'express';
import { renderFile } from 'ejs';
import bodyParser from 'body-parser';
import { join, dirname } from 'path';
import { ref, child, set, update, remove, get } from 'firebase/database';
import { dbRef } from './config/firebase-config.js';
import { spawn } from 'child_process';
import 'process';
import stream from 'stream';
import fs from 'fs';
import CodeRouter from './src/routes/CodeRouter.js';
import ProblemRouter from './src/routes/ProblemRouter.js';

const problemRef = child(dbRef, 'Problems');
const quizRef = child(dbRef, 'Quizes');
const questionRef = child(dbRef, 'Questions');

const port = process.env.PORT || 5500;
const app = express();
const currPath = dirname(new URL(import.meta.url).pathname);
const basePath = "public/code";

app.engine('html', renderFile);
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/code', CodeRouter);
app.use('/problem', ProblemRouter);

const objObjQuestion = {questionId: "", question: "", optionA: "",
    optionB: "",optionC: "",optionD: "",
    answer: "1", questionTags: "", explanation: "", 
    questionIdVisible: "",
    createButtonVisible: "", deleteButtonVisible: ""};

const objSubQuestion = {questionId: "", question: "", 
    answer: "", questionTags: "", questionIdVisible: "",
    createButtonVisible: "", deleteButtonVisible: "" };


app.get('/', (req, res) => {
    const filePath = join(currPath, "./public/index.ejs");
    res.render(filePath);
    // const filePath = join(currPath, "public/index.ejs");
    // res.render(filePath);
    // res.end();
});

app.get('/search', (req,res) => {
    const filePath = join(currPath, "./public/problem.ejs");
    pool.getConnection((err,conn) => {
        if(err) {
            console.log("Some error occurred");
            res.send(null);
            res.end();
            return;
        }
        const search = "%" + req.query.search + "%";
        console.log(search);
        if(search == undefined) search = "%%";
        const sql = "SELECT * FROM problembase WHERE problemTitle LIKE ?";
        conn.query(sql,search,(err,results,fields) => {
            if(err) {
                res.send(err);
                res.end();
            } else {
                res.render(filePath, {problems: results});
            }
        })
    });
});

app.get('/blog', (req, res) => {
    pool.getConnection((err,conn) => {
        if(err) {
            console.log("Some error occurred");
            res.send(null);
            res.end();
            return;
        }
        const tag = "%" + req.query.tag + "%";
        const sql = "SELECT * FROM blog WHERE blogTags LIKE ?";
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
app.get('/allBlog', (req, res) => {
    pool.getConnection((err,conn) => {
        if(err) {
            console.log("Some error occurred");
            res.send(null);
            res.end();
            return;
        }
        const sql = "SELECT * FROM blog";
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
app.get('/createBlog',(req,res) => {
    const filePath = join(currPath, "./forms/form_blog.ejs");
    res.render(filePath);
});
app.post('/createBlog',(req,res) => {

    const filePath = join(currPath, "./forms/form_blog.ejs");

    const insertData = {
        blogTitle : req.body.title,
        blogDesc : req.body.detail,
        blogUrl : req.body.url,
        blogTags : req.body.tag,
    }

    pool.getConnection((err,conn) => {
        if(err) {
            console.log(err);
            res.render(filePath);
        }
        sqlQuery = "insert into blog SET ?";
        conn.query(sqlQuery , insertData ,(err,results,fields) => {
            conn.release;
            if(err) {
                console.log(err);
            }
            res.render(filePath);
        });
    }); 
}); 

app.get('/objQuestion', (req, res) => {
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
app.get('/public/objQuestion', (req,res) => {
    const filePath = join(currPath, "./public/obj_question.ejs");
    pool.getConnection((err,conn) => {
        if(err) {
            console.log("Some error occurred");
            res.send(null);
            res.end();
            return;
        }
        var tag = "%" + req.query.tag + "%";
        if(req.query.tag == undefined) tag = "%%";
        const sql = "SELECT * FROM objquestion WHERE questionTags LIKE ?";
        conn.query(sql,tag,(err,results,fields) => {
            if(err) {
                res.send(err);
                res.end();
            } else {
                res.render(filePath, {objQuestions: results});
            }
        })
    });
});
app.get('/allObjQuestion', (req, res) => {
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
app.get('/createObjQuestion',(req,res) => {
    const filePath = join(currPath, "./forms/form_obj_question.ejs");
    res.render(filePath, {obj: objObjQuestion});
});
app.get('/createObjQuestion/:questionId', (req, res) => {
    const filePath = join(currPath, "./forms/form_obj_question.ejs");
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
app.post('/createObjQuestion',(req,res) => {

    const filePath = join(currPath, "./forms/form_obj_question.ejs");

    const questionId = Number(req.body.questionid);
    const type = req.body.submit;

    const insertData = {
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

app.get('/subQuestion', (req, res) => {
    pool.getConnection((err,conn) => {
        if(err) {
            console.log("Some error occurred");
            res.send(null);
            res.end();
            return;
        }
        const tag = "%" + req.query.tag + "%";
        const sql = "SELECT * FROM subquestion WHERE questionTags LIKE ?";
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
app.get('/public/subQuestion', (req,res) => {
    const filePath = join(currPath, "./public/sub_question.ejs");
    pool.getConnection((err,conn) => {
        if(err) {
            console.log("Some error occurred");
            res.send(null);
            res.end();
            return;
        }
        var search = req.query.search;
        if(search != undefined) {
            const searchPattern = "%" + search + "%";
            const sql = "SELECT * FROM subquestion WHERE question LIKE ?";
            conn.query(sql,searchPattern,(err,results,fields) => {
                if(err) {
                    res.send(err);
                    res.end();
                } else {
                    res.render(filePath, {subQuestions: results, search: search});
                }
            });
        }
        var tag = "%" + req.query.tag + "%";
        if(req.query.tag == undefined) tag = "%%";
        const sql = "SELECT * FROM subquestion WHERE questionTags LIKE ?";
        conn.query(sql,tag,(err,results,fields) => {
            if(err) {
                res.send(err);
                res.end();
            } else {
                res.render(filePath, {subQuestions: results, search: search});
            }
        })
    });
});
app.get('/allSubQuestion', (req, res) => {
    pool.getConnection((err,conn) => {
        if(err) {
            console.log("Some error occurred");
            res.send(null);
            res.end();
            return;
        }
        const sql = "SELECT * FROM subquestion";
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
app.get('/createSubQuestion',(req,res) => {
    const filePath = join(currPath, "./forms/form_sub_question.ejs");
    const tempSubQuestion =  objSubQuestion;
    tempSubQuestion.questionIdVisible = "d-none";
    tempSubQuestion.deleteButtonVisible = "d-none";
    res.render(filePath, {obj: tempSubQuestion});
});
app.get('/createSubQuestion/:questionId', (req,res) => {
    const filePath = join(currPath, "./forms/form_sub_question.ejs");
    pool.getConnection((err,conn) => {
        if(err) {
            console.log("Some error occurred");
            res.send(null);
            res.end();
            return;
        }
        var questionId = req.params.questionId;
        const sql = "SELECT * FROM subquestion WHERE questionId = ?";
        conn.query(sql, questionId, (err,results,fields) => {
            if(err) {
                res.send(err);
                res.end();
            } else {
                var firstRow = results[0];
                if(firstRow == undefined) firstRow = objSubQuestion;
                const tempSubQuestion =  firstRow;
                tempSubQuestion.createButtonVisible = "d-none";
                res.render(filePath, {obj: tempSubQuestion});
            }
        })
    });
});
app.post('/createSubQuestion',(req,res) => {

    const filePath = join(currPath, "./forms/form_sub_question.ejs");

    const questionId = Number(req.body.questionid);
    const type = req.body.submit;

    const insertData = {
        questionId: questionId,
        question: req.body.question,
        answer: req.body.answer,
        questionTags: req.body.questionTags,
    }

    pool.getConnection((err,conn) => {

        if(err) {
            console.log(err);
            res.render(filePath, {obj: objSubQuestion});
        }
        
        if(type == "delete") {
            const sql = "DELETE FROM subquestion WHERE questionId = ?";
            conn.query(sql, questionId, (err,results,fields) => {
                conn.release;
                if(err) {
                    console.log("Some error occurred");
                }
                res.render(filePath, {obj: objObjQuestion});
            });
        } else if(type == "update") {
            const sqlQuery = "UPDATE subquestion SET ? WHERE questionId = ?";
            conn.query(sqlQuery, [insertData, questionId], (err,results,fields) => {
                conn.release;
                if(err) {
                    console.log("Some error occurred");
                }
                res.render(filePath, {obj: insertData});
            });
        } else {
            sqlQuery = "insert into subquestion SET ?";
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

app.listen(port, () => {
    console.log("Server is listening at port ", port);
});

app.post('/run', (req, res) => {
    const lang = req.body.lang;
    const userId = req.body.userId;
    const code = req.body.code;
    const input = req.body.input;
    const fileName = getFileName(lang, basePath, userId);
    try {
        fs.writeFileSync(fileName, code);
        //file written successfully
        console.log("File written as " + fileName);
        var Readable = stream.Readable;
        var s = new Readable() // for input
        s.push(input)
        s.push(null)
        compileCode(lang,userId,s,res);
    } catch (err) {
        console.log(err)
    }
});

function getFileName(lang, basePath, userId) {
    switch(lang) {
        case "C":
            return basePath + "/" + userId + ".c";
        case "C++":
            return basePath + "/" + userId + ".cpp";
        case "Java":
            return basePath + "/" + userId + "/Solution.java";
        case "Python":
            return basePath + "/" + userId + ".py";
        default:
            return basePath + "/" + userId + ".c";
    }
}

function compileCode(lang,userId,s,res) {
    if(lang == "C") {
        const fileName = join(basePath, "/"+userId+".c");
        const outputFileName = join(basePath, "/"+userId);
        console.log(fileName);
        console.log(outputFileName);
        const compile = spawn(`gcc ${fileName} -o ${outputFileName} && ${outputFileName}`,{shell: true});
        s.pipe(compile.stdin);
        compile.stdout.on('data', (data) => {
            console.log(data.toString());
            res.send(data.toString());
            res.end();
            return;
        });
        compile.stderr.on('data', (data) => {
            console.log(data.toString());
            res.send(data.toString());
            res.end();
            return;
        });
    } else if(lang == "C++") {
        const fileName = join(basePath,"/"+userId+".cpp");
        const outputFileName = join(basePath, "/"+userId);
        const compile = spawn(`g++ ${fileName} -o ${outputFileName} && ${outputFileName}`,{shell: true});
        s.pipe(compile.stdin);
        compile.stdout.on('data', (data) => {
            console.log(data.toString());
            res.send(data.toString());
            res.end();
        });
        compile.stderr.on('data', (data) => {
            console.log(data.toString());
            res.send(data.toString());
            res.end();
        });
    } else if(lang == "Java") {
        const fileName = basePath+"/"+userId+"/Solution.java";
        const outputFileName = join(basePath, "/" + userId + "/Solution");
        const compile = spawn(`javac ${fileName} && java ${outputFileName}`,{shell: true});
        s.pipe(compile.stdin);
        compile.stdout.on('data', (data) => {
            console.log(data.toString());
            res.send(data.toString());
            res.end();
        });
        compile.stderr.on('data', (data) => {
            console.log(data.toString());
            res.send(data.toString());
            res.end();
            // process.exit();
        });
    } else if(lang == "Python") {
        const fileName = join(basePath, "/"+userId+".py");
        const compile = spawn(`python3 ${fileName}`,{shell: true});
        s.pipe(compile.stdin);
        compile.stdout.on('data', (data) => {
            res.write(data.toString());
            // res.end();
        });
        compile.stderr.on('data', (data) => {
            res.write(data.toString());
            res.end();
            // process.exit();
        });
        compile.on('exit', function() {
            res.end();
        });
    }
}
