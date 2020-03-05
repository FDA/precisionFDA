// Inspired by https://stackoverflow.com/questions/50971774/jest-enzyme-tests-written-in-coffeescript
const coffee = require('coffeescript');
const babelJest = require('babel-jest');

module.exports = {
  process: (src, path, ...rest) => {
    if (coffee.helpers.isCoffee(path)) {

      // Compile the CoffeeScript files to JS
      compiled_to_js = coffee.compile(src, { bare: true });
      return babelJest.process(compiled_to_js, path, ...rest);

    }
    return src;
  }
};
