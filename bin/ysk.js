#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const yaml = require('js-yaml');
const { execSync } = require('child_process');
const Compiler = require('../src/compiler'); // Import the Compiler class

// Parse command line arguments
const args = process.argv.slice(2);

if (args.length < 1) {
    console.error("Usage: ysk <command> [options]");
    console.error("Commands:");
    console.error("  build (b)    Compile all YAML scripts based on the project's package.yml.");
    console.error("  install (i)  Install all dependency modules defined in package.yml.");
    console.error("  help (h)     Show help information.");
    process.exit(1);
}

const command = args[0];

// Load package.yml file
const packageYmlPath = path.resolve(process.cwd(), 'package.yml');
if (!fs.existsSync(packageYmlPath)) {
    console.error(`Cannot find package.yml file in the current directory: ${process.cwd()}`);
    process.exit(1);
}

let packageConfig;

try {
    const packageYmlContent = fs.readFileSync(packageYmlPath, 'utf8');
    packageConfig = yaml.load(packageYmlContent);
} catch (e) {
    console.error(`Error parsing package.yml file: ${e.message}`);
    process.exit(1);
}

// Handle 'build' or 'b' command
if (command === 'build' || command === 'b') {
    const compiler = new Compiler(packageConfig, packageYmlPath);
    compiler.build();
    
// Handle 'install' or 'i' command
} else if (command === 'install' || command === 'i') {
    const dependencies = packageConfig.dependencies;

    if (dependencies && Array.isArray(dependencies) && dependencies.length > 0) {
        try {
            console.log(`Installing the following modules: ${dependencies.join(' ')}`);
            execSync(`npm install ${dependencies.join(' ')}`, { stdio: 'inherit' });
            console.log("Module installation completed.");
        } catch (error) {
            console.error("Error installing modules:", error.message);
            process.exit(1);
        }
    } else {
        console.error("No 'dependencies' defined in package.yml file.");
        process.exit(1);
    }

// Handle 'help' or 'h' command
} else if (command === 'help' || command === 'h') {
    console.log("Usage: ysk <command> [options]");
    console.log("Commands:");
    console.log("  build (b)    Compile all YAML scripts based on the project's package.yml.");
    console.log("  install (i)  Install all dependency modules defined in package.yml.");
    console.log("  help (h)     Show help information.");

// Handle unknown command
} else {
    console.error(`Unknown command: ${command}`);
    process.exit(1);
}
