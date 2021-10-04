const express = require('express');

const app = express(); // Инициализируем express приложение

const LIMIT = process.env.LIMIT || 12000;
const DELAY = process.env.DELAY || 1000;
const PORT = process.env.PORT || 3000;

let connections = []; // Переменная в которой храним соединение

function setConnection(resp) {
    resp.setHeader('Content-type', 'text/html; charset=utf-8');
    resp.setHeader('Transfer-Encoding', 'chunked'); // Таким образом указываем, что ответ передаем по кусочкам, а не сразу передаем весь ответ и закрываем соединение
    connections.push(resp); // Сохраняем resp (объект при помощи которого мы сможем отправлять данные) в пуле соединений
}

function appLog() {
    let num = 0
    setTimeout(function run() {
        num++
        console.log(num, new Date());
        setTimeout(run, DELAY);
    }, DELAY)
}

function connectionsTimer() {
    console.warn('Начали отсчет для всех соединений');
    setTimeout(() => {
        // let time = new Date();
        connections.map((resp, i) => {
            resp.write(`${i} client; ${new Date()}`); // Метод write не закрывает соединение, можно его исп чтоб отправлять данные кусочками, а render отправляем ответ и закрывает соед когда ответ полностью отправлен
            resp.end();
        })
        process.exit();
    }, LIMIT)
}

app.get('/date', (req, resp, next) => {
    if (!connections.length) {
        connectionsTimer()
    }
    setConnection(resp);
    appLog();
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})

process.on('exit', () => {
    console.warn('Закончили');
})

// Чтобы обратиться к этому серверу через консоль: "curl http://localhost:3000/date"