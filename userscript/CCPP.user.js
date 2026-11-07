// ==UserScript==
// @name         CC++
// @namespace    https://github.com/0-V-linuxdo/CCPP
// @version      20261108.0.4.0
// @description  Everything-is-a-plugin enhancements for claude.ai: usage meter, chat outline, starred messages, prompt history, notifications and more.
// @author       CC++ Contributors
// @license      GPL-3.0-or-later
// @homepageURL  https://github.com/0-V-linuxdo/CCPP
// @supportURL   https://github.com/0-V-linuxdo/CCPP/issues
// @updateURL    https://raw.githubusercontent.com/0-V-linuxdo/CCPP/main/userscript/CCPP.meta.js
// @downloadURL  https://raw.githubusercontent.com/0-V-linuxdo/CCPP/main/userscript/CCPP.user.js
// @match        https://claude.ai/*
// @run-at       document-start
// @inject-into  auto
// @sandbox      JavaScript
// @noframes
// @grant        unsafeWindow
// @grant        GM_addValueChangeListener
// @grant        GM_deleteValue
// @grant        GM_getValue
// @grant        GM_info
// @grant        GM_notification
// @grant        GM_registerMenuCommand
// @grant        GM_removeValueChangeListener
// @grant        GM_setClipboard
// @grant        GM_setValue
// @grant        GM_unregisterMenuCommand
// @grant        GM_xmlhttpRequest
// @grant        GM.setClipboard
// @grant        GM.notification
// @connect      *
// ==/UserScript==

"use strict";
(() => {
  var __defProp = Object.defineProperty;
  var __export = (target2, all) => {
    for (var name in all)
      __defProp(target2, name, { get: all[name], enumerable: true });
  };

  // <define:__USPP_CHANGELOG__>
  var define_USPP_CHANGELOG_default = [];

  // <define:__USPP_CONNECT__>
  var define_USPP_CONNECT_default = ["*"];

  // <define:__USPP_SCRIPT__>
  var define_USPP_SCRIPT_default = { id: "ccpp", name: "CC++", global: null, supportURL: "https://github.com/0-V-linuxdo/CCPP/issues" };

  // <define:__USPP_SITES__>
  var define_USPP_SITES_default = ["claude"];

  // <define:__USPP_UPDATE__>
  var define_USPP_UPDATE_default = { meta: "https://raw.githubusercontent.com/0-V-linuxdo/CCPP/main/userscript/CCPP.meta.js", download: "https://raw.githubusercontent.com/0-V-linuxdo/CCPP/main/userscript/CCPP.user.js" };

  // node_modules/preact/compat/dist/compat.module.js
  var compat_module_exports = {};
  __export(compat_module_exports, {
    Children: () => L2,
    Component: () => C,
    Fragment: () => S,
    PureComponent: () => M2,
    StrictMode: () => S,
    Suspense: () => P3,
    SuspenseList: () => B3,
    __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: () => an,
    cloneElement: () => mn,
    createContext: () => X,
    createElement: () => k,
    createFactory: () => sn,
    createPortal: () => $2,
    createRef: () => M,
    default: () => gn,
    findDOMNode: () => yn,
    flushSync: () => bn,
    forwardRef: () => D3,
    hydrate: () => tn,
    isElement: () => Sn,
    isFragment: () => vn,
    isMemo: () => dn,
    isValidElement: () => hn,
    lazy: () => z3,
    memo: () => N2,
    render: () => nn,
    startTransition: () => x3,
    unmountComponentAtNode: () => pn,
    unstable_batchedUpdates: () => _n,
    useCallback: () => q2,
    useContext: () => x2,
    useDebugValue: () => P2,
    useDeferredValue: () => w3,
    useEffect: () => h3,
    useErrorBoundary: () => b2,
    useId: () => g2,
    useImperativeHandle: () => F2,
    useInsertionEffect: () => I2,
    useLayoutEffect: () => _2,
    useMemo: () => T2,
    useReducer: () => y2,
    useRef: () => A2,
    useState: () => d2,
    useSyncExternalStore: () => C3,
    useTransition: () => k3,
    version: () => cn
  });

  // node_modules/preact/dist/preact.module.js
  var n;
  var l;
  var u;
  var t;
  var i;
  var r;
  var o;
  var e;
  var f;
  var c;
  var a;
  var s;
  var h2;
  var p;
  var v;
  var y;
  var d = {};
  var w = [];
  var _ = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;
  var g = Array.isArray;
  function m(n2, l3) {
    for (var u3 in l3) n2[u3] = l3[u3];
    return n2;
  }
  function b(n2) {
    n2 && n2.parentNode && n2.parentNode.removeChild(n2);
  }
  function k(l3, u3, t4) {
    var i3, r3, o3, e3 = {};
    for (o3 in u3) "key" == o3 ? i3 = u3[o3] : "ref" == o3 ? r3 = u3[o3] : e3[o3] = u3[o3];
    if (arguments.length > 2 && (e3.children = arguments.length > 3 ? n.call(arguments, 2) : t4), "function" == typeof l3 && null != l3.defaultProps) for (o3 in l3.defaultProps) void 0 === e3[o3] && (e3[o3] = l3.defaultProps[o3]);
    return x(l3, e3, i3, r3, null);
  }
  function x(n2, t4, i3, r3, o3) {
    var e3 = { type: n2, props: t4, key: i3, ref: r3, __k: null, __: null, __b: 0, __e: null, __c: null, constructor: void 0, __v: null == o3 ? ++u : o3, __i: -1, __u: 0 };
    return null == o3 && null != l.vnode && l.vnode(e3), e3;
  }
  function M() {
    return { current: null };
  }
  function S(n2) {
    return n2.children;
  }
  function C(n2, l3) {
    this.props = n2, this.context = l3;
  }
  function $(n2, l3) {
    if (null == l3) return n2.__ ? $(n2.__, n2.__i + 1) : null;
    for (var u3; l3 < n2.__k.length; l3++) if (null != (u3 = n2.__k[l3]) && null != u3.__e) return u3.__e;
    return "function" == typeof n2.type ? $(n2) : null;
  }
  function I(n2) {
    if (n2.__P && n2.__d) {
      var u3 = n2.__v, t4 = u3.__e, i3 = [], r3 = [], o3 = m({}, u3);
      o3.__v = u3.__v + 1, l.vnode && l.vnode(o3), q(n2.__P, o3, u3, n2.__n, n2.__P.namespaceURI, 32 & u3.__u ? [t4] : null, i3, null == t4 ? $(u3) : t4, !!(32 & u3.__u), r3), o3.__v = u3.__v, o3.__.__k[o3.__i] = o3, D(i3, o3, r3), u3.__e = u3.__ = null, o3.__e != t4 && P(o3);
    }
  }
  function P(n2) {
    if (null != (n2 = n2.__) && null != n2.__c) return n2.__e = n2.__c.base = null, n2.__k.some(function(l3) {
      if (null != l3 && null != l3.__e) return n2.__e = n2.__c.base = l3.__e;
    }), P(n2);
  }
  function A(n2) {
    (!n2.__d && (n2.__d = true) && i.push(n2) && !H.__r++ || r != l.debounceRendering) && ((r = l.debounceRendering) || o)(H);
  }
  function H() {
    try {
      for (var n2, l3 = 1; i.length; ) i.length > l3 && i.sort(e), n2 = i.shift(), l3 = i.length, I(n2);
    } finally {
      i.length = H.__r = 0;
    }
  }
  function L(n2, l3, u3, t4, i3, r3, o3, e3, f3, c4, a3) {
    var s3, h5, p4, v3, y3, _3, g5 = t4 && t4.__k || w, m3 = l3.length;
    for (f3 = T(u3, l3, g5, f3, m3), s3 = 0; s3 < m3; s3++) null != (p4 = u3.__k[s3]) && (h5 = -1 != p4.__i && g5[p4.__i] || d, p4.__i = s3, _3 = q(n2, p4, h5, i3, r3, o3, e3, f3, c4, a3), v3 = p4.__e, p4.ref && h5.ref != p4.ref && (h5.ref && J(h5.ref, null, p4), a3.push(p4.ref, p4.__c || v3, p4)), null == y3 && null != v3 && (y3 = v3), 4 & p4.__u ? (f3 = j(p4, f3, n2), h5.__e && (h5.__e = null)) : "function" == typeof p4.type && void 0 !== _3 ? f3 = _3 : v3 && (f3 = v3.nextSibling), p4.__u &= -7);
    return u3.__e = y3, f3;
  }
  function T(n2, l3, u3, t4, i3) {
    var r3, o3, e3, f3, c4, a3 = u3.length, s3 = a3, h5 = 0;
    for (n2.__k = new Array(i3), r3 = 0; r3 < i3; r3++) null != (o3 = l3[r3]) && "boolean" != typeof o3 && "function" != typeof o3 ? ("string" == typeof o3 || "number" == typeof o3 || "bigint" == typeof o3 || o3.constructor == String ? o3 = n2.__k[r3] = x(null, o3, null, null, null) : g(o3) ? o3 = n2.__k[r3] = x(S, { children: o3 }, null, null, null) : void 0 === o3.constructor && o3.__b > 0 ? o3 = n2.__k[r3] = x(o3.type, o3.props, o3.key, o3.ref ? o3.ref : null, o3.__v) : n2.__k[r3] = o3, f3 = r3 + h5, o3.__ = n2, o3.__b = n2.__b + 1, e3 = null, -1 != (c4 = o3.__i = O(o3, u3, f3, s3)) && (s3--, (e3 = u3[c4]) && (e3.__u |= 2)), null == e3 || null == e3.__v ? (-1 == c4 && (i3 > a3 ? h5-- : i3 < a3 && h5++), "function" != typeof o3.type && (o3.__u |= 4)) : c4 != f3 && (c4 == f3 - 1 ? h5-- : c4 == f3 + 1 ? h5++ : (c4 > f3 ? h5-- : h5++, o3.__u |= 4))) : n2.__k[r3] = null;
    if (s3) for (r3 = 0; r3 < a3; r3++) null != (e3 = u3[r3]) && 0 == (2 & e3.__u) && (e3.__e == t4 && (t4 = $(e3)), K(e3, e3));
    return t4;
  }
  function j(n2, l3, u3) {
    var t4, i3;
    if ("function" == typeof n2.type) {
      for (t4 = n2.__k, i3 = 0; t4 && i3 < t4.length; i3++) t4[i3] && (t4[i3].__ = n2, l3 = j(t4[i3], l3, u3));
      return l3;
    }
    n2.__e != l3 && (l3 && n2.type && !l3.parentNode && (l3 = $(n2)), l3 = u3.insertBefore(n2.__e, l3 || null));
    do {
      l3 = l3 && l3.nextSibling;
    } while (null != l3 && 8 == l3.nodeType);
    return l3;
  }
  function F(n2, l3) {
    return l3 = l3 || [], null == n2 || "boolean" == typeof n2 || (g(n2) ? n2.some(function(n3) {
      F(n3, l3);
    }) : l3.push(n2)), l3;
  }
  function O(n2, l3, u3, t4) {
    var i3, r3, o3, e3 = n2.key, f3 = n2.type, c4 = l3[u3], a3 = null != c4 && 0 == (2 & c4.__u);
    if (null === c4 && null == e3 || a3 && e3 == c4.key && f3 == c4.type) return u3;
    if (t4 > (a3 ? 1 : 0)) {
      for (i3 = u3 - 1, r3 = u3 + 1; i3 >= 0 || r3 < l3.length; ) if (null != (c4 = l3[o3 = i3 >= 0 ? i3-- : r3++]) && 0 == (2 & c4.__u) && e3 == c4.key && f3 == c4.type) return o3;
    }
    return -1;
  }
  function z(n2, l3, u3) {
    "-" == l3[0] ? n2.setProperty(l3, null == u3 ? "" : u3) : n2[l3] = null == u3 ? "" : "number" != typeof u3 || _.test(l3) ? u3 : u3 + "px";
  }
  function N(n2, l3, u3, t4, i3) {
    var r3, o3;
    n: if ("style" == l3) if ("string" == typeof u3) n2.style.cssText = u3;
    else {
      if ("string" == typeof t4 && (n2.style.cssText = t4 = ""), t4) for (l3 in t4) u3 && l3 in u3 || z(n2.style, l3, "");
      if (u3) for (l3 in u3) t4 && u3[l3] == t4[l3] || z(n2.style, l3, u3[l3]);
    }
    else if ("o" == l3[0] && "n" == l3[1]) r3 = l3 != (l3 = l3.replace(s, "$1")), o3 = l3.toLowerCase(), l3 = o3 in n2 || "onFocusOut" == l3 || "onFocusIn" == l3 ? o3.slice(2) : l3.slice(2), n2.l || (n2.l = {}), n2.l[l3 + r3] = u3, u3 ? t4 ? u3[a] = t4[a] : (u3[a] = h2, n2.addEventListener(l3, r3 ? v : p, r3)) : n2.removeEventListener(l3, r3 ? v : p, r3);
    else {
      if ("http://www.w3.org/2000/svg" == i3) l3 = l3.replace(/xlink(H|:h)/, "h").replace(/sName$/, "s");
      else if ("width" != l3 && "height" != l3 && "href" != l3 && "list" != l3 && "form" != l3 && "tabIndex" != l3 && "download" != l3 && "rowSpan" != l3 && "colSpan" != l3 && "role" != l3 && "popover" != l3 && l3 in n2) try {
        n2[l3] = null == u3 ? "" : u3;
        break n;
      } catch (n3) {
      }
      "function" == typeof u3 || (null == u3 || false === u3 && "-" != l3[4] ? n2.removeAttribute(l3) : n2.setAttribute(l3, "popover" == l3 && 1 == u3 ? "" : u3));
    }
  }
  function V(n2) {
    return function(u3) {
      if (this.l) {
        var t4 = this.l[u3.type + n2];
        if (null == u3[c]) u3[c] = h2++;
        else if (u3[c] < t4[a]) return;
        return t4(l.event ? l.event(u3) : u3);
      }
    };
  }
  function q(n2, u3, t4, i3, r3, o3, e3, f3, c4, a3) {
    var s3, h5, p4, v3, y3, d3, _3, k4, x4, M3, I3, P4, A4, H3, T4, j4, F4 = u3.type;
    if (void 0 !== u3.constructor) return null;
    128 & t4.__u && (c4 = !!(32 & t4.__u), o3 = [f3 = u3.__e = t4.__e]), (s3 = l.__b) && s3(u3);
    n: if ("function" == typeof F4) {
      h5 = e3.length;
      try {
        if (x4 = u3.props, M3 = F4.prototype && F4.prototype.render, I3 = (s3 = F4.contextType) && i3[s3.__c], P4 = s3 ? I3 ? I3.props.value : s3.__ : i3, t4.__c ? k4 = (p4 = u3.__c = t4.__c).__ = p4.__E : (M3 ? u3.__c = p4 = new F4(x4, P4) : (u3.__c = p4 = new C(x4, P4), p4.constructor = F4, p4.render = Q), I3 && I3.sub(p4), p4.state || (p4.state = {}), p4.__n = i3, v3 = p4.__d = true, p4.__h = [], p4._sb = []), M3 && null == p4.__s && (p4.__s = p4.state), M3 && null != F4.getDerivedStateFromProps && (p4.__s == p4.state && (p4.__s = m({}, p4.__s)), m(p4.__s, F4.getDerivedStateFromProps(x4, p4.__s))), y3 = p4.props, d3 = p4.state, p4.__v = u3, v3) M3 && null == F4.getDerivedStateFromProps && null != p4.componentWillMount && p4.componentWillMount(), M3 && null != p4.componentDidMount && p4.__h.push(p4.componentDidMount);
        else {
          if (M3 && null == F4.getDerivedStateFromProps && x4 !== y3 && null != p4.componentWillReceiveProps && p4.componentWillReceiveProps(x4, P4), u3.__v == t4.__v || !p4.__e && null != p4.shouldComponentUpdate && false === p4.shouldComponentUpdate(x4, p4.__s, P4)) {
            u3.__v != t4.__v && (p4.props = x4, p4.state = p4.__s, p4.__d = false), u3.__e = t4.__e, u3.__k = t4.__k, u3.__k.some(function(n3) {
              n3 && (n3.__ = u3);
            }), w.push.apply(p4.__h, p4._sb), p4._sb = [], p4.__h.length && e3.push(p4), f3 = $(t4);
            break n;
          }
          null != p4.componentWillUpdate && p4.componentWillUpdate(x4, p4.__s, P4), M3 && null != p4.componentDidUpdate && p4.__h.push(function() {
            p4.componentDidUpdate(y3, d3, _3);
          });
        }
        if (p4.context = P4, p4.props = x4, p4.__P = n2, p4.__e = false, A4 = l.__r, H3 = 0, M3) p4.state = p4.__s, p4.__d = false, A4 && A4(u3), s3 = p4.render(p4.props, p4.state, p4.context), w.push.apply(p4.__h, p4._sb), p4._sb = [];
        else do {
          p4.__d = false, A4 && A4(u3), s3 = p4.render(p4.props, p4.state, p4.context), p4.state = p4.__s;
        } while (p4.__d && ++H3 < 25);
        p4.state = p4.__s, null != p4.getChildContext && (i3 = m(m({}, i3), p4.getChildContext())), M3 && !v3 && null != p4.getSnapshotBeforeUpdate && (_3 = p4.getSnapshotBeforeUpdate(y3, d3)), T4 = null != s3 && s3.type === S && null == s3.key ? E(s3.props.children) : s3, f3 = L(n2, g(T4) ? T4 : [T4], u3, t4, i3, r3, o3, e3, f3, c4, a3), p4.base = u3.__e, u3.__u &= -161, p4.__h.length && e3.push(p4), k4 && (p4.__E = p4.__ = null);
      } catch (n3) {
        if (e3.length = h5, u3.__v = null, c4 || null != o3) {
          if (n3.then) {
            for (u3.__u |= c4 ? 160 : 128; f3 && 8 == f3.nodeType && f3.nextSibling; ) f3 = f3.nextSibling;
            null != o3 && (o3[o3.indexOf(f3)] = null), u3.__e = f3;
          } else if (null != o3) for (j4 = o3.length; j4--; ) b(o3[j4]);
        } else u3.__e = t4.__e;
        null == u3.__k && (u3.__k = t4.__k || []), n3.then || B(u3), l.__e(n3, u3, t4);
      }
    } else null == o3 && u3.__v == t4.__v ? (u3.__k = t4.__k, u3.__e = t4.__e) : f3 = u3.__e = G(t4.__e, u3, t4, i3, r3, o3, e3, c4, a3);
    return (s3 = l.diffed) && s3(u3), 128 & u3.__u ? void 0 : f3;
  }
  function B(n2) {
    n2 && (n2.__c && (n2.__c.__e = true), n2.__k && n2.__k.some(B));
  }
  function D(n2, u3, t4) {
    for (var i3 = 0; i3 < t4.length; i3++) J(t4[i3], t4[++i3], t4[++i3]);
    l.__c && l.__c(u3, n2), n2.some(function(u4) {
      try {
        n2 = u4.__h, u4.__h = [], n2.some(function(n3) {
          n3.call(u4);
        });
      } catch (n3) {
        l.__e(n3, u4.__v);
      }
    });
  }
  function E(n2) {
    return "object" != typeof n2 || null == n2 || n2.__b > 0 ? n2 : g(n2) ? n2.map(E) : void 0 !== n2.constructor ? null : m({}, n2);
  }
  function G(u3, t4, i3, r3, o3, e3, f3, c4, a3) {
    var s3, h5, p4, v3, y3, w4, _3, m3 = i3.props || d, k4 = t4.props, x4 = t4.type;
    if ("svg" == x4 ? o3 = "http://www.w3.org/2000/svg" : "math" == x4 ? o3 = "http://www.w3.org/1998/Math/MathML" : o3 || (o3 = "http://www.w3.org/1999/xhtml"), null != e3) {
      for (s3 = 0; s3 < e3.length; s3++) if ((y3 = e3[s3]) && "setAttribute" in y3 == !!x4 && (x4 ? y3.localName == x4 : 3 == y3.nodeType)) {
        u3 = y3, e3[s3] = null;
        break;
      }
    }
    if (null == u3) {
      if (null == x4) return document.createTextNode(k4);
      u3 = document.createElementNS(o3, x4, k4.is && k4), c4 && (l.__m && l.__m(t4, e3), c4 = false), e3 = null;
    }
    if (null == x4) m3 === k4 || c4 && u3.data == k4 || (u3.data = k4);
    else {
      if (e3 = "textarea" == x4 && null != k4.defaultValue ? null : e3 && n.call(u3.childNodes), !c4 && null != e3) for (m3 = {}, s3 = 0; s3 < u3.attributes.length; s3++) m3[(y3 = u3.attributes[s3]).name] = y3.value;
      for (s3 in m3) y3 = m3[s3], "dangerouslySetInnerHTML" == s3 ? p4 = y3 : "children" == s3 || s3 in k4 || "value" == s3 && "defaultValue" in k4 || "checked" == s3 && "defaultChecked" in k4 || N(u3, s3, null, y3, o3);
      for (s3 in k4) y3 = k4[s3], "children" == s3 ? v3 = y3 : "dangerouslySetInnerHTML" == s3 ? h5 = y3 : "value" == s3 ? w4 = y3 : "checked" == s3 ? _3 = y3 : c4 && "function" != typeof y3 || m3[s3] === y3 || N(u3, s3, y3, m3[s3], o3);
      if (h5) c4 || p4 && (h5.__html == p4.__html || h5.__html == u3.innerHTML) || (u3.innerHTML = h5.__html), t4.__k = [];
      else if (p4 && (u3.innerHTML = ""), L("template" == t4.type ? u3.content : u3, g(v3) ? v3 : [v3], t4, i3, r3, "foreignObject" == x4 ? "http://www.w3.org/1999/xhtml" : o3, e3, f3, e3 ? e3[0] : i3.__k && $(i3, 0), c4, a3), null != e3) for (s3 = e3.length; s3--; ) b(e3[s3]);
      c4 && "textarea" != x4 || (s3 = "value", "progress" == x4 && null == w4 ? u3.removeAttribute("value") : null != w4 && (w4 !== u3[s3] || "progress" == x4 && !w4 || "option" == x4 && w4 != m3[s3]) && N(u3, s3, w4, m3[s3], o3), s3 = "checked", null != _3 && _3 != u3[s3] && N(u3, s3, _3, m3[s3], o3));
    }
    return u3;
  }
  function J(n2, u3, t4) {
    try {
      if ("function" == typeof n2) {
        var i3 = "function" == typeof n2.__u;
        i3 && n2.__u(), i3 && null == u3 || (n2.__u = n2(u3));
      } else n2.current = u3;
    } catch (n3) {
      l.__e(n3, t4);
    }
  }
  function K(n2, u3, t4) {
    var i3, r3;
    if (l.unmount && l.unmount(n2), (i3 = n2.ref) && (i3.current && i3.current != n2.__e || J(i3, null, u3)), null != (i3 = n2.__c)) {
      if (i3.componentWillUnmount) try {
        i3.componentWillUnmount();
      } catch (n3) {
        l.__e(n3, u3);
      }
      i3.base = i3.__P = i3.__n = null;
    }
    if (i3 = n2.__k) for (r3 = 0; r3 < i3.length; r3++) i3[r3] && K(i3[r3], u3, t4 || "function" != typeof n2.type);
    t4 || b(n2.__e), n2.__c = n2.__ = n2.__e = void 0;
  }
  function Q(n2, l3, u3) {
    return this.constructor(n2, u3);
  }
  function R(u3, t4, i3) {
    var r3, o3, e3, f3;
    t4 == document && (t4 = document.documentElement), l.__ && l.__(u3, t4), o3 = (r3 = "function" == typeof i3) ? null : i3 && i3.__k || t4.__k, e3 = [], f3 = [], q(t4, u3 = (!r3 && i3 || t4).__k = k(S, null, [u3]), o3 || d, d, t4.namespaceURI, !r3 && i3 ? [i3] : o3 ? null : t4.firstChild ? n.call(t4.childNodes) : null, e3, !r3 && i3 ? i3 : o3 ? o3.__e : t4.firstChild, r3, f3), D(e3, u3, f3), u3.props.children = null;
  }
  function U(n2, l3) {
    R(n2, l3, U);
  }
  function W(l3, u3, t4) {
    var i3, r3, o3, e3, f3 = m({}, l3.props);
    for (o3 in l3.type && l3.type.defaultProps && (e3 = l3.type.defaultProps), u3) "key" == o3 ? i3 = u3[o3] : "ref" == o3 ? r3 = u3[o3] : f3[o3] = void 0 === u3[o3] && null != e3 ? e3[o3] : u3[o3];
    return arguments.length > 2 && (f3.children = arguments.length > 3 ? n.call(arguments, 2) : t4), x(l3.type, f3, i3 || l3.key, r3 || l3.ref, null);
  }
  function X(n2) {
    function l3(n3) {
      var u3, t4;
      return this.getChildContext || (u3 = /* @__PURE__ */ new Set(), (t4 = {})[l3.__c] = this, this.getChildContext = function() {
        return t4;
      }, this.componentWillUnmount = function() {
        u3 = null;
      }, this.shouldComponentUpdate = function(n4) {
        this.props.value != n4.value && u3.forEach(function(n5) {
          n5.__e = true, A(n5);
        });
      }, this.sub = function(n4) {
        u3.add(n4);
        var l4 = n4.componentWillUnmount;
        n4.componentWillUnmount = function() {
          u3 && u3.delete(n4), l4 && l4.call(n4);
        };
      }), n3.children;
    }
    return l3.__c = "__cC" + y++, l3.__ = n2, l3.Provider = l3.__l = (l3.Consumer = function(n3, l4) {
      return n3.children(l4);
    }).contextType = l3, l3;
  }
  n = w.slice, l = { __e: function(n2, l3, u3, t4) {
    for (var i3, r3, o3; l3 = l3.__; ) if ((i3 = l3.__c) && !i3.__) try {
      if ((r3 = i3.constructor) && null != r3.getDerivedStateFromError && (i3.setState(r3.getDerivedStateFromError(n2)), o3 = i3.__d), null != i3.componentDidCatch && (i3.componentDidCatch(n2, t4 || {}), o3 = i3.__d), o3) return i3.__E = i3;
    } catch (l4) {
      n2 = l4;
    }
    throw n2;
  } }, u = 0, t = function(n2) {
    return null != n2 && void 0 === n2.constructor;
  }, C.prototype.setState = function(n2, l3) {
    var u3;
    u3 = null != this.__s && this.__s != this.state ? this.__s : this.__s = m({}, this.state), "function" == typeof n2 && (n2 = n2(m({}, u3), this.props)), n2 && m(u3, n2), null != n2 && this.__v && (l3 && this._sb.push(l3), A(this));
  }, C.prototype.forceUpdate = function(n2) {
    this.__v && (this.__e = true, n2 && this.__h.push(n2), A(this));
  }, C.prototype.render = S, i = [], o = "function" == typeof Promise ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout, e = function(n2, l3) {
    return n2.__v.__b - l3.__v.__b;
  }, H.__r = 0, f = Math.random().toString(8), c = "__d" + f, a = "__a" + f, s = /(PointerCapture)$|Capture$/i, h2 = 0, p = V(false), v = V(true), y = 0;

  // node_modules/preact/hooks/dist/hooks.module.js
  var t2;
  var r2;
  var u2;
  var i2;
  var o2 = 0;
  var f2 = [];
  var c2 = l;
  var e2 = c2.__b;
  var a2 = c2.__r;
  var v2 = c2.diffed;
  var l2 = c2.__c;
  var m2 = c2.unmount;
  var p2 = c2.__;
  function s2(n2, t4) {
    c2.__h && c2.__h(r2, n2, o2 || t4), o2 = 0;
    var u3 = r2.__H || (r2.__H = { __: [], __h: [] });
    return n2 >= u3.__.length && u3.__.push({}), u3.__[n2];
  }
  function d2(n2) {
    return o2 = 1, y2(D2, n2);
  }
  function y2(n2, u3, i3) {
    var o3 = s2(t2++, 2);
    if (o3.t = n2, !o3.__c && (o3.__ = [i3 ? i3(u3) : D2(void 0, u3), function(n3) {
      var t4 = o3.__N ? o3.__N[0] : o3.__[0], r3 = o3.t(t4, n3);
      t4 !== r3 && (o3.__N = [r3, o3.__[1]], o3.__c.setState({}));
    }], o3.__c = r2, !r2.__f)) {
      var f3 = function(n3, t4, r3) {
        if (!o3.__c.__H) return true;
        var u4 = false, i4 = o3.__c.props !== n3;
        if (o3.__c.__H.__.some(function(n4) {
          if (n4.__N) {
            u4 = true;
            var t5 = n4.__[0];
            n4.__ = n4.__N, n4.__N = void 0, t5 !== n4.__[0] && (i4 = true);
          }
        }), c4) {
          var f4 = c4.call(this, n3, t4, r3);
          return u4 ? f4 || i4 : f4;
        }
        return !u4 || i4;
      };
      r2.__f = true;
      var c4 = r2.shouldComponentUpdate, e3 = r2.componentWillUpdate;
      r2.componentWillUpdate = function(n3, t4, r3) {
        if (this.__e) {
          var u4 = c4;
          c4 = void 0, f3(n3, t4, r3), c4 = u4;
        }
        e3 && e3.call(this, n3, t4, r3);
      }, r2.shouldComponentUpdate = f3;
    }
    return o3.__N || o3.__;
  }
  function h3(n2, u3) {
    var i3 = s2(t2++, 3);
    !c2.__s && C2(i3.__H, u3) && (i3.__ = n2, i3.u = u3, r2.__H.__h.push(i3));
  }
  function _2(n2, u3) {
    var i3 = s2(t2++, 4);
    !c2.__s && C2(i3.__H, u3) && (i3.__ = n2, i3.u = u3, r2.__h.push(i3));
  }
  function A2(n2) {
    return o2 = 5, T2(function() {
      return { current: n2 };
    }, []);
  }
  function F2(n2, t4, r3) {
    o2 = 6, _2(function() {
      if ("function" == typeof n2) {
        var r4 = n2(t4());
        return function() {
          n2(null), r4 && "function" == typeof r4 && r4();
        };
      }
      if (n2) return n2.current = t4(), function() {
        return n2.current = null;
      };
    }, null == r3 ? r3 : r3.concat(n2));
  }
  function T2(n2, r3) {
    var u3 = s2(t2++, 7);
    return C2(u3.__H, r3) && (u3.__ = n2(), u3.__H = r3, u3.__h = n2), u3.__;
  }
  function q2(n2, t4) {
    return o2 = 8, T2(function() {
      return n2;
    }, t4);
  }
  function x2(n2) {
    var u3 = r2.context[n2.__c], i3 = s2(t2++, 9);
    return i3.c = n2, u3 ? (null == i3.__ && (i3.__ = true, u3.sub(r2)), u3.props.value) : n2.__;
  }
  function P2(n2, t4) {
    c2.useDebugValue && c2.useDebugValue(t4 ? t4(n2) : n2);
  }
  function b2(n2) {
    var u3 = s2(t2++, 10), i3 = d2();
    return u3.__ = n2, r2.componentDidCatch || (r2.componentDidCatch = function(n3, t4) {
      u3.__ && u3.__(n3, t4), i3[1](n3);
    }), [i3[0], function() {
      i3[1](void 0);
    }];
  }
  function g2() {
    var n2 = s2(t2++, 11);
    if (!n2.__) {
      for (var u3 = r2.__v; null !== u3 && !u3.__m && null !== u3.__; ) u3 = u3.__;
      var i3 = u3.__m || (u3.__m = [0, 0]);
      n2.__ = "P" + i3[0] + "-" + i3[1]++;
    }
    return n2.__;
  }
  function j2() {
    for (var n2; n2 = f2.shift(); ) {
      var t4 = n2.__H;
      if (n2.__P && t4) try {
        t4.__h.some(z2), t4.__h.some(B2), t4.__h = [];
      } catch (r3) {
        t4.__h = [], c2.__e(r3, n2.__v);
      }
    }
  }
  c2.__b = function(n2) {
    r2 = null, e2 && e2(n2);
  }, c2.__ = function(n2, t4) {
    n2 && t4.__k && t4.__k.__m && (n2.__m = t4.__k.__m), p2 && p2(n2, t4);
  }, c2.__r = function(n2) {
    a2 && a2(n2), t2 = 0;
    var i3 = (r2 = n2.__c).__H;
    i3 && (u2 === r2 ? (i3.__h = [], r2.__h = [], i3.__.some(function(n3) {
      n3.__N && (n3.__ = n3.__N), n3.u = n3.__N = void 0;
    })) : (i3.__h.some(z2), i3.__h.some(B2), i3.__h = [], t2 = 0)), u2 = r2;
  }, c2.diffed = function(n2) {
    v2 && v2(n2);
    var t4 = n2.__c;
    t4 && t4.__H && (t4.__H.__h.length && (1 !== f2.push(t4) && i2 === c2.requestAnimationFrame || ((i2 = c2.requestAnimationFrame) || w2)(j2)), t4.__H.__.some(function(n3) {
      n3.u && (n3.__H = n3.u, n3.u = void 0);
    })), u2 = r2 = null;
  }, c2.__c = function(n2, t4) {
    t4.some(function(n3) {
      try {
        n3.__h.some(z2), n3.__h = n3.__h.filter(function(n4) {
          return !n4.__ || B2(n4);
        });
      } catch (r3) {
        t4.some(function(n4) {
          n4.__h && (n4.__h = []);
        }), t4 = [], c2.__e(r3, n3.__v);
      }
    }), l2 && l2(n2, t4);
  }, c2.unmount = function(n2) {
    m2 && m2(n2);
    var t4, r3 = n2.__c;
    r3 && r3.__H && (r3.__H.__.some(function(n3) {
      try {
        z2(n3);
      } catch (n4) {
        t4 = n4;
      }
    }), r3.__H = void 0, t4 && c2.__e(t4, r3.__v));
  };
  var k2 = "function" == typeof requestAnimationFrame;
  function w2(n2) {
    var t4, r3 = function() {
      clearTimeout(u3), k2 && cancelAnimationFrame(t4), setTimeout(n2);
    }, u3 = setTimeout(r3, 35);
    k2 && (t4 = requestAnimationFrame(r3));
  }
  function z2(n2) {
    var t4 = r2, u3 = n2.__c;
    "function" == typeof u3 && (n2.__c = void 0, u3()), r2 = t4;
  }
  function B2(n2) {
    var t4 = r2;
    n2.__c = n2.__(), r2 = t4;
  }
  function C2(n2, t4) {
    return !n2 || n2.length !== t4.length || t4.some(function(t5, r3) {
      return t5 !== n2[r3];
    });
  }
  function D2(n2, t4) {
    return "function" == typeof t4 ? t4(n2) : t4;
  }

  // node_modules/preact/compat/dist/compat.module.js
  function g3(n2, t4) {
    for (var e3 in t4) n2[e3] = t4[e3];
    return n2;
  }
  function E2(n2, t4) {
    for (var e3 in n2) if ("__source" !== e3 && !(e3 in t4)) return true;
    for (var r3 in t4) if ("__source" !== r3 && n2[r3] !== t4[r3]) return true;
    return false;
  }
  function C3(n2, t4) {
    var e3 = t4(), r3 = d2({ t: { __: e3, u: t4 } }), u3 = r3[0].t, o3 = r3[1];
    return _2(function() {
      u3.__ = e3, u3.u = t4, R2(u3) && o3({ t: u3 });
    }, [n2, e3, t4]), h3(function() {
      return R2(u3) && o3({ t: u3 }), n2(function() {
        R2(u3) && o3({ t: u3 });
      });
    }, [n2]), e3;
  }
  function R2(n2) {
    try {
      return !((t4 = n2.__) === (e3 = n2.u()) && (0 !== t4 || 1 / t4 == 1 / e3) || t4 != t4 && e3 != e3);
    } catch (n3) {
      return true;
    }
    var t4, e3;
  }
  function x3(n2) {
    n2();
  }
  function w3(n2) {
    return n2;
  }
  function k3() {
    return [false, x3];
  }
  var I2 = _2;
  function M2(n2, t4) {
    this.props = n2, this.context = t4;
  }
  function N2(n2, e3) {
    function r3(n3) {
      var t4 = this.props.ref;
      return t4 != n3.ref && t4 && ("function" == typeof t4 ? t4(null) : t4.current = null), e3 ? !e3(this.props, n3) || t4 != n3.ref : E2(this.props, n3);
    }
    function u3(e4) {
      return this.shouldComponentUpdate = r3, k(n2, e4);
    }
    return u3.displayName = "Memo(" + (n2.displayName || n2.name) + ")", u3.__f = u3.prototype.isReactComponent = true, u3.type = n2, u3;
  }
  (M2.prototype = new C()).isPureReactComponent = true, M2.prototype.shouldComponentUpdate = function(n2, t4) {
    return E2(this.props, n2) || E2(this.state, t4);
  };
  var T3 = l.__b;
  l.__b = function(n2) {
    n2.type && n2.type.__f && n2.ref && (n2.props.ref = n2.ref, n2.ref = null), T3 && T3(n2);
  };
  var A3 = "undefined" != typeof Symbol && Symbol.for && Symbol.for("react.forward_ref") || 3911;
  function D3(n2) {
    function t4(t5) {
      var e3 = g3({}, t5);
      return delete e3.ref, n2(e3, t5.ref || null);
    }
    return t4.$$typeof = A3, t4.render = n2, t4.prototype.isReactComponent = t4.__f = true, t4.displayName = "ForwardRef(" + (n2.displayName || n2.name) + ")", t4;
  }
  var F3 = function(n2, t4) {
    return null == n2 ? null : F(F(n2).map(t4));
  };
  var L2 = { map: F3, forEach: F3, count: function(n2) {
    return n2 ? F(n2).length : 0;
  }, only: function(n2) {
    var t4 = F(n2);
    if (1 !== t4.length) throw "Children.only";
    return t4[0];
  }, toArray: F };
  var O2 = l.__e;
  l.__e = function(n2, t4, e3, r3) {
    if (n2.then) {
      for (var u3, o3 = t4; o3 = o3.__; ) if ((u3 = o3.__c) && u3.__c) return null == t4.__e && (t4.__e = e3.__e, t4.__k = e3.__k || []), u3.__c(n2, t4);
    }
    O2(n2, t4, e3, r3);
  };
  var U2 = l.unmount;
  function V2(n2, t4, e3) {
    return n2 && (n2.__c && n2.__c.__H && (n2.__c.__H.__.forEach(function(n3) {
      "function" == typeof n3.__c && n3.__c();
    }), n2.__c.__H = null), null != (n2 = g3({}, n2)).__c && (n2.__c.__P === e3 && (n2.__c.__P = t4), n2.__c.__e = true, n2.__c = null), n2.__k = n2.__k && n2.__k.map(function(n3) {
      return V2(n3, t4, e3);
    })), n2;
  }
  function W2(n2, t4, e3) {
    return n2 && e3 && (n2.__v = null, n2.__k = n2.__k && n2.__k.map(function(n3) {
      return W2(n3, t4, e3);
    }), n2.__c && n2.__c.__P === t4 && (n2.__e && e3.appendChild(n2.__e), n2.__c.__e = true, n2.__c.__P = e3)), n2;
  }
  function P3() {
    this.__u = 0, this.o = null, this.__b = null;
  }
  function j3(n2) {
    var t4 = n2.__ && n2.__.__c;
    return t4 && t4.__a && t4.__a(n2);
  }
  function z3(n2) {
    var e3, r3, u3, o3 = null;
    function i3(i4) {
      if (e3 || (e3 = n2()).then(function(n3) {
        n3 && (o3 = n3.default || n3), u3 = true;
      }, function(n3) {
        r3 = n3, u3 = true;
      }), r3) throw r3;
      if (!u3) throw e3;
      return o3 ? k(o3, i4) : null;
    }
    return i3.displayName = "Lazy", i3.__f = true, i3;
  }
  function B3() {
    this.i = null, this.l = null;
  }
  l.unmount = function(n2) {
    var t4 = n2.__c;
    t4 && (t4.__z = true), t4 && t4.__R && t4.__R(), t4 && 32 & n2.__u && (n2.type = null), U2 && U2(n2);
  }, (P3.prototype = new C()).__c = function(n2, t4) {
    var e3 = t4.__c, r3 = this;
    null == r3.o && (r3.o = []), r3.o.push(e3);
    var u3 = j3(r3.__v), o3 = false, i3 = function() {
      o3 || r3.__z || (o3 = true, e3.__R = null, u3 ? u3(f3) : f3());
    };
    e3.__R = i3;
    var l3 = e3.__P;
    e3.__P = null;
    var f3 = function() {
      if (!--r3.__u) {
        if (r3.state.__a) {
          var n3 = r3.state.__a;
          r3.__v.__k[0] = W2(n3, n3.__c.__P, n3.__c.__O);
        }
        var t5;
        for (r3.setState({ __a: r3.__b = null }); t5 = r3.o.pop(); ) t5.__P = l3, t5.forceUpdate();
      }
    };
    r3.__u++ || 32 & t4.__u || r3.setState({ __a: r3.__b = r3.__v.__k[0] }), n2.then(i3, i3);
  }, P3.prototype.componentWillUnmount = function() {
    this.o = [];
  }, P3.prototype.render = function(n2, e3) {
    if (this.__b) {
      if (this.__v.__k) {
        var r3 = document.createElement("div"), o3 = this.__v.__k[0].__c;
        this.__v.__k[0] = V2(this.__b, r3, o3.__O = o3.__P);
      }
      this.__b = null;
    }
    var i3 = e3.__a && k(S, null, n2.fallback);
    return i3 && (i3.__u &= -33), [k(S, null, e3.__a ? null : n2.children), i3];
  };
  var H2 = function(n2, t4, e3) {
    if (++e3[1] === e3[0] && n2.l.delete(t4), n2.props.revealOrder && ("t" !== n2.props.revealOrder[0] || !n2.l.size)) for (e3 = n2.i; e3; ) {
      for (; e3.length > 3; ) e3.pop()();
      if (e3[1] < e3[0]) break;
      n2.i = e3 = e3[2];
    }
  };
  function Z(n2) {
    return this.getChildContext = function() {
      return n2.context;
    }, n2.children;
  }
  function Y(n2) {
    var e3 = this, r3 = n2.h;
    if (e3.componentWillUnmount = function() {
      R(null, e3.v), e3.v = null, e3.h = null;
    }, e3.h && e3.h !== r3 && e3.componentWillUnmount(), !e3.v) {
      for (var u3 = e3.__v; null !== u3 && !u3.__m && null !== u3.__; ) u3 = u3.__;
      e3.h = r3, e3.v = { nodeType: 1, parentNode: r3, childNodes: [], __k: { __m: u3.__m }, contains: function() {
        return true;
      }, namespaceURI: r3.namespaceURI, insertBefore: function(n3, t4) {
        this.childNodes.push(n3), e3.h.insertBefore(n3, t4);
      }, removeChild: function(n3) {
        this.childNodes.splice(this.childNodes.indexOf(n3) >>> 1, 1), e3.h.removeChild(n3);
      } };
    }
    R(k(Z, { context: e3.context }, n2.__v), e3.v);
  }
  function $2(n2, e3) {
    var r3 = k(Y, { __v: n2, h: e3 });
    return r3.containerInfo = e3, r3;
  }
  (B3.prototype = new C()).__a = function(n2) {
    var t4 = this, e3 = j3(t4.__v), r3 = t4.l.get(n2);
    return r3[0]++, function(u3) {
      var o3 = function() {
        t4.props.revealOrder ? (r3.push(u3), H2(t4, n2, r3)) : u3();
      };
      e3 ? e3(o3) : o3();
    };
  }, B3.prototype.render = function(n2) {
    this.i = null, this.l = /* @__PURE__ */ new Map();
    var t4 = F(n2.children);
    n2.revealOrder && "b" === n2.revealOrder[0] && t4.reverse();
    for (var e3 = t4.length; e3--; ) this.l.set(t4[e3], this.i = [1, 0, this.i]);
    return n2.children;
  }, B3.prototype.componentDidUpdate = B3.prototype.componentDidMount = function() {
    var n2 = this;
    this.l.forEach(function(t4, e3) {
      H2(n2, e3, t4);
    });
  };
  var q3 = "undefined" != typeof Symbol && Symbol.for && Symbol.for("react.element") || 60103;
  var G2 = /^(?:accent|alignment|arabic|baseline|cap|clip(?!PathU)|color|dominant|fill|flood|font|glyph(?!R)|horiz|image(!S)|letter|lighting|marker(?!H|W|U)|overline|paint|pointer|shape|stop|strikethrough|stroke|text(?!L)|transform|underline|unicode|units|v|vector|vert|word|writing|x(?!C))[A-Z]/;
  var J2 = /^on(Ani|Tra|Tou|BeforeInp|Compo)/;
  var K2 = /[A-Z0-9]/g;
  var Q2 = "undefined" != typeof document;
  var X2 = function(n2) {
    return ("undefined" != typeof Symbol && "symbol" == typeof Symbol() ? /fil|che|rad/ : /fil|che|ra/).test(n2);
  };
  function nn(n2, t4, e3) {
    return null == t4.__k && (t4.textContent = ""), R(n2, t4), "function" == typeof e3 && e3(), n2 ? n2.__c : null;
  }
  function tn(n2, t4, e3) {
    return U(n2, t4), "function" == typeof e3 && e3(), n2 ? n2.__c : null;
  }
  C.prototype.isReactComponent = true, ["componentWillMount", "componentWillReceiveProps", "componentWillUpdate"].forEach(function(t4) {
    Object.defineProperty(C.prototype, t4, { configurable: true, get: function() {
      return this["UNSAFE_" + t4];
    }, set: function(n2) {
      Object.defineProperty(this, t4, { configurable: true, writable: true, value: n2 });
    } });
  });
  var en = l.event;
  l.event = function(n2) {
    return en && (n2 = en(n2)), n2.persist = function() {
    }, n2.isPropagationStopped = function() {
      return this.cancelBubble;
    }, n2.isDefaultPrevented = function() {
      return this.defaultPrevented;
    }, n2.nativeEvent = n2;
  };
  var rn;
  var un = { configurable: true, get: function() {
    return this.class;
  } };
  var on = l.vnode;
  l.vnode = function(n2) {
    "string" == typeof n2.type && (function(n3) {
      var t4 = n3.props, e3 = n3.type, u3 = {}, o3 = -1 == e3.indexOf("-");
      for (var i3 in t4) {
        var l3 = t4[i3];
        if (!("value" === i3 && "defaultValue" in t4 && null == l3 || Q2 && "children" === i3 && "noscript" === e3 || "class" === i3 || "className" === i3)) {
          var f3 = i3.toLowerCase();
          "defaultValue" === i3 && "value" in t4 && null == t4.value ? i3 = "value" : "download" === i3 && true === l3 ? l3 = "" : "translate" === f3 && "no" === l3 ? l3 = false : "o" === f3[0] && "n" === f3[1] ? "ondoubleclick" === f3 ? i3 = "ondblclick" : "onchange" !== f3 || "input" !== e3 && "textarea" !== e3 || X2(t4.type) ? "onfocus" === f3 ? i3 = "onfocusin" : "onblur" === f3 ? i3 = "onfocusout" : J2.test(i3) && (i3 = f3) : f3 = i3 = "oninput" : o3 && G2.test(i3) ? i3 = i3.replace(K2, "-$&").toLowerCase() : null === l3 && (l3 = void 0), "oninput" === f3 && u3[i3 = f3] && (i3 = "oninputCapture"), u3[i3] = l3;
        }
      }
      "select" == e3 && (u3.multiple && Array.isArray(u3.value) && (u3.value = F(t4.children).forEach(function(n4) {
        n4.props.selected = -1 != u3.value.indexOf(n4.props.value);
      })), null != u3.defaultValue && (u3.value = F(t4.children).forEach(function(n4) {
        n4.props.selected = u3.multiple ? -1 != u3.defaultValue.indexOf(n4.props.value) : u3.defaultValue == n4.props.value;
      }))), t4.class && !t4.className ? (u3.class = t4.class, Object.defineProperty(u3, "className", un)) : t4.className && (u3.class = u3.className = t4.className), n3.props = u3;
    })(n2), n2.$$typeof = q3, on && on(n2);
  };
  var ln = l.__r;
  l.__r = function(n2) {
    ln && ln(n2), rn = n2.__c;
  };
  var fn = l.diffed;
  l.diffed = function(n2) {
    fn && fn(n2);
    var t4 = n2.props, e3 = n2.__e;
    null != e3 && "textarea" === n2.type && "value" in t4 && t4.value !== e3.value && (e3.value = null == t4.value ? "" : t4.value), rn = null;
  };
  var an = { ReactCurrentDispatcher: { current: { readContext: function(n2) {
    return rn.__n[n2.__c].props.value;
  }, useCallback: q2, useContext: x2, useDebugValue: P2, useDeferredValue: w3, useEffect: h3, useId: g2, useImperativeHandle: F2, useInsertionEffect: I2, useLayoutEffect: _2, useMemo: T2, useReducer: y2, useRef: A2, useState: d2, useSyncExternalStore: C3, useTransition: k3 } } };
  var cn = "18.3.1";
  function sn(n2) {
    return k.bind(null, n2);
  }
  function hn(n2) {
    return !!n2 && n2.$$typeof === q3;
  }
  function vn(n2) {
    return hn(n2) && n2.type === S;
  }
  function dn(n2) {
    return !!n2 && "string" == typeof n2.displayName && 0 == n2.displayName.indexOf("Memo(");
  }
  function mn(n2) {
    return hn(n2) ? W.apply(null, arguments) : n2;
  }
  function pn(n2) {
    return !!n2.__k && (R(null, n2), true);
  }
  function yn(n2) {
    return n2 && (n2.base || 1 === n2.nodeType && n2) || null;
  }
  var _n = function(n2, t4) {
    return n2(t4);
  };
  var bn = function(n2, t4) {
    var r3, u3 = l.debounceRendering;
    l.debounceRendering = function(n3) {
      r3 = n3;
    };
    try {
      var o3 = n2(t4);
      return r3 && r3(), o3;
    } finally {
      l.debounceRendering = u3;
    }
  };
  var Sn = hn;
  var gn = { useState: d2, useId: g2, useReducer: y2, useEffect: h3, useLayoutEffect: _2, useInsertionEffect: I2, useTransition: k3, useDeferredValue: w3, useSyncExternalStore: C3, startTransition: x3, useRef: A2, useImperativeHandle: F2, useMemo: T2, useCallback: q2, useContext: x2, useDebugValue: P2, version: "18.3.1", Children: L2, render: nn, hydrate: tn, unmountComponentAtNode: pn, createPortal: $2, createElement: k, createContext: X, createFactory: sn, cloneElement: mn, createRef: M, Fragment: S, isValidElement: hn, isElement: Sn, isFragment: vn, isMemo: dn, findDOMNode: yn, Component: C, PureComponent: M2, memo: N2, forwardRef: D3, flushSync: bn, unstable_batchedUpdates: _n, StrictMode: S, Suspense: P3, SuspenseList: B3, lazy: z3, __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: an };

  // vendor/userscript-pp/core/gm-object.js
  var GM_OBJECT = typeof GM !== "undefined" && GM && typeof GM === "object" ? GM : null;

  // vendor/userscript-pp/core/env.js
  var W3 = typeof unsafeWindow !== "undefined" && unsafeWindow ? unsafeWindow : window;
  var GM2 = {
    get: typeof GM_getValue === "function" ? GM_getValue : null,
    set: typeof GM_setValue === "function" ? GM_setValue : null,
    del: typeof GM_deleteValue === "function" ? GM_deleteValue : null,
    xhr: typeof GM_xmlhttpRequest === "function" ? GM_xmlhttpRequest : null,
    addListener: typeof GM_addValueChangeListener === "function" ? GM_addValueChangeListener : null,
    removeListener: typeof GM_removeValueChangeListener === "function" ? GM_removeValueChangeListener : null,
    menu: typeof GM_registerMenuCommand === "function" ? GM_registerMenuCommand : null,
    unmenu: typeof GM_unregisterMenuCommand === "function" ? GM_unregisterMenuCommand : null,
    clipboard: typeof GM_setClipboard === "function" ? GM_setClipboard : g4("setClipboard"),
    // AdGuard 只有 GM.notification
    notification: typeof GM_notification === "function" ? GM_notification : g4("notification"),
    info: typeof GM_info !== "undefined" ? GM_info : GM_OBJECT?.info ?? null
  };
  function g4(name) {
    const f3 = GM_OBJECT && GM_OBJECT[name];
    return typeof f3 === "function" ? (...a3) => f3.apply(GM_OBJECT, a3) : null;
  }
  var MANAGER = (() => {
    const n2 = String(GM2.info?.scriptHandler || "").toLowerCase();
    if (!n2) return "unknown";
    for (const k4 of ["tampermonkey", "violentmonkey", "scriptcat", "adguard"]) if (n2.includes(k4)) return k4;
    return n2;
  })();
  var missingCapabilities = () => [
    ["storage", GM2.get && GM2.set],
    ["menu", GM2.menu],
    ["crossTabSync", GM2.addListener],
    ["xhr", GM2.xhr],
    ["notification", GM2.notification],
    ["clipboard", GM2.clipboard],
    ["unsafeWindow", typeof unsafeWindow !== "undefined"]
  ].filter(([, ok]) => !ok).map(([k4]) => k4);
  var FRAMEWORK_VERSION = true ? "0.1.0" : "0.0.0";
  var VERSION = true ? "20261108.0.4.0" : "0.0.0";
  var IS_DEV = true ? false : false;
  var BUILD_TYPE = IS_DEV ? "development" : "production";
  var isChromium = () => !!W3.chrome;
  var SCRIPT = typeof define_USPP_SCRIPT_default !== "undefined" ? define_USPP_SCRIPT_default : { id: "dev", name: "Userscript++ script", global: null };
  var SCRIPT_ID = SCRIPT.id;
  var SCRIPT_NAME = SCRIPT.name;
  var GLOBAL_NAME = SCRIPT.global || null;
  var SUPPORT_URL = SCRIPT.supportURL || null;
  var INSTANCE_KEY = Symbol.for(`uspp:${SCRIPT_ID}`);
  var INSTANCE_EXPR = `window[Symbol.for(${JSON.stringify(`uspp:${SCRIPT_ID}`)})]`;
  var API_VERSION = 1;

  // vendor/userscript-pp/core/lib/diag.js
  var DIAG_KEY = `UserscriptPP:${SCRIPT_ID}:diag`;
  var cfg = {};
  if (false) {
    try {
      cfg = JSON.parse(W3.localStorage.getItem(DIAG_KEY) || "{}") || {};
    } catch {
      cfg = {};
    }
  }
  var diag = Object.freeze({ ...cfg, disablePlugins: Array.isArray(cfg.disablePlugins) ? cfg.disablePlugins.slice() : [] });
  var diagOn = Object.keys(cfg).length > 0;
  var events = [];
  var counters = /* @__PURE__ */ Object.create(null);
  var now = () => Math.round(typeof performance !== "undefined" ? performance.now() : Date.now());
  function trace(kind, data) {
    if (!diag.log) return;
    if (events.length < 2e4) events.push(data === void 0 ? [now(), kind] : [now(), kind, data]);
  }
  function count(kind) {
    if (!diag.log) return;
    counters[kind] = (counters[kind] || 0) + 1;
  }
  if (diag.log) {
    try {
      new PerformanceObserver((list2) => {
        for (const e3 of list2.getEntries()) if (e3.initiatorType === "script" || /\.js(\?|$)/.test(e3.name)) {
          let name = e3.name;
          try {
            name = new URL(e3.name).pathname;
          } catch {
          }
          trace("page.script", { name, start: Math.round(e3.startTime) });
        }
      }).observe({ type: "resource", buffered: true });
    } catch {
    }
  }

  // vendor/userscript-pp/core/lib/logger.js
  var COLORS = { log: "#a78bfa", info: "#38bdf8", warn: "#f59e0b", error: "#ef4444", debug: "#9ca3af" };
  var debugOn = false;
  function setDebugLogs(on3) {
    debugOn = !!on3;
  }
  var recent = [];
  var recentLogs = () => recent.slice();
  var brief = (a3) => {
    try {
      return a3 instanceof Error ? `${a3.name}: ${a3.message}` : typeof a3 === "string" ? a3 : JSON.stringify(a3)?.slice(0, 300) ?? String(a3);
    } catch {
      return String(a3);
    }
  };
  var Logger = class {
    constructor(name, color = "#a78bfa") {
      this.name = name;
      this.color = color;
    }
    _out(level2, args) {
      if (level2 === "debug" && !debugOn) return;
      if (level2 === "warn" || level2 === "error") {
        recent.push({ at: (/* @__PURE__ */ new Date()).toISOString(), level: level2, source: this.name, text: args.map(brief).join(" ").slice(0, 500) });
        if (recent.length > 20) recent.shift();
      }
      const fn2 = console[level2] || console.log;
      fn2.call(
        console,
        `%c ${SCRIPT_NAME} %c %c ${this.name} `,
        `background:${COLORS[level2]};color:#000;border-radius:4px 0 0 4px;font-weight:bold`,
        "",
        `background:${this.color};color:#000;border-radius:0 4px 4px 0`,
        ...args
      );
    }
    log(...a3) {
      this._out("log", a3);
    }
    info(...a3) {
      this._out("info", a3);
    }
    warn(...a3) {
      this._out("warn", a3);
    }
    error(...a3) {
      this._out("error", a3);
    }
    debug(...a3) {
      this._out("debug", a3);
    }
  };

  // vendor/userscript-pp/core/lib/match.js
  var reCache = /* @__PURE__ */ new Map();
  var globToRe = (s3, any) => s3.split("*").map((x4) => x4.replace(/[.+?^${}()|[\]\\]/g, "\\$&")).join(any);
  function compile(pattern) {
    const p4 = String(pattern || "").trim();
    if (!p4) return null;
    if (p4 === "*" || p4 === "<all_urls>" || p4 === "*://*/*") return /^/;
    const m3 = /^(\*|https?|file):\/\/([^/]*)(\/.*)?$/.exec(p4);
    if (!m3) {
      const h5 = p4.replace(/^\*\./, "");
      return new RegExp(`^https?://([^/]*\\.)?${globToRe(h5, "[^/]*")}(?::\\d+)?(/|$)`, "i");
    }
    const [, scheme, hostPat, path = "/*"] = m3;
    const sch = scheme === "*" ? "https?" : scheme;
    let hostRe;
    if (hostPat === "*") hostRe = "[^/]*";
    else if (hostPat.startsWith("*.")) hostRe = `([^/]*\\.)?${globToRe(hostPat.slice(2), "[^/]*")}`;
    else hostRe = globToRe(hostPat, "[^/]*");
    return new RegExp(`^${sch}://${hostRe}(?::\\d+)?${globToRe(path, ".*")}$`, "i");
  }
  function matchPattern(pattern, url = location.href) {
    let re = reCache.get(pattern);
    if (re === void 0) {
      re = compile(pattern);
      reCache.set(pattern, re);
    }
    return !!re && re.test(url);
  }
  function matchesUrl(patterns, url = location.href) {
    const list2 = Array.isArray(patterns) ? patterns : typeof patterns === "string" ? [patterns] : [];
    return list2.some((p4) => matchPattern(p4, url));
  }
  function specificity(pattern) {
    const p4 = String(pattern || "");
    if (p4 === "*" || p4 === "<all_urls>") return 0;
    const m3 = /^[^:]+:\/\/([^/]*)(\/.*)?$/.exec(p4);
    const host4 = m3 ? m3[1] : p4;
    const path = m3 ? m3[2] || "" : "";
    return (host4.includes("*") ? 0 : 1e4) + host4.replace(/\*/g, "").length * 10 + path.replace(/\*/g, "").length;
  }

  // vendor/userscript-pp/core/lib/sites.js
  var logger = new Logger("Sites", "#5eead4");
  var GENERIC = Object.freeze({ id: "generic", name: "Generic", matches: [], generic: true });
  var registry = /* @__PURE__ */ new Map();
  var current = null;
  var runtimeSwitchListeners = /* @__PURE__ */ new Set();
  var ID_RE = /^[a-z0-9-]+$/;
  function defineSite(def) {
    if (!def || typeof def !== "object") throw new Error("defineSite 需要一个对象");
    if (!ID_RE.test(def.id || "")) throw new Error(`站点 ID 只能是小写字母、数字和 -:${def.id}`);
    if (def.id === GENERIC.id) throw new Error("generic 是保留的站点 ID");
    if (!def.name) throw new Error(`站点 ${def.id} 缺少 name`);
    if (!Array.isArray(def.matches) || !def.matches.length) throw new Error(`站点 ${def.id} 缺少 matches`);
    return def;
  }
  function addSite(def, { runtime: runtime2 = false } = {}) {
    defineSite(def);
    if (registry.has(def.id)) {
      logger.warn(`站点 ${def.id} 已注册,忽略`);
      return false;
    }
    if (runtime2 && def.driver) {
      logger.warn(`运行时注册的站点 ${def.id} 不能使用打包器驱动,已忽略 driver`);
      def = { ...def, driver: void 0 };
    }
    registry.set(def.id, def);
    return true;
  }
  var score = (def, url) => {
    if (!matchesUrl(def.matches, url)) return -1;
    if (def.excludeMatches && matchesUrl(def.excludeMatches, url)) return -1;
    return Math.max(...def.matches.filter((p4) => matchesUrl([p4], url)).map(specificity));
  };
  function pickSite(url = location.href, candidates2 = [...registry.values()]) {
    let best = null, bestScore = -1, tie = false;
    for (const def of candidates2) {
      const s3 = score(def, url);
      if (s3 < 0) continue;
      if (s3 > bestScore) {
        best = def;
        bestScore = s3;
        tie = false;
      } else if (s3 === bestScore) tie = true;
    }
    if (best && tie) logger.warn(`多个站点同样匹配当前网址,使用 ${best.id}`);
    return best;
  }
  function selectSite(url = location.href) {
    current = pickSite(url) || GENERIC;
    return current;
  }
  var getSite = () => current || GENERIC;
  var isGeneric = () => getSite() === GENERIC;
  var isSite = (id) => getSite().id === id;
  var getSites = () => [...registry.values()];
  var getSiteById = (id) => registry.get(id) || (id === GENERIC.id ? GENERIC : null);
  var siteKey = () => isGeneric() ? location.hostname || "local" : getSite().id;
  function switchTo(def) {
    if (!isGeneric() || current === def) return false;
    if (pickSite(location.href, [def]) !== def) return false;
    current = def;
    for (const fn2 of [...runtimeSwitchListeners]) {
      try {
        fn2(def);
      } catch (e3) {
        logger.error("站点切换监听者出错", e3);
      }
    }
    return true;
  }

  // vendor/userscript-pp/core/ui/react.js
  var bundled = Object.freeze({
    name: "preact",
    site: false,
    React: compat_module_exports,
    createRoot: (container3) => ({ render: (v3) => nn(v3, container3), unmount: () => nn(null, container3) }),
    createPortal: $2,
    flushSync: bn ?? ((fn2) => fn2())
  });
  var locked = null;
  var siteReadyFlag = false;
  function markSiteReady() {
    siteReadyFlag = true;
  }
  var INTERACTIVE_WAIT_MS = 1500;
  var wantedAt = 0;
  function wantUi() {
    if (!wantedAt) wantedAt = Date.now();
  }
  function getRenderer() {
    if (locked) return locked;
    const site = getSite();
    if (typeof site.renderer === "function") {
      let r3 = null;
      try {
        r3 = site.renderer();
      } catch {
        r3 = null;
      }
      if (r3 && r3.React && typeof r3.createRoot === "function") return locked = Object.freeze({ name: "site", site: true, flushSync: (fn2) => fn2(), ...r3 });
      if (!siteReadyFlag && !(wantedAt && Date.now() - wantedAt >= INTERACTIVE_WAIT_MS)) return null;
      if (!siteReadyFlag) console.info(`[Userscript++] 站点渲染器 ${INTERACTIVE_WAIT_MS} ms 内没就绪,界面改用内置渲染器`);
    }
    return locked = bundled;
  }
  var getReact = () => getRenderer()?.React ?? null;
  var usingSiteRenderer = () => !!getRenderer()?.site;
  function siteComponent(name) {
    if (!usingSiteRenderer() || diag.noSiteComponents) return null;
    const c4 = getSite().components;
    try {
      return (typeof c4 === "function" ? c4(name) : c4?.[name]) ?? null;
    } catch {
      return null;
    }
  }
  var Fragment = Symbol.for("react.fragment");
  function h(type, props, ...children) {
    const R3 = getReact();
    if (!R3) throw new Error("Userscript++: 渲染器尚未就绪");
    if (type === Fragment) type = R3.Fragment;
    return R3.createElement(type, props, ...children);
  }
  var hook = (name) => (...args) => getReact()[name](...args);
  var useState = hook("useState");
  var useEffect = hook("useEffect");
  var useLayoutEffect = hook("useLayoutEffect");
  var useMemo = hook("useMemo");
  var useRef = hook("useRef");
  var useCallback = hook("useCallback");
  var useReducer = hook("useReducer");
  var useContext = hook("useContext");
  var useId = hook("useId");
  var useSyncExternalStore = hook("useSyncExternalStore");
  function useForceUpdate() {
    const [, f3] = useReducer((x4) => x4 + 1, 0);
    return f3;
  }
  function useSubscription(subscribe6) {
    const force = useForceUpdate();
    useEffect(() => subscribe6(() => force()), []);
  }
  var EBs = /* @__PURE__ */ new WeakMap();
  function getErrorBoundary() {
    const R3 = getReact();
    if (!R3) return null;
    if (EBs.has(R3)) return EBs.get(R3);
    class ErrorBoundary2 extends R3.Component {
      constructor(props) {
        super(props);
        this.state = { error: null };
      }
      static getDerivedStateFromError(error2) {
        return { error: error2 };
      }
      componentDidCatch(error2, info) {
        console.error("[Userscript++] 组件渲染出错", this.props.label || "", error2, info?.componentStack);
        this.props.onError?.(error2);
      }
      render() {
        if (this.state.error) {
          const fb = this.props.fallback;
          return typeof fb === "function" ? fb(this.state.error) : fb ?? null;
        }
        return this.props.children ?? null;
      }
    }
    EBs.set(R3, ErrorBoundary2);
    return ErrorBoundary2;
  }
  function ErrorBoundary(props) {
    const C4 = getErrorBoundary();
    return C4 ? h(C4, props) : props.children;
  }
  ErrorBoundary.wrap = (Component, fallback = null) => {
    const Wrapped = (props) => h(ErrorBoundary, { fallback, label: Component.displayName || Component.name }, h(Component, props));
    Wrapped.displayName = `UsppBoundary(${Component.displayName || Component.name || "Component"})`;
    return Wrapped;
  };

  // src/kernel/host.ts
  var current2 = null;
  var bindListeners = /* @__PURE__ */ new Set();
  var host = () => current2;
  function bindHost(next) {
    if (current2) return;
    if (!next || typeof next.PlainSettings !== "object" || typeof next.PlainSettings?.plugins !== "object") return;
    current2 = next;
    for (const fn2 of [...bindListeners]) fn2(next);
  }
  function onHost(fn2) {
    if (current2) fn2(current2);
    else bindListeners.add(fn2);
  }

  // src/kernel/logger.ts
  var STYLE = "background:#d97757;color:#fff;border-radius:3px;padding:0 4px";
  var Logger2 = class _Logger {
    constructor(name) {
      this.name = name;
    }
    static TAG = "CC++";
    out(level2, args) {
      console[level2](`%c${_Logger.TAG}%c ${this.name}`, STYLE, "", ...args);
    }
    debug = (...args) => this.out("debug", args);
    info = (...args) => this.out("info", args);
    warn = (...args) => this.out("warn", args);
    error = (...args) => this.out("error", args);
  };

  // src/kernel/events.ts
  var logger2 = new Logger2("Events");
  var handlers = /* @__PURE__ */ new Map();
  function on2(name, handler) {
    let set = handlers.get(name);
    if (!set) handlers.set(name, set = /* @__PURE__ */ new Set());
    set.add(handler);
    return () => void set.delete(handler);
  }
  function emit(name, payload) {
    for (const handler of [...handlers.get(name) ?? []]) {
      try {
        handler(payload);
      } catch (error2) {
        logger2.error(`Handler for ${String(name)} failed:`, error2);
      }
    }
  }

  // src/kernel/scope.ts
  var logger3 = new Logger2("Scope");
  var Scope = class _Scope {
    cleanups = [];
    controller = new AbortController();
    get signal() {
      return this.controller.signal;
    }
    get alive() {
      return !this.controller.signal.aborted;
    }
    /** Runs `fn` when the plugin stops. Returns `fn` for chaining. */
    defer(fn2) {
      if (this.alive) this.cleanups.push(fn2);
      else fn2();
      return fn2;
    }
    listen(target2, type, fn2, options = {}) {
      target2.addEventListener(type, fn2, { ...options, signal: this.signal });
    }
    on(name, handler) {
      this.defer(on2(name, handler));
    }
    timeout(fn2, ms) {
      const id = setTimeout(() => this.alive && fn2(), ms);
      this.defer(() => clearTimeout(id));
      return id;
    }
    interval(fn2, ms) {
      const id = setInterval(() => this.alive && fn2(), ms);
      this.defer(() => clearInterval(id));
      return id;
    }
    /** Adds a node to the page and removes it on stop. */
    mount(node, parent = document.body ?? document.documentElement) {
      parent.appendChild(node);
      this.defer(() => node.remove?.());
      return node;
    }
    observe(target2, options, fn2) {
      const observer2 = new MutationObserver(fn2);
      observer2.observe(target2, options);
      this.defer(() => observer2.disconnect());
      return observer2;
    }
    /** A scope that ends with this one but can also be ended early. */
    child() {
      const scope = new _Scope();
      const remove = this.defer(() => scope.dispose());
      scope.defer(() => {
        const i3 = this.cleanups.indexOf(remove);
        if (i3 >= 0) this.cleanups.splice(i3, 1);
      });
      return scope;
    }
    dispose() {
      if (!this.alive) return;
      this.controller.abort();
      for (const fn2 of this.cleanups.splice(0).reverse()) {
        try {
          fn2();
        } catch (error2) {
          logger3.error("Cleanup failed:", error2);
        }
      }
    }
  };

  // src/kernel/storage.ts
  var PREFIX = "ccpp:";
  function readJson(key, fallback) {
    try {
      const raw2 = localStorage.getItem(PREFIX + key);
      return raw2 == null ? fallback : JSON.parse(raw2);
    } catch {
      return fallback;
    }
  }
  function writeJson(key, value) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }
  function removeKey(key) {
    try {
      localStorage.removeItem(PREFIX + key);
    } catch {
    }
  }
  function dumpAll() {
    const out = {};
    try {
      for (let i3 = 0; i3 < localStorage.length; i3++) {
        const key = localStorage.key(i3);
        if (key?.startsWith(PREFIX)) out[key.slice(PREFIX.length)] = localStorage.getItem(key) ?? "";
      }
    } catch {
    }
    return out;
  }
  function persisted(key, fallback, valid) {
    const listeners12 = /* @__PURE__ */ new Set();
    const load = () => {
      const value2 = readJson(key, fallback);
      return valid(value2) ? value2 : fallback;
    };
    let value = load();
    const store2 = {
      get: () => value,
      set(next) {
        value = next;
        writeJson(key, next);
        for (const listener of [...listeners12]) listener(next);
      },
      reload() {
        value = load();
        for (const listener of [...listeners12]) listener(value);
      },
      subscribe(listener) {
        listeners12.add(listener);
        return () => void listeners12.delete(listener);
      }
    };
    try {
      globalThis.addEventListener?.("storage", (event) => {
        if (event.key === PREFIX + key || event.key === null) store2.reload();
      });
    } catch {
    }
    return store2;
  }

  // src/kernel/settings.ts
  var logger4 = new Logger2("Settings");
  var SETTINGS_KEY = "settings";
  var listeners = /* @__PURE__ */ new Set();
  var isRecord = (value) => !!value && typeof value === "object" && !Array.isArray(value);
  var bag = (() => {
    const stored = readJson(SETTINGS_KEY, {});
    return isRecord(stored) ? stored : {};
  })();
  var FRAMEWORK_PLUGIN = "Settings";
  var SETTINGS_UI_PLUGIN = "CCPPSettings";
  var LEGACY_NAMES = { Settings: SETTINGS_UI_PLUGIN };
  var MIGRATED_KEY = "migratedFrom03";
  var values = () => {
    const h5 = host();
    return h5 ? h5.PlainSettings.plugins : bag;
  };
  function announce(plugin, key) {
    for (const listener of [...listeners]) {
      try {
        listener(plugin, key);
      } catch (error2) {
        logger4.error("Settings listener failed:", error2);
      }
    }
  }
  var getRaw = (plugin, key) => {
    const entry = values()[plugin];
    return isRecord(entry) ? entry[key] : void 0;
  };
  var snapshot = () => {
    const out = {};
    for (const [plugin, entry] of Object.entries(values())) {
      if (plugin === FRAMEWORK_PLUGIN && host()) continue;
      if (isRecord(entry)) out[plugin] = JSON.parse(JSON.stringify(entry));
    }
    return out;
  };
  function hostEntry(plugin) {
    const h5 = host();
    if (!isRecord(h5.PlainSettings.plugins[plugin])) h5.Settings.plugins[plugin] = {};
    return h5.Settings.plugins[plugin];
  }
  function setRaw(plugin, key, value) {
    if (getRaw(plugin, key) === value && key in (values()[plugin] ?? {})) return;
    if (host()) {
      hostEntry(plugin)[key] = value;
      return;
    }
    bag = { ...bag, [plugin]: { ...bag[plugin], [key]: value } };
    if (!writeJson(SETTINGS_KEY, bag)) logger4.warn("Settings could not be saved");
    announce(plugin, key);
  }
  function resetRaw(plugin, keys) {
    const current6 = values()[plugin];
    if (!isRecord(current6)) return;
    const changed2 = keys.filter((key) => key in current6);
    if (!changed2.length) return;
    if (host()) {
      const entry = hostEntry(plugin);
      for (const key of changed2) delete entry[key];
      return;
    }
    const next = { ...current6 };
    for (const key of changed2) delete next[key];
    bag = { ...bag, [plugin]: next };
    writeJson(SETTINGS_KEY, bag);
    for (const key of changed2) announce(plugin, key);
  }
  function onSettingsChange(listener) {
    listeners.add(listener);
    return () => void listeners.delete(listener);
  }
  function diffBags(before, after) {
    const out = [];
    for (const plugin of /* @__PURE__ */ new Set([...Object.keys(before), ...Object.keys(after)])) {
      const a3 = isRecord(before[plugin]) ? before[plugin] : {};
      const b3 = isRecord(after[plugin]) ? after[plugin] : {};
      const keys = [.../* @__PURE__ */ new Set([...Object.keys(a3), ...Object.keys(b3)])].filter((key) => a3[key] !== b3[key]);
      keys.sort((x4, y3) => Number(y3 === "enabled") - Number(x4 === "enabled"));
      for (const key of keys) out.push([plugin, key]);
    }
    return out;
  }
  function replaceBag(next) {
    const parsed = isRecord(next) ? next : {};
    if (host()) {
      const renamed = {};
      for (const [plugin, entry] of Object.entries(parsed)) {
        if (!isRecord(entry)) continue;
        const name = LEGACY_NAMES[plugin] ?? plugin;
        renamed[name] = { ...renamed[name], ...entry };
      }
      for (const [plugin, key] of diffBags(snapshot(), renamed)) {
        const entry = hostEntry(plugin);
        if (key in (renamed[plugin] ?? {})) entry[key] = renamed[plugin][key];
        else delete entry[key];
      }
      return;
    }
    const changed2 = diffBags(bag, parsed);
    bag = parsed;
    writeJson(SETTINGS_KEY, bag);
    for (const [plugin, key] of changed2) announce(plugin, key);
  }
  function clearAll() {
    if (!host()) return replaceBag({});
    const h5 = host();
    for (const plugin of Object.keys(h5.PlainSettings.plugins)) if (plugin !== FRAMEWORK_PLUGIN) delete h5.Settings.plugins[plugin];
  }
  function migrateLegacy() {
    const h5 = host();
    if (!h5) return false;
    const plain = h5.PlainSettings.plugins;
    if (isRecord(plain[SETTINGS_UI_PLUGIN]) && plain[SETTINGS_UI_PLUGIN][MIGRATED_KEY]) return false;
    const legacy = readJson(SETTINGS_KEY, null);
    let copied = false;
    if (isRecord(legacy)) {
      for (const [oldName, entry] of Object.entries(legacy)) {
        if (!isRecord(entry)) continue;
        const name = LEGACY_NAMES[oldName] ?? oldName;
        for (const [key, value] of Object.entries(entry)) {
          if (isRecord(plain[name]) && key in plain[name]) continue;
          hostEntry(name)[key] = value;
          copied = true;
        }
      }
    }
    hostEntry(SETTINGS_UI_PLUGIN)[MIGRATED_KEY] = Date.now();
    if (copied) logger4.info("Copied CC++ 0.3 settings into Userscript++ storage");
    return copied;
  }
  onHost(
    (h5) => h5.SettingsStore.addPrefixChangeListener("plugins.", (value, path) => {
      const [, plugin, key] = path.split(".");
      if (!plugin || plugin === FRAMEWORK_PLUGIN) return;
      if (key) return announce(plugin, key);
      const keys = isRecord(value) ? Object.keys(value) : [];
      keys.sort((x4, y3) => Number(y3 === "enabled") - Number(x4 === "enabled"));
      for (const k4 of keys.length ? keys : ["enabled"]) announce(plugin, k4);
    })
  );
  function coerce(option, value) {
    switch (option.type) {
      case "action":
        return void 0;
      case "boolean":
        return typeof value === "boolean" ? value : option.default;
      case "number": {
        if (typeof value !== "number" || !Number.isFinite(value)) return option.default;
        const step2 = option.step ?? 1;
        const stepped = Math.round(value / step2) * step2;
        return Math.min(option.max, Math.max(option.min, Number(stepped.toFixed(6))));
      }
      case "select":
        return typeof value === "string" && option.options.some((o3) => o3.value === value) ? value : option.default;
      case "color":
        return typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value) ? value.toLowerCase() : option.default;
      case "string":
        return typeof value === "string" ? value.slice(0, option.maxLength ?? 2e3) : option.default;
      case "text":
        return typeof value === "string" ? value : option.default;
      case "image":
        return typeof value === "string" && isImageUrl(value) ? value : option.default;
    }
  }
  function isImageUrl(value) {
    const v3 = value.trim();
    if (!v3 || v3.startsWith("data:image/")) return true;
    try {
      return /^https?:$/.test(new URL(v3).protocol);
    } catch {
      return false;
    }
  }
  function definePluginSettings(def) {
    let owner = "";
    const store2 = new Proxy({}, {
      get: (_3, key) => def[key] ? coerce(def[key], getRaw(owner, key)) : void 0,
      set: (_3, key, value) => {
        setRaw(owner, key, value);
        return true;
      }
    });
    return {
      def,
      store: store2,
      bind: (plugin) => void (owner = plugin),
      owner: () => owner,
      reset: () => resetRaw(owner, Object.keys(def))
    };
  }

  // src/kernel/plugins.ts
  var logger5 = new Logger2("Plugins");
  var definePlugin = (def) => ({ ...def, scope: null });
  var plugins = /* @__PURE__ */ new Map();
  var allPlugins = () => [...plugins.values()];
  var getPlugin = (name) => plugins.get(name);
  var errors = /* @__PURE__ */ new Map();
  var errorListeners = /* @__PURE__ */ new Set();
  var pluginError = (name) => errors.get(name) ?? null;
  function onPluginStateChange(listener) {
    errorListeners.add(listener);
    return () => void errorListeners.delete(listener);
  }
  function notify(name) {
    for (const listener of [...errorListeners]) {
      try {
        listener(name);
      } catch {
      }
    }
  }
  function fail(plugin, stage, error2) {
    logger5.error(`${plugin.name} failed (${stage}):`, error2);
    const message = error2 instanceof Error ? error2.message || error2.name : String(error2);
    errors.set(plugin.name, { stage, message: message.slice(0, 300), at: Date.now() });
  }
  function isEnabled(plugin) {
    if (plugin.required) return true;
    const value = getRaw(plugin.name, "enabled");
    return typeof value === "boolean" ? value : !!plugin.enabledByDefault;
  }
  var setEnabled = (plugin, enabled) => setRaw(plugin.name, "enabled", enabled);
  var dependentsOf = (name) => allPlugins().filter((p4) => p4.dependencies?.includes(name));
  function isActive(plugin, seen3 = /* @__PURE__ */ new Set()) {
    if (isEnabled(plugin)) return true;
    if (seen3.has(plugin.name)) return false;
    seen3.add(plugin.name);
    return dependentsOf(plugin.name).some((p4) => isActive(p4, seen3));
  }
  var activeDependents = (name) => dependentsOf(name).filter((p4) => isActive(p4));
  var pluginInfo = (plugin) => ({
    name: plugin.name,
    category: plugin.category,
    enabled: isEnabled(plugin),
    active: isActive(plugin),
    running: !!plugin.scope,
    required: !!plugin.required,
    hidden: !!plugin.hidden,
    dependencies: [...plugin.dependencies ?? []],
    error: pluginError(plugin.name)
  });
  var bootActive = /* @__PURE__ */ new Map();
  function registerOne(plugin) {
    if (plugins.has(plugin.name)) return plugins.get(plugin.name);
    plugins.set(plugin.name, plugin);
    plugin.settings?.bind(plugin.name);
    return plugin;
  }
  var booted = false;
  function noteBoot() {
    if (booted) return;
    booted = true;
    for (const plugin of plugins.values()) bootActive.set(plugin.name, isActive(plugin));
    trackSeen();
  }
  var pendingRestart = () => allPlugins().filter((p4) => p4.restartNeeded && bootActive.get(p4.name) !== isActive(p4));
  var SEEN_KEY = "plugins-seen";
  var NEW_FOR_MS = 3 * 24 * 3600 * 1e3;
  var RECENT_FOR_MS = 7 * 24 * 3600 * 1e3;
  var seen = {};
  function trackSeen(now2 = Date.now()) {
    const stored = readJson(SEEN_KEY, null);
    const first = !stored || typeof stored !== "object";
    seen = first ? {} : { ...stored };
    let changed2 = first;
    for (const name of plugins.keys()) {
      if (typeof seen[name] === "number") continue;
      seen[name] = first ? 0 : now2;
      changed2 = true;
    }
    if (changed2) writeJson(SEEN_KEY, seen);
  }
  var isNew = (name, now2 = Date.now()) => (seen[name] ?? 0) > 0 && now2 - seen[name] < NEW_FOR_MS;
  function isRecent(plugin, now2 = Date.now()) {
    if (isNew(plugin.name, now2)) return true;
    const at = plugin.updatedAt ? Date.parse(plugin.updatedAt) : NaN;
    return Number.isFinite(at) && now2 >= at && now2 - at < RECENT_FOR_MS;
  }
  var phase = null;
  var phaseReached = (plugin) => phase === "dom-ready" || phase === "document-start" && plugin.startAt === "document-start";
  function runStart(plugin, rethrow = false) {
    if (plugin.scope) return true;
    const scope = new Scope();
    try {
      plugin.start(scope);
      plugin.scope = scope;
      errors.delete(plugin.name);
      notify(plugin.name);
      return true;
    } catch (error2) {
      scope.dispose();
      fail(plugin, "start", error2);
      notify(plugin.name);
      if (rethrow) throw error2;
      return false;
    }
  }
  function runStop(plugin) {
    if (!plugin.scope) return;
    const scope = plugin.scope;
    plugin.scope = null;
    try {
      plugin.stop?.();
    } catch (error2) {
      fail(plugin, "stop", error2);
    }
    scope.dispose();
    notify(plugin.name);
  }
  function startLocal(plugin) {
    if (plugin.scope) return true;
    for (const dep of plugin.dependencies ?? []) {
      const depPlugin = plugins.get(dep);
      if (!depPlugin || !startLocal(depPlugin)) {
        fail(plugin, "start", new Error(`Dependency ${dep} did not start`));
        notify(plugin.name);
        return false;
      }
    }
    return runStart(plugin);
  }
  function startOne(plugin) {
    if (plugin.scope) return true;
    const h5 = host();
    if (!h5) return startLocal(plugin);
    if (h5.plugins[plugin.name]?.started) return startLocal(plugin);
    try {
      h5.startPlugin(plugin.name);
    } catch (error2) {
      fail(plugin, "start", error2);
    }
    return !!plugin.scope;
  }
  function stopOne(plugin) {
    if (!plugin.scope) return;
    for (const dependent of dependentsOf(plugin.name)) stopOne(dependent);
    const h5 = host();
    if (h5?.plugins[plugin.name]?.started) {
      try {
        h5.stopPlugin(plugin.name);
      } catch (error2) {
        fail(plugin, "stop", error2);
      }
    }
    runStop(plugin);
  }
  function restartPlugin(plugin) {
    if (!plugin.scope) return;
    const running = dependentsOf(plugin.name).filter((p4) => p4.scope);
    const stopTree = (p4) => {
      for (const dependent of dependentsOf(p4.name)) if (dependent.scope) stopTree(dependent);
      runStop(p4);
    };
    stopTree(plugin);
    startLocal(plugin);
    for (const dependent of running) startLocal(dependent);
  }
  var reconciling = false;
  var again = false;
  function reconcile() {
    if (!phase) return;
    if (reconciling) {
      again = true;
      return;
    }
    reconciling = true;
    try {
      do {
        again = false;
        for (const plugin of plugins.values()) if (plugin.scope && !isActive(plugin)) stopOne(plugin);
        for (const plugin of plugins.values()) if (!plugin.scope && isActive(plugin) && phaseReached(plugin) && !errors.has(plugin.name)) startOne(plugin);
      } while (again);
    } finally {
      reconciling = false;
    }
  }
  function startPhase(next) {
    phase = next;
    reconcile();
    if (next === "dom-ready") scheduleRetries();
  }
  function startEarly() {
    const h5 = host();
    if (!h5 || phase) return;
    noteBoot();
    if (h5.isSafeMode()) return;
    phase = "document-start";
    for (const plugin of plugins.values()) {
      if (plugin.startAt !== "document-start" || plugin.scope || !isActive(plugin)) continue;
      startLocal(plugin);
    }
  }
  function enterPhase(next) {
    if (phase === "dom-ready") return;
    phase = next;
  }
  var RETRY_DELAYS_MS = [1500, 4e3, 1e4];
  function scheduleRetries() {
    for (const delay of RETRY_DELAYS_MS) setTimeout(retryFailed, delay);
  }
  function retryFailed() {
    for (const plugin of plugins.values()) {
      if (plugin.scope || !isActive(plugin) || errors.get(plugin.name)?.stage !== "start") continue;
      errors.delete(plugin.name);
      startOne(plugin);
    }
  }
  onSettingsChange((name, key) => {
    if (key === "enabled") {
      const plugin2 = plugins.get(name);
      if (plugin2) errors.delete(plugin2.name);
      reconcile();
      return;
    }
    const plugin = plugins.get(name);
    if (!plugin?.scope || !plugin.settings?.def[key]) return;
    if (!plugin.onSettingsChange) {
      restartPlugin(plugin);
      return;
    }
    try {
      plugin.onSettingsChange(key, plugin.scope);
    } catch (error2) {
      fail(plugin, "settings", error2);
      notify(plugin.name);
    }
  });

  // src/lib/page.ts
  var pageWindow = typeof unsafeWindow !== "undefined" && unsafeWindow ? unsafeWindow : typeof window !== "undefined" ? window : globalThis;
  var isDark = () => document.documentElement.dataset.mode === "dark" || !document.documentElement.dataset.mode && matchMedia?.("(prefers-color-scheme: dark)").matches;

  // src/lib/dom.ts
  function h4(tag, attrs = {}, ...children) {
    const el = document.createElement(tag);
    for (const [key, value] of Object.entries(attrs)) {
      if (value == null || value === false) continue;
      if (key.startsWith("on") && typeof value === "function") el.addEventListener(key.slice(2).toLowerCase(), value);
      else if (key === "style" && typeof value === "object") Object.assign(el.style, value);
      else if (key === "class") el.className = String(value);
      else if (key === "text") el.textContent = String(value);
      else if (key in el && typeof value !== "string" && key !== "role") el[key] = value;
      else el.setAttribute(key, value === true ? "" : String(value));
    }
    append(el, children);
    return el;
  }
  function append(parent, children) {
    for (const child of children) {
      if (child == null || child === false) continue;
      parent.appendChild(typeof child === "object" ? child : document.createTextNode(String(child)));
    }
  }
  var clear = (el) => {
    while (el.firstChild) el.firstChild.remove();
  };
  function isShown(el) {
    if (!el || !el.isConnected) return false;
    const rect = el.getBoundingClientRect();
    return rect.width > 0 || rect.height > 0;
  }
  function download(filename, content, type = "text/plain") {
    const url = URL.createObjectURL(new Blob([content], { type: `${type};charset=utf-8` }));
    const a3 = h4("a", { href: url, download: filename, style: { display: "none" } });
    document.body.appendChild(a3);
    a3.click();
    a3.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5e3);
  }
  var fileSafe = (name) => name.replace(/[\\/:*?"<>|\u0000-\u001f]+/g, " ").replace(/\s+/g, " ").trim().slice(0, 120) || "untitled";
  var isEditable = (el) => {
    if (!(el instanceof HTMLElement)) return false;
    return el.isContentEditable || el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT";
  };

  // src/lib/tooltip.ts
  var TIP = "data-ccpp-tip";
  var TIP_DETAIL = "data-ccpp-tip-detail";
  var tipAttrs = (title, detail) => detail ? { [TIP]: title, [TIP_DETAIL]: detail } : { [TIP]: title };
  var card = null;
  var current3 = null;
  var showTimer;
  var lastHidden = 0;
  function ensureCard() {
    if (card?.isConnected) return card;
    card = h4("div", {
      role: "tooltip",
      "data-ccpp-tooltip": "",
      style: {
        position: "fixed",
        zIndex: "2147483601",
        pointerEvents: "none",
        display: "none",
        flexDirection: "column",
        gap: "2px",
        maxWidth: "240px",
        padding: "6px 8px",
        borderRadius: "calc(0.375rem * var(--cds-rem-scale, 1))",
        background: "var(--cds-tooltip-bg, rgb(48,48,48))",
        color: "var(--cds-tooltip-fg, rgba(255,255,255,.93))",
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,.1), 0 1px 2px rgba(11,11,11,.06), 0 2px 8px rgba(0,0,0,.24)",
        font: "400 calc(0.8125rem * var(--cds-rem-scale, 1))/calc(1.125rem * var(--cds-rem-scale, 1)) var(--cds-font-sans, ui-sans-serif, system-ui, sans-serif)",
        textWrap: "balance",
        whiteSpace: "normal",
        overflowWrap: "anywhere",
        textAlign: "start"
      }
    });
    document.body.appendChild(card);
    return card;
  }
  function showTip(anchor, title, detail = "") {
    if (!title) return hideTip();
    const el = ensureCard();
    el.replaceChildren(
      h4("span", { text: title }),
      ...detail ? [h4("span", { text: detail, style: { fontSize: "calc(0.6875rem * var(--cds-rem-scale, 1))", lineHeight: "calc(0.875rem * var(--cds-rem-scale, 1))", color: "color-mix(in srgb, var(--cds-tooltip-fg, #fff) 64%, transparent)" } })] : []
    );
    el.style.display = "flex";
    const a3 = anchor.getBoundingClientRect();
    const r3 = el.getBoundingClientRect();
    el.style.left = `${Math.min(Math.max(8, a3.left + a3.width / 2 - r3.width / 2), window.innerWidth - r3.width - 8)}px`;
    el.style.top = `${a3.top - r3.height - 4 >= 8 ? a3.top - r3.height - 4 : a3.bottom + 4}px`;
    current3 = anchor;
  }
  function hideTip() {
    clearTimeout(showTimer);
    if (card && card.style.display !== "none") lastHidden = Date.now();
    if (card) card.style.display = "none";
    current3 = null;
  }
  var tipTarget = (event) => event.composedPath().find((n2) => n2 instanceof Element && n2.hasAttribute(TIP)) ?? null;
  var installed = false;
  function installTooltips() {
    if (installed) return;
    installed = true;
    document.addEventListener(
      "pointerover",
      (event) => {
        const target2 = tipTarget(event);
        if (target2 === current3) return;
        clearTimeout(showTimer);
        if (!target2) return hideTip();
        const open = () => target2.isConnected && showTip(target2, target2.getAttribute(TIP) ?? "", target2.getAttribute(TIP_DETAIL) ?? "");
        if (current3 || Date.now() - lastHidden < 400) open();
        else showTimer = setTimeout(open, 500);
      },
      true
    );
    document.addEventListener("pointerout", (event) => !event.relatedTarget && hideTip(), true);
    for (const type of ["pointerdown", "keydown", "scroll", "blur"]) window.addEventListener(type, hideTip, true);
    setInterval(() => current3 && !current3.isConnected && hideTip(), 500);
  }

  // src/kernel/i18n.ts
  function claudeLocale() {
    try {
      const stored = globalThis.localStorage?.getItem("spa:locale");
      if (stored) return stored.replace(/^"|"$/g, "");
    } catch {
    }
    return globalThis.document?.documentElement?.lang ?? "";
  }
  var detect = () => /^zh/i.test(claudeLocale()) ? "zh" : "en";
  var mode = "auto";
  var lang = detect();
  var getLang = () => lang;
  var setLang = (next) => void (mode = next, lang = next === "auto" ? detect() : next);
  var t3 = (text) => typeof text === "string" ? text : text[lang];
  try {
    new MutationObserver(() => mode === "auto" && (lang = detect())).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
  } catch {
  }

  // src/lib/icons.ts
  var p3 = (d3) => ["path", { d: d3 }];
  var c3 = (cx, cy, r3) => ["circle", { cx, cy, r: r3 }];
  var ICONS = {
    plug: [p3("M12 22v-5"), p3("M9 8V2"), p3("M15 8V2"), p3("M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z")],
    settings: [c3(12, 12, 3), p3("M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z")],
    star: [p3("M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z")],
    pin: [p3("M12 17v5"), p3("M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z")],
    x: [p3("M18 6 6 18"), p3("m6 6 12 12")],
    search: [c3(11, 11, 8), p3("m21 21-4.3-4.3")],
    refresh: [p3("M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"), p3("M3 3v5h5"), p3("M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"), p3("M16 16h5v5")],
    download: [p3("M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"), p3("m7 10 5 5 5-5"), p3("M12 15V3")],
    upload: [p3("M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"), p3("m17 8-5-5-5 5"), p3("M12 3v12")],
    history: [p3("M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"), p3("M3 3v5h5"), p3("M12 7v5l4 2")],
    list: [p3("M8 6h13"), p3("M8 12h13"), p3("M8 18h13"), p3("M3 6h.01"), p3("M3 12h.01"), p3("M3 18h.01")],
    gauge: [p3("m12 14 4-4"), p3("M3.34 19a10 10 0 1 1 17.32 0")],
    bell: [p3("M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"), p3("M10.3 21a1.94 1.94 0 0 0 3.4 0")],
    eyeOff: [p3("M9.88 9.88a3 3 0 1 0 4.24 4.24"), p3("M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"), p3("M6.61 6.61A13.53 13.53 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"), p3("m2 2 20 20")],
    width: [p3("M21 12H3"), p3("m7 8-4 4 4 4"), p3("m17 8 4 4-4 4")],
    palette: [c3(13.5, 6.5, 0.5), c3(17.5, 10.5, 0.5), c3(8.5, 7.5, 0.5), c3(6.5, 12.5, 0.5), p3("M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.65-.75 1.65-1.69 0-.44-.18-.84-.44-1.13-.29-.29-.44-.65-.44-1.13a1.64 1.64 0 0 1 1.67-1.67h2c3.05 0 5.56-2.5 5.56-5.55C21.97 6.01 17.46 2 12 2z")],
    message: [p3("M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z")],
    keyboard: [p3("M2 6h20v12H2z"), p3("M6 10h.01"), p3("M10 10h.01"), p3("M14 10h.01"), p3("M18 10h.01"), p3("M7 14h10")],
    code: [p3("m16 18 6-6-6-6"), p3("m8 6-6 6 6 6")],
    link: [p3("M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"), p3("M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71")],
    clock: [c3(12, 12, 10), p3("M12 6v6l4 2")],
    shield: [p3("M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z")],
    sparkles: [p3("M9.94 14.06 4 20"), p3("M12 3l1.9 5.8L20 10l-6.1 1.2L12 17l-1.9-5.8L4 10l6.1-1.2z")],
    trash: [p3("M3 6h18"), p3("M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"), p3("M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2")],
    chevronDown: [p3("m6 9 6 6 6-6")],
    chevronRight: [p3("m9 18 6-6-6-6")],
    brush: [p3("m9.06 11.9 8.07-8.06a2.85 2.85 0 1 1 4.03 4.03l-8.06 8.08"), p3("M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 2.02 1.08 1.1 2.49 2.02 4 2.02 2.2 0 4-1.8 4-4.04a3.01 3.01 0 0 0-3-3.02z")],
    linkOff: [p3("M9 17H7A5 5 0 0 1 7 7"), p3("M15 7h2a5 5 0 0 1 4 8"), p3("M8 12h4"), p3("m2 2 20 20")],
    micOff: [p3("m2 2 20 20"), p3("M18.89 13.23A7.12 7.12 0 0 0 19 12v-2"), p3("M5 10v2a7 7 0 0 0 12 5"), p3("M15 9.34V5a3 3 0 0 0-5.68-1.33"), p3("M9 9v3a3 3 0 0 0 5.12 2.12"), p3("M12 19v3")],
    user: [c3(12, 8, 5), p3("M20 21a8 8 0 0 0-16 0")],
    creditCard: [p3("M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z"), p3("M2 10h20")],
    brain: [p3("M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"), p3("M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"), p3("M12 5v13")],
    grid: [p3("M3 3h7v7H3z"), p3("M14 3h7v7h-7z"), p3("M14 14h7v7h-7z"), p3("M3 14h7v7H3z")],
    fileText: [p3("M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"), p3("M14 2v4a2 2 0 0 0 2 2h4"), p3("M16 13H8"), p3("M16 17H8"), p3("M10 9H8")],
    terminal: [p3("m4 17 6-6-6-6"), p3("M12 19h8")],
    incognito: [p3("M2 12h20"), p3("M5 12l2-7h10l2 7"), c3(7, 17, 3), c3(17, 17, 3), p3("M10 17h4")],
    blend: [c3(9, 9, 7), c3(15, 15, 7)],
    tab: [p3("M3 5h18v14H3z"), p3("M3 9h18")],
    collapse: [p3("m7 20 5-5 5 5"), p3("m7 4 5 5 5-5")],
    puzzle: [p3("M19.44 12.06a2 2 0 1 0-2.83-2.83L14 6.6V4a2 2 0 0 0-2-2H8v2.5a2 2 0 1 1-4 0V2H2v6h2.5a2 2 0 1 1 0 4H2v8h8v-2.5a2 2 0 1 1 4 0V20h4a2 2 0 0 0 2-2v-4l-.56-1.94Z")],
    sliders: [p3("M4 21v-7"), p3("M4 10V3"), p3("M12 21v-9"), p3("M12 8V3"), p3("M20 21v-5"), p3("M20 12V3"), p3("M2 14h4"), p3("M10 8h4"), p3("M18 16h4")],
    globe: [c3(12, 12, 10), p3("M2 12h20"), p3("M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z")],
    folder: [p3("M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z")],
    copy: [p3("M8 8h12v12H8z"), p3("M4 16V6a2 2 0 0 1 2-2h10")],
    pencil: [p3("M21.17 6.81a1 1 0 0 0-3.99-3.99L3.84 16.17a2 2 0 0 0-.5.83l-1.32 4.35a.5.5 0 0 0 .62.62l4.35-1.32a2 2 0 0 0 .83-.5z"), p3("m15 5 4 4")],
    plus: [p3("M5 12h14"), p3("M12 5v14")],
    alert: [p3("m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"), p3("M12 9v4"), p3("M12 17h.01")],
    info: [c3(12, 12, 10), p3("M12 16v-4"), p3("M12 8h.01")],
    braces: [p3("M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5c0 1.1.9 2 2 2h1"), p3("M16 21h1a2 2 0 0 0 2-2v-5c0-1.1.9-2 2-2a2 2 0 0 1-2-2V5a2 2 0 0 0-2-2h-1")]
  };
  var GLYPHS = {
    plug: 57613,
    settings: 57558,
    star: 57575,
    pin: 57533,
    x: 57615,
    search: 57555,
    refresh: 57629,
    download: 57443,
    upload: 57562,
    history: 57481,
    list: 57500,
    gauge: 57647,
    bell: 57524,
    eyeOff: 57450,
    width: 57366,
    palette: 57522,
    message: 57399,
    keyboard: 57490,
    code: 57417,
    link: 57498,
    clock: 57411,
    shield: 57602,
    sparkles: 57607,
    trash: 57601,
    chevronDown: 57383,
    chevronRight: 57386,
    brush: 57661,
    linkOff: 57437,
    micOff: 57517,
    user: 57606,
    creditCard: 57432,
    brain: 57512,
    grid: 57476,
    fileText: 57452,
    terminal: 57423,
    incognito: 57461,
    blend: 57559,
    tab: 57574,
    collapse: 57421,
    puzzle: 57376,
    sliders: 57456,
    globe: 57618,
    folder: 57458,
    copy: 57455,
    pencil: 57444,
    plus: 57345,
    braces: 57418,
    alert: 57609,
    info: 57486
  };
  function glyph(name) {
    const code = GLYPHS[name];
    return code ? String.fromCodePoint(code) : null;
  }
  var iconNames = Object.keys(ICONS);
  function icon(name, size = 16, strokeWidth = 2) {
    const ns = "http://www.w3.org/2000/svg";
    const svg2 = document.createElementNS(ns, "svg");
    const attrs = {
      width: String(size),
      height: String(size),
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      "stroke-width": String(strokeWidth),
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      "aria-hidden": "true"
    };
    for (const [key, value] of Object.entries(attrs)) svg2.setAttribute(key, value);
    for (const [tag, shapeAttrs] of ICONS[name] ?? ICONS.puzzle) {
      const el = document.createElementNS(ns, tag);
      for (const [key, value] of Object.entries(shapeAttrs)) el.setAttribute(key, String(value));
      svg2.appendChild(el);
    }
    return svg2;
  }

  // src/plugins/_api/hotkeys/index.ts
  var isMac = () => /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  function parseCombo(spec) {
    const parts = spec.toLowerCase().split("+").map((s3) => s3.trim()).filter(Boolean);
    const combo = { key: "", ctrl: false, alt: false, shift: false, meta: false };
    for (const part of parts) {
      if (part === "mod") combo[isMac() ? "meta" : "ctrl"] = true;
      else if (part === "ctrl" || part === "control") combo.ctrl = true;
      else if (part === "alt" || part === "option") combo.alt = true;
      else if (part === "shift") combo.shift = true;
      else if (part === "meta" || part === "cmd") combo.meta = true;
      else combo.key = part;
    }
    return combo;
  }
  var CODE_KEYS = { Backquote: "`", Comma: ",", Period: ".", Slash: "/", Semicolon: ";", BracketLeft: "[", BracketRight: "]" };
  function matches(event, combo) {
    const key = CODE_KEYS[event.code] ?? (event.code.startsWith("Key") ? event.code.slice(3).toLowerCase() : event.code.startsWith("Digit") ? event.code.slice(5) : event.key.toLowerCase());
    return key === combo.key && event.ctrlKey === combo.ctrl && event.altKey === combo.alt && event.shiftKey === combo.shift && event.metaKey === combo.meta;
  }
  function comboKeys(spec) {
    const combo = parseCombo(spec);
    const mac = isMac();
    const parts = [combo.ctrl && (mac ? "⌃" : "Ctrl"), combo.alt && (mac ? "⌥" : "Alt"), combo.shift && (mac ? "⇧" : "Shift"), combo.meta && (mac ? "⌘" : "Win"), combo.key.length === 1 ? combo.key.toUpperCase() : combo.key];
    return parts.filter((p4) => !!p4);
  }
  function comboLabel(spec) {
    return comboKeys(spec).join(isMac() ? "" : "+");
  }
  function bindKey(scope, spec, fn2, options = {}) {
    const combo = parseCombo(spec);
    scope.listen(
      window,
      "keydown",
      (event) => {
        if (event.isComposing || !matches(event, combo)) return;
        if (!options.inInputs && isEditable(event.target)) return;
        event.preventDefault();
        event.stopPropagation();
        fn2(event);
      },
      { capture: true }
    );
  }
  var hotkeys_default = definePlugin({
    name: "HotkeysApi",
    title: { zh: "快捷键", en: "Hotkeys API" },
    description: { zh: "统一注册快捷键（mod 在 macOS 上是 ⌘，其它系统是 Ctrl）。", en: "Shortcut registration for plugins (mod = ⌘ on macOS, Ctrl elsewhere)." },
    category: "api",
    icon: "keyboard",
    hidden: true,
    start() {
    }
  });

  // src/plugins/_api/menu/index.ts
  var nextId = 0;
  function addMenuCommand(scope, name, fn2) {
    const U3 = host();
    if (U3) {
      const id = `ccpp-menu-${++nextId}`;
      U3.addSlotItem("menuCommand", id, { label: name, order: -2e3 + nextId, onSelect: fn2 });
      scope.defer(() => U3.removeSlotItem("menuCommand", id));
      return;
    }
    if (typeof GM_registerMenuCommand !== "function") return;
    try {
      const id = GM_registerMenuCommand(name, fn2);
      scope.defer(() => {
        try {
          if (typeof GM_unregisterMenuCommand === "function") GM_unregisterMenuCommand(id);
        } catch {
        }
      });
    } catch {
    }
  }
  var menu_default = definePlugin({
    name: "MenuApi",
    title: { zh: "脚本菜单", en: "Userscript menu API" },
    description: { zh: "在脚本管理器菜单里添加命令。", en: "Adds commands to the userscript manager's menu." },
    category: "api",
    icon: "list",
    hidden: true,
    start() {
    }
  });

  // src/plugins/_api/styles/index.ts
  var container = null;
  function ensureContainer() {
    if (container?.isConnected) return container;
    container ??= h4("div", { id: "ccpp-styles", hidden: true });
    (document.head ?? document.documentElement).appendChild(container);
    return container;
  }
  function addStyle(scope, css2, id) {
    const style = h4("style", { "data-ccpp-style": id ?? "" });
    style.textContent = css2;
    ensureContainer().appendChild(style);
    scope.defer(() => style.remove());
    return (next) => void (style.textContent = next);
  }
  var styles_default = definePlugin({
    name: "StylesApi",
    title: { zh: "样式注入", en: "Styles API" },
    description: { zh: "管理各插件注入的页面样式，插件停用时自动移除。", en: "Page stylesheets for plugins, removed when a plugin stops." },
    category: "api",
    icon: "palette",
    hidden: true,
    startAt: "document-start",
    start(scope) {
      ensureContainer();
      scope.interval(() => {
        if (container && container.parentNode && container !== container.parentNode.lastElementChild && document.head) document.head.appendChild(container);
      }, 3e3);
      scope.defer(() => {
        container?.remove();
        container = null;
      });
    }
  });

  // src/plugins/_api/dom/selectors.ts
  var SEL = {
    sidebar: '[data-testid="sidebar"]',
    sidebarRecents: '[data-testid="sidebar-recents"]',
    sidebarChatLink: 'a[href^="/chat/"]',
    /** The Code side of the Chat / Code switch at the top of the sidebar (locale-independent). */
    modeCode: '[role="radiogroup"] [role="radio"][data-mode="code"]',
    userMenuButton: '[data-testid="user-menu-button"]',
    userMenuName: '[data-testid="user-menu-button"] .df-user-menu-trailing',
    avatar: '[data-cds="Avatar"]',
    /** claude.ai's account menu (the popup of the avatar button), told apart from other menus by its Settings row. */
    accountMenu: '[role="menu"]:has([data-testid="user-menu-settings"])',
    chatHeader: '[data-testid="chat-header"]',
    headerActions: "#dframe-header-actions-slot",
    shareButton: '[data-testid="wiggle-controls-actions-share"]',
    transcript: '[data-testid="transcript-list"]',
    transcriptFeed: '[role="feed"][aria-label]',
    transcriptRow: '[data-testid="transcript-row"]',
    scroller: '[data-autoscroll-container="true"]',
    /** Chats mark your messages with a test id; Claude Code project chats only with data-cds. */
    userMessage: ':is([data-testid="user-message"], [data-cds="UserMessage"])',
    userMessageBody: ".cds-user-message-body",
    assistantMessage: '[data-testid="assistant-message"]',
    streaming: '[data-testid="assistant-message"][data-is-streaming="true"]',
    messageActions: '[data-testid="message-actions"]',
    /** The action bar under your own message (it fades in on hover; the time is its first child). */
    userMessageActions: '[data-testid="user-message-actions"]',
    /** Your message after claude.ai gave up sending it ("Failed to send · Retry · Discard"). */
    failedSend: '[data-cds="UserMessage"][data-state="failed"]',
    /** The Retry link on a failed message: the text link that isn't Discard (it has no test id of its own). */
    failedSendRetry: '[data-cds="TextLink"][role="button"]:not([data-testid="failed-send-discard"])',
    messageTime: 'time[data-cds="RelativeTime"]',
    prose: '[data-cds="Prose"]',
    composer: '[data-cds="ChatComposer"]',
    composerCard: "[data-composer-card-holder]",
    /** Chat input, or the Claude Code prompt (home, sessions and project threads). */
    editor: ':is([data-testid="chat-input"], [data-testid="code-prompt-input"])',
    sendButton: ':is([data-testid="chat-input-send"], [data-testid="code-prompt-send"])',
    /** Chat model picker, or the Claude Code one (home, sessions, project threads). */
    modelSelector: ':is([data-testid="model-selector-dropdown"], [data-testid="epitaxy-cds-model-selector"], [data-testid="environment-row-model"])',
    greeting: "[data-new-page-greeting-text]",
    /** The Claude spark beside the home greeting; layouts without the text marker are found from it. */
    greetingSpark: ':is([data-new-page-greeting-spark], svg[data-cds="Spark"])',
    /** A project page's Threads panel: its Waiting on you / Working / Idle / Resolved groups. */
    threadsPanel: ":is([data-home-section], [data-home-group], [data-home-heading])",
    /**
     * Text the user or Claude wrote: messages, the input, and links to chats, sessions, projects and threads
     * (their titles), in the sidebar or the Threads panel. Hiders matching claude.ai's own wording skip these,
     * so a chat titled "Upgrade" or "隐藏用量限制提示条" stays put.
     */
    userContent: ':is([data-testid="transcript-list"], [data-testid="transcript-row"], [data-testid="chat-input"], [data-testid="code-prompt-input"], [data-testid="sidebar-recents"], [data-home-section], [data-home-group], [data-home-heading], a[href^="/chat/"], a[href^="/code/"], a[href^="/project/"], a[href*="?thread="], [contenteditable="true"], textarea)',
    menu: '[role="menu"]',
    menuItem: '[role="menuitem"]',
    jumpToLatest: '[data-testid="jump-to-latest"]'
  };

  // src/plugins/_api/dom/index.ts
  var logger6 = new Logger2("DomApi");
  var watchers = /* @__PURE__ */ new Set();
  var observer = null;
  var pending = null;
  var FLUSH_MS = 60;
  function runCleanup(cleanup2) {
    try {
      cleanup2?.();
    } catch (error2) {
      logger6.error("Watcher cleanup failed:", error2);
    }
  }
  function flushWatcher(watcher) {
    let found;
    try {
      found = new Set(document.querySelectorAll(watcher.selector));
    } catch (error2) {
      logger6.error(`Watcher selector ${watcher.selector} failed:`, error2);
      return;
    }
    for (const [el, cleanup2] of watcher.live) {
      if (found.has(el) && el.isConnected) continue;
      watcher.live.delete(el);
      runCleanup(cleanup2);
    }
    for (const el of found) {
      if (watcher.live.has(el)) continue;
      try {
        watcher.live.set(el, watcher.onAdd(el));
      } catch (error2) {
        watcher.live.set(el, void 0);
        logger6.error(`Watcher for ${watcher.selector} failed:`, error2);
      }
    }
  }
  function flush() {
    pending = null;
    for (const watcher of [...watchers]) flushWatcher(watcher);
  }
  var schedule = () => {
    pending ??= setTimeout(flush, FLUSH_MS);
  };
  function watch(scope, selector, onAdd) {
    const watcher = { selector, onAdd, live: /* @__PURE__ */ new Map() };
    watchers.add(watcher);
    flushWatcher(watcher);
    scope.defer(() => {
      watchers.delete(watcher);
      for (const cleanup2 of watcher.live.values()) runCleanup(cleanup2);
      watcher.live.clear();
    });
  }
  function onDomChange(scope, fn2) {
    let timer2 = null;
    const run = () => {
      timer2 = null;
      if (scope.alive) fn2();
    };
    const observer2 = new MutationObserver(() => timer2 ??= setTimeout(run, FLUSH_MS));
    observer2.observe(document, { childList: true, subtree: true });
    scope.defer(() => {
      observer2.disconnect();
      if (timer2) clearTimeout(timer2);
    });
    fn2();
  }
  var MAX_BAR = 160;
  function barOf(el, y3) {
    if (el.closest(`${SEL.transcriptRow}, ${SEL.transcript}, ${SEL.composer}`)) return null;
    for (let node = el; node && node !== document.body; node = node.parentElement) {
      const r3 = node.getBoundingClientRect();
      if (r3.height > MAX_BAR) return null;
      if (r3.top <= y3 && r3.bottom > y3 && /^(fixed|sticky|absolute)$/.test(getComputedStyle(node).position)) return r3;
    }
    return null;
  }
  function topBarBottom(x4, from) {
    let bottom = from;
    for (let step2 = 0; step2 < 4; step2++) {
      const y3 = bottom + 2;
      const hit = document.elementsFromPoint(x4, y3).find((el) => !el.closest("[data-ccpp]"));
      const bar = hit && barOf(hit, y3);
      if (!bar || bar.bottom <= bottom) break;
      bottom = bar.bottom;
    }
    for (const el of document.querySelectorAll(`${SEL.chatHeader}, [data-cds="Toolbar"]`)) {
      if (el.closest(`${SEL.transcriptRow}, [data-ccpp]`)) continue;
      const r3 = el.getBoundingClientRect();
      if (r3.width && r3.left <= x4 && r3.right >= x4 && r3.top <= from + 8 && r3.bottom > from && r3.height <= MAX_BAR) bottom = Math.max(bottom, r3.bottom);
    }
    return Math.min(bottom, from + MAX_BAR);
  }
  var dom_default = definePlugin({
    name: "DomApi",
    title: { zh: "DOM 观察", en: "DOM API" },
    description: { zh: "一个共享的 MutationObserver，供其它插件监听 claude.ai 元素的出现与消失。", en: "One shared MutationObserver that tells plugins when claude.ai elements appear and leave." },
    category: "api",
    icon: "code",
    hidden: true,
    startAt: "document-start",
    start(scope) {
      const mine = new MutationObserver(schedule);
      observer = mine;
      mine.observe(document, { childList: true, subtree: true });
      scope.defer(() => {
        mine.disconnect();
        if (observer !== mine) return;
        observer = null;
        if (pending) clearTimeout(pending);
        pending = null;
      });
    }
  });

  // src/plugins/_api/slots/index.ts
  var items = /* @__PURE__ */ new Set();
  var containers = /* @__PURE__ */ new Map([["composer", /* @__PURE__ */ new Set()], ["header", /* @__PURE__ */ new Set()], ["codeHeader", /* @__PURE__ */ new Set()]]);
  var CSS2 = `
.ccpp-slot { display: inline-flex; align-items: center; gap: 4px; flex: none; }
.ccpp-slot:empty { display: none; }
.ccpp-slot-composer { margin-inline-end: 4px; }
.ccpp-slot-header { margin-inline-end: 4px; }
.ccpp-slot-codeHeader { margin-inline: 0; }
.ccpp-slot-codeHeader .ccpp-slot-btn { min-width: var(--cds-h-control, 32px); height: var(--cds-h-control, 32px); padding: 0 6px; border-radius: calc(0.375rem * var(--cds-rem-scale, 1)); }
.ccpp-slot-btn { display: inline-flex; align-items: center; justify-content: center; gap: 4px; min-width: 32px; height: 32px; padding: 0 8px; border-radius: 8px; border: 0; background: transparent; color: var(--cds-text-secondary, inherit); font: inherit; font-size: 12px; cursor: pointer; }
/* Same colors and hover as claude.ai's ghost buttons next to it. */
.ccpp-slot-btn:hover { color: var(--cds-text-primary, inherit); background: var(--cds-fill-ghost-hover, rgba(127,127,127,.14)); }
.ccpp-slot-btn.on { color: var(--cds-clay, #d97757); opacity: 1; }
.ccpp-slot-btn[hidden] { display: none; }
`;
  function place(item, container3) {
    let node = item.nodes.get(container3);
    if (!node || !node.isConnected) {
      node = item.render();
      node.dataset.ccppItem = item.id;
      item.nodes.set(container3, node);
    }
    const siblings = [...container3.children];
    const before = siblings.find((el) => el !== node && Number(el.dataset.ccppOrder ?? 0) > item.order);
    node.dataset.ccppOrder = String(item.order);
    if (node.parentNode !== container3 || before && node.nextSibling !== before) container3.insertBefore(node, before ?? null);
  }
  function fill(container3, slot) {
    for (const item of items) if (item.slot === slot) place(item, container3);
  }
  function addSlotItem(scope, slot, id, render, order = 0) {
    const item = { id, slot, order, render, nodes: /* @__PURE__ */ new Map() };
    items.add(item);
    for (const container3 of containers.get(slot)) place(item, container3);
    scope.defer(() => {
      items.delete(item);
      for (const node of item.nodes.values()) node.remove();
      item.nodes.clear();
    });
    return item;
  }
  function refreshSlotItem(item) {
    for (const [container3, node] of item.nodes) {
      const next = item.render();
      next.dataset.ccppItem = item.id;
      next.dataset.ccppOrder = String(item.order);
      node.replaceWith(next);
      item.nodes.set(container3, next);
    }
  }
  var slotButton = (label, onClick, ...children) => h4("button", { type: "button", class: "ccpp-slot-btn", "aria-label": label, ...tipAttrs(label), onclick: onClick }, ...children);
  var CODE_TITLE = '[data-pane-title], [data-perf-region="side_pane"] [data-top-right] [data-cds="OverflowTooltip"]';
  var isDragHandle = (b3) => /(^|\s)tiles-drag-handle(\s|$)/.test(b3.className) || b3.matches("[data-drag-handle], [aria-roledescription='drag handle']");
  function codeHeaderAnchor(title) {
    const toolbar = title.closest('[data-cds="Toolbar"]');
    const last2 = toolbar && [...toolbar.querySelectorAll("button")].filter((b3) => !b3.closest(".ccpp-slot") && !isDragHandle(b3) && !title.contains(b3)).pop();
    if (toolbar && last2 && title.compareDocumentPosition(last2) & Node.DOCUMENT_POSITION_FOLLOWING) {
      let group = last2;
      while (group.parentElement && group.parentElement !== toolbar && !group.parentElement.contains(title)) group = group.parentElement;
      if (!group.contains(title) && group !== last2) return { anchor: group, where: "prepend" };
    }
    let branch = title;
    for (let depth = 0; depth < 6 && branch.parentElement; depth++) {
      const row = branch.parentElement;
      const button = [...row.querySelectorAll("button")].find(
        (b3) => !branch.contains(b3) && !b3.closest(".ccpp-slot") && !isDragHandle(b3) && branch.compareDocumentPosition(b3) & Node.DOCUMENT_POSITION_FOLLOWING
      );
      if (button) {
        let anchor2 = button;
        while (anchor2.parentElement && anchor2.parentElement !== row && anchor2.parentElement.children.length === 1) anchor2 = anchor2.parentElement;
        return { anchor: anchor2, where: "before" };
      }
      branch = row;
    }
    let anchor = title;
    while (anchor.parentElement && anchor.parentElement.children.length === 1) anchor = anchor.parentElement;
    return { anchor, where: "after" };
  }
  var slots_default = definePlugin({
    name: "SlotsApi",
    title: { zh: "界面插槽", en: "UI slots API" },
    description: { zh: "在输入框模型选择器旁、对话标题栏右侧放置插件按钮。", en: "Puts plugin controls next to the model picker and in the chat header." },
    category: "api",
    icon: "grid",
    hidden: true,
    dependencies: ["DomApi", "StylesApi"],
    start(scope) {
      addStyle(scope, CSS2, "slots");
      const mountIn = (slot, anchor, where) => {
        const container3 = h4("span", { class: `ccpp-slot ccpp-slot-${slot}`, "data-ccpp-slot": slot });
        if (where === "before") anchor.before(container3);
        else if (where === "after") anchor.after(container3);
        else anchor.prepend(container3);
        containers.get(slot).add(container3);
        fill(container3, slot);
        return () => {
          containers.get(slot).delete(container3);
          container3.remove();
        };
      };
      watch(scope, SEL.modelSelector, (el) => {
        let anchor = el;
        while (anchor.parentElement && anchor.parentElement.children.length === 1 && !anchor.parentElement.matches(SEL.composer)) anchor = anchor.parentElement;
        return mountIn("composer", anchor, "before");
      });
      watch(scope, SEL.headerActions, (el) => mountIn("header", el, "prepend"));
      watch(scope, CODE_TITLE, (el) => {
        if (!/^\/code\/[^/]/.test(location.pathname)) return;
        const { anchor, where } = codeHeaderAnchor(el);
        if ((where === "prepend" ? anchor : anchor.parentElement)?.querySelector(":scope > .ccpp-slot-codeHeader")) return;
        return mountIn("codeHeader", anchor, where);
      });
    }
  });

  // src/lib/ui.ts
  var BASE_CSS = `
:host { all: initial; }
/* claude.ai's own design tokens (--cds-*) cascade into shadow roots, so CC++ looks and themes
   like the page. The literals are fallbacks for when claude.ai renames a token. */
.ccpp { --bg: var(--cds-surface-2, #ffffff); --bg-nav: var(--cds-surface-1, #f5f4ef); --bg2: var(--cds-fill-ghost-hover, #f0eee6); --bg3: var(--cds-fill-ghost-selected, #e8e6dc);
  --fg: var(--cds-text-primary, #1f1e1d); --fg2: var(--cds-text-secondary, #5e5d59); --fg3: var(--cds-text-muted, #8f8d86);
  --line: var(--cds-alpha-2, rgba(31,30,29,.12)); --line-soft: var(--cds-alpha-1, rgba(31,30,29,.06));
  --accent: var(--cds-fill-accent, #257de0); --accent-fg: var(--cds-on-accent, #fff); --clay: var(--cds-clay, #d97757); --ok: var(--cds-fill-success, #10a122); --warn: var(--cds-fill-warning, #fbb315); --bad: var(--cds-fill-danger, #dc3c3d);
  --field: var(--cds-fill-field, transparent); --field-ring: var(--cds-fill-field-ring, rgba(31,30,29,.15));
  --radius: var(--cds-radius, 8px); --radius-card: calc(var(--cds-radius, 8px) + 4px); --h: var(--cds-h-control, 32px);
  --shadow: inset 0 0 0 var(--cds-ring-inner, 0) var(--cds-ring-color, transparent), 0 0 0 var(--cds-ring-outer, 1px) var(--cds-ring-color, rgba(31,30,29,.1)), var(--cds-shadow-lg, 0 8px 24px rgba(0,0,0,.14));
  --focus: var(--cds-focus-shadow, 0 0 0 2px #257de0);
  --fs: var(--cds-font-size-body, 14px); --fs-sm: var(--cds-font-size-footnote, 13px); --fs-xs: var(--cds-font-size-caption, 12px);
  font-size: var(--fs); line-height: 1.45; color: var(--fg); -webkit-font-smoothing: antialiased; }
.ccpp:not(.dark) { color-scheme: light; } .ccpp.dark { color-scheme: dark;
  --bg: var(--cds-surface-2, #262624); --bg-nav: var(--cds-surface-1, #1f1e1d); --bg2: var(--cds-fill-ghost-hover, rgba(255,255,255,.06)); --bg3: var(--cds-fill-ghost-selected, rgba(255,255,255,.1));
  --fg: var(--cds-text-primary, #f5f4ef); --fg2: var(--cds-text-secondary, #c2c0b6); --fg3: var(--cds-text-muted, #8f8d86);
  --line: var(--cds-alpha-2, rgba(255,255,255,.1)); --line-soft: var(--cds-alpha-1, rgba(255,255,255,.05)); --field-ring: var(--cds-fill-field-ring, rgba(255,255,255,.15)); }
.ccpp * { box-sizing: border-box; }
/* Scrollbars like claude.ai's (html: thin, a translucent text-colored thumb, no track); :host { all: initial }
   cuts the inherited value off, so it is set again here. */
.ccpp, .ccpp * { scrollbar-width: thin; scrollbar-color: color-mix(in srgb, var(--fg) 35%, transparent) transparent; }
.ccpp button { font: inherit; color: inherit; cursor: pointer; }
.ccpp :focus-visible { outline: none; box-shadow: var(--focus); }
.btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: var(--h); padding: 0 12px; border-radius: var(--radius); border: 0; background: var(--bg2); color: var(--fg); white-space: nowrap; }
.btn:hover { background: var(--bg3); }
.btn.ghost { background: transparent; } .btn.ghost:hover { background: var(--bg2); }
.btn.primary { background: var(--fg); color: var(--bg); } .btn.primary:hover { opacity: .9; }
.btn.danger { color: var(--bad); }
.btn:disabled { opacity: .45; cursor: default; }
.icon-btn { display: inline-grid; place-items: center; width: 28px; height: 28px; border-radius: var(--radius); border: 0; background: transparent; color: var(--fg3); }
.icon-btn:hover { background: var(--bg2); color: var(--fg); }
.icon-btn.on { color: var(--fg); }
.icon-btn:disabled { opacity: .35; pointer-events: none; }
.input { height: var(--h); padding: 0 10px; border-radius: var(--radius); border: 0; box-shadow: inset 0 0 0 1px var(--field-ring); background: var(--field); color: var(--fg); font: inherit; outline: none; width: 100%; }
.input::placeholder { color: var(--fg3); }
.input:focus, textarea.input:focus { outline: none; box-shadow: var(--focus); }
textarea.input { height: auto; padding: 8px 10px; resize: vertical; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 12px; line-height: 1.5; }
select.input { padding-right: 6px; }
/* Same proportions as claude.ai's Switch: height h, width 1.8h, 2px inset knob. */
.switch { --sh: var(--cds-switch-h, 20px); position: relative; width: calc(var(--sh) * 1.8); height: var(--sh); flex: none; border-radius: 999px; border: 0; padding: 0; background: var(--cds-switch-track, rgba(127,127,127,.35)); transition: background .15s; }
.switch:hover { background: var(--cds-switch-track-hover, rgba(127,127,127,.45)); }
.switch::after { content: ""; position: absolute; top: 2px; left: 2px; width: calc(var(--sh) - 4px); height: calc(var(--sh) - 4px); border-radius: 50%; background: var(--cds-switch-knob, #fff); box-shadow: 0 1px 2px rgba(0,0,0,.2); transition: transform .18s cubic-bezier(.3,1.4,.6,1); }
.switch[aria-checked="true"] { background: var(--accent); }
.switch[aria-checked="true"]::after { transform: translateX(calc(var(--sh) * .8)); }
.switch:disabled { opacity: .45; cursor: default; }
.muted { color: var(--fg3); }
.badge { display: inline-flex; align-items: center; height: 18px; padding: 0 6px; border-radius: 6px; font-size: 11px; font-weight: 500; background: var(--bg3); color: var(--fg2); }
.badge.accent { background: color-mix(in srgb, var(--accent) 16%, transparent); color: var(--accent); }
.badge.bad { background: color-mix(in srgb, var(--bad) 16%, transparent); color: var(--bad); }
@media (prefers-reduced-motion: reduce) { .ccpp * { transition: none !important; animation: none !important; } }
`;
  function isOurField(event) {
    const target2 = event.composedPath()[0];
    if (!(target2 instanceof HTMLElement)) return false;
    const root2 = target2.getRootNode();
    if (!(root2 instanceof ShadowRoot) || !root2.host.hasAttribute?.("data-ccpp-shadow")) return false;
    return target2.matches("input, textarea, select") || target2.isContentEditable;
  }
  try {
    window.addEventListener("keydown", (event) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      const typing = event.key.length === 1 || ["Backspace", "Delete", "Process"].includes(event.key) || event.isComposing;
      if (typing && isOurField(event)) event.stopImmediatePropagation();
    }, true);
  } catch {
  }
  function shadowBox(css2, tag = "div") {
    const host4 = document.createElement(tag);
    host4.setAttribute("data-ccpp-shadow", "");
    const root2 = host4.attachShadow({ mode: "open" });
    root2.appendChild(h4("style", { text: BASE_CSS + css2 }));
    const box = h4("div", { class: "ccpp" });
    root2.appendChild(box);
    const sync3 = () => {
      box.classList.toggle("dark", isDark());
      if (document.body) box.style.fontFamily = getComputedStyle(document.body).fontFamily;
    };
    sync3();
    return { host: host4, root: root2, box, sync: sync3 };
  }
  var LAYER_Z = { page: "40", top: "2147483600" };
  function createHost(scope, id, css2, options = {}) {
    const { host: host4, root: root2, box, sync: sync3 } = shadowBox(css2);
    host4.id = `ccpp-${id}`;
    host4.dataset.ccpp = id;
    const layer = options.layer ?? "top";
    host4.dataset.ccppLayer = layer;
    if (options.fixed !== false) Object.assign(host4.style, { position: "fixed", inset: "0", zIndex: LAYER_Z[layer], pointerEvents: "none" });
    if (layer === "page") ensurePageLayerCss();
    scope.observe(document.documentElement, { attributes: true, attributeFilter: ["data-mode", "class"] }, sync3);
    const attach = () => {
      if (document.body && host4.parentNode !== document.body) document.body.appendChild(host4);
    };
    attach();
    if (!document.body) scope.listen(document, "DOMContentLoaded", attach, { once: true });
    scope.interval(attach, 2e3);
    scope.defer(() => host4.remove());
    return { host: host4, root: root2, box };
  }
  function anchorPosition(anchor, panel, gap2 = 8) {
    const rect = anchor.getBoundingClientRect();
    const { innerWidth: vw, innerHeight: vh } = window;
    const width = panel.offsetWidth || 280;
    const height = panel.offsetHeight || 200;
    let left = rect.left + rect.width / 2 - width / 2;
    left = Math.max(8, Math.min(vw - width - 8, left));
    const above = rect.top - gap2 - height;
    const top = above >= 8 || rect.bottom + gap2 + height > vh ? Math.max(8, above) : rect.bottom + gap2;
    panel.style.left = `${Math.round(left)}px`;
    panel.style.top = `${Math.round(top)}px`;
  }
  var pageLayerCss = null;
  function ensurePageLayerCss() {
    if (pageLayerCss?.isConnected) return;
    pageLayerCss = document.createElement("style");
    pageLayerCss.id = "ccpp-page-layer";
    pageLayerCss.textContent = `body:has([role="dialog"][aria-modal="true"], [role="alertdialog"], [role="dialog"][data-perf-overlay]) > [data-ccpp-layer="page"] { visibility: hidden !important; }`;
    (document.head ?? document.documentElement).appendChild(pageLayerCss);
  }

  // src/plugins/_core/settings/imageField.ts
  var L3 = {
    pick: { zh: "选择图片…", en: "Choose picture…" },
    clear: { zh: "清除", en: "Clear" },
    reset: { zh: "重置裁切", en: "Reset crop" },
    placeholder: { zh: "粘贴图片，或输入 https://…", en: "Paste a picture, or https://…" },
    hint: { zh: "也可以把图片拖到圆圈上，或在这里直接粘贴。拖动圆圈调整位置，滚轮或滑块缩放。", en: "You can also drop a picture on the circle or paste one here. Drag the circle to pan; scroll or use the slider to zoom." },
    zoom: { zh: "缩放", en: "Zoom" },
    loading: { zh: "正在读取图片…", en: "Loading the picture…" },
    remoteFail: { zh: "读取不到这张网络图片，无法裁切；已原样保存链接，但 claude.ai 可能拦截它。建议下载后粘贴或拖进来。", en: "Couldn't load that picture, so it can't be cropped; the link is saved as is, but claude.ai may block it. Download it and paste or drop it instead." },
    badFile: { zh: "这不是可读取的图片。", en: "That isn't a readable picture." }
  };
  var SOURCE_PX = 1024;
  var ZOOM_MIN = 1;
  var ZOOM_MAX = 4;
  var clamp = (n2, min, max) => Math.min(max, Math.max(min, n2));
  function cropRect(w4, hgt, crop) {
    const zoom = clamp(crop.zoom, ZOOM_MIN, ZOOM_MAX);
    const side = Math.min(w4, hgt) / zoom;
    const x4 = clamp(crop.x * w4, side / 2, Math.max(side / 2, w4 - side / 2));
    const y3 = clamp(crop.y * hgt, side / 2, Math.max(side / 2, hgt - side / 2));
    return { side, x: x4, y: y3, zoom, crop: { x: x4 / w4, y: y3 / hgt, zoom } };
  }
  function loadImage(src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img.naturalWidth && img.naturalHeight ? img : null);
      img.onerror = () => resolve(null);
      img.src = src;
    });
  }
  function canvasUrl(canvas) {
    const webp = canvas.toDataURL("image/webp", 0.9);
    return webp.startsWith("data:image/webp") ? webp : canvas.toDataURL("image/png");
  }
  function draw(img, w4, hgt, from) {
    const canvas = h4("canvas", { width: w4, height: hgt });
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.imageSmoothingQuality = "high";
    if (from) ctx.drawImage(img, from.x - from.side / 2, from.y - from.side / 2, from.side, from.side, 0, 0, w4, hgt);
    else ctx.drawImage(img, 0, 0, w4, hgt);
    try {
      return canvasUrl(canvas);
    } catch {
      return null;
    }
  }
  async function capped(src) {
    const img = await loadImage(src);
    if (!img) return null;
    const scale = Math.min(1, SOURCE_PX / Math.max(img.naturalWidth, img.naturalHeight));
    return draw(img, Math.max(1, Math.round(img.naturalWidth * scale)), Math.max(1, Math.round(img.naturalHeight * scale)));
  }
  async function bake(src, crop, size) {
    const img = await loadImage(src);
    if (!img) return null;
    const r3 = cropRect(img.naturalWidth, img.naturalHeight, crop);
    return draw(img, size, size, r3);
  }
  var blobToDataUrl = (blob) => new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : null);
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(blob);
  });
  function fetchImage(url) {
    const fromBlob = (blob) => blob && blob.type.startsWith("image/") ? blobToDataUrl(blob) : Promise.resolve(null);
    if (typeof GM_xmlhttpRequest === "function") {
      return new Promise(
        (resolve) => GM_xmlhttpRequest({
          method: "GET",
          url,
          timeout: 15e3,
          responseType: "blob",
          onload: (r3) => void (r3.status >= 200 && r3.status < 300 ? fromBlob(r3.response).then(resolve) : resolve(null)),
          onerror: () => resolve(null),
          ontimeout: () => resolve(null)
        })
      );
    }
    return fetch(url, { credentials: "omit", referrerPolicy: "no-referrer" }).then((r3) => r3.ok ? r3.blob() : null).then(fromBlob).catch(() => null);
  }
  function imageFile(data) {
    if (!data) return null;
    for (const file of data.files) if (file.type.startsWith("image/")) return file;
    for (const item of data.items) if (item.kind === "file" && item.type.startsWith("image/")) return item.getAsFile();
    return null;
  }
  function imageField(option, value, set) {
    const size = option.size ?? 256;
    let current6 = value;
    let source = value.startsWith("data:image/") ? value : "";
    let natural = null;
    let crop = { x: 0.5, y: 0.5, zoom: 1 };
    let generation = 0;
    let bakeTimer = null;
    const stageImg = h4("img", { alt: "", draggable: "false", referrerpolicy: "no-referrer" });
    const stage = h4("div", { class: "img-stage", title: t3(L3.hint) }, stageImg);
    const zoom = h4("input", { type: "range", min: ZOOM_MIN, max: ZOOM_MAX, step: 0.05, value: "1", "aria-label": t3(L3.zoom) });
    const zoomOut = h4("output", { text: "100%" });
    const resetBtn = h4("button", { type: "button", class: "btn", text: t3(L3.reset) });
    const url = h4("input", { class: "input", placeholder: option.placeholder ? t3(option.placeholder) : t3(L3.placeholder), "aria-label": t3(option.label) });
    const file = h4("input", { type: "file", accept: "image/*", style: { display: "none" } });
    const pick = h4("button", { type: "button", class: "btn", text: t3(L3.pick) });
    const clearBtn = h4("button", { type: "button", class: "btn", text: t3(L3.clear) });
    const note = h4("div", { class: "row-desc img-note" });
    const zoomRow = h4("div", { class: "img-zoom" }, zoom, zoomOut, resetBtn);
    const field = h4("div", { class: "img-field" }, stage, h4("div", { class: "img-side" }, h4("div", { class: "img-line" }, url, pick, clearBtn), zoomRow, note), file);
    const say = (text) => note.textContent = text;
    const save2 = (next) => {
      current6 = next;
      set(next);
    };
    const paint = () => {
      const shown2 = source || current6;
      stage.classList.toggle("empty", !shown2);
      if (!shown2) stageImg.removeAttribute("src");
      else if (stageImg.getAttribute("src") !== shown2) stageImg.src = shown2;
      zoomRow.hidden = !source;
      zoom.value = String(crop.zoom);
      zoomOut.textContent = `${Math.round(crop.zoom * 100)}%`;
      if (!url.matches(":focus")) url.value = current6.startsWith("data:") ? "" : current6;
      clearBtn.disabled = !current6;
      if (!source || !natural) {
        Object.assign(stageImg.style, { width: "100%", height: "100%", left: "0", top: "0" });
        return;
      }
      const r3 = cropRect(natural.w, natural.h, crop);
      Object.assign(stageImg.style, {
        width: `${natural.w / r3.side * 100}%`,
        height: `${natural.h / r3.side * 100}%`,
        left: `${(0.5 - r3.x / r3.side) * 100}%`,
        top: `${(0.5 - r3.y / r3.side) * 100}%`
      });
    };
    const commit = (next, immediate = false) => {
      if (!source || !natural) return;
      crop = cropRect(natural.w, natural.h, next).crop;
      paint();
      if (bakeTimer) clearTimeout(bakeTimer);
      const src = source;
      const run = () => {
        const at = { ...crop };
        void bake(src, at, size).then((out) => {
          if (out && src === source) save2(out);
        });
      };
      if (immediate) run();
      else bakeTimer = setTimeout(run, 120);
    };
    const adopt2 = async (src, keep = false) => {
      const gen = ++generation;
      const img = await loadImage(src);
      if (gen !== generation) return;
      if (!img) {
        say(t3(L3.badFile));
        return;
      }
      source = src;
      natural = { w: img.naturalWidth, h: img.naturalHeight };
      crop = { x: 0.5, y: 0.5, zoom: 1 };
      say("");
      if (keep) paint();
      else commit(crop, true);
    };
    const takeBlob = async (blob) => {
      const gen = ++generation;
      say(t3(L3.loading));
      const raw2 = await blobToDataUrl(blob);
      const src = raw2 && await capped(raw2);
      if (gen !== generation) return;
      if (!src) return say(t3(L3.badFile));
      await adopt2(src);
    };
    const takeText = async (raw2) => {
      const text = raw2.trim();
      const gen = ++generation;
      if (!text) {
        source = "";
        natural = null;
        say("");
        save2("");
        return paint();
      }
      if (!isImageUrl(text)) return say(t3(L3.badFile));
      if (text.startsWith("data:image/")) {
        const src2 = await capped(text);
        if (gen !== generation) return;
        return src2 ? adopt2(src2) : say(t3(L3.badFile));
      }
      say(t3(L3.loading));
      const fetched = await fetchImage(text);
      const src = fetched && await capped(fetched);
      if (gen !== generation) return;
      if (src) return adopt2(src);
      source = "";
      natural = null;
      save2(text);
      say(t3(L3.remoteFail));
      paint();
    };
    const onPaste = (event) => {
      const found = imageFile(event.clipboardData);
      if (!found) return;
      event.preventDefault();
      void takeBlob(found);
    };
    url.addEventListener("change", () => void takeText(url.value));
    url.addEventListener("paste", onPaste);
    field.addEventListener("paste", onPaste);
    pick.addEventListener("click", () => file.click());
    file.addEventListener("change", () => {
      const picked2 = file.files?.[0];
      file.value = "";
      if (picked2) void takeBlob(picked2);
    });
    clearBtn.addEventListener("click", () => {
      url.value = "";
      void takeText("");
    });
    resetBtn.addEventListener("click", () => commit({ x: 0.5, y: 0.5, zoom: 1 }, true));
    zoom.addEventListener("input", () => commit({ ...crop, zoom: Number(zoom.value) }));
    stage.addEventListener("dragover", (event) => {
      if (imageFile(event.dataTransfer)) event.preventDefault();
    });
    stage.addEventListener("drop", (event) => {
      const found = imageFile(event.dataTransfer);
      if (!found) return;
      event.preventDefault();
      void takeBlob(found);
    });
    stage.addEventListener("wheel", (event) => {
      if (!source) return;
      event.preventDefault();
      commit({ ...crop, zoom: crop.zoom * (event.deltaY < 0 ? 1.08 : 1 / 1.08) });
    }, { passive: false });
    let drag = null;
    stage.addEventListener("pointerdown", (event) => {
      if (event.button !== 0 || !source || !natural) return;
      stage.setPointerCapture(event.pointerId);
      drag = { px: event.clientX, py: event.clientY, from: { ...crop } };
    });
    stage.addEventListener("pointermove", (event) => {
      if (!drag || !natural || !stage.clientWidth) return;
      const { side } = cropRect(natural.w, natural.h, drag.from);
      const perPx = side / stage.clientWidth;
      crop = cropRect(natural.w, natural.h, {
        x: drag.from.x - (event.clientX - drag.px) * perPx / natural.w,
        y: drag.from.y - (event.clientY - drag.py) * perPx / natural.h,
        zoom: drag.from.zoom
      }).crop;
      paint();
    });
    const endDrag = () => {
      if (!drag) return;
      drag = null;
      commit(crop, true);
    };
    stage.addEventListener("pointerup", endDrag);
    stage.addEventListener("pointercancel", endDrag);
    if (source) void adopt2(source, true);
    paint();
    return field;
  }
  var IMAGE_FIELD_CSS = `
.img-field { display: flex; gap: 14px; align-items: flex-start; }
.img-stage { position: relative; flex: none; width: 96px; height: 96px; border-radius: 50%; overflow: hidden; background: color-mix(in srgb, var(--fg3) 14%, transparent); box-shadow: inset 0 0 0 1px var(--field-ring); cursor: grab; touch-action: none; user-select: none; }
.img-stage:active { cursor: grabbing; }
.img-stage.empty { cursor: default; }
.img-stage img { position: absolute; max-width: none; pointer-events: none; object-fit: cover; }
.img-stage.empty img { display: none; }
.img-side { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 8px; }
.img-line { display: flex; gap: 8px; align-items: center; }
.img-line .input { flex: 1; min-width: 0; }
.img-line .btn { flex: none; }
.img-zoom { display: flex; gap: 8px; align-items: center; }
.img-zoom[hidden] { display: none; }
.img-zoom input { flex: 1; min-width: 0; accent-color: var(--fg); }
.img-zoom output { min-width: 44px; text-align: right; font-variant-numeric: tabular-nums; color: var(--fg2); }
.img-note:empty { display: none; }
`;

  // src/lib/themeColor.ts
  var STAR_COLOR = "#ff7a17";
  var resolved = /* @__PURE__ */ new Map();
  function resolveColor(css2, fallback, now2 = Date.now()) {
    const cached2 = resolved.get(css2);
    if (cached2 && now2 - cached2.at < 2e3) return cached2.color;
    let color = fallback;
    try {
      const probe = document.createElement("span");
      probe.style.cssText = "position:absolute;visibility:hidden";
      probe.style.color = css2;
      (document.body ?? document.documentElement).appendChild(probe);
      color = getComputedStyle(probe).color || fallback;
      probe.remove();
    } catch {
    }
    resolved.set(css2, { at: now2, color });
    return color;
  }

  // src/plugins/_core/settings/styles.ts
  var PANEL_CSS = `
/* A page's toolbar (tabs, search, filters) stays at the top while its list scrolls under it. */
.page-body > .sticky-top { position: sticky; top: -4px; z-index: 2; margin: -4px calc(-1 * var(--ccpp-pad-x, var(--cds-pad-xl, 24px))) 0; padding: 4px var(--ccpp-pad-x, var(--cds-pad-xl, 24px)) 0; background: var(--bg); }
.page { display: flex; flex-direction: column; min-height: 0; height: 100%; }
/* The title copies the native page title's offset and font (measured in native.ts), so it lines up with Account, Billing… */
.page-head { flex: none; display: flex; align-items: center; gap: 8px; padding: var(--ccpp-head-top, 20px) var(--ccpp-pad-x, var(--cds-pad-xl, 24px)) var(--ccpp-head-gap, 12px); }
.page-head h2 { margin: 0; flex: 1; font-size: var(--ccpp-head-size, var(--cds-font-size-heading, 18px)); font-weight: var(--ccpp-head-weight, 600); line-height: var(--ccpp-head-line, normal); letter-spacing: var(--ccpp-head-track, normal); font-family: var(--ccpp-head-font, inherit); }
.page-body { flex: 1; min-height: 0; overflow-y: auto; padding: 4px var(--ccpp-pad-x, var(--cds-pad-xl, 24px)) 24px; scrollbar-gutter: stable; }

.bar { display: flex; gap: 8px; align-items: center; margin-bottom: 12px; }
.search { position: relative; flex: 1; min-width: 0; }
.search svg { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: var(--fg3); pointer-events: none; }
.search .input { padding-left: 32px; }
.bar select.input { width: 7.5rem; flex: none; }

.tabs { display: flex; gap: 2px; overflow-x: auto; margin: 0 0 14px; border-bottom: 1px solid var(--line); scrollbar-width: none; }
.tabs::-webkit-scrollbar { display: none; }
.tabs button { position: relative; flex: none; height: 34px; padding: 0 10px; border: 0; background: transparent; color: var(--fg3); font-size: var(--fs-sm); white-space: nowrap; }
.tabs button:hover { color: var(--fg); }
.tabs button.active { color: var(--fg); font-weight: 500; }
.tabs button.active::after { content: ""; position: absolute; left: 8px; right: 8px; bottom: -1px; height: 2px; border-radius: 2px; background: var(--fg); }
.tabs .n { margin-left: 4px; color: var(--fg3); font-weight: 400; font-variant-numeric: tabular-nums; }

.banner { display: flex; align-items: center; gap: 10px; padding: 10px 12px; margin-bottom: 14px; border-radius: var(--radius-card); background: color-mix(in srgb, var(--warn) 14%, transparent); color: var(--fg); font-size: var(--fs-sm); }
.banner svg { color: var(--warn); flex: none; }
.banner span { flex: 1; }

.grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
@media (max-width: 760px) { .grid { grid-template-columns: 1fr; } }
.sep { display: flex; align-items: center; gap: 10px; margin: 18px 0 10px; color: var(--fg3); font-size: var(--fs-xs); }
.sep::before, .sep::after { content: ""; flex: 1; height: 1px; background: var(--line); }

.card { display: flex; flex-direction: column; min-width: 0; min-height: 7.5rem; padding: 12px; border-radius: .5rem; border: 1px solid var(--line); background: var(--bg-card, transparent); transition: border-color .12s, background .12s; }
.card:hover { border-color: color-mix(in srgb, var(--fg) 22%, transparent); }
.card.crashed { border-color: color-mix(in srgb, var(--bad) 60%, transparent); }
.card.crashed .card-body { opacity: .5; }
.card-top { display: flex; align-items: center; gap: 8px; min-width: 0; }
.chip-icon { display: grid; place-items: center; width: 1.5rem; height: 1.5rem; border-radius: 6px; flex: none; background: color-mix(in srgb, var(--fg) 10%, transparent); color: var(--fg); }
.card.off .chip-icon { color: var(--fg3); }
.card-title { flex: 1; min-width: 0; font-size: .875rem; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; cursor: pointer; }
.card-title:hover { text-decoration: underline; text-underline-offset: 2px; }
.card-actions { display: flex; align-items: center; gap: 0; flex: none; }
.card-actions .icon-btn { width: 26px; height: 26px; }
.icon-btn.star.on { color: ${STAR_COLOR}; } .icon-btn.star.on svg { fill: currentColor; }
.icon-btn.pin.on { color: var(--fg); } .icon-btn.pin.on svg { fill: currentColor; }
.card-actions .switch { margin-left: 6px; }
.card-desc { margin-top: 8px; font-size: .8125rem; line-height: 1.45; color: var(--fg2); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.card-body { display: flex; flex-direction: column; flex: 1; min-height: 0; }
.card-foot { display: flex; align-items: center; gap: 6px; margin-top: auto; padding-top: 8px; border-top: 1px solid var(--line-soft); font-size: .7rem; color: var(--fg3); min-width: 0; }
.card-desc + .card-foot, .card-body > .card-foot { margin-top: auto; }
.card-gap { flex: 1; min-height: 8px; }
.card-foot .author { margin-left: auto; display: inline-flex; align-items: center; gap: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.card-foot .badge { height: 16px; font-size: 10px; }

.empty { padding: 40px 16px; text-align: center; color: var(--fg3); }
.empty b { display: block; color: var(--fg2); font-weight: 500; margin-bottom: 4px; }

/* claude.ai settings rows */
.section { margin-bottom: 24px; }
.section-head { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.section-head h3 { flex: 1; margin: 0; font-size: var(--fs); font-weight: 600; }
.section-head p { margin: 0; }
.rows > .row + .row { border-top: 1px solid var(--line-soft); }
.row { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 12px 0; }
.row.wide { flex-direction: column; align-items: stretch; gap: 8px; }
.row-text { min-width: 0; flex: 1; }
.row-title { color: var(--fg); }
.row-desc { color: var(--fg3); margin-top: 2px; font-size: var(--fs-sm); }
.row-control { flex: none; display: flex; align-items: center; gap: 8px; }
.row-control select.input { width: auto; min-width: 9rem; }
.row-control .range { display: flex; align-items: center; gap: 8px; } .row-control .range input { width: 160px; accent-color: var(--fg); }
.row-control output { min-width: 44px; text-align: right; font-variant-numeric: tabular-nums; color: var(--fg2); }
.row-control input[type=color] { width: 40px; height: 28px; padding: 0; border: 0; border-radius: 6px; background: none; box-shadow: inset 0 0 0 1px var(--field-ring); }
.editor { width: 100%; min-height: 360px; }
.muted { color: var(--fg3); }
.hint { color: var(--fg3); font-size: var(--fs-sm); margin: 0 0 10px; }
${IMAGE_FIELD_CSS}`;
  var LAYER_CSS = `
.backdrop { position: absolute; inset: 0; display: grid; place-items: center; pointer-events: auto; background: var(--cds-backdrop, rgba(0,0,0,.5)); animation: fade .15s ease-out; }
.backdrop.clear { background: transparent; }
@keyframes fade { from { opacity: 0; } }
@keyframes pop { from { opacity: 0; transform: scale(.98); } }
.dialog { position: relative; display: flex; flex-direction: column; width: min(560px, calc(100% - 32px)); max-height: calc(100% - 48px); border-radius: calc(var(--radius) + 8px); background: var(--bg); box-shadow: var(--shadow); overflow: hidden; animation: pop .15s ease-out; }
.dialog.small { width: min(420px, calc(100% - 32px)); }
.dialog.wide { width: min(760px, calc(100% - 32px)); }
.d-head { display: flex; align-items: center; gap: 10px; padding: 16px 16px 4px 20px; }
.d-head h2 { flex: 1; min-width: 0; margin: 0; font-size: var(--cds-font-size-heading, 17px); font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.d-head .chip-icon { width: 1.75rem; height: 1.75rem; }
/* Dialog toolbar: between the title and the scrolling body, so it never scrolls away. */
.d-top { flex: none; padding: 4px 20px 0; }
.d-top + .d-body { padding-top: 0; }
.d-body { flex: 1; min-height: 0; overflow-y: auto; padding: 4px 20px 16px; }
.d-desc { color: var(--fg2); margin: 0 0 6px; }
.d-meta { color: var(--fg3); font-size: var(--fs-xs); margin: 0 0 8px; display: flex; gap: 6px; flex-wrap: wrap; align-items: center; }
.d-sep { height: 1px; background: var(--line); margin: 12px 0; }
.d-title { font-weight: 600; margin: 0 0 4px; }
.d-foot { display: flex; align-items: center; justify-content: flex-end; gap: 8px; padding: 12px 20px 16px; border-top: 1px solid var(--line-soft); }
.d-foot .grow { flex: 1; }
.field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px; }
.field label { font-size: var(--fs-sm); color: var(--fg2); }
.btn.danger-solid { background: var(--bad); color: var(--cds-on-danger, #fff); } .btn.danger-solid:hover { opacity: .9; }

/* standalone shell, used when claude.ai's own settings dialog can't host CC++ */
.shell { position: relative; display: grid; grid-template-columns: 12rem 1fr; width: min(1024px, calc(100% - 32px)); height: min(50rem, calc(100% - 32px)); border-radius: calc(var(--radius) + 8px); background: var(--bg); box-shadow: var(--shadow); overflow: hidden; animation: pop .15s ease-out; }
.shell-nav { display: flex; flex-direction: column; gap: 2px; padding: 12px; background: var(--bg-nav); border-right: 1px solid var(--line); }
.shell-nav .group { padding: 12px 8px 4px; font-size: var(--fs-xs); color: var(--fg3); }
.shell-nav button { display: flex; align-items: center; gap: 8px; height: var(--h); padding: 0 8px; border: 0; border-radius: var(--radius); background: transparent; color: var(--fg2); text-align: left; }
.shell-nav button:hover { background: var(--bg2); color: var(--fg); }
.shell-nav button.active { background: var(--bg3); color: var(--fg); font-weight: 500; }
.shell-nav .ver { font-size: var(--fs-xs); color: var(--fg3); font-variant-numeric: tabular-nums; }
.shell-main { display: flex; flex-direction: column; min-width: 0; min-height: 0; }
.shell-top { display: flex; justify-content: flex-end; padding: 12px 12px 0; }
@media (max-width: 640px) { .shell { grid-template-columns: 1fr; grid-template-rows: auto 1fr; } .shell-nav { flex-direction: row; overflow-x: auto; border-right: 0; border-bottom: 1px solid var(--line); } .shell-nav .group { display: none; } }
`;

  // src/plugins/_core/settings/layer.ts
  var NATIVE_DIALOG = '[role="dialog"][data-perf-overlay="settings_modal"]';
  var L4 = {
    close: { zh: "关闭", en: "Close" },
    ok: { zh: "确定", en: "OK" },
    cancel: { zh: "取消", en: "Cancel" }
  };
  var shadow = null;
  var stack = [];
  function initLayer(scope) {
    shadow = shadowBox(LAYER_CSS + PANEL_CSS);
    shadow.host.dataset.ccpp = "layer";
    Object.assign(shadow.host.style, { inset: "0", zIndex: "2147483600", pointerEvents: "none" });
    scope.observe(document.documentElement, { attributes: true, attributeFilter: ["data-mode", "class"] }, () => shadow?.sync());
    scope.listen(window, "keydown", (event) => {
      if (event.key !== "Escape" || !stack.length || !shadow?.host.isConnected) return;
      event.preventDefault();
      event.stopPropagation();
      closeTop();
    }, { capture: true });
    scope.defer(() => {
      stack.length = 0;
      shadow?.host.remove();
      shadow = null;
    });
  }
  function place2() {
    if (!shadow) return null;
    const dialog = document.querySelector(NATIVE_DIALOG);
    const parent = dialog ?? document.body;
    shadow.host.style.position = dialog ? "absolute" : "fixed";
    if (shadow.host.parentNode !== parent) parent.appendChild(shadow.host);
    shadow.sync();
    return shadow.box;
  }
  function closeTop() {
    const top = stack.pop();
    top?.el.remove();
    top?.onClose?.();
  }
  function openModal(content, options = {}) {
    for (let i3 = stack.length - 1; i3 >= 0; i3--) if (!stack[i3].el.isConnected || stack[i3].el.getRootNode() !== shadow?.root) stack.splice(i3, 1);
    const box = place2();
    if (!box) return () => {
    };
    const backdrop = h4("div", { class: `backdrop${options.backdrop === "clear" ? " clear" : ""}` }, content);
    backdrop.addEventListener("mousedown", (event) => event.target === backdrop && close());
    const layer = { el: backdrop, onClose: options.onClose };
    stack.push(layer);
    box.appendChild(backdrop);
    queueMicrotask(() => content.querySelector("[autofocus], input, textarea, button:not(.icon-btn)")?.focus());
    function close() {
      const index = stack.indexOf(layer);
      if (index < 0) return;
      stack.splice(index, 1);
      backdrop.remove();
      layer.onClose?.();
    }
    return close;
  }
  function closeAllModals() {
    while (stack.length) closeTop();
    if (shadow) clear(shadow.box);
  }
  function dialogFrame(options) {
    const close = h4("button", { type: "button", class: "icon-btn", "aria-label": t3(L4.close), ...tipAttrs(t3(L4.close)) }, icon("x", 16));
    close.addEventListener("click", options.onClose);
    return h4(
      "div",
      { class: `dialog${options.size ? ` ${options.size}` : ""}`, role: "dialog", "aria-modal": "true", "aria-label": options.title },
      h4("div", { class: "d-head" }, options.icon ? h4("span", { class: "chip-icon" }, icon(options.icon, 16)) : null, h4("h2", { text: options.title }), close),
      options.top?.length ? h4("div", { class: "d-top" }, ...options.top) : null,
      h4("div", { class: "d-body" }, ...options.body),
      options.foot?.length ? h4("div", { class: "d-foot" }, ...options.foot) : null
    );
  }
  function confirmDialog(options) {
    return new Promise((resolve) => {
      let settled = false;
      const done = (value) => {
        if (settled) return;
        settled = true;
        close();
        resolve(value);
      };
      const ok = h4("button", { type: "button", class: `btn ${options.danger ? "danger-solid" : "primary"}`, text: t3(options.ok ?? L4.ok) });
      ok.addEventListener("click", () => done(true));
      const cancel = h4("button", { type: "button", class: "btn", text: t3(options.cancel ?? L4.cancel) });
      cancel.addEventListener("click", () => done(false));
      const frame = dialogFrame({ title: options.title, size: "small", body: [h4("p", { class: "d-desc", text: options.body })], foot: [cancel, ok], onClose: () => done(false) });
      const close = openModal(frame, { onClose: () => done(false) });
      queueMicrotask(() => ok.focus());
    });
  }

  // src/plugins/_core/settings/codeGear.ts
  var LABEL = { zh: "CC++ 设置", en: "CC++ settings" };
  var LABEL_ATTRS = ["aria-label", "title"];
  var TOOLTIP = '[data-cds="Tooltip"], [role="tooltip"]:not([data-ccpp-tooltip])';
  var onCodePage = () => location.pathname === "/code" || location.pathname.startsWith("/code/");
  var SKIP = '[role="dialog"], [role="menu"], [role="listbox"], [data-testid^="user-menu"], [data-ccpp-host], [data-ccpp-item], [aria-haspopup="menu"]';
  var SETTINGS_WORD = /setting|设置|設定/i;
  var SIDEBAR = '[aria-label="Sidebar"], [data-testid="sidebar"], nav, aside';
  function inSidebar(el) {
    if (el.closest(SIDEBAR)) return true;
    const rect = el.getBoundingClientRect();
    return rect.right < Math.min(420, innerWidth * 0.4) && rect.top > innerHeight * 0.6;
  }
  var LEARNED = "data-ccpp-code-gear";
  var GEAR_GLYPH = glyph("settings");
  function hasGearIcon(el) {
    if (el.querySelector("[data-ccpp-gear-icon]")) return true;
    const glyphs = el.querySelectorAll('[data-cds="Icon"]');
    return glyphs.length === 1 && !!GEAR_GLYPH && glyphs[0].textContent === GEAR_GLYPH && !el.textContent.replace(GEAR_GLYPH, "").trim();
  }
  function isGear(el) {
    if (el.hasAttribute(LEARNED)) return true;
    const label = [el.getAttribute("aria-label"), el.getAttribute("title"), el.getAttribute("data-testid"), el.getAttribute("data-ccpp-tip")].filter(Boolean).join(" ");
    const looksLike = SETTINGS_WORD.test(label) || (el.getAttribute("href") ?? "").includes("#settings") || hasGearIcon(el);
    return looksLike && inSidebar(el);
  }
  function openedOnCode(dialog) {
    if (location.hash === "#settings/claude-code") return true;
    const current6 = dialog.querySelector('[data-perf-region="settings_nav"] li:not([data-ccpp-nav]) > button[aria-current]');
    const text = current6?.textContent?.trim() ?? "";
    return /^(claude )?code$|^代码$/i.test(text);
  }
  function installCodeGear(scope, enabled, open) {
    let armed = 0;
    let armedEl = null;
    const press = (event) => {
      if (!enabled() || !onCodePage() || event.button !== 0 || event.altKey || event.shiftKey || event.ctrlKey || event.metaKey) return;
      const el = event.target?.closest?.("button, a, [role='button']");
      if (el && !el.closest(SKIP) && isGear(el)) event.stopImmediatePropagation();
    };
    scope.listen(document, "pointerdown", press, { capture: true });
    scope.listen(document, "mousedown", press, { capture: true });
    scope.listen(
      document,
      "click",
      (event) => {
        if (!enabled() || !onCodePage() || event.button !== 0) return;
        if (event.altKey || event.shiftKey || event.ctrlKey || event.metaKey) return;
        const el = event.target?.closest?.("button, a, [role='button']");
        if (!el || el.closest(SKIP) || !inSidebar(el)) return;
        if (isGear(el)) {
          event.preventDefault();
          event.stopImmediatePropagation();
          open();
          return;
        }
        armed = Date.now();
        armedEl = el;
      },
      { capture: true }
    );
    watch(scope, NATIVE_DIALOG, (dialog) => {
      if (!enabled() || !onCodePage() || Date.now() - armed > 1500) return;
      armed = 0;
      const el = armedEl;
      const timer2 = setTimeout(() => {
        if (!dialog.isConnected || !openedOnCode(dialog)) return;
        el?.setAttribute(LEARNED, "");
        open();
        paint();
      }, 150);
      return () => clearTimeout(timer2);
    });
    const swapped = /* @__PURE__ */ new Set();
    const restore = () => {
      for (const button of swapped) {
        for (const mark of button.querySelectorAll("[data-ccpp-gear-icon]")) mark.remove();
        for (const native of button.querySelectorAll("[data-ccpp-gear-hidden]")) {
          native.style.removeProperty("display");
          native.removeAttribute("data-ccpp-gear-hidden");
        }
        for (const attr of LABEL_ATTRS) {
          const key = `data-ccpp-gear-${attr}`;
          if (!button.hasAttribute(key)) continue;
          const old = button.getAttribute(key);
          button.removeAttribute(key);
          if (old) button.setAttribute(attr, old);
          else button.removeAttribute(attr);
        }
      }
      swapped.clear();
    };
    const relabel = (button) => {
      const label = t3(LABEL);
      for (const attr of LABEL_ATTRS) {
        const now2 = button.getAttribute(attr);
        if (now2 === null || now2 === label) continue;
        button.setAttribute(`data-ccpp-gear-${attr}`, now2);
        button.setAttribute(attr, label);
      }
    };
    const retitle = () => {
      if (!enabled() || !onCodePage()) return;
      const gear = [...swapped].find((button) => button.matches(":hover, :focus-visible"));
      if (!gear) return;
      const label = t3(LABEL);
      const originals = LABEL_ATTRS.map((attr) => gear.getAttribute(`data-ccpp-gear-${attr}`)).filter((v3) => !!v3);
      for (const tip of document.querySelectorAll(TOOLTIP)) {
        const leaves = [...tip.querySelectorAll("*"), tip].filter((el) => [...el.childNodes].some((n2) => n2.nodeType === 3 && n2.textContent.trim()));
        const target2 = leaves.find((el) => originals.includes(el.textContent.trim())) ?? leaves.find((el) => SETTINGS_WORD.test(el.textContent ?? ""));
        if (target2 && target2.textContent !== label) target2.textContent = label;
      }
    };
    const swap = (button) => {
      swapped.add(button);
      relabel(button);
      if (button.querySelector("[data-ccpp-gear-icon]")) {
        for (const native2 of button.querySelectorAll('[data-cds="Icon"]:not([data-ccpp-gear-hidden]), svg:not([data-ccpp-gear-icon]):not([data-ccpp-gear-hidden])')) {
          native2.setAttribute("data-ccpp-gear-hidden", "");
          native2.style.display = "none";
        }
        return;
      }
      const native = button.querySelector('[data-cds="Icon"], svg');
      const box = native?.getBoundingClientRect();
      const size = Math.round(box?.width || box?.height || Number(native?.getAttribute("width")) || 18);
      const mark = icon("sliders", size);
      mark.setAttribute("data-ccpp-gear-icon", "");
      mark.style.flexShrink = "0";
      if (native) {
        native.setAttribute("data-ccpp-gear-hidden", "");
        native.style.display = "none";
        native.after(mark);
      } else button.prepend(mark);
    };
    const paint = () => {
      if (!enabled() || !onCodePage()) return restore();
      for (const button of swapped) if (!button.isConnected) swapped.delete(button);
      for (const button of document.querySelectorAll("button, a, [role='button']")) {
        if (!button.closest(SKIP) && isGear(button)) swap(button);
      }
      retitle();
    };
    watch(scope, TOOLTIP, () => {
      retitle();
      const timer2 = setTimeout(retitle, 50);
      return () => clearTimeout(timer2);
    });
    onDomChange(scope, paint);
    scope.defer(restore);
    return { repaint: paint };
  }

  // src/plugins/_core/settings/state.ts
  var version = "dev";
  function setVersion(next) {
    version = next.replace(/^\d{8}\./, "") || version;
  }
  var tabs = /* @__PURE__ */ new Map();
  var isPrefs = (v3) => !!v3 && Array.isArray(v3.favorites) && Array.isArray(v3.pinned);
  var prefs = persisted("settings-ui", { favorites: [], pinned: [] }, isPrefs);
  var isFavorite = (name) => prefs.get().favorites.includes(name);
  var isPinned = (name) => prefs.get().pinned.includes(name);
  function toggleIn(key, name) {
    const current6 = prefs.get();
    const list2 = current6[key].includes(name) ? current6[key].filter((n2) => n2 !== name) : [...current6[key], name];
    prefs.set({ ...current6, [key]: list2 });
  }
  var redrawers = /* @__PURE__ */ new Set();
  function onRedraw(fn2) {
    redrawers.add(fn2);
    return () => void redrawers.delete(fn2);
  }
  var queued = false;
  function redraw() {
    if (queued) return;
    queued = true;
    queueMicrotask(() => {
      queued = false;
      for (const fn2 of [...redrawers]) {
        try {
          fn2();
        } catch {
        }
      }
    });
  }
  var view = {
    category: "",
    query: "",
    filter: "all",
    showApi: false
  };

  // src/plugins/_core/settings/nativeIcons.ts
  var SECTION_GLYPHS = {
    "settings/general": 57558,
    "settings/account": 57604,
    "settings/data-privacy-controls": 57507,
    "settings/billing": 57432,
    "settings/usage": 57648,
    "settings/capabilities": 57600,
    "settings/memory": 57512,
    "settings/design-systems": 57528,
    "settings/claude-code": 57416,
    "settings/browser-extension": 57433,
    "customize/skills/yours": 57554,
    "customize/connectors/yours": 57429,
    "customize/plugins/yours": 57541
  };
  var KEY = "native-icons";
  var learned = readJson(KEY, {});
  function sectionOf(sections, row) {
    const id = row.dataset.testid?.replace(/-settings$/, "").replace(/^customize-/, "");
    const byId = id && sections.find((s3) => s3.hash.split("/")[1] === id);
    if (byId) return byId.hash;
    const label = (row.textContent ?? "").replace(/[\ue000-\uf8ff]/g, "").trim().toLowerCase();
    return sections.find((s3) => label === s3.label.en.toLowerCase() || label === s3.label.zh)?.hash ?? null;
  }
  var isGlyph = (text) => /^[-]$/.test(text);
  function learnNativeIcons(nav, sections) {
    let changed2 = false;
    for (const row of nav.querySelectorAll("li:not([data-ccpp-nav])")) {
      const text = row.querySelector('[data-cds="Icon"]')?.textContent ?? "";
      const hash = isGlyph(text) && sectionOf(sections, row);
      if (!hash || learned[hash] === text) continue;
      learned = { ...learned, [hash]: text };
      changed2 = true;
    }
    if (changed2) writeJson(KEY, learned);
  }
  function sectionGlyph(hash) {
    const seen3 = learned[hash];
    if (seen3 && isGlyph(seen3)) return seen3;
    const code = SECTION_GLYPHS[hash];
    return code ? String.fromCodePoint(code) : null;
  }

  // src/plugins/_core/settings/userMenu.ts
  var SETTINGS_ITEM = '[data-testid="user-menu-settings"]';
  var NATIVE_SECTIONS = [
    { hash: "settings/general", icon: "sliders", label: { zh: "通用", en: "General" } },
    { hash: "settings/account", icon: "user", label: { zh: "账户", en: "Account" } },
    { hash: "settings/data-privacy-controls", icon: "shield", label: { zh: "隐私", en: "Privacy" } },
    { hash: "settings/billing", icon: "creditCard", label: { zh: "账单", en: "Billing" } },
    { hash: "settings/usage", icon: "gauge", label: { zh: "用量", en: "Usage" } },
    { hash: "settings/capabilities", icon: "grid", label: { zh: "功能", en: "Capabilities" } },
    { hash: "settings/memory", icon: "brain", label: { zh: "记忆", en: "Memory" } },
    { hash: "settings/design-systems", icon: "palette", label: { zh: "设计系统", en: "Design systems" } },
    { hash: "settings/claude-code", icon: "terminal", label: { zh: "Claude Code", en: "Claude Code" } },
    { hash: "settings/browser-extension", icon: "globe", label: { zh: "Claude in Chrome", en: "Claude in Chrome" } },
    { hash: "customize/skills/yours", icon: "sparkles", label: { zh: "技能", en: "Skills" } },
    { hash: "customize/connectors/yours", icon: "link", label: { zh: "连接器", en: "Connectors" } },
    { hash: "customize/plugins/yours", icon: "puzzle", label: { zh: "插件（claude.ai）", en: "Plugins (claude.ai)" } }
  ];
  var L5 = {
    plugins: { zh: "插件", en: "Plugins" },
    openSettings: { zh: "打开 CC++ 设置", en: "Open CC++ settings" },
    openNative: { zh: "打开设置", en: "Open settings" },
    claude: { zh: "claude.ai", en: "claude.ai" }
  };
  function installUserMenu(scope, options) {
    watch(scope, SEL.menu, (menu) => {
      if (menu.hasAttribute("data-ccpp-panel-level")) return;
      let cleanup2 = null;
      const tryInsert = () => {
        if (cleanup2) return true;
        const settingsItem = menu.querySelector(SETTINGS_ITEM);
        if (!settingsItem) return false;
        cleanup2 = enhance(menu, settingsItem, options);
        return true;
      };
      const observer2 = new MutationObserver(() => tryInsert() && observer2.disconnect());
      if (!tryInsert()) observer2.observe(menu, { childList: true, subtree: true });
      return () => {
        observer2.disconnect();
        cleanup2?.();
      };
    });
  }
  function shortcutHint(settingsItem, keys) {
    if (!keys.length) return null;
    const native = settingsItem.querySelector('[data-cds="Shortcut"]');
    const sample = native?.querySelector("kbd");
    if (native && sample) {
      const hint = native.cloneNode(false);
      for (const key of keys) {
        const part = sample.cloneNode(true);
        const glyph3 = [...part.querySelectorAll("span")].find((el) => !el.matches(".sr-only")) ?? null;
        const name = part.querySelector(".sr-only");
        if (glyph3) glyph3.textContent = key;
        else part.textContent = key;
        if (name) name.textContent = KEY_NAMES[key] ?? key;
        hint.appendChild(part);
      }
      hint.setAttribute("data-ccpp-shortcut", "");
      return hint;
    }
    return h4("span", { class: "shrink-0 text-muted text-footnote", "data-ccpp-shortcut": "", "aria-hidden": "true", text: keys.join(" "), style: { letterSpacing: ".08em" } });
  }
  var KEY_NAMES = { "⇧": "Shift", "⌘": "Command", "⌥": "Option", "⌃": "Control", ".": "Period", ",": "Comma" };
  function closeMenu(menu) {
    menu.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  }
  function enhance(menu, settingsItem, options) {
    const sampleSub = menu.querySelector('[role="menuitem"][aria-haspopup="menu"]');
    const itemClass = settingsItem.className;
    const subItemClass = sampleSub?.className ?? `${itemClass} justify-between data-[popup-open]:bg-fill-ghost-hover`;
    const iconSlot = settingsItem.firstElementChild;
    const separatorClass = menu.querySelector('[role="separator"]')?.className ?? "my-1 h-px bg-border";
    const panelClass = menu.className.replace(/\bw-\[[^\]]+\]/g, "");
    const scrollClass = menu.firstElementChild?.className ?? "";
    const added = [];
    const subLast = sampleSub?.lastElementChild;
    const nativeChevron = subLast && subLast !== sampleSub.firstElementChild && (subLast.matches('[data-cds="Icon"]') || subLast.querySelector('[data-cds="Icon"], svg')) ? subLast : null;
    const chevron = () => {
      const mark = nativeChevron?.cloneNode(true) ?? h4("span", { class: "-mr-1 shrink-0 text-muted", style: { display: "inline-flex" } }, icon("chevronRight", 16));
      mark.setAttribute("data-ccpp-chevron", "");
      return mark;
    };
    const iconBox = (char, name) => {
      const box = iconSlot?.cloneNode(true) ?? h4("span", { class: "flex size-icon shrink-0 items-center justify-center" });
      const native = box.querySelector('[data-cds="Icon"]');
      if (char && native) {
        native.textContent = char;
        native.removeAttribute("data-cds-mirror");
        return box;
      }
      box.textContent = "";
      if (char) box.appendChild(h4("span", { "data-cds": "Icon", "aria-hidden": "true", text: char, style: { fontSize: "calc(1.25rem * var(--cds-rem-scale, 1))", fontWeight: "433.3" } }));
      else box.appendChild(icon(name, 20, 1.75));
      return box;
    };
    const ownIcon = (name) => iconBox(glyph(name), name);
    const sectionIcon = (section) => iconBox(sectionGlyph(section.hash) ?? glyph(section.icon), section.icon);
    const row = (iconNode2, label, opts = {}) => {
      const el = h4(
        "div",
        { role: "menuitem", tabindex: "-1", "data-cds-icon-row": "", "data-ccpp-item": "", class: opts.sub ? subItemClass : itemClass, style: { cursor: "pointer" } },
        iconNode2,
        typeof label === "string" ? h4("span", { class: "min-w-0 flex-1 truncate", text: label }) : label,
        opts.trailing ?? null,
        opts.sub ? chevron() : null
      );
      if (opts.sub) el.setAttribute("aria-haspopup", "menu");
      el.addEventListener("pointerenter", () => highlight(el));
      el.addEventListener("pointerleave", () => el.removeAttribute("data-highlighted"));
      if (opts.run) {
        const run = opts.run;
        const activate = (event) => {
          event.preventDefault();
          event.stopPropagation();
          closeMenu(menu);
          setTimeout(run, 0);
        };
        el.addEventListener("click", activate);
        el.addEventListener("keydown", (event) => (event.key === "Enter" || event.key === " ") && activate(event));
      }
      return el;
    };
    const caption = (text) => h4("div", { class: "px-2.5 pt-2 pb-1 text-caption text-muted", style: { fontSize: "var(--cds-font-size-caption, 12px)", opacity: ".8" }, text });
    const separator = () => h4("div", { role: "separator", class: separatorClass });
    const highlight = (el) => {
      for (const other of el.parentElement?.querySelectorAll("[data-highlighted]") ?? []) other.removeAttribute("data-highlighted");
      el.setAttribute("data-highlighted", "");
    };
    const panel = (anchor, container3, width) => {
      const scroll = h4("div", { class: scrollClass, style: { maxHeight: "min(calc(100vh - 16px), 32rem)", overflowY: "auto", scrollbarWidth: "thin", scrollbarColor: "var(--cds-alpha-2, rgba(127,127,127,.35)) transparent" } });
      const el = h4("div", { role: "menu", "data-ccpp-panel-level": "", class: panelClass, style: { position: "absolute", width, zIndex: "1" } }, scroll);
      container3.appendChild(el);
      const place4 = () => {
        const a3 = anchor.getBoundingClientRect();
        const c4 = container3.getBoundingClientRect();
        const gap2 = 4;
        if (window.innerWidth - c4.right > el.offsetWidth + gap2 + 8) el.style.left = `calc(100% + ${gap2}px)`;
        else el.style.right = `calc(100% + ${gap2}px)`;
        const top2 = a3.top - c4.top - 4;
        const maxTop = window.innerHeight - c4.top - el.offsetHeight - 8;
        el.style.top = `${Math.max(-c4.top + 8, Math.min(top2, maxTop))}px`;
      };
      el.addEventListener("pointerover", (event) => event.stopPropagation());
      return { el, scroll, place: place4 };
    };
    const level2 = (container3) => {
      let open = null;
      const close = () => {
        if (!open) return;
        open.close();
        open.el.remove();
        open.trigger.removeAttribute("data-popup-open");
        open.trigger.setAttribute("aria-expanded", "false");
        open = null;
      };
      const attach = (trigger, width, fill5) => {
        trigger.setAttribute("aria-haspopup", "menu");
        trigger.setAttribute("aria-expanded", "false");
        const show = () => {
          if (open?.trigger === trigger) return;
          close();
          const { el, scroll, place: place4 } = panel(trigger, container3, width);
          const child = level2(el);
          fill5(scroll, child);
          place4();
          scroll.addEventListener("pointerover", (event) => {
            const target2 = event.target.closest('[role="menuitem"]');
            if (target2 && !target2.hasAttribute("aria-haspopup")) child.close();
          });
          trigger.setAttribute("data-popup-open", "");
          trigger.setAttribute("aria-expanded", "true");
          open = { trigger, el, close: child.close };
        };
        trigger.addEventListener("pointerenter", show);
        if (trigger.hasAttribute("data-ccpp-item")) {
          trigger.addEventListener("click", (event) => {
            event.stopPropagation();
            show();
          });
        }
        trigger.addEventListener("keydown", (event) => {
          if (event.key !== "ArrowRight") return;
          event.preventDefault();
          event.stopPropagation();
          show();
          open?.el.querySelector('[role="menuitem"]')?.focus();
        });
      };
      return { attach, close, isOpen: (trigger) => open?.trigger === trigger };
    };
    const top = level2(menu);
    const fillPlugins = (scroll) => {
      for (const plugin of options.plugins()) {
        const dot = h4("span", {
          class: "shrink-0",
          ...tipAttrs(isActive(plugin) ? "ON" : "OFF"),
          style: { width: "6px", height: "6px", borderRadius: "50%", marginInlineStart: "8px", background: isActive(plugin) ? "var(--cds-fill-accent, #257de0)" : "var(--cds-alpha-2, rgba(127,127,127,.4))" }
        });
        scroll.appendChild(row(ownIcon(plugin.icon ?? "puzzle"), t3(plugin.title), { trailing: dot, run: () => options.openPlugin(plugin) }));
      }
    };
    const fillCcpp = (scroll, child) => {
      for (const tab of options.tabs()) {
        if (tab.id === "plugins") {
          const plugins3 = row(ownIcon(tab.icon), t3(L5.plugins), { sub: true });
          child.attach(plugins3, "16rem", fillPlugins);
          scroll.appendChild(plugins3);
        } else scroll.appendChild(row(ownIcon(tab.icon), t3(tab.title), { run: () => options.openTab(tab.id) }));
      }
    };
    if (options.settingsFlyout) {
      settingsItem.classList.add("justify-between");
      const mark = chevron();
      settingsItem.appendChild(mark);
      added.push(mark);
      top.attach(settingsItem, "15rem", (scroll, child) => {
        const group = (title) => {
          if (scroll.childElementCount) scroll.appendChild(separator());
          if (title) scroll.appendChild(caption(title));
        };
        if (options.flyoutShows("open")) scroll.appendChild(row(ownIcon("settings"), t3(L5.openNative), { run: () => location.hash = options.nativeHash() }));
        if (options.flyoutShows("ccpp")) {
          group("CC++");
          fillCcpp(scroll, child);
        }
        const sections = NATIVE_SECTIONS.filter((section) => options.flyoutShows(section.hash));
        if (sections.length) group(t3(L5.claude));
        for (const section of sections) scroll.appendChild(row(sectionIcon(section), t3(section.label), { run: () => location.hash = section.hash }));
        if (!scroll.childElementCount) scroll.appendChild(row(ownIcon("settings"), t3(L5.openNative), { run: () => location.hash = options.nativeHash() }));
      });
    }
    if (options.entry) {
      const name = h4("span", { class: "min-w-0 flex-1 truncate" }, "CC++", h4("span", { class: "text-muted", "data-ccpp-version": "", text: ` v${version}`, style: { fontSize: "var(--cds-font-size-caption, 12px)", lineHeight: "1", verticalAlign: "middle", marginInlineStart: "4px" } }));
      const entry = row(ownIcon("plug"), name, { sub: true, trailing: shortcutHint(settingsItem, options.shortcut) });
      top.attach(entry, "14rem", (scroll, child) => {
        fillCcpp(scroll, child);
        scroll.appendChild(separator());
        scroll.appendChild(row(ownIcon("settings"), t3(L5.openSettings), { run: () => options.openTab("plugins") }));
      });
      settingsItem.after(entry);
      added.push(entry);
    }
    const onOver = (event) => {
      const target2 = event.target.closest('[role="menuitem"]');
      if (target2 && target2 !== settingsItem && !target2.hasAttribute("data-ccpp-item")) top.close();
    };
    menu.addEventListener("pointerover", onOver);
    return () => {
      top.close();
      menu.removeEventListener("pointerover", onOver);
      for (const el of added) el.remove();
    };
  }

  // src/plugins/_core/settings/native.ts
  var NAV = '[data-perf-region="settings_nav"]';
  var HASH = "#settings/ccpp-";
  var bootHash = typeof location === "object" ? location.hash : "";
  var hashTab = (hash) => hash.startsWith(HASH) ? hash.slice(HASH.length) : null;
  var PANEL = '[data-perf-region="settings_panel"]';
  var L6 = {
    group: "CC++",
    close: { zh: "关闭", en: "Close" }
  };
  var DOC_CSS = `
[data-ccpp-panel] > :not(:first-child):not([data-ccpp-host]) { display: none !important; }
[data-ccpp-active] li:not([data-ccpp-nav]) > button[aria-current] { background: transparent !important; font-weight: inherit !important; color: var(--cds-text-secondary, inherit) !important; }
[data-ccpp-active] li:not([data-ccpp-nav]) > button[aria-current]:hover { background: var(--cds-fill-ghost-hover, transparent) !important; color: var(--cds-text-primary, inherit) !important; }
[data-ccpp-host] { display: flex; flex-direction: column; flex: 1 1 0%; min-height: 0; min-width: 0; height: 100%; max-height: 100%; }
[data-ccpp-nav-head] { display: flex !important; align-items: baseline; gap: 6px; }
[data-ccpp-nav-version] { opacity: .7; font-size: .92em; font-variant-numeric: tabular-nums; }
`;
  function nativeGlyph(name, cls) {
    const char = glyph(name);
    if (char) return h4("span", { class: cls, "data-cds": "Icon", "aria-hidden": "true", text: char, style: { fontSize: "calc(1.25rem * var(--cds-rem-scale, 1))", fontWeight: "433.3" } });
    return h4("span", { class: cls, "aria-hidden": "true", style: { display: "inline-flex", width: "1.25rem", justifyContent: "center" } }, icon(name, 18));
  }
  var sortedTabs = () => [...tabs.values()].sort((a3, b3) => a3.order - b3.order);
  var HEAD_KEY = "settings.nativeHead";
  var nativeHead = readJson(HEAD_KEY, null);
  function learnNativeHead(panel) {
    const heading = [...panel.querySelectorAll('h1, h2, h3, [role="heading"]')].find((el) => {
      if (el.closest("[data-ccpp-host]") || !el.textContent?.trim()) return false;
      const r3 = el.getBoundingClientRect();
      return r3.width > 10 && r3.height > 10;
    });
    if (!heading) return;
    const box = panel.getBoundingClientRect();
    const rect = heading.getBoundingClientRect();
    if (!rect.height || !box.width) return;
    const style = getComputedStyle(heading);
    let gap2 = 12;
    let next = heading.nextElementSibling ?? heading.parentElement?.nextElementSibling ?? null;
    while (next && !next.getClientRects().length) next = next.nextElementSibling;
    if (next) gap2 = Math.round(next.getBoundingClientRect().top - rect.bottom);
    const head = {
      top: Math.round(rect.top - box.top),
      left: Math.round(rect.left - box.left),
      gap: Math.max(4, Math.min(gap2, 40)),
      size: style.fontSize,
      weight: style.fontWeight,
      line: style.lineHeight,
      track: style.letterSpacing,
      font: style.fontFamily
    };
    if (JSON.stringify(head) === JSON.stringify(nativeHead)) return;
    nativeHead = head;
    writeJson(HEAD_KEY, head);
  }
  function applyNativeHead(host4, panel) {
    if (!nativeHead) return;
    const box = panel.getBoundingClientRect();
    const own = host4.getBoundingClientRect();
    const top = nativeHead.top - Math.round(own.top - box.top);
    const left = nativeHead.left - Math.round(own.left - box.left);
    const vars = {
      "--ccpp-head-top": `${Math.max(0, top)}px`,
      "--ccpp-head-gap": `${nativeHead.gap}px`,
      "--ccpp-head-size": nativeHead.size,
      "--ccpp-head-weight": nativeHead.weight,
      "--ccpp-head-line": nativeHead.line,
      "--ccpp-head-track": nativeHead.track,
      "--ccpp-head-font": nativeHead.font
    };
    if (left >= 8) vars["--ccpp-pad-x"] = `${left}px`;
    for (const [name, value] of Object.entries(vars)) if (host4.style.getPropertyValue(name) !== value) host4.style.setProperty(name, value);
  }
  function spanDivider(divider, root2, scroller) {
    const d3 = divider.getBoundingClientRect();
    if (!d3.width) return;
    let edge = root2.getBoundingClientRect();
    let left = edge.left;
    let right = edge.right;
    if (getComputedStyle(scroller).overflowX !== "visible") {
      const box = scroller.getBoundingClientRect();
      left = Math.max(left, box.left + scroller.clientLeft);
      right = Math.min(right, box.left + scroller.clientLeft + scroller.clientWidth);
    }
    const style = getComputedStyle(divider);
    const ml = `${Math.round(parseFloat(style.marginLeft) + left - d3.left)}px`;
    const mr = `${Math.round(parseFloat(style.marginRight) + d3.right - right)}px`;
    if (divider.style.marginLeft !== ml) divider.style.marginLeft = ml;
    if (divider.style.marginRight !== mr) divider.style.marginRight = mr;
    if (divider.style.width !== "auto") {
      divider.style.width = "auto";
      divider.style.maxWidth = "none";
    }
  }
  function navDivider(root2, scroller) {
    const native = root2.querySelector('[role="separator"]:not([data-ccpp-nav-divider]), hr:not([data-ccpp-nav-divider])') ?? [...scroller.children].find((el) => el.tagName !== "UL" && !el.hasAttribute("data-ccpp-nav-group") && !el.textContent?.trim() && el.getClientRects().length);
    if (native) {
      const copy = native.tagName === "LI" ? h4("div", { class: native.className, role: "separator" }) : native.cloneNode(true);
      copy.setAttribute("data-ccpp-nav-divider", "");
      return copy;
    }
    return h4("div", { role: "separator", "data-ccpp-nav-divider": "", style: { height: "1px", margin: "8px 12px", background: "var(--cds-border-line, rgba(127,127,127,.25))" } });
  }
  function renderPage(tab, box) {
    const previous2 = box.querySelector(".page-body");
    const scrollTop = previous2?.scrollTop ?? 0;
    const sameTab = box.dataset.tab === tab.id;
    clear(box);
    box.dataset.tab = tab.id;
    const body = h4("div", { class: "page-body" });
    box.appendChild(h4("div", { class: "page" }, h4("div", { class: "page-head" }, h4("h2", { text: t3(tab.title) })), body));
    try {
      tab.render(body);
    } catch (error2) {
      body.appendChild(h4("div", { class: "banner", text: String(error2) }));
    }
    if (sameTab) body.scrollTop = scrollTop;
  }
  var mounted = null;
  var pendingTab = null;
  var nativeOpen = () => !!mounted && !!document.querySelector(NATIVE_DIALOG);
  var navPosition = () => "below";
  function installNative(scope, position2) {
    navPosition = position2;
    addStyle(scope, DOC_CSS, "settings-native");
    watch(scope, NATIVE_DIALOG, (dialog) => {
      let active2 = null;
      const shadow3 = shadowBox(PANEL_CSS);
      shadow3.host.dataset.ccppHost = "";
      shadow3.box.style.height = "100%";
      let classes2 = null;
      const nav = () => dialog.querySelector(NAV);
      const panel = () => dialog.querySelector(PANEL);
      const learnClasses = (root2) => {
        if (classes2) return classes2;
        const on3 = root2.querySelector("li:not([data-ccpp-nav]) > button[aria-current]");
        const off = root2.querySelector("li:not([data-ccpp-nav]) > button:not([aria-current])");
        const header = root2.querySelector("ul[aria-labelledby]")?.previousElementSibling;
        const list2 = root2.querySelector("ul");
        if (!off || !list2) return null;
        const fallbackOn = `${off.className.replace(/\btext-secondary\S*/g, "").replace(/\bhover:\S+/g, "")} bg-fill-ghost-selected font-medium text-primary`;
        classes2 = {
          header: header?.className || "px-sm pt-md text-caption text-muted",
          list: list2.className,
          on: on3?.className || fallbackOn,
          off: off.className,
          icon: off.querySelector("span[data-cds]")?.className || "shrink-0",
          label: off.querySelector("span:last-child")?.className || "min-w-0 flex-1 truncate"
        };
        return classes2;
      };
      const paintNav = () => {
        const root2 = nav();
        if (!root2) return;
        learnNativeIcons(root2, NATIVE_SECTIONS);
        const c4 = learnClasses(root2);
        if (!c4) return;
        const scroller = root2.querySelector("ul")?.parentElement;
        if (!scroller) return;
        let group = [...scroller.children].find((el) => el.hasAttribute("data-ccpp-nav-group"));
        const list2 = sortedTabs();
        if (!group || group.dataset.tabs !== list2.map((tab) => tab.id).join(",") || group.dataset.lang !== t3({ zh: "zh", en: "en" })) {
          group?.remove();
          const ul = h4("ul", { class: c4.list, "aria-label": L6.group });
          for (const tab of list2) {
            const button = h4(
              "button",
              { type: "button", class: c4.off, "data-tab": tab.id },
              nativeGlyph(tab.icon, c4.icon),
              h4("span", { class: c4.label, text: t3(tab.title) })
            );
            button.addEventListener("click", (event) => {
              event.preventDefault();
              activate(tab.id);
            });
            ul.appendChild(h4("li", { "data-ccpp-nav": tab.id }, button));
          }
          group = h4(
            "div",
            { "data-ccpp-nav-group": "", "data-tabs": list2.map((tab) => tab.id).join(","), "data-lang": t3({ zh: "zh", en: "en" }), style: { display: "contents" } },
            // The version sits right of the group name, on the same line.
            h4("div", { class: c4.header, "data-ccpp-nav-head": "" }, h4("span", { text: L6.group }), h4("span", { "data-ccpp-nav-version": "", text: `v${version}` })),
            ul
          );
          scroller.appendChild(group);
        }
        const wantFirst = navPosition() === "above";
        if (wantFirst ? scroller.firstElementChild !== group : scroller.lastElementChild !== group) {
          if (wantFirst) scroller.prepend(group);
          else scroller.appendChild(group);
        }
        let divider = group.querySelector(":scope > [data-ccpp-nav-divider]");
        if (!divider) divider = navDivider(root2, scroller);
        if (wantFirst ? group.lastElementChild !== divider : group.firstElementChild !== divider) {
          if (wantFirst) group.appendChild(divider);
          else group.prepend(divider);
        }
        spanDivider(divider, root2, scroller);
        for (const button of group.querySelectorAll("button[data-tab]")) {
          const on3 = button.dataset.tab === active2;
          const want = on3 ? c4.on : c4.off;
          if (button.className !== want) button.className = want;
          if (on3) button.setAttribute("aria-current", "page");
          else button.removeAttribute("aria-current");
        }
        root2.toggleAttribute("data-ccpp-active", !!active2);
      };
      const paintPanel = () => {
        const target2 = panel();
        if (!target2) return;
        if (!active2) {
          target2.removeAttribute("data-ccpp-panel");
          shadow3.host.remove();
          learnNativeHead(target2);
          return;
        }
        target2.setAttribute("data-ccpp-panel", "");
        if (shadow3.host.parentNode !== target2) target2.appendChild(shadow3.host);
        applyNativeHead(shadow3.host, target2);
      };
      const draw2 = () => {
        const tab = active2 ? tabs.get(active2) : null;
        if (active2 && !tab) active2 = null;
        paintNav();
        paintPanel();
        if (tab) renderPage(tab, shadow3.box);
      };
      function activate(id) {
        if (!tabs.has(id)) return;
        const target2 = panel();
        if (!active2 && target2) learnNativeHead(target2);
        active2 = id;
        if (location.hash !== HASH + id) {
          try {
            history.pushState(history.state, "", HASH + id);
          } catch {
          }
        }
        shadow3.sync();
        draw2();
        shadow3.box.querySelector(".page-body")?.scrollTo(0, 0);
      }
      const deactivate = () => {
        if (!active2) return;
        active2 = null;
        draw2();
      };
      let frame = 0;
      const observer2 = new MutationObserver(() => {
        if (frame) return;
        frame = requestAnimationFrame(() => {
          frame = 0;
          paintNav();
          paintPanel();
        });
      });
      observer2.observe(dialog, { childList: true, subtree: true });
      const onClick = (event) => {
        const target2 = event.target;
        if (target2?.closest?.(`${NAV} li:not([data-ccpp-nav]), ${NAV} [role="option"]`)) deactivate();
      };
      dialog.addEventListener("click", onClick, true);
      const onHash = () => {
        const id = hashTab(location.hash);
        if (id && tabs.has(id)) activate(id);
        else deactivate();
      };
      window.addEventListener("hashchange", onHash);
      const offRedraw = onRedraw(() => active2 && draw2());
      const self = { activate };
      mounted = self;
      paintNav();
      if (pendingTab) {
        const id = pendingTab;
        pendingTab = null;
        requestAnimationFrame(() => activate(id));
      }
      return () => {
        observer2.disconnect();
        cancelAnimationFrame(frame);
        dialog.removeEventListener("click", onClick, true);
        window.removeEventListener("hashchange", onHash);
        offRedraw();
        shadow3.host.remove();
        nav()?.removeAttribute("data-ccpp-active");
        panel()?.removeAttribute("data-ccpp-panel");
        dialog.querySelector("[data-ccpp-nav-group]")?.remove();
        if (mounted === self) mounted = null;
        if (hashTab(location.hash)) {
          try {
            history.replaceState(history.state, "", location.pathname + location.search);
          } catch {
          }
        }
      };
    });
    scope.defer(() => {
      mounted = null;
      pendingTab = null;
    });
    const fromHash = (hash) => {
      const id = hashTab(hash);
      if (id && tabs.has(id) && !nativeOpen()) void openNative(id);
    };
    scope.listen(window, "hashchange", () => fromHash(location.hash));
    if (hashTab(bootHash)) setTimeout(() => fromHash(bootHash), 500);
  }
  function openNative(tab) {
    if (nativeOpen()) {
      mounted.activate(tab);
      return Promise.resolve(true);
    }
    pendingTab = tab;
    location.hash = "settings/general";
    return new Promise((resolve) => {
      const started = Date.now();
      const check3 = () => {
        if (pendingTab !== tab) return resolve(true);
        if (Date.now() - started > 2e3) {
          pendingTab = null;
          return resolve(false);
        }
        setTimeout(check3, 100);
      };
      setTimeout(check3, 100);
    });
  }
  var standaloneClose = null;
  function openStandalone(tabId) {
    standaloneClose?.();
    let current6 = tabs.has(tabId) ? tabId : sortedTabs()[0]?.id;
    const nav = h4("nav", { class: "shell-nav" }, h4("div", { class: "group" }, L6.group, h4("span", { class: "ver", text: ` v${version}` })));
    const main2 = h4("div", { class: "shell-main" });
    const pageBox = h4("div", { style: { flex: "1", minHeight: "0", display: "flex", flexDirection: "column" } });
    const closeBtn = h4("button", { type: "button", class: "icon-btn", "aria-label": t3(L6.close), ...tipAttrs(t3(L6.close)) }, icon("x", 16));
    main2.append(h4("div", { class: "shell-top" }, closeBtn), pageBox);
    const draw2 = () => {
      for (const old of nav.querySelectorAll("button")) old.remove();
      for (const tab2 of sortedTabs()) {
        const button = h4("button", { type: "button", class: tab2.id === current6 ? "active" : "" }, icon(tab2.icon, 16), t3(tab2.title));
        button.addEventListener("click", () => {
          current6 = tab2.id;
          draw2();
        });
        nav.appendChild(button);
      }
      const tab = current6 ? tabs.get(current6) : null;
      if (tab) renderPage(tab, pageBox);
    };
    const shell = h4("div", { class: "shell", role: "dialog", "aria-modal": "true", "aria-label": "CC++" }, nav, main2);
    draw2();
    const offRedraw = onRedraw(draw2);
    const close = openModal(shell, {
      onClose: () => {
        offRedraw();
        standaloneClose = null;
      }
    });
    closeBtn.addEventListener("click", close);
    standaloneClose = close;
  }
  var standaloneOpen = () => !!standaloneClose;
  var closeStandalone = () => standaloneClose?.();

  // src/plugins/_core/settings/options.ts
  function renderOption(settings33, key, option, rerender) {
    const owner = settings33.owner();
    const values2 = {};
    for (const [k4, def] of Object.entries(settings33.def)) values2[k4] = coerce(def, getRaw(owner, k4));
    if (option.visible && !option.visible(values2)) return null;
    const value = values2[key];
    const set = (next) => {
      setRaw(owner, key, next);
      if (Object.values(settings33.def).some((def) => def.visible)) rerender();
    };
    const text = h4("div", { class: "row-text" }, h4("div", { class: "row-title", text: t3(option.label) }), option.description ? h4("div", { class: "row-desc", text: t3(option.description) }) : null);
    const row = (control, wide = false) => h4("div", { class: `row${wide ? " wide" : ""}`, "data-key": key }, text, wide ? control : h4("div", { class: "row-control" }, control));
    switch (option.type) {
      case "boolean": {
        const sw = h4("button", { type: "button", class: "switch", role: "switch", "aria-checked": String(value), "aria-label": t3(option.label) });
        sw.addEventListener("click", () => {
          const next = sw.getAttribute("aria-checked") !== "true";
          sw.setAttribute("aria-checked", String(next));
          set(next);
        });
        return row(sw);
      }
      case "number": {
        const output = h4("output", { text: `${value}${option.unit ?? ""}` });
        const input = h4("input", { type: "range", min: option.min, max: option.max, step: option.step ?? 1, value: String(value), "aria-label": t3(option.label) });
        const label = `${t3({ zh: "恢复默认", en: "Reset to default" })} (${option.default}${option.unit ?? ""})`;
        const reset = h4("button", { type: "button", class: "icon-btn", ...tipAttrs(label), "aria-label": label, disabled: value === option.default }, icon("refresh", 14));
        input.addEventListener("input", () => {
          output.textContent = `${input.value}${option.unit ?? ""}`;
          reset.disabled = Number(input.value) === option.default;
        });
        input.addEventListener("change", () => set(Number(input.value)));
        reset.addEventListener("click", () => {
          input.value = String(option.default);
          output.textContent = `${option.default}${option.unit ?? ""}`;
          reset.disabled = true;
          set(option.default);
        });
        return row(h4("div", { class: "range" }, input, output, reset));
      }
      case "select": {
        const select = h4("select", { class: "input", "aria-label": t3(option.label) }, ...option.options.map((o3) => h4("option", { value: o3.value, text: t3(o3.label), selected: o3.value === value })));
        select.addEventListener("change", () => set(select.value));
        return row(select);
      }
      case "color": {
        const input = h4("input", { type: "color", value: String(value), "aria-label": t3(option.label) });
        input.addEventListener("change", () => set(input.value));
        return row(input);
      }
      case "string": {
        const input = h4("input", { class: "input", value: String(value ?? ""), placeholder: option.placeholder ? t3(option.placeholder) : "", maxLength: option.maxLength ?? 2e3, "aria-label": t3(option.label) });
        input.addEventListener("change", () => set(input.value));
        return row(input, true);
      }
      case "text": {
        const area = h4("textarea", { class: "input", rows: option.rows ?? 5, placeholder: option.placeholder ? t3(option.placeholder) : "", "aria-label": t3(option.label) });
        area.value = String(value ?? "");
        area.addEventListener("change", () => set(area.value));
        return row(area, true);
      }
      case "image":
        return row(imageField(option, String(value ?? ""), (next) => set(next)), true);
      case "action": {
        const button = h4("button", { type: "button", class: "btn", text: t3(option.button) });
        button.addEventListener("click", async () => {
          if (option.confirm && !await confirmDialog({ title: t3(option.label), body: t3(option.confirm), danger: true })) return;
          option.run();
        });
        return row(button);
      }
    }
  }

  // src/plugins/_core/settings/pluginsTab.ts
  var CATEGORY_LABELS = {
    favorites: { zh: "收藏", en: "Favorites" },
    recent: { zh: "最近", en: "Recent" },
    all: { zh: "全部", en: "All" },
    composer: { zh: "输入框", en: "Composer" },
    messages: { zh: "消息", en: "Messages" },
    chats: { zh: "对话", en: "Chats" },
    media: { zh: "媒体", en: "Media" },
    navigation: { zh: "导航", en: "Navigation" },
    notifications: { zh: "通知", en: "Notifications" },
    appearance: { zh: "外观", en: "Appearance" },
    declutter: { zh: "精简", en: "Declutter" },
    privacy: { zh: "隐私", en: "Privacy" },
    developer: { zh: "开发者", en: "Developer" }
  };
  var CATEGORY_ORDER = Object.keys(CATEGORY_LABELS);
  var L7 = {
    search: { zh: "搜索 {n} 个插件…", en: "Search {n} plugins…" },
    all: { zh: "全部", en: "All" },
    enabled: { zh: "已启用", en: "Enabled" },
    disabled: { zh: "已停用", en: "Disabled" },
    reloadBanner: { zh: "有插件需要刷新页面才能完全生效：", en: "Reload the page to fully apply: " },
    reload: { zh: "刷新", en: "Reload" },
    later: { zh: "稍后", en: "Later" },
    reloadTitle: { zh: "需要刷新", en: "Reload required" },
    reloadBody: { zh: "「{name}」要刷新页面后才能完全生效。现在刷新吗？", en: "“{name}” fully applies after a reload. Reload now?" },
    empty: { zh: "没有匹配的插件", en: "No matching plugins" },
    noFavorites: { zh: "还没有收藏的插件", en: "No favorites yet" },
    noFavoritesHint: { zh: "点插件卡片上的 ☆ 收藏，常用的插件会出现在这里。", en: "Star a plugin card and it shows up here." },
    noRecent: { zh: "最近 7 天没有新增或更新的插件", en: "Nothing new or updated in the last 7 days" },
    required: { zh: "必需插件", en: "Required" },
    favorite: { zh: "收藏", en: "Favorite" },
    pin: { zh: "置顶", en: "Pin" },
    configure: { zh: "设置", en: "Settings" },
    newBadge: { zh: "NEW", en: "NEW" },
    updated: { zh: "最近更新", en: "Updated" },
    needsReload: { zh: "需刷新", en: "Reload" },
    crashed: { zh: "出错", en: "Crashed" },
    keptBy: { zh: "被这些插件需要，保持开启：", en: "Kept on by: " },
    settings: { zh: "设置", en: "Settings" },
    noOptions: { zh: "这个插件没有可调的选项。", en: "This plugin has no options." },
    reset: { zh: "重置设置", en: "Reset settings" },
    resetTitle: { zh: "重置设置？", en: "Reset settings?" },
    resetBody: { zh: "「{name}」的所有选项会恢复默认值。", en: "Every option of “{name}” goes back to its default." },
    resetOk: { zh: "重置", en: "Reset" },
    author: { zh: "作者", en: "By" },
    dependsOn: { zh: "依赖", en: "Needs" }
  };
  var fill2 = (text, name) => t3(text).replace("{name}", name);
  var authorOf = (plugin) => plugin.authors?.join(", ") || "CC++";
  var listedPlugins = () => allPlugins().filter((p4) => view.showApi || !(p4.hidden || p4.category === "api"));
  function matchesQuery(plugin, query) {
    if (!query) return true;
    const hay = [plugin.name, t3(plugin.title), t3(plugin.description), ...Object.values(plugin.settings?.def ?? {}).map((o3) => t3(o3.label))].join(" ").toLowerCase();
    return query.toLowerCase().split(/\s+/).every((word) => hay.includes(word));
  }
  function inCategory(plugin, category) {
    if (category === "all") return true;
    if (category === "favorites") return isFavorite(plugin.name);
    if (category === "recent") return isRecent(plugin);
    return plugin.category === category || !!plugin.tags?.includes(category);
  }
  function passesFilter(plugin) {
    if (view.filter === "enabled") return isActive(plugin);
    if (view.filter === "disabled") return !isActive(plugin);
    return true;
  }
  var hasOptions = (plugin) => !!plugin.settings && Object.values(plugin.settings.def).length > 0;
  async function togglePlugin(plugin, on3) {
    setEnabled(plugin, on3);
    if (!plugin.restartNeeded) return;
    const reload = await confirmDialog({ title: t3(L7.reloadTitle), body: fill2(L7.reloadBody, t3(plugin.title)), ok: L7.reload, cancel: L7.later });
    if (reload) location.reload();
  }
  function pluginSwitch(plugin) {
    const enabled = isEnabled(plugin);
    const keptBy = !enabled ? activeDependents(plugin.name) : [];
    const sw = h4("button", {
      type: "button",
      class: "switch",
      role: "switch",
      "aria-checked": String(isActive(plugin)),
      "aria-label": t3(plugin.title),
      disabled: !!plugin.required || keptBy.length > 0,
      ...keptBy.length ? tipAttrs(t3(L7.keptBy) + keptBy.map((p4) => t3(p4.title)).join(", ")) : {}
    });
    sw.addEventListener("click", () => togglePlugin(plugin, !enabled));
    return sw;
  }
  function badges(plugin) {
    const out = [];
    if (isNew(plugin.name)) out.push(h4("span", { class: "badge accent", text: t3(L7.newBadge) }));
    else if (isRecent(plugin)) out.push(h4("span", { class: "badge", text: t3(L7.updated) }));
    if (pendingRestart().includes(plugin)) out.push(h4("span", { class: "badge accent", text: t3(L7.needsReload) }));
    if (pluginError(plugin.name)) out.push(h4("span", { class: "badge bad", text: t3(L7.crashed) }));
    return out;
  }
  function pluginCard(plugin) {
    const error2 = pluginError(plugin.name);
    const iconBtn = (cls, label, name, on3, run) => {
      const button = h4("button", { type: "button", class: `icon-btn ${cls}${on3 ? " on" : ""}`, ...tipAttrs(t3(label)), "aria-label": t3(label), "aria-pressed": String(on3) }, icon(name, 14));
      button.addEventListener("click", run);
      return button;
    };
    const title = h4("span", { class: "card-title", text: t3(plugin.title), ...tipAttrs(plugin.name) });
    title.addEventListener("click", () => openPluginDialog(plugin));
    return h4(
      "div",
      { class: `card${isActive(plugin) ? " on" : " off"}${error2 ? " crashed" : ""}`, "data-plugin": plugin.name, ...error2 ? tipAttrs(t3(L7.crashed), `${error2.stage}: ${error2.message}`) : {} },
      h4(
        "div",
        { class: "card-body" },
        h4(
          "div",
          { class: "card-top" },
          h4("span", { class: "chip-icon" }, icon(plugin.icon ?? "puzzle", 14)),
          title,
          h4(
            "div",
            { class: "card-actions" },
            iconBtn("star", L7.favorite, "star", isFavorite(plugin.name), () => toggleIn("favorites", plugin.name)),
            iconBtn("pin", L7.pin, "pin", isPinned(plugin.name), () => toggleIn("pinned", plugin.name)),
            hasOptions(plugin) ? iconBtn("cfg", L7.configure, "sliders", false, () => openPluginDialog(plugin)) : null,
            pluginSwitch(plugin)
          )
        ),
        h4("div", { class: "card-desc", text: t3(plugin.description) }),
        h4("div", { class: "card-gap" }),
        h4("div", { class: "card-foot" }, ...badges(plugin), h4("span", { class: "author", text: authorOf(plugin) }))
      )
    );
  }
  var sortPlugins = (list2) => list2.sort((a3, b3) => Number(isPinned(b3.name)) - Number(isPinned(a3.name)) || Number(isFavorite(b3.name)) - Number(isFavorite(a3.name)) || t3(a3.title).localeCompare(t3(b3.title)));
  function defaultCategory() {
    return prefs.get().favorites.some((name) => getPlugin(name)) ? "favorites" : "all";
  }
  function renderPluginsTab(container3) {
    if (!view.category) view.category = defaultCategory();
    const plugins3 = listedPlugins();
    const categories = CATEGORY_ORDER.filter((cat) => ["favorites", "recent", "all"].includes(cat) || plugins3.some((p4) => inCategory(p4, cat)));
    const tabBar = h4("div", { class: "tabs", role: "tablist" });
    const searchLabel = () => t3(L7.search).replace("{n}", String(plugins3.filter((p4) => inCategory(p4, view.category)).length));
    const search3 = h4("input", { class: "input", type: "search", placeholder: searchLabel(), value: view.query, "aria-label": searchLabel() });
    for (const cat of categories) {
      const button = h4("button", { type: "button", role: "tab", class: view.category === cat ? "active" : "", "aria-selected": String(view.category === cat) }, t3(CATEGORY_LABELS[cat]));
      button.addEventListener("click", () => {
        view.category = cat;
        for (const other of tabBar.children) other.classList.toggle("active", other === button), other.setAttribute("aria-selected", String(other === button));
        search3.placeholder = searchLabel();
        search3.setAttribute("aria-label", searchLabel());
        renderList();
      });
      tabBar.appendChild(button);
    }
    search3.addEventListener("input", () => {
      view.query = search3.value;
      renderList();
    });
    const filter = h4(
      "select",
      { class: "input", "aria-label": t3(L7.all) },
      ...["all", "enabled", "disabled"].map((value) => h4("option", { value, text: t3(L7[value]), selected: view.filter === value }))
    );
    filter.addEventListener("change", () => {
      view.filter = filter.value;
      renderList();
    });
    container3.appendChild(h4("div", { class: "sticky-top" }, tabBar, h4("div", { class: "bar" }, h4("label", { class: "search" }, icon("search", 14), search3), filter)));
    const pending2 = pendingRestart();
    if (pending2.length) {
      const reload = h4("button", { type: "button", class: "btn primary", text: t3(L7.reload) });
      reload.addEventListener("click", () => location.reload());
      container3.appendChild(h4("div", { class: "banner" }, icon("alert", 16), h4("span", { text: t3(L7.reloadBanner) + pending2.map((p4) => t3(p4.title)).join(t3({ zh: "、", en: ", " })) }), reload));
    }
    const list2 = h4("div");
    container3.appendChild(list2);
    function renderList() {
      clear(list2);
      const shown2 = plugins3.filter((p4) => (view.query ? true : inCategory(p4, view.category)) && matchesQuery(p4, view.query) && passesFilter(p4));
      if (!shown2.length) {
        const [title, hint] = view.category === "favorites" && !view.query ? [L7.noFavorites, L7.noFavoritesHint] : view.category === "recent" && !view.query ? [L7.noRecent, null] : [L7.empty, null];
        list2.appendChild(h4("div", { class: "empty" }, h4("b", { text: t3(title) }), hint ? t3(hint) : null));
        return;
      }
      const splitRequired = view.category === "all" && !view.query;
      const main2 = sortPlugins(shown2.filter((p4) => !splitRequired || !p4.required));
      const required = splitRequired ? sortPlugins(shown2.filter((p4) => p4.required)) : [];
      if (main2.length) list2.appendChild(h4("div", { class: "grid" }, ...main2.map(pluginCard)));
      if (required.length) list2.append(h4("div", { class: "sep", text: t3(L7.required) }), h4("div", { class: "grid" }, ...required.map(pluginCard)));
    }
    renderList();
  }
  function openPluginDialog(plugin) {
    const body = h4("div");
    const draw2 = () => {
      clear(body);
      const meta = h4("div", { class: "d-meta" }, ...badges(plugin), h4("span", { text: `${t3(L7.author)} ${authorOf(plugin)}` }));
      if (plugin.dependencies?.length && view.showApi) meta.appendChild(h4("span", { text: `· ${t3(L7.dependsOn)} ${plugin.dependencies.join(", ")}` }));
      const top = h4("div", { class: "row" }, h4("div", { class: "row-text" }, h4("p", { class: "d-desc", text: t3(plugin.description) }), meta), h4("div", { class: "row-control" }, pluginSwitch(plugin)));
      const error2 = pluginError(plugin.name);
      body.append(top);
      if (error2) body.appendChild(h4("div", { class: "banner" }, icon("alert", 16), h4("span", { text: `${error2.stage}: ${error2.message}` })));
      body.appendChild(h4("div", { class: "d-sep" }));
      body.appendChild(h4("div", { class: "d-title", text: t3(L7.settings) }));
      if (!hasOptions(plugin)) {
        body.appendChild(h4("p", { class: "muted", text: t3(L7.noOptions) }));
        return;
      }
      const rows = Object.entries(plugin.settings.def).map(([key, option]) => renderOption(plugin.settings, key, option, draw2)).filter(Boolean);
      body.appendChild(h4("div", { class: "rows" }, ...rows));
    };
    draw2();
    const reset = h4("button", { type: "button", class: "btn danger", text: t3(L7.reset), disabled: !hasOptions(plugin) });
    reset.addEventListener("click", async () => {
      if (!await confirmDialog({ title: t3(L7.resetTitle), body: fill2(L7.resetBody, t3(plugin.title)), ok: L7.resetOk, danger: true })) return;
      plugin.settings.reset();
      draw2();
    });
    let close = () => {
    };
    const frame = dialogFrame({ title: t3(plugin.title), icon: plugin.icon ?? "puzzle", body: [body], foot: [reset, h4("span", { class: "grow" })], onClose: () => close() });
    const offSettings = onSettingsChange((name) => name === plugin.name && refreshHead());
    const offRedraw = onRedraw(refreshHead);
    function refreshHead() {
      const top = body.querySelector(":scope > .row");
      const fresh = h4("div", { class: "row-control" }, pluginSwitch(plugin));
      top?.querySelector(".row-control")?.replaceWith(fresh);
    }
    close = openModal(frame, {
      onClose: () => {
        offSettings();
        offRedraw();
      }
    });
  }

  // src/plugins/_core/settings/index.ts
  var L8 = {
    plugins: { zh: "插件", en: "Plugins" },
    openSettings: { zh: "CC++ 设置", en: "CC++ settings" }
  };
  function registerTab(scope, tab) {
    tabs.set(tab.id, tab);
    scope.defer(() => {
      if (tabs.get(tab.id) === tab) tabs.delete(tab.id);
      redraw();
    });
    redraw();
  }
  var inFlyout = (v3) => v3.settingsFlyout === true;
  var flyoutSections = Object.fromEntries(
    NATIVE_SECTIONS.map((section) => [
      `flyout:${section.hash}`,
      { type: "boolean", label: { zh: `子菜单里显示「${section.label.zh}」`, en: `Show “${section.label.en}” in the submenu` }, default: true, visible: inFlyout }
    ])
  );
  var settings = definePluginSettings({
    language: {
      type: "select",
      label: { zh: "界面语言", en: "Language" },
      default: "auto",
      options: [
        { value: "auto", label: { zh: "跟随 claude.ai", en: "Follow claude.ai" } },
        { value: "zh", label: "中文" },
        { value: "en", label: "English" }
      ]
    },
    nativeDialog: {
      type: "boolean",
      label: { zh: "放进 claude.ai 的设置弹窗", en: "Live inside claude.ai's settings dialog" },
      description: { zh: "关闭后用独立弹窗。", en: "Off uses a separate dialog." },
      default: true
    },
    navPosition: {
      type: "select",
      label: { zh: "CC++ 分组位置", en: "CC++ group position" },
      default: "below",
      options: [
        { value: "below", label: { zh: "下方", en: "Below" } },
        { value: "above", label: { zh: "上方", en: "Above" } }
      ]
    },
    userMenuEntry: { type: "boolean", label: { zh: "头像菜单里的 CC++ 子菜单", en: "CC++ submenu in the account menu" }, default: true },
    settingsFlyout: { type: "boolean", label: { zh: "头像菜单的「设置」展开成子菜单", en: "Account-menu Settings opens a submenu" }, description: { zh: "悬停展开，点击仍打开设置。", en: "Hover to expand; click still opens settings." }, default: true },
    flyoutOpen: { type: "boolean", label: { zh: "子菜单里显示「打开设置」", en: "Show “Open settings” in the submenu" }, default: true, visible: inFlyout },
    flyoutLast: {
      type: "boolean",
      label: { zh: "「打开设置」回到上次看的设置页", en: "“Open settings” returns to the last settings page" },
      description: { zh: "关闭后总是打开「通用」。", en: "Off always opens General." },
      default: true,
      visible: (v3) => inFlyout(v3) && v3.flyoutOpen === true
    },
    flyoutCcpp: { type: "boolean", label: { zh: "子菜单里显示 CC++ 的页面", en: "Show CC++ pages in the submenu" }, default: true, visible: inFlyout },
    ...flyoutSections,
    menuPlugins: {
      type: "select",
      label: { zh: "「插件」子菜单列出哪些插件", en: "Plugins listed in the Plugins submenu" },
      default: "all",
      options: [
        { value: "all", label: { zh: "全部", en: "All" } },
        { value: "enabled", label: { zh: "已开启的", en: "Enabled ones" } },
        { value: "favorites", label: { zh: "收藏的", en: "Favorites" } },
        { value: "configurable", label: { zh: "有设置项的", en: "Ones with settings" } }
      ],
      visible: (v3) => v3.userMenuEntry === true || inFlyout(v3)
    },
    codeGear: {
      type: "boolean",
      label: { zh: "Code 页侧栏的齿轮按钮换成 CC++ 入口", en: "Code sidebar gear becomes the CC++ entry" },
      description: {
        zh: "图标换成滑杆，点击在同一个设置弹窗里直接打开 CC++ 的「插件」页，claude.ai 自己的设置仍在左侧导航；按住 Alt / Shift 点击照旧打开原生 Code 设置。",
        en: "Shows a sliders icon and lands on CC++ Plugins in the same settings dialog; claude.ai's own pages stay in its nav. Alt- or Shift-click keeps the original Code page."
      },
      default: true
    },
    hotkey: { type: "string", label: { zh: "打开设置的快捷键", en: "Shortcut to open settings" }, description: { zh: "如 mod+shift+.，留空关闭。", en: "e.g. mod+shift+.; empty disables." }, default: "mod+shift+." },
    composerEntry: { type: "boolean", label: { zh: "在输入框旁显示 CC++ 按钮", en: "CC++ button next to the model picker" }, default: false },
    showApiPlugins: { type: "boolean", label: { zh: "显示 API / 核心插件", en: "Show API and core plugins" }, default: false }
  });
  var isSettingsOpen = () => nativeOpen() || standaloneOpen();
  async function openSettings(options = {}) {
    const plugin = options.plugin ? getPlugin(options.plugin) : void 0;
    if (plugin) {
      view.category = "all";
      view.query = "";
    }
    const tab = plugin ? "plugins" : options.tab && tabs.has(options.tab) ? options.tab : "plugins";
    let shown2 = false;
    if (settings.store.nativeDialog) shown2 = await openNative(tab);
    if (!shown2) openStandalone(tab);
    if (plugin) openPluginDialog(plugin);
  }
  function closeSettings() {
    closeAllModals();
    closeStandalone();
    if (nativeOpen()) document.querySelector('[data-perf-region="settings_panel"] button[aria-label]')?.click();
  }
  var lastNative = persisted("settings-last-native", "settings/general", (v3) => typeof v3 === "string" && NATIVE_SECTIONS.some((s3) => s3.hash === v3));
  var nativeHash = () => settings.store.flyoutLast ? lastNative.get() : "settings/general";
  function menuPlugins() {
    const all = listedPlugins().sort((a3, b3) => t3(a3.title).localeCompare(t3(b3.title)));
    switch (settings.store.menuPlugins) {
      case "enabled":
        return all.filter((p4) => isActive(p4));
      case "favorites":
        return all.filter((p4) => isFavorite(p4.name));
      case "configurable":
        return all.filter((p4) => Object.values(p4.settings?.def ?? {}).some((o3) => o3.type !== "action"));
      default:
        return all;
    }
  }
  var entries = null;
  function installEntries(parent) {
    entries?.dispose();
    const scope = entries = parent.child();
    if (settings.store.userMenuEntry || settings.store.settingsFlyout) {
      installUserMenu(scope, {
        entry: settings.store.userMenuEntry,
        settingsFlyout: settings.store.settingsFlyout,
        shortcut: settings.store.hotkey.trim() ? comboKeys(settings.store.hotkey) : [],
        tabs: sortedTabs,
        plugins: menuPlugins,
        flyoutShows: (row) => settings.store[row === "open" ? "flyoutOpen" : row === "ccpp" ? "flyoutCcpp" : `flyout:${row}`] !== false,
        nativeHash,
        openTab: (tab) => openSettings({ tab }),
        openPlugin: (plugin) => openPluginDialog(plugin)
      });
    }
    const toggle = () => isSettingsOpen() ? closeSettings() : openSettings();
    if (settings.store.hotkey.trim()) bindKey(scope, settings.store.hotkey, toggle, { inInputs: true });
    addMenuCommand(scope, `⚙️ ${t3(L8.openSettings)}${settings.store.hotkey ? ` (${comboLabel(settings.store.hotkey)})` : ""}`, () => openSettings());
    if (settings.store.composerEntry) addSlotItem(scope, "composer", "settings", () => slotButton(t3(L8.openSettings), () => openSettings(), icon("plug", 16)), 100);
  }
  var codeGear = null;
  var settings_default = definePlugin({
    name: "CCPPSettings",
    title: { zh: "设置面板", en: "Settings" },
    description: {
      zh: "CC++ 的设置界面本身也是插件：claude.ai 设置侧栏里的 CC++ 分组、头像菜单子菜单、插件卡片（收藏、置顶、单插件设置弹窗）。",
      en: "The CC++ settings UI, itself a plugin: the CC++ group in claude.ai's settings sidebar, the account-menu submenu, and plugin cards with favorites, pins and per-plugin dialogs."
    },
    category: "core",
    icon: "settings",
    updatedAt: "2026-11-07",
    required: true,
    dependencies: ["DomApi", "HotkeysApi", "MenuApi", "SlotsApi", "StylesApi"],
    settings,
    start(scope) {
      setLang(settings.store.language);
      view.showApi = settings.store.showApiPlugins;
      registerTab(scope, { id: "plugins", title: L8.plugins, icon: "puzzle", order: 0, render: renderPluginsTab });
      initLayer(scope);
      installNative(scope, () => settings.store.navPosition === "above" ? "above" : "below");
      scope.defer(onPluginStateChange(redraw));
      scope.defer(onSettingsChange((_3, key) => key === "enabled" && redraw()));
      scope.defer(prefs.subscribe(redraw));
      installEntries(scope);
      codeGear = installCodeGear(scope, () => settings.store.codeGear, () => void openSettings({ tab: "plugins" }));
      const remember2 = () => {
        const hash = location.hash.slice(1);
        if (NATIVE_SECTIONS.some((s3) => s3.hash === hash)) lastNative.set(hash);
      };
      remember2();
      scope.listen(window, "hashchange", remember2);
    },
    onSettingsChange(key, scope) {
      if (key === "language") setLang(settings.store.language);
      if (key === "showApiPlugins") view.showApi = settings.store.showApiPlugins;
      if (key === "codeGear") codeGear?.repaint();
      if (key === "hotkey" || key === "composerEntry" || key === "userMenuEntry" || key === "settingsFlyout") installEntries(scope);
      redraw();
    }
  });

  // sites/claude/index.ts
  var logger7 = new Logger2("Kernel");
  function exposeRuntime(U3) {
    const win = pageWindow;
    win.__ccpp = version;
    const runtime2 = Object.freeze({
      version,
      scriptVersion: U3.version,
      framework: U3.frameworkVersion,
      get plugins() {
        return allPlugins().map(pluginInfo);
      },
      plugin(name) {
        const found = allPlugins().find((p4) => p4.name === name);
        return found ? pluginInfo(found) : null;
      }
    });
    try {
      Object.defineProperty(win, "CCPP", { value: runtime2, enumerable: false, configurable: false, writable: false });
    } catch {
    }
  }
  var settingsUiRunning = () => !!allPlugins().find((p4) => p4.name === SETTINGS_UI_PLUGIN)?.scope;
  var claude_default = (U3) => {
    bindHost(U3);
    let migrated = false;
    if (host()) {
      setVersion(U3.version);
      migrated = migrateLegacy();
      exposeRuntime(U3);
      installTooltips();
    }
    return U3.defineSite({
      id: "claude",
      name: "Claude",
      matches: ["https://claude.ai/*"],
      theme: () => isDark() ? "dark" : "light",
      // "CC++ settings" anywhere in the framework (its search bar, U.openSettings) opens CC++'s own settings.
      // In safe mode CC++'s settings UI doesn't run and the framework panel opens instead.
      settingsHost: {
        open(opts = {}) {
          if (!settingsUiRunning()) return false;
          void openSettings(opts);
          return true;
        },
        isOpen: () => isSettingsOpen()
      },
      start() {
        startPhase("dom-ready");
        if (migrated) U3.SettingsStore.markAsChanged();
        if (!U3.isSafeMode()) {
          U3.removeSlotItem("menuCommand", "uspp-ccpp-settings");
          U3.removeSlotItem("floating", "uspp.settingsEntry");
        }
        logger7.info(`CC++ ${version} on Userscript++ ${U3.frameworkVersion}, ${allPlugins().length} plugins`);
      }
    });
  };

  // src/kernel/framework.ts
  var earlyQueued = false;
  function frameworkSettings(U3, plugin) {
    const def = plugin.settings?.def;
    if (!def || !Object.keys(def).length) return void 0;
    const T4 = U3.OptionType;
    const out = {};
    const checks = {};
    const describe2 = (option) => {
      const label = t3(option.label);
      const detail = option.description ? t3(option.description) : "";
      return detail ? `${label}: ${detail}` : label;
    };
    for (const [key, option] of Object.entries(def)) {
      const base = { get description() {
        return describe2(option);
      } };
      switch (option.type) {
        case "boolean":
          out[key] = { ...base, type: T4.BOOLEAN, default: option.default };
          break;
        case "number":
          out[key] = { ...base, type: T4.SLIDER, min: option.min, max: option.max, default: option.default, markers: [option.min, option.max] };
          break;
        case "select":
          out[key] = {
            ...base,
            type: T4.SELECT,
            get options() {
              return option.options.map((o3) => ({ label: t3(o3.label), value: o3.value, default: o3.value === option.default }));
            }
          };
          break;
        case "text":
          out[key] = { ...base, type: T4.STRING, default: option.default, multiline: true, rows: option.rows ?? 4 };
          break;
        case "string":
        case "color":
          out[key] = { ...base, type: T4.STRING, default: option.default };
          break;
        case "image":
          out[key] = { ...base, type: T4.STRING, default: option.default, hidden: true };
          break;
        case "action":
          out[key] = {
            ...base,
            type: T4.COMPONENT,
            component: () => U3.react.h(
              U3.components.Button,
              {
                size: "sm",
                onClick: async () => {
                  if (option.confirm && !await U3.components.confirmDialog({ title: t3(option.confirm), danger: true })) return;
                  option.run();
                }
              },
              t3(option.button)
            )
          };
          break;
      }
      if (option.visible) {
        const visible = option.visible;
        checks[key] = {
          disabled: () => {
            const values2 = {};
            for (const k4 of Object.keys(def)) values2[k4] = getRaw(plugin.name, k4) ?? def[k4].default;
            return !visible(values2);
          }
        };
      }
    }
    return U3.definePluginSettings(out, checks);
  }
  function toFramework(plugin) {
    return (U3) => {
      bindHost(U3);
      registerOne(plugin);
      if (!earlyQueued && host()) {
        earlyQueued = true;
        queueMicrotask(startEarly);
      }
      return {
        name: plugin.name,
        get description() {
          return t3(plugin.description);
        },
        authors: plugin.authors?.length ? plugin.authors : ["CC++"],
        tags: [plugin.category, ...plugin.tags ?? []],
        enabledByDefault: !!plugin.enabledByDefault,
        required: !!plugin.required,
        hidden: !!plugin.hidden,
        dependencies: plugin.dependencies ?? [],
        startAt: plugin.startAt === "document-start" ? U3.StartAt.Init : U3.StartAt.DOMContentLoaded,
        requiresRestart: !!plugin.restartNeeded,
        updatedAt: plugin.updatedAt ? Date.parse(plugin.updatedAt) : void 0,
        settings: frameworkSettings(U3, plugin),
        start() {
          enterPhase(plugin.startAt === "document-start" ? "document-start" : "dom-ready");
          runStart(plugin, true);
        },
        stop() {
          runStop(plugin);
        }
      };
    };
  }

  // src/plugins/_api/composer/index.ts
  function getEditor() {
    const all = [...document.querySelectorAll(SEL.editor)];
    return all.find((el) => el === document.activeElement) ?? all.find(isShown) ?? null;
  }
  function getText(editor = getEditor()) {
    if (!editor || editor.dataset.docEmpty === "true") return "";
    const blocks = [...editor.children];
    if (!blocks.length) return editor.innerText.trim();
    return blocks.map((block2) => block2.innerText.replace(/\n$/, "")).join("\n").replace(/ /g, " ").trim();
  }
  function selectAll(editor) {
    editor.focus();
    const range = document.createRange();
    range.selectNodeContents(editor);
    const selection = getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
  }
  function insertText(text, editor = getEditor()) {
    if (!editor) return false;
    editor.focus();
    const data = new DataTransfer();
    data.setData("text/plain", text);
    const event = new ClipboardEvent("paste", { clipboardData: data, bubbles: true, cancelable: true });
    editor.dispatchEvent(event);
    if (!event.defaultPrevented) document.execCommand("insertText", false, text);
    return true;
  }
  function setText(text, editor = getEditor()) {
    if (!editor) return false;
    selectAll(editor);
    if (!text) {
      document.execCommand("delete");
      return true;
    }
    if (!text.includes("\n")) {
      if (document.execCommand("insertText", false, text)) return true;
    }
    document.execCommand("delete");
    requestAnimationFrame(() => setTimeout(() => insertText(text, editor), 30));
    return true;
  }
  function onSubmit(scope, fn2) {
    scope.listen(
      document,
      "keydown",
      (event) => {
        if (event.key !== "Enter" || event.shiftKey || event.isComposing || event.keyCode === 229) return;
        const target2 = event.target;
        if (!target2?.closest?.(SEL.editor)) return;
        const editor = target2.closest(SEL.editor);
        const text = getText(editor);
        if (text) fn2(text, editor);
      },
      { capture: true }
    );
    scope.listen(
      document,
      "click",
      (event) => {
        const button = event.target?.closest?.(SEL.sendButton);
        if (!button || button.disabled) return;
        let near = button;
        while (near && !near.querySelector(SEL.editor)) near = near.parentElement;
        const editor = near?.querySelector(SEL.editor) ?? getEditor();
        const text = getText(editor);
        if (text) fn2(text, editor);
      },
      { capture: true }
    );
  }
  var composer_default = definePlugin({
    name: "ComposerApi",
    title: { zh: "输入框", en: "Composer API" },
    description: { zh: "读写 claude.ai 输入框内容、感知发送动作。", en: "Read and write the chat input and know when a prompt is sent." },
    category: "api",
    icon: "keyboard",
    hidden: true,
    start() {
    }
  });

  // src/plugins/_api/notices/index.ts
  var CSS3 = `
.stack { position: fixed; top: 64px; right: 16px; display: flex; flex-direction: column; gap: 8px; width: min(340px, calc(100vw - 32px)); pointer-events: none; }
.toast { pointer-events: auto; display: flex; gap: 10px; align-items: flex-start; padding: 10px 10px 10px 12px; border-radius: 12px; background: var(--bg); border: 1px solid var(--line); box-shadow: var(--shadow); animation: in .18s ease-out; }
.toast.click { cursor: pointer; }
.toast .dot { width: 8px; height: 8px; border-radius: 50%; margin-top: 6px; flex: none; background: var(--accent); }
.toast.ok .dot { background: var(--ok); } .toast.warn .dot { background: var(--warn); } .toast.error .dot { background: var(--bad); }
.toast .body { flex: 1; min-width: 0; } .toast .title { font-weight: 600; } .toast .text { color: var(--fg2); word-break: break-word; white-space: pre-line; }
@keyframes in { from { opacity: 0; transform: translateY(-6px); } }
`;
  var host2 = null;
  var stack2 = null;
  var byKey = /* @__PURE__ */ new Map();
  function toast(text, options = {}) {
    if (!stack2) return () => {
    };
    if (options.key) byKey.get(options.key)?.remove();
    const close = () => {
      el.remove();
      if (options.key && byKey.get(options.key) === el) byKey.delete(options.key);
    };
    const el = h4(
      "div",
      { class: `toast ${options.kind ?? "info"}${options.onClick ? " click" : ""}`, role: "status" },
      h4("span", { class: "dot" }),
      h4("div", { class: "body" }, options.title ? h4("div", { class: "title", text: options.title }) : null, h4("div", { class: "text", text })),
      h4("button", { class: "icon-btn", "aria-label": "Close", onclick: (e3) => (e3.stopPropagation(), close()) }, icon("x", 14))
    );
    if (options.onClick) el.addEventListener("click", () => (options.onClick(), close()));
    if (options.key) byKey.set(options.key, el);
    stack2.style.top = `${Math.max(64, topBarBottom(window.innerWidth - 40, 0) + 8)}px`;
    stack2.appendChild(el);
    const timeout = options.timeoutMs ?? 5e3;
    if (timeout > 0) setTimeout(close, timeout);
    return close;
  }
  var notices_default = definePlugin({
    name: "NoticesApi",
    title: { zh: "提示条", en: "Notices API" },
    description: { zh: "右上角的 CC++ 提示条，供其它插件显示消息。", en: "CC++ toasts at the top right for other plugins." },
    category: "api",
    icon: "bell",
    hidden: true,
    start(scope) {
      host2 = createHost(scope, "notices", CSS3);
      stack2 = h4("div", { class: "stack" });
      host2.box.appendChild(stack2);
      scope.defer(() => {
        host2 = null;
        stack2 = null;
        byKey.clear();
      });
    }
  });

  // src/plugins/autoRetry/index.ts
  var settings2 = definePluginSettings({
    maxRetries: { type: "number", label: { zh: "最多连续重试几次", en: "Maximum retries in a row" }, default: 3, min: 1, max: 10 },
    delay: { type: "number", label: { zh: "重试前等待", en: "Wait before retrying" }, default: 2, min: 0, max: 60, unit: "s" },
    chats: {
      type: "boolean",
      label: { zh: "普通对话发送失败也重试", en: "Also retry in chats" },
      description: {
        zh: "claude.ai 自己重试约 70 秒仍发不出去、消息下出现「Failed to send · Retry」时，自动点 Retry。",
        en: "When claude.ai has given up after about 70s of its own retries and shows “Failed to send · Retry”, clicks Retry."
      },
      default: true
    }
  });
  var CHAT_MIN_DELAY_MS = 3e3;
  var L9 = {
    retrying: { zh: "发送失败，正在重试（{n}/{max}）", en: "Couldn't send, retrying ({n}/{max})" },
    gaveUp: { zh: "已重试 {max} 次仍未发出，请稍后手动发送。", en: "Still not sent after {max} retries. Send it again later." },
    changed: { zh: "输入框内容已改动，没有自动重试。", en: "The message box changed, so it wasn't retried." }
  };
  var norm = (text) => text.replace(/\s+/g, " ").trim();
  var fill3 = (text, n2, max) => text.replace("{n}", String(n2)).replace(/\{max\}/g, String(max));
  function sendButtonFor(editor) {
    let near = editor;
    while (near && !near.querySelector(SEL.sendButton)) near = near.parentElement;
    return near?.querySelector(SEL.sendButton) ?? null;
  }
  function resend(editor) {
    const button = sendButtonFor(editor);
    if (button && !button.disabled) return button.click();
    editor.focus();
    editor.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", code: "Enter", keyCode: 13, bubbles: true, cancelable: true }));
  }
  var autoRetry_default = definePlugin({
    name: "AutoRetry",
    title: { zh: "发送失败自动重试", en: "Auto retry" },
    description: {
      zh: "消息发不出去时自动重发：Claude Code 项目页弹出「Couldn't send the message」时重发放回输入框的消息；普通对话出现「Failed to send」时点 Retry。可设次数和间隔。",
      en: `Resends messages that couldn't be sent: on Claude Code project pages ("Couldn't send the message") the text claude.ai put back in the box, in chats ("Failed to send") by clicking Retry. Retries and delay are adjustable.`
    },
    category: "chats",
    icon: "refresh",
    enabledByDefault: true,
    updatedAt: "2026-10-30",
    dependencies: ["ChatStateApi", "ComposerApi", "DomApi", "NoticesApi"],
    settings: settings2,
    start(scope) {
      let last2 = null;
      const counts = /* @__PURE__ */ new Map();
      let timer2;
      scope.defer(() => clearTimeout(timer2));
      onSubmit(scope, (text, editor) => {
        last2 = { text: norm(text), editor };
      });
      scope.on("send:ok", ({ channelId }) => {
        counts.delete(channelId);
      });
      scope.on("send:failed", ({ channelId }) => {
        const sent = last2;
        if (!sent?.editor) return;
        const max = settings2.store.maxRetries;
        const count2 = (counts.get(channelId) ?? 0) + 1;
        if (count2 > max) {
          counts.delete(channelId);
          toast(fill3(t3(L9.gaveUp), count2, max), { kind: "error", key: "auto-retry", timeoutMs: 8e3 });
          return;
        }
        counts.set(channelId, count2);
        toast(fill3(t3(L9.retrying), count2, max), { kind: "warn", key: "auto-retry" });
        clearTimeout(timer2);
        timer2 = setTimeout(() => {
          const editor = sent.editor;
          if (!editor.isConnected || norm(getText(editor)) !== sent.text) {
            counts.delete(channelId);
            toast(t3(L9.changed), { kind: "info", key: "auto-retry" });
            return;
          }
          resend(editor);
        }, settings2.store.delay * 1e3);
      });
      if (!settings2.store.chats) return;
      const turns = /* @__PURE__ */ new Map();
      watch(scope, SEL.failedSend, (message) => {
        const turn = message.getAttribute("data-turn-key") ?? "";
        const max = settings2.store.maxRetries;
        const count2 = (turns.get(turn) ?? 0) + 1;
        if (count2 > max) {
          turns.delete(turn);
          toast(fill3(t3(L9.gaveUp), count2, max), { kind: "error", key: "auto-retry", timeoutMs: 8e3 });
          return;
        }
        turns.set(turn, count2);
        toast(fill3(t3(L9.retrying), count2, max), { kind: "warn", key: "auto-retry" });
        const timer3 = setTimeout(() => {
          if (!message.isConnected || !message.matches(SEL.failedSend)) return;
          message.querySelector(SEL.failedSendRetry)?.click();
        }, Math.max(CHAT_MIN_DELAY_MS, settings2.store.delay * 1e3));
        return () => clearTimeout(timer3);
      });
      scope.on("route", () => turns.clear());
    }
  });

  // sites/claude/plugins/AutoRetry/index.ts
  var AutoRetry_default = toFramework(autoRetry_default);

  // src/plugins/_core/backup/index.ts
  var L10 = {
    title: { zh: "备份", en: "Backup" },
    backupHint: { zh: "导出全部 CC++ 数据（插件开关、选项、收藏的消息、输入历史、自定义 CSS），可在另一台电脑导入。", en: "Export all CC++ data (switches, options, starred messages, prompt history, Quick CSS) to restore elsewhere." },
    export: { zh: "导出 JSON", en: "Export JSON" },
    import: { zh: "导入 JSON", en: "Import JSON" },
    reset: { zh: "清空全部数据", en: "Erase all data" },
    resetConfirm: { zh: "清空 CC++ 的全部设置与数据？此操作不可撤销。", en: "Erase every CC++ setting and data? This cannot be undone." },
    imported: { zh: "已导入，部分插件可能需要刷新页面。", en: "Imported. Some plugins may need a reload." },
    bad: { zh: "文件不是 CC++ 备份。", en: "That file is not a CC++ backup." }
  };
  var FORMAT = "ccpp-backup";
  function buildBackup() {
    return { format: FORMAT, version, exportedAt: (/* @__PURE__ */ new Date()).toISOString(), data: { ...dumpAll(), [SETTINGS_KEY]: JSON.stringify(snapshot()) } };
  }
  function restoreBackup(raw2) {
    if (!raw2 || typeof raw2 !== "object" || raw2.format !== FORMAT) return false;
    const data = raw2.data;
    if (!data || typeof data !== "object") return false;
    for (const [key, value] of Object.entries(data)) {
      if (typeof value !== "string" || key === SETTINGS_KEY) continue;
      try {
        localStorage.setItem(PREFIX + key, value);
      } catch {
      }
    }
    const settingsRaw = data[SETTINGS_KEY];
    try {
      replaceBag(typeof settingsRaw === "string" ? JSON.parse(settingsRaw) : {});
    } catch {
      replaceBag({});
    }
    return true;
  }
  function importBackup() {
    const file = h4("input", { type: "file", accept: "application/json,.json", style: { display: "none" } });
    file.addEventListener("change", async () => {
      const chosen = file.files?.[0];
      file.remove();
      if (!chosen) return;
      try {
        if (!restoreBackup(JSON.parse(await chosen.text()))) throw new Error("format");
        toast(t3(L10.imported), { kind: "ok" });
      } catch {
        toast(t3(L10.bad), { kind: "error" });
      }
    });
    document.body.appendChild(file);
    file.click();
  }
  var settings3 = definePluginSettings({
    frameworkPanel: {
      type: "action",
      label: { zh: "Userscript++ 面板", en: "Userscript++ panel" },
      description: {
        zh: "CC++ 基于 Userscript++ 框架。框架自己的面板里有检查更新、更新日志、快捷键、通知记录、诊断信息与安全模式。",
        en: "CC++ runs on the Userscript++ framework. Its own panel has update checks, the changelog, keybinds, notification history, diagnostics and safe mode."
      },
      button: { zh: "打开", en: "Open" },
      run: () => host()?.openSettingsPanel()
    },
    exportData: {
      type: "action",
      label: { zh: "导出备份", en: "Export backup" },
      description: L10.backupHint,
      button: L10.export,
      run: () => download(`ccpp-backup-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.json`, JSON.stringify(buildBackup(), null, 2), "application/json")
    },
    importData: { type: "action", label: { zh: "导入备份", en: "Import backup" }, description: { zh: "从导出的 JSON 恢复。", en: "Restore from an exported JSON file." }, button: L10.import, run: importBackup },
    eraseData: {
      type: "action",
      label: L10.reset,
      description: { zh: "清空后页面会刷新。", en: "The page reloads afterwards." },
      button: { zh: "清空", en: "Erase" },
      confirm: L10.resetConfirm,
      run: () => {
        for (const key of Object.keys(dumpAll())) removeKey(key);
        clearAll();
        setTimeout(() => location.reload(), 400);
      }
    }
  });
  var backup_default = definePlugin({
    name: "Backup",
    title: L10.title,
    description: {
      zh: "导出 / 导入 / 清空 CC++ 的全部设置与数据。CC++ 只调用 claude.ai 同源接口，不读取或外传 Cookie / token；只有在线主题会去下载你填写的 CSS 地址。",
      en: "Export, import or erase all CC++ settings and data. CC++ only calls claude.ai's own API and never reads or sends cookies or tokens; only online themes download the CSS URLs you add."
    },
    category: "core",
    icon: "download",
    enabledByDefault: true,
    dependencies: ["NoticesApi"],
    settings: settings3,
    start() {
    }
  });

  // sites/claude/plugins/Backup/index.ts
  var Backup_default = toFramework(backup_default);

  // src/plugins/betterLinks/index.ts
  var settings4 = definePluginSettings({
    bare: { type: "boolean", label: { zh: "裸域名变成链接", en: "Turn bare domains into links" }, default: true },
    colors: { type: "boolean", label: { zh: "给回复里的链接上色", en: "Color links in replies" }, default: false },
    linkColor: { type: "color", label: { zh: "链接颜色", en: "Link color" }, default: "#4a9eff", visible: (v3) => v3.colors === true },
    visited: { type: "boolean", label: { zh: "访问过的链接用另一种颜色", en: "Another color for visited links" }, default: true, visible: (v3) => v3.colors === true },
    visitedColor: { type: "color", label: { zh: "已访问链接颜色", en: "Visited link color" }, default: "#9b59b6", visible: (v3) => v3.colors === true && v3.visited === true }
  });
  function linkCss(o3) {
    if (!o3.colors) return "";
    const links = `:is(${SEL.assistantMessage}, ${SEL.userMessage}) a[href]`;
    const visited = o3.visited ? `
${links}:visited { color: ${o3.visitedColor} !important; text-decoration-color: ${o3.visitedColor} !important; }` : "";
    return `${links} { color: ${o3.linkColor} !important; text-decoration-color: ${o3.linkColor} !important; }${visited}`;
  }
  var DOMAIN_RE = /(?<![@\w./-])((?:https?:\/\/)?(?:[a-z0-9-]+\.)+(?:com|org|net|io|dev|ai|app|edu|gov|co|cn|me|info|xyz|so|sh|gg|tv|uk|de|jp)(?:\/[^\s<>()"'，。、）]*)?)(?![\w@-])/gi;
  function splitLinks(text) {
    const out = [];
    let last2 = 0;
    DOMAIN_RE.lastIndex = 0;
    for (let m3 = DOMAIN_RE.exec(text); m3; m3 = DOMAIN_RE.exec(text)) {
      let value = m3[1];
      const trail = /[.,;:!?]+$/.exec(value)?.[0] ?? "";
      value = value.slice(0, value.length - trail.length);
      if (m3.index > last2) out.push(text.slice(last2, m3.index));
      out.push({ href: /^https?:\/\//i.test(value) ? value : `https://${value}`, text: value });
      last2 = m3.index + value.length;
    }
    if (last2 < text.length) out.push(text.slice(last2));
    return out;
  }
  var HAS_DOMAIN = new RegExp(DOMAIN_RE.source, "i");
  var SKIP2 = "a, code, pre, button, [contenteditable], .katex";
  var betterLinks_default = definePlugin({
    name: "BetterLinks",
    title: { zh: "更好的链接", en: "Better links" },
    description: {
      zh: "把回复里没有加链接的域名（如 example.com/docs）变成可点击的链接（只处理已完成的回复），可给链接和访问过的链接分别上色。",
      en: "Turns bare domains in finished replies (like example.com/docs) into links, and can color links and visited links."
    },
    category: "messages",
    icon: "link",
    updatedAt: "2026-10-30",
    enabledByDefault: false,
    dependencies: ["DomApi", "StylesApi"],
    settings: settings4,
    start(scope) {
      addStyle(scope, linkCss(settings4.store), "better-links");
      if (!settings4.store.bare) return;
      watch(scope, `${SEL.assistantMessage}[data-is-streaming="false"] ${SEL.prose}`, (prose) => {
        const added = [];
        const walker = document.createTreeWalker(prose, NodeFilter.SHOW_TEXT, {
          acceptNode: (node) => node.parentElement?.closest(SKIP2) || !HAS_DOMAIN.test(node.nodeValue ?? "") ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT
        });
        const nodes = [];
        for (let n2 = walker.nextNode(); n2; n2 = walker.nextNode()) nodes.push(n2);
        for (const node of nodes) {
          const parts = splitLinks(node.nodeValue ?? "");
          if (parts.length < 2) continue;
          const frag = document.createDocumentFragment();
          for (const part of parts) {
            if (typeof part === "string") frag.append(part);
            else {
              const a3 = h4("a", { href: part.href, target: "_blank", rel: "noopener noreferrer", text: part.text, "data-ccpp-link": "" });
              added.push(a3);
              frag.append(a3);
            }
          }
          node.replaceWith(frag);
        }
        return () => {
          for (const a3 of added) if (a3.isConnected) a3.replaceWith(a3.textContent ?? "");
        };
      });
    }
  });

  // sites/claude/plugins/BetterLinks/index.ts
  var BetterLinks_default = toFramework(betterLinks_default);

  // src/plugins/betterSidebar/index.ts
  var settings5 = definePluginSettings({
    clickToggle: {
      type: "boolean",
      label: { zh: "点侧栏空白处收起 / 展开侧栏", en: "Click empty sidebar space to hide or show it" },
      default: true
    },
    startHidden: {
      type: "boolean",
      label: { zh: "打开页面时侧栏收起", en: "Start with the sidebar hidden" },
      default: false
    },
    collapsePinned: {
      type: "boolean",
      label: { zh: "打开页面时折叠「置顶」分组", en: "Start with the Pinned group collapsed" },
      default: false
    },
    collapseRecents: {
      type: "boolean",
      label: { zh: "打开页面时折叠最近对话的分组", en: "Start with the recents groups collapsed" },
      description: { zh: "最近对话按状态等分出的各组。", en: "The groups recents are sorted into, by state and so on." },
      default: false
    }
  });
  var STORE_KEY = "dframe-store";
  function hideOnLoad(storage) {
    try {
      const raw2 = storage.getItem(STORE_KEY);
      if (!raw2) return false;
      const store2 = JSON.parse(raw2);
      if (!store2?.state || typeof store2.state !== "object" || store2.state.collapsed === true) return false;
      store2.state.collapsed = true;
      storage.setItem(STORE_KEY, JSON.stringify(store2));
      return true;
    } catch {
      return false;
    }
  }
  var TOGGLE = 'button[aria-keyshortcuts$="+b" i], [data-testid="sidebar-compact-trigger"]';
  var BLANK = `${SEL.sidebar}, ${SEL.sidebarRecents}, [data-tab-section], [aria-label="Sidebar"], nav`;
  var ACTIVE = 'a, button, input, textarea, select, label, [role="button"], [role="menuitem"], [role="link"], [data-row], [contenteditable="true"]';
  function isBlankClick(target2) {
    if (!target2?.closest(`${SEL.sidebar}, [aria-label="Sidebar"]`)) return false;
    return target2.matches(BLANK) && !target2.closest(ACTIVE);
  }
  var GROUPS_GIVE_UP_MS = 15e3;
  var groupsDone = false;
  var betterSidebar_default = definePlugin({
    name: "BetterSidebar",
    title: { zh: "侧栏增强", en: "Better sidebar" },
    description: {
      zh: "点侧栏空白处收起 / 展开侧栏；可设打开页面时侧栏收起，或折叠「置顶」、最近对话的分组。",
      en: "Click empty sidebar space to hide or show the sidebar; optionally start with it hidden, or with the Pinned and recents groups collapsed."
    },
    category: "navigation",
    icon: "collapse",
    enabledByDefault: true,
    updatedAt: "2026-10-30",
    startAt: "document-start",
    dependencies: ["DomApi"],
    settings: settings5,
    start(scope) {
      if (settings5.store.startHidden && document.readyState === "loading") hideOnLoad(localStorage);
      if (settings5.store.clickToggle) {
        scope.listen(document, "click", (event) => {
          if (event.button !== 0 || event.defaultPrevented || !isBlankClick(event.target)) return;
          if (String(getSelection() ?? "").trim()) return;
          document.querySelector(TOGGLE)?.click();
        });
      }
      if (groupsDone || !(settings5.store.collapsePinned || settings5.store.collapseRecents)) return;
      const run = scope.child();
      run.timeout(() => {
        groupsDone = true;
        run.dispose();
      }, GROUPS_GIVE_UP_MS);
      const seen3 = /* @__PURE__ */ new WeakSet();
      watch(run, `${SEL.sidebar} button[data-group-toggle][aria-expanded="true"]`, (toggle) => {
        if (groupsDone || seen3.has(toggle)) return;
        seen3.add(toggle);
        const recents = !!toggle.closest(`${SEL.sidebarRecents}, [data-recents-list], .dframe-recents-by-mode`);
        if (recents ? settings5.store.collapseRecents : settings5.store.collapsePinned) toggle.click();
      });
    }
  });

  // sites/claude/plugins/BetterSidebar/index.ts
  var BetterSidebar_default = toFramework(betterSidebar_default);

  // sites/claude/plugins/CCPPSettings/index.ts
  var CCPPSettings_default = toFramework(settings_default);

  // src/plugins/_api/network/index.ts
  var logger8 = new Logger2("NetworkApi");
  var responseHooks = /* @__PURE__ */ new Set();
  var errorHooks = /* @__PURE__ */ new Set();
  var blockers = /* @__PURE__ */ new Set();
  function describe(input, init) {
    try {
      const raw2 = input instanceof Request ? input.url : String(input);
      const method = (init?.method ?? (input instanceof Request ? input.method : "GET")).toUpperCase();
      return { url: new URL(raw2, location.href), method };
    } catch {
      return null;
    }
  }
  function onResponse(scope, match, handle) {
    const hook2 = { match, handle };
    responseHooks.add(hook2);
    scope.defer(() => responseHooks.delete(hook2));
  }
  function onRequestError(scope, match, handle) {
    const hook2 = { match, handle };
    errorHooks.add(hook2);
    scope.defer(() => errorHooks.delete(hook2));
  }
  var matching = (hooks2, req) => [...hooks2].filter((hook2) => {
    try {
      return hook2.match(req);
    } catch {
      return false;
    }
  });
  function block(scope, match) {
    blockers.add(match);
    scope.defer(() => blockers.delete(match));
  }
  var isBlocked = (req) => [...blockers].some((match) => {
    try {
      return match(req);
    } catch {
      return false;
    }
  });
  var sameOrigin = (req) => req.url.origin === location.origin;
  var network_default = definePlugin({
    name: "NetworkApi",
    title: { zh: "网络观察", en: "Network API" },
    description: {
      zh: "包装 fetch / sendBeacon：插件可以旁路读取响应副本，或拦截指定请求。不修改 claude.ai 拿到的原响应。",
      en: "Wraps fetch / sendBeacon so plugins can read response copies or block requests. claude.ai's own responses are never altered."
    },
    category: "api",
    icon: "link",
    hidden: true,
    startAt: "document-start",
    start(scope) {
      const original = pageWindow.fetch;
      const wrapped2 = function fetch2(input, init) {
        const req = describe(input, init);
        if (req && blockers.size && isBlocked(req)) return Promise.resolve(new Response(null, { status: 204 }));
        const promise = original.call(this ?? pageWindow, input, init);
        if (req && (responseHooks.size || errorHooks.size)) {
          const hooks2 = matching(responseHooks, req);
          const failed2 = matching(errorHooks, req);
          if (hooks2.length || failed2.length) {
            promise.then(
              (response) => {
                for (const hook2 of hooks2) {
                  try {
                    hook2.handle(response.clone(), req);
                  } catch (error2) {
                    logger8.error("Response hook failed:", error2);
                  }
                }
              },
              (reason2) => {
                for (const hook2 of failed2) {
                  try {
                    hook2.handle(reason2, req);
                  } catch (error2) {
                    logger8.error("Request error hook failed:", error2);
                  }
                }
              }
            );
          }
        }
        return promise;
      };
      pageWindow.fetch = wrapped2;
      scope.defer(() => {
        if (pageWindow.fetch === wrapped2) pageWindow.fetch = original;
      });
      const beacon = pageWindow.navigator.sendBeacon?.bind(pageWindow.navigator);
      if (beacon) {
        const wrappedBeacon = (url, data) => {
          const req = describe(url, { method: "POST" });
          if (req && isBlocked(req)) return true;
          return beacon(url, data);
        };
        pageWindow.navigator.sendBeacon = wrappedBeacon;
        scope.defer(() => {
          if (pageWindow.navigator.sendBeacon === wrappedBeacon) pageWindow.navigator.sendBeacon = beacon;
        });
      }
    }
  });

  // src/plugins/_api/router/index.ts
  var UUID = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";
  var CHAT_RE = new RegExp(`^/chat/(${UUID})`, "i");
  var PROJECT_RE = new RegExp(`^/project/(${UUID})`, "i");
  function parseRoute(path) {
    const chat = CHAT_RE.exec(path);
    const project = PROJECT_RE.exec(path);
    const kind = chat ? "chat" : project ? "project" : path === "/new" || path === "/" ? "new" : path.startsWith("/settings") ? "settings" : "other";
    return { path, kind, chatId: chat?.[1].toLowerCase() ?? null, projectId: project?.[1].toLowerCase() ?? null };
  }
  var current4 = parseRoute(location.pathname);
  var currentRoute = () => current4;
  var search = location.search;
  function check() {
    const path = location.pathname;
    if (location.search !== search) {
      const previous3 = search;
      search = location.search;
      if (path === current4.path) emit("route:search", { search, previous: previous3 });
    }
    if (path === current4.path) return;
    const previous2 = current4;
    current4 = parseRoute(path);
    emit("route", { route: current4, previous: previous2 });
  }
  function onRoute(scope, fn2, immediate = true) {
    scope.on("route", ({ route, previous: previous2 }) => fn2(route, previous2));
    if (immediate) fn2(current4, null);
  }
  var router_default = definePlugin({
    name: "RouterApi",
    title: { zh: "路由", en: "Router API" },
    description: { zh: "感知 claude.ai 单页应用里的页面切换（新对话、对话、项目……）。", en: "Tells plugins when claude.ai navigates between pages (new chat, chat, project…)." },
    category: "api",
    icon: "link",
    hidden: true,
    startAt: "document-start",
    start(scope) {
      const history4 = pageWindow.history;
      const originals = { pushState: history4.pushState, replaceState: history4.replaceState };
      for (const key of ["pushState", "replaceState"]) {
        const original = originals[key];
        const patched = function(...args) {
          const result = original.apply(this, args);
          queueMicrotask(check);
          return result;
        };
        history4[key] = patched;
        scope.defer(() => {
          if (history4[key] === patched) history4[key] = original;
        });
      }
      scope.listen(pageWindow, "popstate", check);
      scope.interval(check, 700);
      current4 = parseRoute(location.pathname);
    }
  });

  // src/plugins/_api/chatState/index.ts
  function channelSendOf(path) {
    return /^\/v1\/code\/channels\/(chan_[A-Za-z0-9]+)\/messages$/.exec(path)?.[1] ?? null;
  }
  var SEND_RETRY_GRACE_MS = 6e3;
  var phase2 = "idle";
  var startedAt = 0;
  var quietTicks = 0;
  var chatPhase = () => phase2;
  var STATUS_PREFIX = /^(?:[\p{Extended_Pictographic}\p{So}\uFE0F\u200D]+\s+)+/u;
  var PLACEHOLDER = /^(?:claude|new chat|untitled)$/i;
  function titleFrom(raw2) {
    const title = raw2.replace(STATUS_PREFIX, "").replace(/\s*[-–|]\s*Claude(?:\s+Code)?\s*$/i, "").trim();
    return PLACEHOLDER.test(title) ? "" : title;
  }
  var chatTitle = () => titleFrom(document.title);
  var QUIET_TICKS = 2;
  var CHECK_MS = 400;
  function tick(streamingNow, now2 = Date.now()) {
    const base = { chatId: currentRoute().chatId, title: chatTitle(), at: now2 };
    if (streamingNow) {
      quietTicks = 0;
      if (phase2 === "idle") {
        phase2 = "streaming";
        startedAt = now2;
        emit("reply:start", base);
      }
      return;
    }
    if (phase2 !== "streaming") return;
    quietTicks++;
    if (quietTicks < QUIET_TICKS) return;
    phase2 = "idle";
    quietTicks = 0;
    emit("reply:end", { ...base, durationMs: now2 - startedAt });
  }
  var chatState_default = definePlugin({
    name: "ChatStateApi",
    title: { zh: "回复状态", en: "Reply state API" },
    description: { zh: "判断 Claude 是否正在回复，并在开始 / 结束、项目页消息发送失败时通知其它插件（后台标签页也有效）。", en: "Knows when Claude starts and finishes replying, and when a project message couldn't be sent, also in background tabs." },
    category: "api",
    icon: "sparkles",
    hidden: true,
    dependencies: ["NetworkApi", "RouterApi"],
    start(scope) {
      phase2 = "idle";
      quietTicks = 0;
      scope.interval(() => tick(!!document.querySelector(SEL.streaming)), CHECK_MS);
      let attempt = 0;
      let timer2;
      const isSend = (req) => sameOrigin(req) && req.method === "POST" && !!channelSendOf(req.url.pathname);
      const failed2 = (req) => {
        const mine = attempt;
        clearTimeout(timer2);
        timer2 = setTimeout(() => {
          if (scope.alive && mine === attempt) emit("send:failed", { channelId: channelSendOf(req.url.pathname), at: Date.now() });
        }, SEND_RETRY_GRACE_MS);
      };
      const counted = (req) => {
        if (!isSend(req)) return false;
        attempt++;
        clearTimeout(timer2);
        return true;
      };
      onResponse(scope, counted, (response, req) => {
        if (!response.ok) return failed2(req);
        clearTimeout(timer2);
        emit("send:ok", { channelId: channelSendOf(req.url.pathname), at: Date.now() });
      });
      onRequestError(scope, isSend, (_3, req) => failed2(req));
      scope.defer(() => clearTimeout(timer2));
      scope.on("route", () => {
        phase2 = "idle";
        quietTicks = 0;
      });
    }
  });

  // src/plugins/_api/claude/index.ts
  var UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  var orgPromise = null;
  var ApiError = class extends Error {
    constructor(status, message) {
      super(message);
      this.status = status;
    }
  };
  async function getJson(path, signal) {
    const response = await pageWindow.fetch(path, { credentials: "include", cache: "no-store", signal, headers: { accept: "application/json" } });
    if (!response.ok) throw new ApiError(response.status, `${response.status} ${path.replace(/[0-9a-f-]{36}/gi, ":id")}`);
    return await response.json();
  }
  function orgFromCookie(cookie = document.cookie) {
    const match = /(?:^|;\s*)lastActiveOrg=([^;]+)/.exec(cookie);
    const value = match ? decodeURIComponent(match[1]) : "";
    return UUID_RE.test(value) ? value.toLowerCase() : null;
  }
  function getOrgId() {
    const fromCookie = orgFromCookie();
    if (fromCookie) return Promise.resolve(fromCookie);
    orgPromise ??= getJson("/api/organizations").then((orgs) => {
      const chat = orgs.find((o3) => o3.capabilities?.includes("chat")) ?? orgs[0];
      if (!chat || !UUID_RE.test(chat.uuid)) throw new Error("No organization");
      return chat.uuid;
    });
    orgPromise.catch(() => orgPromise = null);
    return orgPromise;
  }
  function parseWindow(raw2) {
    if (!raw2 || typeof raw2 !== "object") return null;
    const { utilization, resets_at } = raw2;
    const value = typeof utilization === "string" ? Number(utilization) : utilization;
    if (typeof value !== "number" || !Number.isFinite(value)) return null;
    const reset = typeof resets_at === "string" ? Date.parse(resets_at) : NaN;
    return { utilization: Math.min(100, Math.max(0, value)), resetsAt: Number.isFinite(reset) ? reset : null };
  }
  var EXTRA_KEYS = { seven_day_opus: "Opus", seven_day_sonnet: "Sonnet" };
  function parseUsage(raw2, now2 = Date.now()) {
    const data = raw2 && typeof raw2 === "object" ? raw2 : {};
    const extra = [];
    for (const [key, label] of Object.entries(EXTRA_KEYS)) {
      const window2 = parseWindow(data[key]);
      if (window2) extra.push({ key: label, window: window2 });
    }
    return { fiveHour: parseWindow(data.five_hour), sevenDay: parseWindow(data.seven_day), extra, fetchedAt: now2 };
  }
  async function getUsage(signal) {
    const org2 = await getOrgId();
    return parseUsage(await getJson(`/api/organizations/${org2}/usage`, signal));
  }
  function messageText(raw2) {
    if (Array.isArray(raw2.content)) {
      const parts = raw2.content.filter((part) => part && part.type === "text" && typeof part.text === "string").map((part) => part.text);
      if (parts.length) return parts.join("\n\n");
    }
    return typeof raw2.text === "string" ? raw2.text : "";
  }
  function parseConversation(raw2) {
    const data = raw2 && typeof raw2 === "object" ? raw2 : {};
    const list2 = (Array.isArray(data.chat_messages) ? data.chat_messages : []).map((m3) => ({
      uuid: String(m3.uuid ?? ""),
      parent: typeof m3.parent_message_uuid === "string" ? m3.parent_message_uuid : null,
      role: m3.sender === "human" ? "user" : "assistant",
      text: messageText(m3),
      createdAt: typeof m3.created_at === "string" ? Date.parse(m3.created_at) || null : null
    }));
    const byId = new Map(list2.map((m3) => [m3.uuid, m3]));
    let messages = list2;
    const leaf = typeof data.current_leaf_message_uuid === "string" ? byId.get(data.current_leaf_message_uuid) : void 0;
    if (leaf) {
      const branch = [];
      const seen3 = /* @__PURE__ */ new Set();
      for (let m3 = leaf; m3 && !seen3.has(m3.uuid); m3 = m3.parent ? byId.get(m3.parent) : void 0) {
        seen3.add(m3.uuid);
        branch.push(m3);
      }
      messages = branch.reverse();
    }
    const date = (value) => typeof value === "string" ? Date.parse(value) || null : null;
    return {
      uuid: String(data.uuid ?? ""),
      name: typeof data.name === "string" ? data.name : "",
      model: typeof data.model === "string" ? data.model : null,
      createdAt: date(data.created_at),
      updatedAt: date(data.updated_at),
      messages
    };
  }
  async function getConversation(chatId, signal) {
    if (!UUID_RE.test(chatId)) throw new Error("Bad chat id");
    const org2 = await getOrgId();
    return parseConversation(await getJson(`/api/organizations/${org2}/chat_conversations/${chatId}?tree=True&rendering_mode=messages&render_all_tools=true`, signal));
  }
  var CODE_HEADERS = { accept: "application/json", "anthropic-version": "2023-06-01" };
  async function getCodeJson(path, signal) {
    const response = await pageWindow.fetch(path, { credentials: "include", cache: "no-store", signal, headers: CODE_HEADERS });
    if (!response.ok) throw new ApiError(response.status, `${response.status} ${path.replace(/(chan|cse|cmsg)_[A-Za-z0-9]+/g, "$1_…")}`);
    return await response.json();
  }
  function parseChannelMessages(raw2) {
    const list2 = raw2?.data;
    if (!Array.isArray(list2)) return [];
    const out = [];
    for (const m3 of list2) {
      if (!m3 || typeof m3 !== "object" || typeof m3.body !== "string") continue;
      const body = m3.body.trim();
      if (!body) continue;
      const base = { id: String(m3.id ?? ""), role: m3.author_account_id ? "user" : "assistant", at: Date.parse(m3.created_at) || 0 };
      if (body.startsWith("{")) {
        let card2 = null;
        try {
          card2 = JSON.parse(body);
        } catch {
        }
        if (card2 && typeof card2 === "object") {
          if ((card2.kind ?? card2.type) !== "message_routed") out.push({ ...base, role: "assistant", text: "", notice: true });
          continue;
        }
      }
      out.push({ ...base, text: body });
    }
    return out.sort((a3, b3) => a3.at - b3.at);
  }
  var channelCache = /* @__PURE__ */ new Map();
  function getChannelMessages(channelId, threadId, force = false) {
    if (!/^chan_[A-Za-z0-9]+$/.test(channelId) || threadId && !/^cmsg_[A-Za-z0-9]+$/.test(threadId)) return Promise.reject(new Error("Bad id"));
    const key = `${channelId}|${threadId ?? ""}`;
    const cached2 = channelCache.get(key);
    if (!force && cached2 && Date.now() - cached2.at < 15e3) return cached2.value;
    const path = threadId ? `/v1/code/channels/${channelId}/threads/${threadId}?limit=200&include_draft=true` : `/v1/code/channels/${channelId}/timeline?limit=200&include_draft=true`;
    const value = getCodeJson(path).then(parseChannelMessages);
    value.catch(() => channelCache.delete(key));
    channelCache.set(key, { at: Date.now(), value });
    return value;
  }
  var CHANNEL_RE = /^chan_[A-Za-z0-9]+$/;
  var SESSION_RE = /^cse_[A-Za-z0-9]+$/;
  function normalizeBucket(value) {
    if (typeof value !== "string") return "";
    return value.replace(/^SESSION_STATUS_BUCKET_/, "").toLowerCase();
  }
  function parseActivity(channelId, raw2) {
    const activity = { channelId, working: 0, blocked: 0 };
    const data = raw2 && typeof raw2 === "object" && Array.isArray(raw2.data) ? raw2.data : [];
    for (const message of data) {
      const status = message?.thread_status;
      if (status === "resolved") continue;
      if (typeof status === "string" && status) {
        if (status === "working") activity.working++;
        else if (status === "needs_input") activity.blocked++;
        continue;
      }
      for (const session of Array.isArray(message?.bound_sessions) ? message.bound_sessions : []) {
        if (session?.status === "archived") continue;
        const bucket = normalizeBucket(session?.status_bucket);
        if (bucket === "working") activity.working++;
        else if (bucket === "blocked") activity.blocked++;
      }
    }
    return activity;
  }
  function parseSessionState(raw2) {
    const root2 = raw2 && typeof raw2 === "object" ? raw2 : {};
    const session = root2.response_shape && typeof root2.response_shape === "object" ? root2.response_shape : root2;
    const status = session.session_status ?? session.status;
    if (status === "archived" || status === "deleted") return null;
    if (status === "requires_action" || session.worker_status === "requires_action") return "blocked";
    if (status === "pending" || status === "running" && session.worker_status !== "idle" || session.worker_status === "running") return "working";
    const bucket = normalizeBucket(session.status_bucket);
    if (bucket === "working") return "working";
    if (bucket === "blocked" || bucket === "failed") return "blocked";
    return null;
  }
  var channelSessions = null;
  var CHANNEL_LIST_TTL = 5 * 6e4;
  var SESSIONS_KEY = "projectSessions";
  var rememberedSessions = () => {
    const value = readJson(SESSIONS_KEY, {});
    return value && typeof value === "object" ? value : {};
  };
  function parseChannelSessions(raw2) {
    const map = /* @__PURE__ */ new Map();
    const data = raw2 && typeof raw2 === "object" && Array.isArray(raw2.data) ? raw2.data : [];
    for (const channel of data) {
      const session = channel?.channel_session_id ?? channel?.overview_session_id;
      if (typeof channel?.id === "string" && typeof session === "string" && SESSION_RE.test(session)) map.set(channel.id, session);
    }
    return map;
  }
  function getChannelSessions(signal) {
    if (channelSessions && Date.now() - channelSessions.at < CHANNEL_LIST_TTL) return channelSessions.map;
    const map = getCodeJson("/v1/code/channels?scope=joined&include_archived=false&limit=200", signal).then((raw2) => {
      const sessions = parseChannelSessions(raw2);
      writeJson(SESSIONS_KEY, Object.fromEntries(sessions));
      return sessions;
    });
    const entry = { at: Date.now(), map };
    channelSessions = entry;
    map.catch(() => channelSessions === entry && (channelSessions = null));
    return map;
  }
  var NEEDS_INPUT = /* @__PURE__ */ new Set(["blocked", "need_input", "needs_input"]);
  function phaseOf(session) {
    if (!session || session.status === "archived" || session.status === "deleted") return "idle";
    const bucket = normalizeBucket(session.status_bucket);
    const category = session.post_turn_summary?.status_category;
    const dead = session.session_status === "idle" && session.worker_status === "running" && session.connection_status === "disconnected" && !category;
    if (bucket === "failed" || category === "failed" || dead) return "failed";
    if (bucket === "blocked" || NEEDS_INPUT.has(category)) return "blocked";
    if (session.session_status !== void 0 || session.worker_status !== void 0) {
      const state3 = parseSessionState(session);
      if (state3) return state3;
    }
    return bucket === "working" ? "working" : "idle";
  }
  function parseCodePhase(raw2) {
    const root2 = raw2 && typeof raw2 === "object" ? raw2 : {};
    return phaseOf(root2.response_shape && typeof root2.response_shape === "object" ? root2.response_shape : root2);
  }
  function threadPhasesFrom(raw2, readThread = null) {
    const phases = /* @__PURE__ */ new Map();
    const data = raw2 && typeof raw2 === "object" && Array.isArray(raw2.data) ? raw2.data : [];
    for (const message of data) {
      if (message?.thread_status === "resolved") continue;
      for (const session of Array.isArray(message?.bound_sessions) ? message.bound_sessions : []) {
        if (typeof session?.id !== "string" || !SESSION_RE.test(session.id)) continue;
        let phase3 = phaseOf(session);
        const archived = session.status === "archived" || session.status === "deleted";
        if (phase3 === "idle" && !archived) {
          if (NEEDS_INPUT.has(message.thread_status)) phase3 = "blocked";
          else if (message.thread_status === "working") phase3 = "working";
          else if (message.has_unread === true && message.id !== readThread) phase3 = "unread";
        }
        phases.set(session.id, phase3);
      }
    }
    return phases;
  }
  var SNAPSHOT_TTL = 2e3;
  var snapshots = /* @__PURE__ */ new Map();
  function readProject(channelId, signal) {
    if (!CHANNEL_RE.test(channelId)) return Promise.reject(new Error("Bad project id"));
    const cached2 = snapshots.get(channelId);
    let snapshot3 = cached2 && Date.now() - cached2.at < SNAPSHOT_TTL ? cached2.snapshot : null;
    if (!snapshot3) {
      const readOwn = (id) => getCodeJson(`/v1/code/sessions/${id}`).catch(() => null);
      const remembered = rememberedSessions()[channelId];
      const early = remembered && SESSION_RE.test(remembered) ? readOwn(remembered) : null;
      const ownRead = getChannelSessions().catch(() => /* @__PURE__ */ new Map()).then(async (sessions) => {
        const own = sessions.get(channelId) ?? null;
        const ownSession = own ? await (own === remembered && early ? early : readOwn(own)) : null;
        return { own, ownSession };
      });
      snapshot3 = Promise.all([getCodeJson(`/v1/code/channels/${channelId}/timeline?limit=200&bound_only=true`), ownRead]).then(([timeline, own]) => ({ timeline, ...own }));
      const entry = { at: Infinity, snapshot: snapshot3 };
      snapshots.set(channelId, entry);
      snapshot3.then(
        () => entry.at = Date.now(),
        () => snapshots.get(channelId) === entry && snapshots.delete(channelId)
      );
    }
    if (!signal) return snapshot3;
    return new Promise((resolve, reject) => {
      if (signal.aborted) return reject(signal.reason);
      const abort = () => reject(signal.reason);
      signal.addEventListener("abort", abort, { once: true });
      snapshot3.then(resolve, reject).finally(() => signal.removeEventListener("abort", abort));
    });
  }
  async function getProjectPhases(channelId, signal, readThread = null) {
    const { timeline, own, ownSession } = await readProject(channelId, signal);
    const phases = threadPhasesFrom(timeline, readThread);
    if (own && ownSession) {
      const phase3 = parseCodePhase(ownSession);
      phases.set(own, phase3 === "blocked" ? "idle" : phase3);
    }
    return phases;
  }
  async function getProjectActivity(channelId, signal) {
    const { timeline, own, ownSession } = await readProject(channelId, signal);
    const activity = parseActivity(channelId, timeline);
    activity.own = own && ownSession ? parseSessionState(ownSession) : null;
    return activity;
  }
  var claude_default2 = definePlugin({
    name: "ClaudeApi",
    title: { zh: "claude.ai 接口", en: "claude.ai API" },
    description: {
      zh: "只读调用 claude.ai 同源接口（用量、对话内容），沿用浏览器登录态，不读取或保存 Cookie / token。",
      en: "Read-only calls to claude.ai's same-origin API (usage, conversations) with the browser's session. Never reads or stores cookies or tokens."
    },
    category: "api",
    icon: "shield",
    hidden: true,
    startAt: "document-start",
    start() {
    }
  });

  // src/lib/projectDot.ts
  var DOT_COLOR = { clay: "var(--cds-clay, #d97757)", awaiting: "var(--cds-fill-warning, #fbb315)" };
  function cornerKind(activity, _showWaiting) {
    return activity?.own === "working" ? "clay" : null;
  }
  function projectKind(activity, showWaiting, withOwn) {
    if (!activity) return null;
    const own = withOwn ? cornerKind(activity, showWaiting) : null;
    const threads = dotKind(activity, showWaiting);
    if (showWaiting && activity.blocked > 0) return "awaiting";
    return own === "clay" || threads === "clay" ? "clay" : null;
  }
  var SEND_GRACE_MS = 15e3;
  function shownKind(activity, showWaiting, withOwn, sentUntil = 0, now2 = Date.now()) {
    return now2 < sentUntil ? "clay" : projectKind(activity, showWaiting, withOwn);
  }
  function dotKind(activity, showWaiting) {
    if (!activity) return null;
    if (activity.working > 0) return "clay";
    if (showWaiting && activity.blocked > 0) return "awaiting";
    return null;
  }
  function projectDotOptions() {
    const flag = (key) => getRaw("ProjectStatus", key) !== false;
    return { showWaiting: flag("showWaiting"), withOwn: flag("showCode") };
  }

  // src/plugins/chatFavicon/index.ts
  var settings6 = definePluginSettings({
    style: {
      type: "select",
      label: { zh: "图标样式", en: "Icon style" },
      default: "hole",
      options: [
        { value: "emoji", label: { zh: "只用表情", en: "Emoji only" } },
        { value: "badge", label: { zh: "角标 + 符号", en: "Badge + glyph" } },
        { value: "dot", label: { zh: "彩色圆点", en: "Colour dot" } },
        { value: "hole", label: { zh: "图标变色", en: "Mark tint" } },
        { value: "bg", label: { zh: "背景变色", en: "Background tint" } },
        { value: "project", label: { zh: "项目角标（同侧栏）", en: "Project corner dot (as in the sidebar)" } }
      ]
    }
  });
  var THEME = {
    streaming: "var(--cds-fill-accent, #257de0)",
    done: "var(--cds-fill-success, #10a122)",
    ready: DOT_COLOR.awaiting,
    error: "var(--cds-fill-danger, #dc3c3d)",
    clay: DOT_COLOR.clay
  };
  var COLOR = { streaming: "#257de0", done: "#10a122", ready: "#fbb315", error: "#dc3c3d", clay: "#d97757" };
  var BREATH_MS = 3e3;
  var BREATH_STEPS = 12;
  var BREATH_FRAME_MS = 80;
  var EMOJI = { streaming: "🔄", done: "✔️", ready: "👍", error: "🚫" };
  function fallbackMark() {
    const spokes = [];
    for (let i3 = 0; i3 < 12; i3++) {
      const angle = i3 * Math.PI / 6;
      const length = i3 % 2 ? 20 : 26;
      const x4 = (r3) => (32 + Math.cos(angle) * r3).toFixed(1);
      const y3 = (r3) => (32 + Math.sin(angle) * r3).toFixed(1);
      spokes.push(`<line x1="${x4(5)}" y1="${y3(5)}" x2="${x4(length)}" y2="${y3(length)}" stroke="${COLOR.clay}" stroke-width="6.5" stroke-linecap="round"/>`);
    }
    return { viewBox: "0 0 64 64", inner: spokes.join("") };
  }
  function parseMark(svgText) {
    const open = /<svg\b[^>]*>/i.exec(svgText);
    const close = svgText.lastIndexOf("</svg>");
    if (!open || close < 0) return null;
    const viewBox = /viewBox="([^"]+)"/i.exec(open[0])?.[1] ?? (() => {
      const w4 = /width="([\d.]+)"/.exec(open[0])?.[1];
      const hgt = /height="([\d.]+)"/.exec(open[0])?.[1];
      return w4 && hgt ? `0 0 ${w4} ${hgt}` : null;
    })();
    const inner = svgText.slice(open.index + open[0].length, close).replace(/<script[\s\S]*?<\/script>/gi, "");
    return viewBox && inner.trim() ? { viewBox, inner } : null;
  }
  var recolor = (inner, color) => inner.replace(/\b(fill|stroke)="(?!none)[^"]*"/g, `$1="${color}"`).replace(/#[0-9a-f]{3,8}\b|rgba?\([^)]*\)/gi, color);
  var place3 = (mark, inner, x4 = 0, y3 = 0, size = 64) => `<svg x="${x4}" y="${y3}" width="${size}" height="${size}" viewBox="${mark.viewBox}">${inner}</svg>`;
  var svgUrl = (inner) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">${inner}</svg>`)}`;
  function glyph2(state3) {
    const s3 = `fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"`;
    if (state3 === "streaming") return `<path d="M51.5 45.5a6 6 0 1 1-5.2 3" ${s3}/>`;
    if (state3 === "done") return `<path d="M46.8 51.8l3.4 3.4 6.4-7.4" ${s3}/>`;
    if (state3 === "ready") return `<path d="M51.5 56.5v-9.6M46.8 51.2l4.7-4.8 4.7 4.8" ${s3}/>`;
    return `<path d="M47.3 47.3l8.4 8.4M55.7 47.3l-8.4 8.4" ${s3}/>`;
  }
  function breathAt(ms, steps = BREATH_STEPS) {
    const t4 = (1 - Math.cos(ms % BREATH_MS / BREATH_MS * 2 * Math.PI)) / 2;
    return Math.round(t4 * steps) / steps;
  }
  var projectIcons = /* @__PURE__ */ new Map();
  function faviconFor(style, state3, official, mark = null, breath = 1, palette = COLOR) {
    if (state3 === "idle") return official;
    const color = palette[state3];
    if (style === "project") {
      const m4 = mark ?? fallbackMark();
      const t4 = state3 === "streaming" ? breath : 1;
      const fill5 = state3 === "streaming" ? palette.clay : color;
      const key = `${state3}|${t4}|${fill5}|${m4.viewBox}|${m4.inner.length}`;
      let url = projectIcons.get(key);
      if (!url) {
        const r3 = (11 * (0.86 + 0.14 * t4)).toFixed(2);
        const opacity = t4 < 1 ? ` opacity="${(0.75 + 0.25 * t4).toFixed(3)}"` : "";
        url = svgUrl(`${place3(m4, m4.inner, 0, 14, 50)}<circle cx="53" cy="11" r="${r3}" fill="${fill5}"${opacity}/>`);
        if (projectIcons.size > 4 * (BREATH_STEPS + 1)) projectIcons.clear();
        projectIcons.set(key, url);
      }
      return url;
    }
    if (style === "emoji") return svgUrl(`<text x="32" y="54" font-size="54" text-anchor="middle">${EMOJI[state3]}</text>`);
    const m3 = mark ?? fallbackMark();
    if (style === "hole") return svgUrl(place3(m3, recolor(m3.inner, color)));
    if (style === "bg") return svgUrl(`<rect width="64" height="64" rx="14" fill="${color}"/>${place3(m3, recolor(m3.inner, "#fff"), 9, 9, 46)}`);
    const badge = style === "dot" ? `<circle cx="52" cy="52" r="11" fill="#fff"/><circle cx="52" cy="52" r="8" fill="${color}"/>` : `<circle cx="51.5" cy="51.5" r="12.5" fill="#fff"/><circle cx="51.5" cy="51.5" r="10" fill="${color}"/>${glyph2(state3)}`;
    return svgUrl(place3(m3, m3.inner) + badge);
  }
  function computeState(facts) {
    if (facts.errored) return "error";
    if (facts.streaming) return "streaming";
    if (facts.draft) return "ready";
    if (facts.finished) return "done";
    return "idle";
  }
  function projectFacts(phases) {
    const all = new Set(phases);
    return { waiting: all.has("blocked"), failed: all.has("failed"), unread: all.has("unread"), working: all.has("working") };
  }
  function computeProjectState(facts, project) {
    if (project.waiting || facts.draft) return "ready";
    if (project.failed || facts.errored) return "error";
    if (project.unread) return "done";
    if (facts.streaming) return "streaming";
    if (facts.finished) return "done";
    return "idle";
  }
  function dotState(kind) {
    return kind === "clay" ? "streaming" : kind === "awaiting" ? "ready" : "idle";
  }
  var ICON_ID = "ccpp-favicon";
  var ERROR_EVENT = /^event:\s*error\s*$|"type"\s*:\s*"error"/m;
  var STOP_EVENT = /^event:\s*message_stop\s*$|"type"\s*:\s*"message_stop"/m;
  var isIconLink = (node) => node instanceof HTMLLinkElement && /\bicon\b/i.test(node.rel) && node.id !== ICON_ID;
  var isCompletion = (path) => /\/chat_conversations\/[^/]+\/(?:completion|retry_completion)$/.test(path);
  function codeProjectOf(path, search3) {
    const channel = /^\/code\/project\/(chan_[A-Za-z0-9]+)/.exec(path)?.[1];
    if (!channel) return null;
    const thread = /[?&]thread=(cmsg_[A-Za-z0-9]+)/.exec(search3)?.[1] ?? null;
    return { channel, thread };
  }
  var chatFavicon_default = definePlugin({
    name: "ChatFavicon",
    title: { zh: "标签页图标状态", en: "Chat state favicon" },
    description: {
      zh: "标签页图标随对话状态变化：回复中、已完成、草稿待发送、出错（含消息发送失败），6 种样式可选；「项目角标」样式在项目页上和侧栏项目圆点完全一致（同样的状态、颜色和优先级）。Claude Code 项目页跟随项目主对话和所有线程，按 claude.ai 自己的顺序：等你回复、失败、有未读结果、运行中。",
      en: "The tab icon follows the chat: replying, done, draft ready, error (including a message that couldn't be sent). Six styles; on project pages the project-dot style shows exactly what the sidebar project dot shows. On Claude Code project pages it follows the project chat and all its threads, in claude.ai's own order: waiting on you, failed, unread results, running."
    },
    category: "notifications",
    icon: "tab",
    enabledByDefault: true,
    updatedAt: "2026-10-24",
    dependencies: ["ChatStateApi", "ClaudeApi", "ComposerApi", "NetworkApi", "RouterApi"],
    settings: settings6,
    start(scope) {
      const removed = [];
      let official = `${location.origin}/favicon.ico`;
      let mark = null;
      let markFrom = "";
      const loadMark = (href) => {
        if (!/\.svg(?:$|\?)/i.test(href) || href === markFrom) return;
        markFrom = href;
        fetch(href, { credentials: "omit" }).then((r3) => r3.ok ? r3.text() : "").then((text) => {
          const parsed = parseMark(text);
          if (!parsed || !scope.alive) return;
          mark = parsed;
          paint();
        }).catch(() => {
        });
      };
      const onChatSurface = () => ["chat", "new", "project"].includes(currentRoute().kind) || !!codeProjectOf(location.pathname, location.search);
      let errored = false;
      let finished2 = false;
      let streaming = chatPhase() === "streaming";
      let sent = "";
      let sentAt = 0;
      const norm2 = (text) => text.replace(/\s+/g, " ").trim();
      const draft2 = () => {
        const text = norm2(getText());
        return !!text && text !== sent && Date.now() - sentAt > 1500;
      };
      let state3 = "idle";
      let breath = 1;
      const palette = () => {
        const out = { ...COLOR };
        for (const key of Object.keys(THEME)) out[key] = resolveColor(THEME[key], COLOR[key]);
        return out;
      };
      const link = document.createElement("link");
      link.id = ICON_ID;
      link.rel = "icon";
      link.setAttribute("sizes", "any");
      const claim2 = () => {
        const head = document.head;
        if (!head) return;
        for (const node of [...head.querySelectorAll("link")]) {
          if (!isIconLink(node)) continue;
          if (node.href && !node.href.startsWith("data:") && (/svg/i.test(node.type) || !/\.svg/i.test(official))) official = node.href;
          removed.push(node);
          node.remove();
        }
        if (head.firstChild !== link) head.prepend(link);
      };
      const release = () => {
        link.remove();
        for (const node of removed.splice(0)) if (!node.isConnected) document.head?.appendChild(node);
      };
      const paint = () => {
        if (!onChatSurface()) return release();
        claim2();
        loadMark(official);
        const href = faviconFor(settings6.store.style, state3, official, mark, breath, palette());
        if (link.getAttribute("href") !== href) link.setAttribute("href", href);
      };
      let inflight2 = 0;
      let pendingUntil = 0;
      let endedAt = 0;
      let codeWorking = false;
      let codeWaiting = false;
      let codeFailed = false;
      let codeUnread = false;
      const live = () => codeWorking || inflight2 > 0 || Date.now() < pendingUntil || chatPhase() === "streaming" && Date.now() - endedAt > 1e4;
      const update = () => {
        const now2 = live();
        if (now2 && !streaming) {
          errored = false;
          finished2 = false;
        } else if (!now2 && streaming) finished2 = true;
        streaming = now2;
        const facts = { streaming, errored: errored || !!document.querySelector(SEL.failedSend), finished: finished2, draft: draft2() };
        const onProject = !!codeChannel && codeProjectOf(location.pathname, location.search)?.channel === codeChannel;
        const { showWaiting, withOwn } = projectDotOptions();
        const next = !onProject ? computeState(facts) : settings6.store.style === "project" ? dotState(shownKind(codeActivity, showWaiting, withOwn, codeSent.channel === codeChannel ? codeSent.until : 0)) : computeProjectState(facts, { waiting: codeWaiting, failed: codeFailed, unread: codeUnread, working: codeWorking });
        if (next === state3) return;
        state3 = next;
        paint();
      };
      onSubmit(scope, (text) => {
        sent = norm2(text);
        sentAt = Date.now();
        errored = false;
        pendingUntil = Date.now() + 8e3;
        update();
      });
      let codeChannel = "";
      let codeActivity;
      let codeSent = { channel: "", until: 0 };
      let codeBusy = false;
      let codePausedUntil = 0;
      const pollCode = async () => {
        const page2 = codeProjectOf(location.pathname, location.search);
        if (!page2) {
          codeChannel = "";
          codeActivity = void 0;
          if (codeWorking || codeWaiting || codeFailed || codeUnread) {
            codeWorking = codeWaiting = codeFailed = codeUnread = false;
            update();
          }
          return;
        }
        if (codeBusy || Date.now() < codePausedUntil) return;
        codeBusy = true;
        try {
          const channel = page2.channel;
          const [phases, activity] = await Promise.all([getProjectPhases(channel, scope.signal, page2.thread), getProjectActivity(channel, scope.signal)]);
          if (!scope.alive || page2.channel !== codeProjectOf(location.pathname, location.search)?.channel) return;
          codeChannel = channel;
          codeActivity = activity;
          if (codeSent.channel === channel && projectKind(activity, false, projectDotOptions().withOwn) === "clay") codeSent = { channel: "", until: 0 };
          ({ working: codeWorking, waiting: codeWaiting, failed: codeFailed, unread: codeUnread } = projectFacts(phases.values()));
          update();
        } catch (error2) {
          if (error2 instanceof ApiError && error2.status === 429) codePausedUntil = Date.now() + 6e4;
        } finally {
          codeBusy = false;
        }
      };
      scope.interval(pollCode, 4e3);
      void pollCode();
      scope.on("reply:start", update);
      scope.on("reply:end", update);
      scope.interval(update, 500);
      const chatKey = () => {
        const page2 = codeProjectOf(location.pathname, location.search);
        return page2 ? page2.channel : currentRoute().chatId ?? null;
      };
      let chatId = chatKey();
      const onNavigate = () => {
        const next = chatKey();
        const code = next?.startsWith("chan_");
        if (next !== chatId && chatId !== null && (code || !streaming)) {
          finished2 = false;
          errored = false;
          if (code) {
            codeWorking = codeWaiting = codeFailed = codeUnread = false;
            streaming = false;
          }
        }
        chatId = next;
        update();
        paint();
        if (code) void pollCode();
      };
      scope.on("route", onNavigate);
      scope.on("route:search", onNavigate);
      let inputTimer;
      scope.listen(document, "input", (event) => {
        if (!event.target?.closest?.(SEL.editor)) return;
        clearTimeout(inputTimer);
        inputTimer = setTimeout(() => scope.alive && update(), 60);
      }, { capture: true });
      scope.defer(() => clearTimeout(inputTimer));
      const fail2 = () => {
        errored = true;
        update();
      };
      onRequestError(scope, (req) => sameOrigin(req) && req.method === "POST" && isCompletion(req.url.pathname), (error2) => {
        if (!(error2 instanceof DOMException && error2.name === "AbortError")) fail2();
      });
      scope.on("send:failed", fail2);
      scope.on("send:failed", ({ channelId }) => {
        if (channelId !== codeSent.channel) return;
        codeSent = { channel: "", until: 0 };
        update();
      });
      scope.on("send:ok", ({ channelId }) => {
        if (channelId !== codeProjectOf(location.pathname, location.search)?.channel) return;
        codeSent = { channel: channelId, until: Date.now() + SEND_GRACE_MS };
        update();
      });
      onResponse(scope, (req) => sameOrigin(req) && req.method === "POST" && isCompletion(req.url.pathname), async (response) => {
        inflight2++;
        pendingUntil = 0;
        update();
        let open = true;
        const close = () => {
          if (!open) return;
          open = false;
          inflight2 = Math.max(0, inflight2 - 1);
          endedAt = Date.now();
          update();
        };
        try {
          if (!response.ok) return fail2();
          const reader = response.body?.getReader();
          if (!reader) {
            const text = await response.text();
            if (ERROR_EVENT.test(text)) fail2();
            return;
          }
          const decoder = new TextDecoder();
          let tail = "";
          for (; ; ) {
            const { done, value } = await reader.read();
            if (done) break;
            tail = (tail + decoder.decode(value, { stream: true })).slice(-4096);
            if (ERROR_EVENT.test(tail)) fail2();
            if (STOP_EVENT.test(tail)) {
              close();
              void reader.cancel().catch(() => {
              });
              break;
            }
          }
        } catch {
        } finally {
          close();
        }
      });
      scope.observe(link, { attributes: true, attributeFilter: ["href"] }, () => {
        const want = faviconFor(settings6.store.style, state3, official, mark, breath, palette());
        if (onChatSurface() && link.getAttribute("href") !== want) link.setAttribute("href", want);
      });
      if (document.head) scope.observe(document.head, { childList: true }, () => onChatSurface() && (!link.isConnected || [...document.head.querySelectorAll("link")].some(isIconLink)) && paint());
      const reduced = matchMedia("(prefers-reduced-motion: reduce)");
      scope.interval(() => {
        const next = settings6.store.style !== "project" || state3 !== "streaming" || reduced.matches ? 1 : breathAt(Date.now());
        if (next === breath) return;
        breath = next;
        paint();
      }, BREATH_FRAME_MS);
      scope.defer(release);
      paint();
    }
  });

  // sites/claude/plugins/ChatFavicon/index.ts
  var ChatFavicon_default = toFramework(chatFavicon_default);

  // src/lib/format.ts
  var zh = () => getLang() === "zh";
  function untilText(target2, now2 = Date.now()) {
    const minutes = Math.max(0, Math.round((target2 - now2) / 6e4));
    const days2 = Math.floor(minutes / 1440);
    const hours = Math.floor(minutes % 1440 / 60);
    const mins = minutes % 60;
    if (zh()) {
      if (days2) return `${days2} 天 ${hours} 小时`;
      if (hours) return `${hours} 小时 ${mins} 分钟`;
      return `${mins} 分钟`;
    }
    if (days2) return `${days2}d ${hours}h`;
    if (hours) return `${hours}h ${mins}m`;
    return `${mins}m`;
  }
  function agoText(at, now2 = Date.now()) {
    const s3 = Math.max(0, Math.round((now2 - at) / 1e3));
    if (s3 < 10) return zh() ? "刚刚" : "just now";
    if (s3 < 60) return zh() ? `${s3} 秒前` : `${s3}s ago`;
    const m3 = Math.round(s3 / 60);
    if (m3 < 60) return zh() ? `${m3} 分钟前` : `${m3}m ago`;
    const hr = Math.round(m3 / 60);
    if (hr < 48) return zh() ? `${hr} 小时前` : `${hr}h ago`;
    const d3 = Math.round(hr / 24);
    return zh() ? `${d3} 天前` : `${d3}d ago`;
  }
  var pad = (n2) => String(n2).padStart(2, "0");
  function dateTimeText(at, now2 = Date.now()) {
    const d3 = new Date(at);
    const today = new Date(now2);
    const time2 = `${pad(d3.getHours())}:${pad(d3.getMinutes())}`;
    if (d3.toDateString() === today.toDateString()) return time2;
    const date = d3.getFullYear() === today.getFullYear() ? `${d3.getMonth() + 1}/${d3.getDate()}` : `${d3.getFullYear()}/${d3.getMonth() + 1}/${d3.getDate()}`;
    return `${date} ${time2}`;
  }
  var fullDateText = (at) => new Date(at).toLocaleString(zh() ? "zh-CN" : "en-US");
  var snippet = (text, max = 80) => {
    const flat2 = text.replace(/\s+/g, " ").trim();
    return flat2.length > max ? `${flat2.slice(0, max - 1)}…` : flat2;
  };

  // src/plugins/_api/transcript/index.ts
  var FEEDS = `${SEL.scroller}, [data-testid="epitaxy-virtual-transcript"], [role="feed"][data-autoscroll-container]`;
  var lastFeed = null;
  function getScrollers() {
    return [...document.querySelectorAll(FEEDS)].filter((el) => el.isConnected && el.clientHeight > 0);
  }
  function getScroller() {
    const all = getScrollers();
    if (!all.length) return null;
    if (lastFeed && all.includes(lastFeed)) return lastFeed;
    return all.find((el) => el.closest('[data-perf-region="side_pane"]')) ?? all[0];
  }
  function noteFeedActivity(target2) {
    if (!(target2 instanceof Element)) return;
    const feed = target2.closest(FEEDS);
    if (feed) lastFeed = feed;
  }
  var SR_PREFIX = /^(?:You said|Claude responded|你说|Claude 回复)[:：]\s*/;
  function rowText(el) {
    const body = el.querySelector(`${SEL.userMessageBody}, ${SEL.userMessage}, ${SEL.prose}`) ?? el;
    return (body.innerText || "").replace(SR_PREFIX, "").trim();
  }
  function getRows(root2 = getScroller()) {
    if (!root2) return [];
    return [...root2.querySelectorAll(SEL.transcriptRow)].map((el) => {
      const index = Number(el.dataset.index);
      const message = el.querySelector(`${SEL.userMessage}, ${SEL.assistantMessage}`);
      const role = message?.matches(SEL.userMessage) || el.dataset.perfRow === "human" ? "user" : "assistant";
      const keyed = el.querySelector("[data-turn-key]");
      const entry = el.querySelector("[data-epitaxy-entry]")?.dataset.epitaxyEntry ?? null;
      return { index, el, role, turnKey: keyed?.dataset.turnKey ?? null, entry };
    }).filter((row) => Number.isFinite(row.index)).sort((a3, b3) => a3.index - b3.index);
  }
  function totalMessages(root2 = getScroller()) {
    const article = root2?.querySelector("[aria-setsize]");
    const size = Number(article?.getAttribute("aria-setsize"));
    return Number.isFinite(size) && size > 0 ? size : null;
  }
  var sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  var JUMP_OFFSET = 72;
  function scrollRowIntoView(scroller, row, behavior) {
    const delta = row.getBoundingClientRect().top - scroller.getBoundingClientRect().top - JUMP_OFFSET;
    scroller.scrollBy({ top: delta, behavior });
  }
  async function jumpTo(index, options = {}) {
    const scroller = options.scroller ?? getScroller();
    if (!scroller) return null;
    const token = (jumpTokens.get(scroller) ?? 0) + 1;
    jumpTokens.set(scroller, token);
    let cancelled = false;
    const cancel = () => cancelled = true;
    const events2 = ["wheel", "touchstart", "pointerdown", "keydown"];
    for (const type of events2) scroller.addEventListener(type, cancel, { passive: true, capture: true });
    try {
      return await stepTo(scroller, index, options, () => cancelled || jumpTokens.get(scroller) !== token);
    } finally {
      for (const type of events2) scroller.removeEventListener(type, cancel, { capture: true });
    }
  }
  var jumpTokens = /* @__PURE__ */ new WeakMap();
  async function stepTo(scroller, index, options, stopped) {
    let nearby = false;
    let waited = 0;
    for (let attempt = 0; attempt < 24; attempt++) {
      if (stopped()) return null;
      const rows = getRows(scroller);
      const byEntry = options.entry ? rows.find((r3) => r3.entry === options.entry || r3.turnKey === options.entry) : void 0;
      const row = byEntry ?? rows.find((r3) => r3.index === index);
      if (row && !byEntry && options.entry && !nearby) {
        nearby = true;
        scrollRowIntoView(scroller, row.el, "auto");
        await sleep(120);
        continue;
      }
      if (row) {
        scrollRowIntoView(scroller, row.el, options.behavior ?? "smooth");
        if (options.flash !== false) flash(row.el);
        return settle(scroller, row.el, () => {
          const now2 = getRows(scroller);
          return (options.entry ? now2.find((r3) => r3.entry === options.entry || r3.turnKey === options.entry) : void 0) ?? now2.find((r3) => r3.index === row.index);
        }, stopped);
      }
      if (!rows.length) {
        if (waited++ < 120) attempt--;
        await sleep(120);
        continue;
      }
      const first = rows[0];
      const last2 = rows[rows.length - 1];
      const span2 = last2.el.getBoundingClientRect().bottom - first.el.getBoundingClientRect().top;
      const average = Math.max(80, span2 / rows.length);
      const anchor = index < first.index ? first : last2;
      const distance = (index - anchor.index) * average;
      scroller.scrollBy({ top: Math.max(-scroller.clientHeight * 3, Math.min(scroller.clientHeight * 3, distance)), behavior: "auto" });
      await sleep(90);
    }
    return null;
  }
  async function settle(scroller, el, find2, stopped) {
    let target2 = el;
    let stable = 0;
    for (let i3 = 0; i3 < 20 && stable < 3; i3++) {
      await sleep(100);
      if (stopped()) break;
      target2 = find2()?.el ?? target2;
      if (!target2.isConnected) break;
      const delta = target2.getBoundingClientRect().top - scroller.getBoundingClientRect().top - JUMP_OFFSET;
      if (Math.abs(delta) <= 4) stable++;
      else {
        stable = 0;
        scroller.scrollBy({ top: delta, behavior: "auto" });
      }
    }
    return target2;
  }
  function flash(el) {
    const target2 = el.querySelector(`${SEL.userMessage}, ${SEL.assistantMessage}, [role="article"]`) ?? el;
    target2.classList.remove("ccpp-flash");
    void target2.offsetWidth;
    target2.classList.add("ccpp-flash");
    setTimeout(() => target2.classList.remove("ccpp-flash"), 1600);
  }
  function currentIndex(scroller = getScroller()) {
    if (!scroller) return null;
    const top = scroller.getBoundingClientRect().top + JUMP_OFFSET + 8;
    let best = null;
    for (const row of getRows(scroller)) {
      const rect = row.el.getBoundingClientRect();
      if (rect.height === 0) continue;
      if (rect.top <= top) best = row;
      else {
        best ??= row;
        break;
      }
    }
    return best?.index ?? null;
  }
  var cache = /* @__PURE__ */ new Map();
  var CACHE_MS = 6e4;
  function loadConversation(chatId = currentRoute().chatId, force = false) {
    if (!chatId) return null;
    const hit = cache.get(chatId);
    if (hit && !force && Date.now() - hit.at < CACHE_MS) return hit.promise;
    const promise = getConversation(chatId);
    cache.set(chatId, { at: Date.now(), promise });
    promise.catch(() => cache.delete(chatId));
    return promise;
  }
  var invalidateConversation = (chatId) => chatId && cache.delete(chatId);
  var marks = /* @__PURE__ */ new Map();
  var markListeners = /* @__PURE__ */ new Set();
  function setMarks(source, indices) {
    marks.set(source, new Set(indices));
    for (const fn2 of [...markListeners]) fn2();
  }
  var getMarks = (source) => marks.get(source) ?? /* @__PURE__ */ new Set();
  function onMarksChange(scope, fn2) {
    markListeners.add(fn2);
    scope.defer(() => markListeners.delete(fn2));
  }
  var CSS4 = `
@keyframes ccpp-flash { 0%, 70% { outline-color: var(--cds-text-primary, currentColor); } 100% { outline-color: transparent; } }
.ccpp-flash { outline: 2px solid transparent; outline-offset: 4px; border-radius: 12px; animation: ccpp-flash 1.6s ease-out; }
`;
  var transcript_default = definePlugin({
    name: "TranscriptApi",
    title: { zh: "对话内容", en: "Transcript API" },
    description: { zh: "定位对话里的消息、跳转到第 N 条（含未渲染的虚拟行），并缓存对话内容。", en: "Finds messages in the chat, jumps to message N (also virtualised rows) and caches the conversation." },
    category: "api",
    icon: "list",
    hidden: true,
    dependencies: ["ClaudeApi", "RouterApi", "ChatStateApi", "StylesApi"],
    start(scope) {
      addStyle(scope, CSS4, "transcript");
      scope.on("reply:end", ({ chatId }) => invalidateConversation(chatId));
      const note = (event) => noteFeedActivity(event.target);
      scope.listen(document, "pointerdown", note, { capture: true, passive: true });
      scope.listen(document, "wheel", note, { capture: true, passive: true });
      scope.defer(() => cache.clear());
    }
  });

  // src/plugins/chatNavigator/index.ts
  var logger9 = new Logger2("ChatNavigator");
  var settings7 = definePluginSettings({
    showAssistant: { type: "boolean", label: { zh: "列出 Claude 的回复", en: "List Claude's replies" }, description: { zh: "关闭后目录里只有你的提问。", en: "Off lists only your prompts." }, default: true },
    minMessages: { type: "number", label: { zh: "至少几条消息才显示", en: "Show from this many messages" }, description: { zh: "默认一问一答就显示。", en: "By default one prompt and reply is enough." }, default: 2, min: 1, max: 20 },
    jumpEffect: {
      type: "select",
      label: { zh: "跳转效果", en: "Jump effect" },
      description: { zh: "跳到一条消息后怎样提示它的位置。", en: "How the message is marked after jumping to it." },
      default: "border",
      options: [
        { value: "border", label: { zh: "高亮边框", en: "Highlight border" } },
        { value: "none", label: { zh: "无", en: "None" } }
      ]
    },
    keys: { type: "boolean", label: { zh: "键盘跳转", en: "Keyboard" }, description: { zh: "输入框外 ↑ / ↓ 跳转，Home / End 到首尾。", en: "Outside the input: ↑ / ↓, Home / End." }, default: true }
  });
  var L11 = {
    title: { zh: "对话目录", en: "Outline" },
    streaming: { zh: "正在回复…", en: "Replying…" },
    empty: { zh: "（空消息）", en: "(empty)" },
    goTo: { zh: "跳到第 {n} 条，共 {total} 条", en: "Go to message {n} of {total}" }
  };
  var CSS5 = `
.rail { position: fixed; display: flex; align-items: center; pointer-events: none; }
.ticks { display: flex; flex-direction: column; align-items: flex-end; max-height: 100%; overflow: hidden; pointer-events: auto; scrollbar-width: none; }
.ticks::-webkit-scrollbar { display: none; }
.tick { display: flex; align-items: center; justify-content: flex-end; flex: none; width: 20px; height: 12px; padding: 0 2px 0 0; border: 0; background: transparent; }
.dense .tick { height: 7px; }
.tick::after { content: ""; display: block; height: 1px; width: 6px; border-radius: 999px; background: color-mix(in srgb, var(--fg3) 60%, transparent); transition: width .15s ease, background-color .15s ease; }
.tick.assistant::after { width: 12px; }
.tick.current::after { width: 16px; background: var(--fg); }
.tick.marked::after { background: ${STAR_COLOR}; }
.tick.live::after { height: 0; background: none; border-top: 1px dashed color-mix(in srgb, var(--fg3) 70%, transparent); }
.tick.live.current::after { border-top-color: var(--fg); }
.rail:hover .tick::after { background: color-mix(in srgb, var(--fg3) 85%, transparent); }
.rail:hover .tick.current::after { background: var(--fg); }
.rail:hover .tick.marked::after { background: ${STAR_COLOR}; }
.menu { position: absolute; top: 50%; right: calc(100% + 4px); width: min(288px, 70vw); max-height: var(--menu-h, 70vh); overflow: auto; padding: 6px; border-radius: 20px; background: var(--bg); box-shadow: var(--shadow); color: var(--fg); pointer-events: auto;
  opacity: 0; visibility: hidden; transform: translate(8px, -50%); transition: opacity .2s ease, visibility .2s ease, transform .2s ease; overscroll-behavior: contain; }
.rail.open .menu { opacity: 1; visibility: visible; transform: translate(0, -50%); }
.meta { position: sticky; top: -6px; z-index: 2; margin: -6px -6px 0; padding: 10px 16px 6px; background: var(--bg); border-radius: 20px 20px 0 0; color: var(--fg2); font-size: var(--fs-xs); letter-spacing: -.2px; font-variant-numeric: tabular-nums; }
.list { display: flex; flex-direction: column; gap: 2px; margin: 0; padding: 0; list-style: none; }
.item { display: flex; align-items: center; gap: 6px; width: 100%; padding: 6px 8px; border: 1px solid transparent; border-radius: 12px; background: transparent; color: var(--fg2); font-size: var(--fs); line-height: 1.4; letter-spacing: -.2px; text-align: start; }
.item:hover, .item:focus-visible, .item.aim { background: var(--bg2); color: var(--fg); box-shadow: none; }
.item.active { color: var(--fg); border-color: var(--line); }
.emoji { flex: none; font-size: 15px; line-height: 1; }
.label { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.label.dim { color: var(--fg3); font-style: italic; }
.star { flex: none; color: ${STAR_COLOR}; font-size: 12px; }
@media (prefers-reduced-motion: reduce) { .menu, .tick::after { transition: none; } }
`;
  var seen2 = /* @__PURE__ */ new Map();
  var flat = (text) => text.replace(/\s+/g, " ").trim();
  function alignWithApi(items2, api) {
    if (!api.length || !items2.length) return items2;
    const keys = api.map((m3) => flat(m3.text).slice(0, 24));
    const anchors = [];
    let from = 0;
    for (const item of items2) {
      if (!item.text) continue;
      const text = flat(item.text);
      for (let j4 = from; j4 < api.length; j4++) {
        if (keys[j4].length >= 4 && text.includes(keys[j4])) {
          anchors.push([item.index, j4]);
          from = j4 + 1;
          break;
        }
      }
    }
    const offsetFor = (index) => {
      if (!anchors.length) return api.length - items2.length;
      let best = anchors[0];
      for (const anchor of anchors) if (Math.abs(anchor[0] - index) < Math.abs(best[0] - index)) best = anchor;
      return best[1] - best[0];
    };
    const last2 = anchors.length ? anchors[anchors.length - 1][0] : -1;
    return items2.flatMap((item) => {
      const message = api[item.index + offsetFor(item.index)];
      if (message?.notice) return [];
      if (!message) return item.text || item.index <= last2 ? [item] : [];
      return [{ index: item.index, role: message.role, text: item.text || message.text }];
    });
  }
  function outlineFromApi(api, rows) {
    const pos = new Map(api.map((m3, i3) => [m3.id, i3]));
    const anchors = rows.filter((r3) => r3.entry && pos.has(r3.entry)).map((r3) => [pos.get(r3.entry), r3.index]);
    if (!anchors.length) return null;
    const sorted = [...anchors].sort((a3, b3) => a3[0] - b3[0]);
    const [p0, r0] = sorted[0];
    const [pn2, rn2] = sorted[sorted.length - 1];
    const rowFor = (i3) => {
      if (i3 < p0) return p0 <= r0 ? r0 - (p0 - i3) : Math.floor(r0 * i3 / p0);
      if (i3 > pn2) return rn2 + (i3 - pn2);
      let k4 = 0;
      while (k4 < sorted.length - 1 && sorted[k4 + 1][0] < i3) k4++;
      const [pa, ra] = sorted[k4];
      const [pb, rb] = sorted[Math.min(k4 + 1, sorted.length - 1)];
      if (pb === pa) return ra;
      return ra + Math.round((i3 - pa) * (rb - ra) / (pb - pa));
    };
    const out = api.flatMap((m3, i3) => m3.notice ? [] : [{ index: rowFor(i3), role: m3.role, text: m3.text, entry: m3.id, seq: i3 }]);
    const lastRow = Math.max(...anchors.map((a3) => a3[1]));
    let extra = api.length;
    for (const row of rows) if (row.entry && !pos.has(row.entry) && row.text && row.index > lastRow) out.push({ ...row, seq: extra++ });
    return out.sort((a3, b3) => a3.index - b3.index);
  }
  function paneRight(scroller) {
    const side = scroller.closest('[data-perf-region="side_pane"]');
    let right = scroller.getBoundingClientRect().right;
    if (side) right = side.getBoundingClientRect().right;
    else {
      const otherSide = document.querySelector('[data-perf-region="side_pane"]');
      const limit = otherSide && otherSide.getBoundingClientRect().width > 0 ? otherSide.getBoundingClientRect().left : window.innerWidth;
      for (let el = scroller.parentElement; el && el !== document.body; el = el.parentElement) {
        const r3 = el.getBoundingClientRect();
        if (r3.right > limit + 1 || el.contains(otherSide)) break;
        right = Math.max(right, r3.right);
        if (el.tagName === "MAIN") break;
      }
    }
    for (let el = scroller; el && el !== document.body; el = el.parentElement) {
      const bar = el.offsetWidth - el.clientWidth;
      if (bar > 0 && /auto|scroll/.test(getComputedStyle(el).overflowY)) {
        if (Math.abs(el.getBoundingClientRect().right - right) <= 1) right -= Math.min(bar, 8);
        break;
      }
    }
    return right;
  }
  var outlineKey = (items2) => items2.map((i3) => `${i3.index}:${i3.role}:${i3.text.length}`).join("|");
  var paneOf = (scroller) => scroller.closest('[data-perf-region="side_pane"]') ? "side" : "main";
  function keyFor(scroller) {
    if (paneOf(scroller) === "main") return currentRoute().chatId ?? `${location.pathname}|main`;
    return `${location.pathname}?thread=${new URLSearchParams(location.search).get("thread") ?? ""}|side`;
  }
  function transcripts() {
    const all = getScrollers();
    return all.filter((el) => !all.some((other) => other !== el && other.contains(el)));
  }
  var OPEN_DELAY_MS = 180;
  var chatNavigator_default = definePlugin({
    name: "ChatNavigator",
    title: { zh: "对话目录", en: "Chat navigator" },
    description: {
      zh: "把对话右侧做成 Notion 式目录：细刻度标出每条提问和回复，悬停展开全部消息（包括长对话里还没渲染的），点击跳转；正在输出的回复显示为虚线。普通对话和 Claude Code 项目页都能用，项目页的主对话和线程侧栏各有一套，贴着各自的右边缘。",
      en: "A Notion-style outline on the right of the chat: thin ticks for every prompt and reply, hover to list them all (also ones not rendered yet), click to jump; a reply still streaming shows as a dashed tick. On Claude Code project pages the project chat and the thread pane each get their own, flush with their right edge."
    },
    category: "navigation",
    icon: "list",
    enabledByDefault: true,
    updatedAt: "2026-10-13",
    dependencies: ["TranscriptApi", "RouterApi", "ChatStateApi"],
    settings: settings7,
    start(scope) {
      const { box } = createHost(scope, "navigator", CSS5, { layer: "page" });
      const navs = /* @__PURE__ */ new Map();
      const createNav = (scroller) => {
        const ticks = h4("div", { class: "ticks", role: "navigation", "aria-label": t3(L11.title) });
        const meta = h4("div", { class: "meta" });
        const list2 = h4("ul", { class: "list", role: "menu", "aria-label": t3(L11.title) });
        const menu = h4("div", { class: "menu" }, meta, list2);
        const rail = h4("div", { class: "rail" }, menu, ticks);
        box.append(rail);
        const chatId = paneOf(scroller) === "main" ? currentRoute().chatId : null;
        const channelId = /^\/code\/project\/(chan_[A-Za-z0-9]+)/.exec(location.pathname)?.[1] ?? null;
        const threadId = paneOf(scroller) === "side" ? new URLSearchParams(location.search).get("thread") : null;
        let api = [];
        let apiLoading = false;
        const loadApi = (force = false) => {
          if (!channelId || apiLoading) return;
          apiLoading = true;
          getChannelMessages(channelId, threadId, force).then((messages) => {
            api = messages;
            const next = fromDom();
            if (outlineKey(next) === outlineKey(items2)) return;
            items2 = next;
            draw2();
          }).catch((error2) => logger9.debug("Project messages unavailable:", error2)).finally(() => apiLoading = false);
        };
        let items2 = [];
        let current6 = null;
        let aim = -1;
        let loadToken = 0;
        let hideTimer;
        const known2 = (i3) => !!chatId || !!i3.text.trim() || isLive(i3);
        const shown2 = () => items2.filter((i3) => known2(i3) && (settings7.store.showAssistant || i3.role === "user"));
        const key = keyFor(scroller);
        const feedKey = () => key;
        const harvest = () => {
          const key2 = feedKey();
          let memo = seen2.get(key2);
          if (!memo) seen2.set(key2, memo = /* @__PURE__ */ new Map());
          for (const row of getRows(scroller)) {
            const text = rowText(row.el);
            if (text || !memo.has(row.index)) memo.set(row.index, { index: row.index, role: row.role, text, entry: row.entry });
          }
          return memo;
        };
        const fromDom = () => {
          const memo = harvest();
          const total = Math.max(totalMessages(scroller) ?? 0, memo.size ? Math.max(...memo.keys()) + 1 : 0);
          const rows = Array.from({ length: total }, (_3, index) => memo.get(index) ?? { index, role: index % 2 === 0 ? "user" : "assistant", text: "" });
          if (!channelId) return rows;
          return outlineFromApi(api, [...memo.values()]) ?? alignWithApi(rows, api);
        };
        const load = async (force = false) => {
          const token = ++loadToken;
          if (!chatId) {
            const next = fromDom();
            if (outlineKey(next) !== outlineKey(items2)) {
              items2 = next;
              draw2();
            }
            loadApi(force);
            return;
          }
          try {
            const conversation = await loadConversation(chatId, force);
            if (token !== loadToken || !conversation) return;
            items2 = conversation.messages.map((m3, index) => ({ index, role: m3.role, text: m3.text }));
          } catch (error2) {
            logger9.warn("Falling back to the page for the outline:", error2);
            if (token !== loadToken) return;
            items2 = fromDom();
          }
          const total = totalMessages(scroller);
          if (total && total > items2.length) items2 = [...items2, ...fromDom().slice(items2.length)];
          draw2();
        };
        const visible = () => scroller.isConnected && scroller.clientHeight > 0 && shown2().length >= settings7.store.minMessages;
        const place4 = () => {
          if (!visible()) {
            rail.style.display = "none";
            setOpen(false);
            return;
          }
          rail.style.display = "";
          const rect = scroller.getBoundingClientRect();
          const right = paneRight(scroller);
          const top = Math.max(rect.top + 24, topBarBottom(right - 10, rect.top) + 8);
          const height = Math.max(120, rect.bottom - 24 - top);
          rail.style.right = `${Math.max(0, window.innerWidth - right)}px`;
          rail.style.top = `${top}px`;
          rail.style.height = `${height}px`;
          rail.style.setProperty("--menu-h", `${Math.min(window.innerHeight * 0.7, height)}px`);
          rail.classList.toggle("dense", shown2().length * 12 > height);
        };
        const isLive = (item) => chatPhase() === "streaming" && item.role === "assistant" && item.index === items2.length - 1;
        const label = (item) => {
          if (item.text.trim()) return { text: snippet(item.text, 120), dim: false };
          if (isLive(item)) return { text: t3(L11.streaming), dim: true };
          return { text: t3(L11.empty), dim: true };
        };
        let currentEntry = null;
        let pinned = null;
        const unpin = () => {
          if (!pinned) return;
          pinned = null;
          current6 = null;
          syncCurrent();
        };
        for (const type of ["wheel", "touchstart", "pointerdown", "keydown"]) scroller.addEventListener(type, unpin, { passive: true });
        const activePos = () => {
          const entries3 = shown2();
          if (pinned) {
            const at = entries3.findIndex((item) => pinned.entry ? item.entry === pinned.entry : item.index === pinned.index);
            if (at >= 0) return at;
          }
          if (entries3.length && scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight < 4 && scroller.scrollHeight > scroller.clientHeight) return entries3.length - 1;
          if (current6 === null) return -1;
          let pos = -1;
          const seq4 = currentEntry ? api.findIndex((m3) => m3.id === currentEntry) : -1;
          if (seq4 >= 0 && entries3.some((item) => item.seq !== void 0)) {
            entries3.forEach((item, i3) => item.seq !== void 0 && item.seq <= seq4 && (pos = i3));
            return Math.max(pos, 0);
          }
          entries3.forEach((item, i3) => item.index <= current6 && (pos = i3));
          return pos;
        };
        const draw2 = () => {
          clear(ticks);
          const entries3 = shown2();
          const stars = getMarks("stars");
          const active2 = activePos();
          entries3.forEach((item, i3) => {
            const tick3 = h4("button", {
              type: "button",
              class: `tick ${item.role}${i3 === active2 ? " current" : ""}${stars.has(item.index) ? " marked" : ""}${isLive(item) ? " live" : ""}`,
              "aria-label": t3(L11.goTo).replace("{n}", String(i3 + 1)).replace("{total}", String(entries3.length))
            });
            tick3.addEventListener("click", () => go(i3));
            ticks.appendChild(tick3);
          });
          ticks.children[active2]?.scrollIntoView({ block: "nearest" });
          if (rail.classList.contains("open")) drawMenu(false);
          place4();
        };
        const drawMenu = (reveal) => {
          const keep = list2.scrollTop;
          const entries3 = shown2();
          const stars = getMarks("stars");
          const active2 = activePos();
          meta.textContent = `${Math.max(active2, 0) + 1} / ${entries3.length}`;
          clear(list2);
          entries3.forEach((item, i3) => {
            const { text, dim } = label(item);
            const row = h4(
              "button",
              { type: "button", role: "menuitem", class: `item${i3 === active2 ? " active" : ""}${i3 === aim ? " aim" : ""}` },
              h4("span", { class: "emoji", text: item.role === "user" ? "❓" : "🤖" }),
              h4("span", { class: `label${dim ? " dim" : ""}`, text }),
              stars.has(item.index) ? h4("span", { class: "star", text: "★" }) : null
            );
            row.addEventListener("click", () => go(i3));
            list2.appendChild(h4("li", {}, row));
          });
          if (reveal) list2.children[aim >= 0 ? aim : active2]?.scrollIntoView({ block: "nearest" });
          else list2.scrollTop = keep;
        };
        const go = (pos) => {
          const item = shown2()[pos];
          if (!item) return;
          current6 = item.index;
          currentEntry = item.entry ?? null;
          pinned = { index: item.index, entry: item.entry };
          aim = pos;
          draw2();
          if (rail.classList.contains("open")) drawMenu(true);
          void jumpTo(item.index, { flash: settings7.store.jumpEffect === "border", scroller, entry: item.entry });
        };
        const setOpen = (open) => {
          clearTimeout(hideTimer);
          if (open === rail.classList.contains("open")) return;
          rail.classList.toggle("open", open);
          if (open) drawMenu(true);
          else aim = -1;
        };
        let openTimer;
        for (const el of [ticks, menu]) {
          el.addEventListener("mouseenter", () => {
            clearTimeout(hideTimer);
            clearTimeout(openTimer);
            if (el === menu || rail.classList.contains("open")) setOpen(true);
            else openTimer = setTimeout(() => setOpen(true), OPEN_DELAY_MS);
          });
          el.addEventListener("mouseleave", () => {
            clearTimeout(openTimer);
            clearTimeout(hideTimer);
            hideTimer = setTimeout(() => setOpen(false), 200);
          });
        }
        let lastActive = -2;
        const syncCurrent = () => {
          const next = pinned ? current6 : currentIndex(scroller);
          if (next === current6 && activePos() === lastActive) return;
          current6 = next;
          currentEntry = next === null ? null : getRows(scroller).find((row) => row.index === next)?.entry ?? null;
          const active2 = activePos();
          lastActive = active2;
          [...ticks.children].forEach((tick3, i3) => tick3.classList.toggle("current", i3 === active2));
          ticks.children[active2]?.scrollIntoView({ block: "nearest" });
          [...list2.querySelectorAll(".item")].forEach((row, i3) => row.classList.toggle("active", i3 === active2));
          if (rail.classList.contains("open")) meta.textContent = `${Math.max(active2, 0) + 1} / ${shown2().length}`;
        };
        const onScroll = () => {
          syncCurrent();
          if (chatId) return;
          const next = fromDom();
          if (outlineKey(next) !== outlineKey(items2)) {
            items2 = next;
            draw2();
          }
        };
        let seenTotal = null;
        const tick2 = () => {
          place4();
          const total = totalMessages(scroller);
          if (total && total !== seenTotal && (channelId ? true : total !== items2.length)) {
            const grew = seenTotal !== null && total > seenTotal;
            seenTotal = total;
            void load(grew || total > items2.length);
          }
          syncCurrent();
        };
        const step2 = (event) => {
          const entries3 = shown2();
          let target2 = null;
          const at = activePos();
          if (event.key === "Home" || (event.metaKey || event.ctrlKey) && event.key === "ArrowUp") target2 = 0;
          else if (event.key === "End" || (event.metaKey || event.ctrlKey) && event.key === "ArrowDown") target2 = entries3.length - 1;
          else if (event.key === "ArrowUp" && !event.shiftKey) target2 = Math.max(0, at - 1);
          else if (event.key === "ArrowDown" && !event.shiftKey) target2 = Math.min(entries3.length - 1, at + 1);
          if (target2 === null || target2 === at) return;
          event.preventDefault();
          go(target2);
        };
        const close = () => {
          if (!rail.classList.contains("open")) return false;
          setOpen(false);
          return true;
        };
        const dispose = () => {
          clearTimeout(hideTimer);
          clearTimeout(openTimer);
          for (const type of ["wheel", "touchstart", "pointerdown", "keydown"]) scroller.removeEventListener(type, unpin);
          loadToken++;
          rail.remove();
        };
        void load();
        return { key: feedKey(), scroller, rail, load, draw: draw2, place: place4, tick: tick2, onScroll, visible, step: step2, close, dispose };
      };
      const sync3 = () => {
        const live = transcripts();
        for (const [el, nav] of navs) {
          if (live.includes(el) && keyFor(el) === nav.key) continue;
          nav.dispose();
          navs.delete(el);
        }
        for (const el of live) if (!navs.has(el)) navs.set(el, createNav(el));
      };
      const reset = () => {
        for (const nav of navs.values()) nav.dispose();
        navs.clear();
        sync3();
      };
      scope.defer(() => {
        for (const nav of navs.values()) nav.dispose();
        navs.clear();
      });
      let scrollQueued = false;
      const dirty2 = /* @__PURE__ */ new Set();
      scope.listen(document, "scroll", (event) => {
        const target2 = event.target;
        if (target2 instanceof HTMLElement) dirty2.add(target2);
        if (scrollQueued) return;
        scrollQueued = true;
        requestAnimationFrame(() => {
          scrollQueued = false;
          sync3();
          for (const [el, nav] of navs) if ([...dirty2].some((d3) => d3 === el || el.contains(d3) || d3.contains(el))) nav.onScroll();
          dirty2.clear();
        });
      }, { capture: true, passive: true });
      scope.listen(window, "resize", () => navs.forEach((nav) => nav.place()));
      onRoute(scope, () => {
        reset();
        scope.timeout(reset, 300);
      });
      scope.on("reply:end", () => scope.timeout(() => navs.forEach((nav) => nav.load(true)), 800));
      onMarksChange(scope, () => navs.forEach((nav) => nav.draw()));
      scope.interval(() => {
        sync3();
        navs.forEach((nav) => nav.tick());
      }, 1200);
      if (settings7.store.keys) {
        scope.listen(document, "keydown", (event) => {
          if (event.altKey || event.isComposing) return;
          if (isEditable(event.target) || isEditable(document.activeElement)) return;
          const focus = getScroller();
          const nav = (focus && [...navs.values()].find((n2) => n2.scroller === focus || n2.scroller.contains(focus) || focus.contains(n2.scroller))) ?? [...navs.values()][0];
          if (!nav?.visible()) return;
          if (event.key === "Escape") {
            if (nav.close()) event.preventDefault();
            return;
          }
          nav.step(event);
        });
      }
    }
  });

  // sites/claude/plugins/ChatNavigator/index.ts
  var ChatNavigator_default = toFramework(chatNavigator_default);

  // src/plugins/chatNoticeHider/index.ts
  var settings8 = definePluginSettings({
    disclaimer: { type: "boolean", label: { zh: "隐藏底部的 AI 声明（Claude is AI and can make mistakes.）", en: "Hide the AI notice under the input (Claude is AI and can make mistakes.)" }, default: true },
    appPromo: { type: "boolean", label: { zh: "隐藏 App 下载提示（侧栏底部的「Get apps and extensions」按钮等）", en: "Hide app download prompts (the sidebar’s “Get apps and extensions” button and similar)" }, default: true },
    bugReport: { type: "boolean", label: { zh: "隐藏 Claude Code 侧栏右下角的 Bug 反馈按钮", en: "Hide the bug report button at the bottom right of the Claude Code sidebar" }, default: true }
  });
  var APP_PROMO_RE = /^(get the (desktop |mobile )?app|download (the )?(desktop |mobile )?app|download claude( for (mac|windows|desktop))?|get claude for (mac|windows|desktop)|下载(桌面|客户端|应用|App)|获取(桌面版|应用|App))/i;
  function findAppPromos(root2 = document) {
    return [...root2.querySelectorAll('a, button, [role="link"]')].filter((el) => !el.closest(`[data-ccpp], [role="menu"], nav, ${SEL.userContent}`) && APP_PROMO_RE.test(el.textContent?.trim() ?? ""));
  }
  function chatNoticeCss(options) {
    return [
      options.disclaimer ? `[data-disclaimer="true"] { display: none !important; }` : "",
      options.appPromo ? `[data-ccpp-app-promo], a[href="/downloads"][data-cds-icon-only], a[aria-label="Get apps and extensions"] { display: none !important; }` : "",
      options.bugReport ? `[data-testid="code-sidebar-feedback-button"] { display: none !important; }` : ""
    ].join("\n");
  }
  var chatNoticeHider_default = definePlugin({
    name: "ChatNoticeHider",
    title: { zh: "隐藏 AI 声明与 App 提示", en: "Hide AI notice and app prompt" },
    description: {
      zh: "在聊天页隐藏输入框下方的 AI 声明，侧栏底部的 App 下载按钮，以及 Claude Code 侧栏右下角的 Bug 反馈按钮（各项可分别开关）。",
      en: "On chat pages, hides the AI notice under the input the app download button at the bottom of the sidebar, and the bug report button in the Claude Code sidebar (each switchable)."
    },
    category: "declutter",
    icon: "eyeOff",
    enabledByDefault: true,
    updatedAt: "2026-10-22",
    dependencies: ["StylesApi", "DomApi"],
    settings: settings8,
    start(scope) {
      addStyle(scope, chatNoticeCss(settings8.store), "chat-notices");
      if (!settings8.store.appPromo) return;
      onDomChange(scope, () => {
        for (const el of findAppPromos()) if (el.dataset.ccppAppPromo === void 0) el.dataset.ccppAppPromo = "";
      });
      scope.defer(() => document.querySelectorAll("[data-ccpp-app-promo]").forEach((el) => el.removeAttribute("data-ccpp-app-promo")));
    }
  });

  // sites/claude/plugins/ChatNoticeHider/index.ts
  var ChatNoticeHider_default = toFramework(chatNoticeHider_default);

  // sites/claude/plugins/ChatStateApi/index.ts
  var ChatStateApi_default = toFramework(chatState_default);

  // sites/claude/plugins/ClaudeApi/index.ts
  var ClaudeApi_default = toFramework(claude_default2);

  // src/plugins/cleaner/index.ts
  var settings9 = definePluginSettings({
    upgrade: { type: "boolean", label: { zh: "隐藏升级 / 购买入口", en: "Hide upgrade and buy prompts" }, default: true },
    plan: { type: "boolean", label: { zh: "隐藏头像旁的套餐名", en: "Hide the plan name next to your name" }, default: false },
    codeNudge: { type: "boolean", label: { zh: "隐藏输入框里的 Claude Code 推广提示", en: "Hide the Claude Code nudge in the input" }, default: true },
    templates: { type: "boolean", label: { zh: "隐藏侧栏「从模板新建」按钮", en: "Hide the sidebar “New from a template” button" }, default: false },
    modelUpsell: {
      type: "boolean",
      label: { zh: "隐藏模型菜单里的购买提示", en: "Hide upsells in the model menu" },
      description: { zh: "「Buy credits」标签和菜单底部的套餐说明链接。", en: "The “Buy credits” badge and the plan note at the bottom of the menu." },
      default: true
    },
    lockedModels: {
      type: "boolean",
      label: { zh: "隐藏要额外付费才能用的模型", en: "Hide models that need extra credits" },
      description: { zh: "模型菜单里不能直接选、要买用量额度的那几行。", en: "Rows in the model menu you can't pick without buying usage credits." },
      default: false
    }
  });
  var MODEL_MENU = '[role="menu"][data-cds="ModelSelector"]';
  var BUY_RE = /^(buy credits|get credits|购买额度|购买用量)$/i;
  function findCreditBadges(root2 = document) {
    return [...root2.querySelectorAll(`${MODEL_MENU} [data-cds="Badge"]`)].filter((el) => BUY_RE.test(el.textContent?.trim() ?? ""));
  }
  var UPGRADE_RE = /^(upgrade|upgrade plan|upgrade to (pro|max)|get (pro|max)|try (pro|max)|升级|升级套餐)$/i;
  function findUpgradeNags(root2 = document) {
    return [...root2.querySelectorAll("a, button")].filter((el) => !el.closest(`[data-ccpp], ${SEL.userContent}`) && UPGRADE_RE.test(el.textContent?.trim() ?? ""));
  }
  function cleanerCss(options) {
    return [
      `[data-ccpp-cleaned] { display: none !important; }`,
      `a[href^="/upgrade"], a[href*="/upgrade?"] { display: none !important; }`,
      options.plan ? `[data-testid="user-menu-button"] .df-footer-suffix-text { display: none !important; }` : "",
      options.codeNudge ? `#claude-code-nudge-body, [id^="claude-code-nudge"] { display: none !important; }` : "",
      options.templates ? `button[aria-label="New from a template"] { display: none !important; }` : "",
      options.modelUpsell ? `${MODEL_MENU} a[role="menuitem"][href*="support.claude.com"] { display: none !important; }` : "",
      // A model you can pick is a menuitemradio; one that needs credits first is a plain menuitem.
      options.lockedModels ? `${MODEL_MENU} [role="menuitem"][data-model-id] { display: none !important; }` : ""
    ].join("\n");
  }
  var cleaner_default = definePlugin({
    name: "Cleaner",
    title: { zh: "界面清理", en: "Cleaner" },
    description: { zh: "隐藏升级推销、套餐标签、Claude Code 推广提示、模型菜单里的购买提示等干扰元素（各项可分别开关）。", en: "Hides upgrade nags, the plan label, the Claude Code nudge, model-menu upsells and similar clutter (each switchable)." },
    category: "declutter",
    icon: "brush",
    updatedAt: "2026-10-30",
    enabledByDefault: true,
    dependencies: ["StylesApi", "DomApi"],
    settings: settings9,
    start(scope) {
      addStyle(scope, cleanerCss(settings9.store), "cleaner");
      if (settings9.store.upgrade || settings9.store.modelUpsell) {
        onDomChange(scope, () => {
          const nags = [...settings9.store.upgrade ? findUpgradeNags() : [], ...settings9.store.modelUpsell ? findCreditBadges() : []];
          for (const el of nags) if (el.dataset.ccppCleaned === void 0) el.dataset.ccppCleaned = "";
        });
        scope.defer(() => document.querySelectorAll("[data-ccpp-cleaned]").forEach((el) => el.removeAttribute("data-ccpp-cleaned")));
      }
    }
  });

  // sites/claude/plugins/Cleaner/index.ts
  var Cleaner_default = toFramework(cleaner_default);

  // src/plugins/codeBrandColor/index.ts
  var CLAUDE_ORANGE = "#c6613f";
  var settings10 = definePluginSettings({
    color: { type: "color", label: { zh: "颜色", en: "Color" }, description: { zh: "默认是 Claude 的橙色。", en: "Defaults to Claude's orange." }, default: CLAUDE_ORANGE }
  });
  var codeBrandCss = (color) => `
[data-app-wordmark="code"] > span { color: ${color} !important; }
`;
  var codeBrandColor_default = definePlugin({
    name: "CodeBrandColor",
    title: { zh: "侧栏 Code 主题色", en: "Colored Code title" },
    description: {
      zh: "Code 模式下，侧栏顶部的「Code」字样改用主题色，默认 Claude 橙色，可自选颜色。",
      en: `In Code mode, the "Code" title at the top of the sidebar uses a theme color, Claude's orange by default.`
    },
    category: "appearance",
    icon: "palette",
    enabledByDefault: true,
    updatedAt: "2026-10-24",
    dependencies: ["StylesApi"],
    settings: settings10,
    start(scope) {
      const color = () => /^#[0-9a-f]{6}$/i.test(settings10.store.color) ? settings10.store.color : CLAUDE_ORANGE;
      const css2 = () => codeBrandCss(color());
      const set = addStyle(scope, css2(), "code-brand-color");
      this.onSettingsChange = () => set(css2());
    }
  });

  // sites/claude/plugins/CodeBrandColor/index.ts
  var CodeBrandColor_default = toFramework(codeBrandColor_default);

  // src/plugins/collapseCode/index.ts
  var settings11 = definePluginSettings({
    lines: { type: "number", label: { zh: "超过多少行折叠（行）", en: "Collapse code longer than (lines)" }, default: 30, min: 8, max: 200, step: 2 }
  });
  var L12 = { expand: { zh: "展开全部代码（{n} 行）", en: "Show all {n} lines" }, collapse: { zh: "收起代码", en: "Collapse code" } };
  var CSS6 = `
.ccpp-code-collapsed { max-height: var(--ccpp-code-max, 30lh) !important; overflow: hidden !important; -webkit-mask-image: linear-gradient(#000 70%, transparent); mask-image: linear-gradient(#000 70%, transparent); }
.ccpp-code-toggle { display: block; margin: 4px auto 8px; padding: 2px 12px; border-radius: 999px; border: 1px solid rgba(127,127,127,.3); background: transparent; color: inherit; font: 12px/20px ui-sans-serif, system-ui, sans-serif; opacity: .8; cursor: pointer; }
.ccpp-code-toggle:hover { opacity: 1; }
`;
  var collapseCode_default = definePlugin({
    name: "CollapseCode",
    title: { zh: "折叠长代码", en: "Collapse long code" },
    description: { zh: "回复完成后把很长的代码块折叠成固定高度，点按钮展开 / 收起。", en: "After a reply finishes, folds very long code blocks to a fixed height with a show/hide button." },
    category: "messages",
    icon: "collapse",
    enabledByDefault: false,
    dependencies: ["DomApi", "StylesApi"],
    settings: settings11,
    start(scope) {
      addStyle(scope, CSS6, "collapse-code");
      const max = settings11.store.lines;
      watch(scope, `${SEL.assistantMessage}[data-is-streaming="false"] pre`, (pre) => {
        const lines = (pre.textContent ?? "").split("\n").length;
        if (lines <= max) return;
        pre.style.setProperty("--ccpp-code-max", `${max}lh`);
        pre.classList.add("ccpp-code-collapsed");
        const button = h4("button", { type: "button", class: "ccpp-code-toggle", text: t3(L12.expand).replace("{n}", String(lines)) });
        button.addEventListener("click", () => {
          const collapsed = pre.classList.toggle("ccpp-code-collapsed");
          button.textContent = collapsed ? t3(L12.expand).replace("{n}", String(lines)) : t3(L12.collapse);
        });
        pre.after(button);
        return () => {
          pre.classList.remove("ccpp-code-collapsed");
          button.remove();
        };
      });
    }
  });

  // sites/claude/plugins/CollapseCode/index.ts
  var CollapseCode_default = toFramework(collapseCode_default);

  // sites/claude/plugins/ComposerApi/index.ts
  var ComposerApi_default = toFramework(composer_default);

  // src/plugins/composerLook/index.ts
  var settings12 = definePluginSettings({
    opacity: { type: "number", label: { zh: "输入框背景不透明度", en: "Input background opacity" }, description: { zh: "100 为完全不透明。", en: "100 is fully opaque." }, default: 100, min: 20, max: 100, step: 5, unit: "%" },
    blur: { type: "number", label: { zh: "背景模糊", en: "Background blur" }, default: 16, min: 0, max: 40, unit: "px" },
    radius: { type: "number", label: { zh: "圆角", en: "Corner radius" }, description: { zh: "0 表示保持官方样式。", en: "0 keeps claude.ai's own radius." }, default: 0, min: 0, max: 40, unit: "px" }
  });
  var composerCss = (opacity, blur, radius) => `
[data-cds="ChatComposer"] > .bg-surface-3, [data-cds="ChatComposer"] [class*="bg-surface-3"] {
  background-color: color-mix(in srgb, var(--cds-surface-3, var(--bg-300, #fff)) ${opacity}%, transparent) !important;
  ${blur ? `backdrop-filter: blur(${blur}px) saturate(1.2); -webkit-backdrop-filter: blur(${blur}px) saturate(1.2);` : ""}
  ${radius ? `border-radius: ${radius}px !important;` : ""}
}
[data-composer-card-holder] { background: transparent !important; }
`;
  var composerLook_default = definePlugin({
    name: "ComposerLook",
    title: { zh: "输入框外观", en: "Composer look" },
    description: { zh: "调整输入框背景的不透明度、毛玻璃模糊与圆角。", en: "Tune the chat input's background opacity, frosted blur and corner radius." },
    category: "composer",
    tags: ["appearance"],
    icon: "blend",
    enabledByDefault: true,
    dependencies: ["StylesApi"],
    settings: settings12,
    start(scope) {
      const css2 = () => composerCss(settings12.store.opacity, settings12.store.blur, settings12.store.radius);
      const set = addStyle(scope, css2(), "composer-look");
      this.onSettingsChange = () => set(css2());
    }
  });

  // sites/claude/plugins/ComposerLook/index.ts
  var ComposerLook_default = toFramework(composerLook_default);

  // src/plugins/consoleJanitor/index.ts
  var settings13 = definePluginSettings({
    levels: {
      type: "select",
      label: { zh: "静音哪些输出", en: "Silence" },
      default: "info",
      options: [
        { value: "info", label: { zh: "log / info / debug", en: "log / info / debug" } },
        { value: "warn", label: { zh: "以上 + warn", en: "Those + warn" } }
      ]
    }
  });
  var consoleJanitor_default = definePlugin({
    name: "ConsoleJanitor",
    title: { zh: "控制台清净", en: "Console janitor" },
    description: { zh: "静音 claude.ai 在浏览器控制台里的大量日志，只保留错误和 CC++ 自己的输出，方便调试。", en: "Silences claude.ai's console noise, keeping errors and CC++'s own output." },
    category: "developer",
    icon: "terminal",
    enabledByDefault: false,
    startAt: "document-start",
    settings: settings13,
    start(scope) {
      const target2 = pageWindow.console;
      const levels = settings13.store.levels === "warn" ? ["log", "info", "debug", "warn"] : ["log", "info", "debug"];
      for (const level2 of levels) {
        const original = target2[level2];
        const quiet = function(...args) {
          if (typeof args[0] === "string" && args[0].includes(Logger2.TAG)) original.apply(this, args);
        };
        target2[level2] = quiet;
        scope.defer(() => {
          if (target2[level2] === quiet) target2[level2] = original;
        });
      }
    }
  });

  // sites/claude/plugins/ConsoleJanitor/index.ts
  var ConsoleJanitor_default = toFramework(consoleJanitor_default);

  // src/lib/identity.ts
  var ORIG_LABEL = "data-ccpp-orig-label";
  var known = "";
  function realName() {
    const avatar = document.querySelector(`${SEL.userMenuButton} ${SEL.avatar}`);
    const label = (avatar?.getAttribute(ORIG_LABEL) ?? avatar?.getAttribute("aria-label") ?? "").trim();
    if (label) known = label;
    return known;
  }
  var identityRoots = () => [...document.querySelectorAll(SEL.userMenuButton), ...document.querySelectorAll(SEL.accountMenu)];
  function textNodes(root2) {
    const out = [];
    const walker = document.createTreeWalker(root2, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) out.push(node);
    return out;
  }
  var TextSwaps = class {
    swaps = /* @__PURE__ */ new Map();
    set(node, ours) {
      if (node.data === ours) return;
      const prev = this.swaps.get(node);
      const original = prev && node.data === prev.ours ? prev.original : node.data;
      this.swaps.set(node, { original, ours });
      node.data = ours;
    }
    /** The text claude.ai put there, before any swap. */
    original(node) {
      const swap = this.swaps.get(node);
      return swap && node.data === swap.ours ? swap.original : node.data;
    }
    restore(node) {
      for (const [n2, swap] of node ? [[node, this.swaps.get(node)]] : [...this.swaps]) {
        if (!swap) continue;
        if (n2.isConnected && n2.data === swap.ours) n2.data = swap.original;
        this.swaps.delete(n2);
      }
    }
    /** Forgets nodes that left the page. */
    prune() {
      for (const n2 of this.swaps.keys()) if (!n2.isConnected) this.swaps.delete(n2);
    }
  };
  function repaintOnChange(scope, paint) {
    let timer2 = null;
    const run = () => {
      timer2 = null;
      if (scope.alive) paint();
    };
    const observer2 = new MutationObserver(() => timer2 ??= setTimeout(run, 60));
    observer2.observe(document.documentElement, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ["aria-label"] });
    scope.defer(() => {
      observer2.disconnect();
      if (timer2) clearTimeout(timer2);
    });
    paint();
  }

  // src/plugins/customGreeting/index.ts
  var settings14 = definePluginSettings({
    phrases: {
      type: "text",
      label: { zh: "问候语（每行一条）", en: "Greetings (one per line)" },
      description: { zh: "可用 {name}、{time}。留空保持官方问候语。", en: "Supports {name} and {time}. Empty keeps claude.ai's greeting." },
      rows: 5,
      default: t3({ zh: "{time}，{name}\n今天想做点什么？\n灵感来了就写下来", en: "{time}, {name}\nWhat shall we work on today?\nWrite it down while the idea is fresh" })
    },
    order: {
      type: "select",
      label: { zh: "顺序", en: "Order" },
      default: "random",
      options: [
        { value: "random", label: { zh: "随机", en: "Random" } },
        { value: "sequential", label: { zh: "依次", en: "In order" } }
      ]
    },
    rotate: {
      type: "select",
      label: { zh: "什么时候换", en: "Change on" },
      default: "visit",
      options: [
        { value: "visit", label: { zh: "每次打开首页", en: "Each visit to the home page" } },
        { value: "click", label: { zh: "点击问候语", en: "Clicking the greeting" } },
        { value: "timer", label: { zh: "定时", en: "A timer" } }
      ]
    },
    intervalSec: { type: "number", label: { zh: "定时间隔", en: "Timer interval" }, default: 30, min: 5, max: 600, step: 5, unit: "s", visible: (v3) => v3.rotate === "timer" }
  });
  var position = persisted("greeting-index", 0, (v3) => Number.isInteger(v3));
  function pickPhrase(phrases, order, last2, random = Math.random) {
    if (!phrases.length) return { index: -1, text: "" };
    if (order === "sequential") {
      const index2 = (last2 + 1) % phrases.length;
      return { index: index2, text: phrases[index2] };
    }
    let index = Math.floor(random() * phrases.length);
    if (phrases.length > 1 && index === last2) index = (index + 1) % phrases.length;
    return { index, text: phrases[index] };
  }
  function fillPhrase(text, name, hour, zh2) {
    const time2 = hour < 5 ? zh2 ? "夜深了" : "Good night" : hour < 12 ? zh2 ? "早上好" : "Good morning" : hour < 18 ? zh2 ? "下午好" : "Good afternoon" : zh2 ? "晚上好" : "Good evening";
    return text.replaceAll("{name}", name).replaceAll("{time}", time2);
  }
  function findGreetings(root2 = document) {
    const marked = [...root2.querySelectorAll(SEL.greeting)];
    if (marked.length) return marked;
    const editor = document.querySelector(SEL.editor);
    if (!editor || document.querySelector(`${SEL.transcript}, ${SEL.userMessage}, ${SEL.assistantMessage}`)) return [];
    const found = /* @__PURE__ */ new Set();
    for (const spark of root2.querySelectorAll(SEL.greetingSpark)) {
      const holder = spark.closest("[data-new-page-greeting-spark]") ?? spark;
      let row = holder.parentElement;
      for (let up = 0; row && up < 3 && !greetingText(row).trim(); up++) row = row.parentElement;
      if (!row || row.contains(editor) || row.closest(`a, button, [role="button"], ${SEL.sidebar}, ${SEL.composer}`)) continue;
      const words = greetingText(row).trim();
      if (!words || words.length > 200 || words === "Claude") continue;
      found.add(row);
    }
    return [...found];
  }
  var greetingNodes = (el) => textNodes(el).filter((node) => !node.parentElement?.closest(`svg, [data-new-page-greeting-spark]`));
  var greetingText = (el) => greetingNodes(el).map((node) => node.data).join("");
  var displayName = () => document.querySelector(`${SEL.userMenuButton} [data-cds="Avatar"]`)?.getAttribute("aria-label")?.trim() || document.querySelector(`${SEL.userMenuName} span`)?.textContent?.trim() || "";
  var CLICKABLE = "data-ccpp-greeting-click";
  var customGreeting_default = definePlugin({
    name: "CustomGreeting",
    title: { zh: "自定义问候语", en: "Custom greeting" },
    description: { zh: "替换首页问候语（含新版首页），多条随机 / 依次轮换（打开时、点击或定时）。", en: "Your own home greeting (new layouts too), rotated on visit, click or a timer." },
    category: "appearance",
    icon: "message",
    enabledByDefault: false,
    updatedAt: "2026-10-24",
    dependencies: ["DomApi", "RouterApi", "StylesApi"],
    settings: settings14,
    start(scope) {
      const phrases = () => settings14.store.phrases.split("\n").map((s3) => s3.trim()).filter(Boolean);
      resetRaw(settings14.owner(), ["input", "placeholder"]);
      const swaps = new TextSwaps();
      addStyle(scope, `[${CLICKABLE}] { cursor: pointer; }`, "custom-greeting");
      let template = "";
      let shown2 = false;
      const fill5 = (text) => fillPhrase(text, displayName(), (/* @__PURE__ */ new Date()).getHours(), /[一-龥]/.test(text));
      const next = () => {
        const pick = pickPhrase(phrases(), settings14.store.order, position.get());
        if (pick.index >= 0) position.set(pick.index);
        template = pick.text;
      };
      const paintGreeting = () => {
        const targets = findGreetings();
        swaps.prune();
        if (!targets.length) {
          shown2 = false;
          return;
        }
        if (!shown2 && (settings14.store.rotate === "visit" || !template)) next();
        shown2 = true;
        const list2 = phrases();
        const text = list2.length ? fill5(template || list2[0]) : "";
        const clickable = settings14.store.rotate === "click" && list2.length > 1;
        for (const el of targets) {
          const nodes = greetingNodes(el);
          if (!text) for (const node of nodes) swaps.restore(node);
          else nodes.forEach((node, i3) => swaps.set(node, i3 ? "" : text));
          if (clickable !== el.hasAttribute(CLICKABLE)) el.toggleAttribute(CLICKABLE, clickable);
        }
      };
      const paint = paintGreeting;
      let timer2 = null;
      const observer2 = new MutationObserver(() => timer2 ??= setTimeout(() => {
        timer2 = null;
        if (scope.alive) paint();
      }, 60));
      observer2.observe(document.documentElement, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ["aria-label"] });
      scope.defer(() => {
        observer2.disconnect();
        if (timer2) clearTimeout(timer2);
        swaps.restore();
        for (const el of document.querySelectorAll(`[${CLICKABLE}]`)) el.removeAttribute(CLICKABLE);
      });
      scope.listen(document, "click", (event) => {
        const target2 = event.target instanceof Element ? event.target : null;
        const home = target2?.closest("a[href]");
        if (home && ["/", "/new"].includes(home.getAttribute("href")) && ["/", "/new"].includes(location.pathname)) {
          shown2 = false;
          setTimeout(() => scope.alive && paint(), 120);
          return;
        }
        if (settings14.store.rotate !== "click" || phrases().length < 2) return;
        if (!target2 || !findGreetings().some((el) => el.contains(target2))) return;
        if (String(window.getSelection?.() ?? "").trim()) return;
        next();
        paint();
      });
      if (settings14.store.rotate === "timer") scope.interval(() => {
        if (!shown2) return;
        next();
        paint();
      }, settings14.store.intervalSec * 1e3);
      onRoute(scope, () => {
        shown2 = false;
      }, false);
      paint();
    }
  });

  // sites/claude/plugins/CustomGreeting/index.ts
  var CustomGreeting_default = toFramework(customGreeting_default);

  // src/plugins/customIdentity/index.ts
  var settings15 = definePluginSettings({
    displayName: {
      type: "string",
      label: { zh: "显示名", en: "Display name" },
      description: { zh: "留空保持官方名字。", en: "Empty keeps your real name." },
      placeholder: { zh: "留空保持官方名字", en: "Empty keeps your real name" },
      default: "",
      maxLength: 80
    },
    avatar: {
      type: "image",
      label: { zh: "头像", en: "Avatar" },
      description: { zh: "链接、粘贴、拖入或选择图片；拖动圆圈裁切。", en: "URL, paste, drop or choose; drag to crop." },
      default: "",
      size: 256
    },
    avatarSize: {
      type: "number",
      label: { zh: "侧栏头像大小", en: "Sidebar avatar size" },
      description: { zh: "官方 20px", en: "Official: 20px" },
      default: 24,
      min: 16,
      max: 48,
      unit: "px"
    },
    greeting: {
      type: "boolean",
      label: { zh: "首页问候语也用这个名字", en: "Use the name in the home greeting too" },
      default: true,
      visible: (v3) => !!String(v3.displayName ?? "").trim()
    },
    applyToMenu: {
      type: "boolean",
      label: { zh: "账号菜单里也替换", en: "Also replace in the account menu" },
      default: true
    }
  });
  var ME = "data-ccpp-me";
  function initials(name) {
    const words = name.trim().split(/\s+/).filter(Boolean);
    if (!words.length) return "";
    const first = (w4) => Array.from(w4)[0] ?? "";
    return (words.length > 1 ? first(words[0]) + first(words[words.length - 1]) : first(words[0])).toUpperCase();
  }
  var cssUrl = (url) => `url("${url.replace(/["\\\n\r]/g, (c4) => `\\${c4.charCodeAt(0).toString(16)} `)}")`;
  function avatarCss(url, menu) {
    if (!url) return "";
    const targets = [`${SEL.userMenuButton} ${SEL.avatar}`, `${SEL.avatar}[${ME}]`, ...menu ? [`${SEL.accountMenu} ${SEL.avatar}`] : []];
    const list2 = targets.join(",\n");
    return `${list2} { background: center / cover no-repeat ${cssUrl(url)} !important; border-radius: 9999px !important; color: transparent !important; }
${targets.map((t4) => `${t4} > *`).join(",\n")} { opacity: 0 !important; }`;
  }
  var SIZED = "data-ccpp-avatar-size";
  function sizeCss(px) {
    const button = `${SEL.userMenuButton}[${SIZED}]`;
    const size = `${px}px`;
    return `${button} ${SEL.avatar} { width: ${size} !important; height: ${size} !important; min-width: ${size} !important; min-height: ${size} !important; margin-block: calc((20px - ${size}) / 2) !important; font-size: calc(${size} * .45) !important; }
${button} :has(> ${SEL.avatar}) { width: max(var(--df-leading-slot, 28px), ${size}) !important; flex-shrink: 0 !important; }`;
  }
  function swapName(text, real, name, whole) {
    if (!real || !name || real === name) return text;
    if (whole) return text.trim() === real ? text.replace(real, name) : text;
    return text.includes(real) ? text.replaceAll(real, name) : text;
  }
  var customIdentity_default = definePlugin({
    name: "CustomIdentity",
    title: { zh: "自定义头像与用户名", en: "Custom avatar & name" },
    description: { zh: "替换侧栏和账号菜单里的头像与显示名，只改你看到的样子，不改账号资料。留空的项保持官方值。", en: "Replaces the avatar and display name in the sidebar and account menu, only on your screen; your account is unchanged. Empty fields keep the official values." },
    category: "appearance",
    tags: ["privacy"],
    icon: "user",
    enabledByDefault: false,
    updatedAt: "2026-10-22",
    dependencies: ["StylesApi", "DomApi"],
    settings: settings15,
    start(scope) {
      const swaps = new TextSwaps();
      const setCss = addStyle(scope, "", "custom-identity");
      let lastUrl = null;
      const setSizeCss = addStyle(scope, sizeCss(settings15.store.avatarSize), "custom-identity-size");
      const paint = () => {
        const { displayName: displayName2, avatar, applyToMenu, greeting } = settings15.store;
        const name = displayName2.trim();
        const url = avatar.trim();
        if (url !== lastUrl) {
          lastUrl = url;
          setCss(avatarCss(url, applyToMenu));
        }
        const real = realName();
        swaps.prune();
        for (const button of document.querySelectorAll(SEL.userMenuButton)) {
          const name2 = button.querySelector(".df-user-menu-trailing");
          const expanded = !!name2 && name2.offsetWidth > 0;
          if (expanded !== button.hasAttribute(SIZED)) button.toggleAttribute(SIZED, expanded);
        }
        const roots = identityRoots().filter((root2) => applyToMenu || !root2.matches(SEL.menu));
        for (const avatarEl of document.querySelectorAll(SEL.avatar)) {
          const inRoot = roots.some((root2) => root2.contains(avatarEl));
          const label = avatarEl.getAttribute(ORIG_LABEL) ?? avatarEl.getAttribute("aria-label") ?? "";
          const mine = !!real && label.trim() === real;
          if (mine && !inRoot) avatarEl.setAttribute(ME, "");
          else avatarEl.removeAttribute(ME);
          if ((inRoot || mine) && name) {
            if (!avatarEl.hasAttribute(ORIG_LABEL)) avatarEl.setAttribute(ORIG_LABEL, label);
            if (avatarEl.getAttribute("aria-label") !== name) avatarEl.setAttribute("aria-label", name);
            for (const node of textNodes(avatarEl)) {
              const text = swaps.original(node).trim();
              if (text && text.length <= 3) swaps.set(node, initials(name));
            }
          } else if (avatarEl.hasAttribute(ORIG_LABEL)) {
            avatarEl.setAttribute("aria-label", avatarEl.getAttribute(ORIG_LABEL));
            avatarEl.removeAttribute(ORIG_LABEL);
            for (const node of textNodes(avatarEl)) swaps.restore(node);
          }
        }
        const rename = (root2, whole) => {
          for (const node of textNodes(root2)) {
            if (node.parentElement?.closest(SEL.avatar)) continue;
            const original = swaps.original(node);
            const next = swapName(original, real, name, whole);
            if (next !== original) swaps.set(node, next);
            else swaps.restore(node);
          }
        };
        for (const root2 of roots) rename(root2, true);
        if (greeting) for (const el of document.querySelectorAll(SEL.greeting)) rename(el, false);
      };
      repaintOnChange(scope, paint);
      this.onSettingsChange = () => {
        lastUrl = null;
        setSizeCss(sizeCss(settings15.store.avatarSize));
        swaps.restore();
        for (const el of document.querySelectorAll(`[${ME}]`)) el.removeAttribute(ME);
        paint();
      };
      scope.defer(() => {
        swaps.restore();
        for (const el of document.querySelectorAll(`[${ORIG_LABEL}]`)) {
          el.setAttribute("aria-label", el.getAttribute(ORIG_LABEL));
          el.removeAttribute(ORIG_LABEL);
        }
        for (const el of document.querySelectorAll(`[${ME}]`)) el.removeAttribute(ME);
        for (const el of document.querySelectorAll(`[${SIZED}]`)) el.removeAttribute(SIZED);
      });
    }
  });

  // sites/claude/plugins/CustomIdentity/index.ts
  var CustomIdentity_default = toFramework(customIdentity_default);

  // sites/claude/plugins/DomApi/index.ts
  var DomApi_default = toFramework(dom_default);

  // src/lib/popover.ts
  var POPOVER_CSS = `
.panel { position: fixed; width: var(--w, 300px); max-height: min(70vh, 560px); overflow: auto; padding: 12px; border-radius: 14px; background: var(--bg); border: 1px solid var(--line); box-shadow: var(--shadow); pointer-events: auto; display: flex; flex-direction: column; gap: 10px; animation: pop .12s ease-out; }
@keyframes pop { from { opacity: 0; transform: translateY(4px); } }
.top { display: flex; align-items: center; gap: 6px; } .top b { flex: 1; font-size: 14px; }
/* A popover's header (and anything marked .sticky after it) stays put while its list scrolls. */
.panel > .top { position: sticky; top: -12px; z-index: 2; margin: -12px -12px 0; padding: 12px 12px 4px; background: var(--bg); }
.msg { color: var(--fg2); } .msg.bad { color: var(--bad); }
.item { display: flex; align-items: flex-start; gap: 8px; width: 100%; padding: 7px 8px; border: 0; border-radius: 8px; background: transparent; text-align: left; }
.item:hover, .item.active { background: var(--bg2); }
.item .grow { flex: 1; min-width: 0; } .item .sub { color: var(--fg3); font-size: 12px; }
.clip { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.clip2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.spin { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }
`;
  function successor(old) {
    const label = old.getAttribute("aria-label");
    const sel = old.tagName.toLowerCase() + [...old.classList].map((c4) => `.${CSS.escape(c4)}`).join("");
    return [...document.querySelectorAll(sel)].find((el) => el.getAttribute("aria-label") === label) ?? null;
  }
  function createPopover(scope, id, css2 = "", width = 300) {
    let sub = null;
    let panel = null;
    let anchor = null;
    let renderFn = null;
    const close = () => {
      sub?.dispose();
      sub = null;
      panel = null;
      anchor = null;
    };
    const draw2 = () => {
      if (!panel || !anchor || !renderFn) return;
      if (!anchor.isConnected) {
        const next = successor(anchor);
        if (!next) {
          const old = anchor;
          requestAnimationFrame(() => {
            if (anchor !== old) return;
            const late = successor(old);
            if (late) {
              anchor = late;
              draw2();
            } else close();
          });
          return;
        }
        anchor = next;
      }
      clear(panel);
      renderFn(panel, close);
      anchorPosition(anchor, panel);
    };
    const open = (from, render) => {
      if (panel && anchor === from) return close();
      close();
      sub = scope.child();
      const host4 = createHost(sub, id, POPOVER_CSS + css2);
      panel = h4("div", { class: "panel", role: "dialog", style: { "--w": `${width}px` } });
      panel.style.setProperty("--w", `${width}px`);
      host4.box.appendChild(panel);
      anchor = from;
      renderFn = render;
      draw2();
      sub.listen(document, "pointerdown", (event) => {
        const path = event.composedPath();
        if (!path.includes(host4.host) && !(anchor && path.includes(anchor))) close();
      }, { capture: true });
      sub.listen(window, "keydown", (event) => event.key === "Escape" && close());
      sub.listen(window, "resize", close);
    };
    scope.defer(close);
    return { open, close, update: draw2, isOpen: () => !!panel };
  }

  // src/plugins/exportChat/index.ts
  var settings16 = definePluginSettings({
    timestamps: { type: "boolean", label: { zh: "Markdown 里包含时间", en: "Include times in Markdown" }, default: true }
  });
  var L13 = {
    title: { zh: "导出对话", en: "Export chat" },
    md: { zh: "Markdown (.md)", en: "Markdown (.md)" },
    txt: { zh: "纯文本 (.txt)", en: "Plain text (.txt)" },
    json: { zh: "JSON (.json)", en: "JSON (.json)" },
    copy: { zh: "复制为 Markdown", en: "Copy as Markdown" },
    copied: { zh: "已复制到剪贴板", en: "Copied to the clipboard" },
    failed: { zh: "导出失败：{e}", en: "Export failed: {e}" },
    note: { zh: "导出当前显示的分支，内容来自 claude.ai 接口。", en: "Exports the branch on screen, read from claude.ai's API." }
  };
  var stamp = (at) => at ? fullDateText(at) : "";
  function toMarkdown(chat, timestamps) {
    const head = [`# ${chat.name || "Claude chat"}`, "", `- URL: https://claude.ai/chat/${chat.uuid}`, chat.model ? `- Model: ${chat.model}` : "", chat.createdAt ? `- Created: ${stamp(chat.createdAt)}` : ""].filter((line) => line !== "");
    const body = chat.messages.map((m3) => {
      const who = m3.role === "user" ? "## 🧑 You" : "## 🤖 Claude";
      return `${who}${timestamps && m3.createdAt ? ` · ${stamp(m3.createdAt)}` : ""}

${m3.text.trim()}`;
    });
    return `${head.join("\n")}

${body.join("\n\n---\n\n")}
`;
  }
  function toText(chat) {
    return `${chat.name}

${chat.messages.map((m3) => `[${m3.role === "user" ? "You" : "Claude"}]
${m3.text.trim()}`).join("\n\n")}
`;
  }
  var exportChat_default = definePlugin({
    name: "ExportChat",
    title: L13.title,
    description: { zh: "对话标题栏加一个导出按钮：下载 Markdown / 纯文本 / JSON，或复制为 Markdown。", en: "An export button in the chat header: download Markdown, text or JSON, or copy as Markdown." },
    category: "chats",
    icon: "download",
    enabledByDefault: true,
    dependencies: ["TranscriptApi", "SlotsApi", "NoticesApi", "RouterApi"],
    settings: settings16,
    start(scope) {
      const popover = createPopover(scope, "export", "", 240);
      const run = async (format) => {
        popover.close();
        try {
          const chat = await loadConversation(currentRoute().chatId, true);
          if (!chat) return;
          const name = fileSafe(chat.name || chat.uuid);
          if (format === "json") download(`${name}.json`, JSON.stringify(chat, null, 2), "application/json");
          else if (format === "txt") download(`${name}.txt`, toText(chat));
          else {
            const md = toMarkdown(chat, settings16.store.timestamps);
            if (format === "md") download(`${name}.md`, md, "text/markdown");
            else {
              await navigator.clipboard.writeText(md);
              toast(t3(L13.copied), { kind: "ok", timeoutMs: 2500 });
            }
          }
        } catch (error2) {
          toast(t3(L13.failed).replace("{e}", error2.message || String(error2)), { kind: "error" });
        }
      };
      addSlotItem(scope, "header", "export", () => {
        const btn = slotButton(t3(L13.title), (event) => popover.open(event.currentTarget, (panel) => {
          panel.appendChild(h4("div", { class: "top" }, icon("download", 16), h4("b", { text: t3(L13.title) })));
          for (const [format, label] of [["md", L13.md], ["txt", L13.txt], ["json", L13.json], ["copy", L13.copy]]) {
            const item = h4("button", { type: "button", class: "item", text: t3(label) });
            item.addEventListener("click", () => void run(format));
            panel.appendChild(item);
          }
          panel.appendChild(h4("div", { class: "msg", text: t3(L13.note), style: { fontSize: "12px" } }));
        }), icon("download", 16));
        btn.hidden = !currentRoute().chatId;
        return btn;
      }, 20);
    }
  });

  // sites/claude/plugins/ExportChat/index.ts
  var ExportChat_default = toFramework(exportChat_default);

  // src/plugins/hideIdentity/index.ts
  var settings17 = definePluginSettings({
    hideEmail: {
      type: "boolean",
      label: { zh: "隐藏邮箱", en: "Hide email" },
      default: true
    },
    hideName: {
      type: "boolean",
      label: { zh: "隐藏用户名", en: "Hide username" },
      default: false
    }
  });
  var HIDE = "data-ccpp-hide-identity";
  var EMAIL = /[^\s@<>()"',;:]+@[^\s@<>()"',;:]+\.[a-z]{2,}/i;
  var MENU_ROW = '[role="menuitem"], [role="menuitemcheckbox"], [role="menuitemradio"]';
  var isEmail = (text) => {
    const match = EMAIL.exec(text.trim());
    return !!match && match[0] === text.trim();
  };
  var stripEmail = (text) => text.replace(new RegExp(`\\s*[·•|–—-]?\\s*[(<]?${EMAIL.source}[)>]?`, "gi"), "").replace(/^\s*[·•|–—-]\s*/, "").trimEnd();
  function soleHolder(node, root2, text) {
    let el = node.parentElement;
    if (!el || !root2.contains(el)) return null;
    while (el.parentElement && el.parentElement !== root2 && !el.parentElement.matches(MENU_ROW) && el.parentElement.textContent?.trim() === text) el = el.parentElement;
    return el.matches(MENU_ROW) ? null : el;
  }
  var hideIdentity_default = definePlugin({
    name: "HideIdentity",
    title: { zh: "隐藏邮箱 / 用户名", en: "Hide email / username" },
    description: { zh: "隐藏头像弹出的账号菜单里的邮箱（也可隐藏用户名），截图、录屏时不露出账号。", en: "Hides the email (and optionally your name) in the account menu the avatar opens, so screenshots don't show your account." },
    category: "privacy",
    icon: "eyeOff",
    enabledByDefault: true,
    updatedAt: "2026-10-22",
    dependencies: ["StylesApi", "DomApi"],
    settings: settings17,
    start(scope) {
      const { hideEmail, hideName } = settings17.store;
      addStyle(scope, `[${HIDE}] { display: none !important; }`, "hide-identity");
      const swaps = new TextSwaps();
      const hidden = /* @__PURE__ */ new Set();
      const hide = (el) => {
        el.setAttribute(HIDE, "");
        hidden.add(el);
        const next = el.nextElementSibling;
        const first = ![...el.parentElement?.children ?? []].some((c4) => c4 !== el && c4.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING && !c4.hasAttribute(HIDE));
        if (first && next?.matches('[role="separator"]')) {
          next.setAttribute(HIDE, "");
          hidden.add(next);
        }
      };
      const paint = () => {
        swaps.prune();
        const shown2 = document.querySelector(`${SEL.userMenuButton} ${SEL.avatar}`)?.getAttribute("aria-label")?.trim();
        const names = new Set([realName(), shown2].filter((n2) => !!n2));
        for (const root2 of identityRoots()) {
          for (const node of textNodes(root2)) {
            const text = swaps.original(node).trim();
            if (!text) continue;
            if (hideEmail && EMAIL.test(text)) {
              const holder = isEmail(text) ? soleHolder(node, root2, node.data.trim()) : null;
              if (holder) {
                if (!holder.hasAttribute(HIDE)) hide(holder);
              } else {
                swaps.set(node, stripEmail(swaps.original(node)));
              }
              continue;
            }
            if (hideName && names.has(node.data.trim()) && !node.parentElement?.closest(SEL.avatar)) {
              const holder = soleHolder(node, root2, node.data.trim());
              if (holder && !holder.hasAttribute(HIDE)) hide(holder);
            }
          }
        }
      };
      repaintOnChange(scope, paint);
      scope.defer(() => {
        swaps.restore();
        for (const el of hidden) el.removeAttribute(HIDE);
        for (const el of document.querySelectorAll(`[${HIDE}]`)) el.removeAttribute(HIDE);
      });
    }
  });

  // sites/claude/plugins/HideIdentity/index.ts
  var HideIdentity_default = toFramework(hideIdentity_default);

  // sites/claude/plugins/HotkeysApi/index.ts
  var HotkeysApi_default = toFramework(hotkeys_default);

  // src/plugins/inputHistory/index.ts
  var MAX_DEFAULT = 100;
  var CAPTURE_DEDUPE_MS = 2e3;
  var APPLY_QUIET_MS = 300;
  var L14 = {
    title: { zh: "输入历史", en: "Input history" },
    sub: { zh: "保存在这台设备上。", en: "Stored on this device." },
    open: { zh: "浏览输入历史", en: "Browse input history" },
    openBtn: { zh: "打开", en: "Open" },
    empty: { zh: "还没有保存的提问。", en: "No stored prompts." },
    noMatch: { zh: "没有匹配的提问。", en: "No matches." },
    search: { zh: "搜索提问", en: "Search prompts" },
    stored: { zh: "已保存 {n} 条提问", en: "{n} stored prompts" },
    matches: { zh: "{n} 条匹配", en: "{n} matches" },
    clear: { zh: "清空历史", en: "Clear history" },
    clearBody: { zh: "删除这里保存的全部提问？无法撤销。", en: "Delete all stored prompts? This cannot be undone." },
    clearOk: { zh: "清空", en: "Clear" },
    use: { zh: "使用", en: "Use" },
    copy: { zh: "复制", en: "Copy" },
    remove: { zh: "删除", en: "Delete" },
    exit: { zh: "退出历史", en: "Exit history" },
    showAll: { zh: "查看输入历史（{n}）", en: "Show input history ({n})" }
  };
  var history2 = persisted("input-history", [], (v3) => Array.isArray(v3) && v3.every((x4) => typeof x4 === "string"));
  var settings18 = definePluginSettings({
    max: { type: "number", label: { zh: "最多保存几条", en: "Maximum stored prompts" }, default: MAX_DEFAULT, min: 10, max: 500, step: 10 },
    browse: { type: "action", label: L14.open, button: L14.openBtn, run: () => openHistory(false) },
    button: { type: "boolean", label: { zh: "在输入框旁显示历史按钮", en: "History button next to the model picker" }, default: false }
  });
  function remember(list2, text, max) {
    const clean = text.replace(/​/g, "").replace(/\r\n?/g, "\n").replace(/\s+$/, "");
    if (!clean.trim() || list2[0] === clean) return list2.slice(0, max);
    return [clean, ...list2].slice(0, max);
  }
  function caretAtEdge(editor, edge) {
    const selection = getSelection();
    if (!selection?.rangeCount || !selection.isCollapsed) return false;
    const range = selection.getRangeAt(0);
    if (!editor.contains(range.startContainer)) return false;
    const caret = range.getClientRects()[0] ?? range.startContainer.getBoundingClientRect?.();
    if (!caret || !caret.height && !caret.width) return true;
    const all = document.createRange();
    all.selectNodeContents(editor);
    const tops = [];
    for (const rect of all.getClientRects()) {
      if (rect.height < 1 && rect.width < 1) continue;
      if (!tops.some((top) => Math.abs(top - rect.top) < 4)) tops.push(rect.top);
    }
    if (tops.length < 2) return true;
    tops.sort((x4, y3) => x4 - y3);
    const line = tops.reduce((best, top, i3) => Math.abs(top - caret.top) < Math.abs(tops[best] - caret.top) ? i3 : best, 0);
    return edge === "start" ? line === 0 : line === tops.length - 1;
  }
  function placeCaret(editor, atStart) {
    editor.focus();
    const range = document.createRange();
    range.selectNodeContents(editor);
    range.collapse(atStart);
    const selection = getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
  }
  var HUD_CSS = `
.ccpp-ih-hud { position: fixed; z-index: 2147483646; display: flex; align-items: center; gap: 2px; padding: 4px 8px; border: 1px solid var(--cds-border-line, rgba(127,127,127,.25)); border-radius: 8px; background: var(--cds-surface-popover, #303030); color: var(--cds-text-secondary, #a3a3a3); font-size: 12px; font-variant-numeric: tabular-nums; line-height: 1.2; pointer-events: none; opacity: 0; transform: translate(-50%, -100%); transition: opacity .12s ease; }
.ccpp-ih-hud.on { opacity: 1; }
.ccpp-ih-hud.on button { pointer-events: auto; cursor: pointer; }
.ccpp-ih-hud button { margin: 0; padding: 0; border: 0; background: transparent; color: inherit; font: inherit; line-height: inherit; }
.ccpp-ih-hud .x { width: 14px; font-size: 14px; line-height: 1; }
.ccpp-ih-hud button:hover { color: var(--cds-text-primary, #fff); }
`;
  var LIST_CSS = `
.ih-meta { display: flex; align-items: center; gap: 8px; margin: 8px 0; }
.ih-count { flex: 1; min-width: 0; color: var(--fg3); font-size: var(--fs-sm); font-variant-numeric: tabular-nums; white-space: nowrap; }
.ih-list { display: flex; flex-direction: column; gap: 2px; }
.ih-item { display: flex; align-items: flex-start; gap: 8px; padding: 6px 4px 6px 8px; border-radius: var(--radius); }
.ih-item:hover, .ih-item.on { background: var(--bg2); }
.ih-item.live { box-shadow: inset 0 0 0 1px var(--field-ring); }
.ih-index { flex: none; min-width: 1.75rem; padding-top: 3px; color: var(--fg3); font-size: var(--fs-xs); font-variant-numeric: tabular-nums; text-align: right; }
.ih-main { flex: 1; min-width: 0; padding-top: 2px; cursor: pointer; white-space: pre-wrap; word-break: break-word; }
.ih-main.clamp { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.ih-actions { flex: none; display: flex; gap: 0; }
.ih-empty { margin: 12px 0; color: var(--fg3); }
`;
  var cursor = -1;
  var draft = "";
  var applying = 0;
  var hudEditor = null;
  var historyOpen = false;
  var hudEl = null;
  function resetBrowse() {
    cursor = -1;
    draft = "";
    hideHud();
  }
  function fill4(editor, text, atStart) {
    applying = Date.now();
    setText(text, editor);
    const place4 = () => editor.isConnected && placeCaret(editor, atStart);
    requestAnimationFrame(place4);
    setTimeout(place4, 90);
  }
  function hud() {
    if (hudEl?.isConnected) return hudEl;
    const count2 = h4("button", { type: "button", class: "count" });
    count2.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      openHistory(true);
    });
    const close = h4("button", { type: "button", class: "x", "aria-label": t3(L14.exit), text: "×" });
    close.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      cancelBrowse(hudEditor?.isConnected ? hudEditor : getEditor());
    });
    hudEl = h4("div", { class: "ccpp-ih-hud", role: "group", "aria-live": "polite", "aria-label": t3(L14.title) }, count2, close);
    document.body.appendChild(hudEl);
    return hudEl;
  }
  function hideHud() {
    hudEl?.classList.remove("on");
  }
  function showHud(editor) {
    const list2 = history2.get();
    if (historyOpen || cursor < 0 || cursor >= list2.length) return;
    hudEditor = editor;
    const el = hud();
    const label = `${list2.length - cursor} / ${list2.length}`;
    const count2 = el.querySelector(".count");
    count2.textContent = label;
    count2.setAttribute("aria-label", t3(L14.showAll).replace("{n}", label));
    const bar = composerBox(editor);
    const place4 = () => {
      if (historyOpen || !bar.isConnected || cursor < 0) return;
      const r3 = bar.getBoundingClientRect();
      el.style.left = `${r3.left + r3.width / 2}px`;
      el.style.top = `${r3.top - 8}px`;
      el.classList.add("on");
    };
    requestAnimationFrame(place4);
    setTimeout(place4, 120);
    setTimeout(place4, 300);
  }
  function composerBox(editor) {
    const marked = editor.closest(SEL.composer);
    if (marked) return marked;
    let box = editor;
    for (let el = editor.parentElement; el && el !== document.body; el = el.parentElement) {
      if (el.querySelectorAll(SEL.editor).length > 1) break;
      if (el.querySelector(SEL.sendButton)) {
        box = el;
        break;
      }
    }
    return box;
  }
  function cancelBrowse(editor) {
    const saved = draft;
    resetBrowse();
    if (editor?.isConnected) fill4(editor, saved, false);
  }
  function cycle(older, editor) {
    const list2 = history2.get();
    if (cursor < 0) draft = getText(editor);
    cursor += older ? 1 : -1;
    if (cursor < 0) {
      const saved = draft;
      resetBrowse();
      fill4(editor, saved, false);
      return;
    }
    fill4(editor, list2[cursor], older);
    showHud(editor);
  }
  function openHistory(picker) {
    historyOpen = true;
    hideHud();
    let query = "";
    let open = null;
    const body = h4("div");
    const search3 = h4("input", { class: "input", type: "search", placeholder: t3(L14.search), "aria-label": t3(L14.search) });
    search3.addEventListener("input", () => {
      query = search3.value;
      draw2();
    });
    const meta = h4("div");
    const top = h4("div", {}, h4("style", { text: LIST_CSS }), h4("p", { class: "d-desc", text: t3(L14.sub) }), search3, meta);
    const draw2 = () => {
      clear(meta);
      clear(body);
      const list2 = history2.get();
      const total = list2.length;
      const needle = query.trim().toLowerCase();
      const rows = list2.map((text, i3) => ({ text, i: i3, n: total - i3 })).filter((row) => !needle || row.text.toLowerCase().includes(needle));
      search3.hidden = !total;
      const wipe = h4("button", { type: "button", class: "btn", text: t3(L14.clear), disabled: !total });
      wipe.addEventListener("click", async () => {
        if (!await confirmDialog({ title: t3(L14.clear), body: t3(L14.clearBody), ok: L14.clearOk, danger: true })) return;
        history2.set([]);
        resetBrowse();
        query = "";
        search3.value = "";
        open = null;
        draw2();
      });
      meta.appendChild(h4("div", { class: "ih-meta" }, h4("span", { class: "ih-count", text: (needle ? t3(L14.matches) : t3(L14.stored)).replace("{n}", String(needle ? rows.length : total)) }), wipe));
      if (!total) return void body.appendChild(h4("p", { class: "ih-empty", text: t3(L14.empty) }));
      if (!rows.length) return void body.appendChild(h4("p", { class: "ih-empty", text: t3(L14.noMatch) }));
      const listEl = h4("div", { class: "ih-list" });
      for (const row of rows) {
        const expanded = open === row.i;
        const main2 = h4("div", { class: `ih-main${expanded ? "" : " clamp"}`, role: "button", tabindex: "0", text: row.text });
        const toggle = () => {
          open = expanded ? null : row.i;
          draw2();
        };
        main2.addEventListener("click", toggle);
        main2.addEventListener("keydown", (event) => {
          if (event.key !== "Enter" && event.key !== " ") return;
          event.preventDefault();
          toggle();
        });
        const action = (name, label, run) => {
          const button = h4("button", { type: "button", class: "icon-btn", "aria-label": t3(label), ...tipAttrs(t3(label)) }, icon(name, 16));
          button.addEventListener("click", run);
          return button;
        };
        const actions = h4("div", { class: "ih-actions" });
        if (picker) actions.appendChild(action("pencil", L14.use, () => {
          close();
          adopt(row.text, row.i);
        }));
        actions.appendChild(action("copy", L14.copy, () => void navigator.clipboard?.writeText(row.text).catch(() => {
        })));
        actions.appendChild(action("trash", L14.remove, () => {
          if (open === row.i) open = null;
          const next = history2.get().filter((_3, i3) => i3 !== row.i);
          history2.set(next);
          if (cursor >= next.length || cursor === row.i) resetBrowse();
          else if (cursor > row.i) cursor--;
          draw2();
        }));
        const live = picker && row.i === cursor;
        listEl.appendChild(h4("div", { class: `ih-item${expanded ? " on" : ""}${live ? " live" : ""}` }, h4("span", { class: "ih-index", text: String(row.n) }), main2, actions));
      }
      body.appendChild(listEl);
      listEl.querySelector(".live")?.scrollIntoView({ block: "nearest" });
    };
    const done = () => {
      historyOpen = false;
      if (cursor >= 0 && hudEditor?.isConnected) showHud(hudEditor);
    };
    const close = openModal(dialogFrame({ title: t3(L14.title), icon: "history", top: [top], body: [body], onClose: () => close() }), { onClose: done });
    draw2();
  }
  function adopt(text, index) {
    const editor = hudEditor?.isConnected ? hudEditor : getEditor();
    if (!editor) return;
    if (cursor < 0) draft = getText(editor);
    cursor = index;
    fill4(editor, text, false);
    historyOpen = false;
    showHud(editor);
  }
  var inputHistory_default = definePlugin({
    name: "InputHistory",
    title: { zh: "输入历史", en: "Input history" },
    description: {
      zh: "像终端一样用 ↑ / ↓ 调出之前发送过的提问，Esc 恢复草稿；浏览时输入框上方显示计数，点计数打开历史列表。",
      en: "Recall previous prompts with ↑ and ↓, like a shell. Esc restores your draft. Click the counter to browse history."
    },
    category: "composer",
    icon: "history",
    enabledByDefault: true,
    dependencies: ["ComposerApi", "SlotsApi", "StylesApi", "CCPPSettings"],
    settings: settings18,
    start(scope) {
      addStyle(scope, HUD_CSS, "input-history");
      resetBrowse();
      let lastSent = { text: "", at: 0 };
      onSubmit(scope, (text) => {
        const now2 = Date.now();
        if (text === lastSent.text && now2 - lastSent.at < CAPTURE_DEDUPE_MS) return;
        lastSent = { text, at: now2 };
        history2.reload();
        history2.set(remember(history2.get(), text, settings18.store.max));
        resetBrowse();
      });
      scope.listen(document, "input", (event) => {
        if (cursor < 0 || Date.now() - applying < APPLY_QUIET_MS) return;
        if (!event.target?.closest?.(SEL.editor)) return;
        resetBrowse();
      }, { capture: true });
      scope.listen(document, "keydown", (event) => {
        if (event.isComposing || event.keyCode === 229) return;
        if (event.key === "Escape" && !event.altKey && !event.shiftKey && !event.ctrlKey && !event.metaKey) {
          if (cursor < 0 || historyOpen) return;
          const editor2 = event.target?.closest?.(SEL.editor);
          cancelBrowse(editor2 ?? (hudEditor?.isConnected ? hudEditor : getEditor()));
          event.preventDefault();
          event.stopImmediatePropagation();
          return;
        }
        if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
        if (event.ctrlKey || event.metaKey || event.shiftKey || historyOpen) return;
        const editor = event.target?.closest?.(SEL.editor);
        if (!editor) return;
        const older = event.key === "ArrowUp";
        if (!event.altKey && !caretAtEdge(editor, older ? "start" : "end")) return;
        const list2 = history2.get();
        if (older ? cursor >= list2.length - 1 : cursor < 0) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        cycle(older, editor);
      }, { capture: true });
      onRoute(scope, () => resetBrowse(), false);
      scope.defer(() => {
        resetBrowse();
        hudEl?.remove();
        hudEl = null;
        hudEditor = null;
      });
      if (settings18.store.button) {
        const popover = createPopover(scope, "input-history", "", 360);
        addSlotItem(scope, "composer", "input-history", () => slotButton(t3(L14.title), (event) => popover.open(event.currentTarget, (panel, close) => {
          panel.appendChild(h4("div", { class: "top" }, icon("history", 16), h4("b", { text: t3(L14.title) })));
          const list2 = history2.get();
          if (!list2.length) panel.appendChild(h4("div", { class: "msg", text: t3(L14.empty) }));
          list2.slice(0, 50).forEach((text, i3) => {
            const item = h4("button", { type: "button", class: "item" }, h4("span", { class: "grow clip2", text: snippet(text, 200) }));
            item.addEventListener("click", () => {
              close();
              adopt(text, i3);
            });
            panel.appendChild(item);
          });
        }), icon("history", 16)), 20);
      }
    }
  });

  // sites/claude/plugins/InputHistory/index.ts
  var InputHistory_default = toFramework(inputHistory_default);

  // sites/claude/plugins/MenuApi/index.ts
  var MenuApi_default = toFramework(menu_default);

  // src/plugins/messageStars/store.ts
  var isStar = (v3) => v3 && typeof v3.key === "string" && Number.isInteger(v3.index) && (v3.role === "user" || v3.role === "assistant") && typeof v3.text === "string" && typeof v3.at === "number";
  function isBook(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) return false;
    return Object.values(value).every((chat) => chat && typeof chat.title === "string" && (chat.url === void 0 || typeof chat.url === "string") && Array.isArray(chat.stars) && chat.stars.every(isStar));
  }
  var book = persisted("message-stars", {}, isBook);
  var starsFor = (chatId) => chatId ? book.get()[chatId]?.stars ?? [] : [];
  function toggleStar(chatId, title, star, current6 = book.get(), url) {
    const chat = current6[chatId] ?? { title, stars: [] };
    const exists = chat.stars.some((s3) => s3.key === star.key);
    const stars = exists ? chat.stars.filter((s3) => s3.key !== star.key) : [...chat.stars, star].sort((a3, b3) => a3.index - b3.index);
    const next = { ...current6 };
    const href = url ?? chat.url;
    if (stars.length) next[chatId] = { title: title || chat.title, stars, ...href ? { url: href } : {} };
    else delete next[chatId];
    return { next, starred: !exists };
  }
  function reindex(current6, chatId, seen3) {
    const chat = current6[chatId];
    if (!chat?.stars.some((s3) => seen3.has(s3.key) && seen3.get(s3.key) !== s3.index)) return null;
    const stars = chat.stars.map((s3) => seen3.has(s3.key) ? { ...s3, index: seen3.get(s3.key) } : s3).sort((a3, b3) => a3.index - b3.index);
    return { ...current6, [chatId]: { ...chat, stars } };
  }
  function chatKeyFor(path, search3, inSidePane) {
    const chat = /^\/chat\/([0-9a-f-]{36})/i.exec(path);
    if (chat) return { key: chat[1].toLowerCase(), url: `/chat/${chat[1].toLowerCase()}` };
    const project = /^\/code\/project\/([\w-]+)/.exec(path);
    if (project) {
      const thread = new URLSearchParams(search3).get("thread");
      if (inSidePane && thread) return { key: `${project[1]}:${thread}`, url: `/code/project/${project[1]}?thread=${encodeURIComponent(thread)}` };
      return inSidePane ? null : { key: project[1], url: `/code/project/${project[1]}` };
    }
    const code = /^\/code\/([\w-]+)\/?$/.exec(path);
    if (code && code[1] !== "project") return { key: code[1], url: `/code/${code[1]}` };
    return null;
  }

  // src/plugins/messageStars/index.ts
  var settings19 = definePluginSettings({
    headerButton: { type: "boolean", label: { zh: "在对话标题栏显示收藏列表按钮", en: "Starred list button in the chat header" }, default: true }
  });
  var L15 = {
    star: { zh: "收藏这条消息", en: "Star this message" },
    unstar: { zh: "取消收藏", en: "Unstar" },
    list: { zh: "收藏的消息", en: "Starred messages" },
    none: { zh: "还没有收藏。悬停消息，点操作栏里的 ☆。", en: "Nothing starred yet. Hover a message and click ☆ in its action bar." },
    you: { zh: "你", en: "You" }
  };
  var CSS7 = `
.ccpp-star-btn:not(.ccpp-native) { display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 8px; border: 0; background: transparent; color: var(--cds-text-secondary, inherit); cursor: pointer; }
.ccpp-star-btn:not(.ccpp-native):hover { color: var(--cds-text-primary, inherit); background: var(--cds-fill-ghost-hover, rgba(127,127,127,.14)); }
/* Like void++: a starred message is marked only by its star, orange on a faint orange tint; the message itself is left alone. */
.ccpp-star-btn.on { color: ${STAR_COLOR}; background: color-mix(in srgb, ${STAR_COLOR} 14%, transparent); opacity: 1; }
.ccpp-star-btn.on:hover, .ccpp-star-btn.on:focus-visible { color: ${STAR_COLOR}; background: color-mix(in srgb, ${STAR_COLOR} 22%, transparent); }
`;
  var LIST_CSS2 = `.sec { font-size: 12px; color: var(--fg3); padding: 2px 8px; } .star { color: ${STAR_COLOR}; flex: none; }`;
  function rowInfo(row) {
    const index = Number(row.dataset.index);
    const message = row.querySelector(`${SEL.userMessage}, ${SEL.assistantMessage}`);
    if (!Number.isFinite(index) || !message) return null;
    const role = message.matches(SEL.userMessage) ? "user" : "assistant";
    const keyed = row.querySelector("[data-turn-key]");
    const entry = row.querySelector("[data-epitaxy-entry]")?.dataset.epitaxyEntry;
    const key = keyed?.dataset.turnKey ? `${keyed.dataset.turnKey}:${role}` : entry ? `${entry}:${role}` : `i${index}`;
    const body = role === "user" ? message.querySelector(SEL.userMessageBody) ?? message : message.querySelector(SEL.prose) ?? message;
    let text = body.innerText ?? "";
    for (const el of body.querySelectorAll('button, [role="button"], [role="status"]')) {
      const extra = el.innerText?.trim();
      if (extra) text = text.replace(extra, "");
    }
    return { index, role, key, text: snippet(text, 200) };
  }
  var SIDE_PANE = '[data-perf-region="side_pane"]';
  var keyOf = (el) => chatKeyFor(location.pathname, location.search, !!el?.closest(SIDE_PANE));
  var pageKeys = () => [keyOf(null), document.querySelector(SIDE_PANE) ? chatKeyFor(location.pathname, location.search, true) : null].filter((k4) => k4 !== null);
  var isPlaceholder = (button) => /^Show message actions/i.test(button.getAttribute("aria-label") ?? "") || button.getBoundingClientRect().width < 4;
  var SEL_COMPOSER = 'textarea, [contenteditable="true"], [role="textbox"], form';
  var nativeButtons = (el) => [...el.querySelectorAll("button:not(.ccpp-star-btn)")].filter((b3) => !isPlaceholder(b3));
  function starSpot(toolbar) {
    if (!nativeButtons(toolbar).length || toolbar.closest(SEL_COMPOSER) || toolbar.querySelector(SEL_COMPOSER)) return null;
    const hosts2 = [toolbar];
    for (let el = toolbar.nextElementSibling; el; el = el.nextElementSibling) {
      if (el.classList.contains("ccpp-star-btn")) continue;
      if (el.matches(SEL_COMPOSER) || el.querySelector(SEL_COMPOSER)) break;
      hosts2.push(el);
    }
    for (const host4 of hosts2.reverse()) {
      const native = nativeButtons(host4).pop() ?? (host4.matches("button:not(.ccpp-star-btn)") && !isPlaceholder(host4) ? host4 : void 0);
      if (!native) continue;
      if (host4 !== toolbar) return { native, after: host4 };
      let after = native;
      while (after.parentElement && after.parentElement !== toolbar) after = after.parentElement;
      return { native, after };
    }
    return null;
  }
  var messageStars_default = definePlugin({
    name: "MessageStars",
    title: { zh: "消息收藏", en: "Message stars" },
    description: {
      zh: "在消息操作栏加一个 ☆，收藏任意提问或回复；标题栏按钮列出本对话（及其它对话）的收藏，点击跳回原处。对话目录里收藏的刻度显示为橙色。",
      en: "Adds ☆ to message actions to star any prompt or reply; a header button lists this chat's (and other chats') stars and jumps back. Starred ticks are orange in the navigator."
    },
    category: "messages",
    icon: "star",
    enabledByDefault: true,
    dependencies: ["DomApi", "StylesApi", "SlotsApi", "TranscriptApi", "RouterApi", "ChatStateApi"],
    settings: settings19,
    start(scope) {
      addStyle(scope, CSS7, "stars");
      const isStarred = (row, key) => starsFor(keyOf(row)?.key ?? null).some((s3) => s3.key === key);
      const toggle = (row) => {
        const chat = keyOf(row);
        const info = rowInfo(row);
        if (!chat || !info) return;
        const { next } = toggleStar(chat.key, chatTitle(), { ...info, at: Date.now() }, book.get(), chat.url);
        book.set(next);
      };
      const paint = (track2 = false) => {
        const starred = /* @__PURE__ */ new Map();
        const seen3 = /* @__PURE__ */ new Map();
        for (const row of document.querySelectorAll(SEL.transcriptRow)) {
          const info = rowInfo(row);
          const chat = keyOf(row)?.key ?? "";
          if (!starred.has(chat)) starred.set(chat, new Set(starsFor(chat || null).map((s3) => s3.key)));
          const on3 = !!info && starred.get(chat).has(info.key);
          row.classList.toggle("ccpp-starred-row", on3);
          if (on3 && chat) {
            if (!seen3.has(chat)) seen3.set(chat, /* @__PURE__ */ new Map());
            seen3.get(chat).set(info.key, info.index);
          }
          for (const btn of row.querySelectorAll(".ccpp-star-btn")) {
            btn.classList.toggle("on", on3);
            btn.setAttribute("data-ccpp-tip", t3(on3 ? L15.unstar : L15.star));
            btn.setAttribute("aria-pressed", String(on3));
            btn.setAttribute("aria-label", t3(on3 ? L15.unstar : L15.star));
          }
        }
        setMarks("stars", starsFor(keyOf(null)?.key ?? null).map((s3) => s3.index));
        if (!track2) return;
        let next = book.get();
        for (const [chat, keys] of seen3) next = reindex(next, chat, keys) ?? next;
        if (next !== book.get()) book.set(next);
      };
      const makeButton = (row, extra = "", native) => {
        const info = rowInfo(row);
        const on3 = !!info && isStarred(row, info.key);
        const glyph3 = native?.querySelector('svg, [data-cds="Icon"]')?.getBoundingClientRect();
        const size = glyph3 && glyph3.width >= 12 && glyph3.width <= 24 ? Math.round(glyph3.width) : 15;
        const svg2 = icon("star", size);
        if (native) svg2.setAttribute("stroke-width", "1.5");
        const btn = h4("button", { type: "button", class: `ccpp-star-btn${extra}${on3 ? " on" : ""}`, ...tipAttrs(t3(on3 ? L15.unstar : L15.star)), "aria-label": t3(on3 ? L15.unstar : L15.star), "aria-pressed": String(on3) }, svg2);
        if (native) {
          btn.className = `${native.className} ccpp-star-btn ccpp-native${extra}${on3 ? " on" : ""}`;
          for (const attr of [...native.attributes]) if (attr.name.startsWith("data-cds") || attr.name === "data-size") btn.setAttribute(attr.name, attr.value);
        }
        return btn;
      };
      const starAt = (event) => event.composedPath().find((n2) => n2 instanceof HTMLElement && n2.classList.contains("ccpp-star-btn"));
      const press = (star) => {
        const row = star.closest(SEL.transcriptRow);
        if (row) toggle(row);
      };
      scope.listen(document, "pointerdown", (event) => {
        const star = event.button === 0 ? starAt(event) : void 0;
        if (!star) return;
        event.preventDefault();
        event.stopPropagation();
        press(star);
      }, { capture: true });
      for (const type of ["mousedown", "pointerup", "mouseup"]) {
        scope.listen(document, type, (event) => starAt(event) && (event.preventDefault(), event.stopPropagation()), { capture: true });
      }
      scope.listen(document, "click", (event) => {
        const star = starAt(event);
        if (!star) return;
        event.preventDefault();
        event.stopPropagation();
        if (event.detail === 0) press(star);
      }, { capture: true });
      let paintTimer = 0;
      const schedulePaint = () => {
        clearTimeout(paintTimer);
        paintTimer = window.setTimeout(() => paint(true), 300);
      };
      scope.defer(() => clearTimeout(paintTimer));
      watch(scope, SEL.transcriptRow, (row) => {
        schedulePaint();
        let btn = null;
        const attach = () => {
          if (!rowInfo(row)) return;
          const toolbar = row.querySelector(SEL.messageActions) ?? row.querySelector('[role="toolbar"]');
          const spot = toolbar ? starSpot(toolbar) : null;
          if (!spot) {
            btn?.remove();
            btn = null;
            return;
          }
          if (btn?.isConnected && btn.previousElementSibling === spot.after) return;
          btn ??= makeButton(row, "", spot.native);
          spot.after.after(btn);
        };
        attach();
        const observer2 = new MutationObserver(() => attach());
        observer2.observe(row, { childList: true, subtree: true });
        row.classList.toggle("ccpp-starred-row", (() => {
          const info = rowInfo(row);
          return !!info && isStarred(row, info.key);
        })());
        return () => {
          observer2.disconnect();
          btn?.remove();
          row.classList.remove("ccpp-starred-row");
        };
      });
      const list2 = createPopover(scope, "stars-list", LIST_CSS2, 340);
      let listFrom = null;
      const keysFor = (el) => {
        const key = el?.isConnected ? keyOf(el) : null;
        return key ? [key] : el?.isConnected ? [] : pageKeys().slice(0, 1);
      };
      let pending2 = 0;
      const jumpWhenLoaded = async (side, star) => {
        const mine = ++pending2;
        const pane = () => getScrollers().find((el) => !!el.closest(SIDE_PANE) === side) ?? null;
        const go = (scroller) => void jumpTo(star.index, { scroller, entry: star.key.replace(/:(user|assistant)$/, "") });
        const ready2 = pane();
        if (ready2 && getRows(ready2).length) return go(ready2);
        let count2 = 0;
        let steady = 0;
        let gaveUp = false;
        const giveUp = (e3) => {
          if (!(e3.target instanceof Element && e3.target.closest("#ccpp-stars-list"))) gaveUp = true;
        };
        const events2 = ["wheel", "touchstart", "pointerdown", "keydown"];
        for (const type of events2) document.addEventListener(type, giveUp, { passive: true, capture: true });
        try {
          for (let waited = 0; waited < 45e3 && mine === pending2 && !gaveUp; waited += 150) {
            await new Promise((r3) => setTimeout(r3, 150));
            const scroller = pane();
            const rows = scroller ? getRows(scroller).length : 0;
            steady = rows && rows === count2 ? steady + 150 : 0;
            count2 = rows;
            if (steady >= 450 && mine === pending2 && !gaveUp) return go(scroller);
          }
        } finally {
          for (const type of events2) document.removeEventListener(type, giveUp, { capture: true });
        }
      };
      scope.defer(() => void pending2++);
      const renderList = (panel, close) => {
        const stars = keysFor(listFrom).flatMap((k4) => starsFor(k4.key).map((star) => ({ star, side: k4.key.includes(":") })));
        panel.appendChild(h4("div", { class: "top" }, icon("star", 16), h4("b", { text: t3(L15.list) })));
        for (const { star, side } of stars) {
          const row = h4(
            "button",
            { type: "button", class: "item" },
            h4("span", { class: "star", text: "★" }),
            h4("span", { class: "grow" }, h4("div", { class: "clip2", text: star.text || "…" }), h4("div", { class: "sub", text: `${star.role === "user" ? t3(L15.you) : "Claude"} · #${star.index + 1} · ${agoText(star.at)}` }))
          );
          row.addEventListener("click", () => (close(), void jumpWhenLoaded(side, star)));
          panel.appendChild(row);
        }
        if (!stars.length) panel.appendChild(h4("div", { class: "msg", text: t3(L15.none) }));
      };
      const headerItems = [];
      if (settings19.store.headerButton) {
        const render = () => {
          const label = h4("span");
          const btn = slotButton(t3(L15.list), (event) => {
            listFrom = event.currentTarget;
            paint(true);
            list2.open(listFrom, renderList);
          }, icon("star", 16), label);
          const sync3 = () => {
            const keys = keysFor(btn.isConnected ? btn : null);
            const count2 = keys.reduce((n2, k4) => n2 + starsFor(k4.key).length, 0);
            label.textContent = count2 ? String(count2) : "";
            btn.classList.toggle("on", count2 > 0);
            btn.hidden = location.pathname.startsWith("/code") && !keys.length;
          };
          sync3();
          queueMicrotask(sync3);
          return btn;
        };
        headerItems.push(addSlotItem(scope, "header", "stars", render, 10), addSlotItem(scope, "codeHeader", "stars", render, 10));
      }
      scope.defer(book.subscribe(() => {
        paint();
        for (const item of headerItems) refreshSlotItem(item);
        list2.update();
      }));
      scope.defer(() => setMarks("stars", []));
      scope.on("route:search", () => {
        paint();
        for (const item of headerItems) refreshSlotItem(item);
        list2.close();
      });
      onRoute(scope, () => {
        paint();
        for (const item of headerItems) refreshSlotItem(item);
        list2.close();
      });
      paint();
    }
  });

  // sites/claude/plugins/MessageStars/index.ts
  var MessageStars_default = toFramework(messageStars_default);

  // src/plugins/messageTimestamps/index.ts
  var settings20 = definePluginSettings({
    always: { type: "boolean", label: { zh: "始终显示时间（不用悬停）", en: "Always show the time (no hover needed)" }, default: true },
    absolute: { type: "boolean", label: { zh: "显示具体时间而不是「x 分钟前」", en: "Show the exact time instead of “x minutes ago”" }, default: true },
    hideOwn: {
      type: "boolean",
      label: { zh: "隐藏你自己消息的时间", en: "Hide the time on your own messages" },
      description: { zh: "你的消息悬停时，操作栏最前面那个时间。", en: "The time at the start of the bar that shows when you hover your message." },
      default: false
    }
  });
  var REPLY_TIME = `${SEL.messageActions} ${SEL.messageTime}`;
  var OWN_TIME = `${SEL.userMessageActions} ${SEL.messageTime}`;
  var messageTimestamps_default = definePlugin({
    name: "MessageTimestamps",
    title: { zh: "消息时间", en: "Message timestamps" },
    description: {
      zh: "让回复操作栏里的时间始终可见；回复和你自己消息的时间都显示为具体时间（今天只显示时:分），悬停看完整日期。也可以隐藏你自己消息的时间。",
      en: "Keeps the time in the reply action bar visible; replies and your own messages show the exact time (just hh:mm today), full date on hover. The time on your own messages can be hidden."
    },
    category: "messages",
    icon: "clock",
    updatedAt: "2026-10-30",
    enabledByDefault: false,
    dependencies: ["DomApi", "StylesApi"],
    settings: settings20,
    start(scope) {
      const css2 = [
        settings20.store.always ? `${REPLY_TIME} { opacity: 1 !important; visibility: visible !important; }` : "",
        settings20.store.hideOwn ? `${OWN_TIME} { display: none !important; }` : ""
      ].join("\n");
      addStyle(scope, css2, "timestamps");
      if (!settings20.store.absolute) return;
      watch(scope, settings20.store.hideOwn ? REPLY_TIME : `${REPLY_TIME}, ${OWN_TIME}`, (el) => {
        const paint = () => {
          const at = Date.parse(el.getAttribute("datetime") ?? "");
          if (!Number.isFinite(at)) return;
          const text = dateTimeText(at);
          if (el.textContent !== text) el.textContent = text;
          el.setAttribute("data-ccpp-tip", fullDateText(at));
        };
        paint();
        const observer2 = new MutationObserver(paint);
        observer2.observe(el, { childList: true, characterData: true, subtree: true, attributes: true, attributeFilter: ["datetime"] });
        return () => observer2.disconnect();
      });
    }
  });

  // sites/claude/plugins/MessageTimestamps/index.ts
  var MessageTimestamps_default = toFramework(messageTimestamps_default);

  // sites/claude/plugins/NetworkApi/index.ts
  var NetworkApi_default = toFramework(network_default);

  // src/plugins/noDictation/index.ts
  var settings21 = definePluginSettings({
    dictation: { type: "boolean", label: { zh: "隐藏听写按钮", en: "Hide dictation" }, default: true },
    voice: { type: "boolean", label: { zh: "隐藏语音模式按钮", en: "Hide voice mode" }, default: true },
    readAloud: { type: "boolean", label: { zh: "隐藏回复下方的「朗读」按钮", en: "Hide Read aloud under replies" }, default: false }
  });
  var MARK = "data-ccpp-no-dictation";
  var MIC_GLYPH = "";
  var MIC_TEXT = /dictat|microphone|\bmic\b|voice|speech|hold to record|听写|语音|麦克风|录音/i;
  function buttonText(button) {
    const described = (button.getAttribute("aria-describedby") ?? "").split(/\s+/).filter(Boolean).map((id) => document.getElementById(id)?.textContent ?? "");
    const srOnly = [...button.querySelectorAll(".sr-only")].map((el) => el.textContent ?? "");
    return [button.getAttribute("aria-label"), button.getAttribute("title"), button.getAttribute("data-testid"), ...described, ...srOnly].filter(Boolean).join(" ");
  }
  function isMicButton(button) {
    if (button.matches(SEL.sendButton) || button.closest(SEL.editor)) return false;
    if (MIC_TEXT.test(buttonText(button))) return true;
    if ([...button.querySelectorAll('[data-cds="Icon"]')].some((icon2) => icon2.textContent?.trim() === MIC_GLYPH)) return true;
    return !!button.querySelector('svg.lucide-mic, svg[class*="lucide-mic"], svg[data-icon*="mic" i], svg[data-icon*="microphone" i]');
  }
  function composerButtons() {
    const out = /* @__PURE__ */ new Set();
    for (const editor of document.querySelectorAll(SEL.editor)) {
      let node = editor;
      for (let depth = 0; node && depth < 8; depth++, node = node.parentElement) {
        if (node === document.body) break;
        for (const b3 of node.querySelectorAll("button")) out.add(b3);
        if (node.querySelector(SEL.sendButton) && depth >= 3) break;
      }
    }
    return [...out];
  }
  function noDictationCss(dictation, voice, readAloud = false) {
    const selectors = [
      // The Claude Code mic is "Press and hold to record" (2026-11). The chevron next to the mic opens dictation settings ("Hold to record"); the Claude Code composer
      // is not a ChatComposer, so these labels are matched anywhere.
      ...dictation ? ['button[aria-label="Dictate"]', 'button[aria-label="Microphone"]', '[data-testid="chin-mic"]', 'button[aria-label="Dictation settings"]', 'button[aria-label^="Dictation" i]', 'button[aria-label*="dictat" i]', 'button[aria-label*="hold to record" i]'] : [],
      ...voice ? ['button[aria-label="Use voice mode"]', 'button[aria-label="Voice input"]', 'button[aria-label*="voice mode" i]'] : [],
      // Buttons the composer scan below recognised by their text or mic icon.
      ...dictation || voice ? [`[${MARK}]`] : [],
      ...readAloud ? ['[data-testid="action-bar-read-aloud"]', 'button[aria-label="Read aloud"]'] : []
    ];
    return selectors.length ? `${selectors.join(",\n")} { display: none !important; }` : "";
  }
  var noDictation_default = definePlugin({
    name: "NoDictation",
    title: { zh: "隐藏语音按钮", en: "No voice buttons" },
    description: { zh: "隐藏输入框里的听写 / 语音模式按钮、听写设置（按住录音）入口，以及回复下方的「朗读」按钮，普通对话和 Claude Code 都适用。", en: "Hides the dictation and voice-mode buttons, the dictation settings (hold to record) menu and Read aloud under replies, in chats and Claude Code." },
    category: "declutter",
    icon: "micOff",
    enabledByDefault: true,
    dependencies: ["StylesApi", "DomApi"],
    settings: settings21,
    start(scope) {
      const { dictation, voice, readAloud } = settings21.store;
      addStyle(scope, noDictationCss(dictation, voice, readAloud), "no-dictation");
      if (!dictation && !voice) return;
      onDomChange(scope, () => {
        for (const b3 of composerButtons()) if (!b3.hasAttribute(MARK) && isMicButton(b3)) b3.setAttribute(MARK, "");
      });
      scope.defer(() => document.querySelectorAll(`[${MARK}]`).forEach((el) => el.removeAttribute(MARK)));
    }
  });

  // sites/claude/plugins/NoDictation/index.ts
  var NoDictation_default = toFramework(noDictation_default);

  // src/plugins/noShareLink/index.ts
  var noShareLink_default = definePlugin({
    name: "NoShareLink",
    title: { zh: "隐藏分享按钮", en: "No share button" },
    description: { zh: "隐藏对话右上角的「分享」按钮，避免误点生成公开链接。", en: "Hides the Share button at the top right of chats so you never create a public link by accident." },
    category: "declutter",
    tags: ["privacy"],
    icon: "linkOff",
    enabledByDefault: true,
    dependencies: ["StylesApi"],
    start(scope) {
      addStyle(scope, `[data-testid="wiggle-controls-actions-share"] { display: none !important; }`, "no-share");
    }
  });

  // sites/claude/plugins/NoShareLink/index.ts
  var NoShareLink_default = toFramework(noShareLink_default);

  // src/plugins/noTelemetry/index.ts
  var logger10 = new Logger2("NoTelemetry");
  var HOSTS = /(^|\.)(sentry\.io|segment\.(io|com)|statsig(api)?\.(com|net)|featuregates\.org|intercom\.io|datadoghq\.(com|eu)|browser-intake-[a-z0-9-]+\.datadoghq\.(com|eu)|honeycomb\.io|googletagmanager\.com|google-analytics\.com)$/i;
  var PATHS = /^\/(api\/event_logging|api\/(v\d\/)?(track|telemetry|metrics)|sentry|_\/(rum|logs))\b/i;
  function isTelemetry(req) {
    if (HOSTS.test(req.url.hostname)) return true;
    return req.url.origin === location.origin && PATHS.test(req.url.pathname);
  }
  var noTelemetry_default = definePlugin({
    name: "NoTelemetry",
    title: { zh: "屏蔽遥测", en: "No telemetry" },
    description: { zh: "拦截发往分析 / 错误上报服务的请求（Sentry、Segment、Statsig、Datadog 等）。可能影响官方排障，默认关闭。", en: "Blocks requests to analytics and error-reporting services (Sentry, Segment, Statsig, Datadog…). Off by default." },
    category: "privacy",
    icon: "shield",
    enabledByDefault: false,
    restartNeeded: true,
    startAt: "document-start",
    dependencies: ["NetworkApi"],
    start(scope) {
      let blocked2 = 0;
      block(scope, (req) => {
        const hit = isTelemetry(req);
        if (hit && ++blocked2 % 50 === 1) logger10.debug(`Blocked ${blocked2} telemetry requests so far`);
        return hit;
      });
    }
  });

  // sites/claude/plugins/NoTelemetry/index.ts
  var NoTelemetry_default = toFramework(noTelemetry_default);

  // sites/claude/plugins/NoticesApi/index.ts
  var NoticesApi_default = toFramework(notices_default);

  // src/plugins/projectStatus/index.ts
  var logger11 = new Logger2("ProjectStatus");
  var settings22 = definePluginSettings({
    showCode: { type: "boolean", label: { zh: "也算上项目自身的 Code 会话", en: "Include the project's own Code session" }, description: { zh: "关闭后只看线程。", en: "Off counts threads only." }, default: true },
    showWaiting: { type: "boolean", label: { zh: "也标出「等你回复」的项目", en: "Also mark projects waiting on you" }, description: { zh: "有线程在等你时显示黄色圆点。", en: "A yellow dot when a thread is waiting for you." }, default: true },
    hideNative: {
      type: "boolean",
      label: { zh: "隐藏原生行尾圆点", en: "Hide claude.ai's row-end dot" },
      description: { zh: "当前打开的项目也只用图标角上的圆点，和其它项目一致。", en: "The open project then shows only the icon-corner dot, like the others." },
      default: true
    },
    refreshSec: { type: "number", label: { zh: "刷新间隔", en: "Refresh every" }, default: 30, min: 10, max: 300, step: 5, unit: "s" }
  });
  var OPEN_REFRESH_MS = 4e3;
  var L16 = {
    running: { zh: "运行中", en: "Running" },
    waiting: { zh: "等你回复", en: "Waiting for you" }
  };
  var PROJECT_ROW = '[data-group-list^="chan_"]';
  var ROW = "[data-row]";
  var ICON_HOLDER = ".df-leading-slot .relative, [data-leading-slot] .relative";
  var CSS8 = `
[data-ccpp-corner] { position: absolute; top: -1px; inset-inline-end: -2px; display: flex; pointer-events: none; }
[data-ccpp-corner] .status-dot { width: 6px; height: 6px; border-radius: 50%; display: block; }
[data-ccpp-corner] .status-dot[data-kind="clay"] { background-color: ${DOT_COLOR.clay}; animation: ccpp-breathe 3s ease-in-out infinite; }
[data-ccpp-corner] .status-dot[data-kind="awaiting"] { background-color: ${DOT_COLOR.awaiting}; }
@keyframes ccpp-breathe { 0%, 100% { transform: scale(.86); opacity: .75; } 50% { transform: scale(1); opacity: 1; } }
@media (prefers-reduced-motion: reduce) { [data-ccpp-corner] .status-dot { animation: none !important; } }
`;
  function openProjectOf(path) {
    return /^\/code\/project\/(chan_[A-Za-z0-9]+)/.exec(path)?.[1] ?? null;
  }
  var projectStatus_default = definePlugin({
    name: "ProjectStatus",
    title: { zh: "项目运行状态", en: "Project status dots" },
    description: {
      zh: "在每个项目图标的右上角画状态圆点（含当前打开的项目）：有线程或 Code 会话在跑就呼吸（橙色），有线程等你回复是黄色；当前项目发出消息就立刻亮起，并每几秒刷新。可隐藏 claude.ai 自己的行尾圆点。",
      en: "A status dot on every project's icon corner, the open one included: breathing orange while anything runs, yellow when a thread waits for you. The open project lights up as soon as you send and refreshes every few seconds. claude.ai's own row-end dot can be hidden."
    },
    category: "notifications",
    icon: "sparkles",
    enabledByDefault: true,
    updatedAt: "2026-10-24",
    dependencies: ["ClaudeApi", "ChatStateApi", "DomApi", "StylesApi", "RouterApi"],
    settings: settings22,
    start(scope) {
      addStyle(scope, CSS8, "project-status");
      if (settings22.store.hideNative) addStyle(scope, `${PROJECT_ROW} ${ROW} > [data-row-decoration]:has(> [role="status"]) { display: none !important; }`, "project-status-native");
      const activity = /* @__PURE__ */ new Map();
      const rows = /* @__PURE__ */ new Map();
      const sentUntil = /* @__PURE__ */ new Map();
      let busy2 = false;
      const paint = (id) => {
        for (const group of rows.get(id) ?? []) paintGroup(id, group);
      };
      const paintGroup = (id, group) => {
        const row = group.querySelector(ROW);
        if (!row) return;
        const info = activity.get(id);
        row.querySelector(":scope > [data-ccpp-status]")?.remove();
        const holder = row.querySelector(ICON_HOLDER);
        const nativeCorner = holder?.querySelector(".status-dot:not([data-ccpp-corner] *), [aria-hidden] > .status-dot:not([data-ccpp-corner] *)");
        const corner = holder && !nativeCorner ? shownKind(info, settings22.store.showWaiting, settings22.store.showCode, sentUntil.get(id)) : null;
        place4(row, "[data-ccpp-corner]", corner, "data-ccpp-corner", () => holder);
      };
      const place4 = (row, selector, kind, attr, parent) => {
        const existing = row.querySelector(selector);
        if (!kind) {
          existing?.remove();
          return;
        }
        if (existing?.querySelector(`.status-dot[data-kind="${kind}"]`)) return;
        existing?.remove();
        const target2 = parent();
        if (!target2) return;
        const label = t3(kind === "clay" ? L16.running : L16.waiting);
        target2.appendChild(h4("span", { [attr]: kind, ...tipAttrs(label) }, h4("span", { role: "status", "aria-label": label }, h4("span", { class: "status-dot", "data-kind": kind }))));
      };
      let pausedUntil = 0;
      const read2 = async (id) => {
        try {
          const result = await getProjectActivity(id, scope.signal);
          activity.set(result.channelId, result);
          if (projectKind(result, false, settings22.store.showCode) === "clay") sentUntil.delete(id);
          paint(id);
        } catch (error2) {
          if (error2 instanceof ApiError && error2.status === 429) {
            pausedUntil = Date.now() + 6e4;
            logger11.debug("Project reads rate-limited; pausing a minute.");
            return false;
          }
          logger11.debug("Project activity failed:", error2);
        }
        return true;
      };
      const poll = async () => {
        if (busy2 || document.hidden || !rows.size || Date.now() < pausedUntil) return;
        busy2 = true;
        try {
          for (const id of [...rows.keys()]) {
            if (!scope.alive || document.hidden) return;
            if (!await read2(id)) return;
            await new Promise((resolve) => setTimeout(resolve, 400));
          }
        } finally {
          busy2 = false;
        }
      };
      const pollOpen = () => {
        const id = openProjectOf(location.pathname);
        if (id && rows.has(id) && !document.hidden && Date.now() >= pausedUntil) void read2(id);
      };
      scope.interval(pollOpen, OPEN_REFRESH_MS);
      scope.on("send:ok", ({ channelId }) => {
        sentUntil.set(channelId, Date.now() + SEND_GRACE_MS);
        paint(channelId);
        for (const ms of [1500, 4e3, 8e3]) scope.timeout(() => rows.has(channelId) && Date.now() >= pausedUntil && void read2(channelId), ms);
        scope.timeout(() => paint(channelId), SEND_GRACE_MS + 50);
      });
      scope.on("send:failed", ({ channelId }) => {
        sentUntil.delete(channelId);
        paint(channelId);
      });
      let pollSoon;
      watch(scope, PROJECT_ROW, (group) => {
        const id = group.dataset.groupList;
        let groups = rows.get(id);
        if (!groups) rows.set(id, groups = /* @__PURE__ */ new Set());
        groups.add(group);
        paintGroup(id, group);
        clearTimeout(pollSoon);
        pollSoon = setTimeout(poll, 300);
        const observer2 = new MutationObserver(() => paintGroup(id, group));
        observer2.observe(group, { childList: true, subtree: true });
        return () => {
          observer2.disconnect();
          groups.delete(group);
          if (!groups.size && rows.get(id) === groups) rows.delete(id);
          group.querySelector("[data-ccpp-status]")?.remove();
          group.querySelector("[data-ccpp-corner]")?.remove();
        };
      });
      scope.defer(() => clearTimeout(pollSoon));
      scope.interval(poll, settings22.store.refreshSec * 1e3);
      onRoute(scope, () => {
        rows.forEach((_3, id) => paint(id));
        pollOpen();
      }, false);
      scope.listen(document, "visibilitychange", () => !document.hidden && poll());
    }
  });

  // sites/claude/plugins/ProjectStatus/index.ts
  var ProjectStatus_default = toFramework(projectStatus_default);

  // src/plugins/promptPresets/index.ts
  var settings23 = definePluginSettings({
    presets: {
      type: "text",
      label: { zh: "预设", en: "Presets" },
      description: { zh: "空行分隔，每段第一行是标题。", en: "Blank line between presets; first line is the title." },
      rows: 10,
      default: t3({
        zh: "翻译成中文\n把下面的内容翻译成自然流畅的中文：\n\n逐行解释代码\n逐行解释下面的代码，指出潜在问题：\n\n总结要点\n用 5 条以内的要点总结：",
        en: "Translate to English\nTranslate the following into natural, fluent English:\n\nExplain code line by line\nExplain the following code line by line and point out potential problems:\n\nSummarize\nSummarize in at most 5 bullet points:"
      })
    },
    mode: {
      type: "select",
      label: { zh: "点击预设时", en: "Clicking a preset" },
      default: "insert",
      options: [
        { value: "insert", label: { zh: "插入到光标处", en: "Inserts at the caret" } },
        { value: "replace", label: { zh: "替换输入框内容", en: "Replaces the input" } }
      ]
    }
  });
  var L17 = {
    title: { zh: "提示词预设", en: "Prompt presets" },
    empty: { zh: "还没有预设，在 CC++ 设置里添加。", en: "No presets yet; add some in CC++ settings." }
  };
  function parsePresets(source) {
    return source.split(/\n\s*\n/).map((block2) => block2.split("\n")).filter((lines) => lines[0]?.trim()).map(([title, ...rest]) => ({ title: title.trim(), body: (rest.join("\n").trim() || title.trim()).replace(/\\n/g, "\n") }));
  }
  var promptPresets_default = definePlugin({
    name: "PromptPresets",
    title: L17.title,
    description: { zh: "输入框旁的预设按钮，一键插入常用提示词。", en: "A button next to the model picker that inserts saved prompts." },
    category: "composer",
    icon: "fileText",
    enabledByDefault: false,
    dependencies: ["ComposerApi", "SlotsApi"],
    settings: settings23,
    start(scope) {
      const popover = createPopover(scope, "presets", "", 320);
      addSlotItem(scope, "composer", "presets", () => slotButton(t3(L17.title), (event) => popover.open(event.currentTarget, (panel, close) => {
        panel.appendChild(h4("div", { class: "top" }, icon("fileText", 16), h4("b", { text: t3(L17.title) })));
        const presets = parsePresets(settings23.store.presets);
        if (!presets.length) panel.appendChild(h4("div", { class: "msg", text: t3(L17.empty) }));
        for (const preset of presets) {
          const item = h4("button", { type: "button", class: "item" }, h4("span", { class: "grow" }, h4("div", { class: "clip", text: preset.title, style: { fontWeight: "600" } }), h4("div", { class: "sub clip", text: snippet(preset.body, 80) })));
          item.addEventListener("click", () => {
            close();
            const editor = getEditor();
            if (!editor) return;
            if (settings23.store.mode === "replace") setText(preset.body, editor);
            else insertText(preset.body, editor);
          });
          panel.appendChild(item);
        }
      }), icon("fileText", 16)), 30);
    }
  });

  // sites/claude/plugins/PromptPresets/index.ts
  var PromptPresets_default = toFramework(promptPresets_default);

  // src/plugins/_core/quickCss/index.ts
  var css = persisted("quick-css", "", (v3) => typeof v3 === "string");
  var settings24 = definePluginSettings({
    apply: { type: "boolean", label: { zh: "启用自定义 CSS", en: "Enable Quick CSS" }, description: { zh: "关掉后保留内容，但不再作用于页面。", en: "Off keeps your CSS but stops applying it." }, default: true }
  });
  var refresh = () => {
  };
  var L18 = {
    title: { zh: "自定义 CSS", en: "Quick CSS" },
    editor: { zh: "编辑器", en: "Editor" },
    hint: { zh: "实时应用到 claude.ai（停止输入 0.4 秒后生效）。Tab 键缩进。", en: "Applies to claude.ai live, 0.4 s after you stop typing. Tab indents." },
    placeholder: { zh: '/* 例如：让侧栏头像淡一点 */\n[data-testid="user-menu-button"] { opacity: .6; }', en: '/* e.g. dim the account button */\n[data-testid="user-menu-button"] { opacity: .6; }' }
  };
  var quickCss_default = definePlugin({
    name: "QuickCss",
    title: L18.title,
    description: { zh: "在设置里写自己的 CSS，实时作用于页面。", en: "Write your own CSS in settings and see it applied live." },
    category: "appearance",
    icon: "braces",
    enabledByDefault: true,
    dependencies: ["StylesApi", "CCPPSettings"],
    settings: settings24,
    start(scope) {
      const setCss = addStyle(scope, settings24.store.apply ? css.get() : "", "quick-css");
      refresh = () => setCss(settings24.store.apply ? css.get() : "");
      scope.defer(() => refresh = () => {
      });
      scope.defer(css.subscribe((value) => setCss(settings24.store.apply ? value : "")));
      registerTab(scope, {
        id: "quick-css",
        title: L18.title,
        icon: "braces",
        order: 20,
        render(container3) {
          const sw = h4("button", { type: "button", class: "switch", role: "switch", "aria-checked": String(settings24.store.apply), "aria-label": t3(settings24.def.apply.label) });
          sw.addEventListener("click", () => {
            settings24.store.apply = !settings24.store.apply;
            sw.setAttribute("aria-checked", String(settings24.store.apply));
            setCss(settings24.store.apply ? css.get() : "");
          });
          const area = h4("textarea", { class: "input editor", rows: 22, spellcheck: false, placeholder: t3(L18.placeholder), "aria-label": t3(L18.editor) });
          area.value = css.get();
          let timer2;
          area.addEventListener("input", () => {
            clearTimeout(timer2);
            timer2 = setTimeout(() => css.set(area.value), 400);
          });
          area.addEventListener("keydown", (event) => {
            if (event.key !== "Tab") return;
            event.preventDefault();
            area.setRangeText("  ", area.selectionStart, area.selectionEnd, "end");
          });
          container3.append(
            h4("div", { class: "rows" }, h4("div", { class: "row" }, h4("div", { class: "row-text" }, h4("div", { class: "row-title", text: t3(settings24.def.apply.label) }), h4("div", { class: "row-desc", text: t3(settings24.def.apply.description) })), h4("div", { class: "row-control" }, sw))),
            h4("div", { class: "section-head", style: { marginTop: "12px" } }, h4("h3", { text: t3(L18.editor) })),
            h4("p", { class: "hint", text: t3(L18.hint) }),
            area
          );
        }
      });
    },
    // The switch and editor update the style in place; no restart needed.
    onSettingsChange() {
      refresh();
    }
  });

  // sites/claude/plugins/QuickCss/index.ts
  var QuickCss_default = toFramework(quickCss_default);

  // src/plugins/recentChats/index.ts
  var settings25 = definePluginSettings({
    hotkey: { type: "string", label: { zh: "快捷键", en: "Shortcut" }, default: "ctrl+`" },
    count: { type: "number", label: { zh: "显示几个最近对话", en: "Chats to show" }, default: 9, min: 3, max: 24 }
  });
  var L19 = {
    title: { zh: "最近打开的对话", en: "Recently opened chats" },
    empty: { zh: "还没有记录。打开过的对话会出现在这里。", en: "Nothing yet. Chats you open show up here." },
    hint: { zh: "按住 {mod} 连按 {key} 往后选 · 加 Shift 往回 · 松开打开 · Esc 取消", en: "Hold {mod}, press {key} to move · Shift goes back · Release to open · Esc to cancel" },
    hintPlain: { zh: "再按 {key} 或方向键选择 · Enter 打开 · 1–9 直达 · Esc 关闭", en: "{key} or arrows to pick · Enter to open · 1–9 to jump · Esc to close" }
  };
  var SHOW_DELAY_MS = 180;
  function heldModifiers(event, combo) {
    if (!combo.ctrl && !combo.alt && !combo.meta) return false;
    return (!combo.ctrl || event.ctrlKey) && (!combo.alt || event.altKey) && (!combo.meta || event.metaKey);
  }
  var visits = persisted(
    "recent-chats",
    [],
    (v3) => Array.isArray(v3) && v3.every((x4) => x4 && typeof x4.id === "string" && typeof x4.title === "string" && typeof x4.at === "number" && (x4.url === void 0 || typeof x4.url === "string") && (x4.project === void 0 || typeof x4.project === "string"))
  );
  var visitUrl = (visit) => visit.url ?? `/chat/${visit.id}`;
  function pageVisit(path, search3) {
    const chat = /^\/chat\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i.exec(path);
    if (chat) {
      const id = chat[1].toLowerCase();
      return { id, url: `/chat/${id}` };
    }
    const project = /^\/code\/project\/([\w-]+)/.exec(path);
    if (project) {
      const thread = new URLSearchParams(search3).get("thread");
      if (thread) return { id: `${project[1]}:${thread}`, url: `/code/project/${project[1]}?thread=${encodeURIComponent(thread)}` };
      return { id: project[1], url: `/code/project/${project[1]}` };
    }
    const code = /^\/code\/([\w-]+)\/?$/.exec(path);
    if (code && !["project", "projects", "new", "settings"].includes(code[1])) return { id: code[1], url: `/code/${code[1]}` };
    return null;
  }
  var currentVisit = () => pageVisit(location.pathname, location.search);
  var icons = persisted("recent-chats-icons-v2", {}, (v3) => !!v3 && typeof v3 === "object" && !Array.isArray(v3) && Object.values(v3).every((x4) => typeof x4 === "string"));
  var projectOf = (visit) => /^chan_[A-Za-z0-9]+/.exec(visit.id)?.[0] ?? null;
  var ICON_TAGS = /* @__PURE__ */ new Set(["span", "div", "img", "svg", "g", "path", "circle", "rect", "ellipse", "line", "polyline", "polygon", "defs", "lineargradient", "radialgradient", "stop", "clippath", "mask", "use", "symbol", "text", "tspan"]);
  var ICON_STYLE = ["color", "background-color", "background-image", "background-size", "background-position", "width", "height", "min-width", "border-radius", "display", "align-items", "justify-content", "font-family", "font-size", "font-weight", "font-style", "font-feature-settings", "font-variation-settings", "letter-spacing", "-webkit-font-smoothing", "text-align", "line-height", "fill", "stroke", "stroke-width", "opacity", "object-fit", "padding", "box-sizing"];
  function cleanIcon(root2) {
    for (const el of [root2, ...root2.querySelectorAll("*")]) {
      if (!ICON_TAGS.has(el.tagName.toLowerCase())) {
        el.remove();
        continue;
      }
      for (const attr of [...el.attributes]) {
        const name = attr.name.toLowerCase();
        const unsafe = name.startsWith("on") || /^\s*(javascript|data:text)/i.test(attr.value) || (name === "href" || name === "xlink:href") && !attr.value.startsWith("#");
        if (unsafe || name === "class" || name === "id" || name.startsWith("data-") || name.startsWith("aria-") || name === "tabindex" || name === "role") el.removeAttribute(attr.name);
      }
      if (el.tagName.toLowerCase() === "img" && !/^(https:|data:image\/)/.test(el.getAttribute("src") ?? "")) el.removeAttribute("src");
    }
    return root2;
  }
  function snapshotIcon(channel) {
    const rows = [...document.querySelectorAll(`[data-group-list="${channel}"]`)];
    const row = rows.find((r3) => r3.offsetParent) ?? rows[0];
    const slot = row?.querySelector("[data-row] .df-leading-slot, [data-row] [data-leading-slot]");
    const source = [...slot?.children ?? []].find((el) => !el.matches("[data-ccpp-corner]"));
    if (!source || !source.getBoundingClientRect().width) return null;
    const copy = source.cloneNode(true);
    copy.querySelectorAll("[data-ccpp-corner], .status-dot, [role=status]").forEach((el) => el.remove());
    const originals = [source, ...source.querySelectorAll("*")];
    const copies = [copy, ...copy.querySelectorAll("*")];
    copies.forEach((el, i3) => {
      const original = originals[i3];
      if (!original || original.tagName !== el.tagName) return;
      const style = getComputedStyle(original);
      const inline = ICON_STYLE.map((name) => `${name}:${style.getPropertyValue(name)}`).join(";");
      el.setAttribute("style", `${inline};position:static;margin:0;flex:none`);
    });
    const html = cleanIcon(copy).outerHTML;
    return html.length < 8e3 ? html : null;
  }
  function iconNode(html) {
    const doc = new DOMParser().parseFromString(`<div>${html}</div>`, "text/html");
    const root2 = doc.body.firstElementChild?.firstElementChild;
    if (!root2) return null;
    return document.importNode(cleanIcon(root2), true);
  }
  var THREAD_TITLE = '[data-perf-region="side_pane"] [data-top-right] [data-cds="OverflowTooltip"]';
  var textOf = (selector) => document.querySelector(selector)?.textContent?.replace(/\s+/g, " ").trim() ?? "";
  function pageTitle(id) {
    const thread = id.split(":")[1];
    if (!thread) return chatTitle();
    return textOf(THREAD_TITLE) || linkTitle(thread);
  }
  function linkTitle(thread) {
    const link = [...document.querySelectorAll('a[href*="thread="]')].find((a3) => new URLSearchParams(a3.search).get("thread") === thread);
    return link?.textContent?.replace(/\s+/g, " ").trim() ?? "";
  }
  function cardLabel(visit) {
    if (visit.project && visit.id.includes(":")) return visit.project;
    return visitUrl(visit).startsWith("/code/") ? "Claude Code" : "";
  }
  function recordVisit(list2, visit, max = 50) {
    const previous2 = list2.find((v3) => v3.id === visit.id);
    const title = visit.title || previous2?.title || "";
    return [{ ...visit, title }, ...list2.filter((v3) => v3.id !== visit.id)].slice(0, max);
  }
  function renameVisit(list2, id, title) {
    if (!title) return list2;
    const index = list2.findIndex((v3) => v3.id === id);
    if (index < 0 || list2[index].title === title) return list2;
    const next = [...list2];
    next[index] = { ...next[index], title };
    return next;
  }
  var CSS9 = `
.overlay { position: fixed; inset: 0; display: grid; place-items: center; background: var(--cds-backdrop, rgba(0,0,0,.5)); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); pointer-events: auto; animation: in .12s ease-out; }
@keyframes in { from { opacity: 0; } }
.box { width: min(860px, calc(100vw - 32px)); padding: 16px; border-radius: 18px; background: color-mix(in srgb, var(--bg) 88%, transparent); border: 1px solid var(--line); box-shadow: var(--shadow); }
.box h3 { margin: 0 0 12px; font-size: 14px; display: flex; justify-content: space-between; } .box h3 span { font-weight: 400; color: var(--fg3); font-size: 12px; }
.cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 10px; }
.card { position: relative; display: flex; flex-direction: column; gap: 6px; min-height: 76px; padding: 12px; border-radius: 12px; border: 1px solid var(--line); background: var(--bg2); text-align: left; }
.card:hover, .card.sel { border-color: var(--accent); background: var(--bg); }
.card .n { position: absolute; top: 8px; right: 10px; font-size: 11px; color: var(--fg3); }
.card .s .l { display: flex; align-items: center; gap: 6px; min-width: 0; }
.card .s .l > span:last-child { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.card .ic { flex: none; display: grid; place-items: center; width: 16px; height: 16px; overflow: hidden; }
.card .ic > * { zoom: .67; }
.card .t { font-weight: 600; padding-right: 16px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.card .s { display: flex; justify-content: space-between; gap: 8px; color: var(--fg3); font-size: 12px; margin-top: auto; }
.card .s .a { flex: none; margin-left: auto; }
.card.cur .s .a::before { content: "● "; color: var(--accent); }
.empty { padding: 24px; text-align: center; color: var(--fg3); }
`;
  var recentChats_default = definePlugin({
    name: "RecentChats",
    title: { zh: "最近对话切换", en: "Recent chats switcher" },
    description: {
      zh: "像 Arc 的标签切换器：按住 Ctrl 连按 ` 在最近打开过的对话（包括 Claude Code 项目、线程和会话）间往后选，加 Shift 往回，松开打开；快速按一下直接回到上一个对话。",
      en: "Like Arc's tab switcher: hold Ctrl and press ` to step through recently opened chats (Claude Code projects, threads and sessions included), Shift to go back, release to open. A quick tap jumps back to the previous chat."
    },
    category: "navigation",
    icon: "grid",
    enabledByDefault: true,
    updatedAt: "2026-11-08",
    dependencies: ["RouterApi", "HotkeysApi", "ChatStateApi"],
    settings: settings25,
    start(scope) {
      let settledAt = 0;
      const record = () => {
        const page2 = currentVisit();
        if (!page2) return;
        const thread = page2.id.split(":")[1];
        settledAt = Date.now() + 1500;
        visits.set(recordVisit(visits.get(), { ...page2, title: thread ? linkTitle(thread) : "", at: Date.now(), ...thread ? { project: chatTitle() } : {} }));
        scope.timeout(() => {
          if (currentVisit()?.id !== page2.id) return;
          const channel = projectOf(page2);
          const icon2 = channel && snapshotIcon(channel);
          if (channel && icon2 && icons.get()[channel] !== icon2) icons.set({ ...icons.get(), [channel]: icon2 });
          refreshTitles();
        }, 1500);
      };
      const refreshTitles = () => {
        const here = currentVisit()?.id;
        let list2 = visits.get();
        for (const visit of list2) {
          const thread = visit.id.split(":")[1];
          if (visit.id === here) {
            if (Date.now() >= settledAt) list2 = renameVisit(list2, visit.id, pageTitle(visit.id));
          } else if (thread) list2 = renameVisit(list2, visit.id, linkTitle(thread));
        }
        if (list2 !== visits.get()) visits.set(list2);
      };
      onRoute(scope, record);
      scope.on("route:search", record);
      scope.interval(refreshTitles, 2e3);
      const { box } = createHost(scope, "recent-chats", CSS9, { layer: "page" });
      let selected = 0;
      let open = false;
      const close = () => {
        clearTimeout(showTimer2);
        open = false;
        holding = false;
        clear(box);
      };
      const go = (visit) => {
        close();
        if (!visit || visit.id === currentVisit()?.id) return;
        const url = visitUrl(visit);
        const link = [...document.querySelectorAll("a[href]")].find((a3) => a3.getAttribute("href") === url);
        if (link) link.click();
        else location.assign(url);
      };
      const cardIcon = (visit) => {
        const channel = projectOf(visit);
        const html = channel && icons.get()[channel];
        const node = html ? iconNode(html) : null;
        return node ? h4("span", { class: "ic" }, node) : null;
      };
      const hintText = () => {
        const keys = comboKeys(settings25.store.hotkey.trim() || "ctrl+`");
        const key = keys[keys.length - 1];
        const mod = keys.slice(0, -1).filter((k4) => k4 !== "⇧" && k4 !== "Shift").join(isMac() ? "" : "+");
        return (mod ? t3(L19.hint) : t3(L19.hintPlain)).replace("{mod}", mod).replace("{key}", key);
      };
      const render = () => {
        clear(box);
        const list2 = visits.get().slice(0, settings25.store.count);
        const here = currentVisit()?.id;
        const cards = h4("div", { class: "cards" });
        list2.forEach((visit, i3) => {
          const card2 = h4(
            "button",
            { type: "button", class: `card${i3 === selected ? " sel" : ""}${visit.id === here ? " cur" : ""}` },
            i3 < 9 ? h4("span", { class: "n", text: String(i3 + 1) }) : null,
            h4("span", { class: "t", text: visit.title || visit.id.slice(0, 8) }),
            h4("span", { class: "s" }, h4("span", { class: "l" }, cardIcon(visit), h4("span", { text: cardLabel(visit) })), h4("span", { class: "a", text: agoText(visit.at) }))
          );
          card2.addEventListener("click", () => go(visit));
          cards.appendChild(card2);
        });
        const overlay = h4(
          "div",
          { class: "overlay", role: "dialog", "aria-label": t3(L19.title) },
          h4("div", { class: "box" }, h4("h3", {}, t3(L19.title), h4("span", { text: hintText() })), list2.length ? cards : h4("div", { class: "empty", text: t3(L19.empty) }))
        );
        overlay.addEventListener("mousedown", (event) => event.target === overlay && close());
        box.appendChild(overlay);
      };
      const refreshIcons = () => {
        const known2 = icons.get();
        const fresh = { ...known2 };
        for (const channel of new Set(visits.get().slice(0, settings25.store.count).map(projectOf))) {
          const icon2 = channel && snapshotIcon(channel);
          if (channel && icon2) fresh[channel] = icon2;
        }
        if (Object.keys(fresh).some((k4) => fresh[k4] !== known2[k4])) icons.set(fresh);
      };
      let holding = false;
      let showTimer2 = 0;
      const show = () => {
        clearTimeout(showTimer2);
        if (!open) return;
        render();
      };
      const begin = (event, combo) => {
        open = true;
        refreshIcons();
        refreshTitles();
        selected = visits.get()[0]?.id === currentVisit()?.id ? 1 : 0;
        holding = heldModifiers(event, combo);
        if (holding) showTimer2 = window.setTimeout(show, SHOW_DELAY_MS);
        else show();
      };
      const step2 = (by) => {
        const count2 = Math.min(visits.get().length, settings25.store.count);
        selected = (selected + by + count2) % Math.max(1, count2);
        show();
      };
      scope.defer(() => clearTimeout(showTimer2));
      scope.listen(window, "keydown", (event) => {
        const spec = settings25.store.hotkey.trim();
        const combo = spec ? parseCombo(spec) : null;
        if (combo && !event.isComposing && matches(event, combo.shift ? combo : { ...combo, shift: event.shiftKey })) {
          event.preventDefault();
          event.stopPropagation();
          if (event.repeat && !open) return;
          if (!open) begin(event, combo);
          else step2(event.shiftKey && !combo.shift ? -1 : 1);
          return;
        }
        if (!open) return;
        const list2 = visits.get().slice(0, settings25.store.count);
        const cols = Math.max(1, Math.floor((box.querySelector(".cards")?.clientWidth ?? 720) / 250));
        const moves = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: cols, ArrowUp: -cols, Tab: event.shiftKey ? -1 : 1 };
        if (event.key in moves) step2(moves[event.key]);
        else if (event.key === "Enter") go(list2[selected]);
        else if (event.key === "Escape") close();
        else if (/^[1-9]$/.test(event.key)) go(list2[Number(event.key) - 1]);
        else return;
        event.preventDefault();
        event.stopPropagation();
      }, { capture: true });
      scope.listen(window, "keyup", (event) => {
        if (!open || !holding) return;
        const combo = parseCombo(settings25.store.hotkey.trim());
        if (heldModifiers(event, combo)) return;
        holding = false;
        go(visits.get().slice(0, settings25.store.count)[selected]);
      }, { capture: true });
      scope.listen(window, "blur", () => {
        if (!open || !holding) return;
        holding = false;
        show();
      });
    }
  });

  // sites/claude/plugins/RecentChats/index.ts
  var RecentChats_default = toFramework(recentChats_default);

  // src/plugins/replyNotification/index.ts
  var settings26 = definePluginSettings({
    when: {
      type: "select",
      label: { zh: "什么时候提醒", en: "Notify when" },
      default: "hidden",
      options: [
        { value: "hidden", label: { zh: "标签页不在前台时", en: "The tab is in the background" } },
        { value: "always", label: { zh: "每次回复完成", en: "Every reply finishes" } }
      ]
    },
    minSeconds: { type: "number", label: { zh: "回复至少持续多久才提醒", en: "Only replies longer than" }, default: 5, min: 0, max: 120, unit: "s" },
    sound: { type: "boolean", label: { zh: "提示音", en: "Sound" }, default: true },
    volume: { type: "number", label: { zh: "音量", en: "Volume" }, default: 40, min: 5, max: 100, step: 5, unit: "%", visible: (v3) => v3.sound === true },
    soundUrl: {
      type: "string",
      label: { zh: "自定义提示音", en: "Custom sound" },
      description: { zh: "音频文件的 https 链接（mp3 / ogg / wav），留空用内置提示音；读不到时也退回内置提示音。", en: "An https link to an audio file (mp3 / ogg / wav); empty uses the built-in chime, which also plays when the link can't be loaded." },
      placeholder: { zh: "https://…/ding.mp3", en: "https://…/ding.mp3" },
      default: "",
      visible: (v3) => v3.sound === true
    },
    listen: { type: "action", label: { zh: "试听提示音", en: "Preview the sound" }, button: { zh: "播放", en: "Play" }, visible: (v3) => v3.sound === true, run: () => void playSound(settings26.store.volume) },
    desktop: { type: "boolean", label: { zh: "系统通知", en: "Desktop notification" }, default: true },
    toast: { type: "boolean", label: { zh: "页面内提示条", en: "In-page toast" }, default: true },
    others: {
      type: "boolean",
      label: { zh: "其它对话完成也提醒", en: "Also for other chats" },
      description: { zh: "侧栏里正在回复的对话完成时弹提示条，点击打开。", en: "A toast when a chat replying in the sidebar finishes; click to open it." },
      default: true
    },
    preview: { type: "boolean", label: { zh: "提示条显示回复开头", en: "Preview the reply" }, default: true },
    keep: { type: "boolean", label: { zh: "提示条保持到手动关闭", en: "Keep toasts until dismissed" }, description: { zh: "点 × 或打开该对话才关闭。", en: "Close with × or by opening the chat." }, default: false },
    toastSec: { type: "number", label: { zh: "提示条停留", en: "Toast stays for" }, default: 6, min: 2, max: 30, unit: "s", visible: (v3) => !v3.keep },
    test: { type: "action", label: { zh: "试一下", en: "Try it" }, button: { zh: "发送测试提醒", en: "Send a test" }, run: () => notify2({ chatId: currentRoute().chatId, title: "CC++", durationMs: 0, at: Date.now() }, true) }
  });
  var L20 = {
    done: { zh: "Claude 回复完成", en: "Claude finished replying" },
    otherDone: { zh: "另一个对话回复完成", en: "Another chat finished" },
    otherError: { zh: "另一个对话回复出错", en: "Another chat hit an error" },
    took: { zh: "用时 {s} 秒", en: "Took {s}s" },
    open: { zh: "点击回到对话", en: "Click to return to the chat" }
  };
  function fetchSound(url) {
    if (typeof GM_xmlhttpRequest === "function") {
      return new Promise(
        (resolve) => GM_xmlhttpRequest({
          method: "GET",
          url,
          timeout: 15e3,
          responseType: "arraybuffer",
          onload: (r3) => resolve(r3.status >= 200 && r3.status < 300 ? r3.response : null),
          onerror: () => resolve(null),
          ontimeout: () => resolve(null)
        })
      );
    }
    return fetch(url, { credentials: "omit", referrerPolicy: "no-referrer" }).then((r3) => r3.ok ? r3.arrayBuffer() : null).catch(() => null);
  }
  var cached = null;
  async function playSound(volume) {
    const url = settings26.store.soundUrl.trim();
    if (!/^https?:\/\//i.test(url)) return chime(volume);
    if (cached?.url !== url) cached = { url, data: fetchSound(url) };
    const data = await cached.data;
    const Ctx = window.AudioContext ?? window.webkitAudioContext;
    if (!data || !Ctx) return chime(volume);
    const ctx = new Ctx();
    try {
      const buffer = await ctx.decodeAudioData(data.slice(0));
      const source = ctx.createBufferSource();
      const gain = ctx.createGain();
      gain.gain.value = Math.max(0, Math.min(1, volume / 100));
      source.buffer = buffer;
      source.connect(gain).connect(ctx.destination);
      source.onended = () => void ctx.close();
      source.start();
    } catch {
      void ctx.close();
      chime(volume);
    }
  }
  function chime(volume) {
    const Ctx = window.AudioContext ?? window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const gain = ctx.createGain();
    gain.gain.value = Math.max(0, Math.min(1, volume / 100)) * 0.3;
    gain.connect(ctx.destination);
    [880, 1318.5].forEach((freq, i3) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;
      const start = ctx.currentTime + i3 * 0.14;
      const env = ctx.createGain();
      env.gain.setValueAtTime(0, start);
      env.gain.linearRampToValueAtTime(1, start + 0.02);
      env.gain.exponentialRampToValueAtTime(1e-3, start + 0.5);
      osc.connect(env).connect(gain);
      osc.start(start);
      osc.stop(start + 0.55);
    });
    setTimeout(() => void ctx.close(), 1200);
  }
  var openToasts = /* @__PURE__ */ new Map();
  function openChat(chatId) {
    window.focus();
    if (currentRoute().chatId === chatId) return;
    const link = document.querySelector(`a[href="/chat/${chatId}"]`);
    if (link) link.click();
    else location.assign(`/chat/${chatId}`);
  }
  function claim(chatId) {
    if (!chatId) return true;
    const key = `ccpp:replyNotified:${chatId}`;
    try {
      const last2 = Number(localStorage.getItem(key));
      if (Date.now() - last2 < 15e3) return false;
      localStorage.setItem(key, String(Date.now()));
    } catch {
    }
    return true;
  }
  async function previewOf(chatId) {
    if (!chatId || !settings26.store.preview) return "";
    try {
      const reply = (await getConversation(chatId)).messages.filter((m3) => m3.role === "assistant").at(-1);
      return reply ? snippet(reply.text, 100) : "";
    } catch {
      return "";
    }
  }
  function notify2(event, test2 = false) {
    const body = [event.title, event.durationMs ? t3(L20.took).replace("{s}", String(Math.round(event.durationMs / 1e3))) : ""].filter(Boolean).join(" · ");
    const title = event.other ? t3(event.error ? L20.otherError : L20.otherDone) : t3(L20.done);
    const back = () => {
      window.focus();
      if (event.chatId) openChat(event.chatId);
    };
    const away = test2 || settings26.store.when === "always" || document.hidden || !document.hasFocus();
    if (settings26.store.sound && away) void playSound(settings26.store.volume);
    if (settings26.store.toast || event.other) {
      const key = event.chatId ? `reply-${event.chatId}` : "reply-done";
      const close = toast([body, event.preview].filter(Boolean).join("\n"), { title, kind: event.error ? "error" : "ok", onClick: back, key, timeoutMs: settings26.store.keep ? 0 : settings26.store.toastSec * 1e3 });
      if (event.chatId) openToasts.set(event.chatId, close);
    }
    if (!away) return;
    if (settings26.store.desktop && "Notification" in window) {
      const show = () => {
        try {
          const n2 = new Notification(title, { body: `${[body, event.preview].filter(Boolean).join("\n")}
${t3(L20.open)}`, tag: `ccpp-${event.chatId ?? "reply"}`, silent: true });
          n2.onclick = () => {
            back();
            n2.close();
          };
        } catch {
        }
      };
      if (Notification.permission === "granted") show();
      else if (Notification.permission === "default" && test2) void Notification.requestPermission().then((p4) => p4 === "granted" && show());
    }
  }
  function readRows(root2 = document) {
    const rows = /* @__PURE__ */ new Map();
    for (const link of root2.querySelectorAll('a[href^="/chat/"][data-row-main-button]')) {
      const id = /^\/chat\/([0-9a-f-]{36})/i.exec(link.getAttribute("href") ?? "")?.[1]?.toLowerCase();
      if (!id) continue;
      const attention = link.querySelector("[data-attention]")?.getAttribute("data-attention") ?? "";
      const state3 = attention === "working" ? "working" : /error|fail/i.test(attention) ? "error" : "idle";
      const label = link.querySelector("[data-row-label]");
      const shimmer = label?.querySelector('[data-cds="ShimmerText"]');
      const title = ((shimmer?.firstChild?.textContent ?? label?.textContent) || "").trim();
      const prev = rows.get(id);
      if (!prev || state3 === "working") rows.set(id, { state: state3, title: title || prev?.title || "" });
    }
    return rows;
  }
  function finished(working, rows, now2) {
    const done = [];
    for (const [chatId, row] of rows) {
      const was = working.get(chatId);
      if (row.state === "working") {
        if (!was) working.set(chatId, { since: now2, title: row.title });
        continue;
      }
      if (!was) continue;
      working.delete(chatId);
      done.push({ chatId, title: row.title || was.title, durationMs: now2 - was.since, error: row.state === "error" });
    }
    return done;
  }
  var replyNotification_default = definePlugin({
    name: "ReplyNotification",
    title: { zh: "回复完成提醒", en: "Reply notification" },
    description: {
      zh: "Claude 回复完成时播放提示音、弹出系统通知或页面提示条（默认只在标签页处于后台时）。",
      en: "Plays a chime, shows a desktop notification or an in-page toast when Claude finishes (by default only while the tab is in the background)."
    },
    category: "notifications",
    icon: "bell",
    updatedAt: "2026-10-30",
    enabledByDefault: true,
    dependencies: ["ChatStateApi", "NoticesApi", "RouterApi", "ClaudeApi"],
    settings: settings26,
    start(scope) {
      scope.on("reply:end", (event) => {
        if (event.durationMs < settings26.store.minSeconds * 1e3) return;
        if (settings26.store.when === "hidden" && !document.hidden && document.hasFocus()) return;
        if (!claim(event.chatId)) return;
        void previewOf(event.chatId).then((preview) => scope.alive && notify2({ ...event, preview }));
      });
      const working = /* @__PURE__ */ new Map();
      scope.interval(() => {
        const rows = readRows();
        for (const done of finished(working, rows, Date.now())) {
          if (!settings26.store.others || done.chatId === currentRoute().chatId) continue;
          if (!claim(done.chatId)) continue;
          void previewOf(done.chatId).then((preview) => scope.alive && notify2({ ...done, at: Date.now(), other: true, preview }));
        }
      }, 1e3);
      onRoute(scope, (route) => {
        const close = route.chatId ? openToasts.get(route.chatId) : void 0;
        if (close) {
          close();
          openToasts.delete(route.chatId);
        }
      });
      scope.defer(() => openToasts.clear());
      if (settings26.store.desktop && "Notification" in window && Notification.permission === "default") {
        scope.listen(document, "pointerdown", () => void Notification.requestPermission(), { once: true });
      }
    }
  });

  // sites/claude/plugins/ReplyNotification/index.ts
  var ReplyNotification_default = toFramework(replyNotification_default);

  // sites/claude/plugins/RouterApi/index.ts
  var RouterApi_default = toFramework(router_default);

  // src/plugins/runningPill/index.ts
  var RUNNING_PILL = '[aria-busy="true"].rounded-full:has(> [data-cds="Spinner"])';
  var BRAND = "var(--cds-fill-brand, #c6613f)";
  var CSS10 = `
${RUNNING_PILL} {
    color: ${BRAND} !important;
    border-color: color-mix(in srgb, ${BRAND} 55%, transparent) !important;
    background-color: color-mix(in srgb, ${BRAND} 14%, var(--cds-surface-1, transparent)) !important;
    font-weight: 500;
}
`;
  var runningPill_default = definePlugin({
    name: "RunningPill",
    title: { zh: "高亮运行中的进度", en: "Highlight running progress" },
    description: {
      zh: "项目页里正在运行的线程，右侧的进度标记（转圈 + 1/6 这样的计数）改用 Claude 的橙色主题色，一眼看出哪些在跑。",
      en: "On project pages, the progress pill (spinner plus a count like 1/6) of a running thread uses Claude's orange brand color, so running work stands out."
    },
    category: "appearance",
    icon: "sparkles",
    enabledByDefault: true,
    updatedAt: "2026-10-18",
    dependencies: ["StylesApi"],
    start(scope) {
      addStyle(scope, CSS10, "running-pill");
    }
  });

  // sites/claude/plugins/RunningPill/index.ts
  var RunningPill_default = toFramework(runningPill_default);

  // src/plugins/sidebarDefaultCode/index.ts
  var GIVE_UP_MS = 15e3;
  var decided = false;
  var settings27 = definePluginSettings({
    onlyCodePages: {
      type: "boolean",
      label: { zh: "只在 claude.ai/code 开头的页面切换", en: "Only on claude.ai/code pages" },
      description: {
        zh: "打开后，只有网址以 https://claude.ai/code 开头时才切到 Code，首页和对话页保持原样。",
        en: "When on, the switch moves to Code only on pages whose address starts with https://claude.ai/code; the home page and chats are left alone."
      },
      default: false
    }
  });
  var isCodePage = () => location.pathname === "/code" || location.pathname.startsWith("/code/");
  var allowedHere = () => settings27.store.onlyCodePages ? isCodePage() : currentRoute().kind === "new";
  var hasDraft = () => !!document.querySelector(SEL.editor)?.textContent?.trim();
  var sidebarDefaultCode_default = definePlugin({
    name: "SidebarDefaultCode",
    title: { zh: "侧栏默认 Code", en: "Sidebar defaults to Code" },
    description: {
      zh: "打开 claude.ai 首页时，侧栏顶部的 Chat / Code 切换自动停在 Code（Claude Code）。只在页面加载时切一次，之后手动切回 Chat 不受影响；打开具体对话链接时不切。可改为只在 claude.ai/code 开头的页面切换。",
      en: "When claude.ai opens on the home page, the Chat / Code switch at the top of the sidebar starts on Code (Claude Code). It switches once per page load, never after you pick Chat yourself, and never when you open a specific chat. Can be limited to claude.ai/code pages."
    },
    category: "navigation",
    icon: "terminal",
    enabledByDefault: true,
    updatedAt: "2026-10-18",
    dependencies: ["DomApi", "RouterApi"],
    settings: settings27,
    start(scope) {
      if (decided) return;
      const run = scope.child();
      run.timeout(() => {
        decided = true;
        run.dispose();
      }, GIVE_UP_MS);
      watch(run, SEL.modeCode, (code) => {
        if (decided) return;
        decided = true;
        queueMicrotask(() => run.dispose());
        if (!allowedHere() || hasDraft()) return;
        if (code.getAttribute("aria-checked") !== "true") code.click();
      });
    }
  });

  // sites/claude/plugins/SidebarDefaultCode/index.ts
  var SidebarDefaultCode_default = toFramework(sidebarDefaultCode_default);

  // sites/claude/plugins/SlotsApi/index.ts
  var SlotsApi_default = toFramework(slots_default);

  // src/plugins/streamerMode/index.ts
  var settings28 = definePluginSettings({
    identity: { type: "boolean", label: { zh: "模糊你的名字、邮箱、套餐与设备名", en: "Blur your name, email, plan and device name" }, default: true },
    avatar: { type: "boolean", label: { zh: "模糊你的头像", en: "Blur your avatar" }, default: true },
    settingsPage: {
      type: "boolean",
      label: { zh: "模糊设置页里的姓名和组织 ID", en: "Blur your name and organization ID in settings" },
      description: { zh: "「账户」页的全名、Claude 怎么称呼你、组织 ID，以及那里的头像。", en: "Full name, what Claude calls you, organization ID and the avatar on the Account page." },
      default: true
    },
    sidebar: { type: "boolean", label: { zh: "模糊侧栏的对话 / 项目标题", en: "Blur chat and project titles in the sidebar" }, default: true },
    title: { type: "boolean", label: { zh: "模糊当前对话 / 项目标题", en: "Blur the current chat or project title" }, default: false },
    hover: { type: "boolean", label: { zh: "悬停时显示", en: "Reveal on hover" }, default: true },
    amount: { type: "number", label: { zh: "模糊程度", en: "Blur amount" }, default: 6, min: 2, max: 16, unit: "px" }
  });
  var PRIVATE_ROW = /^(full name|what should claude call you\??|organization id|全名|姓名|组织\s*id|.*称呼你.*)$/i;
  var PRIVATE = "data-ccpp-private";
  function streamerCss(o3) {
    const avatar = o3.avatar ?? o3.identity;
    const targets = [
      ...o3.identity ? ['[data-testid="user-menu-button"] .df-user-menu-trailing', '[data-testid="user-menu-header"]', "[data-new-page-greeting-text]", '[data-testid="cowork-computer-link-indicator"]'] : [],
      ...avatar ? ['[data-testid="user-menu-button"] [data-cds="Avatar"]'] : [],
      ...o3.settingsPage ? [`[${PRIVATE}] [data-settings-control]`, ...avatar ? ['[data-settings-row] [data-cds="Avatar"][data-ccpp-me]'] : []] : [],
      ...o3.sidebar ? ['[data-testid="sidebar"] [data-row-label]', '[data-testid="sidebar"] a[href^="/chat/"]'] : [],
      ...o3.title ? ['[data-testid="session-title-split"]', "[data-pane-title]", '[data-perf-region="side_pane"] [data-top-right] [data-cds="OverflowTooltip"]'] : []
    ];
    if (!targets.length) return "";
    const list2 = targets.join(",\n");
    const reveal = o3.hover ? `
${targets.map((t4) => `${t4}:hover`).join(",\n")} { filter: none !important; }` : "";
    return `${list2} { filter: blur(${o3.amount}px) !important; transition: filter .15s; }${reveal}`;
  }
  var streamerMode_default = definePlugin({
    name: "StreamerMode",
    title: { zh: "直播 / 截图模式", en: "Streamer mode" },
    description: { zh: "模糊你的名字、邮箱、头像、套餐、设置页里的个人信息与侧栏标题，录屏或截图时不泄露隐私；悬停可临时查看。", en: "Blurs your name, email, avatar, plan, personal details in settings and sidebar titles for screen sharing; hover to peek." },
    category: "privacy",
    icon: "eyeOff",
    updatedAt: "2026-10-30",
    enabledByDefault: false,
    dependencies: ["DomApi", "StylesApi"],
    settings: settings28,
    start(scope) {
      const set = addStyle(scope, streamerCss(settings28.store), "streamer");
      this.onSettingsChange = () => set(streamerCss(settings28.store));
      watch(scope, "[data-settings-row]", (row) => {
        const id = row.getAttribute("aria-labelledby");
        const label = (id ? document.getElementById(id) : null)?.textContent?.trim() ?? "";
        if (!PRIVATE_ROW.test(label)) return;
        row.setAttribute(PRIVATE, "");
        return () => row.removeAttribute(PRIVATE);
      });
    }
  });

  // sites/claude/plugins/StreamerMode/index.ts
  var StreamerMode_default = toFramework(streamerMode_default);

  // sites/claude/plugins/StylesApi/index.ts
  var StylesApi_default = toFramework(styles_default);

  // src/plugins/_core/themes/index.ts
  var logger12 = new Logger2("Themes");
  var isStore = (v3) => !!v3 && Array.isArray(v3.online) && Array.isArray(v3.local);
  var store = persisted("themes", { online: [], local: [] }, isStore);
  function parseMeta(css2) {
    const block2 = /\/\*([\s\S]*?)\*\//.exec(css2)?.[1] ?? "";
    const meta = {};
    for (const match of block2.matchAll(/@(name|author|description)\s+([^\n*]+)/g)) meta[match[1]] = match[2].trim();
    return meta;
  }
  function validThemeUrl(raw2) {
    try {
      const url = new URL(raw2.trim());
      return url.protocol === "https:" ? url.href : null;
    } catch {
      return null;
    }
  }
  function combinedCss(themes) {
    return [...themes.online.filter((x4) => x4.enabled && x4.css).map((x4) => `/* ${x4.url} */
${x4.css}`), ...themes.local.filter((x4) => x4.enabled).map((x4) => `/* ${x4.name} */
${x4.css}`)].join("\n\n");
  }
  function fetchText(url) {
    if (typeof GM_xmlhttpRequest === "function") {
      return new Promise(
        (resolve, reject) => GM_xmlhttpRequest({
          method: "GET",
          url,
          timeout: 15e3,
          onload: (r3) => r3.status >= 200 && r3.status < 300 ? resolve(r3.responseText) : reject(new Error(`HTTP ${r3.status}`)),
          onerror: () => reject(new Error("network")),
          ontimeout: () => reject(new Error("timeout"))
        })
      );
    }
    return fetch(url, { credentials: "omit" }).then((r3) => r3.ok ? r3.text() : Promise.reject(new Error(`HTTP ${r3.status}`)));
  }
  var REFRESH_MS = 60 * 60 * 1e3;
  async function refreshOnline(url, force = false) {
    const theme = store.get().online.find((x4) => x4.url === url);
    if (!theme || !force && theme.css && Date.now() - (theme.fetchedAt ?? 0) < REFRESH_MS) return;
    let patch;
    try {
      patch = { css: await fetchText(url), fetchedAt: Date.now(), error: void 0 };
    } catch (error2) {
      logger12.warn("Theme download failed:", url, error2);
      patch = { error: error2 instanceof Error ? error2.message : String(error2) };
    }
    const current6 = store.get();
    store.set({ ...current6, online: current6.online.map((x4) => x4.url === url ? { ...x4, ...patch } : x4) });
  }
  var L21 = {
    title: { zh: "主题", en: "Themes" },
    search: { zh: "搜索主题…", en: "Search themes…" },
    all: { zh: "全部", en: "All" },
    enabled: { zh: "已启用", en: "Enabled" },
    disabled: { zh: "已停用", en: "Disabled" },
    online: { zh: "在线主题", en: "Online themes" },
    local: { zh: "本地主题", en: "Local themes" },
    onlineShort: { zh: "在线", en: "Online" },
    localShort: { zh: "本地", en: "Local" },
    add: { zh: "添加", en: "Add" },
    create: { zh: "新建", en: "New" },
    addOnline: { zh: "添加在线主题", en: "Add online theme" },
    urlLabel: { zh: "CSS 地址（https）", en: "CSS URL (https)" },
    urlHint: { zh: "CC++ 会下载这个 CSS 并应用到 claude.ai，每小时更新一次。", en: "CC++ downloads this CSS, applies it to claude.ai and refreshes it hourly." },
    badUrl: { zh: "请填写 https 开头的地址", en: "Enter an https URL" },
    dupUrl: { zh: "这个主题已经添加过了", en: "That theme is already added" },
    editLocal: { zh: "编辑本地主题", en: "Edit local theme" },
    newLocal: { zh: "新建本地主题", en: "New local theme" },
    name: { zh: "名称", en: "Name" },
    author: { zh: "作者", en: "Author" },
    css: { zh: "CSS", en: "CSS" },
    save: { zh: "保存", en: "Save" },
    cancel: { zh: "取消", en: "Cancel" },
    edit: { zh: "编辑", en: "Edit" },
    copyUrl: { zh: "复制地址", en: "Copy URL" },
    copied: { zh: "已复制", en: "Copied" },
    refresh: { zh: "重新下载", en: "Download again" },
    remove: { zh: "删除", en: "Delete" },
    removeTitle: { zh: "删除主题？", en: "Delete theme?" },
    removeBody: { zh: "「{name}」会被删除。", en: "“{name}” will be deleted." },
    emptyOnline: { zh: "还没有在线主题。点「添加」填一个 CSS 地址。", en: "No online themes yet. Use Add to enter a CSS URL." },
    emptyLocal: { zh: "还没有本地主题。点「新建」自己写一个。", en: "No local themes yet. Use New to write one." },
    noMatch: { zh: "没有匹配的主题", en: "No matching themes" },
    failed: { zh: "下载失败", en: "Download failed" },
    lines: { zh: "{n} 行 CSS", en: "{n} lines of CSS" },
    untitled: { zh: "未命名主题", en: "Untitled theme" }
  };
  var ui = { query: "", filter: "all" };
  var nameOfOnline = (theme) => parseMeta(theme.css ?? "").name || new URL(theme.url).pathname.split("/").pop() || theme.url;
  function setOnline(url, patch) {
    const current6 = store.get();
    store.set({ ...current6, online: current6.online.map((x4) => x4.url === url ? { ...x4, ...patch } : x4) });
  }
  function setLocal(id, patch) {
    const current6 = store.get();
    store.set({ ...current6, local: patch ? current6.local.map((x4) => x4.id === id ? { ...x4, ...patch } : x4) : current6.local.filter((x4) => x4.id !== id) });
  }
  function themeCard(o3) {
    const sw = h4("button", { type: "button", class: "switch", role: "switch", "aria-checked": String(o3.enabled), "aria-label": o3.name });
    sw.addEventListener("click", () => o3.toggle(!o3.enabled));
    return h4(
      "div",
      { class: `card${o3.enabled ? " on" : " off"}${o3.error ? " crashed" : ""}` },
      h4(
        "div",
        { class: "card-body" },
        h4("div", { class: "card-top" }, h4("span", { class: "chip-icon" }, icon("palette", 14)), h4("span", { class: "card-title", text: o3.name, ...tipAttrs(o3.name), style: { cursor: "default" } }), h4("div", { class: "card-actions" }, ...o3.actions, sw)),
        h4("div", { class: "card-desc", text: o3.desc }),
        h4("div", { class: "card-gap" }),
        h4(
          "div",
          { class: "card-foot" },
          icon(o3.online ? "globe" : "folder", 12),
          h4("span", { text: t3(o3.online ? L21.onlineShort : L21.localShort) }),
          o3.error ? h4("span", { class: "badge bad", text: t3(L21.failed), ...tipAttrs(t3(L21.failed), o3.error) }) : null,
          h4("span", { class: "author", text: o3.author })
        )
      )
    );
  }
  var iconAction = (name, label, run) => {
    const button = h4("button", { type: "button", class: "icon-btn", ...tipAttrs(t3(label)), "aria-label": t3(label) }, icon(name, 14));
    button.addEventListener("click", run);
    return button;
  };
  async function askRemove(name) {
    return confirmDialog({ title: t3(L21.removeTitle), body: t3(L21.removeBody).replace("{name}", name), ok: L21.remove, danger: true });
  }
  function openAddOnline() {
    const input = h4("input", { class: "input", type: "url", placeholder: "https://…/theme.css", autofocus: true, "aria-label": t3(L21.urlLabel) });
    const error2 = h4("div", { class: "row-desc", style: { color: "var(--bad)" } });
    const add = h4("button", { type: "button", class: "btn primary", text: t3(L21.add) });
    const cancel = h4("button", { type: "button", class: "btn", text: t3(L21.cancel) });
    const submit = () => {
      const url = validThemeUrl(input.value);
      if (!url) return void (error2.textContent = t3(L21.badUrl));
      if (store.get().online.some((x4) => x4.url === url)) return void (error2.textContent = t3(L21.dupUrl));
      const current6 = store.get();
      store.set({ ...current6, online: [...current6.online, { url, enabled: true }] });
      void refreshOnline(url, true);
      close();
    };
    add.addEventListener("click", submit);
    input.addEventListener("keydown", (event) => event.key === "Enter" && submit());
    let close = () => {
    };
    cancel.addEventListener("click", () => close());
    close = openModal(dialogFrame({ title: t3(L21.addOnline), icon: "globe", size: "small", body: [h4("div", { class: "field" }, h4("label", { text: t3(L21.urlLabel) }), input, error2), h4("p", { class: "hint", text: t3(L21.urlHint) })], foot: [cancel, add], onClose: () => close() }));
  }
  function openLocalEditor(theme) {
    const name = h4("input", { class: "input", value: theme?.name ?? "", placeholder: t3(L21.untitled), autofocus: true });
    const author = h4("input", { class: "input", value: theme?.author ?? "" });
    const css2 = h4("textarea", { class: "input editor", rows: 16, spellcheck: false, placeholder: "/* @name My theme */\n:root { }" });
    css2.value = theme?.css ?? "";
    css2.addEventListener("keydown", (event) => {
      if (event.key !== "Tab") return;
      event.preventDefault();
      css2.setRangeText("  ", css2.selectionStart, css2.selectionEnd, "end");
    });
    const save2 = h4("button", { type: "button", class: "btn primary", text: t3(L21.save) });
    const cancel = h4("button", { type: "button", class: "btn", text: t3(L21.cancel) });
    save2.addEventListener("click", () => {
      const meta = parseMeta(css2.value);
      const next = { name: name.value.trim() || meta.name || t3(L21.untitled), author: author.value.trim() || meta.author || "", css: css2.value };
      if (theme) setLocal(theme.id, next);
      else {
        const current6 = store.get();
        store.set({ ...current6, local: [...current6.local, { id: `t${Date.now().toString(36)}`, enabled: true, ...next }] });
      }
      close();
    });
    let close = () => {
    };
    cancel.addEventListener("click", () => close());
    close = openModal(
      dialogFrame({
        title: t3(theme ? L21.editLocal : L21.newLocal),
        icon: "palette",
        size: "wide",
        body: [h4("div", { class: "field" }, h4("label", { text: t3(L21.name) }), name), h4("div", { class: "field" }, h4("label", { text: t3(L21.author) }), author), h4("div", { class: "field" }, h4("label", { text: t3(L21.css) }), css2)],
        foot: [cancel, save2],
        onClose: () => close()
      })
    );
  }
  function renderThemes(container3) {
    const search3 = h4("input", { class: "input", type: "search", placeholder: t3(L21.search), value: ui.query, "aria-label": t3(L21.search) });
    const filter = h4(
      "select",
      { class: "input", "aria-label": t3(L21.all) },
      ...["all", "enabled", "disabled", "online", "local"].map((value) => h4("option", { value, text: t3(value === "online" ? L21.onlineShort : value === "local" ? L21.localShort : L21[value]), selected: ui.filter === value }))
    );
    container3.appendChild(h4("div", { class: "sticky-top" }, h4("div", { class: "bar" }, h4("label", { class: "search" }, icon("search", 14), search3), filter)));
    const body = h4("div");
    container3.appendChild(body);
    const matches2 = (name, extra, enabled) => (!ui.query || `${name} ${extra}`.toLowerCase().includes(ui.query.toLowerCase())) && (ui.filter === "enabled" ? enabled : ui.filter === "disabled" ? !enabled : true);
    const draw2 = () => {
      clear(body);
      const themes = store.get();
      const section = (title, buttonText2, buttonIcon, onAdd, cards, empty) => {
        const add = h4("button", { type: "button", class: "btn" }, icon(buttonIcon, 14), t3(buttonText2));
        add.addEventListener("click", onAdd);
        const filtered = ui.query || ui.filter !== "all";
        body.appendChild(
          h4(
            "div",
            { class: "section" },
            h4("div", { class: "section-head" }, h4("h3", { text: t3(title) }), add),
            cards.length ? h4("div", { class: "grid" }, ...cards) : h4("div", { class: "empty", text: t3(filtered ? L21.noMatch : empty) })
          )
        );
      };
      if (ui.filter !== "local") {
        const cards = themes.online.filter((x4) => matches2(nameOfOnline(x4), x4.url, x4.enabled)).map((theme) => {
          const meta = parseMeta(theme.css ?? "");
          return themeCard({
            name: nameOfOnline(theme),
            desc: meta.description || theme.url,
            author: meta.author || new URL(theme.url).host,
            online: true,
            enabled: theme.enabled,
            error: theme.error,
            toggle: (on3) => {
              setOnline(theme.url, { enabled: on3 });
              if (on3) void refreshOnline(theme.url);
            },
            actions: [
              iconAction("copy", L21.copyUrl, () => navigator.clipboard?.writeText(theme.url).then(() => toast(t3(L21.copied), { kind: "ok" }))),
              iconAction("refresh", L21.refresh, () => void refreshOnline(theme.url, true)),
              iconAction("trash", L21.remove, async () => {
                if (!await askRemove(nameOfOnline(theme))) return;
                const current6 = store.get();
                store.set({ ...current6, online: current6.online.filter((x4) => x4.url !== theme.url) });
              })
            ]
          });
        });
        section(L21.online, L21.add, "plus", openAddOnline, cards, L21.emptyOnline);
      }
      if (ui.filter !== "online") {
        const cards = themes.local.filter((x4) => matches2(x4.name, x4.author, x4.enabled)).map(
          (theme) => themeCard({
            name: theme.name,
            desc: parseMeta(theme.css).description || t3(L21.lines).replace("{n}", String(theme.css.split("\n").length)),
            author: theme.author || "—",
            online: false,
            enabled: theme.enabled,
            toggle: (on3) => setLocal(theme.id, { enabled: on3 }),
            actions: [
              iconAction("pencil", L21.edit, () => openLocalEditor(theme)),
              iconAction("trash", L21.remove, async () => await askRemove(theme.name) && setLocal(theme.id, null))
            ]
          })
        );
        section(L21.local, L21.create, "plus", () => openLocalEditor(), cards, L21.emptyLocal);
      }
    };
    search3.addEventListener("input", () => {
      ui.query = search3.value;
      draw2();
    });
    filter.addEventListener("change", () => {
      ui.filter = filter.value;
      draw2();
    });
    draw2();
  }
  var themes_default = definePlugin({
    name: "Themes",
    title: L21.title,
    description: { zh: "在线主题（填 CSS 地址）和本地主题（自己写 CSS），可分别启用、编辑、删除。", en: "Online themes (from a CSS URL) and local themes (your own CSS), each switchable, editable and removable." },
    category: "appearance",
    icon: "palette",
    enabledByDefault: true,
    dependencies: ["StylesApi", "CCPPSettings", "NoticesApi"],
    start(scope) {
      const setCss = addStyle(scope, combinedCss(store.get()), "themes");
      let redrawTab = () => {
      };
      scope.defer(
        store.subscribe((value) => {
          setCss(combinedCss(value));
          redrawTab();
        })
      );
      for (const theme of store.get().online) if (theme.enabled) void refreshOnline(theme.url);
      registerTab(scope, {
        id: "themes",
        title: L21.title,
        icon: "palette",
        order: 10,
        render(container3) {
          renderThemes(container3);
          redrawTab = () => {
            if (!container3.isConnected) return;
            const top = container3.scrollTop;
            clear(container3);
            renderThemes(container3);
            container3.scrollTop = top;
          };
        }
      });
    }
  });

  // sites/claude/plugins/Themes/index.ts
  var Themes_default = toFramework(themes_default);

  // sites/claude/plugins/TranscriptApi/index.ts
  var TranscriptApi_default = toFramework(transcript_default);

  // src/plugins/usageBannerHider/index.ts
  var settings29 = definePluginSettings({
    approaching: { type: "boolean", label: { zh: "隐藏「接近用量上限」提示（Approaching session usage limit）", en: "Hide “Approaching usage limit” banners" }, default: true },
    exhausted: { type: "boolean", label: { zh: "隐藏「用量已耗尽」提示（You've hit your limit 等）", en: "Hide “Usage limit reached” banners" }, default: true }
  });
  var LIMIT_RE = /\b(usage|session|weekly|daily|message|5-hour) limits?\b|\bout of (free |extra )?(messages|usage)\b|用量(上限|限制|已用完|已耗尽)|使用(上限|限制)/i;
  var APPROACHING_RE = /\bapproaching\b|接近|即将/i;
  var MAX_TEXT = 240;
  var SKIP3 = `${SEL.userContent}, ${SEL.sidebar}, nav, [role="menu"], [role="dialog"], [data-ccpp], ul, ol, a[href], button, [role="button"], [role="list"], [role="listitem"], [role="option"]`;
  var MARK2 = "data-ccpp-usage-banner";
  function barOf2(text) {
    let bar = null;
    for (let node = text; node && node !== document.body; node = node.parentElement) {
      if ((node.textContent?.trim().length ?? 0) > MAX_TEXT || node.querySelector(SEL.userContent)) break;
      if (node.querySelector('button, a[href], [role="button"]')) bar = node;
    }
    return bar;
  }
  function findUsageBanners(root2 = document) {
    const found = /* @__PURE__ */ new Map();
    for (const el of root2.querySelectorAll("p, span, div, h2, h3, strong")) {
      if (el.childElementCount > 2 || el.closest(SKIP3)) continue;
      const text = el.textContent?.trim() ?? "";
      if (!text || text.length > MAX_TEXT || !LIMIT_RE.test(text)) continue;
      const bar = barOf2(el);
      if (bar && !found.has(bar)) found.set(bar, APPROACHING_RE.test(bar.textContent ?? "") ? "approaching" : "exhausted");
    }
    return [...found].map(([el, kind]) => ({ el, kind }));
  }
  var usageBannerHider_default = definePlugin({
    name: "UsageBannerHider",
    title: { zh: "隐藏用量限制提示条", en: "Hide usage limit banner" },
    description: {
      zh: "隐藏输入框上方的用量提示条：「接近用量上限」（Approaching session usage limit · Resets at … · Get more usage）和「用量已耗尽」两种可分别开关。设置页里的用量信息不受影响。",
      en: "Hides the usage bar above the input: “Approaching session usage limit · Resets at … · Get more usage” and the limit-reached one, each switchable. Usage on the settings pages is left alone."
    },
    category: "declutter",
    icon: "gauge",
    enabledByDefault: true,
    updatedAt: "2026-10-25",
    dependencies: ["StylesApi", "DomApi"],
    settings: settings29,
    start(scope) {
      const { approaching, exhausted } = settings29.store;
      if (!approaching && !exhausted) return;
      addStyle(scope, `[${MARK2}] { display: none !important; }`, "usage-banner");
      onDomChange(scope, () => {
        if (location.pathname.startsWith("/settings")) return;
        for (const { el, kind } of findUsageBanners()) {
          if (el.hasAttribute(MARK2) || !(kind === "approaching" ? approaching : exhausted)) continue;
          el.setAttribute(MARK2, kind);
        }
      });
      scope.defer(() => document.querySelectorAll(`[${MARK2}]`).forEach((el) => el.removeAttribute(MARK2)));
    }
  });

  // sites/claude/plugins/UsageBannerHider/index.ts
  var UsageBannerHider_default = toFramework(usageBannerHider_default);

  // src/plugins/usageDisplay/stats.ts
  var RETAIN_MIN = 7;
  var RETAIN_MAX = 180;
  var CHART_DAYS = 7;
  var RESET_TOLERANCE_MS = 6e4;
  var DROP = 1;
  var DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
  var pad2 = (n2) => String(n2).padStart(2, "0");
  function localDateKey(at) {
    const d3 = new Date(at);
    return `${d3.getFullYear()}-${pad2(d3.getMonth() + 1)}-${pad2(d3.getDate())}`;
  }
  function shiftDateKey(date, days2) {
    const [y3, m3, d3] = date.split("-").map(Number);
    return localDateKey(new Date(y3, m3 - 1, d3 + days2).getTime());
  }
  var emptyTrack = () => ({ start: null, last: null, resetAt: null, accrued: 0 });
  var emptyDay = (date, now2) => ({ date, week: emptyTrack(), session: emptyTrack(), updatedAt: now2 });
  function applySnapshot(track2, percent, resetAt, now2) {
    const next = { ...track2 };
    if (percent == null) {
      if (resetAt != null) next.resetAt = resetAt;
      return next;
    }
    const moved = resetAt != null && next.resetAt != null && Math.abs(resetAt - next.resetAt) >= RESET_TOLERANCE_MS;
    const expired = next.resetAt != null && now2 >= next.resetAt;
    const dropped = next.last != null && percent < next.last - DROP;
    if (moved || expired || dropped) {
      next.accrued = trackDelta(next);
      next.start = percent;
      next.last = percent;
      next.resetAt = resetAt;
      return next;
    }
    next.start ??= percent;
    next.last = percent;
    if (resetAt != null) next.resetAt = resetAt;
    return next;
  }
  function trackDelta(track2) {
    return track2.accrued + (track2.start != null && track2.last != null ? Math.max(0, track2.last - track2.start) : 0);
  }
  var recorded = (day) => !!day && (day.week.last != null || day.week.accrued > 0 || day.session.last != null || day.session.accrued > 0);
  function carryOver(prev, percent, resetAt, now2) {
    if (!prev || prev.last == null || percent == null || percent < prev.last) return emptyTrack();
    if (prev.resetAt != null && (now2 >= prev.resetAt || resetAt != null && Math.abs(resetAt - prev.resetAt) >= RESET_TOLERANCE_MS)) return emptyTrack();
    return { start: prev.last, last: prev.last, resetAt: prev.resetAt, accrued: 0 };
  }
  function pruneDays(days2, retainDays, now2) {
    const cutoff = shiftDateKey(localDateKey(now2), 1 - Math.min(RETAIN_MAX, Math.max(RETAIN_MIN, Math.floor(retainDays))));
    return Object.fromEntries(Object.entries(days2).filter(([date]) => date >= cutoff));
  }
  function addSnapshot(days2, snap, retainDays, now2) {
    const date = localDateKey(now2);
    let day = days2[date];
    if (!day) {
      const prev = days2[shiftDateKey(date, -1)];
      day = {
        ...emptyDay(date, now2),
        week: carryOver(prev?.week, snap.week?.percent ?? null, snap.week?.resetAt ?? null, now2),
        session: carryOver(prev?.session, snap.session?.percent ?? null, snap.session?.resetAt ?? null, now2)
      };
    }
    const next = {
      date,
      week: applySnapshot(day.week, snap.week?.percent ?? null, snap.week?.resetAt ?? null, now2),
      session: applySnapshot(day.session, snap.session?.percent ?? null, snap.session?.resetAt ?? null, now2),
      updatedAt: now2
    };
    return pruneDays({ ...days2, [date]: next }, retainDays, now2);
  }
  function chartDays(days2, now2) {
    const today = localDateKey(now2);
    let start = shiftDateKey(today, 1 - CHART_DAYS);
    for (const date of Object.keys(days2)) if (date < start) start = date;
    const out = [];
    for (let date = start; date <= today; date = shiftDateKey(date, 1)) out.push(days2[date] ?? emptyDay(date, now2));
    return out;
  }
  function chartScale(days2) {
    const max = Math.max(0, ...days2.map((day) => trackDelta(day.week)));
    return Math.max(20, Math.ceil(max / 10) * 10);
  }
  var keyFor2 = (org2) => `usageStats:${org2}`;
  function isDay(value) {
    const day = value;
    const track2 = (t4) => !!t4 && typeof t4 === "object" && typeof t4.accrued === "number";
    return !!day && typeof day === "object" && DATE_RE.test(day.date) && track2(day.week) && track2(day.session);
  }
  function loadDays(org2) {
    const file = readJson(keyFor2(org2), null);
    if (!file || file.version !== 1 || !file.days || typeof file.days !== "object") return {};
    return Object.fromEntries(Object.entries(file.days).filter(([date, day]) => isDay(day) && day.date === date));
  }
  function recordSnapshot(org2, snap, retainDays, now2 = Date.now()) {
    const days2 = addSnapshot(loadDays(org2), snap, retainDays, now2);
    writeJson(keyFor2(org2), { version: 1, days: days2 });
    return days2;
  }
  var clearDays = (org2) => removeKey(keyFor2(org2));

  // src/plugins/usageDisplay/index.ts
  var logger13 = new Logger2("UsageDisplay");
  var settings30 = definePluginSettings({
    style: {
      type: "select",
      label: { zh: "输入框里的样式", en: "Style in the chat input" },
      default: "rings",
      options: [
        { value: "rings", label: { zh: "双圆环", en: "Two rings" } },
        { value: "text", label: { zh: "百分比文字", en: "Percent text" } },
        { value: "both", label: { zh: "圆环 + 文字", en: "Rings + text" } }
      ]
    },
    refreshSec: { type: "number", label: { zh: "自动刷新间隔", en: "Refresh every" }, default: 60, min: 30, max: 600, step: 10, unit: "s" },
    warnAt: { type: "number", label: { zh: "黄色提醒阈值", en: "Amber from" }, default: 75, min: 10, max: 99, unit: "%" },
    dangerAt: { type: "number", label: { zh: "红色提醒阈值", en: "Red from" }, default: 90, min: 10, max: 100, unit: "%" },
    stats: {
      type: "boolean",
      label: { zh: "按日记录用量", en: "Record daily usage" },
      description: {
        zh: "在本机记下每天用掉的每周额度和 5 小时额度。悬停圆环看今天，点开看按日柱状图。只在打开 claude.ai 时记录。",
        en: "Keeps a per-day log of weekly and 5-hour usage on this device. Hover a ring for today; click for a daily chart. Recorded only while claude.ai is open."
      },
      default: true
    },
    retainDays: { type: "number", label: { zh: "保留多少天", en: "Days to keep" }, default: 90, min: RETAIN_MIN, max: RETAIN_MAX, visible: (v3) => !!v3.stats },
    clearStats: {
      type: "action",
      label: { zh: "清空用量记录", en: "Clear usage history" },
      button: { zh: "清空", en: "Clear" },
      confirm: { zh: "删除本机记录的当前账号全部按日用量？此操作无法撤销。", en: "Delete every day of usage recorded on this device for this account? This can't be undone." },
      visible: (v3) => !!v3.stats,
      run() {
        void getOrgId().then((org2) => {
          clearDays(org2);
          days = {};
          changed();
        });
      }
    }
  });
  var L22 = {
    title: { zh: "用量", en: "Usage" },
    session: { zh: "5 小时会话", en: "5-hour session" },
    weekly: { zh: "每周", en: "Weekly" },
    resetsIn: { zh: "{t}后重置", en: "Resets in {t}" },
    resetsAt: { zh: "重置于 {t}", en: "Resets {t}" },
    updated: { zh: "更新于 {t} · claude.ai 同源接口", en: "Updated {t} · claude.ai API" },
    refresh: { zh: "刷新", en: "Refresh" },
    open: { zh: "打开官方用量页", en: "Open usage page" },
    loading: { zh: "读取中…", en: "Loading…" },
    timeout: { zh: "读取用量超时，稍后自动重试", en: "Usage request timed out; retrying shortly" },
    error: { zh: "读取用量失败：{e}", en: "Could not read usage: {e}" },
    signedOut: { zh: "未登录或无权读取用量", en: "Not signed in or no access to usage" },
    none: { zh: "当前套餐没有用量窗口", en: "No usage windows on this plan" },
    today: { zh: "今天 {p}", en: "Today {p}" },
    daily: { zh: "按日用量", en: "Usage by day" },
    dailyNote: { zh: "本机打开 claude.ai 时记录；没打开时的用量算在下次看到的那天。", en: "Recorded while claude.ai is open here; usage while it's closed counts on the day it's next seen." },
    noDays: { zh: "还没有记录，从现在开始统计。", en: "Nothing recorded yet; counting starts now." },
    noRecord: { zh: "没有记录", en: "Not recorded" },
    todayShort: { zh: "今", en: "Today" },
    todayLong: { zh: "今天", en: "Today" },
    dayWeekly: { zh: "每周额度 {p}", en: "Weekly {p}" },
    daySession: { zh: "5 小时额度 {p}", en: "5-hour {p}" }
  };
  var usage = null;
  var error = null;
  var loading = false;
  var lastAttempt = 0;
  var inflight = null;
  var retryTimer;
  var listeners2 = /* @__PURE__ */ new Set();
  var changed = () => listeners2.forEach((fn2) => fn2());
  var org = null;
  var days = {};
  var picked = null;
  async function snapshot2(current6) {
    if (!settings30.store.stats) return;
    try {
      org = await getOrgId();
    } catch {
      return;
    }
    const win = (w4) => w4 ? { percent: w4.utilization, resetAt: w4.resetsAt } : null;
    days = recordSnapshot(org, { week: win(current6.sevenDay), session: win(current6.fiveHour) }, settings30.store.retainDays, current6.fetchedAt);
  }
  var deltaText = (value) => `+${Math.round(value * 10) / 10}%`;
  function todayDetail(kind) {
    if (!settings30.store.stats || !org) return "";
    const day = days[localDateKey(Date.now())];
    return recorded(day) ? t3(L22.today).replace("{p}", deltaText(trackDelta(day[kind]))) : "";
  }
  var MIN_GAP_MS = 5e3;
  async function refresh2(force = false) {
    if (loading || !force && Date.now() - lastAttempt < MIN_GAP_MS) return;
    if (!force && document.hidden) return;
    loading = true;
    lastAttempt = Date.now();
    const controller = inflight = new AbortController();
    let timedOut = false;
    const timeout = setTimeout(() => (timedOut = true, controller.abort()), 12e3);
    clearTimeout(retryTimer);
    changed();
    try {
      usage = await getUsage(controller.signal);
      error = null;
      await snapshot2(usage);
    } catch (err) {
      if (timedOut) {
        if (!usage) error = t3(L22.timeout);
        retryTimer = setTimeout(() => refresh2(true), 8e3);
        return;
      }
      if (err.name === "AbortError") return;
      error = err instanceof ApiError && (err.status === 401 || err.status === 403) ? t3(L22.signedOut) : err.message || String(err);
      logger13.warn("Usage refresh failed:", err);
    } finally {
      clearTimeout(timeout);
      inflight = null;
      loading = false;
      changed();
    }
  }
  function level(percent, warnAt, dangerAt) {
    if (percent >= dangerAt) return "bad";
    if (percent >= warnAt) return "warn";
    return "ok";
  }
  var resetText = (window2) => !window2.resetsAt ? "" : window2.resetsAt - Date.now() < 24 * 3600 * 1e3 ? t3(L22.resetsIn).replace("{t}", untilText(window2.resetsAt)) : t3(L22.resetsAt).replace("{t}", dateTimeText(window2.resetsAt));
  var COLORS2 = { ok: "var(--cds-fill-accent, #257de0)", warn: "var(--cds-fill-warning, #fbb315)", bad: "var(--cds-fill-danger, #dc3c3d)" };
  var SVG_NS = "http://www.w3.org/2000/svg";
  var nativeTrack = () => document.querySelector("svg [data-ring-track]")?.getAttribute("stroke") || "var(--cds-alpha-2, rgba(127,127,127,.12))";
  function ringSvg(percent) {
    const svg2 = document.createElementNS(SVG_NS, "svg");
    for (const [k4, v3] of Object.entries({ width: "14", height: "14", viewBox: "0 0 14 14", "aria-hidden": "true" })) svg2.setAttribute(k4, v3);
    svg2.style.transform = "rotate(-90deg)";
    const circle = (attrs) => {
      const c4 = document.createElementNS(SVG_NS, "circle");
      for (const [k4, v3] of Object.entries({ cx: "7", cy: "7", r: "6", fill: "none", "stroke-width": "2", ...attrs })) c4.setAttribute(k4, v3);
      return svg2.appendChild(c4);
    };
    circle({ stroke: nativeTrack() });
    if (percent !== null) {
      const length = 2 * Math.PI * 6;
      const clamped = Math.max(0, Math.min(100, percent));
      circle({
        stroke: COLORS2[level(percent, settings30.store.warnAt, settings30.store.dangerAt)],
        "stroke-dasharray": String(length),
        "stroke-dashoffset": String(length * (1 - clamped / 100)),
        "stroke-linecap": "round"
      });
    }
    return svg2;
  }
  function usageButton(open, label, tip, ...children) {
    const button = h4("button", { type: "button", class: "ccpp-usage-btn", "aria-label": label, ...tip }, ...children);
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      hideTip();
      open(button);
    });
    return button;
  }
  function ring(open, window2, label, kind) {
    const percent = window2 ? Math.round(window2.utilization) : null;
    return usageButton(
      open,
      percent === null ? label : `${label} ${percent}%`,
      window2 ? tipAttrs(`${label}: ${percent}%`, [resetText(window2), todayDetail(kind)].filter(Boolean).join(" · ")) : tipAttrs(label, error ?? t3(L22.loading)),
      ringSvg(window2 ? window2.utilization : null)
    );
  }
  function chip(open) {
    const style = settings30.store.style;
    const five = usage?.fiveHour ?? null;
    const week = usage?.sevenDay ?? null;
    const pct = (w4) => w4 ? `${Math.round(w4.utilization)}%` : "–";
    const text = !usage ? error ? "!" : "…" : `${pct(five)} · ${pct(week)}`;
    const tip = usage ? `${t3(L22.session)} ${pct(five)} · ${t3(L22.weekly)} ${pct(week)}` : error ?? t3(L22.loading);
    return h4(
      "span",
      { class: `ccpp-usage${error && !usage ? " err" : ""}` },
      ...style !== "text" ? [ring(open, five, t3(L22.session), "session"), ring(open, week, t3(L22.weekly), "week")] : [],
      ...style !== "rings" ? [usageButton(open, tip, tipAttrs(tip, five ? resetText(five) : ""), h4("span", { text }))] : []
    );
  }
  var SLOT_CSS = `
.ccpp-usage { display: inline-flex; align-items: center; gap: 4px; font-variant-numeric: tabular-nums; }
.ccpp-usage-btn { display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; height: var(--cds-h-control, 32px); min-width: var(--cds-h-control, 32px); padding: 0; border: 0; border-radius: calc(0.375rem * var(--cds-rem-scale, 1)); background: transparent; color: var(--cds-text-secondary, inherit); font: inherit; font-size: calc(0.8125rem * var(--cds-rem-scale, 1)); cursor: pointer; transition: background-color .15s ease-out; }
.ccpp-usage-btn:has(> span) { padding: 0 6px; }
.ccpp-usage-btn:hover, .ccpp-usage-btn[aria-expanded="true"] { color: var(--cds-text-primary, inherit); background: var(--cds-fill-ghost-hover, rgba(127,127,127,.14)); }
.ccpp-usage-btn:focus-visible { outline: none; box-shadow: var(--cds-focus-shadow, 0 0 0 2px var(--cds-fill-accent, #257de0)); }
.ccpp-usage.err .ccpp-usage-btn { color: var(--cds-text-danger, #f17778); }
`;
  var PANEL_CSS2 = `
.metric { display: flex; flex-direction: column; gap: 4px; }
.metric .line { display: flex; justify-content: space-between; } .metric .pct { font-weight: 600; font-variant-numeric: tabular-nums; }
.bar { height: 6px; border-radius: 3px; background: var(--bg3); overflow: hidden; } .bar > i { display: block; height: 100%; border-radius: 3px; }
.foot { display: flex; justify-content: space-between; align-items: center; gap: 8px; font-size: 12px; color: var(--fg3); }
.foot a { color: var(--accent); text-decoration: none; }
.daily { display: flex; flex-direction: column; gap: 6px; padding-top: 8px; border-top: 1px solid var(--line-soft); }
.daily .line { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; }
.chart { display: flex; gap: 2px; overflow-x: auto; scrollbar-width: thin; }
.day { flex: 0 0 34px; display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 3px 0; border: 0; border-radius: 6px; background: transparent; color: var(--fg3); font: inherit; font-size: 11px; font-variant-numeric: tabular-nums; cursor: pointer; }
.day:hover { background: var(--bg2); } .day.on { background: var(--bg3); color: var(--fg); }
.day:focus-visible { outline: none; box-shadow: var(--focus); }
.day .v { height: 14px; font-size: 10px; white-space: nowrap; }
.day .track { display: flex; align-items: flex-end; width: 10px; height: 64px; border-radius: 3px; background: var(--bg2); overflow: hidden; }
.day .track > i { display: block; width: 100%; border-radius: 3px; background: var(--accent); }
.day.empty .track { opacity: .5; }
.daily .detail { font-size: 12px; color: var(--fg2); } .daily .note { font-size: 11px; color: var(--fg3); }
`;
  function metric(label, window2) {
    const lv = level(window2.utilization, settings30.store.warnAt, settings30.store.dangerAt);
    const reset = window2.resetsAt ? window2.resetsAt - Date.now() < 24 * 3600 * 1e3 ? t3(L22.resetsIn).replace("{t}", untilText(window2.resetsAt)) : t3(L22.resetsAt).replace("{t}", dateTimeText(window2.resetsAt)) : "";
    return h4(
      "div",
      { class: "metric" },
      h4("div", { class: "line" }, h4("span", { text: label }), h4("span", { class: "pct", text: `${Math.round(window2.utilization)}%`, style: { color: COLORS2[lv] } })),
      h4("div", { class: "bar" }, h4("i", { style: { width: `${window2.utilization}%`, background: COLORS2[lv] } })),
      reset ? h4("div", { class: "muted", text: reset, style: { fontSize: "12px" } }) : null
    );
  }
  function dayLabel(date) {
    if (date === localDateKey(Date.now())) return t3(L22.todayLong);
    const [y3, m3, d3] = date.split("-").map(Number);
    const at = new Date(y3, m3 - 1, d3);
    return getLang() === "zh" ? `${m3}月${d3}日 ${at.toLocaleDateString("zh-CN", { weekday: "short" })}` : at.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  }
  function dailySection(redraw2) {
    const now2 = Date.now();
    const today = localDateKey(now2);
    const bars = chartDays(days, now2);
    const scale = chartScale(bars);
    const active2 = bars.find((day) => day.date === picked) ?? bars[bars.length - 1];
    const chart = h4("div", { class: "chart", role: "listbox", "aria-label": t3(L22.daily) });
    let activeBar = null;
    for (const day of bars) {
      const has = recorded(day);
      const delta = trackDelta(day.week);
      const bar = h4(
        "button",
        { type: "button", class: `day${has ? "" : " empty"}${day === active2 ? " on" : ""}`, role: "option", "aria-selected": String(day === active2), "aria-label": `${dayLabel(day.date)} ${has ? deltaText(delta) : t3(L22.noRecord)}` },
        h4("span", { class: "v", text: has ? deltaText(delta) : "" }),
        h4("span", { class: "track" }, h4("i", { style: { height: `${has ? Math.min(100, delta / scale * 100) : 0}%` } })),
        h4("span", { text: day.date === today ? t3(L22.todayShort) : String(Number(day.date.slice(8))) })
      );
      bar.addEventListener("click", () => {
        picked = day.date === today ? null : day.date;
        redraw2();
      });
      if (day === active2) activeBar = bar;
      chart.appendChild(bar);
    }
    chart.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      const i3 = bars.indexOf(active2) + (event.key === "ArrowRight" ? 1 : -1);
      const next = bars[Math.max(0, Math.min(bars.length - 1, i3))];
      picked = next.date === today ? null : next.date;
      redraw2();
      chart.getRootNode().querySelector(".day.on")?.focus();
    });
    requestAnimationFrame(() => {
      if (!activeBar) return;
      const right = activeBar.offsetLeft + activeBar.offsetWidth - chart.clientWidth;
      if (chart.scrollLeft < right) chart.scrollLeft = right;
      else if (chart.scrollLeft > activeBar.offsetLeft) chart.scrollLeft = activeBar.offsetLeft;
    });
    const detail = recorded(active2) ? `${t3(L22.dayWeekly).replace("{p}", deltaText(trackDelta(active2.week)))} · ${t3(L22.daySession).replace("{p}", deltaText(trackDelta(active2.session)))}` : t3(L22.noRecord);
    return h4(
      "div",
      { class: "daily" },
      h4("div", { class: "line" }, h4("b", { text: t3(L22.daily) }), h4("span", { class: "detail", text: dayLabel(active2.date) })),
      Object.keys(days).length ? chart : h4("div", { class: "msg", text: t3(L22.noDays) }),
      Object.keys(days).length ? h4("div", { class: "detail", text: detail }) : null,
      h4("div", { class: "note", text: t3(L22.dailyNote) })
    );
  }
  function renderPanel(panel, redraw2) {
    const refreshBtn = h4("button", { type: "button", class: "icon-btn", ...tipAttrs(t3(L22.refresh)), "aria-label": t3(L22.refresh) }, icon("refresh", 15));
    if (loading) refreshBtn.firstElementChild?.classList.add("spin");
    refreshBtn.addEventListener("click", () => refresh2(true));
    panel.appendChild(h4("div", { class: "top" }, icon("gauge", 16), h4("b", { text: t3(L22.title) }), refreshBtn));
    if (error) panel.appendChild(h4("div", { class: "msg bad", text: t3(L22.error).replace("{e}", error) }));
    if (!usage && !error) panel.appendChild(h4("div", { class: "msg", text: t3(L22.loading) }));
    if (usage) {
      const rows = [
        usage.fiveHour && metric(t3(L22.session), usage.fiveHour),
        usage.sevenDay && metric(t3(L22.weekly), usage.sevenDay),
        ...usage.extra.map((e3) => metric(`${t3(L22.weekly)} · ${e3.key}`, e3.window))
      ].filter(Boolean);
      if (!rows.length) panel.appendChild(h4("div", { class: "msg", text: t3(L22.none) }));
      panel.append(...rows);
      if (settings30.store.stats && org) panel.appendChild(dailySection(redraw2));
    }
    panel.appendChild(
      h4(
        "div",
        { class: "foot" },
        h4("span", { text: usage ? t3(L22.updated).replace("{t}", agoText(usage.fetchedAt)) : "" }),
        h4("a", { href: "/settings/usage", text: t3(L22.open) })
      )
    );
  }
  var usageDisplay_default = definePlugin({
    name: "UsageDisplay",
    title: { zh: "用量显示", en: "Usage display" },
    description: {
      zh: "在输入框模型选择器旁同时显示 5 小时会话与每周用量（双圆环 / 百分比），点开看重置时间；普通对话、Claude Code 首页和项目页都有。数据来自 claude.ai 自己的用量接口。",
      en: "Shows the 5-hour session and weekly usage side by side next to the model picker (rings or percent), in chats, Claude Code and project pages; click for reset times. Data comes from claude.ai's own usage endpoint."
    },
    category: "composer",
    icon: "gauge",
    enabledByDefault: true,
    dependencies: ["ClaudeApi", "SlotsApi", "StylesApi", "ChatStateApi"],
    settings: settings30,
    start(scope) {
      addStyle(scope, SLOT_CSS, "usage");
      const panel = createPopover(scope, "usage-panel", PANEL_CSS2);
      const open = (anchor) => {
        if (org) days = loadDays(org);
        picked = null;
        panel.open(anchor, (p4) => renderPanel(p4, () => panel.update()));
        refresh2();
      };
      const item = addSlotItem(scope, "composer", "usage", () => chip(open), -10);
      const update = () => {
        refreshSlotItem(item);
        panel.update();
      };
      listeners2.add(update);
      scope.defer(() => listeners2.delete(update));
      scope.defer(() => (clearTimeout(retryTimer), inflight?.abort()));
      scope.interval(() => refresh2(), settings30.store.refreshSec * 1e3);
      scope.listen(document, "visibilitychange", () => !document.hidden && Date.now() - lastAttempt > settings30.store.refreshSec * 1e3 && refresh2());
      scope.on("reply:end", () => scope.timeout(() => refresh2(true), 2500));
      scope.interval(() => panel.update(), 6e4);
      refresh2(true);
    }
  });

  // sites/claude/plugins/UsageDisplay/index.ts
  var UsageDisplay_default = toFramework(usageDisplay_default);

  // src/plugins/widerChat/index.ts
  var settings31 = definePluginSettings({
    width: { type: "number", label: { zh: "对话最大宽度", en: "Maximum chat width" }, default: 64, min: 40, max: 160, step: 2, unit: "rem" },
    composer: { type: "boolean", label: { zh: "输入框同步加宽", en: "Widen the chat input too" }, default: true }
  });
  var widerCss = (width, composer) => `
:root { --transcript-width: ${width}rem !important; }
[data-testid="transcript-list"] { max-width: ${width}rem !important; }
${composer ? `[data-composer-card-holder], [data-cds="ChatComposer"] { max-width: ${width}rem !important; }
[data-composer-card-holder] { margin-inline: auto; }` : ""}
`;
  var widerChat_default = definePlugin({
    name: "WiderChat",
    title: { zh: "加宽对话", en: "Wider chat" },
    description: { zh: "调整对话区（以及输入框）的最大宽度，宽屏上一屏看更多。", en: "Sets the maximum width of the conversation (and the input) for wide screens." },
    category: "appearance",
    icon: "width",
    enabledByDefault: false,
    dependencies: ["StylesApi"],
    settings: settings31,
    start(scope) {
      const set = addStyle(scope, widerCss(settings31.store.width, settings31.store.composer), "wider-chat");
      this.onSettingsChange = () => set(widerCss(settings31.store.width, settings31.store.composer));
    }
  });

  // sites/claude/plugins/WiderChat/index.ts
  var WiderChat_default = toFramework(widerChat_default);

  // uspp:sites
  var sites_default = [{ id: "claude", site: claude_default, plugins: [((U3) => {
    const d3 = typeof AutoRetry_default === "function" ? AutoRetry_default(U3) : AutoRetry_default;
    d3.site = "claude";
    return d3;
  }), ((U3) => {
    const d3 = typeof Backup_default === "function" ? Backup_default(U3) : Backup_default;
    d3.site = "claude";
    return d3;
  }), ((U3) => {
    const d3 = typeof BetterLinks_default === "function" ? BetterLinks_default(U3) : BetterLinks_default;
    d3.site = "claude";
    return d3;
  }), ((U3) => {
    const d3 = typeof BetterSidebar_default === "function" ? BetterSidebar_default(U3) : BetterSidebar_default;
    d3.site = "claude";
    return d3;
  }), ((U3) => {
    const d3 = typeof CCPPSettings_default === "function" ? CCPPSettings_default(U3) : CCPPSettings_default;
    d3.site = "claude";
    return d3;
  }), ((U3) => {
    const d3 = typeof ChatFavicon_default === "function" ? ChatFavicon_default(U3) : ChatFavicon_default;
    d3.site = "claude";
    return d3;
  }), ((U3) => {
    const d3 = typeof ChatNavigator_default === "function" ? ChatNavigator_default(U3) : ChatNavigator_default;
    d3.site = "claude";
    return d3;
  }), ((U3) => {
    const d3 = typeof ChatNoticeHider_default === "function" ? ChatNoticeHider_default(U3) : ChatNoticeHider_default;
    d3.site = "claude";
    return d3;
  }), ((U3) => {
    const d3 = typeof ChatStateApi_default === "function" ? ChatStateApi_default(U3) : ChatStateApi_default;
    d3.site = "claude";
    return d3;
  }), ((U3) => {
    const d3 = typeof ClaudeApi_default === "function" ? ClaudeApi_default(U3) : ClaudeApi_default;
    d3.site = "claude";
    return d3;
  }), ((U3) => {
    const d3 = typeof Cleaner_default === "function" ? Cleaner_default(U3) : Cleaner_default;
    d3.site = "claude";
    return d3;
  }), ((U3) => {
    const d3 = typeof CodeBrandColor_default === "function" ? CodeBrandColor_default(U3) : CodeBrandColor_default;
    d3.site = "claude";
    return d3;
  }), ((U3) => {
    const d3 = typeof CollapseCode_default === "function" ? CollapseCode_default(U3) : CollapseCode_default;
    d3.site = "claude";
    return d3;
  }), ((U3) => {
    const d3 = typeof ComposerApi_default === "function" ? ComposerApi_default(U3) : ComposerApi_default;
    d3.site = "claude";
    return d3;
  }), ((U3) => {
    const d3 = typeof ComposerLook_default === "function" ? ComposerLook_default(U3) : ComposerLook_default;
    d3.site = "claude";
    return d3;
  }), ((U3) => {
    const d3 = typeof ConsoleJanitor_default === "function" ? ConsoleJanitor_default(U3) : ConsoleJanitor_default;
    d3.site = "claude";
    return d3;
  }), ((U3) => {
    const d3 = typeof CustomGreeting_default === "function" ? CustomGreeting_default(U3) : CustomGreeting_default;
    d3.site = "claude";
    return d3;
  }), ((U3) => {
    const d3 = typeof CustomIdentity_default === "function" ? CustomIdentity_default(U3) : CustomIdentity_default;
    d3.site = "claude";
    return d3;
  }), ((U3) => {
    const d3 = typeof DomApi_default === "function" ? DomApi_default(U3) : DomApi_default;
    d3.site = "claude";
    return d3;
  }), ((U3) => {
    const d3 = typeof ExportChat_default === "function" ? ExportChat_default(U3) : ExportChat_default;
    d3.site = "claude";
    return d3;
  }), ((U3) => {
    const d3 = typeof HideIdentity_default === "function" ? HideIdentity_default(U3) : HideIdentity_default;
    d3.site = "claude";
    return d3;
  }), ((U3) => {
    const d3 = typeof HotkeysApi_default === "function" ? HotkeysApi_default(U3) : HotkeysApi_default;
    d3.site = "claude";
    return d3;
  }), ((U3) => {
    const d3 = typeof InputHistory_default === "function" ? InputHistory_default(U3) : InputHistory_default;
    d3.site = "claude";
    return d3;
  }), ((U3) => {
    const d3 = typeof MenuApi_default === "function" ? MenuApi_default(U3) : MenuApi_default;
    d3.site = "claude";
    return d3;
  }), ((U3) => {
    const d3 = typeof MessageStars_default === "function" ? MessageStars_default(U3) : MessageStars_default;
    d3.site = "claude";
    return d3;
  }), ((U3) => {
    const d3 = typeof MessageTimestamps_default === "function" ? MessageTimestamps_default(U3) : MessageTimestamps_default;
    d3.site = "claude";
    return d3;
  }), ((U3) => {
    const d3 = typeof NetworkApi_default === "function" ? NetworkApi_default(U3) : NetworkApi_default;
    d3.site = "claude";
    return d3;
  }), ((U3) => {
    const d3 = typeof NoDictation_default === "function" ? NoDictation_default(U3) : NoDictation_default;
    d3.site = "claude";
    return d3;
  }), ((U3) => {
    const d3 = typeof NoShareLink_default === "function" ? NoShareLink_default(U3) : NoShareLink_default;
    d3.site = "claude";
    return d3;
  }), ((U3) => {
    const d3 = typeof NoTelemetry_default === "function" ? NoTelemetry_default(U3) : NoTelemetry_default;
    d3.site = "claude";
    return d3;
  }), ((U3) => {
    const d3 = typeof NoticesApi_default === "function" ? NoticesApi_default(U3) : NoticesApi_default;
    d3.site = "claude";
    return d3;
  }), ((U3) => {
    const d3 = typeof ProjectStatus_default === "function" ? ProjectStatus_default(U3) : ProjectStatus_default;
    d3.site = "claude";
    return d3;
  }), ((U3) => {
    const d3 = typeof PromptPresets_default === "function" ? PromptPresets_default(U3) : PromptPresets_default;
    d3.site = "claude";
    return d3;
  }), ((U3) => {
    const d3 = typeof QuickCss_default === "function" ? QuickCss_default(U3) : QuickCss_default;
    d3.site = "claude";
    return d3;
  }), ((U3) => {
    const d3 = typeof RecentChats_default === "function" ? RecentChats_default(U3) : RecentChats_default;
    d3.site = "claude";
    return d3;
  }), ((U3) => {
    const d3 = typeof ReplyNotification_default === "function" ? ReplyNotification_default(U3) : ReplyNotification_default;
    d3.site = "claude";
    return d3;
  }), ((U3) => {
    const d3 = typeof RouterApi_default === "function" ? RouterApi_default(U3) : RouterApi_default;
    d3.site = "claude";
    return d3;
  }), ((U3) => {
    const d3 = typeof RunningPill_default === "function" ? RunningPill_default(U3) : RunningPill_default;
    d3.site = "claude";
    return d3;
  }), ((U3) => {
    const d3 = typeof SidebarDefaultCode_default === "function" ? SidebarDefaultCode_default(U3) : SidebarDefaultCode_default;
    d3.site = "claude";
    return d3;
  }), ((U3) => {
    const d3 = typeof SlotsApi_default === "function" ? SlotsApi_default(U3) : SlotsApi_default;
    d3.site = "claude";
    return d3;
  }), ((U3) => {
    const d3 = typeof StreamerMode_default === "function" ? StreamerMode_default(U3) : StreamerMode_default;
    d3.site = "claude";
    return d3;
  }), ((U3) => {
    const d3 = typeof StylesApi_default === "function" ? StylesApi_default(U3) : StylesApi_default;
    d3.site = "claude";
    return d3;
  }), ((U3) => {
    const d3 = typeof Themes_default === "function" ? Themes_default(U3) : Themes_default;
    d3.site = "claude";
    return d3;
  }), ((U3) => {
    const d3 = typeof TranscriptApi_default === "function" ? TranscriptApi_default(U3) : TranscriptApi_default;
    d3.site = "claude";
    return d3;
  }), ((U3) => {
    const d3 = typeof UsageBannerHider_default === "function" ? UsageBannerHider_default(U3) : UsageBannerHider_default;
    d3.site = "claude";
    return d3;
  }), ((U3) => {
    const d3 = typeof UsageDisplay_default === "function" ? UsageDisplay_default(U3) : UsageDisplay_default;
    d3.site = "claude";
    return d3;
  }), ((U3) => {
    const d3 = typeof WiderChat_default === "function" ? WiderChat_default(U3) : WiderChat_default;
    d3.site = "claude";
    return d3;
  })] }];

  // uspp:plugins
  var plugins_default = [];

  // vendor/userscript-pp/core/lib/utils.js
  var sleep2 = (ms) => new Promise((r3) => setTimeout(r3, ms));
  function debounce(fn2, ms = 100) {
    let t4;
    const d3 = function(...args) {
      clearTimeout(t4);
      t4 = setTimeout(() => fn2.apply(this, args), ms);
    };
    d3.flush = () => {
      clearTimeout(t4);
      fn2();
    };
    d3.cancel = () => clearTimeout(t4);
    return d3;
  }
  function onlyOnce(fn2) {
    let done = false, result;
    return function(...args) {
      if (done) return result;
      done = true;
      return result = fn2.apply(this, args);
    };
  }
  var escapeRegExp = (s3) => String(s3).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  function humanizeKey(key) {
    return String(key).replace(/[-_]+/g, " ").replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2").trim().split(/\s+/).map((w4) => w4.charAt(0).toUpperCase() + w4.slice(1)).join(" ");
  }
  function classNameFactory(prefix = "") {
    return (...names) => names.flat(Infinity).filter(Boolean).map((n2) => prefix + n2).join(" ");
  }
  function classes(...names) {
    const out = [];
    for (const n2 of names.flat(Infinity)) {
      if (!n2) continue;
      if (typeof n2 === "object") {
        for (const k4 in n2) if (n2[k4]) out.push(k4);
      } else out.push(String(n2));
    }
    return out.join(" ");
  }
  async function copyToClipboard(text) {
    if (GM2.clipboard) {
      try {
        const r3 = GM2.clipboard(String(text), "text");
        if (r3 && typeof r3.then === "function") await r3;
        return true;
      } catch {
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.cssText = "position:fixed;opacity:0;top:0;left:0";
      document.body.appendChild(ta);
      ta.select();
      let ok = false;
      try {
        ok = document.execCommand("copy");
      } catch {
      }
      ta.remove();
      return ok;
    }
  }

  // vendor/userscript-pp/core/lib/lazy.js
  function makeLazy(factory, attempts = 5) {
    let tries = 0, cache2;
    return () => {
      if (cache2 == null && tries++ < attempts) cache2 = factory();
      return cache2;
    };
  }
  function proxyLazy(factory, shouldRetry = () => true) {
    let resolved2 = false, value;
    const resolve = () => {
      if (!resolved2 && shouldRetry()) {
        value = factory();
        if (value != null) resolved2 = true;
      }
      return value;
    };
    const target2 = () => {
    };
    return new Proxy(target2, {
      get(_3, key) {
        if (key === "$$uspp_ccpp_Resolve") return resolve;
        const real = resolve();
        if (real == null) return void 0;
        return Reflect.get(real, key);
      },
      set(_3, key, v3) {
        const real = resolve();
        if (real == null) return false;
        return Reflect.set(real, key, v3);
      },
      has(_3, key) {
        const real = resolve();
        return real != null && Reflect.has(real, key);
      },
      ownKeys() {
        const real = resolve();
        const keys = real == null ? [] : Reflect.ownKeys(real).filter((k4) => k4 !== "length" && k4 !== "name");
        return [...keys, "length", "name"];
      },
      getOwnPropertyDescriptor(_3, key) {
        if (key === "length" || key === "name") return Reflect.getOwnPropertyDescriptor(target2, key);
        const real = resolve();
        if (real == null) return void 0;
        const d3 = Reflect.getOwnPropertyDescriptor(real, key);
        if (d3) d3.configurable = true;
        return d3;
      },
      deleteProperty(_3, key) {
        const real = resolve();
        return real != null && Reflect.deleteProperty(real, key);
      },
      apply(_3, thisArg, args) {
        const real = resolve();
        if (typeof real !== "function") throw new Error("Userscript++: 懒加载的值尚未找到");
        return Reflect.apply(real, thisArg, args);
      },
      getPrototypeOf() {
        const real = resolve();
        return real == null ? Function.prototype : Reflect.getPrototypeOf(real);
      }
    });
  }

  // vendor/userscript-pp/core/lib/events.js
  var logger14 = new Logger("Events", "#fde68a");
  var handlers2 = /* @__PURE__ */ new Map();
  var Events = Object.freeze({
    PLUGIN_TOGGLE: "pluginToggle",
    PLUGIN_PIN: "pluginPin",
    PLUGIN_STAR: "pluginStar",
    RELOAD_NEEDED: "reloadNeeded",
    SETTINGS_SYNC: "settingsSync",
    SITE_READY: "siteReady",
    ROUTE_CHANGE: "routeChange"
  });
  var CORE = new Set(Object.values(Events));
  var siteEvents = /* @__PURE__ */ new Set();
  function setSiteEvents(list2) {
    siteEvents = new Set(Array.isArray(list2) ? list2 : []);
  }
  var isKnownEvent = (name) => CORE.has(name) || siteEvents.has(name);
  function subscribe(event, handler) {
    if (!isKnownEvent(event)) logger14.debug(`订阅了当前站点没有声明的事件 ${event}`);
    let set = handlers2.get(event);
    if (!set) handlers2.set(event, set = /* @__PURE__ */ new Set());
    set.add(handler);
    return () => set.delete(handler);
  }
  function dispatch(event, data) {
    const set = handlers2.get(event);
    if (!set) return;
    for (const h5 of [...set]) {
      try {
        h5(data);
      } catch (e3) {
        logger14.error(`事件 ${event} 的处理函数出错`, e3);
      }
    }
  }

  // vendor/userscript-pp/core/lib/settings.js
  var logger15 = new Logger("Settings", "#86efac");
  var STORAGE_KEY = "UserscriptPPSettings";
  var SITE_STORAGE_KEY = `UserscriptPP:${SCRIPT_ID}:settings`;
  var IDB_NAME = `UserscriptPP:${SCRIPT_ID}`;
  var IDB_STORE = "kv";
  var BIGINT_TAG = "$usppBigint";
  var PlainSettings = { plugins: {} };
  var defaultResolver = () => void 0;
  function setDefaultResolver(fn2) {
    defaultResolver = fn2;
  }
  var ready = false;
  var globalListeners = /* @__PURE__ */ new Set();
  var pathListeners = /* @__PURE__ */ new Map();
  var prefixListeners = /* @__PURE__ */ new Map();
  function addTo(map, key, fn2) {
    let s3 = map.get(key);
    if (!s3) map.set(key, s3 = /* @__PURE__ */ new Set());
    s3.add(fn2);
  }
  function callSafe(fn2, ...args) {
    try {
      fn2(...args);
    } catch (e3) {
      logger15.error("设置监听者出错", e3);
    }
  }
  var dirty = /* @__PURE__ */ new Set();
  function emitChange(path, value) {
    for (const fn2 of [...globalListeners]) callSafe(fn2, value, path);
    const exact = pathListeners.get(path);
    if (exact) for (const fn2 of [...exact]) callSafe(fn2, value, path);
    for (const [prefix, set] of prefixListeners) {
      if (path.startsWith(prefix)) {
        for (const fn2 of [...set]) callSafe(fn2, value, path);
      }
    }
  }
  function notify3(path, value) {
    emitChange(path, value);
    if (ready) dirty.add(path);
    scheduleSave();
  }
  var SettingsStore = {
    addChangeListener(path, fn2) {
      addTo(pathListeners, path, fn2);
    },
    removeChangeListener(path, fn2) {
      pathListeners.get(path)?.delete(fn2);
    },
    addPrefixChangeListener(prefix, fn2) {
      addTo(prefixListeners, prefix, fn2);
    },
    removePrefixChangeListener(prefix, fn2) {
      prefixListeners.get(prefix)?.delete(fn2);
    },
    addGlobalChangeListener(fn2) {
      globalListeners.add(fn2);
    },
    removeGlobalChangeListener(fn2) {
      globalListeners.delete(fn2);
    },
    markAsChanged() {
      for (const fn2 of [...globalListeners]) callSafe(fn2, PlainSettings, "");
      scheduleSave();
    }
  };
  var RAW = Symbol("uspp.raw");
  var proxyCache = /* @__PURE__ */ new WeakMap();
  function makeProxy(obj, path) {
    let byPath = proxyCache.get(obj);
    if (!byPath) proxyCache.set(obj, byPath = /* @__PURE__ */ new Map());
    const cached2 = byPath.get(path);
    if (cached2) return cached2;
    const proxy = new Proxy(obj, {
      get(target2, key, receiver) {
        if (key === RAW) return target2;
        if (typeof key === "symbol") return Reflect.get(target2, key, receiver);
        let v3 = target2[key];
        const full = path ? `${path}.${key}` : key;
        if (v3 === void 0) {
          const parts = full.split(".");
          if (parts.length === 3 && parts[0] === "plugins") {
            const def = defaultResolver(parts[1], parts[2]);
            if (def !== void 0) {
              target2[key] = def;
              v3 = def;
            }
          }
        }
        if (v3 !== null && typeof v3 === "object" && !(v3 instanceof Date)) return makeProxy(v3, full);
        return v3;
      },
      set(target2, key, value) {
        if (typeof key === "symbol") return Reflect.set(target2, key, value);
        if (value && typeof value === "object" && value[RAW]) value = value[RAW];
        if (Object.is(target2[key], value) && key in target2) return true;
        target2[key] = value;
        notify3(path ? `${path}.${key}` : key, value);
        return true;
      },
      deleteProperty(target2, key) {
        if (!(key in target2)) return true;
        delete target2[key];
        if (typeof key !== "symbol") notify3(path ? `${path}.${key}` : key, void 0);
        return true;
      }
    });
    byPath.set(path, proxy);
    return proxy;
  }
  var Settings = makeProxy(PlainSettings, "");
  function replacer(_3, v3) {
    return typeof v3 === "bigint" ? { [BIGINT_TAG]: v3.toString() } : v3;
  }
  function reviver(_3, v3) {
    if (v3 && typeof v3 === "object" && typeof v3[BIGINT_TAG] === "string" && Object.keys(v3).length === 1) {
      try {
        return BigInt(v3[BIGINT_TAG]);
      } catch {
        return 0n;
      }
    }
    return v3;
  }
  var serialize = (obj) => JSON.stringify(obj, replacer);
  var SAVED_AT = "$savedAt";
  var savedAtOf = (data) => data && Number(data[SAVED_AT]) || 0;
  function parseStored(raw2) {
    try {
      let v3 = raw2;
      for (let i3 = 0; i3 < 3 && typeof v3 === "string"; i3++) v3 = JSON.parse(v3, reviver);
      if (v3 && typeof v3 === "object" && !Array.isArray(v3)) {
        v3 = JSON.parse(JSON.stringify(v3), reviver);
        const at = Number(v3[SAVED_AT]) || 0;
        delete v3[SAVED_AT];
        Object.defineProperty(v3, SAVED_AT, { value: at, enumerable: false, configurable: true });
        if (v3.plugins && typeof v3.plugins === "object" && Object.keys(v3.plugins).length > 0) return v3;
      }
    } catch {
    }
    return null;
  }
  function idbOpen() {
    return new Promise((resolve, reject) => {
      const idb = W3.indexedDB || window.indexedDB;
      if (!idb) return reject(new Error("no indexedDB"));
      const req = idb.open(IDB_NAME, 1);
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains(IDB_STORE)) req.result.createObjectStore(IDB_STORE);
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  async function idbGet(key) {
    const db2 = await idbOpen();
    try {
      return await new Promise((resolve, reject) => {
        const r3 = db2.transaction(IDB_STORE, "readonly").objectStore(IDB_STORE).get(key);
        r3.onsuccess = () => resolve(r3.result);
        r3.onerror = () => reject(r3.error);
      });
    } finally {
      db2.close();
    }
  }
  async function idbSet(key, value) {
    const db2 = await idbOpen();
    try {
      await new Promise((resolve, reject) => {
        const tx2 = db2.transaction(IDB_STORE, "readwrite");
        tx2.objectStore(IDB_STORE).put(value, key);
        tx2.oncomplete = () => resolve();
        tx2.onerror = () => reject(tx2.error);
      });
    } finally {
      db2.close();
    }
  }
  function lsGet() {
    try {
      return (W3.localStorage || localStorage).getItem(SITE_STORAGE_KEY);
    } catch {
      return null;
    }
  }
  function replaceContents(data) {
    for (const k4 of Object.keys(PlainSettings)) delete PlainSettings[k4];
    Object.assign(PlainSettings, data);
    if (!PlainSettings.plugins || typeof PlainSettings.plugins !== "object") PlainSettings.plugins = {};
  }
  function mergeMissing(into, from) {
    for (const k4 of Object.keys(from)) {
      if (!(k4 in into)) into[k4] = from[k4];
      else if (into[k4] && from[k4] && typeof into[k4] === "object" && typeof from[k4] === "object" && !Array.isArray(into[k4])) mergeMissing(into[k4], from[k4]);
    }
    return into;
  }
  var syncBase = null;
  function withoutSame(from, base) {
    if (!base || typeof base !== "object") return from;
    for (const k4 of Object.keys(from)) {
      if (!(k4 in base)) continue;
      const a3 = from[k4], b3 = base[k4];
      if (a3 && b3 && typeof a3 === "object" && typeof b3 === "object" && !Array.isArray(a3) && !Array.isArray(b3)) {
        withoutSame(a3, b3);
        if (Object.keys(a3).length === 0) delete from[k4];
      } else if (JSON.stringify(a3, replacer) === JSON.stringify(b3, replacer)) delete from[k4];
    }
    return from;
  }
  function loadSync() {
    if (!GM2.get) return false;
    try {
      const raw2 = GM2.get(STORAGE_KEY);
      if (raw2 && typeof raw2.then === "function") return false;
      const data = parseStored(raw2);
      if (data) {
        syncBase = JSON.parse(serialize(data), reviver);
        replaceContents(data);
        return true;
      }
    } catch (e3) {
      logger15.warn("同步读取设置失败", e3);
    }
    return false;
  }
  function richness(v3, key) {
    if (key === "enabled") return 0;
    if (Array.isArray(v3)) return 1 + v3.reduce((n2, x4) => n2 + richness(x4), 0);
    if (v3 && typeof v3 === "object") return 1 + Object.keys(v3).reduce((n2, k4) => n2 + richness(v3[k4], k4), 0);
    if (v3 === "" || v3 == null) return 0;
    return 1;
  }
  var isEmpty = (v3) => v3 == null || v3 === "" || Array.isArray(v3) && v3.length === 0 || typeof v3 === "object" && !Array.isArray(v3) && Object.keys(v3).length === 0;
  function fillFrom(into, from) {
    for (const k4 of Object.keys(from)) {
      const a3 = into[k4], b3 = from[k4];
      if (!(k4 in into) || isEmpty(a3) && !isEmpty(b3)) into[k4] = b3;
      else if (a3 && b3 && typeof a3 === "object" && typeof b3 === "object" && !Array.isArray(a3) && !Array.isArray(b3)) fillFrom(a3, b3);
    }
    return into;
  }
  var useSiteStorage = () => !isGeneric();
  async function loadAsync() {
    const sources = [["GM", async () => GM2.get ? await GM2.get(STORAGE_KEY) : null]];
    if (useSiteStorage()) sources.push(["IndexedDB", () => idbGet(SITE_STORAGE_KEY)], ["localStorage", lsGet]);
    const found = [];
    for (const [name, read2] of sources) {
      try {
        const data = parseStored(await read2());
        if (data) found.push({ name, data, at: savedAtOf(data), score: richness(data) });
      } catch (e3) {
        logger15.debug(`从 ${name} 读取失败`, e3);
      }
    }
    if (found.length) {
      found.sort((a3, b3) => b3.at - a3.at || b3.score - a3.score);
      const data = found[0].data;
      if (!found[0].at) for (const f3 of found.slice(1)) fillFrom(data, f3.data);
      const memory2 = withoutSame(JSON.parse(serialize(PlainSettings), reviver), syncBase);
      syncBase = null;
      replaceContents(mergeMissing(data, memory2));
      logger15.info(`设置已从 ${found[0].at ? found[0].name : found.map((f3) => f3.name).join(" + ")} 读取`);
    }
    ready = true;
    return found.length > 0;
  }
  var underDirty = (path) => {
    for (const d3 of dirty) if (d3 === path || d3.startsWith(path + ".") || path.startsWith(d3 + ".")) return true;
    return false;
  };
  function applyRemote(data) {
    if (!ready || !data || typeof data !== "object") return 0;
    const changedPaths = [];
    const walk = (target2, src, path) => {
      for (const k4 of Object.keys(src)) {
        const full = path ? `${path}.${k4}` : k4;
        const a3 = target2[k4], b3 = src[k4];
        if (a3 && b3 && typeof a3 === "object" && typeof b3 === "object" && !Array.isArray(a3) && !Array.isArray(b3)) {
          walk(a3, b3, full);
          continue;
        }
        if (underDirty(full)) continue;
        if (JSON.stringify(a3, replacer) === JSON.stringify(b3, replacer)) continue;
        target2[k4] = b3;
        changedPaths.push(full);
        emitChange(full, b3);
      }
      if (path === "" || path === "plugins") return;
      for (const k4 of Object.keys(target2)) {
        if (Object.prototype.hasOwnProperty.call(src, k4)) continue;
        const full = path ? `${path}.${k4}` : k4;
        if (underDirty(full)) continue;
        delete target2[k4];
        changedPaths.push(full);
        emitChange(full, void 0);
      }
    };
    walk(PlainSettings, data, "");
    if (changedPaths.length) {
      logger15.debug(`已从其他标签页同步 ${changedPaths.length} 项设置`);
      dispatch(Events.SETTINGS_SYNC, { paths: changedPaths });
    }
    return changedPaths.length;
  }
  function replaceAll(data) {
    const before = JSON.parse(serialize(PlainSettings), reviver);
    replaceContents(data);
    const paths = [];
    const diff = (a3, b3, path) => {
      const isObj = (v3) => v3 && typeof v3 === "object" && !Array.isArray(v3);
      if (isObj(a3) && isObj(b3)) {
        for (const k4 of /* @__PURE__ */ new Set([...Object.keys(a3), ...Object.keys(b3)])) diff(a3[k4], b3[k4], path ? `${path}.${k4}` : k4);
        return;
      }
      if (JSON.stringify(a3, replacer) !== JSON.stringify(b3, replacer)) paths.push(path);
    };
    diff(before, PlainSettings, "");
    for (const path of paths) {
      const v3 = path.split(".").reduce((o3, k4) => o3 == null ? void 0 : o3[k4], PlainSettings);
      emitChange(path, v3);
      if (ready) dirty.add(path);
    }
    scheduleSave();
    return paths.length;
  }
  var syncInstalled = false;
  function installCrossTabSync() {
    if (syncInstalled) return;
    syncInstalled = true;
    if (GM2.addListener) {
      try {
        GM2.addListener(STORAGE_KEY, (_name, _old, value, remote) => {
          if (!remote) return;
          const data = parseStored(value);
          if (data) applyRemote(data);
        });
      } catch (e3) {
        logger15.debug("监听脚本管理器存储失败", e3);
      }
    }
    if (useSiteStorage()) {
      W3.addEventListener("storage", (e3) => {
        if (e3.key !== SITE_STORAGE_KEY || e3.newValue == null) return;
        const data = parseStored(e3.newValue);
        if (data) applyRemote(data);
      });
    }
  }
  var lastGmBody = null;
  var lastSiteBody = null;
  var SITE_BACKUP_DELAY = 2e3;
  var siteTimer = 0;
  var siteJson = null;
  var needLsSync = () => !GM2.addListener;
  async function saveNow({ flushBackup = false } = {}) {
    if (!ready) return;
    if (!PlainSettings.plugins || Object.keys(PlainSettings.plugins).length === 0) return;
    let body;
    try {
      body = serialize(PlainSettings);
    } catch (e3) {
      logger15.warn("设置序列化失败", e3);
      return;
    }
    dirty.clear();
    pendingSave = false;
    const json = body === lastGmBody && body === lastSiteBody ? null : serialize({ ...PlainSettings, [SAVED_AT]: Date.now() });
    if (GM2.set && body !== lastGmBody) {
      try {
        try {
          const r3 = GM2.set(STORAGE_KEY, JSON.parse(json));
          if (r3 && typeof r3.then === "function") await r3;
        } catch {
          const r3 = GM2.set(STORAGE_KEY, json);
          if (r3 && typeof r3.then === "function") await r3;
        }
        lastGmBody = body;
      } catch (e3) {
        logger15.warn("写入设置失败", e3);
      }
    }
    if (!useSiteStorage() || body === lastSiteBody) {
      if (flushBackup) await flushSiteBackup();
      return;
    }
    siteJson = { body, json };
    if (flushBackup) await flushSiteBackup();
    else if (!siteTimer) siteTimer = setTimeout(() => {
      flushSiteBackup();
    }, needLsSync() ? 0 : SITE_BACKUP_DELAY);
  }
  async function flushSiteBackup() {
    clearTimeout(siteTimer);
    siteTimer = 0;
    const pending2 = siteJson;
    siteJson = null;
    if (!pending2) return;
    const ls = W3.localStorage || localStorage;
    if (needLsSync()) {
      try {
        ls.setItem(SITE_STORAGE_KEY, pending2.json);
      } catch (e3) {
        logger15.debug("写入 localStorage 备份失败", e3);
      }
    } else {
      try {
        if (ls.getItem(SITE_STORAGE_KEY) != null) ls.removeItem(SITE_STORAGE_KEY);
      } catch {
      }
    }
    try {
      await idbSet(SITE_STORAGE_KEY, pending2.json);
      lastSiteBody = pending2.body;
    } catch (e3) {
      logger15.debug("写入 IndexedDB 备份失败", e3);
    }
  }
  var pendingSave = false;
  var debouncedSave = debounce(() => {
    saveNow();
  }, 100);
  var scheduleSave = Object.assign(() => {
    pendingSave = true;
    debouncedSave();
  }, { cancel: () => debouncedSave.cancel() });
  function installUnloadSave() {
    const flush3 = () => {
      if (!pendingSave && !siteJson) return;
      scheduleSave.cancel();
      saveNow({ flushBackup: true });
    };
    W3.addEventListener("beforeunload", flush3);
    W3.addEventListener("pagehide", flush3);
  }

  // vendor/userscript-pp/core/lib/net.js
  var CONNECT = typeof define_USPP_CONNECT_default !== "undefined" ? define_USPP_CONNECT_default : ["*"];
  var allowedHosts = () => CONNECT.slice();
  function hostAllowed(host4, list2 = CONNECT) {
    const hn2 = String(host4 || "").toLowerCase();
    if (!hn2) return false;
    const self = (() => {
      try {
        return W3.location.hostname.toLowerCase();
      } catch {
        return "";
      }
    })();
    if (hn2 === self) return true;
    return list2.some((raw2) => {
      const h5 = String(raw2).toLowerCase();
      return h5 === "*" || h5 === "self" && hn2 === self || hn2 === h5 || hn2.endsWith("." + h5);
    });
  }
  var blocked = [];
  var blockedRequests = () => blocked.slice();
  function denyReason(url, plugin, pluginHosts) {
    let u3, base;
    try {
      base = W3.location.href;
    } catch {
    }
    try {
      u3 = new URL(url, base);
    } catch {
      return `invalid URL: ${String(url).slice(0, 100)}`;
    }
    if (!/^https?:$/.test(u3.protocol)) return `only http(s) URLs are allowed (${u3.protocol})`;
    const host4 = u3.hostname;
    let why = null;
    if (!hostAllowed(host4)) why = `${host4} is not in this script's allowed hosts (${CONNECT.join(", ") || "none"})`;
    else if (plugin && pluginHosts && !hostAllowed(host4, pluginHosts)) why = `${host4} is not in ${plugin}'s declared hosts (${pluginHosts.join(", ") || "none"})`;
    if (why) {
      if (blocked.length >= 50) blocked.shift();
      blocked.push({ host: host4, plugin: plugin || null, at: (/* @__PURE__ */ new Date()).toISOString() });
    }
    return why;
  }
  function fetchExternalFor(plugin, hosts2) {
    const list2 = Array.isArray(hosts2) ? hosts2.map(String) : null;
    return (url, opts) => request(url, opts, plugin, list2);
  }
  function fetchExternal(url, opts) {
    return request(url, opts, null, null);
  }
  function request(url, { timeout = 3e4 } = {}, plugin, pluginHosts) {
    const why = denyReason(url, plugin, pluginHosts);
    if (why) return Promise.reject(new Error(`Request blocked: ${why}`));
    if (!GM2.xhr) return W3.fetch(url);
    return new Promise((resolve, reject) => {
      GM2.xhr({
        method: "GET",
        url,
        timeout,
        responseType: "text",
        onload: (r3) => {
          const headers = new Headers();
          for (const line of String(r3.responseHeaders || "").split(/\r?\n/)) {
            const i3 = line.indexOf(":");
            if (i3 > 0) {
              try {
                headers.append(line.slice(0, i3).trim(), line.slice(i3 + 1).trim());
              } catch {
              }
            }
          }
          const status = r3.status || 200;
          const body = status === 204 || status === 304 ? null : r3.responseText ?? r3.response ?? "";
          try {
            resolve(new Response(body, { status: status < 200 || status > 599 ? 200 : status, statusText: r3.statusText || "", headers }));
          } catch (e3) {
            reject(e3);
          }
        },
        onerror: () => reject(new Error("网络错误")),
        ontimeout: () => reject(new Error("请求超时")),
        onabort: () => reject(new Error("请求被中止"))
      });
    });
  }

  // vendor/userscript-pp/core/lib/bridge.js
  var allowed = /* @__PURE__ */ new Map();
  var resolvers = /* @__PURE__ */ new Map();
  var pluginResolver = () => null;
  var facades = /* @__PURE__ */ new Map();
  var boundCache = /* @__PURE__ */ new WeakMap();
  var SELF_REF = /\$self\.([A-Za-z_$][\w$]*)/g;
  var pluginSelfKey = (name) => `plugin:${name}`;
  function allowSelfRefs(key, code) {
    if (typeof code !== "string") return;
    let set = allowed.get(key);
    for (const m3 of code.matchAll(SELF_REF)) {
      if (!set) allowed.set(key, set = /* @__PURE__ */ new Set());
      set.add(m3[1]);
    }
  }
  function setPluginResolver(fn2) {
    pluginResolver = typeof fn2 === "function" ? fn2 : () => null;
  }
  function setSelfTarget(key, getTarget) {
    resolvers.set(key, getTarget);
  }
  var targetOf = (key) => key.startsWith("plugin:") ? pluginResolver(key.slice(7)) : resolvers.get(key)?.() ?? null;
  function bound(target2, fn2) {
    let byFn = boundCache.get(target2);
    if (!byFn) boundCache.set(target2, byFn = /* @__PURE__ */ new Map());
    let b3 = byFn.get(fn2);
    if (!b3) byFn.set(fn2, b3 = function(...a3) {
      return fn2.apply(target2, a3);
    });
    return b3;
  }
  function selfFacade(key) {
    let f3 = facades.get(key);
    if (f3) return f3;
    f3 = new Proxy(Object.freeze(/* @__PURE__ */ Object.create(null)), {
      get(_3, prop) {
        if (typeof prop !== "string" || !allowed.get(key)?.has(prop)) return void 0;
        const t4 = targetOf(key);
        if (!t4) return void 0;
        const v3 = t4[prop];
        return typeof v3 === "function" ? bound(t4, v3) : v3;
      },
      has(_3, prop) {
        return typeof prop === "string" && !!allowed.get(key)?.has(prop);
      },
      set() {
        return false;
      },
      defineProperty() {
        return false;
      },
      deleteProperty() {
        return false;
      },
      setPrototypeOf() {
        return false;
      }
    });
    facades.set(key, f3);
    return f3;
  }
  var bridge = /* @__PURE__ */ Object.create(null);
  Object.defineProperties(bridge, {
    scriptId: { value: SCRIPT_ID, enumerable: true },
    version: { value: VERSION, enumerable: true },
    // bridge.plugins[名字] -> 该插件的门面(补丁里 $self 展开成这个)
    plugins: { enumerable: true, value: new Proxy(Object.freeze(/* @__PURE__ */ Object.create(null)), { get: (_3, name) => typeof name === "string" ? selfFacade(pluginSelfKey(name)) : void 0, set: () => false, defineProperty: () => false }) },
    site: { enumerable: true, value: Object.freeze({ get settingsHost() {
      return selfFacade("settingsHost");
    } }) },
    // 编译用的临时槽:内联 <script> 把编译结果放进来,compile() 立刻取走
    [Symbol.for("uspp.ccpp.compiled")]: { value: /* @__PURE__ */ Object.create(null) }
  });
  function installBridge(W4, api) {
    if (false) Object.defineProperty(bridge, "api", { value: api });
    Object.preventExtensions(bridge);
    Object.defineProperty(W4, INSTANCE_KEY, { value: bridge, writable: false, configurable: true, enumerable: false });
  }

  // vendor/userscript-pp/core/lib/patches.js
  var logger16 = new Logger("Patcher", "#c4b5fd");
  var IDENT = "(?:[A-Za-z_$][\\w$]*)";
  function expandIdent(source) {
    let out = "";
    for (let i3 = 0; i3 < source.length; i3++) {
      const c4 = source[i3];
      if (c4 === "\\") {
        const n2 = source[i3 + 1];
        if (n2 === "i") out += IDENT;
        else out += c4 + (n2 ?? "");
        i3++;
      } else out += c4;
    }
    return out;
  }
  function canonicalizeRegex(re) {
    if (!(re instanceof RegExp)) return re;
    if (re.$$uspp_ccpp_Canonical) return re;
    const expanded = new RegExp(expandIdent(re.source), re.flags);
    const original = re.toString();
    Object.defineProperty(expanded, "toString", { value: () => original, configurable: true });
    Object.defineProperty(expanded, "$$uspp_ccpp_Canonical", { value: true });
    return expanded;
  }
  function canonicalizeFind(find2) {
    if (Array.isArray(find2)) return find2.map(canonicalizeRegex);
    return canonicalizeRegex(find2);
  }
  function matchesOne(code, f3) {
    if (typeof f3 === "string") return code.includes(f3);
    if (f3 instanceof RegExp) {
      f3.lastIndex = 0;
      return f3.test(code);
    }
    return false;
  }
  function matchesFind(code, find2) {
    if (Array.isArray(find2)) return find2.length > 0 && find2.every((f3) => matchesOne(code, f3));
    return matchesOne(code, find2);
  }
  var describeFind = (find2) => Array.isArray(find2) ? find2.map(String).join(" & ") : String(find2);
  var selfExpr = (name) => `${INSTANCE_EXPR}.plugins[${JSON.stringify(name)}]`;
  var pluginSelf = (name) => ({ key: pluginSelfKey(name), expr: selfExpr(name) });
  function canonicalizeReplacement(r3, pluginName, self = pluginSelf(pluginName)) {
    const match = canonicalizeRegex(r3.match);
    let replace = r3.replace;
    if (typeof replace === "string") {
      if (false) {
        const refs = [...replace.matchAll(/\$(\d+)/g)].map((m3) => +m3[1]);
        const max = refs.length ? Math.max(...refs) : 0;
        if (max > countGroups(match)) logger16.warn(`${pluginName}: 替换引用了 $${max},但 match 只有 ${countGroups(match)} 个捕获组`, String(match));
      }
      allowSelfRefs(self.key, replace);
      replace = replace.replaceAll("$self", self.expr);
    } else if (typeof replace === "function") {
      const fn2 = replace;
      replace = (...args) => {
        const out = String(fn2(...args));
        allowSelfRefs(self.key, out);
        return out.replaceAll("$self", self.expr);
      };
    }
    return { ...r3, match, replace };
  }
  var seq = 0;
  function canonicalizePatch(patch, pluginName, checkOnly = false, self) {
    const reps = Array.isArray(patch.replacement) ? patch.replacement : patch.replacement ? [patch.replacement] : [];
    return {
      id: ++seq,
      plugin: pluginName,
      find: canonicalizeFind(patch.find),
      rawFind: patch.find,
      replacement: reps.map((r3) => canonicalizeReplacement(r3, pluginName, self)),
      all: !!patch.all,
      group: !!patch.group,
      noWarn: !!patch.noWarn,
      predicate: patch.predicate,
      checkOnly,
      consumed: false
    };
  }
  function runPredicate(pred, label) {
    if (typeof pred !== "function") return true;
    try {
      return !!pred();
    } catch (e3) {
      logger16.error(`${label} 的 predicate 抛出异常`, e3);
      return false;
    }
  }
  function requiredLiteral(re) {
    if (!(re instanceof RegExp) || re.flags.includes("i")) return null;
    const src = re.source;
    let best = "", run = "", depth = 0;
    const flush3 = () => {
      if (run.length > best.length) best = run;
      run = "";
    };
    for (let i3 = 0; i3 < src.length; i3++) {
      const c4 = src[i3];
      if (c4 === "\\") {
        const n2 = src[i3 + 1];
        i3++;
        if (n2 === void 0) break;
        if (depth === 0 && /[^\w]/.test(n2)) {
          if ("?*{".includes(src[i3 + 1])) flush3();
          else run += n2;
        } else {
          if (depth === 0) flush3();
          const skip = { x: /^[0-9a-fA-F]{0,2}/, u: /^(\{[^}]*\}|[0-9a-fA-F]{0,4})/, c: /^[A-Za-z]?/, k: /^<[^>]*>/, p: /^\{[^}]*\}/, P: /^\{[^}]*\}/ }[n2] ?? (/\d/.test(n2) ? /^\d*/ : null);
          if (skip) i3 += skip.exec(src.slice(i3 + 1))[0].length;
        }
        continue;
      }
      if (c4 === "[") {
        flush3();
        for (i3++; i3 < src.length && src[i3] !== "]"; i3++) if (src[i3] === "\\") i3++;
        continue;
      }
      if (c4 === "(") {
        if (depth === 0) flush3();
        depth++;
        continue;
      }
      if (c4 === ")") {
        depth = Math.max(0, depth - 1);
        continue;
      }
      if (depth > 0) continue;
      if (c4 === "|") return null;
      if (c4 === "?" || c4 === "*" || c4 === "{") {
        run = run.slice(0, -1);
        flush3();
        if (c4 === "{") {
          while (i3 < src.length && src[i3] !== "}") i3++;
        }
        continue;
      }
      if (c4 === "+") {
        flush3();
        continue;
      }
      if (c4 === "." || c4 === "^" || c4 === "$") {
        flush3();
        continue;
      }
      run += c4;
    }
    flush3();
    return best.length >= 3 ? best : null;
  }
  function literalOfFind(find2) {
    const one = (f3) => typeof f3 === "string" ? f3.length ? f3 : null : requiredLiteral(f3);
    if (!Array.isArray(find2)) return one(find2);
    let best = null;
    for (const f3 of find2) {
      const l3 = one(f3);
      if (l3 && (!best || l3.length > best.length)) best = l3;
    }
    return best;
  }
  var escapeRe = (s3) => s3.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  var prefilters = /* @__PURE__ */ new WeakMap();
  function prefilterOf(patchList) {
    let pf = prefilters.get(patchList);
    if (pf && pf.length === patchList.length) return pf;
    const members = /* @__PURE__ */ new Set(), lits = /* @__PURE__ */ new Set();
    for (const p4 of patchList) {
      const lit = literalOfFind(p4.find);
      if (!lit) continue;
      members.add(p4);
      lits.add(lit);
    }
    pf = { length: patchList.length, members, re: lits.size ? new RegExp([...lits].map(escapeRe).join("|")) : null };
    prefilters.set(patchList, pf);
    return pf;
  }
  function applyPatches(moduleId, source, patchList, stats2) {
    let code = source;
    const appliedPlugins = /* @__PURE__ */ new Set();
    const results = [];
    const mismatches = [];
    const pf = prefilterOf(patchList);
    const skipMembers = !!pf.re && !pf.re.test(source);
    for (const p4 of patchList) {
      if (p4.consumed) continue;
      if (skipMembers && code === source && pf.members.has(p4)) continue;
      if (!runPredicate(p4.predicate, p4.plugin)) continue;
      let hit;
      const t0 = false ? now() : 0;
      try {
        hit = matchesFind(code, p4.find);
      } catch (e3) {
        logger16.error(`${p4.plugin}: find 出错`, e3);
        continue;
      }
      if (false) p4.ms = (p4.ms || 0) + (now() - t0);
      if (!hit) continue;
      if (!p4.all) p4.consumed = true;
      if (p4.checkOnly) {
        for (const r3 of p4.replacement) {
          if (!matchesOne(code, r3.match)) mismatches.push({ plugin: p4.plugin, find: describeFind(p4.rawFind), match: String(r3.match), moduleId });
        }
        continue;
      }
      const before = code;
      const statuses = [];
      let failed2 = false;
      for (const r3 of p4.replacement) {
        if (!runPredicate(r3.predicate, p4.plugin)) {
          statuses.push({ match: String(r3.match), status: "skipped" });
          continue;
        }
        try {
          if (r3.match instanceof RegExp) r3.match.lastIndex = 0;
          const next = code.replace(r3.match, r3.replace);
          if (next === code) {
            statuses.push({ match: String(r3.match), status: "noEffect" });
            stats2.noEffect++;
            failed2 = true;
            if (!p4.noWarn && !r3.noWarn) logger16.warn(`${p4.plugin}: 替换无效果(模块 ${moduleId})`, describeFind(p4.rawFind), String(r3.match));
          } else {
            code = next;
            statuses.push({ match: String(r3.match), status: "applied" });
          }
        } catch (e3) {
          statuses.push({ match: String(r3.match), status: "error", error: String(e3) });
          stats2.errors++;
          failed2 = true;
          logger16.error(`${p4.plugin}: 替换出错(模块 ${moduleId})`, describeFind(p4.rawFind), e3);
        }
      }
      if (p4.group && failed2) {
        code = before;
        for (const s3 of statuses) if (s3.status === "applied" || s3.status === "noEffect") s3.status = "reverted";
        if (!p4.noWarn) logger16.warn(`${p4.plugin}: 成组补丁未全部生效,已撤销(模块 ${moduleId})`, describeFind(p4.rawFind));
      }
      const appliedCount = statuses.filter((s3) => s3.status === "applied").length;
      if (appliedCount) appliedPlugins.add(p4.plugin);
      results.push({ plugin: p4.plugin, find: describeFind(p4.rawFind), moduleId, replacements: statuses });
    }
    return { code, applied: [...appliedPlugins], results, mismatches };
  }

  // vendor/userscript-pp/core/lib/turbopack.js
  var logger17 = new Logger("Turbopack", "#93c5fd");
  var fnToString = Function.prototype.toString;
  var META = Symbol.for("uspp.ccpp.factory");
  var patches = [];
  var patchResults = [];
  var patchStats = { applied: 0, bypassed: 0, noEffect: 0, errors: 0, runtimeFallbacks: 0, patchedModules: /* @__PURE__ */ new Set(), injectionFallbacks: /* @__PURE__ */ new Set() };
  var checkOnlyMismatches = [];
  var moduleCache = /* @__PURE__ */ new Map();
  var factories = /* @__PURE__ */ new Map();
  var chunkPaths = /* @__PURE__ */ new Set();
  var wrapperOf = /* @__PURE__ */ new WeakMap();
  var wrappers = /* @__PURE__ */ new WeakSet();
  var metaById = /* @__PURE__ */ new Map();
  var loadListeners = /* @__PURE__ */ new Set();
  var cacheVersion = 0;
  var getCacheVersion = () => cacheVersion;
  var resetVersion = 0;
  var getResetVersion = () => resetVersion;
  var runtime = { registry: null, cache: null, ctx: null };
  var hasOwnToString = (f3) => {
    try {
      return Object.prototype.hasOwnProperty.call(f3, "toString");
    } catch {
      return false;
    }
  };
  function isForeignWrapper(f3) {
    try {
      if (!Object.prototype.hasOwnProperty.call(f3, "toString")) return false;
      return fnToString.call(f3) !== String(f3.toString());
    } catch {
      return false;
    }
  }
  var lostListeners = /* @__PURE__ */ new Set();
  var lostModules = /* @__PURE__ */ new Set();
  var onPatchLost = (cb) => {
    lostListeners.add(cb);
    for (const id of lostModules) safeLost(cb, id);
    return () => lostListeners.delete(cb);
  };
  function onPatchBypassed(pluginName, cb) {
    return onPatchLost((id, _plugins, results) => {
      const mine = results.filter((r3) => r3.plugin === pluginName);
      if (mine.length) cb(mine, id);
    });
  }
  function safeLost(cb, id) {
    if (diag.noFallback) {
      trace("fallback.suppressed", String(id));
      return;
    }
    const meta = metaById.get(id);
    try {
      cb(id, meta ? meta.plugins.slice() : [], meta ? meta.results.filter((r3) => r3.replacements.some((x4) => x4.status === "bypassed")) : []);
    } catch (e3) {
      logger17.error("补丁失效监听者出错", e3);
    }
  }
  var appliedEntries = (meta) => meta.results.flatMap((r3) => r3.replacements.filter((x4) => x4.status === "applied"));
  function markRan(meta) {
    if (meta.ranPatched) return;
    meta.ranPatched = true;
    patchStats.applied += appliedEntries(meta).length;
  }
  function markLost(id, why) {
    if (lostModules.has(id)) return;
    lostModules.add(id);
    const meta = metaById.get(id);
    if (meta) {
      const entries3 = appliedEntries(meta);
      for (const e3 of entries3) {
        e3.status = "bypassed";
        e3.reason = why;
      }
      patchStats.bypassed += entries3.length;
    }
    logger17.warn(`模块 ${id} 的补丁没有生效(${why}),相关插件改用运行时兜底:${meta ? meta.plugins.join(", ") : ""}`);
    trace("patch.lost", { id, why, plugins: meta ? meta.plugins : [] });
    for (const cb of [...lostListeners]) safeLost(cb, id);
  }
  function registerInjectionFallback(pluginName, detail) {
    if (patchStats.injectionFallbacks.has(pluginName)) return;
    patchStats.injectionFallbacks.add(pluginName);
    trace("fallback.enabled", { plugin: pluginName, detail });
    logger17.info(`${pluginName} 的补丁被绕过,已启用运行时兜底${detail ? `(${detail})` : ""}`);
  }
  function checkLostPatches() {
    const c4 = runtime.cache;
    if (!c4) return;
    for (const [id, meta] of metaById) {
      if (meta.ranPatched || lostModules.has(id)) continue;
      const m0 = c4[id];
      if (!(m0 && m0.exports != null)) continue;
      meta.resolve?.();
      if (!meta.patched) continue;
      const m3 = c4[id];
      if (m3 && m3.exports != null && !meta.executing) markLost(id, "被其他脚本的包装绕过");
    }
  }
  var registeredKeys = /* @__PURE__ */ new Set();
  function addPatch(patch, pluginName, { checkOnly = false, key, self } = {}) {
    if (key) {
      if (registeredKeys.has(key)) return null;
      registeredKeys.add(key);
    }
    if (!runPredicate(patch.predicate, pluginName)) return null;
    const p4 = canonicalizePatch(patch, pluginName, checkOnly, self);
    patches.push(p4);
    if (replacedByOther || yieldedTo) queueMicrotask(bypassPending);
    return p4;
  }
  function onModuleLoad(cb) {
    loadListeners.add(cb);
    return () => loadListeners.delete(cb);
  }
  function registerExports(id, exports) {
    if (exports == null) return;
    applyInjections(id, exports);
    if (moduleCache.has(id)) resetVersion++;
    moduleCache.set(id, exports);
    cacheVersion++;
    for (const cb of [...loadListeners]) {
      try {
        cb(exports, id);
      } catch (e3) {
        logger17.error("模块加载监听者出错", e3);
      }
    }
  }
  function rescanRuntimeCache() {
    const c4 = runtime.cache;
    if (!c4) return 0;
    const fresh = [];
    for (const id of Object.keys(c4)) {
      const key = isNaN(+id) ? id : +id;
      if (moduleCache.has(key)) continue;
      const m3 = c4[id];
      if (m3 && !m3.error && m3.exports != null) {
        applyInjections(key, m3.exports);
        moduleCache.set(key, m3.exports);
        fresh.push([key, m3.exports]);
      }
    }
    if (fresh.length) cacheVersion++;
    for (const [key, exports] of fresh) {
      for (const cb of [...loadListeners]) {
        try {
          cb(exports, key);
        } catch (e3) {
          logger17.error("模块加载监听者出错", e3);
        }
      }
    }
    return fresh.length;
  }
  var lastRuntimeCount = -1;
  function syncRuntimeCache() {
    const c4 = runtime.cache;
    if (!c4) return 0;
    let n2;
    try {
      n2 = Object.keys(c4).length;
    } catch {
      return 0;
    }
    if (n2 === lastRuntimeCount) return 0;
    lastRuntimeCount = n2;
    return rescanRuntimeCache();
  }
  var injections = [];
  function sourceOf(id) {
    const f3 = factories.get(id) ?? factories.get(+id) ?? runtime.registry?.get?.(id) ?? runtime.registry?.get?.(+id);
    if (typeof f3 !== "function") return null;
    try {
      const o3 = f3[META]?.original ?? f3;
      return isForeignWrapper(o3) ? String(o3.toString()) : fnToString.call(o3);
    } catch {
      return null;
    }
  }
  function applyInjection(inj, id, exports) {
    if (inj.removed || inj.targets.has(exports)) return false;
    let added = false;
    for (const [name, get] of Object.entries(inj.exports)) {
      if (name in exports) {
        if (!inj.warned) {
          inj.warned = true;
          logger17.warn(`injectExports:模块 ${id} 已有导出 ${name},不覆盖`);
        }
        continue;
      }
      try {
        Object.defineProperty(exports, name, { get: () => get(exports), enumerable: true, configurable: true });
        inj.added.push([exports, name]);
        added = true;
      } catch (e3) {
        logger17.warn(`injectExports:模块 ${id} 的导出对象不能追加属性`, e3);
      }
    }
    inj.targets.add(exports);
    if (added) inj.modules.add(id);
    return added;
  }
  function applyInjections(id, exports) {
    if (!injections.length || exports == null || typeof exports !== "object" && typeof exports !== "function") return;
    let src;
    for (const inj of injections) {
      if (inj.removed) continue;
      src ??= sourceOf(id) ?? "";
      if (src && matchesFind(src, inj.find)) applyInjection(inj, id, exports);
    }
  }
  function injectExports(find2, exports) {
    const inj = { find: canonicalizeFind(find2), exports: exports || {}, targets: /* @__PURE__ */ new WeakSet(), added: [], modules: /* @__PURE__ */ new Set(), removed: false, warned: false };
    injections.push(inj);
    let changed2 = false;
    for (const [id] of findInRegistry((src) => matchesFind(src, inj.find))) {
      const ex = moduleCache.get(id) ?? (runtime.cache && runtime.cache[id] && !runtime.cache[id].error ? runtime.cache[id].exports : null);
      if (ex != null && applyInjection(inj, id, ex)) changed2 = true;
    }
    if (changed2) {
      cacheVersion++;
      resetVersion++;
    }
    const undo = () => {
      if (inj.removed) return;
      inj.removed = true;
      for (const [ex, name] of inj.added) {
        try {
          delete ex[name];
        } catch {
        }
      }
      injections.splice(injections.indexOf(inj), 1);
      cacheVersion++;
      resetVersion++;
    };
    undo.modules = inj.modules;
    return undo;
  }
  var COMPILED = Symbol.for("uspp.ccpp.compiled");
  function getNonce() {
    const s3 = document.querySelector("script[nonce]");
    return s3 ? s3.nonce || s3.getAttribute("nonce") || "" : "";
  }
  function compile2(id, code, kind = "turbopack") {
    const sourceURL = `
//# sourceURL=uspp:///${kind}/module-${String(id).replace(/[^\w.-]/g, "_")}.js`;
    const ns = W3[INSTANCE_KEY];
    try {
      if (ns && document.documentElement) {
        const bag2 = ns[COMPILED];
        if (!bag2) throw new Error("页面桥上没有编译槽");
        const key = "m" + String(id).replace(/[^\w]/g, "_");
        delete bag2[key];
        const el = document.createElement("script");
        const nonce = getNonce();
        if (nonce) el.nonce = nonce;
        el.textContent = `${INSTANCE_EXPR}[Symbol.for("uspp.ccpp.compiled")][${JSON.stringify(key)}]=(${code}
);${sourceURL}`;
        (document.head || document.documentElement).appendChild(el);
        el.remove();
        const fn2 = bag2[key];
        delete bag2[key];
        if (typeof fn2 === "function") return fn2;
      }
    } catch (e3) {
      logger17.debug("内联 script 编译失败,改用 Function", e3);
    }
    const F4 = W3.Function || Function;
    return new F4(`return (${code}
);${sourceURL}`)();
  }
  function captureRuntime(ctx) {
    if (runtime.registry || !ctx || typeof ctx !== "object") return;
    try {
      const proto = Object.getPrototypeOf(ctx);
      const reg = proto && proto.M;
      const cache2 = proto && proto.c;
      if (!(reg instanceof W3.Map || reg instanceof Map) || !cache2 || typeof cache2 !== "object") return;
      runtime.registry = reg;
      runtime.cache = cache2;
      runtime.ctx = ctx;
      trace("runtime.captured", { registry: reg.size, cache: Object.keys(cache2).length });
      if (diag.noRegistry) trace("registry.skipped");
      else hookRegistry(reg);
      rescanRuntimeCache();
    } catch (e3) {
      logger17.error("获取运行时注册表失败", e3);
    }
  }
  var nativeMapSet = Map.prototype.set;
  var seenModule = (id) => metaById.has(id) || metaById.has(String(id)) || metaById.has(+id);
  function hookRegistry(reg) {
    const prevSet = reg.set;
    for (const [id, f3] of reg) {
      if (typeof f3 !== "function" || wrappers.has(f3) || seenModule(id)) continue;
      if (runtime.cache && runtime.cache[id]) {
        if (!factories.has(id)) factories.set(id, f3);
        continue;
      }
      try {
        nativeMapSet.call(reg, id, wrapFactory(id, f3));
        trace("registry.rewrap", id);
      } catch {
      }
    }
    trace("registry.hooked", { size: reg.size });
    reg.set = function(id, f3) {
      count("registry.set");
      if (typeof f3 === "function" && !wrappers.has(f3) && !seenModule(id)) {
        f3 = wrapFactory(id, f3);
        trace("registry.wrapOnSet", id);
      }
      return prevSet.call(this, id, f3);
    };
  }
  var TURBOPACK_ADAPTER = {
    kind: "turbopack",
    capture: (a3) => captureRuntime(a3[0]),
    exportsOf: (a3) => a3[1] && a3[1].exports,
    fresh: (self, original, a3) => runOriginalFresh(self, original, a3[0], a3[1], a3[2], a3)
  };
  function wrapFactory(id, original, adapter = TURBOPACK_ADAPTER) {
    if (wrappers.has(original)) return original;
    const existing = wrapperOf.get(original);
    if (existing) return existing;
    if (!factories.has(id)) factories.set(id, original);
    const lazy = hasOwnToString(original);
    let foreign = false;
    let source = null;
    let resolved2 = false;
    trace("factory.wrap", { id, lazy });
    const meta = { id, original, patched: false, plugins: [], results: [], code: null, compiled: null, compileFailed: false, deferred: false, ranPatched: false, executing: false };
    const resolve = () => {
      if (resolved2) return;
      resolved2 = true;
      try {
        if (lazy) {
          const own = String(original.toString());
          foreign = own !== fnToString.call(original);
          source = own;
        } else source = fnToString.call(original);
      } catch {
      }
      if (!source) return;
      if (adapter.normalize) source = adapter.normalize(source);
      const res = applyPatches(id, source, patches, patchStats);
      if (res.results.length) patchResults.push(...res.results);
      if (res.mismatches.length) checkOnlyMismatches.push(...res.mismatches);
      if (res.code !== source) {
        meta.patched = true;
        meta.results = res.results;
        meta.plugins = res.applied;
        meta.code = res.code;
        patchStats.patchedModules.add(id);
        meta.deferred = foreign;
      }
    };
    meta.resolve = resolve;
    if (!lazy) resolve();
    const wrapper = function(a0, a1, a22) {
      adapter.capture(arguments);
      resolve();
      trace("factory.run", { id, patched: meta.patched, deferred: meta.deferred });
      let fn2 = original;
      if (meta.patched && meta.deferred) {
        markLost(id, "内层是其他脚本的包装");
      } else if (meta.patched && !meta.compileFailed) {
        if (!meta.compiled) {
          try {
            meta.compiled = compile2(id, meta.code, adapter.kind);
          } catch (e3) {
            meta.compileFailed = true;
            patchStats.errors++;
            logger17.error(`模块 ${id} 补丁后编译失败,改用原始代码(${meta.plugins.join(", ")})`, e3);
          }
        }
        if (meta.compiled) fn2 = meta.compiled;
        else markLost(id, "编译失败");
      }
      let ret;
      meta.executing = true;
      try {
        ret = fn2.apply(this, arguments);
        if (fn2 !== original) markRan(meta);
      } catch (e3) {
        if (fn2 === original) throw e3;
        meta.ranPatched = false;
        markLost(id, "运行出错");
        patchStats.runtimeFallbacks++;
        logger17.error(`模块 ${id} 补丁后运行出错,改用原始代码重新执行(${meta.plugins.join(", ")})`, e3);
        ret = adapter.fresh(this, original, arguments);
      } finally {
        meta.executing = false;
      }
      try {
        registerExports(id, adapter.exportsOf(arguments));
      } catch (e3) {
        logger17.error(e3);
      }
      return ret;
    };
    Object.defineProperty(wrapper, "toString", { value: () => {
      resolve();
      return source != null ? source : fnToString.call(original);
    }, configurable: true, writable: true });
    Object.defineProperty(wrapper, "name", { value: original.name, configurable: true });
    Object.defineProperty(wrapper, META, { value: meta });
    wrappers.add(wrapper);
    wrapperOf.set(original, wrapper);
    if (!metaById.has(id)) metaById.set(id, meta);
    return wrapper;
  }
  function runOriginalFresh(self, original, ctx, mod, exp, args) {
    try {
      if (mod && ctx && typeof ctx === "object") {
        const fresh = {};
        mod.exports = fresh;
        mod.namespaceObject = void 0;
        mod.error = void 0;
        const Ctor = Object.getPrototypeOf(ctx).constructor;
        const freshCtx = new Ctor(mod, fresh);
        return original.call(self, freshCtx, mod, fresh);
      }
    } catch (e3) {
      if (!(e3 instanceof TypeError)) throw e3;
    }
    return original.apply(self, args);
  }
  function getPatchedCode(id) {
    const meta = metaById.get(id) ?? metaById.get(+id) ?? metaById.get(String(id));
    meta?.resolve?.();
    return meta && meta.patched ? meta.code : null;
  }
  function chunkName(head) {
    try {
      if (typeof head === "string") return head;
      if (head && typeof head.getAttribute === "function") return head.getAttribute("src") || "";
      if (head && typeof head.src === "string") return head.src;
    } catch {
    }
    return "";
  }
  var seenChunks = /* @__PURE__ */ new WeakSet();
  function handleChunk(chunk) {
    if (!Array.isArray(chunk) || seenChunks.has(chunk)) return;
    seenChunks.add(chunk);
    const name = chunkName(chunk[0]);
    if (name) chunkPaths.add(name);
    trace("chunk", { name, length: chunk.length });
    let ids = [];
    for (let i3 = 1; i3 < chunk.length; i3++) {
      const v3 = chunk[i3];
      if (typeof v3 === "function") {
        if (ids.length) {
          if (diag.noOwnWrap || diag.noForeignWrap && hasOwnToString(v3)) {
            if (!factories.has(ids[0])) factories.set(ids[0], v3);
            trace("factory.foreignLeft", ids[0]);
          } else {
            try {
              chunk[i3] = wrapFactory(ids[0], v3);
            } catch (e3) {
              logger17.error("包装工厂失败", e3);
            }
          }
        }
        ids = [];
      } else if (typeof v3 === "number" || typeof v3 === "string") {
        ids.push(v3);
      } else {
        ids = [];
      }
    }
  }
  var instrumented = /* @__PURE__ */ new WeakSet();
  var pushWrapperOf = /* @__PURE__ */ new WeakMap();
  var chainedPushOf = /* @__PURE__ */ new WeakMap();
  var pushCalls = 0;
  var isNativePush = (f3) => {
    try {
      return f3 === Array.prototype.push || f3 === W3.Array?.prototype?.push;
    } catch {
      return false;
    }
  };
  var probed = 0;
  function instrument(value, { existing = false } = {}) {
    if (!value || typeof value !== "object" && typeof value !== "function" || instrumented.has(value)) return value;
    const origPush = value.push;
    const after = diag.pushAfter || existing && Array.isArray(value) && typeof origPush === "function" && !isNativePush(origPush);
    if (after) trace("push.after", { existing, array: Array.isArray(value) });
    if (Array.isArray(value)) {
      for (const c4 of value) handleChunk(c4);
    }
    if (typeof origPush === "function") {
      const mine = function(...chunks) {
        pushCalls++;
        count("push");
        try {
          const outer = value.push;
          if (outer !== mine) chainedPushOf.set(value, outer);
        } catch {
        }
        if (diag.noRead) return origPush.apply(this, chunks);
        if (diag.probeChunks && probed < 5) {
          probed++;
          const desc = (c4) => {
            try {
              return [0, 1, 2].map((i3) => {
                const d3 = Object.getOwnPropertyDescriptor(c4, i3);
                return d3 ? "get" in d3 ? "get" : typeof d3.value : "none";
              });
            } catch (e3) {
              return "err:" + e3.message;
            }
          };
          trace("chunk.probe", { phase: Array.isArray(value) ? "array" : "runtime", after, n: chunks.length, isArray: chunks.map((c4) => Array.isArray(c4)), desc: chunks.map(desc), protoNative: chunks.map((c4) => {
            try {
              return Object.getPrototypeOf(c4) === Array.prototype;
            } catch {
              return null;
            }
          }) });
        }
        if (after) {
          const r3 = origPush.apply(this, chunks);
          for (const c4 of chunks) {
            try {
              handleChunk(c4);
            } catch (e3) {
              logger17.error("处理分块失败", e3);
            }
          }
          return r3;
        }
        for (const c4 of chunks) {
          try {
            handleChunk(c4);
          } catch (e3) {
            logger17.error("处理分块失败", e3);
          }
        }
        return origPush.apply(this, chunks);
      };
      try {
        value.push = mine;
      } catch (e3) {
        logger17.warn("无法包装 TURBOPACK.push", e3);
      }
      if (value.push === mine) pushWrapperOf.set(value, mine);
    }
    instrumented.add(value);
    return value;
  }
  var installed2 = false;
  var ourGetter = null;
  var yieldedTo = null;
  function installInterceptor() {
    if (installed2) return;
    installed2 = true;
    const desc = Object.getOwnPropertyDescriptor(W3, "TURBOPACK");
    const pre = desc && ("get" in desc || "set" in desc) ? "TURBOPACK 已是别的脚本装的访问器" : desc && Array.isArray(desc.value) && typeof desc.value.push === "function" && !isNativePush(desc.value.push) ? "TURBOPACK.push 已被别的脚本换过" : null;
    if (pre && !diag.coexistActive) {
      yieldedTo = pre;
      trace("turbopack.yield", pre);
      logger17.info(`${pre},本脚本不再挂接,以免改变对方的行为;依赖补丁的功能改用渲染兜底或停用`);
      setTimeout(() => {
        bypassPending();
        notifyInactive();
      }, 0);
      return;
    }
    let current6;
    let chainGet = null, chainSet = null;
    if (desc && ("get" in desc || "set" in desc)) {
      chainGet = desc.get;
      chainSet = desc.set;
      try {
        instrument(chainGet ? chainGet.call(W3) : void 0, { existing: true });
      } catch (e3) {
        logger17.warn(e3);
      }
    } else if (desc) {
      current6 = instrument(desc.value, { existing: true });
    }
    if (diag.noSet) {
      try {
        instrument(W3.TURBOPACK, { existing: true });
      } catch {
      }
      trace("turbopack.install", { existing: desc ? "get" in desc || "set" in desc ? "accessor" : "value" : "none", noSet: true });
      return;
    }
    if (desc && !desc.configurable) {
      logger17.warn("TURBOPACK 不可配置,只能包装其 push");
      try {
        instrument(W3.TURBOPACK, { existing: true });
      } catch {
      }
      return;
    }
    Object.defineProperty(W3, "TURBOPACK", {
      configurable: true,
      enumerable: desc ? desc.enumerable : true,
      get: ourGetter = function() {
        count("turbopack.get");
        if (chainGet) {
          const v3 = chainGet.call(this);
          return instrument(v3, { existing: true });
        }
        return current6;
      },
      set: function(v3) {
        trace("turbopack.set", Array.isArray(v3) ? "array" : typeof v3);
        v3 = instrument(v3);
        if (chainSet) chainSet.call(this, v3);
        else if (!chainGet) current6 = v3;
      }
    });
    logger17.debug("已安装打包器拦截");
    trace("turbopack.install", { existing: desc ? "get" in desc || "set" in desc ? "accessor" : "value" : "none" });
  }
  function findInRegistry(test2) {
    const out = [];
    const seen3 = /* @__PURE__ */ new Set();
    const consider = (id, f3) => {
      if (seen3.has(id) || typeof f3 !== "function") return;
      seen3.add(id);
      let src;
      try {
        const o3 = f3[META]?.original ?? f3;
        src = isForeignWrapper(o3) ? String(o3.toString()) : fnToString.call(o3);
      } catch {
        return;
      }
      if (test2(src, id)) out.push([id, f3]);
    };
    const reg = runtime.registry;
    if (reg instanceof Map || reg instanceof W3.Map) for (const [id, f3] of reg) consider(id, f3);
    else if (reg && typeof reg === "object") for (const id of Object.keys(reg)) consider(isNaN(+id) ? id : +id, reg[id]);
    for (const [id, f3] of factories) consider(id, f3);
    return out;
  }
  function buildReport() {
    const orphaned = [], pending2 = [];
    for (const p4 of patches) {
      if (p4.consumed || p4.all || p4.checkOnly) continue;
      const pend = findInRegistry((src) => {
        try {
          return matchesFind(src, p4.find);
        } catch {
          return false;
        }
      });
      const entry = `${p4.plugin}: ${describeFind(p4.rawFind)}`;
      if (pend.length) pending2.push(entry);
      else if (!p4.noWarn) orphaned.push(entry);
    }
    return { orphaned, pending: pending2 };
  }
  function patchReport() {
    const { orphaned, pending: pending2 } = buildReport();
    return {
      stats: { ...patchStats, patchedModules: [...patchStats.patchedModules], injectionFallbacks: [...patchStats.injectionFallbacks], takenOver: replacedByOther, yielded: !!yieldedTo },
      results: patchResults.slice(),
      orphaned,
      pending: pending2,
      // 已停用插件的补丁只校验不应用(开发构建):find 命中了但 match 失配的
      validateMisses: checkOnlyMismatches.slice(),
      ...false ? { timings: patchTimings() } : {}
    };
  }
  function logHealthReport() {
    const { orphaned } = buildReport();
    if (replacedByOther || yieldedTo) {
      logger17.info(`补丁统计:${yieldedTo ? "TURBOPACK 让给了先装的脚本" : "TURBOPACK 已被其他脚本接管"},${patchStats.bypassed} 条补丁记为 bypassed,依赖它的功能改用渲染兜底或停用`);
      return { siteChanged: false };
    }
    if (orphaned.length) logger17.warn(`以下补丁找不到对应模块(孤儿):
${orphaned.join("\n")}`);
    const noEffect = patchResults.some((r3) => r3.replacements.some((s3) => s3.status === "noEffect"));
    const siteChanged = patchStats.applied === 0 && (orphaned.length > 0 || noEffect);
    if (siteChanged) logger17.warn("本次没有任何补丁生效,站点构建很可能已变化");
    if (false) {
      logger17.warn("已禁用插件中失配的补丁:", checkOnlyMismatches);
    }
    if (false) {
      const slow = patchTimings().filter((t4) => t4.ms >= 5).slice(0, 5);
      if (slow.length) logger17.debug(`最慢的 find:${slow.map((t4) => `${t4.plugin} ${t4.ms}ms`).join(",")}`);
    }
    logger17.info(`补丁统计:applied ${patchStats.applied},bypassed ${patchStats.bypassed},noEffect ${patchStats.noEffect},errors ${patchStats.errors},运行时回退 ${patchStats.runtimeFallbacks},被补丁模块 ${patchStats.patchedModules.size}`);
    return { siteChanged };
  }
  var lostCheckTimer = 0;
  onModuleLoad(() => {
    if (lostCheckTimer) return;
    lostCheckTimer = setTimeout(() => {
      lostCheckTimer = 0;
      checkLostPatches();
    }, 300);
  });
  var replacedByOther = false;
  var takeoverListeners = /* @__PURE__ */ new Set();
  function onTakeover(cb) {
    if (replacedByOther || yieldedTo && inactiveNotified) {
      try {
        cb();
      } catch (e3) {
        logger17.error(e3);
      }
      return () => {
      };
    }
    takeoverListeners.add(cb);
    return () => takeoverListeners.delete(cb);
  }
  var TAKEOVER_GRACE_MS = 1e3;
  var suspect = null;
  var chainedValue = null;
  function takeoverReason() {
    const d3 = Object.getOwnPropertyDescriptor(W3, "TURBOPACK");
    if (!d3) return null;
    const v3 = "value" in d3 ? d3.value : (() => {
      try {
        return W3.TURBOPACK;
      } catch {
        return void 0;
      }
    })();
    if (v3 == null) return null;
    if (!instrumented.has(v3)) {
      if (v3 === chainedValue) return null;
      return d3.get && d3.get !== ourGetter ? "属性被重定义成别人的访问器,取到的值没经过本脚本" : "值被换掉,没经过本脚本";
    }
    const mine = pushWrapperOf.get(v3);
    if (!mine) return null;
    const push = v3.push;
    if (push === mine || chainedPushOf.get(v3) === push) return null;
    return "push 被换掉";
  }
  function declareTakeover(why) {
    replacedByOther = true;
    trace("takeover", why);
    logger17.warn(`TURBOPACK 被其他脚本接管且没有串联本脚本的处理(${why}),不再争夺;之后加载的模块不打补丁,依赖补丁的功能改用渲染兜底或停用`);
    bypassPending();
    notifyInactive();
  }
  var inactiveNotified = false;
  function notifyInactive() {
    inactiveNotified = true;
    for (const cb of [...takeoverListeners]) {
      try {
        cb();
      } catch (e3) {
        logger17.error(e3);
      }
    }
    if (!runtime.registry) (yieldedTo ? logger17.info : logger17.warn).call(logger17, "没取到打包器的运行时,依赖站点模块的界面入口(渲染兜底等)无法启用;框架设置从脚本管理器菜单打开");
  }
  var takeoverSeq = 0;
  function bypassPending() {
    const results = [];
    for (const p4 of patches) {
      if (p4.consumed || p4.checkOnly || p4.all) continue;
      p4.consumed = true;
      const replacements = p4.replacement.map((r3) => ({ match: String(r3.match), status: "bypassed", reason: yieldedTo ? "TURBOPACK 让给先装的脚本" : "TURBOPACK 被接管" }));
      patchStats.bypassed += replacements.length;
      results.push({ plugin: p4.plugin, find: describeFind(p4.rawFind), moduleId: null, replacements });
    }
    patchResults.push(...results);
    if (!results.length) return;
    const id = `(${yieldedTo ? "TURBOPACK 让给先装的脚本" : "TURBOPACK 被接管"} #${++takeoverSeq})`;
    metaById.set(id, { id, patched: true, plugins: [...new Set(results.map((r3) => r3.plugin))], results, ranPatched: false });
    lostModules.add(id);
    for (const cb of [...lostListeners]) safeLost(cb, id);
  }
  function watchInstrumentation(durationMs = 2e4) {
    if (!installed2 || yieldedTo) return;
    const until = Date.now() + durationMs;
    const tick2 = () => {
      if (replacedByOther) return;
      try {
        const why = takeoverReason();
        if (!why) suspect = null;
        else if (!suspect) suspect = { why, since: Date.now(), calls: pushCalls };
        else if (pushCalls > suspect.calls) {
          if (why !== "push 被换掉") {
            try {
              chainedValue = W3.TURBOPACK;
            } catch {
            }
          }
          suspect = null;
        } else if (Date.now() - suspect.since >= TAKEOVER_GRACE_MS) {
          declareTakeover(why);
          return;
        }
      } catch {
      }
      if (Date.now() < until || suspect) setTimeout(tick2, 50);
    };
    tick2();
  }

  // vendor/userscript-pp/core/lib/styles.js
  var logger18 = new Logger("Styles", "#f9a8d4");
  var styles = /* @__PURE__ */ new Map();
  var container2 = null;
  var pendingDom = false;
  var useSheets = /* @__PURE__ */ (() => {
    let v3 = null;
    return () => {
      if (v3 === null) {
        try {
          v3 = getSite().styleHost !== "element" && "adoptedStyleSheets" in Document.prototype && typeof CSSStyleSheet.prototype.replaceSync === "function";
        } catch {
          v3 = false;
        }
      }
      return v3;
    };
  })();
  var ourSheets = /* @__PURE__ */ new WeakSet();
  function syncSheet(name) {
    const s3 = styles.get(name);
    const doc = document;
    if (s3) {
      if (!s3.sheet) {
        s3.sheet = new CSSStyleSheet();
        ourSheets.add(s3.sheet);
      }
      if (s3.sheetCss !== s3.css) {
        try {
          s3.sheet.replaceSync(s3.css);
        } catch (e3) {
          logger18.warn(`样式 ${name} 解析失败`, e3);
        }
        s3.sheetCss = s3.css;
      }
    }
    const others = doc.adoptedStyleSheets.filter((x4) => !ourSheets.has(x4));
    const ours = [...styles.values()].filter((x4) => x4.enabled && x4.sheet).map((x4) => x4.sheet);
    doc.adoptedStyleSheets = [...others, ...ours];
  }
  function ensureContainer2() {
    if (!document.head) {
      if (!pendingDom) {
        pendingDom = true;
        const go = () => {
          pendingDom = false;
          rebuild();
        };
        if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", go, { once: true });
        else queueMicrotask(go);
        const mo3 = new MutationObserver(() => {
          if (document.head) {
            mo3.disconnect();
            go();
          }
        });
        mo3.observe(document.documentElement || document, { childList: true, subtree: true });
      }
      return null;
    }
    if (container2 && container2.isConnected) return container2;
    container2 = document.createElement("uspp-ccpp-styles");
    container2.style.display = "none";
    document.head.appendChild(container2);
    return container2;
  }
  function rebuild() {
    const c4 = ensureContainer2();
    if (!c4) return;
    for (const [name, s3] of styles) {
      if (!s3.enabled) {
        s3.el?.remove();
        continue;
      }
      if (!s3.el || s3.el.parentNode !== c4) {
        s3.el = document.createElement("style");
        s3.el.setAttribute("data-uspp-ccpp", name);
        s3.el.textContent = s3.css;
        c4.appendChild(s3.el);
      }
    }
  }
  function sync(name) {
    if (useSheets()) return syncSheet(name);
    const s3 = styles.get(name);
    if (!s3) return;
    const c4 = ensureContainer2();
    if (!c4) return;
    if (!container2.isConnected) return rebuild();
    if (!s3.enabled) {
      s3.el?.remove();
      return;
    }
    if (!s3.el || s3.el.parentNode !== c4) {
      if (s3.el && s3.el.parentNode !== c4) return rebuild();
      s3.el = document.createElement("style");
      s3.el.setAttribute("data-uspp-ccpp", name);
      c4.appendChild(s3.el);
    }
    if (s3.el.textContent !== s3.css) s3.el.textContent = s3.css;
  }
  var shadows = /* @__PURE__ */ new Set();
  function syncShadows() {
    if (!shadows.size) return;
    const enabled = [...styles.entries()].filter(([, s3]) => s3.enabled);
    for (const sr of shadows) {
      if (!sr.host?.isConnected) continue;
      if (useSheets()) {
        for (const [name, s3] of enabled) if (!s3.sheet) {
          s3.sheet = new CSSStyleSheet();
          ourSheets.add(s3.sheet);
          try {
            s3.sheet.replaceSync(s3.css);
            s3.sheetCss = s3.css;
          } catch (e3) {
            logger18.warn(`样式 ${name} 解析失败`, e3);
          }
        }
        sr.adoptedStyleSheets = enabled.map(([, s3]) => s3.sheet).filter(Boolean);
      } else {
        let el = sr.querySelector("style[data-uspp-ccpp-shadow]");
        if (!el) {
          el = document.createElement("style");
          el.setAttribute("data-uspp-ccpp-shadow", "");
          sr.prepend(el);
        }
        const css2 = enabled.map(([, s3]) => s3.css).join("\n");
        if (el.textContent !== css2) el.textContent = css2;
      }
    }
  }
  function attachShadowStyles(sr) {
    shadows.add(sr);
    syncShadows();
    return () => shadows.delete(sr);
  }
  function registerStyle(name, css2, enabled = true) {
    const s3 = styles.get(name);
    if (s3) {
      s3.css = css2;
      if (enabled) s3.enabled = true;
    } else styles.set(name, { css: css2, enabled, el: null });
    if (!useSheets() && container2 && !container2.isConnected) {
      container2 = null;
      rebuild();
    } else sync(name);
    syncShadows();
  }
  function enableStyle(name) {
    const s3 = styles.get(name);
    if (!s3) {
      logger18.warn(`样式 ${name} 未注册`);
      return false;
    }
    if (s3.enabled) return false;
    s3.enabled = true;
    sync(name);
    syncShadows();
    return true;
  }
  function disableStyle(name) {
    const s3 = styles.get(name);
    if (!s3 || !s3.enabled) return false;
    s3.enabled = false;
    s3.el?.remove();
    s3.el = null;
    if (useSheets()) syncSheet(name);
    syncShadows();
    return true;
  }
  function unregisterStyle(name) {
    const s3 = styles.get(name);
    if (!s3) return false;
    s3.el?.remove();
    styles.delete(name);
    if (useSheets()) syncSheet(null);
    syncShadows();
    return true;
  }

  // vendor/userscript-pp/core/lib/slots.js
  var logger19 = new Logger("Slots", "#fdba74");
  var slots = /* @__PURE__ */ new Map();
  var listeners3 = /* @__PURE__ */ new Map();
  var anyListeners = /* @__PURE__ */ new Set();
  var version2 = 0;
  function emit2(slot) {
    version2++;
    for (const fn2 of [...listeners3.get(slot) || [], ...anyListeners]) {
      try {
        fn2(slot);
      } catch (e3) {
        logger19.error("注入点监听者出错", e3);
      }
    }
  }
  function addSlotItem2(slot, id, def) {
    if (!slot || id == null) throw new Error("addSlotItem 需要注入点名和 ID");
    let m3 = slots.get(slot);
    if (!m3) slots.set(slot, m3 = /* @__PURE__ */ new Map());
    m3.set(String(id), { ...def, id: String(id) });
    emit2(slot);
  }
  function removeSlotItem(slot, id) {
    if (slots.get(slot)?.delete(String(id))) emit2(slot);
  }
  function getSlotItems(slot, { all = false } = {}) {
    const list2 = [...slots.get(slot)?.values() ?? []].sort((a3, b3) => (a3.order ?? 0) - (b3.order ?? 0));
    return all ? list2 : list2.filter((d3) => !isPatchOnly(d3));
  }
  function onSlotChange(slot, fn2) {
    const set = slot === "*" ? anyListeners : listeners3.get(slot) || (listeners3.set(slot, /* @__PURE__ */ new Set()), listeners3.get(slot));
    set.add(fn2);
    return () => set.delete(fn2);
  }
  var getSlotVersion = () => version2;
  var slotValue = (v3, ctx) => typeof v3 === "function" ? !!v3(ctx) : !!v3;
  function applyMenuPatches(slot, items2, ctx) {
    let cur = Array.isArray(items2) ? items2.slice() : [];
    for (const def of getSlotItems(slot, { all: true })) {
      if (typeof def.patch !== "function") continue;
      try {
        const r3 = def.patch(cur, ctx);
        if (Array.isArray(r3)) cur = r3;
      } catch (e3) {
        logger19.error(`菜单补丁 ${def.id} 出错,已跳过`, e3);
      }
    }
    return cur;
  }
  var isPatchOnly = (def) => typeof def.patch === "function" && def.label == null && def.render == null;

  // vendor/userscript-pp/core/lib/finders.js
  var logger20 = new Logger("Finders", "#67e8f9");
  var fnToString2 = Function.prototype.toString;
  var REACT_MEMO = Symbol.for("react.memo");
  var REACT_FORWARD_REF = Symbol.for("react.forward_ref");
  function isSkippable(v3) {
    if (v3 == null) return true;
    const t4 = typeof v3;
    if (t4 !== "object" && t4 !== "function") return true;
    try {
      if (v3 === W3 || v3 === window || v3 === W3.document || v3 === document) return true;
      if (typeof W3.Node === "function" && v3 instanceof W3.Node) return true;
      if (v3 instanceof Map || v3 instanceof Set || v3 instanceof WeakMap || v3 instanceof WeakSet) return true;
      if (W3.Map && (v3 instanceof W3.Map || v3 instanceof W3.Set || v3 instanceof W3.WeakMap || v3 instanceof W3.WeakSet)) return true;
      if (v3 instanceof ArrayBuffer || ArrayBuffer.isView(v3)) return true;
      if (W3.ArrayBuffer && (v3 instanceof W3.ArrayBuffer || W3.ArrayBuffer.isView(v3))) return true;
      if (W3.WebSocket && v3 instanceof W3.WebSocket) return true;
      if (W3.MessagePort && v3 instanceof W3.MessagePort) return true;
      if (W3.EventTarget && v3 instanceof W3.EventTarget && !(t4 === "function")) return true;
      if (W3.Promise && v3 instanceof W3.Promise) return true;
      if (t4 === "function" || t4 === "object") {
        const probe = v3["$$uspp_probe_x"];
        if (probe != null) return true;
      }
    } catch {
      return true;
    }
    return false;
  }
  function quietly(fn2) {
    const c4 = W3.console || console;
    const ow = c4.warn, oe = c4.error;
    c4.warn = () => {
    };
    c4.error = () => {
    };
    try {
      return fn2();
    } finally {
      c4.warn = ow;
      c4.error = oe;
    }
  }
  function testSafe(filter, v3) {
    try {
      return !!filter(v3);
    } catch {
      return false;
    }
  }
  var SKIP_KEYS = /* @__PURE__ */ new Set(["default"]);
  function* candidates(exports) {
    yield exports;
    if (isSkippable(exports)) return;
    let keys;
    try {
      keys = Object.keys(exports);
    } catch {
      return;
    }
    for (const k4 of keys) {
      if (k4.startsWith("__") || k4.startsWith("unstable_") || k4.startsWith("UNSAFE_")) continue;
      let v3;
      try {
        v3 = exports[k4];
      } catch {
        continue;
      }
      if (v3 == null || SKIP_KEYS.has(k4) && v3 === exports) continue;
      yield v3;
    }
  }
  function scan(filter, { all = false, start = 0 } = {}) {
    const found = [];
    const seen3 = /* @__PURE__ */ new Set();
    let i3 = 0, hit = null;
    for (const exports of moduleCache.values()) {
      if (i3++ < start) continue;
      for (const v3 of candidates(exports)) {
        if (v3 == null || typeof v3 !== "object" && typeof v3 !== "function") continue;
        if (seen3.has(v3)) continue;
        if (v3 !== exports && isSkippable(v3)) continue;
        if (testSafe(filter, v3)) {
          if (!all) {
            hit = v3;
            return { hit, end: i3 };
          }
          seen3.add(v3);
          found.push(v3);
        }
      }
    }
    return { hit: all ? found : null, end: i3 };
  }
  function find(filter, { all = false } = {}) {
    if (typeof filter !== "function") throw new TypeError("filter 必须是函数");
    return quietly(() => {
      syncRuntimeCache();
      return scan(filter, { all }).hit;
    });
  }
  var findAll = (filter) => find(filter, { all: true });
  var codeCache = /* @__PURE__ */ new WeakMap();
  var codeOf = (f3) => {
    let c4 = codeCache.get(f3);
    if (c4 === void 0) {
      try {
        c4 = fnToString2.call(f3);
      } catch {
        c4 = "";
      }
      codeCache.set(f3, c4);
    }
    return c4;
  };
  var toPatterns = (ps) => ps.map(canonicalizeRegex);
  var isZustandStore = (v3) => typeof v3 === "function" && typeof v3.getState === "function" && typeof v3.subscribe === "function" && typeof v3.setState === "function";
  var storeKey = (name) => "use" + (name.startsWith("use") ? name.slice(3) : name).replace(/Store$/, "") + "Store";
  var filters = {
    byProps: (...keys) => (v3) => keys.every((k4) => v3[k4] != null),
    byCode: (...patterns) => {
      const ps = toPatterns(patterns);
      return (v3) => typeof v3 === "function" && ps.every((p4) => matchesOne(codeOf(v3), p4));
    },
    byDisplayName: (name) => (v3) => v3.displayName === name || v3.render?.displayName === name || v3.type?.displayName === name,
    // CSS 模块:导出对象的值是混淆后的类名字符串,每个类名都能在某个值里找到
    byClassName: (...classes2) => {
      const res = classes2.map((c4) => new RegExp(`(?:\\b|_)${escapeRegExp(c4)}(?:\\b|_)`));
      return (v3) => {
        if (!v3 || typeof v3 !== "object") return false;
        const vals = Object.values(v3);
        return vals.length > 0 && vals.every((x4) => typeof x4 === "string") && res.every((re) => vals.some((x4) => re.test(x4)));
      };
    },
    byStoreName: (name) => {
      const key = storeKey(name);
      return (v3) => isZustandStore(v3[key]);
    },
    componentByCode: (...patterns) => {
      const ps = toPatterns(patterns);
      const check3 = (f3) => typeof f3 === "function" && ps.every((p4) => matchesOne(codeOf(f3), p4));
      return (v3) => {
        if (check3(v3)) return true;
        if (v3.$$typeof === REACT_MEMO) return check3(v3.type) || check3(v3.type?.render);
        if (v3.$$typeof === REACT_FORWARD_REF) return check3(v3.render);
        return false;
      };
    }
  };
  var findByProps = (...keys) => find(filters.byProps(...keys));
  var findByCode = (...ps) => find(filters.byCode(...ps));
  var findByDisplayName = (name) => find(filters.byDisplayName(name));
  var findComponentByCode = (...ps) => find(filters.componentByCode(...ps));
  function findExportedComponent(...names) {
    const m3 = find(exportedComponentFilter(names));
    return m3 ? pickExported(names)(m3) : null;
  }
  function findStore(name) {
    const key = storeKey(name);
    const m3 = find((v3) => isZustandStore(v3[key]));
    return m3 ? m3[key] : null;
  }
  function mapMangledCssClasses(mod, classes2) {
    const out = {};
    if (!mod) return out;
    for (const name of classes2) {
      const re = new RegExp(`(?:\\b|_)${escapeRegExp(name)}(?:\\b|_)`);
      for (const k4 of Object.keys(mod)) {
        const v3 = mod[k4];
        if (typeof v3 === "string" && re.test(v3)) {
          out[name] = v3;
          break;
        }
      }
      if (!(name in out)) logger20.debug(`mapMangledCssClasses:模块里没有类名 ${name}`);
    }
    return out;
  }
  function findCssClasses(...classes2) {
    const mod = find(filters.byClassName(...classes2));
    return mod ? mapMangledCssClasses(mod, classes2) : {};
  }
  function findBulk(...filterFns) {
    const results = new Array(filterFns.length).fill(null);
    let left = filterFns.length;
    if (!left) return results;
    quietly(() => {
      syncRuntimeCache();
      outer: for (const exports of moduleCache.values()) {
        for (const v3 of candidates(exports)) {
          if (v3 == null || typeof v3 !== "object" && typeof v3 !== "function") continue;
          if (v3 !== exports && isSkippable(v3)) continue;
          for (let i3 = 0; i3 < filterFns.length; i3++) {
            if (results[i3] === null && testSafe(filterFns[i3], v3)) {
              results[i3] = v3;
              if (--left === 0) break outer;
            }
          }
        }
      }
    });
    if (left) logger20.debug(`findBulk:${filterFns.length} 个过滤器只找到 ${filterFns.length - left} 个`);
    return results;
  }
  function incremental(filter, pick = (v3) => v3) {
    let cursor2 = 0, reset = -1, last2 = -1;
    return () => {
      const v3 = getCacheVersion();
      if (v3 === last2) return null;
      last2 = v3;
      const r3 = getResetVersion();
      if (r3 !== reset) {
        reset = r3;
        cursor2 = 0;
      }
      return quietly(() => {
        syncRuntimeCache();
        const res = scan(filter, { start: cursor2 });
        cursor2 = res.hit ? res.end - 1 : res.end;
        return res.hit ? pick(res.hit) : null;
      });
    };
  }
  var lazyFind = (filter, pick) => proxyLazy(incremental(filter, pick));
  function lazyComponent(resolveFn, label) {
    let cached2 = null;
    const get = () => {
      if (cached2) return cached2;
      cached2 = resolveFn() ?? null;
      return cached2;
    };
    const Lazy = (props) => {
      const C4 = get();
      if (!C4) return null;
      const React = getReact2();
      return React ? React.createElement(C4, props) : null;
    };
    Lazy.displayName = `UsppLazy(${label})`;
    Lazy.$$uspp_ccpp_Resolve = get;
    return Lazy;
  }
  var exportedComponentFilter = (names) => (v3) => names.some((n2) => v3[n2] != null && (typeof v3[n2] === "function" || typeof v3[n2] === "object"));
  var pickExported = (names) => (m3) => {
    for (const n2 of names) if (m3[n2] != null) return m3[n2];
    return null;
  };
  var findLazy = (filter) => lazyFind(filter);
  var findByPropsLazy = (...keys) => lazyFind(filters.byProps(...keys));
  var findByCodeLazy = (...ps) => lazyFind(filters.byCode(...ps));
  var findByDisplayNameLazy = (name) => lazyComponent(incremental(filters.byDisplayName(name)), name);
  var findComponentByCodeLazy = (...ps) => lazyComponent(incremental(filters.componentByCode(...ps)), String(ps[0]));
  var findExportedComponentLazy = (...names) => lazyComponent(incremental(exportedComponentFilter(names), pickExported(names)), names[0]);
  var findStoreLazy = (name) => {
    const key = storeKey(name);
    return lazyFind((v3) => isZustandStore(v3[key]), (m3) => m3[key]);
  };
  var findCssClassesLazy = (...classes2) => lazyFind(filters.byClassName(...classes2), (m3) => {
    const r3 = mapMangledCssClasses(m3, classes2);
    return Object.keys(r3).length ? r3 : null;
  });
  var retryOnChange = () => {
    let last2 = -1;
    return () => {
      const v3 = getCacheVersion();
      if (v3 === last2) return false;
      last2 = v3;
      return true;
    };
  };
  var mapMangledModuleLazy = (patterns, mappers) => proxyLazy(() => {
    const r3 = mapMangledModule(patterns, mappers);
    return Object.keys(r3).length ? r3 : null;
  }, retryOnChange());
  function srcMatcher(patterns) {
    const ps = toPatterns(patterns);
    return (src) => ps.every((p4) => matchesOne(src, p4));
  }
  function findModuleFactory(...patterns) {
    const hit = findInRegistry(srcMatcher(patterns))[0];
    return hit ?? null;
  }
  function findModuleId(...patterns) {
    const hit = findModuleFactory(...patterns);
    return hit ? hit[0] : null;
  }
  function search2(...patterns) {
    const out = {};
    for (const [id, f3] of findInRegistry(srcMatcher(patterns))) out[id] = f3;
    return out;
  }
  function requireModule(id) {
    if (moduleCache.has(id)) return moduleCache.get(id);
    if (moduleCache.has(+id)) return moduleCache.get(+id);
    try {
      const c4 = runtime.cache;
      if (c4 && c4[id] && !c4[id].error) return c4[id].exports;
      if (runtime.ctx && typeof runtime.ctx.r === "function") return runtime.ctx.r(isNaN(+id) ? id : +id);
      if (typeof runtime.require === "function" && runtime.registry && Object.prototype.hasOwnProperty.call(runtime.registry, id)) return runtime.require(isNaN(+id) ? id : +id);
    } catch (e3) {
      logger20.debug(`加载模块 ${id} 失败`, e3);
    }
    return null;
  }
  function mapMangledModule(patterns, mappers) {
    const out = {};
    const id = findModuleId(...Array.isArray(patterns) ? patterns : [patterns]);
    if (id == null) return out;
    const exports = requireModule(id);
    if (!exports) return out;
    quietly(() => {
      for (const k4 of Object.keys(exports)) {
        let v3;
        try {
          v3 = exports[k4];
        } catch {
          continue;
        }
        if (v3 == null) continue;
        for (const [name, filter] of Object.entries(mappers)) {
          if (out[name] === void 0 && testSafe(filter, v3)) out[name] = v3;
        }
      }
    });
    return out;
  }
  var IDENT2 = "[A-Za-z_$][\\w$]*";
  var DefaultChunkLoadRegex = new RegExp(`Promise\\.all\\(\\[([^\\]]*)\\]\\.map\\(\\(?${IDENT2}\\)?=>${IDENT2}\\.[lL]\\(${IDENT2}\\)\\)\\)\\.then\\(\\(\\)=>${IDENT2}\\((\\d+|"[^"]+")\\)\\)`);
  var WebpackChunkLoadRegex = new RegExp(`((?:Promise\\.all\\(\\[(?:${IDENT2}\\.e\\((?:\\d+|"[^"]+")\\),?)+\\]\\))|${IDENT2}\\.e\\((?:\\d+|"[^"]+")\\))\\.then\\(${IDENT2}\\.bind\\(${IDENT2},(\\d+|"[^"]+")\\)\\)`);
  var WEBPACK_CHUNK_ID = /\.e\((\d+|"[^"]+")\)/g;
  var isWebpack = () => typeof runtime.require === "function";
  var CHUNK_IN_LIST = /["'`]((?:\/?_next\/)?static\/chunks\/[^"'`]+?\.js)["'`]/g;
  var chunkPrefix = "/_next/";
  function setChunkPrefix(chunkPath) {
    if (typeof chunkPath === "string" && chunkPath) chunkPrefix = chunkPath.replace(/static\/chunks\/?$/, "") || "/";
  }
  var loadingChunks = /* @__PURE__ */ new Map();
  function loadChunk(path) {
    if (isWebpack()) {
      const e3 = runtime.require.e;
      if (typeof e3 !== "function") return Promise.reject(new Error("webpack 运行时没有分块加载函数(__webpack_require__.e)"));
      const key = String(path);
      if (!loadingChunks.has(key)) loadingChunks.set(key, Promise.resolve(e3(/^\d+$/.test(key) ? +key : key)).then(() => true, (err) => {
        loadingChunks.delete(key);
        throw err;
      }));
      return loadingChunks.get(key);
    }
    const p4 = String(path).replace(/^\/?_next\//, "");
    if (chunkPaths.has(p4) || [...chunkPaths].some((x4) => String(x4).endsWith(p4))) return Promise.resolve(true);
    if (loadingChunks.has(p4)) return loadingChunks.get(p4);
    const ctx = runtime.ctx;
    let promise;
    if (ctx && typeof ctx.l === "function") promise = Promise.resolve(ctx.l(p4)).then(() => true);
    else {
      promise = new Promise((resolve, reject) => {
        const el = document.createElement("script");
        el.src = new URL(chunkPrefix + p4, location.origin).href;
        el.async = true;
        el.onload = () => {
          el.remove();
          resolve(true);
        };
        el.onerror = () => {
          el.remove();
          reject(new Error(`加载分块失败:${p4}`));
        };
        (document.head || document.documentElement).appendChild(el);
      });
    }
    promise = promise.catch((e3) => {
      loadingChunks.delete(p4);
      throw e3;
    });
    loadingChunks.set(p4, promise);
    return promise;
  }
  var sleep3 = (ms) => new Promise((r3) => setTimeout(r3, ms));
  async function waitRegistered(id, ms = 5e3) {
    const inObject = () => {
      const r3 = runtime.registry;
      return !!r3 && !(r3 instanceof Map) && typeof r3.has !== "function" && Object.prototype.hasOwnProperty.call(r3, id);
    };
    const has = () => !!(inObject() || runtime.registry?.has?.(id) || runtime.registry?.has?.(String(id)) || moduleCache.has(id) || findInRegistry((_3, x4) => x4 == id).length);
    for (let t4 = 0; !has() && t4 < ms; t4 += 50) await sleep3(50);
    return has();
  }
  async function extractAndLoadChunks(code, matcher) {
    matcher ??= isWebpack() ? WebpackChunkLoadRegex : DefaultChunkLoadRegex;
    const patterns = Array.isArray(code) ? code : [code];
    const hit = findInRegistry(srcMatcher(patterns))[0];
    if (!hit) {
      logger20.warn("extractAndLoadChunks:没有找到匹配的模块", patterns.map(String));
      return false;
    }
    let src = "";
    try {
      src = String(hit[1].toString());
    } catch {
    }
    const re = matcher instanceof RegExp ? new RegExp(matcher.source, matcher.flags.replace("g", "")) : canonicalizeRegex(matcher);
    const m3 = re.exec(src);
    if (!m3) {
      logger20.warn("extractAndLoadChunks:模块里没有加载分块的写法", patterns.map(String));
      return false;
    }
    const paths = isWebpack() ? [...String(m3[1] || "").matchAll(WEBPACK_CHUNK_ID)].map((x4) => x4[1].replace(/^"|"$/g, "")) : [...String(m3[1] || "").matchAll(CHUNK_IN_LIST)].map((x4) => x4[1]);
    try {
      await Promise.all(paths.map(loadChunk));
    } catch (e3) {
      logger20.warn("extractAndLoadChunks:加载分块失败", e3);
      return false;
    }
    if (m3[2] == null) return true;
    const id = /^\d+$/.test(m3[2]) ? +m3[2] : m3[2].replace(/^"|"$/g, "");
    if (!await waitRegistered(id)) {
      logger20.warn(`extractAndLoadChunks:入口模块 ${id} 没有注册`);
      return false;
    }
    const exports = requireModule(id);
    if (exports == null) {
      logger20.warn(`extractAndLoadChunks:入口模块 ${id} 执行失败`);
      return false;
    }
    rescanRuntimeCache();
    return true;
  }
  function extractAndLoadChunksLazy(code, matcher) {
    let cache2 = null;
    return () => {
      if (cache2) return cache2;
      cache2 = extractAndLoadChunks(code, matcher).then((ok) => {
        if (!ok) cache2 = null;
        return ok;
      }, (e3) => {
        cache2 = null;
        throw e3;
      });
      return cache2;
    };
  }
  async function importModule(id) {
    const now2 = requireModule(id);
    if (now2 != null) return now2;
    const ctx = runtime.ctx;
    if (ctx && typeof ctx.A === "function") return ctx.A(id);
    if (await waitRegistered(id, 3e3)) return requireModule(id);
    throw new Error(`importModule:模块 ${id} 不可用`);
  }
  function waitFor(filter, callback, timeoutMs) {
    const existing = find(filter);
    if (existing) {
      try {
        callback(existing);
      } catch (e3) {
        logger20.error("waitFor 回调出错", e3);
      }
      return () => {
      };
    }
    let timer2;
    const unsub = onModuleLoad((exports) => {
      let hit = null;
      quietly(() => {
        for (const v3 of candidates(exports)) {
          if (v3 == null || typeof v3 !== "object" && typeof v3 !== "function") continue;
          if (v3 !== exports && isSkippable(v3)) continue;
          if (testSafe(filter, v3)) {
            hit = v3;
            break;
          }
        }
      });
      if (hit) {
        cancel();
        try {
          callback(hit);
        } catch (e3) {
          logger20.error("waitFor 回调出错", e3);
        }
      }
    });
    const cancel = () => {
      unsub();
      clearTimeout(timer2);
    };
    if (timeoutMs) timer2 = setTimeout(() => {
      unsub();
      logger20.warn(`waitFor 超时(${timeoutMs} ms)`, filter);
    }, timeoutMs);
    return cancel;
  }
  function getAllStores() {
    const out = /* @__PURE__ */ new Map();
    quietly(() => {
      syncRuntimeCache();
      for (const exports of moduleCache.values()) {
        if (isSkippable(exports)) continue;
        let keys;
        try {
          keys = Object.keys(exports);
        } catch {
          continue;
        }
        for (const k4 of keys) {
          if (!k4.startsWith("use") || out.has(k4)) continue;
          let v3;
          try {
            v3 = exports[k4];
          } catch {
            continue;
          }
          if (isZustandStore(v3)) out.set(k4, v3);
        }
      }
    });
    return out;
  }
  var reactCache = null;
  function getReact2() {
    if (reactCache) return reactCache;
    reactCache = find((v3) => typeof v3.createElement === "function" && typeof v3.useState === "function" && typeof v3.Component === "function" && typeof v3.Fragment !== "undefined" && v3.version != null) || null;
    return reactCache;
  }

  // vendor/userscript-pp/core/lib/dom.js
  var logger21 = new Logger("DOM", "#a7f3d0");
  var subs = /* @__PURE__ */ new Set();
  var mo = null;
  var pendingAdded = /* @__PURE__ */ new Set();
  var pendingRemoved = /* @__PURE__ */ new Set();
  var scheduled = false;
  var selfNodes = /* @__PURE__ */ new WeakSet();
  var selfWrites = /* @__PURE__ */ new WeakMap();
  var raf = (cb) => typeof requestAnimationFrame === "function" ? requestAnimationFrame(cb) : setTimeout(cb, 16);
  function isSelfRecord(r3) {
    if (r3.type === "childList") {
      const nodes = [...r3.addedNodes, ...r3.removedNodes];
      return nodes.length > 0 && nodes.every((n2) => selfNodes.has(n2));
    }
    const set = selfWrites.get(r3.target);
    if (!set) return false;
    if (r3.type === "attributes") return set.has(r3.attributeName);
    return set.has("#text");
  }
  function collect(records2) {
    for (const r3 of records2) {
      if (isSelfRecord(r3)) continue;
      if (r3.type !== "childList") continue;
      for (const n2 of r3.addedNodes) if (n2.nodeType === 1) pendingAdded.add(n2);
      for (const n2 of r3.removedNodes) if (n2.nodeType === 1) pendingRemoved.add(n2);
    }
    if ((pendingAdded.size || pendingRemoved.size) && !scheduled) {
      scheduled = true;
      raf(flush2);
    }
  }
  function matchesIn(node, selector) {
    const out = [];
    try {
      if (node.matches?.(selector)) out.push(node);
      if (node.querySelectorAll) out.push(...node.querySelectorAll(selector));
    } catch {
    }
    return out;
  }
  function flush2() {
    scheduled = false;
    const added = [...pendingAdded].filter((n2) => n2.isConnected), removed = [...pendingRemoved].filter((n2) => !n2.isConnected);
    pendingAdded = /* @__PURE__ */ new Set();
    pendingRemoved = /* @__PURE__ */ new Set();
    for (const s3 of [...subs]) {
      if (s3.added) {
        const hits = /* @__PURE__ */ new Set();
        for (const n2 of added) for (const m3 of matchesIn(n2, s3.selector)) if (!s3.root || s3.root.contains(m3)) hits.add(m3);
        for (const el of hits) {
          try {
            s3.added(el);
          } catch (e3) {
            logger21.error("observe 回调出错", e3);
          }
        }
      }
      if (s3.removed) {
        const hits = /* @__PURE__ */ new Set();
        for (const n2 of removed) for (const m3 of matchesIn(n2, s3.selector)) hits.add(m3);
        for (const el of hits) {
          try {
            s3.removed(el);
          } catch (e3) {
            logger21.error("observe 回调出错", e3);
          }
        }
      }
    }
  }
  function ensureObserver() {
    if (mo) return;
    const target2 = document.documentElement || document;
    mo = new MutationObserver(collect);
    mo.observe(target2, { childList: true, subtree: true });
  }
  function observe(selector, { added, removed, root: root2 } = {}) {
    const s3 = { selector, added, removed, root: root2 };
    subs.add(s3);
    ensureObserver();
    if (added) raf(() => {
      if (!subs.has(s3)) return;
      for (const el of matchesIn(root2 || document, selector)) {
        try {
          added(el);
        } catch (e3) {
          logger21.error("observe 回调出错", e3);
        }
      }
    });
    return () => subs.delete(s3);
  }
  function waitForElement(selector, { root: root2, timeout = 0 } = {}) {
    const now2 = (root2 || document).querySelector?.(selector);
    if (now2) return Promise.resolve(now2);
    return new Promise((resolve) => {
      let timer2 = 0;
      const off = observe(selector, { root: root2, added: (el) => {
        off();
        clearTimeout(timer2);
        resolve(el);
      } });
      if (timeout > 0) timer2 = setTimeout(() => {
        off();
        resolve(null);
      }, timeout);
    });
  }
  function markWrite(el, key) {
    let set = selfWrites.get(el);
    if (!set) selfWrites.set(el, set = /* @__PURE__ */ new Set());
    set.add(key);
    if (mo) collect(mo.takeRecords());
  }
  function setAttr(el, name, value) {
    if (!el) return false;
    if (value == null || value === false) {
      if (!el.hasAttribute(name)) return false;
      el.removeAttribute(name);
    } else {
      const v3 = value === true ? "" : String(value);
      if (el.getAttribute(name) === v3) return false;
      el.setAttribute(name, v3);
    }
    markWrite(el, name);
    return true;
  }
  function setText2(el, text) {
    if (!el) return false;
    const v3 = String(text ?? "");
    if (el.textContent === v3) return false;
    el.textContent = v3;
    markWrite(el, "#text");
    for (const n2 of el.childNodes) selfNodes.add(n2);
    return true;
  }
  function toggleClass(el, name, force) {
    if (!el) return false;
    const has = el.classList.contains(name);
    const want = force === void 0 ? !has : !!force;
    if (has === want) return false;
    el.classList.toggle(name, want);
    markWrite(el, "class");
    return true;
  }
  function setStyle(el, prop, value) {
    if (!el) return false;
    const v3 = value == null ? "" : String(value);
    if (el.style.getPropertyValue(prop) === v3) return false;
    if (v3) el.style.setProperty(prop, v3);
    else el.style.removeProperty(prop);
    markWrite(el, "style");
    return true;
  }
  function mount(parent, node, before = null) {
    if (!parent || !node) return node;
    selfNodes.add(node);
    if (node.parentNode === parent && (before == null ? node === parent.lastChild || node.nextSibling == null : node.nextSibling === before)) return node;
    parent.insertBefore(node, before);
    if (mo) collect(mo.takeRecords());
    return node;
  }
  function unmount(node) {
    if (!node?.parentNode) return;
    selfNodes.add(node);
    node.remove();
    if (mo) collect(mo.takeRecords());
  }

  // vendor/userscript-pp/core/lib/route.js
  var installed3 = false;
  var last = null;
  var parser = null;
  function setRouteParser(fn2) {
    parser = typeof fn2 === "function" ? fn2 : null;
  }
  function check2() {
    const url = location.href;
    if (url === last) return;
    const prev = last;
    last = url;
    let info;
    if (parser) {
      try {
        info = parser(new URL(url));
      } catch {
        info = void 0;
      }
    }
    dispatch(Events.ROUTE_CHANGE, { url, previous: prev, info });
  }
  function installRouteWatcher() {
    if (installed3) return;
    installed3 = true;
    last = location.href;
    const H3 = W3.history;
    for (const name of ["pushState", "replaceState"]) {
      const orig = H3[name];
      if (typeof orig !== "function") continue;
      const wrapped2 = function(...args) {
        const r3 = orig.apply(this, args);
        try {
          check2();
        } catch {
        }
        return r3;
      };
      try {
        H3[name] = wrapped2;
      } catch {
      }
    }
    W3.addEventListener("popstate", check2);
    W3.addEventListener("hashchange", check2);
  }
  function onRouteChange(fn2) {
    installRouteWatcher();
    return subscribe(Events.ROUTE_CHANGE, fn2);
  }

  // vendor/userscript-pp/core/lib/network.js
  var logger22 = new Logger("Network", "#c4b5fd");
  var reqSubs = /* @__PURE__ */ new Set();
  var resSubs = /* @__PURE__ */ new Set();
  var reqRw = /* @__PURE__ */ new Set();
  var resRw = /* @__PURE__ */ new Set();
  var wsSubs = /* @__PURE__ */ new Set();
  var esSubs = /* @__PURE__ */ new Set();
  var installed4 = false;
  var wsInstalled = false;
  var esInstalled = false;
  var test = (matcher, url, method) => {
    try {
      if (!matcher) return true;
      if (typeof matcher === "string") return url.includes(matcher);
      if (matcher instanceof RegExp) {
        matcher.lastIndex = 0;
        return matcher.test(url);
      }
      if (typeof matcher === "function") return !!matcher(url, method);
    } catch {
    }
    return false;
  };
  var call = (fn2, ctx) => {
    try {
      const r3 = fn2(ctx);
      r3?.catch?.((e3) => logger22.error("网络回调出错", e3));
    } catch (e3) {
      logger22.error("网络回调出错", e3);
    }
  };
  var isResponse = (r3) => !!r3 && typeof r3 === "object" && typeof r3.clone === "function" && typeof r3.text === "function" && "status" in r3;
  var absUrl = (u3) => {
    try {
      return new URL(u3, location.href).href;
    } catch {
      return String(u3);
    }
  };
  function makeResponse(body, init = {}) {
    const R3 = W3.Response || Response;
    if (body != null && typeof body === "object" && !(body instanceof ArrayBuffer) && !ArrayBuffer.isView(body) && !(typeof Blob !== "undefined" && body instanceof Blob) && typeof body.getReader !== "function") {
      const headers = new (W3.Headers || Headers)(init.headers || {});
      if (!headers.has("content-type")) headers.set("content-type", "application/json");
      return new R3(JSON.stringify(body), { status: 200, ...init, headers });
    }
    return new R3(body, { status: 200, ...init });
  }
  async function readChunks(res, onChunk) {
    const reader = res.body?.getReader?.();
    if (!reader) {
      onChunk(await res.text(), true);
      return;
    }
    const dec = new TextDecoder();
    for (; ; ) {
      const { value, done } = await reader.read();
      if (done) {
        onChunk("", true);
        break;
      }
      onChunk(dec.decode(value, { stream: true }), false);
    }
  }
  var resCtx = (res, url, method) => ({
    url,
    method,
    status: res.status,
    headers: res.headers,
    type: "fetch",
    clone: () => res.clone(),
    text: () => res.clone().text(),
    json: () => res.clone().json(),
    onChunk: (cb) => readChunks(res.clone(), cb)
  });
  var bodyText = (b3) => typeof b3 === "string" ? b3 : null;
  function wrapFetch() {
    const orig = W3.fetch;
    if (typeof orig !== "function") return;
    const fireRead = (res, url, method) => {
      for (const s3 of resSubs) if (test(s3.matcher, url, method)) call(s3.handler, resCtx(res, url, method));
    };
    const wrapped2 = function(input, init) {
      let url = "", method = "GET";
      try {
        url = typeof input === "string" ? input : input?.url ?? String(input);
        method = (init?.method || input?.method || "GET").toUpperCase();
      } catch {
      }
      for (const s3 of reqSubs) if (test(s3.matcher, url, method)) call(s3.handler, { url, method, init, input, type: "fetch" });
      const rq = [...reqRw].filter((s3) => test(s3.matcher, url, method));
      const rs = [...resRw].filter((s3) => test(s3.matcher, url, method));
      const self = this;
      if (!rq.length && !rs.length) {
        const p4 = orig.apply(self, arguments);
        if (resSubs.size) p4.then((res) => fireRead(res, url, method), () => {
        });
        return p4;
      }
      return (async () => {
        let curInput = input, curInit = init, curUrl = url, early = null;
        for (const s3 of rq) {
          const ctx = {
            url: curUrl,
            method,
            init: curInit,
            input: curInput,
            type: "fetch",
            body: bodyText(curInit?.body),
            json: () => JSON.parse(bodyText(curInit?.body) ?? "null"),
            respond: makeResponse
          };
          let r3;
          try {
            r3 = await s3.handler(ctx);
          } catch (e3) {
            logger22.error("请求改写出错,跳过", e3);
            continue;
          }
          if (!r3) continue;
          if (isResponse(r3)) {
            early = r3;
            break;
          }
          if (r3.block) throw new TypeError("Failed to fetch");
          if (r3.url != null && String(r3.url) !== curUrl) {
            curUrl = String(r3.url);
            curInput = typeof curInput === "string" || curInput instanceof URL || !curInput?.url ? curUrl : new (W3.Request || Request)(curUrl, curInput);
          }
          if (r3.body !== void 0) curInit = { ...curInit || {}, body: typeof r3.body === "string" ? r3.body : JSON.stringify(r3.body) };
          if (r3.init) curInit = { ...curInit || {}, ...r3.init };
        }
        let res = early ?? await orig.call(self, curInput, curInit);
        for (const s3 of rs) {
          let r3;
          try {
            r3 = await s3.handler({ ...resCtx(res, curUrl, method), respond: makeResponse });
          } catch (e3) {
            logger22.error("响应改写出错,跳过", e3);
            continue;
          }
          if (isResponse(r3)) res = r3;
        }
        if (resSubs.size) fireRead(res, curUrl, method);
        return res;
      })();
    };
    try {
      W3.fetch = wrapped2;
    } catch (e3) {
      logger22.warn("无法包装 fetch", e3);
    }
  }
  function wrapXhr() {
    const X3 = W3.XMLHttpRequest;
    if (!X3?.prototype) return;
    const open = X3.prototype.open, send = X3.prototype.send;
    X3.prototype.open = function(method, url, ...rest) {
      const info = { method: String(method || "GET").toUpperCase(), url: String(url), blocked: false };
      for (const s3 of reqRw) {
        if (!test(s3.matcher, info.url, info.method)) continue;
        let r3;
        try {
          r3 = s3.handler({ url: info.url, method: info.method, type: "xhr", phase: "open", respond: makeResponse });
        } catch (e3) {
          logger22.error("请求改写出错,跳过", e3);
          continue;
        }
        if (r3?.then) {
          logger22.warn("XHR 请求的改写函数必须同步返回,已忽略");
          continue;
        }
        if (r3?.block) info.blocked = true;
        else if (r3?.url != null) info.url = String(r3.url);
      }
      this.__uspp_ccpp_Req = info;
      return open.call(this, method, info.url, ...rest);
    };
    X3.prototype.send = function(body) {
      const info = this.__uspp_ccpp_Req;
      if (info) {
        if (info.blocked) {
          const xhr = this;
          setTimeout(() => {
            try {
              xhr.abort();
            } catch {
            }
            try {
              xhr.dispatchEvent(new (W3.ProgressEvent || Event)("error"));
              xhr.dispatchEvent(new (W3.ProgressEvent || Event)("loadend"));
            } catch {
            }
          }, 0);
          return void 0;
        }
        for (const s3 of reqRw) {
          if (!test(s3.matcher, info.url, info.method) || typeof body !== "string") continue;
          let r3;
          try {
            r3 = s3.handler({ url: info.url, method: info.method, type: "xhr", phase: "send", body, json: () => JSON.parse(body), respond: makeResponse });
          } catch (e3) {
            logger22.error("请求改写出错,跳过", e3);
            continue;
          }
          if (r3?.then) continue;
          if (r3?.body !== void 0) body = typeof r3.body === "string" ? r3.body : JSON.stringify(r3.body);
        }
        for (const s3 of reqSubs) if (test(s3.matcher, info.url, info.method)) call(s3.handler, { ...info, body, type: "xhr" });
        const rs = [...resRw].filter((s3) => test(s3.matcher, info.url, info.method));
        if (rs.length) installXhrRewrite(this, info, rs);
        if (resSubs.size) this.addEventListener("load", () => {
          for (const s3 of resSubs) if (test(s3.matcher, info.url, info.method)) {
            const rt = this.responseType;
            const text = () => Promise.resolve(rt === "" || rt === "text" ? this.responseText : rt === "json" ? JSON.stringify(this.response) : "");
            const json = () => rt === "json" ? Promise.resolve(this.response) : text().then(JSON.parse);
            call(s3.handler, { ...info, status: this.status, type: "xhr", text, json, clone: () => null, onChunk: (cb) => text().then((t4) => cb(t4, true)) });
          }
        });
      }
      return send.call(this, body);
    };
  }
  function installXhrRewrite(xhr, info, subs2) {
    const proto = Object.getPrototypeOf(xhr);
    const getText2 = Object.getOwnPropertyDescriptor(W3.XMLHttpRequest.prototype, "responseText")?.get;
    const getResp = Object.getOwnPropertyDescriptor(W3.XMLHttpRequest.prototype, "response")?.get;
    if (!getText2 || !getResp) return;
    let computed = null;
    const compute = () => {
      if (computed) return computed;
      if (xhr.readyState !== 4) return null;
      const rt = xhr.responseType;
      if (rt !== "" && rt !== "text" && rt !== "json") return null;
      let text = rt === "json" ? JSON.stringify(getResp.call(xhr)) : getText2.call(xhr);
      for (const s3 of subs2) {
        let r3;
        try {
          r3 = s3.handler({ ...info, status: xhr.status, type: "xhr", text: () => text, json: () => JSON.parse(text) });
        } catch (e3) {
          logger22.error("响应改写出错,跳过", e3);
          continue;
        }
        if (r3?.then) {
          logger22.warn("XHR 响应的改写函数必须同步返回,已忽略");
          continue;
        }
        if (r3 === void 0 || r3 === null) continue;
        text = typeof r3 === "string" ? r3 : JSON.stringify(r3);
      }
      return computed = { text, rt };
    };
    try {
      Object.defineProperty(xhr, "responseText", { configurable: true, get() {
        const c4 = compute();
        return c4 && c4.rt !== "json" ? c4.text : getText2.call(this);
      } });
      Object.defineProperty(xhr, "response", { configurable: true, get() {
        const c4 = compute();
        if (!c4) return getResp.call(this);
        try {
          return c4.rt === "json" ? JSON.parse(c4.text) : c4.text;
        } catch {
          return null;
        }
      } });
    } catch (e3) {
      logger22.debug("无法改写 XHR 响应", e3, proto);
    }
  }
  function installNetworkHooks() {
    if (installed4) return;
    installed4 = true;
    wrapFetch();
    wrapXhr();
  }
  var addSub = (set, matcher, handler) => {
    installNetworkHooks();
    const s3 = { matcher, handler };
    set.add(s3);
    return () => set.delete(s3);
  };
  var onRequest = (matcher, handler) => addSub(reqSubs, matcher, handler);
  var onResponse2 = (matcher, handler) => addSub(resSubs, matcher, handler);
  var rewriteRequest = (matcher, handler) => addSub(reqRw, matcher, handler);
  var rewriteResponse = (matcher, handler) => addSub(resRw, matcher, handler);
  function hookMessages(target2, url, subs2, kind) {
    target2.addEventListener("message", (e3) => {
      let data = e3.data, changed2 = false;
      for (const s3 of subs2) {
        if (!s3.hooks.message) continue;
        let r3;
        try {
          r3 = s3.hooks.message(data, target2);
        } catch (err) {
          logger22.error(`${kind} 消息处理出错`, err);
          continue;
        }
        if (r3 === false) {
          e3.stopImmediatePropagation();
          return;
        }
        if (r3 !== void 0) {
          data = r3;
          changed2 = true;
        }
      }
      if (changed2) {
        try {
          Object.defineProperty(e3, "data", { value: data, configurable: true });
        } catch {
        }
      }
    });
  }
  function wrapConstructor(name, subsSet, onCreate) {
    const Orig = W3[name];
    if (typeof Orig !== "function") return false;
    const P4 = new Proxy(Orig, {
      construct(target2, args, newTarget) {
        const obj = Reflect.construct(target2, args, newTarget === P4 ? target2 : newTarget);
        try {
          const url = absUrl(args[0]);
          const subs2 = [...subsSet].filter((s3) => test(s3.matcher, url, name));
          if (subs2.length) onCreate(obj, url, subs2);
        } catch (e3) {
          logger22.error(`${name} 包装出错`, e3);
        }
        return obj;
      }
    });
    try {
      W3[name] = P4;
      return true;
    } catch (e3) {
      logger22.warn(`无法包装 ${name}`, e3);
      return false;
    }
  }
  function onWebSocket(matcher, hooks2 = {}) {
    if (!wsInstalled) {
      wsInstalled = true;
      wrapConstructor("WebSocket", wsSubs, (ws, url, subs2) => {
        hookMessages(ws, url, subs2, "WebSocket");
        if (subs2.some((s4) => s4.hooks.send)) {
          const send = ws.send;
          Object.defineProperty(ws, "send", {
            configurable: true,
            writable: true,
            value: function(data) {
              for (const s4 of subs2) {
                if (!s4.hooks.send) continue;
                let r3;
                try {
                  r3 = s4.hooks.send(data, ws);
                } catch (e3) {
                  logger22.error("WebSocket 发送处理出错", e3);
                  continue;
                }
                if (r3 === false) return void 0;
                if (r3 !== void 0) data = r3;
              }
              return send.call(this, data);
            }
          });
        }
        for (const s4 of subs2) if (s4.hooks.open) {
          try {
            s4.hooks.open(ws, url);
          } catch (e3) {
            logger22.error("WebSocket open 处理出错", e3);
          }
        }
      });
    }
    const s3 = { matcher, hooks: hooks2 };
    wsSubs.add(s3);
    return () => wsSubs.delete(s3);
  }
  function onEventSource(matcher, hooks2 = {}) {
    if (!esInstalled) {
      esInstalled = true;
      wrapConstructor("EventSource", esSubs, (es, url, subs2) => {
        hookMessages(es, url, subs2, "EventSource");
        for (const s4 of subs2) if (s4.hooks.open) {
          try {
            s4.hooks.open(es, url);
          } catch (e3) {
            logger22.error("EventSource open 处理出错", e3);
          }
        }
      });
    }
    const s3 = { matcher, hooks: hooks2 };
    esSubs.add(s3);
    return () => esSubs.delete(s3);
  }

  // vendor/userscript-pp/core/lib/jsxhook.js
  var logger23 = new Logger("RenderHook", "#fca5a5");
  var hooks = /* @__PURE__ */ new Map();
  var stringHooks = /* @__PURE__ */ new Map();
  var installed5 = false;
  var target = null;
  function isWritableJsx(exp) {
    try {
      if (!exp || typeof exp !== "object") return false;
      const d3 = Object.getOwnPropertyDescriptor(exp, "jsx");
      const d22 = Object.getOwnPropertyDescriptor(exp, "jsxs");
      return !!(d3 && d22 && "value" in d3 && d3.writable && typeof d3.value === "function" && typeof d22.value === "function" && exp.Fragment);
    } catch {
      return false;
    }
  }
  function locate() {
    const c4 = runtime.cache;
    if (c4) for (const id of Object.keys(c4)) {
      const exp = c4[id]?.exports;
      if (isWritableJsx(exp)) return exp;
    }
    for (const exp of moduleCache.values()) if (isWritableJsx(exp)) return exp;
    return null;
  }
  var busy = false;
  function wrap(orig) {
    const wrapped2 = function(type, props, key) {
      const set = typeof type === "string" ? stringHooks.get(type) : hooks.get(type);
      if (!set || busy || !props) return orig.apply(this, arguments);
      busy = true;
      try {
        for (const fn2 of set) {
          try {
            const out = fn2(props, key, (p4 = props) => orig.call(this, type, p4, key));
            if (out !== void 0) return out;
          } catch (e3) {
            logger23.error("渲染兜底钩子出错", e3);
          }
        }
      } finally {
        busy = false;
      }
      return orig.apply(this, arguments);
    };
    wrapped2.$$uspp_ccpp_Original = orig;
    return wrapped2;
  }
  function install() {
    if (installed5) return true;
    target = locate();
    if (!target) return false;
    try {
      target.jsx = wrap(target.jsx);
      target.jsxs = wrap(target.jsxs);
      installed5 = true;
      logger23.debug("已挂接 jsx 运行时");
      return true;
    } catch (e3) {
      logger23.warn("挂接 jsx 运行时失败", e3);
      return false;
    }
  }
  var waiting = false;
  function ensureInstalled() {
    if (install() || waiting) return;
    waiting = true;
    const off = onModuleLoad(() => {
      if (install()) {
        off();
        waiting = false;
      }
    });
  }
  function addRenderHook(type, fn2) {
    if (!type) return () => {
    };
    const map = typeof type === "string" ? stringHooks : hooks;
    let set = map.get(type);
    if (!set) map.set(type, set = /* @__PURE__ */ new Set());
    set.add(fn2);
    ensureInstalled();
    return () => set.delete(fn2);
  }
  var asArray = (c4) => c4 == null ? [] : Array.isArray(c4) ? c4 : [c4];
  function treeHas(node, test2, depth = 6) {
    if (node == null || depth < 0) return false;
    if (Array.isArray(node)) return node.some((n2) => treeHas(n2, test2, depth));
    if (typeof node !== "object") return false;
    if (test2(node)) return true;
    return treeHas(node.props?.children, test2, depth - 1);
  }

  // vendor/userscript-pp/core/lib/patcher.js
  var logger24 = new Logger("Patcher", "#f9a8d4");
  var records = /* @__PURE__ */ new WeakMap();
  var safe = (label, fn2) => {
    try {
      return fn2();
    } catch (e3) {
      logger24.error(`${label} 出错`, e3);
      return void 0;
    }
  };
  function install2(obj, name) {
    const orig = obj[name];
    if (typeof orig !== "function") throw new TypeError(`patchMethod:${String(name)} 不是函数`);
    const own = Object.prototype.hasOwnProperty.call(obj, name);
    const desc = own ? Object.getOwnPropertyDescriptor(obj, name) : null;
    const rec = { orig, own, desc, hooks: [], wrapper: null, installed: true };
    const wrapper = function(...args) {
      const self = this;
      const call2 = (a3) => new.target ? Reflect.construct(rec.orig, a3, new.target) : rec.orig.apply(self, a3);
      if (!rec.hooks.length) return call2(args);
      let skip = false;
      for (const hk of rec.hooks) {
        if (!hk.before) continue;
        const r3 = safe(`before 补丁(${hk.label})`, () => hk.before(args, self));
        if (r3 === false) skip = true;
      }
      let result;
      if (!skip) {
        let next = call2;
        for (const hk of rec.hooks) {
          if (!hk.instead) continue;
          const inner = next;
          next = (a3) => {
            try {
              return hk.instead(a3, (...x4) => inner(x4.length ? x4 : a3), self);
            } catch (e3) {
              logger24.error(`instead 补丁(${hk.label})出错,改用原方法`, e3);
              return inner(a3);
            }
          };
        }
        result = next(args);
      }
      for (const hk of rec.hooks) {
        if (!hk.after) continue;
        const r3 = safe(`after 补丁(${hk.label})`, () => hk.after(args, result, self));
        if (r3 !== void 0) result = r3;
      }
      return result;
    };
    try {
      Object.defineProperty(wrapper, "name", { value: orig.name, configurable: true });
      Object.defineProperty(wrapper, "length", { value: orig.length, configurable: true });
      Object.defineProperty(wrapper, "toString", { value: function toString() {
        return Function.prototype.toString.call(rec.orig);
      }, configurable: true, writable: true });
      if (orig.prototype) wrapper.prototype = orig.prototype;
    } catch {
    }
    rec.wrapper = wrapper;
    if (desc && !desc.writable && !desc.set && !desc.configurable) throw new TypeError(`patchMethod:${String(name)} 只读,无法补丁`);
    if (desc && "value" in desc) Object.defineProperty(obj, name, { ...desc, value: wrapper });
    else obj[name] = wrapper;
    return rec;
  }
  function patchMethod(obj, name, hooks2 = {}, label = "") {
    if (!obj || typeof obj !== "object" && typeof obj !== "function") throw new TypeError("patchMethod 需要对象");
    let map = records.get(obj);
    if (!map) records.set(obj, map = /* @__PURE__ */ new Map());
    let rec = map.get(name);
    if (!rec || !rec.installed) {
      rec = install2(obj, name);
      map.set(name, rec);
    }
    const hk = { before: hooks2.before, instead: hooks2.instead, after: hooks2.after, label: label || hooks2.label || String(name) };
    rec.hooks.push(hk);
    let done = false;
    return () => {
      if (done) return;
      done = true;
      const i3 = rec.hooks.indexOf(hk);
      if (i3 >= 0) rec.hooks.splice(i3, 1);
      if (rec.hooks.length || !rec.installed) return;
      let currentValue;
      try {
        currentValue = obj[name];
      } catch {
        return;
      }
      if (currentValue !== rec.wrapper) return;
      try {
        if (rec.own) Object.defineProperty(obj, name, { ...rec.desc, value: rec.orig });
        else delete obj[name];
        rec.installed = false;
        map.delete(name);
      } catch (e3) {
        logger24.debug("还原方法失败,保留透传", e3);
      }
    };
  }
  var isPatched = (obj, name) => !!records.get(obj)?.get(name)?.hooks.length;

  // vendor/userscript-pp/core/lib/datastore.js
  var logger25 = new Logger("DataStore", "#99f6e4");
  var DATA_DB = `UserscriptPP:${SCRIPT_ID}:data`;
  var STORE = "kv";
  var SEP = "\0";
  var GM_PREFIX = "data:";
  var dbp = null;
  var memory = null;
  function db() {
    if (dbp) return dbp;
    dbp = new Promise((resolve, reject) => {
      const idb = W3.indexedDB || (typeof indexedDB !== "undefined" ? indexedDB : null);
      if (!idb) return reject(new Error("no indexedDB"));
      const req = idb.open(DATA_DB, 1);
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE);
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
      req.onblocked = () => reject(new Error("blocked"));
    }).catch((e3) => {
      logger25.warn("IndexedDB 不可用,插件数据只保存在本次页面的内存里", e3?.message ?? e3);
      memory ??= /* @__PURE__ */ new Map();
      return null;
    });
    return dbp;
  }
  var tx = async (mode2, fn2) => {
    const d3 = await db();
    return new Promise((resolve, reject) => {
      const t4 = d3.transaction(STORE, mode2);
      fn2(t4.objectStore(STORE));
      t4.oncomplete = () => resolve();
      t4.onerror = () => reject(t4.error);
      t4.onabort = () => reject(t4.error);
    });
  };
  var reqValue = (r3) => new Promise((resolve, reject) => {
    r3.onsuccess = () => resolve(r3.result);
    r3.onerror = () => reject(r3.error);
  });
  async function idbGet2(k4) {
    const d3 = await db();
    if (!d3) return memory.get(k4);
    return reqValue(d3.transaction(STORE, "readonly").objectStore(STORE).get(k4));
  }
  async function idbSet2(k4, v3) {
    const d3 = await db();
    if (!d3) {
      memory.set(k4, v3);
      return;
    }
    await tx("readwrite", (s3) => {
      s3.put(v3, k4);
    });
  }
  async function idbDel(k4) {
    const d3 = await db();
    if (!d3) {
      memory.delete(k4);
      return;
    }
    await tx("readwrite", (s3) => {
      s3.delete(k4);
    });
  }
  async function idbKeys() {
    const d3 = await db();
    if (!d3) return [...memory.keys()];
    return reqValue(d3.transaction(STORE, "readonly").objectStore(STORE).getAllKeys());
  }
  var gmIndexKey = (plugin) => `${GM_PREFIX}${plugin}${SEP}__keys`;
  var gmKey = (plugin, key) => `${GM_PREFIX}${plugin}${SEP}${key}`;
  var gmMem = /* @__PURE__ */ new Map();
  var gmGet = (k4, d3) => GM2.get ? GM2.get(k4, d3) : gmMem.has(k4) ? gmMem.get(k4) : d3;
  var gmSet = (k4, v3) => GM2.set ? GM2.set(k4, v3) : gmMem.set(k4, v3);
  var gmDel = (k4) => GM2.del ? GM2.del(k4) : gmMem.delete(k4);
  var gmIndex = (plugin) => {
    const v3 = gmGet(gmIndexKey(plugin), []);
    return Array.isArray(v3) ? v3 : [];
  };
  var clone = (v3) => v3 === void 0 ? void 0 : typeof structuredClone === "function" ? structuredClone(v3) : JSON.parse(JSON.stringify(v3));
  var stores = /* @__PURE__ */ new Map();
  function dataStoreFor(plugin) {
    if (stores.has(plugin)) return stores.get(plugin);
    const k4 = (key) => `${plugin}${SEP}${String(key)}`;
    const global = Object.freeze({
      async get(key, fallback) {
        const v3 = gmGet(gmKey(plugin, key), void 0);
        return v3 === void 0 ? fallback : clone(v3);
      },
      async set(key, value) {
        gmSet(gmKey(plugin, key), clone(value));
        const idx = gmIndex(plugin);
        if (!idx.includes(String(key))) gmSet(gmIndexKey(plugin), [...idx, String(key)]);
      },
      async del(key) {
        gmDel(gmKey(plugin, key));
        gmSet(gmIndexKey(plugin), gmIndex(plugin).filter((x4) => x4 !== String(key)));
      },
      async keys() {
        return gmIndex(plugin);
      },
      async clear() {
        for (const key of gmIndex(plugin)) gmDel(gmKey(plugin, key));
        gmDel(gmIndexKey(plugin));
      }
    });
    const store2 = Object.freeze({
      async get(key, fallback) {
        try {
          const v3 = await idbGet2(k4(key));
          return v3 === void 0 ? fallback : v3;
        } catch (e3) {
          logger25.error(`${plugin} 读取数据失败`, e3);
          return fallback;
        }
      },
      async set(key, value) {
        await idbSet2(k4(key), value);
      },
      async del(key) {
        await idbDel(k4(key));
      },
      async keys() {
        const p4 = `${plugin}${SEP}`;
        return (await idbKeys()).filter((x4) => typeof x4 === "string" && x4.startsWith(p4)).map((x4) => x4.slice(p4.length));
      },
      async clear() {
        for (const key of await this.keys()) await idbDel(k4(key));
      },
      global
    });
    stores.set(plugin, store2);
    return store2;
  }
  async function exportData(pluginNames) {
    const out = {};
    for (const name of pluginNames) {
      const s3 = dataStoreFor(name);
      const site = {}, glob = {};
      for (const key of await s3.keys()) site[key] = await s3.get(key);
      for (const key of await s3.global.keys()) glob[key] = await s3.global.get(key);
      if (Object.keys(site).length || Object.keys(glob).length) out[name] = { site, global: glob };
    }
    return out;
  }
  async function importData(data) {
    if (!data || typeof data !== "object") return;
    for (const [name, v3] of Object.entries(data)) {
      const s3 = dataStoreFor(name);
      await s3.clear();
      await s3.global.clear();
      for (const [key, val] of Object.entries(v3?.site || {})) await s3.set(key, val);
      for (const [key, val] of Object.entries(v3?.global || {})) await s3.global.set(key, val);
    }
  }
  async function pruneData(keepNames) {
    const keep = new Set(keepNames);
    const idb = W3.indexedDB || (typeof indexedDB !== "undefined" ? indexedDB : null);
    if (typeof idb?.databases !== "function") return;
    try {
      if (!(await idb.databases()).some((d3) => d3.name === DATA_DB)) return;
    } catch {
      return;
    }
    try {
      for (const key of await idbKeys()) {
        if (typeof key !== "string") continue;
        const name = key.split(SEP)[0];
        if (!keep.has(name)) await idbDel(key);
      }
    } catch (e3) {
      logger25.debug("清理插件数据失败", e3);
    }
  }

  // vendor/userscript-pp/core/lib/plugin-errors.js
  var logger26 = new Logger("Plugins", "#a7f3d0");
  var stats = /* @__PURE__ */ new Map();
  var listeners4 = /* @__PURE__ */ new Set();
  var BREAKER_LIMIT = 10;
  var BREAKER_WINDOW_MS = 3e4;
  var breaker = null;
  var setBreaker = (fn2) => {
    breaker = fn2;
  };
  var onPluginError = (fn2) => {
    listeners4.add(fn2);
    return () => listeners4.delete(fn2);
  };
  var tripListeners = /* @__PURE__ */ new Set();
  var onPluginTripped = (fn2) => {
    tripListeners.add(fn2);
    return () => tripListeners.delete(fn2);
  };
  function reportPluginError(plugin, where, err) {
    if (!plugin) {
      logger26.error(`${where} 出错`, err);
      return;
    }
    let s3 = stats.get(plugin);
    if (!s3) stats.set(plugin, s3 = { count: 0, last: null, recent: [], tripped: false });
    const now2 = Date.now();
    s3.count++;
    s3.last = { where, message: String(err?.message ?? err).slice(0, 300), at: now2 };
    s3.recent = [...s3.recent.filter((t4) => now2 - t4 < BREAKER_WINDOW_MS), now2];
    logger26.error(`${plugin}(${where})出错`, err);
    for (const fn2 of [...listeners4]) {
      try {
        fn2(plugin, s3);
      } catch {
      }
    }
    if (!s3.tripped && s3.recent.length >= BREAKER_LIMIT && breaker) {
      s3.tripped = true;
      let stopped = false;
      try {
        stopped = breaker(plugin, s3) !== false;
      } catch (e3) {
        logger26.error(`停用 ${plugin} 失败`, e3);
      }
      if (stopped) {
        logger26.warn(`${plugin} 在 ${BREAKER_WINDOW_MS / 1e3} 秒内出错 ${BREAKER_LIMIT} 次,本页已停用`);
        for (const fn2 of [...tripListeners]) {
          try {
            fn2(plugin, s3);
          } catch {
          }
        }
      } else s3.tripped = false;
    }
  }
  function guard(plugin, where, fn2, rethrow = false) {
    if (typeof fn2 !== "function" || !plugin) return fn2;
    return function(...a3) {
      let r3;
      try {
        r3 = fn2.apply(this, a3);
      } catch (e3) {
        reportPluginError(plugin, where, e3);
        if (rethrow) throw e3;
        return void 0;
      }
      if (r3 && typeof r3.then === "function") {
        return rethrow ? r3.then(void 0, (e3) => {
          reportPluginError(plugin, where, e3);
          throw e3;
        }) : r3.then(void 0, (e3) => reportPluginError(plugin, where, e3));
      }
      return r3;
    };
  }
  function pluginErrorStats() {
    return [...stats.entries()].map(([name, s3]) => ({ name, count: s3.count, last: s3.last, tripped: s3.tripped })).sort((a3, b3) => b3.count - a3.count);
  }
  var pluginErrorsOf = (name) => {
    const s3 = stats.get(name);
    return s3 ? { count: s3.count, last: s3.last, tripped: s3.tripped } : null;
  };
  function resetBreaker(name) {
    const s3 = stats.get(name);
    if (s3) {
      s3.recent = [];
      s3.tripped = false;
    }
  }

  // vendor/userscript-pp/core/lib/scope.js
  var logger27 = new Logger("Scope", "#a5b4fc");
  var scopes = /* @__PURE__ */ new Map();
  var current5 = null;
  function runAs(name, fn2) {
    const prev = current5;
    current5 = name;
    try {
      return fn2();
    } finally {
      current5 = prev;
    }
  }
  function createScope(name) {
    const list2 = /* @__PURE__ */ new Set();
    const ac = typeof AbortController === "function" ? new AbortController() : null;
    let disposed = false;
    const register = (fn2) => {
      if (typeof fn2 !== "function") return fn2;
      if (disposed) {
        try {
          fn2();
        } catch (e3) {
          logger27.error(`${name} 清理出错`, e3);
        }
        return fn2;
      }
      list2.add(fn2);
      return fn2;
    };
    const unregister = (fn2) => list2.delete(fn2);
    const own = (off) => {
      if (typeof off !== "function") return off;
      let done = false;
      const once = () => {
        if (done) return;
        done = true;
        list2.delete(once);
        off();
      };
      register(once);
      return once;
    };
    const g5 = (where, fn2) => guard(name, where, fn2);
    const t4 = (where, fn2) => guard(name, where, fn2, true);
    const wrapHooks = (kind, hooks2) => hooks2 && typeof hooks2 === "object" ? Object.fromEntries(Object.entries(hooks2).map(([k4, v3]) => [k4, t4(`${kind}:${k4}`, v3)])) : hooks2;
    const wrapItem = (slot, def) => def && typeof def === "object" ? { ...def, ...Object.fromEntries(["onClick", "onSelect"].filter((k4) => typeof def[k4] === "function").map((k4) => [k4, g5(`${slot}:${k4}`, def[k4])])) } : def;
    const ctx = {
      plugin: name,
      get signal() {
        return ac?.signal;
      },
      get disposed() {
        return disposed;
      },
      get pending() {
        return list2.size;
      },
      register,
      // 插件给的回调都包一层,出错记到本插件名下(见 plugin-errors.js)。返回值有意义的(网络改写、渲染钩子、方法补丁)照常抛给调用方
      observe: (selector, opts = {}) => own(observe(selector, { ...opts, added: g5("observe", opts.added), removed: g5("observe", opts.removed) })),
      onRouteChange: (fn2) => own(onRouteChange(g5("route", fn2))),
      onRequest: (m3, fn2) => own(onRequest(m3, g5("onRequest", fn2))),
      onResponse: (m3, fn2) => own(onResponse2(m3, g5("onResponse", fn2))),
      rewriteRequest: (m3, fn2) => own(rewriteRequest(m3, t4("rewriteRequest", fn2))),
      rewriteResponse: (m3, fn2) => own(rewriteResponse(m3, t4("rewriteResponse", fn2))),
      onWebSocket: (m3, hooks2) => own(onWebSocket(m3, wrapHooks("WebSocket", hooks2))),
      onEventSource: (m3, hooks2) => own(onEventSource(m3, wrapHooks("EventSource", hooks2))),
      addRenderHook: (type, fn2) => own(addRenderHook(type, t4("renderHook", fn2))),
      subscribe: (ev, fn2) => own(subscribe(ev, g5(`event:${ev}`, fn2))),
      onSlotChange: (slot, fn2) => own(onSlotChange(slot, g5(`slot:${slot}`, fn2))),
      addSlotItem: (slot, id, def) => {
        addSlotItem2(slot, id, wrapItem(slot, def));
        return own(() => removeSlotItem(slot, id));
      },
      patch: (obj, method, hooks2) => own(patchMethod(obj, method, hooks2 && typeof hooks2 === "object" ? Object.fromEntries(Object.entries(hooks2).map(([k4, v3]) => [k4, t4(`patch:${method}`, v3)])) : hooks2)),
      listen: (target2, type, fn2, opts) => {
        if (!target2?.addEventListener) return () => {
        };
        const wrapped2 = typeof fn2 === "function" ? g5(`listen:${type}`, fn2) : fn2;
        target2.addEventListener(type, wrapped2, opts);
        return own(() => target2.removeEventListener(type, wrapped2, opts));
      },
      setTimeout: (fn2, ms, ...a3) => {
        let off = null;
        const run = g5("timer", fn2);
        const id = W3.setTimeout(() => {
          off?.();
          run(...a3);
        }, ms);
        off = own(() => W3.clearTimeout(id));
        return off;
      },
      setInterval: (fn2, ms, ...a3) => {
        const run = g5("interval", fn2);
        const id = W3.setInterval(() => run(...a3), ms);
        return own(() => W3.clearInterval(id));
      },
      /** 插件自己捕获的错误也可以记到自己名下 */
      reportError: (err, where = "reported") => reportPluginError(name, where, err),
      get data() {
        return dataStoreFor(name);
      }
    };
    const dispose = () => {
      if (disposed) return;
      disposed = true;
      try {
        ac?.abort();
      } catch {
      }
      const fns = [...list2].reverse();
      list2.clear();
      for (const fn2 of fns) {
        try {
          fn2();
        } catch (e3) {
          logger27.error(`${name} 清理出错`, e3);
        }
      }
    };
    return { ctx, dispose, register, unregister };
  }
  function openScope(name) {
    scopes.get(name)?.dispose();
    const s3 = createScope(name);
    scopes.set(name, s3);
    return s3.ctx;
  }
  function closeScope(name) {
    const s3 = scopes.get(name);
    if (!s3) return;
    scopes.delete(name);
    s3.dispose();
  }
  var getScope = (name) => scopes.get(name)?.ctx ?? null;
  function ownByCurrent(off) {
    if (!current5 || typeof off !== "function") return off;
    const s3 = scopes.get(current5);
    if (!s3) return off;
    let done = false;
    const once = () => {
      if (done) return;
      done = true;
      s3.unregister(once);
      off();
    };
    s3.register(once);
    return once;
  }

  // vendor/userscript-pp/core/lib/commands.js
  var logger28 = new Logger("Commands", "#bef264");
  var commands = /* @__PURE__ */ new Map();
  var listeners5 = /* @__PURE__ */ new Set();
  var emit3 = () => {
    for (const l3 of [...listeners5]) {
      try {
        l3();
      } catch {
      }
    }
  };
  var subscribeCommands = (fn2) => {
    listeners5.add(fn2);
    return () => listeners5.delete(fn2);
  };
  function registerCommand(def) {
    if (!def?.id || typeof def.run !== "function") throw new Error("registerCommand 需要 id 和 run");
    const id = String(def.id);
    commands.set(id, { ...def, id, name: def.name || id });
    emit3();
    return () => {
      if (commands.get(id)?.run === def.run) {
        commands.delete(id);
        emit3();
      }
    };
  }
  var getCommands = () => [...commands.values()].filter((c4) => {
    try {
      return c4.when ? !!c4.when() : true;
    } catch {
      return false;
    }
  });
  var getCommand = (id) => commands.get(id) ?? null;
  var sys = () => PlainSettings.plugins.Settings ??= {};
  var userKeybinds = () => sys().keybinds && typeof sys().keybinds === "object" ? sys().keybinds : {};
  function keyFor3(id) {
    const u3 = userKeybinds();
    if (Object.prototype.hasOwnProperty.call(u3, id)) return u3[id] || "";
    return normalizeCombo(commands.get(id)?.defaultKey || "");
  }
  function setKeybind(id, combo) {
    Settings.plugins.Settings.keybinds = { ...userKeybinds(), [id]: normalizeCombo(combo || "") };
  }
  function resetKeybind(id) {
    const next = { ...userKeybinds() };
    delete next[id];
    Settings.plugins.Settings.keybinds = next;
  }
  function conflictsOf(id) {
    const k4 = keyFor3(id);
    if (!k4) return [];
    return getCommands().filter((c4) => c4.id !== id && keyFor3(c4.id) === k4).map((c4) => c4.id);
  }
  async function runCommand(id) {
    const c4 = commands.get(id);
    if (!c4) return false;
    try {
      await c4.run();
      const usage2 = { ...sys().commandUsage || {} };
      usage2[id] = (usage2[id] || 0) + 1;
      Settings.plugins.Settings.commandUsage = usage2;
      return true;
    } catch (e3) {
      logger28.error(`命令 ${c4.name} 出错`, e3);
      return false;
    }
  }
  var usageOf = (id) => sys().commandUsage?.[id] || 0;
  var MODS = ["Ctrl", "Alt", "Shift", "Meta"];
  var keyName = (k4) => k4 === " " ? "Space" : k4.length === 1 ? k4.toUpperCase() : k4;
  function normalizeCombo(s3) {
    if (!s3) return "";
    const parts = String(s3).split("+").map((x4) => x4.trim()).filter(Boolean);
    const mods = MODS.filter((m3) => parts.some((p4) => p4.toLowerCase() === m3.toLowerCase() || m3 === "Meta" && /^(cmd|command)$/i.test(p4) || m3 === "Ctrl" && /^control$/i.test(p4)));
    const key = parts.find((p4) => !MODS.some((m3) => m3.toLowerCase() === p4.toLowerCase()) && !/^(cmd|command|control)$/i.test(p4));
    return key ? [...mods, keyName(key)].join("+") : "";
  }
  function comboOf(e3) {
    if (["Control", "Alt", "Shift", "Meta"].includes(e3.key)) return "";
    let key = e3.code?.startsWith("Key") ? e3.code.slice(3) : e3.code?.startsWith("Digit") ? e3.code.slice(5) : e3.key;
    if (!key) return "";
    const mods = [e3.ctrlKey && "Ctrl", e3.altKey && "Alt", e3.shiftKey && "Shift", e3.metaKey && "Meta"].filter(Boolean);
    return [...mods, keyName(key)].join("+");
  }
  var isEditable2 = (el) => !!el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));
  var installed6 = false;
  var recording = null;
  function recordNextKey(cb) {
    recording = cb;
    return () => {
      if (recording === cb) recording = null;
    };
  }
  function installKeybinds() {
    if (installed6) return;
    installed6 = true;
    W3.document.addEventListener("keydown", (e3) => {
      const combo = comboOf(e3);
      if (!combo) return;
      if (recording) {
        const cb = recording;
        recording = null;
        e3.preventDefault();
        e3.stopPropagation();
        cb(combo === "Escape" ? null : combo);
        return;
      }
      const hasMod = e3.ctrlKey || e3.altKey || e3.metaKey;
      if (!hasMod && isEditable2(e3.composedPath?.()[0] || e3.target)) return;
      const hit = getCommands().find((c4) => keyFor3(c4.id) === combo);
      if (!hit) return;
      e3.preventDefault();
      e3.stopPropagation();
      runCommand(hit.id);
    }, true);
  }

  // vendor/userscript-pp/core/lib/interceptors.js
  var logger29 = new Logger("Interceptors", "#fca5a5");
  var chains = /* @__PURE__ */ new Map();
  var declared = /* @__PURE__ */ new Set();
  function setSiteInterceptors(list2) {
    declared = new Set(Array.isArray(list2) ? list2 : []);
  }
  function addInterceptor(name, fn2, { id = "", order = 0 } = {}) {
    if (typeof fn2 !== "function") return () => {
    };
    if (!declared.has(name)) logger29.debug(`登记了当前站点没有声明的拦截器 ${name}`);
    let list2 = chains.get(name);
    if (!list2) chains.set(name, list2 = []);
    const entry = { id, fn: fn2, order };
    list2.push(entry);
    list2.sort((a3, b3) => a3.order - b3.order);
    return () => {
      const i3 = list2.indexOf(entry);
      if (i3 >= 0) list2.splice(i3, 1);
    };
  }
  var hasInterceptors = (name) => !!chains.get(name)?.length;
  var withTimeout = (p4, ms) => new Promise((resolve, reject) => {
    const t4 = setTimeout(() => reject(new Error(`超过 ${ms} 毫秒`)), ms);
    Promise.resolve(p4).then((v3) => {
      clearTimeout(t4);
      resolve(v3);
    }, (e3) => {
      clearTimeout(t4);
      reject(e3);
    });
  });
  async function runInterceptors(name, value, { timeout = 3e3 } = {}) {
    let cur = value;
    for (const { id, fn: fn2 } of [...chains.get(name) || []]) {
      let r3;
      try {
        r3 = await withTimeout(fn2(cur), timeout);
      } catch (e3) {
        logger29.error(`拦截器 ${name}(${id})出错或超时,已跳过`, e3);
        continue;
      }
      if (r3 === void 0) continue;
      if (r3 && typeof r3 === "object" && r3.cancel === true) return { value: cur, cancelled: true, by: id };
      cur = r3;
    }
    return { value: cur, cancelled: false, by: null };
  }

  // vendor/userscript-pp/core/lib/settings-pages.js
  var pages = /* @__PURE__ */ new Map();
  var listeners6 = /* @__PURE__ */ new Set();
  var emit4 = () => {
    for (const l3 of [...listeners6]) {
      try {
        l3();
      } catch {
      }
    }
  };
  var subscribeSettingsPages = (fn2) => {
    listeners6.add(fn2);
    return () => listeners6.delete(fn2);
  };
  function registerSettingsPage(def) {
    if (!def?.id || !def.component) throw new Error("registerSettingsPage 需要 id 和 component");
    const key = String(def.id);
    const entry = { order: 0, ...def, key, id: `uspp_ccpp_page_${key.replace(/[^\w-]/g, "_")}`, label: def.label || key, custom: true };
    pages.set(key, entry);
    emit4();
    return () => {
      if (pages.get(key) === entry) {
        pages.delete(key);
        emit4();
      }
    };
  }
  var getRegisteredPages = () => [...pages.values()].sort((a3, b3) => (a3.order ?? 0) - (b3.order ?? 0));

  // vendor/userscript-pp/core/lib/safemode.js
  var logger30 = new Logger("SafeMode", "#fca5a5");
  var BOOT_KEY = "UserscriptPPBoot";
  var RAPID_MS = 2 * 60 * 1e3;
  var mem = /* @__PURE__ */ new Map();
  var read = () => {
    try {
      const v3 = GM2.get ? GM2.get(BOOT_KEY, null) : mem.get(BOOT_KEY);
      return v3 && typeof v3 === "object" ? v3 : {};
    } catch {
      return {};
    }
  };
  var write = (v3) => {
    try {
      if (GM2.set) GM2.set(BOOT_KEY, v3);
      else mem.set(BOOT_KEY, v3);
    } catch {
    }
  };
  var active = false;
  var reason = null;
  var previous = {};
  var state = {};
  var failedThisBoot = false;
  var healthy = false;
  var isSafeMode = () => active;
  var safeModeReason = () => reason;
  var lastBootInfo = () => ({ lastPlugin: previous.lastPlugin ?? null, failed: previous.failed ?? [] });
  var save = (v3) => {
    state = v3;
    write(v3);
  };
  function beginBoot() {
    previous = read();
    const now2 = Date.now();
    const hash = (() => {
      try {
        return W3.location.hash.includes("uspp-ccpp-safe");
      } catch {
        return false;
      }
    })();
    const rapid = previous.pending && now2 - (previous.at || 0) < RAPID_MS;
    const pending2 = rapid ? previous.pending || 0 : 0;
    if (previous.force) {
      active = true;
      reason = "manual";
    } else if (hash) {
      active = true;
      reason = "url";
    } else if (pending2 >= 2) {
      active = true;
      reason = "crash";
    }
    save({ pending: active ? 0 : pending2 + 1, at: now2, lastPlugin: null, failed: [] });
    if (active) logger30.warn(`已进入安全模式(${reason}):只启动必需插件`);
  }
  function markBootHealthy(delay = 1e4) {
    const done = () => {
      if (healthy) return;
      healthy = true;
      if (state.pending) save({ ...state, pending: 0 });
    };
    setTimeout(done, delay);
    try {
      W3.addEventListener("pagehide", () => {
        if (!failedThisBoot) done();
      }, { once: true });
    } catch {
    }
  }
  function noteStarting(name) {
    if (!state.pending || state.lastPlugin === name) return;
    save({ ...state, lastPlugin: name });
  }
  function noteFailed(name) {
    failedThisBoot = true;
    save({ ...state, failed: [.../* @__PURE__ */ new Set([...state.failed || [], name])].slice(-10) });
  }
  function reloadInSafeMode() {
    save({ ...state, force: true });
    W3.location.reload();
  }
  function exitSafeMode() {
    write({ pending: 0, at: Date.now() });
    try {
      if (W3.location.hash.includes("uspp-ccpp-safe")) W3.location.hash = "";
    } catch {
    }
    W3.location.reload();
  }

  // vendor/userscript-pp/core/lib/plugins.js
  var perfNow = () => typeof performance !== "undefined" ? performance.now() : Date.now();
  var logger31 = new Logger("PluginManager", "#a5b4fc");
  var StartAt = Object.freeze({
    Init: "Init",
    DOMContentLoaded: "DOMContentLoaded",
    SiteReady: "SiteReady",
    // 旧名:Turbopack 站点上"模块稳定"就是站点就绪
    TurbopackReady: "SiteReady"
  });
  var OptionType = Object.freeze({
    STRING: 0,
    NUMBER: 1,
    BIGINT: 2,
    BOOLEAN: 3,
    SELECT: 4,
    SLIDER: 5,
    COMPONENT: 6,
    CUSTOM: 7
  });
  var plugins2 = {};
  var depEnabled = /* @__PURE__ */ new Set();
  var runtimeRegistered = /* @__PURE__ */ new Set();
  var otherSites = /* @__PURE__ */ new Set();
  var cleanup = /* @__PURE__ */ new Map();
  var definePlugin2 = (def) => def;
  function definePluginSettings2(def, checks) {
    const ds = {
      def,
      checks: checks ?? {},
      pluginName: null,
      get store() {
        if (!this.pluginName) throw new Error("插件注册前不能访问 settings.store");
        return Settings.plugins[this.pluginName];
      },
      get plain() {
        if (!this.pluginName) throw new Error("插件注册前不能访问 settings.plain");
        return PlainSettings.plugins[this.pluginName] ??= {};
      },
      use(keys) {
        const React = getReact();
        const [, force] = React.useReducer((x4) => x4 + 1, 0);
        const name = this.pluginName;
        React.useEffect(() => {
          const prefix = `plugins.${name}.`;
          const fn2 = (_3, path) => {
            const key = path.slice(prefix.length).split(".")[0];
            if (!keys || keys.includes(key)) force();
          };
          SettingsStore.addPrefixChangeListener(prefix, fn2);
          return () => SettingsStore.removePrefixChangeListener(prefix, fn2);
        }, [name]);
        return this.store;
      },
      withPrivateSettings() {
        return this;
      }
    };
    return ds;
  }
  function getSettingDefault(setting) {
    if (!setting) return void 0;
    if (setting.type === OptionType.SELECT) return setting.options?.find((o3) => o3.default)?.value;
    return setting.default;
  }
  setDefaultResolver((pluginName, key) => {
    if (key === "enabled") return void 0;
    const s3 = plugins2[pluginName]?.settings?.def?.[key];
    return getSettingDefault(s3);
  });
  function isPluginEnabled(name) {
    const p4 = plugins2[name];
    if (!p4) return false;
    if (p4.chromiumOnly && !isChromium()) return false;
    if (p4.required || depEnabled.has(name)) return true;
    const stored = PlainSettings.plugins[name]?.enabled;
    if (typeof stored === "boolean") return stored;
    return !!p4.enabledByDefault;
  }
  var isEnabledAsDependency = (name) => depEnabled.has(name);
  var pluginHasPatches = (p4) => Array.isArray(p4.patches) && p4.patches.length > 0;
  var needsRestart = (p4) => pluginHasPatches(p4) && !!getSite().driver || !!p4.requiresRestart;
  function bindMethods(p4) {
    for (const k4 of Object.keys(p4)) {
      if (k4 === "start" || k4 === "stop") continue;
      const v3 = p4[k4];
      if (typeof v3 === "function" && !v3.$$uspp_ccpp_Bound && !(v3.prototype && v3.prototype.isReactComponent) && k4 !== "icon") {
        const bound2 = v3.bind(p4);
        Object.defineProperty(bound2, "$$uspp_ccpp_Bound", { value: true });
        p4[k4] = bound2;
      }
    }
  }
  function addPlugin(def, { runtime: runtime2 = false } = {}) {
    if (!def || !def.name) throw new Error("插件必须有 name");
    if (plugins2[def.name]) return false;
    if (def.dev && true) return false;
    if (def.site == null) def.site = runtime2 ? getSite().id : "*";
    if (def.site !== "*" && def.site !== getSite().id) {
      otherSites.add(def.name);
      if (runtime2) logger31.warn(`${def.name} 属于站点 ${def.site},不是当前站点,未注册`);
      return false;
    }
    const p4 = def;
    p4.started = false;
    if (p4.settings) p4.settings.pluginName = p4.name;
    bindMethods(p4);
    PlainSettings.plugins[p4.name] ??= {};
    plugins2[p4.name] = p4;
    if (runtime2) runtimeRegistered.add(p4.name);
    return true;
  }
  var patchesNotApplicable = /* @__PURE__ */ new Set();
  var siteHasDriver = () => !!getSite().driver;
  function registerPatches() {
    for (const p4 of Object.values(plugins2)) {
      if (!pluginHasPatches(p4) || runtimeRegistered.has(p4.name)) continue;
      if (!siteHasDriver()) {
        patchesNotApplicable.add(p4.name);
        continue;
      }
      const enabled = isPluginEnabled(p4.name) && (!isSafeMode() || p4.required);
      if (!enabled && true) continue;
      p4.patches.forEach((patch, i3) => {
        try {
          addPatch(patch, p4.name, { checkOnly: !enabled, key: `${p4.name}#${i3}` });
        } catch (e3) {
          logger31.error(`登记 ${p4.name} 的第 ${i3} 条补丁失败`, e3);
        }
      });
    }
  }
  function pluginSlots(p4) {
    const out = { ...p4.slots || {} };
    const aliases = getSite().pluginAliases || {};
    for (const [field, map] of Object.entries(aliases)) {
      if (p4[field] == null || typeof map !== "function") continue;
      let extra = null;
      try {
        extra = map(p4[field], p4);
      } catch (e3) {
        logger31.error(`${p4.name}.${field} 转换失败`, e3);
      }
      for (const [slot, v3] of Object.entries(extra || {})) {
        if (v3 == null) continue;
        out[slot] = out[slot] ? [].concat(out[slot], v3) : v3;
      }
    }
    return out;
  }
  function track(name, fn2) {
    let list2 = cleanup.get(name);
    if (!list2) cleanup.set(name, list2 = []);
    list2.push(fn2);
  }
  function runCleanup2(name) {
    const list2 = cleanup.get(name) || [];
    cleanup.delete(name);
    for (const fn2 of list2.reverse()) {
      try {
        fn2();
      } catch (e3) {
        logger31.error(`${name} 清理出错`, e3);
      }
    }
  }
  function subscribeZustand(p4) {
    for (const [storeName, conf] of Object.entries(p4.zustand || {})) {
      let unsub = null, cancelled = false;
      const attach = (store3) => {
        if (cancelled) return;
        const handler = (cur, prev) => {
          try {
            conf.handler.call(p4, cur, prev);
          } catch (e3) {
            reportPluginError(p4.name, `zustand:${storeName}`, e3);
          }
        };
        if (conf.selector) {
          if (store3.subscribe.length >= 2) {
            try {
              unsub = store3.subscribe(conf.selector, handler);
              if (typeof unsub === "function") return;
            } catch {
            }
          }
          let last2 = conf.selector(store3.getState());
          unsub = store3.subscribe((state3) => {
            const next = conf.selector(state3);
            if (Object.is(next, last2)) return;
            const prev = last2;
            last2 = next;
            handler(next, prev);
          });
        } else {
          unsub = store3.subscribe(handler);
        }
      };
      const store2 = findStore(storeName);
      let cancelWait = null;
      if (store2) attach(store2);
      else cancelWait = waitFor(filters.byStoreName(storeName), (m3) => {
        const key = "use" + storeName.replace(/^use/, "").replace(/Store$/, "") + "Store";
        attach(m3[key]);
      });
      track(p4.name, () => {
        cancelled = true;
        cancelWait?.();
        if (typeof unsub === "function") unsub();
      });
    }
  }
  function startPlugin(p4, stack3 = []) {
    if (typeof p4 === "string") p4 = plugins2[p4];
    if (!p4) return false;
    if (p4.started) return true;
    if (diag.disablePlugins.includes(p4.name)) {
      trace("plugin.start.skipped", p4.name);
      return false;
    }
    trace("plugin.start", p4.name);
    if (stack3.includes(p4.name)) {
      logger31.error(`发现循环依赖:${[...stack3, p4.name].join(" -> ")}`);
      return false;
    }
    for (const dep of p4.dependencies || []) {
      const d3 = plugins2[dep];
      if (!d3) {
        logger31.warn(`${p4.name} 依赖的插件 ${dep} 不存在`);
        return false;
      }
      if (!d3.started) {
        if (!isPluginEnabled(dep)) {
          depEnabled.add(dep);
          Settings.plugins[dep].enabled = true;
        }
        if (!startPlugin(d3, [...stack3, p4.name])) return false;
      }
    }
    noteStarting(p4.name);
    p4.startError = null;
    resetBreaker(p4.name);
    const t0 = perfNow();
    const ctx = openScope(p4.name);
    ctx.fetchExternal = fetchExternalFor(p4.name, p4.connect);
    try {
      if (p4.managedStyle) {
        enableStyle(p4.managedStyle);
        if (!pluginHasPatches(p4)) track(p4.name, () => disableStyle(p4.managedStyle));
      }
      const started = runAs(p4.name, () => p4.start?.(ctx));
      if (started && typeof started.then === "function") started.then(void 0, (e3) => reportPluginError(p4.name, "start (async)", e3));
      for (const c4 of p4.commands || []) {
        if (!c4) continue;
        track(p4.name, registerCommand({ ...c4, run: guard(p4.name, `command:${c4.id ?? c4.name}`, c4.run, true), id: String(c4.id ?? c4.name).includes(".") ? String(c4.id ?? c4.name) : `${p4.name}.${c4.id ?? c4.name}`, plugin: p4.name }));
      }
      for (const [name, fn2] of Object.entries(p4.interceptors || {})) {
        if (typeof fn2 === "function") track(p4.name, addInterceptor(name, guard(p4.name, `interceptor:${name}`, fn2.bind(p4), true), { id: p4.name }));
      }
      for (const page2 of p4.settingsPages || []) {
        if (page2) track(p4.name, registerSettingsPage({ ...page2, plugin: p4.name }));
      }
      for (const [slot, value] of Object.entries(pluginSlots(p4))) {
        const list2 = Array.isArray(value) ? value : [value];
        list2.forEach((item, i3) => {
          if (!item) return;
          const id = list2.length > 1 ? `${p4.name}:${i3}` : p4.name;
          addSlotItem2(slot, id, item);
          track(p4.name, () => removeSlotItem(slot, id));
        });
      }
      for (const [ev, handler] of Object.entries(p4.events || {})) {
        const off = subscribe(ev, guard(p4.name, `event:${ev}`, (data) => handler.call(p4, data)));
        track(p4.name, off);
      }
      if (p4.zustand) subscribeZustand(p4);
      if (typeof p4.onSettingsChange === "function") {
        const prefix = `plugins.${p4.name}.`;
        const fn2 = (v3, path) => {
          if (path === `${prefix}enabled`) return;
          try {
            p4.onSettingsChange(v3, path);
          } catch (e3) {
            reportPluginError(p4.name, "onSettingsChange", e3);
          }
        };
        SettingsStore.addPrefixChangeListener(prefix, fn2);
        track(p4.name, () => SettingsStore.removePrefixChangeListener(prefix, fn2));
      }
      p4.started = true;
      p4.trippedByErrors = false;
      p4.startMs = Math.round((perfNow() - t0) * 10) / 10;
      logger31.debug(`已启动 ${p4.name}(${p4.startMs} ms)`);
      return true;
    } catch (e3) {
      logger31.error(`启动 ${p4.name} 失败`, e3);
      p4.startError = e3;
      noteFailed(p4.name);
      runCleanup2(p4.name);
      closeScope(p4.name);
      if (p4.managedStyle && !pluginHasPatches(p4)) disableStyle(p4.managedStyle);
      p4.started = false;
      return false;
    }
  }
  setBreaker((name) => {
    const p4 = plugins2[name];
    if (!p4 || p4.required || !p4.started) return false;
    stopPlugin(p4);
    p4.trippedByErrors = true;
    return true;
  });
  function slowestStarts(limit = 5) {
    return Object.values(plugins2).filter((p4) => p4.started && typeof p4.startMs === "number").sort((a3, b3) => b3.startMs - a3.startMs).slice(0, limit).map((p4) => ({ name: p4.name, ms: p4.startMs }));
  }
  function stopPlugin(p4) {
    if (typeof p4 === "string") p4 = plugins2[p4];
    if (!p4) return false;
    if (!p4.started) return true;
    try {
      runAs(p4.name, () => p4.stop?.(getScope(p4.name) ?? void 0));
    } catch (e3) {
      logger31.error(`${p4.name}.stop 出错`, e3);
    }
    runCleanup2(p4.name);
    closeScope(p4.name);
    if (p4.managedStyle && !pluginHasPatches(p4)) {
      try {
        disableStyle(p4.managedStyle);
      } catch (e3) {
        logger31.error(e3);
      }
    }
    for (const sel of p4.cleanupSelectors || []) {
      try {
        document.querySelectorAll(sel).forEach((el) => el.remove());
      } catch (e3) {
        logger31.error(`${p4.name} 清理选择器 ${sel} 出错`, e3);
      }
    }
    p4.started = false;
    logger31.debug(`已停止 ${p4.name}`);
    return true;
  }
  function syncEnabled(p4, enabled) {
    if (p4.required || depEnabled.has(p4.name) || isPluginEnabled(p4.name) === enabled) return;
    Settings.plugins[p4.name].enabled = enabled;
    dispatch(Events.PLUGIN_TOGGLE, { name: p4.name, enabled });
  }
  function startPluginApi(p4) {
    if (typeof p4 === "string") p4 = plugins2[p4];
    const ok = startPlugin(p4);
    if (ok) syncEnabled(p4, true);
    return ok;
  }
  function stopPluginApi(p4) {
    if (typeof p4 === "string") p4 = plugins2[p4];
    const ok = stopPlugin(p4);
    if (ok && p4) syncEnabled(p4, false);
    return ok;
  }
  function togglePlugin2(name) {
    const p4 = plugins2[name];
    if (!p4) return false;
    if (p4.required || depEnabled.has(name)) return false;
    const next = !isPluginEnabled(name);
    Settings.plugins[name].enabled = next;
    if (next) startPlugin(p4);
    else stopPlugin(p4);
    dispatch(Events.PLUGIN_TOGGLE, { name, enabled: next });
    return needsRestart(p4);
  }
  function registerPlugin(def) {
    if (!addPlugin(def, { runtime: true })) return false;
    const known2 = Settings.plugins.Settings?.knownPlugins;
    if (known2 && known2[def.name] == null) known2[def.name] = Date.now();
    return true;
  }
  var STALE_MS = 90 * 24 * 60 * 60 * 1e3;
  var DAY_MS = 24 * 60 * 60 * 1e3;
  function cleanStaleSettings(now2 = Date.now()) {
    const sys4 = Settings.plugins.Settings;
    if (!PlainSettings.plugins.Settings?.pluginsLastSeen || typeof PlainSettings.plugins.Settings.pluginsLastSeen !== "object") sys4.pluginsLastSeen = {};
    const seen3 = sys4.pluginsLastSeen;
    const plain = PlainSettings.plugins.Settings.pluginsLastSeen;
    const present = (name) => !!plugins2[name] || otherSites.has(name);
    for (const name of Object.keys(plugins2)) if (!(now2 - (plain[name] || 0) < DAY_MS)) seen3[name] = now2;
    const keep = /* @__PURE__ */ new Set([...Object.keys(plugins2), ...otherSites]);
    for (const name of Object.keys(PlainSettings.plugins)) {
      if (present(name)) continue;
      const at = plain[name];
      if (!at) {
        seen3[name] = now2;
        keep.add(name);
        continue;
      }
      if (now2 - at < STALE_MS) {
        keep.add(name);
        continue;
      }
      delete Settings.plugins[name];
      delete seen3[name];
      logger31.info(`插件 ${name} 已 ${Math.round((now2 - at) / DAY_MS)} 天没出现,删除它的设置和数据`);
    }
    for (const name of Object.keys(plain)) if (!present(name) && now2 - plain[name] < STALE_MS) keep.add(name);
    return [...keep];
  }
  function recordKnownPlugins() {
    const s3 = Settings.plugins.Settings;
    if (!s3) return;
    if (!PlainSettings.plugins.Settings.knownPlugins || typeof PlainSettings.plugins.Settings.knownPlugins !== "object") s3.knownPlugins = {};
    const known2 = s3.knownPlugins;
    const now2 = Date.now();
    for (const name of Object.keys(plugins2)) if (known2[name] == null) known2[name] = now2;
  }
  function enforceDependencies() {
    for (const p4 of Object.values(plugins2)) {
      if (!isPluginEnabled(p4.name)) continue;
      for (const d3 of p4.dependencies || []) {
        const dep = plugins2[d3];
        if (!dep) {
          logger31.warn(`${p4.name} 依赖的插件 ${d3} 不在当前站点`);
          continue;
        }
        if (!isPluginEnabled(d3)) {
          depEnabled.add(d3);
          Settings.plugins[d3].enabled = true;
        }
      }
    }
    if (PlainSettings.plugins.Settings && PlainSettings.plugins.Settings.enabled === false) Settings.plugins.Settings.enabled = true;
  }
  function startAllAt(stage) {
    const failed2 = [];
    for (const p4 of Object.values(plugins2)) {
      if ((p4.startAt ?? StartAt.Init) !== stage) continue;
      if (!isPluginEnabled(p4.name) || p4.started) continue;
      if (isSafeMode() && !p4.required) continue;
      if (!startPlugin(p4)) failed2.push(p4);
    }
    return failed2;
  }
  function sensitiveKeys(name) {
    const def = plugins2[name]?.settings?.def;
    return def ? Object.keys(def).filter((k4) => def[k4]?.sensitive) : [];
  }
  function getVisibleSettings(p4) {
    const def = p4?.settings?.def;
    if (!def) return [];
    return Object.entries(def).filter(([, s3]) => s3 && !s3.hidden && s3.type !== OptionType.CUSTOM);
  }
  function migratePluginSettings(name, ...oldNames) {
    const all = PlainSettings.plugins;
    const cur = all[name];
    if (cur && Object.keys(cur).length) return false;
    for (const old of oldNames) {
      if (old !== name && all[old] && typeof all[old] === "object") {
        Settings.plugins[name] = { ...all[old] };
        delete Settings.plugins[old];
        logger31.info(`已把插件设置 ${old} 迁移到 ${name}`);
        return true;
      }
    }
    return false;
  }
  function migratePluginSetting(pluginName, newKey, oldKey) {
    const s3 = PlainSettings.plugins[pluginName];
    if (!s3 || !(oldKey in s3) || newKey in s3) return false;
    Settings.plugins[pluginName][newKey] = s3[oldKey];
    delete Settings.plugins[pluginName][oldKey];
    return true;
  }

  // vendor/userscript-pp/core/lib/backup.js
  var logger32 = new Logger("Backup", "#93c5fd");
  var BACKUP_FORMAT = "userscript-pp-settings";
  var clone2 = (v3) => parseStored(serialize(v3)) ?? JSON.parse(serialize(v3));
  function exportSettings({ includeSensitive = false } = {}) {
    const settings33 = clone2(PlainSettings);
    if (!includeSensitive) {
      for (const name of Object.keys(settings33.plugins || {})) {
        for (const k4 of sensitiveKeys(name)) if (settings33.plugins[name] && k4 in settings33.plugins[name]) delete settings33.plugins[name][k4];
      }
    }
    return { format: BACKUP_FORMAT, version: VERSION, exportedAt: (/* @__PURE__ */ new Date()).toISOString(), settings: settings33 };
  }
  async function exportSettingsWithData(opts = {}) {
    const out = exportSettings(opts);
    out.data = await exportData(Object.keys(plugins2));
    return out;
  }
  function parseBackup(text) {
    let obj;
    try {
      obj = typeof text === "string" ? JSON.parse(text) : text;
    } catch {
      throw new Error("This file is not valid JSON.");
    }
    const settings33 = obj && obj.format === BACKUP_FORMAT ? obj.settings : obj;
    const data = parseStored(settings33);
    if (!data) throw new Error("No Userscript++ settings found in this file.");
    const names = Object.keys(data.plugins);
    const s3 = data.plugins.Settings || {};
    const parts = s3.sites && typeof s3.sites === "object" ? Object.values(s3.sites) : [];
    const themes = parts.reduce((n2, p4) => n2 + (Array.isArray(p4?.themes) ? p4.themes.length : 0), Array.isArray(s3.themes) ? s3.themes.length : 0);
    const pluginData = obj && obj.format === BACKUP_FORMAT && obj.data && typeof obj.data === "object" ? obj.data : null;
    return {
      settings: data,
      data: pluginData,
      summary: {
        dataPlugins: pluginData ? Object.keys(pluginData).length : 0,
        plugins: names.length,
        enabled: names.filter((n2) => data.plugins[n2]?.enabled === true).length,
        themes,
        sites: parts.length,
        quickCss: parts.some((p4) => typeof p4?.customCSS === "string" && p4.customCSS.length > 0) || typeof s3.customCSS === "string" && s3.customCSS.length > 0,
        version: obj?.version ?? null,
        exportedAt: obj?.exportedAt ?? null
      }
    };
  }
  function checkValue(def, check3, v3) {
    if (!def) return null;
    const t4 = def.type;
    if (t4 === OptionType.BOOLEAN && typeof v3 !== "boolean") return "expected true or false";
    if ((t4 === OptionType.NUMBER || t4 === OptionType.SLIDER) && !(typeof v3 === "number" && Number.isFinite(v3))) return "expected a number";
    if (t4 === OptionType.SLIDER && (v3 < def.min || v3 > def.max)) return `expected ${def.min}–${def.max}`;
    if (t4 === OptionType.BIGINT && typeof v3 !== "bigint") return "expected an integer";
    if (t4 === OptionType.STRING && typeof v3 !== "string") return "expected text";
    if (t4 === OptionType.SELECT && !(def.options || []).some((o3) => o3.value === v3)) return "not one of the options";
    if (typeof check3?.isValid === "function") {
      let r3;
      try {
        r3 = check3.isValid(v3);
      } catch (e3) {
        return e3?.message || "invalid value";
      }
      if (r3 === false) return "invalid value";
      if (typeof r3 === "string") return r3;
    }
    return null;
  }
  function sanitizeImport(data) {
    const invalid = [];
    for (const [name, conf] of Object.entries(data?.plugins || {})) {
      if (!conf || typeof conf !== "object" || Array.isArray(conf)) {
        delete data.plugins[name];
        invalid.push({ plugin: name, key: "*", reason: "not an object" });
        continue;
      }
      const p4 = plugins2[name];
      if (!p4) continue;
      if ("enabled" in conf && typeof conf.enabled !== "boolean") {
        delete conf.enabled;
        invalid.push({ plugin: name, key: "enabled", reason: "expected true or false" });
      }
      const def = p4.settings?.def || {};
      const checks = p4.settings?.checks || {};
      for (const key of Object.keys(conf)) {
        if (key === "enabled" || !(key in def)) continue;
        const why = checkValue(def[key], checks[key], conf[key]);
        if (why) {
          delete conf[key];
          invalid.push({ plugin: name, key, reason: why });
        }
      }
    }
    return invalid;
  }
  function previewImport(settings33) {
    const data = clone2(settings33);
    const invalid = sanitizeImport(data);
    const turnOn = [], turnOff = [];
    let changed2 = 0;
    for (const [name, p4] of Object.entries(plugins2)) {
      if (p4.required || p4.hidden) continue;
      const inc = data.plugins?.[name];
      const next = typeof inc?.enabled === "boolean" ? inc.enabled : !!p4.enabledByDefault;
      const now2 = isPluginEnabled(name);
      if (next !== now2) (next ? turnOn : turnOff).push(name);
      for (const key of Object.keys(p4.settings?.def || {})) {
        if (inc && key in inc && serialize(inc[key]) !== serialize(PlainSettings.plugins[name]?.[key])) changed2++;
      }
    }
    return { turnOn, turnOff, changed: changed2, invalid };
  }
  var UNDO_KEY = "UserscriptPPImportUndo";
  var UNDO_MS = 7 * 24 * 60 * 60 * 1e3;
  var undoCache;
  async function readUndo() {
    if (undoCache !== void 0) return undoCache;
    let v3 = null;
    try {
      v3 = GM2.get ? await GM2.get(UNDO_KEY) : null;
    } catch {
      v3 = null;
    }
    if (typeof v3 === "string") {
      try {
        v3 = JSON.parse(v3);
      } catch {
        v3 = null;
      }
    }
    undoCache = v3 && typeof v3 === "object" && Date.now() - (v3.at || 0) < UNDO_MS ? v3 : null;
    return undoCache;
  }
  async function writeUndo(v3) {
    undoCache = v3;
    try {
      if (!GM2.set) return;
      const r3 = v3 ? GM2.set(UNDO_KEY, JSON.stringify(v3)) : GM2.del ? GM2.del(UNDO_KEY) : GM2.set(UNDO_KEY, "");
      if (r3 && typeof r3.then === "function") await r3;
    } catch (e3) {
      logger32.warn("保存导入前的设置失败", e3);
    }
  }
  var canUndoImport = () => !!undoCache;
  async function lastImport() {
    const u3 = await readUndo();
    return u3 ? { at: u3.at } : null;
  }
  async function apply(data, pluginData) {
    const before = Object.fromEntries(Object.keys(plugins2).map((n2) => [n2, isPluginEnabled(n2)]));
    for (const name of Object.keys(plugins2)) data.plugins[name] ??= {};
    replaceAll(data);
    let reload = false;
    for (const [name, was] of Object.entries(before)) {
      const p4 = plugins2[name];
      const now2 = isPluginEnabled(name);
      if (was === now2) continue;
      if (needsRestart(p4)) reload = true;
      try {
        if (now2) startPlugin(p4);
        else stopPlugin(p4);
      } catch (e3) {
        logger32.error(`导入后启停 ${name} 失败`, e3);
      }
      dispatch(Events.PLUGIN_TOGGLE, { name, enabled: now2 });
    }
    await saveNow({ flushBackup: true });
    if (pluginData) {
      try {
        await importData(pluginData);
      } catch (e3) {
        logger32.error("导入插件数据失败", e3);
      }
    }
    if (reload) dispatch(Events.RELOAD_NEEDED, { reason: "import" });
    return reload;
  }
  var lastInvalid = [];
  var lastImportInvalid = () => lastInvalid.slice();
  async function importSettings(settings33, { data: pluginData } = {}) {
    const data = clone2(settings33);
    data.plugins ??= {};
    lastInvalid = sanitizeImport(data);
    if (lastInvalid.length) logger32.warn(`导入时丢掉了 ${lastInvalid.length} 个不合法的设置项`, lastInvalid);
    for (const name of Object.keys(PlainSettings.plugins)) {
      for (const k4 of sensitiveKeys(name)) {
        const cur = PlainSettings.plugins[name]?.[k4];
        const inc = data.plugins[name]?.[k4];
        if ((inc == null || inc === "") && cur != null && cur !== "") (data.plugins[name] ??= {})[k4] = cur;
      }
    }
    let prevData = null;
    if (pluginData) {
      try {
        prevData = await exportData(Object.keys(pluginData));
      } catch {
        prevData = null;
      }
    }
    await writeUndo({ at: Date.now(), settings: serialize(PlainSettings), data: prevData });
    return apply(data, pluginData);
  }
  async function undoImport() {
    const u3 = await readUndo();
    if (!u3) return null;
    const data = parseStored(u3.settings);
    if (!data) {
      await writeUndo(null);
      return null;
    }
    const reload = await apply(data, u3.data || null);
    await writeUndo(null);
    lastInvalid = [];
    return reload;
  }
  function downloadJson(obj, filename) {
    const blob = new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a3 = document.createElement("a");
    a3.href = url;
    a3.download = filename;
    a3.style.display = "none";
    (document.body || document.documentElement).appendChild(a3);
    a3.click();
    setTimeout(() => {
      a3.remove();
      URL.revokeObjectURL(url);
    }, 1e3);
  }
  var backupFilename = () => `userscript-pp-settings-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.json`;
  function pickJsonFile() {
    return new Promise((resolve) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "application/json,.json";
      input.style.display = "none";
      input.onchange = () => {
        const f3 = input.files?.[0];
        input.remove();
        if (!f3) return resolve(null);
        f3.text().then(resolve, () => resolve(null));
      };
      (document.body || document.documentElement).appendChild(input);
      input.click();
    });
  }

  // vendor/userscript-pp/core/lib/themes.js
  var CONNECT2 = allowedHosts();
  var logger33 = new Logger("Themes", "#fcd34d");
  var cssCache = /* @__PURE__ */ new Map();
  var applied = /* @__PURE__ */ new Set();
  var CACHE_KEY = "UserscriptPPThemeCache";
  var REFRESH_MS2 = 24 * 60 * 60 * 1e3;
  var diskCache = null;
  function readDisk() {
    if (diskCache) return diskCache;
    diskCache = {};
    try {
      const v3 = GM2.get ? GM2.get(CACHE_KEY) : null;
      if (v3 && typeof v3 === "object" && typeof v3.then !== "function") diskCache = { ...v3 };
      else if (typeof v3 === "string") diskCache = JSON.parse(v3) || {};
    } catch {
      diskCache = {};
    }
    return diskCache;
  }
  function writeDisk() {
    try {
      const r3 = GM2.set?.(CACHE_KEY, diskCache || {});
      r3?.catch?.(() => {
      });
    } catch (e3) {
      logger33.debug("写入主题缓存失败", e3);
    }
  }
  function cacheCss(url, css2) {
    cssCache.set(url, css2);
    readDisk()[url] = { css: css2, at: Date.now() };
    writeDisk();
  }
  function dropCache(url) {
    cssCache.delete(url);
    if (readDisk()[url]) {
      delete diskCache[url];
      writeDisk();
    }
  }
  var SITES_PATH = "plugins.Settings.sites";
  var EMPTY = Object.freeze({});
  function readPartition(key = siteKey()) {
    const p4 = raw().sites?.[key];
    return p4 && typeof p4 === "object" ? p4 : EMPTY;
  }
  function writePartition(key = siteKey()) {
    const r3 = raw();
    if (!r3.sites || typeof r3.sites !== "object" || Array.isArray(r3.sites)) S2().sites = {};
    if (!r3.sites[key] || typeof r3.sites[key] !== "object") S2().sites[key] = {};
    return S2().sites[key];
  }
  var themesOf = (part) => Array.isArray(part?.themes) ? part.themes : [];
  var listeners7 = /* @__PURE__ */ new Set();
  var emit5 = () => {
    for (const l3 of [...listeners7]) {
      try {
        l3();
      } catch {
      }
    }
  };
  var subscribeThemes = (fn2) => {
    listeners7.add(fn2);
    return () => listeners7.delete(fn2);
  };
  var S2 = () => Settings.plugins.Settings;
  var raw = () => PlainSettings.plugins.Settings ??= {};
  var styleName = (id) => `theme:${id}`;
  function themesList() {
    return themesOf(readPartition());
  }
  var getThemes = () => themesList().map((t4) => ({ ...t4 }));
  function foreignAllSiteThemes() {
    const key = siteKey(), out = [];
    for (const [k4, part] of Object.entries(raw().sites || {})) if (k4 !== key) {
      for (const t4 of themesOf(part)) if (t4?.allSites) out.push(t4);
    }
    return out;
  }
  var isThemesEnabled = () => raw().themesEnabled !== false;
  var isOnlineThemesEnabled = () => raw().onlineThemesEnabled !== false;
  function saveThemes(list2) {
    writePartition().themes = list2.map((t4) => ({ ...t4 }));
    emit5();
  }
  function parseThemeMeta(css2) {
    const meta = {};
    const m3 = /\/\*\*([\s\S]*?)\*\//.exec(css2);
    if (m3) {
      for (const line of m3[1].split(/\r?\n/)) {
        const mm = /@(name|author|description)\s+(.+)$/.exec(line.replace(/^\s*\*?\s*/, ""));
        if (mm) meta[mm[1]] = mm[2].trim();
      }
    }
    return meta;
  }
  function nameFromUrl(url) {
    try {
      const file = decodeURIComponent(new URL(url).pathname.split("/").pop() || "");
      return file.replace(/\.css$/i, "").replace(/[-_]+/g, " ").trim() || url;
    } catch {
      return url;
    }
  }
  function validateThemeUrl(url) {
    let u3;
    try {
      u3 = new URL(String(url).trim());
    } catch {
      return "Enter a valid URL.";
    }
    if (u3.protocol !== "https:") return "Enter a valid URL.";
    if (!/\.css$/i.test(u3.pathname)) return "URL must point to a .css file.";
    return null;
  }
  async function fetchCss(url) {
    let res;
    try {
      res = await fetchExternal(url, { timeout: 3e4 });
    } catch (e3) {
      const host4 = (() => {
        try {
          return new URL(url).hostname;
        } catch {
          return "";
        }
      })();
      const allowed2 = hostAllowed(host4);
      if (host4 && !allowed2) throw new Error(`Failed to fetch theme: ${host4} is not in this script's allowed hosts (${CONNECT2.join(", ")}). Host the CSS there, or ask the script's developer to add the host.`);
      throw new Error(`Failed to fetch theme (${e3?.message || "network error"}).`);
    }
    if (!res.ok) throw new Error(`Failed to fetch theme (${res.status}).`);
    const css2 = await res.text();
    if (!css2.trim()) throw new Error("Theme file is empty.");
    return css2;
  }
  function applyTheme(t4) {
    const name = styleName(t4.url);
    if (!isThemesEnabled() || !t4.enabled) {
      disableStyle(name);
      return;
    }
    applied.add(t4.url);
    if (t4.local) {
      registerStyle(name, t4.css || "");
      return;
    }
    if (!isOnlineThemesEnabled()) {
      disableStyle(name);
      return;
    }
    const mem2 = cssCache.get(t4.url);
    if (mem2 != null) {
      registerStyle(name, mem2);
      return;
    }
    const disk = readDisk()[t4.url];
    if (disk && typeof disk.css === "string") {
      cssCache.set(t4.url, disk.css);
      registerStyle(name, disk.css);
      if (Date.now() - (disk.at || 0) < REFRESH_MS2) return;
    }
    fetchCss(t4.url).then((css2) => {
      cacheCss(t4.url, css2);
      const cur = [...themesList(), ...foreignAllSiteThemes()].find((x4) => x4.url === t4.url);
      if (!cur || !cur.enabled || !isThemesEnabled() || !isOnlineThemesEnabled()) return;
      registerStyle(name, css2);
    }).catch((e3) => logger33.warn(`加载在线主题失败${disk ? "(继续使用缓存)" : ""}:${t4.url}`, e3.message));
  }
  function applyAllThemes() {
    const list2 = [...themesList(), ...foreignAllSiteThemes()];
    const ids = new Set(list2.map((t4) => t4.url));
    for (const id of [...applied]) if (!ids.has(id)) {
      unregisterStyle(styleName(id));
      applied.delete(id);
    }
    for (const t4 of list2) applyTheme(t4);
  }
  async function addTheme(url) {
    url = String(url || "").trim();
    const err = validateThemeUrl(url);
    if (err) throw new Error(err);
    if (themesList().some((t4) => t4.url === url)) throw new Error("This theme is already added.");
    const css2 = await fetchCss(url);
    cacheCss(url, css2);
    const meta = parseThemeMeta(css2);
    const theme = { url, name: meta.name || nameFromUrl(url), author: meta.author || "", description: meta.description || "", enabled: false };
    if (themesList().some((t4) => t4.url === url)) throw new Error("This theme is already added.");
    saveThemes([...themesList(), theme]);
    return { ...theme };
  }
  var randomId = () => "local-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
  function addLocalTheme(name, css2) {
    const meta = parseThemeMeta(css2 || "");
    const theme = {
      url: randomId(),
      name: String(name || "").trim() || meta.name || "Untitled",
      author: meta.author || "Local",
      description: meta.description || "",
      enabled: false,
      local: true,
      css: String(css2 || "")
    };
    saveThemes([...themesList(), theme]);
    return { ...theme };
  }
  function updateLocalTheme(id, { name, css: css2 } = {}) {
    const list2 = themesList().map((t5) => ({ ...t5 }));
    const t4 = list2.find((x4) => x4.url === id && x4.local);
    if (!t4) return false;
    if (name != null) t4.name = String(name);
    if (css2 != null) {
      t4.css = String(css2);
      const meta = parseThemeMeta(t4.css);
      if (meta.description != null) t4.description = meta.description;
      if (meta.author) t4.author = meta.author;
    }
    saveThemes(list2);
    applyTheme(t4);
    return true;
  }
  function removeTheme(id) {
    const list2 = themesList();
    if (!list2.some((t4) => t4.url === id)) return false;
    unregisterStyle(styleName(id));
    applied.delete(id);
    dropCache(id);
    saveThemes(list2.filter((t4) => t4.url !== id));
    return true;
  }
  function setEnabled2(id, enabled) {
    const list2 = themesList().map((t5) => ({ ...t5 }));
    const t4 = list2.find((x4) => x4.url === id);
    if (!t4) return false;
    t4.enabled = enabled;
    saveThemes(list2);
    if (enabled) applyTheme(t4);
    else disableStyle(styleName(id));
    return true;
  }
  var enableTheme = (id) => setEnabled2(id, true);
  var disableTheme = (id) => setEnabled2(id, false);
  function setThemeAllSites(id, allSites) {
    const list2 = themesList().map((t5) => ({ ...t5 }));
    const t4 = list2.find((x4) => x4.url === id);
    if (!t4) return false;
    if (allSites) t4.allSites = true;
    else delete t4.allSites;
    saveThemes(list2);
    applyTheme(t4);
    return true;
  }
  function setThemesEnabled(b3) {
    S2().themesEnabled = !!b3;
    if (b3) applyAllThemes();
    else for (const t4 of [...themesList(), ...foreignAllSiteThemes()]) disableStyle(styleName(t4.url));
    emit5();
  }
  function setOnlineThemesEnabled(b3) {
    S2().onlineThemesEnabled = !!b3;
    for (const t4 of [...themesList(), ...foreignAllSiteThemes()]) if (!t4.local) {
      if (b3) applyTheme(t4);
      else disableStyle(styleName(t4.url));
    }
    emit5();
  }
  var QUICK_CSS = "quick-css";
  function getQuickCss() {
    const p4 = readPartition();
    return { css: p4.customCSS || "", enabled: p4.customCSSEnabled !== false };
  }
  function setQuickCss({ css: css2, enabled } = {}) {
    const st = writePartition();
    if (css2 != null) st.customCSS = String(css2);
    if (enabled != null) st.customCSSEnabled = !!enabled;
  }
  function applyQuickCss() {
    const { css: css2, enabled } = getQuickCss();
    if (enabled && css2) registerStyle(QUICK_CSS, css2);
    else disableStyle(QUICK_CSS);
  }

  // vendor/userscript-pp/core/lib/menu.js
  var logger34 = new Logger("Menu", "#fcd34d");
  var registered = /* @__PURE__ */ new Map();
  function sync2() {
    if (!GM2.menu) return;
    const items2 = getSlotItems("menuCommand");
    const ids = new Set(items2.map((d3) => d3.id));
    for (const [id, r3] of registered) {
      if (ids.has(id)) continue;
      try {
        GM2.unmenu?.(r3.handle);
      } catch {
      }
      registered.delete(id);
    }
    for (const d3 of items2) {
      const label = String(d3.label ?? d3.id);
      const r3 = registered.get(d3.id);
      if (r3 && r3.label === label) {
        r3.def = d3;
        continue;
      }
      if (r3) {
        try {
          GM2.unmenu?.(r3.handle);
        } catch {
        }
      }
      const entry = { label, def: d3, handle: null };
      try {
        entry.handle = GM2.menu(label, () => {
          try {
            (entry.def.onSelect || entry.def.onClick)?.({});
          } catch (e3) {
            logger34.error(`菜单命令 ${label} 出错`, e3);
          }
        });
      } catch (e3) {
        logger34.debug("注册菜单命令失败", e3);
      }
      registered.set(d3.id, entry);
    }
  }
  var installed7 = false;
  function installMenuCommands() {
    if (installed7) return;
    installed7 = true;
    onSlotChange("menuCommand", sync2);
    sync2();
  }

  // vendor/userscript-pp/core/lib/fiber.js
  function getFiber(el) {
    if (!el) return null;
    for (const k4 of Object.keys(el)) {
      if (k4.startsWith("__reactFiber$") || k4.startsWith("__reactInternalInstance$")) return el[k4];
    }
    return null;
  }
  function getProps(el) {
    if (!el) return null;
    for (const k4 of Object.keys(el)) if (k4.startsWith("__reactProps$")) return el[k4];
    return null;
  }
  function walkFiberUp(fiber, predicate, max = 200) {
    for (let f3 = fiber, i3 = 0; f3 && i3 < max; f3 = f3.return, i3++) {
      try {
        if (predicate(f3)) return f3;
      } catch {
      }
    }
    return null;
  }
  function findFiberProps(el, key, max = 200) {
    const f3 = walkFiberUp(getFiber(el), (f4) => f4.memoizedProps && key in f4.memoizedProps, max);
    return f3 ? f3.memoizedProps : null;
  }

  // vendor/userscript-pp/core/ui/components.js
  var components_exports = {};
  __export(components_exports, {
    Button: () => Button,
    CodeEditor: () => CodeEditor,
    Fragment: () => Fragment,
    IconButton: () => IconButton,
    Input: () => Input,
    Row: () => Row,
    Select: () => Select,
    Switch: () => Switch,
    Textarea: () => Textarea,
    Tooltip: () => Tooltip
  });

  // vendor/userscript-pp/core/ui/highlight.js
  var esc = (s3) => s3.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  var span = (k4, t4) => `<span class="uspp-ccpp-hl-${k4}">${esc(t4)}</span>`;
  var TOKEN = /\/\*[\s\S]*?(?:\*\/|$)|"(?:\\.|[^"\\\n])*"?|'(?:\\.|[^'\\\n])*'?|@[\w-]+|#[\da-fA-F]{3,8}\b|-?(?:\d+\.?\d*|\.\d+)(?:%|[a-zA-Z]+)?|!important\b|--[\w-]+|[\w-]+|[{}:;,()]/g;
  function highlightCss(css2) {
    let out = "", last2 = 0, depth = 0, afterColon = false, inParen = 0;
    const src = String(css2 ?? "");
    for (const m3 of src.matchAll(TOKEN)) {
      const t4 = m3[0], i3 = m3.index;
      if (i3 > last2) out += esc(src.slice(last2, i3));
      last2 = i3 + t4.length;
      const c4 = t4[0];
      if (t4.startsWith("/*")) out += span("comment", t4);
      else if (c4 === '"' || c4 === "'") out += span("string", t4);
      else if (c4 === "@") out += span("at", t4);
      else if (t4 === "{") {
        depth++;
        afterColon = false;
        out += span("punct", t4);
      } else if (t4 === "}") {
        depth = Math.max(0, depth - 1);
        afterColon = false;
        out += span("punct", t4);
      } else if (t4 === ";") {
        afterColon = false;
        out += span("punct", t4);
      } else if (t4 === ":") {
        if (depth > 0 && !inParen) afterColon = true;
        out += span("punct", t4);
      } else if (t4 === "(") {
        inParen++;
        out += span("punct", t4);
      } else if (t4 === ")") {
        inParen = Math.max(0, inParen - 1);
        out += span("punct", t4);
      } else if (t4 === ",") out += span("punct", t4);
      else if (c4 === "#" && afterColon) out += span("color", t4);
      else if (t4 === "!important") out += span("important", t4);
      else if (/^-?[\d.]/.test(t4)) out += span(afterColon || depth === 0 ? "number" : "selector", t4);
      else if (t4.startsWith("--")) out += span(afterColon ? "value" : "variable", t4);
      else if (depth > 0 && !afterColon) out += span(inParen ? "value" : "property", t4);
      else if (afterColon) out += span(src[last2] === "(" ? "function" : "value", t4);
      else out += span("selector", t4);
    }
    if (last2 < src.length) out += esc(src.slice(last2));
    return out;
  }

  // vendor/userscript-pp/core/ui/components.js
  function withFallback(nativeRender, fallbackRender, label) {
    return (props) => {
      const fb = fallbackRender(props);
      let g5 = null;
      try {
        g5 = nativeRender(props);
      } catch {
        g5 = null;
      }
      if (!g5) return fb;
      return h(ErrorBoundary, { fallback: fb, label }, g5);
    };
  }
  var Button = withFallback(
    ({ variant = "outline", size = "md", onClick, disabled, children, title, className, type = "button" }) => {
      const B4 = siteComponent("Button");
      if (!B4) return null;
      const v3 = variant === "danger" ? "danger" : variant;
      return h(B4, { variant: v3, size, shape: "pill", onClick, disabled, title, className, type }, children);
    },
    ({ variant = "outline", size, onClick, disabled, children, title, className, type = "button" }) => h("button", {
      type,
      onClick,
      disabled,
      title,
      className: classes("uspp-ccpp-btn", variant === "primary" && "uspp-ccpp-btn-primary", variant === "danger" && "uspp-ccpp-btn-danger", variant === "ghost" && "uspp-ccpp-btn-ghost", size === "sm" && "uspp-ccpp-btn-sm", className)
    }, children),
    "Button"
  );
  function IconButton({ icon: Icon, label, onClick, active: active2, disabled, className, size = 4 }) {
    return h("button", {
      type: "button",
      "aria-label": label,
      title: label,
      onClick,
      disabled,
      className: classes("uspp-ccpp-btn", "uspp-ccpp-btn-icon", active2 && "uspp-ccpp-active", className)
    }, h(Icon, { size }));
  }
  var Switch = withFallback(
    ({ checked, onChange, disabled, label }) => {
      const S3 = siteComponent("Switch");
      if (!S3) return null;
      return h(S3, { checked: !!checked, onCheckedChange: (v3) => onChange?.(!!v3), disabled: !!disabled, "aria-label": label });
    },
    ({ checked, onChange, disabled, label }) => h("button", {
      type: "button",
      role: "switch",
      "aria-checked": !!checked,
      "aria-label": label,
      "data-checked": String(!!checked),
      className: "uspp-ccpp-switch",
      disabled: !!disabled,
      onClick: () => onChange?.(!checked)
    }),
    "Switch"
  );
  var Select = withFallback(
    ({ value, options, onChange, label }) => {
      const [S3, SelectTrigger, SelectValue, SelectContent, SelectItem] = ["Select", "SelectTrigger", "SelectValue", "SelectContent", "SelectItem"].map(siteComponent);
      if (!S3 || !SelectTrigger || !SelectValue || !SelectContent || !SelectItem) return null;
      const idx = options.findIndex((o3) => Object.is(o3.value, value));
      return h(
        S3,
        { value: idx >= 0 ? String(idx) : void 0, onValueChange: (v3) => onChange?.(options[+v3]?.value) },
        h(SelectTrigger, { "aria-label": label, style: { minWidth: 140 } }, h(SelectValue, null)),
        h(SelectContent, null, options.map((o3, i3) => h(SelectItem, { key: i3, value: String(i3) }, o3.label)))
      );
    },
    ({ value, options, onChange, label }) => {
      const idx = options.findIndex((o3) => Object.is(o3.value, value));
      return h(
        "select",
        { className: "uspp-ccpp-select", "aria-label": label, value: idx >= 0 ? String(idx) : "", onChange: (e3) => onChange?.(options[+e3.target.value]?.value) },
        idx < 0 && h("option", { value: "" }, ""),
        options.map((o3, i3) => h("option", { key: i3, value: String(i3) }, o3.label))
      );
    },
    "Select"
  );
  function Input(props) {
    const { className, onEnter, ...rest } = props;
    return h("input", {
      ...rest,
      className: classes("uspp-ccpp-input", className),
      onKeyDown: (e3) => {
        if (e3.key === "Enter" && onEnter) {
          e3.preventDefault();
          onEnter(e3);
        }
        rest.onKeyDown?.(e3);
      }
    });
  }
  function CodeEditor({ value, onChange, placeholder, readOnly, minHeight = 240, language }) {
    const pre = useRef(null);
    const sync3 = (t4) => {
      if (pre.current) {
        pre.current.scrollTop = t4.scrollTop;
        pre.current.scrollLeft = t4.scrollLeft;
      }
    };
    const area = h("textarea", {
      className: classes("uspp-ccpp-textarea", language && "uspp-ccpp-code-input"),
      value,
      placeholder,
      readOnly: !!readOnly,
      spellCheck: false,
      style: { minHeight },
      "data-language": language || void 0,
      onChange: (e3) => onChange?.(e3.target.value),
      onScroll: (e3) => sync3(e3.target),
      onKeyDown: (e3) => {
        if (e3.key === "Tab" && !readOnly) {
          e3.preventDefault();
          const t4 = e3.target, s3 = t4.selectionStart, en2 = t4.selectionEnd;
          const next = t4.value.slice(0, s3) + "    " + t4.value.slice(en2);
          onChange?.(next);
          requestAnimationFrame(() => {
            t4.selectionStart = t4.selectionEnd = s3 + 4;
          });
        }
      }
    });
    if (language !== "css") return area;
    return h(
      "div",
      { className: classes("uspp-ccpp-code", readOnly && "uspp-ccpp-code-readonly") },
      h("pre", { ref: pre, className: "uspp-ccpp-code-hl", "aria-hidden": "true", dangerouslySetInnerHTML: { __html: highlightCss(value || "") + "\n" } }),
      area
    );
  }
  var Tooltip = withFallback(
    ({ content, children }) => {
      const [T4, TooltipTrigger, TooltipContent] = ["Tooltip", "TooltipTrigger", "TooltipContent"].map(siteComponent);
      if (!T4 || !TooltipTrigger || !TooltipContent || !content) return null;
      return h(T4, null, h(TooltipTrigger, { asChild: true }, children), h(TooltipContent, null, content));
    },
    ({ content, children }) => h("span", { title: typeof content === "string" ? content : void 0, style: { display: "inline-flex" } }, children),
    "Tooltip"
  );
  function Textarea(props) {
    const { className, rows = 4, ...rest } = props;
    return h("textarea", { ...rest, rows, className: classes("uspp-ccpp-input", "uspp-ccpp-textarea-plain", className) });
  }
  function Row({ title, description, children }) {
    return h(
      "div",
      { className: "uspp-ccpp-row" },
      h(
        "div",
        { className: "uspp-ccpp-row-text" },
        h("div", { className: "uspp-ccpp-row-title" }, title),
        description && h("div", { className: "uspp-ccpp-muted uspp-ccpp-small" }, description)
      ),
      children
    );
  }

  // vendor/userscript-pp/core/ui/kit.js
  var kit_exports = {};
  __export(kit_exports, {
    ColorSettingRow: () => ColorSettingRow,
    ErrorCard: () => ErrorCard,
    Flex: () => Flex,
    Grid: () => Grid,
    InfoHint: () => InfoHint,
    Paragraph: () => Paragraph,
    SectionHeader: () => SectionHeader,
    SelectionActionBar: () => SelectionActionBar,
    SelectionCheckbox: () => SelectionCheckbox,
    Text: () => Text,
    useAsyncAction: () => useAsyncAction,
    useExternalStore: () => useExternalStore,
    useFiltered: () => useFiltered
  });
  var gap = (v3) => typeof v3 === "number" ? `${v3}px` : v3;
  function Flex({ direction = "row", gap: g5 = 8, align, justify, wrap: wrap2, className, style, children, ...rest }) {
    return h("div", {
      ...rest,
      className: classes("uspp-ccpp-flex", className),
      style: { display: "flex", flexDirection: direction, gap: gap(g5), alignItems: align, justifyContent: justify, flexWrap: wrap2 ? "wrap" : void 0, ...style }
    }, children);
  }
  function Grid({ columns = 2, minWidth, gap: g5 = 12, className, style, children, ...rest }) {
    const tpl = minWidth ? `repeat(auto-fill, minmax(${gap(minWidth)}, 1fr))` : typeof columns === "number" ? `repeat(${columns}, minmax(0, 1fr))` : columns;
    return h("div", { ...rest, className: classes("uspp-ccpp-grid", className), style: { display: "grid", gridTemplateColumns: tpl, gap: gap(g5), ...style } }, children);
  }
  var SIZES = { xs: 11, sm: 12, md: 14, lg: 16, xl: 20 };
  var WEIGHTS = { normal: 400, medium: 500, semibold: 600, bold: 700 };
  var COLORS3 = { primary: "var(--uspp-ccpp-fg-primary)", secondary: "var(--uspp-ccpp-fg-secondary)", tertiary: "var(--uspp-ccpp-fg-tertiary)", danger: "var(--uspp-ccpp-fg-danger)" };
  function Text({ as = "span", size = "md", weight = "normal", color = "primary", mono, className, style, children, ...rest }) {
    return h(as, {
      ...rest,
      className: classes("uspp-ccpp-text", className),
      style: { fontSize: SIZES[size] ?? size, fontWeight: WEIGHTS[weight] ?? weight, color: COLORS3[color] ?? color, fontFamily: mono ? "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" : void 0, ...style }
    }, children);
  }
  function Paragraph({ size = "sm", color = "secondary", children, ...rest }) {
    return h(Text, { as: "p", size, color, style: { margin: 0, lineHeight: 1.5 }, ...rest }, children);
  }
  function SectionHeader({ title, description, action, className }) {
    return h(
      "div",
      { className: classes("uspp-ccpp-section-header", className) },
      h(
        "div",
        { className: "uspp-ccpp-row-text" },
        h(Text, { as: "h3", size: "lg", weight: "semibold", style: { margin: 0 } }, title),
        description && h(Paragraph, null, description)
      ),
      action || null
    );
  }
  function InfoHint({ type = "info", title, children, className }) {
    return h(
      "div",
      { className: classes("uspp-ccpp-hint", className), "data-type": type, role: type === "danger" ? "alert" : "note" },
      title && h("div", { className: "uspp-ccpp-hint-title" }, title),
      children && h("div", null, children)
    );
  }
  function ErrorCard({ title = "Something went wrong", error: error2, onRetry, className }) {
    const [open, setOpen] = useState(false);
    const detail = error2 == null ? "" : error2 instanceof Error ? error2.stack || String(error2) : String(error2);
    return h(
      "div",
      { className: classes("uspp-ccpp-hint", "uspp-ccpp-error-card", className), "data-type": "danger", role: "alert" },
      h("div", { className: "uspp-ccpp-hint-title" }, title),
      error2 != null && h("div", { className: "uspp-ccpp-small" }, error2 instanceof Error ? error2.message : String(error2).split("\n")[0]),
      h(
        "div",
        { style: { display: "flex", gap: 8, marginTop: 6 } },
        onRetry && h("button", { type: "button", className: "uspp-ccpp-btn uspp-ccpp-btn-sm", onClick: onRetry }, "Retry"),
        detail && h("button", { type: "button", className: "uspp-ccpp-btn uspp-ccpp-btn-sm uspp-ccpp-btn-ghost", onClick: () => setOpen(!open) }, open ? "Hide details" : "Details")
      ),
      open && h("pre", { className: "uspp-ccpp-error-detail" }, detail)
    );
  }
  var HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;
  function ColorSettingRow({ title, description, value, onChange, allowClear = true }) {
    const [text, setText3] = useState(value || "");
    useEffect(() => {
      setText3(value || "");
    }, [value]);
    const commit = (v3) => {
      const t4 = String(v3).trim();
      if (!t4 && allowClear) return onChange?.(null);
      if (HEX.test(t4)) onChange?.(t4.length === 4 ? `#${[...t4.slice(1)].map((c4) => c4 + c4).join("")}`.toLowerCase() : t4.toLowerCase());
      else setText3(value || "");
    };
    return h(
      "div",
      { className: "uspp-ccpp-row" },
      h("div", { className: "uspp-ccpp-row-text" }, h("div", { className: "uspp-ccpp-row-title" }, title), description && h("div", { className: "uspp-ccpp-muted uspp-ccpp-small" }, description)),
      h(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        h("input", { type: "color", className: "uspp-ccpp-color-swatch", "aria-label": title, value: HEX.test(value || "") ? value : "#000000", onChange: (e3) => {
          setText3(e3.target.value);
          onChange?.(e3.target.value);
        } }),
        h("input", { type: "text", className: "uspp-ccpp-input", style: { width: 96 }, value: text, placeholder: allowClear ? "default" : "#000000", "aria-label": `${title} hex`, onChange: (e3) => setText3(e3.target.value), onBlur: (e3) => commit(e3.target.value), onKeyDown: (e3) => {
          if (e3.key === "Enter") commit(e3.target.value);
        } })
      )
    );
  }
  function useExternalStore(store2) {
    const [, force] = useReducer((x4) => x4 + 1, 0);
    useEffect(() => store2.subscribe(() => force()), [store2]);
    return store2;
  }
  function SelectionCheckbox({ selection, id, label }) {
    useExternalStore(selection);
    return h("input", { type: "checkbox", className: "uspp-ccpp-checkbox", "aria-label": label || "Select", checked: selection.has(id), onChange: () => selection.toggle(id), onClick: (e3) => e3.stopPropagation() });
  }
  function SelectionActionBar({ selection, noun = "item", allIds, actions = [], onDelete }) {
    useExternalStore(selection);
    const n2 = selection.size;
    if (!n2) return null;
    const list2 = [...actions, ...onDelete ? [{ label: "Delete", danger: true, onClick: onDelete }] : []];
    return h(
      "div",
      { className: "uspp-ccpp-selection-bar", role: "toolbar" },
      h("span", { className: "uspp-ccpp-small" }, `${n2} ${noun}${n2 === 1 ? "" : "s"} selected`),
      h(
        "div",
        { style: { display: "flex", gap: 8, marginInlineStart: "auto" } },
        allIds && n2 < allIds.length && h("button", { type: "button", className: "uspp-ccpp-btn uspp-ccpp-btn-sm uspp-ccpp-btn-ghost", onClick: () => selection.setAll(allIds) }, "Select all"),
        h("button", { type: "button", className: "uspp-ccpp-btn uspp-ccpp-btn-sm uspp-ccpp-btn-ghost", onClick: () => selection.clear() }, "Clear"),
        list2.map((a3, i3) => h("button", { key: i3, type: "button", className: classes("uspp-ccpp-btn", "uspp-ccpp-btn-sm", a3.danger && "uspp-ccpp-btn-danger"), onClick: () => a3.onClick(selection.values()) }, a3.label))
      )
    );
  }
  function useFiltered(list2, search3, getKey = String) {
    return useMemo(() => {
      const words = String(search3 || "").toLowerCase().split(/\s+/).filter(Boolean);
      if (!words.length) return list2;
      return list2.filter((item) => {
        const k4 = String(getKey(item)).toLowerCase();
        return words.every((w4) => k4.includes(w4));
      });
    }, [list2, search3]);
  }
  function useAsyncAction(fn2) {
    const [busy2, setBusy] = useState(false);
    const ref = useRef(false);
    const run = async (...args) => {
      if (ref.current) return;
      ref.current = true;
      setBusy(true);
      try {
        await fn2(...args);
      } finally {
        ref.current = false;
        setBusy(false);
      }
    };
    return [busy2, run];
  }

  // vendor/userscript-pp/core/lib/stores.js
  function createExternalStore() {
    const listeners12 = /* @__PURE__ */ new Set();
    let version3 = 0;
    return {
      subscribe(fn2) {
        listeners12.add(fn2);
        return () => listeners12.delete(fn2);
      },
      emit() {
        version3++;
        for (const fn2 of [...listeners12]) {
          try {
            fn2();
          } catch (e3) {
            console.error(e3);
          }
        }
      },
      getVersion: () => version3
    };
  }
  function createSelectionStore() {
    const base = createExternalStore();
    const set = /* @__PURE__ */ new Set();
    const changed2 = (fn2) => (...a3) => {
      const before = set.size;
      const r3 = fn2(...a3);
      if (r3 !== false || set.size !== before) base.emit();
      return r3;
    };
    return {
      ...base,
      has: (id) => set.has(id),
      get size() {
        return set.size;
      },
      values: () => [...set],
      add: changed2((id) => {
        if (set.has(id)) return false;
        set.add(id);
      }),
      delete: changed2((id) => {
        if (!set.has(id)) return false;
        set.delete(id);
      }),
      toggle: changed2((id) => {
        if (set.has(id)) set.delete(id);
        else set.add(id);
      }),
      setAll: changed2((ids) => {
        set.clear();
        for (const id of ids) set.add(id);
      }),
      clear: changed2(() => {
        if (!set.size) return false;
        set.clear();
      })
    };
  }

  // vendor/userscript-pp/core/ui/icons.js
  var icons_exports = {};
  __export(icons_exports, {
    ArchiveIcon: () => ArchiveIcon,
    BellIcon: () => BellIcon,
    CheckIcon: () => CheckIcon,
    ChevronRightIcon: () => ChevronRightIcon,
    ChromiumIcon: () => ChromiumIcon,
    CircleAlertIcon: () => CircleAlertIcon,
    CloseIcon: () => CloseIcon,
    CodeIcon: () => CodeIcon,
    CopyIcon: () => CopyIcon,
    EditIcon: () => EditIcon,
    EyeIcon: () => EyeIcon,
    InfoIcon: () => InfoIcon,
    KeyboardIcon: () => KeyboardIcon,
    LockIcon: () => LockIcon,
    LogoIcon: () => LogoIcon,
    PaletteIcon: () => PaletteIcon,
    PinFillIcon: () => PinFillIcon,
    PinIcon: () => PinIcon,
    PlugIcon: () => PlugIcon,
    PuzzleIcon: () => PuzzleIcon,
    ReloadIcon: () => ReloadIcon,
    SearchIcon: () => SearchIcon,
    SlidersIcon: () => SlidersIcon,
    StarFillIcon: () => StarFillIcon,
    StarIcon: () => StarIcon,
    TrashIcon: () => TrashIcon,
    WarningIcon: () => WarningIcon,
    WrenchIcon: () => WrenchIcon
  });
  function svg(paths, { viewBox = "0 0 24 24", fill: fill5 = "none" } = {}) {
    const Icon = ({ size = 4, className, color, style }) => h("svg", {
      width: size * 4,
      height: size * 4,
      viewBox,
      fill: fill5,
      className,
      stroke: fill5 === "none" ? color || "currentColor" : void 0,
      strokeWidth: 2,
      strokeLinecap: "round",
      strokeLinejoin: "round",
      style: { flexShrink: 0, color, ...style },
      "aria-hidden": true
    }, ...paths.map((d3, i3) => typeof d3 === "string" ? h("path", { d: d3, key: i3 }) : { ...d3, key: i3 }));
    return Icon;
  }
  var PlugIcon = svg(["M9 2v6", "M15 2v6", "M6 8h12v3a6 6 0 0 1-12 0V8z", "M12 17v5"]);
  var PuzzleIcon = svg(["M19.4 13a2 2 0 1 0 0-4H18V6a2 2 0 0 0-2-2h-3v1.6a2 2 0 1 1-4 0V4H6a2 2 0 0 0-2 2v3h1.6a2 2 0 1 1 0 4H4v3a2 2 0 0 0 2 2h3v-1.6a2 2 0 1 1 4 0V18h3a2 2 0 0 0 2-2v-3h1.4z"]);
  var PaletteIcon = svg(["M12 22a10 10 0 1 1 10-10c0 2.8-2.2 4-4 4h-2a2 2 0 0 0-1.4 3.4A1.5 1.5 0 0 1 12 22z", "M7.5 10.5h.01", "M10.5 7h.01", "M15 7.5h.01"]);
  var CodeIcon = svg(["M16 18l6-6-6-6", "M8 6l-6 6 6 6"]);
  var InfoIcon = svg(["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z", "M12 16v-4", "M12 8h.01"]);
  var StarIcon = svg(["M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"]);
  var StarFillIcon = svg(["M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"], { fill: "currentColor" });
  var PinIcon = svg(["M12 17v5", "M9 3h6l-1 6 4 4H6l4-4z"]);
  var PinFillIcon = svg(["M12 17v5", "M9 3h6l-1 6 4 4H6l4-4z"], { fill: "currentColor" });
  var SlidersIcon = svg(["M4 6h10", "M18 6h2", "M4 12h4", "M12 12h8", "M4 18h12", "M20 18h0", "M16 4v4", "M10 10v4", "M18 16v4"]);
  var WarningIcon = svg(["M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z", "M12 9v4", "M12 17h.01"]);
  var LockIcon = svg(["M5 11h14v10H5z", "M8 11V7a4 4 0 0 1 8 0v4"]);
  var CloseIcon = svg(["M18 6L6 18", "M6 6l12 12"]);
  var ChromiumIcon = svg(["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z", "M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z", "M21.2 8H12", "M3.9 6.1l4.6 7.9", "M10.9 21.9l4.6-7.9"]);
  var WrenchIcon = svg(["M14.7 6.3a4 4 0 0 0 5 5L21 13l-8 8-3-3 8-8z", "M14.7 6.3L10 2 2 10l4.3 4.7"]);
  var TrashIcon = svg(["M3 6h18", "M8 6V4h8v2", "M19 6l-1 14H6L5 6"]);
  var EditIcon = svg(["M12 20h9", "M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"]);
  var CopyIcon = svg(["M9 9h11v11H9z", "M5 15H4V4h11v1"]);
  var CheckIcon = svg(["M20 6L9 17l-5-5"]);
  var ReloadIcon = svg(["M21 12a9 9 0 1 1-3-6.7", "M21 3v6h-6"]);
  var ChevronRightIcon = svg(["M9 6l6 6-6 6"]);
  var LogoIcon = svg(["M12 3l8 4.5v9L12 21l-8-4.5v-9z", "M12 8v8", "M8 12h8"]);
  var CircleAlertIcon = svg(["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z", "M12 8v4", "M12 16h.01"]);
  var EyeIcon = svg(["M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z", "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"]);
  var ArchiveIcon = svg(["M3 4h18v4H3z", "M5 8v12h14V8", "M10 12h4"]);
  var KeyboardIcon = svg(["M2 6h20v12H2z", "M6 10h.01", "M10 10h.01", "M14 10h.01", "M18 10h.01", "M7 14h10"]);
  var BellIcon = svg(["M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9", "M10.3 21a1.9 1.9 0 0 0 3.4 0"]);
  var SearchIcon = svg(["M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z", "M21 21l-4.3-4.3"]);

  // vendor/userscript-pp/core/ui/theme.js
  function luminance(color) {
    const m3 = /rgba?\(([^)]+)\)/.exec(color || "");
    if (!m3) return null;
    const [r3, g5, b3, a3 = 1] = m3[1].split(/[\s,/]+/).filter(Boolean).map(Number);
    if (!(a3 > 0)) return null;
    return (0.2126 * r3 + 0.7152 * g5 + 0.0722 * b3) / 255;
  }
  function detectTheme() {
    const site = getSite();
    if (typeof site.theme === "function") {
      try {
        const t4 = site.theme();
        if (t4 === "dark" || t4 === "light") return t4;
      } catch {
      }
    }
    for (const el of [document.body, document.documentElement]) {
      if (!el) continue;
      const l3 = luminance(getComputedStyle(el).backgroundColor);
      if (l3 != null) return l3 < 0.5 ? "dark" : "light";
    }
    try {
      return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    } catch {
      return "light";
    }
  }
  var currentTheme = () => document.documentElement?.getAttribute("data-uspp-ccpp-theme") || detectTheme();
  var installed8 = false;
  function installThemeWatcher() {
    if (installed8) return;
    installed8 = true;
    const update = () => {
      if (document.documentElement) setAttr(document.documentElement, "data-uspp-ccpp-theme", detectTheme());
    };
    update();
    try {
      matchMedia("(prefers-color-scheme: dark)").addEventListener("change", update);
    } catch {
    }
    let t4 = 0;
    const later = () => {
      clearTimeout(t4);
      t4 = setTimeout(update, 50);
    };
    const mo3 = new MutationObserver((recs) => {
      if (recs.some((r3) => r3.attributeName !== "data-uspp-ccpp-theme")) later();
    });
    const watch2 = () => {
      mo3.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style", "data-theme", "data-color-mode"] });
      if (document.body) mo3.observe(document.body, { attributes: true, attributeFilter: ["class", "style", "data-theme"] });
    };
    if (document.body) watch2();
    else document.addEventListener("DOMContentLoaded", () => {
      watch2();
      update();
    }, { once: true });
  }

  // vendor/userscript-pp/core/ui/root.js
  var logger35 = new Logger("UI", "#fbcfe8");
  var root = null;
  var host3 = null;
  var shadow2 = null;
  var retry = 0;
  var layers = /* @__PURE__ */ new Map();
  var listeners8 = /* @__PURE__ */ new Set();
  var emit6 = () => {
    for (const l3 of [...listeners8]) l3();
  };
  var subscribe2 = (fn2) => {
    listeners8.add(fn2);
    return () => listeners8.delete(fn2);
  };
  function addLayer(key, Component) {
    layers.set(key, Component);
    emit6();
  }
  function Root() {
    useSubscription(subscribe2);
    return h(Fragment, null, [...layers].map(([key, C4]) => h(ErrorBoundary, { key, label: key }, h(C4, null))));
  }
  var STOP = ["pointerdown", "mousedown", "touchstart", "focusin", "focusout", "wheel"];
  function ensureRoot({ interactive = false } = {}) {
    if (interactive) wantUi();
    if (root) {
      if (host3 && !host3.isConnected && document.body) document.body.appendChild(host3);
      return true;
    }
    const R3 = getRenderer();
    if (!R3 || !document.body) {
      if (!retry) retry = setTimeout(() => {
        retry = 0;
        ensureRoot();
      }, 300);
      return false;
    }
    installThemeWatcher();
    try {
      host3 = document.createElement("uspp-ccpp-root");
      for (const t4 of STOP) host3.addEventListener(t4, (e3) => e3.stopPropagation());
      document.body.appendChild(host3);
      let mount2 = host3;
      if (getSite()?.uiShadow !== false && typeof host3.attachShadow === "function") {
        shadow2 = host3.attachShadow({ mode: "open" });
        mount2 = document.createElement("div");
        mount2.className = "uspp-ccpp-shadow-mount";
        shadow2.appendChild(mount2);
        attachShadowStyles(shadow2);
      }
      root = R3.createRoot(mount2);
      root.render(h(Root, null));
      return true;
    } catch (e3) {
      logger35.error("创建界面根失败", e3);
      host3?.remove();
      root = null;
      host3 = null;
      shadow2 = null;
      return false;
    }
  }
  var queryUi = (sel) => shadow2 && shadow2.querySelector(sel) || document.querySelector(sel);
  function activeElement() {
    let a3 = document.activeElement;
    while (a3 && a3.shadowRoot && a3.shadowRoot.activeElement) a3 = a3.shadowRoot.activeElement;
    return a3;
  }

  // vendor/userscript-pp/core/ui/modal.js
  var logger36 = new Logger("Modal", "#fbcfe8");
  var modals = [];
  var listeners9 = /* @__PURE__ */ new Set();
  var emit7 = () => {
    for (const l3 of [...listeners9]) l3();
  };
  var subscribe3 = (fn2) => {
    listeners9.add(fn2);
    return () => listeners9.delete(fn2);
  };
  var seq2 = 0;
  function topHostDialog() {
    const list2 = [...document.querySelectorAll('[role="dialog"][data-state="open"], [role="alertdialog"][data-state="open"]')].filter((el) => !el.closest("uspp-ccpp-root") && !el.closest(".uspp-ccpp-overlay"));
    return list2[list2.length - 1] || null;
  }
  function openModal2(render, { modalKey } = {}) {
    const key = modalKey ?? `uspp-ccpp-modal-${++seq2}`;
    modals = modals.filter((m3) => m3.key !== key);
    modals.push({ key, render, container: topHostDialog() });
    if (!ensureRoot({ interactive: true })) logger36.debug("界面根尚未就绪,弹窗会在就绪后显示");
    emit7();
    return key;
  }
  function closeModal(key) {
    const before = modals.length;
    modals = modals.filter((m3) => m3.key !== key);
    if (modals.length !== before) emit7();
  }
  function closeAllModals2() {
    if (!modals.length) return;
    modals = [];
    emit7();
  }
  var FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable="true"]';
  var focusables = (el) => [...el.querySelectorAll(FOCUSABLE)].filter((x4) => x4.offsetParent !== null || x4.getClientRects().length > 0);
  var focusSafe = (el) => {
    try {
      el?.focus({ preventScroll: true });
    } catch {
    }
  };
  function ModalFrame({ entry, isTop }) {
    const onClose = () => closeModal(entry.key);
    const ref = useRef(null);
    useEffect(() => {
      const prev = activeElement();
      const el = ref.current;
      if (el && !el.contains(activeElement())) focusSafe(el.querySelector("[autofocus]") || el.querySelector('[role="dialog"]') || focusables(el)[0]);
      return () => {
        const now2 = activeElement();
        if (prev && prev.isConnected && (!now2 || now2 === document.body || el?.contains(now2) || !now2.isConnected)) focusSafe(prev);
      };
    }, []);
    useEffect(() => {
      if (!isTop) return;
      const onKey = (e3) => {
        if (e3.key === "Tab") {
          const el = ref.current;
          if (!el) return;
          const list2 = focusables(el);
          if (!list2.length) {
            e3.preventDefault();
            return;
          }
          const first = list2[0], last2 = list2[list2.length - 1], cur = activeElement();
          if (!el.contains(cur)) {
            e3.preventDefault();
            focusSafe(e3.shiftKey ? last2 : first);
          } else if (e3.shiftKey && (cur === first || !list2.includes(cur))) {
            e3.preventDefault();
            focusSafe(last2);
          } else if (!e3.shiftKey && cur === last2) {
            e3.preventDefault();
            focusSafe(first);
          }
          return;
        }
        if (e3.key !== "Escape") return;
        e3.stopImmediatePropagation();
        e3.preventDefault();
        onClose();
      };
      window.addEventListener("keydown", onKey, true);
      return () => window.removeEventListener("keydown", onKey, true);
    }, [isTop]);
    let content;
    try {
      content = entry.render({ onClose, modalKey: entry.key });
    } catch (e3) {
      logger36.error("弹窗渲染出错", e3);
      content = null;
    }
    const overlay = h("div", {
      ref,
      className: "uspp-ccpp-overlay",
      style: entry.container ? { position: "fixed", zIndex: 2147483e3 } : void 0,
      onMouseDown: (e3) => {
        if (e3.target === e3.currentTarget) e3.currentTarget.dataset.down = "1";
      },
      onClick: (e3) => {
        if (e3.target === e3.currentTarget && e3.currentTarget.dataset.down === "1") onClose();
        e3.currentTarget.dataset.down = "";
      },
      onKeyDown: (e3) => e3.stopPropagation()
    }, h(ErrorBoundary, { fallback: null, label: "modal" }, content));
    const R3 = getRenderer();
    if (entry.container && entry.container.isConnected && R3?.createPortal) return R3.createPortal(overlay, entry.container);
    return overlay;
  }
  function ModalHost() {
    useSubscription(subscribe3);
    return h(Fragment, null, modals.map((m3, i3) => h(ModalFrame, { key: m3.key, entry: m3, isTop: i3 === modals.length - 1 })));
  }
  addLayer("modals", ModalHost);
  function ModalCard({ title, subtitle, children, footer, onClose, width }) {
    return h(
      "div",
      { className: "uspp-ccpp-modal", role: "dialog", "aria-modal": "true", "aria-label": typeof title === "string" ? title : void 0, tabIndex: -1, style: width ? { width: `min(${width}px, 100%)` } : void 0, onClick: (e3) => e3.stopPropagation() },
      h("button", { type: "button", className: "uspp-ccpp-btn uspp-ccpp-btn-icon uspp-ccpp-modal-close", "aria-label": "Close", onClick: onClose }, h(CloseIcon, { size: 4 })),
      (title || subtitle) && h(
        "div",
        { className: "uspp-ccpp-modal-header" },
        title && h("h2", { className: "uspp-ccpp-modal-title" }, title),
        subtitle && h("div", { className: "uspp-ccpp-modal-subtitle" }, subtitle)
      ),
      h("div", { className: "uspp-ccpp-modal-body" }, children),
      footer && h("div", { className: "uspp-ccpp-modal-footer" }, footer)
    );
  }
  function confirmDialog2({ title, body, confirmText = "Confirm", cancelText = "Cancel", danger = false }) {
    return new Promise((resolve) => {
      let done = false;
      const finish = (v3) => {
        if (!done) {
          done = true;
          resolve(v3);
        }
      };
      const key = openModal2(({ onClose }) => h(ModalCard, {
        title,
        width: 420,
        onClose: () => {
          finish(false);
          onClose();
        },
        footer: [
          h("button", { key: "c", type: "button", className: "uspp-ccpp-btn", onClick: () => {
            finish(false);
            onClose();
          } }, cancelText),
          h("button", { key: "o", type: "button", className: `uspp-ccpp-btn ${danger ? "uspp-ccpp-btn-danger" : "uspp-ccpp-btn-primary"}`, onClick: () => {
            finish(true);
            onClose();
          } }, confirmText)
        ]
      }, h("div", { className: "uspp-ccpp-muted" }, body)));
      const off = subscribe3(() => {
        if (!modals.some((m3) => m3.key === key)) {
          off();
          finish(false);
        }
      });
    });
  }

  // vendor/userscript-pp/core/ui/toast.js
  var logger37 = new Logger("Toast", "#fbcfe8");
  var ToastType = Object.freeze({
    MESSAGE: "MESSAGE",
    SUCCESS: "SUCCESS",
    ERROR: "ERROR",
    INFO: "INFO",
    WARNING: "WARNING",
    LOADING: "LOADING"
  });
  function showToast(message, type = ToastType.MESSAGE, options = {}) {
    const toast2 = siteToast();
    if (!toast2) return fallbackToast(message, type, options);
    try {
      const fn2 = {
        SUCCESS: toast2.success,
        ERROR: toast2.error,
        INFO: toast2.info,
        WARNING: toast2.warning,
        LOADING: toast2.loading,
        MESSAGE: toast2.message
      }[String(type).toUpperCase()] || toast2;
      return fn2.call(toast2, message, options);
    } catch (e3) {
      logger37.warn("显示 toast 失败", e3);
      return -1;
    }
  }
  function dismissToast(id) {
    if (id && typeof id === "object" && typeof id.remove === "function") {
      id.remove();
      return;
    }
    try {
      siteToast()?.dismiss?.(id);
    } catch {
    }
  }
  function siteToast() {
    const c4 = getSite().components;
    try {
      return (typeof c4 === "function" ? c4("toast") : c4?.toast) ?? null;
    } catch {
      return null;
    }
  }
  var notice = null;
  var listeners10 = /* @__PURE__ */ new Set();
  var emit8 = () => {
    for (const l3 of [...listeners10]) l3();
  };
  var subscribe4 = (fn2) => {
    listeners10.add(fn2);
    return () => listeners10.delete(fn2);
  };
  var timer = 0;
  function showNotice({ message, type = "INFO", action, duration } = {}) {
    clearTimeout(timer);
    notice = { message, type: String(type).toUpperCase(), action, id: Date.now() };
    ensureRoot({ interactive: true });
    emit8();
    if (duration > 0) timer = setTimeout(closeNotice, duration);
  }
  function closeNotice() {
    clearTimeout(timer);
    if (!notice) return;
    notice = null;
    emit8();
  }
  var ICONS2 = { ERROR: WarningIcon, WARNING: WarningIcon, SUCCESS: CheckIcon };
  function NoticeHost() {
    useSubscription(subscribe4);
    if (!notice) return null;
    const Icon = ICONS2[notice.type] || InfoIcon;
    const { action } = notice;
    return h(
      "div",
      { className: "uspp-ccpp-notice", "data-type": notice.type, role: "status" },
      h(Icon, { size: 4.5 }),
      h("div", { className: "uspp-ccpp-notice-msg" }, notice.message),
      action && h("button", { type: "button", className: "uspp-ccpp-btn uspp-ccpp-btn-sm", onClick: () => {
        try {
          action.onClick?.();
        } finally {
          if (action.close !== false) closeNotice();
        }
      } }, action.label),
      h("button", { type: "button", className: "uspp-ccpp-btn uspp-ccpp-btn-icon", "aria-label": "Close", onClick: closeNotice }, h(CloseIcon, { size: 4 }))
    );
  }
  addLayer("notice", NoticeHost);
  var toastHost = null;
  function fallbackToast(message, type = "MESSAGE", { duration = 3500 } = {}) {
    if (!document.body && !document.documentElement) return -1;
    if (!toastHost || !toastHost.isConnected) {
      toastHost = document.createElement("uspp-ccpp-toasts");
      const r3 = toastHost.attachShadow({ mode: "open" });
      try {
        const sheet = new CSSStyleSheet();
        sheet.replaceSync(`:host{all:initial}.list{position:fixed;right:16px;bottom:16px;z-index:2147483647;display:flex;flex-direction:column;gap:8px;font:13px/1.4 system-ui,sans-serif}
.t{background:#222;color:#fff;padding:9px 14px;border-radius:10px;box-shadow:0 6px 20px rgba(0,0,0,.3);max-width:360px}.t[data-type=ERROR]{background:#b3261e}.t[data-type=SUCCESS]{background:#1b5e20}`);
        r3.adoptedStyleSheets = [sheet];
      } catch {
      }
      const list2 = document.createElement("div");
      list2.className = "list";
      r3.append(list2);
      (document.body || document.documentElement).appendChild(toastHost);
    }
    const t4 = document.createElement("div");
    t4.className = "t";
    t4.dataset.type = String(type).toUpperCase();
    t4.setAttribute("role", "status");
    t4.textContent = String(message);
    toastHost.shadowRoot.querySelector(".list").append(t4);
    setTimeout(() => t4.remove(), duration);
    return t4;
  }

  // vendor/userscript-pp/core/ui/floating.js
  var subscribe5 = (fn2) => {
    const off = onSlotChange("floating", fn2);
    SettingsStore.addChangeListener("plugins.Settings.floatingPosition", fn2);
    return () => {
      off();
      SettingsStore.removeChangeListener("plugins.Settings.floatingPosition", fn2);
    };
  };
  function FloatingHost() {
    useSubscription(subscribe5);
    const items2 = getSlotItems("floating");
    if (!items2.length) return null;
    const pos = String(PlainSettings.plugins.Settings?.floatingPosition || "bottom-right");
    return h("div", { className: "uspp-ccpp-floating", "data-pos": pos, "data-uspp-ccpp-floating": "" }, items2.map((d3) => {
      const ctx = {};
      return h(
        ErrorBoundary,
        { key: d3.id, fallback: null, label: `floating:${d3.id}` },
        d3.render ? h(d3.render, ctx) : h("button", {
          type: "button",
          className: "uspp-ccpp-floating-btn " + (d3.className || ""),
          title: d3.tooltip ?? d3.label,
          "aria-label": d3.label ?? d3.id,
          disabled: slotValue(d3.disabled, ctx),
          "data-active": String(slotValue(d3.active, ctx)),
          "data-uspp-ccpp-floating-item": d3.id,
          onClick: () => {
            try {
              (d3.onSelect || d3.onClick)?.(ctx);
            } catch (e3) {
              console.error("[Userscript++] 悬浮按钮出错", e3);
            }
          }
        }, typeof d3.icon === "function" ? h(d3.icon, { size: 4 }) : d3.icon, d3.icon != null && d3.label ? " " : null, d3.icon == null || d3.showLabel ? d3.label : null)
      );
    }));
  }
  var installed9 = false;
  function installFloating() {
    if (installed9) return;
    installed9 = true;
    addLayer("floating", FloatingHost);
    const tryMount = () => {
      if (getSlotItems("floating").length && !ensureRoot()) setTimeout(tryMount, 500);
    };
    onSlotChange("floating", tryMount);
    tryMount();
  }

  // vendor/userscript-pp/core/ui/styles.css.js
  var LIGHT = `--uspp-ccpp-surface-base:#fff;--uspp-ccpp-surface-l1:#fff;--uspp-ccpp-surface-l2:#f4f4f5;--uspp-ccpp-surface-l3:#d4d4d8;--uspp-ccpp-fg-primary:#111;--uspp-ccpp-fg-secondary:#5f5f66;--uspp-ccpp-fg-tertiary:#8a8a93;--uspp-ccpp-fg-danger:#e5484d;--uspp-ccpp-border-l1:rgb(0 0 0 / .1);--uspp-ccpp-border-l2:rgb(0 0 0 / .16);--uspp-ccpp-ring:#888;--uspp-ccpp-button-ghost-hover:rgb(0 0 0 / .06);`;
  var DARK = `--uspp-ccpp-surface-base:#151517;--uspp-ccpp-surface-l1:#1c1c1f;--uspp-ccpp-surface-l2:#26262a;--uspp-ccpp-surface-l3:#3f3f46;--uspp-ccpp-fg-primary:#f4f4f5;--uspp-ccpp-fg-secondary:#a1a1aa;--uspp-ccpp-fg-tertiary:#71717a;--uspp-ccpp-fg-danger:#f06a6e;--uspp-ccpp-border-l1:rgb(255 255 255 / .1);--uspp-ccpp-border-l2:rgb(255 255 255 / .16);--uspp-ccpp-ring:#a1a1aa;--uspp-ccpp-button-ghost-hover:rgb(255 255 255 / .08);`;
  var UI_CSS = `
:root { ${LIGHT} }
:root[data-uspp-ccpp-theme="dark"] { ${DARK} }
uspp-ccpp-root { color-scheme: light dark; font-family: system-ui, -apple-system, "Segoe UI", sans-serif; }
uspp-ccpp-root { position: fixed; inset: 0; z-index: 2147483000; pointer-events: none; }
uspp-ccpp-root > *, .uspp-ccpp-shadow-mount > * { pointer-events: auto; }
.uspp-ccpp-shadow-mount { display: contents; }
.uspp-ccpp-overlay { position: fixed; inset: 0; background: rgb(0 0 0 / 0.5); display: flex; align-items: center; justify-content: center; padding: 16px; pointer-events: auto; animation: uspp-ccpp-fade .12s ease-out; }
.uspp-ccpp-modal { position: relative; background: var(--uspp-ccpp-surface-l1); color: var(--uspp-ccpp-fg-primary); border: 1px solid var(--uspp-ccpp-border-l1); border-radius: 24px; box-shadow: 0 16px 48px rgb(0 0 0 / .35); width: min(560px, 100%); max-height: min(85vh, 760px); display: flex; flex-direction: column; overflow: hidden; font-size: 14px; animation: uspp-ccpp-pop .14s ease-out; }
.uspp-ccpp-modal-header { padding: 20px 56px 8px 24px; }
.uspp-ccpp-modal-title { font-size: 18px; font-weight: 600; margin: 0; }
.uspp-ccpp-modal-subtitle { color: var(--uspp-ccpp-fg-secondary); margin-top: 4px; }
.uspp-ccpp-modal-body { padding: 8px 24px 16px; overflow-y: auto; }
.uspp-ccpp-modal-footer { padding: 12px 24px 20px; display: flex; gap: 8px; justify-content: flex-end; border-top: 1px solid var(--uspp-ccpp-border-l1); }
.uspp-ccpp-modal-close { position: absolute; top: 14px; right: 14px; }
@keyframes uspp-ccpp-fade { from { opacity: 0 } to { opacity: 1 } }
@keyframes uspp-ccpp-pop { from { opacity: 0; transform: scale(.97) } to { opacity: 1; transform: none } }

.uspp-ccpp-btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 36px; padding: 0 14px; border-radius: 9999px; border: 1px solid var(--uspp-ccpp-border-l2); background: transparent; color: var(--uspp-ccpp-fg-primary); font: inherit; font-weight: 500; cursor: pointer; white-space: nowrap; }
.uspp-ccpp-btn:hover:not(:disabled) { background: var(--uspp-ccpp-button-ghost-hover); }
.uspp-ccpp-btn:disabled { opacity: .5; cursor: default; }
.uspp-ccpp-btn-primary { background: var(--uspp-ccpp-fg-primary); color: var(--uspp-ccpp-surface-base); border-color: transparent; }
.uspp-ccpp-btn-primary:hover:not(:disabled) { background: var(--uspp-ccpp-fg-primary); opacity: .88; }
.uspp-ccpp-btn-danger { background: var(--uspp-ccpp-fg-danger); color: #fff; border-color: transparent; }
.uspp-ccpp-btn-danger:hover:not(:disabled) { background: var(--uspp-ccpp-fg-danger); opacity: .88; }
.uspp-ccpp-btn-ghost { border-color: transparent; }
.uspp-ccpp-btn-icon { width: 32px; height: 32px; padding: 0; border-color: transparent; color: var(--uspp-ccpp-fg-secondary); }
.uspp-ccpp-btn-icon:hover:not(:disabled) { color: var(--uspp-ccpp-fg-primary); }
.uspp-ccpp-btn-icon.uspp-ccpp-active { color: var(--uspp-ccpp-fg-primary); }
.uspp-ccpp-btn-sm { height: 30px; padding: 0 10px; font-size: 13px; }

.uspp-ccpp-switch { position: relative; width: 44px; height: 24px; border-radius: 9999px; background: var(--uspp-ccpp-surface-l3); border: none; cursor: pointer; flex-shrink: 0; padding: 0; transition: background .15s; }
.uspp-ccpp-switch[data-checked="true"] { background: var(--uspp-ccpp-fg-primary); }
.uspp-ccpp-switch::after { content: ""; position: absolute; top: 2px; left: 2px; width: 20px; height: 20px; border-radius: 50%; background: var(--uspp-ccpp-surface-base); transition: transform .15s; }
.uspp-ccpp-switch[data-checked="true"]::after { transform: translateX(20px); }
.uspp-ccpp-switch:disabled { opacity: .5; cursor: not-allowed; }

.uspp-ccpp-input, .uspp-ccpp-textarea, .uspp-ccpp-select { width: 100%; box-sizing: border-box; background: var(--uspp-ccpp-surface-l2); color: var(--uspp-ccpp-fg-primary); border: 1px solid var(--uspp-ccpp-border-l1); border-radius: 12px; padding: 8px 12px; font: inherit; outline: none; }
.uspp-ccpp-input:focus, .uspp-ccpp-textarea:focus, .uspp-ccpp-select:focus { border-color: var(--uspp-ccpp-ring); }
.uspp-ccpp-select { width: auto; min-width: 140px; }
.uspp-ccpp-textarea { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 13px; line-height: 1.5; resize: vertical; min-height: 240px; white-space: pre; tab-size: 4; }
.uspp-ccpp-textarea[readonly] { opacity: .6; }

.uspp-ccpp-page { display: flex; flex-direction: column; gap: 16px; padding-bottom: 24px; padding-inline-end: 24px; color: var(--uspp-ccpp-fg-primary); font-size: 14px; }
.uspp-ccpp-row { display: flex; align-items: center; gap: 12px; justify-content: space-between; }
.uspp-ccpp-row-text { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.uspp-ccpp-row-title { font-weight: 500; }
.uspp-ccpp-muted { color: var(--uspp-ccpp-fg-secondary); }
.uspp-ccpp-small { font-size: 12px; }
.uspp-ccpp-section { display: flex; flex-direction: column; gap: 10px; padding: 16px; border: 1px solid var(--uspp-ccpp-border-l1); border-radius: 16px; background: var(--uspp-ccpp-surface-l1); }
.uspp-ccpp-tabs { display: flex; flex-wrap: nowrap; gap: 2px; overflow-x: auto; overflow-y: hidden; scrollbar-width: none; flex-shrink: 0; border-bottom: 1px solid var(--uspp-ccpp-border-l1); }
.uspp-ccpp-tabs::-webkit-scrollbar { display: none; }
.uspp-ccpp-chip { position: relative; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; height: 32px; padding: 0 10px; border: none; border-radius: 8px; background: transparent; color: var(--uspp-ccpp-fg-secondary); font: inherit; font-size: 14px; font-weight: 500; white-space: nowrap; cursor: pointer; }
.uspp-ccpp-chip:hover { background: var(--uspp-ccpp-button-ghost-hover); color: var(--uspp-ccpp-fg-primary); }
.uspp-ccpp-chip[aria-selected="true"] { color: var(--uspp-ccpp-fg-primary); }
.uspp-ccpp-chip[aria-selected="true"]::after { content: ""; position: absolute; inset-inline: 8px; bottom: -1px; height: 2px; border-radius: 1px; background: var(--uspp-ccpp-fg-primary); }
.uspp-ccpp-toolbar { display: flex; flex-wrap: nowrap; gap: 8px; align-items: center; }
.uspp-ccpp-toolbar > :not(.uspp-ccpp-input) { flex-shrink: 0; width: auto; }
.uspp-ccpp-toolbar .uspp-ccpp-input { flex: 1; min-width: 0; }
.uspp-ccpp-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
.uspp-ccpp-divider { display: flex; align-items: center; gap: 8px; color: var(--uspp-ccpp-fg-tertiary); font-size: 12px; margin: 4px 0; }
.uspp-ccpp-divider::before, .uspp-ccpp-divider::after { content: ""; flex: 1; height: 1px; background: var(--uspp-ccpp-border-l1); }
.uspp-ccpp-card { display: flex; flex-direction: column; padding: 0; min-height: 120px; min-width: 0; overflow: hidden; contain: content; border: 1px solid var(--uspp-ccpp-border-l1); border-radius: 8px; background: var(--uspp-ccpp-surface-l1); }
.uspp-ccpp-switch-lock { display: inline-flex; cursor: not-allowed; }
.uspp-ccpp-switch-lock button, .uspp-ccpp-switch-lock [role="switch"] { opacity: 1 !important; pointer-events: none; }
.uspp-ccpp-card[data-failed="true"] { opacity: .5; border-color: color-mix(in srgb, var(--uspp-ccpp-fg-danger) 45%, transparent); }
.uspp-ccpp-card-body { flex: 1; display: flex; flex-direction: column; gap: 4px; padding: 10px 12px; }
.uspp-ccpp-card-head { display: flex; flex-wrap: nowrap; align-items: center; justify-content: space-between; gap: 8px; min-width: 0; }
.uspp-ccpp-card-title { flex: 1; display: flex; align-items: center; gap: 6px; min-width: 0; overflow: hidden; }
.uspp-ccpp-card-icon { display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; width: 24px; height: 24px; border-radius: 8px; line-height: 0; color: var(--uspp-ccpp-fg-primary); background: color-mix(in srgb, var(--uspp-ccpp-fg-primary) 10%, transparent); }
.uspp-ccpp-card-icon svg { width: 14px; height: 14px; }
.uspp-ccpp-card-name { flex-shrink: 1; min-width: 56px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 14px; font-weight: 500; }
.uspp-ccpp-card-controls { flex-shrink: 0; display: flex; align-items: center; gap: 6px; }
.uspp-ccpp-card-btn { width: 28px; height: 28px; border-radius: 8px; color: var(--uspp-ccpp-fg-tertiary); }
.uspp-ccpp-card-btn.uspp-ccpp-active { color: var(--uspp-ccpp-fg-primary); }
.uspp-ccpp-card-desc { margin-top: 4px; font-size: 13px; line-height: 1.5; color: var(--uspp-ccpp-fg-secondary); display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.uspp-ccpp-card-sep { height: 1px; background: var(--uspp-ccpp-border-l1); }
.uspp-ccpp-card-foot { display: flex; flex-wrap: nowrap; align-items: center; gap: 6px; padding: 6px 12px; min-height: 22px; }
.uspp-ccpp-card-authors { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 11px; color: var(--uspp-ccpp-fg-tertiary); }
.uspp-ccpp-card-foot .uspp-ccpp-sites { margin-top: 0; flex-shrink: 0; }
.uspp-ccpp-card-preview { display: inline-flex; align-items: center; gap: 4px; height: 22px; padding: 0 8px; border-radius: 6px; border: none; background: transparent; color: var(--uspp-ccpp-fg-tertiary); font: inherit; font-size: 11px; cursor: pointer; flex-shrink: 0; }
.uspp-ccpp-card-preview:hover { color: var(--uspp-ccpp-fg-primary); background: var(--uspp-ccpp-button-ghost-hover); }
.uspp-ccpp-badge { flex-shrink: 0; white-space: nowrap; display: inline-flex; align-items: center; height: 18px; padding: 0 6px; border-radius: 6px; font-size: 11px; font-weight: 600; background: var(--uspp-ccpp-fg-primary); color: var(--uspp-ccpp-surface-base); }
.uspp-ccpp-icon-badge { display: inline-flex; align-items: center; flex-shrink: 0; line-height: 0; color: var(--uspp-ccpp-fg-tertiary); }
.uspp-ccpp-icon-badge.uspp-ccpp-warn { color: var(--uspp-ccpp-fg-danger); }
.uspp-ccpp-empty { padding: 32px 8px; text-align: center; color: var(--uspp-ccpp-fg-secondary); }
.uspp-ccpp-banner { display: flex; align-items: center; gap: 12px; padding: 10px 14px; border-radius: 14px; background: var(--uspp-ccpp-surface-l2); }
.uspp-ccpp-backup { display: flex; flex-wrap: wrap; align-items: center; gap: 10px 12px; margin-top: 18px; padding: 12px 14px; border-radius: 14px; border: 1px solid var(--uspp-ccpp-border-l1); }
.uspp-ccpp-backup-text { flex: 1 1 220px; display: flex; flex-direction: column; gap: 2px; }
.uspp-ccpp-sites { white-space: nowrap; display: flex; align-items: center; gap: 8px; margin-top: 6px; }
.uspp-ccpp-card-timing { flex-shrink: 0; font-size: 11px; color: var(--uspp-ccpp-fg-secondary); white-space: nowrap; font-variant-numeric: tabular-nums; }
.uspp-ccpp-card-timing[data-error="true"] { color: var(--uspp-ccpp-fg-danger); }
.uspp-ccpp-site-badge { flex-shrink: 0; font-size: 11px; padding: 0 6px; border-radius: 6px; color: var(--uspp-ccpp-fg-secondary); border: 1px solid var(--uspp-ccpp-border-l1); white-space: nowrap; }
.uspp-ccpp-panel { display: grid; grid-template-columns: 168px minmax(0, 1fr); gap: 20px; align-items: start; }
.uspp-ccpp-panel-nav { position: sticky; top: 0; display: flex; flex-direction: column; gap: 2px; }
.uspp-ccpp-panel-nav-item { display: flex; align-items: center; gap: 10px; height: 36px; padding: 0 10px; border: none; border-radius: 10px; background: transparent; color: var(--uspp-ccpp-fg-secondary); font: inherit; font-size: 14px; font-weight: 500; white-space: nowrap; text-align: start; cursor: pointer; }
.uspp-ccpp-panel-nav-item:hover { background: var(--uspp-ccpp-button-ghost-hover); color: var(--uspp-ccpp-fg-primary); }
.uspp-ccpp-panel-nav-item[aria-selected="true"] { background: var(--uspp-ccpp-surface-l2); color: var(--uspp-ccpp-fg-primary); }
.uspp-ccpp-panel-nav-item span { overflow: hidden; text-overflow: ellipsis; }
.uspp-ccpp-panel-content { min-width: 0; }
.uspp-ccpp-modal:has(.uspp-ccpp-panel) { container-type: inline-size; }
@container (max-width: 760px) {
  .uspp-ccpp-panel { grid-template-columns: 44px minmax(0, 1fr); gap: 14px; }
  .uspp-ccpp-panel-nav-item { justify-content: center; padding: 0; }
  .uspp-ccpp-panel-nav-item span { display: none; }
}
.uspp-ccpp-panel .uspp-ccpp-page { padding-inline-end: 0; }
.uspp-ccpp-floating { position: fixed; z-index: 2147482000; display: flex; flex-direction: column; gap: 8px; pointer-events: auto; }
.uspp-ccpp-floating[data-pos="bottom-right"] { right: 16px; bottom: 16px; }
.uspp-ccpp-floating[data-pos="bottom-left"] { left: 16px; bottom: 16px; }
.uspp-ccpp-floating[data-pos="top-right"] { right: 16px; top: 16px; }
.uspp-ccpp-floating[data-pos="top-left"] { left: 16px; top: 16px; }
.uspp-ccpp-floating-btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; min-width: 40px; height: 40px; padding: 0 12px; border-radius: 9999px; border: 1px solid var(--uspp-ccpp-border-l2); background: var(--uspp-ccpp-surface-l1); color: var(--uspp-ccpp-fg-primary); box-shadow: 0 4px 16px rgb(0 0 0 / .18); font: inherit; cursor: pointer; }
.uspp-ccpp-floating-btn:hover:not(:disabled) { background: var(--uspp-ccpp-surface-l2); }
.uspp-ccpp-floating-btn[data-active="true"] { background: var(--uspp-ccpp-fg-primary); color: var(--uspp-ccpp-surface-base); }
.uspp-ccpp-error { color: var(--uspp-ccpp-fg-danger); font-size: 13px; }
.uspp-ccpp-setting { display: flex; flex-direction: column; gap: 6px; padding: 12px 0; border-bottom: 1px solid var(--uspp-ccpp-border-l1); }
.uspp-ccpp-setting:last-child { border-bottom: none; }
.uspp-ccpp-slider-row { display: flex; gap: 12px; align-items: center; }
.uspp-ccpp-slider-row input[type=range] { flex: 1; }
.uspp-ccpp-tip { display: inline-flex; align-items: center; color: var(--uspp-ccpp-fg-secondary); cursor: help; margin-left: 4px; }

.uspp-ccpp-notice { position: fixed; left: 50%; bottom: 24px; transform: translateX(-50%); display: flex; align-items: center; gap: 10px; max-width: min(640px, calc(100vw - 32px)); padding: 10px 12px 10px 16px; border-radius: 16px; background: var(--uspp-ccpp-surface-l2); color: var(--uspp-ccpp-fg-primary); border: 1px solid var(--uspp-ccpp-border-l2); box-shadow: 0 8px 32px rgb(0 0 0 / .3); font-size: 14px; pointer-events: auto; }
.uspp-ccpp-notice[data-type="ERROR"] { border-color: var(--uspp-ccpp-fg-danger); }
.uspp-ccpp-notice-msg { flex: 1; }

.uspp-ccpp-menu-icon { display: inline-flex; margin-inline-end: 8px; color: var(--uspp-ccpp-fg-secondary); }
.uspp-ccpp-preview { display: flex; flex-direction: column; gap: 8px; margin: 4px 0 12px; }
.uspp-ccpp-preview-head { display: flex; align-items: center; gap: 8px; min-height: 32px; }
.uspp-ccpp-preview-title { font-weight: 600; }
.uspp-ccpp-preview-nav { margin-left: auto; display: flex; align-items: center; gap: 2px; }
.uspp-ccpp-preview-img { display: block; max-width: 100%; max-height: 300px; margin: 0 auto; border-radius: 12px; border: 1px solid var(--uspp-ccpp-border-l1); object-fit: contain; background: var(--uspp-ccpp-surface-l2); }
.uspp-ccpp-preview-live { padding: 14px; border-radius: 14px; border: 1px dashed var(--uspp-ccpp-border-l2); background: var(--uspp-ccpp-surface-l2); overflow: auto; max-height: 320px; }
.uspp-ccpp-preview-empty { padding: 24px 8px; text-align: center; border-radius: 14px; background: var(--uspp-ccpp-surface-l2); }
.uspp-ccpp-preview-compare { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 10px; }
.uspp-ccpp-preview-compare figure { margin: 0; display: flex; flex-direction: column; gap: 4px; }
.uspp-ccpp-preview-compare figcaption { text-align: center; font-size: 12px; color: var(--uspp-ccpp-fg-secondary); }
.uspp-ccpp-preview-caption { text-align: center; }
.uspp-ccpp-preview-slots { display: flex; flex-direction: column; gap: 8px; border-style: solid; }
.uspp-ccpp-preview-slot { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.uspp-ccpp-preview-chip { display: inline-flex; align-items: center; gap: 6px; height: 30px; padding: 0 12px; border-radius: 9999px; border: 1px solid var(--uspp-ccpp-border-l2); background: var(--uspp-ccpp-surface-l1); font-weight: 500; font-size: 13px; }
.uspp-ccpp-code { position: relative; }
.uspp-ccpp-code-hl { position: absolute; inset: 0; margin: 0; overflow: hidden; pointer-events: none; box-sizing: border-box; border: 1px solid transparent; border-radius: 12px; padding: 8px 12px; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 13px; line-height: 1.5; white-space: pre; tab-size: 4; color: var(--uspp-ccpp-fg-primary); background: var(--uspp-ccpp-surface-l2); }
.uspp-ccpp-code .uspp-ccpp-code-input { position: relative; background: transparent; color: transparent; caret-color: var(--uspp-ccpp-fg-primary); }
.uspp-ccpp-code .uspp-ccpp-code-input::selection { background: color-mix(in srgb, var(--uspp-ccpp-ring) 40%, transparent); color: transparent; }
.uspp-ccpp-code .uspp-ccpp-code-input::placeholder { color: var(--uspp-ccpp-fg-tertiary); }
.uspp-ccpp-code-readonly .uspp-ccpp-code-hl { opacity: .6; }
.uspp-ccpp-code .uspp-ccpp-code-input[readonly] { opacity: 1; }
.uspp-ccpp-hl-comment { color: var(--uspp-ccpp-fg-tertiary); font-style: italic; }
.uspp-ccpp-hl-string { color: #16a34a; }
.uspp-ccpp-hl-at, .uspp-ccpp-hl-important { color: #c026d3; }
.uspp-ccpp-hl-selector { color: #2563eb; }
.uspp-ccpp-hl-property, .uspp-ccpp-hl-variable { color: #0891b2; }
.uspp-ccpp-hl-value, .uspp-ccpp-hl-function { color: var(--uspp-ccpp-fg-primary); }
.uspp-ccpp-hl-number, .uspp-ccpp-hl-color { color: #ea580c; }
.uspp-ccpp-hl-punct { color: var(--uspp-ccpp-fg-secondary); }
[data-uspp-ccpp-theme="dark"] .uspp-ccpp-hl-string { color: #4ade80; }
[data-uspp-ccpp-theme="dark"] .uspp-ccpp-hl-at, [data-uspp-ccpp-theme="dark"] .uspp-ccpp-hl-important { color: #e879f9; }
[data-uspp-ccpp-theme="dark"] .uspp-ccpp-hl-selector { color: #60a5fa; }
[data-uspp-ccpp-theme="dark"] .uspp-ccpp-hl-property, [data-uspp-ccpp-theme="dark"] .uspp-ccpp-hl-variable { color: #22d3ee; }
[data-uspp-ccpp-theme="dark"] .uspp-ccpp-hl-number, [data-uspp-ccpp-theme="dark"] .uspp-ccpp-hl-color { color: #fb923c; }
.uspp-ccpp-textarea-plain { resize: vertical; min-height: 72px; line-height: 1.5; }
.uspp-ccpp-section-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
.uspp-ccpp-hint { display: flex; flex-direction: column; gap: 4px; padding: 10px 12px; border-radius: 12px; border: 1px solid var(--uspp-ccpp-border-l1); background: var(--uspp-ccpp-surface-l2); font-size: 13px; color: var(--uspp-ccpp-fg-primary); }
.uspp-ccpp-hint[data-type="warn"] { border-color: color-mix(in srgb, #f59e0b 45%, transparent); background: color-mix(in srgb, #f59e0b 10%, var(--uspp-ccpp-surface-l1)); }
.uspp-ccpp-hint[data-type="danger"] { border-color: color-mix(in srgb, var(--uspp-ccpp-fg-danger) 45%, transparent); background: color-mix(in srgb, var(--uspp-ccpp-fg-danger) 8%, var(--uspp-ccpp-surface-l1)); }
.uspp-ccpp-hint[data-type="success"] { border-color: color-mix(in srgb, #22c55e 45%, transparent); background: color-mix(in srgb, #22c55e 8%, var(--uspp-ccpp-surface-l1)); }
.uspp-ccpp-hint-title { font-weight: 600; }
.uspp-ccpp-error-detail { margin: 6px 0 0; max-height: 200px; overflow: auto; font-size: 12px; white-space: pre-wrap; word-break: break-word; color: var(--uspp-ccpp-fg-secondary); }
.uspp-ccpp-color-swatch { width: 32px; height: 32px; padding: 0; border: 1px solid var(--uspp-ccpp-border-l2); border-radius: 8px; background: none; cursor: pointer; }
.uspp-ccpp-checkbox { width: 16px; height: 16px; accent-color: var(--uspp-ccpp-fg-primary); cursor: pointer; }
.uspp-ccpp-selection-bar { position: sticky; bottom: 0; display: flex; align-items: center; gap: 12px; padding: 8px 12px; border: 1px solid var(--uspp-ccpp-border-l2); border-radius: 12px; background: var(--uspp-ccpp-surface-l1); box-shadow: 0 6px 20px rgb(0 0 0 / .15); }
.uspp-ccpp-setting-fieldset { border: 0; margin: 0; padding: 0; min-width: 0; }
.uspp-ccpp-setting-disabled { opacity: .5; }
.uspp-ccpp-setting-error { margin-top: 6px; font-size: 12px; color: var(--uspp-ccpp-fg-danger); }
.uspp-ccpp-setting-flash { outline: 2px solid var(--uspp-ccpp-ring); outline-offset: 4px; border-radius: 8px; transition: outline-color .4s; }
.uspp-ccpp-plugin-about { margin-bottom: 12px; }
.uspp-ccpp-notify-stack { position: fixed; right: 16px; bottom: 16px; z-index: 2147483600; display: flex; flex-direction: column; gap: 8px; width: min(360px, calc(100vw - 32px)); pointer-events: none; }
.uspp-ccpp-notify { display: flex; align-items: flex-start; gap: 10px; padding: 10px 8px 10px 14px; border-radius: 14px; background: var(--uspp-ccpp-surface-l2); color: var(--uspp-ccpp-fg-primary); border: 1px solid var(--uspp-ccpp-border-l2); box-shadow: 0 8px 32px rgb(0 0 0 / .3); font-size: 14px; pointer-events: auto; animation: uspp-ccpp-fade .12s ease-out; }
.uspp-ccpp-notify[data-clickable] { cursor: pointer; }
.uspp-ccpp-notify[data-type="ERROR"] { border-color: var(--uspp-ccpp-fg-danger); }
.uspp-ccpp-notify-text { flex: 1; min-width: 0; }
.uspp-ccpp-notify-title { font-weight: 600; }
.uspp-ccpp-notify-body { color: var(--uspp-ccpp-fg-secondary); font-size: 13px; margin-top: 2px; word-break: break-word; }
.uspp-ccpp-notify-log[data-clickable] { cursor: pointer; }
.uspp-ccpp-palette { width: min(640px, calc(100vw - 32px)); max-height: min(520px, calc(100vh - 96px)); align-self: flex-start; margin-top: 10vh; display: flex; flex-direction: column; border-radius: 16px; background: var(--uspp-ccpp-surface-l1); color: var(--uspp-ccpp-fg-primary); border: 1px solid var(--uspp-ccpp-border-l2); box-shadow: 0 16px 48px rgb(0 0 0 / .35); overflow: hidden; }
.uspp-ccpp-palette-input { margin: 10px; width: auto; }
.uspp-ccpp-palette-list { overflow: auto; padding: 0 6px 6px; }
.uspp-ccpp-palette-item { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 10px; cursor: pointer; }
.uspp-ccpp-palette-item[aria-selected="true"] { background: var(--uspp-ccpp-button-ghost-hover); }
.uspp-ccpp-palette-kind { flex: none; width: 64px; font-size: 11px; text-transform: uppercase; letter-spacing: .04em; color: var(--uspp-ccpp-fg-tertiary); }
.uspp-ccpp-palette-text { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.uspp-ccpp-palette-text > * { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.uspp-ccpp-kbd { display: inline-block; min-width: 48px; padding: 2px 8px; border-radius: 6px; border: 1px solid var(--uspp-ccpp-border-l2); background: var(--uspp-ccpp-surface-l2); font: 12px ui-monospace, monospace; text-align: center; color: var(--uspp-ccpp-fg-primary); }
.uspp-ccpp-kbd[data-empty] { color: var(--uspp-ccpp-fg-tertiary); }
.uspp-ccpp-keybind { display: flex; flex-wrap: wrap; align-items: center; justify-content: flex-end; gap: 6px; }
.uspp-ccpp-keybind .uspp-ccpp-setting-error { flex-basis: 100%; text-align: right; }
.uspp-ccpp-stack { margin: 6px 0 0; max-height: 180px; overflow: auto; font-size: 12px; white-space: pre-wrap; word-break: break-word; color: var(--uspp-ccpp-fg-secondary); }
.uspp-ccpp-slot-button { display: inline-flex; align-items: center; gap: 4px; }
.uspp-ccpp-changelog { display: flex; flex-direction: column; gap: 10px; }
.uspp-ccpp-changelog-notes { margin: 0; padding-left: 18px; display: flex; flex-direction: column; gap: 4px; }
/* 弹窗本身获得焦点时(打开弹窗时焦点先放在这里)不画焦点框 */
.uspp-ccpp-modal:focus { outline: none; }
/* 系统设置了"减少动态效果"时去掉动画和过渡 */
@media (prefers-reduced-motion: reduce) {
  [class^="uspp-ccpp-"], [class*=" uspp-ccpp-"], [class^="uspp-ccpp-"]::after, [class*=" uspp-ccpp-"]::after { animation: none !important; transition: none !important; }
}
`;

  // vendor/userscript-pp/core/lib/diagnostics.js
  var patchSummary = () => null;
  function setPatchSummary(fn2) {
    patchSummary = fn2;
  }
  function collectDiagnostics() {
    const info = GM2.info;
    const ua = (() => {
      try {
        return W3.navigator.userAgent;
      } catch {
        return "?";
      }
    })();
    const all = Object.values(plugins2);
    const enabled = all.filter((p4) => isPluginEnabled(p4.name));
    const failed2 = enabled.filter((p4) => !p4.started);
    let patches2 = null;
    try {
      patches2 = patchSummary();
    } catch {
      patches2 = null;
    }
    const lines = [
      `${SCRIPT_NAME} ${VERSION} (${BUILD_TYPE}) · script ID ${SCRIPT_ID} · Userscript++ ${FRAMEWORK_VERSION} · API ${API_VERSION}`,
      `Script manager: ${`${info?.scriptHandler ?? "unknown"} ${info?.version ?? ""}`.trim()}${missingCapabilities().length ? ` · missing: ${missingCapabilities().join(", ")}` : ""}`,
      `Browser: ${ua}`,
      `Site: ${getSite().id} · ${(() => {
        try {
          return W3.location.origin + W3.location.pathname;
        } catch {
          return "?";
        }
      })()}`,
      `Safe mode: ${isSafeMode() ? `on (${safeModeReason()})` : "off"}`,
      `Plugins: ${enabled.length} enabled of ${all.length}`,
      `Enabled: ${enabled.map((p4) => p4.name + (p4.started ? "" : " (not started)")).join(", ") || "none"}`,
      `Failed to start: ${failed2.map((p4) => `${p4.name}: ${p4.startError?.message ?? "unknown"}`).join("; ") || "none"}`
    ];
    const blocked2 = blockedRequests();
    if (blocked2.length) lines.push(`Blocked requests: ${[...new Set(blocked2.map((b3) => b3.plugin ? `${b3.host} (${b3.plugin})` : b3.host))].join(", ")}`);
    const errs = pluginErrorStats();
    if (errs.length) lines.push(`Runtime errors: ${errs.slice(0, 8).map((e3) => `${e3.name} ×${e3.count}${e3.tripped ? " (turned off)" : ""}: ${e3.last?.where ?? "?"}: ${e3.last?.message ?? ""}`.slice(0, 200)).join("; ")}`);
    const slow = slowestStarts(5);
    if (slow.length) lines.push(`Slowest starts: ${slow.map((s3) => `${s3.name} ${s3.ms} ms`).join(", ")}`);
    if (patches2) lines.push(`Patches: ${JSON.stringify(patches2)}`);
    const logs = recentLogs();
    lines.push(`Recent warnings and errors (${logs.length}):`);
    for (const l3 of logs) lines.push(`  ${l3.at} [${l3.level}] ${l3.source}: ${l3.text}`);
    return lines.join("\n");
  }
  var MAX_URL = 7e3;
  function githubIssueUrl(supportURL, title, body) {
    const m3 = /^https:\/\/github\.com\/([\w.-]+)\/([\w.-]+)/.exec(String(supportURL || ""));
    if (!m3) return null;
    const repo = m3[2].replace(/\.git$/, "");
    return `https://github.com/${m3[1]}/${repo}/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
  }
  function issueBody(diagnostics) {
    return [
      "**What happened?**",
      "",
      "",
      "**Steps to reproduce**",
      "",
      "1. ",
      "",
      "<details><summary>Diagnostic info</summary>",
      "",
      "```",
      diagnostics,
      "```",
      "",
      "</details>"
    ].join("\n");
  }
  function reportIssueTarget(supportURL, diagnostics) {
    const title = `[${SCRIPT_NAME} ${VERSION}] `;
    let url = githubIssueUrl(supportURL, title, issueBody(diagnostics));
    if (!url) return { url: supportURL, copied: true, truncated: false };
    if (url.length <= MAX_URL) return { url, copied: false, truncated: false };
    let lines = diagnostics.split("\n");
    while (lines.length > 1 && url.length > MAX_URL) {
      lines = lines.slice(0, -1);
      url = githubIssueUrl(supportURL, title, issueBody([...lines, "… (truncated; the full text is on your clipboard)"].join("\n")));
    }
    return { url, copied: true, truncated: true };
  }

  // vendor/userscript-pp/core/settings/Palette.js
  var PALETTE_KEY = "uspp-ccpp-palette";
  var openPluginFn = () => {
  };
  function setPaletteOpener(fn2) {
    openPluginFn = fn2;
  }
  function fuzzyScore(query, text) {
    const q4 = query.toLowerCase().trim(), t4 = String(text || "").toLowerCase();
    if (!q4) return 0;
    if (t4.includes(q4)) return 100 - t4.indexOf(q4) + (t4.startsWith(q4) ? 50 : 0);
    let ti = 0, score2 = 0, streak = 0;
    for (const ch of q4) {
      if (ch === " ") continue;
      const i3 = t4.indexOf(ch, ti);
      if (i3 < 0) return -1;
      streak = i3 === ti ? streak + 1 : 0;
      score2 += 1 + streak + (i3 === 0 || /[\s._-]/.test(t4[i3 - 1]) ? 3 : 0);
      ti = i3 + 1;
    }
    return score2;
  }
  function entries2() {
    const out = [];
    for (const c4 of getCommands()) out.push({ kind: "Command", id: `cmd:${c4.id}`, title: c4.name, sub: c4.description || c4.plugin || "", key: keyFor3(c4.id), words: [c4.name, ...c4.keywords || [], c4.plugin || ""].join(" "), usage: usageOf(c4.id), run: () => runCommand(c4.id) });
    for (const p4 of Object.values(plugins2)) {
      if (p4.hidden || p4.chromiumOnly && !isChromium()) continue;
      out.push({ kind: "Plugin", id: `plugin:${p4.name}`, title: p4.name, sub: `${isPluginEnabled(p4.name) ? "Enabled" : "Disabled"} · ${p4.description || ""}`, words: [p4.name, p4.description, ...p4.tags || []].join(" "), usage: 0, run: () => openPluginFn(p4.name) });
      for (const [key, s3] of getVisibleSettings(p4)) {
        out.push({ kind: "Setting", id: `setting:${p4.name}.${key}`, title: humanizeKey(key), sub: `${p4.name}${s3.description ? ` · ${s3.description}` : ""}`, words: [key, humanizeKey(key), s3.description, p4.name].join(" "), usage: 0, run: () => openPluginFn(p4.name, key) });
      }
    }
    return out;
  }
  function Palette({ onClose }) {
    const [q4, setQ] = useState("");
    const [sel, setSel] = useState(0);
    const input = useRef(null);
    const all = useMemo(entries2, []);
    const list2 = useMemo(() => {
      if (!q4.trim()) return all.filter((e3) => e3.kind === "Command").sort((a3, b3) => b3.usage - a3.usage || a3.title.localeCompare(b3.title)).slice(0, 30);
      return all.map((e3) => ({ e: e3, s: Math.max(fuzzyScore(q4, e3.title) * 2, fuzzyScore(q4, e3.words)) })).filter((x4) => x4.s >= 0).sort((a3, b3) => b3.s - a3.s || b3.e.usage - a3.e.usage).slice(0, 30).map((x4) => x4.e);
    }, [q4, all]);
    useEffect(() => {
      input.current?.focus();
    }, []);
    useEffect(() => {
      setSel(0);
    }, [q4]);
    const pick = (e3) => {
      if (!e3) return;
      onClose();
      setTimeout(() => e3.run(), 0);
    };
    const onKeyDown = (ev) => {
      if (ev.key === "ArrowDown") {
        ev.preventDefault();
        setSel((i3) => Math.min(i3 + 1, list2.length - 1));
      } else if (ev.key === "ArrowUp") {
        ev.preventDefault();
        setSel((i3) => Math.max(i3 - 1, 0));
      } else if (ev.key === "Enter") {
        ev.preventDefault();
        pick(list2[sel]);
      } else if (ev.key === "Escape") {
        ev.preventDefault();
        onClose();
      }
    };
    return h(
      "div",
      { className: "uspp-ccpp-palette", role: "dialog", "aria-label": "Search", "data-uspp-ccpp-palette": "" },
      h("input", { ref: input, className: "uspp-ccpp-input uspp-ccpp-palette-input", placeholder: "Search commands, plugins and settings…", value: q4, onInput: (e3) => setQ(e3.target.value), onChange: (e3) => setQ(e3.target.value), onKeyDown }),
      h("div", { className: "uspp-ccpp-palette-list", role: "listbox" }, list2.length ? list2.map((e3, i3) => h(
        "div",
        {
          key: e3.id,
          role: "option",
          "aria-selected": String(i3 === sel),
          className: "uspp-ccpp-palette-item",
          "data-uspp-ccpp-palette-item": e3.id,
          onMouseEnter: () => setSel(i3),
          onClick: () => pick(e3)
        },
        h("span", { className: "uspp-ccpp-palette-kind" }, e3.kind),
        h("span", { className: "uspp-ccpp-palette-text" }, h("span", { className: "uspp-ccpp-palette-title" }, e3.title), e3.sub && h("span", { className: "uspp-ccpp-muted uspp-ccpp-small" }, e3.sub)),
        e3.key && h("kbd", { className: "uspp-ccpp-kbd" }, e3.key)
      )) : h("div", { className: "uspp-ccpp-empty" }, "No results."))
    );
  }
  function openPalette() {
    openModal2(({ onClose }) => h(Palette, { onClose }), { modalKey: PALETTE_KEY });
  }
  var closePalette = () => closeModal(PALETTE_KEY);

  // vendor/userscript-pp/core/ui/notify.js
  var logger38 = new Logger("Notify", "#fbcfe8");
  var MAX_HISTORY = 50;
  var MAX_SHOWN = 4;
  var shown = [];
  var history3 = [];
  var listeners11 = /* @__PURE__ */ new Set();
  var emit9 = () => {
    for (const l3 of [...listeners11]) l3();
  };
  var subscribeNotifications = (fn2) => {
    listeners11.add(fn2);
    return () => listeners11.delete(fn2);
  };
  var getNotificationHistory = () => history3.slice();
  function clearNotificationHistory() {
    history3.length = 0;
    emit9();
  }
  var seq3 = 0;
  function notify4(opts = {}) {
    const n2 = { id: ++seq3, at: Date.now(), type: String(opts.type || "INFO").toUpperCase(), title: opts.title ?? SCRIPT_NAME, body: opts.body ?? "", icon: opts.icon, onClick: opts.onClick, plugin: opts.plugin };
    history3.unshift(n2);
    if (history3.length > MAX_HISTORY) history3.length = MAX_HISTORY;
    shown = [n2, ...shown].slice(0, MAX_SHOWN);
    ensureRoot();
    emit9();
    const close = () => {
      if (!shown.includes(n2)) return;
      shown = shown.filter((x4) => x4 !== n2);
      emit9();
    };
    const duration = opts.duration ?? 5e3;
    if (duration > 0) setTimeout(close, duration);
    if (opts.system) sendSystem(n2);
    return close;
  }
  function sendSystem(n2) {
    const text = typeof n2.body === "string" ? n2.body : "";
    try {
      if (GM2.notification) {
        GM2.notification({ title: String(n2.title), text: text || " ", onclick: () => {
          try {
            n2.onClick?.();
          } catch (e3) {
            logger38.error(e3);
          }
        } });
        return;
      }
      const N3 = W3.Notification;
      if (N3?.permission === "granted") {
        const x4 = new N3(String(n2.title), { body: text });
        x4.onclick = () => n2.onClick?.();
      }
    } catch (e3) {
      logger38.debug("系统通知失败", e3);
    }
  }
  function NotifyHost() {
    useSubscription(subscribeNotifications);
    if (!shown.length) return null;
    return h("div", { className: "uspp-ccpp-notify-stack" }, shown.map((n2) => h(
      "div",
      {
        key: n2.id,
        className: "uspp-ccpp-notify",
        "data-type": n2.type,
        role: "status",
        "data-clickable": n2.onClick ? "" : void 0,
        onClick: () => {
          if (!n2.onClick) return;
          try {
            n2.onClick();
          } catch (e3) {
            logger38.error("通知点击处理出错", e3);
          }
          shown = shown.filter((x4) => x4 !== n2);
          emit9();
        }
      },
      n2.icon && h("div", { className: "uspp-ccpp-notify-icon" }, typeof n2.icon === "function" ? h(n2.icon, { size: 5 }) : n2.icon),
      h(
        "div",
        { className: "uspp-ccpp-notify-text" },
        h("div", { className: "uspp-ccpp-notify-title" }, n2.title),
        n2.body && h("div", { className: "uspp-ccpp-notify-body" }, n2.body)
      ),
      h("button", { type: "button", className: "uspp-ccpp-btn uspp-ccpp-btn-icon", "aria-label": "Close", onClick: (e3) => {
        e3.stopPropagation();
        shown = shown.filter((x4) => x4 !== n2);
        emit9();
      } }, h(CloseIcon, { size: 4 }))
    )));
  }
  addLayer("notify", NotifyHost);

  // vendor/userscript-pp/core/lib/updater.js
  var logger39 = new Logger("Updater", "#fda4af");
  var UPDATE_INFO = typeof define_USPP_UPDATE_default !== "undefined" ? define_USPP_UPDATE_default : null;
  var CHANGELOG = typeof define_USPP_CHANGELOG_default !== "undefined" ? define_USPP_CHANGELOG_default : [];
  var DAY = 24 * 60 * 60 * 1e3;
  function compareVersions(a3, b3) {
    const split = (v3) => {
      const s3 = String(v3 ?? "").trim().replace(/^v/i, "").split("+")[0];
      const i3 = s3.indexOf("-");
      return i3 < 0 ? [s3, null] : [s3.slice(0, i3), s3.slice(i3 + 1)];
    };
    const [ma, pa] = split(a3), [mb, pb] = split(b3);
    const na = ma.split(/[^\d]+/).filter(Boolean).map(Number), nb = mb.split(/[^\d]+/).filter(Boolean).map(Number);
    for (let i3 = 0; i3 < Math.max(na.length, nb.length); i3++) {
      const x4 = na[i3] ?? 0, y3 = nb[i3] ?? 0;
      if (x4 !== y3) return x4 > y3 ? 1 : -1;
    }
    if (pa === pb) return 0;
    if (pa === null) return 1;
    if (pb === null) return -1;
    const ia = pa.split("."), ib = pb.split(".");
    for (let i3 = 0; i3 < Math.max(ia.length, ib.length); i3++) {
      const x4 = ia[i3], y3 = ib[i3];
      if (x4 === void 0) return -1;
      if (y3 === void 0) return 1;
      if (x4 === y3) continue;
      const dx = /^\d+$/.test(x4), dy = /^\d+$/.test(y3);
      if (dx && dy) return Number(x4) > Number(y3) ? 1 : -1;
      if (dx !== dy) return dx ? -1 : 1;
      return x4 > y3 ? 1 : -1;
    }
    return 0;
  }
  var parseMetaVersion = (text) => /^\/\/\s*@version\s+(\S+)/m.exec(String(text))?.[1] ?? null;
  var state2 = { checking: false, last: null, listeners: /* @__PURE__ */ new Set() };
  var emit10 = () => {
    for (const fn2 of [...state2.listeners]) {
      try {
        fn2();
      } catch {
      }
    }
  };
  var subscribeUpdates = (fn2) => {
    state2.listeners.add(fn2);
    return () => state2.listeners.delete(fn2);
  };
  var lastCheck = () => state2.last;
  var isChecking = () => state2.checking;
  var canUpdate = () => !!UPDATE_INFO?.meta;
  var sys2 = () => Settings.plugins.Settings;
  async function checkForUpdate() {
    if (!canUpdate()) return { hasUpdate: false, error: "no-update-url" };
    if (state2.checking) return state2.last;
    state2.checking = true;
    emit10();
    let res;
    try {
      const r3 = await fetchExternal(`${UPDATE_INFO.meta}${UPDATE_INFO.meta.includes("?") ? "&" : "?"}t=${Date.now()}`);
      if (!r3.ok) throw new Error(`HTTP ${r3.status}`);
      const latest = parseMetaVersion(await r3.text());
      if (!latest) throw new Error("no @version in meta file");
      res = { at: Date.now(), current: VERSION, latest, hasUpdate: compareVersions(latest, VERSION) > 0, error: null };
    } catch (e3) {
      logger39.debug("检查更新失败", e3);
      res = { at: Date.now(), current: VERSION, latest: null, hasUpdate: false, error: String(e3?.message ?? e3) };
    }
    state2.checking = false;
    state2.last = res;
    try {
      sys2().lastUpdateCheck = res.at;
    } catch {
    }
    emit10();
    return res;
  }
  function installUpdate() {
    if (!UPDATE_INFO?.download) return false;
    const url = `${UPDATE_INFO.download}${UPDATE_INFO.download.includes("?") ? "&" : "?"}t=${Date.now()}`;
    W3.open(url, "_blank", "noopener");
    return true;
  }
  function noteRunningVersion() {
    const plain = PlainSettings.plugins.Settings ??= {};
    const prev = typeof plain.lastVersion === "string" ? plain.lastVersion : null;
    if (prev !== VERSION) sys2().lastVersion = VERSION;
    if (!prev || compareVersions(VERSION, prev) <= 0) return null;
    const entries3 = CHANGELOG.filter((e3) => compareVersions(e3.version, prev) > 0 && compareVersions(e3.version, VERSION) <= 0);
    return { from: prev, to: VERSION, entries: entries3 };
  }
  async function maybeAutoCheck(onUpdate, { every = DAY } = {}) {
    if (!canUpdate()) return null;
    const plain = PlainSettings.plugins.Settings ?? {};
    if (plain.autoCheckUpdates === false) return null;
    const lastAt = Number(plain.lastUpdateCheck) || 0;
    if (Date.now() - lastAt < every) return null;
    const res = await checkForUpdate();
    if (res?.hasUpdate) onUpdate?.(res);
    return res;
  }

  // vendor/userscript-pp/core/settings/UpdatesTab.js
  var when = (t4) => t4 ? new Date(t4).toLocaleString() : "never";
  function ChangelogList({ entries: entries3 = CHANGELOG, current: current6 = VERSION }) {
    if (!entries3.length) return h("div", { className: "uspp-ccpp-empty" }, "No changelog in this build.");
    return h("div", { className: "uspp-ccpp-changelog" }, entries3.map((e3) => h(
      "div",
      { key: e3.version, className: "uspp-ccpp-section", "data-uspp-ccpp-changelog-version": e3.version },
      h(
        "div",
        { className: "uspp-ccpp-row-title" },
        `v${e3.version}`,
        e3.date && h("span", { className: "uspp-ccpp-muted uspp-ccpp-small" }, ` · ${e3.date}`),
        compareVersions(e3.version, current6) === 0 && h("span", { className: "uspp-ccpp-muted uspp-ccpp-small" }, " · installed")
      ),
      e3.notes.length > 0 && h("ul", { className: "uspp-ccpp-changelog-notes" }, e3.notes.map((n2, i3) => h("li", { key: i3 }, n2)))
    )));
  }
  function openChangelog({ entries: entries3 = CHANGELOG, title = "What's new" } = {}) {
    const key = "uspp-ccpp-changelog";
    openModal2(() => h(ModalCard, { title, subtitle: `Installed: v${VERSION}`, width: 560, onClose: () => closeModal(key) }, h(ChangelogList, { entries: entries3 })), { modalKey: key });
    return key;
  }
  function UpdatesTab() {
    useSubscription(subscribeUpdates);
    const last2 = lastCheck();
    const checking = isChecking();
    const plain = PlainSettings.plugins.Settings ?? {};
    const auto = plain.autoCheckUpdates !== false;
    let status = null;
    if (!canUpdate()) status = "This build has no update address; your script manager handles updates.";
    else if (checking) status = "Checking…";
    else if (last2?.error) status = `Couldn't check for updates: ${last2.error}`;
    else if (last2?.hasUpdate) status = `v${last2.latest} is available.`;
    else if (last2) status = "You're on the latest version.";
    return h(
      "div",
      { className: "uspp-ccpp-page", "data-uspp-ccpp-page": "updates" },
      h(
        "div",
        { className: "uspp-ccpp-section" },
        h(
          Row,
          { title: `Installed: v${VERSION}`, description: `${BUILD_TYPE} build · last checked ${when(last2?.at ?? plain.lastUpdateCheck)}` },
          canUpdate() && h(Button, { size: "sm", disabled: checking, onClick: () => checkForUpdate() }, "Check now")
        ),
        status && h("div", { className: "uspp-ccpp-muted uspp-ccpp-small", "data-uspp-ccpp-update-status": "" }, status),
        last2?.hasUpdate && h(Button, { variant: "primary", onClick: () => installUpdate() }, `Update to v${last2.latest}`),
        canUpdate() && h(
          Row,
          { title: "Check for updates automatically", description: "Once a day, and notify when a new version is out." },
          h(Switch, { checked: auto, label: "Check for updates automatically", onChange: (v3) => {
            Settings.plugins.Settings.autoCheckUpdates = v3;
          } })
        )
      ),
      h("h3", { className: "uspp-ccpp-row-title", style: { margin: "16px 0 8px" } }, "Changelog"),
      h(ChangelogList, {})
    );
  }

  // vendor/userscript-pp/core/settings/BackupTab.js
  var list = (names) => names.length > 6 ? `${names.slice(0, 6).join(", ")} and ${names.length - 6} more` : names.join(", ");
  var invalidText = (inv) => inv.map((x4) => x4.key === "*" ? x4.plugin : `${x4.plugin}.${x4.key} (${x4.reason})`);
  async function runUndoImport() {
    const reload = await undoImport();
    if (reload === null) {
      showToast("There is no import to undo.", ToastType.INFO);
      return false;
    }
    showToast("Import undone. Your previous settings are back.", ToastType.SUCCESS);
    if (reload && await confirmDialog2({ title: "Reload required", body: "Some restored plugin changes need a page reload.", confirmText: "Reload", cancelText: "Later" })) location.reload();
    return true;
  }
  async function runImport() {
    const text = await pickJsonFile();
    if (text == null) return false;
    let parsed;
    try {
      parsed = parseBackup(text);
    } catch (e3) {
      showToast(e3.message, ToastType.ERROR);
      return false;
    }
    const s3 = parsed.summary;
    const pv = previewImport(parsed.settings);
    const ok = await confirmDialog2({
      title: "Import settings?",
      body: h(
        "div",
        { "data-uspp-ccpp-import-preview": "" },
        h("p", null, `This replaces all current ${SCRIPT_NAME} settings with the file's: ${s3.plugins} plugins (${s3.enabled} enabled), ${s3.themes} themes in ${s3.sites} site${s3.sites === 1 ? "" : "s"}${s3.dataPlugins ? `, and stored data for ${s3.dataPlugins} plugin${s3.dataPlugins === 1 ? "" : "s"}` : ""}${s3.exportedAt ? `, exported ${s3.exportedAt.slice(0, 10)}` : ""}.`),
        pv.turnOn.length > 0 && h("p", null, `Turns on: ${list(pv.turnOn)}.`),
        pv.turnOff.length > 0 && h("p", null, `Turns off: ${list(pv.turnOff)}.`),
        pv.changed > 0 && h("p", null, `Changes ${pv.changed} plugin setting${pv.changed === 1 ? "" : "s"}.`),
        pv.invalid.length > 0 && h("p", null, `Skips ${pv.invalid.length} invalid value${pv.invalid.length === 1 ? "" : "s"}, which keep their defaults: ${list(invalidText(pv.invalid))}.`),
        h("p", null, "You can undo the import afterwards.")
      ),
      confirmText: "Import",
      danger: true
    });
    if (!ok) return false;
    const reload = await importSettings(parsed.settings, { data: parsed.data });
    const skipped = lastImportInvalid().length;
    showNotice({
      message: `Settings imported${skipped ? ` (${skipped} invalid value${skipped === 1 ? "" : "s"} skipped)` : ""}.`,
      type: "SUCCESS",
      duration: 2e4,
      action: { label: "Undo", onClick: () => {
        runUndoImport();
      } }
    });
    if (reload && await confirmDialog2({ title: "Reload required", body: "Some imported plugin changes need a page reload.", confirmText: "Reload", cancelText: "Later" })) location.reload();
    return true;
  }
  function UndoRow() {
    const [last2, setLast] = useState(null);
    useEffect(() => {
      let live = true;
      lastImport().then((v3) => {
        if (live) setLast(v3);
      });
      return () => {
        live = false;
      };
    }, []);
    if (!last2) return null;
    return h(
      Row,
      { title: "Undo last import", description: `Restores the settings you had before the import on ${new Date(last2.at).toLocaleString()}.` },
      h(Button, { onClick: async () => {
        if (await runUndoImport()) setLast(null);
      } }, "Undo import")
    );
  }
  function BackupTab() {
    const [secrets, setSecrets] = useState(false);
    const [withData, setWithData] = useState(false);
    const doExport = async () => downloadJson(withData ? await exportSettingsWithData({ includeSensitive: secrets }) : exportSettings({ includeSensitive: secrets }), backupFilename());
    return h(
      "div",
      { className: "uspp-ccpp-page", "data-uspp-ccpp-page": "backup" },
      h(
        "div",
        { className: "uspp-ccpp-section" },
        h(
          Row,
          { title: "Export settings", description: `Saves all ${SCRIPT_NAME} settings, for every site, to a JSON file.` },
          h(Button, { onClick: () => {
            doExport();
          } }, "Export")
        ),
        h(
          Row,
          { title: "Include sensitive values", description: "Plugin settings marked sensitive (such as keys) are left out unless this is on." },
          h(Switch, { checked: secrets, label: "Include sensitive values", onChange: setSecrets })
        ),
        h(
          Row,
          { title: "Include plugin data", description: "Also saves data plugins keep outside their settings, such as caches and history. Can make the file large." },
          h(Switch, { checked: withData, label: "Include plugin data", onChange: setWithData })
        )
      ),
      h(
        "div",
        { className: "uspp-ccpp-section" },
        h(
          Row,
          { title: "Import settings", description: "Replaces all current settings with a file you exported before. You'll be asked to confirm." },
          h(Button, { onClick: () => {
            runImport();
          } }, "Import")
        ),
        h(UndoRow, null)
      )
    );
  }

  // vendor/userscript-pp/core/settings/index.js
  var NAME = "Settings";
  var MENU_COMMAND_ID = "uspp-ccpp-settings";
  var MENU_SEARCH_ID = "uspp-ccpp-search";
  var MENU_SAFE_ID = "uspp-ccpp-safe-reload";
  async function reportIssue() {
    if (!SUPPORT_URL) return false;
    const text = collectDiagnostics();
    const target2 = reportIssueTarget(SUPPORT_URL, text);
    if (target2.copied) {
      const ok = await copyToClipboard(text);
      if (ok !== false) showToast(target2.truncated ? "Full diagnostic info copied: paste it into the issue." : "Diagnostic info copied: paste it into your report.", "SUCCESS");
    }
    try {
      W3.open(target2.url, "_blank", "noopener");
    } catch {
      return false;
    }
    return true;
  }
  async function copyDiagnostics() {
    const ok = await copyToClipboard(collectDiagnostics());
    showToast(ok === false ? "Couldn't copy diagnostic info." : "Diagnostic info copied.", ok === false ? "ERROR" : "SUCCESS");
    return ok;
  }
  var settings32 = definePluginSettings2({
    showSiteEntry: {
      type: OptionType.BOOLEAN,
      default: true,
      description: "Show this script's entry in the site's own menus and settings.",
      // 只有声明了 settingsHost 的站点才有站点入口
      get hidden() {
        return !getSite().settingsHost;
      }
    },
    floatingPosition: {
      type: OptionType.SELECT,
      description: "Where floating buttons from plugins appear.",
      options: [
        { label: "Bottom right", value: "bottom-right", default: true },
        { label: "Bottom left", value: "bottom-left" },
        { label: "Top right", value: "top-right" },
        { label: "Top left", value: "top-left" }
      ]
    },
    debugLogs: {
      type: OptionType.BOOLEAN,
      default: false,
      description: "Print debug logs to the browser console (useful when reporting a problem).",
      onChange: (v3) => setDebugLogs(v3)
    }
  });
  async function checkNow() {
    const r3 = await checkForUpdate();
    if (r3?.error) showToast(`Couldn't check for updates: ${r3.error}`, "ERROR");
    else if (r3?.hasUpdate) announceUpdate(r3);
    else showToast(`${SCRIPT_NAME} is up to date (v${r3?.current}).`, "SUCCESS");
    return r3;
  }
  var announceUpdate = (r3) => notify4({ title: `${SCRIPT_NAME} v${r3.latest} is available`, body: `You have v${r3.current}. Click to update.`, type: "info", duration: 15e3, onClick: () => installUpdate() });
  function afterStart() {
    const changed2 = noteRunningVersion();
    if (changed2) notify4({
      title: `${SCRIPT_NAME} updated to v${changed2.to}`,
      body: changed2.entries.length ? `${changed2.entries.flatMap((e3) => e3.notes).slice(0, 2).join(" · ")}${changed2.entries.flatMap((e3) => e3.notes).length > 2 ? " …" : ""} — click for details.` : `Updated from v${changed2.from}.`,
      type: "success",
      duration: 12e3,
      onClick: changed2.entries.length ? () => openChangelog({ entries: changed2.entries, title: `What's new since v${changed2.from}` }) : void 0
    });
    maybeAutoCheck(announceUpdate).catch(() => {
    });
  }
  var FLOATING_ENTRY_ID = "uspp.settingsEntry";
  function addFloatingEntry() {
    if (GM2.menu) return;
    addSlotItem2("floating", FLOATING_ENTRY_ID, { label: `${SCRIPT_NAME} settings`, icon: SlidersIcon, order: -1e3, onSelect: () => openSettings2() });
  }
  var openSettings2 = () => {
  };
  function setSettingsOpener(fn2) {
    openSettings2 = fn2;
  }
  var settings_default2 = definePlugin2({
    name: NAME,
    description: "Userscript++ settings panel and menu command, and loads themes and Quick CSS.",
    authors: ["Userscript++"],
    required: true,
    site: "*",
    settings: settings32,
    commands: [
      { id: "uspp.palette", name: "Search commands, plugins and settings", keywords: ["palette", "find"], defaultKey: "Alt+Shift+P", run: () => openPalette() },
      { id: "uspp.settings", name: "Open settings", keywords: ["preferences", "options"], run: () => openSettings2() },
      { id: "uspp.safeReload", name: "Reload in safe mode", description: "Reload with only required plugins, no themes and no Quick CSS.", keywords: ["crash", "broken"], run: () => reloadInSafeMode() },
      { id: "uspp.checkUpdates", name: "Check for updates", keywords: ["update", "version", "upgrade"], when: () => canUpdate(), run: () => checkNow() },
      { id: "uspp.changelog", name: "Show changelog", keywords: ["what's new", "release notes", "version"], run: () => openChangelog() },
      { id: "uspp.reportIssue", name: "Report a problem", description: "Open the issue page with diagnostic info filled in. Nothing is sent until you submit it.", keywords: ["bug", "issue", "support", "feedback"], when: () => !!SUPPORT_URL, run: () => reportIssue() },
      { id: "uspp.undoImport", name: "Undo last import", description: "Restore the settings you had before the last backup import.", keywords: ["backup", "restore", "revert"], when: () => canUndoImport(), run: () => runUndoImport() },
      { id: "uspp.diagnostics", name: "Copy diagnostic info", description: "Versions, enabled plugins, patch status and recent errors, for bug reports.", keywords: ["debug", "support", "report"], run: () => copyDiagnostics() }
    ],
    start() {
      migratePluginSetting(NAME, "showSiteEntry", "showMenu");
      setDebugLogs(settings32.store.debugLogs);
      lastImport().catch(() => {
      });
      if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", afterStart, { once: true });
      else setTimeout(afterStart, 0);
      if (isSafeMode()) {
        addSlotItem2("menuCommand", MENU_COMMAND_ID, { label: `${SCRIPT_NAME} settings`, order: -1e3, onSelect: () => openSettings2() });
        addSlotItem2("menuCommand", MENU_SEARCH_ID, { label: `${SCRIPT_NAME}: search…`, order: -999, onSelect: () => openPalette() });
        addFloatingEntry();
        return;
      }
      applyQuickCss();
      if (isThemesEnabled()) applyAllThemes();
      let queued2 = false;
      this._apply = () => {
        if (queued2) return;
        queued2 = true;
        queueMicrotask(() => {
          queued2 = false;
          applyQuickCss();
          applyAllThemes();
        });
      };
      for (const k4 of [SITES_PATH, "plugins.Settings.themesEnabled", "plugins.Settings.onlineThemesEnabled"]) SettingsStore.addPrefixChangeListener(k4, this._apply);
      addSlotItem2("menuCommand", MENU_COMMAND_ID, { label: `${SCRIPT_NAME} settings`, order: -1e3, onSelect: () => openSettings2() });
      addSlotItem2("menuCommand", MENU_SEARCH_ID, { label: `${SCRIPT_NAME}: search…`, order: -999, onSelect: () => openPalette() });
      addSlotItem2("menuCommand", MENU_SAFE_ID, { label: `${SCRIPT_NAME}: reload in safe mode`, order: -998, onSelect: () => reloadInSafeMode() });
      addFloatingEntry();
    },
    stop() {
      if (this._apply) for (const k4 of [SITES_PATH, "plugins.Settings.themesEnabled", "plugins.Settings.onlineThemesEnabled"]) SettingsStore.removePrefixChangeListener(k4, this._apply);
      for (const id of [MENU_COMMAND_ID, MENU_SEARCH_ID, MENU_SAFE_ID]) removeSlotItem("menuCommand", id);
      removeSlotItem("floating", FLOATING_ENTRY_ID);
    }
  });

  // vendor/userscript-pp/core/settings/PluginPreview.js
  var SLOT_LABELS = {
    toolbar: "Toolbar button",
    menuCommand: "Script menu command",
    floating: "Floating button",
    chatBar: "Composer button",
    conversationMenu: "Conversation menu item",
    messageMenu: "Message menu item",
    userMenu: "Avatar menu item",
    "settings.pluginActions": "Plugin card button"
  };
  var toSrc = (s3) => typeof s3 === "string" && /^\s*<svg[\s>]/i.test(s3) ? "data:image/svg+xml;charset=utf-8," + encodeURIComponent(s3.trim()) : s3;
  function normalize(v3) {
    if (v3 == null || v3 === false) return [];
    if (Array.isArray(v3)) return v3.flatMap(normalize);
    if (typeof v3 === "function") return [{ component: v3 }];
    if (typeof v3 === "string") return v3.trim() ? [{ src: v3 }] : [];
    if (typeof v3 === "object" && (v3.component || v3.src || v3.before || v3.after)) return [v3];
    return [];
  }
  var declaredPreviews = (p4) => {
    try {
      return normalize(p4.preview);
    } catch {
      return [];
    }
  };
  function slotSummary(p4) {
    let slots2 = {};
    try {
      slots2 = pluginSlots(p4);
    } catch {
      slots2 = p4.slots || {};
    }
    const out = [];
    for (const [slot, v3] of Object.entries(slots2 || {})) {
      for (const def of [].concat(v3)) {
        if (!def || typeof def !== "object") continue;
        const label = typeof def.label === "string" ? def.label : typeof def.tooltip === "string" ? def.tooltip : typeof def["aria-label"] === "string" ? def["aria-label"] : def.id ?? p4.name;
        out.push({ slot, label, icon: def.icon });
      }
    }
    return out;
  }
  function hasPreview(p4) {
    if (p4.preview === false) return false;
    return declaredPreviews(p4).length > 0 || slotSummary(p4).length > 0;
  }
  var failed = () => h("div", { className: "uspp-ccpp-muted uspp-ccpp-small uspp-ccpp-preview-empty" }, "Preview failed to render.");
  function Img({ src, alt }) {
    const [bad, setBad] = useState(false);
    if (bad) return h("div", { className: "uspp-ccpp-muted uspp-ccpp-small uspp-ccpp-preview-empty" }, "Image could not be loaded.");
    return h("img", { className: "uspp-ccpp-preview-img", src: toSrc(src), alt: alt || "", loading: "lazy", draggable: false, onError: () => setBad(true) });
  }
  function Frame({ item, plugin }) {
    if (item.component) {
      const ctx = { plugin, settings: Settings.plugins[plugin.name], enabled: isPluginEnabled(plugin.name) };
      return h("div", { className: "uspp-ccpp-preview-live" }, h(ErrorBoundary, { fallback: failed(), label: `preview:${plugin.name}` }, h(item.component, ctx)));
    }
    if (item.before || item.after) {
      return h("div", { className: "uspp-ccpp-preview-compare" }, [["Before", item.before], ["After", item.after]].filter(([, s3]) => s3).map(([label, s3]) => h("figure", { key: label }, h(Img, { src: s3, alt: `${plugin.name} ${label.toLowerCase()}` }), h("figcaption", null, label))));
    }
    return h(Img, { src: item.src, alt: item.alt || plugin.name });
  }
  function SlotSummary({ items: items2 }) {
    return h(
      "div",
      { className: "uspp-ccpp-preview-live uspp-ccpp-preview-slots" },
      h("div", { className: "uspp-ccpp-muted uspp-ccpp-small" }, "Adds to the page:"),
      items2.map((it, i3) => h(
        "div",
        { key: i3, className: "uspp-ccpp-preview-slot" },
        h(
          "span",
          { className: "uspp-ccpp-preview-chip" },
          typeof it.icon === "function" ? h(ErrorBoundary, { fallback: null }, h(it.icon, { size: 4 })) : null,
          String(it.label)
        ),
        h("span", { className: "uspp-ccpp-muted uspp-ccpp-small" }, SLOT_LABELS[it.slot] ?? humanizeKey(it.slot))
      ))
    );
  }
  function PluginPreview({ plugin }) {
    const [idx, setIdx] = useState(0);
    if (plugin.preview === false) return null;
    const items2 = declaredPreviews(plugin);
    const summary = items2.length ? [] : slotSummary(plugin);
    if (!items2.length && !summary.length) return null;
    const n2 = items2.length;
    const i3 = n2 ? Math.min(idx, n2 - 1) : 0;
    const item = items2[i3];
    return h(
      "section",
      { className: "uspp-ccpp-preview", "data-uspp-ccpp-preview": plugin.name, "aria-label": "Preview" },
      h(
        "div",
        { className: "uspp-ccpp-preview-head" },
        h("span", { className: "uspp-ccpp-preview-title" }, "Preview"),
        n2 > 1 && h(
          "div",
          { className: "uspp-ccpp-preview-nav" },
          h(
            "button",
            { type: "button", className: "uspp-ccpp-btn uspp-ccpp-btn-icon", "aria-label": "Previous preview", onClick: () => setIdx((i3 - 1 + n2) % n2) },
            h(ChevronRightIcon, { size: 4, style: { transform: "rotate(180deg)" } })
          ),
          h("span", { className: "uspp-ccpp-muted uspp-ccpp-small" }, `${i3 + 1} / ${n2}`),
          h(
            "button",
            { type: "button", className: "uspp-ccpp-btn uspp-ccpp-btn-icon", "aria-label": "Next preview", onClick: () => setIdx((i3 + 1) % n2) },
            h(ChevronRightIcon, { size: 4 })
          )
        )
      ),
      item ? h(Frame, { key: i3, item, plugin }) : h(SlotSummary, { items: summary }),
      item?.caption && h("div", { className: "uspp-ccpp-muted uspp-ccpp-small uspp-ccpp-preview-caption" }, item.caption)
    );
  }

  // vendor/userscript-pp/core/settings/PluginModal.js
  function usePluginSettings(name) {
    const force = useForceUpdate();
    useEffect(() => {
      const prefix = `plugins.${name}.`;
      const fn2 = () => force();
      SettingsStore.addPrefixChangeListener(prefix, fn2);
      return () => SettingsStore.removePrefixChangeListener(prefix, fn2);
    }, [name]);
  }
  function NumberInput({ value, onCommit, bigint }) {
    const shown2 = value == null ? "" : String(value);
    const [text, setText3] = useState(shown2);
    const focused = useRef(false);
    useEffect(() => {
      if (!focused.current) setText3(shown2);
    }, [shown2]);
    return h(Input, {
      type: "text",
      inputMode: bigint ? "numeric" : "decimal",
      value: text,
      onFocus: () => {
        focused.current = true;
      },
      onBlur: () => {
        focused.current = false;
        setText3(shown2);
      },
      onChange: (e3) => {
        const raw2 = e3.target.value;
        setText3(raw2);
        const t4 = raw2.trim();
        if (bigint) {
          if (t4 === "") return onCommit(0n);
          try {
            onCommit(BigInt(t4));
          } catch {
          }
        } else if (t4 !== "" && !isNaN(Number(t4))) {
          onCommit(Number(t4));
        }
      }
    });
  }
  function TextInput({ value, onCommit, multiline, setting }) {
    const shown2 = value ?? "";
    const [text, setText3] = useState(shown2);
    const focused = useRef(false);
    useEffect(() => {
      if (!focused.current) setText3(shown2);
    }, [shown2]);
    const props = {
      value: text,
      placeholder: setting.placeholder,
      onFocus: () => {
        focused.current = true;
      },
      onBlur: () => {
        focused.current = false;
      },
      onChange: (e3) => {
        setText3(e3.target.value);
        onCommit(e3.target.value);
      }
    };
    return multiline ? h(Textarea, { rows: setting.rows ?? 4, ...props, ...setting.componentProps || {} }) : h(Input, { type: "text", ...props });
  }
  function checkOf(plugin, key) {
    return plugin.settings?.checks?.[key] ?? null;
  }
  function isDisabled(check3) {
    try {
      return !!check3?.disabled?.();
    } catch {
      return false;
    }
  }
  function validate(check3, v3) {
    if (typeof check3?.isValid !== "function") return null;
    let r3;
    try {
      r3 = check3.isValid(v3);
    } catch (e3) {
      return e3?.message || "Invalid value.";
    }
    if (r3 === true || r3 === void 0 || r3 === null) return null;
    return typeof r3 === "string" && r3 ? r3 : "Invalid value.";
  }
  function SettingControl({ plugin, keyName: keyName2, setting, onRestartChange }) {
    const store2 = Settings.plugins[plugin.name];
    const value = store2[keyName2];
    const check3 = checkOf(plugin, keyName2);
    const disabled = isDisabled(check3);
    const [error2, setError] = useState(null);
    const set = (v3) => {
      const err2 = validate(check3, v3);
      setError(err2);
      if (err2) return false;
      const before = PlainSettings.plugins[plugin.name]?.[keyName2];
      store2[keyName2] = v3;
      try {
        setting.onChange?.(v3);
      } catch (e3) {
        console.error("[Userscript++] 设置 onChange 出错", e3);
      }
      if (setting.restartNeeded) onRestartChange?.(plugin.name, keyName2, before, v3);
      return true;
    };
    const title = humanizeKey(keyName2);
    const desc = setting.description && h("div", { className: "uspp-ccpp-muted uspp-ccpp-small" }, setting.description);
    const err = error2 && h("div", { className: "uspp-ccpp-setting-error", role: "alert" }, error2);
    const wrap2 = (control) => h("fieldset", { className: "uspp-ccpp-setting-fieldset", disabled }, control);
    const cls = disabled ? "uspp-ccpp-setting uspp-ccpp-setting-disabled" : "uspp-ccpp-setting";
    const inline = (control) => h(
      "div",
      { className: cls, "data-uspp-ccpp-setting": keyName2, "aria-disabled": disabled || void 0 },
      h("div", { className: "uspp-ccpp-row" }, h("div", { className: "uspp-ccpp-row-text" }, h("div", { className: "uspp-ccpp-row-title" }, title), desc), wrap2(control)),
      err
    );
    const stacked = (control) => h(
      "div",
      { className: cls, "data-uspp-ccpp-setting": keyName2, "aria-disabled": disabled || void 0 },
      h("div", { className: "uspp-ccpp-row-text" }, h("div", { className: "uspp-ccpp-row-title" }, title), desc),
      wrap2(control),
      err
    );
    switch (setting.type) {
      case OptionType.BOOLEAN:
        return inline(h(Switch, { checked: !!value, onChange: set, label: title, disabled }));
      case OptionType.SELECT:
        return inline(h(Select, { value, options: setting.options || [], onChange: set, label: title }));
      case OptionType.SLIDER: {
        const min = setting.min ?? 0, max = setting.max ?? 100;
        return stacked(h(
          "div",
          { className: "uspp-ccpp-slider-row" },
          h("input", { type: "range", min, max, step: 1, value: Number(value ?? min), onChange: (e3) => set(Number(e3.target.value)), "aria-label": title }),
          h("span", { className: "uspp-ccpp-muted", style: { minWidth: 36, textAlign: "right" } }, String(value ?? min))
        ));
      }
      case OptionType.NUMBER:
        return stacked(h(NumberInput, { value, onCommit: set }));
      case OptionType.BIGINT:
        return stacked(h(NumberInput, { value, onCommit: set, bigint: true }));
      case OptionType.STRING:
        return stacked(h(TextInput, { value, onCommit: set, multiline: !!setting.multiline, setting }));
      case OptionType.COMPONENT: {
        const C4 = setting.component;
        if (!C4) return null;
        return stacked(h(ErrorBoundary, { fallback: null }, h(C4, { setValue: set, setting, option: setting, value })));
      }
      default:
        return null;
    }
  }
  function PluginModal({ plugin, onClose, onRestartChange }) {
    usePluginSettings(plugin.name);
    const visible = getVisibleSettings(plugin);
    const reset = async () => {
      const ok = await confirmDialog2({ title: "Reset settings", body: "Reset this plugin's settings to defaults? This cannot be undone.", confirmText: "Reset", danger: true });
      if (!ok) return;
      const store2 = Settings.plugins[plugin.name];
      for (const [key, s3] of visible) {
        const before = PlainSettings.plugins[plugin.name]?.[key];
        delete store2[key];
        const after = store2[key];
        try {
          s3.onChange?.(after);
        } catch {
        }
        if (s3.restartNeeded) onRestartChange?.(plugin.name, key, before, after);
      }
    };
    return h(
      ModalCard,
      {
        title: plugin.name,
        subtitle: plugin.description,
        onClose,
        footer: visible.length ? h(Button, { variant: "danger", onClick: reset }, "Reset") : null
      },
      h("div", { className: "uspp-ccpp-muted uspp-ccpp-small", style: { marginBottom: 8 } }, "Authors: ", (plugin.authors || []).join(", ") || "Unknown"),
      plugin.about && h("div", { className: "uspp-ccpp-plugin-about" }, h(ErrorBoundary, { fallback: null }, h(plugin.about, { plugin }))),
      h(ErrorBoundary, { fallback: null }, h(PluginPreview, { plugin })),
      visible.length ? visible.map(([key, s3]) => h(ErrorBoundary, { key, fallback: null }, h(SettingControl, { plugin, keyName: key, setting: s3, onRestartChange }))) : !hasPreview(plugin) && !plugin.about && h("div", { className: "uspp-ccpp-empty" }, "No configurable settings.")
    );
  }

  // vendor/userscript-pp/core/settings/BaseCard.js
  function BaseCard({ className, attrs, name, icon: icon2, badges: badges2, description, controls, footer }) {
    return h(
      "div",
      { ...attrs, className: classes("uspp-ccpp-card", className) },
      h(
        "div",
        { className: "uspp-ccpp-card-body" },
        h(
          "div",
          { className: "uspp-ccpp-card-head" },
          h(
            "div",
            { className: "uspp-ccpp-card-title" },
            icon2 != null && h("span", { className: "uspp-ccpp-card-icon" }, icon2),
            h("span", { className: "uspp-ccpp-card-name", title: name }, name),
            badges2
          ),
          h("div", { className: "uspp-ccpp-card-controls" }, controls)
        ),
        description && h("div", { className: "uspp-ccpp-card-desc", title: description }, description)
      ),
      h("div", { className: "uspp-ccpp-card-sep" }),
      h("div", { className: "uspp-ccpp-card-foot" }, footer)
    );
  }

  // vendor/userscript-pp/core/settings/site-label.js
  var siteLabel = () => isGeneric() ? location.hostname || "this site" : getSite().name;
  var pluginSiteLabel = (p4) => p4.site === "*" ? "All sites" : getSiteById(p4.site)?.name ?? p4.site;

  // vendor/userscript-pp/core/settings/shared.js
  var TAB_IDS = { plugins: "uspp_ccpp_plugins_tab", themes: "uspp_ccpp_themes_tab", quickCss: "uspp_ccpp_quickcss_tab", backup: "uspp_ccpp_backup_tab", keybinds: "uspp_ccpp_keybinds_tab", notifications: "uspp_ccpp_notifications_tab", updates: "uspp_ccpp_updates_tab" };
  var sys3 = () => Settings.plugins.Settings;
  var sysPlain = () => PlainSettings.plugins.Settings ??= {};
  function listSetting(key) {
    const v3 = sysPlain()[key];
    return Array.isArray(v3) ? v3.slice() : [];
  }

  // vendor/userscript-pp/core/settings/PluginsTab.js
  var SLOW_START_MS = 10;
  var TAGS = [
    ["composer", "Composer"],
    ["messages", "Messages"],
    ["chats", "Chats"],
    ["media", "Media"],
    ["navigation", "Navigation"],
    ["notifications", "Notifications"],
    ["appearance", "Appearance"],
    ["declutter", "Declutter"],
    ["privacy", "Privacy"],
    ["developer", "Developer"]
  ];
  var DAY2 = 864e5;
  var MULTI_SITE = (typeof define_USPP_SITES_default !== "undefined" ? define_USPP_SITES_default : []).length > 1;
  function visiblePlugins() {
    return Object.values(plugins2).filter((p4) => !p4.hidden && !(p4.chromiumOnly && !isChromium()));
  }
  function useLive() {
    const force = useForceUpdate();
    useEffect(() => {
      const offs = [Events.PLUGIN_TOGGLE, Events.PLUGIN_PIN, Events.PLUGIN_STAR].map((e3) => subscribe(e3, () => force()));
      const fn2 = () => force();
      SettingsStore.addPrefixChangeListener("plugins.", fn2);
      const offSlot = onSlotChange("settings.pluginActions", fn2);
      return () => {
        offs.forEach((o3) => o3());
        offSlot();
        SettingsStore.removePrefixChangeListener("plugins.", fn2);
      };
    }, []);
  }
  function useReloadTracker() {
    const ref = useRef(null);
    if (!ref.current) {
      ref.current = {
        initial: Object.fromEntries(Object.keys(plugins2).map((n2) => [n2, isPluginEnabled(n2)])),
        settings: /* @__PURE__ */ new Map(),
        // "插件.键" -> 初始值
        dismissed: false
      };
    }
    const [, setTick] = useState(0);
    const t4 = ref.current;
    const dirty2 = () => Object.values(plugins2).some((p4) => needsRestart(p4) && (t4.initial[p4.name] ?? false) !== isPluginEnabled(p4.name)) || [...t4.settings].some(([k4, init]) => {
      const [n2, key] = k4.split(".");
      return !Object.is(Settings.plugins[n2]?.[key], init);
    });
    const prompt = async () => {
      setTick((x4) => x4 + 1);
      if (!dirty2()) {
        t4.dismissed = false;
        return;
      }
      dispatch(Events.RELOAD_NEEDED, null);
      if (t4.dismissed) return;
      const ok = await confirmDialog2({ title: "Reload required", body: "This plugin changes the site's code, so you need to reload the page.", confirmText: "Reload", cancelText: "Later" });
      if (ok) location.reload();
      else {
        t4.dismissed = true;
        setTick((x4) => x4 + 1);
      }
    };
    return {
      get showBanner() {
        return t4.dismissed && dirty2();
      },
      onToggled: (p4) => {
        if (needsRestart(p4)) prompt();
        else setTick((x4) => x4 + 1);
      },
      onSettingRestart: (name, key, before) => {
        const k4 = `${name}.${key}`;
        if (!t4.settings.has(k4)) t4.settings.set(k4, before);
        prompt();
      }
    };
  }
  function Badges({ p: p4 }) {
    const out = [];
    const failed2 = !p4.required && isPluginEnabled(p4.name) && !p4.started;
    const icon2 = (key, tip, Icon, cls) => h(Tooltip, { key, content: tip }, h("span", { className: classes("uspp-ccpp-icon-badge", cls) }, h(Icon, { size: 3.5 })));
    if (failed2) out.push(icon2("fail", "This plugin failed to start", WarningIcon, "uspp-ccpp-warn"));
    if (p4.required) out.push(icon2("req", `This plugin is required for ${SCRIPT_NAME} to work`, LockIcon));
    if (p4.dev) out.push(icon2("dev", "Development build only", WrenchIcon));
    if (p4.chromiumOnly) out.push(icon2("chr", "Chromium only", ChromiumIcon));
    const seen3 = sys3().knownPlugins?.[p4.name];
    if (seen3 && Date.now() - seen3 < 2 * DAY2) out.push(h("span", { key: "new", className: "uspp-ccpp-badge" }, "New"));
    return out;
  }
  var subscribeErrors = (fn2) => {
    const a3 = onPluginError(fn2), b3 = onPluginTripped(fn2);
    return () => {
      a3();
      b3();
    };
  };
  function PluginCard({ p: p4, tracker }) {
    useSubscription(subscribeErrors);
    const errs = pluginErrorsOf(p4.name);
    const enabled = isPluginEnabled(p4.name);
    const starred = listSetting("starredPlugins").includes(p4.name);
    const pinned = listSetting("pinnedPlugins").includes(p4.name);
    const failed2 = !p4.required && enabled && !p4.started;
    const hasSettings = getVisibleSettings(p4).length > 0;
    const showPreview = hasPreview(p4);
    const Icon = p4.icon || PlugIcon;
    const toggleStar2 = () => {
      const list2 = listSetting("starredPlugins").filter((n2) => n2 !== p4.name);
      if (!starred) list2.push(p4.name);
      sys3().starredPlugins = list2;
      dispatch(Events.PLUGIN_STAR, { name: p4.name, starred: !starred });
    };
    const togglePin = () => {
      const list2 = listSetting("pinnedPlugins").filter((n2) => n2 !== p4.name);
      if (!pinned) list2.unshift(p4.name);
      sys3().pinnedPlugins = list2;
      dispatch(Events.PLUGIN_PIN, { name: p4.name, pinned: !pinned });
    };
    const openConfig = () => openModal2(({ onClose }) => h(PluginModal, { plugin: p4, onClose, onRestartChange: tracker.onSettingRestart }), { modalKey: `uspp-ccpp-plugin-${p4.name}` });
    const btn = (key, icon2, label, onClick, active2) => h(IconButton, { key, icon: icon2, label, onClick, active: active2, size: 3.5, className: "uspp-ccpp-card-btn" });
    return h(BaseCard, {
      attrs: { "data-failed": String(failed2), "data-required": String(!!p4.required), "data-uspp-ccpp-plugin": p4.name },
      name: p4.name,
      icon: h(ErrorBoundary, { fallback: h(PlugIcon, { size: 3.5 }) }, h(Icon, { size: 3.5 })),
      badges: h(Badges, { p: p4 }),
      description: p4.description,
      controls: [
        h(PluginActions, { key: "actions", p: p4 }),
        btn("star", starred ? StarFillIcon : StarIcon, starred ? "Unstar" : "Star", toggleStar2, starred),
        !p4.required && btn("pin", pinned ? PinFillIcon : PinIcon, pinned ? "Unpin" : "Pin", togglePin, pinned),
        hasSettings && h(Tooltip, { key: "cfg", content: "config" }, btn(null, SlidersIcon, "config", openConfig)),
        p4.required ? h(
          Tooltip,
          { key: "switch", content: `Required for ${SCRIPT_NAME} to work, can't be turned off` },
          h(
            "span",
            { className: "uspp-ccpp-switch-lock", "data-uspp-ccpp-locked": "true" },
            h(Switch, { checked: true, disabled: true, label: p4.name })
          )
        ) : h(Switch, {
          key: "switch",
          checked: enabled,
          disabled: isEnabledAsDependency(p4.name),
          label: p4.name,
          onChange: () => {
            togglePlugin2(p4.name);
            tracker.onToggled(p4);
          }
        })
      ],
      footer: [
        h("span", { key: "a", className: "uspp-ccpp-card-authors" }, (p4.authors || []).join(", ") || " "),
        // 插件声明会访问的外部主机,用户在卡片上就能看到
        Array.isArray(p4.connect) && p4.connect.length > 0 && h("span", { key: "c", className: "uspp-ccpp-card-timing", title: `This plugin can send requests to: ${p4.connect.join(", ")}` }, `Connects to ${p4.connect.length > 2 ? `${p4.connect.slice(0, 2).join(", ")} +${p4.connect.length - 2}` : p4.connect.join(", ")}`),
        // 启动较慢(>= 10 ms)的插件在卡片上标出启动耗时,排查页面变卡时一眼能看到
        // 运行期错误(启动之后的回调出错):数量和最近一条;出错太多被停掉时另标出
        errs && h(
          "span",
          { key: "e", className: "uspp-ccpp-card-timing", "data-uspp-ccpp-plugin-errors": p4.name, "data-error": "true", title: `Last error (${errs.last?.where ?? "?"}): ${errs.last?.message ?? ""}` },
          errs.tripped ? `Turned off after ${errs.count} errors` : `${errs.count} error${errs.count === 1 ? "" : "s"}`
        ),
        p4.started && p4.startMs >= SLOW_START_MS && h("span", { key: "t", className: "uspp-ccpp-card-timing", title: "Time this plugin took to start on this page" }, `${p4.startMs} ms`),
        MULTI_SITE && h("span", { key: "s", className: "uspp-ccpp-site-badge", "data-uspp-ccpp-plugin-site": p4.site ?? "*" }, pluginSiteLabel(p4)),
        showPreview && h(
          "button",
          { key: "p", type: "button", className: "uspp-ccpp-card-preview", "aria-label": "Preview", title: "Preview", onClick: openConfig },
          h(EyeIcon, { size: 3.5 }),
          "Preview"
        )
      ]
    });
  }
  function PluginActions({ p: p4 }) {
    const items2 = getSlotItems("settings.pluginActions").filter((d3) => !d3.plugin || d3.plugin === p4.name);
    const ctx = { plugin: p4 };
    return items2.map((d3) => h(
      ErrorBoundary,
      { key: d3.id, fallback: null },
      d3.render ? h(d3.render, ctx) : h("button", {
        type: "button",
        className: "uspp-ccpp-btn uspp-ccpp-btn-icon " + (d3.className || ""),
        title: d3.tooltip ?? d3.label,
        "aria-label": d3.label ?? d3.id,
        disabled: slotValue(d3.disabled, ctx),
        "data-active": String(slotValue(d3.active, ctx)),
        onClick: () => {
          try {
            (d3.onSelect || d3.onClick)?.(ctx);
          } catch (e3) {
            console.error("[Userscript++] 插件卡片按钮出错", e3);
          }
        }
      }, typeof d3.icon === "function" ? h(d3.icon, { size: 4 }) : d3.icon ?? d3.label)
    ));
  }
  function sortPinned(list2) {
    const pins = listSetting("pinnedPlugins");
    const pinned = pins.map((n2) => list2.find((p4) => p4.name === n2)).filter(Boolean);
    return [...pinned, ...list2.filter((p4) => !pins.includes(p4.name)).sort((a3, b3) => a3.name.localeCompare(b3.name))];
  }
  function PluginsTab() {
    useLive();
    const tracker = useReloadTracker();
    const [cat, setCat] = useState("favorites");
    const [query, setQuery] = useState("");
    const [filter, setFilter] = useState("all");
    const all = visiblePlugins();
    const hasRecent = all.some((p4) => p4.updatedAt);
    const cats = [["favorites", "Favorites"], ...hasRecent ? [["recent", "Recent"]] : [], ["all", "All"], ...TAGS.filter(([t4]) => all.some((p4) => p4.tags?.includes(t4)))];
    const q4 = query.trim().toLowerCase();
    const pass = (p4) => (!q4 || `${p4.name} ${p4.description}`.toLowerCase().includes(q4)) && (filter === "all" || filter === "enabled" === isPluginEnabled(p4.name));
    let body;
    const grid = (list2) => h("div", { className: "uspp-ccpp-grid" }, list2.map((p4) => h(ErrorBoundary, { key: p4.name, fallback: null }, h(PluginCard, { p: p4, tracker }))));
    const empty = (text) => h("div", { className: "uspp-ccpp-empty" }, text);
    if (cat === "favorites") {
      const stars = listSetting("starredPlugins").slice().reverse();
      const list2 = stars.map((n2) => all.find((p4) => p4.name === n2)).filter(Boolean).filter(pass);
      body = list2.length ? grid(list2) : empty(stars.length && q4 ? "No plugins match your search." : "No favorites yet. Star a plugin to see it here.");
    } else if (cat === "recent") {
      const list2 = all.filter((p4) => p4.updatedAt && Date.now() - p4.updatedAt < 7 * DAY2).sort((a3, b3) => b3.updatedAt - a3.updatedAt).filter(pass);
      body = list2.length ? grid(list2) : empty(q4 ? "No plugins match your search." : "No plugins updated in the last 7 days.");
    } else if (cat === "all") {
      const normal = sortPinned(all.filter((p4) => !p4.required)).filter(pass);
      const req = all.filter((p4) => p4.required).sort((a3, b3) => a3.name.localeCompare(b3.name)).filter(pass);
      body = normal.length + req.length === 0 ? empty("No plugins match your search.") : h(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 10 } },
        normal.length > 0 && grid(normal),
        req.length > 0 && h("div", { className: "uspp-ccpp-divider" }, "Required"),
        req.length > 0 && grid(req)
      );
    } else {
      const list2 = sortPinned(all.filter((p4) => p4.tags?.includes(cat))).filter(pass);
      body = list2.length ? grid(list2) : empty("No plugins match your search.");
    }
    return h(
      "div",
      { className: "uspp-ccpp-page", "data-uspp-ccpp-page": "plugins" },
      tracker.showBanner && h(
        "div",
        { className: "uspp-ccpp-banner" },
        h("span", { style: { flex: 1 } }, "Reload the page to apply plugin changes."),
        h(Button, { variant: "primary", size: "sm", onClick: () => location.reload() }, "Reload")
      ),
      h("div", { className: "uspp-ccpp-tabs", role: "tablist" }, cats.map(([id, label]) => h("button", {
        key: id,
        type: "button",
        role: "tab",
        className: "uspp-ccpp-chip",
        "aria-selected": String(cat === id),
        onClick: () => setCat(id)
      }, label))),
      h(
        "div",
        { className: "uspp-ccpp-toolbar" },
        h(Input, { type: "search", placeholder: `Search ${all.length} plugins...`, value: query, onChange: (e3) => setQuery(e3.target.value) }),
        h(Select, { value: filter, label: "Filter", onChange: setFilter, options: [{ label: "All", value: "all" }, { label: "Enabled", value: "enabled" }, { label: "Disabled", value: "disabled" }] })
      ),
      body
    );
  }

  // vendor/userscript-pp/core/settings/ThemesTab.js
  function OnlineThemeModal({ onClose }) {
    const [url, setUrl] = useState("");
    const [busy2, setBusy] = useState(false);
    const [error2, setError] = useState(null);
    const submit = async () => {
      if (busy2) return;
      setBusy(true);
      setError(null);
      try {
        await addTheme(url);
        onClose();
      } catch (e3) {
        setError(e3?.message || String(e3));
        setBusy(false);
      }
    };
    return h(
      ModalCard,
      {
        title: "Add online theme",
        subtitle: "Paste a link to a .css file.",
        onClose,
        width: 480,
        footer: [
          h(Button, { key: "c", onClick: onClose }, "Cancel"),
          h(Button, { key: "i", variant: "primary", onClick: submit, disabled: busy2 || !url.trim() }, busy2 ? "Importing..." : "Import")
        ]
      },
      h(Input, { autoFocus: true, type: "url", placeholder: "https://example.com/theme.css", value: url, onChange: (e3) => setUrl(e3.target.value), onEnter: submit, disabled: busy2 }),
      error2 && h("div", { className: "uspp-ccpp-error", role: "alert", style: { marginTop: 8 } }, error2)
    );
  }
  function LocalThemeModal({ onClose, theme }) {
    const [name, setName] = useState(theme?.name || "");
    const [css2, setCss] = useState(theme?.css || "");
    const ok = name.trim() && css2.trim();
    const save2 = () => {
      if (!ok) return;
      if (theme) updateLocalTheme(theme.url, { name: name.trim(), css: css2 });
      else addLocalTheme(name.trim(), css2);
      onClose();
    };
    return h(
      ModalCard,
      {
        title: theme ? "Edit local theme" : "New local theme",
        onClose,
        width: 640,
        footer: [
          h(Button, { key: "c", onClick: onClose }, "Cancel"),
          h(Button, { key: "s", variant: "primary", onClick: save2, disabled: !ok }, theme ? "Save" : "Create")
        ]
      },
      h(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 10 } },
        h("label", { className: "uspp-ccpp-row-title" }, "Name"),
        h(Input, { autoFocus: true, placeholder: "My theme", value: name, onChange: (e3) => setName(e3.target.value) }),
        h("label", { className: "uspp-ccpp-row-title" }, "CSS"),
        h(CodeEditor, { value: css2, onChange: setCss, placeholder: "/* your CSS */", minHeight: 260, language: "css" })
      )
    );
  }
  function ThemeCard({ t: t4 }) {
    const remove = async () => {
      const ok = await confirmDialog2({ title: "Remove theme", body: `Are you sure you want to remove "${t4.name}"?`, confirmText: "Remove", danger: true });
      if (ok) removeTheme(t4.url);
    };
    const copy = async () => {
      const ok = await copyToClipboard(t4.url);
      showToast(ok ? "Copied URL" : "Couldn't copy URL", ok ? ToastType.SUCCESS : ToastType.ERROR);
    };
    const btn = (key, icon2, label, onClick) => h(IconButton, { key, icon: icon2, label, onClick, size: 3.5, className: "uspp-ccpp-card-btn" });
    return h(BaseCard, {
      attrs: { "data-uspp-ccpp-theme": t4.url },
      name: t4.name,
      badges: h("span", { className: "uspp-ccpp-badge" }, t4.local ? "Local" : "Online"),
      description: t4.description,
      controls: [
        t4.local ? btn("edit", EditIcon, "Edit", () => openModal2(({ onClose }) => h(LocalThemeModal, { onClose, theme: t4 }), { modalKey: "uspp-ccpp-local-theme" })) : btn("copy", CopyIcon, "Copy URL", copy),
        btn("del", TrashIcon, "Delete", remove),
        h(Switch, { key: "switch", checked: t4.enabled, label: t4.name, onChange: (v3) => (v3 ? enableTheme : disableTheme)(t4.url) })
      ],
      footer: [
        h("span", { key: "a", className: "uspp-ccpp-card-authors" }, t4.author || " "),
        h(
          "label",
          { key: "s", className: "uspp-ccpp-sites uspp-ccpp-muted uspp-ccpp-small" },
          h("input", { type: "checkbox", checked: !!t4.allSites, onChange: (e3) => setThemeAllSites(t4.url, e3.target.checked), "data-uspp-ccpp-theme-all": t4.url }),
          "Use on all sites"
        )
      ]
    });
  }
  function ThemesTab() {
    const force = useForceUpdate();
    useEffect(() => subscribeThemes(() => force()), []);
    const [query, setQuery] = useState("");
    const [filter, setFilter] = useState("all");
    const themes = getThemes();
    const q4 = query.trim().toLowerCase();
    const list2 = themes.filter((t4) => (!q4 || `${t4.name} ${t4.author || ""} ${t4.description || ""}`.toLowerCase().includes(q4)) && (filter === "all" || filter === "enabled" && t4.enabled || filter === "disabled" && !t4.enabled || filter === "online" && !t4.local || filter === "local" && t4.local));
    const section = (title, desc, onManage) => h(
      "div",
      { className: "uspp-ccpp-section" },
      h(
        "div",
        { className: "uspp-ccpp-row" },
        h(
          "div",
          { className: "uspp-ccpp-row-text" },
          h("div", { className: "uspp-ccpp-row-title" }, title),
          h("div", { className: "uspp-ccpp-muted uspp-ccpp-small" }, desc)
        ),
        h(Button, { onClick: onManage }, "Manage")
      )
    );
    return h(
      "div",
      { className: "uspp-ccpp-page", "data-uspp-ccpp-page": "themes" },
      h("div", { className: "uspp-ccpp-muted uspp-ccpp-small" }, `Themes for ${siteLabel()}. Turn on "Use on all sites" to apply a theme everywhere.`),
      section(
        "Online Themes",
        "Load themes from a URL. They're cached on this device and checked for updates once a day.",
        () => openModal2(({ onClose }) => h(OnlineThemeModal, { onClose }), { modalKey: "uspp-ccpp-online-theme" })
      ),
      section(
        "Local Themes",
        "Custom CSS that only lives on this device.",
        () => openModal2(({ onClose }) => h(LocalThemeModal, { onClose }), { modalKey: "uspp-ccpp-local-theme" })
      ),
      themes.length > 0 && h(
        "div",
        { className: "uspp-ccpp-toolbar" },
        h(Input, { type: "search", placeholder: `Search ${themes.length} themes...`, value: query, onChange: (e3) => setQuery(e3.target.value) }),
        h(Select, {
          value: filter,
          label: "Filter",
          onChange: setFilter,
          options: [["all", "All"], ["enabled", "Enabled"], ["disabled", "Disabled"], ["online", "Online"], ["local", "Local"]].map(([value, label]) => ({ value, label }))
        })
      ),
      themes.length > 0 && (list2.length ? h("div", { className: "uspp-ccpp-grid" }, list2.map((t4) => h(ErrorBoundary, { key: t4.url, fallback: null }, h(ThemeCard, { t: t4 })))) : h("div", { className: "uspp-ccpp-empty" }, "No themes match your search."))
    );
  }

  // vendor/userscript-pp/core/settings/QuickCssTab.js
  function QuickCssTab() {
    const force = useForceUpdate();
    useEffect(() => {
      const fn2 = () => force();
      SettingsStore.addPrefixChangeListener(SITES_PATH, fn2);
      return () => SettingsStore.removePrefixChangeListener(SITES_PATH, fn2);
    }, []);
    const { css: css2, enabled } = getQuickCss();
    return h(
      "div",
      { className: "uspp-ccpp-page", "data-uspp-ccpp-page": "quickcss" },
      h(
        Row,
        { title: "Enable Quick CSS", description: `Applies as you type, only on ${siteLabel()}. Turning it off keeps your code but stops applying it.` },
        h(Switch, { checked: enabled, label: "Enable Quick CSS", onChange: (v3) => setQuickCss({ enabled: v3 }) })
      ),
      h(CodeEditor, { value: css2, readOnly: !enabled, placeholder: "Paste your CSS here...", minHeight: 360, language: "css", onChange: (v3) => setQuickCss({ css: v3 }) })
    );
  }

  // vendor/userscript-pp/core/settings/KeybindsTab.js
  var subKeybinds = (fn2) => {
    const offs = [subscribeCommands(fn2)];
    const l3 = () => fn2();
    SettingsStore.addPrefixChangeListener("plugins.Settings.keybinds", l3);
    offs.push(() => SettingsStore.removePrefixChangeListener("plugins.Settings.keybinds", l3));
    return () => offs.forEach((o3) => o3());
  };
  function KeyCell({ id }) {
    const [rec, setRec] = useState(false);
    useEffect(() => {
      if (!rec) return void 0;
      return recordNextKey((combo) => {
        setRec(false);
        if (combo) setKeybind(id, combo);
      });
    }, [rec]);
    const k4 = keyFor3(id);
    const conflicts = conflictsOf(id);
    const custom = Object.prototype.hasOwnProperty.call(userKeybinds(), id);
    return h(
      "div",
      { className: "uspp-ccpp-keybind" },
      h("kbd", { className: "uspp-ccpp-kbd", "data-empty": k4 ? void 0 : "" }, rec ? "Press keys…" : k4 || "None"),
      h(Button, { size: "sm", variant: "outline", onClick: () => setRec(!rec) }, rec ? "Cancel" : "Change"),
      k4 && h(Button, { size: "sm", variant: "ghost", onClick: () => setKeybind(id, "") }, "Clear"),
      custom && h(Button, { size: "sm", variant: "ghost", onClick: () => resetKeybind(id) }, "Reset"),
      conflicts.length > 0 && h("div", { className: "uspp-ccpp-setting-error" }, `Also used by: ${conflicts.map((c4) => getCommand(c4)?.name ?? c4).join(", ")}`)
    );
  }
  function KeybindsTab() {
    useSubscription(subKeybinds);
    const list2 = getCommands().sort((a3, b3) => (a3.plugin ? 1 : 0) - (b3.plugin ? 1 : 0) || a3.name.localeCompare(b3.name));
    return h(
      "div",
      { className: "uspp-ccpp-page", "data-uspp-ccpp-page": "keybinds" },
      h("div", { className: "uspp-ccpp-muted uspp-ccpp-small", style: { marginBottom: 12 } }, "Click Change, then press the keys. Esc cancels. Shortcuts without Ctrl, Alt or Meta don't fire while you're typing in a text field."),
      list2.length ? h("div", { className: "uspp-ccpp-section" }, list2.map((c4) => h(
        "div",
        { key: c4.id, className: "uspp-ccpp-row", "data-uspp-ccpp-command": c4.id },
        h(
          "div",
          { className: "uspp-ccpp-row-text" },
          h("div", { className: "uspp-ccpp-row-title" }, c4.name),
          h("div", { className: "uspp-ccpp-muted uspp-ccpp-small" }, c4.description || (c4.plugin ? `From ${c4.plugin}` : "Built in"))
        ),
        h(KeyCell, { id: c4.id })
      ))) : h("div", { className: "uspp-ccpp-empty" }, "No commands.")
    );
  }

  // vendor/userscript-pp/core/settings/NotificationsTab.js
  var time = (t4) => new Date(t4).toLocaleTimeString();
  function NotificationsTab() {
    useSubscription(subscribeNotifications);
    const list2 = getNotificationHistory();
    return h(
      "div",
      { className: "uspp-ccpp-page", "data-uspp-ccpp-page": "notifications" },
      h(
        "div",
        { className: "uspp-ccpp-row", style: { marginBottom: 8 } },
        h("div", { className: "uspp-ccpp-muted uspp-ccpp-small" }, "Notifications shown since this page was opened (latest 50)."),
        list2.length > 0 && h(Button, { size: "sm", variant: "outline", onClick: clearNotificationHistory }, "Clear")
      ),
      list2.length ? h("div", { className: "uspp-ccpp-section" }, list2.map((n2) => h(
        "div",
        {
          key: n2.id,
          className: "uspp-ccpp-row uspp-ccpp-notify-log",
          "data-type": n2.type,
          "data-clickable": n2.onClick ? "" : void 0,
          onClick: () => {
            try {
              n2.onClick?.();
            } catch {
            }
          }
        },
        h(
          "div",
          { className: "uspp-ccpp-row-text" },
          h("div", { className: "uspp-ccpp-row-title" }, n2.title),
          n2.body && h("div", { className: "uspp-ccpp-muted uspp-ccpp-small" }, n2.body)
        ),
        h("span", { className: "uspp-ccpp-muted uspp-ccpp-small" }, time(n2.at))
      ))) : h("div", { className: "uspp-ccpp-empty" }, "No notifications yet.")
    );
  }

  // vendor/userscript-pp/core/settings/pages.js
  var page = (C4, label) => {
    const P4 = () => h(ErrorBoundary, { fallback: h("div", { className: "uspp-ccpp-page uspp-ccpp-error" }, `${label} failed to render.`) }, h(C4));
    P4.displayName = `Uspp${label.replace(/\s/g, "")}Page`;
    return P4;
  };
  var BUILTIN_PAGES = Object.freeze([
    { id: TAB_IDS.plugins, key: "plugins", label: "Plugins", icon: PuzzleIcon, component: page(PluginsTab, "Plugins") },
    { id: TAB_IDS.themes, key: "themes", label: "Themes", icon: PaletteIcon, component: page(ThemesTab, "Themes") },
    { id: TAB_IDS.quickCss, key: "quickCss", label: "Quick CSS", icon: CodeIcon, component: page(QuickCssTab, "Quick CSS") },
    { id: TAB_IDS.keybinds, key: "keybinds", label: "Keybinds", icon: KeyboardIcon, component: page(KeybindsTab, "Keybinds") },
    { id: TAB_IDS.notifications, key: "notifications", label: "Notifications", icon: BellIcon, component: page(NotificationsTab, "Notifications") },
    { id: TAB_IDS.updates, key: "updates", label: "Updates", icon: ReloadIcon, component: page(UpdatesTab, "Updates") },
    { id: TAB_IDS.backup, key: "backup", label: "Backup", icon: ArchiveIcon, component: page(BackupTab, "Backup") }
  ]);
  var wrapped = /* @__PURE__ */ new WeakMap();
  var customPage = (def) => {
    let C4 = wrapped.get(def);
    if (!C4) {
      const Inner = def.component;
      C4 = () => h("div", { className: "uspp-ccpp-page", "data-uspp-ccpp-page": def.key }, h(ErrorBoundary, { fallback: h("div", { className: "uspp-ccpp-error" }, `${def.label} failed to render.`) }, h(Inner)));
      C4.displayName = `UsppCustomPage_${def.key}`;
      wrapped.set(def, C4);
    }
    return { id: def.id, key: def.key, label: def.label, icon: def.icon || SlidersIcon, component: C4, custom: true, plugin: def.plugin };
  };
  var getSettingsPages = () => [...BUILTIN_PAGES, ...getRegisteredPages().map(customPage)];
  var pageByKey = (key) => getSettingsPages().find((p4) => p4.key === key || p4.id === key) || BUILTIN_PAGES[0];

  // vendor/userscript-pp/core/settings/SettingsPanel.js
  var PANEL_KEY = "uspp-ccpp-settings-panel";
  function SettingsPanel({ tab, onClose }) {
    useSubscription(subscribeSettingsPages);
    const [cur, setCur] = useState(pageByKey(tab).key);
    const page2 = pageByKey(cur);
    return h(
      ModalCard,
      { title: SCRIPT_NAME, subtitle: `${VERSION} · ${siteLabel()}`, onClose, width: 860 },
      h(
        "div",
        { className: "uspp-ccpp-panel", "data-uspp-ccpp-panel": "" },
        // 页面导航放左侧边栏(同站点设置弹窗的布局),内容区顶部只留插件页自己的一排分类标签
        h("nav", { className: "uspp-ccpp-panel-nav", role: "tablist", "aria-orientation": "vertical" }, getSettingsPages().map((p4) => h("button", {
          key: p4.key,
          type: "button",
          role: "tab",
          className: "uspp-ccpp-panel-nav-item",
          "aria-selected": String(p4.key === cur),
          "data-uspp-ccpp-panel-tab": p4.key,
          title: p4.label,
          onClick: () => setCur(p4.key)
        }, p4.icon && h(p4.icon, { size: 4 }), h("span", null, p4.label)))),
        h("div", { className: "uspp-ccpp-panel-content" }, h(page2.component, { key: page2.key }))
      )
    );
  }
  function openSettingsPanel({ tab = "plugins", plugin } = {}) {
    openModal2(({ onClose }) => h(SettingsPanel, { tab, onClose }), { modalKey: PANEL_KEY });
    const p4 = typeof plugin === "string" ? plugins2[plugin] : plugin;
    if (p4) openModal2(({ onClose }) => h(PluginModal, { plugin: p4, onClose }), { modalKey: `uspp-ccpp-plugin-${p4.name}` });
  }
  var closeSettingsPanel = () => closeModal(PANEL_KEY);

  // vendor/userscript-pp/core/ui/slot-render.js
  var logger40 = new Logger("SlotRender", "#fdba74");
  function DefaultButton({ def, ctx }) {
    const Icon = def.icon;
    return h("button", {
      type: "button",
      className: "uspp-ccpp-btn uspp-ccpp-btn-ghost uspp-ccpp-btn-sm uspp-ccpp-slot-button",
      title: def.tooltip ?? def.label,
      "data-uspp-ccpp-slot-item": def.id,
      disabled: slotValue(def.disabled, ctx),
      onClick: (e3) => {
        try {
          (def.onClick ?? def.onSelect)?.(e3, ctx);
        } catch (err) {
          logger40.error(`注入点项 ${def.id} 出错`, err);
        }
      }
    }, Icon != null && (typeof Icon === "function" ? h(Icon, { size: 4 }) : Icon), def.label != null && h("span", null, def.label));
  }
  function SlotOutlet({ slot, ctx = {}, filter }) {
    useSubscription((fn2) => onSlotChange(slot, fn2));
    const items2 = getSlotItems(slot).filter((d3) => {
      if (filter && !filter(d3)) return false;
      try {
        return d3.when ? !!d3.when(ctx) : true;
      } catch {
        return false;
      }
    });
    if (!items2.length) return null;
    return h(Fragment, null, items2.map((def) => h(
      ErrorBoundary,
      { key: def.id, fallback: null, label: `slot:${slot}:${def.id}` },
      def.render ? h(def.render, ctx) : h(DefaultButton, { def, ctx })
    )));
  }
  var hosts = /* @__PURE__ */ new Set();
  var mo2 = null;
  function watchDetach() {
    if (mo2 || typeof MutationObserver === "undefined") return;
    let queued2 = false;
    mo2 = new MutationObserver(() => {
      if (queued2) return;
      queued2 = true;
      setTimeout(() => {
        queued2 = false;
        for (const x4 of [...hosts]) if (!x4.container.isConnected) x4.unmount();
        if (!hosts.size) {
          mo2?.disconnect();
          mo2 = null;
        }
      }, 100);
    });
    mo2.observe(document.documentElement, { childList: true, subtree: true });
  }
  function renderSlot(slot, container3, ctx = {}) {
    const x4 = { slot, container: container3, ctx, root: null, dead: false };
    const draw2 = () => {
      if (x4.dead) return;
      const R3 = getRenderer();
      if (!R3) {
        setTimeout(draw2, 200);
        return;
      }
      try {
        x4.root ??= R3.createRoot(container3);
        x4.root.render(h(SlotOutlet, { slot, ctx: x4.ctx }));
      } catch (e3) {
        logger40.error(`渲染注入点 ${slot} 失败`, e3);
      }
    };
    x4.update = (next) => {
      x4.ctx = next ?? x4.ctx;
      draw2();
    };
    x4.unmount = () => {
      if (x4.dead) return;
      x4.dead = true;
      hosts.delete(x4);
      try {
        x4.root?.unmount();
      } catch {
      }
    };
    hosts.add(x4);
    watchDetach();
    draw2();
    return { update: x4.update, unmount: x4.unmount };
  }

  // vendor/userscript-pp/core/settings/FailedPlugins.js
  var failedPlugins = () => Object.values(plugins2).filter((p4) => isPluginEnabled(p4.name) && !p4.started && p4.startError);
  var errText = (e3) => e3?.stack || `${e3?.name ?? "Error"}: ${e3?.message ?? e3}`;
  function FailedList({ onClose }) {
    const [, force] = useState(0);
    const list2 = failedPlugins();
    return h(
      ModalCard,
      { title: "Plugins that failed to start", subtitle: "Each one is still enabled. Disable it if it keeps failing.", onClose, width: 720 },
      list2.length ? list2.map((p4) => h(
        "div",
        { key: p4.name, className: "uspp-ccpp-section uspp-ccpp-failed", "data-uspp-ccpp-failed": p4.name },
        h(
          "div",
          { className: "uspp-ccpp-row" },
          h(
            "div",
            { className: "uspp-ccpp-row-text" },
            h("div", { className: "uspp-ccpp-row-title" }, p4.name),
            h("div", { className: "uspp-ccpp-muted uspp-ccpp-small" }, String(p4.startError?.message ?? p4.startError))
          ),
          !p4.required && h(Button, { size: "sm", variant: "danger", onClick: () => {
            togglePlugin2(p4.name);
            force((x4) => x4 + 1);
          } }, "Disable")
        ),
        h("pre", { className: "uspp-ccpp-stack" }, errText(p4.startError))
      )) : h("div", { className: "uspp-ccpp-empty" }, "All plugins are running now.")
    );
  }
  var openFailedList = () => openModal2(({ onClose }) => h(FailedList, { onClose }), { modalKey: "uspp-ccpp-failed-plugins" });
  function showFailureSummary() {
    const list2 = failedPlugins();
    if (!list2.length) return 0;
    showNotice({
      type: "WARNING",
      message: `${list2.length} plugin${list2.length === 1 ? "" : "s"} failed to start: ${list2.map((p4) => p4.name).join(", ")}`,
      action: { label: "Details", onClick: openFailedList }
    });
    return list2.length;
  }

  // vendor/userscript-pp/core/lib/webpack.js
  var fnToString3 = Function.prototype.toString;

  // vendor/userscript-pp/core/index.js
  var logger41 = new Logger("Core", "#c4b5fd");
  var DEFAULT_READY_TIMEOUT = 15e3;
  var BUILD_SITES = typeof define_USPP_SITES_default !== "undefined" ? define_USPP_SITES_default : [];
  function step(label, fn2) {
    try {
      return fn2();
    } catch (e3) {
      logger41.error(`${label} 失败`, e3);
    }
  }
  function openPluginSettings(plugin, focusKey) {
    const p4 = typeof plugin === "string" ? plugins2[plugin] : plugin;
    if (!p4) return false;
    openModal2(({ onClose }) => h(PluginModal, { plugin: p4, onClose }), { modalKey: `uspp-ccpp-plugin-${p4.name}` });
    if (focusKey) setTimeout(() => {
      const el = queryUi(`[data-uspp-ccpp-setting="${String(focusKey).replace(/["\\]/g, "")}"]`);
      if (!el) return;
      try {
        el.scrollIntoView({ block: "center" });
      } catch {
      }
      el.classList.add("uspp-ccpp-setting-flash");
      setTimeout(() => el.classList.remove("uspp-ccpp-setting-flash"), 1600);
    }, 80);
    return true;
  }
  function showSafeModeNotice() {
    const info = lastBootInfo();
    const why = safeModeReason() === "crash" ? `The page may have been broken by a plugin${info.lastPlugin ? ` (last starting: ${info.lastPlugin})` : ""}${info.failed.length ? `; failed: ${info.failed.join(", ")}` : ""}.` : "Started in safe mode on request.";
    showNotice({ type: "WARNING", message: `${SCRIPT_NAME} is in safe mode: only required plugins run, no themes or Quick CSS. ${why}`, action: { label: "Exit safe mode", onClick: exitSafeMode, close: false } });
  }
  function openSettings3(opts = {}) {
    const host4 = getSite().settingsHost;
    if (host4 && typeof host4.open === "function" && PlainSettings.plugins.Settings?.showSiteEntry !== false) {
      let ok = false;
      try {
        ok = !!host4.open(opts);
      } catch (e3) {
        logger41.warn("站点设置界面打开失败", e3);
      }
      if (ok) {
        setTimeout(() => {
          const shown2 = typeof host4.isOpen === "function" ? host4.isOpen() : !!queryUi("[data-uspp-ccpp-page]");
          if (!shown2) openSettingsPanel(opts);
        }, 800);
        return "site";
      }
    }
    openSettingsPanel(opts);
    return "panel";
  }
  function countIdleMutations(ms = 8e3) {
    const ours = (n2) => n2 && n2.nodeType === 1 && (n2.tagName.toLowerCase().startsWith("uspp-ccpp-") || [...n2.attributes].some((a3) => a3.name.startsWith("data-uspp-ccpp")) || [...n2.classList].some((c4) => c4.startsWith("uspp-ccpp-")) || !!n2.querySelector?.("[data-uspp-ccpp],[class*='uspp-ccpp-'],uspp-ccpp-root"));
    return new Promise((resolve) => {
      let count2 = 0;
      const samples = [];
      const mo3 = new MutationObserver((list2) => {
        for (const m3 of list2) {
          const hit = [...m3.addedNodes, ...m3.removedNodes].some(ours) || m3.type === "attributes" && (ours(m3.target) || m3.attributeName?.startsWith("data-uspp-ccpp"));
          if (hit) {
            count2++;
            if (samples.length < 10) samples.push(m3.target?.nodeName);
          }
        }
      });
      mo3.observe(document.documentElement, { childList: true, subtree: true, attributes: true });
      setTimeout(() => {
        mo3.disconnect();
        resolve({ count: count2, samples });
      }, ms);
    });
  }
  function installAliases(api) {
    const names = /* @__PURE__ */ new Set();
    for (const s3 of getSites()) for (const k4 of Object.keys(s3.api || {})) names.add(k4);
    for (const name of names) {
      if (name in api) continue;
      Object.defineProperty(api, name, {
        enumerable: true,
        get() {
          const own = getSite().api;
          if (own && name in own) return own[name];
          const sample = getSites().map((s3) => s3.api?.[name]).find((v3) => v3 != null);
          if (typeof sample === "function") return (...args) => {
            logger41.debug(`${name} 只在 ${siteNamesWith(name)} 上可用,当前站点忽略`, args[0]);
          };
          return {};
        }
      });
    }
  }
  var siteNamesWith = (name) => getSites().filter((s3) => s3.api && name in s3.api).map((s3) => s3.name).join("、");
  function registerHostPatches() {
    const host4 = getSite().settingsHost;
    (host4?.patches || []).forEach((patch, i3) => {
      try {
        addPatch(patch, "Settings", { key: `Settings#host${i3}`, self: { key: "settingsHost", expr: `${INSTANCE_EXPR}.site.settingsHost` } });
      } catch (e3) {
        logger41.error(`登记站点设置入口的第 ${i3} 条补丁失败`, e3);
      }
    });
  }
  function waitSiteReady(site, cb) {
    let fired = false;
    const r3 = site.ready;
    const timeoutMs = r3 && typeof r3 === "object" && r3.timeout || site.readyTimeout || DEFAULT_READY_TIMEOUT;
    const offs = [];
    const fire = () => {
      if (fired) return;
      fired = true;
      offs.forEach((o3) => {
        try {
          o3();
        } catch {
        }
      });
      clearTimeout(timer2);
      cb();
    };
    const timer2 = setTimeout(fire, r3 ? timeoutMs : 0);
    if (!r3) return;
    if (typeof r3 === "function") {
      const check3 = () => {
        try {
          if (r3()) fire();
        } catch {
        }
      };
      const iv = setInterval(check3, 200);
      offs.push(() => clearInterval(iv), onModuleLoad(check3));
      check3();
      return;
    }
    if (typeof r3.module === "function") {
      offs.push(waitFor(r3.module, () => setTimeout(fire, 0)));
      offs.push(onTakeover(() => {
        if (!runtime.registry) fire();
      }));
      step("扫描模块缓存", rescanRuntimeCache);
    }
    if (r3.element) waitForElement(r3.element).then((el) => {
      if (el) fire();
    });
  }
  function checkFingerprint(site) {
    const chunkPath = site.driverOptions?.chunkPath;
    const base = (s3) => {
      try {
        return new URL(s3, location.href).pathname.split("/").pop();
      } catch {
        return String(s3).split("/").pop();
      }
    };
    const names = /* @__PURE__ */ new Set();
    if (site.driver === "webpack") {
      for (const s3 of document.querySelectorAll("script[src]")) {
        try {
          if (new URL(s3.src, location.href).origin === location.origin) names.add(base(s3.src));
        } catch {
        }
      }
    } else {
      if (chunkPath) for (const s3 of document.querySelectorAll(`script[src*="${chunkPath}"]`)) names.add(base(s3.src));
      for (const p4 of chunkPaths) names.add(base(p4));
    }
    const now2 = [...names].filter(Boolean).sort();
    if (!now2.length) return;
    const prev = Array.isArray(readPartition().chunkFingerprint) ? readPartition().chunkFingerprint : null;
    if (prev && prev.length) {
      const set = new Set(prev);
      const overlap = now2.filter((n2) => set.has(n2)).length;
      if (overlap / Math.max(now2.length, prev.length) < 0.5) {
        logger41.warn(`${site.name} 的构建已变化(分块文件重合不到一半),部分补丁可能失效`);
        alertSiteChange(site, `build:${now2.slice(0, 3).join(",")}`);
      }
    }
    if (!prev || prev.join("\n") !== now2.join("\n")) writePartition().chunkFingerprint = now2;
  }
  function alertSiteChange(site, reason2) {
    const key = `${VERSION}|${reason2}`;
    const part = readPartition();
    if (part.siteChangeNotice === key) return;
    writePartition().siteChangeNotice = key;
    notify4({
      title: `${site.name} has changed`,
      body: `${SCRIPT_NAME} may not work fully on this version of the site until it is updated.${SUPPORT_URL ? " Click to report it." : ""}`,
      type: "warning",
      duration: 15e3,
      onClick: SUPPORT_URL ? () => reportIssue() : void 0
    });
  }
  onPluginTripped((name, s3) => notify4({
    title: `${name} was turned off`,
    body: `It kept failing on this page (${s3.recent.length} errors in a short time). It will start again when you reload. Last error: ${s3.last?.message ?? "unknown"}`,
    type: "error",
    duration: 15e3,
    plugin: name
  }));
  function retryFailed2(list2) {
    let pending2 = list2.slice();
    const attempt = () => {
      rescanRuntimeCache();
      pending2 = pending2.filter((p4) => isPluginEnabled(p4.name) && !p4.started && !startPlugin(p4));
    };
    const tick2 = debounce(() => {
      attempt();
      if (!pending2.length) {
        off();
        clearTimeout(last2);
        logger41.info("之前启动失败的插件已全部启动");
      }
    }, 200);
    const off = onModuleLoad(tick2);
    const last2 = setTimeout(() => {
      off();
      tick2.cancel?.();
      attempt();
      if (pending2.length) logger41.warn(`以下插件启动失败:${pending2.map((p4) => p4.name).join(", ")}`);
      else logger41.info("之前启动失败的插件已全部启动");
      step("启动失败汇总", showFailureSummary);
    }, DEFAULT_READY_TIMEOUT);
  }
  var NAMESPACES = {
    webpack: [
      "filters",
      "find",
      "findAll",
      "findByProps",
      "findByCode",
      "findByDisplayName",
      "findComponentByCode",
      "findExportedComponent",
      "findStore",
      "findModuleId",
      "findModuleFactory",
      "mapMangledModule",
      "requireModule",
      "waitFor",
      "findCssClasses",
      "mapMangledCssClasses",
      "findBulk",
      "extractAndLoadChunks",
      "extractAndLoadChunksLazy",
      "DefaultChunkLoadRegex",
      "loadChunk",
      "importModule",
      "injectExports",
      "search",
      "onModuleLoad",
      "getAllStores",
      "isZustandStore",
      "findReact",
      "syncModuleCache",
      "moduleCacheVersion",
      "addPatch",
      "patches",
      "patchStats",
      "patchResults",
      "patchReport",
      "getPatchedCode",
      "onPatchBypassed",
      "registerInjectionFallback"
    ],
    dom: [
      "waitForElement",
      "observe",
      "setAttr",
      "setText",
      "toggleClass",
      "setStyle",
      "mount",
      "unmount",
      "getFiber",
      "getProps",
      "walkFiberUp",
      "findFiberProps",
      "addRenderHook",
      "asArray",
      "treeHas",
      "onRouteChange"
    ],
    net: ["onRequest", "onResponse", "rewriteRequest", "rewriteResponse", "onWebSocket", "onEventSource", "makeResponse", "fetchExternal"],
    ui: [
      "react",
      "components",
      "icons",
      "openModal",
      "closeModal",
      "closeAllModals",
      "ensureUiRoot",
      "showToast",
      "dismissToast",
      "ToastType",
      "showNotice",
      "closeNotice",
      "notify",
      "getNotificationHistory",
      "theme",
      "highlightCss",
      "createExternalStore",
      "createSelectionStore",
      "useExternalStore",
      "useFiltered",
      "useAsyncAction",
      "ErrorBoundary",
      "openPalette",
      "closePalette",
      "renderSlot",
      "SlotOutlet"
    ],
    settings: [
      "Settings",
      "PlainSettings",
      "SettingsStore",
      "openSettings",
      "openSettingsPanel",
      "closeSettingsPanel",
      "openPluginSettings",
      "settingsPages",
      "registerSettingsPage",
      "exportSettings",
      "importSettings",
      "previewImport",
      "undoImport",
      "lastImport",
      "parseBackup",
      "exportData",
      "importData",
      "DataStore"
    ],
    themes: [
      "getThemes",
      "addTheme",
      "addLocalTheme",
      "updateLocalTheme",
      "removeTheme",
      "enableTheme",
      "disableTheme",
      "setThemeAllSites",
      "isThemesEnabled",
      "setThemesEnabled",
      "isOnlineThemesEnabled",
      "setOnlineThemesEnabled",
      "getQuickCss",
      "setQuickCss",
      "registerStyle",
      "enableStyle",
      "disableStyle",
      "unregisterStyle"
    ]
  };
  var LAZY_NAMES = {
    find: "findLazy",
    byProps: "findByPropsLazy",
    byCode: "findByCodeLazy",
    byDisplayName: "findByDisplayNameLazy",
    componentByCode: "findComponentByCodeLazy",
    exportedComponent: "findExportedComponentLazy",
    store: "findStoreLazy",
    cssClasses: "findCssClassesLazy",
    mapMangledModule: "mapMangledModuleLazy"
  };
  function forwardTo(api, map, extra = {}) {
    const o3 = { ...extra };
    for (const [k4, name] of Object.entries(map)) {
      if (!(name in api)) continue;
      Object.defineProperty(o3, k4, { get: () => api[name], enumerable: true });
    }
    return Object.freeze(o3);
  }
  function installNamespaces(api) {
    for (const [ns, names] of Object.entries(NAMESPACES)) {
      if (ns in api) {
        logger41.warn(`接口分组 ${ns} 和已有名字冲突,跳过`);
        continue;
      }
      const map = Object.fromEntries(names.map((n2) => [n2, n2]));
      if (ns === "webpack") api[ns] = forwardTo(api, map, { lazy: forwardTo(api, LAZY_NAMES) });
      else api[ns] = forwardTo(api, map);
    }
  }
  var materialize = (entry, api) => typeof entry === "function" ? entry(api) : entry;
  function main() {
    if (W3.top !== W3.self) return;
    if (W3[INSTANCE_KEY]) {
      console.info(`[${SCRIPT_NAME}] 本脚本已在运行,跳过重复注入`);
      return;
    }
    step("安全模式判定", beginBoot);
    let resolveReady;
    const onceReady = new Promise((r3) => {
      resolveReady = r3;
    });
    let siteReadyDone = false;
    const api = {
      version: VERSION,
      frameworkVersion: FRAMEWORK_VERSION,
      apiVersion: API_VERSION,
      buildType: BUILD_TYPE,
      scriptId: SCRIPT_ID,
      scriptName: SCRIPT_NAME,
      // 本脚本页面上名字的前缀(类名、元素名、data- 标记都以它开头),站点适配拼名字时用
      prefix: "uspp-ccpp-",
      buildSites: BUILD_SITES.slice(),
      // 站点
      defineSite,
      // 运行时注册站点只作开发构建里的控制台调试手段
      registerSite: (def) => {
        if (true) {
          logger41.warn("registerSite 只在开发构建里可用");
          return false;
        }
        return registerSiteRuntime(def);
      },
      get site() {
        return getSite();
      },
      get sites() {
        return Object.fromEntries(getSites().map((s3) => [s3.id, s3]));
      },
      isSite,
      siteKey,
      // 插件
      plugins: plugins2,
      registerPlugin,
      startPlugin: startPluginApi,
      stopPlugin: stopPluginApi,
      isPluginEnabled,
      togglePlugin: togglePlugin2,
      definePlugin: definePlugin2,
      definePluginSettings: definePluginSettings2,
      migratePluginSettings,
      migratePluginSetting,
      getVisibleSettings,
      OptionType,
      StartAt,
      // 设置
      Settings,
      PlainSettings,
      SettingsStore,
      openSettings: openSettings3,
      openSettingsPanel,
      closeSettingsPanel,
      openPluginSettings,
      get settingsPages() {
        return getSettingsPages();
      },
      registerSettingsPage: (def) => ownByCurrent(registerSettingsPage(def)),
      exportSettings,
      importSettings,
      previewImport,
      undoImport,
      lastImport,
      parseBackup,
      exportData,
      importData,
      // 打包器(只在使用打包器驱动的站点上有内容)
      addPatch: (patch, pluginName) => addPatch(patch, pluginName),
      patches,
      patchStats,
      patchResults,
      patchReport: () => ({ ...patchReport(), notApplicable: [...patchesNotApplicable] }),
      getPatchedCode,
      onPatchBypassed,
      registerInjectionFallback,
      // 模块查找
      filters,
      find,
      findAll,
      findByProps,
      findByCode,
      findByDisplayName,
      findComponentByCode,
      findExportedComponent,
      findStore,
      findLazy,
      findByPropsLazy,
      findByCodeLazy,
      findByDisplayNameLazy,
      findComponentByCodeLazy,
      findExportedComponentLazy,
      findStoreLazy,
      findModuleId,
      findModuleFactory,
      mapMangledModule,
      mapMangledModuleLazy,
      requireModule,
      waitFor,
      findCssClasses,
      findCssClassesLazy,
      mapMangledCssClasses,
      findBulk,
      extractAndLoadChunks,
      extractAndLoadChunksLazy,
      DefaultChunkLoadRegex,
      loadChunk,
      importModule,
      injectExports,
      search: search2,
      onModuleLoad,
      onceReady,
      getAllStores,
      isZustandStore,
      findReact: getReact2,
      // 被其他脚本包装执行的模块只在运行时缓存里:并入本系统的缓存;版本号在缓存变化时递增
      syncModuleCache: () => {
        try {
          syncRuntimeCache();
        } catch {
        }
      },
      moduleCacheVersion: getCacheVersion,
      // DOM / fiber / JSX
      waitForElement,
      observe: (sel, opts) => ownByCurrent(observe(sel, opts)),
      setAttr,
      setText: setText2,
      toggleClass,
      setStyle,
      mount,
      unmount,
      getFiber,
      getProps,
      walkFiberUp,
      findFiberProps,
      addRenderHook: (type, fn2) => ownByCurrent(addRenderHook(type, fn2)),
      asArray,
      treeHas,
      // 方法补丁器
      patchMethod: (obj, name, hooks2) => ownByCurrent(patchMethod(obj, name, hooks2)),
      isPatched,
      // 路由 / 网络
      onRouteChange: (fn2) => ownByCurrent(onRouteChange(fn2)),
      onRequest: (m3, fn2) => ownByCurrent(onRequest(m3, fn2)),
      onResponse: (m3, fn2) => ownByCurrent(onResponse2(m3, fn2)),
      rewriteRequest: (m3, fn2) => ownByCurrent(rewriteRequest(m3, fn2)),
      rewriteResponse: (m3, fn2) => ownByCurrent(rewriteResponse(m3, fn2)),
      onWebSocket: (m3, hooks2) => ownByCurrent(onWebSocket(m3, hooks2)),
      onEventSource: (m3, hooks2) => ownByCurrent(onEventSource(m3, hooks2)),
      makeResponse,
      // 插件数据
      DataStore: { for: dataStoreFor },
      // 注入点
      addSlotItem: addSlotItem2,
      removeSlotItem,
      getSlotItems,
      onSlotChange: (slot, fn2) => ownByCurrent(onSlotChange(slot, fn2)),
      getSlotVersion,
      renderSlot,
      SlotOutlet,
      applyMenuPatches,
      // 拦截器
      addInterceptor: (name, fn2, opts) => ownByCurrent(addInterceptor(name, fn2, opts)),
      runInterceptors,
      hasInterceptors,
      // 命令、搜索栏、快捷键
      registerCommand: (def) => ownByCurrent(registerCommand(def)),
      runCommand,
      getCommands,
      keyFor: keyFor3,
      openPalette,
      closePalette,
      // 安全模式、诊断
      isSafeMode,
      reloadInSafeMode,
      exitSafeMode,
      collectDiagnostics,
      copyDiagnostics,
      pluginErrorStats,
      openFailedPlugins: openFailedList,
      // 更新
      checkForUpdate,
      installUpdate,
      openChangelog,
      changelog: CHANGELOG,
      // 界面
      react: {
        h,
        Fragment,
        getReact,
        getRenderer,
        usingSiteRenderer,
        useState,
        useEffect,
        useLayoutEffect,
        useMemo,
        useRef,
        useCallback,
        useReducer,
        useContext,
        useId,
        useSyncExternalStore,
        useForceUpdate,
        useSubscription
      },
      components: { ...components_exports, ...kit_exports, ModalCard, confirmDialog: confirmDialog2, SlotOutlet },
      highlightCss,
      createExternalStore,
      createSelectionStore,
      useExternalStore,
      useFiltered,
      useAsyncAction,
      icons: icons_exports,
      openModal: openModal2,
      closeModal,
      closeAllModals: closeAllModals2,
      ensureUiRoot: () => diag.noEarlyUiRoot ? trace("uiRoot.early.skipped") : ensureRoot(),
      showToast,
      dismissToast,
      ToastType,
      showNotice,
      closeNotice,
      notify: notify4,
      getNotificationHistory,
      theme: currentTheme,
      // 样式与主题(作用于当前站点分区)
      registerStyle: (name, css2) => registerStyle(name, css2),
      enableStyle,
      disableStyle,
      unregisterStyle,
      classNameFactory,
      classes,
      getThemes,
      addTheme,
      addLocalTheme,
      updateLocalTheme,
      removeTheme,
      enableTheme,
      disableTheme,
      setThemeAllSites,
      isThemesEnabled,
      setThemesEnabled,
      isOnlineThemesEnabled,
      setOnlineThemesEnabled,
      getQuickCss,
      setQuickCss,
      // 事件
      subscribe: (ev, fn2) => ownByCurrent(subscribe(ev, fn2)),
      dispatch,
      Events,
      // 工具
      Logger,
      ErrorBoundary,
      makeLazy,
      proxyLazy,
      fetchExternal,
      copyToClipboard,
      debounce,
      sleep: sleep2,
      onlyOnce,
      escapeRegExp,
      humanizeKey,
      matchesUrl,
      matchPattern,
      isChromium,
      countIdleMutations
    };
    if (false) {
      api.checkPatches = checkPatchesInPage;
      api.failedFinders = failedFinders;
      api.replacePlugin = replacePlugin;
      trackFinders(api, [
        "find",
        "findAll",
        "findByProps",
        "findByCode",
        "findByDisplayName",
        "findComponentByCode",
        "findExportedComponent",
        "findStore",
        "findModuleId",
        "findModuleFactory",
        "mapMangledModule",
        "findCssClasses",
        "findLazy",
        "findByPropsLazy",
        "findByCodeLazy",
        "findByDisplayNameLazy",
        "findComponentByCodeLazy",
        "findExportedComponentLazy",
        "findStoreLazy",
        "findCssClassesLazy",
        "mapMangledModuleLazy"
      ]);
      api.diag = { key: DIAG_KEY, config: diag, report: diagReport, set: (c4) => {
        W3.localStorage.setItem(DIAG_KEY, JSON.stringify(c4));
        return "已保存,硬刷新后生效";
      }, clear: () => {
        W3.localStorage.removeItem(DIAG_KEY);
        return "已清除,硬刷新后生效";
      } };
      setDiagExtra(() => {
        const rep = patchReport();
        let cacheIds = null;
        try {
          cacheIds = runtime.cache ? Object.keys(runtime.cache) : null;
        } catch {
        }
        return {
          stats: { ...rep.stats, orphaned: rep.orphaned.length },
          plugins: Object.values(plugins2).map((p4) => `${p4.name}:${p4.started}`),
          moduleCache: moduleCache.size,
          runtimeCache: cacheIds ? cacheIds.length : null,
          runtimeCacheIds: cacheIds
        };
      });
      if (diagOn) logger41.warn(`诊断开关已打开:${JSON.stringify(diag)}(${DIAG_KEY})`);
    }
    installNamespaces(api);
    setPluginResolver((name) => plugins2[name] ?? null);
    setSelfTarget("settingsHost", () => getSite().settingsHost ?? null);
    installBridge(W3, api);
    if (GLOBAL_NAME) {
      if (GLOBAL_NAME in W3) logger41.warn(`全局名字 ${GLOBAL_NAME} 已被占用,未挂调试入口`);
      else Object.defineProperty(W3, GLOBAL_NAME, { value: api, writable: false, configurable: true, enumerable: false });
    }
    step("同步读取设置", loadSync);
    step("注册核心插件", () => addPlugin(settings_default2));
    setSettingsOpener(() => openSettings3());
    setPaletteOpener((name, key) => {
      openSettingsPanel({ tab: "plugins" });
      openPluginSettings(name, key);
    });
    setPatchSummary(() => {
      const r3 = patchReport();
      return r3?.stats ? { ...r3.stats, orphaned: r3.orphaned?.length ?? 0 } : null;
    });
    const sitePlugins = [];
    for (const entry of sites_default) {
      step(`载入站点 ${entry?.id ?? ""}`, () => {
        const def = materialize(entry.site, api);
        if (!def) return;
        addSite(def);
        for (const pe of entry.plugins || []) {
          const pd = materialize(pe, api);
          if (pd) {
            pd.site = def.id;
            sitePlugins.push(pd);
          }
        }
        for (const pd of def.plugins || []) {
          pd.site ??= def.id;
          sitePlugins.push(pd);
        }
      });
    }
    const site = selectSite();
    step("站点事件", () => setSiteEvents(site.events));
    step("站点拦截器", () => setSiteInterceptors(site.interceptors));
    step("站点别名", () => installAliases(api));
    const genericPlugins = plugins_default.map((e3) => step("载入通用插件", () => materialize(e3, api))).filter(Boolean);
    for (const def of genericPlugins) {
      def.site ??= "*";
      step(`注册插件 ${def.name}`, () => addPlugin(def));
    }
    for (const def of sitePlugins) step(`注册插件 ${def.name}`, () => addPlugin(def));
    step("菜单命令", installMenuCommands);
    step("悬浮按钮", installFloating);
    step("注册界面样式", () => registerStyle("uspp-ccpp-ui", UI_CSS));
    if (typeof site.routeInfo === "function") setRouteParser(site.routeInfo);
    if (site.network) step("网络旁路", installNetworkHooks);
    if (site.route) step("路由工具", installRouteWatcher);
    if (site.driver === "turbopack") {
      setChunkPrefix(site.driverOptions?.chunkPath);
      step("登记补丁", registerPatches);
      if (diag.noHostPatches) trace("hostPatches.skipped");
      else step("登记站点设置入口补丁", registerHostPatches);
      if (diag.noTurbopack) trace("turbopack.skipped");
      else {
        step("安装打包器拦截", installInterceptor);
        step("监视打包器", () => watchInstrumentation(2e4));
      }
    } else if (site.driver === "webpack") {
      step("登记补丁", registerPatches);
      if (diag.noHostPatches) trace("hostPatches.skipped");
      else step("登记站点设置入口补丁", registerHostPatches);
      if (false) step("安装打包器拦截", () => installWebpack(site.driverOptions || {}));
    } else if (site.driver) {
      logger41.warn(`不支持的打包器驱动:${site.driver}`);
    }
    logger41.info(`${SCRIPT_NAME} ${VERSION}(${BUILD_TYPE}),脚本 ID ${SCRIPT_ID},当前站点 ${site.id},已注册 ${Object.keys(plugins2).length} 个插件`);
    (async () => {
      try {
        await loadAsync();
      } catch (e3) {
        logger41.error("读取设置失败", e3);
      }
      step("安装卸载保存", installUnloadSave);
      step("多标签页同步", installCrossTabSync);
      const keepData = step("清理旧设置", () => cleanStaleSettings());
      if (keepData) step("清理旧插件数据", () => {
        pruneData(keepData);
      });
      step("快捷键", installKeybinds);
      if (false) step("热重载", () => startHotClient(HOT_URL, {
        onPlugin(ev) {
          if (!plugins2[ev.name]) {
            notify4({ title: "Hot reload", body: `${ev.name} is new: reinstall the dev build to load it.`, type: "info" });
            return;
          }
          const def = evalPluginChunk(ev.code, api, ev.name);
          if (ev.dev) def.dev = true;
          if (ev.chromium) def.chromiumOnly = true;
          def.site ??= ev.site;
          const r3 = replacePlugin(def);
          trace("hot.replace", ev.name, r3);
          if (r3.reason === "patches") notify4({ title: "Hot reload", body: `${ev.name} has bundler patches: reinstall the dev build and reload.`, type: "warning" });
          else if (!r3.ok) showToast(`${ev.name} failed to restart: ${r3.error?.message ?? r3.reason}`, ToastType.ERROR);
          else showToast(`Reloaded ${ev.name}`, ToastType.SUCCESS);
        },
        onFull(reason2) {
          notify4({ title: "Dev build rebuilt", body: `Reinstall the dev build and reload the page${reason2 ? ` (${reason2})` : ""}.`, type: "info" });
        }
      }));
      step("记录插件", recordKnownPlugins);
      step("强制依赖", enforceDependencies);
      if (site.driver === "turbopack" || site.driver === "webpack") step("登记补丁", registerPatches);
      step("启动 Init 插件", () => startAllAt(StartAt.Init));
      const onDom = () => {
        step("启动 DOMContentLoaded 插件", () => startAllAt(StartAt.DOMContentLoaded));
        if (isSafeMode()) step("安全模式提示", showSafeModeNotice);
        if (diag.noSiteStart) trace("site.start.skipped");
        else {
          trace("site.start");
          step("站点启动", () => site.start?.call(site, api));
        }
        waitSiteReady(site, () => onSiteReady(site));
      };
      if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", onDom, { once: true });
      else onDom();
    })();
    function onSiteReady(s3) {
      if (siteReadyDone) return;
      siteReadyDone = true;
      trace("site.ready", s3.id);
      markSiteReady();
      if (s3.driver) step("扫描模块缓存", rescanRuntimeCache);
      step("onceReady", () => resolveReady());
      dispatch(Events.SITE_READY, { site: s3.id });
      const failed2 = step("启动 SiteReady 插件", () => startAllAt(StartAt.SiteReady)) || [];
      if (failed2.length) retryFailed2(failed2);
      else setTimeout(() => step("启动失败汇总", showFailureSummary), 0);
      step("启动完成", () => markBootHealthy());
      if (s3.driver) {
        logger41.info(`站点已就绪,已加载 ${moduleCache.size} 个模块`);
        setInterval(() => {
          try {
            syncRuntimeCache();
          } catch {
          }
        }, 2e3);
        setTimeout(() => step("补丁健康报告", () => {
          if (logHealthReport()?.siteChanged) alertSiteChange(s3, "patches");
        }), 5e3);
        if (false) setTimeout(() => step("查找器报告", () => {
          const bad = failedFinders();
          if (bad.length) logger41.debug(`${bad.length} 个查找器解析为空(站点改版时最先失效):`, bad.map((f3) => f3.finder));
        }), 8e3);
        setTimeout(() => step("构建指纹", () => checkFingerprint(s3)), 0);
      }
    }
    function registerSiteRuntime(entry) {
      const def = typeof entry === "function" ? entry(api) : entry;
      if (!addSite(def, { runtime: true })) return false;
      const stored = getSiteById(def.id);
      if (!switchTo(stored)) return true;
      logger41.info(`已切换到运行时注册的站点 ${stored.id}`);
      setSiteEvents(stored.events);
      setSiteInterceptors(stored.interceptors);
      installAliases(api);
      if (typeof stored.routeInfo === "function") setRouteParser(stored.routeInfo);
      if (stored.route) installRouteWatcher();
      for (const pd of stored.plugins || []) {
        pd.site ??= stored.id;
        addPlugin(pd, { runtime: true });
      }
      enforceDependencies();
      for (const stage of [StartAt.Init, StartAt.DOMContentLoaded]) startAllAt(stage);
      step("站点启动", () => stored.start?.call(stored, api));
      siteReadyDone = false;
      waitSiteReady(stored, () => onSiteReady(stored));
      return true;
    }
  }
  try {
    main();
  } catch (e3) {
    console.error(`[${SCRIPT_NAME}] 启动失败`, e3);
  }
})();
