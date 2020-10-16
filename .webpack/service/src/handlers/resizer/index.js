(function(e, a) { for(var i in a) e[i] = a[i]; }(exports, /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/handlers/resizer/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/handlers/resizer/index.js":
/*!***************************************!*\
  !*** ./src/handlers/resizer/index.js ***!
  \***************************************/
/*! exports provided: handler */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "handler", function() { return handler; });
/* harmony import */ var _resizeHandler__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./resizeHandler */ "./src/handlers/resizer/resizeHandler.js");

const handler = async event => {
  try {
    const imagePath = await _resizeHandler__WEBPACK_IMPORTED_MODULE_0__["resizeHandler"]._process(event);
    const URL = `http://${process.env.BUCKET}.s3-website.${process.env.REGION}.amazonaws.com`;
    return {
      headers: {
        'location': `${URL}/${imagePath}`
      },
      statusCode: 301,
      body: ''
    };
  } catch (error) {
    console.log(error);
    return new Error(error);
  }
};

/***/ }),

/***/ "./src/handlers/resizer/resizeHandler.js":
/*!***********************************************!*\
  !*** ./src/handlers/resizer/resizeHandler.js ***!
  \***********************************************/
/*! exports provided: resizeHandler */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "resizeHandler", function() { return resizeHandler; });
/* harmony import */ var _s3Handler__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./s3Handler */ "./src/handlers/resizer/s3Handler.js");
 //Core image processing package

const sharp = __webpack_require__(/*! sharp */ "sharp");

class ResizerHandler {
  constructor() {}

  async _process(event) {
    const {
      size,
      image
    } = event.pathParameters;
    return await this.resize(size, image);
  }

  async resize(size, path) {
    try {
      const sizeArray = size.split('x');
      const width = parseInt(sizeArray[0]);
      const height = parseInt(sizeArray[1]);
      const Key = path;
      const newKey = '' + width + 'x' + height + '/' + path;
      const Bucket = process.env.BUCKET;
      const streamResize = sharp().resize(width, height).toFormat('png');
      const readStream = _s3Handler__WEBPACK_IMPORTED_MODULE_0__["s3Handler"].readStream({
        Bucket,
        Key
      });
      const {
        writeStream,
        uploaded
      } = _s3Handler__WEBPACK_IMPORTED_MODULE_0__["s3Handler"].writeStream({
        Bucket,
        Key: newKey
      }); //data streaming

      readStream.pipe(streamResize).pipe(writeStream);
      await uploaded;
      return newKey;
    } catch (error) {
      throw new Error(error);
    }
  }

}

const resizeHandler = new ResizerHandler();

/***/ }),

/***/ "./src/handlers/resizer/s3Handler.js":
/*!*******************************************!*\
  !*** ./src/handlers/resizer/s3Handler.js ***!
  \*******************************************/
/*! exports provided: s3Handler */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "s3Handler", function() { return s3Handler; });
/* harmony import */ var aws_sdk__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! aws-sdk */ "aws-sdk");
/* harmony import */ var aws_sdk__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(aws_sdk__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var stream__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! stream */ "stream");
/* harmony import */ var stream__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(stream__WEBPACK_IMPORTED_MODULE_1__);


aws_sdk__WEBPACK_IMPORTED_MODULE_0__["config"].region = 'us-east-1';
const S3 = new aws_sdk__WEBPACK_IMPORTED_MODULE_0__["S3"]();

class S3Handler {
  constructor() {}

  readStream({
    Bucket,
    Key
  }) {
    return S3.getObject({
      Bucket,
      Key
    }).createReadStream();
  }

  writeStream({
    Bucket,
    Key
  }) {
    const passThrough = new stream__WEBPACK_IMPORTED_MODULE_1___default.a.PassThrough();
    return {
      writeStream: passThrough,
      uploaded: S3.upload({
        ContentType: 'image/png',
        Body: passThrough,
        Bucket,
        Key
      }).promise()
    };
  }

}

const s3Handler = new S3Handler();

/***/ }),

/***/ "aws-sdk":
/*!**************************!*\
  !*** external "aws-sdk" ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("aws-sdk");

/***/ }),

/***/ "sharp":
/*!************************!*\
  !*** external "sharp" ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("sharp");

/***/ }),

/***/ "stream":
/*!*************************!*\
  !*** external "stream" ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("stream");

/***/ })

/******/ })));
//# sourceMappingURL=index.js.map