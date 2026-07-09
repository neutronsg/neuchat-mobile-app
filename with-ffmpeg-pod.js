const { withPlugins, createRunOncePlugin, withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

function addPodDependency(podfilePath) {
  const podInstallLine = `pod 'chatwoot-ffmpeg-kit-ios-https', :podspec => 'https://raw.githubusercontent.com/chatwoot/ffmpeg/master/chatwoot-ffmpeg-kit-ios-https.podspec'`;
  const podInstallLine2 = `pod 'ffmpeg-kit-react-native', :path => '../node_modules/ffmpeg-kit-react-native'`;
  const fmtXcode26Compatibility = `  # Xcode 26 Apple clang rejects React Native's fmt C++20 consteval usage.
  installer.pods_project.targets.each do |target|
    next unless target.name == 'fmt'

    target.build_configurations.each do |config|
      config.build_settings['CLANG_CXX_LANGUAGE_STANDARD'] = 'c++17'

      definitions = config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] || ['$(inherited)']
      definitions = [definitions] unless definitions.is_a?(Array)
      definitions << 'FMT_USE_CONSTEVAL=0' unless definitions.include?('FMT_USE_CONSTEVAL=0')
      config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] = definitions

      cpp_flags = config.build_settings['OTHER_CPLUSPLUSFLAGS'] || ['$(inherited)']
      cpp_flags = [cpp_flags] unless cpp_flags.is_a?(Array)
      cpp_flags << '-DFMT_USE_CONSTEVAL=0' unless cpp_flags.include?('-DFMT_USE_CONSTEVAL=0')
      config.build_settings['OTHER_CPLUSPLUSFLAGS'] = cpp_flags
    end
  end

  fmt_base_header = File.join(installer.sandbox.root.to_s, 'fmt', 'include', 'fmt', 'base.h')
  if File.exist?(fmt_base_header)
    contents = File.read(fmt_base_header)
    old_text = "#if !defined(__cpp_lib_is_constant_evaluated)\\n"
    new_text = "#ifdef FMT_USE_CONSTEVAL\\n// Use the provided definition.\\n#elif !defined(__cpp_lib_is_constant_evaluated)\\n"
    File.write(fmt_base_header, contents.sub(old_text, new_text)) if contents.include?(old_text)
  end`;

  let contents = fs.readFileSync(podfilePath, 'utf8');
  if (!contents.includes(podInstallLine)) {
    contents = contents.replace(
      /post_install do \|installer\|/,
      `${podInstallLine}\n\n  post_install do |installer|`,
    );
  }
  if (!contents.includes(podInstallLine2)) {
    contents = contents.replace(
      /post_install do \|installer\|/,
      `${podInstallLine2}\n\n  post_install do |installer|`,
    );
  }
  if (!contents.includes('Xcode 26 Apple clang rejects React Native')) {
    contents = contents.replace(
      /post_install do \|installer\|/,
      `post_install do |installer|\n${fmtXcode26Compatibility}\n`,
    );
  }
  fs.writeFileSync(podfilePath, contents, 'utf8');
}

function withMyFFmpegPod(config) {
  return withDangerousMod(config, [
    'ios',
    cfg => {
      const podfilePath = path.join(cfg.modRequest.platformProjectRoot, 'Podfile');
      addPodDependency(podfilePath);
      return cfg;
    },
  ]);
}

const withFFmpegPod = config => {
  return withPlugins(config, [withMyFFmpegPod]);
};

module.exports = createRunOncePlugin(withFFmpegPod, 'with-ffmpeg-pod', '1.0.0');
