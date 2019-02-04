#!/usr/bin/env node

const { exec, spawn } = require('child_process');
const inquirer = require('inquirer')
const colors = require('colors');

const results = [];
inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'));

function getFilesList() {
  return new Promise((resolve, reject) => {
    let results = new Set();
    var child = spawn(`find`, ['.', '-not' ,"-path" ,"'*/\.*'"]);

    child.stdout.on('data', function (data) {
      let chunk = String(data);
      chunk = chunk.replace(/[\n.'"]/g,'')
      const files = chunk.split('/')

      files.forEach((file) => {
        file = file.trim();
        if(file) {
          results.add(file);
        }
      })
    });
    
    child.on('close', function (code) {
      resolve(Array.from(results));
    });
  });
}

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

  const files = await getFilesList();
  console.log(files);

  console.info("Format of the commit message: \n".grey+ '<type>(<scope>): <subject>'.green);
  console.log();
  

  inquirer.prompt([
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
      type: 'autocomplete',
      name: 'scope',
      message: 'Select a scope',
      source: function(answersSoFar, input) {
        const relevantFiles = files.filter(result => result.match(input));
        relevantFiles.push(input + " ");
        // options = options.concat(relevantFiles);
        // console.log(relevantFiles)
        return Promise.resolve(relevantFiles);
      }
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