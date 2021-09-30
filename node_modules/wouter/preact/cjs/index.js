'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var preact = require('preact');
var hooks = require('preact/hooks');
var useLocation$1 = require('./use-location.js');
var matcher = require('./matcher.js');

/*
 * Part 1, Hooks API: useRouter, useRoute and useLocation
 */

// one of the coolest features of `createContext`:
// when no value is provided — default object is used.
// allows us to use the router context as a global ref to store
// the implicitly created router (see `useRouter` below)
const RouterCtx = preact.createContext({});

const buildRouter = ({
  hook = useLocation$1.default,
  base = "",
  matcher: matcher$1 = matcher.default()
} = {}) => ({ hook, base, matcher: matcher$1 });

const useRouter = () => {
  const globalRef = hooks.useContext(RouterCtx);

  // either obtain the router from the outer context (provided by the
  // `<Router /> component) or create an implicit one on demand.
  return globalRef.v || (globalRef.v = buildRouter());
};

const useLocation = () => {
  const router = useRouter();
  return router.hook(router);
};

const useRoute = pattern => {
  const [path] = useLocation();
  return useRouter().matcher(pattern, path);
};

/*
 * Part 2, Low Carb Router API: Router, Route, Link, Switch
 */

const Router = props => {
  const ref = hooks.useRef(null);

  // this little trick allows to avoid having unnecessary
  // calls to potentially expensive `buildRouter` method.
  // https://reactjs.org/docs/hooks-faq.html#how-to-create-expensive-objects-lazily
  const value = ref.current || (ref.current = { v: buildRouter(props) });

  return preact.createElement(RouterCtx.Provider, {
    value: value,
    children: props.children
  });
};

const Route = ({ path, match, component, children }) => {
  const useRouteMatch = useRoute(path);

  // `props.match` is present - Route is controlled by the Switch
  const [matches, params] = match || useRouteMatch;

  if (!matches) return null;

  // React-Router style `component` prop
  if (component) return preact.createElement(component, { params });

  // support render prop or plain children
  return typeof children === "function" ? children(params) : children;
};

const Link = props => {
  const [, navigate] = useLocation();
  const { base } = useRouter();

  const href = props.href || props.to;
  const { children, onClick } = props;

  const handleClick = hooks.useCallback(
    event => {
      // ignores the navigation when clicked using right mouse button or
      // by holding a special modifier key: ctrl, command, win, alt, shift
      if (
        event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        event.shiftKey ||
        event.button !== 0
      )
        return;

      event.preventDefault();
      navigate(href);
      onClick && onClick(event);
    },
    [href, onClick, navigate]
  );

  // wraps children in `a` if needed
  const extraProps = { href: base + href, onClick: handleClick, to: null };
  const jsx = preact.isValidElement(children) ? children : preact.createElement("a", props);

  return preact.cloneElement(jsx, extraProps);
};

const Switch = ({ children, location }) => {
  const { matcher } = useRouter();
  const [originalLocation] = useLocation();

  children = Array.isArray(children) ? children : [children];

  for (const element of children) {
    let match = 0;

    if (
      preact.isValidElement(element) &&
      // we don't require an element to be of type Route,
      // but we do require it to contain a truthy `path` prop.
      // this allows to use different components that wrap Route
      // inside of a switch, for example <AnimatedRoute />.
      element.props.path &&
      (match = matcher(element.props.path, location || originalLocation))[0]
    )
      return preact.cloneElement(element, { match });
  }

  return null;
};

const Redirect = props => {
  const [, push] = useLocation();
  hooks.useLayoutEffect(() => {
    push(props.href || props.to);

    // we pass an empty array of dependecies to ensure that
    // we only run the effect once after initial render
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
};

exports.Link = Link;
exports.Redirect = Redirect;
exports.Route = Route;
exports.Router = Router;
exports.Switch = Switch;
exports.default = useRoute;
exports.useLocation = useLocation;
exports.useRoute = useRoute;
exports.useRouter = useRouter;
