/**
 * Converts structured body data into a code string.
 * @param {object[]} body - Array of body statements.
 * @param {number} level - Current indentation level.
 * @returns {string} - Generated code string.
 */
function parseBody(body, level = 1) {
    const indent = '    '.repeat(level); // 4 spaces per indentation level
    let code = '';

    body.forEach(statement => {
        switch (statement.type) {
            case 'variableDeclaration':
                const declarations = statement.declarations.map(decl => {
                    let init = '';
                    if (decl.init) {
                        init = ` = ${parseExpression(decl.init)}`;
                    }
                    return `${decl.id}${init}`;
                }).join(', ');
                code += `${indent}${statement.kind} ${declarations};\n`;
                break;

            case 'returnStatement':
                code += `${indent}return ${parseExpression(statement.argument)};\n`;
                break;

            case 'expressionStatement':
                code += `${indent}${parseExpression(statement.expression)};\n`;
                break;

            case 'ifStatement':
                code += `${indent}if (${statement.test}) {\n`;
                if (statement.consequent) {
                    code += parseBody(statement.consequent, level + 1);
                }
                code += `${indent}}\n`;
                if (statement.alternate) {
                    code += `${indent}else {\n`;
                    code += parseBody(statement.alternate, level + 1);
                    code += `${indent}}\n`;
                }
                break;

            case 'forStatement':
                code += `${indent}for (${statement.init}; ${statement.test}; ${statement.update}) {\n`;
                code += parseBody(statement.body, level + 1);
                code += `${indent}}\n`;
                break;

            case 'whileStatement':
                code += `${indent}while (${statement.test}) {\n`;
                code += parseBody(statement.body, level + 1);
                code += `${indent}}\n`;
                break;

            case 'doWhileStatement':
                code += `${indent}do {\n`;
                code += parseBody(statement.body, level + 1);
                code += `${indent}} while (${statement.test});\n`;
                break;

            case 'tryStatement':
                code += `${indent}try {\n`;
                code += parseBody(statement.block.body, level + 1);
                code += `${indent}} catch (${statement.handler.param}) {\n`;
                code += parseBody(statement.handler.body, level + 1);
                code += `${indent}}\n`;
                break;

            case 'blockStatement':
                code += `${indent}{\n`;
                code += parseBody(statement.body, level + 1);
                code += `${indent}}\n`;
                break;

            case 'breakStatement':
                code += `${indent}break;\n`;
                break;

            case 'continueStatement':
                code += `${indent}continue;\n`;
                break;

            case 'debuggerStatement':
                code += `${indent}debugger;\n`;
                break;

            case 'emptyStatement':
                code += `${indent};\n`;
                break;

            case 'labeledStatement':
                code += `${indent}${statement.label.name}:\n`;
                code += parseBody([statement.body], level);
                break;

            case 'switchStatement':
                code += `${indent}switch (${parseExpression(statement.discriminant)}) {\n`;
                statement.cases.forEach(switchCase => {
                    code += `${indent}case ${parseExpression(switchCase.test)}:\n`;
                    code += parseBody(switchCase.consequent, level + 1);
                });
                code += `${indent}}\n`;
                break;

            case 'throwStatement':
                code += `${indent}throw ${parseExpression(statement.argument)};\n`;
                break;

            case 'withStatement':
                code += `${indent}with (${parseExpression(statement.object)}) {\n`;
                code += parseBody([statement.body], level + 1);
                code += `${indent}}\n`;
                break;

            case 'functionDeclaration':
                const funcParams = statement.params.map(param => parseExpression(param)).join(', ');
                code += `${indent}function ${statement.id.name}(${funcParams}) {\n`;
                code += parseBody(statement.body.body, level + 1);
                code += `${indent}}\n`;
                break;

            case 'classDeclaration':
                const classBody = statement.body.body.map(method => parseExpression(method)).join('\n');
                code += `${indent}class ${statement.id.name} ${statement.superClass ? `extends ${parseExpression(statement.superClass)}` : ''} {\n${classBody}\n${indent}}\n`;
                break;

            case 'importDeclaration':
                const importSpecifiers = statement.specifiers.map(spec => parseExpression(spec)).join(', ');
                code += `${indent}import ${importSpecifiers} from '${statement.source.value}';\n`;
                break;

            case 'exportNamedDeclaration':
                const exportSpecifiers = statement.specifiers.map(spec => parseExpression(spec)).join(', ');
                code += `${indent}export { ${exportSpecifiers} }${statement.source ? ` from '${statement.source.value}'` : ''};\n`;
                break;

            case 'exportDefaultDeclaration':
                code += `${indent}export default ${parseExpression(statement.declaration)};\n`;
                break;

            case 'exportAllDeclaration':
                code += `${indent}export * from '${statement.source.value}';\n`;
                break;

            default:
                console.warn(`Unhandled statement type: ${statement.type}`);
        }
    });

    return code;
}

