'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RootFinder = exports.wrap = exports.createRenderWrapper = exports.createMountWrapper = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.mapNativeEventNames = mapNativeEventNames;
exports.propFromEvent = propFromEvent;
exports.withSetStateAllowed = withSetStateAllowed;
exports.assertDomAvailable = assertDomAvailable;
exports.displayNameOfNode = displayNameOfNode;
exports.nodeTypeFromType = nodeTypeFromType;
exports.isArrayLike = isArrayLike;
exports.flatten = flatten;
exports.ensureKeyOrUndefined = ensureKeyOrUndefined;
exports.elementToTree = elementToTree;
exports.findElement = findElement;
exports.propsWithKeysAndRef = propsWithKeysAndRef;
exports.getComponentStack = getComponentStack;
exports.simulateError = simulateError;
exports.getMaskedContext = getMaskedContext;
exports.getNodeFromRootFinder = getNodeFromRootFinder;
exports.wrapWithWrappingComponent = wrapWithWrappingComponent;
exports.getWrappingComponentMountRenderer = getWrappingComponentMountRenderer;
exports.fakeDynamicImport = fakeDynamicImport;
exports.compareNodeTypeOf = compareNodeTypeOf;

var _object = require('object.assign');

var _object2 = _interopRequireDefault(_object);

var _functionPrototype = require('function.prototype.name');

var _functionPrototype2 = _interopRequireDefault(_functionPrototype);

var _object3 = require('object.fromentries');

var _object4 = _interopRequireDefault(_object3);

var _createMountWrapper = require('./createMountWrapper');

var _createMountWrapper2 = _interopRequireDefault(_createMountWrapper);

var _createRenderWrapper = require('./createRenderWrapper');

var _createRenderWrapper2 = _interopRequireDefault(_createRenderWrapper);

var _wrapWithSimpleWrapper = require('./wrapWithSimpleWrapper');

var _wrapWithSimpleWrapper2 = _interopRequireDefault(_wrapWithSimpleWrapper);

var _RootFinder = require('./RootFinder');

var _RootFinder2 = _interopRequireDefault(_RootFinder);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

exports.createMountWrapper = _createMountWrapper2['default'];
exports.createRenderWrapper = _createRenderWrapper2['default'];
exports.wrap = _wrapWithSimpleWrapper2['default'];
exports.RootFinder = _RootFinder2['default'];
function mapNativeEventNames(event) {
  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      _ref$animation = _ref.animation,
      animation = _ref$animation === undefined ? false : _ref$animation,
      _ref$pointerEvents = _ref.pointerEvents,
      pointerEvents = _ref$pointerEvents === undefined ? false : _ref$pointerEvents,
      _ref$auxClick = _ref.auxClick,
      auxClick = _ref$auxClick === undefined ? false : _ref$auxClick;

  var nativeToReactEventMap = (0, _object2['default'])({
    compositionend: 'compositionEnd',
    compositionstart: 'compositionStart',
    compositionupdate: 'compositionUpdate',
    keydown: 'keyDown',
    keyup: 'keyUp',
    keypress: 'keyPress',
    contextmenu: 'contextMenu',
    dblclick: 'doubleClick',
    doubleclick: 'doubleClick', // kept for legacy. TODO: remove with next major.
    dragend: 'dragEnd',
    dragenter: 'dragEnter',
    dragexist: 'dragExit',
    dragleave: 'dragLeave',
    dragover: 'dragOver',
    dragstart: 'dragStart',
    mousedown: 'mouseDown',
    mousemove: 'mouseMove',
    mouseout: 'mouseOut',
    mouseover: 'mouseOver',
    mouseup: 'mouseUp',
    touchcancel: 'touchCancel',
    touchend: 'touchEnd',
    touchmove: 'touchMove',
    touchstart: 'touchStart',
    canplay: 'canPlay',
    canplaythrough: 'canPlayThrough',
    durationchange: 'durationChange',
    loadeddata: 'loadedData',
    loadedmetadata: 'loadedMetadata',
    loadstart: 'loadStart',
    ratechange: 'rateChange',
    timeupdate: 'timeUpdate',
    volumechange: 'volumeChange',
    beforeinput: 'beforeInput',
    mouseenter: 'mouseEnter',
    mouseleave: 'mouseLeave',
    transitionend: 'transitionEnd'
  }, animation && {
    animationstart: 'animationStart',
    animationiteration: 'animationIteration',
    animationend: 'animationEnd'
  }, pointerEvents && {
    pointerdown: 'pointerDown',
    pointermove: 'pointerMove',
    pointerup: 'pointerUp',
    pointercancel: 'pointerCancel',
    gotpointercapture: 'gotPointerCapture',
    lostpointercapture: 'lostPointerCapture',
    pointerenter: 'pointerEnter',
    pointerleave: 'pointerLeave',
    pointerover: 'pointerOver',
    pointerout: 'pointerOut'
  }, auxClick && {
    auxclick: 'auxClick'
  });

  return nativeToReactEventMap[event] || event;
}

// 'click' => 'onClick'
// 'mouseEnter' => 'onMouseEnter'
function propFromEvent(event) {
  var eventOptions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var nativeEvent = mapNativeEventNames(event, eventOptions);
  return 'on' + String(nativeEvent[0].toUpperCase()) + String(nativeEvent.slice(1));
}

function withSetStateAllowed(fn) {
  // NOTE(lmr):
  // this is currently here to circumvent a React bug where `setState()` is
  // not allowed without global being defined.
  var cleanup = false;
  if (typeof global.document === 'undefined') {
    cleanup = true;
    global.document = {};
  }
  var result = fn();
  if (cleanup) {
    // This works around a bug in node/jest in that developers aren't able to
    // delete things from global when running in a node vm.
    global.document = undefined;
    delete global.document;
  }
  return result;
}

function assertDomAvailable(feature) {
  if (!global || !global.document || !global.document.createElement) {
    throw new Error('Enzyme\'s ' + String(feature) + ' expects a DOM environment to be loaded, but found none');
  }
}

function displayNameOfNode(node) {
  if (!node) return null;

  var type = node.type;


  if (!type) return null;

  return type.displayName || (typeof type === 'function' ? (0, _functionPrototype2['default'])(type) : type.name || type);
}

function nodeTypeFromType(type) {
  if (typeof type === 'string') {
    return 'host';
  }
  if (type && type.prototype && type.prototype.isReactComponent) {
    return 'class';
  }
  return 'function';
}

function getIteratorFn(obj) {
  var iteratorFn = obj && (typeof Symbol === 'function' && _typeof(Symbol.iterator) === 'symbol' && obj[Symbol.iterator] || obj['@@iterator']);

  if (typeof iteratorFn === 'function') {
    return iteratorFn;
  }

  return undefined;
}

