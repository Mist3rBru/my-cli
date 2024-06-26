SHELL=/bin/bash

packages = ./core ./prompts

test:
	@until [ $$RET -eq 0 ]; do \
		go test $(packages) -cover ; \
		RET=$$? ; \
	done
profile:
	@until [ $$RET -eq 0 ]; do \
		go test $(packages) -cover -coverprofile cover.out ; \
		RET=$$? ; \
	done
	go tool cover -html cover.out -o cover.html
	rm cover.out
snap:
	@UPDATE_SNAPSHOTS=true go test ./prompts
format:
	gofmt -w .
ci: test format
clog:
	git-chglog -o CHANGELOG.md