'use strict';

const koa = require('koa');
const app = koa();
const koaStatic = require('koa-static');

const routers = require('./routers');
const routerMain = routers.main;
const routerApi = routers.api;

/**
 * Response time header
 */
app.use(function *(next) {
    let start = new Date();
    yield next;
    let ms = new Date() - start;
    this.set('X-Response-Time', ms + 'ms');
});

/**
 * Logging
 */
app.use(function *(next) {
    let start = new Date();
    yield next;
    let ms = new Date() - start;
    console.log('%s %s - %s', this.method, this.url, ms);
});

/**
 * Static assets
 */
app.use(koaStatic(__dirname + '/static', {defer: true}));

/**
 * Routers
 */
app.use(routerMain.routes()).use(routerMain.allowedMethods());
app.use(routerApi.routes()).use(routerApi.allowedMethods());

/**
 * Listen
 */
app.listen(8388);

module.exports = app;
