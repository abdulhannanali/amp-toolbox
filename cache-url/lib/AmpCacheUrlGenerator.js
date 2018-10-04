/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const Url = require('url');
const createCurlsSubdomain = require('./AmpCurlUrlGenerator');

/**
 * Translates the canonicalUrl to the AMP Cache equivalent, for a given AMP Cache.
 * Example:
 * createCacheUrl('cdn.ampproject.org', 'https://hello-world.com')
 * Should resolve: 'https://hello--world-com.cdn.ampproject.org/c/s/hello-world.com'
 *
 * @param {string} domainSuffix the AMP Cache domain suffix
 * @param {string} url the canonical URL
 * @return {!Promise<string>} The converted AMP cache URL
 */
function createCacheUrl(domainSuffix, url) {
  const canonicalUrl = Url.parse(url);
  let pathSegment = _getResourcePath(canonicalUrl.pathname);
  pathSegment += canonicalUrl.protocol === 'https:' ? '/s/' : '/';

  return createCurlsSubdomain(Url.format(canonicalUrl)).then((curlsSubdomain) => {
    const cacheUrl = Url.parse(url);
    cacheUrl.protocol = 'https';
    const hostname = curlsSubdomain + '.' + domainSuffix;
    cacheUrl.host = hostname;
    cacheUrl.hostname = hostname;
    cacheUrl.pathname = pathSegment + canonicalUrl.hostname + canonicalUrl.pathname;
    return Url.format(cacheUrl);
  });
}

/**
 * Returns the AMP Cache path, based on the mime type of the file that is being loaded.
 * @param {string} pathname the pathname on the canonical url.
 */
function _getResourcePath(pathname) {
  const imageExtensions = require('./ImageExtensions');
  const fontExtensions = require('./FontExtensions');

  if (imageExtensions.isPathNameAnImage(pathname)) {
    return '/i';
  }

  if (fontExtensions.isPathNameAFont(pathname)) {
    return '/r';
  }

  // Default to document
  return '/c';
}

/** @module AmpUrl */
module.exports = createCacheUrl;
