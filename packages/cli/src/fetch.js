/**
 * @license Copyright 2021 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
'use strict';

const fetch = require('isomorphic-fetch');
const {ProxyAgent} = require('proxy-agent');

/** @type import('isomorphic-fetch') */
module.exports = (url, options) => {
  /** @type {Parameters<import('isomorphic-fetch')>[1] & { agent?: import('proxy-agent').ProxyAgent }} */
  const instanceOptions = {
    ...options,
  };

  if (
    !instanceOptions.agent &&
    (process.env.HTTP_PROXY || process.env.HTTPS_PROXY || process.env.NO_PROXY)
  ) {
    instanceOptions.agent = new ProxyAgent();
  }

  return fetch(url, instanceOptions);
};
