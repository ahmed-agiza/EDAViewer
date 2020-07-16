include config.mk

server: build
	@echo "$(OK_COLOR)==> Running EDAV server...$(NO_COLOR)"
	@PORT=$(SERVER_PORT) $(SERVER_BINARY_DIR)/$(SERVER_NAME)

client: build-client
	@echo "$(OK_COLOR)==> Running EDAV client...$(NO_COLOR)"
	@cd client && PORT=$(CLIENT_PORT) $(NODE_START_COMMAND)

build: deps cpp
	@echo "$(OK_COLOR)==> Vetting...$(NO_COLOR)"
	@cd server/main && CGO_LDFLAGS=$(CGO_LDFLAGS) $(GOVET) && cd -
	@echo "$(OK_COLOR)==> Building...$(NO_COLOR)"
	mkdir -p $(SERVER_BINARY_DIR)
	@cd server/main && CGO_LDFLAGS=$(CGO_LDFLAGS) $(GOBUILD) -o $(SERVER_BINARY_DIR)/$(SERVER_NAME) && cd -

build-client:
	@echo "$(OK_COLOR)==> Installing EDAV client dependencies...$(NO_COLOR)"
	@cd client && $(NODE_BUILD_COMMAND) && cd -

test: build
	@echo "$(OK_COLOR)==> Testing EDAV Server...$(NO_COLOR)"
	@cd server/goopendb &&  CGO_LDFLAGS=$(CGO_LDFLAGS) $(GOTEST) -timeout 45s && cd -

cpp: opendb $(CPPDIR)/libgoopendb.a


$(CPPDIR)/goopendb.o: $(CPPDIR)/goopendb.cpp $(CPPDIR)/goopendb.h
	@echo "$(OK_COLOR)==> Building goopendb.cpp...$(NO_COLOR)"
	$(GPPCMD) $(_CGO_CFLAGS_$(GOARCH)) -fPIC -O2 -I$(OPENDB_PATH)/include -o $@ -c $(CGO_CFLAGS) $<

$(CPPDIR)/libgoopendb.a: $(CPPDIR)/goopendb.o
	@echo "$(OK_COLOR)==> Building goopendb.a...$(NO_COLOR)"
	ar r $@ $^ $(OPENDB_PATH)/build/src/db/libopendb.a

deps:
	@echo "$(OK_COLOR)==> Installing dependencies...$(NO_COLOR)"
	@$(GOGET) -d github.com/go-chi/chi
	@$(GOGET) -d github.com/rs/cors

clean-all: clean clean-opendb

clean:
	rm -rf $(SERVER_BINARY_DIR)/$(SERVER_NAME)
	rm -rf $(CPPDIR)/*.o
	rm -rf $(CPPDIR)/*.so
	rm -rf $(CPPDIR)/*.a
	rm -rf $(PARSERSDIR)/*.a
	
clean-opendb:
	rm -rf $(OPENDB_PATH)

.PHONY: opendb
opendb:
ifeq (true, $(strip $(BUILD_OPENDB)))
	@echo "$(OK_COLOR)==> Building OpenDB...$(NO_COLOR)"
	@if test -d $(OPENDB_PATH); then true; else \
		echo "$(OK_COLOR)==> Cloning OpenDB...$(NO_COLOR)" && \
		$(GITCLONE) --recursive $(OPENDB_REPO) $(OPENDB_PATH);\
	fi
	@cd $(OPENDB_PATH) && $(GITFETCH) && $(GITCHECKOUT) $(OPENDB_REVISION) && \
		$(GITSUBMODULE) update --init --recursive && \
		echo "$(OK_COLOR)==> Compiling OpenDB...$(NO_COLOR)" && \
		mkdir -p build && cd build && cmake .. -DBUILD_PYTHON=OFF -DBUILD_TCL=OFF && \
		make -j $(COMPILE_PROC) && cd - \
		&& cd -
else
	@echo "$(OK_COLOR)==> Skipping OpenDB build step...$(NO_COLOR)"
endif

build-server-docker:
	$(DOCKERBUILD) -f server/Dockerfile -t $(SERVERDOCKERTAG) .

run-server-docker: build-server-docker
	$(DOCKERRUN) --rm -tdp $(SERVER_PORT):$(SERVER_PORT) -ePORT=$(SERVER_PORT) $(SERVERDOCKERTAG)

build-client-docker:
	$(DOCKERBUILD) -f client/Dockerfile -t $(CLIENTDOCKERTAG) .
run-client-docker: build-client-docker
	$(DOCKERRUN) --rm -tdp $(CLIENT_PORT):$(CLIENT_PORT) -ePORT=$(CLIENT_PORT) $(CLIENTDOCKERTAG)

done:
	@echo "$(OK_COLOR)==> Done.$(NO_COLOR)"

format:
	@echo "$(OK_COLOR)==> Formatting...$(NO_COLOR)"
	@$(GOFMT) ./...

release:
	$(GOGET) -u ./...
	CGO_ENABLED=0 GOOS=linux GOARCH=amd64 $(GOBUILD)
	tar -zcvf $(ARCHIVE) cmd/edav/$(SERVER_NAME)
	rm $(ARCHIVE)

.PHONY: all clean deps format release test updatedeps client