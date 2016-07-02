'use strict';

const request = require('co-request');
const cheerio = require('cheerio');

const reference = require('../reference');

function *getBangumiInformation(id) {
    var result = yield request({
        url: 'http://bangumi.bilibili.com/anime/' + id,
        headers: {
            'User-Agent': reference.userAgent
        }
    });

    if (result.statusCode != 200)
        throw new Error('Get HTTP ' + result.statusCode + ' error when getting bangumi info');

    var $ = cheerio.load(result.body, {normalizeWhitespace: true});
    var bangumiObj = {};

    bangumiObj.id = +id;
    bangumiObj.title = $('h1.info-title').text();
    bangumiObj.desc = $('div.info-desc').text();
    bangumiObj.cover = $('div.bangumi-preview img').attr('src');
    bangumiObj.play = $('span.info-count-item-play em').text();
    bangumiObj.fans = $('span.info-count-item-fans em').text();
    bangumiObj.danmaku = $('span.info-count-item-review em').text();
    bangumiObj.status = $('div.info-update em span').slice(1).text().trim();
    bangumiObj.date = $('div.info-update em span').eq(0).text().replace('开播', '');

    var cv = [];
    var cvElements = $('span.info-cv-item');
    for (let i = 0; i < cvElements.length; ++i)
        cv.push(cvElements.eq(i).text().replace('、', ''));
    bangumiObj.cv = cv;

    var tags = [];
    var tagElements = $('span.info-style-item');
    for (let i = 0; i < tagElements.length; ++i)
        tags.push(tagElements.eq(i).text());
    bangumiObj.tags = tags;

    return bangumiObj;
}

module.exports.info = getBangumiInformation;
