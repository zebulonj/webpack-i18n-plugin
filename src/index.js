import { Set } from 'immutable';

import ConstDependency from 'webpack/lib/dependencies/ConstDependency';
import NullFactory from 'webpack/lib/NullFactory';

const defaultOptions = {};

export function LocalizationPlugin( options = {} ) {
  this.options = Object.assign( {}, defaultOptions, options );
  this.strings = Set();
}

LocalizationPlugin.prototype.addString = function( string ) {
  return ( this.strings = this.strings.add( string ) );
}

LocalizationPlugin.prototype.getStrings = function() {
  return this.strings;
}

LocalizationPlugin.prototype.apply = function( compiler ) {
  compiler.plugin( 'compilation', ( compilation, data ) => {
    compilation.dependencyFactories.set( ConstDependency, new NullFactory() );
		compilation.dependencyTemplates.set( ConstDependency, new ConstDependency.Template() );

    data.normalModuleFactory.plugin( 'parser', ( parser ) => {
      parser.plugin( 'call __', expr => {
        //console.log( "Value:", expr.arguments[0].value );

        let param = parser.evaluateExpression( expr.arguments[0] );
        //console.log( "Param:", param );

        if( !param.isString() ) return;
        param = param.string;

        this.addString( param );

        //var result = localization ? localization(param) : defaultValue;
        const result = param;

        var dep = new ConstDependency( JSON.stringify( result ), expr.range );
        dep.loc = expr.loc;
        //console.log( "Dependency:", result, expr.range, expr.loc, dep );

        parser.state.current.addDependency( dep );

        return true;
      });
    });
  });

  compiler.plugin( 'emit', ( compilation, callback ) => {
    const body = this.getStrings()
      .map( string => string.replace( /["]/g, '"' ) )
      .map( string => `\t"${ string }":\n\t\t""` )
      .join( ",\n" );

    const doc = `{\n${ body }\n}`;

    // Insert this list into the webpack build as a new file asset:
    compilation.assets['i18n.template.json'] = {
      source() {
        return doc;
      },
      size() {
        return doc.length;
      }
    };

    callback();
  });
};

export default LocalizationPlugin;
