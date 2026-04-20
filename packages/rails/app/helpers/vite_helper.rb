require "set"

module ViteHelper
  MANIFEST_PATH = "public/packs/.vite/manifest.json"

  # Look up the hashed JS path for a Vite entry point.
  def vite_asset_path(entry)
    file = manifest.dig(entry, "file")
    raise missing_manifest_error if manifest.nil?
    raise missing_entry_error(entry) if file.nil?

    "/packs/#{file}"
  end

  # Look up the hashed CSS paths for a Vite entry point.
  def vite_css_paths(entry)
    resolve_css_paths(entry).map { |path| "/packs/#{path}" }
  end

  private

  def resolve_css_paths(entry, seen = Set.new)
    return [] if seen.include?(entry)

    seen.add(entry)

    entry_data = manifest&.[](entry) || {}
    css_paths = entry_data.fetch("css", [])

    imported_css_paths = entry_data.fetch("imports", []).flat_map do |import_entry|
      resolve_css_paths(import_entry, seen)
    end

    (css_paths + imported_css_paths).uniq
  end

  def manifest
    @manifest ||= begin
      path = Rails.root.join(MANIFEST_PATH)
      JSON.parse(File.read(path)) if File.exist?(path)
    end
  end

  def missing_manifest_error
    "Vite manifest not found at #{MANIFEST_PATH}. Run `pnpm build` in packages/client."
  end

  def missing_entry_error(entry)
    "Entry '#{entry}' not found in Vite manifest."
  end
end
