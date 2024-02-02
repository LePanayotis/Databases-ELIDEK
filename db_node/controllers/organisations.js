const { stringify } = require('nodemon/lib/utils');
const db = require('../utils/database')

exports.getOrgs = async (req, res) => {
    const response = await db.query("SELECT * FROM organisation");
    res.render('organisations.ejs', {
        pageTitle: "organisations page",
        orgs: response.rows,
    })
}
exports.postUpdateOrg = async (req, res, next) => {
    /* get necessary data sent */
    const org_name = req.body.org_name;
    const abbreviation = req.body.abbreviation;
    const street = req.body.street;
    const city = req.body.city;
    const street_number = parseInt(req.body.street_number);
    const postal_code = req.body.postal_code;
    try {
        if (isNaN(street_number)) {
            await db.query("UPDATE organisation SET abbreviation = $2 , street = $3 , street_number = NULL, city = $4, postal_code = $5  WHERE org_name = $1", [org_name, abbreviation,
                street, city, postal_code]);
        }
        else {
            await db.query("UPDATE organisation SET abbreviation = $2 , street = $3 , street_number = $4, city = $5, postal_code = $6  WHERE org_name = $1", [org_name, abbreviation,
                street, street_number, city, postal_code]);
        }
    }
    catch (err) {
        console.error(err);
    }
    res.redirect('/organisations');
};
exports.postOrg = async (req, res, next) => {
    /* get necessary data sent */
    const org_name = req.body.org_name;
    const abbreviation = req.body.abbreviation;
    const street = req.body.street;
    const city = req.body.city;
    const street_number = req.body.street_number;
    const postal_code = req.body.postal_code;
    const category = req.body.category;
    try {
        if (isNaN(street_number)) {
            await db.query("INSERT INTO organisation (org_name, abbreviation , street , street_number , postal_code, city, category) VALUES ($1,$2,$3, NULL ,$5,$6)", [org_name, abbreviation,
                street, postal_code, city, category]);
        }
        else {
            await db.query("INSERT INTO organisation (org_name, abbreviation , street , street_number , postal_code, city, category) VALUES ($1,$2,$3,$4,$5,$6,$7)", [org_name, abbreviation,
                street, street_number, postal_code, city, category]);
        }
        if (category == "university") {
            await db.query("INSERT INTO university (org_name, public_funds) VALUES ($1, 0)", [org_name]);
        }
        else if (category == "corporation") {
            await db.query("INSERT INTO corporation (org_name, private_funds) VALUES ($1, 0)", [org_name]);
        }
        else {
            await db.query("INSERT INTO research_center (org_name, public_funds, private_funds) VALUES ($1, 0, 0)", [org_name]);
        }
    }
    catch (err) {
        console.error(err);
    }
    res.redirect('/organisations');
};
exports.deleteOrg = async (req, res, next) => {
    /* get necessary data sent */
    const org_name = req.body.org_name;
    const category = req.body.category;
    try {
        if (category == "university") {
            await db.query("DELETE FROM university WHERE org_name = $1", [org_name])
        }
        else if (category == "corporation") {
            await db.query("DELETE FROM corporation WHERE org_name = $1", [org_name])
        }
        else {
            await db.query("DELETE FROM research_center WHERE org_name = $1", [org_name])
        }
        await db.query("DELETE FROM organisation WHERE org_name = $1", [org_name])
    }
    catch (err) {
        console.error(err);
    }

    res.redirect('/organisations');
};

exports.getDetails = async (req, res, next) => {
    const org_name = req.body.org_name;
    const category = req.body.category;
    details(res, org_name, category);
}

async function details(res, org_name, category) {
    try {
        const numbers = await db.query("SELECT t_number FROM telephone_number WHERE org_name = $1", [org_name]);
        const budgets = await db.query(`SELECT * FROM ${stringify(category)} WHERE org_name = $1`, [org_name]);
        res.render('orgdetails.ejs', {
            pageTitle: "Details page",
            numbers: numbers.rows,
            category: category,
            org_name: org_name,
            budgets: budgets.rows[0]
        })
    }
    catch (err) {
        console.error(err);
    }
}

exports.deleteTelephone = async (req, res, next) => {
    const org_name = req.body.org_name;
    const category = req.body.category;
    const telephone_number = req.body.telephone_number;
    try {
        await db.query("DELETE FROM telephone_number WHERE t_number = $1", [telephone_number]);
        details(res, org_name, category);
    }
    catch (error) {
        console.log(error);
        res.redirect('/organisations');
    }
}
exports.addTelephone = async (req, res, next) => {
    const org_name = req.body.org_name;
    const category = req.body.category;
    const telephone_number = req.body.telephone_number;
    try {
        await db.query("INSERT INTO telephone_number (org_name , t_number) VALUES ($1, $2)", [org_name, telephone_number]);
    }
    catch (err) {
        console.log(err);
    }
    details(res, org_name, category);
}
exports.updateBudgets = async (req, res, next) => {
    const org_name = req.body.org_name;
    const category = req.body.category;
    var public_funds, private_funds;
    try {
        if (category != "university") {
            private_funds = req.body.private_funds;
            await db.query(`UPDATE ${stringify(category)} SET private_funds = $2 WHERE org_name = $1`, [org_name, private_funds]);
        }
        if (category != "corporation") {
            public_funds = req.body.public_funds;
            await db.query(`UPDATE ${stringify(category)} SET public_funds = $2 WHERE org_name = $1`, [org_name, public_funds]);
        }
        details(res, org_name, category);
    }
    catch (err) {
        res.redirect('/organisations');
    }
}