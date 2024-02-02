const express = require('express');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');

/* ROUTES and how to import routes */
const elidek_managers = require('./routes/elidek_managers');
const elidek_programs = require('./routes/elidek_programs');
const organisations = require('./routes/organisations');
const researchers = require('./routes/researchers');
const projects = require('./routes/projects');
const home = require('./routes/home');
/* end of ROUTES and how to import routes */

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(flash());
app.use(session({
    secret: "ThisShouldBeSecret",
    resave: false,
    saveUninitialized: false
}));

/*Routes used by the project */
app.use('/managers', elidek_managers);
app.use('/programs', elidek_programs);
app.use('/organisations', organisations);
app.use('/researchers', researchers);
app.use('/projects',projects);
app.use('/home', home);
/* End of routes used by the project*/

// In case of an endpoint does not exist must return 404.html

app.use((req, res, next) => { res.status(404).render('404.ejs', { pageTitle: '404' }) })

module.exports = app;