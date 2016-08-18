"use strict";
const aurelia_templating_binding_1 = require('aurelia-templating-binding');
const aurelia_dependency_injection_1 = require('aurelia-dependency-injection');
const template_lint_1 = require('template-lint');
const aurelia_templating_1 = require('aurelia-templating');
class ASTBuilder extends template_lint_1.Rule {
    constructor() {
        super();
        this.reportBindingSyntax = true;
        this.container = new aurelia_dependency_injection_1.Container();
        this.resources = this.container.get(aurelia_templating_1.ViewResources);
        this.bindingLanguage = this.container.get(aurelia_templating_binding_1.TemplatingBindingLanguage);
    }
    init(parser) {
        var current = new ASTNode();
        this.root = current;
        parser.on("startTag", (tag, attrs, selfClosing, loc) => {
            let next = new ASTElementNode();
            next.tag = tag;
            next.parent = current;
            next.location = new FileLoc(loc.line, loc.col);
            next.attrs = attrs.map((x, i) => {
                var attrLoc = loc.attrs[x.name];
                // workaround for parse5 version differences
                if (!attrLoc && x.prefix) {
                    // for example in svg `<use xlink:href="icons.svg#some_selector">`
                    attrLoc = loc.attrs[x.prefix + ":" + x.name];
                }
                var attr = new ASTAttribute();
                attr.name = x.name;
                attr.instruction = this.createAttributeInstruction(tag, x.name, x.value, attrLoc.line, attrLoc.col);
                attr.location = new FileLoc(attrLoc.line, attrLoc.col);
                return attr;
            });
            current.children.push(next);
            if (!parser.isVoid(tag))
                current = next;
        });
        parser.on("endTag", (tag, attrs, selfClosing, loc) => {
            current = current.parent;
        });
        parser.on("text", (text, loc) => {
            let child = new ASTTextNode();
            child.parent = current;
            child.expression = this.createTextExpression(text, loc.line, loc.col);
            child.location = new FileLoc(loc.line, loc.col);
            current.children.push(child);
        });
    }
    createAttributeInstruction(tag, name, value, line, column) {
        var instruction = null;
        try {
            let info = this.bindingLanguage.inspectAttribute(this.resources, tag, name, value);
            if (info)
                instruction = this.bindingLanguage.createAttributeInstruction(this.resources, { tagName: tag }, info, undefined);
        }
        catch (error) {
            this.reportSyntaxIssue(error, line, column);
        }
        return instruction;
    }
    createTextExpression(text, line, column) {
        var exp = null;
        try {
            exp = this.bindingLanguage.inspectTextContent(this.resources, text);
        }
        catch (error) {
            this.reportSyntaxIssue(error, line, column);
        }
        return exp;
    }
    reportSyntaxIssue(error, line, column) {
        let shorter = error.message.split(/\./);
        let msg = shorter ? shorter[0] : error.message.trim();
        let detail = shorter && shorter.length > 1 ? shorter.splice(1).join().trim() : null;
        let issue = new template_lint_1.Issue({
            message: msg,
            detail: detail,
            line: line,
            column: column,
            severity: template_lint_1.IssueSeverity.Error
        });
        if (this.reportBindingSyntax)
            this.reportIssue(issue);
    }
}
exports.ASTBuilder = ASTBuilder;
class FileLoc {
    constructor(line, column) {
        this.line = line;
        this.column = column;
    }
}
exports.FileLoc = FileLoc;
class ASTContext {
    constructor(init) {
        this.name = null;
        this.type = null;
        this.typeDecl = null;
        this.typeValue = null;
        if (init)
            Object.assign(this, init);
    }
}
exports.ASTContext = ASTContext;
class ASTNode {
    constructor(init) {
        this.context = null;
        this.locals = [];
        this.parent = null;
        this.children = [];
        this.location = null;
        if (init)
            Object.assign(this, init);
    }
    addChild(node) {
        if (this.children.indexOf(node) == -1) {
            this.children.push(node);
            node.parent = this;
        }
    }
    static inheritLocals(node, ancestor) {
        let locals = [];
        if (ancestor) {
            while (node != null && ancestor >= 0) {
                node = node.parent;
                ancestor -= 1;
            }
        }
        while (node != null) {
            node.locals.forEach(x => {
                let index = locals.findIndex(y => y.name == x.name);
                if (index == -1)
                    locals.push(x);
            });
            node = node.parent;
        }
        return locals;
    }
    static inheritContext(node, ancestor) {
        if (ancestor) {
            while (node != null && ancestor >= 0) {
                node = node.parent;
                ancestor -= 1;
            }
        }
        while (node != null) {
            if (node.context != null)
                return node.context;
            node = node.parent;
        }
        return null;
    }
}
exports.ASTNode = ASTNode;
class ASTAttribute {
}
exports.ASTAttribute = ASTAttribute;
class ASTElementNode extends ASTNode {
    constructor() {
        super();
    }
}
exports.ASTElementNode = ASTElementNode;
class ASTTextNode extends ASTNode {
    constructor() {
        super();
    }
}
exports.ASTTextNode = ASTTextNode;

//# sourceMappingURL=ast.js.map
