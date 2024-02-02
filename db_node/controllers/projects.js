const { all } = require('../routes/researchers');
const db = require('../utils/database')

/* Controller to retrieve grades from database */
exports.getProjects = async (req, res) => {
    try {
        const response = await db.query("SELECT project_id, project_title, summary, funding, starting_date::text,  final_date::text, program_title, manager_id, org_name, assessor_id, score, assessment_date::text FROM project");
        const programs = await db.query("SELECT title FROM program")
        const orgs = await db.query("SELECT org_name FROM organisation")
        const managers = await db.query("SELECT * FROM manager")
        const assessors = await db.query("SELECT researcher_id, researcher_name, researcher_surname FROM researcher")
        res.render('projects.ejs', {
            pageTitle: "projects page",
            projects: response.rows,
            programs: programs.rows,
            orgs: orgs.rows,
            managers: managers.rows,
            assessors: assessors.rows
        })
    }
    catch (err) {
        console.log(err);
        res.redirect('/home')
    }
}

exports.filteredProjects = async (req,res) => {
    var manager_id = req.body.manager_id;
    var starting_date = req.body.starting_date;
    var duration = req.body.duration;
    console.log(manager_id, starting_date, duration)
    var query ="";
    if (manager_id=="ANY")
        query = query + ` manager_id IS NOT NULL`;
    else{
        query = query + ` manager_id = ${manager_id}`;
    }
    if (starting_date=="") {
            starting_date = "1972-01-01";
    }
    query = query +" AND "
    if(duration == ""){
        query = query + `duration IS NOT NULL `;
    }
    else{
        query = query + `duration = ${duration} `;
    }
    //console.log(query)
    try{
    const response = await db.query(`SELECT project_id, project_title, summary, funding, starting_date::text,  final_date::text, program_title, manager_id, org_name, assessor_id, score, assessment_date::text FROM project
                                        WHERE ${query} AND starting_date > $1`,[starting_date]);
    const programs = await db.query("SELECT title FROM program")
    const orgs = await db.query("SELECT org_name FROM organisation")
    const managers = await db.query("SELECT * FROM manager")
    const assessors = await db.query("SELECT researcher_id, researcher_name, researcher_surname FROM researcher")
    res.render('projects.ejs', {
        pageTitle: "projects page",
        projects: response.rows,
        programs: programs.rows,
        orgs: orgs.rows,
        managers: managers.rows,
        assessors: assessors.rows
    })}
    catch (error) {
        console.log(error);
        res.redirect('/projcts');
    }
}

exports.deleteProject = async (req, res, next) => {
    const project_id = req.body.project_id;
    try{
    await db.query("DELETE FROM scientific_field_of WHERE project_id = $1", [project_id]);
    await db.query("DELETE FROM report WHERE project_id = $1", [project_id]);
    await db.query("DELETE FROM researcher_on_project WHERE project_id = $1", [project_id]);
    await db.query("DELETE FROM project WHERE project_id = $1", [project_id]);
    }
    catch(err){console.log(err);}
    res.redirect('/projects');
}

exports.postProject = async (req, res, next) => {
    const project_title = req.body.project_title;
    const funding = req.body.funding;
    const starting_date = req.body.starting_date;
    const final_date = req.body.final_date;
    const program_title = req.body.program_title;
    const org_name = req.body.org_name;
    const score = req.body.score;
    const scientific_manager_id = req.body.scientific_manager_id;
    const assessor_id = req.body.assessor_id;
    const assessment_date = req.body.assessment_date;
    const manager_id = req.body.manager_id;
    const summary = req.body.summary;
    try {
        await db.query(`INSERT INTO project (project_title , funding , starting_date, 
            final_date, program_title, org_name, score, assessor_id, 
            assessment_date, manager_id, summary, scientific_manager_id) 
            VALUES ($1,$2,$3, $4, $5, $6,$7,$8,$9, $10, $11, $12)`,
            [project_title, funding, starting_date, final_date, program_title, org_name, score, assessor_id, assessment_date, manager_id, summary, scientific_manager_id]);
    }
    catch (err) {
        console.error(err);
    }
    res.redirect('/projects');

}
exports.getDetails = async (req, res, next) => {
    const project_id = req.body.project_id;
    details(req, res, project_id);

}

