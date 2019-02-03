const { exec } = require('child_process');
const inquirer = require('inquirer')

var prompt = inquirer.createPromptModule();
 
prompt([
  {
    type: 'list',
    name: 'type',
    message: 'Please select a type:',
    choices: [{name: 'Feature', value: "feat" },{name: 'Fix', value: "fix" }, {name: 'Documentation', value: "docs" }, {name: 'Code Style', value: "style" }, {name: 'Refactor', value: "refactor" }, {name: 'Test', value: "test" }, {name: 'Chore', value: "chore" }]
  },
  {
    type: 'input',
    name: 'scope',
    message: 'What is the scope?'
  },
  {
    type: 'input',
    name: 'subject',
    message: 'What is the subject?'
  }
]).then(({type, scope, subject}) => {
  subject = subject.toLowerCase();
  scope = scope.toLowerCase();

  const command = `git commit -m "${type}(${scope}): ${subject}"`
  console.log(command)
  exec(command)
  
});