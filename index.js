const express = require('express');
const pug = require('pug');
const path = require('path')

const app = express(); // Инициализируем express приложение

const LIMIT = process.env.LIMIT || 20;
const DELAY = process.env.DELAY || 1000;
const PORT = process.env.PORT || 3000;

let connections = []; // Переменная в которой храним соединение

app.set('views', path.join(__dirname, 'views')); // Путь до каталога где лежат шаблоны
app.set('view engine', 'pug') // устанавливаем движок рендеринга

app.use(function(req, res, next) { // function - это функция промежуточной обработки (middleware). Порядок промежуточных ПО Важен!
    console.log('Наше промежуточное ПО');
    next();
  })

app.use(express.static(__dirname + "/public")); // Определение статических ресурсов. Функция 'app.use' позволяет добавлять различные компоненты (middleware или промежуточное ПО) в процесс обработки запроса. 'express.static' - функция промежуточной обработки. Файлы хранящиеся на сервере а не в базе данных.
// app.use('/', require('./routes/route.js'));

app.all('*', (req, resp, next) => {
    console.log('Я выполняюсь для любого запроса и передам запрос дальше по очереди ...')
    next(); // функция передает выполнение следующему обработчику
})

app.get('/render', (req, resp, next) => {
    resp.render('index', {f: {status: 'All right!'}});
})

app.get('/about', (req, resp, next) => {
    resp.send('<a href="about.html">About</a>'); // Этот путь express будет брать из статики, так как такого маршрута в файле index.js нет
})

app.get('/da?ta', (req, resp, next) => {
    resp.setHeader('Content-type', 'text/html; charset=utf-8');
    resp.setHeader('Transfer-Encoding', 'chunked'); // Таким образом указываем, что ответ передаем по кусочкам, а не сразу передаем весь ответ и закрываем соединение
    connections.push(resp); // Сохраняем resp (объект при помощи которого мы сможем отправлять данные) в пуле соединений
});

app.use(function(req, res, next) { // 2 обработчика снизу нужны на случай когда user обратился к серверу по несущ. пути например "http://localhost:3000/ren", чтоб мы ему что-то отдали, например отдали страницу... "404 - страница не найдена"
    let err = new Error('Not Found!');
    err.status = 404;
    next(err) // Если мы тут проглотим err, т.е. не передадим ее (напишем next()) тогда мы не попадем в функцию ниже, а попадем в через одну ф-ию
})

app.use(function(err, req, res, next) { // Эта middleware только для обработки ошибки!
    res.status(err.status || 500);
    res.render('index', {f: {status: `${err.status} ${err.message}`}});
})

app.use(function(req, res, next) {
    console.warn('Hello');
})

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
        // resp.send('Привет дружок'); // Этот метод вроде как единажды отправляет ответ и закрывает соединение
        resp.status(303);
        resp.write(`Hello ${i+1} client! Tick: ${tick}.\n`);
    })
    setTimeout(run, DELAY)
}, DELAY)

const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${server.address().port}`)
})

// setTimeout(() => process.exit(),7000);

// process.on('exit', () => {
//     console.warn('Завершаем!');
// })

// Чтобы обратиться к этому серверу через консоль: "curl http://localhost:3000/date"