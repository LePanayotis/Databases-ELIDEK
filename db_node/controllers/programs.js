const db = require('../utils/database')

/* Controller to retrieve grades from database */
exports.getPrograms = async (req, res) => {
    const response = await db.query("SELECT * FROM program");
    res.render('programs.ejs',{
        pageTitle: "Programs page",
        programs: response.rows,
    })
}

exports.postProgram = async (req, res, next) => {

    const title = req.body.title;
    const department = req.body.department;
    try{
        await db.query("INSERT INTO program (title , department) VALUES ($1, $2)",[title, department]);
    }
    catch(err){
        console.error(err);
    }
    res.redirect('/programs');

}
/* Controller to update a student in the database */
exports.postUpdateProgram = async (req, res, next) => {
    /* get necessary data sent */
    const title = req.body.title;
    const department = req.body.department;
    try{
        await db.query("UPDATE program SET department = $1 WHERE  title = $2",[department, title]);
    }
    catch(err) {
        console.error(err);
    }
    res.redirect('/programs');
};
exports.deleteProgram = async (req, res, next) => {
    const title = req.body.title;
    try{
        await db.query("DELETE FROM program WHERE title = $1",[title]);
    }
    catch(err){
        console.error(err);
    }
    res.redirect('/programs');
};
