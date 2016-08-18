import { InterpolationBindingExpression } from 'aurelia-templating-binding';
import { Rule, Parser } from 'template-lint';
import ts = require('typescript');
export declare class ASTBuilder extends Rule {
    root: ASTNode;
    reportBindingSyntax: boolean;
    private resources;
    private bindingLanguage;
    private container;
    constructor();
    init(parser: Parser): void;
    private createAttributeInstruction(tag, name, value, line, column);
    private createTextExpression(text, line, column);
    private reportSyntaxIssue(error, line, column);
}
export declare class FileLoc {
    line: number;
    column: number;
    constructor(line: number, column: number);
}
export declare class ASTContext {
    name: string;
    type: ts.TypeNode;
    typeDecl: ts.Declaration;
    typeValue: Object;
    constructor(init?: {
        name?: string;
        type?: ts.TypeNode;
        typeDecl?: ts.Declaration;
        typeValue?: Object;
    });
}
export declare class ASTNode {
    context: ASTContext;
    locals: ASTContext[];
    parent: ASTNode;
    children: ASTNode[];
    location: FileLoc;
    constructor(init?: {
        context?: ASTContext;
        locals?: ASTContext[];
        parent?: ASTNode;
        children?: ASTNode[];
        location?: FileLoc;
    });
    addChild(node: ASTNode): void;
    static inheritLocals(node: ASTNode, ancestor?: number): ASTContext[];
    static inheritContext(node: ASTNode, ancestor?: number): ASTContext;
}
export declare class ASTAttribute {
    name: string;
    instruction: any;
    location: FileLoc;
}
export declare class ASTElementNode extends ASTNode {
    tag: string;
    attrs: ASTAttribute[];
    constructor();
}
export declare class ASTTextNode extends ASTNode {
    expression: InterpolationBindingExpression;
    constructor();
}
