const express       = require('express');
const app           = express();
const path          = require('path');
const Datastore     = require('nedb');
const cookieSession = require('cookie-session');

var db = new Datastore({filename: "users"});

app.set('views', './views');
app.set('view engine', 'jade');

app.use(express.static(__dirname + '/public'));

app.use(express.json());       
app.use(express.urlencoded({extended: true}));

app.use(cookieSession({
  name: 'session',
  keys: ['key'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));



app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/index.html'));
});

function loadUser(req, res, next) {
    if (!req.session.isLogged) {
        next(); 
    } else {
        res.redirect('/'); 
    }
}

app.route('/register') 

    .get(loadUser, (req, res) => {
        res.render('register', {
        title: 'Register', 
        button: 'Register',
        type: 'reg'});
    })

    .post((req, res) => {
        let username = req.body.username;
        let password = req.body.password;
        db.loadDatabase();
        
        db.find({username: username}, (err, docs) => {
            if (err) {
                console.log("Something went wrong", err); 
            }
            console.log("docs", docs);
            
            if (!docs[0]) {
                db.insert({username: username, password: password}, (err, newDoc) => {
                    if (err) {
                        console.log("Something went wrong"); 
                    } 
                    console.log(newDoc);
                    req.session.isLogged = true; 
                    res.redirect('/');
                });
            } else {
                res.redirect('/login');
            }
        });
    });

app.route('/login')
    .get(loadUser, (req, res) => {
        res.render('login', {
        title: 'Login', 
        button: 'Login',
        type: 'log'});
    })
    .post((req, res) => {

        let username = req.body.username;
        let password = req.body.password;
        db.loadDatabase();

        db.find({username: username}, (err, docs) => {
            if (err) {
                console.log("Something went wrong", err); 
            }
            console.log("docs", docs);

            if (!docs[0]) {
                res.redirect('/login');
            } else {
                if (password == docs[0].password) {
                    req.session.isLogged = true;
                    res.redirect('/'); 
                } else {
                    res.redirect('/login'); 
                }
            }
        });

    });

app.get('/logout', (req, res) => {
    req.session.isLogged = false;
    res.redirect('/');
});

app.listen(3000);

console.log('Magic on port 3000');