function isIterable(obj) {
  return !!getIteratorFn(obj);
}

function isArrayLike(obj) {
  return Array.isArray(obj) || typeof obj !== 'string' && isIterable(obj);
}

function flatten(arrs) {
  // optimize for the most common case
  if (Array.isArray(arrs)) {
    return arrs.reduce(function (flatArrs, item) {
      return flatArrs.concat(isArrayLike(item) ? flatten(item) : item);
    }, []);
  }

  // fallback for arbitrary iterable children
  var flatArrs = [];

  var iteratorFn = getIteratorFn(arrs);
  var iterator = iteratorFn.call(arrs);

  var step = iterator.next();

  while (!step.done) {
    var item = step.value;
    var flatItem = void 0;

    if (isArrayLike(item)) {
      flatItem = flatten(item);
    } else {
      flatItem = item;
    }

    flatArrs = flatArrs.concat(flatItem);

    step = iterator.next();
  }

  return flatArrs;
}

function ensureKeyOrUndefined(key) {
  return key || (key === '' ? '' : undefined);
}

function elementToTree(el) {
  var recurse = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : elementToTree;

  if (typeof recurse !== 'function' && arguments.length === 3) {
    // special case for backwards compat for `.map(elementToTree)`
    recurse = elementToTree; // eslint-disable-line no-param-reassign
  }
  if (el === null || (typeof el === 'undefined' ? 'undefined' : _typeof(el)) !== 'object' || !('type' in el)) {
    return el;
  }
  var type = el.type,
      props = el.props,
      key = el.key,
      ref = el.ref;
  var children = props.children;

  var rendered = null;
  if (isArrayLike(children)) {
    rendered = flatten(children).map(function (x) {
      return recurse(x);
    });
  } else if (typeof children !== 'undefined') {
    rendered = recurse(children);
  }

  var nodeType = nodeTypeFromType(type);

  if (nodeType === 'host' && props.dangerouslySetInnerHTML) {
    if (props.children != null) {
      var error = new Error('Can only set one of `children` or `props.dangerouslySetInnerHTML`.');
      error.name = 'Invariant Violation';
      throw error;
    }
  }

  return {
    nodeType: nodeType,
    type: type,
    props: props,
    key: ensureKeyOrUndefined(key),
    ref: ref,
    instance: null,
    rendered: rendered
  };
}

function mapFind(arraylike, mapper, finder) {
  var found = void 0;
  var isFound = Array.prototype.find.call(arraylike, function (item) {
    found = mapper(item);
    return finder(found);
  });
  return isFound ? found : undefined;
}

function findElement(el, predicate) {
  if (el === null || (typeof el === 'undefined' ? 'undefined' : _typeof(el)) !== 'object' || !('type' in el)) {
    return undefined;
  }
  if (predicate(el)) {
    return el;
  }
  var rendered = el.rendered;

  if (isArrayLike(rendered)) {
    return mapFind(rendered, function (x) {
      return findElement(x, predicate);
    }, function (x) {
      return typeof x !== 'undefined';
    });
  }
  return findElement(rendered, predicate);
}

function propsWithKeysAndRef(node) {
  if (node.ref !== null || node.key !== null) {
    return (0, _object2['default'])({}, node.props, {
      key: node.key,
      ref: node.ref
    });
  }
  return node.props;
}

function getComponentStack(hierarchy) {
  var getNodeType = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : nodeTypeFromType;
  var getDisplayName = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : displayNameOfNode;

  var tuples = hierarchy.filter(function (node) {
    return node.type !== _RootFinder2['default'];
  }).map(function (x) {
    return [getNodeType(x.type), getDisplayName(x)];
  }).concat([['class', 'WrapperComponent']]);

  return tuples.map(function (_ref2, i, arr) {
    var _ref3 = _slicedToArray(_ref2, 2),
        name = _ref3[1];

    var _ref4 = arr.slice(i + 1).find(function (_ref6) {
      var _ref7 = _slicedToArray(_ref6, 1),
          nodeType = _ref7[0];

      return nodeType !== 'host';
    }) || [],
        _ref5 = _slicedToArray(_ref4, 2),
        closestComponent = _ref5[1];

    return '\n    in ' + String(name) + (closestComponent ? ' (created by ' + String(closestComponent) + ')' : '');
  }).join('');
}

function simulateError(error, catchingInstance, rootNode, // TODO: remove `rootNode` next semver-major
hierarchy) {
  var getNodeType = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : nodeTypeFromType;
  var getDisplayName = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : displayNameOfNode;
  var catchingType = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : {};

  var instance = catchingInstance || {};

  var componentDidCatch = instance.componentDidCatch;
  var getDerivedStateFromError = catchingType.getDerivedStateFromError;


  if (!componentDidCatch && !getDerivedStateFromError) {
    throw error;
  }

  if (getDerivedStateFromError) {
    var stateUpdate = getDerivedStateFromError.call(catchingType, error);
    instance.setState(stateUpdate);
  }

  if (componentDidCatch) {
    var componentStack = getComponentStack(hierarchy, getNodeType, getDisplayName);
    componentDidCatch.call(instance, error, { componentStack: componentStack });
  }
}

function getMaskedContext(contextTypes, unmaskedContext) {
  if (!contextTypes || !unmaskedContext) {
    return {};
  }
  return (0, _object4['default'])(Object.keys(contextTypes).map(function (key) {
    return [key, unmaskedContext[key]];
  }));
}

function getNodeFromRootFinder(isCustomComponent, tree, options) {
  if (!isCustomComponent(options.wrappingComponent)) {
    return tree.rendered;
  }
  var rootFinder = findElement(tree, function (node) {
    return node.type === _RootFinder2['default'];
  });
  if (!rootFinder) {
    throw new Error('`wrappingComponent` must render its children!');
  }
  return rootFinder.rendered;
}

function wrapWithWrappingComponent(createElement, node, options) {
  var wrappingComponent = options.wrappingComponent,
      wrappingComponentProps = options.wrappingComponentProps;

  if (!wrappingComponent) {
    return node;
  }
  return createElement(wrappingComponent, wrappingComponentProps, createElement(_RootFinder2['default'], null, node));
}

