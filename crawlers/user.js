'use strict';

const request = require('co-request');
const moment = require('moment');

const mongo = require('../mongo');
const exceptions = require('../exceptions/');
const reference = require('../reference');

function *getUserInformation(uid) {
    var cacheObj = yield mongo.userInfos.findOne({uid: +uid});
    if (cacheObj === null) {
        return yield getUserInformationFromRemote(uid);
    } else {
        let flag = moment(Date.now()).isAfter(cacheObj.db_update, 'day');
        if (flag) {
            yield mongo.userInfos.remove(cacheObj);
            return yield getUserInformationFromRemote(uid);
        } else {
            return cacheObj.data;
        }
    }
}

function *getUserVideos(uid, page) {
    var cacheObj = yield mongo.userVideos.findOne({uid: +uid, page: +page});
    if (cacheObj === null) {
        return yield getUserVideosFromRemote(uid, page);
    } else {
        let flag = moment(Date.now()).isAfter(cacheObj.db_update, 'day');
        if (flag) {
            yield mongo.userVideos.remove(cacheObj);
            return yield getUserVideosFromRemote(uid, page);
        } else {
            return cacheObj.data;
        }
    }
}

function *getUserBangumis(uid, page) {
    var cacheObj = yield mongo.userBangumis.findOne({uid: +uid, page: +page});
    if (cacheObj === null) {
        return yield getUserBangumisFromRemote(uid, page);
    } else {
        let flag = moment(Date.now()).isAfter(cacheObj.db_update, 'day');
        if (flag) {
            yield mongo.userBangumis.remove(cacheObj);
            return yield getUserBangumisFromRemote(uid, page);
        } else {
            return cacheObj.data;
        }
    }
}

function *getUserInformationFromRemote(uid) {
    var result1 = yield request({
        url: 'http://space.bilibili.com/ajax/member/GetInfo?mid=' + uid,
        headers: {
            'User-Agent': reference.userAgent
        }
    });

    if (result1.statusCode != 200)
        throw new Error('Get HTTP ' + result1.statusCode + ' error when getting user info');

    var tmpObj1 = JSON.parse(result1.body);
    var userObj = {};

    if (tmpObj1.status) {
        var data = tmpObj1.data;

        userObj.uid = +uid;
        userObj.name = data.name;
        userObj.avatar = data.face;
        userObj.description = data.sign;
        userObj.fans = data.fans;
        userObj.follows = {size: data.attention, list: data.attentions};
        userObj.regtime = data.regtime;
        userObj.level = data.level_info.current_level;
        userObj.birthday = data.birthday;
        userObj.place = data.place;
        userObj.sex = data.sex;
        userObj.verification = {verified: (data.approve || false), info: (data.description || '')};

        if (reference.blacklist.hasOwnProperty(uid))
            userObj.blacklisted = reference.blacklist[uid];
    } else {
        throw new Error(tmpObj1.data);
    }

    var result2 = yield request({
        url: 'http://space.bilibili.com/ajax/member/getTags?mids=' + uid,
        headers: {
            'User-Agent': reference.userAgent
        }
    });

    if (result2.statusCode != 200)
        throw new Error('Get HTTP ' + result2.statusCode + ' error when getting user info');

    var tmpObj2 = JSON.parse(result2.body);

    if (tmpObj2.status) {
        var data = tmpObj2.data;
        userObj.tags = data[0].tags;
        yield mongo.userInfos.insert({uid: +uid, data: userObj, db_update: Date.now()});
        return userObj;
    } else {
        throw new Error(tmpObj2.data);
    }
}

function *getUserVideosFromRemote(uid, page) {
    if (page && page < 1)
        throw new exceptions.InvaildPageException();

    var result = yield request({
        url: 'http://space.bilibili.com/ajax/member/getSubmitVideos?mid=' + uid + '&page=' + page,
        headers: {
            'User-Agent': reference.userAgent
        }
    });

    if (result.statusCode != 200)
        throw new Error('Get HTTP ' + result.statusCode + ' error when getting user info');

    var tmpObj = JSON.parse(result.body);
    var userVideoObj = {};

    if (tmpObj.status) {
        userVideoObj.count = tmpObj.count;
        userVideoObj.pages = tmpObj.pages;

        if (tmpObj.data.vlist) {
            userVideoObj.list = tmpObj.data.vlist;
            yield mongo.userVideos.insert({uid: +uid, page: +page, data: userVideoObj, db_update: Date.now()});
            return userVideoObj;
        } else {
            throw new exceptions.ContentEmptyException('The user has not submited videos');
        }
    } else {
        throw new Error(tmpObj.data.error);
    }
}

function *getUserBangumisFromRemote(uid, page) {
    if (page && page < 1)
        throw new exceptions.InvaildPageException();

    var result = yield request({
        url: 'http://space.bilibili.com/ajax/Bangumi/getList?mid=' + uid + '&page=' + page,
        headers: {
            'User-Agent': reference.userAgent
        }
    });

    if (result.statusCode != 200)
        throw new Error('Get HTTP ' + result.statusCode + ' error when getting user info');

    var tmpObj = JSON.parse(result.body);
    var userBangumiObj = {};

    if (tmpObj.status) {
        userBangumiObj.count = tmpObj.data.count;
        userBangumiObj.pages = tmpObj.data.pages;

        var list = [];
        for (let i = 0; i < tmpObj.data.result.length; ++i) {
            var obj = tmpObj.data.result[i];
            list.push(+obj.season_id);
        }
        userBangumiObj.list = list;

        yield mongo.userBangumis.insert({uid: +uid, page: +page, data: userBangumiObj, db_update: Date.now()});
        return userBangumiObj;
    } else {
        throw new Error(tmpObj.data);
    }
}

module.exports.info = getUserInformation;
module.exports.video = getUserVideos;
module.exports.bangumi = getUserBangumis;
