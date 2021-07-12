const express = require('express');
const bodyParser = require('body-parser');
const mySql = require('mysql');
const fs = require('fs');
const {exec, spawn} = require('child_process')
require('process');
const stream = require('stream');
const path = require('path');
const currPath = path.join(__dirname);

const port = process.env.PORT || 5500;
const app = express(); 
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');
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
app.get('/allProblem', (req, res) => {
    pool.getConnection((err,conn) => {
        if(err) {
            console.log("Some error occurred");
            res.send(null);
            res.end();
            return;
        }
        const sql = "SELECT * FROM problembase";
        conn.query(sql,(err,results,fields) => {
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
    const filePath = path.join(currPath, "form_problem.html");
    res.sendFile(filePath);
});
app.post('/createProblem', (req, res) => {

    const filePath = path.join(currPath, "form_problem.html");

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
            res.sendFile(filePath);
        }
        sqlQuery = "insert into problembase SET ?";
        conn.query(sqlQuery , insertData ,(err,results,fields) => {
            conn.release;
            if(err) {
                console.log("Some error occurred");
            }
            res.sendFile(filePath);
        });
    }); 
});

const objCode = {codeId: "", problemId: "", codeTitle: "",
    codeDetail: "", codeCode: "", codeLang: ""};

app.get('/code', (req, res) => {
    pool.getConnection((err,conn) => {
        if(err) {
            console.log("Some error occurred");
            res.send(null);
            res.end();
            return;
        }
        const problemId = Number(req.query.problemId);
        const sql = "SELECT * FROM codebase WHERE problemId = ?";
        conn.query(sql,problemId,(err,results,fields) => {
            if(err) {
                res.send(err);
            } else {
                res.send(results);
            }
            res.end();
        })
    });
});
app.get('/code/:codeId', (req, res) => {
    pool.getConnection((err,conn) => {
        if(err) {
            console.log("Some error occurred");
            res.send(null);
            res.end();
            return;
        }
        var codeId = req.params.codeId;
        const sql = "SELECT * FROM codebase WHERE codeId = ?";
        conn.query(sql, codeId, (err,results,fields) => {
            if(err) {
                res.send(err);
            } else {
                res.send(results[0]);
            }
            res.end();
        })
    });
});
app.get('/allCode', (req, res) => {
    pool.getConnection((err,conn) => {
        if(err) {
            console.log("Some error occurred");
            res.send(null);
            res.end();
            return;
        }
        const sql = "SELECT * FROM codebase";
        conn.query(sql,(err,results,fields) => {
            if(err) {
                res.send(err);
            } else {
                res.send(results);
            }
            res.end();
        })
    });
});
app.get('/createCode/:codeId', (req, res) => {
    const filePath = path.join(currPath, "form_code.ejs");
    pool.getConnection((err,conn) => {
        if(err) {
            console.log("Some error occurred");
            res.send(null);
            res.end();
            return;
        }
        var codeId = req.params.codeId;
        const sql = "SELECT * FROM codebase WHERE codeId = ?";
        conn.query(sql, codeId, (err,results,fields) => {
            if(err) {
                res.send(err);
                res.end();
            } else {
                var firstRow = results[0];
                if(firstRow == undefined) firstRow = objCode;
                res.render(filePath, {obj: firstRow});
            }
        })
    });
});
app.get('/createCode', (req,res) => {
    const filePath = path.join(currPath, "form_code.ejs");
    res.render(filePath, {obj: objCode});
});
app.post('/createCode', (req, res) => {

    const filePath = path.join(currPath, "form_code.ejs");
    const codeId = Number(req.body.codeid);
    const type = req.body.submit;

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
            res.sendFile(filePath);
        }
        if(type == "delete") {
            console.log("Delete");
            const sql = "DELETE FROM codebase WHERE codeId = ?";
            conn.query(sql, codeId, (err,results,fields) => {
                conn.release;
                if(err) {
                    console.log("Some error occurred");
                }
                res.render(filePath, {obj: objCode});
            });
        } else if(type == "update") {
            console.log("Update");
            const sqlQuery = "UPDATE codebase SET ? WHERE codeId = ?";
            conn.query(sqlQuery, [insertData, codeId], (err,results,fields) => {
                conn.release;
                if(err) {
                    console.log("Some error occurred");
                }
                res.render(filePath, {obj: objCode});
            });
        } else {
            console.log("Insert");
            const sqlQuery = "insert into codebase SET ?";
            conn.query(sqlQuery , insertData ,(err,results,fields) => {
                conn.release;
                if(err) {
                    console.log("Some error occurred");
                }
                res.render(filePath, {obj: objCode});
            });
        }
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
    const filePath = path.join(currPath, "form_blog.html");
    res.sendFile(filePath);
});
app.post('/createBlog',(req,res) => {

    const filePath = path.join(currPath, "form_blog.html");

    insertData = null

    insertData = {
        blogTitle : req.body.title,
        blogDesc : req.body.detail,
        blogUrl : req.body.url,
        blogTags : req.body.tag,
    }

    pool.getConnection((err,conn) => {
        if(err) {
            console.log(err);
            res.sendFile(filePath);
        }
        sqlQuery = "insert into blog SET ?";
        conn.query(sqlQuery , insertData ,(err,results,fields) => {
            conn.release;
            if(err) {
                console.log(err);
            }
            res.sendFile(filePath);
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
    const filePath = path.join(currPath, "form_obj_question.html");
    res.sendFile(filePath);
});
app.post('/createObjQuestion',(req,res) => {

    const filePath = path.join(currPath, "form_obj_question.html");

    insertData = null

    insertData = {
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
            res.sendFile(filePath);
        }
        sqlQuery = "insert into objquestion SET ?";
        conn.query(sqlQuery , insertData ,(err,results,fields) => {
            conn.release;
            if(err) {
                console.log(err);
            }
            res.sendFile(filePath);
        });
    }); 
}); 

app.get('/SubQuestion', (req, res) => {
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
    const filePath = path.join(currPath, "form_sub_question.html");
    res.sendFile(filePath);
});
app.post('/createSubQuestion',(req,res) => {

    const filePath = path.join(currPath, "form_sub_question.html");

    insertData = null

    insertData = {
        question : req.body.question,
        answer : req.body.answer,
        questionTags : req.body.tag,
    }

    pool.getConnection((err,conn) => {
        if(err) {
            console.log(err);
            res.sendFile(filePath);
        }
        sqlQuery = "insert into subquestion SET ?";
        conn.query(sqlQuery , insertData ,(err,results,fields) => {
            conn.release;
            if(err) {
                console.log(err);
            }
            res.sendFile(filePath);
        });
    }); 
});

app.listen(port, () => {
    console.log("server is listening at port ", port);
});

app.post('/run', (req, res) => {
    const lang = req.body.lang;
    const userId = req.body.userId;
    const code = req.body.code;
    console.log(code);
    const input = req.body.input;
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
            res.write(data.toString());
            res.end();
        });
        compile.stderr.on('data', (data) => {
            console.log(data.toString());
            res.write(data.toString());
            res.end();
            // process.exit();
        });
    }
}
