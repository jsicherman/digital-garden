module OrdinalSuffixFilter
  def ordinal_suffix(input)
    number = input.to_i
    suffix = case number % 100
    when 11, 12, 13 then 'th'
    else
      case number % 10
      when 1 then 'st'
      when 2 then 'nd'
      when 3 then 'rd'
        else 'th'
      end
    end
  "#{input}#{suffix}"
  end
end

Liquid::Template.register_filter(OrdinalSuffixFilter)