'use strict';

const request = require('co-request');
const moment = require('moment');

const mongo = require('../mongo');
const exceptions = require('../exceptions/');
const reference = require('../reference');

function *getCommunityInformation(id) {
    var cacheObj = yield mongo.communityInfos.findOne({id: +id});
    if (cacheObj === null) {
        return yield getCommunityInformationFromRemote(id);
    } else {
        let flag = moment(Date.now()).isAfter(cacheObj.db_update, 'day');
        if (flag) {
            yield mongo.communityInfos.remove(cacheObj);
            return yield getCommunityInformationFromRemote(id);
        } else {
            return cacheObj.data;
        }
    }
}

function *getCommunityPosts(id, page) {
    var cacheObj = yield mongo.communityPosts.findOne({id: +id, page: +page});
    if (cacheObj === null) {
        return yield getCommunityPostsFromRemote(id, page);
    } else {
        let flag = moment(Date.now()).isAfter(cacheObj.db_update, 'day');
        if (flag) {
            yield mongo.communityPosts.remove(cacheObj);
            return yield getCommunityPostsFromRemote(id, page);
        } else {
            return cacheObj.data;
        }
    }
}

function *getCommunityInformationFromRemote(id) {
    var result = yield request({
        url: 'http://www.im9.com/api/query.detail.community.do?community_id=' + id + '&captcha=1c45ca043b7a5ac607a75b2eb9af81fa&ts=' + Date.now().toString(),
        headers: {
            'User-Agent': reference.userAgent
        }
    });

    if (result.statusCode != 200)
        throw new Error('Get HTTP ' + result.statusCode + ' error when getting community info');

    var tmp = JSON.parse(result.body);
    var commObj = {};

    if (tmp.code === 0) {
        commObj.id = +id;
        commObj.name = tmp.data.name;
        commObj.avatar = tmp.data.avatar;
        commObj.banner = tmp.data.community_bg_url;
        commObj.desc = tmp.data.desc;
        commObj.post = {count: tmp.data.post_count, nickname: tmp.data.post_nickname};
        commObj.member = {count: tmp.data.member_count, nickname: tmp.data.member_nickname};
        commObj.admin = yield getCommunityAdmins(id);

        yield mongo.communityInfos.insert({id: +id, data: commObj, db_update: Date.now()});
        return commObj;
    } else {
        throw new Error(tmp.message);
    }
}

function *getCommunityPostsFromRemote(id, page) {
    if (page && page < 1)
        throw new exceptions.InvaildPageException();

    var result = yield request({
        url: 'http://www.im9.com/api/query.community.post.list.do?page_no=' + page + '&community_id=' + id + '&sort_type=1&captcha=1c45ca043b7a5ac607a75b2eb9af81fa&ts=' + Date.now().toString(),
        headers: {
            'User-Agent': reference.userAgent
        }
    });

    if (result.statusCode != 200)
        throw new Error('Get HTTP ' + result.statusCode + ' error when getting community info');

    var tmp = JSON.parse(result.body);
    var postsObj = {};

    if (tmp.code === 0) {
        postsObj.count = tmp.data.post_list.total_count;
        postsObj.pages = tmp.data.post_list.total_page;

        var tmpList = tmp.data.post_list.result;
        var posts = [];
        for (let i = 0; i < tmpList.length; ++i) {
            let tmpObj = tmpList[i];
            let obj = {
                id: tmpObj.post_id,
                title: tmpObj.post_title,
                summary: tmpObj.post_summary,
                created: tmpObj.post_time,
                top: (tmpObj.is_top === 1),
                link: tmpObj.post_url,
                author: {
                    name: tmpObj.author_name,
                    uid: tmpObj.author_mid,
                    avatar: tmpObj.author_avatar
                },
                reply: tmpObj.reply_count,
                like: tmpObj.praise_count,
                last_reply: {
                    time: tmpObj.last_reply_time,
                    uid: tmpObj.last_reply_mid,
                    username: tmpObj.last_reply_author
                }
            };
            posts.push(obj);
        }
        postsObj.list = posts;

        yield mongo.communityPosts.insert({id: +id, data: postsObj, db_update: Date.now()});
        return postsObj;
    } else {
        throw new Error(tmp.message);
    }
}

function *getCommunityAdmins(id) {
    var cacheObj = yield mongo.communityAdmins.findOne({id: +id});
    if (cacheObj === null) {
        return yield getCommunityAdminsFromRemote(id);
    } else {
        let flag = moment(Date.now()).isAfter(cacheObj.db_update, 'day');
        if (flag) {
            yield mongo.communityAdmins.remove(cacheObj);
            return yield getCommunityAdminsFromRemote(id);
        } else {
            return cacheObj.data;
        }
    }
}

function *getCommunityAdminsFromRemote(id) {
    var result = yield request({
        url: 'http://www.im9.com/api/query.community.administrator.list.do?community_id=' + id + '&captcha=1c45ca043b7a5ac607a75b2eb9af81fa&ts=' + Date.now().toString(),
        headers: {
            'User-Agent': reference.userAgent
        }
    });

    if (result.statusCode != 200)
        throw new Error('Get HTTP ' + result.statusCode + ' error when getting community info');

    var tmp = JSON.parse(result.body);
    var adminsObj = {};

    if (tmp.code === 0) {
        var admins = [];
        for (let i = 0; i < tmp.data.length; ++i) {
            var obj = tmp.data[i];
            admins.push({
                username: obj.username,
                uid: obj.member_id,
                avatar: obj.apply_avatar,
                role: obj.role_id
            });
        }
        adminsObj.admins = admins;

        var roles = [];
        for (let i = 0; i < tmp.roles.length; ++i) {
            var obj = tmp.roles[i];
            roles.push({
                id: obj.role_id,
                name: obj.role_name
            });
        }
        adminsObj.roles = roles;

        yield mongo.communityAdmins.insert({id: +id, data: adminsObj, db_update: Date.now()});
        return adminsObj;
    } else {
        throw new Error(tmp.message);
    }
}

module.exports.info = getCommunityInformation;
module.exports.posts = getCommunityPosts;
