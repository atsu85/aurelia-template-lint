"use strict";
class DefaultNamingConvention {
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
}
exports.DefaultNamingConvention = DefaultNamingConvention;

//# sourceMappingURL=naming-conventions.js.map
