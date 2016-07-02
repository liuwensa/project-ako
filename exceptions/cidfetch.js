'use strict';

module.exports = function CidFetchingError(vid, err) {
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = 'Can\'t fetch cid for video : ' + err.message;
    this.error = err;
    this.vid = vid;
};

require('util').inherits(module.exports, Error);
