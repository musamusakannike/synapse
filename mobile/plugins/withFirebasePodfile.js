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

        // Remove any existing $RNFirebase variables to avoid duplicates
        contents = contents.replace(/^\$RNFirebaseDisableSPM\s*=.*\n?/gm, '');
        contents = contents.replace(/^\$RNFirebaseAsStaticFramework\s*=.*\n?/gm, '');

        // Prepend the Firebase SPM disable flag at the very top of the Podfile
        const firebaseFlags = [
          '# Disable SPM for Firebase to fix static framework linkage conflict',
          '$RNFirebaseDisableSPM = true',
          '$RNFirebaseAsStaticFramework = true',
          '',
        ].join('\n');

        contents = firebaseFlags + '\n' + contents;

        await fs.promises.writeFile(podfilePath, contents, 'utf8');
        console.log('[withFirebasePodfile] Added $RNFirebaseDisableSPM = true to Podfile');
      } else {
        console.warn('[withFirebasePodfile] Podfile not found at:', podfilePath);
      }
      return config;
    },
  ]);
};

module.exports = withFirebasePodfile;
