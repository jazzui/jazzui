
default: manual-build build

manual-build: web/css/index.css web/index.html

web/css/index.css: styl/index.styl
	@stylus < styl/index.styl > web/css/index.css

web/index.html: jade/index.jade
	@jade jade/index.jade -o web

TPLS := $(patsubst client/tpl/%.txt,client/tpl/%.txt.js,$(wildcard client/tpl/*.txt))

client/tpl/%.txt.js: client/tpl/%.txt
	@component convert $<

build: components client/index.js $(TPLS)
	@component build --dev -n index -o web/js

serve:
	@cd web; python -m SimpleHTTPServer

components: component.json
	@component install --dev

clean:
	rm -fr build components template.js

lint:
	@jshint --verbose *.json client

.PHONY: clean
