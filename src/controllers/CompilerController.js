import express from 'express';
import { child, query, orderByChild, equalTo, get, set, update, remove } from "firebase/database";
import { dbRef } from '../../config/firebase-config.js';
import { join, dirname } from 'path';
import { spawn } from 'child_process';
import 'process';
import stream from 'stream';
import fs from 'fs';
import CompilerModel from "../models/CompilerModel.js";

const codeRef = child(dbRef, 'Compilers');
const router = express.Router();
const currPath = dirname(new URL(import.meta.url).pathname);
const basePath = join(currPath, "../../temp");

const defaultCompilerModel = new CompilerModel();

router.get('/', (req,res) => {
    const filePath = join(currPath, "../views/form/form_compiler.ejs");
    res.render(filePath, {obj: defaultCompilerModel});
});

router.post('/', async (req, res) => {


    const userId = req.body.userId || "Annonymous";
    const lang = req.body.lang;
    const code = req.body.code;
    const input = req.body.input;
    
    const compilerModel = new CompilerModel(
        userId,
        lang,
        code,
        input,
        ""
    );

    const fileName = getFileName(lang, basePath, userId);
    try {
        fs.writeFileSync(fileName, code);
        console.log("File written as " + fileName);
        var Readable = stream.Readable;
        var s = new Readable() // for input
        s.push(input)
        s.push(null)
        compileCode(lang, userId, s, fileName, res, compilerModel);
    } catch (err) {
        console.log(err)
    }
});

function getFileName(lang, basePath, userId) {

    const randomUid = generateRandomUID();
    switch(lang) {
        case "C":
            return basePath + "/" + userId + randomUid + ".c";
        case "C++":
            return basePath + "/" + userId + randomUid + ".cpp";
        case "Java":
            return basePath + "/" + userId + randomUid + ".java";
        case "Python":
            return basePath + "/" + userId + randomUid + ".py";
        default:
            return basePath + "/" + userId + randomUid + ".c";
    }
}

function compileCode(lang, userId, s, fileName, res, compilerModel) {
    const filePath = join(currPath, "../views/form/form_compiler.ejs");

    try {
        if(lang == "C") {
            const outputFileName = join(basePath, "/"+userId+".out");
            const compile = spawn(`gcc ${fileName} -o ${outputFileName} && ${outputFileName}`,{shell: true});
            s.pipe(compile.stdin);
            compile.stdout.on('data', (data) => {
                if(fs.existsSync(fileName))
                    fs.unlinkSync(fileName);
                if(fs.existsSync(outputFileName))
                    fs.unlinkSync(outputFileName);
                compilerModel.output = data;
                res.render(filePath, { obj: compilerModel });
            });
            compile.stderr.on('data', (data) => {
                if(fs.existsSync(fileName))
                    fs.unlinkSync(fileName);
                if(fs.existsSync(outputFileName))
                    fs.unlinkSync(outputFileName);
                compilerModel.output = data;
                res.render(filePath, { obj: compilerModel });
            });
        } else if(lang == "C++") {
            const outputFileName = join(basePath, "/"+userId+".out");
            const compile = spawn(`g++ ${fileName} -o ${outputFileName} && ${outputFileName}`,{shell: true});
            s.pipe(compile.stdin);
            compile.stdout.on('data', (data) => {
                if(fs.existsSync(fileName))
                    fs.unlinkSync(fileName);
                if(fs.existsSync(outputFileName))
                    fs.unlinkSync(outputFileName);
                compilerModel.output = data;
                res.render(filePath, { obj: compilerModel });
            });
            compile.stderr.on('data', (data) => {
                if(fs.existsSync(fileName))
                    fs.unlinkSync(fileName);
                if(fs.existsSync(outputFileName))
                    fs.unlinkSync(outputFileName);
                compilerModel.output = data;
                res.render(filePath, { obj: compilerModel });
            });
        } else if(lang == "Java") {
            const outputDirName = join(basePath, userId);
            if (!fs.existsSync(outputDirName)) {
                fs.mkdirSync(outputDirName, { recursive: true });
            }
            const compile = spawn(`javac -d ${outputDirName} ${fileName} && java -cp ${outputDirName} Solution`,{shell: true});
            s.pipe(compile.stdin);
            compile.stdout.on('data', (data) => {
                if(fs.existsSync(fileName))
                    fs.unlinkSync(fileName);
                if(fs.existsSync(outputDirName + "/Solution.class"))
                    fs.unlinkSync(outputDirName + "/Solution.class");
                if(fs.existsSync(outputDirName))
                    fs.rmdirSync(outputDirName);
                compilerModel.output = data;
                res.render(filePath, { obj: compilerModel });
            });
            compile.stderr.on('data', (data) => {
                if(fs.existsSync(fileName))
                    fs.unlinkSync(fileName);
                if(fs.existsSync(outputDirName + "/Solution.class"))
                    fs.unlinkSync(outputDirName + "/Solution.class");
                if(fs.existsSync(outputDirName))
                    fs.rmdirSync(outputDirName);
                compilerModel.output = data;
                res.render(filePath, { obj: compilerModel });
            });
        } else if(lang == "Python") {
            const compile = spawn(`python3 ${fileName}`,{shell: true});
            console.log("compiling python code")
            s.pipe(compile.stdin);
            compile.stdout.on('data', (data) => {
                if(fs.existsSync(fileName))
                    fs.unlinkSync(fileName);
                compilerModel.output = data;
                res.render(filePath, { obj: compilerModel });
            });
            compile.stderr.on('data', (data) => {
                if(fs.existsSync(fileName))
                    fs.unlinkSync(fileName);
                compilerModel.output = data;
                res.render(filePath, { obj: compilerModel });
            });
        } else {
            res.render(filePath, { obj: compilerModel });
        }
    } catch( err ) {
        res.render(filePath, { obj: compilerModel });
    }
}

function generateRandomUID() {
    // Generate a random number and convert it to a hexadecimal string
    const randomNumber = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
    const randomHexString = randomNumber.toString(16);

    // Generate a timestamp to add uniqueness
    const timestamp = new Date().getTime().toString(16);

    // Concatenate the random hexadecimal string and timestamp
    const uid = randomHexString + timestamp;

    return uid;
}

export default router;