async function details(req, res, project_id) {
    try {
        const org_name = await db.query(`SELECT org_name FROM project WHERE project_id = $1`, [project_id]);
        const reports = await db.query(`SELECT report_title, report_summary, due_date::text FROM report WHERE project_id = $1`, [project_id]);
        const all_sf_fields = await db.query(`SELECT * FROM scientific_field`)
        const scientific_fields = await db.query(`SELECT * FROM scientific_field_of WHERE project_id = $1`, [project_id]);
        const researchers = await db.query(`SELECT  r.researcher_id , r.researcher_name , r.researcher_surname 
    FROM project p , researcher_on_project rp  , researcher r WHERE p.project_id = rp.project_id AND rp.researcher_id = r.researcher_id AND p.project_id = $1`, [project_id]);
        const response = await db.query("SELECT project_id, project_title, summary, funding, starting_date::text,  final_date::text, program_title, manager_id, org_name, assessor_id, score, assessment_date::text, scientific_manager_id FROM project WHERE project_id = $1", [project_id]);
        const programs = await db.query("SELECT title FROM program")
        const managers = await db.query("SELECT * FROM manager")
        const assessors = await db.query("SELECT researcher_id, researcher_name, researcher_surname FROM researcher")
        const add_researchers = await db.query("SELECT researcher_id, researcher_name, researcher_surname FROM researcher WHERE org_name =$1", [org_name.rows[0].org_name]);
        res.render('projectdetails.ejs', {
            pageTitle: "project details",
            project: response.rows[0],
            programs: programs.rows,
            managers: managers.rows,
            assessors: assessors.rows,
            reports: reports.rows,
            researchers: researchers.rows,
            scientific_fields: scientific_fields.rows,
            add_researchers: add_researchers.rows,
            all_sf_fields: all_sf_fields.rows
        })
    } catch (e) {
        console.log(e);
        res.redirect('/projects');
    }
}

exports.postUpdateProject = async (req, res, next) => {
    try {
        const project_id = req.body.project_id;
        const project_title = req.body.project_title;
        const funding = req.body.funding;
        const starting_date = req.body.starting_date;
        const final_date = req.body.final_date;
        const program_title = req.body.program_title;
        const score = req.body.score;
        const assessor_id = req.body.assessor_id;
        const assessment_date = req.body.assessment_date;
        const manager_id = req.body.manager_id;
        const scientific_manager_id = req.body.scientific_manager_id;
        const summary = req.body.summary;
        await db.query(` UPDATE project SET project_title=$1, funding=$2, 
        starting_date=$3, final_date=$4, program_title=$5, 
        score=$6, assessor_id=$7, assessment_date=$8, manager_id=$9, summary=$10, scientific_manager_id=$11
        WHERE project_id = $12 `, [project_title, funding, starting_date, final_date, program_title, score, assessor_id, assessment_date, manager_id, summary, scientific_manager_id,project_id]);
        details(req, res, project_id);
    }
    catch (err) {
        console.log(err);
        res.redirect('/projects');
    }
}
exports.addResearcher = async (req, res, next) => {
    const project_id = req.body.project_id;
    const researcher_id = req.body.new_researcher;
    try {
        await db.query("INSERT INTO researcher_on_project (project_id, researcher_id) VALUES ($1 , $2)", [project_id, researcher_id]);
        details(req, res, project_id);
    } catch (error) {
        console.log(error);
        res.redirect('/projects');
    }
}
exports.addField = async (req, res, next) => {
    const project_id = req.body.project_id;
    const sf_subject = req.body.sf_subject;
    try {
        await db.query("INSERT INTO scientific_field_of (project_id, sf_subject) VALUES ($1 , $2)", [project_id, sf_subject]);
        details(req, res, project_id);
    } catch (error) {
        console.log(error);
        res.redirect('/projects');
    }
}
exports.removeField = async (req, res, next) => {
    const project_id = req.body.project_id;
    const sf_subject = req.body.sf_subject;
    try{
        await db.query(`DELETE FROM scientific_field_of WHERE project_id= $1 AND sf_subject= $2`, [project_id, sf_subject]);
        details(req, res, project_id);
    }
    catch (error) {
        console.log(error);
        res.redirect('/projects');
    }
}
exports.removeResearcher = async (req, res, next) => {
    const project_id = req.body.project_id;
    const researcher_id = req.body.researcher_id;
    try{
        await db.query(`DELETE FROM researcher_on_project WHERE project_id= $1 AND researcher_id= $2`, [project_id, researcher_id]);
        details(req, res, project_id);
    }
    catch (error) {
        console.log(error);
        res.redirect('/projects');
    }
}

exports.removeReport = async (req, res, next) => {
    const project_id = req.body.project_id;
    const report_title = req.body.report_title;
    try{
        await db.query(`DELETE FROM report WHERE project_id= $1 AND report_title= $2`, [project_id, report_title]);
        details(req, res, project_id);
    }
    catch (error) {
        console.log(error);
        res.redirect('/projects');
    }
}
exports.addReport = async (req, res, next) => {
    const project_id = req.body.project_id;
    const report_title = req.body.report_title;
    const report_summary = req.body.report_summary;
    const due_date = req.body.due_date;
    try{
        await db.query(`INSERT INTO report (project_id, report_title,report_summary,due_date) VALUES ($1, $2,$3, $4) `, [project_id, report_title, report_summary,due_date]);
        details(req, res, project_id);
    }
    catch (error) {
        console.log(error);
        res.redirect('/projects');
    }
}