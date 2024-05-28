# srt-parser [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url]
> Parser for a folder of SRT files

## Installation

```sh
$ npm install --save srt-parser
```

or for command line usage (Recommended)

```sh
$ npm install -g srt-parser
```

## Usage

```js
var srtParser = require('srt-parser');

srtParser('/directory/of/srt/files', 'combined_file.md');
```

Via command line:

```sh
$ srtparser /directory/of/srt/files combined_file.md
```

## License

MIT © [R.A. Lucas](https://github.com/ralucas)

[npm-image]: https://badge.fury.io/js/srt-parser.svg
[npm-url]: https://npmjs.org/package/srt-parser
[travis-image]: https://travis-ci.org/ralucas/srt-parser.svg?branch=master
[travis-url]: https://travis-ci.org/ralucas/srt-parser
[daviddm-image]: https://david-dm.org/ralucas/srt-parser.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/ralucas/srt-parser
