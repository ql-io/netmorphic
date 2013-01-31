all: clean install test

clean:
	-rm -fr node_modules

install:
	mkdir logs;\
	npm install;\
	npm link;\
	npm certify;\

.PHONY : test

test: install
	-rm -fr reports
	node_modules/.bin/nodeunit test --reporter junit --output reports

test-part:
	node_modules/.bin/nodeunit test --reporter junit --output reports