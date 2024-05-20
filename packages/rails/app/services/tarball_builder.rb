require "rubygems/package"
require "zlib"
require "fileutils"

module TarballBuilder
  class Tarball
    def initialize(tar)
      @tar = tar
    end

    def add_file(filename, content, mode = 777)
      @tar.add_file(filename, mode) do |tf|
        tf.write(content)
      end
    end

    def add_file_simple(filepath, content, length, mode = 777)
      @tar.add_file_simple(filepath, mode, length) do |tf|
        tf.write(content)
      end
    end
  end

  class << self
    def build
      tarfile = StringIO.new

      Gem::Package::TarWriter.new(tarfile) do |tar|
        yield(Tarball.new(tar))
      end

      tarfile.rewind
      gzip(tarfile)
    end

    def gzip(tarfile)
      io = StringIO.new

      z = Zlib::GzipWriter.new(io)
      z.write(tarfile.string)
      z.close

      io.string
    end
  end
end
