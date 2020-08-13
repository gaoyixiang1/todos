const express = require('express');
const path = require('path');
const mysql = require('mysql');
const bodyParser = require('body-parser')
const app = express();

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, 'public')));
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'Login',
    charSet: 'UTF-8',
    port: '3306'
})

connection.connect(function (err) {
    if (err) throw err;
    console.log('success');
})

app.get('/init', (req, res) => {
    const selectStr = `select * from todos`;
    connection.query(selectStr, (err, result) => {
        if (err) throw err;
        const data = JSON.parse(JSON.stringify(result));
        const word = deal(data)
        res.send(word);
    })
})

app.post('/addTask', (req, res) => {
    let task = {};
    task.title = req.body.title;
    task.completed = 'false'
    const taskArr = [task.title, task.completed]
    const addStr = `insert into todos (title,completed) values(?,?)`;
    connection.query(addStr, taskArr, (err, result) => {
        if (err) throw err;
        if (result.affectedRows === 1) {
            const selectStr = `select * from todos where title = '${taskArr[0]}'`
            connection.query(selectStr, (err, result) => {
                if (err) throw err;
                const data = JSON.parse(JSON.stringify(result));
                var word = deal(data)
                res.send(word);
            })
        }
    })

})



app.get('/deleteTask', (req, res) => {
    const id = req.query.id;
    const selectStr = `select * from todos where id = '${id}'`
    const deleteStr = `delete  from todos where id = '${id}'`
    connection.query(selectStr, (err, result) => {
        if (err) throw err;
        const data = JSON.parse(JSON.stringify(result));
        var word = deal(data)
        connection.query(deleteStr, (err, result) => {
            if (err) throw err;
            res.send(word);
        })
    })
})

app.post('/changeTask', (req, res) => {
    const id = req.body.id;
    const status = `'${req.body.completed}'`;
    const title = req.body.title;
    let  updateStr
    if(typeof title == 'undefined'){
        updateStr = `update todos set  completed = ${status} where id=${id}`
    }else{
        updateStr = `update todos set  title = '${title}' where id=${id}`
    }
    
    connection.query(updateStr, (err, result) => {
        if (err) throw err;
        const selectStr = `select * from todos where id = '${id}'`
        connection.query(selectStr, (err, result) => {
            if (err) throw err;
            const data = JSON.parse(JSON.stringify(result));

            var word = deal(data)
            res.send(word);
        })
    })

})

app.get('/clearAll',(req,res)=>{
    const deleteStr = `TRUNCATE TABLE todos`
    connection.query(deleteStr, (err, result) => {
        if (err) throw err;
        const taskArry = [];
        res.send(taskArry);
    })
})


function deal(data) {
    for (let i in data) {
        if (data[i].completed == 'true') {
            data[i].completed = 'checked';
        } else {
            data[i].completed = '';
        }
    }
    return data;
}
app.listen(9000, function () {
    console.log('http://localhost:9000');
})
