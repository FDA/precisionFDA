require 'rubygems/package'
require 'zlib'
require 'fileutils'

module TarballBuilder

  def self.build
    tarfile = StringIO.new("")

    Gem::Package::TarWriter.new(tarfile) do |tar|
      yield(tar)
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
