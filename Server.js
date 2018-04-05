const express       = require('express');
const app           = express();
const path          = require('path');
const Datastore     = require('nedb');
const cookieSession = require('cookie-session');
const favicon       = require('serve-favicon');

const usersDB = new Datastore({filename: "users"});
const dataDB = new Datastore({filename: "data"});

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

app.set('views', './views');
app.set('view engine', 'jade');

app.use(express.static(__dirname + '/public'));
app.use('/lists', express.static(__dirname + '/public'));
app.use(favicon(__dirname + '/public/favicon.ico'));

app.use(express.json());       
app.use(express.urlencoded({extended: true}));

app.use(cookieSession({
  name: 'session',
  keys: ['key'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

app.use((req, res, next) => {
    if (req.session.isLogged) {
        res.locals.isLogged = true;
    } else {
        res.locals.isLogged = false;
    }

    next();
});

app.get('/', (req, res) => {
    if (req.session.isLogged) {
        dataDB.loadDatabase();

        dataDB.find({}, (err, docs) => {
            if (err) {
                console.log("Something went wrong"); 
                return;
            }
            res.locals.lists = docs;
            res.locals.isLogged = req.session.isLogged
            res.render('home', {title: 'Buy list'});
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
        dataDB.loadDatabase();
        
        dataDB.insert({name: req.body.listname, 
                       data: []}, (err, doc) => {
            if (err) {
                console.log("Something went wrong", err); 
            } 
            console.log("docs", doc);
            res.redirect('/');
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
        usersDB.loadDatabase();
        
        usersDB.find({username: username}, (err, docs) => {
            if (err) {
                console.log("Something went wrong", err); 
            }
            console.log("docs", docs);
            
            if (!docs[0]) {
                usersDB.insert({username: username, password: password}, (err, newDoc) => {
                    if (err) {
                        console.log("Something went wrong"); 
                    } 
                    console.log(newDoc);

                    req.session.isLogged = true; 
                    res.redirect('/');
                });
            } else {
                res.locals.nameIsBusy = true;
                res.render('register', {
                title: 'Register', 
                button: 'Register',
                type: 'register'});
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
        usersDB.loadDatabase();

        usersDB.find({username: username}, (err, docs) => {
            if (err) {
                console.log("Something went wrong", err); 
            }
            console.log("some docs");
            console.log("docs", docs);

            if (!docs[0] || password != docs[0].password) {
                res.locals.wrongLogOrPass = true;
                res.render('login', {
                title: 'Login', 
                button: 'Login',
                type: 'login'});
            } else {
                req.session.isLogged = true;
                res.redirect('/'); 
            }
        });

    });

app.route('/lists/:name') 
    .get(loginRequired, (req, res) => {
        dataDB.loadDatabase();
        dataDB.find({name: req.params.name}, (err, doc) => {
           
            if (err) {
                res.redirect('/');
                return;
            }

            let isItems = false;
            console.log("Doc.length", doc[0].data.length); 

            if (doc[0].data.length) {
                isItems = true;
            }
            console.log(isItems);

            res.render('list', {
            title: req.params.name,
            name: req.params.name,
            items: doc[0].data,
            isItems: isItems
            });
        });
    })

    .post((req, res) => {
        dataDB.loadDatabase();
        dataDB.update({name: req.params.name}, 
                      {$push: {data: {name: req.body.item, number: req.body.itemNumber}}},
                      {}, 
                      (err) => {
                        if(err) {
                            res.redirect('/');
                            return;
                        } 
                        res.redirect('/lists/' + req.params.name);
        });
    });

app.post('/remove/:name/items', (req, res) => {
        dataDB.loadDatabase();

        let items = [];
 
        for (var prop in req.body) {
            items.push(prop); 
        }

        for (let i = 0; i < items.length; i++) {
            dataDB.update({ name: req.params.name }, { $pull: { data: { name: items[i] } } });;
        }
        res.redirect('/lists/' + req.params.name);
    });

app.post('/remove/:name', (req, res) => {
        dataDB.loadDatabase();

        dataDB.remove({ name: req.params.name }, (err, numRemoved) => {
            console.log("Table ", req.params.name, " removed"); 
            res.redirect('/');
        });
});


app.get('/logout', (req, res) => {
    req.session.isLogged = false;
    res.redirect('/');
});

app.get('/kill', (req, res ) => {
    req.session = null;
    res.redirect('/');
});

app.get('/test', (req, res) => {
    res.render('test', {title: 'Test'});
});

app.listen(3000);

console.log('Magic on port 3000');
