class Hash
  def dig(*args)
    args.reduce(self) { |r, arg| r.fetch(arg, nil) unless r.nil? }
  end
end
