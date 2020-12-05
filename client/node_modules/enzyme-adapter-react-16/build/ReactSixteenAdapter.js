'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _object = require('object.assign');

var _object2 = _interopRequireDefault(_object);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _server = require('react-dom/server');

var _server2 = _interopRequireDefault(_server);

var _shallow = require('react-test-renderer/shallow');

var _shallow2 = _interopRequireDefault(_shallow);

var _package = require('react-test-renderer/package.json');

var _testUtils = require('react-dom/test-utils');

var _testUtils2 = _interopRequireDefault(_testUtils);

var _semver = require('semver');

var _semver2 = _interopRequireDefault(_semver);

var _checkPropTypes2 = require('prop-types/checkPropTypes');

var _checkPropTypes3 = _interopRequireDefault(_checkPropTypes2);

var _has = require('has');

var _has2 = _interopRequireDefault(_has);

var _reactIs = require('react-is');

var _enzyme = require('enzyme');

var _Utils = require('enzyme/build/Utils');

var _enzymeShallowEqual = require('enzyme-shallow-equal');

var _enzymeShallowEqual2 = _interopRequireDefault(_enzymeShallowEqual);

var _enzymeAdapterUtils = require('enzyme-adapter-utils');

var _findCurrentFiberUsingSlowPath = require('./findCurrentFiberUsingSlowPath');

var _findCurrentFiberUsingSlowPath2 = _interopRequireDefault(_findCurrentFiberUsingSlowPath);

var _detectFiberTags = require('./detectFiberTags');

var _detectFiberTags2 = _interopRequireDefault(_detectFiberTags);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /* eslint no-use-before-define: 0 */

// eslint-disable-next-line import/no-unresolved

// eslint-disable-next-line import/no-unresolved

// eslint-disable-next-line import/no-unresolved


var is164 = !!_testUtils2['default'].Simulate.touchStart; // 16.4+
var is165 = !!_testUtils2['default'].Simulate.auxClick; // 16.5+
var is166 = is165 && !_react2['default'].unstable_AsyncMode; // 16.6+
var is168 = is166 && typeof _testUtils2['default'].act === 'function';

var hasShouldComponentUpdateBug = _semver2['default'].satisfies(_package.version, '< 16.8');

// Lazily populated if DOM is available.
var FiberTags = null;

function nodeAndSiblingsArray(nodeWithSibling) {
  var array = [];
  var node = nodeWithSibling;
  while (node != null) {
    array.push(node);
    node = node.sibling;
  }
  return array;
}

function flatten(arr) {
  var result = [];
  var stack = [{ i: 0, array: arr }];
  while (stack.length) {
    var n = stack.pop();
    while (n.i < n.array.length) {
      var el = n.array[n.i];
      n.i += 1;
      if (Array.isArray(el)) {
        stack.push(n);
        stack.push({ i: 0, array: el });
        break;
      }
      result.push(el);
    }
  }
  return result;
}

function nodeTypeFromType(type) {
  if (type === _reactIs.Portal) {
    return 'portal';
  }

  return (0, _enzymeAdapterUtils.nodeTypeFromType)(type);
}

function isMemo(type) {
  return (0, _enzymeAdapterUtils.compareNodeTypeOf)(type, _reactIs.Memo);
}

function isLazy(type) {
  return (0, _enzymeAdapterUtils.compareNodeTypeOf)(type, _reactIs.Lazy);
}

function unmemoType(type) {
  return isMemo(type) ? type.type : type;
}

function elementToTree(el) {
  if (!(0, _reactIs.isPortal)(el)) {
    return (0, _enzymeAdapterUtils.elementToTree)(el, elementToTree);
  }

  var children = el.children,
      containerInfo = el.containerInfo;

  var props = { children: children, containerInfo: containerInfo };

  return {
    nodeType: 'portal',
    type: _reactIs.Portal,
    props: props,
    key: (0, _enzymeAdapterUtils.ensureKeyOrUndefined)(el.key),
    ref: el.ref || null,
    instance: null,
    rendered: elementToTree(el.children)
  };
}

function _toTree(vnode) {
  if (vnode == null) {
    return null;
  }
  // TODO(lmr): I'm not really sure I understand whether or not this is what
  // i should be doing, or if this is a hack for something i'm doing wrong
  // somewhere else. Should talk to sebastian about this perhaps
  var node = (0, _findCurrentFiberUsingSlowPath2['default'])(vnode);
  switch (node.tag) {
    case FiberTags.HostRoot:
      return childrenToTree(node.child);
    case FiberTags.HostPortal:
      {
        var containerInfo = node.stateNode.containerInfo,
            children = node.memoizedProps;

        var props = { containerInfo: containerInfo, children: children };
        return {
          nodeType: 'portal',
          type: _reactIs.Portal,
          props: props,
          key: (0, _enzymeAdapterUtils.ensureKeyOrUndefined)(node.key),
          ref: node.ref,
          instance: null,
          rendered: childrenToTree(node.child)
        };
      }
    case FiberTags.ClassComponent:
      return {
        nodeType: 'class',
        type: node.type,
        props: (0, _object2['default'])({}, node.memoizedProps),
        key: (0, _enzymeAdapterUtils.ensureKeyOrUndefined)(node.key),
        ref: node.ref,
        instance: node.stateNode,
        rendered: childrenToTree(node.child)
      };
    case FiberTags.FunctionalComponent:
      return {
        nodeType: 'function',
        type: node.type,
        props: (0, _object2['default'])({}, node.memoizedProps),
        key: (0, _enzymeAdapterUtils.ensureKeyOrUndefined)(node.key),
        ref: node.ref,
        instance: null,
        rendered: childrenToTree(node.child)
      };
    case FiberTags.MemoClass:
      return {
        nodeType: 'class',
        type: node.elementType.type,
        props: (0, _object2['default'])({}, node.memoizedProps),
        key: (0, _enzymeAdapterUtils.ensureKeyOrUndefined)(node.key),
        ref: node.ref,
        instance: node.stateNode,
        rendered: childrenToTree(node.child.child)
      };
    case FiberTags.MemoSFC:
      {
        var renderedNodes = flatten(nodeAndSiblingsArray(node.child).map(_toTree));
        if (renderedNodes.length === 0) {
          renderedNodes = [node.memoizedProps.children];
        }
        return {
          nodeType: 'function',
          type: node.elementType,
          props: (0, _object2['default'])({}, node.memoizedProps),
          key: (0, _enzymeAdapterUtils.ensureKeyOrUndefined)(node.key),
          ref: node.ref,
          instance: null,
          rendered: renderedNodes
        };
      }
    case FiberTags.HostComponent:
      {
        var _renderedNodes = flatten(nodeAndSiblingsArray(node.child).map(_toTree));
        if (_renderedNodes.length === 0) {
          _renderedNodes = [node.memoizedProps.children];
        }
        return {
          nodeType: 'host',
          type: node.type,
          props: (0, _object2['default'])({}, node.memoizedProps),
          key: (0, _enzymeAdapterUtils.ensureKeyOrUndefined)(node.key),
          ref: node.ref,
          instance: node.stateNode,
          rendered: _renderedNodes
        };
      }
    case FiberTags.HostText:
      return node.memoizedProps;
    case FiberTags.Fragment:
    case FiberTags.Mode:
    case FiberTags.ContextProvider:
    case FiberTags.ContextConsumer:
      return childrenToTree(node.child);
    case FiberTags.Profiler:
    case FiberTags.ForwardRef:
      {
        return {
          nodeType: 'function',
          type: node.type,
          props: (0, _object2['default'])({}, node.pendingProps),
          key: (0, _enzymeAdapterUtils.ensureKeyOrUndefined)(node.key),
          ref: node.ref,
          instance: null,
          rendered: childrenToTree(node.child)
        };
      }
    case FiberTags.Suspense:
      {
        return {
          nodeType: 'function',
          type: _reactIs.Suspense,
          props: (0, _object2['default'])({}, node.memoizedProps),
          key: (0, _enzymeAdapterUtils.ensureKeyOrUndefined)(node.key),
          ref: node.ref,
          instance: null,
          rendered: childrenToTree(node.child)
        };
      }
    case FiberTags.Lazy:
      return childrenToTree(node.child);
    default:
      throw new Error('Enzyme Internal Error: unknown node with tag ' + String(node.tag));
  }
}

function childrenToTree(node) {
  if (!node) {
    return null;
  }
  var children = nodeAndSiblingsArray(node);
  if (children.length === 0) {
    return null;
  }
  if (children.length === 1) {
    return _toTree(children[0]);
  }
  return flatten(children.map(_toTree));
}

function _nodeToHostNode(_node) {
  // NOTE(lmr): node could be a function component
  // which wont have an instance prop, but we can get the
  // host node associated with its return value at that point.
  // Although this breaks down if the return value is an array,
  // as is possible with React 16.
  var node = _node;
  while (node && !Array.isArray(node) && node.instance === null) {
    node = node.rendered;
  }
  // if the SFC returned null effectively, there is no host node.
  if (!node) {
    return null;
  }

  var mapper = function mapper(item) {
    if (item && item.instance) return _reactDom2['default'].findDOMNode(item.instance);
    return null;
  };
  if (Array.isArray(node)) {
    return node.map(mapper);
  }
  if (Array.isArray(node.rendered) && node.nodeType === 'class') {
    return node.rendered.map(mapper);
  }
  return mapper(node);
}

function replaceLazyWithFallback(node, fallback) {
  if (!node) {
    return null;
  }
  if (Array.isArray(node)) {
    return node.map(function (el) {
      return replaceLazyWithFallback(el, fallback);
    });
  }
  if (isLazy(node.type)) {
    return fallback;
  }
  return (0, _object2['default'])({}, node, {
    props: (0, _object2['default'])({}, node.props, {
      children: replaceLazyWithFallback(node.props.children, fallback)
    })
  });
}

var eventOptions = {
  animation: true,
  pointerEvents: is164,
  auxClick: is165
};

function getEmptyStateValue() {
  // this handles a bug in React 16.0 - 16.2
  // see https://github.com/facebook/react/commit/39be83565c65f9c522150e52375167568a2a1459
  // also see https://github.com/facebook/react/pull/11965

  // eslint-disable-next-line react/prefer-stateless-function
  var EmptyState = function (_React$Component) {
    _inherits(EmptyState, _React$Component);

    function EmptyState() {
      _classCallCheck(this, EmptyState);

      return _possibleConstructorReturn(this, (EmptyState.__proto__ || Object.getPrototypeOf(EmptyState)).apply(this, arguments));
    }

    _createClass(EmptyState, [{
      key: 'render',
      value: function () {
        function render() {
          return null;
        }

        return render;
      }()
    }]);

    return EmptyState;
  }(_react2['default'].Component);

  var testRenderer = new _shallow2['default']();
  testRenderer.render(_react2['default'].createElement(EmptyState));
  return testRenderer._instance.state;
}

function wrapAct(fn) {
  if (!is168) {
    return fn();
  }
  var returnVal = void 0;
  _testUtils2['default'].act(function () {
    returnVal = fn();
  });
  return returnVal;
}

function getProviderDefaultValue(Provider) {
  // React stores references to the Provider's defaultValue differently across versions.
  if ('_defaultValue' in Provider._context) {
    return Provider._context._defaultValue;
  }
  if ('_currentValue' in Provider._context) {
    return Provider._context._currentValue;
  }
  throw new Error('Enzyme Internal Error: can’t figure out how to get Provider’s default value');
}

function makeFakeElement(type) {
  return { $$typeof: _reactIs.Element, type: type };
}

function isStateful(Component) {
  return Component.prototype && (Component.prototype.isReactComponent || Array.isArray(Component.__reactAutoBindPairs) // fallback for createClass components
  );
}

