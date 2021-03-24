#!/usr/bin/env node

import yargs from "yargs";
import { exec as execCb } from "child_process";
import { join } from "path";
import { promisify } from "util";
import { readFileSync, writeFileSync } from "fs";
import { spawn } from "child_process";
import { existsSync } from "fs";

const exec = promisify(execCb);

const argv = yargs(process.argv.slice(2))
  .scriptName("create-forgo-app")
  .usage("$0 your-project-name [options]")
  .options({
    template: { type: "string", default: "javascript" },
  }).argv;

const firstArg = argv._[0] ? argv._[0].toString() : undefined;

if (!firstArg) {
  console.log("You need to specify the name of your project.");
  process.exit(1);
} else {
  const projectName = firstArg;
  const projectPath = join(process.cwd(), projectName);

  if (existsSync(projectPath)) {
    console.log(`The directory ${projectName} already exists.`);
    process.exit(1);
  }

  console.log(`Creating a new Forgo app in ${projectPath}.`);

  const templates: { [key: string]: string } = {
    typescript: "forgojs/forgo-template-typescript#main",
    javascript: "forgojs/forgo-template-javascript#main",
    "typescript-ts-loader": "forgojs/forgo-template-typescript-ts-loader#main",
    "javascript-babel-loader": "forgojs/forgo-template-javascript-babel-loader#main",
  };

  async function run() {
    const templateName = argv.template || "javascript";
    const gitUrl = templates[templateName];

    if (!gitUrl) {
      console.log(
        `Template ${templateName} not found. Available templates are ${Object.keys(
          templates
        ).join(", ")}.`
      );
      console.log("Type 'npx create-forgo-app' --help for help.");
      process.exit(1);
    }

    await exec(`npx --yes degit ${gitUrl} ${projectName}`);

    const packageJsonPath = join(projectPath, "package.json");

    const packageJson = readFileSync(packageJsonPath).toString();

    const updatedPackageJson = packageJson.replace(
      "your-forgo-app-name",
      projectName
    );

    writeFileSync(packageJsonPath, updatedPackageJson);

    process.chdir(projectPath);

    let hasError = false;

    console.log("Installing packages. This might take a couple of minutes.");

    const npm = spawn(/^win/.test(process.platform) ? "npm.cmd" : "npm", ["i"]);

    npm.stdout.on("data", (data) => {
      console.log(data.toString());
    });

    npm.stderr.on("data", (data) => {
      hasError = true;
      console.error(data.toString());
    });

    npm.on("close", (code) => {
      console.log(`Success! Created ${projectName} at ${projectPath}.`);
      console.log("Inside that directory, you can these commands:");
      console.log();
      console.log("   npm start");
      console.log("     Starts the development server.");
      console.log();
      console.log("   npm run build");
      console.log("     Bundles the app into static files for production.");
      console.log();
      console.log("We suggest that you begin by typing:");
      console.log(`   cd ${projectName}`);
      console.log("   npm start");
      console.log();
      console.log("Happy hacking!");
    });
  }

  run();
}
