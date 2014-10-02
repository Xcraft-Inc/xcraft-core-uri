'use strict';

var url       = require ('url');

/**
 * Retrieve the real URI behind the URI extensions for zog.
 * There are two extensions:
 * - chest:[//<host>[:<port>]/]<resource>
 *   returns an URI with http[s]:
 * - self://[host]/path
 *   return an URI with file:
 * @param {string} uri - Input URI.
 * @param {string} packageName
 * @param {Object} zogConfig
 * @returns The real URI.
 */
exports.realUri = function (uri, packageName, zogConfig) {
  var path = require ('path');

  var uriObj = url.parse (uri);

  switch (uriObj.protocol)
  {
  case 'chest:': {
    var protocol = 'http:';
    if (parseInt (uriObj.slashes ? uriObj.port : zogConfig.chest.port) === 443) {
      protocol = 'https:';
    }

    var urlHttp = {};
    urlHttp.protocol = protocol;
    urlHttp.slashes  = true;
    urlHttp.hostname = uriObj.slashes ? uriObj.hostname : zogConfig.chest.host;
    urlHttp.port     = uriObj.slashes ? uriObj.port     : zogConfig.chest.port;
    urlHttp.pathname = path.join ('/resources/', uriObj.pathname || uriObj.hostname).replace (/\\/g, '/');
    return url.format (urlHttp);
  }

  case 'self:': {
    var urlFile = {};
    urlFile.protocol = 'file:';
    urlFile.slashes  = true;
    urlFile.hostname = uriObj.hostname;
    urlFile.port     = uriObj.port;
    urlFile.pathname = path.join (zogConfig.pkgProductsRoot, packageName, uriObj.pathname).replace (/\\/g, '/');
    return url.format (urlFile);
  }
  }

  return uri;
};
