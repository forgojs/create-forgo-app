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

const projectName = argv._[0].toString();

if (!projectName) {
  console.log("You need to specify the name of your project.");
  process.exit(1);
}

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

  const npm = spawn("npm", ["i"]);

  npm.stdout.on("data", (data) => {
    console.log(data.toString());
  });

  npm.stderr.on("data", (data) => {
    hasError = true;
    console.error(data.toString());
  });

  npm.on("close", (code) => {
    console.log(`Created ${projectName}.`);
  });
}

run();
