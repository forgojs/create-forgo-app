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

  async function run() {
    const gitUrl =
      argv.template === "typescript"
        ? "forgojs/forgo-template-typescript#main"
        : "forgojs/forgo-template-javascript#main";

    await exec(`npx degit ${gitUrl} ${projectName}`);

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

    const npm = spawn("npm", ["i"]);

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
      console.log("   npm run");
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
