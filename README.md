# react-components

A collection of reusable React components with their own Flux lifecycle.

[![NPM version][npm-image]][npm-url] [![MIT License][license-image]][license-url] [![Build Status][travis-image]][travis-url]

## What's inside react-components?

#### [Table Component](./docs/table.md)

From a simple table to multi-column filtering, column sorting, row selection, client side pagination, and more.

#### [Search Component](./docs/search.md)

Search against large sets of data, populate results, and take action with all the sweet hot keys your power users are after.

#### [Pie Chart Component](./docs/piechart.md)

Display complex data with our pie chart's drill in/out functionality, hover animations, and result list.

#### [Modal Component](./docs/modal.md)

A simple single page modal that renders in it's own DOM tree and operates outside the render cycles of an application.

#### [Confirm Dialog Component](./docs/confirmdialog.md)

A page level component that displays a confirmation dialog to the user with OK/Cancel buttons.

#### [Page Message Component](./docs/pagemessage.md)

A page level component that animates in and out for success, error, warning, info, and custom messages.

## Getting Started

#### NPM Install react-components

```
$ npm install dataminr-react-components --save
```

#### If using a component which requests data from your APIs, add a mapping to your webpack config for the component which will be responsible for making requests
```
resolve: {
    alias: {
        RequestHandler$: path.join(__dirname, 'path', 'to', 'request', 'library'),
    }
},
```

#### Add external style sheet
```
<link type="text/css" rel="stylesheet" href="/node_modules/react-components/dist/react-components.css" />
```

## Submitting Issues

##### If you are submitting a bug, please create a [jsfiddle](http://jsfiddle.net/) demonstrating the issue if possible.

## Contributing

##### Fork the library and follow the Install Dependencies steps below.

```
$ git clone https://github.com/dataminr/react-components.git
$ git checkout master
```

#### Important Notes

* Pull requests should be made to the `master` branch with proper unit tests.
* Do not include the distribution files in your pull request. These are only sent to NPM

#### We use the following libraries within our project

* [React](http://facebook.github.io/react/) JavaScript library for building user interfaces
* [Flux](https://facebook.github.io/flux/) Application architecture for building user interfaces
* [lodash](https://lodash.com/docs) JavaScript utility library
* [Moment](http://momentjs.com/docs/) Parse, validate, manipulate, and display dates in JavaScript
* [jQuery](http://jquery.com/) Fast, small, and feature-rich JavaScript library
* [d3](http://d3js.org/) Manipulate documents based on data with Data-Driven Documents

##### Style

* [Compass](http://compass-style.org/) Css authoring framework
* [Sass](http://sass-lang.com/) CSS with superpowers

##### Unit testing and style checking

* [Jasmine](http://jasmine.github.io/2.2/introduction.html) Behavior-driven development framework for testing JavaScript code
* [Istanbul](https://github.com/gotwarlost/istanbul) JavaScript statement, line, function, and branch code coverage when running unit tests
* [ESLint](http://eslint.org/) The pluggable linting utility for JavaScript and JSX

#### Install Dependencies

##### Node

[node.js.org](nodejs.org)

##### Compass & Sass

```
$ gem install compass
```

##### Grunt command line interface

```
$ npm install -g grunt-cli
```

##### Finally, install third-party dependencies and start watchers:

```
$ cd ~/path/to/react-components/root
$ npm install
$ grunt
```

If you find your css build results are empty, update your sass gem.

#### Use the sample app in your browser to develop

> /react-components/examples/index.html

### Grunt Tasks

The default grunt task will start webpack to complile all JS/Sass and startup webpack dev server to server combined files.

```
$ grunt
```

Run Karma unit tests and eslint

```
$ grunt test
```

Same as grunt test, however, this task will run code coverage and launch the code coverage in your browser.

```
$ grunt test:cov
```

## License

MIT

## Special Thanks To:

The developers that made this project possible by contributing to the the following libraries and frameworks:

[React](http://facebook.github.io/react/), [Flux](https://facebook.github.io/flux/), [Compass](http://compass-style.org/), 
[Sass](http://sass-lang.com/), [Require](http://requirejs.org/), [Grunt](http://gruntjs.com/), [Jasmine](http://jasmine.github.io/2.2/introduction.html),
[Istanbul](https://github.com/gotwarlost/istanbul), [ESLint](http://eslint.org/), [Watch](https://github.com/gruntjs/grunt-contrib-watch),
[d3](http://d3js.org/), [lodash](https://lodash.com/docs), [jQuery](http://jquery.com/), and [Moment](http://momentjs.com/docs/)

[npm-image]: https://badge.fury.io/js/dataminr-react-components.svg
[npm-url]: https://www.npmjs.com/package/dataminr-react-components

[license-image]: http://img.shields.io/badge/license-MIT-blue.svg?style=flat
[license-url]: LICENSE

[travis-url]: https://travis-ci.org/dataminr/react-components
[travis-image]: https://travis-ci.org/dataminr/react-components.svg?branch=master