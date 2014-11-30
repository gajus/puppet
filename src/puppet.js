var Phantom,
    WebPage,
    Promise,
    Sister = require('sister'),
    Promise = require('bluebird'),


/**
 * Starts a PhantomJS process with command line options and
 * creates an instance of a WebPage.
 *
 * @see http://phantomjs.org/api/command-line.html
 * @param {Object} commandLineOptions
 * @return {Puppet}
 */
Phantom = function Puppet (commandLineOptions) {
    var puppet,
        ee,
        phantomPromise;

    if (!(this instanceof Puppet)) {
        return new Puppet(commandLineOptions);
    }

    puppet = this;

    ee = Sister();

    puppet.on = ee.on;

    phantomPromise = new Promise(function (resolve) {
        var Phantom;

        Phantom = require('phantom');
        Phantom.create(Puppet._phantomCommandLineOptions(commandLineOptions), {}, function (phantom) {
            resolve(phantom);
        });
    });

    /**
     * Creates an instance of a Web Page module.
     * 
     * @see http://phantomjs.org/api/webpage/
     * @param {}
     */
    puppet.create = function (settings) {
        return WebPage(phantomPromise, settings);
    };
};

/**
 * @param {Promise} phantomPromise Promise that resolves to an instance of a WebPage.
 * @param {Object} settings http://phantomjs.org/api/webpage/property/settings.html
 */
WebPage = function WebPage (phantomPromise, settings) {
    var webPage,
        ee,
        page,
        queue,
        _queue = [];

    if (!(this instanceof WebPage)) {
        return new WebPage(phantomPromise, settings);
    }

    webPage = this;

    ee = Sister();

    webPage.on = ee.on;

    /**
     * Make fn into a promise that is executed after all queued promises.
     * Add fn to the queue of promises.
     *
     * @param {Function} fn
     */
    queue = function (fn) {
        var previous,
            promise;

        previous = Promise.all(_queue);

        promise = new Promise(function (resolve) {
            previous.then(function () {
                fn(resolve);
            });
        });

        _queue.push(promise);

        return promise;
    };

    queue(function (resolve) {
        phantomPromise.then(function (phantom) {
            phantom.createPage(function (_page) {
                page = _page;
                
                WebPage._bindCallbacks(_page, ee);

                resolve();
            }, settings);
        });
    });

    /**
     * Open URL.
     *
     * @see http://phantomjs.org/api/webpage/method/open.html
     */
    webPage.open = function (url, settings) {
        return queue(function (resolve) {
            page.open(url, settings, function (status) {
                resolve(status);
            });
        });
    };

    /**
     * Sc
     */
    webPage.inject = function (script) {}

    /**
     * Get page property.
     */
    /*webPage.page = function (propertyName, callback) {
        queue(function (resolve) {
            page.get(propertyName, function (data) {
                resolve(data);
            });
        });

        return webPage;
    }*/

    /**
     * Evaluate fn in a page context.
     * 
     * @see https://github.com/sgentle/phantomjs-node/wiki#evaluating-pages
     * @see http://phantomjs.org/api/webpage/method/evaluate.html
     * @param {Function} fn Function executed in a page context.
     * @param {mixed} data Parameter passed to the fn at the time of execution.
     */
    webPage.evaluate = function (fn, data) {
        return queue(function (resolve) {
            page.evaluate(fn, function (result) {
                resolve();
            }, data);
        });
    };
};

/**
 *
 */
WebPage._bindCallbacks = function (page, ee) {
    var events;

    events = [
        //'alert',
        'callback',
        //'closing',
        //'confirm',
        //'consoleMessage',
        //'error',
        //'filePicker',
        //'initialized',
        //'loadFinished',
        //'loadStarted',
        //'navigationRequested',
        //'pageCreated',
        //'prompt',
        //'resourceError',
        /*'resourceRequested',*/
        //'resourceTimeout',
        //'urlChanged'
    ];

    events.forEach(function (eventName) {
        var eventMethodName;

        eventMethodName = 'on' + eventName.charAt(0).toUpperCase() + eventName.slice(1);
        //page['on' + eventName.charAt(0).toUpperCase() + eventName.slice(1)] = function () {
        //    console.log('Event', eventName);
        //}
        page.set(eventMethodName, function (data) {
            ee.trigger(eventName, data);
            //console.log('Event', eventMethodName);
        });
    });
};

/**
 * Translate options to Phantom CLI options.
 * 
 * @see http://phantomjs.org/api/command-line.html
 * @param {Object} options
 * @param {String} options.cookiesFile Sets the file name to store the persistent cookies.
 * @return {Array} Array of CLI options.
 */
Phantom._phantomCommandLineOptions = function (options) {
    var args = [],
        escapeshellarg = require('escapeshellarg');

    options = options || {};

    if (options.cookiesFile) {
        args.push('--cookies-file=' + escapeshellarg(options.cookiesFile));
    }

    // @todo other options.

    return args;
};

module.exports = Phantom;