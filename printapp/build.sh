#!/bin/bash
# Builds Lana Print (no Gradle): run by GitHub Actions, uses the Android SDK already on the runner.
set -euo pipefail
cd "$(dirname "$0")"
SDK="${ANDROID_HOME:-${ANDROID_SDK_ROOT:-/usr/local/lib/android/sdk}}"
BT="$(ls -d "$SDK"/build-tools/* | sort -V | tail -1)"
JAR="$(ls -d "$SDK"/platforms/android-* | sort -V | tail -1)/android.jar"
VER="${GITHUB_RUN_NUMBER:-1}"
echo "build-tools: $BT  platform: $JAR  version: $VER"
rm -rf build && mkdir -p build/classes build/dex build/gen
"$BT/aapt2" compile --dir res -o build/res.zip
"$BT/aapt2" link -o build/base.apk -I "$JAR" --manifest AndroidManifest.xml build/res.zip --java build/gen \
  --min-sdk-version 16 --target-sdk-version 30 --version-code "$VER" --version-name "1.$VER"
javac -source 8 -target 8 -nowarn -encoding UTF-8 -classpath "$JAR" -d build/classes $(find src build/gen -name '*.java')
"$BT/d8" --min-api 16 --release --lib "$JAR" --output build/dex $(find build/classes -name '*.class')
cp build/base.apk build/unsigned.apk
(cd build/dex && zip -q ../unsigned.apk classes.dex)
"$BT/zipalign" -f 4 build/unsigned.apk build/aligned.apk
"$BT/apksigner" sign --ks lana-print.jks --ks-pass pass:lanaprint --key-pass pass:lanaprint --ks-key-alias lana --out build/lana-print.apk build/aligned.apk
"$BT/apksigner" verify build/lana-print.apk
ls -la build/lana-print.apk
