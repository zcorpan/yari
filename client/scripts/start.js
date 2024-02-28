// Ensure environment variables are read.
import "../config/env.js";

import fs from "node:fs";
import chalk from "react-dev-utils/chalk.js";
import webpack from "webpack";
import WebpackDevServer from "webpack-dev-server";
import clearConsole from "react-dev-utils/clearConsole.js";
import checkRequiredFiles from "react-dev-utils/checkRequiredFiles.js";
import { checkBrowsers } from "react-dev-utils/browsersHelper.js";
import {
  choosePort,
  createCompiler,
  prepareProxy,
  prepareUrls,
} from "react-dev-utils/WebpackDevServerUtils.js";
import openBrowser from "react-dev-utils/openBrowser.js";
import semver from "semver";
import react from "react";

import paths from "../config/paths.js";
import configFactory from "../config/webpack.config.js";
import createDevServerConfig from "../config/webpackDevServer.config.js";
import getClientEnvironment from "../config/env.js";

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on("unhandledRejection", (err) => {
  throw err;
});

const appPackageJson = JSON.parse(fs.readFileSync(paths.appPackageJson));

const env = getClientEnvironment(paths.publicUrlOrPath.slice(0, -1));
const useYarn = fs.existsSync(paths.yarnLockFile);
const isInteractive = process.stdout.isTTY;

// Warn and crash if required files are missing
if (!checkRequiredFiles([paths.appHtml, paths.appIndexJs])) {
  process.exit(1);
}

// Tools like Cloud9 rely on this.
const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 3000;
const HOST = process.env.HOST || "0.0.0.0";

if (process.env.HOST) {
  console.log(
    chalk.cyan(
      `Attempting to bind to HOST environment variable: ${chalk.yellow(
        chalk.bold(process.env.HOST)
      )}`
    )
  );
  console.log(
    `If this was unintentional, check that you haven't mistakenly set it in your shell.`
  );
  console.log(
    `Learn more here: ${chalk.yellow("https://cra.link/advanced-config")}`
  );
  console.log();
}

// We require that you explicitly set browsers and do not fall back to
// browserslist defaults.
checkBrowsers(paths.appPath, isInteractive)
  .then(() => {
    // We attempt to use the default port but if it is busy, we offer the user to
    // run on a different port. `choosePort()` Promise resolves to the next free port.
    return choosePort(HOST, DEFAULT_PORT);
  })
  .then((port) => {
    if (port == null) {
      // We have not found a port.
      return;
    }

    const config = configFactory("development");
    const protocol = process.env.HTTPS === "true" ? "https" : "http";
    const appName = appPackageJson.name;

    const useTypeScript = fs.existsSync(paths.appTsConfig);
    const urls = prepareUrls(
      protocol,
      HOST,
      port,
      paths.publicUrlOrPath.slice(0, -1)
    );
    // Create a webpack compiler that is configured with custom messages.
    const compiler = createCompiler({
      appName,
      config,
      urls,
      useYarn,
      useTypeScript,
      webpack,
    });
    // Load proxy config
    const proxySetting = appPackageJson.proxy;
    const proxyConfig = prepareProxy(
      proxySetting,
      paths.appPublic,
      paths.publicUrlOrPath
    );
    // Serve webpack assets generated by the compiler over a web server.
    const serverConfig = {
      ...createDevServerConfig(proxyConfig, urls.lanUrlForConfig),
      host: HOST,
      port,
    };
    const devServer = new WebpackDevServer(serverConfig, compiler);
    // Launch WebpackDevServer.
    devServer.startCallback(() => {
      if (isInteractive) {
        clearConsole();
      }

      if (env.raw.FAST_REFRESH && semver.lt(react.version, "16.10.0")) {
        console.log(
          chalk.yellow(
            `Fast Refresh requires React 16.10 or higher. You are using React ${react.version}.`
          )
        );
      }

      console.log(chalk.cyan("Starting the development server...\n"));
      openBrowser(urls.localUrlForBrowser);
    });

    ["SIGINT", "SIGTERM"].forEach(function (sig) {
      process.on(sig, function () {
        devServer.stopCallback(() => process.exit());
      });
    });

    if (process.env.CI !== "true") {
      // Gracefully exit when stdin ends
      process.stdin.on("end", function () {
        devServer.stopCallback(() => process.exit());
      });
    }
  })
  .catch((err) => {
    if (err && err.message) {
      console.log(err.message);
    }
    process.exit(1);
  });
