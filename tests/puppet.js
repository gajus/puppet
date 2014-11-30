var expect = require('chai').expect,
    Puppet = require('../src/puppet.js'),
    nock = require('nock');

describe('Puppet', function () {
    it('OK', function () {
        expect('ok').to.equal('ok');
    });
    describe('WebPage', function () {
        describe('.open()', function () {
            it('opens a page', function (end) {
                var page;

                nock('http://gajus.com')
                    .get('/')
                    .reply(200, 'OK');

                page = Puppet().create();
                page
                    .open('http://gajus.com/')
                    .then(function (status) {
                        expect(status).to.equal('success');

                        end();
                    });
            });
        });
        describe('.evaluate()', function () {
            it('evaluates function in the context of a web page', function (end) {
                var page;

                nock('http://gajus.com')
                    .get('/')
                    .reply(200, 'OK');

                page = Puppet().create();
                page.open('http://gajus.com/');
                page.evaluate(function (callback) {
                    window.callPhantom('Done');
                });
                page.on('callback', function (data) {
                    expect(data).to.equal('Done');

                    end();
                });
            });
        });
        /*describe('.page()', function () {
            it('returns page property', function () {
                var page;

                nock('http://gajus.com')
                    .get('/')
                    .reply(200, 'OK');

                page = Puppet().create();
                page.open('http://gajus.com/');
            });
        });*/
    });
});