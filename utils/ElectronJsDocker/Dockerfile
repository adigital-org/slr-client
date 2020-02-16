FROM ubuntu:latest

RUN apt-get update && apt-get install -yq git curl gnupg rsync

RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
RUN curl -sL https://deb.nodesource.com/setup_12.x | bash -
RUN apt-get update && apt-get install -yq nodejs yarn

VOLUME ["/electron-repo"]

ENTRYPOINT ["/bin/bash", "/electron-repo/utils/ElectronJsDocker/electron-linux-build.sh"]