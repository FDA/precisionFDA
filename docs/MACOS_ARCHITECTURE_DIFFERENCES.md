# Summary of Platform Differences

_Last updated 14.6.2022_

## Docker issues

As stated in [this article](https://docs.docker.com/desktop/mac/apple-silicon/), there are a handful of things that are not fully functional on M1-Silicon CPUs

* `mysql` docker images aren't available for `arm64v8` docker architecture
* Some libraries are dependant on native libraries writted in C, that don't compile for `arm64v8` architectures
  * `therubyracer` for `web`
  * `node-sass` for `frontend`

We solve both of these cases by emulating images, or by building different images

```yml
# Instead of
# image: mysql
image: amd64/mysql
```

## Ruby watch mode

As stated also in [this article](https://docs.docker.com/desktop/mac/apple-silicon/), `inotify` file system notification API doesn't work on emulated images. This API is used internally by `listen` package and `EventedFileSystemWatcher`. Rails (according to [Rails config](https://guides.rubyonrails.org/configuring.html#config-file-watcher)) ships by default with `FileSystemWatcher`, therefore configuration option for `EventedFileSystemWatcher` is disabled for `arm64v8` with `ARM64V8_DEVELOPMENT_PATCH` env variable.

[See here](../config/environments/development.rb)

The env variable `ARM64V8_DEVELOPMENT_PATCH` is defined in arm64v8 docker compose files, such as [this one for arm64v8 dev](../docker/arm64v8.dev.docker-compose.yml).
