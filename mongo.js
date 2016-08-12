'use strict';

const monk = require('monk');
const wrap = require('co-monk');

let mongoIp = process.env.MONGODB_IP || process.env.OPENSHIFT_MONGODB_DB_HOST || 'localhost';
let mongoPort = process.env.MONGODB_PORT || process.env.OPENSHIFT_MONGODB_DB_PORT || 27017;
let mongoConn = process.env.MONGODB_CONNECTION || mongoIp + ':' + mongoPort + '/projAko';
const db = monk(mongoConn);

module.exports.videos = wrap(db.get('videos'));
module.exports.userInfos = wrap(db.get('userInfos'));
module.exports.userVideos = wrap(db.get('userVideos'));
module.exports.userBangumis = wrap(db.get('userBangumis'));
module.exports.bangumiInfos = wrap(db.get('bangumiInfos'));
module.exports.bangumiSponsors = wrap(db.get('bangumiSponsors'));
module.exports.communityInfos = wrap(db.get('communityInfos'));
module.exports.communityAdmins = wrap(db.get('communityAdmins'));
module.exports.communityPosts = wrap(db.get('communityPosts'));
