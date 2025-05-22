UBUNTU_14 = "14.04".freeze
UBUNTU_16 = "16.04".freeze
UBUNTU_20 = "20.04".freeze
UBUNTU_24 = "24.04".freeze

UBUNTU_RELEASES = [
  UBUNTU_14,
  UBUNTU_16,
  UBUNTU_20,
  UBUNTU_24,
].freeze

UBUNTU_CODENAMES = {
  UBUNTU_14 => "trusty",
  UBUNTU_16 => "xenial",
  UBUNTU_20 => "focal",
  UBUNTU_24 => "noble",
}.freeze

PRE_INSTALLED_PYTHON_PACKAGES = {
  UBUNTU_14 => %w(
    requests==2.5.0
    futures==2.2.0
    setuptools==10.2
  ),
  UBUNTU_16 => %w(
    requests==2.5.0
    futures==2.2.0
    setuptools==10.2
  ),
  UBUNTU_20 => %w(
    requests==2.5.0
    futures==2.2.0
    setuptools==10.2
  ),
  UBUNTU_24 => %w(
    --break-system-packages
    requests==2.31.0
    setuptools==68.2.2
  ),
}.freeze

PRE_INSTALLED_OS_PACKAGES = {
  UBUNTU_14 => %w(
    aria2
    byobu
    cmake
    cpanminus
    curl
    dstat
    g++
    git
    htop
    libboost-all-dev
    libcurl4-openssl-dev
    libncurses5-dev
    make
    perl
    pypy
    python-dev
    python-pip
    r-base
    ruby1.9.3
    wget
    xz-utils
  ),

  UBUNTU_16 => %w(
    aria2
    byobu
    cmake
    cpanminus
    curl
    dstat
    g++
    git
    htop
    libboost-all-dev
    libcurl4-openssl-dev
    libncurses5-dev
    make
    perl
    pypy
    python-dev
    python-pip
    r-base
    ruby2.3
    wget
    xz-utils
  ),

  UBUNTU_20 => %w(
    aria2
    byobu
    cmake
    cpanminus
    curl
    dstat
    g++
    git
    htop
    libboost-all-dev
    libcurl4-openssl-dev
    libncurses5-dev
    make
    perl
    pypy
    python3-dev
    python3-pip
    r-base
    ruby2.7
    wget
    xz-utils
  ),

  UBUNTU_24 => %w(
    aria2
    byobu
    cmake
    cpanminus
    curl
    dstat
    g++
    git
    htop
    libboost-all-dev
    libcurl4-openssl-dev
    libncurses5-dev
    make
    perl
    python3-dev
    python3-pip
    r-base
    ruby
    wget
    xz-utils
  ),
}.freeze
