'use strict';

module.exports = function VideoAccessError(vid) {
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = 'Can\'t access video page, video may been deleted or need permission.';
    this.vid = vid;
};

require('util').inherits(module.exports, Error);
