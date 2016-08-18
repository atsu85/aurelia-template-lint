"use strict";
const Path = require('path');
const ts = require('typescript');
const glob = require('glob');
const fs = require('fs');
/*
* Manage Reflection information for available sources
*/
class Reflection {
    constructor() {
        this.sourceFiles = [];
        this.pathToSource = {};
    }
    addGlob(pattern) {
        return new Promise((resolve, reject) => {
            try {
                if (pattern) {
                    glob(pattern, {}, (er, files) => {
                        if (er)
                            reject(er);
                        files.forEach(path => {
                            let source = fs.readFileSync(path, 'utf8');
                            this.add(path, source);
                        });
                        resolve();
                    });
                }
            }
            catch (err) {
                reject(err);
            }
        });
    }
    addTypingsGlob(pattern) {
        return new Promise((resolve, reject) => {
            try {
                if (pattern) {
                    glob(pattern, {}, (er, files) => {
                        if (er)
                            reject(er);
                        files.forEach(path => {
                            let source = fs.readFileSync(path, 'utf8');
                            this.addTypings(source);
                        });
                        resolve();
                    });
                }
            }
            catch (err) {
                reject(err);
            }
        });
    }
    add(path, source) {
        let parsed = Path.parse(Path.normalize(path));
        let moduleName = Path.join(parsed.dir, parsed.name);
        if (this.pathToSource[moduleName] !== undefined)
            return;
        let reflection = ts.createSourceFile(moduleName, source, ts.ScriptTarget.Latest, true);
        this.sourceFiles.push(reflection);
        this.pathToSource[moduleName] = reflection;
    }
    addTypings(source) {
        let reflection = ts.createSourceFile("", source, ts.ScriptTarget.Latest, true);
        let modules = reflection.statements
            .filter(x => x.kind == ts.SyntaxKind.ModuleDeclaration)
            .map(x => x);
        modules.forEach(module => {
            let moduleName = module.name.getText().replace(/\'|\"|\`/g, '');
            this.pathToSource[moduleName] = module;
        });
    }
    getDeclForType(source, typeName) {
        if (!source || !typeName)
            return null;
        let types = source.statements.filter(x => x.kind == ts.SyntaxKind.ClassDeclaration ||
            x.kind == ts.SyntaxKind.InterfaceDeclaration);
        let result = types.find(x => x.name.getText() === typeName);
        if (result)
            return result;
        return this.getDeclForImportedType(source, typeName);
    }
    getDeclForImportedType(source, typeName) {
        if (!source || !typeName)
            return null;
        let imports = source.statements.filter(x => x.kind == ts.SyntaxKind.ImportDeclaration);
        let map = {};
        let symbolImportDecl = imports.find(x => {
            if (!x.importClause) {
                return false; // smth like `import "module-name"`
            }
            const namedBindings = x.importClause.namedBindings;
            if (!namedBindings) {
                return false; // smth like `import defaultMember from "module-name";`;
            }
            let importSymbols = namedBindings.elements;
            if (!importSymbols) {
                return false; // smth like `import * as name from "module-name"`
            }
            let importModule = x.moduleSpecifier.text;
            let isMatch = importSymbols.findIndex(importSymbol => {
                return importSymbol.name.text == typeName;
            });
            return isMatch != -1;
        });
        if (!symbolImportDecl)
            return null;
        let importModule = symbolImportDecl.moduleSpecifier.text;
        let isRelative = importModule.startsWith(".");
        let inportSourceModule = importModule;
        if (isRelative) {
            let base = Path.parse(source.fileName).dir;
            inportSourceModule = Path.normalize(Path.join(base, `${importModule}`));
        }
        let inportSourceFile = this.pathToSource[inportSourceModule];
        if (!inportSourceFile)
            return null;
        if (inportSourceFile.kind == ts.SyntaxKind.SourceFile) {
            let classes = inportSourceFile.statements.filter(x => x.kind == ts.SyntaxKind.ClassDeclaration ||
                x.kind == ts.SyntaxKind.InterfaceDeclaration);
            return classes.find(x => x.name.getText() == typeName);
        }
        else if (inportSourceFile.kind == ts.SyntaxKind.ModuleDeclaration) {
            let module = inportSourceFile;
            let body = module.body;
            if (module.body.kind == ts.SyntaxKind.ModuleBlock) {
                let moduleBlock = body;
                let classes = moduleBlock.statements.filter(x => x.kind == ts.SyntaxKind.ClassDeclaration ||
                    x.kind == ts.SyntaxKind.InterfaceDeclaration);
                return classes.find(x => x.name.getText() == typeName);
            }
        }
        else {
        }
    }
    resolveClassElementType(node) {
        if (!node)
            return null;
        switch (node.kind) {
            case ts.SyntaxKind.PropertyDeclaration:
                let prop = node;
                return prop.type;
            case ts.SyntaxKind.MethodDeclaration:
                let meth = node;
                return meth.type;
            case ts.SyntaxKind.GetAccessor:
                let get = node;
                return get.type;
            default:
                //console.log(`unhandled kind ${ts.SyntaxKind[node.kind]} in resolveClassElementType`);
                return null;
        }
    }
    resolveTypeElementType(node) {
        if (!node)
            return null;
        switch (node.kind) {
            case ts.SyntaxKind.PropertySignature:
                let prop = node;
                return prop.type;
            case ts.SyntaxKind.MethodSignature:
                let meth = node;
                return meth.type;
            default:
                //console.log(`unhandled kind ${ts.SyntaxKind[node.kind]} in resolveTypeElementType`);
                return null;
        }
    }
    resolveTypeName(node) {
        if (!node)
            return null;
        switch (node.kind) {
            case ts.SyntaxKind.ArrayType:
                let arr = node;
                return this.resolveTypeName(arr.elementType);
            case ts.SyntaxKind.TypeReference:
                let ref = node;
                return ref.typeName.getText();
            case ts.SyntaxKind.StringKeyword:
                return 'string';
            case ts.SyntaxKind.NumberKeyword:
                return 'number';
            case ts.SyntaxKind.BooleanKeyword:
                return 'boolean';
            default:
                //console.log(`unhandled kind ${ts.SyntaxKind[node.kind]} in resolveTypeName`);
                return null;
        }
    }
}
exports.Reflection = Reflection;

//# sourceMappingURL=reflection.js.map
