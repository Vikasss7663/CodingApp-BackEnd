import express from 'express';
import { renderFile } from 'ejs';
import bodyParser from 'body-parser';
import { join, dirname } from 'path';

import CodeRouter from './src/routes/CodeRouter.js';
import ProblemRouter from './src/routes/ProblemRouter.js';
import SubQuestionRouter from './src/routes/SubQuestionRouter.js';
import ObjQuestionRouter from './src/routes/ObjQuestionRouter.js';
import CompilerRouter from './src/routes/CompilerRouter.js';

const port = process.env.PORT || 3000;
const app = express();
const currPath = dirname(new URL(import.meta.url).pathname);
const basePath = join(currPath, "/temp");

app.engine('html', renderFile);
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/code', CodeRouter);
app.use('/problem', ProblemRouter);
app.use('/sub-question', SubQuestionRouter);
app.use('/obj-question', ObjQuestionRouter);
app.use('/run', CompilerRouter);

app.get('/', (req, res) => {
    const filePath = join(currPath, "./index.ejs");
    res.render(filePath);
});

app.listen(port, () => {
    console.log("Server is listening at port ", port);
});

/*

curl -X POST \
    http://localhost:3000/run \
    -H 'Content-Type: application/json' \
    -d '{
        "lang": "Java",
        "userId": "2",
        "code": "public class Solution { public static void main(String[] args) { System.out.println(\"Hello, World! How are you !\"); } }",
        "input": ""
    }'


curl -X POST -H "Content-Type: application/json" -d '{"lang": "Python", "code": "print(\"Hello from Python!\")", "userId": "1" }' http://localhost:3000/run

curl -X POST -H "Content-Type: application/json" -d '{"lang": "C++", "code": "#include <iostream>\nint main() { std::cout << \"Hello, World!\" << std::endl; return 0; }", "userId": "2"}' http://localhost:3000/run

*/