var ReactSixteenAdapter = function (_EnzymeAdapter) {
  _inherits(ReactSixteenAdapter, _EnzymeAdapter);

  function ReactSixteenAdapter() {
    _classCallCheck(this, ReactSixteenAdapter);

    var _this2 = _possibleConstructorReturn(this, (ReactSixteenAdapter.__proto__ || Object.getPrototypeOf(ReactSixteenAdapter)).call(this));

    var lifecycles = _this2.options.lifecycles;

    _this2.options = (0, _object2['default'])({}, _this2.options, {
      enableComponentDidUpdateOnSetState: true, // TODO: remove, semver-major
      legacyContextMode: 'parent',
      lifecycles: (0, _object2['default'])({}, lifecycles, {
        componentDidUpdate: {
          onSetState: true
        },
        getDerivedStateFromProps: {
          hasShouldComponentUpdateBug: hasShouldComponentUpdateBug
        },
        getSnapshotBeforeUpdate: true,
        setState: {
          skipsComponentDidUpdateOnNullish: true
        },
        getChildContext: {
          calledByRenderer: false
        },
        getDerivedStateFromError: is166
      })
    });
    return _this2;
  }

  _createClass(ReactSixteenAdapter, [{
    key: 'createMountRenderer',
    value: function () {
      function createMountRenderer(options) {
        (0, _enzymeAdapterUtils.assertDomAvailable)('mount');
        if ((0, _has2['default'])(options, 'suspenseFallback')) {
          throw new TypeError('`suspenseFallback` is not supported by the `mount` renderer');
        }
        if (FiberTags === null) {
          // Requires DOM.
          FiberTags = (0, _detectFiberTags2['default'])();
        }
        var attachTo = options.attachTo,
            hydrateIn = options.hydrateIn,
            wrappingComponentProps = options.wrappingComponentProps;

        var domNode = hydrateIn || attachTo || global.document.createElement('div');
        var instance = null;
        var adapter = this;
        return (0, _object2['default'])({
          render: function () {
            function render(el, context, callback) {
              return wrapAct(function () {
                if (instance === null) {
                  var type = el.type,
                      props = el.props,
                      ref = el.ref;

                  var wrapperProps = (0, _object2['default'])({
                    Component: type,
                    props: props,
                    wrappingComponentProps: wrappingComponentProps,
                    context: context
                  }, ref && { refProp: ref });
                  var ReactWrapperComponent = (0, _enzymeAdapterUtils.createMountWrapper)(el, (0, _object2['default'])({}, options, { adapter: adapter }));
                  var wrappedEl = _react2['default'].createElement(ReactWrapperComponent, wrapperProps);
                  instance = hydrateIn ? _reactDom2['default'].hydrate(wrappedEl, domNode) : _reactDom2['default'].render(wrappedEl, domNode);
                  if (typeof callback === 'function') {
                    callback();
                  }
                } else {
                  instance.setChildProps(el.props, context, callback);
                }
              });
            }

            return render;
          }(),
          unmount: function () {
            function unmount() {
              _reactDom2['default'].unmountComponentAtNode(domNode);
              instance = null;
            }

            return unmount;
          }(),
          getNode: function () {
            function getNode() {
              if (!instance) {
                return null;
              }
              return (0, _enzymeAdapterUtils.getNodeFromRootFinder)(adapter.isCustomComponent, _toTree(instance._reactInternalFiber), options);
            }

            return getNode;
          }(),
          simulateError: function () {
            function simulateError(nodeHierarchy, rootNode, error) {
              var isErrorBoundary = function () {
                function isErrorBoundary(_ref) {
                  var elInstance = _ref.instance,
                      type = _ref.type;

                  if (is166 && type && type.getDerivedStateFromError) {
                    return true;
                  }
                  return elInstance && elInstance.componentDidCatch;
                }

                return isErrorBoundary;
              }();

              var _ref2 = nodeHierarchy.find(isErrorBoundary) || {},
                  catchingInstance = _ref2.instance,
                  catchingType = _ref2.type;

              (0, _enzymeAdapterUtils.simulateError)(error, catchingInstance, rootNode, nodeHierarchy, nodeTypeFromType, adapter.displayNameOfNode, is166 ? catchingType : undefined);
            }

            return simulateError;
          }(),
          simulateEvent: function () {
            function simulateEvent(node, event, mock) {
              var mappedEvent = (0, _enzymeAdapterUtils.mapNativeEventNames)(event, eventOptions);
              var eventFn = _testUtils2['default'].Simulate[mappedEvent];
              if (!eventFn) {
                throw new TypeError('ReactWrapper::simulate() event \'' + String(event) + '\' does not exist');
              }
              wrapAct(function () {
                eventFn(adapter.nodeToHostNode(node), mock);
              });
            }

            return simulateEvent;
          }(),
          batchedUpdates: function () {
            function batchedUpdates(fn) {
              return fn();
              // return ReactDOM.unstable_batchedUpdates(fn);
            }

            return batchedUpdates;
          }(),
          getWrappingComponentRenderer: function () {
            function getWrappingComponentRenderer() {
              return (0, _object2['default'])({}, this, (0, _enzymeAdapterUtils.getWrappingComponentMountRenderer)({
                toTree: function () {
                  function toTree(inst) {
                    return _toTree(inst._reactInternalFiber);
                  }

                  return toTree;
                }(),
                getMountWrapperInstance: function () {
                  function getMountWrapperInstance() {
                    return instance;
                  }

                  return getMountWrapperInstance;
                }()
              }));
            }

            return getWrappingComponentRenderer;
          }()
        }, is168 && { wrapInvoke: wrapAct });
      }

      return createMountRenderer;
    }()
  }, {
    key: 'createShallowRenderer',
    value: function () {
      function createShallowRenderer() {
        var _this4 = this;

        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        var adapter = this;
        var renderer = new _shallow2['default']();
        var suspenseFallback = options.suspenseFallback;

        if (typeof suspenseFallback !== 'undefined' && typeof suspenseFallback !== 'boolean') {
          throw TypeError('`options.suspenseFallback` should be boolean or undefined');
        }
        var isDOM = false;
        var cachedNode = null;

        var lastComponent = null;
        var wrappedComponent = null;
        var sentinel = {};

        // wrap memo components with a PureComponent, or a class component with sCU
        var wrapPureComponent = function () {
          function wrapPureComponent(Component, compare) {
            if (!is166) {
              throw new RangeError('this function should not be called in React < 16.6. Please report this!');
            }
            if (lastComponent !== Component) {
              if (isStateful(Component)) {
                wrappedComponent = function (_Component) {
                  _inherits(wrappedComponent, _Component);

                  function wrappedComponent() {
                    _classCallCheck(this, wrappedComponent);

                    return _possibleConstructorReturn(this, (wrappedComponent.__proto__ || Object.getPrototypeOf(wrappedComponent)).apply(this, arguments));
                  }

                  return wrappedComponent;
                }(Component); // eslint-disable-line react/prefer-stateless-function
                if (compare) {
                  wrappedComponent.prototype.shouldComponentUpdate = function (nextProps) {
                    return !compare(_this4.props, nextProps);
                  };
                } else {
                  wrappedComponent.prototype.isPureReactComponent = true;
                }
              } else {
                var memoized = sentinel;
                var prevProps = void 0;
                wrappedComponent = function () {
                  function wrappedComponent(props) {
                    var shouldUpdate = memoized === sentinel || (compare ? !compare(prevProps, props) : !(0, _enzymeShallowEqual2['default'])(prevProps, props));
                    if (shouldUpdate) {
                      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                        args[_key - 1] = arguments[_key];
                      }

                      memoized = Component.apply(undefined, [(0, _object2['default'])({}, Component.defaultProps, props)].concat(args));
                      prevProps = props;
                    }
                    return memoized;
                  }

                  return wrappedComponent;
                }();
              }
              (0, _object2['default'])(wrappedComponent, Component, { displayName: adapter.displayNameOfNode({ type: Component }) });
              lastComponent = Component;
            }
            return wrappedComponent;
          }

          return wrapPureComponent;
        }();

        // Wrap functional components on versions prior to 16.5,
        // to avoid inadvertently pass a `this` instance to it.
        var wrapFunctionalComponent = function () {
          function wrapFunctionalComponent(Component) {
            if (is166 && (0, _has2['default'])(Component, 'defaultProps')) {
              if (lastComponent !== Component) {
                wrappedComponent = (0, _object2['default'])(
                // eslint-disable-next-line new-cap
                function (props) {
                  for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
                    args[_key2 - 1] = arguments[_key2];
                  }

                  return Component.apply(undefined, [(0, _object2['default'])({}, Component.defaultProps, props)].concat(args));
                }, Component, { displayName: adapter.displayNameOfNode({ type: Component }) });
                lastComponent = Component;
              }
              return wrappedComponent;
            }
            if (is165) {
              return Component;
            }

            if (lastComponent !== Component) {
              wrappedComponent = (0, _object2['default'])(function () {
                return Component.apply(undefined, arguments);
              }, // eslint-disable-line new-cap
              Component);
              lastComponent = Component;
            }
            return wrappedComponent;
          }

          return wrapFunctionalComponent;
        }();

        return {
          render: function () {
            function render(el, unmaskedContext) {
              var _ref3 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
                  _ref3$providerValues = _ref3.providerValues,
                  providerValues = _ref3$providerValues === undefined ? new Map() : _ref3$providerValues;

              cachedNode = el;
              /* eslint consistent-return: 0 */
              if (typeof el.type === 'string') {
                isDOM = true;
              } else if ((0, _reactIs.isContextProvider)(el)) {
                providerValues.set(el.type, el.props.value);
                var MockProvider = (0, _object2['default'])(function (props) {
                  return props.children;
                }, el.type);
                return (0, _enzymeAdapterUtils.withSetStateAllowed)(function () {
                  return renderer.render((0, _object2['default'])({}, el, { type: MockProvider }));
                });
              } else if ((0, _reactIs.isContextConsumer)(el)) {
                var Provider = adapter.getProviderFromConsumer(el.type);
                var value = providerValues.has(Provider) ? providerValues.get(Provider) : getProviderDefaultValue(Provider);
                var MockConsumer = (0, _object2['default'])(function (props) {
                  return props.children(value);
                }, el.type);
                return (0, _enzymeAdapterUtils.withSetStateAllowed)(function () {
                  return renderer.render((0, _object2['default'])({}, el, { type: MockConsumer }));
                });
              } else {
                isDOM = false;
                var renderedEl = el;
                if (isLazy(renderedEl)) {
                  throw TypeError('`React.lazy` is not supported by shallow rendering.');
                }
                if ((0, _reactIs.isSuspense)(renderedEl)) {
                  var children = renderedEl.props.children;

                  if (suspenseFallback) {
                    var fallback = renderedEl.props.fallback;

                    children = replaceLazyWithFallback(children, fallback);
                  }
                  var FakeSuspenseWrapper = function () {
                    function FakeSuspenseWrapper() {
                      return children;
                    }

                    return FakeSuspenseWrapper;
                  }();
                  renderedEl = _react2['default'].createElement(FakeSuspenseWrapper, null, children);
                }
                var _renderedEl = renderedEl,
                    Component = _renderedEl.type;


                var context = (0, _enzymeAdapterUtils.getMaskedContext)(Component.contextTypes, unmaskedContext);

                if (isMemo(el.type)) {
                  var _el$type = el.type,
                      InnerComp = _el$type.type,
                      compare = _el$type.compare;


                  return (0, _enzymeAdapterUtils.withSetStateAllowed)(function () {
                    return renderer.render((0, _object2['default'])({}, el, { type: wrapPureComponent(InnerComp, compare) }), context);
                  });
                }

                if (!isStateful(Component) && typeof Component === 'function') {
                  return (0, _enzymeAdapterUtils.withSetStateAllowed)(function () {
                    return renderer.render((0, _object2['default'])({}, renderedEl, { type: wrapFunctionalComponent(Component) }), context);
                  });
                }

                if (isStateful) {
                  // fix react bug; see implementation of `getEmptyStateValue`
                  var emptyStateValue = getEmptyStateValue();
                  if (emptyStateValue) {
                    Object.defineProperty(Component.prototype, 'state', {
                      configurable: true,
                      enumerable: true,
                      get: function () {
                        function get() {
                          return null;
                        }

                        return get;
                      }(),
                      set: function () {
                        function set(value) {
                          if (value !== emptyStateValue) {
                            Object.defineProperty(this, 'state', {
                              configurable: true,
                              enumerable: true,
                              value: value,
                              writable: true
                            });
                          }
                          return true;
                        }

                        return set;
                      }()
                    });
                  }
                }
                return (0, _enzymeAdapterUtils.withSetStateAllowed)(function () {
                  return renderer.render(renderedEl, context);
                });
              }
            }

            return render;
          }(),
          unmount: function () {
            function unmount() {
              renderer.unmount();
            }

            return unmount;
          }(),
          getNode: function () {
            function getNode() {
              if (isDOM) {
                return elementToTree(cachedNode);
              }
              var output = renderer.getRenderOutput();
              return {
                nodeType: nodeTypeFromType(cachedNode.type),
                type: cachedNode.type,
                props: cachedNode.props,
                key: (0, _enzymeAdapterUtils.ensureKeyOrUndefined)(cachedNode.key),
                ref: cachedNode.ref,
                instance: renderer._instance,
                rendered: Array.isArray(output) ? flatten(output).map(function (el) {
                  return elementToTree(el);
                }) : elementToTree(output)
              };
            }

            return getNode;
          }(),
          simulateError: function () {
            function simulateError(nodeHierarchy, rootNode, error) {
              (0, _enzymeAdapterUtils.simulateError)(error, renderer._instance, cachedNode, nodeHierarchy.concat(cachedNode), nodeTypeFromType, adapter.displayNameOfNode, is166 ? cachedNode.type : undefined);
            }

            return simulateError;
          }(),
          simulateEvent: function () {
            function simulateEvent(node, event) {
              for (var _len3 = arguments.length, args = Array(_len3 > 2 ? _len3 - 2 : 0), _key3 = 2; _key3 < _len3; _key3++) {
                args[_key3 - 2] = arguments[_key3];
              }

              var handler = node.props[(0, _enzymeAdapterUtils.propFromEvent)(event, eventOptions)];
              if (handler) {
                (0, _enzymeAdapterUtils.withSetStateAllowed)(function () {
                  // TODO(lmr): create/use synthetic events
                  // TODO(lmr): emulate React's event propagation
                  // ReactDOM.unstable_batchedUpdates(() => {
                  handler.apply(undefined, _toConsumableArray(args));
                  // });
                });
              }
            }

            return simulateEvent;
          }(),
          batchedUpdates: function () {
            function batchedUpdates(fn) {
              return fn();
              // return ReactDOM.unstable_batchedUpdates(fn);
            }

            return batchedUpdates;
          }(),
          checkPropTypes: function () {
            function checkPropTypes(typeSpecs, values, location, hierarchy) {
              return (0, _checkPropTypes3['default'])(typeSpecs, values, location, (0, _enzymeAdapterUtils.displayNameOfNode)(cachedNode), function () {
                return (0, _enzymeAdapterUtils.getComponentStack)(hierarchy.concat([cachedNode]));
              });
            }

            return checkPropTypes;
          }()
        };
      }

      return createShallowRenderer;
    }()
  }, {
    key: 'createStringRenderer',
    value: function () {
      function createStringRenderer(options) {
        if ((0, _has2['default'])(options, 'suspenseFallback')) {
          throw new TypeError('`suspenseFallback` should not be specified in options of string renderer');
        }
        return {
          render: function () {
            function render(el, context) {
              if (options.context && (el.type.contextTypes || options.childContextTypes)) {
                var childContextTypes = (0, _object2['default'])({}, el.type.contextTypes || {}, options.childContextTypes);
                var ContextWrapper = (0, _enzymeAdapterUtils.createRenderWrapper)(el, context, childContextTypes);
                return _server2['default'].renderToStaticMarkup(_react2['default'].createElement(ContextWrapper));
              }
              return _server2['default'].renderToStaticMarkup(el);
            }

            return render;
          }()
        };
      }

      return createStringRenderer;
    }()

    // Provided a bag of options, return an `EnzymeRenderer`. Some options can be implementation
    // specific, like `attach` etc. for React, but not part of this interface explicitly.
    // eslint-disable-next-line class-methods-use-this

  }, {
    key: 'createRenderer',
    value: function () {
      function createRenderer(options) {
        switch (options.mode) {
          case _enzyme.EnzymeAdapter.MODES.MOUNT:
            return this.createMountRenderer(options);
          case _enzyme.EnzymeAdapter.MODES.SHALLOW:
            return this.createShallowRenderer(options);
          case _enzyme.EnzymeAdapter.MODES.STRING:
            return this.createStringRenderer(options);
          default:
            throw new Error('Enzyme Internal Error: Unrecognized mode: ' + String(options.mode));
        }
      }

      return createRenderer;
    }()
  }, {
    key: 'wrap',
    value: function () {
      function wrap(element) {
        return (0, _enzymeAdapterUtils.wrap)(element);
      }

      return wrap;
    }()

    // converts an RSTNode to the corresponding JSX Pragma Element. This will be needed
    // in order to implement the `Wrapper.mount()` and `Wrapper.shallow()` methods, but should
    // be pretty straightforward for people to implement.
    // eslint-disable-next-line class-methods-use-this

  }, {
    key: 'nodeToElement',
    value: function () {
      function nodeToElement(node) {
        if (!node || (typeof node === 'undefined' ? 'undefined' : _typeof(node)) !== 'object') return null;
        var type = node.type;

        return _react2['default'].createElement(unmemoType(type), (0, _enzymeAdapterUtils.propsWithKeysAndRef)(node));
      }

      return nodeToElement;
    }()

    // eslint-disable-next-line class-methods-use-this

  }, {
    key: 'matchesElementType',
    value: function () {
      function matchesElementType(node, matchingType) {
        if (!node) {
          return node;
        }
        var type = node.type;

        return unmemoType(type) === unmemoType(matchingType);
      }

      return matchesElementType;
    }()
  }, {
    key: 'elementToNode',
    value: function () {
      function elementToNode(element) {
        return elementToTree(element);
      }

      return elementToNode;
    }()
  }, {
    key: 'nodeToHostNode',
    value: function () {
      function nodeToHostNode(node) {
        var supportsArray = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

        var nodes = _nodeToHostNode(node);
        if (Array.isArray(nodes) && !supportsArray) {
          return nodes[0];
        }
        return nodes;
      }

      return nodeToHostNode;
    }()
  }, {
    key: 'displayNameOfNode',
    value: function () {
      function displayNameOfNode(node) {
        if (!node) return null;
        var type = node.type,
            $$typeof = node.$$typeof;


        var nodeType = type || $$typeof;

        // newer node types may be undefined, so only test if the nodeType exists
        if (nodeType) {
          switch (nodeType) {
            case (is166 ? _reactIs.ConcurrentMode : _reactIs.AsyncMode) || NaN:
              return is166 ? 'ConcurrentMode' : 'AsyncMode';
            case _reactIs.Fragment || NaN:
              return 'Fragment';
            case _reactIs.StrictMode || NaN:
              return 'StrictMode';
            case _reactIs.Profiler || NaN:
              return 'Profiler';
            case _reactIs.Portal || NaN:
              return 'Portal';
            case _reactIs.Suspense || NaN:
              return 'Suspense';
            default:
          }
        }

        var $$typeofType = type && type.$$typeof;

        switch ($$typeofType) {
          case _reactIs.ContextConsumer || NaN:
            return 'ContextConsumer';
          case _reactIs.ContextProvider || NaN:
            return 'ContextProvider';
          case _reactIs.Memo || NaN:
            {
              var nodeName = (0, _enzymeAdapterUtils.displayNameOfNode)(node);
              return typeof nodeName === 'string' ? nodeName : 'Memo(' + String((0, _enzymeAdapterUtils.displayNameOfNode)(type)) + ')';
            }
          case _reactIs.ForwardRef || NaN:
            {
              if (type.displayName) {
                return type.displayName;
              }
              var name = (0, _enzymeAdapterUtils.displayNameOfNode)({ type: type.render });
              return name ? 'ForwardRef(' + String(name) + ')' : 'ForwardRef';
            }
          case _reactIs.Lazy || NaN:
            {
              return 'lazy';
            }
          default:
            return (0, _enzymeAdapterUtils.displayNameOfNode)(node);
        }
      }

      return displayNameOfNode;
    }()
  }, {
    key: 'isValidElement',
    value: function () {
      function isValidElement(element) {
        return (0, _reactIs.isElement)(element);
      }

      return isValidElement;
    }()
  }, {
    key: 'isValidElementType',
    value: function () {
      function isValidElementType(object) {
        return !!object && (0, _reactIs.isValidElementType)(object);
      }

      return isValidElementType;
    }()
  }, {
    key: 'isFragment',
    value: function () {
      function isFragment(fragment) {
        return (0, _Utils.typeOfNode)(fragment) === _reactIs.Fragment;
      }

      return isFragment;
    }()
  }, {
    key: 'isCustomComponent',
    value: function () {
      function isCustomComponent(type) {
        var fakeElement = makeFakeElement(type);
        return !!type && (typeof type === 'function' || (0, _reactIs.isForwardRef)(fakeElement) || (0, _reactIs.isContextProvider)(fakeElement) || (0, _reactIs.isContextConsumer)(fakeElement) || (0, _reactIs.isSuspense)(fakeElement));
      }

      return isCustomComponent;
    }()
  }, {
    key: 'isContextConsumer',
    value: function () {
      function isContextConsumer(type) {
        return !!type && (0, _reactIs.isContextConsumer)(makeFakeElement(type));
      }

      return isContextConsumer;
    }()
  }, {
    key: 'isCustomComponentElement',
    value: function () {
      function isCustomComponentElement(inst) {
        if (!inst || !this.isValidElement(inst)) {
          return false;
        }
        return this.isCustomComponent(inst.type);
      }

      return isCustomComponentElement;
    }()
  }, {
    key: 'getProviderFromConsumer',
    value: function () {
      function getProviderFromConsumer(Consumer) {
        // React stores references to the Provider on a Consumer differently across versions.
        if (Consumer) {
          var Provider = void 0;
          if (Consumer._context) {
            Provider = Consumer._context.Provider; // check this first, to avoid a deprecation warning
          } else if (Consumer.Provider) {
            Provider = Consumer.Provider;
          }
          if (Provider) {
            return Provider;
          }
        }
        throw new Error('Enzyme Internal Error: can’t figure out how to get Provider from Consumer');
      }

      return getProviderFromConsumer;
    }()
  }, {
    key: 'createElement',
    value: function () {
      function createElement() {
        return _react2['default'].createElement.apply(_react2['default'], arguments);
      }

      return createElement;
    }()
  }, {
    key: 'wrapWithWrappingComponent',
    value: function () {
      function wrapWithWrappingComponent(node, options) {
        return {
          RootFinder: _enzymeAdapterUtils.RootFinder,
          node: (0, _enzymeAdapterUtils.wrapWithWrappingComponent)(_react2['default'].createElement, node, options)
        };
      }

      return wrapWithWrappingComponent;
    }()
  }]);

  return ReactSixteenAdapter;
}(_enzyme.EnzymeAdapter);

