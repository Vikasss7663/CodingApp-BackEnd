const express = require('express');
const bodyParser = require('body-parser');
const mySql = require('mysql');

const port = process.env.PORT || 5500;
const app = express(); 
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const pool = mySql.createPool({
    host: "us-cdbr-east-04.cleardb.com", 
    port: 3306,
    user: "b8391d809cc951",
    password: "9e0c987c",
    database: "heroku_826f5b5f5fe23d8"
});

app.get('/create',(req,res) => {
    res.sendFile("C:/Users/visha/OneDrive/Documents/Quiz/public/form.html");
});
app.post('/create',(req,res) => {

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
            console.log("Some error occurred");
            res.sendFile("C:/Users/visha/OneDrive/Documents/Quiz/public/form.html");
        }
        sqlQuery = "insert into question SET ?";
        conn.query(sqlQuery , insertData ,(err,results,fields) => {
            conn.release;
            if(err) throw err;
            var questionid = results.insertId

            var quesByTag = []
            for(var i=0;i<text.length;i++) {
                quesByTag.push([text[i],questionid]);
            }

            var tagSql = "insert into quesbytag (tagname,questionid) values ?";
            conn.query(tagSql , [quesByTag] ,(err,results,fields) => {
                if(err) throw err;
            });
 
            res.sendFile("C:/Users/visha/OneDrive/Documents/Quiz/public/form.html");
        });
    }); 
}); 
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

app.get('/blog', (req,res) => {
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

app.listen(port,hostname,() => {
    console.log("server is listening at port ", port);
});