import * as ts from 'typescript';
export declare class Reflection {
    sourceFiles: ts.SourceFile[];
    pathToSource: {};
    addGlob(pattern?: string): Promise<any>;
    addTypingsGlob(pattern?: string): Promise<any>;
    add(path: string, source: string): void;
    addTypings(source: string): void;
    getDeclForType(source: ts.SourceFile, typeName: string): ts.DeclarationStatement;
    getDeclForImportedType(source: ts.SourceFile, typeName: string): ts.DeclarationStatement;
    resolveClassElementType(node: ts.ClassElement): ts.TypeNode;
    resolveTypeElementType(node: ts.TypeElement): ts.TypeNode;
    resolveTypeName(node: ts.TypeNode): string;
}
