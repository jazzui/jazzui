
build: index.html css/index.css index.js components bootstrap js/angular.js
	@component build --dev -n index -o js

components: component.json
	@component install --dev

index.html: jade/index.jade
	@jade jade/index.jade -o .

css/index.css: styl/index.styl
	@stylus < styl/index.styl > css/index.css

serve:
	@python -m SimpleHTTPServer ${PORT}

clean:
	rm -rf css/index.css index.html components index.js

js/angular.js:
	@wget https://ajax.googleapis.com/ajax/libs/angularjs/1.2.1/angular.js
	@mv angular.js js

bootstrap:
	@wget https://github.com/twbs/bootstrap/releases/download/v3.0.2/bootstrap-3.0.2-dist.zip
	@unzip bootstrap-3.0.2-dist.zip
	@mv dist bootstrap

.PHONY: build serve clean

