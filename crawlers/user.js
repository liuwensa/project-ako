'use strict';

const request = require('co-request');

const videoFetch = require('./video');

const exceptions = require('../exceptions/');
const reference = require('../reference');

function *getUserInformation(uid) {
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
        userObj.verification = {verified: data.approve, info: data.description};

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

        return userObj;
    } else {
        throw new Error(tmpObj2.data);
    }
}

function *getUserVideos(uid) {
    var result = yield request({
        url: 'http://space.bilibili.com/ajax/member/getSubmitVideos?mid=' + uid,
        headers: {
            'User-Agent': reference.userAgent
        }
    });

    if (result.statusCode != 200)
        throw new Error('Get HTTP ' + result.statusCode + ' error when getting user info');

    var tmpObj = JSON.parse(result.body);
    var userVideoObj = [];

    if (tmpObj.status) {
        if (tmpObj.data.vlist) {
            userVideoObj = tmpObj.data.vlist;
            return userVideoObj;
        } else {
            throw new exceptions.ContentEmptyException('The user has not submited videos');
        }
    } else {
        throw new Error(tmpObj.data.error);
    }
}

module.exports.info = getUserInformation;
module.exports.video = getUserVideos;
