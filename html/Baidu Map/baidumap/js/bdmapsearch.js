var BMapLib = window.BMapLib = BMapLib || {},
  BMAPLIB_TAB_SEARCH = 0,
  BMAPLIB_TAB_TO_HERE = 1,
  BMAPLIB_TAB_FROM_HERE = 2;
! function () {
  function t(t, e) {
    this._point = t, this.guid = e
  }

  function e(t) {
    this.iw = t
  }

  function i(t) {
    var e = document.createElement("script");
    e.setAttribute("type", "text/javascript"), e.setAttribute("src", t), e.addEventListener ? e.addEventListener("load", function (t) {
      var e = t.target || t.srcElement;
      e.parentNode.removeChild(e)
    }, !1) : e.attachEvent && e.attachEvent("onreadystatechange", function () {
      var t = window.event.srcElement;
      !t || "loaded" != t.readyState && "complete" != t.readyState || t.parentNode.removeChild(t)
    }), setTimeout(function () {
      document.getElementsByTagName("head")[0].appendChild(e), e = null
    }, 1)
  }
  var n, s = n = s || {
    version: "1.5.0"
  };
  s.guid = "$BAIDU$",
    function () {
      window[s.guid] = window[s.guid] || {}, s.lang = s.lang || {}, s.lang.isString = function (t) {
        return "[object String]" == Object.prototype.toString.call(t)
      }, s.lang.Event = function (t, e) {
        this.type = t, this.returnValue = !0, this.target = e || null, this.currentTarget = null
      }, s.object = s.object || {}, s.extend = s.object.extend = function (t, e) {
        for (var i in e) e.hasOwnProperty(i) && (t[i] = e[i]);
        return t
      }, s.event = s.event || {}, s.event._listeners = s.event._listeners || [], s.dom = s.dom || {}, s.dom._g = function (t) {
        return s.lang.isString(t) ? document.getElementById(t) : t
      }, s._g = s.dom._g, s.event.on = function (t, e, i) {
        e = e.replace(/^on/i, ""), t = s.dom._g(t);
        var n, o = function (e) {
            i.call(t, e)
          },
          a = s.event._listeners,
          r = s.event._eventFilter,
          h = e;
        return e = e.toLowerCase(), r && r[e] && (n = r[e](t, e, o), h = n.type, o = n.listener), t.addEventListener ? t.addEventListener(h, o, !1) : t.attachEvent && t.attachEvent("on" + h, o), a[a.length] = [t, e, i, o, h], t
      }, s.on = s.event.on, s.event.un = function (t, e, i) {
        t = s.dom._g(t), e = e.replace(/^on/i, "").toLowerCase();
        for (var n, o, a, r = s.event._listeners, h = r.length, d = !i; h--;) n = r[h], n[1] !== e || n[0] !== t || !d && n[2] !== i || (o = n[4], a = n[3], t.removeEventListener ? t.removeEventListener(o, a, !1) : t.detachEvent && t.detachEvent("on" + o, a), r.splice(h, 1));
        return t
      }, s.un = s.event.un, s.dom.g = function (t) {
        return "string" == typeof t || t instanceof String ? document.getElementById(t) : t && t.nodeName && (1 == t.nodeType || 9 == t.nodeType) ? t : null
      }, s.g = s.G = s.dom.g, s.string = s.string || {}, s.browser = s.browser || {}, s.browser.ie = s.ie = /msie (\d+\.\d+)/i.test(navigator.userAgent) ? document.documentMode || +RegExp.$1 : void 0, s.dom._NAME_ATTRS = function () {
        var t = {
          cellpadding: "cellPadding",
          cellspacing: "cellSpacing",
          colspan: "colSpan",
          rowspan: "rowSpan",
          valign: "vAlign",
          usemap: "useMap",
          frameborder: "frameBorder"
        };
        return s.browser.ie < 8 ? (t["for"] = "htmlFor", t["class"] = "className") : (t.htmlFor = "for", t.className = "class"), t
      }(), s.dom.setAttr = function (t, e, i) {
        return t = s.dom.g(t), "style" == e ? t.style.cssText = i : (e = s.dom._NAME_ATTRS[e] || e, t.setAttribute(e, i)), t
      }, s.setAttr = s.dom.setAttr, s.dom.setAttrs = function (t, e) {
        t = s.dom.g(t);
        for (var i in e) s.dom.setAttr(t, i, e[i]);
        return t
      }, s.setAttrs = s.dom.setAttrs, s.dom.create = function (t, e) {
        var i = document.createElement(t),
          n = e || {};
        return s.dom.setAttrs(i, n)
      }, s.cookie = s.cookie || {}, s.cookie._isValidKey = function (t) {
        return new RegExp('^[^\\x00-\\x20\\x7f\\(\\)<>@,;:\\\\\\"\\[\\]\\?=\\{\\}\\/\\u0080-\\uffff]+$').test(t)
      }, s.cookie.getRaw = function (t) {
        if (s.cookie._isValidKey(t)) {
          var e = new RegExp("(^| )" + t + "=([^;]*)(;|$)"),
            i = e.exec(document.cookie);
          if (i) return i[2] || null
        }
        return null
      }, s.cookie.get = function (t) {
        var e = s.cookie.getRaw(t);
        return "string" == typeof e ? e = decodeURIComponent(e) : null
      }, s.cookie.setRaw = function (t, e, i) {
        if (s.cookie._isValidKey(t)) {
          i = i || {};
          var n = i.expires;
          "number" == typeof i.expires && (n = new Date, n.setTime(n.getTime() + i.expires)), document.cookie = t + "=" + e + (i.path ? "; path=" + i.path : "") + (n ? "; expires=" + n.toGMTString() : "") + (i.domain ? "; domain=" + i.domain : "") + (i.secure ? "; secure" : "")
        }
      }, s.cookie.set = function (t, e, i) {
        s.cookie.setRaw(t, encodeURIComponent(e), i)
      }, s.cookie.remove = function (t, e) {
        e = e || {}, e.expires = new Date(0), s.cookie.setRaw(t, "", e)
      }, s.isPhone = function (t) {
        return /\d{11}/.test(t)
      }, s.isActivateCode = function (t) {
        return /\d{4}/.test(t)
      }, n.undope = !0
    }();
  var o = BMapLib.SearchInfoWindow = function (t, e, i) {
    this.guid = r++, BMapLib.SearchInfoWindow.instance[this.guid] = this, this._isOpen = !1, this._map = t, this._opts = i = i || {}, this._content = e || "", this._opts.width = i.width, this._opts.height = i.height, this._opts._title = i.title || "", this._opts.offset = i.offset || new BMap.Size(0, 0), this._opts.enableAutoPan = i.enableAutoPan === !1 ? !1 : !0, this._opts._panel = i.panel || null, this._opts._searchTypes = i.searchTypes, this._opts.enableSendToPhone = i.enableSendToPhone
  };
  o.prototype = new BMap.Overlay, o.prototype.initialize = function (t) {
    this._closeOtherSearchInfo();
    var e = this,
      i = this._createSearchTemplate(),
      n = t.getPanes().floatPane;
    return n.style.width = "auto", n.appendChild(i), this._initSearchTemplate(), this._getSearchInfoWindowSize(), this._boxWidth = parseInt(this.container.offsetWidth, 10), this._boxHeight = parseInt(this.container.offsetHeight, 10), s.event.on(i, "onmousedown", function (t) {
      e._stopBubble(t)
    }), s.event.on(i, "ontouchstart", function (t) {
      e._stopBubble(t)
    }), s.event.on(i, "touchmove", function (t) {
      e._stopBubble(t)
    }), s.event.on(i, "touchend", function (t) {
      e._stopBubble(t)
    }), s.event.on(i, "onmouseover", function (t) {
      e._stopBubble(t)
    }), s.event.on(i, "click", function (t) {
      e._stopBubble(t)
    }), s.event.on(i, "dblclick", function (t) {
      e._stopBubble(t)
    }), i
  }, o.prototype.draw = function () {
    this._isOpen && this._adjustPosition(this._point)
  }, o.prototype.open = function (t) {
    this._map.closeInfoWindow();
    var e, i = this;
    this._isOpen || (this._map.addOverlay(this), this._isOpen = !0, setTimeout(function () {
      i._dispatchEvent(i, "open", {
        point: i._point
      })
    }, 10)), t instanceof BMap.Point ? (e = t, this._removeMarkerEvt(), this._marker = null) : t instanceof BMap.Marker && (this._marker && this._removeMarkerEvt(), e = t.getPosition(), this._marker = t, !this._markerDragend && this._marker.addEventListener("dragend", this._markerDragend = function (t) {
      i._point = t.point, i._adjustPosition(i._point), i._panBox(), i.show()
    }), !this._markerDragging && this._marker.addEventListener("dragging", this._markerDragging = function () {
      i.hide(), i._point = i._marker.getPosition(), i._adjustPosition(i._point)
    })), this.show(), this._point = e, this._panBox(), this._adjustPosition(this._point)
  }, o.prototype.close = function () {
    this._isOpen && (this._map.removeOverlay(this), this._disposeAutoComplete(), this._isOpen = !1, this._dispatchEvent(this, "close", {
      point: this._point
    }))
  }, o.prototype.enableAutoPan = function () {
    this._opts.enableAutoPan = !0
  }, o.prototype.disableAutoPan = function () {
    this._opts.enableAutoPan = !1
  }, o.prototype.setContent = function (t) {
    this._setContent(t), this._getSearchInfoWindowSize(), this._adjustPosition(this._point)
  }, o.prototype.setTitle = function (t) {
    this.dom.title.innerHTML = t, this._opts._title = t
  }, o.prototype.getContent = function () {
    return this.dom.content.innerHTML
  }, o.prototype.getTitle = function () {
    return this.dom.title.innerHTML
  }, o.prototype.setPosition = function (t) {
    this._point = t, this._adjustPosition(t), this._panBox(), this._removeMarkerEvt()
  }, o.prototype.getPosition = function () {
    return this._point
  }, o.prototype.getOffset = function () {
    return this._opts.offset
  }, s.object.extend(o.prototype, {
    _closeOtherSearchInfo: function () {
      for (var t = BMapLib.SearchInfoWindow.instance, e = t.length; e--;) t[e]._isOpen && t[e].close()
    },
    _setContent: function (t) {
      if (this.dom && this.dom.content) {
        "undefined" == typeof t.nodeType ? this.dom.content.innerHTML = t : this.dom.content.appendChild(t);
        var e = this;
        e._adjustContainerWidth(), this._content = t
      }
    },
    _adjustPosition: function (t) {
      var e = this._getPointPosition(t),
        i = this._marker && this._marker.getIcon();
      this._marker ? (this.container.style.bottom = -(e.y - this._opts.offset.height - i.anchor.height + i.infoWindowAnchor.height) - this._marker.getOffset().height + 2 + 30 + "px", this.container.style.left = e.x - i.anchor.width + this._marker.getOffset().width + i.infoWindowAnchor.width - this._boxWidth / 2 + 28 + "px") : (this.container.style.bottom = -(e.y - this._opts.offset.height) + 30 + "px", this.container.style.left = e.x - this._boxWidth / 2 + 25 + "px")
    },
    _getPointPosition: function (t) {
      return this._pointPosition = this._map.pointToOverlayPixel(t), this._pointPosition
    },
    _getSearchInfoWindowSize: function () {
      this._boxWidth = parseInt(this.container.offsetWidth, 10), this._boxHeight = parseInt(this.container.offsetHeight, 10)
    },
    _stopBubble: function (t) {
      t && t.stopPropagation ? t.stopPropagation() : window.event.cancelBubble = !0
    },
    _panBox: function () {
      if (this._opts.enableAutoPan) {
        var t = parseInt(this._map.getContainer().offsetHeight, 10),
          e = parseInt(this._map.getContainer().offsetWidth, 10),
          i = this._boxHeight,
          n = this._boxWidth;
        if (!(i >= t || n >= e)) {
          this._map.getBounds().containsPoint(this._point) || this._map.setCenter(this._point);
          var s, o, a = this._map.pointToPixel(this._point),
            r = n / 2 - 28 - a.x + 10,
            h = n / 2 + 28 + a.x - e + 10;
          if (this._marker) var d = this._marker.getIcon();
          var c = this._marker ? d.anchor.height + this._marker.getOffset().height - d.infoWindowAnchor.height : 0;
          s = i - a.y + this._opts.offset.height + c + 31 + 10, panX = r > 0 ? r : h > 0 ? -h : 0, o = s > 0 ? s : 0, this._map.panBy(panX, o)
        }
      }
    },
    _removeMarkerEvt: function () {
      this._markerDragend && this._marker.removeEventListener("dragend", this._markerDragend), this._markerDragging && this._marker.removeEventListener("dragging", this._markerDragging), this._markerDragend = this._markerDragging = null
    },
    _dispatchEvent: function (t, e, i) {
      0 != e.indexOf("on") && (e = "on" + e);
      var n = new s.lang.Event(e);
      if (i)
        for (var o in i) n[o] = i[o];
      t.dispatchEvent(n)
    },
    _initSearchTemplate: function () {
      this._initDom(), this._initPanelTemplate(), this.setTitle(this._opts._title), this._opts.height && (this.dom.content.style.height = parseInt(this._opts.height, 10) + "px"), this._setContent(this._content), this._initService(), this._bind(), this._opts._searchTypes && this._setSearchTypes(), this._mendIE6()
    },
    _createSearchTemplate: function () {
      if (!this._div) {
        var t = s.dom.create("div", {
            "class": "BMapLib_SearchInfoWindow",
            id: "BMapLib_SearchInfoWindow" + this.guid
          }),
          e = ['<div class="BMapLib_bubble_top">', '<div class="BMapLib_bubble_title" id="BMapLib_bubble_title' + this.guid + '"></div>', '<div class="BMapLib_bubble_tools">', '<div class="BMapLib_bubble_close" title="闂備胶枪缁绘垶绻涙繝鍋芥盯鏁撻敓锟�" id="BMapLib_bubble_close' + this.guid + '">', "</div>", '<div class="BMapLib_sendToPhone" title="闂備礁鎲￠悷锕傚垂閸ф鐒垫い鎴ｆ硶椤︼箓鏌涢埡浣虹劯妤犵偛绉堕埀顒婄秵閸嬪懐鑺遍敓锟�" id="BMapLib_sendToPhone' + this.guid + '">', "</div>", "</div>", "</div>", '<div class="BMapLib_bubble_center">', '<div class="BMapLib_bubble_content" id="BMapLib_bubble_content' + this.guid + '">', "</div>", '<div class="BMapLib_nav" id="BMapLib_nav' + this.guid + '">', '<ul class="BMapLib_nav_tab" id="BMapLib_nav_tab' + this.guid + '">', '<li class="BMapLib_first BMapLib_current" id="BMapLib_tab_search' + this.guid + '" style="display:block;">', '<span class="BMapLib_icon BMapLib_icon_nbs"></span>闂備線娼荤拹鐔煎礉閹存繍鐎舵い鏃囧Г娴溿倝鏌熺€电ǹ浠滄い銉嫹', "</li>", '<li class="" id="BMapLib_tab_tohere' + this.guid + '" style="display:block;">', '<span class="BMapLib_icon BMapLib_icon_tohere"></span>闂備礁鎲＄敮妤佸垔閻ｅ本宕查柡宥庡幗閻撳倿鎮橀悙鑸殿棄缂佺媴鎷�', "</li>", '<li class="" id="BMapLib_tab_fromhere' + this.guid + '" style="display:block;">', '<span class="BMapLib_icon BMapLib_icon_fromhere"></span>濠电偛顕慨鏉戭潩閿旂偓宕查柡宥庡幗閻撳倿鎮橀悙鑸殿棄婵絽顦甸弻娑樷枎濞嗘劕顏�', "</li>", "</ul>", '<ul class="BMapLib_nav_tab_content">', '<li id="BMapLib_searchBox' + this.guid + '">', '<table width="100%" align="center" border=0 cellpadding=0 cellspacing=0>', '<tr><td style="padding-left:8px;"><input id="BMapLib_search_text' + this.guid + '" class="BMapLib_search_text" type="text" maxlength="100" autocomplete="off"></td><td width="55" style="padding-left:7px;"><input id="BMapLib_search_nb_btn' + this.guid + '" type="submit" value="闂備胶鎳撻崥瀣垝鎼淬劌纾奸柨鐕傛嫹" class="iw_bt"></td></tr>', "</table>", "</li>", '<li id="BMapLib_transBox' + this.guid + '" style="display:none">', '<table width="100%" align="center" border=0 cellpadding=0 cellspacing=0>', '<tr><td width="30" style="padding-left:8px;"><div id="BMapLib_stationText' + this.guid + '">闂佽崵濮嶉崶鑸殿棖闂佺ǹ顑戦幏锟�</div></td><td><input id="BMapLib_trans_text' + this.guid + '" class="BMapLib_trans_text" type="text" maxlength="100" autocomplete="off"></td><td width="106" style="padding-left:7px;"><input id="BMapLib_search_bus_btn' + this.guid + '" type="button" value="闂備胶枪濞存岸宕楀☉姗嗘僵闁跨噦鎷�" class="iw_bt" style="margin-right:5px;"><input id="BMapLib_search_drive_btn' + this.guid + '" type="button" class="iw_bt" value="濠碉紕鍋犻～澶婄暦濡　鏀﹂柨鐕傛嫹"></td></tr>', "</table>", "</li>", "</ul>", "</div>", "</div>", '<div class="BMapLib_bubble_bottom"></div>', '<img src="http://api.map.baidu.com/library/SearchInfoWindow/1.4/src/iw_tail.png" width="58" height="31" alt="" class="BMapLib_trans" id="BMapLib_trans' + this.guid + '" style="left:144px;"/>'];
        t.innerHTML = e.join(""), this._div = t
      }
      return this._div
    },
    _initPanelTemplate: function () {
      var t = s.g(this._opts._panel);
      if (!this.dom.panel && t) {
        t.innerHTML = "", this.dom.panel = t;
        var e = s.dom.create("div");
        e.style.cssText = "display:none;background:#FD9;height:30px;line-height:30px;text-align:center;font-size:12px;color:#994C00;", t.appendChild(e), this.dom.panel.address = e;
        var i = s.dom.create("div");
        t.appendChild(i), this.dom.panel.localSearch = i
      }
    },
    _initDom: function () {
      this.dom || (this.dom = {
        container: s.g("BMapLib_SearchInfoWindow" + this.guid),
        content: s.g("BMapLib_bubble_content" + this.guid),
        title: s.g("BMapLib_bubble_title" + this.guid),
        closeBtn: s.g("BMapLib_bubble_close" + this.guid),
        transIco: s.g("BMapLib_trans" + this.guid),
        navBox: s.g("BMapLib_nav" + this.guid),
        navTab: s.g("BMapLib_nav_tab" + this.guid),
        seartTab: s.g("BMapLib_tab_search" + this.guid),
        tohereTab: s.g("BMapLib_tab_tohere" + this.guid),
        fromhereTab: s.g("BMapLib_tab_fromhere" + this.guid),
        searchBox: s.g("BMapLib_searchBox" + this.guid),
        transBox: s.g("BMapLib_transBox" + this.guid),
        stationText: s.g("BMapLib_stationText" + this.guid),
        nbBtn: s.g("BMapLib_search_nb_btn" + this.guid),
        busBtn: s.g("BMapLib_search_bus_btn" + this.guid),
        driveBtn: s.g("BMapLib_search_drive_btn" + this.guid),
        searchText: s.g("BMapLib_search_text" + this.guid),
        transText: s.g("BMapLib_trans_text" + this.guid),
        sendToPhoneBtn: s.g("BMapLib_sendToPhone" + this.guid)
      }, this.container = this.dom.container)
    },
    _adjustContainerWidth: function () {
      var t = 250;
      this._opts.width ? (t = parseInt(this._opts.width, 10), t += 10) : t = parseInt(this.dom.content.offsetWidth, 10), 250 > t && (t = 250), this._width = t, this.container.style.width = this._width + "px", this._adjustTransPosition()
    },
    _adjustTransPosition: function () {
      this.dom.transIco.style.left = this.container.offsetWidth / 2 - 2 - 29 + "px", this.dom.transIco.style.top = this.container.offsetHeight - 2 + "px"
    },
    _initService: function () {
      var t = this._map,
        e = this,
        i = {};
      i.map = t, this.dom.panel && (i.panel = this.dom.panel.localSearch), this.localSearch || (this.localSearch = new BMap.LocalSearch(t, {
        renderOptions: i,
        onSearchComplete: function () {
          e._clearAddress(), e._drawCircleBound()
        }
      })), this.transitRoute || (this.transitRoute = new BMap.TransitRoute(t, {
        renderOptions: i,
        onSearchComplete: function (t) {
          e._transitRouteComplete(e.transitRoute, t)
        }
      })), this.drivingRoute || (this.drivingRoute = new BMap.DrivingRoute(t, {
        renderOptions: i,
        onSearchComplete: function (t) {
          e._transitRouteComplete(e.drivingRoute, t)
        }
      }))
    },
    _bind: function () {
      var t = this;
      s.on(this.dom.closeBtn, "click", function () {
        t.close()
      }), s.on(this.dom.closeBtn, "touchstart", function () {
        t.close()
      }), s.on(this.dom.sendToPhoneBtn, "click", function () {
        t._sendToPhone()
      }), s.on(this.dom.sendToPhoneBtn, "touchstart", function () {
        t._sendToPhone()
      }), s.on(this.dom.seartTab, "click", function () {
        t._showTabContent(BMAPLIB_TAB_SEARCH)
      }), s.on(this.dom.seartTab, "touchstart", function () {
        t._showTabContent(BMAPLIB_TAB_SEARCH)
      }), s.on(this.dom.tohereTab, "click", function () {
        t._showTabContent(BMAPLIB_TAB_TO_HERE)
      }), s.on(this.dom.tohereTab, "touchstart", function () {
        t._showTabContent(BMAPLIB_TAB_TO_HERE)
      }), s.on(this.dom.fromhereTab, "click", function () {
        t._showTabContent(BMAPLIB_TAB_FROM_HERE)
      }), s.on(this.dom.fromhereTab, "touchstart", function () {
        t._showTabContent(BMAPLIB_TAB_FROM_HERE)
      }), s.on(this.dom.searchText, "click", function () {
        t._localSearchAction()
      }), s.on(this.dom.searchText, "touchstart", function () {
        t._localSearchAction()
      }), s.on(this.dom.nbBtn, "click", function () {
        t._localSearchAction()
      }), s.on(this.dom.nbBtn, "touchstart", function () {
        t._localSearchAction()
      }), s.on(this.dom.busBtn, "click", function () {
        t._transitRouteAction(t.transitRoute)
      }), s.on(this.dom.busBtn, "touchstart", function () {
        t._transitRouteAction(t.transitRoute)
      }), s.on(this.dom.driveBtn, "click", function () {
        t._transitRouteAction(t.drivingRoute)
      }), s.on(this.dom.driveBtn, "touchstart", function () {
        t._transitRouteAction(t.drivingRoute)
      }), this._autoCompleteIni(), this._opts.enableSendToPhone === !1 && (this.dom.sendToPhoneBtn.style.display = "none")
    },
    _showTabContent: function (t) {
      this._hideAutoComplete();
      for (var e = this.dom.navTab.getElementsByTagName("li"), i = e.length, n = 0, i = e.length; i > n; n++) e[n].className = "";
      switch (t) {
        case BMAPLIB_TAB_SEARCH:
          this.dom.seartTab.className = "BMapLib_current", this.dom.searchBox.style.display = "block", this.dom.transBox.style.display = "none";
          break;
        case BMAPLIB_TAB_TO_HERE:
          this.dom.tohereTab.className = "BMapLib_current", this.dom.searchBox.style.display = "none", this.dom.transBox.style.display = "block", this.dom.stationText.innerHTML = "闂佽崵濮嶉崶鑸殿棖闂佺ǹ顑戦幏锟�", this._pointType = "endPoint";
          break;
        case BMAPLIB_TAB_FROM_HERE:
          this.dom.fromhereTab.className = "BMapLib_current", this.dom.searchBox.style.display = "none", this.dom.transBox.style.display = "block", this.dom.stationText.innerHTML = "缂傚倸鍊风粈渚€鎮ц箛娑樼；闁跨噦鎷�", this._pointType = "startPoint"
      }
      this._firstTab.className += " BMapLib_first"
    },
    _autoCompleteIni: function () {
      this.searchAC = new BMap.Autocomplete({
        input: this.dom.searchText,
        location: this._map
      }), this.transAC = new BMap.Autocomplete({
        input: this.dom.transText,
        location: this._map
      })
    },
    _hideAutoComplete: function () {
      this.searchAC.hide(), this.transAC.hide()
    },
    _disposeAutoComplete: function () {
      this.searchAC.dispose(), this.transAC.dispose()
    },
    _localSearchAction: function () {
      var t = this._kw = this.dom.searchText.value;
      if ("" == t) this.dom.searchText.focus();
      else {
        this._reset(), this.close();
        var e = this._radius = 1e3;
        this.localSearch.searchNearby(t, this._point, e)
      }
    },
    _drawCircleBound: function () {
      this._closeCircleBound();
      var e = this._searchCircle = new BMap.Circle(this._point, this._radius, {
          strokeWeight: 3,
          strokeOpacity: .4,
          strokeColor: "#e00",
          filColor: "#00e",
          fillOpacity: .4
        }),
        i = this._searchLabel = new t(this._point, this.guid);
      this._map.addOverlay(e), this._map.addOverlay(i), this._hasCircle = !0
    },
    _changeSearchRadius: function () {
      var t = parseInt(s.g("BMapLib_search_radius" + this.guid).value, 10);
      t > 0 && t != this._radius && (this._radius = t, this.localSearch.searchNearby(this._kw, this._point, t), this._closeCircleBound())
    },
    _closeCircleBound: function () {
      this._searchCircle && this._map.removeOverlay(this._searchCircle), this._searchLabel && this._map.removeOverlay(this._searchLabel), this._hasCircle = !1
    },
    _transitRouteAction: function (t) {
      var e = this.dom.transText.value;
      if ("" == e) this.dom.transText.focus();
      else {
        this._reset(), this.close();
        var i = this._getTransPoi(e);
        t.search(i.start, i.end)
      }
    },
    _transitRouteComplete: function (t, e) {
      this._clearAddress();
      var i = t.getStatus();
      if (i == BMAP_STATUS_UNKNOWN_ROUTE) {
        var n = e.getStartStatus(),
          s = e.getEndStatus(),
          o = "";
        o = "闂備礁缍婂褑銇愰悙鐢电當濠㈣埖鍔曠粈鍡涙煙濞堝灝鏋熺紒浣圭叀閺屾稖绠涢幘璁圭礊濠电偛鐗婇崹褰掓儉椤忓牊鍤勬い鏍ㄧ矌閸烇拷", n == BMAP_ROUTE_STATUS_EMPTY && s == BMAP_ROUTE_STATUS_EMPTY ? o = "闂備礁缍婂褑銇愰悙鐢电當濠㈣埖鍔曠粈鍡涙煙濞堝灝鏋熺紒浣圭叀閺屾稖绠涢幘璁圭礊濠电偛鐗婇崹褰掑箰瑜庨ˇ鐗堟償閳ユ彃瀵查梻浣告啞缁矂鎯夐懖鈺佸灊闁瑰墽绮崐鐑芥煥閻曞倹瀚�" : (n == BMAP_ROUTE_STATUS_EMPTY && (o = "闂備礁缍婂褑銇愰悙鐢电當濠㈣埖鍔曠粈鍡涙煙濞堝灝鏋熺紒浣圭叀閺屾稖绠涢幘璁圭礊濠电偛鐗婇崹褰掑箰瑜庨ˇ鐗堟償閳ユ彃瀵�"), s == BMAP_ROUTE_STATUS_EMPTY && (o = "闂備礁缍婂褑銇愰悙鐢电當濠㈣埖鍔曠粈鍡涙煙濞堝灝鏋熺紒浣圭叀閺屾稖绠涢幘璁圭礊濠电偛鐗婇崹鍦閹烘閱囬柕蹇曞С閸栵拷")), "startPoint" == this._pointType && s == BMAP_ROUTE_STATUS_ADDRESS || "endPoint" == this._pointType && n == BMAP_ROUTE_STATUS_ADDRESS ? this._searchAddress(t) : (this.dom.panel.address.style.display = "block", this.dom.panel.address.innerHTML = o)
      }
    },
    _searchAddress: function (t) {
      var e = this,
        i = this.dom.panel;
      if (!this.lsAddress) {
        var n = {
          map: this._map
        };
        i && (n.panel = this.dom.panel.localSearch), this.lsAddress = new BMap.LocalSearch(this._map, {
          renderOptions: n
        })
      }
      var o = "startPoint" == e._pointType ? "缂傚倸鍊风粈渚€鎮ц箛娑樼；闁跨噦鎷�" : "闂佽崵濮嶉崶鑸殿棖闂佺ǹ顑戦幏锟�";
      i && (this.dom.panel.address.style.display = "block", this.dom.panel.address.innerHTML = "闂佽崵濮村ú銊╁礂濮椻偓閸┾偓妞ゆ巻鍋撴い锔藉閳ь剚鍝庨崝鎴濈暦濞嗘挸骞㈡繛鍡楀閸嬫挸顫滈埀顒勫箚閸愵喗鏅搁柨鐕傛嫹" + o), this.lsAddress.setInfoHtmlSetCallback(function (i, n) {
        var a = document.createElement("div");
        a.style.cssText = "position:relative;left:50%;margin:5px 0 0 -30px;width:60px;height:27px;line-height:27px;border:1px solid #E0C3A6;text-align:center;color:#B35900;cursor:pointer;background-color:#FFEECC;border-radius:2px; background-image: -webkit-gradient(linear, left top, left bottom, from(#FFFDF8), to(#FFEECC))", a.innerHTML = "闂佽崵濮崇粈浣姐亹閻愬灚瀚婚柨鐕傛嫹" + o, n.appendChild(a), s.on(a, "click", function () {
          e._clearAddress();
          var n = i.marker.getPosition();
          "闂佽崵濮嶉崶鑸殿棖闂佺ǹ顑戦幏锟�" == o ? t.search(n, e._point) : t.search(e._point, n)
        })
      }), this._reset(), this.lsAddress.search(this.dom.transText.value)
    },
    _getTransPoi: function (t) {
      var e, i;
      return "startPoint" == this._pointType ? (e = this._point, i = t) : (e = t, i = this._point), {
        start: e,
        end: i
      }
    },
    _setSearchTypes: function () {
      var t, e = this._unique(this._opts._searchTypes),
        i = this.dom.navTab,
        n = [this.dom.seartTab, this.dom.tohereTab, this.dom.fromhereTab],
        o = 0,
        a = 0,
        r = 0;
      if (this.tabLength = e.length, tabWidth = Math.floor((this._width - this.tabLength + 1) / this.tabLength), 0 == e.length) this.dom.navBox.style.display = "none";
      else {
        for (o = 0, a = n.length; a > o; o++) n[o].className = "", n[o].style.display = "none";
        for (o = 0; o < this.tabLength; o++) {
          if (t = n[e[o]], 0 == o && (t.className = "BMapLib_first BMapLib_current", this._firstTab = t, r = e[o]), o == this.tabLength - 1) {
            var h = this._width - (this.tabLength - 1) * (tabWidth + 1);
            t.style.width = 6 == s.browser.ie ? h - 3 + "px" : h + "px"
          } else t.style.width = tabWidth + "px";
          t.style.display = "block"
        }
        void 0 != e[1] && i.appendChild(n[e[1]]), void 0 != e[2] && i.appendChild(n[e[2]]), this._showTabContent(r)
      }
      this._adjustTransPosition()
    },
    _unique: function (t) {
      for (var e, i, n = t.length, s = t.slice(0); --n >= 0;)
        if (i = s[n], 0 > i || i > 2) s.splice(n, 1);
        else
          for (e = n; e--;)
            if (i == s[e]) {
              s.splice(n, 1);
              break
            } return s
    },
    _reset: function () {
      this.localSearch.clearResults(), this.transitRoute.clearResults(), this.drivingRoute.clearResults(), this._closeCircleBound(), this._hideAutoComplete()
    },
    _clearAddress: function () {
      this.lsAddress && this.lsAddress.clearResults(), this.dom.panel && (this.dom.panel.address.style.display = "none")
    },
    _mendIE6: function () {
      if (s.browser.ie && !(s.browser.ie > 6))
        for (var t = this.container.getElementsByTagName("IMG"), e = 0; e < t.length; e++) t[e].src.indexOf(".png") < 0 || (t[e].style.cssText += ";FILTER: progid:DXImageTransform.Microsoft.AlphaImageLoader(src=" + t[e].src + ",sizingMethod=crop)", t[e].src = "http://api.map.baidu.com/images/blank.gif")
    },
    _sendToPhone: function () {
      this.showPopup()
    },
    showPopup: function () {
      this.pop || (this.pop = new e(this)), this._map.addOverlay(this.pop)
    }
  }), t.prototype = new BMap.Overlay, t.prototype.initialize = function (t) {
    function e(t) {
      t && t.stopPropagation ? t.stopPropagation() : window.event.cancelBubble = !0
    }
    this._map = t;
    var i = this._div = document.createElement("div");
    s.on(i, "mousedown", e), s.on(i, "touchstart", e), s.on(i, "click", e), s.on(i, "dblclick", e);
    var n = BMapLib.SearchInfoWindow.instance[this.guid];
    return i.style.cssText = "position:absolute;white-space:nowrap;background:#fff;padding:1px;border:1px solid red;z-index:99;", i.innerHTML = '<input type="text" value="' + n._radius + '" style="width:30px;" id="BMapLib_search_radius' + this.guid + '"/>m <a href="javascript:void(0)" title="濠电儑绲藉ù鍌炲窗濡ゅ懎鏋侀柨鐕傛嫹" onclick="BMapLib.SearchInfoWindow.instance[' + this.guid + ']._changeSearchRadius()" style="font-size:12px;text-decoration:none;color:blue;">濠电儑绲藉ù鍌炲窗濡ゅ懎鏋侀柨鐕傛嫹</a><img src="http://api.map.baidu.com/images/iw_close1d3.gif" alt="闂備胶枪缁绘垶绻涙繝鍋芥盯鏁撻敓锟�" title="闂備胶枪缁绘垶绻涙繝鍋芥盯鏁撻敓锟�" style="cursor:pointer;padding:0 5px;" onclick="BMapLib.SearchInfoWindow.instance[' + this.guid + ']._closeCircleBound()"/>', t.getPanes().labelPane.appendChild(i), i
  }, t.prototype.draw = function () {
    var t = this._map,
      e = t.pointToOverlayPixel(this._point);
    this._div.style.left = e.x + 10 + "px", this._div.style.top = e.y - 25 + "px"
  };
  var a = "http://api.map.baidu.com";
  e.prototype = new BMap.Overlay, s.extend(e.prototype, {
    initialize: function (t) {
      return this._map = t, this.container = this.generalDom(), this._map.getContainer().appendChild(this.container), this.initDom(), this.bind(), this.getAddressByPoint(), this.getRememberPhone(), this.addPhoneNum = 0, this.container
    },
    draw: function () {},
    generalDom: function () {
      var t = document.createElement("div"),
        e = this._map.getSize(),
        i = 0,
        n = 0;
      e.width > 450 && (n = (e.width - 450) / 2), e.height > 260 && (i = (e.height - 260) / 2), t.style.cssText = "position:absolute;background:#fff;width:480px;height:260px;top:" + i + "px;left:" + n + "px;ovflow:hidden;";
      var s = ['<div class="BMapLib_sms_tab_container">', "<span>闂備礁鎲￠悷锕傚垂閸ф鐒垫い鎴ｆ硶椤︼箓鏌涢埡浣虹劯妤犵偛绉堕埀顒婄秵閸嬪懐鑺遍敓锟�</span>", '<span id="BMapLib_sms_tip" style="display:none;">', "</span>", "</div>", '<div id="BMapLib_sms_pnl_phone" class="BMapLib_sms_pnl_phone" style="display: block;">', '<div class="BMapLib_ap" id="pnl_phone_left" style="display: block;">', "<table>", "<tr>", "<th>闂備礁鎲￠悷锕傚垂閸ф鐒垫い鎴ｆ硶閸斿秹鏌″畝鈧崰鏍嵁瀹ュ洠鍋撻敐搴′簼缂併劍宀搁弻娑樷枎濞嗘劕顏�</th>", '<td><input type="text" bid="" id="BMapLib_phone_0" maxlength="11" class="BMapLib_sms_input BMapLib_sms_input_l" /><span id="BMapLib_activateTip"></span></td>', "</tr>", '<tr id="BMapLib_activateBox" style="display:none;">', "<th>婵犵數濮烽。浠嬪磻閹惧绠鹃柤鑹版硾閸氬綊鏌ｉ弽鍨</th>", '<td><input type="text" id="BMapLib_activate" class="BMapLib_sms_input BMapLib_sms_input_s" maxlength="4"/><input type="button" value="闂備礁鍚嬮崕鎶藉床閼艰翰浜归柨鐕傛嫹" id="BMapLib_activate_btn" bid="activate" />', "</tr>", "<tr>", "<th></th>", "<td>", "</td>", "</tr>", "<tr>", '<th style="vertical-align:top;padding-top:7px;">闂備浇顫夋禍浠嬪磿閺屻儱鏋佺憸鐗堝笒濡﹢鎮峰▎蹇擃仼妞ゃ倓绶氶弻锟犲醇濠靛洦鍎撻悷婊冨簻閹凤拷</th>', '<td><div><input type="text" id="BMapLib_phone_1" class="BMapLib_sms_input BMapLib_sms_input_l" maxlength="11"/><input type="checkbox" id="BMapLib_is_remember_phone"/>闂佽崵濮崇欢姘躲€傞敂鍓х闁搞儜灞炬〃闂侀潧鐗嗛幊搴㈢箾閿燂拷</div>', '<div id="BMapLib_add_phone_con"></div>', '<div><a href="javascript:void(0)" id="BMapLib_add_phone_btn" bid="addPhone">闂備礁鎼崐鐟邦熆濮椻偓璺柨鐕傛嫹</a></div>', "</td>", "</tr>", "<tr>", "<th></th>", '<td ><input type="text" id="BMapLib_ver_input"  maxlength="4" style="width:67px;border: 1px solid #a5acb2;vertical-align: middle;height:18px;" tabindex="5" placeholder="濠德板€楁慨鎾儗娓氣偓閹焦寰勯幇顓炲壓闂佽法鍣﹂幏锟�"><img width="69" height="20" id="BMapLib_ver_image" bid="BMapLib_ver_image" style="border: 1px solid #d5d5d5;vertical-align:middle;margin-left: 5px;" alt="闂備胶绮崝妤呭箠閹捐鍚规い鏇楀亾鐎殿喖顕埀顒佺⊕閿氶幖鏉戯躬閺屸剝鎷呯憴鍕嚒闂佺儵妲勯幏锟�" title="闂備胶绮崝妤呭箠閹捐鍚规い鏇楀亾鐎殿喖顕埀顒佺⊕閿氶幖鏉戯躬閺屸剝鎷呯憴鍕嚒闂佺儵妲勯幏锟�"></td>', "</tr>", "<tr>", "<th></th>", '<td><input type="button" value="闂備胶枪缁绘劗绮旈悜钘夊瀭闁稿瞼鍋涢惌妤呮煙鏉堟崘鍚傞柛瀣尰閹峰懐绮欑捄銊ュ笓闂備礁缍婂褔顢栭崱妞绘敠闁逞嶆嫹" bid="sendToPhoneBtn"/></td>', "</tr>", "</table>", "</div>", '<div class="BMapLib_mp" id="pnl_phone_right" style="display: block;">', '<div class="BMapLib_mp_title">闂備焦妞块崣搴ㄥ储閻戞鈹嶅┑鐘叉搐缁€鍐煕濞戝崬寮鹃柛鐔锋喘閺屻劌鈽夐搹顐㈩伓</div>', '<div id="BMapLib_msgContent" class="BMapLib_msgContent"></div>', "</div>", '<div style="clear:both;"></div>', '<p id="BMapLib_sms_declare_phone" class="BMapLib_sms_declare_phone">闂備浇鐨崟顐㈠Б闁诲海顢婂▍鏇犵矚閸楃偐鏀藉┑鐘插椤秵绻涢幋鐐村碍缂佸鎸抽獮鍐ㄢ堪閸曨収娴勯柣鐘辩绾绢厾绮旂捄銊х＜婵°倕锕ら崢鍝ョ磼濡炲墽绐旂€殿噮鍓涢幉鎾礋椤愩倕鈧帗绻涢幘瀵割暡缂佸鐗滃▎銏ゎ敇閵忕姷顦ч梺闈涳紡閸曨厽娈搁梻浣哥秺濞佳囶敄閸℃せ鏀﹂柍褜鍓熼弻娑樷枎閹垮啯顥栭梺缁樼壄閹凤拷</p>', '<div id="tipError" class="tip fail" style="display:none;">', '<span id="tipText"></span>', '<a href="javascript:void(0)" id="tipClose" class="cut"></a>', "</div>", '<div id="sms_lack_tip" style="display:none;">闁诲氦顫夐悺鏇犱焊椤忓牆绠垫い蹇撳珔閹烘洜鐤€闁哄啠鍋撻柨娑虫嫹5婵犵數鍋涘Λ瀵告閺囥垺鍋傛い鎾跺枔閳瑰秹鏌嶉妷銊ョ毢闁荤喐鍔欏濠氬礋閼搁潧顏�</div>', '<div id="sms_unlogin_tip" style="display:none;">', '<div style="padding-left:40px;">', '<ul class="login_ul"><li id="normal_login-2" class="login_hover"><a href="javascript:void(0)">闂備礁缍婂褔顢栭崱妞绘敠闁逞屽墴閺岋綀顦舵い鏇嗗懐绀婇柨鐕傛嫹</a></li></ul>', '<div id="loginBox_02" class="loginBox">', '<div id="pass_error_info-2" class="pass_error_style"></div>', '<div id="passports-2"></div>', '<div id="loginIframe_iph-2" style="display:none"></div>', "</div>", "</div>", '<div class="nopass" style="padding-left:128px;">婵犵數鍋涙径鍥礈濠靛棴鑰垮〒姘ｅ亾闁诡垰鍊块獮鍡氼槻妞ゆ柨锕幃浠嬵敍濞戞ê顫岄悷婊勬緲濞硷繝寮澶嬫櫢闁跨噦鎷�<a href="https://passport.baidu.com/v2/?reg&amp;regType=1&amp;tpl=ma" target="_blank">缂傚倷鐒﹂弻銊╊敄閸涱厾鏆ら柛鈩冦仜閺嬫牠鏌曟繛鍨姎闁哄倵鍋�</a></div>', "</div>", "</div>", '<button class="BMapLib_popup_close" bid="close"></button>', '<div id="BMapLib_success_tip" style="display:none;">闂備浇顕栭崰鎾诲礉鎼粹檧鏋旈柟杈鹃檮閸庢銇勯幘瀵哥畱缂佽妫涢埀顒冾潐閻℃洜浜稿▎鎴濆灊闁跨喓濮撮惌妤呮煙鏉堟崘鍚傞柛瀣尰閹峰懐绮欑捄銊ュ笓闂備浇顕栭崰鎾诲礉鎼粹檧鏋旈柟杈剧畱缁犮儵鎮楅敐搴′簼缂併劍宀搁弻銊モ槈濡偐鍔銈嗘处閸撴瑩鍩㈤弮鍫澪╅柨鏇楀亾濠㈢懓鐗撻弻锛勪沪鐠囨彃濮曢梺杞扮筏閹凤拷!</div>'].join("");
      return t.innerHTML = s, t
    },
    initDom: function () {
      this.dom = {
        sms_tip: s.g("BMapLib_sms_tip"),
        activate_btn: s.g("BMapLib_activate_btn"),
        fromphone: s.g("BMapLib_phone_0"),
        tophone: s.g("BMapLib_phone_1"),
        isRememberPhone: s.g("BMapLib_is_remember_phone"),
        sms_container: s.g("BMapLib_sms_pnl_phone"),
        success_tip: s.g("BMapLib_success_tip"),
        add_phone_con: s.g("BMapLib_add_phone_con"),
        add_phone_btn: s.g("BMapLib_add_phone_btn"),
        activateBox: s.g("BMapLib_activateBox"),
        activateTip: s.g("BMapLib_activateTip"),
        activate_input: s.g("BMapLib_activate"),
        ver_image: s.g("BMapLib_ver_image"),
        ver_input: s.g("BMapLib_ver_input")
      }
    },
    showTip: function (t) {
      var e = t.error,
        i = {
          PHONE_NUM_INVALID: "闂備礁缍婂褔顢栭崱妞绘敠闁逞屽墴閺屾稑鈻庨幙鍐╊棖闂佺粯鐗楃划鎾愁嚕椤曗偓閹晠鎼归锝囧綑",
          SMS_SEND_SUCCESS: "闂備礁鎲￠悷锕傚垂閸ф鐒垫い鎴ｆ硶椤︼箓鏌涢埡浣虹劯妤犵偛绉堕埀顒婄秵閸嬪懐鑺卞鑸电厵閻庢稒锚婵洤鈹戦鍡樺",
          AK_INVALID: "濠电偠鎻徊鎸庢叏閸偅娅犵€广儱妫欐刊鎾偣閹帒濡介柡鍡楃箻閺岋綁濡搁妷銉у帗ey闂備礁鎼崯鐗堟叏閻㈢ǹ鐤鹃柨鐕傛嫹",
          INTERNAL_ERROR: "闂備礁鎼悧鍡欑矓鐎涙ɑ鍙忛柣鏃傚帶闂傤垶鏌曟繛鐐珕闁哄應鏅犻幃褰掑炊闁垮顏�",
          OVER_MAX_ACTIVATE_TIME: "濠电偛顕慨鎾晝閵堝桅濠㈣泛饪撮崯鍛存煠閻撳骸顣崇€涙繈鏌℃径鍡樻珔婵炲眰鍊涢妵鎰板磼閻愬鍔垫繛杈剧到濠€杈╂嫻閻斿摜绠鹃柤鑹版硾閸氬綊鏌ｉ弽銊х煉鐎殿喚鏁婚崺鈧い鎺嶇缁剁偟鎲告惔顭戞晝濠靛倻枪閺嬩線鏌ㄩ悤鍌涘",
          SMS_ACTIVATE_SUCCESS: "婵犵數濮烽。浠嬪磻閹惧绠鹃柤鑹版硾閸氬綊鏌ｉ弽銊х煀妞ゆ柨绻橀獮鎾诲箳閹寸姴鐭濋梻鍌欑贰閸嬪倻绮堟笟鈧畷鍝勭暆閸曨偆鐣洪梺闈浤涢崟顓熸闂備礁缍婂褔顢栭崱妞绘敠闁逞屽墴閺屻劌鈽夊Ο鑲╁姰濡炪倖娲﹂崜娆撳煝閺冨牆惟闁挎洍鍋撳鐟扮墦閺岋紕浠︾拠鎻掑闂佽桨绀佺紞濠囧极瀹ュ鏅搁柨鐕傛嫹",
          ACTIVATE_FAIL: "闂備礁缍婂褔顢栭崱妞绘敠闁逞屽墯缁绘繄鍠婂Ο杞板婵犵數鍋犵亸顏勭暦閻㈠憡鍋夋繝濠傜墕缁秹鏌ｅΟ鎸庣彧婵炲拑鎷�",
          SMS_LACK: "濠电偛顕慨鎾晝閵堝桅濠㈣埖鍔曠粻鏍煏婵炲灝濡跨紒鐘靛厴閺屻倗鈧湱濮甸ˉ澶岀磼鐠佽瀚�5濠电偞鍨堕幖鈺傜濠靛洦娅犳繝濠傜墕鐎氬鏌涘┑鍡楊仼缂佸弶妞藉娲敃闄囬崗宀勬煟閹垮啫骞楃紒宀勪憾閺佹捇鏁撻敓锟�",
          PARAM_INVALID: "闂佽崵濮村ú銈夊床閺屻儲鏅查柣鎰暯閸嬫捇鎮烽悧鍫熸嫳婵犫拃鍐х€殿喖鐏氬鍕箛閵娿儰澹曟繝銏ｅ煐閸旀垿鍩€椤掑﹥瀚�",
          SEND_ACTIVATE_FAIL: "婵犵數濮烽。浠嬪磻閹惧绠鹃柤鑹版硾閸氬綊鏌ｉ弽銊х煉鐎规洩缍侀獮瀣晜閻熼澹曟繛杈剧稻閹埖绂嶆總鍛婂仯闁规媽鍩栫€氾拷",
          VCODE_VERITY_FAIL: "濠德板€楁慨鎾儗娓氣偓閹焦寰勯幇顓炲壓婵炶揪绲藉﹢杈ㄦ櫠閳ユ緞鏃堟偐閼艰泛顏梺闈涙处閸ㄥ綊骞忚ぐ鎺撴櫢闁跨噦鎷�"
        },
        n = i[e];
      if ("SMS_LACK" == e) {
        var s = t.res_sms;
        n = "濠电偛顕慨鎾晝閵堝桅濠㈣埖鍔曠粻鏍煏婵炲灝濡跨紒鐘靛厴閺屻倗鈧湱濮甸ˉ澶岀磼鐠佽瀚�" + s + "濠电偞鍨堕幖鈺傜濠靛洦娅犳繝濠傜墕鐎氬鏌涘┑鍡楊仼缂佸弶妞藉娲敃闄囬崗宀勬煟閹垮啫骞楃紒宀勪憾閺佹捇鏁撻敓锟�", this.addPhoneNum = s - 1
      }
      this.renderImageVer(), n && (this.dom.sms_tip.innerHTML = n, this.dom.sms_tip.style.display = "inline"), "SMS_SEND_SUCCESS" == e && (this.rememberPhone(), this.sendSuccess())
    },
    bind: function () {
      var t = this;
      t.renderImageVer(), s.on(this.container, "click", function (e) {
        var i = e.target || e.srcElement,
          n = i.getAttribute("bid");
        switch (n) {
          case "close":
            t.closeActon();
            break;
          case "sendToPhoneBtn":
            t.sendAction();
            break;
          case "activate":
            t.activateAction();
            break;
          case "addPhone":
            t.addPhoneAction();
            break;
          case "deletePhone":
            t.deletePhoneAction(i);
            break;
          case "BMapLib_ver_image":
            t.renderImageVer()
        }
      });
      s.g("BMapLib_phone_0"), s.g("BMapLib_phone_1");
      this.container.onkeypress = function (t) {
        var e = t || window.e,
          i = e.which || e.keyCode,
          n = !1;
        return (i >= 48 && 57 >= i || 44 == i || 8 == i) && (n = !0), n
      }, this.dom.ver_input.onkeypress = function (e) {
        t._stopBubble(e);
        var i = e || window.e,
          n = i.which || i.keyCode,
          s = !1;
        return (n >= 48 && 57 >= n || n >= 65 && 90 >= n || n >= 97 && 122 >= n) && (s = !0), s
      }, s.on(this.dom.fromphone, "blur", function () {
        s.isPhone(this.value) ? t.checkActivateAction() : (t.dom.activateTip.innerHTML = "", t.dom.activateBox.style.display = "none")
      }), s.on(this.dom.activate_input, "blur", function () {
        s.isActivateCode(this.value) && t.checkActivateAction()
      })
    },
    _stopBubble: function (t) {
      t && t.stopPropagation ? t.stopPropagation() : window.event.cancelBubble = !0
    },
    renderImageVer: function () {
      var t = this;
      this.request("http://map.baidu.com/maps/services/captcha?", {
        cbName: "cb"
      }, function (e) {
        t.vcode = e.content.vcode, t.dom.ver_image.src = "http://map.baidu.com/maps/services/captcha/image?vcode=" + t.vcode
      })
    },
    checkActivateAction: function () {
      var t = {
          phone: this.dom.fromphone.value,
          activate: this.dom.activate_input.value,
          cbName: "callback"
        },
        e = this;
      this.request(this.config.ckActivateURL, t, function (t) {
        t && 0 != t.isactivate ? (e.dom.activateBox.style.display = "none", e.dom.activateTip.style.color = "green", e.dom.activateTip.innerHTML = "闁诲骸婀辨灙鐎殿喖澧庣紓鎾诲传閸旇姤妞介弫鎾绘晸閿燂拷") : (e.dom.activateBox.style.display = "table-row", e.dom.activateTip.style.color = "red", e.dom.activateTip.innerHTML = "闂備礁鎼悧婊勭濠靛牏绱﹂柛婵嗗▕濞差亝鏅搁柨鐕傛嫹")
      })
    },
    activateAction: function () {
      var t = this,
        e = this._map.getKey(),
        i = {
          phone: this.dom.fromphone.value,
          ak: e,
          cbName: "callback"
        };
      s.isPhone(i.phone) ? this.request(this.config.activateURL, i, function (e) {
        e && t.showTip(e)
      }) : this.showTip({
        error: "PHONE_NUM_INVALID"
      })
    },
    closeActon: function () {
      this._map.removeOverlay(this)
    },
    getMessage: function () {},
    sendAction: function () {
      var t = this;
      if (this.validate()) {
        tophoneStr = s.g("BMapLib_phone_1").value;
        for (var e = this.dom.add_phone_con.getElementsByTagName("input"), i = 0, n = e.length; n > i; i++) {
          if (!s.isPhone(e[i].value)) return void this.showTip({
            error: "PHONE_NUM_INVALID"
          });
          tophoneStr += "," + e[i].value
        }
        var o = this._map.getKey(),
          a = {
            fromphone: s.g("BMapLib_phone_0").value,
            tophone: tophoneStr,
            ak: o,
            activate: this.dom.activate_input.value,
            code_input: this.dom.ver_input.value,
            vcode: this.vcode,
            content: s.g("BMapLib_phone_0").value + "闂備礁鎲＄敮鎺懳涢弮鍫燁棅闁冲搫鍊婚埢鏃堟煃瑜滈崜姘辩矙婢舵劦鏁傞柛鎰典簽瀛濈紓鍌氬€搁崰姘跺窗濮樺崬鍨濆ù鍏兼綑缁犳牗銇勯鐔风缂佲偓閿燂拷" + this.messageContent,
            cbName: "callback"
          };
        this.request(this.config.sendURL, a, function (e) {
          e && t.showTip(e)
        })
      }
    },
    validate: function () {
      var t = !0;
      return s.isPhone(this.dom.fromphone.value) && s.isPhone(this.dom.tophone.value) || (t = !1, this.showTip({
        error: "PHONE_NUM_INVALID"
      })), t
    },
    getAddressByPoint: function () {
      var t = this.iw._point,
        e = this,
        i = new BMap.Geocoder;
      i.getLocation(t, function (t) {
        if (t && t.addressComponents) {
          var i = t.addressComponents;
          e.address = i.province + i.city + i.district + i.street + i.streetNumber, e.generalMessage()
        }
      })
    },
    generalMessage: function () {
      var t = s.g("BMapLib_msgContent"),
        e = "",
        i = this.iw,
        n = i.getPosition();
      this.userPhone && (e += this.userPhone + "闂備礁鎲＄敮鎺懳涢弮鍫燁棅闁冲搫鍊婚埢鏃堟煃瑜滈崜姘辩矙婢舵劦鏁傞柛鎰典簽瀛濈紓鍌氬€搁崰姘跺窗濮樺崬鍨濆ù鍏兼綑缁犳牗銇勯鐔风缂佲偓閿燂拷"), i.getTitle && (e += "闂備礁鎲￠懝鍓х矓閹壋鍙垮┑鐐村灦閹稿墽浜搁妸褎顫曢柨鐕傛嫹" + i.getTitle() + "闂備焦瀵ч崘濠氬箯閿燂拷"), this.address && (e += "濠电姰鍨归悥銏ゅ幢濡や胶妲囧┑鐐舵彧缁茬晫绮旈崼鏇熷仾闁糕剝绋戦幑鍫曟煥閻曞倹瀚�" + this.address + "闂備焦瀵ч崘濠氬箯閿燂拷");
      var o = "http://api.map.baidu.com/marker?location=" + n.lat + "," + n.lng + "&title=" + encodeURIComponent(i.getTitle()) + "&content=" + encodeURIComponent(i.getContent()) + "&output=html",
        a = {
          url: encodeURIComponent(o),
          t: (new Date).getTime(),
          cbName: "callback"
        },
        r = this;
      this.request(this.config.shortURL, a, function (i) {
        e += i.url, r.messageContent = e, t.innerHTML = e
      })
    },
    rememberPhone: function () {
      if (this.dom.isRememberPhone.checked) {
        var t = this.dom.tophone.value;
        s.cookie.set("BMapLib_phone", t, {
          path: "/",
          expires: 2592e6
        })
      }
    },
    getRememberPhone: function () {
      var t = s.cookie.get("BMapLib_phone");
      t && (this.dom.tophone.value = t, this.dom.isRememberPhone.checked = !0)
    },
    sendSuccess: function () {
      this.dom.sms_container.style.display = "none", this.dom.success_tip.style.display = "block";
      var t = this;
      setTimeout(function () {
        t._map.removeOverlay(t)
      }, 1500)
    },
    addPhoneAction: function () {
      if (this.addPhoneNum >= 4);
      else {
        var t = document.createElement("div");
        t.innerHTML = '<input type="text" class="BMapLib_sms_input BMapLib_sms_input_l" maxlength="11"/><a href="javascript:void(0);" style="margin-left:5px;" bid="deletePhone">闂備礁鎲＄敮鐐寸箾閳ь剚绻涢崪鍐╁</a>', this.dom.add_phone_con.appendChild(t), this.addPhoneNum++
      }
    },
    deletePhoneAction: function (t) {
      t.parentNode.parentNode.removeChild(t.parentNode), this.addPhoneNum--
    },
    request: function (t, e, n) {
      var s = (1e5 * Math.random()).toFixed(0);
      BMapLib["BMapLib_cbk" + s] = function (t) {
        n && n(t), delete BMapLib["BMapLib_cbk" + s]
      };
      for (var o in e) "cbName" != o && (t += "&" + o + "=" + e[o]);
      t += "&" + e.cbName + "=BMapLib.BMapLib_cbk" + s, i(t)
    },
    config: {
      sendURL: a + "/ws/message?method=send",
      activateURL: a + "/ws/message?method=activate",
      ckActivateURL: a + "/ws/message?method=ckActivate",
      shortURL: "http://j.map.baidu.com/?"
    }
  });
  var r = 0;
  BMapLib.SearchInfoWindow.instance = []
}();