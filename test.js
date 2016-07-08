'use strict';

const app = require('./main');
const request = require('supertest').agent(app.listen());

describe('Project Ako Tests', function() {
    this.timeout(30000);

    /* Main Site */
    it('200 to /', function(done) {
        request.get('/').expect(200, done);
    });

    /* API */
    it('API Links is OK', function(done) {
        request.get('/api/v0/').expect(200).end(function(err, res) {
            if (err) return done(err);
            if (res.body.code === 0) return done();
        });
    });

    /* Blacklist */
    it('Blacklists is OK', function(done) {
        request.get('/api/v0/blacklists').expect(200).end(function(err, res) {
            if (err) return done(err);
            if (res.body.code === 0) return done();
        });
    });

    /* Video */
    it('Successfully getting video information', function(done) {
        request.get('/api/v0/video/1547469').expect(200).end(function(err, res) {
            if (err) return done(err);
            if (res.body.code === 0 && res.body.data.uid === 1359996 && res.body.data.title === '【cirnocraft】⑨服沙漠遗迹合作解密地图活动解说') return done();
        });
    });

    it('Failed getting video information when video not found', function(done) {
        request.get('/api/v0/video/863').expect(200).end(function(err, res) {
            if (err) return done(err);
            if (res.body.code === 403) return done();
        });
    });

    it('Failed getting video information when video not found (HTTP 404)', function(done) {
        request.get('/api/v0/video/0').expect(200).end(function(err, res) {
            if (err) return done(err);
            if (res.body.code === 500) return done();
        });
    });

    it('Failed getting video information when video not accessible', function(done) {
        request.get('/api/v0/video/5148247').expect(200).end(function(err, res) {
            if (err) return done(err);
            if (res.body.code === 403) return done();
        });
    });

    it('Getting bangumi video, successful when in China Mainland, failed when in another countries', function(done) {
        request.get('/api/v0/video/5176515').expect(200).end(function(err, res) {
            if (err) return done(err);
            if (res.body.code === 0 && res.body.data.title === '【7月】LoveLive!Sunshine!! 01' && res.body.data.desc === '#01 想要闪闪发亮')
                return done();
            else if (res.body.code === 403)
                return done();
        });
    });

    it('Failed getting video information when video uploader in blacklist', function(done) {
        request.get('/api/v0/video/5162245').expect(200).end(function(err, res) {
            if (err) return done(err);
            if (res.body.code === 450) return done();
        });
    });

    it('Failed getting video information when cid is broken', function(done) {
        request.get('/api/v0/video/95862').expect(200).end(function(err, res) {
            if (err) return done(err);
            if (res.body.code === 405) return done();
        });
    });

    /* User */
    it('Successfully getting user information', function(done) {
        request.get('/api/v0/user/4238316').expect(200).end(function(err, res) {
            if (err) return done(err);
            if (res.body.code === 0 && res.body.data.uid === 4238316 && res.body.data.name === '朴莉PrettyLily') return done();
        });
    });

    it('Successfully getting user information with blacklist', function(done) {
        request.get('/api/v0/user/5518224').expect(200).end(function(err, res) {
            if (err) return done(err);
            if (res.body.code === 0 && res.body.data.blacklisted) return done();
        });
    });

    it('Failed getting user information when user not found', function(done) {
        request.get('/api/v0/user/0').expect(200).end(function(err, res) {
            if (err) return done(err);
            if (res.body.code === 500) return done();
        });
    });

    it('Failed getting user information when uid is invaild', function(done) {
        request.get('/api/v0/user/somebody').expect(200).end(function(err, res) {
            if (err) return done(err);
            if (res.body.code === 500) return done();
        });
    });

    it('Successfully getting user videos information', function(done) {
        request.get('/api/v0/user/153995/videos').expect(200).end(function(err, res) {
            if (err) return done(err);
            if (res.body.code === 0 && res.body.data.length > 0) return done();
        });
    });

    it('Failed getting user videos information when videos is empty', function(done) {
        request.get('/api/v0/user/4238316/videos').expect(200).end(function(err, res) {
            if (err) return done(err);
            if (res.body.code === 205) return done();
        });
    });

    it('Failed getting user videos information when user not found', function(done) {
        request.get('/api/v0/user/0/videos').expect(200).end(function(err, res) {
            if (err) return done(err);
            if (res.body.code === 500) return done();
        });
    });

    it('Failed getting user videos information when uid is invaild', function(done) {
        request.get('/api/v0/user/somebody/videos').expect(200).end(function(err, res) {
            if (err) return done(err);
            if (res.body.code === 500) return done();
        });
    });

    it('Successfully getting user favourite bangumis information', function(done) {
        request.get('/api/v0/user/2/bangumis').expect(200).end(function(err, res) {
            if (err) return done(err);
            if (res.body.code === 0 && res.body.data.count > 0) return done();
        });
    });

    it('Successfully getting user favourite bangumis information (with pages)', function(done) {
        request.get('/api/v0/user/2/bangumis?page=2').expect(200).end(function(err, res) {
            if (err) return done(err);
            if (res.body.code === 0 && res.body.data.list.length > 0) return done();
        });
    });

    it('Successfully getting user favourite bangumis information when bangumis is empty', function(done) {
        request.get('/api/v0/user/75174/bangumis').expect(200).end(function(err, res) {
            if (err) return done(err);
            if (res.body.code === 0 && res.body.data.list.length === 0) return done();
        });
    });

    it('Successfully getting user favourite bangumis information when page number out of range', function(done) {
        request.get('/api/v0/user/2/bangumis?page=666').expect(200).end(function(err, res) {
            if (err) return done(err);
            if (res.body.code === 0 && res.body.data.list.length === 0) return done();
        });
    });

    it('Successfully(!?) getting user favourite bangumis information when user not found', function(done) {
        request.get('/api/v0/user/0/bangumis').expect(200).end(function(err, res) {
            if (err) return done(err);
            if (res.body.code === 0 && res.body.data.list.length === 0) return done();
        });
    });

    it('Failed getting user favourite bangumis information when uid is invaild', function(done) {
        request.get('/api/v0/user/somebody/bangumis').expect(200).end(function(err, res) {
            if (err) return done(err);
            if (res.body.code === 500) return done();
        });
    });

    it('Failed getting user favourite bangumis information when page number is invaild', function(done) {
        request.get('/api/v0/user/2/bangumis?page=-1').expect(200).end(function(err, res) {
            if (err) return done(err);
            if (res.body.code === 406) return done();
        });
    });

    /* Bangumi */
    it('Successfully getting bangumi information', function(done) {
        request.get('/api/v0/bangumi/2600').expect(200).end(function(err, res) {
            if (err) return done(err);
            if (res.body.code === 0 && res.body.data.id === 2600 && res.body.data.title === '我老婆是学生会长！') return done();
        });
    });

    it('Failed getting bangumi information when bangumi not found', function(done) {
        request.get('/api/v0/bangumi/838').expect(200).end(function(err, res) {
            if (err) return done(err);
            if (res.body.code === 500) return done();
        });
    });

    it('Successfully getting bangumi sponsors information', function(done) {
        request.get('/api/v0/bangumi/5062/sponsors').expect(200).end(function(err, res) {
            if (err) return done(err);
            if (res.body.code === 0 && res.body.data.size > 0) return done();
        });
    });

    it('Successfully getting bangumi sponsors information (with pages)', function(done) {
        request.get('/api/v0/bangumi/5062/sponsors?page=2').expect(200).end(function(err, res) {
            if (err) return done(err);
            if (res.body.code === 0 && res.body.data.list.length > 0) return done();
        });
    });

    it('Successfully getting bangumi sponsors information (with sizes)', function(done) {
        request.get('/api/v0/bangumi/5062/sponsors?size=10').expect(200).end(function(err, res) {
            if (err) return done(err);
            if (res.body.code === 0 && res.body.data.list.length === 10) return done();
        });
    });

    it('Successfully getting bangumi sponsors information (with pages and sizes)', function(done) {
        request.get('/api/v0/bangumi/5062/sponsors?page=2&size=10').expect(200).end(function(err, res) {
            if (err) return done(err);
            if (res.body.code === 0 && res.body.data.list.length === 10) return done();
        });
    });

    it('Successfully getting bangumi sponsors information (empty)', function(done) {
        request.get('/api/v0/bangumi/2600/sponsors').expect(200).end(function(err, res) {
            if (err) return done(err);
            if (res.body.code === 0 && res.body.data.size === 0) return done();
        });
    });

    it('Failed getting bangumi sponsors information when bangumi not found', function(done) {
        request.get('/api/v0/bangumi/838/sponsors').expect(200).end(function(err, res) {
            if (err) return done(err);
            if (res.body.code === 0 && res.body.data.size === 0) return done();
        });
    });

    it('Failed getting bangumi sponsors information (with incorrect pages)', function(done) {
        request.get('/api/v0/bangumi/5062/sponsors?page=-1').expect(200).end(function(err, res) {
            if (err) return done(err);
            if (res.body.code === 406) return done();
        });
    });

    /* Community */
    it('Successfully getting community information', function(done) {
        request.get('/api/v0/community/1063').expect(200).end(function(err, res) {
            if (err) return done(err);
            if (res.body.code === 0 && res.body.data.id === 1063 && res.body.data.name === '东条希') return done();
        });
    });

    it('Failed getting community information when community not found', function(done) {
        request.get('/api/v0/community/0').expect(200).end(function(err, res) {
            if (err) return done(err);
            if (res.body.code === 500 && res.body.message === '目前尚未有该圈子') return done();
        });
    });

    it('Failed getting community information when id is invaild', function(done) {
        request.get('/api/v0/community/test').expect(200).end(function(err, res) {
            if (err) return done(err);
            if (res.body.code === 500 && res.body.message === '请求参数存在问题') return done();
        });
    });

    it('Successfully getting community posts', function(done) {
        request.get('/api/v0/community/1063/posts').expect(200).end(function(err, res) {
            if (err) return done(err);
            if (res.body.code === 0 && res.body.data.count > -1 && res.body.data.pages > 0) return done();
        });
    });

    it('Successfully getting community posts (with pages)', function(done) {
        request.get('/api/v0/community/1063/posts?page=2').expect(200).end(function(err, res) {
            if (err) return done(err);
            if (res.body.code === 0 && res.body.data.count > -1 && res.body.data.pages > 0) return done();
        });
    });

    it('Successfully getting community posts (with pages, empty)', function(done) {
        request.get('/api/v0/community/1063/posts?page=666').expect(200).end(function(err, res) {
            if (err) return done(err);
            if (res.body.code === 0 && res.body.data.list.length === 0) return done();
        });
    });

    it('Failed getting community posts when community not found', function(done) {
        request.get('/api/v0/community/0/posts').expect(200).end(function(err, res) {
            if (err) return done(err);
            if (res.body.code === 500 && res.body.message === '目前尚未有该圈子') return done();
        });
    });

    it('Failed getting community posts when id is invaild', function(done) {
        request.get('/api/v0/community/test/posts').expect(200).end(function(err, res) {
            if (err) return done(err);
            if (res.body.code === 500 && res.body.message === '请求参数存在问题') return done();
        });
    });

    it('Failed getting community posts when page number is invaild', function(done) {
        request.get('/api/v0/community/1063/posts?page=-1').expect(200).end(function(err, res) {
            if (err) return done(err);
            if (res.body.code === 406) return done();
        });
    });

    /* 203 Bus */
    it('So... I want to take 203 bus.', function(done) {
        request.get('/api/v0/bus/203').expect(418).end(function(err, res) {
            if (err) return done(err);
            if (res.body.code === 203) return done();
        });
    });
});
