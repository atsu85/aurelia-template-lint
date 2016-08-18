import { Rule } from 'template-lint';
export declare class Config {
    useRuleAttributeValue: boolean;
    useRuleObsoleteAttribute: boolean;
    useRuleObsoleteTag: boolean;
    useRuleConflictingAttribute: boolean;
    useRuleSelfClose: boolean;
    useRuleStructure: boolean;
    useRuleAureliaRequire: boolean;
    useRuleAureliaSlot: boolean;
    useRuleAureliaTemplate: boolean;
    useRuleAureliaBindingAccess: boolean;
    useRuleAureliaBindingSyntax: boolean;
    /**
     * Attribute Value Rules
     * attr: attributes that matches this reg-ex are checked
     * tag: applies the rule only on a specific element-tag, other-wise applies to all
     * msg: the error to report if the rule fails
     * is: the attribute value must match (entirely) the reg-ex.
     * not: the attribute value must not match (partially) the reg-ex.
     */
    attributeValueOpts: Array<{
        attr: RegExp;
        is?: RegExp;
        not?: RegExp;
        msg?: string;
        tag?: string;
    }>;
    /**
     * Obsolete Tag Rules
     * tag: the obsolete element
     * msg: the error to report if the element is found
     */
    obsoleteTagOpts: Array<{
        tag: string;
        msg?: string;
    }>;
    /**
    * Obsolete Attribute Rules
    * attr: the attribute name that is obsolete
    * tag: [optional] obsolete only when applied to a specfic element tag
    * msg: the error to report if the attribute is found
    */
    obsoleteAttributeOpts: Array<{
        attr: string;
        tag?: string;
        msg?: string;
    }>;
    /**
    * Conflicting Attribute Rules
    * attrs: the attributes that cannot be used on the same element
    * msg: the error to report if the rule fails
    */
    conflictingAttributeOpts: Array<{
        attrs: string[];
        msg?: string;
    }>;
    /**
    * Parser Options
    * voids: list of elements that do not have a close tag.
    * scopes: list of element that change the language scope.
    */
    parserOpts: {
        voids: string[];
        scopes: string[];
    };
    /**
    * Aurelia Binding Access Options
    * localProvidors: list of attributes that generate local variables
    * debugReportExceptions: when true, any caught exceptions are reported as rule issues.
    * restrictedAccess: access to type members with these modifiers will report an issue;
    */
    aureliaBindingAccessOpts: {
        localProvidors: string[];
        restrictedAccess: string[];
    };
    /**
    * Aurelia Slot Options
    * controllers: attributes that create template controllers
    */
    aureliaSlotOpts: {
        controllers: string[];
    };
    /**
    * Aurelia Template Options
    * containers: html container elements (used to ensure no repeat-for usage)
    */
    aureliaTemplateOpt: {
        containers: string[];
    };
    /**
    * Reflection Options
    * sourceFileGlob: glob pattern used to load source files (ts)
    * typingsFileGlob: glob pattern used to load typescript definition files.
    */
    reflectionOpts: {
        sourceFileGlob: string;
        typingsFileGlob: string;
    };
    /**
     * report exceptions as issues, where applicable
     */
    debug: boolean;
    /**
     * Append the linter rule-set with these rules
     */
    customRules: Rule[];
}
