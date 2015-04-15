[![Build Status](https://travis-ci.org/dataminr/react-components.svg?branch=master)](https://travis-ci.org/dataminr/react-components)
# react-components

## Just getting your project started?

##### Try our [Yeoman](http://yeoman.io) generator for testing, linting, watchers, and more!

> [generator-reactjs-flux](https://github.com/dataminr/generator-reactjs-flux) for Facebook's React framework and Flux application architecture.

## What's inside react-components?

[Try the Demo](http://dataminr.github.io/react-components)

#### [Table Component](./docs/table.md)

From a simple table to multi-column filtering, column sorting, row selection, client side pagination, and more.

#### [Search Component](./docs/search.md)

Search against large sets of data, populate results, and take action with all the sweet hot keys your power users are after.

#### [Pie Chart Component](./docs/piechart.md)

Display complex data with our pie chart's drill in/out functionality, hover animations, and result list.

#### [Modal Component](./docs/modal.md)

A simple single page modal that renders in it's own DOM tree and operates outside the render cycles of an application.

## Getting Started

#### Install Bower if it is not already installed

```
$ npm install -g bower
```

#### Bower Install react-components

```
$ bower install react-components --save
```

#### Include the following in require config (file names must match)

```
AppDispatcher: '/path/to/AppDispatcher',
RequestHandler: 'path/to/RequestHandler'
```

#### Add external style sheet
```
<link type="text/css" rel="stylesheet" href="/bower_components/react-components/dist/react-components.css" />
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
* Do not include the minified files in your pull request. We build these when we tag a release.

#### We use the following libraries within our project

* [React](http://facebook.github.io/react/) JavaScript library for building user interfaces
* [Flux](https://facebook.github.io/flux/) Application architecture for building user interfaces
* [Require](http://requirejs.org/) JavaScript file and module loader optimized for in-browser use
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
* [JSHint](http://jshint.com/) Detect errors and potential problems in JavaScript code and enforce your team's coding conventions
* [JSCS](http://jscs.info/) JavaScript Code Style checker

#### Install Dependencies

##### Node

[node.js.org](nodejs.org)

##### Bower

```
$ npm install -g bower
```

##### Compass & Sass

```
$ gem install compass
```

##### Grunt command line interface

```
$ npm install -g grunt-cli
```

##### React tools

```
$ npm install -g react-tools
```

##### Finally, install third-party dependencies and start watchers:

```
$ cd ~/path/to/react-components/root
$ grunt init
```

#### Bower link react-components to work locally
```
$ cd ~/path/to/react-components/root
$ bower link
$ cd ~/path/to/project/root
$ bower link react-components
```

NPM Troubles? npm ERR! Are you seeing something like: `Error: EACCES, mkdir '/Users/user/.npm/dargs/2.1.0'` ?
Try the following commands and try the previous step again:

```
$ cd ~
$ sudo chown -R $(whoami) .npm
```

If you find your css build results are empty, update your sass gem.

#### Use the sample app in your browser to develop

> /react-components/src/js/examples/index.html

### Grunt Tasks

The default grunt task will compile jsx and scss files as well as start a watcher for them.

```
$ grunt
```

Same as the default grunt task, however it will reinstall dependencies.

```
$ grunt init
```

Run Jasmine unit tests, JSHint, and JSCS.

```
$ grunt test
```

Run Jasmine unit tests on a single file.

```
$ grunt jasmine --filter filename
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
[Istanbul](https://github.com/gotwarlost/istanbul), [JSHint](http://jshint.com/), [JSCS](http://jscs.info/), [Watch](https://github.com/gruntjs/grunt-contrib-watch),
[d3](http://d3js.org/), [lodash](https://lodash.com/docs), [jQuery](http://jquery.com/), and [Moment](http://momentjs.com/docs/)
