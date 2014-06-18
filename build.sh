#!/bin/sh

lessc -x css/main.less > css/main.min.css
lessc -x css/resources.less > css/resources.min.css

java -jar compiler.jar --js js/vendor/jquery.animate.enhanced.min.js js/vendor/jquery.debounce-1.0.5.js js/vendor/jquery.shorten.js js/vendor/history.js js/main.js --js_output_file js/client.min.js
java -jar compiler.jar --js js/vendor/moment.min.js js/vendor/jquery.kinetic.min.js js/timeline.js js/resources.js --js_output_file js/resources.min.js
