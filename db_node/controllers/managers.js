const db = require('../utils/database')

exports.getManagers = async (req, res) => {
    try{
        const sus = await db.query(`
        SELECT mp.manager_id, mp.manager_name, mp.manager_surname, mp.org_name, sum(mp.funding) total_funding
        FROM (SELECT m.manager_id, m.manager_name, m.manager_surname, p.project_id, p.org_name, p.funding
             FROM manager m INNER JOIN project p ON m.manager_id = p.manager_id
             WHERE exists (SELECT * FROM corporation c WHERE c.org_name = p.org_name)) mp
        GROUP BY mp.manager_name, mp.manager_surname, mp.org_name, mp.manager_id
        ORDER BY total_funding DESC
        LIMIT 5;
        `)
        const response = await db.query("SELECT * FROM manager");
        res.render('managers.ejs',{
            pageTitle: "managers page",
            managers: response.rows,
            sus: sus.rows
        })
    }
    catch(error) {
        console.log(error);
        res.redirect('/home');
    }
}

exports.postManager = async (req, res, next) => {
    const name = req.body.name;
    const surname = req.body.surname;
    try{
        await db.query("INSERT INTO manager (manager_name , manager_surname) VALUES ($1, $2)",[name, surname]);
    }
    catch(err){
        console.error(err);
    }
    res.redirect('/managers');

}
/* Controller to update a student in the database */
exports.postUpdateManager = async (req, res, next) => {
    /* get necessary data sent */
    const id = parseInt(req.body.id);
    const name = req.body.name;
    const surname = req.body.surname;
    try{
        await db.query("UPDATE manager SET manager_name = $1 , manager_surname = $2 WHERE manager_id = $3",[name, surname, id]);
    }
    catch(err) {
        console.error(err);
    }
    res.redirect('/managers');
};
exports.deleteManager = async (req, res, next) => {
    const id = parseInt(req.body.id);
    try{
        await db.query("DELETE FROM manager WHERE manager_id = $1",[id]);
    }
    catch(err){
        console.error(err);
    }
    res.redirect('/managers');
};
