const express       = require('express');
const app           = express();
const path          = require('path');
const cookieSession = require('cookie-session');
//const favicon       = require('serve-favicon');
const mysql         = require('mysql');

function parseResult(result) {
    let array = [];
    let ids = [];

    for (let i = 0; i < result.length; i++) {
        if (!ids.includes(result[i].list_id)) {
            ids.push(result[i].list_id);
            array.push({ id: result[i].list_id, name: result[i].list_name, data: [] });
        }
    }

    for (let i = 0; i < ids.length; i++) {
        for (let j = 0; j < result.length; j++) {
            if (ids[i] == result[j].list_id) {
                array[i].data.push({ name: result[j].item_name, count: result[j].count });
                result.splice(j, 1);
                j -= 1;
            }
        } 
    }
    return array;
}

function loginRequired(req, res, next) {
    if (req.session.isLogged) {
        next();    
    } else {
        res.redirect('/login'); 
    }
}

function notLoggedOnly(req, res, next) {
    if (req.session.isLogged) {
        res.redirect('/'); 
    } else {
        next();
    }
}

let connection = mysql.createConnection({
    host                : 'localhost',
    user                : 'root',
    password            : '1',
    database            : 'buylist_app',
    multipleStatements  : true
});

connection.connect((err) => {
        if (err) {
            console.log("Smth went wrong ", err); 
        } 

        console.log("Successfully connected");
});


app.set('views', './views');
app.set('view engine', 'jade');

app.use(express.static(__dirname + '/public'));
app.use('/lists', express.static(__dirname + '/public'));
//app.use(favicon(__dirname + '/public/favicon.ico'));

app.use(express.json());       
app.use(express.urlencoded({extended: true}));

app.use(cookieSession({
  name: 'session',
  keys: ['key'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

app.use((req, res, next) => {
    console.log(req.session);
    if (req.session.isLogged) {
        res.locals.isLogged = true;
    } else {
        res.locals.isLogged = false;
    }

    next();
});

app.get('/', (req, res) => {

    if (req.session.isLogged) {
        
        let queryStr = "SELECT lists.list_id, lists.list_name, items.item_name, items.count " +
                       "FROM lists " +
                       "LEFT JOIN items " +
                       "ON lists.list_id=items.list_id WHERE user_id = " +
                       connection.escape(req.session.userId);

        connection.query(queryStr, (err, result) => {
            if (err) {
                console.log(err); 
            } else {
                res.locals.lists = parseResult(result);
                res.render('home', {title: 'Buy list'});
            } 
        });
    } else {
        res.locals.lists = [];
        res.render('home', {title: 'Buy list'});
    }
});

app.route('/create')
    
    .get(loginRequired, (req, res) => {
        res.render('create', {
            title: 'create',
            type: 'create'
        });
    })

    .post(loginRequired, (req, res) => {
        
        connection.query("INSERT INTO lists (user_id, list_name) VALUES (?, ?)", [req.session.userId, req.body.listname], (err, result) => {
            if (err) {
                console.log(err); 
                res.redirect('/create');
            } else {
                res.redirect('/'); 
            }
        });
    });

app.route('/register') 

    .get(notLoggedOnly, (req, res) => {
        res.render('register', {
            title: 'Register', 
            button: 'Register',
            type: 'register'
        });
    })

    .post((req, res) => {
        let username = req.body.username;
        let password = req.body.password;
        
        connection.query("INSERT INTO users (name, password) VALUES (?, ?)", [username, password], (err, result) => {
            if (err) {
                console.log(err);
                res.redirect('/register'); 
            } else {
                req.session.isLogged = true;
                req.session.userId = result.insertId;
                
                res.redirect('/');
            }
        });
    });

app.route('/login')
    .get(notLoggedOnly, (req, res) => {
        res.render('login', {
        title: 'Login', 
        button: 'Login',
        type: 'login'});
    })

    .post((req, res) => {

        let username = req.body.username;
        let password = req.body.password;
        
        let queryStr = "SELECT password, user_id FROM users WHERE name = " + 
                       connection.escape(username);
        
        connection.query(queryStr, (err, result) => {
            if (err) {
                console.log(err); 
            }

            if (password == result[0].password) {
                req.session.isLogged = true;
                req.session.userId = result[0].user_id;

                res.redirect('/');
            } else {
                res.locals.wrongLogOrPass = true;

                res.render('login', {
                title: 'Login', 
                button: 'Login',
                type: 'login'});
            }
        });
    });

app.route('/lists/') 
    .get(loginRequired, (req, res) => {
        let query = "SELECT item_name, count FROM items WHERE list_id = " +
                    connection.escape(req.query.id);
        connection.query(query, (err, result) => {
            if (err) {
                console.log(err); 
                res.redirect('/');
            } else {
                console.log(result); 
                let isItems = false;

                if (result.length) {
                    isItems = true;
                }
                console.log(isItems);

                res.render('list', {
                    title   : req.query.name,
                    id      : req.query.id,
                    name    : req.query.name,
                    items   : result,
                    isItems : isItems
                });
            }
        });
    })

    .post((req, res) => {
        connection.query("INSERT INTO items (list_id, item_name, count) VALUES (?, ?, ?)", 
                         [req.query.id, req.body.item, req.body.itemNumber], (err, result) => {
                            if (err) {
                                console.log(err); 
                                res.redirect('/');
                            } else {
                                res.redirect('/lists?name=' + req.query.name + '&id=' + req.query.id);
                            }
        });
    });

app.post('/removeitem/', (req, res) => {
        
        let items = [];
        console.log(req.body); 

        for (var prop in req.body) {
            items.push(prop); 
        }
        
        console.log(items);
        for (let i = 0; i < items.length; i++) {
            let query = "DELETE FROM items WHERE list_id = " + 
                        connection.escape(req.query.id)      +
                        "AND item_name = "                   +
                        connection.escape(items[i]);
            connection.query(query, (err) => {
                if (err) {
                    console.log(err); 
                } 
            });
        }

        res.redirect('/lists?name=' + req.query.name + '&id=' + req.query.id);
    });

app.post('/remove/:id', (req, res) => {

        console.log("GOT REMOVE BY");
        let query1 = "DELETE FROM lists WHERE list_id = " + 
                     connection.escape(req.params.id);
        let query2 = "DELETE FROM items WHERE list_id = " +
                     connection.escape(req.params.id);

        connection.query(query1 + ";" + query2, (err, result) => {
            if (err) {
                console.log(err); 
            } else {
                res.redirect('/'); 
            }
        });
});

app.get('/logout', (req, res) => {
    req.session = null;
    res.redirect('/');
});

app.get('/test', (req, res) => {
    res.render('test', {title: 'Test'});
});

app.listen(3000);

console.log('Magic on port 3000');
