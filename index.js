const express = require('express');

const app = express();

const LIMIT = process.env.LIMIT || 8000;
const DELAY = process.env.DELAY || 1000;
const PORT = process.env.PORT || 3000;

let allConnections = 0;
let curConnections = 0;

app.get('/date', (req, resp, next) => {
    let num = 0;
    let apiNum = ++allConnections;
    let curApiNum = curConnections++;

    setTimeout(() => {
        clearTimeout(timer);
        curConnections--;
        resp.send(new Date()+ '\n');
    }, LIMIT);

    let timer = setInterval(() => {
        num++
        console.log(' '.repeat(curApiNum), apiNum + '-е соединение:', num, new Date());
    }, DELAY);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})

// Чтобы обратиться к этому серверу через консоль: "curl http://localhost:3000/date"