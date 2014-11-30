var expect = require('chai').expect,
    Puppet = require('../src/puppet.js'),
    nock = require('nock');

describe('Puppet', function () {
    it('OK', function () {
        expect('ok').to.equal('ok');
    });
    describe('WebPage.open()', function () {
        it('opens a page', function (end) {
            var page;

            nock('http://gajus.com')
                .get('/')
                .reply(200, 'OK');

            page = Puppet()
                .create();

            page
                .open('http://gajus.com/')
                .then(function () {
                    end();
                });
        });
    });
});