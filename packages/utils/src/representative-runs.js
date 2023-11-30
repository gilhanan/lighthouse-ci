/**
 * @license Copyright 2019 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
'use strict';

/** @param {LH.Result} lhr */
const getPageLoadTimeScore = lhr => lhr.categories['pageLoadTime']?.score || 0;

/**
 * @template T
 * @param {Array<Array<[T, LH.Result]>>} runsByUrl
 * @return {Array<T>}
 */
function computeRepresentativeRuns(runsByUrl) {
  /** @type {Array<T>} */
  const representativeRuns = [];

  for (const runs of runsByUrl) {
    if (!runs.length) continue;

    const sortedByPageLoadTime = runs
      .slice()
      .sort((a, b) => getPageLoadTimeScore(a[1]) - getPageLoadTimeScore(b[1]));

    const medianPageLoadTime = sortedByPageLoadTime[Math.floor(runs.length / 2)][0];

    representativeRuns.push(medianPageLoadTime);
  }

  return representativeRuns;
}

module.exports = {computeRepresentativeRuns};
