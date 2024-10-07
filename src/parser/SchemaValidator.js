const yaml = require('js-yaml');

class SchemaValidator {
    /**
     * Checks if the given value matches the specified type.
     * @param {any} value - The value to check.
     * @param {string} type - The expected type (e.g., 'string', 'number', 'boolean').
     * @returns {boolean} - Returns true if the value matches the type, otherwise false.
     */
    checkType(value, type) {
        switch (type) {
            case 'string':
                return typeof value === 'string';
            case 'number':
                return typeof value === 'number';
            case 'boolean':
                return typeof value === 'boolean';
            case 'array':
                return Array.isArray(value);
            case 'object':
                return typeof value === 'object' && !Array.isArray(value) && value !== null;
            case 'any':
                return true;
            default:
                throw new Error(`Unknown type: ${type}`);
        }
    }

    /**
     * Validates the structure and type of YAML data.
     * @param {object} schema - The schema defining the expected structure and types.
     * @param {object} data - The YAML data to validate.
     * @returns {boolean} - Returns true if the data matches the schema, otherwise throws an error.
     */
    validateYAML(schema, data) {
        Object.keys(schema).forEach((key) => {
            const expectedType = schema[key].type;
            const required = schema[key].required || false;

            if (required && !(key in data)) {
                throw new Error(`Missing required field: ${key}`);
            }

            if (key in data && !this.checkType(data[key], expectedType)) {
                throw new Error(`Type mismatch for key "${key}". Expected: ${expectedType}, Actual: ${typeof data[key]}`);
            }

            // Recursively validate if the type is object or array and has a nested schema
            if (schema[key].schema && (expectedType === 'object' || expectedType === 'array')) {
                if (expectedType === 'object') {
                    this.validateYAML(schema[key].schema, data[key]);
                } else if (expectedType === 'array') {
                    data[key].forEach((item, index) => {
                        this.validateYAML(schema[key].schema, item);
                    });
                }
            }
        });
        return true;
    }

    /**
     * Parses YAML content and validates it against the schema.
     * @param {string} yamlContent - The YAML content string.
     * @param {object} schema - The schema defining the expected structure and types.
     * @returns {object} - The validated YAML data.
     */
    parseYAMLWithSchema(yamlContent, schema) {
        try {
            const data = yaml.load(yamlContent);
            this.validateYAML(schema, data);
            return data;
        } catch (e) {
            console.error('YAML parsing or validation error:', e.message);
            throw e;
        }
    }
}

module.exports = SchemaValidator;