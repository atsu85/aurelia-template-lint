"use strict";
const template_lint_1 = require('template-lint');
const template_lint_2 = require('template-lint');
const template_lint_3 = require('template-lint');
const template_lint_4 = require('template-lint');
const template_lint_5 = require('template-lint');
const template_lint_6 = require('template-lint');
const template_lint_7 = require('template-lint');
const require_1 = require('./rules/require');
const slot_1 = require('./rules/slot');
const template_1 = require('./rules/template');
const binding_1 = require('./rules/binding');
const reflection_1 = require('./reflection');
const config_1 = require('./config');
const aurelia_pal_nodejs_1 = require('aurelia-pal-nodejs');
aurelia_pal_nodejs_1.initialize();
class AureliaLinter {
    constructor(config) {
        if (config == undefined)
            config = new config_1.Config();
        this.config = config;
        this.reflection = new reflection_1.Reflection();
        let rules = [];
        if (this.config.useRuleSelfClose)
            rules.push(new template_lint_2.SelfCloseRule());
        if (this.config.useRuleStructure)
            rules.push(new template_lint_3.StructureRule());
        if (this.config.useRuleObsoleteAttribute)
            rules.push(new template_lint_5.ObsoleteAttributeRule(config.obsoleteAttributeOpts));
        if (this.config.useRuleObsoleteTag)
            rules.push(new template_lint_4.ObsoleteTagRule(config.obsoleteTagOpts));
        if (this.config.useRuleAttributeValue)
            rules.push(new template_lint_6.AttributeValueRule(config.attributeValueOpts));
        if (this.config.useRuleConflictingAttribute)
            rules.push(new template_lint_7.ConflictingAttributesRule(config.conflictingAttributeOpts));
        if (this.config.useRuleAureliaRequire)
            rules.push(new require_1.RequireRule());
        if (this.config.useRuleAureliaSlot)
            rules.push(new slot_1.SlotRule(config.aureliaSlotOpts.controllers));
        if (this.config.useRuleAureliaTemplate)
            rules.push(new template_1.TemplateRule(config.aureliaTemplateOpt.containers));
        if (this.config.useRuleAureliaBindingAccess || this.config.useRuleAureliaBindingSyntax)
            rules.push(new binding_1.BindingRule(this.reflection, {
                reportBindingSyntax: this.config.useRuleAureliaBindingSyntax,
                reportBindingAccess: this.config.useRuleAureliaBindingAccess,
                reportExceptions: this.config.debug,
                localProvidors: this.config.aureliaBindingAccessOpts.localProvidors,
                restrictedAccess: this.config.aureliaBindingAccessOpts.restrictedAccess
            }));
        if (this.config.customRules)
            rules.concat(config.customRules);
        this.linter = new template_lint_1.Linter(rules, config.parserOpts.scopes, config.parserOpts.voids);
        this.init = this.reflection.addGlob(this.config.reflectionOpts.sourceFileGlob)
            .then(() => {
            if (this.config.reflectionOpts.typingsFileGlob != null)
                return this.reflection.addTypingsGlob(this.config.reflectionOpts.typingsFileGlob);
            else
                return Promise.resolve();
        });
    }
    lint(html, path) {
        if (this.init) {
            return this.init.then(() => {
                this.init = null;
                return this.linter.lint(html, path);
            });
        }
        else {
            return this.linter.lint(html, path);
        }
    }
}
exports.AureliaLinter = AureliaLinter;

//# sourceMappingURL=aurelia-linter.js.map
