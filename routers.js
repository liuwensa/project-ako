'use strict';

const routerMain = require('koa-router')();
const routerApi = require('koa-router')({prefix: '/api/v0'});
const render = require('./render');

const videoFetch = require('./crawlers/video');
const userFetch = require('./crawlers/user');
const bangumiFetch = require('./crawlers/bangumi');
const communityFetch = require('./crawlers/community');

const exceptions = require('./exceptions/');
const reference = require('./reference');

/**
 * Main page
 */
routerMain.get('/', function *(next) {
    this.body = yield render('index', {serverPath: this.request.origin});
});

/**
 * API
 */
routerApi.use(function *(next) {
    this.set('Access-Control-Allow-Origin', '*');
    yield next;
});

routerApi.get('/', function *(next) {
    this.body = {code: 0,
        links: {
            blacklist: this.request.origin + '/api/v0/blacklists',
            video_info: this.request.origin + '/api/v0/video/{vid}',
            user_info: this.request.origin + '/api/v0/user/{uid}',
            user_videos_info: this.request.origin + '/api/v0/user/{uid}/videos',
            user_favourite_bangumis: this.request.origin + '/api/v0/user/{uid}/bangumis',
            bangumi_info: this.request.origin + '/api/v0/bangumi/{bangumi id}',
            bangumi_sponsors: this.request.origin + '/api/v0/bangumi/{bangumi id}/sponsors{?page={page number}&size={page size}}',
            community_info: this.request.origin + '/api/v0/community/{community id}',
            community_posts: this.request.origin + '/api/v0/community/{community id}/posts{?page={page number}}'
        }
    };
});

routerApi.get('/blacklists', function *(next) {
    this.body = {code: 0,
        data: reference.blacklist
    };
});

routerApi.get('/video/:vid', function *(next) {
    try {
        let videoObj = yield videoFetch(this.params.vid);
        this.body = {code: 0,
            data: videoObj
        };
    } catch (e) {
        switch (e.name) {
            case 'VideoAccessError':
                this.body = {code: 403,
                    message: '无法获取视频信息，视频有可能已经被删除或需要特殊权限访问。'
                };
                break;
            case 'CidFetchingError':
                this.body = {code: 405,
                    message: '无法获取视频的 cid ，该视频的视频源可能已经损坏或不受支持。'
                };
                break;
            case 'UserBlockedError':
                this.body = {code: 450,
                    message: '该视频的上传者由于拥有不良记录而被系统自动屏蔽。',
                    uid: e.uid,
                    reason: e.reason
                };
                break;
            default:
                this.body = {code: 500,
                    message: e.message
                };
        }
    }
});

routerApi.get('/user/:uid', function *(next) {
    try {
        let userObj = yield userFetch.info(this.params.uid);
        this.body = {code: 0,
            data: userObj
        };
    } catch (e) {
        this.body = {code: 500,
            message: e.message
        };
    }
});

routerApi.get('/user/:uid/videos', function *(next) {
    try {
        let userVideoObj = yield userFetch.video(this.params.uid);
        this.body = {code: 0,
            data: userVideoObj
        };
    } catch (e) {
        switch (e.name) {
            case 'ContentEmptyException':
                this.body = {code: 205,
                    message: '该用户从未上传过任何视频。'
                };
                break;
            default:
                this.body = {code: 500,
                    message: e.message
                };
        }
    }
});

routerApi.get('/user/:uid/bangumis', function *(next) {
    try {
        let userBangumiObj = yield userFetch.bangumi(this.params.uid, (this.request.query.page || 1));
        this.body = {code: 0,
            data: userBangumiObj
        };
    } catch (e) {
        switch (e.name) {
            case 'InvaildPageException':
                this.body = {code: 406,
                    message: '请求页数有误，它不能是负数或零。'
                };
                break;
            default:
                this.body = {code: 500,
                    message: e.message
                };
        }
    }
});

routerApi.get('/bangumi/:id', function *(next) {
    try {
        let bangumiObj = yield bangumiFetch.info(this.params.id);
        this.body = {code: 0,
            data: bangumiObj
        };
    } catch (e) {
        this.body = {code: 500,
            message: e.message
        };
    }
});

routerApi.get('/bangumi/:id/sponsors', function *(next) {
    try {
        let sponsorObj = yield bangumiFetch.sponsors(this.params.id, this.request.query.page, this.request.query.size);
        this.body = {code: 0,
            data: sponsorObj
        };
    } catch (e) {
        switch (e.name) {
            case 'InvaildPageException':
                this.body = {code: 406,
                    message: '请求页数有误，它不能是负数或零。'
                };
                break;
            default:
                this.body = {code: 500,
                    message: e.message
                };
        }
    }
});

routerApi.get('/community/:id', function *(next) {
    try {
        let commObj = yield communityFetch.info(this.params.id);
        this.body = {code: 0,
            data: commObj
        };
    } catch (e) {
        this.body = {code: 500,
            message: e.message
        };
    }
});

routerApi.get('/community/:id/posts', function *(next) {
    try {
        let commObj = yield communityFetch.posts(this.params.id, (this.request.query.page || 1));
        this.body = {code: 0,
            data: commObj
        };
    } catch (e) {
        switch (e.name) {
            case 'InvaildPageException':
                this.body = {code: 406,
                    message: '请求页数有误，它不能是负数或零。'
                };
                break;
            default:
                this.body = {code: 500,
                    message: e.message
                };
        }
    }
});

routerApi.get('/bus', function *(next) {
    this.body = {
        code: 0,
        data: {
            203: this.request.origin + '/api/v0/bus/203',
            322: this.request.origin + '/api/v0/bus/322'
        }
    };
});

routerApi.use('/bus/203', function *(next) {
    this.status = 418;
    yield next;
});

routerApi.get('/bus/203', function *(next) {
    this.body = {
        code: 203,
        message: 'I\'m a bus.'
    };
});

routerApi.post('/bus/203', function *(next) {
    this.body = {
        code: 203,
        message: 'I\'m a bus, you can\'t copying me.'
    };
});

routerApi.put('/bus/203', function *(next) {
    this.body = {
        code: 203,
        message: 'I\'m a bus, you can\'t replace me.'
    };
});

routerApi.delete('/bus/203', function *(next) {
    this.body = {
        code: 203,
        message: 'I\'m a bus, you can\'t delete me.'
    };
});

routerApi.use('/bus/322', function *(next) {
    this.status = 418;
    yield next;
});

routerApi.get('/bus/322', function *(next) {
    this.body = {
        code: 322,
        message: 'I\'m a bus.'
    };
});

routerApi.post('/bus/322', function *(next) {
    this.body = {
        code: 322,
        message: 'I\'m a bus, you can\'t copying me.'
    };
});

routerApi.put('/bus/322', function *(next) {
    this.body = {
        code: 322,
        message: 'I\'m a bus, you can\'t replace me.'
    };
});

routerApi.delete('/bus/322', function *(next) {
    this.body = {
        code: 322,
        message: 'I\'m a bus, you can\'t delete me.'
    };
});

module.exports.main = routerMain;
module.exports.api = routerApi;
