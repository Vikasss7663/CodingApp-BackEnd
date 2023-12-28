import express from 'express';
import { renderFile } from 'ejs';
import bodyParser from 'body-parser';
import { join, dirname } from 'path';
import { spawn } from 'child_process';
import 'process';
import stream from 'stream';
import fs from 'fs';

import CodeRouter from './src/routes/CodeRouter.js';
import ProblemRouter from './src/routes/ProblemRouter.js';
import SubQuestionRouter from './src/routes/SubQuestionRouter.js';
import ObjQuestionRouter from './src/routes/ObjQuestionRouter.js';

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
app.use('/sub-question', SubQuestionRouter);
app.use('/obj-question', ObjQuestionRouter);

app.get('/', (req, res) => {
    const filePath = join(currPath, "./index.ejs");
    res.render(filePath);
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
