'use strict';

var url          = require ('url');
var xcraftConfig = require ('xcraft-core-etc') ().load ('xcraft');
var chestConfig  = require ('xcraft-core-etc') ().load ('xcraft-contrib-chest');

/**
 * Retrieve the real URI behind the URI extensions for zog.
 * There are two extensions:
 * - chest:[//<host>[:<port>]/]<resource>
 *   it returns an URI with http or https.
 *
 * - self:///path
 *   self contained (inner package) path
 * - home:///path
 *   relative to the xcraft home folder path,
 *   it returns an URI with file.
 *
 * @param {string} uri - Input URI.
 * @param {string} packageName
 * @returns {string} The real URI.
 */
exports.realUri = function (uri, packageName) {
  var path = require ('path');

  var urlFile = {};
  var uriObj = url.parse (uri);

  switch (uriObj.protocol) {
  case 'chest:': {
    var protocol = 'http:';
    if (parseInt (uriObj.slashes ? uriObj.port : chestConfig.port) === 443) {
      protocol = 'https:';
    }

    var urlHttp = {};
    urlHttp.protocol = protocol;
    urlHttp.slashes  = true;
    urlHttp.hostname = uriObj.slashes ? uriObj.hostname : chestConfig.host;
    urlHttp.port     = uriObj.slashes ? uriObj.port     : chestConfig.port;
    urlHttp.pathname = path.join ('/resources/', uriObj.pathname || uriObj.hostname).replace (/\\/g, '/');
    return url.format (urlHttp);
  }

  case 'self:': {
    urlFile.protocol = 'file:';
    urlFile.slashes  = true;
    urlFile.hostname = uriObj.hostname;
    urlFile.port     = uriObj.port;
    urlFile.pathname = path.join (xcraftConfig.pkgProductsRoot, packageName, uriObj.pathname).replace (/\\/g, '/');
    return url.format (urlFile);
  }

  case 'home:': {
    urlFile.protocol = 'file:';
    urlFile.slashes  = true;
    urlFile.hostname = uriObj.hostname;
    urlFile.port     = uriObj.port;
    urlFile.pathname = path.join (xcraftConfig.xcraftRoot, '/home/', uriObj.pathname).replace (/\\/g, '/');
    return url.format (urlFile);
  }
  }

  return uri;
};
