const fs = require('fs');
const path = require('path');
const babelGenerator = require('@babel/generator').default;
const SchemaValidator = require('./SchemaValidator');
const CodeGenerator = require('./CodeGenerator');
const schema = require('./schema');

class Parser {
    constructor() {
        this.schemaValidator = new SchemaValidator();
        this.codeGenerator = new CodeGenerator();
    }

    /**
     * Parses a YAML file and generates an AST.
     * @param {string} filePath - Path to the YAML file.
     * @returns {object} - Babel AST object.
     */
    generateAST(filePath) {
        try {
            const yamlContent = fs.readFileSync(path.resolve(filePath), 'utf8');
            const data = this.schemaValidator.parseYAMLWithSchema(yamlContent, schema);
            const ast = this.codeGenerator.generateAST(data);
            return ast;
        } catch (error) {
            console.error('Error generating AST:', error);
            throw error;
        }
    }
}

module.exports = Parser;