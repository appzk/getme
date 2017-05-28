'use strict';

/* eslint-disable no-unused-expressions */
/* eslint-disable no-underscore-dangle */

var chai = require('chai');
var sinonChai = require('sinon-chai');
var sinon = require('sinon');
var nock = require('nock');
var rewire = require('rewire');

var optWeather = rewire('./optWeather');
var expect = chai.expect;
chai.use(sinonChai);

var stubs = require('../../stubs/weather');

var consoleStub = void 0;
var commanderMock = void 0;
var responseAPIMock = void 0;
var responseAddressMock = void 0;
var weatherResponseMock = void 0;
var forecastResponseMock = void 0;

describe('optWeather', function () {
  beforeEach(function () {
    responseAPIMock = JSON.stringify({ ip: '179.215.28.27' }); // Response is valid JSON

    nock('https://api.ipify.org').get('/').query({ format: 'json' }) // GET Query for the API
    .reply(200, responseAPIMock);

    responseAddressMock = JSON.stringify({
      city: 'Niterói',
      country: 'Brazil',
      countryCode: 'BR',
      lat: -22.9021,
      lon: -43.1303
    });

    nock('http://ip-api.com').get('/json/' + JSON.parse(responseAPIMock).ip).reply(200, responseAddressMock);

    consoleStub = sinon.stub(console, 'log');
    commanderMock = {};

    forecastResponseMock = stubs.forecastResponseMock;
    weatherResponseMock = stubs.weatherResponseMock;
  });

  afterEach(function () {
    console.log.restore();
  });

  it('should log weather', function (done) {
    var openWeatherPrefix = 'http://api.openweathermap.org';
    nock(openWeatherPrefix).get('/data/2.5/weather').query({
      lat: -22.9021,
      lon: -43.1303,
      units: 'metric',
      APPID: '59a950ae5e900327f88558d5cce6dfae'
    }).reply(200, weatherResponseMock);

    commanderMock.name = function () {
      return 'weather';
    };
    optWeather(commanderMock);
    setTimeout(function () {
      expect(consoleStub).to.have.been.calledWithMatch(/Niterói, Brazil | Wed Jan 04 2017/);
      expect(consoleStub).to.have.been.calledWithMatch(/30.57 °C/);
      expect(consoleStub).to.have.been.calledWithMatch(/28 °C/);
      expect(consoleStub).to.have.been.calledWithMatch(/33 °C/);
      done();
    }, 300);
  });

  it('should log forecast', function (done) {
    var openWeatherPrefix = 'http://api.openweathermap.org';
    nock(openWeatherPrefix).get('/data/2.5/forecast').query({
      lat: -22.9021,
      lon: -43.1303,
      units: 'metric',
      APPID: '59a950ae5e900327f88558d5cce6dfae'
    }).reply(200, forecastResponseMock);

    commanderMock.name = function () {
      return 'forecast';
    };
    optWeather(commanderMock);
    setTimeout(function () {
      JSON.parse(forecastResponseMock).list.forEach(function (item) {
        var _item$main = item.main,
            temp = _item$main.temp,
            tempMin = _item$main.temp_min,
            tempMax = _item$main.temp_max;

        if (new Date(item.dt).getHours() === 12) {
          expect(consoleStub).to.have.been.calledWithMatch(temp);
          expect(consoleStub).to.have.been.calledWithMatch(tempMin);
          expect(consoleStub).to.have.been.calledWithMatch(tempMax);
        } else {
          expect(consoleStub).not.to.have.been.calledWithMatch(temp);
          expect(consoleStub).not.to.have.been.calledWithMatch(tempMin);
          expect(consoleStub).not.to.have.been.calledWithMatch(tempMax);
        }
      });
      done();
    }, 300);
  });

  it('should use fahrenheit', function (done) {
    var openWeatherPrefix = 'http://api.openweathermap.org';
    commanderMock.name = function () {
      return 'forecast';
    };
    commanderMock.fahrenheit = true;

    nock(openWeatherPrefix).get('/data/2.5/forecast').query({
      lat: -22.9021,
      lon: -43.1303,
      units: 'imperial',
      APPID: '59a950ae5e900327f88558d5cce6dfae'
    }).reply(200, forecastResponseMock);

    optWeather(commanderMock);
    setTimeout(function () {
      expect(consoleStub).to.have.been.calledWithMatch(/27.2 °F/);
      done();
    }, 300);
  });

  it('should use celsius', function (done) {
    var openWeatherPrefix = 'http://api.openweathermap.org';
    commanderMock.name = function () {
      return 'forecast';
    };
    commanderMock.celsius = true;

    nock(openWeatherPrefix).get('/data/2.5/forecast').query({
      lat: -22.9021,
      lon: -43.1303,
      units: 'metric',
      APPID: '59a950ae5e900327f88558d5cce6dfae'
    }).reply(200, forecastResponseMock);

    optWeather(commanderMock);
    setTimeout(function () {
      expect(consoleStub).to.have.been.calledWithMatch(/27.2 °C/);
      done();
    }, 300);
  });

  it('should use kelvin', function (done) {
    var openWeatherPrefix = 'http://api.openweathermap.org';
    commanderMock.name = function () {
      return 'forecast';
    };
    commanderMock.kelvin = true;

    nock(openWeatherPrefix).get('/data/2.5/forecast').query({
      lat: -22.9021,
      lon: -43.1303,
      units: 'undefined',
      APPID: '59a950ae5e900327f88558d5cce6dfae'
    }).reply(200, forecastResponseMock);

    optWeather(commanderMock);
    setTimeout(function () {
      expect(consoleStub).to.have.been.calledWithMatch(/27.2 K/);
      done();
    }, 300);
  });
});