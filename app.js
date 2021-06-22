const express = require('express');
const bodyParser = require('body-parser');
const mySql = require('mysql');
const fs = require('fs');
const {exec, spawn} = require('child_process')
require('process');
const stream = require('stream');
const path = require('path');

const port = process.env.PORT || 5500;
const app = express(); 
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const basePath = "public/code";

const pool = mySql.createPool({
    host: "us-cdbr-east-04.cleardb.com", 
    port: 3306,
    user: "b8391d809cc951",
    password: "9e0c987c",
    database: "heroku_826f5b5f5fe23d8"
});

app.get('/blog', (req, res) => {
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

app.get('/problem', (req, res) => {
    pool.getConnection((err,conn) => {
        if(err) {
            console.log("Some error occurred");
            res.send(null);
            res.end();
            return;
        }
        const tag = "%" + req.query.tag + "%";
        const sql = "SELECT * FROM problembase WHERE problemTags LIKE ?";
        conn.query(sql,(tag),(err,results,fields) => {
            if(err) {
                res.send(err);
            } else {
                res.send(results);
            }
            res.end();
        })
    });
});
app.get('/createProblem', (req, res) => {
    res.sendFile("C:/Users/visha/OneDrive/Desktop/Quiz App/form_problem.html");
});
app.post('/createProblem', (req, res) => {

    insertData = null

    insertData = {
        problemId : Number(req.body.id),
        problemTitle : req.body.title,
        problemDetail : req.body.detail,
        problemTags : req.body.tag
    }

    pool.getConnection((err,conn) => {
        if(err) {
            console.log("Some error occurred");
            res.sendFile("C:/Users/visha/OneDrive/Desktop/Quiz App/form_problem.html");
        }
        sqlQuery = "insert into problembase SET ?";
        conn.query(sqlQuery , insertData ,(err,results,fields) => {
            conn.release;
            if(err) {
                console.log("Some error occurred");
            }
            res.sendFile("C:/Users/visha/OneDrive/Desktop/Quiz App/form_problem.html");
        });
    }); 
});

app.get('/code', (req, res) => {
    pool.getConnection((err,conn) => {
        if(err) {
            console.log("Some error occurred");
            res.send(null);
            res.end();
            return;
        }
        const problemId = req.query.problemId;
        const sql = "SELECT * FROM codebase WHERE problemId = ?";
        conn.query(sql,(problemId),(err,results,fields) => {
            if(err) {
                res.send(err);
            } else {
                res.send(results);
            }
            res.end();
        })
    });
});
app.get('/createCode', (req,res) => {
    res.sendFile("C:/Users/visha/OneDrive/Desktop/Quiz App/form_code.html");
});
app.post('/createCode', (req, res) => {

    insertData = null

    insertData = {
        codeId : Number(req.body.codeid),
        problemId : Number(req.body.problemid),
        codeTitle : req.body.title,
        codeDetail : req.body.detail,
        codeCode : req.body.code,
        codeLang : req.body.lang
    }

    pool.getConnection((err,conn) => {
        if(err) {
            console.log("Some error occurred");
            res.sendFile("C:/Users/visha/OneDrive/Desktop/Quiz App/form_code.html");
        }
        sqlQuery = "insert into codebase SET ?";
        conn.query(sqlQuery , insertData ,(err,results,fields) => {
            conn.release;
            if(err) {
                console.log("Some error occurred");
            }
            res.sendFile("C:/Users/visha/OneDrive/Desktop/Quiz App/form_code.html");
        });
    }); 
});

app.listen(port, () => {
    console.log("server is listening at port ", port);
});



app.get('/createQuestion',(req,res) => {
    res.sendFile("C:/Users/visha/OneDrive/Desktop/Quiz App/form_question.html");
});
app.post('/createQuestion',(req,res) => {

    insertData = null

    insertData = {
        question : req.body.question,
        optiona : req.body.optiona,
        optionb : req.body.optionb,
        optionc : req.body.optionc,
        optiond : req.body.optiond,
        answer : req.body.answer,
        tags : req.body.tag,
        explanation : req.body.explanation
    }

    var tagData = "";
    var text = insertData.tags.split(",");
    for(var i=0;i<text.length;i++) {
        text[i] = text[i].trim().toLowerCase();
        tagData += "#" + text[i] + " ";
    }
    if(tagData.length > 1) insertData.tags = tagData.substring(0,tagData.length-1);
    else insertData.tags = "default"

    pool.getConnection((err,conn) => {
        if(err) {
            console.log(err);
            res.sendFile("C:/Users/visha/OneDrive/Documents/Quiz/public/form.html");
        }
        sqlQuery = "insert into question SET ?";
        conn.query(sqlQuery , insertData ,(err,results,fields) => {
            conn.release;
            if(err) {
                console.log(err);
            }
            var questionid = results.insertId

            var quesByTag = []
            for(var i=0;i<text.length;i++) {
                quesByTag.push([text[i],questionid]);
            }

            var tagSql = "insert into quesbytag (tagname,questionid) values ?";
            conn.query(tagSql , [quesByTag] ,(err,results,fields) => {
                if(err) {
                    console.log(err);
                }
            });
 
            res.sendFile("C:/Users/visha/OneDrive/Documents/Quiz/public/form.html");
        });
    }); 
}); 

/*
app.get('/quiz',(req,res) => {
    pool.getConnection((err,conn) => { 
        if(err) throw err;
        var quizSql = "select distinct tagname,count(tagname) as count from quesbytag group by tagname";
        conn.query(quizSql,(err,results,fields) => {
            conn.release; 
            if(err) res.send(null);  
            else res.send(results);    
            res.end();   
        }); 
    }); 
}) 
app.get('/question',(req,res) => {
    var tag = req.query.tag
    pool.getConnection((err,conn) => { 
        if(err) throw err;
        var quesSql = "select * from question,quesbytag where quesbytag.tagname = ? AND quesbytag.questionid = question.questionid";
        conn.query(quesSql,tag,(err,results,fields) => {
            conn.release;  
            if(err) throw err; 
            res.send(results);    
            res.end();   
        }); 
    }); 
});

app.get('/run', (req, res) => {
    const lang = req.query.lang;
    const userId = req.query.userId;
    const code = req.query.code;
    console.log(code);
    const input = req.query.input;
    const ext = getExtension(lang);
    const fileName = basePath+"/hello"+userId+ext;
    try {
        fs.writeFileSync(fileName, code);
        //file written successfully
        console.log("File written" + fileName);
        var Readable = stream.Readable;
        var s = new Readable() // for input
        s.push(input)
        s.push(null)
        compileCode(lang,userId,s,res);
    } catch (err) {
        console.log(err)
    }
});

function getExtension(lang) {
    switch(lang) {
        case "C":
            return ".c";
        case "C++":
            return ".cpp";    
        case "Java":
            return ".java";
        case "Python":
            return ".py";
        default:
            return ".c";
    }
}

function compileCode(lang,userId,s,res) {
    if(lang == "C") {
        const fileName = path.join(basePath, "hello"+userId+".c");
        const outputFileName = path.join(basePath, "output"+userId);
        const compile = spawn(`gcc ${fileName} -o ${outputFileName} && ${outputFileName}.exe`,{shell: true});
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
        const fileName = basePath+"/hello"+userId+".cpp";
        const outputFileName = basePath+"/output"+userId;
        const compile = spawn(`g++ ${fileName} -o ${outputFileName} && ${outputFileName}.exe`,{shell: true});
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
        const fileName = basePath+"/hello"+userId+".java";
        const outputFileName = basePath+"/hello"+userId;
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
        const fileName = basePath+"/hello"+userId+".py";
        const outputFileName = basePath+"/hello"+userId;
        const compile = spawn(`python3 ${fileName}`,{shell: true});
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
    }
}

*/