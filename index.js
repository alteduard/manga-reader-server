import express from 'express';
import helmet from 'helmet';

import reaperScans from "./Sources/mangasources.js"


const sources = [new reaperScans()];

const app = express()
app.use(helmet());


app.get('/', function (req, res) {
    res.send("Manga API Homepage");
})
sources.forEach(function (source) {
    app.get("/" + source.name, function (req, res) {
        res.send(source.functions)
    })
    source.functions.forEach(function (b) {
        const paramsString = b.functionParams.map(source => "/:"+ source).join("")
        app.get("/" + source.name + "/" + b.functionName + paramsString, async function (req, res) {
            const params = req.params;
            let funcParams = [];
            for (var key in params) {
                if (params.hasOwnProperty(key)) {
                    funcParams.push(params[key])
                }
            }
            b.function = eval("source."+b.functionName)
            funcParams.push(source)
            res.send(await b.function(...funcParams))
        })
    })
})
const server = app.listen(8081, function () {
    const host = server.address().address
    const port = server.address().port

    console.log("Listening at https://%s:%s", host, port)
})