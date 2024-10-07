/**
 * Utility function to convert JSX elements defined in YAML to JSX code.
 * Handles both static text and dynamic expressions.
 * @param {(JSXElement|string)[]} elements - Array of JSX elements or strings.
 * @param {number} level - Current indentation level.
 * @returns {string} - Generated JSX code.
 */
function parseJSX(elements, level = 0) {
    let indent = ' '.repeat(level * 2); // Indentation
    let jsxCode = '';

    elements.forEach(element => {
        if (typeof element === 'string') {
            // Check if the string is a dynamic expression
            const expressionMatch = element.match(/^\{\{(.+)\}\}$/);
            if (expressionMatch) {
                jsxCode += `${indent}{${expressionMatch[1]}}\n`;
            } else {
                jsxCode += `${indent}${element}\n`; // Static text node
            }
        } else if (element.type && typeof element.type === 'string') {
            // Self-closing tag or opening tag
            const hasChildren = element.children && element.children.length > 0;
            jsxCode += `${indent}<${element.type}`;

            // Handle props (class -> className, for -> htmlFor)
            if (element.props) {
                Object.entries(element.props).forEach(([key, value]) => {
                    let propKey = key;
                    if (key === 'class') propKey = 'className';
                    if (key === 'for') propKey = 'htmlFor';

                    // Handle dynamic expressions
                    if (typeof value === 'string') {
                        const exprMatch = value.match(/^\{\{(.+)\}\}$/);
                        if (exprMatch) {
                            jsxCode += ` ${propKey}={${exprMatch[1]}}`;
                        } else {
                            jsxCode += ` ${propKey}="${value}"`;
                        }
                    } else {
                        jsxCode += ` ${propKey}={${JSON.stringify(value)}}`;
                    }
                });
            }

            if (hasChildren) {
                jsxCode += `>\n`;
                jsxCode += parseJSX(element.children, level + 1); // Recursively handle child elements
                jsxCode += `${indent}</${element.type}>\n`;
            } else {
                jsxCode += ` />\n`;
            }
        }
    });

    return jsxCode;
}

module.exports = { parseJSX };