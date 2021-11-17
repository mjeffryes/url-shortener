FROM golang:1.16
LABEL maintainer="mjeffryes"

ARG tf_version=1.0.11
ARG nvm_version=0.39.0
ARG node_version=16.13.0
ARG yarn_version=1.22.11

# add terraform
RUN apt-get update && apt-get install -y gnupg software-properties-common curl \
    && curl -fsSL https://apt.releases.hashicorp.com/gpg | apt-key add - \
    && apt-add-repository "deb [arch=amd64] https://apt.releases.hashicorp.com $(lsb_release -cs) main" \
    && apt-get update \
    && apt-get install terraform=${tf_version}

# prefetch test dependencies
WORKDIR $GOPATH/app/test
COPY test/* .
RUN go test -i

# install node and yarn
RUN curl -o- https://raw.githubusercontent.com/creationix/nvm/v${nvm_version}/install.sh | bash
ENV NVM_DIR=/root/.nvm
RUN . "$NVM_DIR/nvm.sh" && nvm install ${node_version}
RUN . "$NVM_DIR/nvm.sh" && nvm use v${node_version}
RUN . "$NVM_DIR/nvm.sh" && nvm alias default v${node_version}
ENV PATH="/root/.nvm/versions/node/v${node_version}/bin/:${PATH}"
RUN node --version
RUN npm --version
RUN npm install -g -s --no-progress yarn@${yarn_version}

WORKDIR $GOPATH/app/
