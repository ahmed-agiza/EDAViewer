# CFG_PATH := $(abspath $(lastword $(MAKEFILE_LIST)))
# CFG_DIR := $(dir $(CFG_PATH)

PROJECT = edav
SERVER_NAME = $(PROJECT)-server
VERSION = $(shell go run main.go -v)
ARCHIVE = $(PROJECT)-$(VERSION).tar.gz
SERVER_BINARY_DIR = $(shell realpath server/bin)

GOOPENDB = server/goopendb
CPPDIR = $(GOOPENDB)/c++

ERROR_COLOR = \033[31;01m
NO_COLOR = \033[0m
OK_COLOR = \033[32;01m
WARN_COLOR = \033[33;01m

GOROOT ?= /usr/local/go
GOCMD = $(GOROOT)/bin/go
GOBUILD = $(GOCMD) build
GOVET = $(GOCMD) vet
GOCLEAN = $(GOCMD) clean
GOTEST = $(GOCMD) test
GOGET = $(GOCMD) get
GOFMT = $(GOCMD) fmt
GOARCH = amd64
GOOS = linux

SERVER_PORT ?= 8080
CLIENT_PORT ?= 3000

DOCKERCMD = docker
DOCKERBUILD = $(DOCKERCMD) build
DOCKERRUN = $(DOCKERCMD) run
SERVERDOCKERTAG = ahmed-agiza/$(PROJECT)-server
CLIENTDOCKERTAG = ahmed-agiza/$(PROJECT)-client

GITCMD = git
GITCLONE = $(GITCMD) clone
GITFETCH = $(GITCMD) fetch
GITCHECKOUT = $(GITCMD) checkout
GITSUBMODULE = $(GITCMD) submodule

GCCCMD ?= gcc
GPPCMD ?= g++

NODE_PACKAGE_MGR = yarn
NODE_BUILD_COMMAND = $(NODE_PACKAGE_MGR) install
NODE_START_COMMAND = $(NODE_PACKAGE_MGR) run dev

NPROC = $(shell nproc)
COMPILE_PROC = $(shell echo $$(($(NPROC) / 2 > 1? $(NPROC) / 2: 1)))

BUILD_OPENDB ?= true # Set to false to disable OpenDB build/re-build
export OPENDB_PATH ?= $(shell realpath server/OpenDB)
OPENDB_REPO ?= https://github.com/The-OpenROAD-Project/OpenDB.git
OPENDB_REVISION ?= 02e6412842819a7afa0516405794823065e96627

CGO_LDFLAGS = "-lstdc++ -L${OPENDB_PATH}/build/src/db -L${OPENDB_PATH}/build/src/def -L${OPENDB_PATH}/build/src/defin -L${OPENDB_PATH}/build/src/defout -L${OPENDB_PATH}/build/src/lef -L${OPENDB_PATH}/build/src/lefin -L${OPENDB_PATH}/build/src/lefout -L${OPENDB_PATH}/build/src/tm -L${OPENDB_PATH}/build/src/zlib -L${OPENDB_PATH}/build/src/zutil -L${OPENDB_PATH}/src/lef/lib -L${OPENDB_PATH}/src/def/lib"

ifeq (, $(shell which $(GOCMD)))
 $(error "No go in PATH, go is needed to run the server")
endif

ifeq (, $(shell which cmake))
 $(error "No cmake in PATH, cmake is needed to compile OpenDB")
endif
ifeq (, $(shell which $(GITCMD)))
 $(error "No git in PATH, cmake is needed to compile OpenDB")
endif
