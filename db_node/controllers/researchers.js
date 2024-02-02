const db = require('../utils/database')

/* Controller to retrieve grades from database */
exports.getResearchers = async (req, res) => {
    const researchers = await db.query("SELECT researcher_id, researcher_name, researcher_surname, gender, age(current_date,date_of_birth), date_of_birth::text, contract_date::text, org_name FROM researcher");
    const orgs = await db.query("SELECT org_name FROM organisation");
    res.render('researchers.ejs',{
        pageTitle: "researchers page",
        researchers: researchers.rows,
        orgs: orgs.rows
    })
}

exports.postUpdateResearcher = async (req, res) => {
    const id = req.body.researcher_id;
    const name = req.body.researcher_name;
    const surname = req.body.researcher_surname;
    const date_of_birth = req.body.date_of_birth;
    const contract_date = req.body.contract_date;
    const gender = req.body.gender;
    try{
        await db.query(`UPDATE researcher SET researcher_name = $1 , researcher_surname = $2 , date_of_birth = $5 , contract_date = $6 , gender = $3
                     WHERE researcher_id = $4 `,[name,surname,gender,id, date_of_birth, contract_date]);
    }
    catch(err){
        console.error(err);
    }
    
    res.redirect('/researchers');
}

exports.postResearcher = async (req, res) => {
    const name = req.body.researcher_name;
    const surname = req.body.researcher_surname;
    const date_of_birth = req.body.date_of_birth;
    const contract_date = req.body.contract_date;
    const gender = req.body.gender;
    const org_name = req.body.org_name;
    try{
        await db.query(`INSERT INTO researcher (researcher_name , researcher_surname , date_of_birth , contract_date, gender,
                     org_name) VALUES ($1, $2, $3, $4, $5, $6)`,[name,surname,date_of_birth,contract_date,gender,org_name]);
    }
    catch(err){
        console.error(err);
    }
    
    res.redirect('/researchers');
}

exports.deleteResearcher = async (req, res) => {
    const id = req.body.researcher_id;
    try{
        await db.query(`DELETE FROM researcher_on_project WHERE researcher_id = $1 `, [id]);
        await db.query(`DELETE FROM researcher WHERE researcher_id = $1`,[id]);
        
    }
    catch(err){
        console.error(err);
    }
    
    res.redirect('/researchers');
}

exports.getDetails = async (req, res,next) => {
    const name = req.body.researcher_name;
    const surname = req.body.researcher_surname;
    const id = req.body.researcher_id;
    
    details(req, res, name, surname, id);
}

async function details(req, res, name, surname, id) {
    try{
        const projectlist = await db.query('SELECT p.project_id, p.project_title FROM project p , researcher r WHERE p.org_name = r.org_name AND r.researcher_id = $1',[id]);
        const response = await db.query("SELECT  p.project_id , p.project_title FROM project p , researcher_on_project rp  , researcher r WHERE p.project_id = rp.project_id AND rp.researcher_id = r.researcher_id AND r.researcher_id = $1",[id]);
        res.render('resdetails.ejs',{
            pageTitle: "researcher details page",
            projects: response.rows,
            id: id,
            name: name,
            surname: surname,
            projectlist: projectlist.rows
        })
    }catch(err){
        console.log(err);
        res.redirect('/researchers');
    }
}

exports.appendProject = async (req, res, next) => {
    const project = req.body.projectid;
    const name = req.body.researcher_name;
    const surname = req.body.researcher_surname;
    const id = req.body.researcher_id;
    try{
        await db.query("INSERT INTO researcher_on_project (project_id, researcher_id) VALUES  ($1, $2)", [project, id]);
    }
    catch(err){
        console.error(err);
    }
    details(req, res, name, surname, id);
}

exports.popProject = async (req, res,next) => {
    const project = req.body.projectid;
    const name = req.body.researcher_name;
    const surname = req.body.researcher_surname;
    const id = req.body.researcher_id;
    try{
        await db.query("DELETE FROM researcher_on_project WHERE project_id = $1", [project]);
    }
    catch(err){
        console.error(err);
    }
    details(req, res, name, surname, id);
}