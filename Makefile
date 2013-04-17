all: clean install test

clean:
	-rm -fr node_modules

install:
	mkdir logs;\
	npm install;\
	npm link;\

.PHONY : test

test: install
	-rm -fr reports
	node_modules/.bin/nodeunit test

test-part:
	node_modules/.bin/nodeunit test --reporter junit --output reports
