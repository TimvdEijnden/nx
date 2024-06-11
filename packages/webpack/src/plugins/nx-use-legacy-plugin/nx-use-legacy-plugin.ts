import { ExecutorContext, readCachedProjectGraph } from '@nx/devkit';
import { NxWebpackExecutionContext } from '../../utils/config';
import { NxAppWebpackPluginOptions } from '../nx-webpack-plugin/nx-app-webpack-plugin-options';
import { Configuration } from 'webpack';
import { normalizeOptions } from '../nx-webpack-plugin/lib/normalize-options';

/**
 * TODO(nicholas): Add description
 * @param fn The legacy plugin function usually from `combinedPlugins`
 * @param executorOptions The options passed usually inside the executor or the config file
 * @returns Webpack configuration
 */
export async function nxUseLegacyPlugin(
  fn: (
    config: Configuration,
    ctx: NxWebpackExecutionContext
  ) => Promise<Configuration>,
  executorOptions: NxAppWebpackPluginOptions
) {
  const options = normalizeOptions(executorOptions);

  const projectGraph = readCachedProjectGraph();
  const projectName = process.env.NX_TASK_TARGET_PROJECT;
  const project = projectGraph.nodes[projectName];
  const targetName = process.env.NX_TASK_TARGET_TARGET;

  const context: ExecutorContext = {
    cwd: process.cwd(),
    isVerbose: process.env.NX_VERBOSE_LOGGING === 'true',
    root: project.data.root,
    projectGraph: readCachedProjectGraph(),
    target: project.data.targets[targetName],
    targetName: targetName,
    projectName: projectName,
  };

  const configuration = process.env.NX_TASK_TARGET_CONFIGURATION;
  return async (config: Configuration) => {
    const ctx: NxWebpackExecutionContext = {
      context,
      options: options as NxWebpackExecutionContext['options'],
      configuration,
    };
    return await fn(config, ctx);
  };
}
