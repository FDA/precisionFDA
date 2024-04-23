# getTransformToElement
# Source: http://jointjs.com/blog/get-transform-to-element-polyfill.html
SVGElement::getTransformToElement = SVGElement::getTransformToElement or (toElement) ->
  toElement.getScreenCTM().inverse().multiply @getScreenCTM()
