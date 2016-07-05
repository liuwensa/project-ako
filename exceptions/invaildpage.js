'use strict';

module.exports = function InvaildPageException() {
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = 'Page number is invaild';
};

require('util').inherits(module.exports, Error);
