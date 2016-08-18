"use strict";
class Config {
    constructor() {
        this.useRuleAttributeValue = true; // error on bad attribute value
        this.useRuleObsoleteAttribute = true; // error on use of obsolete attributes
        this.useRuleObsoleteTag = true; // error on use of obsolete tags
        this.useRuleConflictingAttribute = true; // error on use of conflicting attributes
        this.useRuleSelfClose = true; // error on self-closed tags
        this.useRuleStructure = true; // error on mismatched tags (unclosed)
        this.useRuleAureliaRequire = true; // error on bad require tag usage (aurelia-flavor)
        this.useRuleAureliaSlot = true; // error on bad slot usage (aurelia-flavor)
        this.useRuleAureliaTemplate = true; // error on bad template usage (aurelia-flavor)
        this.useRuleAureliaBindingAccess = false; // error on bad view-model binding, when type is known (static type checking)
        this.useRuleAureliaBindingSyntax = true; // error on bad binding syntax (as reported by aurelia) 
        /**
         * Attribute Value Rules
         * attr: attributes that matches this reg-ex are checked
         * tag: applies the rule only on a specific element-tag, other-wise applies to all
         * msg: the error to report if the rule fails
         * is: the attribute value must match (entirely) the reg-ex.
         * not: the attribute value must not match (partially) the reg-ex.
         */
        this.attributeValueOpts = [
            {
                attr: /^style$/,
                not: /\${(.?)+}/,
                msg: "interpolation not allowed in style attribute"
            },
            {
                attr: /^bindable$/,
                not: /[a-z][A-Z]/,
                msg: "camelCase bindable is converted to camel-case",
                tag: "template"
            },
            {
                tag: "button",
                attr: /^type$/,
                is: /^button$|^submit$|^reset$|^menu$/,
                msg: "button type invalid"
            }
        ];
        /**
         * Obsolete Tag Rules
         * tag: the obsolete element
         * msg: the error to report if the element is found
         */
        this.obsoleteTagOpts = [
            {
                tag: 'content',
                msg: 'use slot instead'
            }
        ];
        /**
        * Obsolete Attribute Rules
        * attr: the attribute name that is obsolete
        * tag: [optional] obsolete only when applied to a specfic element tag
        * msg: the error to report if the attribute is found
        */
        this.obsoleteAttributeOpts = [];
        /**
        * Conflicting Attribute Rules
        * attrs: the attributes that cannot be used on the same element
        * msg: the error to report if the rule fails
        */
        this.conflictingAttributeOpts = [
            {
                attrs: ["repeat.for", "if.bind", "with.bind"],
                msg: "template controllers shouldn't be placed on the same element"
            }
        ];
        /**
        * Parser Options
        * voids: list of elements that do not have a close tag.
        * scopes: list of element that change the language scope.
        */
        this.parserOpts = {
            voids: ['area', 'base', 'br', 'col', 'embed', 'hr',
                'img', 'input', 'keygen', 'link', 'meta',
                'param', 'source', 'track', 'wbr'],
            scopes: ['html', 'body', 'template', 'svg', 'math']
        };
        /**
        * Aurelia Binding Access Options
        * localProvidors: list of attributes that generate local variables
        * debugReportExceptions: when true, any caught exceptions are reported as rule issues.
        * restrictedAccess: access to type members with these modifiers will report an issue;
        */
        this.aureliaBindingAccessOpts = {
            localProvidors: [
                "repeat.for", "if.bind", "with.bind"
            ],
            restrictedAccess: ["private", "protected"]
        };
        /**
        * Aurelia Slot Options
        * controllers: attributes that create template controllers
        */
        this.aureliaSlotOpts = {
            controllers: [
                "repeat.for", "if.bind", "with.bind"
            ]
        };
        /**
        * Aurelia Template Options
        * containers: html container elements (used to ensure no repeat-for usage)
        */
        this.aureliaTemplateOpt = {
            containers: ['table', 'select']
        };
        /**
        * Reflection Options
        * sourceFileGlob: glob pattern used to load source files (ts)
        * typingsFileGlob: glob pattern used to load typescript definition files.
        */
        this.reflectionOpts = {
            sourceFileGlob: "source/**/*.ts",
            typingsFileGlob: "typings/**/*.d.ts",
        };
        /**
         * report exceptions as issues, where applicable
         */
        this.debug = false;
        /**
         * Append the linter rule-set with these rules
         */
        this.customRules = [];
    }
}
exports.Config = Config;

//# sourceMappingURL=config.js.map
