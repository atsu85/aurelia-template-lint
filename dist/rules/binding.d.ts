import 'aurelia-polyfills';
import { Parser, Issue } from 'template-lint';
import { Reflection } from '../reflection';
import { ASTBuilder } from '../ast';
/**
 *  Rule to ensure static type usage is valid
 */
export declare class BindingRule extends ASTBuilder {
    private reflection;
    reportBindingAccess: boolean;
    reportExceptions: boolean;
    localProvidors: string[];
    restrictedAccess: string[];
    constructor(reflection: Reflection, opt?: {
        reportBindingSyntax?: boolean;
        reportBindingAccess?: boolean;
        reportExceptions?: boolean;
        localProvidors?: string[];
        restrictedAccess?: string[];
    });
    init(parser: Parser, path?: string): void;
    finalise(): Issue[];
    private examineNode(node);
    private examineElementNode(node);
    private examineTextNode(node);
    private examineAttribute(node, attr);
    private examineBehaviorInstruction(node, instruction);
    private examineListenerExpression(node, exp);
    private examineNameExpression(node, exp);
    private examineInterpolationExpression(node, exp);
    private resolveViewModel(path);
    private resolveAccessScopeToType(node, chain, loc);
    private resolveAccessChainToType(node, context, locals, chain, loc);
    private resolveValueContext(value, memberName, loc);
    private resolveLocalType(locals, memberName);
    private resolveStaticType(context, memberName, loc);
    private resolveClassMembers(classDecl);
    private resolveInterfaceMembers(interfaceDecl);
    private flattenAccessChain(access);
    private toSymbol(path);
    private toFile(symbol);
    private toCamelCase(value);
    private toDashCase(value);
    private reportUnresolvedAccessObjectIssue(member, objectName, loc);
    private reportUnresolvedAccessMemberIssue(member, decl, loc);
    private reportPrivateAccessMemberIssue(member, decl, loc, accessModifier);
}
