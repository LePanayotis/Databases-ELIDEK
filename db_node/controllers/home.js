const db = require('../utils/database')

exports.getAll = async (req, res, next) => {
    const fields = await db.query('SELECT * FROM scientific_field');
    const over10 = await db.query(`
    SELECT distinct p1.org_name
    FROM (SELECT org_name, starting_year, count(distinct project_id) as projects_per_year
          FROM  (SELECT project_id,org_name, extract(year from starting_date) starting_year FROM project) p
          GROUP BY org_name, starting_year ) p1
          INNER JOIN (SELECT org_name, starting_year, count(distinct project_id) as projects_per_year
                      FROM  (SELECT project_id,org_name, extract(year from starting_date) starting_year FROM project) p
                      GROUP BY org_name, starting_year) p2
          ON p1.org_name = p2.org_name
          WHERE p1.starting_year - p2.starting_year = 1 and p1.projects_per_year = p2.projects_per_year and p1.projects_per_year > 9;
    `)
    const top3 = await db.query(`
    SELECT s1.sf_subject subject1, s2.sf_subject subject2, count(distinct s1.project_id) as comb_cntr
    FROM scientific_field_of s1 INNER JOIN scientific_field_of s2 ON s1.project_id = s2.project_id
    WHERE s1.sf_subject < s2.sf_subject
    GROUP BY s1.sf_subject, s2.sf_subject
    ORDER BY comb_cntr DESC
    LIMIT 3; 
    `);
    const young = await db.query(`
    SELECT t.researcher_id, r.researcher_name, r.researcher_surname, t.pr_number
    FROM (SELECT rp.researcher_id, count(distinct p.project_id) as pr_number
          FROM researcher_on_project rp INNER JOIN project p ON rp.project_id= p.project_id
          WHERE p.final_date-CURRENT_DATE > 0 AND CURRENT_DATE - p.starting_date > 0
          GROUP BY rp.researcher_id) t INNER JOIN researcher r ON r.researcher_id = t.researcher_id
    WHERE r.date_of_birth + 40 * 365 + 10 - CURRENT_DATE > 0
    ORDER BY t.pr_number DESC;
    
    `);
    const lazy = await db.query(`
    SELECT res.researcher_id, res.researcher_name, res.researcher_surname, pr.pr_number
    FROM (SELECT t.researcher_id,  t.pr_number
      FROM (SELECT rp.researcher_id, count(distinct p.project_id) as pr_number
            FROM researcher_on_project rp INNER JOIN project p
            ON rp.project_id= p.project_id
            WHERE p.final_date-CURRENT_DATE > 0 AND CURRENT_DATE - p.starting_date > 0 and not exists (SELECT * FROM report rep WHERE rep.project_id= p.project_id)
            GROUP BY rp.researcher_id) t INNER JOIN researcher r ON r.researcher_id = t.researcher_id
      WHERE t.pr_number  > 4) pr INNER JOIN researcher res ON pr.researcher_id = res.researcher_id;
    `)
    res.render('home.ejs', {
        pageTitle: "HOME SWEET HOME",
        all_sf_fields: fields.rows,
        over10: over10.rows,
        top3: top3.rows,
        young: young.rows,
        lazy: lazy.rows
    })
}

exports.fields = async (req, res, next) => {
    const sf_field = req.body.sf_subject;
    const projects = await db.query(`
        SELECT p.project_id, p.org_name, project_title
        FROM project p INNER JOIN scientific_field_of sf
        ON p.project_id = sf.project_id
        WHERE sf_subject =$1 AND current_date - starting_date < 365
    `,[sf_field]);
    const researchers = await db.query(`
    SELECT r.researcher_id, researcher_name, researcher_surname
    FROM (SELECT researcher_id
          FROM (SELECT p.project_id
                FROM project p INNER JOIN scientific_field_of sf
                ON p.project_id = sf.project_id
                WHERE sf.sf_subject = $1 AND current_date - starting_date < 365) t
                INNER JOIN researcher_on_project rp ON t.project_id = rp.project_id) q
                INNER JOIN researcher r ON q.researcher_id = r.researcher_id;
    
    `,[sf_field]);
    res.render('trending_field.ejs',{
        pageTitle: "Info on trending field",
        projects: projects.rows,
        researchers: researchers.rows
    })
}