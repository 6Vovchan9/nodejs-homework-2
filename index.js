const express = require('express');

const app = express(); // Инициализируем express приложение

const LIMIT = process.env.LIMIT || 20;
const DELAY = process.env.DELAY || 1000;
const PORT = process.env.PORT || 3000;

let connections = []; // Переменная в которой храним соединение

app.get('/date', (req, resp, next) => {
    resp.setHeader('Content-type', 'text/html; charset=utf-8');
    resp.setHeader('Transfer-Encoding', 'chunked'); // Таким образом указываем, что ответ передаем по кусочкам, а не сразу передаем весь ответ и закрываем соединение
    connections.push(resp); // Сохраняем resp (объект при помощи которого мы сможем отправлять данные) в пуле соединений
});

let tick = 0;
setTimeout(function run() {
    console.log(`Tick: ${tick}`, new Date());
    if (++tick > LIMIT) {
        connections.map(res => {
            res.write('END\n') // Метод write не закрывает соединение, можно его исп чтоб отправлять данные кусочками, а render отправляем ответ и закрывает соед когда ответ полностью отправлен
            res.end()
        })
        connections = [];
        tick = 0
    }
    connections.map((resp, i) => {
        resp.write(`Hello ${i+1} client! Tick: ${tick}.\n`)
    })
    setTimeout(run, DELAY)
}, DELAY)

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})

// setTimeout(() => process.exit(),7000);

// process.on('exit', () => {
//     console.warn('Завершаем!');
// })

// Чтобы обратиться к этому серверу через консоль: "curl http://localhost:3000/date"