#!/usr/bin/env node

const { exec } = require('child_process');
const inquirer = require('inquirer')
const colors = require('colors');

async function main() {
  try {
    await new Promise((resolve, reject) => {
      exec(`git diff --name-only --cached | wc -l`, (error, stdout, stderr) => {
        if(error) {
          reject(error);
        }
      
        const isOk = parseInt(stdout) > 0;
        if(!isOk) {
          console.error("You do not have staged files.".red)
          reject();
        }
  
        resolve();
      })
    })
  } catch(e) {
    return;
  }


  console.info("Format of the commit message: \n".grey+ '<type>(<scope>): <subject>'.green);
  console.log();
  
  const prompt = inquirer.createPromptModule();
  prompt([
    {
      type: 'list',
      name: 'type',
      message: 'Please select the <type>:',
      choices: [
        {name: 'Feature', value: "feat" },
        {name: 'Fix', value: "fix" },
        {name: 'Documentation', value: "docs" },
        {name: 'Code Style', value: "style" },
        {name: 'Refactor', value: "refactor" },
        {name: 'Test', value: "test" },
        {name: 'Chore', value: "chore" }
      ]
    },
    {
      type: 'input',
      name: 'scope',
      message: 'What is the <scope>?'
    },
    {
      type: 'input',
      name: 'subject',
      message: 'What is the <subject>?'
    }
  ]).then(({type, scope, subject}) => {
    console.log();
  
    subject = subject.toLowerCase();
    scope = scope.toLowerCase();
  
    const command = `git commit -m "${type}(${scope}): ${subject}"`
    
    exec(command, (error, stdout, stderr) => {
      if(error) {
        return console.error('Failed to commit.'.red)
      }
  
      const rows = stdout.split("\n");
      for(let i = 0; i< rows.length; i++ ){
        if(i === 0) {
          console.info(rows[i].green);
        } else {
          console.info(rows[i].white);
        }
      }
    })
  });
}


main();