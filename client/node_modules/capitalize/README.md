# capitalize ![Build](https://github.com/grncdr/js-capitalize/workflows/Node%20CI/badge.svg)

Capitalize the first letter of a string, or all words in a string.

## Synopsis

Capitalize the first letter of a string:

```javascript
var capitalize = require('capitalize')

var test = require('tape')

test('Capitalize first letter', function (t) {
  t.plan(1)
  t.equal(capitalize("united states"), "United states")
})
```

Or capitalize each word in a string:

```javascript
test('Capitalize each word', function (t) {
  t.plan(1)
  t.equal(capitalize.words("united states"), "United States")
})
```

No matter the original case:

```javascript
test('Capitalize first letter with original string...', function (t) {
  t.plan(2)

  t.test('...in upper case', function (t1) {
    t1.plan(1)
    t1.equal(capitalize.words("UNITED STATES"), "United States")
  })

  t.test('...in mixed case', function (t2) {
    t2.plan(1)
    t2.equal(capitalize.words("uNiTeD sTaTeS"), "United States")
  })

})

test('Capitalize each word with original string...', function (t) {
  t.plan(2)

  t.test('...in upper case', function (t1) {
    t1.plan(1)
    t1.equal(capitalize.words("UNITED STATES"), "United States")
  })

  t.test('...in mixed case', function (t2) {
    t2.plan(1)
    t2.equal(capitalize.words("uNiTeD sTaTeS"), "United States")
  })

})
```

Thanks to [@c990802](https://github.com/grncdr/js-capitalize/pull/2) and [Stack Overflow](http://stackoverflow.com/questions/20690499/concrete-javascript-regex-for-accented-characters-diacritics), capitalize handles international characters:

```javascript
test('Capitalize words with international characters', function (t) {
  t.plan(1)
  t.equal(capitalize.words('hello-cañapolísas'), 'Hello-Cañapolísas')
})
```

and thanks to [@6akcuk](https://github.com/grncdr/js-capitalize/pull/11) it can also capitalize cyrillic characters:

```javascript
test('Capitalize words with cyrillic characters', function (t) {
  t.plan(1)
  t.equal(capitalize.words('привет мир'), "Привет Мир")
})
```

and thanks to [@ultraflynn](https://github.com/grncdr/js-capitalize/pull/3), capitalize properly handles quotes within the string:

```javascript
test('Capitalize each word, ignoring quotes', function(t) {
    t.plan(1)
    t.equal(capitalize.words("it's a nice day"), "It's A Nice Day")
})
```

and thanks to [@sergejkaravajnij](https://github.com/grncdr/js-capitalize/pull/9), capitalize also supports a second boolean parameter to preserve casing of the rest of the strings content:

```javascript
test('Capitalize a string, preserving the original case of other letters', function (t) {
  t.plan(1)
  t.equal(capitalize('canDoItRight', true), 'CanDoItRight')
})

test('Capitalize words, preserving the case', function (t) {
  t.plan(1)
  t.equal(capitalize.words('on gitHub', true), 'On GitHub')
})
```

and thanks to [@rubengmurray](https://github.com/grncdr/js-capitalize/pull/13), capitalize now handles shorthand ordinal numbers as would be expected:

```javascript
test('Capitalize words, handling shorthand ordinals (1st, 2nd, 3rd) correctly', function (t) {
  t.plan(1)
  t.equal(capitalize.words('1st place'), '1st Place')
})
```


## Install

    npm install capitalize

## License

MIT
