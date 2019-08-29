const chalk = require('chalk');

class Logs {
  constructor() { }

  display(message, color, decorate = false) {
    if (decorate) {
      console.log(chalk[color]('\n' + '############# ' + message + ' ############' + '\n'));
    } else {
      console.log(chalk[color]('\n' + message + '\n'));
    }
  }
}

module.exports = Logs;
