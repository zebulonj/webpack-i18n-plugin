'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.LocalizationPlugin = LocalizationPlugin;

var _immutable = require('immutable');

var _ConstDependency = require('webpack/lib/dependencies/ConstDependency');

var _ConstDependency2 = _interopRequireDefault(_ConstDependency);

var _NullFactory = require('webpack/lib/NullFactory');

var _NullFactory2 = _interopRequireDefault(_NullFactory);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var defaultOptions = {};

function LocalizationPlugin() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  this.options = _extends({}, defaultOptions, options);
  this.strings = (0, _immutable.Set)();
}

LocalizationPlugin.prototype.addString = function (string) {
  return this.strings = this.strings.add(string);
};

LocalizationPlugin.prototype.getStrings = function () {
  return this.strings;
};

LocalizationPlugin.prototype.apply = function (compiler) {
  var _this = this;

  compiler.plugin('compilation', function (compilation, data) {
    compilation.dependencyFactories.set(_ConstDependency2.default, new _NullFactory2.default());
    compilation.dependencyTemplates.set(_ConstDependency2.default, new _ConstDependency2.default.Template());

    data.normalModuleFactory.plugin('parser', function (parser) {
      parser.plugin('call __', function (expr) {
        //console.log( "Value:", expr.arguments[0].value );

        var param = parser.evaluateExpression(expr.arguments[0]);
        //console.log( "Param:", param );

        if (!param.isString()) return;
        param = param.string;

        _this.addString(param);

        //var result = localization ? localization(param) : defaultValue;
        var result = param;

        var dep = new _ConstDependency2.default(JSON.stringify(result), expr.range);
        dep.loc = expr.loc;
        //console.log( "Dependency:", result, expr.range, expr.loc, dep );

        parser.state.current.addDependency(dep);

        return true;
      });
    });
  });

  compiler.plugin('emit', function (compilation, callback) {
    var body = _this.getStrings().map(function (string) {
      return string.replace(/["]/g, '"');
    }).map(function (string) {
      return '\t"' + string + '":\n\t\t""';
    }).join(",\n");

    var doc = '{\n' + body + '\n}';

    // Insert this list into the webpack build as a new file asset:
    compilation.assets['i18n.template.json'] = {
      source: function source() {
        return doc;
      },
      size: function size() {
        return doc.length;
      }
    };

    callback();
  });
};

exports.default = LocalizationPlugin;