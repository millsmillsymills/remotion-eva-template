import { Config } from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
// staticFile() resolves against assets/, not the Remotion default of public/.
Config.setPublicDir('assets');
