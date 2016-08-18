import { Rule, Parser } from 'template-lint';
/**
 *  Rule to ensure root element is the template element
 */
export declare class TemplateRule extends Rule {
    containers?: string[];
    disable: boolean;
    first: boolean;
    count: number;
    constructor(containers?: string[]);
    init(parser: Parser): void;
}
