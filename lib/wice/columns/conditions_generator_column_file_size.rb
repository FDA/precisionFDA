module Wice
  module Columns
    class ConditionsGeneratorColumnFileSize < ConditionsGeneratorColumn

      MP = {
        "asis" => 1,
        "kilo" => 1024 ** 1,
        "mega" => 1024 ** 2,
        "giga" => 1024 ** 3,
        "tera" => 1024 ** 4,
        "peta" => 1024 ** 5,
        "exa" => 1024 ** 6,
        "zetta" => 1024 ** 7,
        "yotta" => 1024 ** 8
      }

      def generate_conditions(table_name, opts)
        conditions = [[]]

        mp_keys = MP.keys
        suggested_unit = opts[:u].present? ? opts[:u].downcase : mp_keys[0]
        actual_unit = mp_keys.include?(suggested_unit) ? suggested_unit : mp_keys[0]

        if opts[:fr]
          from = BigDecimal(opts[:fr]) rescue 0
          conditions[0] << " #{@column_wrapper.alias_or_table_name(table_name)}.#{@column_wrapper.name} >= ? "
          conditions << Integer(from * MP[actual_unit])
        else
          opts.delete(:fr)
        end

        if opts[:to]
          to = BigDecimal(opts[:to]) rescue 0
          conditions[0] << " #{@column_wrapper.alias_or_table_name(table_name)}.#{@column_wrapper.name} <= ? "
          conditions << Integer(to * MP[actual_unit])
        else
          opts.delete(:to)
        end

        conditions[0] = conditions[0].join(" AND ")
        conditions
      end

    end
  end
end
