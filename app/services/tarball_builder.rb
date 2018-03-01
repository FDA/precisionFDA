require 'rubygems/package'
require 'zlib'
require 'fileutils'

module TarballBuilder

  class Tarball

    def initialize(tar)
      @tar = tar
    end

    def add_file(filename, content, mode = 777)
      @tar.add_file filename, mode do |tf|
        tf.write content
      end
    end

  end

  def self.build
    tarfile = StringIO.new("")

    Gem::Package::TarWriter.new(tarfile) do |tar|
      yield(Tarball.new(tar))
    end

    tarfile.rewind
    gzip(tarfile)
  end

  def self.gzip(tarfile)
    gz = StringIO.new("")
    z = Zlib::GzipWriter.new(gz)
    z.write tarfile.string
    z.close

    gz.string
  end

end
