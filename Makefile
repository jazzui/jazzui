
PATH:=${PATH}:./node_modules/.bin

default: manual-build build

manual-build: web/css/index.css web/index.html web/online.html web/ace

heroku: get-globals default make-online

make-online:
	@mv web/online.html web/index.html

get-globals:
	npm install component jade stylus

web/css/index.css: styl/index.styl
	@stylus < styl/index.styl > web/css/index.css

web/online.html: jade/online.jade jade/*.jade
	@jade jade/online.jade -o web

web/index.html: jade/index.jade jade/*.jade
	@jade jade/index.jade -o web

web/ace:
	@mkdir -p tmp-ace;\
		cd tmp-ace;\
	    curl -L -o master.tar.gz https://github.com/ajaxorg/ace-builds/archive/master.tar.gz;\
	    tar zxf master.tar.gz;\
	    cp -r ace-builds-master/src-noconflict ../web/ace;\
	    cd ..;\
	    rm -rf tmp-ace

TPLS := $(patsubst client/tpl/%.txt,client/tpl/%.txt.js,$(wildcard client/tpl/*.txt))

client/tpl/%.txt.js: client/tpl/%.txt
	@component convert $<

build: components client/index.js $(TPLS)
	@component build --dev -n index -o web/js

serve:
	@node server.js

serve-static:
	@cd web; python -m SimpleHTTPServer

components: component.json
	@component install --dev

clean:
	rm -fr build components template.js

lint:
	@jshint --verbose *.json client lib *.js test

gh-pages: default
	@rm -rf w
	@cp -r web w
	@git co gh-pages
	@rm -rf css js ace index.html online.html bootstrap
	@mv w/* ./
	@rm -rf w

node-webkit:
	@rm -rf tmp-nw
	@cp -r web tmp-nw
	@cp node-webkit.json tmp-nw/package.json
	@jade jade/node-webkit.jade -o tmp-nw
	@mv tmp-nw/node-webkit.html tmp-nw/index.html
	@component build -s jazzui -o tmp-nw/js -n index
	@cd tmp-nw && zip -r ../jazzui.nw *
	@rm -rf tmp-nw
	@echo "Node Webkit package ready"

.PHONY: clean lint test serve serve-static heroku make-online node-webkit