/**
 * Converts structured expression data into a code string.
 * @param {object} expr - Expression object.
 * @returns {string} - Generated expression string.
 */
function parseExpression(expr) {
    switch (expr.type) {
        case 'identifier':
            return expr.name;
        case 'callExpression':
            const args = expr.arguments.map(arg => parseExpression(arg)).join(', ');
            return `${parseExpression(expr.callee)}(${args})`;
        case 'memberExpression':
            return `${parseExpression(expr.object)}.${parseExpression(expr.property)}`;
        case 'awaitExpression':
            return `await ${parseExpression(expr.argument)}`;
        case 'binaryExpression':
            return `${parseExpression(expr.left)} ${expr.operator} ${parseExpression(expr.right)}`;
        case 'logicalExpression':
            return `${parseExpression(expr.left)} ${expr.operator} ${parseExpression(expr.right)}`;
        case 'arrowFunctionExpression':
            const params = expr.params.join(', ');
            return `(${params}) => {\n${parseBody(expr.body, 2)}    }\n`;
        case 'literal':
            return expr.raw;
        case 'arrayExpression':
            const elements = expr.elements.map(el => parseExpression(el)).join(', ');
            return `[${elements}]`;
        case 'objectExpression':
            const properties = expr.properties.map(prop => `${parseExpression(prop.key)}: ${parseExpression(prop.value)}`).join(', ');
            return `{${properties}}`;
        case 'assignmentExpression':
            return `${parseExpression(expr.left)} ${expr.operator} ${parseExpression(expr.right)}`;
        case 'unaryExpression':
            return `${expr.operator}${parseExpression(expr.argument)}`;
        case 'updateExpression':
            return expr.prefix ? `${expr.operator}${parseExpression(expr.argument)}` : `${parseExpression(expr.argument)}${expr.operator}`;
        case 'conditionalExpression':
            return `${parseExpression(expr.test)} ? ${parseExpression(expr.consequent)} : ${parseExpression(expr.alternate)}`;
        case 'newExpression':
            const newArgs = expr.arguments.map(arg => parseExpression(arg)).join(', ');
            return `new ${parseExpression(expr.callee)}(${newArgs})`;
        case 'sequenceExpression':
            const expressions = expr.expressions.map(exp => parseExpression(exp)).join(', ');
            return `(${expressions})`;
        case 'templateLiteral':
            const quasis = expr.quasis.map(quasi => quasi.value.cooked).join('${}');
            const expressionsInTemplate = expr.expressions.map(exp => parseExpression(exp)).join('}${');
            return `\`${quasis}${expressionsInTemplate}\``;
        case 'taggedTemplateExpression':
            return `${parseExpression(expr.tag)}\`${parseExpression(expr.quasi)}\``;
        case 'yieldExpression':
            return `yield ${expr.delegate ? '*' : ''}${parseExpression(expr.argument)}`;
        case 'classExpression':
            const classBody = expr.body.body.map(method => parseExpression(method)).join('\n');
            return `class ${expr.id ? expr.id.name : ''} ${expr.superClass ? `extends ${parseExpression(expr.superClass)}` : ''} {\n${classBody}\n}`;
        case 'functionExpression':
            const funcParams = expr.params.map(param => parseExpression(param)).join(', ');
            return `function ${expr.id ? expr.id.name : ''}(${funcParams}) {\n${parseBody(expr.body, 2)}    }\n`;
        case 'thisExpression':
            return 'this';
        case 'super':
            return 'super';
        case 'metaProperty':
            return `${expr.meta}.${expr.property}`;
        case 'importExpression':
            return `import(${parseExpression(expr.source)})`;
        case 'chainExpression':
            return `${parseExpression(expr.expression)}`;
        case 'jsxElement':
            return parseJSX(expr);
        case 'jsxFragment':
            return parseJSXFragment(expr);
        case 'jsxExpressionContainer':
            return `{${parseExpression(expr.expression)}}`;
        case 'jsxText':
            return expr.value;
        case 'jsxOpeningElement':
            return `<${parseExpression(expr.name)}${expr.attributes.map(attr => ` ${parseExpression(attr)}`).join('')}>`;
        case 'jsxClosingElement':
            return `</${parseExpression(expr.name)}>`;
        case 'jsxAttribute':
            return `${expr.name.name}=${parseExpression(expr.value)}`;
        case 'jsxSpreadAttribute':
            return `{...${parseExpression(expr.argument)}}`;
        case 'jsxNamespacedName':
            return `${expr.namespace.name}:${expr.name.name}`;
        case 'jsxMemberExpression':
            return `${parseExpression(expr.object)}.${parseExpression(expr.property)}`;
        case 'objectPattern':
            const objectPatternProperties = expr.properties.map(prop => parseExpression(prop)).join(', ');
            return `{${objectPatternProperties}}`;
        case 'arrayPattern':
            const arrayPatternElements = expr.elements.map(el => parseExpression(el)).join(', ');
            return `[${arrayPatternElements}]`;
        case 'restElement':
            return `...${parseExpression(expr.argument)}`;
        case 'assignmentPattern':
            return `${parseExpression(expr.left)} = ${parseExpression(expr.right)}`;
        case 'spreadElement':
            return `...${parseExpression(expr.argument)}`;
        case 'property':
            return `${parseExpression(expr.key)}: ${parseExpression(expr.value)}`;
        case 'methodDefinition':
            const methodParams = expr.value.params.map(param => parseExpression(param)).join(', ');
            return `${expr.kind} ${parseExpression(expr.key)}(${methodParams}) {\n${parseBody(expr.value.body, 2)}    }\n`;
        case 'classProperty':
            return `${expr.static ? 'static ' : ''}${parseExpression(expr.key)} = ${parseExpression(expr.value)}`;
        case 'importDeclaration':
            const importSpecifiers = expr.specifiers.map(spec => parseExpression(spec)).join(', ');
            return `import ${importSpecifiers} from '${expr.source.value}'`;
        case 'importSpecifier':
            return expr.imported.name === expr.local.name ? expr.local.name : `${expr.imported.name} as ${expr.local.name}`;
        case 'importDefaultSpecifier':
            return expr.local.name;
        case 'importNamespaceSpecifier':
            return `* as ${expr.local.name}`;
        case 'exportNamedDeclaration':
            const exportSpecifiers = expr.specifiers.map(spec => parseExpression(spec)).join(', ');
            return `export { ${exportSpecifiers} }${expr.source ? ` from '${expr.source.value}'` : ''}`;
        case 'exportDefaultDeclaration':
            return `export default ${parseExpression(expr.declaration)}`;
        case 'exportAllDeclaration':
            return `export * from '${expr.source.value}'`;
        case 'variableDeclaration':
            const varDeclarations = expr.declarations.map(decl => parseExpression(decl)).join(', ');
            return `${expr.kind} ${varDeclarations}`;
        case 'variableDeclarator':
            return `${parseExpression(expr.id)} = ${parseExpression(expr.init)}`;
        case 'functionDeclaration':
            const funcDeclParams = expr.params.map(param => parseExpression(param)).join(', ');
            return `function ${expr.id.name}(${funcDeclParams}) {\n${parseBody(expr.body, 2)}    }\n`;
        case 'classDeclaration':
            const classDeclBody = expr.body.body.map(method => parseExpression(method)).join('\n');
            return `class ${expr.id.name} ${expr.superClass ? `extends ${parseExpression(expr.superClass)}` : ''} {\n${classDeclBody}\n}`;
        case 'exportSpecifier':
            return expr.exported.name === expr.local.name ? expr.local.name : `${expr.local.name} as ${expr.exported.name}`;
        case 'objectMethod':
            const objMethodParams = expr.params.map(param => parseExpression(param)).join(', ');
            return `${expr.kind} ${parseExpression(expr.key)}(${objMethodParams}) {\n${parseBody(expr.body, 2)}    }\n`;
        case 'objectProperty':
            return `${parseExpression(expr.key)}: ${parseExpression(expr.value)}`;
        case 'classMethod':
            const classMethodParams = expr.params.map(param => parseExpression(param)).join(', ');
            return `${expr.kind} ${parseExpression(expr.key)}(${classMethodParams}) {\n${parseBody(expr.body, 2)}    }\n`;
        case 'privateName':
            return `#${expr.id.name}`;
        case 'decorator':
            return `@${parseExpression(expr.expression)}`;
        case 'doExpression':
            return `do {\n${parseBody(expr.body, 2)}    }\n`;
        case 'parenthesizedExpression':
            return `(${parseExpression(expr.expression)})`;
        default:
            console.warn(`Unhandled expression type: ${expr.type}`);
            return '';
    }
}

module.exports = { parseBody, parseExpression };