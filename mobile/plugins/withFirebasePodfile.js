const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const withFirebasePodfile = (config) => {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const podfilePath = path.join(config.modRequest.platformProjectRoot, 'Podfile');
      if (fs.existsSync(podfilePath)) {
        let contents = await fs.promises.readFile(podfilePath, 'utf8');
        if (!contents.includes('$RNFirebaseDisableSPM')) {
          contents = `$RNFirebaseDisableSPM = true\n$RNFirebaseAsStaticFramework = true\n\n${contents}`;
          await fs.promises.writeFile(podfilePath, contents, 'utf8');
        }
      }
      return config;
    },
  ]);
};

module.exports = withFirebasePodfile;
