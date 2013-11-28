
default: manual-build build

manual-build: web/css/index.css web/index.html web/ace

web/css/index.css: styl/index.styl
	@stylus < styl/index.styl > web/css/index.css

web/index.html: jade/index.jade
	@jade jade/index.jade -o web

web/ace:
	@mkdir -p tmp-ace;\
		cd tmp-ace;\
	    wget https://github.com/ajaxorg/ace-builds/archive/master.zip;\
	    unzip master.zip;\
	    mv ace-builds-master/src-noconflict ../web/ace;\
	    cd ..;\
	    rm -rf tmp-ace

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
	@jshint --verbose *.json client lib *.js test

.PHONY: clean
