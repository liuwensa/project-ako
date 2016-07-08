'use strict';

const request = require('co-request');
const cheerio = require('cheerio');
const moment = require('moment');

const mongo = require('../mongo');
const exceptions = require('../exceptions/');
const reference = require('../reference');

function *getVideoInformation(vid) {
    var cacheObj = yield mongo.videos.findOne({vid: +vid});
    if (cacheObj === null) {
        return yield getVideoInformationFromRemote(vid);
    } else {
        let flag = moment(Date.now()).isAfter(cacheObj.db_update, 'day');
        if (flag) {
            yield mongo.videos.remove(cacheObj);
            return yield getVideoInformationFromRemote(vid);
        } else {
            return cacheObj;
        }
    }
}

function *getVideoInformationFromRemote(vid) {
    var result1 = yield request({
        url: 'http://www.bilibili.com/video/av' + vid + '/',
        headers: {
            'User-Agent': reference.userAgent,
            'Accept-Encoding': 'gzip, deflate'
        },
        gzip: true
    });

    if (result1.statusCode != 200)
        throw new Error('Get HTTP ' + result1.statusCode + ' error when getting video info');

    var $ = cheerio.load(result1.body);
    var videoObj = {};

    var msgElement1 = $('div.b-page-body style').toString();
    if (msgElement1.search(/check4login/) != -1 || msgElement1.search(/notfound/) != -1 || msgElement1.search(/checking/) != -1)
        throw new exceptions.VideoAccessError(vid);

    var msgElement2 = $('div script').toString();
    if (msgElement2.search(/对不起，你输入的参数有误！/) != -1 || msgElement2.search(/本视频已撞车或被版权所有者申述/) != -1)
        throw new exceptions.VideoAccessError(vid);

    videoObj.vid = +vid;
    videoObj.cover = $('img.cover_image').attr('src');
    videoObj.title = $('div.v-title h1').attr('title');
    videoObj.date = moment($('div.tminfo time i').text() + ' +0800', 'YYYY-MM-DD HH:mm Z').valueOf();
    videoObj.desc = $('div#v_desc').text();

    var plistElement = $('select#dedepagetitles');
    if (plistElement.children().length > 0)
        videoObj.isMultipart = true;

    var uidRegex = /mid='(\d+)'/;
    var uid_1 = $('div.f').attr('mid');
    var uid_2 = '';
    $('script').each(function(index, element) {
        if (uid_2) return;
        var elementHtml = $(element).html();
        try {uid_2 = uidRegex.exec(elementHtml)[1];} catch (e) {}
    });
    var uid = uid_1 || uid_2;
    videoObj.uid = +uid;
    if (reference.blacklist.hasOwnProperty(uid))
        throw new exceptions.UserBlockedError(vid, uid, reference.blacklist[uid]);

    var username_1 = $('a.name').text();
    var username_2 = $('meta[name=\'author\']').attr('content');
    videoObj.username = username_1 || username_2;

    var cidHtml = '';
    var cidRegex = /cid=(\d+)/;
    var cid_1 = $('div.scontent iframe').attr('src');
    var cid_2 = $('div.scontent script').text();
    var cid_3 = $('div.scontent embed').attr('flashvars');

    if (cid_1 || cid_2 || cid_3) {
        cidHtml = cid_1 || cid_2 || cid_3;
        try {
            videoObj.cid = +(cidRegex.exec(cidHtml)[1]);
        } catch (e) {
            throw new exceptions.CidFetchingError(vid, e);
        }
    }

    var result2 = yield request({
        url: 'http://interface.bilibili.com/player?id=cid:' + videoObj.cid + '&aid=' + videoObj.vid,
        headers: {
            'User-Agent': reference.userAgent
        }
    });

    if (result2.statusCode != 200)
        throw new Error('Get HTTP ' + result2.statusCode + ' error when getting video info');

    $ = cheerio.load(result2.body);

    videoObj.click = +($('click').text());
    videoObj.danmaku = +($('danmu').text());
    videoObj.coin = +($('coins').text());
    videoObj.favourite = +($('favourites').text());
    videoObj.duration = $('duration').text();

    var result3 = yield request({
        url: 'http://api.bilibili.com/x/reply?jsonp=jsonp&type=1&sort=0&oid=' + videoObj.vid + '&pn=1&nohot=1',
        headers: {
            'User-Agent': reference.userAgent
        }
    });

    if (result3.statusCode != 200)
        throw new Error('Get HTTP ' + result3.statusCode + ' error when getting video info');

    var replyInfo = JSON.parse(result3.body);

    if (replyInfo.code === 0)
        videoObj.reply = replyInfo.data.page.acount;
    else
        throw new Error('Get error code ' + replyInfo.code + ' when getting video info');

    var result4 = yield request({
        url: 'http://api.bilibili.com/x/tag/archive/tags?jsonp=jsonp&aid=' + videoObj.vid + '&nomid=1',
        headers: {
            'User-Agent': reference.userAgent
        }
    });

    if (result4.statusCode != 200)
        throw new Error('Get HTTP ' + result4.statusCode + ' error when getting video info');

    var tagInfo = JSON.parse(result4.body);

    if (tagInfo.code === 0) {
        var tags = [];
        for (let i = 0; i < tagInfo.data.length; ++i)
            tags.push(tagInfo.data[i].tag_name);
        videoObj.tags = tags;
        videoObj.db_update = Date.now();

        yield mongo.videos.insert(videoObj);
        return videoObj;
    } else if (tagInfo.code === 16006) {
        videoObj.tags = [];
        videoObj.db_update = Date.now();

        yield mongo.videos.insert(videoObj);
        return videoObj;
    } else {
        throw new Error('Get error code ' + tagInfo.code + ' when getting video info');
    }
}

module.exports = getVideoInformation;
