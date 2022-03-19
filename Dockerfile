FROM node:14

WORKDIR /usr/src/app
RUN git clone https://github.com/harmony-one/chrome-extension-wallet.git
WORKDIR /usr/src/app/chrome-extension-wallet
RUN npm install
RUN npm run build
