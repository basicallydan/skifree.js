VERSION ?= edge

CFLAGS = -c -g -D $(VERSION)

help:
	@echo "  deps        install dependencies"
	@echo "  test        runs tests"
	@echo "  compile     sets up your js files for production"
	@echo "  serve       run the webserver"

deps:
	npm install

test:
	npm test

compile:
	browserify js/main.js | uglifyjs -c > js/skifree.min.js
	browserify js/main.js > js/bundle.js
serve:
	ruby -rwebrick -e'WEBrick::HTTPServer.new(:Port => 3000, :DocumentRoot => Dir.pwd).start'
