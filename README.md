# aurelia-template-lint

![logo](https://d30y9cdsu7xlg0.cloudfront.net/png/30843-200.png)

Sanity check of Aurelia-flavor Template HTML.

[![NPM version][npm-image]][npm-url]
[![NPM downloads][npm-downloads]][npm-url]
[![Travis Status][travis-image]][travis-url]
[![Breaks-on][breaks-image]][npm-url]
[![Stability][stability-image]][npm-url]
[![Gitter][gitter-image]][gitter-url]

##Info
This project was the result of wondering why aurelia applications had missing content when you used self-closing tags.
In the end it turns out that if your template html is ill-formed, the browser's parser will not complain and you will simply have missing content
and/or an ill formed DOM element tree.

By using this lint during your development cycle, you can spot problems with your html and/or templates before they cause problems in the browser.
aurelia-template-lint extends upon [template-lint](https://github.com/MeirionHughes/template-lint/) (the base lint project) to add aurelia-specific rules
and easier configuration of them.

See:
* [StackOverflow: aurelia-self-closing-require-element-does-not-work](http://stackoverflow.com/questions/37300986/aurelia-self-closing-require-element-does-not-work)
* [StackOverflow: aurelia-sanity-check-template-html](http://stackoverflow.com/questions/37322985/aurelia-sanity-check-template-html)

*Note: it is recommended you use this via the [gulp plugin](https://github.com/MeirionHughes/gulp-aurelia-template-lint).*
*If you use this library directly, in a production environment (ci), then ensure you lock to a minor version as this library is under development and subject to breaking changes on minor versions*

##Example
using the default config (plus type checking - *see below*), the example:


***foo.html***
```html
01:<template>
02:  <require/>
03:  <div repeat.for="item of"></div>
04:  <content></content>
05:  <slot></slot><slot></slot>
06:  <table>
07:    <template></template>
08:  </table>
09:  <div style="width: ${width}px; height: ${height}px;"></div>
10:  <div repeat.for="item of items" with.bind="items"></div>
11:  <template repeat.for="item of items">
12:    ${item.ino} 
13:    ${item.role.isAdmn} 
14:    ${item.update().sizeee}
15:  </template>
16:  <template with.bind="person">
17:    ${address.postcdo}
18:  </template>
19:  <table>
20:    <tr repeat.for="item of items">
21:      <td>${item.nme}</td>
22:    </tr>
23:  </table>
24:  <div value.bind="car.modl"></div>
25:</etemps>
```
***foo.ts***
```ts
import {Person} from './my-types/person';
import {Item} from './my-types/item';
import {Car} from 'my-lib';

export class FooViewModel {
  person: Person;
  items: Item[];
  car: Car;
  width:number;
  height:number;
}
```

will result in the following errors:

```
suspected unclosed element detected [ln: 1 col: 1]
self-closing element [ln: 2 col: 3]
require tag is missing a 'from' attribute [ln: 2 col: 3]
Incorrect syntax for "for" [ln: 3 col: 8]
  * The form is: "$local of $items" or "[$key, $value] of $items",
<content> is obsolete [ln: 4 col: 3]
  * use slot instead
more than one default slot detected [ln: 5 col: 16]
template as child of <table> not allowed [ln: 7 col: 5]
interpolation not allowed in style attribute [ln: 9 col: 3]
conflicting attributes: [repeat.for, with.bind] [ln: 10 col: 3]
  * template controllers shouldn't be placed on the same element
cannot find 'ino' in type 'Item' [ln: 13 col: 5]
cannot find 'isAdmn' in type 'Role' [ln: 15 col: 5]
cannot find 'sizeee' in type 'Data' [ln: 17 col: 5]
cannot find 'postcdo' in type 'Address' [ln: 18 col: 5]
cannot find 'nme' in type 'Item' [ln: 21 col: 11]
cannot find 'modl' in type 'Car' [ln: 24 col: 8]
mismatched close tag [ln: 25 col: 1]
```

The full example is available in the repository; including the custom typings. 

## Rules
Rules used by default:

* **SelfClose**
  * *ensure non-void elements do not self-close*
* **Parser**
  * *returns detected unclosed/ill-matched elements errors captured during parsing*
* **ObsoleteTag**
  * *identify obsolete tag usage*
* **ObsoleteAttributes**
  * *identify obsolete attribute usage*
* **AttributeValue**
  * *ensure attributes exactly match an expected pattern*
  * *ensure attributes don't contain any matches of an pattern*
  * *ensure attribute is used for a tag*
* **Slot**
  * *don't allow two, or more, slots to have the same name;*
  * *don't allow more than one default slot;*  
* **Require**
  * *ensure require elments have a 'from' attribute*
* **ConflictingAttributes**
  * *ensure element doesn't have attribute combination marked as conflicting.* 
  * *i.e. template controller attributes (`if.bind` and `repeat.for` on the same element)*
* **Template**
  * *ensure root is a template element, unless its <html>*
  * *no more than one template element present*
* **Binding Syntax**
  * *ensure binding syntax is correct*
* **Binding Access**
  * *ensure binding correlates with fields of known types (static type checking)*

I'm more than happy to add or improve rules;
so please feel free to [create an issue](https://github.com/MeirionHughes/aurelia-template-lint/labels/rule),
or even a pull request.

## Install

_Note: node.js 5 or 6 is required. There is currently an issue in trying to install some aurelia dependencies in node.js 4._ 

```
npm install aurelia-template-lint
```

##Usage
*For use with gulp, there is a [gulp plugin available](https://github.com/MeirionHughes/gulp-aurelia-template-lint)*


```js
const AureliaLinter = require('aurelia-template-lint').AureliaLinter

var linter = new AureliaLinter();

var html = "<template></template>"

linter.lint(html)
  .then((errors) => {           
      errors.forEach(error => {         
         console.log(`${error.message} [ln: ${error.line} col: ${error.column}]`);
             if(error.detail) console.log(`  * ${error.detail}`);
      });
  });
```

can be configured by passing a config object

```js
const Config = require('aurelia-template-lint').Config

var config = new Config();

config.obsoleteTagOpts.push({tag:'my-old-tag', msg:'is really old'});

var linter = new AureliaLinter(config);
```

Config is an object type of the form and default:

```ts
export class Config {

    useRuleAttributeValue = true;         // error on bad attribute value
    useRuleObsoleteAttribute = true;      // error on use of obsolete attributes
    useRuleObsoleteTag = true;            // error on use of obsolete tags
    useRuleConflictingAttribute = true    // error on use of conflicting attributes
    useRuleSelfClose = true;              // error on self-closed tags
    useRuleStructure = true;              // error on mismatched tags (unclosed)

    useRuleAureliaRequire = true;         // error on bad require tag usage (aurelia-flavor)
    useRuleAureliaSlot = true;            // error on bad slot usage (aurelia-flavor)
    useRuleAureliaTemplate = true;        // error on bad template usage (aurelia-flavor)
    useRuleAureliaBindingAccess = false;  // error on bad view-model binding, when type is known (static type checking)
    useRuleAureliaBindingSyntax = true;   // error on bad binding syntax (as reported by aurelia) 

    /**
     * Attribute Value Rules
     * attr: attributes that matches this reg-ex are checked
     * tag: applies the rule only on a specific element-tag, other-wise applies to all
     * msg: the error to report if the rule fails
     * is: the attribute value must match (entirely) the reg-ex.
     * not: the attribute value must not match (partially) the reg-ex. 
     */
    attributeValueOpts: Array<{ attr: RegExp, is?: RegExp, not?: RegExp, msg?: string, tag?: string }> = [
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
    ]


    /**
     * Obsolete Tag Rules     
     * tag: the obsolete element
     * msg: the error to report if the element is found
     */
    obsoleteTagOpts: Array<{ tag: string, msg?: string }> = [
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
    obsoleteAttributeOpts: Array<{ attr: string, tag?: string, msg?: string }> = [
        {
            attr: "replaceable",
            tag: "template",
            msg: "has been superceded by the slot element"
        }
    ];

    /**
    * Conflicting Attribute Rules
    * attrs: the attributes that cannot be used on the same element
    * msg: the error to report if the rule fails
    */
    conflictingAttributeOpts: Array<{ attrs: string[], msg?: string }> = [
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
    parserOpts = {
        voids: ['area', 'base', 'br', 'col', 'embed', 'hr',
            'img', 'input', 'keygen', 'link', 'meta',
            'param', 'source', 'track', 'wbr'],

        scopes: ['html', 'body', 'template', 'svg', 'math']
    }

    /**
    * Aurelia Binding Access Options
    * localProvidors: list of attributes that generate local variables
    * debugReportExceptions: when true, any caught exceptions are reported as rule issues. 
    * restrictedAccess: access to type members with these modifiers will report an issue;
    */
    aureliaBindingAccessOpts = {
        localProvidors: [
            "repeat.for", "if.bind", "with.bind"
        ],
        restrictedAccess: ["private", "protected"]
    }

    
    /**
    * Aurelia Slot Options
    * controllers: attributes that create template controllers
    */
    aureliaSlotOpts = {
        controllers: [
            "repeat.for", "if.bind", "with.bind"
        ]
    }
    
    /**
    * Aurelia Template Options
    * containers: html container elements (used to ensure no repeat-for usage)
    */
    aureliaTemplateOpt = {
        containers: ['table', 'select']
    }

    /**
    * Reflection Options
    * sourceFileGlob: glob pattern used to load source files (ts)
    * typingsFileGlob: glob pattern used to load typescript definition files. 
    */
    reflectionOpts = {
        sourceFileGlob: "source/**/*.ts",
        typingsFileGlob: "typings/**/*.d.ts",
    }

    /**
     * report exceptions as issues, where applicable 
     */
    debug = false;
    
    /**
     * Append the linter rule-set with these rules
     */
    customRules: Rule[] = [];
}
```

## Static Type Checking
In order to use static type checking you must opt-in by setting `useRuleAureliaBindingAccess = true`. 

your template html and source must have a path that defined as being in the same directory, i.e: *"source/foo.html"* and *"source/foo.ts"*. 
You pass the path of the html file to the lint function. See Below. 

It is posible to change the glob configuration to include javascript files instead of typescript; but this can only 
check first-depth access. 

```js
var config = new Config();

config.useRuleAureliaBindingAccess = true;
config.reflectionOpts.sourceFileGlob = "example/**/*.ts"; //or "example/**/*.js"

var linter = new AureliaLinter(config);

var htmlpath = "./example/foo.html";
var html = fs.readFileSync(htmlpath, 'utf8');

linter.lint(html, htmlpath)
  .then((results) => {
    results.forEach(error => {
      console.log(`${error.message} [ln: ${error.line} col: ${error.column}]`);
      if (error.detail) console.log(`  * ${error.detail}`);
    });
  });
```

please [report any false-negatives, code exceptions or issues](https://github.com/MeirionHughes/aurelia-template-lint/issues/35) with an example of what (HTML/TS) causes the problem. 

also note it will probably be far easier to use this via [gulp plugin](https://github.com/MeirionHughes/gulp-aurelia-template-lint), where you'll only need to pass the config object

##Compiling
Clone the repository. 
In the project root run
```shell
npm install
npm test
```

test with: 
```shell
gulp compile:typescript && node example.js
```

##Visual Studio Code

Once installed, you can use make use of Visual Studio Code launcher (`ctrl + f5`). Also allows you to place breakpoints on ts spec files (currently only for those files in `outDir` path in `launch.json` see: https://github.com/Microsoft/vscode/issues/6915) 
  

## Contributors
Special thanks to:

* **atsu85** - https://github.com/atsu85
* **Jan Žák** - https://github.com/zakjan

If you would like to contribute code or failing tests (for rules you'd like) you are most welcome to do so. 
Please feel free to PR or raise an issue. :)  

##Icon

Icon courtesy of [The Noun Project](https://thenounproject.com/)

[npm-url]: https://npmjs.org/package/aurelia-template-lint
[npm-image]: http://img.shields.io/npm/v/aurelia-template-lint.svg
[npm-downloads]: http://img.shields.io/npm/dm/aurelia-template-lint.svg
[travis-url]: https://travis-ci.org/MeirionHughes/aurelia-template-lint
[travis-image]: https://img.shields.io/travis/MeirionHughes/aurelia-template-lint/master.svg
[breaks-image]: https://img.shields.io/badge/breaks--on-minor-yellow.svg
[stability-image]: https://img.shields.io/badge/stability-2%20%3A%20unstable-red.svg

[gitter-image]: https://img.shields.io/gitter/room/MeirionHughes/aurelia-template-lint.svg
[gitter-url]:https://gitter.im/MeirionHughes/aurelia-template-lint

