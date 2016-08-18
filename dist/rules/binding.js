"use strict";
require('aurelia-polyfills');
const ts = require('typescript');
const Path = require('path');
const template_lint_1 = require('template-lint');
const ast_1 = require('../ast');
/**
 *  Rule to ensure static type usage is valid
 */
class BindingRule extends ast_1.ASTBuilder {
    constructor(reflection, opt) {
        super();
        this.reflection = reflection;
        this.reportBindingAccess = true;
        this.reportExceptions = false;
        this.localProvidors = ["repeat.for", "if.bind", "with.bind"];
        this.restrictedAccess = ["private", "protected"];
        if (opt)
            Object.assign(this, opt);
    }
    init(parser, path) {
        super.init(parser);
        this.root.context = this.resolveViewModel(path);
    }
    finalise() {
        if (this.reportBindingAccess) {
            try {
                if (this.root.context != null)
                    this.examineNode(this.root);
            }
            catch (error) {
                if (this.reportExceptions)
                    this.reportIssue(new template_lint_1.Issue({ message: error, line: -1, column: -1 }));
            }
        }
        return super.finalise();
    }
    examineNode(node) {
        if (node instanceof ast_1.ASTElementNode)
            this.examineElementNode(node);
        else if (node instanceof ast_1.ASTTextNode)
            this.examineTextNode(node);
        if (node.children == null)
            return;
        node.children.forEach(child => {
            this.examineNode(child);
        });
    }
    examineElementNode(node) {
        let attrs = node.attrs.sort(x => (this.localProvidors.indexOf(x.name) != -1) ? 0 : 1);
        for (let i = 0, ii = attrs.length; i < ii; ++i) {
            let attr = attrs[i];
            this.examineAttribute(node, attr);
        }
    }
    examineTextNode(node) {
        let exp = node.expression;
        if (!exp)
            return;
        if (exp.constructor.name == "InterpolationBindingExpression")
            this.examineInterpolationExpression(node, exp);
    }
    examineAttribute(node, attr) {
        let instruction = attr.instruction;
        if (instruction == null)
            return;
        let instructionName = instruction.constructor.name;
        switch (instructionName) {
            case "BehaviorInstruction": {
                this.examineBehaviorInstruction(node, instruction);
                break;
            }
            case "ListenerExpression": {
                this.examineListenerExpression(node, instruction);
                break;
            }
            case "NameExpression": {
                this.examineNameExpression(node, instruction);
                break;
            }
            default: {
                if (this.reportExceptions)
                    this.reportIssue(new template_lint_1.Issue({ message: `Unknown instruction type: ${instructionName}`, line: attr.location.line }));
            }
        }
    }
    examineBehaviorInstruction(node, instruction) {
        let attrName = instruction.attrName;
        let attrLoc = node.location;
        switch (attrName) {
            case "repeat": {
                let varKey = instruction.attributes['key'];
                let varValue = instruction.attributes['value'];
                let varLocal = instruction.attributes['local'];
                let source = instruction.attributes['items'];
                let chain = this.flattenAccessChain(source.sourceExpression);
                let resolved = this.resolveAccessScopeToType(node, chain, new ast_1.FileLoc(attrLoc.line, attrLoc.column));
                let type = resolved ? resolved.type : null;
                let typeDecl = resolved ? resolved.typeDecl : null;
                if (varKey && varValue) {
                    node.locals.push(new ast_1.ASTContext({ name: varKey, type: ts.createNode(ts.SyntaxKind.StringKeyword) }));
                    node.locals.push(new ast_1.ASTContext({ name: varValue, type: type, typeDecl: typeDecl }));
                }
                else {
                    node.locals.push(new ast_1.ASTContext({ name: varLocal, type: type, typeDecl: typeDecl }));
                }
                node.locals.push(new ast_1.ASTContext({ name: "$index", type: ts.createNode(ts.SyntaxKind.NumberKeyword) }));
                node.locals.push(new ast_1.ASTContext({ name: "$first", type: ts.createNode(ts.SyntaxKind.BooleanKeyword) }));
                node.locals.push(new ast_1.ASTContext({ name: "$last", type: ts.createNode(ts.SyntaxKind.BooleanKeyword) }));
                node.locals.push(new ast_1.ASTContext({ name: "$odd", type: ts.createNode(ts.SyntaxKind.BooleanKeyword) }));
                node.locals.push(new ast_1.ASTContext({ name: "$even", type: ts.createNode(ts.SyntaxKind.BooleanKeyword) }));
                break;
            }
            case "with": {
                let source = instruction.attributes['with'];
                let chain = this.flattenAccessChain(source.sourceExpression);
                let resolved = this.resolveAccessScopeToType(node, chain, new ast_1.FileLoc(attrLoc.line, attrLoc.column));
                if (resolved != null)
                    node.context = resolved;
                break;
            }
            default:
                let attrExp = instruction.attributes[attrName];
                let access = instruction.attributes[attrName].sourceExpression;
                if (attrExp.constructor.name == "InterpolationBindingExpression")
                    this.examineInterpolationExpression(node, attrExp);
                else {
                    let chain = this.flattenAccessChain(access);
                    let resolved = this.resolveAccessScopeToType(node, chain, new ast_1.FileLoc(attrLoc.line, attrLoc.column));
                }
        }
        ;
    }
    examineListenerExpression(node, exp /*ListenerExpression*/) {
        let target = exp.targetEvent;
        let access = exp.sourceExpression;
        let chain = this.flattenAccessChain(access);
        let resolved = this.resolveAccessScopeToType(node, chain, node.location);
    }
    examineNameExpression(node, exp /*NamedExpression*/) {
        let access = exp.sourceExpression;
        let chain = this.flattenAccessChain(access);
        let resolved = this.resolveAccessScopeToType(node, chain, node.location);
    }
    examineInterpolationExpression(node, exp) {
        if (!exp || !node)
            return;
        let lineOffset = 0;
        let column = node.location.column;
        exp.parts.forEach(part => {
            if (part.name !== undefined) {
                let chain = this.flattenAccessChain(part);
                if (chain.length > 0)
                    this.resolveAccessScopeToType(node, chain, new ast_1.FileLoc(node.location.line + lineOffset, column));
            }
            else if (part.match !== undefined) {
                let lines = part.split(/\n|\r/);
                if (lines && lines.length > 1) {
                    lineOffset += lines.length;
                    column = lines[lines.length - 1].length + 1;
                }
            }
        });
    }
    resolveViewModel(path) {
        if (!path || path.trim() == "")
            return null;
        let viewFileInfo = Path.parse(path);
        let viewModelFile = Path.join(viewFileInfo.dir, `${viewFileInfo.name}`);
        let viewName = this.toSymbol(viewFileInfo.name);
        let viewModelSource = this.reflection.pathToSource[viewModelFile];
        if (!viewModelSource)
            return null;
        let classes = viewModelSource.statements.filter(x => x.kind == ts.SyntaxKind.ClassDeclaration);
        /*if(classes.length > 1) // http://stackoverflow.com/questions/29101883/aurelia-view-model-class-naming
        {
            this.reportIssue(new Issue({message:"view-model file should only have one class", line:-1, column:-1, severity:IssueSeverity.Warning}))
        }*/
        let first = classes[0];
        let context = new ast_1.ASTContext();
        context.name = first.name.getText();
        context.typeDecl = first;
        return context;
    }
    resolveAccessScopeToType(node, chain, loc) {
        let access = chain[0];
        let ancestor = access.ancestor;
        let context = ast_1.ASTNode.inheritContext(node, ancestor);
        let locals = ast_1.ASTNode.inheritLocals(node, ancestor);
        return this.resolveAccessChainToType(node, context, locals, chain, loc);
    }
    resolveAccessChainToType(node, context, locals, chain, loc) {
        if (chain == null || chain.length == 0)
            return;
        let decl = context.typeDecl;
        let access = chain[0];
        let resolved = null;
        if (access.constructor.name == "AccessMember" ||
            access.constructor.name == "AccessScope" ||
            access.constructor.name == "CallMember" ||
            access.constructor.name == "CallScope") {
            let name = access.name;
            if (context.typeValue) {
                resolved = this.resolveValueContext(context.typeValue, name, loc);
            }
            else {
                if (!resolved)
                    resolved = this.resolveLocalType(locals, name);
                if (!resolved)
                    resolved = this.resolveStaticType(context, name, loc);
            }
            ;
        }
        else if (access.constructor.name == "AccessKeyed") {
            let keyAccess = access.key;
            let keyChain = this.flattenAccessChain(keyAccess);
            let keyTypeDecl = this.resolveAccessScopeToType(node, keyChain, loc);
            resolved = new ast_1.ASTContext({ name: context.name, type: context.type, typeDecl: context.typeDecl });
        }
        if (!resolved) {
            return null;
        }
        if (chain.length == 1) {
            return resolved;
        }
        if (resolved.typeDecl == null) {
            return null;
        }
        return this.resolveAccessChainToType(node, resolved, null, chain.slice(1), loc);
    }
    resolveValueContext(value, memberName, loc) {
        if (!value)
            return null;
        let resolved = value[memberName];
        if (resolved === undefined) {
            this.reportUnresolvedAccessObjectIssue(memberName, value.constructor.name, loc);
            return null;
        }
        return new ast_1.ASTContext({ name: memberName /*,typeValue: resolved*/ });
    }
    resolveLocalType(locals, memberName) {
        if (!locals)
            return null;
        let localVar = locals.find(x => x.name == memberName);
        return localVar;
    }
    resolveStaticType(context, memberName, loc) {
        if (context == null || context.typeDecl == null)
            return null;
        let decl = context.typeDecl;
        let memberType;
        let member = null;
        switch (decl.kind) {
            case ts.SyntaxKind.ClassDeclaration:
                {
                    const classDecl = decl;
                    let members = this.resolveClassMembers(classDecl);
                    member = members
                        .filter(x => x.kind == ts.SyntaxKind.PropertyDeclaration ||
                        x.kind == ts.SyntaxKind.MethodDeclaration ||
                        x.kind == ts.SyntaxKind.GetAccessor)
                        .find(x => x.name.text == memberName);
                    if (member) {
                        memberType = this.reflection.resolveClassElementType(member);
                    }
                    else {
                        const constr = members.find(ce => ce.kind == ts.SyntaxKind.Constructor);
                        if (constr) {
                            const param = constr.parameters.find(parameter => parameter.name.getText() === memberName);
                            if (param && param.flags) {
                                // Constructor parameters that have public/protected/private modifier, are class members.
                                // Looks like there is no need to inspect `param.modifiers`, because
                                // 1) access restriction is checked bellow
                                // 2) to my understanding, access modifiers are the only flags that can be used on constructor parameters
                                member = param;
                                memberType = param.type;
                            }
                        }
                    }
                    if (!member) {
                        // "dynamic" members could be defined using index signature: `[x: string]: number;`
                        member = members.filter(x => x.kind == ts.SyntaxKind.IndexSignature).pop();
                    }
                    if (!member)
                        break;
                }
                break;
            case ts.SyntaxKind.InterfaceDeclaration:
                {
                    let members = this.resolveInterfaceMembers(decl);
                    member = members
                        .filter(x => x.kind == ts.SyntaxKind.PropertySignature ||
                        x.kind == ts.SyntaxKind.MethodSignature ||
                        x.kind == ts.SyntaxKind.GetAccessor)
                        .find(x => x.name.getText() === memberName);
                    if (!member) {
                        // "dynamic" members could be defined using index signature: `[x: string]: number;`
                        member = members.filter(x => x.kind == ts.SyntaxKind.IndexSignature).pop();
                    }
                    if (!member)
                        break;
                    memberType = this.reflection.resolveTypeElementType(member);
                }
                break;
            default:
        }
        if (!member) {
            this.reportUnresolvedAccessMemberIssue(memberName, decl, loc);
            return null;
        }
        if (!memberType)
            return null;
        if (this.restrictedAccess.length > 0) {
            const isPrivate = member.flags & ts.NodeFlags.Private;
            const isProtected = member.flags & ts.NodeFlags.Protected;
            const restrictPrivate = this.restrictedAccess.indexOf("private") != -1;
            const restrictProtected = this.restrictedAccess.indexOf("protected") != -1;
            if (isPrivate && restrictPrivate || isProtected && restrictProtected) {
                const accessModifier = isPrivate ? "private" : "protected";
                this.reportPrivateAccessMemberIssue(memberName, decl, loc, accessModifier);
                return null;
            }
        }
        let memberTypeName = this.reflection.resolveTypeName(memberType);
        let memberTypeDecl = this.reflection.getDeclForType(decl.parent, memberTypeName);
        let memberIsArray = member.type.kind == ts.SyntaxKind.ArrayType;
        //TODO:
        //let typeArgs = <args:ts.TypeReference[]> member.type.typeArguments;
        //The simpler solution here might be to create a copy of the generic type declaration and
        //replace the generic references with the arguments.
        return new ast_1.ASTContext({ type: memberType, typeDecl: memberTypeDecl, typeValue: memberIsArray ? [] : null });
    }
    resolveClassMembers(classDecl) {
        var members = classDecl.members;
        if (!classDecl.heritageClauses)
            return members;
        for (let base of classDecl.heritageClauses) {
            for (let type of base.types) {
                let typeDecl = this.reflection.getDeclForType(classDecl.parent, type.getText());
                if (typeDecl != null) {
                    let baseMembers = this.resolveClassMembers(typeDecl);
                    members = members.concat(baseMembers);
                }
            }
        }
        return members;
    }
    resolveInterfaceMembers(interfaceDecl) {
        var members = interfaceDecl.members;
        if (!interfaceDecl.heritageClauses)
            return members;
        for (let base of interfaceDecl.heritageClauses) {
            for (let type of base.types) {
                let typeDecl = this.reflection.getDeclForType(interfaceDecl.parent, type.getText());
                if (typeDecl != null) {
                    let baseMembers = this.resolveInterfaceMembers(typeDecl);
                    members = members.concat(baseMembers);
                }
            }
        }
        return members;
    }
    flattenAccessChain(access) {
        let chain = [];
        while (access !== undefined) {
            if (access.constructor.name == "PrefixNot")
                access = access.expression;
            else {
                chain.push(access);
                access = access.object;
            }
        }
        return chain.reverse();
    }
    toSymbol(path) {
        path = this.toCamelCase(path.trim());
        return path.charAt(0).toUpperCase() + path.slice(1);
    }
    toFile(symbol) {
        return this.toDashCase(symbol.trim());
    }
    toCamelCase(value) {
        return value.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); });
    }
    toDashCase(value) {
        return value.replace(/([a-z][A-Z])/g, function (g) { return g[0] + '-' + g[1].toLowerCase(); });
    }
    reportUnresolvedAccessObjectIssue(member, objectName, loc) {
        let msg = `cannot find '${member}' in object '${objectName}'`;
        let issue = new template_lint_1.Issue({
            message: msg,
            line: loc.line,
            column: loc.column,
            severity: template_lint_1.IssueSeverity.Error
        });
        this.reportIssue(issue);
    }
    reportUnresolvedAccessMemberIssue(member, decl, loc) {
        let msg = `cannot find '${member}' in type '${decl.name.getText()}'`;
        let issue = new template_lint_1.Issue({
            message: msg,
            line: loc.line,
            column: loc.column,
            severity: template_lint_1.IssueSeverity.Error
        });
        this.reportIssue(issue);
    }
    reportPrivateAccessMemberIssue(member, decl, loc, accessModifier) {
        let msg = `field '${member}' in type '${decl.name.getText()}' has ${accessModifier} access modifier`;
        let issue = new template_lint_1.Issue({
            message: msg,
            line: loc.line,
            column: loc.column,
            severity: template_lint_1.IssueSeverity.Warning
        });
        this.reportIssue(issue);
    }
}
exports.BindingRule = BindingRule;

//# sourceMappingURL=binding.js.map
