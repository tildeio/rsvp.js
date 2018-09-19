'use strict';
module.exports = {
  test_page: 'test/index.html',
  frameworks: "mocha",
  launchers: {
    Mocha: {
      "command": `./node_modules/.bin/mocha ${process.env.EMBER_CLI_TEST_OUTPUT}/test/browserify.js -R tap`,
      "protocol": "tap"
    }
  },
  launch_in_ci:  [
    "Chrome",
    "Mocha"
  ],
  launch_in_dev: [
    "Chrome",
    "Mocha"
  ],
  browser_args: {
    Chrome: {
      mode: 'ci',
      args: [
        // --no-sandbox is needed when running Chrome inside a container
        process.env.TRAVIS ? '--no-sandbox' : null,
        '--touch-events',
        '--disable-gpu',
        '--headless',
        '--remote-debugging-port=0',
        '--window-size=1440,900'
      ].filter(Boolean)
    }
  }
};
