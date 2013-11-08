
default: manual-build build

manual-build: web/css/index.css web/index.html

web/css/index.css: styl/index.styl
	@stylus < styl/index.styl > web/css/index.css

web/index.html: jade/index.jade
	@jade jade/index.jade -o web

build: components client/index.js client/tpl/xon.txt.js client/tpl/jade.txt.js client/tpl/stylus.txt.js
	@component build --dev

client/tpl/xon.txt.js: client/tpl/xon.txt
	@component convert $<

client/tpl/jade.txt.js: client/tpl/jade.txt
	@component convert $<

client/tpl/stylus.txt.js: client/tpl/stylus.txt
	@component convert $<

serve:
	@cd web; python -m SimpleHTTPServer

components: component.json
	@component install --dev

clean:
	rm -fr build components template.js

lint:
	@jshint --verbose *.js *.json client

.PHONY: clean
