FROM golang:1.13.0-stretch AS builder

LABEL maintainer="Ahmed Agiza"

ENV GO111MODULE=on \
    CGO_ENABLED=1


# Install CMake for OpenDB
RUN wget https://cmake.org/files/v3.14/cmake-3.14.0-Linux-x86_64.sh && \
    chmod +x cmake-3.14.0-Linux-x86_64.sh  && \
    ./cmake-3.14.0-Linux-x86_64.sh --skip-license --prefix=/usr/local && rm -rf cmake-3.14.0-Linux-x86_64.sh \
    && rm -rf /var/lib/apt/lists/*


# Install Tcl, automake, pcre, flex, and bison for OpenDB
RUN apt-get update && apt-get install -y tcl-dev automake autotools-dev libpcre3-dev flex bison && rm -rf /var/lib/apt/lists/*

# Install SWIG for OpenDB
RUN  wget https://github.com/swig/swig/archive/rel-4.0.1.tar.gz \
    && tar xfz rel-4.0.1.tar.gz \
    && rm -rf rel-4.0.1.tar.gz \
    && cd swig-rel-4.0.1 \
    && ./autogen.sh && ./configure --prefix=/usr && make -j $(nproc) && make install \
    && cd .. \
    && rm -rf swig-rel-4.0.1

WORKDIR /build

COPY server/go.mod .
COPY server/go.sum .
RUN go mod download

COPY Makefile .
COPY config.mk .
COPY server ./server

RUN make build

WORKDIR /dist
RUN cp /build/server/bin/edav-server ./server

RUN ldd server | tr -s '[:blank:]' '\n' | grep '^/' | \
    xargs -I % sh -c 'mkdir -p $(dirname ./%); cp % ./%;'
RUN mkdir -p lib64 && cp /lib64/ld-linux-x86-64.so.2 lib64/

RUN mkdir /data

FROM scratch

COPY --chown=0:0 --from=builder /dist /

COPY --chown=65534:0 --from=builder /data /data
COPY --chown=65534:0 --from=builder /tmp /tmp

USER 65534
WORKDIR /data

ENTRYPOINT ["/server"]