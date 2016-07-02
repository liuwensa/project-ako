'use strict';

module.exports = function UserBlockedError(vid, uid, reason) {
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = 'The uploader of video has been blocked for some reasons.';
    this.vid = vid;
    this.uid = uid;
    this.reason = reason;
};

require('util').inherits(module.exports, Error);
