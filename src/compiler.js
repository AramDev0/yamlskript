const fs = require('fs');
const path = require('path');
const babelGenerator = require('@babel/generator').default;
const Parser = require('./parser'); // Refactored Parser class
const { ESLint } = require('eslint');

class Compiler {
    constructor(packageConfig, packageYmlPath) {
        this.packageConfig = packageConfig;
        this.packageYmlPath = packageYmlPath;
        this.parser = new Parser(); // Create Parser instance
        this.eslint = new ESLint({ fix: true }); // Create ESLint instance with auto-fix enabled
    }

    async build() {
        const yamlSkript = this.packageConfig.yamlSkript;

        if (!yamlSkript || !yamlSkript.entry || !yamlSkript.output) {
            console.error("The 'yamlSkript' section is missing or 'entry' and 'output' are not defined in package.yml.");
            process.exit(1);
        }

        const entryPaths = yamlSkript.entry.map(entry => path.resolve(process.cwd(), entry));
        const outputDir = path.resolve(process.cwd(), yamlSkript.output);

        // Collect input YAML files and other files
        const inputFiles = [];
        const otherFiles = [];

        entryPaths.forEach(entryPath => {
            if (fs.existsSync(entryPath)) {
                const stat = fs.lstatSync(entryPath);
                if (stat.isDirectory()) {
                    const getAllFiles = dir => {
                        const files = fs.readdirSync(dir);
                        files.forEach(file => {
                            const filePath = path.join(dir, file);
                            const fileStat = fs.lstatSync(filePath);
                            if (fileStat.isDirectory()) {
                                getAllFiles(filePath);
                            } else if (filePath.endsWith('.yml') || filePath.endsWith('.yaml')) {
                                if (filePath !== this.packageYmlPath) {
                                    inputFiles.push(filePath);
                                }
                            } else {
                                otherFiles.push(filePath);
                            }
                        });
                    };
                    getAllFiles(entryPath);
                } else if (entryPath.endsWith('.yml') || entryPath.endsWith('.yaml')) {
                    if (entryPath !== this.packageYmlPath) {
                        inputFiles.push(entryPath);
                    }
                } else {
                    otherFiles.push(entryPath);
                }
            } else {
                console.error(`Cannot find input path: ${entryPath}`);
                process.exit(1);
            }
        });

        if (inputFiles.length === 0) {
            console.warn("No YAML files found to compile.");
            process.exit(0);
        }

        // Create output directory
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
            console.log(`Created output directory: ${outputDir}`);
        }

        // Process each input YAML file
        for (const inputFile of inputFiles) {
            try {
                const ast = this.parser.generateAST(inputFile);
                let generatedCode = babelGenerator(ast, {}, '').code;

                // Use ESLint to check and fix code
                const lintResults = await this.eslint.lintText(generatedCode, { filePath: inputFile });
                ESLint.outputFixes(lintResults);

                // Extract modified code
                generatedCode = lintResults[0] && lintResults[0].output ? lintResults[0].output : generatedCode;

                const relativePath = path.relative(path.resolve(process.cwd(), yamlSkript.entry.find(entry => {
                    const entryPath = path.resolve(process.cwd(), entry);
                    return inputFile.startsWith(entryPath);
                }), ''), inputFile);
                const outputFilePath = path.resolve(outputDir, relativePath.replace(/\.(yml|yaml)$/, '.js'));

                const outputFileDir = path.dirname(outputFilePath);
                if (!fs.existsSync(outputFileDir)) {
                    fs.mkdirSync(outputFileDir, { recursive: true });
                    console.log(`Created directory: ${outputFileDir}`);
                }

                fs.writeFileSync(outputFilePath, generatedCode, 'utf8');
                console.log(`Compiled and fixed ${inputFile} to ${outputFilePath}.`);
            } catch (e) {
                console.error(`Error processing file ${inputFile}: ${e.message}`);
                process.exit(1);
            }
        }

        // Copy other files to the output directory
        otherFiles.forEach(file => {
            const relativePath = path.relative(process.cwd(), file);
            const outputFilePath = path.resolve(outputDir, relativePath);

            const outputFileDir = path.dirname(outputFilePath);
            if (!fs.existsSync(outputFileDir)) {
                fs.mkdirSync(outputFileDir, { recursive: true });
                console.log(`Created directory: ${outputFileDir}`);
            }

            fs.copyFileSync(file, outputFilePath);
            console.log(`Copied ${file} to ${outputFilePath}.`);
        });
    }
}

module.exports = Compiler;