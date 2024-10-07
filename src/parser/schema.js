/**
 * Defines the schema for YAML data.
 * Adjust the schema according to the YAML structure.
 */
const schema = {
    modules: { 
        type: 'array', 
        required: false, 
        schema: {
            type: 'object',
            required: true,
            schema: {
                type: { type: 'string', required: true },
                alias: { type: 'string', required: true },
                path: { type: 'string', required: true },
            }
        }
    },
    css: { 
        type: 'array', 
        required: false, 
        schema: { type: 'string' }
    },
    libraries: { 
        type: 'array', 
        required: false, 
        schema: { type: 'string' }
    },
    variables: { 
        type: 'object', 
        required: false 
    },
    objects: { 
        type: 'object', 
        required: false 
    },
    arrays: { 
        type: 'object', 
        required: false 
    },
    classes: { 
        type: 'array', 
        required: false, 
        schema: {
            type: 'object',
            required: true,
            schema: {
                name: { type: 'string', required: true },
                extends: { type: 'string', required: false },
                constructor: { 
                    type: 'object', 
                    required: false, 
                    schema: {
                        parameters: { type: 'array', required: true, schema: { type: 'string' }},
                        body: { type: 'array', required: true, schema: { type: 'object' }} // Changed to an array for structured body
                    }
                },
                methods: { 
                    type: 'array', 
                    required: false, 
                    schema: {
                        type: 'object',
                        required: true,
                        schema: {
                            name: { type: 'string', required: true },
                            parameters: { type: 'array', required: true, schema: { type: 'string' }},
                            body: { type: 'array', required: true, schema: { type: 'object' }} // Changed to an array for structured body
                        }
                    }
                }
            }
        }
    },
    functions: { 
        type: 'array', 
        required: false, 
        schema: {
            type: 'object',
            required: true,
            schema: {
                name: { type: 'string', required: true },
                parameters: { type: 'array', required: true, schema: { type: 'string' }},
                body: { type: 'array', required: true, schema: { type: 'object' }}, // Changed to an array for structured body
                async: { type: 'boolean', required: false }
            }
        }
    },
    conditions: { 
        type: 'array', 
        required: false, 
        schema: {
            type: 'object',
            required: true,
            schema: {
                if: { type: 'string', required: false },
                execute: { type: 'array', required: false, schema: { type: 'object' }}, // Changed to an array for structured body
                else: { 
                    type: 'object', 
                    required: false, 
                    schema: {
                        execute: { type: 'array', required: true, schema: { type: 'object' }} // Changed to an array for structured body
                    }
                }
            }
        }
    },
    loops: { 
        type: 'object', 
        required: false, 
        schema: {
            for: { 
                type: 'object', 
                required: false, 
                schema: {
                    initializer: { type: 'string', required: true },
                    condition: { type: 'string', required: true },
                    increment: { type: 'string', required: true },
                    body: { type: 'array', required: true, schema: { type: 'object' }} // Changed to an array for structured body
                }
            },
            while: { 
                type: 'object', 
                required: false, 
                schema: {
                    condition: { type: 'string', required: true },
                    body: { type: 'array', required: true, schema: { type: 'object' }} // Changed to an array for structured body
                }
            },
            doWhile: { 
                type: 'object', 
                required: false, 
                schema: {
                    condition: { type: 'string', required: true },
                    body: { type: 'array', required: true, schema: { type: 'object' }} // Changed to an array for structured body
                }
            }
        }
    },
    exceptions: { 
        type: 'array', 
        required: false, 
        schema: {
            type: 'object',
            required: true,
            schema: {
                try: { 
                    type: 'object', 
                    required: true, 
                    schema: {
                        body: { type: 'array', required: true, schema: { type: 'object' }} // Changed to an array for structured body
                    }
                },
                catch: { 
                    type: 'object', 
                    required: true, 
                    schema: {
                        parameter: { type: 'string', required: true },
                        body: { type: 'array', required: true, schema: { type: 'object' }} // Changed to an array for structured body
                    }
                }
            }
        }
    },
    components: { 
        type: 'array', 
        required: false, 
        schema: {
            type: 'object',
            required: true,
            schema: {
                type: { type: 'string', required: true }, // 'function' or 'class'
                name: { type: 'string', required: true },
                hooks: { 
                    type: 'array', 
                    required: false, 
                    schema: {
                        type: 'object',
                        required: true,
                        schema: {
                            name: { type: 'string', required: true }, // 'useState' or 'useEffect'
                            params: { type: 'array', required: true, schema: { type: 'string' }},
                            initial: { type: 'any', required: false },
                            body: { type: 'array', required: false, schema: { type: 'object' }}, // Changed to an array if needed
                            dependencies: { type: 'array', required: false, schema: { type: 'string' }}
                        }
                    }
                },
                functions: { 
                    type: 'array', 
                    required: false, 
                    schema: {
                        type: 'object',
                        required: true,
                        schema: {
                            name: { type: 'string', required: true },
                            parameters: { type: 'array', required: true, schema: { type: 'string' }},
                            body: { type: 'array', required: true, schema: { type: 'object' }}, // Changed to an array for structured body
                            async: { type: 'boolean', required: false }
                        }
                    }
                },
                jsx: { type: 'array', required: true, schema: { type: 'object' } }, // Assuming JSX elements are objects
                state: { type: 'object', required: false }, // State for class components
                methods: { 
                    type: 'array', 
                    required: false, 
                    schema: {
                        type: 'object',
                        required: true,
                        schema: {
                            name: { type: 'string', required: true },
                            parameters: { type: 'array', required: true, schema: { type: 'string' }},
                            body: { type: 'array', required: true, schema: { type: 'object' }} // Changed to an array for structured body
                        }
                    }
                }
            }
        }
    }
};

module.exports = schema;