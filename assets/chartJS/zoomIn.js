/*!
 * @license
 * chartjs-plugin-zoom
 * http://chartjs.org/
 * Version: 0.7.7
 *
 * Copyright 2020 Chart.js Contributors
 * Released under the MIT license
 * https://github.com/chartjs/chartjs-plugin-zoom/blob/master/LICENSE.md
 */
!(function (e, o) {
  "object" == typeof exports && "undefined" != typeof module
    ? (module.exports = o(require("chart.js"), require("hammerjs")))
    : "function" == typeof define && define.amd
    ? define(["chart.js", "hammerjs"], o)
    : ((e = e || self).ChartZoom = o(e.Chart, e.Hammer));
})(this, function (e, o) {
  "use strict";
  (e = e && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e),
    (o =
      o && Object.prototype.hasOwnProperty.call(o, "default") ? o.default : o);
  var t = e.helpers,
    n = (e.Zoom = e.Zoom || {}),
    a = (n.zoomFunctions = n.zoomFunctions || {}),
    i = (n.panFunctions = n.panFunctions || {});
  function m(e, o) {
    var n = {};
    void 0 !== e.options.pan && (n.pan = e.options.pan),
      void 0 !== e.options.zoom && (n.zoom = e.options.zoom);
    var a = e.$zoom;
    o = a._options = t.merge({}, [o, n]);
    var i = a._node,
      m = o.zoom && o.zoom.enabled,
      r = o.zoom.drag;
    m && !r
      ? i.addEventListener("wheel", a._wheelHandler)
      : i.removeEventListener("wheel", a._wheelHandler),
      m && r
        ? (i.addEventListener("mousedown", a._mouseDownHandler),
          i.ownerDocument.addEventListener("mouseup", a._mouseUpHandler))
        : (i.removeEventListener("mousedown", a._mouseDownHandler),
          i.removeEventListener("mousemove", a._mouseMoveHandler),
          i.ownerDocument.removeEventListener("mouseup", a._mouseUpHandler));
  }
  function r(e) {
    var o = e.$zoom._originalOptions;
    t.each(e.scales, function (e) {
      o[e.id] || (o[e.id] = t.clone(e.options));
    }),
      t.each(o, function (t, n) {
        e.scales[n] || delete o[n];
      });
  }
  function l(e, o, t) {
    return (
      void 0 === e ||
      ("string" == typeof e
        ? -1 !== e.indexOf(o)
        : "function" == typeof e && -1 !== e({ chart: t }).indexOf(o))
    );
  }
  function s(e, o) {
    if (
      e.scaleAxes &&
      e.rangeMax &&
      !t.isNullOrUndef(e.rangeMax[e.scaleAxes])
    ) {
      var n = e.rangeMax[e.scaleAxes];
      o > n && (o = n);
    }
    return o;
  }
  function c(e, o) {
    if (
      e.scaleAxes &&
      e.rangeMin &&
      !t.isNullOrUndef(e.rangeMin[e.scaleAxes])
    ) {
      var n = e.rangeMin[e.scaleAxes];
      o < n && (o = n);
    }
    return o;
  }
  function u(e, o, t, n) {
    var a = e.max - e.min,
      i = a * (o - 1),
      m = e.isHorizontal() ? t.x : t.y,
      r = (e.getValueForPixel(m) - e.min) / a,
      l = i * r,
      u = i * (1 - r);
    (e.options.ticks.min = c(n, e.min + l)),
      (e.options.ticks.max = s(n, e.max - u));
  }
  function d(e, o, t, n) {
    var i = a[e.type];
    i && i(e, o, t, n);
  }
  function p(e, o, n, a, i, m) {
    var s = e.chartArea;
    a || (a = { x: (s.left + s.right) / 2, y: (s.top + s.bottom) / 2 });
    var c = e.$zoom._options.zoom;
    if (c.enabled) {
      r(e);
      var u,
        p = "function" == typeof c.mode ? c.mode({ chart: e }) : c.mode;
      (u = "xy" === p && void 0 !== i ? i : "xy"),
        t.each(e.scales, function (t) {
          t.isHorizontal() && l(p, "x", e) && l(u, "x", e)
            ? ((c.scaleAxes = "x"), d(t, o, a, c))
            : !t.isHorizontal() &&
              l(p, "y", e) &&
              l(u, "y", e) &&
              ((c.scaleAxes = "y"), d(t, n, a, c));
        }),
        m ? e.update({ duration: m, easing: "easeOutQuad" }) : e.update(0),
        "function" == typeof c.onZoom && c.onZoom({ chart: e });
    }
  }
  function f(e, o, n) {
    var a,
      i = e.options.ticks,
      m = e.min,
      r = e.max,
      l = e.getValueForPixel(e.getPixelForValue(m) - o),
      s = e.getValueForPixel(e.getPixelForValue(r) - o),
      c = (l = l.valueOf ? l.valueOf() : l),
      u = (s = s.valueOf ? s.valueOf() : s);
    n.scaleAxes &&
      n.rangeMin &&
      !t.isNullOrUndef(n.rangeMin[n.scaleAxes]) &&
      (c = n.rangeMin[n.scaleAxes]),
      n.scaleAxes &&
        n.rangeMax &&
        !t.isNullOrUndef(n.rangeMax[n.scaleAxes]) &&
        (u = n.rangeMax[n.scaleAxes]),
      l >= c && s <= u
        ? ((i.min = l), (i.max = s))
        : l < c
        ? ((a = m - c), (i.min = c), (i.max = r - a))
        : s > u && ((a = u - r), (i.max = u), (i.min = m + a));
  }
  function v(e, o, t) {
    var n = i[e.type];
    n && n(e, o, t);
  }
  (e.Zoom.defaults = e.defaults.global.plugins.zoom =
    {
      pan: { enabled: !1, mode: "xy", speed: 20, threshold: 10 },
      zoom: { enabled: !1, mode: "xy", sensitivity: 3, speed: 0.1 },
    }),
    (n.zoomFunctions.category = function (e, o, t, a) {
      var i = e.chart.data.labels,
        m = e.minIndex,
        r = i.length - 1,
        l = e.maxIndex,
        u = a.sensitivity,
        d = e.isHorizontal() ? e.left + e.width / 2 : e.top + e.height / 2,
        p = e.isHorizontal() ? t.x : t.y;
      (n.zoomCumulativeDelta =
        o > 1 ? n.zoomCumulativeDelta + 1 : n.zoomCumulativeDelta - 1),
        Math.abs(n.zoomCumulativeDelta) > u &&
          (n.zoomCumulativeDelta < 0
            ? (p >= d
                ? m <= 0
                  ? (l = Math.min(r, l + 1))
                  : (m = Math.max(0, m - 1))
                : p < d &&
                  (l >= r
                    ? (m = Math.max(0, m - 1))
                    : (l = Math.min(r, l + 1))),
              (n.zoomCumulativeDelta = 0))
            : n.zoomCumulativeDelta > 0 &&
              (p >= d
                ? (m = m < l ? (m = Math.min(l, m + 1)) : m)
                : p < d && (l = l > m ? (l = Math.max(m, l - 1)) : l),
              (n.zoomCumulativeDelta = 0)),
          (e.options.ticks.min = c(a, i[m])),
          (e.options.ticks.max = s(a, i[l])));
    }),
    (n.zoomFunctions.time = function (e, o, t, n) {
      u(e, o, t, n);
      var a = e.options;
      a.time &&
        (a.time.min && (a.time.min = a.ticks.min),
        a.time.max && (a.time.max = a.ticks.max));
    }),
    (n.zoomFunctions.linear = u),
    (n.zoomFunctions.logarithmic = u),
    (n.panFunctions.category = function (e, o, t) {
      var a,
        i = e.chart.data.labels,
        m = i.length - 1,
        r = Math.max(e.ticks.length, 1),
        l = t.speed,
        u = e.minIndex,
        d = Math.round(e.width / (r * l));
      (n.panCumulativeDelta += o),
        (u =
          n.panCumulativeDelta > d
            ? Math.max(0, u - 1)
            : n.panCumulativeDelta < -d
            ? Math.min(m - r + 1, u + 1)
            : u),
        (n.panCumulativeDelta = u !== e.minIndex ? 0 : n.panCumulativeDelta),
        (a = Math.min(m, u + r - 1)),
        (e.options.ticks.min = c(t, i[u])),
        (e.options.ticks.max = s(t, i[a]));
    }),
    (n.panFunctions.time = function (e, o, t) {
      f(e, o, t);
      var n = e.options;
      n.time &&
        (n.time.min && (n.time.min = n.ticks.min),
        n.time.max && (n.time.max = n.ticks.max));
    }),
    (n.panFunctions.linear = f),
    (n.panFunctions.logarithmic = f),
    (n.panCumulativeDelta = 0),
    (n.zoomCumulativeDelta = 0);
  var h = {
    id: "zoom",
    afterInit: function (e) {
      e.resetZoom = function () {
        r(e);
        var o = e.$zoom._originalOptions;
        t.each(e.scales, function (e) {
          var t = e.options.time,
            n = e.options.ticks;
          o[e.id]
            ? (t && ((t.min = o[e.id].time.min), (t.max = o[e.id].time.max)),
              n && ((n.min = o[e.id].ticks.min), (n.max = o[e.id].ticks.max)))
            : (t && (delete t.min, delete t.max),
              n && (delete n.min, delete n.max));
        }),
          e.update();
      };
    },
    beforeUpdate: function (e, o) {
      m(e, o);
    },
    beforeInit: function (e, a) {
      e.$zoom = { _originalOptions: {} };
      var i = (e.$zoom._node = e.ctx.canvas);
      m(e, a);
      var s = e.$zoom._options,
        c = s.pan && s.pan.threshold;
      (e.$zoom._mouseDownHandler = function (o) {
        i.addEventListener("mousemove", e.$zoom._mouseMoveHandler),
          (e.$zoom._dragZoomStart = o);
      }),
        (e.$zoom._mouseMoveHandler = function (o) {
          e.$zoom._dragZoomStart && ((e.$zoom._dragZoomEnd = o), e.update(0));
        }),
        (e.$zoom._mouseUpHandler = function (o) {
          if (e.$zoom._dragZoomStart) {
            i.removeEventListener("mousemove", e.$zoom._mouseMoveHandler);
            var t = e.$zoom._dragZoomStart,
              n = t.target.getBoundingClientRect().left,
              a = Math.min(t.clientX, o.clientX) - n,
              m = Math.max(t.clientX, o.clientX) - n,
              r = t.target.getBoundingClientRect().top,
              c = Math.min(t.clientY, o.clientY) - r,
              u = m - a,
              d = Math.max(t.clientY, o.clientY) - r - c;
            (e.$zoom._dragZoomStart = null), (e.$zoom._dragZoomEnd = null);
            var f = (s.zoom && s.zoom.threshold) || 0;
            if (!(u <= f && d <= f)) {
              var v = e.chartArea,
                h = e.$zoom._options.zoom,
                x = v.right - v.left,
                g = l(h.mode, "x", e) && u ? 1 + (x - u) / x : 1,
                z = v.bottom - v.top,
                y = l(h.mode, "y", e);
              p(
                e,
                g,
                y && d ? 1 + (z - d) / z : 1,
                {
                  x: (a - v.left) / (1 - u / x) + v.left,
                  y: (c - v.top) / (1 - d / z) + v.top,
                },
                void 0,
                h.drag.animationDuration
              ),
                "function" == typeof h.onZoomComplete &&
                  h.onZoomComplete({ chart: e });
            }
          }
        });
      var u = null;
      if (
        ((e.$zoom._wheelHandler = function (o) {
          if ((o.cancelable && o.preventDefault(), void 0 !== o.deltaY)) {
            var t = o.target.getBoundingClientRect(),
              n = { x: o.clientX - t.left, y: o.clientY - t.top },
              a = e.$zoom._options.zoom,
              i = a.speed;
            o.deltaY >= 0 && (i = -i),
              p(e, 1 + i, 1 + i, n),
              clearTimeout(u),
              (u = setTimeout(function () {
                "function" == typeof a.onZoomComplete &&
                  a.onZoomComplete({ chart: e });
              }, 250));
          }
        }),
        o)
      ) {
        var d,
          f = new o.Manager(i);
        f.add(new o.Pinch()), f.add(new o.Pan({ threshold: c }));
        var h = function (o) {
          var t = (1 / d) * o.scale,
            n = o.target.getBoundingClientRect(),
            a = { x: o.center.x - n.left, y: o.center.y - n.top },
            i = Math.abs(o.pointers[0].clientX - o.pointers[1].clientX),
            m = Math.abs(o.pointers[0].clientY - o.pointers[1].clientY),
            r = i / m;
          p(e, t, t, a, r > 0.3 && r < 1.7 ? "xy" : i > m ? "x" : "y");
          var l = e.$zoom._options.zoom;
          "function" == typeof l.onZoomComplete &&
            l.onZoomComplete({ chart: e }),
            (d = o.scale);
        };
        f.on("pinchstart", function () {
          d = 1;
        }),
          f.on("pinch", h),
          f.on("pinchend", function (e) {
            h(e), (d = null), (n.zoomCumulativeDelta = 0);
          });
        var x = null,
          g = null,
          z = !1,
          y = function (o) {
            if (null !== x && null !== g) {
              z = !0;
              var n = o.deltaX - x,
                a = o.deltaY - g;
              (x = o.deltaX),
                (g = o.deltaY),
                (function (e, o, n) {
                  r(e);
                  var a = e.$zoom._options.pan;
                  if (a.enabled) {
                    var i =
                      "function" == typeof a.mode
                        ? a.mode({ chart: e })
                        : a.mode;
                    t.each(e.scales, function (t) {
                      t.isHorizontal() && l(i, "x", e) && 0 !== o
                        ? ((a.scaleAxes = "x"), v(t, o, a))
                        : !t.isHorizontal() &&
                          l(i, "y", e) &&
                          0 !== n &&
                          ((a.scaleAxes = "y"), v(t, n, a));
                    }),
                      e.update(0),
                      "function" == typeof a.onPan && a.onPan({ chart: e });
                  }
                })(e, n, a);
            }
          };
        f.on("panstart", function (e) {
          (x = 0), (g = 0), y(e);
        }),
          f.on("panmove", y),
          f.on("panend", function () {
            (x = null),
              (g = null),
              (n.panCumulativeDelta = 0),
              setTimeout(function () {
                z = !1;
              }, 500);
            var o = e.$zoom._options.pan;
            "function" == typeof o.onPanComplete &&
              o.onPanComplete({ chart: e });
          }),
          (e.$zoom._ghostClickHandler = function (e) {
            z &&
              e.cancelable &&
              (e.stopImmediatePropagation(), e.preventDefault());
          }),
          i.addEventListener("click", e.$zoom._ghostClickHandler),
          (e._mc = f);
      }
    },
    beforeDatasetsDraw: function (e) {
      var o = e.ctx;
      if (e.$zoom._dragZoomEnd) {
        var t = (function (e) {
            for (
              var o = e.scales, t = Object.keys(o), n = 0;
              n < t.length;
              n++
            ) {
              var a = o[t[n]];
              if (a.isHorizontal()) return a;
            }
          })(e),
          n = (function (e) {
            for (
              var o = e.scales, t = Object.keys(o), n = 0;
              n < t.length;
              n++
            ) {
              var a = o[t[n]];
              if (!a.isHorizontal()) return a;
            }
          })(e),
          a = e.$zoom._dragZoomStart,
          i = e.$zoom._dragZoomEnd,
          m = t.left,
          r = t.right,
          s = n.top,
          c = n.bottom;
        if (l(e.$zoom._options.zoom.mode, "x", e)) {
          var u = a.target.getBoundingClientRect().left;
          (m = Math.min(a.clientX, i.clientX) - u),
            (r = Math.max(a.clientX, i.clientX) - u);
        }
        if (l(e.$zoom._options.zoom.mode, "y", e)) {
          var d = a.target.getBoundingClientRect().top;
          (s = Math.min(a.clientY, i.clientY) - d),
            (c = Math.max(a.clientY, i.clientY) - d);
        }
        var p = r - m,
          f = c - s,
          v = e.$zoom._options.zoom.drag;
        o.save(),
          o.beginPath(),
          (o.fillStyle = v.backgroundColor || "rgba(225,225,225,0.3)"),
          o.fillRect(m, s, p, f),
          v.borderWidth > 0 &&
            ((o.lineWidth = v.borderWidth),
            (o.strokeStyle = v.borderColor || "rgba(225,225,225)"),
            o.strokeRect(m, s, p, f)),
          o.restore();
      }
    },
    destroy: function (e) {
      if (e.$zoom) {
        var o = e.$zoom,
          t = o._node;
        t.removeEventListener("mousedown", o._mouseDownHandler),
          t.removeEventListener("mousemove", o._mouseMoveHandler),
          t.ownerDocument.removeEventListener("mouseup", o._mouseUpHandler),
          t.removeEventListener("wheel", o._wheelHandler),
          t.removeEventListener("click", o._ghostClickHandler),
          delete e.$zoom;
        var n = e._mc;
        n &&
          (n.remove("pinchstart"),
          n.remove("pinch"),
          n.remove("pinchend"),
          n.remove("panstart"),
          n.remove("pan"),
          n.remove("panend"),
          n.destroy());
      }
    },
  };
  return e.plugins.register(h), h;
});
