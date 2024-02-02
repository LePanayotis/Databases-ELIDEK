const app = require('./app');

const chalk = require("chalk");

const port = 3000;


app.listen(port, () => {
    console.log(chalk.green(`🚀 Server running on port ${port}!`));
});