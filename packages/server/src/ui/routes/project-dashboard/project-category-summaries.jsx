/**
 * @license Copyright 2020 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */

import {h, Fragment} from 'preact';
import {useMemo, useState} from 'preact/hooks';
import _ from '@lhci/utils/src/lodash.js';
import {useBuildStatistics, useRepresentativeRun, useLhr} from '../../hooks/use-api-data';

import './project-category-summaries.css';
import {CategoryCard} from './category-card';
import {AsyncLoader} from '../../components/async-loader';

/** @typedef {import('./category-card.jsx').CategoryMetric} CategoryMetric */
/** @typedef {LHCI.ServerCommand.Statistic & {build: LHCI.ServerCommand.Build}} StatisticWithBuild */

/** @type {Record<string, Array<CategoryMetric>>} */
const CATEGORY_METRICS = {
  performance: [
    {
      id: 'audit_first-contentful-paint_median',
      abbreviation: 'FCP',
      label: 'First Contentful Paint',
      scoreLevels: [2000, 4000],
    },
    {
      id: 'audit_largest-contentful-paint_median',
      abbreviation: 'LCP',
      label: 'Largest Contentful Paint',
      scoreLevels: [2000, 4000],
    },
    {
      id: 'audit_interactive_median',
      abbreviation: 'TTI',
      label: 'Time to Interactive',
      scoreLevels: [3000, 7500],
    },
    {
      id: 'audit_speed-index_median',
      abbreviation: 'SI',
      label: 'Speed Index',
      scoreLevels: [3000, 6000],
    },
  ],
  pageLoadTime: [
    {
      id: 'audit_page-load-time-response-start_median',
      abbreviation: 'Response start',
      label: 'HTML document Response start',
      scoreLevels: [2000, 4000],
    },
    {
      id: 'audit_page-load-time-response-end_median',
      abbreviation: 'Response end',
      label: 'HTML document Response end',
      scoreLevels: [4000, 6000],
    },
    {
      id: 'audit_page-load-time-assets-loaded_median',
      abbreviation: 'Assets loaded',
      label: 'Application JavaScript assets loaded',
      scoreLevels: [6000, 8000],
    },
    {
      id: 'audit_page-load-time-app-rendered_median',
      abbreviation: 'App rendered',
      label: 'React components mounted to DOM',
      scoreLevels: [8000, 10000],
    },
  ],
};

/**
 * @param {LHCI.ServerCommand.Statistic[]|undefined} stats
 * @param {LHCI.ServerCommand.Build[]} builds
 * @return {Array<StatisticWithBuild>|undefined}
 */
const augmentStatsWithBuilds = (stats, builds) => {
  if (!stats) return undefined;

  return stats
    .map(stat => ({
      ...stat,
      build: builds.find(build => build.id === stat.buildId),
    }))
    .filter(/** @return {stat is StatisticWithBuild} */ stat => !!stat.build);
};

/** @param {{builds: Array<LHCI.ServerCommand.Build>, statistics: Array<StatisticWithBuild>|undefined, statisticsLoadingState: import('../../hooks/use-api-data').LoadingState, run: LHCI.ServerCommand.Run|null, buildLimit: number, setBuildLimit: (n: number) => void, url: string}} props */
const ProjectCategorySummaries_ = props => {
  const lhr = useLhr(props.run);
  if (!lhr) {
    return <h1>No matching graph data available.</h1>;
  }

  const {pageLoadTime, ...otherCategories} = lhr.categories;

  return (
    <Fragment>
      {[pageLoadTime, ...Object.values(otherCategories)].map(category => {
        return (
          <CategoryCard
            metrics={CATEGORY_METRICS[category.id]}
            key={category.id}
            lhr={lhr}
            category={category}
            categoryGroups={lhr.categoryGroups}
            loadingState={props.statisticsLoadingState}
            statistics={props.statistics}
            builds={props.builds}
            buildLimit={props.buildLimit}
            setBuildLimit={props.setBuildLimit}
            url={props.url}
          />
        );
      })}
    </Fragment>
  );
};

/** @param {{project: LHCI.ServerCommand.Project, builds: Array<LHCI.ServerCommand.Build>, url: string, branch: string}} props */
export const ProjectCategorySummaries = props => {
  const {project, builds, branch, url} = props;
  const [buildLimit, setBuildLimit] = useState(25);
  const buildIds = useMemo(
    () =>
      builds
        .filter(build => build.lifecycle === 'sealed')
        .filter(build => build.branch === branch)
        .sort((a, b) => new Date(b.runAt).getTime() - new Date(a.runAt).getTime())
        .map(build => build.id)
        .slice(0, buildLimit),
    [builds, branch, buildLimit]
  );
  const [runLoadingState, run] = useRepresentativeRun(project.id, buildIds[0], url);
  const [statLoadingState, stats] = useBuildStatistics(project.id, buildIds);
  const statsWithBuildsUnfiltered = augmentStatsWithBuilds(stats, builds);

  const statsWithBuilds =
    statsWithBuildsUnfiltered &&
    statsWithBuildsUnfiltered
      .filter(stat => stat.build.branch === branch)
      .filter(stat => stat.url === url)
      .sort((a, b) => (a.build.runAt || '').localeCompare(b.build.runAt || ''));

  return (
    <div className="project-category-summaries">
      <AsyncLoader
        loadingState={runLoadingState}
        asyncData={run}
        render={run => (
          <ProjectCategorySummaries_
            run={run}
            url={url}
            builds={builds}
            statistics={statsWithBuilds}
            statisticsLoadingState={statLoadingState}
            buildLimit={buildLimit}
            setBuildLimit={setBuildLimit}
          />
        )}
      />
    </div>
  );
};