function getWrappingComponentMountRenderer(_ref8) {
  var toTree = _ref8.toTree,
      getMountWrapperInstance = _ref8.getMountWrapperInstance;

  return {
    getNode: function () {
      function getNode() {
        var instance = getMountWrapperInstance();
        return instance ? toTree(instance).rendered : null;
      }

      return getNode;
    }(),
    render: function () {
      function render(el, context, callback) {
        var instance = getMountWrapperInstance();
        if (!instance) {
          throw new Error('The wrapping component may not be updated if the root is unmounted.');
        }
        return instance.setWrappingComponentProps(el.props, callback);
      }

      return render;
    }()
  };
}

function fakeDynamicImport(moduleToImport) {
  return Promise.resolve({ 'default': moduleToImport });
}

function compareNodeTypeOf(node, matchingTypeOf) {
  if (!node) {
    return false;
  }
  return node.$$typeof === matchingTypeOf;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9VdGlscy5qcyJdLCJuYW1lcyI6WyJtYXBOYXRpdmVFdmVudE5hbWVzIiwicHJvcEZyb21FdmVudCIsIndpdGhTZXRTdGF0ZUFsbG93ZWQiLCJhc3NlcnREb21BdmFpbGFibGUiLCJkaXNwbGF5TmFtZU9mTm9kZSIsIm5vZGVUeXBlRnJvbVR5cGUiLCJpc0FycmF5TGlrZSIsImZsYXR0ZW4iLCJlbnN1cmVLZXlPclVuZGVmaW5lZCIsImVsZW1lbnRUb1RyZWUiLCJmaW5kRWxlbWVudCIsInByb3BzV2l0aEtleXNBbmRSZWYiLCJnZXRDb21wb25lbnRTdGFjayIsInNpbXVsYXRlRXJyb3IiLCJnZXRNYXNrZWRDb250ZXh0IiwiZ2V0Tm9kZUZyb21Sb290RmluZGVyIiwid3JhcFdpdGhXcmFwcGluZ0NvbXBvbmVudCIsImdldFdyYXBwaW5nQ29tcG9uZW50TW91bnRSZW5kZXJlciIsImZha2VEeW5hbWljSW1wb3J0IiwiY29tcGFyZU5vZGVUeXBlT2YiLCJjcmVhdGVNb3VudFdyYXBwZXIiLCJjcmVhdGVSZW5kZXJXcmFwcGVyIiwid3JhcCIsIlJvb3RGaW5kZXIiLCJldmVudCIsImFuaW1hdGlvbiIsInBvaW50ZXJFdmVudHMiLCJhdXhDbGljayIsIm5hdGl2ZVRvUmVhY3RFdmVudE1hcCIsImNvbXBvc2l0aW9uZW5kIiwiY29tcG9zaXRpb25zdGFydCIsImNvbXBvc2l0aW9udXBkYXRlIiwia2V5ZG93biIsImtleXVwIiwia2V5cHJlc3MiLCJjb250ZXh0bWVudSIsImRibGNsaWNrIiwiZG91YmxlY2xpY2siLCJkcmFnZW5kIiwiZHJhZ2VudGVyIiwiZHJhZ2V4aXN0IiwiZHJhZ2xlYXZlIiwiZHJhZ292ZXIiLCJkcmFnc3RhcnQiLCJtb3VzZWRvd24iLCJtb3VzZW1vdmUiLCJtb3VzZW91dCIsIm1vdXNlb3ZlciIsIm1vdXNldXAiLCJ0b3VjaGNhbmNlbCIsInRvdWNoZW5kIiwidG91Y2htb3ZlIiwidG91Y2hzdGFydCIsImNhbnBsYXkiLCJjYW5wbGF5dGhyb3VnaCIsImR1cmF0aW9uY2hhbmdlIiwibG9hZGVkZGF0YSIsImxvYWRlZG1ldGFkYXRhIiwibG9hZHN0YXJ0IiwicmF0ZWNoYW5nZSIsInRpbWV1cGRhdGUiLCJ2b2x1bWVjaGFuZ2UiLCJiZWZvcmVpbnB1dCIsIm1vdXNlZW50ZXIiLCJtb3VzZWxlYXZlIiwidHJhbnNpdGlvbmVuZCIsImFuaW1hdGlvbnN0YXJ0IiwiYW5pbWF0aW9uaXRlcmF0aW9uIiwiYW5pbWF0aW9uZW5kIiwicG9pbnRlcmRvd24iLCJwb2ludGVybW92ZSIsInBvaW50ZXJ1cCIsInBvaW50ZXJjYW5jZWwiLCJnb3Rwb2ludGVyY2FwdHVyZSIsImxvc3Rwb2ludGVyY2FwdHVyZSIsInBvaW50ZXJlbnRlciIsInBvaW50ZXJsZWF2ZSIsInBvaW50ZXJvdmVyIiwicG9pbnRlcm91dCIsImF1eGNsaWNrIiwiZXZlbnRPcHRpb25zIiwibmF0aXZlRXZlbnQiLCJ0b1VwcGVyQ2FzZSIsInNsaWNlIiwiZm4iLCJjbGVhbnVwIiwiZ2xvYmFsIiwiZG9jdW1lbnQiLCJyZXN1bHQiLCJ1bmRlZmluZWQiLCJmZWF0dXJlIiwiY3JlYXRlRWxlbWVudCIsIkVycm9yIiwibm9kZSIsInR5cGUiLCJkaXNwbGF5TmFtZSIsIm5hbWUiLCJwcm90b3R5cGUiLCJpc1JlYWN0Q29tcG9uZW50IiwiZ2V0SXRlcmF0b3JGbiIsIm9iaiIsIml0ZXJhdG9yRm4iLCJTeW1ib2wiLCJpdGVyYXRvciIsImlzSXRlcmFibGUiLCJBcnJheSIsImlzQXJyYXkiLCJhcnJzIiwicmVkdWNlIiwiZmxhdEFycnMiLCJpdGVtIiwiY29uY2F0IiwiY2FsbCIsInN0ZXAiLCJuZXh0IiwiZG9uZSIsInZhbHVlIiwiZmxhdEl0ZW0iLCJrZXkiLCJlbCIsInJlY3Vyc2UiLCJhcmd1bWVudHMiLCJsZW5ndGgiLCJwcm9wcyIsInJlZiIsImNoaWxkcmVuIiwicmVuZGVyZWQiLCJtYXAiLCJ4Iiwibm9kZVR5cGUiLCJkYW5nZXJvdXNseVNldElubmVySFRNTCIsImVycm9yIiwiaW5zdGFuY2UiLCJtYXBGaW5kIiwiYXJyYXlsaWtlIiwibWFwcGVyIiwiZmluZGVyIiwiZm91bmQiLCJpc0ZvdW5kIiwiZmluZCIsInByZWRpY2F0ZSIsImhpZXJhcmNoeSIsImdldE5vZGVUeXBlIiwiZ2V0RGlzcGxheU5hbWUiLCJ0dXBsZXMiLCJmaWx0ZXIiLCJpIiwiYXJyIiwiY2xvc2VzdENvbXBvbmVudCIsImpvaW4iLCJjYXRjaGluZ0luc3RhbmNlIiwicm9vdE5vZGUiLCJjYXRjaGluZ1R5cGUiLCJjb21wb25lbnREaWRDYXRjaCIsImdldERlcml2ZWRTdGF0ZUZyb21FcnJvciIsInN0YXRlVXBkYXRlIiwic2V0U3RhdGUiLCJjb21wb25lbnRTdGFjayIsImNvbnRleHRUeXBlcyIsInVubWFza2VkQ29udGV4dCIsIk9iamVjdCIsImtleXMiLCJpc0N1c3RvbUNvbXBvbmVudCIsInRyZWUiLCJvcHRpb25zIiwid3JhcHBpbmdDb21wb25lbnQiLCJyb290RmluZGVyIiwid3JhcHBpbmdDb21wb25lbnRQcm9wcyIsInRvVHJlZSIsImdldE1vdW50V3JhcHBlckluc3RhbmNlIiwiZ2V0Tm9kZSIsInJlbmRlciIsImNvbnRleHQiLCJjYWxsYmFjayIsInNldFdyYXBwaW5nQ29tcG9uZW50UHJvcHMiLCJtb2R1bGVUb0ltcG9ydCIsIlByb21pc2UiLCJyZXNvbHZlIiwibWF0Y2hpbmdUeXBlT2YiLCIkJHR5cGVvZiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7UUFjZ0JBLG1CLEdBQUFBLG1CO1FBc0VBQyxhLEdBQUFBLGE7UUFLQUMsbUIsR0FBQUEsbUI7UUFtQkFDLGtCLEdBQUFBLGtCO1FBTUFDLGlCLEdBQUFBLGlCO1FBVUFDLGdCLEdBQUFBLGdCO1FBMkJBQyxXLEdBQUFBLFc7UUFJQUMsTyxHQUFBQSxPO1FBbUNBQyxvQixHQUFBQSxvQjtRQUlBQyxhLEdBQUFBLGE7UUFvREFDLFcsR0FBQUEsVztRQWNBQyxtQixHQUFBQSxtQjtRQVdBQyxpQixHQUFBQSxpQjtRQW1CQUMsYSxH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QVc7QUFDVCxXQUFPLEtBQVA7QUFDRDtBQUNELFNBQU9BLEtBQUtzRixRQUFMLEtBQWtCRCxjQUF6QjtBQUNEIiwiZmlsZSI6IlV0aWxzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGZ1bmN0aW9uTmFtZSBmcm9tICdmdW5jdGlvbi5wcm90b3R5cGUubmFtZSc7XG5pbXBvcnQgZnJvbUVudHJpZXMgZnJvbSAnb2JqZWN0LmZyb21lbnRyaWVzJztcbmltcG9ydCBjcmVhdGVNb3VudFdyYXBwZXIgZnJvbSAnLi9jcmVhdGVNb3VudFdyYXBwZXInO1xuaW1wb3J0IGNyZWF0ZVJlbmRlcldyYXBwZXIgZnJvbSAnLi9jcmVhdGVSZW5kZXJXcmFwcGVyJztcbmltcG9ydCB3cmFwIGZyb20gJy4vd3JhcFdpdGhTaW1wbGVXcmFwcGVyJztcbmltcG9ydCBSb290RmluZGVyIGZyb20gJy4vUm9vdEZpbmRlcic7XG5cbmV4cG9ydCB7XG4gIGNyZWF0ZU1vdW50V3JhcHBlcixcbiAgY3JlYXRlUmVuZGVyV3JhcHBlcixcbiAgd3JhcCxcbiAgUm9vdEZpbmRlcixcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBtYXBOYXRpdmVFdmVudE5hbWVzKGV2ZW50LCB7XG4gIGFuaW1hdGlvbiA9IGZhbHNlLCAvLyBzaG91bGQgYmUgdHJ1ZSBmb3IgUmVhY3QgMTUrXG4gIHBvaW50ZXJFdmVudHMgPSBmYWxzZSwgLy8gc2hvdWxkIGJlIHRydWUgZm9yIFJlYWN0IDE2LjQrXG4gIGF1eENsaWNrID0gZmFsc2UsIC8vIHNob3VsZCBiZSB0cnVlIGZvciBSZWFjdCAxNi41K1xufSA9IHt9KSB7XG4gIGNvbnN0IG5hdGl2ZVRvUmVhY3RFdmVudE1hcCA9IHtcbiAgICBjb21wb3NpdGlvbmVuZDogJ2NvbXBvc2l0aW9uRW5kJyxcbiAgICBjb21wb3NpdGlvbnN0YXJ0OiAnY29tcG9zaXRpb25TdGFydCcsXG4gICAgY29tcG9zaXRpb251cGRhdGU6ICdjb21wb3NpdGlvblVwZGF0ZScsXG4gICAga2V5ZG93bjogJ2tleURvd24nLFxuICAgIGtleXVwOiAna2V5VXAnLFxuICAgIGtleXByZXNzOiAna2V5UHJlc3MnLFxuICAgIGNvbnRleHRtZW51OiAnY29udGV4dE1lbnUnLFxuICAgIGRibGNsaWNrOiAnZG91YmxlQ2xpY2snLFxuICAgIGRvdWJsZWNsaWNrOiAnZG91YmxlQ2xpY2snLCAvLyBrZXB0IGZvciBsZWdhY3kuIFRPRE86IHJlbW92ZSB3aXRoIG5leHQgbWFqb3IuXG4gICAgZHJhZ2VuZDogJ2RyYWdFbmQnLFxuICAgIGRyYWdlbnRlcjogJ2RyYWdFbnRlcicsXG4gICAgZHJhZ2V4aXN0OiAnZHJhZ0V4aXQnLFxuICAgIGRyYWdsZWF2ZTogJ2RyYWdMZWF2ZScsXG4gICAgZHJhZ292ZXI6ICdkcmFnT3ZlcicsXG4gICAgZHJhZ3N0YXJ0OiAnZHJhZ1N0YXJ0JyxcbiAgICBtb3VzZWRvd246ICdtb3VzZURvd24nLFxuICAgIG1vdXNlbW92ZTogJ21vdXNlTW92ZScsXG4gICAgbW91c2VvdXQ6ICdtb3VzZU91dCcsXG4gICAgbW91c2VvdmVyOiAnbW91c2VPdmVyJyxcbiAgICBtb3VzZXVwOiAnbW91c2VVcCcsXG4gICAgdG91Y2hjYW5jZWw6ICd0b3VjaENhbmNlbCcsXG4gICAgdG91Y2hlbmQ6ICd0b3VjaEVuZCcsXG4gICAgdG91Y2htb3ZlOiAndG91Y2hNb3ZlJyxcbiAgICB0b3VjaHN0YXJ0OiAndG91Y2hTdGFydCcsXG4gICAgY2FucGxheTogJ2NhblBsYXknLFxuICAgIGNhbnBsYXl0aHJvdWdoOiAnY2FuUGxheVRocm91Z2gnLFxuICAgIGR1cmF0aW9uY2hhbmdlOiAnZHVyYXRpb25DaGFuZ2UnLFxuICAgIGxvYWRlZGRhdGE6ICdsb2FkZWREYXRhJyxcbiAgICBsb2FkZWRtZXRhZGF0YTogJ2xvYWRlZE1ldGFkYXRhJyxcbiAgICBsb2Fkc3RhcnQ6ICdsb2FkU3RhcnQnLFxuICAgIHJhdGVjaGFuZ2U6ICdyYXRlQ2hhbmdlJyxcbiAgICB0aW1ldXBkYXRlOiAndGltZVVwZGF0ZScsXG4gICAgdm9sdW1lY2hhbmdlOiAndm9sdW1lQ2hhbmdlJyxcbiAgICBiZWZvcmVpbnB1dDogJ2JlZm9yZUlucHV0JyxcbiAgICBtb3VzZWVudGVyOiAnbW91c2VFbnRlcicsXG4gICAgbW91c2VsZWF2ZTogJ21vdXNlTGVhdmUnLFxuICAgIHRyYW5zaXRpb25lbmQ6ICd0cmFuc2l0aW9uRW5kJyxcbiAgICAuLi4oYW5pbWF0aW9uICYmIHtcbiAgICAgIGFuaW1hdGlvbnN0YXJ0OiAnYW5pbWF0aW9uU3RhcnQnLFxuICAgICAgYW5pbWF0aW9uaXRlcmF0aW9uOiAnYW5pbWF0aW9uSXRlcmF0aW9uJyxcbiAgICAgIGFuaW1hdGlvbmVuZDogJ2FuaW1hdGlvbkVuZCcsXG4gICAgfSksXG4gICAgLi4uKHBvaW50ZXJFdmVudHMgJiYge1xuICAgICAgcG9pbnRlcmRvd246ICdwb2ludGVyRG93bicsXG4gICAgICBwb2ludGVybW92ZTogJ3BvaW50ZXJNb3ZlJyxcbiAgICAgIHBvaW50ZXJ1cDogJ3BvaW50ZXJVcCcsXG4gICAgICBwb2ludGVyY2FuY2VsOiAncG9pbnRlckNhbmNlbCcsXG4gICAgICBnb3Rwb2ludGVyY2FwdHVyZTogJ2dvdFBvaW50ZXJDYXB0dXJlJyxcbiAgICAgIGxvc3Rwb2ludGVyY2FwdHVyZTogJ2xvc3RQb2ludGVyQ2FwdHVyZScsXG4gICAgICBwb2ludGVyZW50ZXI6ICdwb2ludGVyRW50ZXInLFxuICAgICAgcG9pbnRlcmxlYXZlOiAncG9pbnRlckxlYXZlJyxcbiAgICAgIHBvaW50ZXJvdmVyOiAncG9pbnRlck92ZXInLFxuICAgICAgcG9pbnRlcm91dDogJ3BvaW50ZXJPdXQnLFxuICAgIH0pLFxuICAgIC4uLihhdXhDbGljayAmJiB7XG4gICAgICBhdXhjbGljazogJ2F1eENsaWNrJyxcbiAgICB9KSxcbiAgfTtcblxuICByZXR1cm4gbmF0aXZlVG9SZWFjdEV2ZW50TWFwW2V2ZW50XSB8fCBldmVudDtcbn1cblxuLy8gJ2NsaWNrJyA9PiAnb25DbGljaydcbi8vICdtb3VzZUVudGVyJyA9PiAnb25Nb3VzZUVudGVyJ1xuZXhwb3J0IGZ1bmN0aW9uIHByb3BGcm9tRXZlbnQoZXZlbnQsIGV2ZW50T3B0aW9ucyA9IHt9KSB7XG4gIGNvbnN0IG5hdGl2ZUV2ZW50ID0gbWFwTmF0aXZlRXZlbnROYW1lcyhldmVudCwgZXZlbnRPcHRpb25zKTtcbiAgcmV0dXJuIGBvbiR7bmF0aXZlRXZlbnRbMF0udG9VcHBlckNhc2UoKX0ke25hdGl2ZUV2ZW50LnNsaWNlKDEpfWA7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB3aXRoU2V0U3RhdGVBbGxvd2VkKGZuKSB7XG4gIC8vIE5PVEUobG1yKTpcbiAgLy8gdGhpcyBpcyBjdXJyZW50bHkgaGVyZSB0byBjaXJjdW12ZW50IGEgUmVhY3QgYnVnIHdoZXJlIGBzZXRTdGF0ZSgpYCBpc1xuICAvLyBub3QgYWxsb3dlZCB3aXRob3V0IGdsb2JhbCBiZWluZyBkZWZpbmVkLlxuICBsZXQgY2xlYW51cCA9IGZhbHNlO1xuICBpZiAodHlwZW9mIGdsb2JhbC5kb2N1bWVudCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBjbGVhbnVwID0gdHJ1ZTtcbiAgICBnbG9iYWwuZG9jdW1lbnQgPSB7fTtcbiAgfVxuICBjb25zdCByZXN1bHQgPSBmbigpO1xuICBpZiAoY2xlYW51cCkge1xuICAgIC8vIFRoaXMgd29ya3MgYXJvdW5kIGEgYnVnIGluIG5vZGUvamVzdCBpbiB0aGF0IGRldmVsb3BlcnMgYXJlbid0IGFibGUgdG9cbiAgICAvLyBkZWxldGUgdGhpbmdzIGZyb20gZ2xvYmFsIHdoZW4gcnVubmluZyBpbiBhIG5vZGUgdm0uXG4gICAgZ2xvYmFsLmRvY3VtZW50ID0gdW5kZWZpbmVkO1xuICAgIGRlbGV0ZSBnbG9iYWwuZG9jdW1lbnQ7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFzc2VydERvbUF2YWlsYWJsZShmZWF0dXJlKSB7XG4gIGlmICghZ2xvYmFsIHx8ICFnbG9iYWwuZG9jdW1lbnQgfHwgIWdsb2JhbC5kb2N1bWVudC5jcmVhdGVFbGVtZW50KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBFbnp5bWUncyAke2ZlYXR1cmV9IGV4cGVjdHMgYSBET00gZW52aXJvbm1lbnQgdG8gYmUgbG9hZGVkLCBidXQgZm91bmQgbm9uZWApO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkaXNwbGF5TmFtZU9mTm9kZShub2RlKSB7XG4gIGlmICghbm9kZSkgcmV0dXJuIG51bGw7XG5cbiAgY29uc3QgeyB0eXBlIH0gPSBub2RlO1xuXG4gIGlmICghdHlwZSkgcmV0dXJuIG51bGw7XG5cbiAgcmV0dXJuIHR5cGUuZGlzcGxheU5hbWUgfHwgKHR5cGVvZiB0eXBlID09PSAnZnVuY3Rpb24nID8gZnVuY3Rpb25OYW1lKHR5cGUpIDogdHlwZS5uYW1lIHx8IHR5cGUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbm9kZVR5cGVGcm9tVHlwZSh0eXBlKSB7XG4gIGlmICh0eXBlb2YgdHlwZSA9PT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gJ2hvc3QnO1xuICB9XG4gIGlmICh0eXBlICYmIHR5cGUucHJvdG90eXBlICYmIHR5cGUucHJvdG90eXBlLmlzUmVhY3RDb21wb25lbnQpIHtcbiAgICByZXR1cm4gJ2NsYXNzJztcbiAgfVxuICByZXR1cm4gJ2Z1bmN0aW9uJztcbn1cblxuZnVuY3Rpb24gZ2V0SXRlcmF0b3JGbihvYmopIHtcbiAgY29uc3QgaXRlcmF0b3JGbiA9IG9iaiAmJiAoXG4gICAgKHR5cGVvZiBTeW1ib2wgPT09ICdmdW5jdGlvbicgJiYgdHlwZW9mIFN5bWJvbC5pdGVyYXRvciA9PT0gJ3N5bWJvbCcgJiYgb2JqW1N5bWJvbC5pdGVyYXRvcl0pXG4gICAgfHwgb2JqWydAQGl0ZXJhdG9yJ11cbiAgKTtcblxuICBpZiAodHlwZW9mIGl0ZXJhdG9yRm4gPT09ICdmdW5jdGlvbicpIHtcbiAgICByZXR1cm4gaXRlcmF0b3JGbjtcbiAgfVxuXG4gIHJldHVybiB1bmRlZmluZWQ7XG59XG5cbmZ1bmN0aW9uIGlzSXRlcmFibGUob2JqKSB7XG4gIHJldHVybiAhIWdldEl0ZXJhdG9yRm4ob2JqKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzQXJyYXlMaWtlKG9iaikge1xuICByZXR1cm4gQXJyYXkuaXNBcnJheShvYmopIHx8ICh0eXBlb2Ygb2JqICE9PSAnc3RyaW5nJyAmJiBpc0l0ZXJhYmxlKG9iaikpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZmxhdHRlbihhcnJzKSB7XG4gIC8vIG9wdGltaXplIGZvciB0aGUgbW9zdCBjb21tb24gY2FzZVxuICBpZiAoQXJyYXkuaXNBcnJheShhcnJzKSkge1xuICAgIHJldHVybiBhcnJzLnJlZHVjZShcbiAgICAgIChmbGF0QXJycywgaXRlbSkgPT4gZmxhdEFycnMuY29uY2F0KGlzQXJyYXlMaWtlKGl0ZW0pID8gZmxhdHRlbihpdGVtKSA6IGl0ZW0pLFxuICAgICAgW10sXG4gICAgKTtcbiAgfVxuXG4gIC8vIGZhbGxiYWNrIGZvciBhcmJpdHJhcnkgaXRlcmFibGUgY2hpbGRyZW5cbiAgbGV0IGZsYXRBcnJzID0gW107XG5cbiAgY29uc3QgaXRlcmF0b3JGbiA9IGdldEl0ZXJhdG9yRm4oYXJycyk7XG4gIGNvbnN0IGl0ZXJhdG9yID0gaXRlcmF0b3JGbi5jYWxsKGFycnMpO1xuXG4gIGxldCBzdGVwID0gaXRlcmF0b3IubmV4dCgpO1xuXG4gIHdoaWxlICghc3RlcC5kb25lKSB7XG4gICAgY29uc3QgaXRlbSA9IHN0ZXAudmFsdWU7XG4gICAgbGV0IGZsYXRJdGVtO1xuXG4gICAgaWYgKGlzQXJyYXlMaWtlKGl0ZW0pKSB7XG4gICAgICBmbGF0SXRlbSA9IGZsYXR0ZW4oaXRlbSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGZsYXRJdGVtID0gaXRlbTtcbiAgICB9XG5cbiAgICBmbGF0QXJycyA9IGZsYXRBcnJzLmNvbmNhdChmbGF0SXRlbSk7XG5cbiAgICBzdGVwID0gaXRlcmF0b3IubmV4dCgpO1xuICB9XG5cbiAgcmV0dXJuIGZsYXRBcnJzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZW5zdXJlS2V5T3JVbmRlZmluZWQoa2V5KSB7XG4gIHJldHVybiBrZXkgfHwgKGtleSA9PT0gJycgPyAnJyA6IHVuZGVmaW5lZCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBlbGVtZW50VG9UcmVlKGVsLCByZWN1cnNlID0gZWxlbWVudFRvVHJlZSkge1xuICBpZiAodHlwZW9mIHJlY3Vyc2UgIT09ICdmdW5jdGlvbicgJiYgYXJndW1lbnRzLmxlbmd0aCA9PT0gMykge1xuICAgIC8vIHNwZWNpYWwgY2FzZSBmb3IgYmFja3dhcmRzIGNvbXBhdCBmb3IgYC5tYXAoZWxlbWVudFRvVHJlZSlgXG4gICAgcmVjdXJzZSA9IGVsZW1lbnRUb1RyZWU7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tcGFyYW0tcmVhc3NpZ25cbiAgfVxuICBpZiAoZWwgPT09IG51bGwgfHwgdHlwZW9mIGVsICE9PSAnb2JqZWN0JyB8fCAhKCd0eXBlJyBpbiBlbCkpIHtcbiAgICByZXR1cm4gZWw7XG4gIH1cbiAgY29uc3Qge1xuICAgIHR5cGUsXG4gICAgcHJvcHMsXG4gICAga2V5LFxuICAgIHJlZixcbiAgfSA9IGVsO1xuICBjb25zdCB7IGNoaWxkcmVuIH0gPSBwcm9wcztcbiAgbGV0IHJlbmRlcmVkID0gbnVsbDtcbiAgaWYgKGlzQXJyYXlMaWtlKGNoaWxkcmVuKSkge1xuICAgIHJlbmRlcmVkID0gZmxhdHRlbihjaGlsZHJlbikubWFwKCh4KSA9PiByZWN1cnNlKHgpKTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgY2hpbGRyZW4gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgcmVuZGVyZWQgPSByZWN1cnNlKGNoaWxkcmVuKTtcbiAgfVxuXG4gIGNvbnN0IG5vZGVUeXBlID0gbm9kZVR5cGVGcm9tVHlwZSh0eXBlKTtcblxuICBpZiAobm9kZVR5cGUgPT09ICdob3N0JyAmJiBwcm9wcy5kYW5nZXJvdXNseVNldElubmVySFRNTCkge1xuICAgIGlmIChwcm9wcy5jaGlsZHJlbiAhPSBudWxsKSB7XG4gICAgICBjb25zdCBlcnJvciA9IG5ldyBFcnJvcignQ2FuIG9ubHkgc2V0IG9uZSBvZiBgY2hpbGRyZW5gIG9yIGBwcm9wcy5kYW5nZXJvdXNseVNldElubmVySFRNTGAuJyk7XG4gICAgICBlcnJvci5uYW1lID0gJ0ludmFyaWFudCBWaW9sYXRpb24nO1xuICAgICAgdGhyb3cgZXJyb3I7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBub2RlVHlwZSxcbiAgICB0eXBlLFxuICAgIHByb3BzLFxuICAgIGtleTogZW5zdXJlS2V5T3JVbmRlZmluZWQoa2V5KSxcbiAgICByZWYsXG4gICAgaW5zdGFuY2U6IG51bGwsXG4gICAgcmVuZGVyZWQsXG4gIH07XG59XG5cbmZ1bmN0aW9uIG1hcEZpbmQoYXJyYXlsaWtlLCBtYXBwZXIsIGZpbmRlcikge1xuICBsZXQgZm91bmQ7XG4gIGNvbnN0IGlzRm91bmQgPSBBcnJheS5wcm90b3R5cGUuZmluZC5jYWxsKGFycmF5bGlrZSwgKGl0ZW0pID0+IHtcbiAgICBmb3VuZCA9IG1hcHBlcihpdGVtKTtcbiAgICByZXR1cm4gZmluZGVyKGZvdW5kKTtcbiAgfSk7XG4gIHJldHVybiBpc0ZvdW5kID8gZm91bmQgOiB1bmRlZmluZWQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmaW5kRWxlbWVudChlbCwgcHJlZGljYXRlKSB7XG4gIGlmIChlbCA9PT0gbnVsbCB8fCB0eXBlb2YgZWwgIT09ICdvYmplY3QnIHx8ICEoJ3R5cGUnIGluIGVsKSkge1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cbiAgaWYgKHByZWRpY2F0ZShlbCkpIHtcbiAgICByZXR1cm4gZWw7XG4gIH1cbiAgY29uc3QgeyByZW5kZXJlZCB9ID0gZWw7XG4gIGlmIChpc0FycmF5TGlrZShyZW5kZXJlZCkpIHtcbiAgICByZXR1cm4gbWFwRmluZChyZW5kZXJlZCwgKHgpID0+IGZpbmRFbGVtZW50KHgsIHByZWRpY2F0ZSksICh4KSA9PiB0eXBlb2YgeCAhPT0gJ3VuZGVmaW5lZCcpO1xuICB9XG4gIHJldHVybiBmaW5kRWxlbWVudChyZW5kZXJlZCwgcHJlZGljYXRlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHByb3BzV2l0aEtleXNBbmRSZWYobm9kZSkge1xuICBpZiAobm9kZS5yZWYgIT09IG51bGwgfHwgbm9kZS5rZXkgIT09IG51bGwpIHtcbiAgICByZXR1cm4ge1xuICAgICAgLi4ubm9kZS5wcm9wcyxcbiAgICAgIGtleTogbm9kZS5rZXksXG4gICAgICByZWY6IG5vZGUucmVmLFxuICAgIH07XG4gIH1cbiAgcmV0dXJuIG5vZGUucHJvcHM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRDb21wb25lbnRTdGFjayhcbiAgaGllcmFyY2h5LFxuICBnZXROb2RlVHlwZSA9IG5vZGVUeXBlRnJvbVR5cGUsXG4gIGdldERpc3BsYXlOYW1lID0gZGlzcGxheU5hbWVPZk5vZGUsXG4pIHtcbiAgY29uc3QgdHVwbGVzID0gaGllcmFyY2h5LmZpbHRlcigobm9kZSkgPT4gbm9kZS50eXBlICE9PSBSb290RmluZGVyKS5tYXAoKHgpID0+IFtcbiAgICBnZXROb2RlVHlwZSh4LnR5cGUpLFxuICAgIGdldERpc3BsYXlOYW1lKHgpLFxuICBdKS5jb25jYXQoW1tcbiAgICAnY2xhc3MnLFxuICAgICdXcmFwcGVyQ29tcG9uZW50JyxcbiAgXV0pO1xuXG4gIHJldHVybiB0dXBsZXMubWFwKChbLCBuYW1lXSwgaSwgYXJyKSA9PiB7XG4gICAgY29uc3QgWywgY2xvc2VzdENvbXBvbmVudF0gPSBhcnIuc2xpY2UoaSArIDEpLmZpbmQoKFtub2RlVHlwZV0pID0+IG5vZGVUeXBlICE9PSAnaG9zdCcpIHx8IFtdO1xuICAgIHJldHVybiBgXFxuICAgIGluICR7bmFtZX0ke2Nsb3Nlc3RDb21wb25lbnQgPyBgIChjcmVhdGVkIGJ5ICR7Y2xvc2VzdENvbXBvbmVudH0pYCA6ICcnfWA7XG4gIH0pLmpvaW4oJycpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2ltdWxhdGVFcnJvcihcbiAgZXJyb3IsXG4gIGNhdGNoaW5nSW5zdGFuY2UsXG4gIHJvb3ROb2RlLCAvLyBUT0RPOiByZW1vdmUgYHJvb3ROb2RlYCBuZXh0IHNlbXZlci1tYWpvclxuICBoaWVyYXJjaHksXG4gIGdldE5vZGVUeXBlID0gbm9kZVR5cGVGcm9tVHlwZSxcbiAgZ2V0RGlzcGxheU5hbWUgPSBkaXNwbGF5TmFtZU9mTm9kZSxcbiAgY2F0Y2hpbmdUeXBlID0ge30sXG4pIHtcbiAgY29uc3QgaW5zdGFuY2UgPSBjYXRjaGluZ0luc3RhbmNlIHx8IHt9O1xuXG4gIGNvbnN0IHsgY29tcG9uZW50RGlkQ2F0Y2ggfSA9IGluc3RhbmNlO1xuXG4gIGNvbnN0IHsgZ2V0RGVyaXZlZFN0YXRlRnJvbUVycm9yIH0gPSBjYXRjaGluZ1R5cGU7XG5cbiAgaWYgKCFjb21wb25lbnREaWRDYXRjaCAmJiAhZ2V0RGVyaXZlZFN0YXRlRnJvbUVycm9yKSB7XG4gICAgdGhyb3cgZXJyb3I7XG4gIH1cblxuICBpZiAoZ2V0RGVyaXZlZFN0YXRlRnJvbUVycm9yKSB7XG4gICAgY29uc3Qgc3RhdGVVcGRhdGUgPSBnZXREZXJpdmVkU3RhdGVGcm9tRXJyb3IuY2FsbChjYXRjaGluZ1R5cGUsIGVycm9yKTtcbiAgICBpbnN0YW5jZS5zZXRTdGF0ZShzdGF0ZVVwZGF0ZSk7XG4gIH1cblxuICBpZiAoY29tcG9uZW50RGlkQ2F0Y2gpIHtcbiAgICBjb25zdCBjb21wb25lbnRTdGFjayA9IGdldENvbXBvbmVudFN0YWNrKGhpZXJhcmNoeSwgZ2V0Tm9kZVR5cGUsIGdldERpc3BsYXlOYW1lKTtcbiAgICBjb21wb25lbnREaWRDYXRjaC5jYWxsKGluc3RhbmNlLCBlcnJvciwgeyBjb21wb25lbnRTdGFjayB9KTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0TWFza2VkQ29udGV4dChjb250ZXh0VHlwZXMsIHVubWFza2VkQ29udGV4dCkge1xuICBpZiAoIWNvbnRleHRUeXBlcyB8fCAhdW5tYXNrZWRDb250ZXh0KSB7XG4gICAgcmV0dXJuIHt9O1xuICB9XG4gIHJldHVybiBmcm9tRW50cmllcyhPYmplY3Qua2V5cyhjb250ZXh0VHlwZXMpLm1hcCgoa2V5KSA9PiBba2V5LCB1bm1hc2tlZENvbnRleHRba2V5XV0pKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldE5vZGVGcm9tUm9vdEZpbmRlcihpc0N1c3RvbUNvbXBvbmVudCwgdHJlZSwgb3B0aW9ucykge1xuICBpZiAoIWlzQ3VzdG9tQ29tcG9uZW50KG9wdGlvbnMud3JhcHBpbmdDb21wb25lbnQpKSB7XG4gICAgcmV0dXJuIHRyZWUucmVuZGVyZWQ7XG4gIH1cbiAgY29uc3Qgcm9vdEZpbmRlciA9IGZpbmRFbGVtZW50KHRyZWUsIChub2RlKSA9PiBub2RlLnR5cGUgPT09IFJvb3RGaW5kZXIpO1xuICBpZiAoIXJvb3RGaW5kZXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2B3cmFwcGluZ0NvbXBvbmVudGAgbXVzdCByZW5kZXIgaXRzIGNoaWxkcmVuIScpO1xuICB9XG4gIHJldHVybiByb290RmluZGVyLnJlbmRlcmVkO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gd3JhcFdpdGhXcmFwcGluZ0NvbXBvbmVudChjcmVhdGVFbGVtZW50LCBub2RlLCBvcHRpb25zKSB7XG4gIGNvbnN0IHsgd3JhcHBpbmdDb21wb25lbnQsIHdyYXBwaW5nQ29tcG9uZW50UHJvcHMgfSA9IG9wdGlvbnM7XG4gIGlmICghd3JhcHBpbmdDb21wb25lbnQpIHtcbiAgICByZXR1cm4gbm9kZTtcbiAgfVxuICByZXR1cm4gY3JlYXRlRWxlbWVudChcbiAgICB3cmFwcGluZ0NvbXBvbmVudCxcbiAgICB3cmFwcGluZ0NvbXBvbmVudFByb3BzLFxuICAgIGNyZWF0ZUVsZW1lbnQoUm9vdEZpbmRlciwgbnVsbCwgbm9kZSksXG4gICk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRXcmFwcGluZ0NvbXBvbmVudE1vdW50UmVuZGVyZXIoeyB0b1RyZWUsIGdldE1vdW50V3JhcHBlckluc3RhbmNlIH0pIHtcbiAgcmV0dXJuIHtcbiAgICBnZXROb2RlKCkge1xuICAgICAgY29uc3QgaW5zdGFuY2UgPSBnZXRNb3VudFdyYXBwZXJJbnN0YW5jZSgpO1xuICAgICAgcmV0dXJuIGluc3RhbmNlID8gdG9UcmVlKGluc3RhbmNlKS5yZW5kZXJlZCA6IG51bGw7XG4gICAgfSxcbiAgICByZW5kZXIoZWwsIGNvbnRleHQsIGNhbGxiYWNrKSB7XG4gICAgICBjb25zdCBpbnN0YW5jZSA9IGdldE1vdW50V3JhcHBlckluc3RhbmNlKCk7XG4gICAgICBpZiAoIWluc3RhbmNlKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignVGhlIHdyYXBwaW5nIGNvbXBvbmVudCBtYXkgbm90IGJlIHVwZGF0ZWQgaWYgdGhlIHJvb3QgaXMgdW5tb3VudGVkLicpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGluc3RhbmNlLnNldFdyYXBwaW5nQ29tcG9uZW50UHJvcHMoZWwucHJvcHMsIGNhbGxiYWNrKTtcbiAgICB9LFxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZmFrZUR5bmFtaWNJbXBvcnQobW9kdWxlVG9JbXBvcnQpIHtcbiAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh7IGRlZmF1bHQ6IG1vZHVsZVRvSW1wb3J0IH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29tcGFyZU5vZGVUeXBlT2Yobm9kZSwgbWF0Y2hpbmdUeXBlT2YpIHtcbiAgaWYgKCFub2RlKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiBub2RlLiQkdHlwZW9mID09PSBtYXRjaGluZ1R5cGVPZjtcbn1cbiJdfQ==
//# sourceMappingURL=Utils.js.map