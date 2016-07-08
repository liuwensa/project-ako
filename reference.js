'use strict';

const moment = require('moment');
const winston = require('winston');

module.exports.logger = new winston.Logger({
    transports: [
        new winston.transports.Console({
            colorize: true,
            prettyPrint: true,
            timestamp: function() {
                return moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
            }
        }),
        new winston.transports.File({
            filename: 'logs/' + moment(Date.now()).format('YYYY-MM-DD') + '.log',
            json: false,
            prettyPrint: true,
            timestamp: function() {
                return moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
            },
            handleExceptions: true,
            humanReadableUnhandledException: true,
            exitOnError: false
        })
    ]
});

module.exports.userAgent = 'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.130 Safari/537.36';

module.exports.blacklist = {
    '15651459': '多次跟风创建低质量音MAD作品污染音MAD区',
    '9117212': 'DSSQ，详见：http://tieba.baidu.com/p/4524945733',
    '808171': 'DSSQ大头子之一，某DSSQ组织的老大，制作出大量DSSQ作品',
    '375375': 'DSSQ大头子之一，某DSSQ组织的成员，制作出大量DSSQ作品',
    '391679': 'DSSQ大头子之一，某DSSQ组织的成员，制作出大量DSSQ作品',
    '7714': 'DSSQ大头子之一，制作出大量DSSQ作品',
    '22377697': '多次跟风创建低质量音MAD作品',
    '5518224': '创建大量低质量音MAD作品，外带违规使用他人素材',
    '13924730': '低质量搬运和剽窃视频'
};
