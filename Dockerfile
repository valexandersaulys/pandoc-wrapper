FROM pandoc/core AS pandoc_image

FROM node:alpine AS final_image

RUN mkdir /code
WORKDIR /code

# Alpine v3.16 doesn't have Pandoc, but v3.17 does
# RUN apk add --no-cache pandoc
ARG lua_version=5.3
COPY --from=pandoc_image /usr/local/bin/pandoc /usr/local/bin/
# Reinstall any system packages required for runtime
RUN apk --no-cache add \
        gmp \
        libffi \
        lua$lua_version \
        lua$lua_version-lpeg

COPY package.json /code/package.json
RUN npm install
COPY . /code

ENV PANDOC_BINARY_PATH=/usr/local/bin/pandoc
CMD ["npm", "run", "test"]