module.exports = ReactSixteenAdapter;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9SZWFjdFNpeHRlZW5BZGFwdGVyLmpzIl0sIm5hbWVzIjpbImlzMTY0IiwiVGVzdFV0aWxzIiwiU2ltdWxhdGUiLCJ0b3VjaFN0YXJ0IiwiaXMxNjUiLCJhdXhDbGljayIsImlzMTY2IiwiUmVhY3QiLCJ1bnN0YWJsZV9Bc3luY01vZGUiLCJpczE2OCIsImFjdCIsImhhc1Nob3VsZENvbXBvbmVudFVwZGF0ZUJ1ZyIsInNlbXZlciIsInNhdGlzZmllcyIsInRlc3RSZW5kZXJlclZlcnNpb24iLCJGaWJlclRhZ3MiLCJub2RlQW5kU2libGluZ3NBcnJheSIsIm5vZGVXaXRoU2libGluZyIsImFycmF5Iiwibm9kZSIsInB1c2giLCJzaWJsaW5nIiwiZmxhdHRlbiIsImFyciIsInJlc3VsdCIsInN0YWNrIiwiaSIsImxlbmd0aCIsIm4iLCJwb3AiLCJlbCIsIkFycmF5IiwiaXNBcnJheSIsIm5vZGVUeXBlRnJvbVR5cGUiLCJ0eXBlIiwiUG9ydGFsIiwiaXNNZW1vIiwiTWVtbyIsImlzTGF6eSIsIkxhenkiLCJ1bm1lbW9UeXBlIiwiZWxlbWVudFRvVHJlZSIsImNoaWxkcmVuIiwiY29udGFpbmVySW5mbyIsInByb3BzIiwibm9kZVR5cGUiLCJrZXkiLCJyZWYiLCJpbnN0YW5jZSIsInJlbmRlcmVkIiwidG9UcmVlIiwidm5vZGUiLCJ0YWciLCJIb3N0Um9vdCIsImNoaWxkcmVuVG9UcmVlIiwiY2hpbGQiLCJIb3N0UG9ydGFsIiwic3RhdGVOb2RlIiwibWVtb2l6ZWRQcm9wcyIsIkNsYXNzQ29tcG9uZW50IiwiRnVuY3Rpb25hbENvbXBvbmVudCIsIk1lbW9DbGFzcyIsImVsZW1lbnRUeXBlIiwiTWVtb1NGQyIsInJlbmRlcmVkTm9kZXMiLCJtYXAiLCJIb3N0Q29tcG9uZW50IiwiSG9zdFRleHQiLCJGcmFnbWVudCIsIk1vZGUiLCJDb250ZXh0UHJvdmlkZXIiLCJDb250ZXh0Q29uc3VtZXIiLCJQcm9maWxlciIsIkZvcndhcmRSZWYiLCJwZW5kaW5nUHJvcHMiLCJTdXNwZW5zZSIsIkVycm9yIiwibm9kZVRvSG9zdE5vZGUiLCJfbm9kZSIsIm1hcHBlciIsIml0ZW0iLCJSZWFjdERPTSIsImZpbmRET01Ob2RlIiwicmVwbGFjZUxhenlXaXRoRmFsbGJhY2siLCJmYWxsYmFjayIsImV2ZW50T3B0aW9ucyIsImFuaW1hdGlvbiIsInBvaW50ZXJFdmVudHMiLCJnZXRFbXB0eVN0YXRlVmFsdWUiLCJFbXB0eVN0YXRlIiwiQ29tcG9uZW50IiwidGVzdFJlbmRlcmVyIiwiU2hhbGxvd1JlbmRlcmVyIiwicmVuZGVyIiwiY3JlYXRlRWxlbWVudCIsIl9pbnN0YW5jZSIsInN0YXRlIiwid3JhcEFjdCIsImZuIiwicmV0dXJuVmFsIiwiZ2V0UHJvdmlkZXJEZWZhdWx0VmFsdWUiLCJQcm92aWRlciIsIl9jb250ZXh0IiwiX2RlZmF1bHRWYWx1ZSIsIl9jdXJyZW50VmFsdWUiLCJtYWtlRmFrZUVsZW1lbnQiLCIkJHR5cGVvZiIsIkVsZW1lbnQiLCJpc1N0YXRlZnVsIiwicHJvdG90eXBlIiwiaXNSZWFjdENvbXBvbmVudCIsIl9fcmVhY3RBdXRvQmluZFBhaXJzIiwiUmVhY3RTaXh0ZWVuQWRhcHRlciIsImxpZmVjeWNsZXMiLCJvcHRpb25zIiwiZW5hYmxlQ29tcG9uZW50RGlkVXBkYXRlT25TZXRTdGF0ZSIsImxlZ2FjeUNvbnRleHRNb2RlIiwiY29tcG9uZW50RGlkVXBkYXRlIiwib25TZXRTdGF0ZSIsImdldERlcml2ZWRTdGF0ZUZyb21Qcm9wcyIsImdldFNuYXBzaG90QmVmb3JlVXBkYXRlIiwic2V0U3RhdGUiLCJza2lwc0NvbXBvbmVudERpZFVwZGF0ZU9uTnVsbGlzaCIsImdldENoaWxkQ29udGV4dCIsImNhbGxlZEJ5UmVuZGVyZXIiLCJnZXREZXJpdmVkU3RhdGVGcm9tRXJyb3IiLCJUeXBlRXJyb3IiLCJhdHRhY2hUbyIsImh5ZHJhdGVJbiIsIndyYXBwaW5nQ29tcG9uZW50UHJvcHMiLCJkb21Ob2RlIiwiZ2xvYmFsIiwiZG9jdW1lbnQiLCJhZGFwdGVyIiwiY29udGV4dCIsImNhbGxiYWNrIiwid3JhcHBlclByb3BzIiwicmVmUHJvcCIsIlJlYWN0V3JhcHBlckNvbXBvbmVudCIsIndyYXBwZWRFbCIsImh5ZHJhdGUiLCJzZXRDaGlsZFByb3BzIiwidW5tb3VudCIsInVubW91bnRDb21wb25lbnRBdE5vZGUiLCJnZXROb2RlIiwiaXNDdXN0b21Db21wb25lbnQiLCJfcmVhY3RJbnRlcm5hbEZpYmVyIiwic2ltdWxhdGVFcnJvciIsIm5vZGVIaWVyYXJjaHkiLCJyb290Tm9kZSIsImVycm9yIiwiaXNFcnJvckJvdW5kYXJ5IiwiZWxJbnN0YW5jZSIsImNvbXBvbmVudERpZENhdGNoIiwiZmluZCIsImNhdGNoaW5nSW5zdGFuY2UiLCJjYXRjaGluZ1R5cGUiLCJkaXNwbGF5TmFtZU9mTm9kZSIsInVuZGVmaW5lZCIsInNpbXVsYXRlRXZlbnQiLCJldmVudCIsIm1vY2siLCJtYXBwZWRFdmVudCIsImV2ZW50Rm4iLCJiYXRjaGVkVXBkYXRlcyIsImdldFdyYXBwaW5nQ29tcG9uZW50UmVuZGVyZXIiLCJpbnN0IiwiZ2V0TW91bnRXcmFwcGVySW5zdGFuY2UiLCJ3cmFwSW52b2tlIiwicmVuZGVyZXIiLCJzdXNwZW5zZUZhbGxiYWNrIiwiaXNET00iLCJjYWNoZWROb2RlIiwibGFzdENvbXBvbmVudCIsIndyYXBwZWRDb21wb25lbnQiLCJzZW50aW5lbCIsIndyYXBQdXJlQ29tcG9uZW50IiwiY29tcGFyZSIsIlJhbmdlRXJyb3IiLCJzaG91bGRDb21wb25lbnRVcGRhdGUiLCJuZXh0UHJvcHMiLCJpc1B1cmVSZWFjdENvbXBvbmVudCIsIm1lbW9pemVkIiwicHJldlByb3BzIiwic2hvdWxkVXBkYXRlIiwiYXJncyIsImRlZmF1bHRQcm9wcyIsImRpc3BsYXlOYW1lIiwid3JhcEZ1bmN0aW9uYWxDb21wb25lbnQiLCJ1bm1hc2tlZENvbnRleHQiLCJwcm92aWRlclZhbHVlcyIsIk1hcCIsInNldCIsInZhbHVlIiwiTW9ja1Byb3ZpZGVyIiwiZ2V0UHJvdmlkZXJGcm9tQ29uc3VtZXIiLCJoYXMiLCJnZXQiLCJNb2NrQ29uc3VtZXIiLCJyZW5kZXJlZEVsIiwiRmFrZVN1c3BlbnNlV3JhcHBlciIsImNvbnRleHRUeXBlcyIsIklubmVyQ29tcCIsImVtcHR5U3RhdGVWYWx1ZSIsIk9iamVjdCIsImRlZmluZVByb3BlcnR5IiwiY29uZmlndXJhYmxlIiwiZW51bWVyYWJsZSIsIndyaXRhYmxlIiwib3V0cHV0IiwiZ2V0UmVuZGVyT3V0cHV0IiwiY29uY2F0IiwiaGFuZGxlciIsImNoZWNrUHJvcFR5cGVzIiwidHlwZVNwZWNzIiwidmFsdWVzIiwibG9jYXRpb24iLCJoaWVyYXJjaHkiLCJjaGlsZENvbnRleHRUeXBlcyIsIkNvbnRleHRXcmFwcGVyIiwiUmVhY3RET01TZXJ2ZXIiLCJyZW5kZXJUb1N0YXRpY01hcmt1cCIsIm1vZGUiLCJFbnp5bWVBZGFwdGVyIiwiTU9ERVMiLCJNT1VOVCIsImNyZWF0ZU1vdW50UmVuZGVyZXIiLCJTSEFMTE9XIiwiY3JlYXRlU2hhbGxvd1JlbmRlcmVyIiwiU1RSSU5HIiwiY3JlYXRlU3RyaW5nUmVuZGVyZXIiLCJlbGVtZW50IiwibWF0Y2hpbmdUeXBlIiwic3VwcG9ydHNBcnJheSIsIm5vZGVzIiwiQ29uY3VycmVudE1vZGUiLCJBc3luY01vZGUiLCJOYU4iLCJTdHJpY3RNb2RlIiwiJCR0eXBlb2ZUeXBlIiwibm9kZU5hbWUiLCJuYW1lIiwib2JqZWN0IiwiZnJhZ21lbnQiLCJmYWtlRWxlbWVudCIsImlzVmFsaWRFbGVtZW50IiwiQ29uc3VtZXIiLCJSb290RmluZGVyIiwibW9kdWxlIiwiZXhwb3J0cyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFFQTs7OztBQUVBOzs7O0FBQ0E7O0FBRUE7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7QUFzQkE7O0FBQ0E7O0FBQ0E7Ozs7QUFDQTs7QUFzQkE7Ozs7QUFDQTs7Ozs7Ozs7Ozs7OytlQTdEQTs7QUFHQTs7QUFF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LElBQS9DLEVBQXFEK0YsT0FBckQ7QUFGRCxTQUFQO0FBSUQ7Ozs7Ozs7RUE3Z0IrQjZHLHFCOztBQWdoQmxDeUIsT0FBT0MsT0FBUCxHQUFpQnpJLG1CQUFqQiIsImZpbGUiOiJSZWFjdFNpeHRlZW5BZGFwdGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogZXNsaW50IG5vLXVzZS1iZWZvcmUtZGVmaW5lOiAwICovXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IFJlYWN0RE9NIGZyb20gJ3JlYWN0LWRvbSc7XG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgaW1wb3J0L25vLXVucmVzb2x2ZWRcbmltcG9ydCBSZWFjdERPTVNlcnZlciBmcm9tICdyZWFjdC1kb20vc2VydmVyJztcbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBpbXBvcnQvbm8tdW5yZXNvbHZlZFxuaW1wb3J0IFNoYWxsb3dSZW5kZXJlciBmcm9tICdyZWFjdC10ZXN0LXJlbmRlcmVyL3NoYWxsb3cnO1xuaW1wb3J0IHsgdmVyc2lvbiBhcyB0ZXN0UmVuZGVyZXJWZXJzaW9uIH0gZnJvbSAncmVhY3QtdGVzdC1yZW5kZXJlci9wYWNrYWdlLmpzb24nO1xuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGltcG9ydC9uby11bnJlc29sdmVkXG5pbXBvcnQgVGVzdFV0aWxzIGZyb20gJ3JlYWN0LWRvbS90ZXN0LXV0aWxzJztcbmltcG9ydCBzZW12ZXIgZnJvbSAnc2VtdmVyJztcbmltcG9ydCBjaGVja1Byb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzL2NoZWNrUHJvcFR5cGVzJztcbmltcG9ydCBoYXMgZnJvbSAnaGFzJztcbmltcG9ydCB7XG4gIEFzeW5jTW9kZSxcbiAgQ29uY3VycmVudE1vZGUsXG4gIENvbnRleHRDb25zdW1lcixcbiAgQ29udGV4dFByb3ZpZGVyLFxuICBFbGVtZW50LFxuICBGb3J3YXJkUmVmLFxuICBGcmFnbWVudCxcbiAgaXNDb250ZXh0Q29uc3VtZXIsXG4gIGlzQ29udGV4dFByb3ZpZGVyLFxuICBpc0VsZW1lbnQsXG4gIGlzRm9yd2FyZFJlZixcbiAgaXNQb3J0YWwsXG4gIGlzU3VzcGVuc2UsXG4gIGlzVmFsaWRFbGVtZW50VHlwZSxcbiAgTGF6eSxcbiAgTWVtbyxcbiAgUG9ydGFsLFxuICBQcm9maWxlcixcbiAgU3RyaWN0TW9kZSxcbiAgU3VzcGVuc2UsXG59IGZyb20gJ3JlYWN0LWlzJztcbmltcG9ydCB7IEVuenltZUFkYXB0ZXIgfSBmcm9tICdlbnp5bWUnO1xuaW1wb3J0IHsgdHlwZU9mTm9kZSB9IGZyb20gJ2VuenltZS9idWlsZC9VdGlscyc7XG5pbXBvcnQgc2hhbGxvd0VxdWFsIGZyb20gJ2VuenltZS1zaGFsbG93LWVxdWFsJztcbmltcG9ydCB7XG4gIGRpc3BsYXlOYW1lT2ZOb2RlLFxuICBlbGVtZW50VG9UcmVlIGFzIHV0aWxFbGVtZW50VG9UcmVlLFxuICBub2RlVHlwZUZyb21UeXBlIGFzIHV0aWxOb2RlVHlwZUZyb21UeXBlLFxuICBtYXBOYXRpdmVFdmVudE5hbWVzLFxuICBwcm9wRnJvbUV2ZW50LFxuICBhc3NlcnREb21BdmFpbGFibGUsXG4gIHdpdGhTZXRTdGF0ZUFsbG93ZWQsXG4gIGNyZWF0ZVJlbmRlcldyYXBwZXIsXG4gIGNyZWF0ZU1vdW50V3JhcHBlcixcbiAgcHJvcHNXaXRoS2V5c0FuZFJlZixcbiAgZW5zdXJlS2V5T3JVbmRlZmluZWQsXG4gIHNpbXVsYXRlRXJyb3IsXG4gIHdyYXAsXG4gIGdldE1hc2tlZENvbnRleHQsXG4gIGdldENvbXBvbmVudFN0YWNrLFxuICBSb290RmluZGVyLFxuICBnZXROb2RlRnJvbVJvb3RGaW5kZXIsXG4gIHdyYXBXaXRoV3JhcHBpbmdDb21wb25lbnQsXG4gIGdldFdyYXBwaW5nQ29tcG9uZW50TW91bnRSZW5kZXJlcixcbiAgY29tcGFyZU5vZGVUeXBlT2YsXG59IGZyb20gJ2VuenltZS1hZGFwdGVyLXV0aWxzJztcbmltcG9ydCBmaW5kQ3VycmVudEZpYmVyVXNpbmdTbG93UGF0aCBmcm9tICcuL2ZpbmRDdXJyZW50RmliZXJVc2luZ1Nsb3dQYXRoJztcbmltcG9ydCBkZXRlY3RGaWJlclRhZ3MgZnJvbSAnLi9kZXRlY3RGaWJlclRhZ3MnO1xuXG5jb25zdCBpczE2NCA9ICEhVGVzdFV0aWxzLlNpbXVsYXRlLnRvdWNoU3RhcnQ7IC8vIDE2LjQrXG5jb25zdCBpczE2NSA9ICEhVGVzdFV0aWxzLlNpbXVsYXRlLmF1eENsaWNrOyAvLyAxNi41K1xuY29uc3QgaXMxNjYgPSBpczE2NSAmJiAhUmVhY3QudW5zdGFibGVfQXN5bmNNb2RlOyAvLyAxNi42K1xuY29uc3QgaXMxNjggPSBpczE2NiAmJiB0eXBlb2YgVGVzdFV0aWxzLmFjdCA9PT0gJ2Z1bmN0aW9uJztcblxuY29uc3QgaGFzU2hvdWxkQ29tcG9uZW50VXBkYXRlQnVnID0gc2VtdmVyLnNhdGlzZmllcyh0ZXN0UmVuZGVyZXJWZXJzaW9uLCAnPCAxNi44Jyk7XG5cbi8vIExhemlseSBwb3B1bGF0ZWQgaWYgRE9NIGlzIGF2YWlsYWJsZS5cbmxldCBGaWJlclRhZ3MgPSBudWxsO1xuXG5mdW5jdGlvbiBub2RlQW5kU2libGluZ3NBcnJheShub2RlV2l0aFNpYmxpbmcpIHtcbiAgY29uc3QgYXJyYXkgPSBbXTtcbiAgbGV0IG5vZGUgPSBub2RlV2l0aFNpYmxpbmc7XG4gIHdoaWxlIChub2RlICE9IG51bGwpIHtcbiAgICBhcnJheS5wdXNoKG5vZGUpO1xuICAgIG5vZGUgPSBub2RlLnNpYmxpbmc7XG4gIH1cbiAgcmV0dXJuIGFycmF5O1xufVxuXG5mdW5jdGlvbiBmbGF0dGVuKGFycikge1xuICBjb25zdCByZXN1bHQgPSBbXTtcbiAgY29uc3Qgc3RhY2sgPSBbeyBpOiAwLCBhcnJheTogYXJyIH1dO1xuICB3aGlsZSAoc3RhY2subGVuZ3RoKSB7XG4gICAgY29uc3QgbiA9IHN0YWNrLnBvcCgpO1xuICAgIHdoaWxlIChuLmkgPCBuLmFycmF5Lmxlbmd0aCkge1xuICAgICAgY29uc3QgZWwgPSBuLmFycmF5W24uaV07XG4gICAgICBuLmkgKz0gMTtcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KGVsKSkge1xuICAgICAgICBzdGFjay5wdXNoKG4pO1xuICAgICAgICBzdGFjay5wdXNoKHsgaTogMCwgYXJyYXk6IGVsIH0pO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIHJlc3VsdC5wdXNoKGVsKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZnVuY3Rpb24gbm9kZVR5cGVGcm9tVHlwZSh0eXBlKSB7XG4gIGlmICh0eXBlID09PSBQb3J0YWwpIHtcbiAgICByZXR1cm4gJ3BvcnRhbCc7XG4gIH1cblxuICByZXR1cm4gdXRpbE5vZGVUeXBlRnJvbVR5cGUodHlwZSk7XG59XG5cbmZ1bmN0aW9uIGlzTWVtbyh0eXBlKSB7XG4gIHJldHVybiBjb21wYXJlTm9kZVR5cGVPZih0eXBlLCBNZW1vKTtcbn1cblxuZnVuY3Rpb24gaXNMYXp5KHR5cGUpIHtcbiAgcmV0dXJuIGNvbXBhcmVOb2RlVHlwZU9mKHR5cGUsIExhenkpO1xufVxuXG5mdW5jdGlvbiB1bm1lbW9UeXBlKHR5cGUpIHtcbiAgcmV0dXJuIGlzTWVtbyh0eXBlKSA/IHR5cGUudHlwZSA6IHR5cGU7XG59XG5cbmZ1bmN0aW9uIGVsZW1lbnRUb1RyZWUoZWwpIHtcbiAgaWYgKCFpc1BvcnRhbChlbCkpIHtcbiAgICByZXR1cm4gdXRpbEVsZW1lbnRUb1RyZWUoZWwsIGVsZW1lbnRUb1RyZWUpO1xuICB9XG5cbiAgY29uc3QgeyBjaGlsZHJlbiwgY29udGFpbmVySW5mbyB9ID0gZWw7XG4gIGNvbnN0IHByb3BzID0geyBjaGlsZHJlbiwgY29udGFpbmVySW5mbyB9O1xuXG4gIHJldHVybiB7XG4gICAgbm9kZVR5cGU6ICdwb3J0YWwnLFxuICAgIHR5cGU6IFBvcnRhbCxcbiAgICBwcm9wcyxcbiAgICBrZXk6IGVuc3VyZUtleU9yVW5kZWZpbmVkKGVsLmtleSksXG4gICAgcmVmOiBlbC5yZWYgfHwgbnVsbCxcbiAgICBpbnN0YW5jZTogbnVsbCxcbiAgICByZW5kZXJlZDogZWxlbWVudFRvVHJlZShlbC5jaGlsZHJlbiksXG4gIH07XG59XG5cbmZ1bmN0aW9uIHRvVHJlZSh2bm9kZSkge1xuICBpZiAodm5vZGUgPT0gbnVsbCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIC8vIFRPRE8obG1yKTogSSdtIG5vdCByZWFsbHkgc3VyZSBJIHVuZGVyc3RhbmQgd2hldGhlciBvciBub3QgdGhpcyBpcyB3aGF0XG4gIC8vIGkgc2hvdWxkIGJlIGRvaW5nLCBvciBpZiB0aGlzIGlzIGEgaGFjayBmb3Igc29tZXRoaW5nIGknbSBkb2luZyB3cm9uZ1xuICAvLyBzb21ld2hlcmUgZWxzZS4gU2hvdWxkIHRhbGsgdG8gc2ViYXN0aWFuIGFib3V0IHRoaXMgcGVyaGFwc1xuICBjb25zdCBub2RlID0gZmluZEN1cnJlbnRGaWJlclVzaW5nU2xvd1BhdGgodm5vZGUpO1xuICBzd2l0Y2ggKG5vZGUudGFnKSB7XG4gICAgY2FzZSBGaWJlclRhZ3MuSG9zdFJvb3Q6XG4gICAgICByZXR1cm4gY2hpbGRyZW5Ub1RyZWUobm9kZS5jaGlsZCk7XG4gICAgY2FzZSBGaWJlclRhZ3MuSG9zdFBvcnRhbDoge1xuICAgICAgY29uc3Qge1xuICAgICAgICBzdGF0ZU5vZGU6IHsgY29udGFpbmVySW5mbyB9LFxuICAgICAgICBtZW1vaXplZFByb3BzOiBjaGlsZHJlbixcbiAgICAgIH0gPSBub2RlO1xuICAgICAgY29uc3QgcHJvcHMgPSB7IGNvbnRhaW5lckluZm8sIGNoaWxkcmVuIH07XG4gICAgICByZXR1cm4ge1xuICAgICAgICBub2RlVHlwZTogJ3BvcnRhbCcsXG4gICAgICAgIHR5cGU6IFBvcnRhbCxcbiAgICAgICAgcHJvcHMsXG4gICAgICAgIGtleTogZW5zdXJlS2V5T3JVbmRlZmluZWQobm9kZS5rZXkpLFxuICAgICAgICByZWY6IG5vZGUucmVmLFxuICAgICAgICBpbnN0YW5jZTogbnVsbCxcbiAgICAgICAgcmVuZGVyZWQ6IGNoaWxkcmVuVG9UcmVlKG5vZGUuY2hpbGQpLFxuICAgICAgfTtcbiAgICB9XG4gICAgY2FzZSBGaWJlclRhZ3MuQ2xhc3NDb21wb25lbnQ6XG4gICAgICByZXR1cm4ge1xuICAgICAgICBub2RlVHlwZTogJ2NsYXNzJyxcbiAgICAgICAgdHlwZTogbm9kZS50eXBlLFxuICAgICAgICBwcm9wczogeyAuLi5ub2RlLm1lbW9pemVkUHJvcHMgfSxcbiAgICAgICAga2V5OiBlbnN1cmVLZXlPclVuZGVmaW5lZChub2RlLmtleSksXG4gICAgICAgIHJlZjogbm9kZS5yZWYsXG4gICAgICAgIGluc3RhbmNlOiBub2RlLnN0YXRlTm9kZSxcbiAgICAgICAgcmVuZGVyZWQ6IGNoaWxkcmVuVG9UcmVlKG5vZGUuY2hpbGQpLFxuICAgICAgfTtcbiAgICBjYXNlIEZpYmVyVGFncy5GdW5jdGlvbmFsQ29tcG9uZW50OlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbm9kZVR5cGU6ICdmdW5jdGlvbicsXG4gICAgICAgIHR5cGU6IG5vZGUudHlwZSxcbiAgICAgICAgcHJvcHM6IHsgLi4ubm9kZS5tZW1vaXplZFByb3BzIH0sXG4gICAgICAgIGtleTogZW5zdXJlS2V5T3JVbmRlZmluZWQobm9kZS5rZXkpLFxuICAgICAgICByZWY6IG5vZGUucmVmLFxuICAgICAgICBpbnN0YW5jZTogbnVsbCxcbiAgICAgICAgcmVuZGVyZWQ6IGNoaWxkcmVuVG9UcmVlKG5vZGUuY2hpbGQpLFxuICAgICAgfTtcbiAgICBjYXNlIEZpYmVyVGFncy5NZW1vQ2xhc3M6XG4gICAgICByZXR1cm4ge1xuICAgICAgICBub2RlVHlwZTogJ2NsYXNzJyxcbiAgICAgICAgdHlwZTogbm9kZS5lbGVtZW50VHlwZS50eXBlLFxuICAgICAgICBwcm9wczogeyAuLi5ub2RlLm1lbW9pemVkUHJvcHMgfSxcbiAgICAgICAga2V5OiBlbnN1cmVLZXlPclVuZGVmaW5lZChub2RlLmtleSksXG4gICAgICAgIHJlZjogbm9kZS5yZWYsXG4gICAgICAgIGluc3RhbmNlOiBub2RlLnN0YXRlTm9kZSxcbiAgICAgICAgcmVuZGVyZWQ6IGNoaWxkcmVuVG9UcmVlKG5vZGUuY2hpbGQuY2hpbGQpLFxuICAgICAgfTtcbiAgICBjYXNlIEZpYmVyVGFncy5NZW1vU0ZDOiB7XG4gICAgICBsZXQgcmVuZGVyZWROb2RlcyA9IGZsYXR0ZW4obm9kZUFuZFNpYmxpbmdzQXJyYXkobm9kZS5jaGlsZCkubWFwKHRvVHJlZSkpO1xuICAgICAgaWYgKHJlbmRlcmVkTm9kZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJlbmRlcmVkTm9kZXMgPSBbbm9kZS5tZW1vaXplZFByb3BzLmNoaWxkcmVuXTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB7XG4gICAgICAgIG5vZGVUeXBlOiAnZnVuY3Rpb24nLFxuICAgICAgICB0eXBlOiBub2RlLmVsZW1lbnRUeXBlLFxuICAgICAgICBwcm9wczogeyAuLi5ub2RlLm1lbW9pemVkUHJvcHMgfSxcbiAgICAgICAga2V5OiBlbnN1cmVLZXlPclVuZGVmaW5lZChub2RlLmtleSksXG4gICAgICAgIHJlZjogbm9kZS5yZWYsXG4gICAgICAgIGluc3RhbmNlOiBudWxsLFxuICAgICAgICByZW5kZXJlZDogcmVuZGVyZWROb2RlcyxcbiAgICAgIH07XG4gICAgfVxuICAgIGNhc2UgRmliZXJUYWdzLkhvc3RDb21wb25lbnQ6IHtcbiAgICAgIGxldCByZW5kZXJlZE5vZGVzID0gZmxhdHRlbihub2RlQW5kU2libGluZ3NBcnJheShub2RlLmNoaWxkKS5tYXAodG9UcmVlKSk7XG4gICAgICBpZiAocmVuZGVyZWROb2Rlcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmVuZGVyZWROb2RlcyA9IFtub2RlLm1lbW9pemVkUHJvcHMuY2hpbGRyZW5dO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbm9kZVR5cGU6ICdob3N0JyxcbiAgICAgICAgdHlwZTogbm9kZS50eXBlLFxuICAgICAgICBwcm9wczogeyAuLi5ub2RlLm1lbW9pemVkUHJvcHMgfSxcbiAgICAgICAga2V5OiBlbnN1cmVLZXlPclVuZGVmaW5lZChub2RlLmtleSksXG4gICAgICAgIHJlZjogbm9kZS5yZWYsXG4gICAgICAgIGluc3RhbmNlOiBub2RlLnN0YXRlTm9kZSxcbiAgICAgICAgcmVuZGVyZWQ6IHJlbmRlcmVkTm9kZXMsXG4gICAgICB9O1xuICAgIH1cbiAgICBjYXNlIEZpYmVyVGFncy5Ib3N0VGV4dDpcbiAgICAgIHJldHVybiBub2RlLm1lbW9pemVkUHJvcHM7XG4gICAgY2FzZSBGaWJlclRhZ3MuRnJhZ21lbnQ6XG4gICAgY2FzZSBGaWJlclRhZ3MuTW9kZTpcbiAgICBjYXNlIEZpYmVyVGFncy5Db250ZXh0UHJvdmlkZXI6XG4gICAgY2FzZSBGaWJlclRhZ3MuQ29udGV4dENvbnN1bWVyOlxuICAgICAgcmV0dXJuIGNoaWxkcmVuVG9UcmVlKG5vZGUuY2hpbGQpO1xuICAgIGNhc2UgRmliZXJUYWdzLlByb2ZpbGVyOlxuICAgIGNhc2UgRmliZXJUYWdzLkZvcndhcmRSZWY6IHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIG5vZGVUeXBlOiAnZnVuY3Rpb24nLFxuICAgICAgICB0eXBlOiBub2RlLnR5cGUsXG4gICAgICAgIHByb3BzOiB7IC4uLm5vZGUucGVuZGluZ1Byb3BzIH0sXG4gICAgICAgIGtleTogZW5zdXJlS2V5T3JVbmRlZmluZWQobm9kZS5rZXkpLFxuICAgICAgICByZWY6IG5vZGUucmVmLFxuICAgICAgICBpbnN0YW5jZTogbnVsbCxcbiAgICAgICAgcmVuZGVyZWQ6IGNoaWxkcmVuVG9UcmVlKG5vZGUuY2hpbGQpLFxuICAgICAgfTtcbiAgICB9XG4gICAgY2FzZSBGaWJlclRhZ3MuU3VzcGVuc2U6IHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIG5vZGVUeXBlOiAnZnVuY3Rpb24nLFxuICAgICAgICB0eXBlOiBTdXNwZW5zZSxcbiAgICAgICAgcHJvcHM6IHsgLi4ubm9kZS5tZW1vaXplZFByb3BzIH0sXG4gICAgICAgIGtleTogZW5zdXJlS2V5T3JVbmRlZmluZWQobm9kZS5rZXkpLFxuICAgICAgICByZWY6IG5vZGUucmVmLFxuICAgICAgICBpbnN0YW5jZTogbnVsbCxcbiAgICAgICAgcmVuZGVyZWQ6IGNoaWxkcmVuVG9UcmVlKG5vZGUuY2hpbGQpLFxuICAgICAgfTtcbiAgICB9XG4gICAgY2FzZSBGaWJlclRhZ3MuTGF6eTpcbiAgICAgIHJldHVybiBjaGlsZHJlblRvVHJlZShub2RlLmNoaWxkKTtcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBFbnp5bWUgSW50ZXJuYWwgRXJyb3I6IHVua25vd24gbm9kZSB3aXRoIHRhZyAke25vZGUudGFnfWApO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNoaWxkcmVuVG9UcmVlKG5vZGUpIHtcbiAgaWYgKCFub2RlKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgY29uc3QgY2hpbGRyZW4gPSBub2RlQW5kU2libGluZ3NBcnJheShub2RlKTtcbiAgaWYgKGNoaWxkcmVuLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIGlmIChjaGlsZHJlbi5sZW5ndGggPT09IDEpIHtcbiAgICByZXR1cm4gdG9UcmVlKGNoaWxkcmVuWzBdKTtcbiAgfVxuICByZXR1cm4gZmxhdHRlbihjaGlsZHJlbi5tYXAodG9UcmVlKSk7XG59XG5cbmZ1bmN0aW9uIG5vZGVUb0hvc3ROb2RlKF9ub2RlKSB7XG4gIC8vIE5PVEUobG1yKTogbm9kZSBjb3VsZCBiZSBhIGZ1bmN0aW9uIGNvbXBvbmVudFxuICAvLyB3aGljaCB3b250IGhhdmUgYW4gaW5zdGFuY2UgcHJvcCwgYnV0IHdlIGNhbiBnZXQgdGhlXG4gIC8vIGhvc3Qgbm9kZSBhc3NvY2lhdGVkIHdpdGggaXRzIHJldHVybiB2YWx1ZSBhdCB0aGF0IHBvaW50LlxuICAvLyBBbHRob3VnaCB0aGlzIGJyZWFrcyBkb3duIGlmIHRoZSByZXR1cm4gdmFsdWUgaXMgYW4gYXJyYXksXG4gIC8vIGFzIGlzIHBvc3NpYmxlIHdpdGggUmVhY3QgMTYuXG4gIGxldCBub2RlID0gX25vZGU7XG4gIHdoaWxlIChub2RlICYmICFBcnJheS5pc0FycmF5KG5vZGUpICYmIG5vZGUuaW5zdGFuY2UgPT09IG51bGwpIHtcbiAgICBub2RlID0gbm9kZS5yZW5kZXJlZDtcbiAgfVxuICAvLyBpZiB0aGUgU0ZDIHJldHVybmVkIG51bGwgZWZmZWN0aXZlbHksIHRoZXJlIGlzIG5vIGhvc3Qgbm9kZS5cbiAgaWYgKCFub2RlKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBjb25zdCBtYXBwZXIgPSAoaXRlbSkgPT4ge1xuICAgIGlmIChpdGVtICYmIGl0ZW0uaW5zdGFuY2UpIHJldHVybiBSZWFjdERPTS5maW5kRE9NTm9kZShpdGVtLmluc3RhbmNlKTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfTtcbiAgaWYgKEFycmF5LmlzQXJyYXkobm9kZSkpIHtcbiAgICByZXR1cm4gbm9kZS5tYXAobWFwcGVyKTtcbiAgfVxuICBpZiAoQXJyYXkuaXNBcnJheShub2RlLnJlbmRlcmVkKSAmJiBub2RlLm5vZGVUeXBlID09PSAnY2xhc3MnKSB7XG4gICAgcmV0dXJuIG5vZGUucmVuZGVyZWQubWFwKG1hcHBlcik7XG4gIH1cbiAgcmV0dXJuIG1hcHBlcihub2RlKTtcbn1cblxuZnVuY3Rpb24gcmVwbGFjZUxhenlXaXRoRmFsbGJhY2sobm9kZSwgZmFsbGJhY2spIHtcbiAgaWYgKCFub2RlKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgaWYgKEFycmF5LmlzQXJyYXkobm9kZSkpIHtcbiAgICByZXR1cm4gbm9kZS5tYXAoKGVsKSA9PiByZXBsYWNlTGF6eVdpdGhGYWxsYmFjayhlbCwgZmFsbGJhY2spKTtcbiAgfVxuICBpZiAoaXNMYXp5KG5vZGUudHlwZSkpIHtcbiAgICByZXR1cm4gZmFsbGJhY2s7XG4gIH1cbiAgcmV0dXJuIHtcbiAgICAuLi5ub2RlLFxuICAgIHByb3BzOiB7XG4gICAgICAuLi5ub2RlLnByb3BzLFxuICAgICAgY2hpbGRyZW46IHJlcGxhY2VMYXp5V2l0aEZhbGxiYWNrKG5vZGUucHJvcHMuY2hpbGRyZW4sIGZhbGxiYWNrKSxcbiAgICB9LFxuICB9O1xufVxuXG5jb25zdCBldmVudE9wdGlvbnMgPSB7XG4gIGFuaW1hdGlvbjogdHJ1ZSxcbiAgcG9pbnRlckV2ZW50czogaXMxNjQsXG4gIGF1eENsaWNrOiBpczE2NSxcbn07XG5cbmZ1bmN0aW9uIGdldEVtcHR5U3RhdGVWYWx1ZSgpIHtcbiAgLy8gdGhpcyBoYW5kbGVzIGEgYnVnIGluIFJlYWN0IDE2LjAgLSAxNi4yXG4gIC8vIHNlZSBodHRwczovL2dpdGh1Yi5jb20vZmFjZWJvb2svcmVhY3QvY29tbWl0LzM5YmU4MzU2NWM2NWY5YzUyMjE1MGU1MjM3NTE2NzU2OGEyYTE0NTlcbiAgLy8gYWxzbyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL2ZhY2Vib29rL3JlYWN0L3B1bGwvMTE5NjVcblxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgcmVhY3QvcHJlZmVyLXN0YXRlbGVzcy1mdW5jdGlvblxuICBjbGFzcyBFbXB0eVN0YXRlIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgICByZW5kZXIoKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cbiAgY29uc3QgdGVzdFJlbmRlcmVyID0gbmV3IFNoYWxsb3dSZW5kZXJlcigpO1xuICB0ZXN0UmVuZGVyZXIucmVuZGVyKFJlYWN0LmNyZWF0ZUVsZW1lbnQoRW1wdHlTdGF0ZSkpO1xuICByZXR1cm4gdGVzdFJlbmRlcmVyLl9pbnN0YW5jZS5zdGF0ZTtcbn1cblxuZnVuY3Rpb24gd3JhcEFjdChmbikge1xuICBpZiAoIWlzMTY4KSB7XG4gICAgcmV0dXJuIGZuKCk7XG4gIH1cbiAgbGV0IHJldHVyblZhbDtcbiAgVGVzdFV0aWxzLmFjdCgoKSA9PiB7IHJldHVyblZhbCA9IGZuKCk7IH0pO1xuICByZXR1cm4gcmV0dXJuVmFsO1xufVxuXG5mdW5jdGlvbiBnZXRQcm92aWRlckRlZmF1bHRWYWx1ZShQcm92aWRlcikge1xuICAvLyBSZWFjdCBzdG9yZXMgcmVmZXJlbmNlcyB0byB0aGUgUHJvdmlkZXIncyBkZWZhdWx0VmFsdWUgZGlmZmVyZW50bHkgYWNyb3NzIHZlcnNpb25zLlxuICBpZiAoJ19kZWZhdWx0VmFsdWUnIGluIFByb3ZpZGVyLl9jb250ZXh0KSB7XG4gICAgcmV0dXJuIFByb3ZpZGVyLl9jb250ZXh0Ll9kZWZhdWx0VmFsdWU7XG4gIH1cbiAgaWYgKCdfY3VycmVudFZhbHVlJyBpbiBQcm92aWRlci5fY29udGV4dCkge1xuICAgIHJldHVybiBQcm92aWRlci5fY29udGV4dC5fY3VycmVudFZhbHVlO1xuICB9XG4gIHRocm93IG5ldyBFcnJvcignRW56eW1lIEludGVybmFsIEVycm9yOiBjYW7igJl0IGZpZ3VyZSBvdXQgaG93IHRvIGdldCBQcm92aWRlcuKAmXMgZGVmYXVsdCB2YWx1ZScpO1xufVxuXG5mdW5jdGlvbiBtYWtlRmFrZUVsZW1lbnQodHlwZSkge1xuICByZXR1cm4geyAkJHR5cGVvZjogRWxlbWVudCwgdHlwZSB9O1xufVxuXG5mdW5jdGlvbiBpc1N0YXRlZnVsKENvbXBvbmVudCkge1xuICByZXR1cm4gQ29tcG9uZW50LnByb3RvdHlwZSAmJiAoXG4gICAgQ29tcG9uZW50LnByb3RvdHlwZS5pc1JlYWN0Q29tcG9uZW50XG4gICAgfHwgQXJyYXkuaXNBcnJheShDb21wb25lbnQuX19yZWFjdEF1dG9CaW5kUGFpcnMpIC8vIGZhbGxiYWNrIGZvciBjcmVhdGVDbGFzcyBjb21wb25lbnRzXG4gICk7XG59XG5cbmNsYXNzIFJlYWN0U2l4dGVlbkFkYXB0ZXIgZXh0ZW5kcyBFbnp5bWVBZGFwdGVyIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKTtcbiAgICBjb25zdCB7IGxpZmVjeWNsZXMgfSA9IHRoaXMub3B0aW9ucztcbiAgICB0aGlzLm9wdGlvbnMgPSB7XG4gICAgICAuLi50aGlzLm9wdGlvbnMsXG4gICAgICBlbmFibGVDb21wb25lbnREaWRVcGRhdGVPblNldFN0YXRlOiB0cnVlLCAvLyBUT0RPOiByZW1vdmUsIHNlbXZlci1tYWpvclxuICAgICAgbGVnYWN5Q29udGV4dE1vZGU6ICdwYXJlbnQnLFxuICAgICAgbGlmZWN5Y2xlczoge1xuICAgICAgICAuLi5saWZlY3ljbGVzLFxuICAgICAgICBjb21wb25lbnREaWRVcGRhdGU6IHtcbiAgICAgICAgICBvblNldFN0YXRlOiB0cnVlLFxuICAgICAgICB9LFxuICAgICAgICBnZXREZXJpdmVkU3RhdGVGcm9tUHJvcHM6IHtcbiAgICAgICAgICBoYXNTaG91bGRDb21wb25lbnRVcGRhdGVCdWcsXG4gICAgICAgIH0sXG4gICAgICAgIGdldFNuYXBzaG90QmVmb3JlVXBkYXRlOiB0cnVlLFxuICAgICAgICBzZXRTdGF0ZToge1xuICAgICAgICAgIHNraXBzQ29tcG9uZW50RGlkVXBkYXRlT25OdWxsaXNoOiB0cnVlLFxuICAgICAgICB9LFxuICAgICAgICBnZXRDaGlsZENvbnRleHQ6IHtcbiAgICAgICAgICBjYWxsZWRCeVJlbmRlcmVyOiBmYWxzZSxcbiAgICAgICAgfSxcbiAgICAgICAgZ2V0RGVyaXZlZFN0YXRlRnJvbUVycm9yOiBpczE2NixcbiAgICAgIH0sXG4gICAgfTtcbiAgfVxuXG4gIGNyZWF0ZU1vdW50UmVuZGVyZXIob3B0aW9ucykge1xuICAgIGFzc2VydERvbUF2YWlsYWJsZSgnbW91bnQnKTtcbiAgICBpZiAoaGFzKG9wdGlvbnMsICdzdXNwZW5zZUZhbGxiYWNrJykpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2BzdXNwZW5zZUZhbGxiYWNrYCBpcyBub3Qgc3VwcG9ydGVkIGJ5IHRoZSBgbW91bnRgIHJlbmRlcmVyJyk7XG4gICAgfVxuICAgIGlmIChGaWJlclRhZ3MgPT09IG51bGwpIHtcbiAgICAgIC8vIFJlcXVpcmVzIERPTS5cbiAgICAgIEZpYmVyVGFncyA9IGRldGVjdEZpYmVyVGFncygpO1xuICAgIH1cbiAgICBjb25zdCB7IGF0dGFjaFRvLCBoeWRyYXRlSW4sIHdyYXBwaW5nQ29tcG9uZW50UHJvcHMgfSA9IG9wdGlvbnM7XG4gICAgY29uc3QgZG9tTm9kZSA9IGh5ZHJhdGVJbiB8fCBhdHRhY2hUbyB8fCBnbG9iYWwuZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgbGV0IGluc3RhbmNlID0gbnVsbDtcbiAgICBjb25zdCBhZGFwdGVyID0gdGhpcztcbiAgICByZXR1cm4ge1xuICAgICAgcmVuZGVyKGVsLCBjb250ZXh0LCBjYWxsYmFjaykge1xuICAgICAgICByZXR1cm4gd3JhcEFjdCgoKSA9PiB7XG4gICAgICAgICAgaWYgKGluc3RhbmNlID09PSBudWxsKSB7XG4gICAgICAgICAgICBjb25zdCB7IHR5cGUsIHByb3BzLCByZWYgfSA9IGVsO1xuICAgICAgICAgICAgY29uc3Qgd3JhcHBlclByb3BzID0ge1xuICAgICAgICAgICAgICBDb21wb25lbnQ6IHR5cGUsXG4gICAgICAgICAgICAgIHByb3BzLFxuICAgICAgICAgICAgICB3cmFwcGluZ0NvbXBvbmVudFByb3BzLFxuICAgICAgICAgICAgICBjb250ZXh0LFxuICAgICAgICAgICAgICAuLi4ocmVmICYmIHsgcmVmUHJvcDogcmVmIH0pLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGNvbnN0IFJlYWN0V3JhcHBlckNvbXBvbmVudCA9IGNyZWF0ZU1vdW50V3JhcHBlcihlbCwgeyAuLi5vcHRpb25zLCBhZGFwdGVyIH0pO1xuICAgICAgICAgICAgY29uc3Qgd3JhcHBlZEVsID0gUmVhY3QuY3JlYXRlRWxlbWVudChSZWFjdFdyYXBwZXJDb21wb25lbnQsIHdyYXBwZXJQcm9wcyk7XG4gICAgICAgICAgICBpbnN0YW5jZSA9IGh5ZHJhdGVJblxuICAgICAgICAgICAgICA/IFJlYWN0RE9NLmh5ZHJhdGUod3JhcHBlZEVsLCBkb21Ob2RlKVxuICAgICAgICAgICAgICA6IFJlYWN0RE9NLnJlbmRlcih3cmFwcGVkRWwsIGRvbU5vZGUpO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpbnN0YW5jZS5zZXRDaGlsZFByb3BzKGVsLnByb3BzLCBjb250ZXh0LCBjYWxsYmFjayk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0sXG4gICAgICB1bm1vdW50KCkge1xuICAgICAgICBSZWFjdERPTS51bm1vdW50Q29tcG9uZW50QXROb2RlKGRvbU5vZGUpO1xuICAgICAgICBpbnN0YW5jZSA9IG51bGw7XG4gICAgICB9LFxuICAgICAgZ2V0Tm9kZSgpIHtcbiAgICAgICAgaWYgKCFpbnN0YW5jZSkge1xuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBnZXROb2RlRnJvbVJvb3RGaW5kZXIoXG4gICAgICAgICAgYWRhcHRlci5pc0N1c3RvbUNvbXBvbmVudCxcbiAgICAgICAgICB0b1RyZWUoaW5zdGFuY2UuX3JlYWN0SW50ZXJuYWxGaWJlciksXG4gICAgICAgICAgb3B0aW9ucyxcbiAgICAgICAgKTtcbiAgICAgIH0sXG4gICAgICBzaW11bGF0ZUVycm9yKG5vZGVIaWVyYXJjaHksIHJvb3ROb2RlLCBlcnJvcikge1xuICAgICAgICBjb25zdCBpc0Vycm9yQm91bmRhcnkgPSAoeyBpbnN0YW5jZTogZWxJbnN0YW5jZSwgdHlwZSB9KSA9PiB7XG4gICAgICAgICAgaWYgKGlzMTY2ICYmIHR5cGUgJiYgdHlwZS5nZXREZXJpdmVkU3RhdGVGcm9tRXJyb3IpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gZWxJbnN0YW5jZSAmJiBlbEluc3RhbmNlLmNvbXBvbmVudERpZENhdGNoO1xuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IHtcbiAgICAgICAgICBpbnN0YW5jZTogY2F0Y2hpbmdJbnN0YW5jZSxcbiAgICAgICAgICB0eXBlOiBjYXRjaGluZ1R5cGUsXG4gICAgICAgIH0gPSBub2RlSGllcmFyY2h5LmZpbmQoaXNFcnJvckJvdW5kYXJ5KSB8fCB7fTtcblxuICAgICAgICBzaW11bGF0ZUVycm9yKFxuICAgICAgICAgIGVycm9yLFxuICAgICAgICAgIGNhdGNoaW5nSW5zdGFuY2UsXG4gICAgICAgICAgcm9vdE5vZGUsXG4gICAgICAgICAgbm9kZUhpZXJhcmNoeSxcbiAgICAgICAgICBub2RlVHlwZUZyb21UeXBlLFxuICAgICAgICAgIGFkYXB0ZXIuZGlzcGxheU5hbWVPZk5vZGUsXG4gICAgICAgICAgaXMxNjYgPyBjYXRjaGluZ1R5cGUgOiB1bmRlZmluZWQsXG4gICAgICAgICk7XG4gICAgICB9LFxuICAgICAgc2ltdWxhdGVFdmVudChub2RlLCBldmVudCwgbW9jaykge1xuICAgICAgICBjb25zdCBtYXBwZWRFdmVudCA9IG1hcE5hdGl2ZUV2ZW50TmFtZXMoZXZlbnQsIGV2ZW50T3B0aW9ucyk7XG4gICAgICAgIGNvbnN0IGV2ZW50Rm4gPSBUZXN0VXRpbHMuU2ltdWxhdGVbbWFwcGVkRXZlbnRdO1xuICAgICAgICBpZiAoIWV2ZW50Rm4pIHtcbiAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBSZWFjdFdyYXBwZXI6OnNpbXVsYXRlKCkgZXZlbnQgJyR7ZXZlbnR9JyBkb2VzIG5vdCBleGlzdGApO1xuICAgICAgICB9XG4gICAgICAgIHdyYXBBY3QoKCkgPT4ge1xuICAgICAgICAgIGV2ZW50Rm4oYWRhcHRlci5ub2RlVG9Ib3N0Tm9kZShub2RlKSwgbW9jayk7XG4gICAgICAgIH0pO1xuICAgICAgfSxcbiAgICAgIGJhdGNoZWRVcGRhdGVzKGZuKSB7XG4gICAgICAgIHJldHVybiBmbigpO1xuICAgICAgICAvLyByZXR1cm4gUmVhY3RET00udW5zdGFibGVfYmF0Y2hlZFVwZGF0ZXMoZm4pO1xuICAgICAgfSxcbiAgICAgIGdldFdyYXBwaW5nQ29tcG9uZW50UmVuZGVyZXIoKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgLi4udGhpcyxcbiAgICAgICAgICAuLi5nZXRXcmFwcGluZ0NvbXBvbmVudE1vdW50UmVuZGVyZXIoe1xuICAgICAgICAgICAgdG9UcmVlOiAoaW5zdCkgPT4gdG9UcmVlKGluc3QuX3JlYWN0SW50ZXJuYWxGaWJlciksXG4gICAgICAgICAgICBnZXRNb3VudFdyYXBwZXJJbnN0YW5jZTogKCkgPT4gaW5zdGFuY2UsXG4gICAgICAgICAgfSksXG4gICAgICAgIH07XG4gICAgICB9LFxuICAgICAgLi4uKGlzMTY4ICYmIHsgd3JhcEludm9rZTogd3JhcEFjdCB9KSxcbiAgICB9O1xuICB9XG5cbiAgY3JlYXRlU2hhbGxvd1JlbmRlcmVyKG9wdGlvbnMgPSB7fSkge1xuICAgIGNvbnN0IGFkYXB0ZXIgPSB0aGlzO1xuICAgIGNvbnN0IHJlbmRlcmVyID0gbmV3IFNoYWxsb3dSZW5kZXJlcigpO1xuICAgIGNvbnN0IHsgc3VzcGVuc2VGYWxsYmFjayB9ID0gb3B0aW9ucztcbiAgICBpZiAodHlwZW9mIHN1c3BlbnNlRmFsbGJhY2sgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBzdXNwZW5zZUZhbGxiYWNrICE9PSAnYm9vbGVhbicpIHtcbiAgICAgIHRocm93IFR5cGVFcnJvcignYG9wdGlvbnMuc3VzcGVuc2VGYWxsYmFja2Agc2hvdWxkIGJlIGJvb2xlYW4gb3IgdW5kZWZpbmVkJyk7XG4gICAgfVxuICAgIGxldCBpc0RPTSA9IGZhbHNlO1xuICAgIGxldCBjYWNoZWROb2RlID0gbnVsbDtcblxuICAgIGxldCBsYXN0Q29tcG9uZW50ID0gbnVsbDtcbiAgICBsZXQgd3JhcHBlZENvbXBvbmVudCA9IG51bGw7XG4gICAgY29uc3Qgc2VudGluZWwgPSB7fTtcblxuICAgIC8vIHdyYXAgbWVtbyBjb21wb25lbnRzIHdpdGggYSBQdXJlQ29tcG9uZW50LCBvciBhIGNsYXNzIGNvbXBvbmVudCB3aXRoIHNDVVxuICAgIGNvbnN0IHdyYXBQdXJlQ29tcG9uZW50ID0gKENvbXBvbmVudCwgY29tcGFyZSkgPT4ge1xuICAgICAgaWYgKCFpczE2Nikge1xuICAgICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcigndGhpcyBmdW5jdGlvbiBzaG91bGQgbm90IGJlIGNhbGxlZCBpbiBSZWFjdCA8IDE2LjYuIFBsZWFzZSByZXBvcnQgdGhpcyEnKTtcbiAgICAgIH1cbiAgICAgIGlmIChsYXN0Q29tcG9uZW50ICE9PSBDb21wb25lbnQpIHtcbiAgICAgICAgaWYgKGlzU3RhdGVmdWwoQ29tcG9uZW50KSkge1xuICAgICAgICAgIHdyYXBwZWRDb21wb25lbnQgPSBjbGFzcyBleHRlbmRzIENvbXBvbmVudCB7fTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSByZWFjdC9wcmVmZXItc3RhdGVsZXNzLWZ1bmN0aW9uXG4gICAgICAgICAgaWYgKGNvbXBhcmUpIHtcbiAgICAgICAgICAgIHdyYXBwZWRDb21wb25lbnQucHJvdG90eXBlLnNob3VsZENvbXBvbmVudFVwZGF0ZSA9IChuZXh0UHJvcHMpID0+ICFjb21wYXJlKHRoaXMucHJvcHMsIG5leHRQcm9wcyk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHdyYXBwZWRDb21wb25lbnQucHJvdG90eXBlLmlzUHVyZVJlYWN0Q29tcG9uZW50ID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbGV0IG1lbW9pemVkID0gc2VudGluZWw7XG4gICAgICAgICAgbGV0IHByZXZQcm9wcztcbiAgICAgICAgICB3cmFwcGVkQ29tcG9uZW50ID0gZnVuY3Rpb24gKHByb3BzLCAuLi5hcmdzKSB7XG4gICAgICAgICAgICBjb25zdCBzaG91bGRVcGRhdGUgPSBtZW1vaXplZCA9PT0gc2VudGluZWwgfHwgKGNvbXBhcmVcbiAgICAgICAgICAgICAgPyAhY29tcGFyZShwcmV2UHJvcHMsIHByb3BzKVxuICAgICAgICAgICAgICA6ICFzaGFsbG93RXF1YWwocHJldlByb3BzLCBwcm9wcylcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBpZiAoc2hvdWxkVXBkYXRlKSB7XG4gICAgICAgICAgICAgIG1lbW9pemVkID0gQ29tcG9uZW50KHsgLi4uQ29tcG9uZW50LmRlZmF1bHRQcm9wcywgLi4ucHJvcHMgfSwgLi4uYXJncyk7XG4gICAgICAgICAgICAgIHByZXZQcm9wcyA9IHByb3BzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG1lbW9pemVkO1xuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgT2JqZWN0LmFzc2lnbihcbiAgICAgICAgICB3cmFwcGVkQ29tcG9uZW50LFxuICAgICAgICAgIENvbXBvbmVudCxcbiAgICAgICAgICB7IGRpc3BsYXlOYW1lOiBhZGFwdGVyLmRpc3BsYXlOYW1lT2ZOb2RlKHsgdHlwZTogQ29tcG9uZW50IH0pIH0sXG4gICAgICAgICk7XG4gICAgICAgIGxhc3RDb21wb25lbnQgPSBDb21wb25lbnQ7XG4gICAgICB9XG4gICAgICByZXR1cm4gd3JhcHBlZENvbXBvbmVudDtcbiAgICB9O1xuXG4gICAgLy8gV3JhcCBmdW5jdGlvbmFsIGNvbXBvbmVudHMgb24gdmVyc2lvbnMgcHJpb3IgdG8gMTYuNSxcbiAgICAvLyB0byBhdm9pZCBpbmFkdmVydGVudGx5IHBhc3MgYSBgdGhpc2AgaW5zdGFuY2UgdG8gaXQuXG4gICAgY29uc3Qgd3JhcEZ1bmN0aW9uYWxDb21wb25lbnQgPSAoQ29tcG9uZW50KSA9PiB7XG4gICAgICBpZiAoaXMxNjYgJiYgaGFzKENvbXBvbmVudCwgJ2RlZmF1bHRQcm9wcycpKSB7XG4gICAgICAgIGlmIChsYXN0Q29tcG9uZW50ICE9PSBDb21wb25lbnQpIHtcbiAgICAgICAgICB3cmFwcGVkQ29tcG9uZW50ID0gT2JqZWN0LmFzc2lnbihcbiAgICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuZXctY2FwXG4gICAgICAgICAgICAocHJvcHMsIC4uLmFyZ3MpID0+IENvbXBvbmVudCh7IC4uLkNvbXBvbmVudC5kZWZhdWx0UHJvcHMsIC4uLnByb3BzIH0sIC4uLmFyZ3MpLFxuICAgICAgICAgICAgQ29tcG9uZW50LFxuICAgICAgICAgICAgeyBkaXNwbGF5TmFtZTogYWRhcHRlci5kaXNwbGF5TmFtZU9mTm9kZSh7IHR5cGU6IENvbXBvbmVudCB9KSB9LFxuICAgICAgICAgICk7XG4gICAgICAgICAgbGFzdENvbXBvbmVudCA9IENvbXBvbmVudDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gd3JhcHBlZENvbXBvbmVudDtcbiAgICAgIH1cbiAgICAgIGlmIChpczE2NSkge1xuICAgICAgICByZXR1cm4gQ29tcG9uZW50O1xuICAgICAgfVxuXG4gICAgICBpZiAobGFzdENvbXBvbmVudCAhPT0gQ29tcG9uZW50KSB7XG4gICAgICAgIHdyYXBwZWRDb21wb25lbnQgPSBPYmplY3QuYXNzaWduKFxuICAgICAgICAgICguLi5hcmdzKSA9PiBDb21wb25lbnQoLi4uYXJncyksIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbmV3LWNhcFxuICAgICAgICAgIENvbXBvbmVudCxcbiAgICAgICAgKTtcbiAgICAgICAgbGFzdENvbXBvbmVudCA9IENvbXBvbmVudDtcbiAgICAgIH1cbiAgICAgIHJldHVybiB3cmFwcGVkQ29tcG9uZW50O1xuICAgIH07XG5cbiAgICByZXR1cm4ge1xuICAgICAgcmVuZGVyKGVsLCB1bm1hc2tlZENvbnRleHQsIHtcbiAgICAgICAgcHJvdmlkZXJWYWx1ZXMgPSBuZXcgTWFwKCksXG4gICAgICB9ID0ge30pIHtcbiAgICAgICAgY2FjaGVkTm9kZSA9IGVsO1xuICAgICAgICAvKiBlc2xpbnQgY29uc2lzdGVudC1yZXR1cm46IDAgKi9cbiAgICAgICAgaWYgKHR5cGVvZiBlbC50eXBlID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIGlzRE9NID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIGlmIChpc0NvbnRleHRQcm92aWRlcihlbCkpIHtcbiAgICAgICAgICBwcm92aWRlclZhbHVlcy5zZXQoZWwudHlwZSwgZWwucHJvcHMudmFsdWUpO1xuICAgICAgICAgIGNvbnN0IE1vY2tQcm92aWRlciA9IE9iamVjdC5hc3NpZ24oXG4gICAgICAgICAgICAocHJvcHMpID0+IHByb3BzLmNoaWxkcmVuLFxuICAgICAgICAgICAgZWwudHlwZSxcbiAgICAgICAgICApO1xuICAgICAgICAgIHJldHVybiB3aXRoU2V0U3RhdGVBbGxvd2VkKCgpID0+IHJlbmRlcmVyLnJlbmRlcih7IC4uLmVsLCB0eXBlOiBNb2NrUHJvdmlkZXIgfSkpO1xuICAgICAgICB9IGVsc2UgaWYgKGlzQ29udGV4dENvbnN1bWVyKGVsKSkge1xuICAgICAgICAgIGNvbnN0IFByb3ZpZGVyID0gYWRhcHRlci5nZXRQcm92aWRlckZyb21Db25zdW1lcihlbC50eXBlKTtcbiAgICAgICAgICBjb25zdCB2YWx1ZSA9IHByb3ZpZGVyVmFsdWVzLmhhcyhQcm92aWRlcilcbiAgICAgICAgICAgID8gcHJvdmlkZXJWYWx1ZXMuZ2V0KFByb3ZpZGVyKVxuICAgICAgICAgICAgOiBnZXRQcm92aWRlckRlZmF1bHRWYWx1ZShQcm92aWRlcik7XG4gICAgICAgICAgY29uc3QgTW9ja0NvbnN1bWVyID0gT2JqZWN0LmFzc2lnbihcbiAgICAgICAgICAgIChwcm9wcykgPT4gcHJvcHMuY2hpbGRyZW4odmFsdWUpLFxuICAgICAgICAgICAgZWwudHlwZSxcbiAgICAgICAgICApO1xuICAgICAgICAgIHJldHVybiB3aXRoU2V0U3RhdGVBbGxvd2VkKCgpID0+IHJlbmRlcmVyLnJlbmRlcih7IC4uLmVsLCB0eXBlOiBNb2NrQ29uc3VtZXIgfSkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlzRE9NID0gZmFsc2U7XG4gICAgICAgICAgbGV0IHJlbmRlcmVkRWwgPSBlbDtcbiAgICAgICAgICBpZiAoaXNMYXp5KHJlbmRlcmVkRWwpKSB7XG4gICAgICAgICAgICB0aHJvdyBUeXBlRXJyb3IoJ2BSZWFjdC5sYXp5YCBpcyBub3Qgc3VwcG9ydGVkIGJ5IHNoYWxsb3cgcmVuZGVyaW5nLicpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoaXNTdXNwZW5zZShyZW5kZXJlZEVsKSkge1xuICAgICAgICAgICAgbGV0IHsgY2hpbGRyZW4gfSA9IHJlbmRlcmVkRWwucHJvcHM7XG4gICAgICAgICAgICBpZiAoc3VzcGVuc2VGYWxsYmFjaykge1xuICAgICAgICAgICAgICBjb25zdCB7IGZhbGxiYWNrIH0gPSByZW5kZXJlZEVsLnByb3BzO1xuICAgICAgICAgICAgICBjaGlsZHJlbiA9IHJlcGxhY2VMYXp5V2l0aEZhbGxiYWNrKGNoaWxkcmVuLCBmYWxsYmFjayk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBGYWtlU3VzcGVuc2VXcmFwcGVyID0gKCkgPT4gY2hpbGRyZW47XG4gICAgICAgICAgICByZW5kZXJlZEVsID0gUmVhY3QuY3JlYXRlRWxlbWVudChGYWtlU3VzcGVuc2VXcmFwcGVyLCBudWxsLCBjaGlsZHJlbik7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnN0IHsgdHlwZTogQ29tcG9uZW50IH0gPSByZW5kZXJlZEVsO1xuXG4gICAgICAgICAgY29uc3QgY29udGV4dCA9IGdldE1hc2tlZENvbnRleHQoQ29tcG9uZW50LmNvbnRleHRUeXBlcywgdW5tYXNrZWRDb250ZXh0KTtcblxuICAgICAgICAgIGlmIChpc01lbW8oZWwudHlwZSkpIHtcbiAgICAgICAgICAgIGNvbnN0IHsgdHlwZTogSW5uZXJDb21wLCBjb21wYXJlIH0gPSBlbC50eXBlO1xuXG4gICAgICAgICAgICByZXR1cm4gd2l0aFNldFN0YXRlQWxsb3dlZCgoKSA9PiByZW5kZXJlci5yZW5kZXIoXG4gICAgICAgICAgICAgIHsgLi4uZWwsIHR5cGU6IHdyYXBQdXJlQ29tcG9uZW50KElubmVyQ29tcCwgY29tcGFyZSkgfSxcbiAgICAgICAgICAgICAgY29udGV4dCxcbiAgICAgICAgICAgICkpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICghaXNTdGF0ZWZ1bChDb21wb25lbnQpICYmIHR5cGVvZiBDb21wb25lbnQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIHJldHVybiB3aXRoU2V0U3RhdGVBbGxvd2VkKCgpID0+IHJlbmRlcmVyLnJlbmRlcihcbiAgICAgICAgICAgICAgeyAuLi5yZW5kZXJlZEVsLCB0eXBlOiB3cmFwRnVuY3Rpb25hbENvbXBvbmVudChDb21wb25lbnQpIH0sXG4gICAgICAgICAgICAgIGNvbnRleHQsXG4gICAgICAgICAgICApKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoaXNTdGF0ZWZ1bCkge1xuICAgICAgICAgICAgLy8gZml4IHJlYWN0IGJ1Zzsgc2VlIGltcGxlbWVudGF0aW9uIG9mIGBnZXRFbXB0eVN0YXRlVmFsdWVgXG4gICAgICAgICAgICBjb25zdCBlbXB0eVN0YXRlVmFsdWUgPSBnZXRFbXB0eVN0YXRlVmFsdWUoKTtcbiAgICAgICAgICAgIGlmIChlbXB0eVN0YXRlVmFsdWUpIHtcbiAgICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KENvbXBvbmVudC5wcm90b3R5cGUsICdzdGF0ZScsIHtcbiAgICAgICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBnZXQoKSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHNldCh2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgaWYgKHZhbHVlICE9PSBlbXB0eVN0YXRlVmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICdzdGF0ZScsIHtcbiAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHdpdGhTZXRTdGF0ZUFsbG93ZWQoKCkgPT4gcmVuZGVyZXIucmVuZGVyKHJlbmRlcmVkRWwsIGNvbnRleHQpKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIHVubW91bnQoKSB7XG4gICAgICAgIHJlbmRlcmVyLnVubW91bnQoKTtcbiAgICAgIH0sXG4gICAgICBnZXROb2RlKCkge1xuICAgICAgICBpZiAoaXNET00pIHtcbiAgICAgICAgICByZXR1cm4gZWxlbWVudFRvVHJlZShjYWNoZWROb2RlKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBvdXRwdXQgPSByZW5kZXJlci5nZXRSZW5kZXJPdXRwdXQoKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBub2RlVHlwZTogbm9kZVR5cGVGcm9tVHlwZShjYWNoZWROb2RlLnR5cGUpLFxuICAgICAgICAgIHR5cGU6IGNhY2hlZE5vZGUudHlwZSxcbiAgICAgICAgICBwcm9wczogY2FjaGVkTm9kZS5wcm9wcyxcbiAgICAgICAgICBrZXk6IGVuc3VyZUtleU9yVW5kZWZpbmVkKGNhY2hlZE5vZGUua2V5KSxcbiAgICAgICAgICByZWY6IGNhY2hlZE5vZGUucmVmLFxuICAgICAgICAgIGluc3RhbmNlOiByZW5kZXJlci5faW5zdGFuY2UsXG4gICAgICAgICAgcmVuZGVyZWQ6IEFycmF5LmlzQXJyYXkob3V0cHV0KVxuICAgICAgICAgICAgPyBmbGF0dGVuKG91dHB1dCkubWFwKChlbCkgPT4gZWxlbWVudFRvVHJlZShlbCkpXG4gICAgICAgICAgICA6IGVsZW1lbnRUb1RyZWUob3V0cHV0KSxcbiAgICAgICAgfTtcbiAgICAgIH0sXG4gICAgICBzaW11bGF0ZUVycm9yKG5vZGVIaWVyYXJjaHksIHJvb3ROb2RlLCBlcnJvcikge1xuICAgICAgICBzaW11bGF0ZUVycm9yKFxuICAgICAgICAgIGVycm9yLFxuICAgICAgICAgIHJlbmRlcmVyLl9pbnN0YW5jZSxcbiAgICAgICAgICBjYWNoZWROb2RlLFxuICAgICAgICAgIG5vZGVIaWVyYXJjaHkuY29uY2F0KGNhY2hlZE5vZGUpLFxuICAgICAgICAgIG5vZGVUeXBlRnJvbVR5cGUsXG4gICAgICAgICAgYWRhcHRlci5kaXNwbGF5TmFtZU9mTm9kZSxcbiAgICAgICAgICBpczE2NiA/IGNhY2hlZE5vZGUudHlwZSA6IHVuZGVmaW5lZCxcbiAgICAgICAgKTtcbiAgICAgIH0sXG4gICAgICBzaW11bGF0ZUV2ZW50KG5vZGUsIGV2ZW50LCAuLi5hcmdzKSB7XG4gICAgICAgIGNvbnN0IGhhbmRsZXIgPSBub2RlLnByb3BzW3Byb3BGcm9tRXZlbnQoZXZlbnQsIGV2ZW50T3B0aW9ucyldO1xuICAgICAgICBpZiAoaGFuZGxlcikge1xuICAgICAgICAgIHdpdGhTZXRTdGF0ZUFsbG93ZWQoKCkgPT4ge1xuICAgICAgICAgICAgLy8gVE9ETyhsbXIpOiBjcmVhdGUvdXNlIHN5bnRoZXRpYyBldmVudHNcbiAgICAgICAgICAgIC8vIFRPRE8obG1yKTogZW11bGF0ZSBSZWFjdCdzIGV2ZW50IHByb3BhZ2F0aW9uXG4gICAgICAgICAgICAvLyBSZWFjdERPTS51bnN0YWJsZV9iYXRjaGVkVXBkYXRlcygoKSA9PiB7XG4gICAgICAgICAgICBoYW5kbGVyKC4uLmFyZ3MpO1xuICAgICAgICAgICAgLy8gfSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBiYXRjaGVkVXBkYXRlcyhmbikge1xuICAgICAgICByZXR1cm4gZm4oKTtcbiAgICAgICAgLy8gcmV0dXJuIFJlYWN0RE9NLnVuc3RhYmxlX2JhdGNoZWRVcGRhdGVzKGZuKTtcbiAgICAgIH0sXG4gICAgICBjaGVja1Byb3BUeXBlcyh0eXBlU3BlY3MsIHZhbHVlcywgbG9jYXRpb24sIGhpZXJhcmNoeSkge1xuICAgICAgICByZXR1cm4gY2hlY2tQcm9wVHlwZXMoXG4gICAgICAgICAgdHlwZVNwZWNzLFxuICAgICAgICAgIHZhbHVlcyxcbiAgICAgICAgICBsb2NhdGlvbixcbiAgICAgICAgICBkaXNwbGF5TmFtZU9mTm9kZShjYWNoZWROb2RlKSxcbiAgICAgICAgICAoKSA9PiBnZXRDb21wb25lbnRTdGFjayhoaWVyYXJjaHkuY29uY2F0KFtjYWNoZWROb2RlXSkpLFxuICAgICAgICApO1xuICAgICAgfSxcbiAgICB9O1xuICB9XG5cbiAgY3JlYXRlU3RyaW5nUmVuZGVyZXIob3B0aW9ucykge1xuICAgIGlmIChoYXMob3B0aW9ucywgJ3N1c3BlbnNlRmFsbGJhY2snKSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignYHN1c3BlbnNlRmFsbGJhY2tgIHNob3VsZCBub3QgYmUgc3BlY2lmaWVkIGluIG9wdGlvbnMgb2Ygc3RyaW5nIHJlbmRlcmVyJyk7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICByZW5kZXIoZWwsIGNvbnRleHQpIHtcbiAgICAgICAgaWYgKG9wdGlvbnMuY29udGV4dCAmJiAoZWwudHlwZS5jb250ZXh0VHlwZXMgfHwgb3B0aW9ucy5jaGlsZENvbnRleHRUeXBlcykpIHtcbiAgICAgICAgICBjb25zdCBjaGlsZENvbnRleHRUeXBlcyA9IHtcbiAgICAgICAgICAgIC4uLihlbC50eXBlLmNvbnRleHRUeXBlcyB8fCB7fSksXG4gICAgICAgICAgICAuLi5vcHRpb25zLmNoaWxkQ29udGV4dFR5cGVzLFxuICAgICAgICAgIH07XG4gICAgICAgICAgY29uc3QgQ29udGV4dFdyYXBwZXIgPSBjcmVhdGVSZW5kZXJXcmFwcGVyKGVsLCBjb250ZXh0LCBjaGlsZENvbnRleHRUeXBlcyk7XG4gICAgICAgICAgcmV0dXJuIFJlYWN0RE9NU2VydmVyLnJlbmRlclRvU3RhdGljTWFya3VwKFJlYWN0LmNyZWF0ZUVsZW1lbnQoQ29udGV4dFdyYXBwZXIpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gUmVhY3RET01TZXJ2ZXIucmVuZGVyVG9TdGF0aWNNYXJrdXAoZWwpO1xuICAgICAgfSxcbiAgICB9O1xuICB9XG5cbiAgLy8gUHJvdmlkZWQgYSBiYWcgb2Ygb3B0aW9ucywgcmV0dXJuIGFuIGBFbnp5bWVSZW5kZXJlcmAuIFNvbWUgb3B0aW9ucyBjYW4gYmUgaW1wbGVtZW50YXRpb25cbiAgLy8gc3BlY2lmaWMsIGxpa2UgYGF0dGFjaGAgZXRjLiBmb3IgUmVhY3QsIGJ1dCBub3QgcGFydCBvZiB0aGlzIGludGVyZmFjZSBleHBsaWNpdGx5LlxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY2xhc3MtbWV0aG9kcy11c2UtdGhpc1xuICBjcmVhdGVSZW5kZXJlcihvcHRpb25zKSB7XG4gICAgc3dpdGNoIChvcHRpb25zLm1vZGUpIHtcbiAgICAgIGNhc2UgRW56eW1lQWRhcHRlci5NT0RFUy5NT1VOVDogcmV0dXJuIHRoaXMuY3JlYXRlTW91bnRSZW5kZXJlcihvcHRpb25zKTtcbiAgICAgIGNhc2UgRW56eW1lQWRhcHRlci5NT0RFUy5TSEFMTE9XOiByZXR1cm4gdGhpcy5jcmVhdGVTaGFsbG93UmVuZGVyZXIob3B0aW9ucyk7XG4gICAgICBjYXNlIEVuenltZUFkYXB0ZXIuTU9ERVMuU1RSSU5HOiByZXR1cm4gdGhpcy5jcmVhdGVTdHJpbmdSZW5kZXJlcihvcHRpb25zKTtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgRW56eW1lIEludGVybmFsIEVycm9yOiBVbnJlY29nbml6ZWQgbW9kZTogJHtvcHRpb25zLm1vZGV9YCk7XG4gICAgfVxuICB9XG5cbiAgd3JhcChlbGVtZW50KSB7XG4gICAgcmV0dXJuIHdyYXAoZWxlbWVudCk7XG4gIH1cblxuICAvLyBjb252ZXJ0cyBhbiBSU1ROb2RlIHRvIHRoZSBjb3JyZXNwb25kaW5nIEpTWCBQcmFnbWEgRWxlbWVudC4gVGhpcyB3aWxsIGJlIG5lZWRlZFxuICAvLyBpbiBvcmRlciB0byBpbXBsZW1lbnQgdGhlIGBXcmFwcGVyLm1vdW50KClgIGFuZCBgV3JhcHBlci5zaGFsbG93KClgIG1ldGhvZHMsIGJ1dCBzaG91bGRcbiAgLy8gYmUgcHJldHR5IHN0cmFpZ2h0Zm9yd2FyZCBmb3IgcGVvcGxlIHRvIGltcGxlbWVudC5cbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGNsYXNzLW1ldGhvZHMtdXNlLXRoaXNcbiAgbm9kZVRvRWxlbWVudChub2RlKSB7XG4gICAgaWYgKCFub2RlIHx8IHR5cGVvZiBub2RlICE9PSAnb2JqZWN0JykgcmV0dXJuIG51bGw7XG4gICAgY29uc3QgeyB0eXBlIH0gPSBub2RlO1xuICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KHVubWVtb1R5cGUodHlwZSksIHByb3BzV2l0aEtleXNBbmRSZWYobm9kZSkpO1xuICB9XG5cbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGNsYXNzLW1ldGhvZHMtdXNlLXRoaXNcbiAgbWF0Y2hlc0VsZW1lbnRUeXBlKG5vZGUsIG1hdGNoaW5nVHlwZSkge1xuICAgIGlmICghbm9kZSkge1xuICAgICAgcmV0dXJuIG5vZGU7XG4gICAgfVxuICAgIGNvbnN0IHsgdHlwZSB9ID0gbm9kZTtcbiAgICByZXR1cm4gdW5tZW1vVHlwZSh0eXBlKSA9PT0gdW5tZW1vVHlwZShtYXRjaGluZ1R5cGUpO1xuICB9XG5cbiAgZWxlbWVudFRvTm9kZShlbGVtZW50KSB7XG4gICAgcmV0dXJuIGVsZW1lbnRUb1RyZWUoZWxlbWVudCk7XG4gIH1cblxuICBub2RlVG9Ib3N0Tm9kZShub2RlLCBzdXBwb3J0c0FycmF5ID0gZmFsc2UpIHtcbiAgICBjb25zdCBub2RlcyA9IG5vZGVUb0hvc3ROb2RlKG5vZGUpO1xuICAgIGlmIChBcnJheS5pc0FycmF5KG5vZGVzKSAmJiAhc3VwcG9ydHNBcnJheSkge1xuICAgICAgcmV0dXJuIG5vZGVzWzBdO1xuICAgIH1cbiAgICByZXR1cm4gbm9kZXM7XG4gIH1cblxuICBkaXNwbGF5TmFtZU9mTm9kZShub2RlKSB7XG4gICAgaWYgKCFub2RlKSByZXR1cm4gbnVsbDtcbiAgICBjb25zdCB7IHR5cGUsICQkdHlwZW9mIH0gPSBub2RlO1xuXG4gICAgY29uc3Qgbm9kZVR5cGUgPSB0eXBlIHx8ICQkdHlwZW9mO1xuXG4gICAgLy8gbmV3ZXIgbm9kZSB0eXBlcyBtYXkgYmUgdW5kZWZpbmVkLCBzbyBvbmx5IHRlc3QgaWYgdGhlIG5vZGVUeXBlIGV4aXN0c1xuICAgIGlmIChub2RlVHlwZSkge1xuICAgICAgc3dpdGNoIChub2RlVHlwZSkge1xuICAgICAgICBjYXNlIChpczE2NiA/IENvbmN1cnJlbnRNb2RlIDogQXN5bmNNb2RlKSB8fCBOYU46IHJldHVybiBpczE2NiA/ICdDb25jdXJyZW50TW9kZScgOiAnQXN5bmNNb2RlJztcbiAgICAgICAgY2FzZSBGcmFnbWVudCB8fCBOYU46IHJldHVybiAnRnJhZ21lbnQnO1xuICAgICAgICBjYXNlIFN0cmljdE1vZGUgfHwgTmFOOiByZXR1cm4gJ1N0cmljdE1vZGUnO1xuICAgICAgICBjYXNlIFByb2ZpbGVyIHx8IE5hTjogcmV0dXJuICdQcm9maWxlcic7XG4gICAgICAgIGNhc2UgUG9ydGFsIHx8IE5hTjogcmV0dXJuICdQb3J0YWwnO1xuICAgICAgICBjYXNlIFN1c3BlbnNlIHx8IE5hTjogcmV0dXJuICdTdXNwZW5zZSc7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgJCR0eXBlb2ZUeXBlID0gdHlwZSAmJiB0eXBlLiQkdHlwZW9mO1xuXG4gICAgc3dpdGNoICgkJHR5cGVvZlR5cGUpIHtcbiAgICAgIGNhc2UgQ29udGV4dENvbnN1bWVyIHx8IE5hTjogcmV0dXJuICdDb250ZXh0Q29uc3VtZXInO1xuICAgICAgY2FzZSBDb250ZXh0UHJvdmlkZXIgfHwgTmFOOiByZXR1cm4gJ0NvbnRleHRQcm92aWRlcic7XG4gICAgICBjYXNlIE1lbW8gfHwgTmFOOiB7XG4gICAgICAgIGNvbnN0IG5vZGVOYW1lID0gZGlzcGxheU5hbWVPZk5vZGUobm9kZSk7XG4gICAgICAgIHJldHVybiB0eXBlb2Ygbm9kZU5hbWUgPT09ICdzdHJpbmcnID8gbm9kZU5hbWUgOiBgTWVtbygke2Rpc3BsYXlOYW1lT2ZOb2RlKHR5cGUpfSlgO1xuICAgICAgfVxuICAgICAgY2FzZSBGb3J3YXJkUmVmIHx8IE5hTjoge1xuICAgICAgICBpZiAodHlwZS5kaXNwbGF5TmFtZSkge1xuICAgICAgICAgIHJldHVybiB0eXBlLmRpc3BsYXlOYW1lO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG5hbWUgPSBkaXNwbGF5TmFtZU9mTm9kZSh7IHR5cGU6IHR5cGUucmVuZGVyIH0pO1xuICAgICAgICByZXR1cm4gbmFtZSA/IGBGb3J3YXJkUmVmKCR7bmFtZX0pYCA6ICdGb3J3YXJkUmVmJztcbiAgICAgIH1cbiAgICAgIGNhc2UgTGF6eSB8fCBOYU46IHtcbiAgICAgICAgcmV0dXJuICdsYXp5JztcbiAgICAgIH1cbiAgICAgIGRlZmF1bHQ6IHJldHVybiBkaXNwbGF5TmFtZU9mTm9kZShub2RlKTtcbiAgICB9XG4gIH1cblxuICBpc1ZhbGlkRWxlbWVudChlbGVtZW50KSB7XG4gICAgcmV0dXJuIGlzRWxlbWVudChlbGVtZW50KTtcbiAgfVxuXG4gIGlzVmFsaWRFbGVtZW50VHlwZShvYmplY3QpIHtcbiAgICByZXR1cm4gISFvYmplY3QgJiYgaXNWYWxpZEVsZW1lbnRUeXBlKG9iamVjdCk7XG4gIH1cblxuICBpc0ZyYWdtZW50KGZyYWdtZW50KSB7XG4gICAgcmV0dXJuIHR5cGVPZk5vZGUoZnJhZ21lbnQpID09PSBGcmFnbWVudDtcbiAgfVxuXG4gIGlzQ3VzdG9tQ29tcG9uZW50KHR5cGUpIHtcbiAgICBjb25zdCBmYWtlRWxlbWVudCA9IG1ha2VGYWtlRWxlbWVudCh0eXBlKTtcbiAgICByZXR1cm4gISF0eXBlICYmIChcbiAgICAgIHR5cGVvZiB0eXBlID09PSAnZnVuY3Rpb24nXG4gICAgICB8fCBpc0ZvcndhcmRSZWYoZmFrZUVsZW1lbnQpXG4gICAgICB8fCBpc0NvbnRleHRQcm92aWRlcihmYWtlRWxlbWVudClcbiAgICAgIHx8IGlzQ29udGV4dENvbnN1bWVyKGZha2VFbGVtZW50KVxuICAgICAgfHwgaXNTdXNwZW5zZShmYWtlRWxlbWVudClcbiAgICApO1xuICB9XG5cbiAgaXNDb250ZXh0Q29uc3VtZXIodHlwZSkge1xuICAgIHJldHVybiAhIXR5cGUgJiYgaXNDb250ZXh0Q29uc3VtZXIobWFrZUZha2VFbGVtZW50KHR5cGUpKTtcbiAgfVxuXG4gIGlzQ3VzdG9tQ29tcG9uZW50RWxlbWVudChpbnN0KSB7XG4gICAgaWYgKCFpbnN0IHx8ICF0aGlzLmlzVmFsaWRFbGVtZW50KGluc3QpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmlzQ3VzdG9tQ29tcG9uZW50KGluc3QudHlwZSk7XG4gIH1cblxuICBnZXRQcm92aWRlckZyb21Db25zdW1lcihDb25zdW1lcikge1xuICAgIC8vIFJlYWN0IHN0b3JlcyByZWZlcmVuY2VzIHRvIHRoZSBQcm92aWRlciBvbiBhIENvbnN1bWVyIGRpZmZlcmVudGx5IGFjcm9zcyB2ZXJzaW9ucy5cbiAgICBpZiAoQ29uc3VtZXIpIHtcbiAgICAgIGxldCBQcm92aWRlcjtcbiAgICAgIGlmIChDb25zdW1lci5fY29udGV4dCkgeyAvLyBjaGVjayB0aGlzIGZpcnN0LCB0byBhdm9pZCBhIGRlcHJlY2F0aW9uIHdhcm5pbmdcbiAgICAgICAgKHsgUHJvdmlkZXIgfSA9IENvbnN1bWVyLl9jb250ZXh0KTtcbiAgICAgIH0gZWxzZSBpZiAoQ29uc3VtZXIuUHJvdmlkZXIpIHtcbiAgICAgICAgKHsgUHJvdmlkZXIgfSA9IENvbnN1bWVyKTtcbiAgICAgIH1cbiAgICAgIGlmIChQcm92aWRlcikge1xuICAgICAgICByZXR1cm4gUHJvdmlkZXI7XG4gICAgICB9XG4gICAgfVxuICAgIHRocm93IG5ldyBFcnJvcignRW56eW1lIEludGVybmFsIEVycm9yOiBjYW7igJl0IGZpZ3VyZSBvdXQgaG93IHRvIGdldCBQcm92aWRlciBmcm9tIENvbnN1bWVyJyk7XG4gIH1cblxuICBjcmVhdGVFbGVtZW50KC4uLmFyZ3MpIHtcbiAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudCguLi5hcmdzKTtcbiAgfVxuXG4gIHdyYXBXaXRoV3JhcHBpbmdDb21wb25lbnQobm9kZSwgb3B0aW9ucykge1xuICAgIHJldHVybiB7XG4gICAgICBSb290RmluZGVyLFxuICAgICAgbm9kZTogd3JhcFdpdGhXcmFwcGluZ0NvbXBvbmVudChSZWFjdC5jcmVhdGVFbGVtZW50LCBub2RlLCBvcHRpb25zKSxcbiAgICB9O1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3RTaXh0ZWVuQWRhcHRlcjtcbiJdfQ==
//# sourceMappingURL=ReactSixteenAdapter.js.map