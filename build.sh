#!/bin/sh

lessc -x css/main.less > css/main.min.css
lessc -x css/resources.less > css/resources.min.css

java -jar compiler.jar --js js/vendor/jquery.animate.enhanced.min.js js/vendor/jquery.debounce-1.0.5.js js/vendor/jquery.shorten.js js/vendor/history.js js/main.js --js_output_file js/client.min.js
java -jar compiler.jar --js js/vendor/moment.min.js js/vendor/jquery.kinetic.min.js js/timeline.js js/resources.js --js_output_file js/resources.min.js

rm -rf build
mkdir build

cp -r css build/css/
cp -r js build/js/
cp -r fonts build/fonts/
cp -r img build/img/
cp *.png build/
cp *.html build/

find build/css/ -name *.less -type f -delete
find build/js/ ! -name *.min.js -type f -delete
