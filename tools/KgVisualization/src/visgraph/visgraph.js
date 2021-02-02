/*
 * GraphVis v1.0.0.20201115
 * 图数据可视化展示、分析组件，集成常见的经典布局算法，社区划分算法，高效、易用、可扩展！
 * Copyright (c) 2020 dubaopeng http://www.graphvis.cn All rights reserved.
 * Licensed ( http://www.apache.org/licenses/MIT )
 *
 * GraphVis官方网站
 * http://www.graphvis.cn
 *
 * 开源地址:
 * https://gitee.com/baopengdu/GraphVis
 **/
;
(function() {
	function Element() {
		this.initialize = function() {
				this.elementType = "element",
					this.serializedProperties = ["elementType"],
					this.propertiesStack = [],
					this._id = "" + (new Date).getTime()
			},
			this.distroy = function() {},
			this.removeHandler = function() {},
			this.attr = function(a, b) {
				if (null != name && null != value) {
					this[name] = value;
				} else if (null != name) {
					return this[name];
				}
				return this
			},
			this.save = function() {
				var a = this;
				var b = {};
				this.serializedProperties.forEach(function(properties) {
					b[properties] = a[properties];
				});
				this.propertiesStack.push(b);
			},
			this.restore = function() {
				if (null != this.propertiesStack && 0 != this.propertiesStack.length) {
					var a = this,
						b = this.propertiesStack.pop();
					this.serializedProperties.forEach(function(c) {
						a[c] = b[c]
					})
				}
			}
	}
	CanvasRenderingContext2D.prototype.DGraphRoundRect = function(x, y, width, height, borderRadius) {
		if ("undefined" == typeof borderRadius) {
			borderRadius = 5;
		}
		this.beginPath();
		this.moveTo(x + borderRadius, y);
		this.lineTo(x + width - borderRadius, y);
		this.quadraticCurveTo(x + width, y, x + width, y + borderRadius);
		this.lineTo(x + width, y + height - borderRadius);
		this.quadraticCurveTo(x + width, y + height, x + width - borderRadius, y + height);
		this.lineTo(x + borderRadius, y + height);
		this.quadraticCurveTo(x, y + height, x, y + height - borderRadius);
		this.lineTo(x, y + borderRadius);
		this.quadraticCurveTo(x, y, x + borderRadius, y);
		this.closePath();
	},
	CanvasRenderingContext2D.prototype.DGraphDashedLineTo = function(a, b, c, d, e) {
		"undefined" == typeof e && (e = 5);
		var f = c - a,
			g = d - b,
			h = Math.floor(Math.sqrt(f * f + g * g)),
			i = 0 >= e ? h : h / e,
			j = g / h * e,
			k = f / h * e;
		this.beginPath();
		for (var l = 0; i > l; l++) l % 2 ? this.lineTo(a + l * k, b + l * j) : this.moveTo(a + l * k, b + l * j);
		this.stroke()
	};

	const DGraph = {
		version: "3.5.0",
		zIndex_Box: 1,
		zIndex_Link: 2,
		zIndex_Node: 3,
		SceneMode: {
			normal: "normal",
			drag: "drag",
			edit: "edit",
			select: "select"
		},
		MouseCursor: {
			normal: "default",
			pointer: "pointer",
			move: "move"
		},
		Element: Element
	};

	!function(DGraph) {
		function MessageBus(a) {
			var b = this;
			this.name = a, 
			this.messageMap = {}, 
			this.messageCount = 0, 
			this.subscribe = function(a, c) {
				var d = b.messageMap[a];
				null == d && (b.messageMap[a] = []), b.messageMap[a].push(c), b.messageCount++
			}, 
			this.unsubscribe = function(a) {
				var c = b.messageMap[a];
				null != c && (b.messageMap[a] = null, delete b.messageMap[a], b.messageCount--)
			}, 
			this.publish = function(a, c, d) {
				var e = b.messageMap[a];
				if (null != e)
					for (var f = 0; f < e.length; f++) d ? ! function(a, b) {
						setTimeout(function() {
							a(b)
						}, 10)
					}(e[f], c) : e[f](c)
			}
		}

		function getDistance(a, b, c, d) {
			var e, f;
			return null == c && null == d ? (e = b.x - a.x, f = b.y - a.y) : (e = c - a, f = d - b), Math.sqrt(e * e + f * f)
		}

		function getElementsBound(a) {
			for (var b = {
					left: Number.MAX_VALUE,
					right: -Number.MAX_VALUE,
					top: Number.MAX_VALUE,
					bottom: -Number.MAX_VALUE
				}, c = 0; c < a.length; c++) 
			{
				var d = a[c];
				if (d instanceof DGraph.Link) {
					continue;
				}
				if (d.visible == true) {
					(b.left > d.x && (b.left = d.x, b.leftNode = d),
						b.right < d.x + d.width && (b.right = d.x + d.width, b.rightNode = d),
						b.top > d.y && (b.top = d.y, b.topNode = d),
						b.bottom < d.y + d.height && (b.bottom = d.y + d.height, b.bottomNode = d))
				}
			}
			return b.width = b.right - b.left, b.height = b.bottom - b.top, b
		}

		function mouseCoords(a) {
			return a = cloneEvent(a), a.pageX || (a.pageX = a.clientX + document.body.scrollLeft - document.body.clientLeft, a.pageY =
				a.clientY + document.body.scrollTop - document.body.clientTop), a
		}

		function getEventPosition(a) {
			return a = mouseCoords(a)
		}

		function cloneEvent(a) {
			var b = {};
			for (var c in a) "returnValue" != c && "keyLocation" != c && (b[c] = a[c]);
			return b
		}

		function clone(a) {
			var b = {};
			for (var c in a) b[c] = a[c];
			return b
		}

		function isPointInRect(a, b) {
			var c = b.x,
				d = b.y,
				e = b.width,
				f = b.height;
			return a.x > c && a.x < c + e && a.y > d && a.y < d + f
		}

		function isPointInLine(a, b, c) {
			var d = DGraph.util.getDistance(b, c),
				e = DGraph.util.getDistance(b, a),
				f = DGraph.util.getDistance(c, a),
				g = Math.abs(e + f - d) <= .5;
			return g
		}

		function removeFromArray(a, b) {
			for (var c = 0; c < a.length; c++) {
				var d = a[c];
				if (d === b) {
					a = a.del(c);
					break
				}
			}
			return a
		}

		function randomColor() {
			return Math.floor(255 * Math.random()) + "," + Math.floor(255 * Math.random()) + "," + Math.floor(255 * Math.random())
		}

		function getProperties(a, b) {
			for (var c = "", d = 0; d < b.length; d++) {
				d > 0 && (c += ",");
				var e = a[b[d]];
				"string" == typeof e ? e = '"' + e + '"' : void 0 == e && (e = null), c += b[d] + ":" + e
			}
			return c
		}

		function getOffsetPosition(a) {
			if (!a) return {
				left: 0,
				top: 0
			};
			var b = 0,
				c = 0;
			if ("getBoundingClientRect" in document.documentElement) var d = a.getBoundingClientRect(),
				e = a.ownerDocument,
				f = e.body,
				g = e.documentElement,
				h = g.clientTop || f.clientTop || 0,
				i = g.clientLeft || f.clientLeft || 0,
				b = d.top + (self.pageYOffset || g && g.scrollTop || f.scrollTop) - h,
				c = d.left + (self.pageXOffset || g && g.scrollLeft || f.scrollLeft) - i;
			else
				do b += a.offsetTop || 0, c += a.offsetLeft || 0, a = a.offsetParent; while (a);
			return {
				left: c,
				top: b
			}
		}

		function lineF(a, b, c, d) {
			function e(a) {
				return a * f + g
			}
			var f = (d - b) / (c - a),
				g = b - a * f;
			return e.k = f, e.b = g, e.x1 = a, e.x2 = c, e.y1 = b, e.y2 = d, e
		}

		function inRange(a, b, c) {
			var d = Math.abs(b - c),
				e = Math.abs(b - a),
				f = Math.abs(c - a),
				g = Math.abs(d - (e + f));
			return 1e-6 > g ? !0 : !1
		}

		function isPointInLineSeg(a, b, c) {
			return inRange(a, c.x1, c.x2) && inRange(b, c.y1, c.y2)
		}

		function intersection(a, b) {
			var c, d;
			return a.k == b.k ? null : (1 / 0 == a.k || a.k == -1 / 0 ? (c = a.x1, d = b(a.x1)) : 1 / 0 == b.k || b.k == -1 / 0 ?
				(c = b.x1, d = a(b.x1)) : (c = (b.b - a.b) / (a.k - b.k), d = a(c)), 0 == isPointInLineSeg(c, d, a) ? null : 0 ==
				isPointInLineSeg(c, d, b) ? null : {
					x: c,
					y: d
				})
		}

		function intersectionLineBound(a, b) {
			var c = DGraph.util.lineF(b.left, b.top, b.left, b.bottom),
				d = DGraph.util.intersection(a, c);
			return null == d && (c = DGraph.util.lineF(b.left, b.top, b.right, b.top), d = DGraph.util.intersection(a, c), null ==
				d && (c = DGraph.util.lineF(b.right, b.top, b.right, b.bottom), d = DGraph.util.intersection(a, c), null == d &&
					(c = DGraph.util.lineF(b.left, b.bottom, b.right, b.bottom), d = DGraph.util.intersection(a, c)))), d
		}

		requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame ||
			window.msRequestAnimationFrame || window.oRequestAnimationFrame || function(a) {
				setTimeout(a, 1000 / 60)
			}, Array.prototype.del = function(a) {
				if ("number" != typeof a) {
					for (var b = 0; b < this.length; b++)
						if (this[b] === a) return this.slice(0, b).concat(this.slice(b + 1, this.length));
					return this
				}
				return 0 > a ? this : this.slice(0, a).concat(this.slice(a + 1, this.length))
			}, [].indexOf || (Array.prototype.indexOf = function(a) {
				for (var b = 0; b < this.length; b++)
					if (this[b] === a) return b;
				return -1
			});

		var canvas = document.createElement("canvas"),
			graphics = canvas.getContext("2d");
		DGraph.util = {
			getDistance: getDistance,
			getEventPosition: getEventPosition,
			mouseCoords: mouseCoords,
			MessageBus: MessageBus,
			isFirefox: navigator.userAgent.indexOf("Firefox") > 0,
			isIE: !(!window.attachEvent || -1 !== navigator.userAgent.indexOf("Opera")),
			isChrome: null != navigator.userAgent.toLowerCase().match(/chrome/),
			clone: clone,
			isPointInRect: isPointInRect,
			isPointInLine: isPointInLine,
			removeFromArray: removeFromArray,
			cloneEvent: cloneEvent,
			randomColor: randomColor,
			getElementsBound: getElementsBound,
			getOffsetPosition: getOffsetPosition,
			lineF: lineF,
			intersection: intersection,
			intersectionLineBound: intersectionLineBound
		};
	}(DGraph),
	function(a) {
		function b(a) {
			return {
				hgap: 2,
				visible: !1,
				exportCanvas: document.createElement("canvas"),
				getImage: function(b, c, type) {
					var d = a.getBound(),
						scaleX = 1,
						scaleY = 1;

					var rectWidth = d.width,
						rectHeight = d.height;
					var paddingX = 0,
						paddingY = 0;
					if (null != b && null != c) {

						if (d.leftNode.elementType == 'node' && d.rightNode.elementType == 'node') {
							paddingX = (d.leftNode.radius * d.leftNode.scaleX + d.rightNode.radius * d.rightNode.scaleX);
							paddingY = (d.topNode.radius * d.topNode.scaleY + d.bottomNode.radius * d.bottomNode.scaleY);
						}

						var realWidth = Math.min(b, rectWidth),
							realHeight = Math.min(c, rectHeight);

						this.exportCanvas.width = realWidth + paddingX,
							this.exportCanvas.height = realHeight + paddingY;

					} else {
						this.exportCanvas.width = Math.max(rectWidth, a.canvas.width);
						this.exportCanvas.height = Math.max(rectHeight, a.canvas.height);
					}

					var g = this.exportCanvas.getContext("2d");
					return a.childs.length > 0 && (
							g.save(),
							g.clearRect(0, 0, this.exportCanvas.width, this.exportCanvas.height),
							a.childs.forEach(function(a) {
								1 == a.visible && (
									a.save(),
									a.translateX = 0,
									a.translateY = 0,
									a.scaleX = 1,
									a.scaleY = 1,
									g.scale(scaleX, scaleY),
									d.left < 0 && (a.translateX = Math.abs(d.left) + paddingX),
									d.top < 0 && (a.translateY = Math.abs(d.top) + paddingY),
									a.repaint(g),
									a.restore())
							}),
							g.restore()),
						this.exportCanvas.toDataURL('image/' + (type || 'png'),1)
				},
				getImageUrlData: function(imageWidth, imageHeight, type) {
					var d = a.getBound();
					if (d.width < 0) {
						return null;
					}

					var rectWidth = d.width,rectHeight = d.height;
					var paddingX = 0,paddingY = 0;
					if (d.leftNode.elementType == 'node' && d.rightNode.elementType == 'node') {
						paddingX = (d.leftNode.radius * d.leftNode.scaleX + d.rightNode.radius * d.rightNode.scaleX);
						paddingY = (d.topNode.radius * d.topNode.scaleY + d.bottomNode.radius * d.bottomNode.scaleY);
					}

					rectWidth += paddingX;
					rectHeight += paddingY;

					this.width = this.exportCanvas.width = Math.min(imageWidth||10000, rectWidth),
					this.height = this.exportCanvas.height = Math.min(imageHeight||10000, rectHeight);
					var scale = Math.min(this.width / rectWidth, this.height / rectHeight);

					if (rectWidth < 500 || rectHeight < 500) {
						var width = Math.max(Math.max(rectWidth, rectHeight), 500);
						this.width = this.exportCanvas.width = width;
						this.height = this.exportCanvas.height = width;
						scale = 1;
					}

					var e = this.exportCanvas.getContext("2d");
					if (a.childs.length > 0) {
						a.childs.forEach(function(sence) {
							1 == sence.visible && (sence.save(), sence.centerAndZoom(scale, scale, e), sence.repaint(e,true), sence.restore())
						});
						var l = null;
						try {
							l = this.exportCanvas.toDataURL('image/' + (type || 'png'),1);
						} catch (m) {}
						return l;
					}
					return null;
				},
				canvas: document.createElement("canvas"),
				update: function() {
					this.eagleImageDatas = this.getData(a);
				},
				setSize: function(a, b) {
					this.width = this.canvas.width = a, this.height = this.canvas.height = b
				},
				getData: function(b, c) {
					function d(a) {
						var b = a.stage.canvas.width,
							c = a.stage.canvas.height,
							d = b / a.scaleX / 2,
							e = c / a.scaleY / 2;
						return {
							translateX: a.translateX + d - d * a.scaleX,
							translateY: a.translateY + e - e * a.scaleY
						}
					}
					null != j && null != k ? this.setSize(b, c) : this.setSize(200, 160);
					var bound = a.getBound();
					if (bound.width < 0) {
						return null;
					}
					var scale = null;
					var scaleX = 200 / bound.width;
					var scaleY = 160 / bound.height;
					scale = Math.min(scaleX, scaleY);
					var e = this.canvas.getContext("2d");
					if (a.childs.length > 0) {
						e.save(),
						e.clearRect(0, 0, this.canvas.width, this.canvas.height),
						a.childs.forEach(function(a) {							
							1 == a.visible && (a.save(), a.centerAndZoom(scale, scale, e),
							a.paintNodes(e),a.restore())
						});

						var f = d(a.childs[0]),
							g = f.translateX * (this.canvas.width / a.canvas.width) * a.childs[0].scaleX,
							h = f.translateY * (this.canvas.height / a.canvas.height) * a.childs[0].scaleY,
							i = a.getBound(),
							j = a.canvas.width / a.childs[0].scaleX / i.width,
							k = a.canvas.height / a.childs[0].scaleY / i.height;
						j > 1 && (j = 1), k > 1 && (j = 1), g *= j, h *= k,
							i.left < 0 && (g -= Math.abs(i.left) * (this.width / i.width)),
							i.top < 0 && (h -= Math.abs(i.top) * (this.height / i.height)),

							e.save(),
							e.lineWidth = 1,
							e.strokeStyle = "rgba(0,250,0,1)",
							e.strokeRect(-g, -h, e.canvas.width * j, e.canvas.height * k),
							e.restore();
						var l = null;
						try {
							l = e.getImageData(0, 0, e.canvas.width, e.canvas.height);
						} catch (m) {}
						return l;
					}
					return null;
				},
				paint: function() {
					if (null != this.eagleImageDatas) {
						var b = a.graphics;
						b.beginPath(),
						b.save(),
						b.fillStyle = "rgba(30,250,30,0.5)",
						b.fillRect(a.canvas.width - this.canvas.width - 2 * this.hgap, a.canvas.height - this.canvas.height - 1, a.canvas
							.width - this.canvas.width, this.canvas.height + 1),
						b.fill(),
						b.restore(),
						b.save(),
						b.lineWidth = 1,
						b.strokeStyle = "rgba(120,120,200,1)",
						b.rect(a.canvas.width - this.canvas.width - 2 * this.hgap, a.canvas.height - this.canvas.height - 1, a.canvas.width -
							this.canvas.width, this.canvas.height + 1),
						b.stroke(),
						b.restore(),
						b.save(),
						b.putImageData(this.eagleImageDatas, a.canvas.width - this.canvas.width - this.hgap, a.canvas.height - this.canvas
							.height),
						b.restore(),
						b.closePath()
					} else {
						this.eagleImageDatas = this.getData(a)
					}
				},
				eventHandler: function(a, b, c) {
					var d = b.x,
						e = b.y;
					if (d > c.canvas.width - this.canvas.width && e > c.canvas.height - this.canvas.height) {
						if (d = b.x - this.canvas.width, e = b.y - this.canvas.height, "mousedown" == a && (this.lastTranslateX = c.childs[
								0].translateX, this.lastTranslateY = c.childs[0].translateY), "mousedrag" == a && c.childs.length > 0) {
							var f = b.dx,
								g = b.dy,
								h = c.getBound(),
								i = this.canvas.width / c.childs[0].scaleX / h.width,
								j = this.canvas.height / c.childs[0].scaleY / h.height;
							c.childs[0].translateX = this.lastTranslateX - f / i, c.childs[0].translateY = this.lastTranslateY - g / j
						}
					};
				}
			}
		};

		function c(container) {
			let c = document.createElement("canvas");
			c.style.position = 'relative';
			c.style.width = '100%';
			c.style.height = '100%';
			container.appendChild(c);

			let ratio = getRatio(c);
			c.width = Math.round(c.clientWidth * ratio);
			c.height = Math.round(c.clientHeight * ratio);

			window.addEventListener("resize", function(event) {
				var nowWidth = Math.round(c.clientWidth * ratio);
				var nowHeight = Math.round(c.clientHeight * ratio);
				if (c.width != nowWidth || c.height != nowHeight) {
					c.width = nowWidth;
					c.height = nowHeight;
				}
				n.paint();
			});

			function d(b) {
				var c = a.util.getEventPosition(b),
					d = a.util.getOffsetPosition(n.canvas);
				return c.offsetLeft = c.pageX - d.left,
					c.offsetTop = c.pageY - d.top,
					c.x = c.offsetLeft * ratio,
					c.y = c.offsetTop * ratio,
					c.target = null,
					c
			}

			function getRatio(canvas) {
				let ctx = canvas.getContext("2d");
				if (ctx === undefined) {
					return;
				}
				var numerator = 1;
				if (typeof window !== 'undefined') {
					numerator = (window.devicePixelRatio || 1);
				}
				var denominator = (ctx.webkitBackingStorePixelRatio ||
					ctx.mozBackingStorePixelRatio ||
					ctx.msBackingStorePixelRatio ||
					ctx.oBackingStorePixelRatio ||
					ctx.backingStorePixelRatio || 1);
				return numerator / denominator;
			}

			function e(a) {
				document.onselectstart = function() {
					return !1
				}, 
				this.mouseOver = !0;
				var b = d(a);
				n.dispatchEventToScenes("mouseover", b), 
				n.dispatchEvent("mouseover", b)
			}

			function f(a) {
				document.onselectstart = function() {
					return !0
				};
				var b = d(a);
				n.dispatchEventToScenes("mouseout", b), 
				n.dispatchEvent("mouseout", b), 
				n.needRepaint = 0 == n.animate ? !1 : !0
			}

			function g(a) {
				var b = d(a);
				n.mouseDown = !0, 
				n.mouseDownX = b.x, 
				n.mouseDownY = b.y, 
				n.dispatchEventToScenes("mousedown",b), 
				n.dispatchEvent("mousedown", b)
			}

			function h(a) {
				var b = d(a);
				n.dispatchEventToScenes("mouseup", b), 
				n.dispatchEvent("mouseup", b), 
				n.mouseDown = !1, 
				n.needRepaint = 0 == n.animate ?!1:!0
			}

			function i(a) {
				var b = d(a);
				n.mouseDown ? 0 == a.button && (b.dx = b.x - n.mouseDownX, b.dy = b.y - n.mouseDownY, n.dispatchEventToScenes(
					"mousedrag", b), n.dispatchEvent("mousedrag", b), 1 == n.thumbnail.visible && n.thumbnail.update()) : (n.dispatchEventToScenes(
					"mousemove", b), n.dispatchEvent("mousemove", b))
			}

			function j(a) {
				var b = d(a);
				n.dispatchEventToScenes("click", b), 
				n.dispatchEvent("click", b)
			}

			function k(a) {
				var b = d(a);
				n.dispatchEventToScenes("dbclick", b), 
				n.dispatchEvent("dbclick", b)
			}

			function l(a) {
				var b = d(a);
				n.dispatchEventToScenes("mousewheel", b), 
				n.dispatchEvent("mousewheel", b), 
				null != n.wheelZoom && (a.preventDefault ?
					a.preventDefault() : (a = a || window.event, a.returnValue = !1), 
					1 == n.thumbnail.visible && n.thumbnail.update()
				)
			}

			function m(b) {
				a.util.isIE || !window.addEventListener ? (
					b.onmouseout = f, b.onmouseover = e, b.onmousedown = g, b.onmouseup = h,
					b.onmousemove = i, b.onclick = j, b.ondblclick = k, b.onmousewheel = l, 
					b.touchstart = g, b.touchmove = i, 
					b.touchend =h) : (
					b.addEventListener("mouseout", f), 
					b.addEventListener("mouseover", e), 
					b.addEventListener("mousedown", g),
					b.addEventListener("mouseup", h), 
					b.addEventListener("mousemove", i), 
					b.addEventListener("click", j), 
					b.addEventListener("dblclick", k), 
					a.util.isFirefox ? b.addEventListener("DOMMouseScroll", l) : b.addEventListener("mousewheel", l)
				), 
				window.addEventListener && (window.addEventListener("keydown", function(b) {
					n.dispatchEventToScenes("keydown", a.util.cloneEvent(b));
					var c = b.keyCode;
					(37 == c || 38 == c || 39 == c || 40 == c) && 
					(b.preventDefault ? b.preventDefault() : (b = b || window.event,b.returnValue = !1))
				}, !0), 
				window.addEventListener("keyup", function(b) {
					n.dispatchEventToScenes("keyup", a.util.cloneEvent(b));
					var c = b.keyCode;
					(37 == c || 38 == c || 39 == c || 40 == c) && (b.preventDefault ? b.preventDefault() : (b = b || window.event,b.returnValue = !1))
				}, !0))
			}
			
			var n = this;
			a.stage = this;
			this.initialize = function(c) {
				m(c), 
				this.canvas = c,
				this.graphics = c.getContext("2d"),
				this.childs = [],
				this.fps = -100,
				this.messageBus = new a.util.MessageBus,
				this.thumbnail = b(this),
				this.wheelZoom = null,
				this.mouseDownX = 0,
				this.mouseDownY = 0,
				this.mouseDown = !1,
				this.mouseOver = !1,
				this.needRepaint = !0,
				this.serializedProperties = ["fps", "wheelZoom"],
				this.pixelRatio = getRatio(c);
			},
			null != c && this.initialize(c);
			var o = !0,p = null;
			document.oncontextmenu = function() {
				return o
			},
			this.dispatchEventToScenes = function(a, b) {
				if (0 != this.fps && (this.needRepaint = !0), 1 == this.thumbnail.visible && -1 != a.indexOf("mouse")) {
					var c = b.x,
						d = b.y;
					if (c > this.width - this.thumbnail.width && d > this.height - this.thumbnail.height) return void this.thumbnail.eventHandler(
						a, b, this)
				}
				this.childs.forEach(function(c) {
					if (1 == c.visible) {
						var d = c[a + "Handler"];
						if (null == d) throw new Error("Function not found:" + a + "Handler");
						d.call(c, b)
					}
				})
			}, this.add = function(a) {
				for (var b = 0; b < this.childs.length; b++)
					if (this.childs[b] === a) return;
				a.addTo(this), this.childs.push(a)
			}, this.remove = function(a) {
				if (null == a) throw new Error("Stage.remove error! params is null!");
				for (var b = 0; b < this.childs.length; b++)
					if (this.childs[b] === a) return a.stage = null, this.childs = this.childs.del(b), this;
				return this
			}, this.clear = function() {
				this.childs = []
			}, this.addEventListener = function(a, b) {
				var c = this,
					d = function(a) {
						b.call(c, a)
					};
				return this.messageBus.subscribe(a, d), this
			}, this.removeEventListener = function(a) {
				this.messageBus.unsubscribe(a)
			}, this.removeAllEventListener = function() {
				this.messageBus = new a.util.MessageBus
			}, this.dispatchEvent = function(a, b) {
				return this.messageBus.publish(a, b), this
			};
			var q ="click,dbclick,mousedown,mouseup,mouseover,mouseout,mousemove,mousedrag,mousewheel,touchstart,touchmove,touchend,keydown,keyup".split(","),
				r = this;
			q.forEach(function(a) {
				r[a] = function(b) {
					null != b ? this.addEventListener(a, b) : this.dispatchEvent(a)
				}
			}),
			this.saveAsLocalImage = function(width, height, type) {
				type = type?type:'png';
				var c = this.thumbnail.getImageUrlData(width, height, type||'png');
				if (c != null) {
					download(c);
					this;
				}

				function download(imgdata) {
					var fixtype = function(type) {
						type = type.toLowerCase().replace(/jpg/i, 'jpeg');
						var r = type.match(/png|jpeg|bmp|gif/)[0];
						return 'image' + r;
					};
					imgdata = imgdata.replace(fixtype(type), 'image/octet-stream');

					var saveFile = function(data, filename) {
						var link = document.createElement('a');
						link.href = data;
						link.download = filename;

						var event = document.createEvent('MouseEvents');
						event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
						link.dispatchEvent(event);
					};
					var filename = 'GraphVis_'+new Date().getTime()+'.'+type;
					saveFile(imgdata, filename);
				};
			},

			this.paint = function() {
				null != this.canvas && (
				this.graphics.save(), 
				this.graphics.clearRect(0, 0, this.width, this.height), 
				this.childs.forEach(function(a) {
					1 == a.visible && a.repaint(n.graphics)
				}), 
				1 == this.thumbnail.visible && this.thumbnail.paint(this), 
				this.graphics.restore())
			},
			this.repaint = function() {
				0 != this.fps && (this.fps < 0 && 0 == this.needRepaint || (this.paint(), this.fps < 0 && (this.needRepaint = !
					1)))
			},
			this.zoom = function(a) {
				this.childs.forEach(function(b) {
					0 != b.visible && b.zoom(a)
				})
			}, this.zoomOut = function(a) {
				this.childs.forEach(function(b) {
					0 != b.visible && b.zoomOut(a)
				})
			}, this.zoomIn = function(a) {
				this.childs.forEach(function(b) {
					0 != b.visible && b.zoomIn(a)
				})
			}, this.centerAndZoom = function() {
				this.childs.forEach(function(a) {
					0 != a.visible && a.centerAndZoom()
				})
			}, this.setCenter = function(a, b) {
				var c = this;
				this.childs.forEach(function(d) {
					var e = a - c.canvas.width / 2,
						f = b - c.canvas.height / 2;
					d.translateX = -e, d.translateY = -f
				})
			}, 
			this.getBound = function() {
				var a = {
					left: Number.MAX_VALUE,
					right: Number.MIN_VALUE,
					top: Number.MAX_VALUE,
					bottom: Number.MIN_VALUE
				};
				if(this.childs.length == 0){
					return null;
				}
				return this.childs.forEach(function(b) {
					var c = b.getElementsBound();
					c.left < a.left && (a.left = c.left, a.leftNode = c.leftNode),
						c.top < a.top && (a.top = c.top, a.topNode = c.topNode),
						c.right > a.right && (a.right = c.right, a.rightNode = c.rightNode),
						c.bottom > a.bottom && (a.bottom = c.bottom, a.bottomNode = c.bottomNode)
				}),
				a.width = a.right - a.left,
				a.height = a.bottom - a.top,
				a
			},
			function() {
				0 == n.fps ? setTimeout(arguments.callee, 100) : n.fps < 0 ? (n.repaint(), setTimeout(arguments.callee, 1e3 /
					-n.fps)) : (n.repaint(), setTimeout(arguments.callee, 1000 / n.fps))
			}(), 
			setTimeout(function() {
				n.mousewheel(function(a) {
					var b = null == a.wheelDelta ? a.detail : a.wheelDelta;
					null != this.wheelZoom && (b > 0 ? this.zoomOut(this.wheelZoom) : this.zoomIn(this.wheelZoom))
				}),
				n.paint()
			}, 300), 
			setTimeout(function() {
				n.paint()
			}, 3000)
		}

		c.prototype = {
			get width() {
				return this.canvas.width
			},
			get height() {
				return this.canvas.height
			},
			set mode(a) {
				this.childs.forEach(function(b) {
					b.mode = a
				})
			}
		}, a.Stage = c
	}(DGraph),
	function(a) {
		function b(c) {
			var e = this;
			this.initialize = function() {
				b.prototype.initialize.apply(this, arguments),
				this.messageBus = new a.util.MessageBus,
				this.elementType = "scene",
				this.childs = [],
				this.zIndexMap = {},
				this.zIndexArray = [],
				this.backgroundColor = "255,255,255",
				this.visible = !0,
				this.alpha = 0,
				this.scaleX = 1,
				this.scaleY = 1,
				this.mode = a.SceneMode.normal,
				this.translate = !0,
				this.translateX = 0,
				this.translateY = 0,
				this.lastTranslateX = 0,
				this.lastTranslateY = 0,
				this.mouseDown = !1,
				this.mouseDownX = null,
				this.mouseDownY = null,
				this.mouseDownEvent = null,
				this.areaSelect = !0,
				this.operations = [],
				this.selectedElements = [],
				this.paintAll = !1;
				var c ="background,backgroundColor,mode,paintAll,areaSelect,translate,translateX,translateY,lastTranslatedX,lastTranslatedY,alpha,visible,scaleX,scaleY".split(",");
				this.serializedProperties = this.serializedProperties.concat(c)
			},
			this.initialize(),
			this.scene = function(a) {
				this.background = a
			},
			this.addTo = function(a) {
				this.stage !== a && null != a && (this.stage = a)
			}, null != c && (c.add(this), this.addTo(c)), this.show = function() {
				this.visible = !0
			}, this.hide = function() {
				this.visible = !1
			},
			this.paint = function(a,allPaint) {
				if (0 != this.visible && null != this.stage) {
					if (a.save(), this.paintBackgroud(a), a.restore(), a.save(), a.scale(this.scaleX, this.scaleY), 1 == this.translate) {
						var b = this.getOffsetTranslate(a);
						a.translate(b.translateX, b.translateY)
					}						
					if(allPaint){
						this.paintAllChilds(a);
					}else{
						this.paintChilds(a);
					}
					a.restore(),
					a.save(),
					this.paintOperations(a, this.operations),
					a.restore()
				}
			}, 
			this.repaint = function(a,allPaint) {
				0 != this.visible && this.paint(a,allPaint)
			}, 
			this.paintBackgroud = function(a) {
				null != this.background ? a.drawImage(this.background, 0, 0, a.canvas.width, a.canvas.height) :
				(a.beginPath(), 
				a.fillStyle = "rgba(" + this.backgroundColor+","+this.alpha+")",
				a.fillRect(0, 0, a.canvas.width, a.canvas.height), 
				a.closePath())
			}, 
			this.getDisplayedElements = function() {
				for (var a = [], b = 0; b < this.zIndexArray.length; b++)
					for (var c = this.zIndexArray[b], d = this.zIndexMap[c], e = 0; e < d.length; e++) {
						var f = d[e];
						this.isVisiable(f) && a.push(f)
					}
				return a
			}, 
			this.getDisplayedNodes = function() {
				for (var b = [], c = 0; c < this.childs.length; c++) {
					var d = this.childs[c];
					d instanceof a.Node && this.isVisiable(d) && b.push(d)
				}
				return b
			},
			this.paintChilds = function(b) {
				let needHideLink = this.scaleX < 0.1?true:false;
				var displayElements = this.getDisplayedElements();					
				let nodeArr=[],edgeArr=[],boxArr=[];					
				for(let i=displayElements.length-1;i>=0;i--){
					var el = displayElements[i];
					if(el instanceof a.Node){
						nodeArr.push(el);
					}else if(el instanceof a.Box){
						boxArr.push(el);
					}else if(el instanceof a.Edge){
						if(needHideLink){
							continue;
						}
						if(nodeArr.indexOf(el.source) != -1 || nodeArr.indexOf(el.target) != -1){
							edgeArr.push(el);
						}
					}
				}					
				let needPaintElemets= boxArr.concat(edgeArr).concat(nodeArr);
				let needHideText = this.scaleX < 0.3?true:false;
				
				needPaintElemets.forEach(function(g){
					if (g.visible == 1) {
						if (b.save(), 1 == g.transformAble) {
							var h = g.getCenterLocation();
							b.translate(h.x, h.y), g.rotate && b.rotate(g.rotate), g.scaleX && g.scaleY ? b.scale(g.scaleX, g.scaleY) : g
								.scaleX ? b.scale(g.scaleX, 1) : g.scaleY && b.scale(1, g.scaleY)
						}
						g instanceof a.InteractiveElement &&
							(g.selected && 1 == g.showSelected && g.paintSelected(b), 1 == g.isMouseOver && g.paintMouseover(b)),
							g.paint(b,needHideText),
							b.restore()
					}
				});
			},
			this.paintAllChilds = function(b) {
				for (var c = 0; c < this.zIndexArray.length; c++)
					for (var d = this.zIndexArray[c], e = this.zIndexMap[d], f = 0; f < e.length; f++) {
						var g = e[f];
			
						if (g.visible == 1) {
							if (b.save(), 1 == g.transformAble) {
								var h = g.getCenterLocation();
								b.translate(h.x, h.y), g.rotate && b.rotate(g.rotate), g.scaleX && g.scaleY ? b.scale(g.scaleX, g.scaleY) : g
									.scaleX ? b.scale(g.scaleX, 1) : g.scaleY && b.scale(1, g.scaleY)
							}
							g instanceof a.InteractiveElement &&
								(g.selected && 1 == g.showSelected && g.paintSelected(b), 1 == g.isMouseOver && g.paintMouseover(b)),
								g.paint(b),
								b.restore()
						}
					}
			},
			this.paintNodes = function(ctx) {
				ctx.save(), 
				ctx.scale(this.scaleX, this.scaleY);
				if(1 == this.translate){
					var b = this.getOffsetTranslate(ctx);
					ctx.translate(b.translateX, b.translateY);
				}
				var childNodes = this.childs.filter(function(child){
					return child instanceof a.Node;
				});	
				childNodes.forEach(function(g){
					if (g.visible == 1) {
						if (ctx.save(), 1 == g.transformAble) {
							var h = g.getCenterLocation();
							ctx.translate(h.x, h.y), g.rotate && ctx.rotate(g.rotate), g.scaleX && g.scaleY ? ctx.scale(g.scaleX, g.scaleY) : g
								.scaleX ? ctx.scale(g.scaleX, 1) : g.scaleY && b.scale(1, g.scaleY)
						}							
						g.paint(ctx,true),
						ctx.restore()
					}
				});
				ctx.restore()
			},
			this.getOffsetTranslate = function(a) {
				var b = this.stage.canvas.width,
					c = this.stage.canvas.height;
				null != a && "move" != a && (b = a.canvas.width, c = a.canvas.height);
				var d = b / this.scaleX / 2,
					e = c / this.scaleY / 2,
					f = {
						translateX: this.translateX + (d - d * this.scaleX),
						translateY: this.translateY + (e - e * this.scaleY)
					};
				return f
			}, this.isVisiable = function(b) {
				if (1 != b.visible) return !1;
				if (b instanceof a.Link) return !0;
				var c = this.getOffsetTranslate(),
					d = b.x + c.translateX,
					e = b.y + c.translateY;
				d *= this.scaleX, e *= this.scaleY;
				var f = d + b.width * this.scaleX,
					g = e + b.height * this.scaleY;
				return d > this.stage.canvas.width || e > this.stage.canvas.height || 0 > f || 0 > g ? !1 : !0
			}, this.paintOperations = function(a, b) {
				for (var c = 0; c < b.length; c++) b[c](a)
			}, this.findElements = function(a) {
				for (var b = [], c = 0; c < this.childs.length; c++) 1 == a(this.childs[c]) && b.push(this.childs[c]);
				return b
			}, this.getElementsByClass = function(a) {
				return this.findElements(function(b) {
					return b instanceof a
				})
			}, this.addOperation = function(a) {
				return this.operations.push(a), this
			}, this.clearOperations = function() {
				return this.operations = [], this
			}, this.getElementByXY = function(b, c) {
				for (var d = null, e = this.zIndexArray.length - 1; e >= 0; e--)
					for (var f = this.zIndexArray[e], g = this.zIndexMap[f], h = g.length - 1; h >= 0; h--) {
						var i = g[h];
						if (i instanceof a.InteractiveElement && this.isVisiable(i) && i.isInBound(b, c)) return d = i
					}
				return d
			}, this.add = function(a) {
				this.childs.push(a), null == this.zIndexMap[a.zIndex] && (this.zIndexMap[a.zIndex] = [], this.zIndexArray.push(a.zIndex),
					this.zIndexArray.sort(function(a, b) {
						return a - b
					})), 
					this.zIndexMap["" + a.zIndex].push(a)
			}, this.remove = function(b) {
				this.childs = a.util.removeFromArray(this.childs, b);
				var c = this.zIndexMap[b.zIndex];
				c && (this.zIndexMap[b.zIndex] = a.util.removeFromArray(c, b)), b.removeHandler(this)
			}, this.clear = function() {
				var a = this;
				this.childs.forEach(function(b) {
					b.removeHandler(a)
				}), this.childs = [], this.operations = [], this.zIndexArray = [], this.zIndexMap = {}
			}, this.addToSelected = function(a) {
				this.selectedElements.push(a)
			}, this.cancleAllSelected = function(a) {
				for (var b = 0; b < this.selectedElements.length; b++) this.selectedElements[b].unselectedHandler(a);
				this.selectedElements = []
			}, this.notInSelectedNodes = function(a) {
				for (var b = 0; b < this.selectedElements.length; b++)
					if (a === this.selectedElements[b]) return !1;
				return !0
			}, this.removeFromSelected = function(a) {
				for (var b = 0; b < this.selectedElements.length; b++) {
					var c = this.selectedElements[b];
					a === c && (this.selectedElements = this.selectedElements.del(b))
				}
			}, this.toSceneEvent = function(b) {
				var c = a.util.clone(b);
				if (c.x /= this.scaleX, c.y /= this.scaleY, 1 == this.translate) {
					var d = this.getOffsetTranslate();
					c.x -= d.translateX, c.y -= d.translateY
				}
				return null != c.dx && (c.dx /= this.scaleX, c.dy /= this.scaleY), null != this.currentElement && (c.target =
					this.currentElement), c.scene = this, c
			}, this.selectElement = function(a) {
				var b = e.getElementByXY(a.x, a.y);
				if (null != b)
					if (a.target = b, b.mousedownHander(a), b.selectedHandler(a), e.notInSelectedNodes(b)) a.ctrlKey || e.cancleAllSelected(),
						e.addToSelected(b);
					else {
						1 == a.ctrlKey && (b.unselectedHandler(), this.removeFromSelected(b));
						for (var c = 0; c < this.selectedElements.length; c++) {
							var d = this.selectedElements[c];
							d.selectedHandler(a)
						}
					}
				else a.ctrlKey || e.cancleAllSelected();
				this.currentElement = b
			}, this.mousedownHandler = function(b) {
				var c = this.toSceneEvent(b);
				if (this.mouseDown = !0, this.mouseDownX = c.x, this.mouseDownY = c.y, this.mouseDownEvent = c, this.mode == a.SceneMode
					.normal)
					this.selectElement(c),
					(null == this.currentElement || this.currentElement instanceof a.Link) && 1 == this.translate && (this.lastTranslateX =
						this.translateX, this.lastTranslateY = this.translateY);
				else {
					if (this.mode == a.SceneMode.drag && 1 == this.translate) return this.lastTranslateX = this.translateX, void(
						this.lastTranslateY = this.translateY);
					this.mode == a.SceneMode.select ? this.selectElement(c) :
						this.mode == a.SceneMode.edit && (this.selectElement(c),
							(null == this.currentElement || this.currentElement instanceof a.Link) && 1 == this.translate && (this.lastTranslateX =
								this.translateX, this.lastTranslateY = this.translateY))
				}
				e.dispatchEvent("mousedown", c)
			}, this.mouseupHandler = function(b) {
				this.stage.cursor != a.MouseCursor.normal && (this.stage.cursor = a.MouseCursor.normal), e.clearOperations();
				var c = this.toSceneEvent(b);
				null != this.currentElement && (
					c.target = e.currentElement,
					this.currentElement.mouseupHandler(c)
				);
				this.dispatchEvent("mouseup", c),
				this.mouseDown = !1
			}, this.dragElements = function(b) {
				if (null != this.currentElement && 1 == this.currentElement.dragable)
					for (var c = 0; c < this.selectedElements.length; c++) {
						var d = this.selectedElements[c];
						if (0 != d.dragable) {
							var e = a.util.clone(b);
							e.target = d, d.mousedragHandler(e)
						}
					}
			},
			this.mousedragHandler = function(b) {
				var c = this.toSceneEvent(b);
				this.mode == a.SceneMode.normal ? null == this.currentElement || this.currentElement instanceof a.Link ?
					1 == this.translate && (this.translateX = this.lastTranslateX + c
						.dx, this.translateY = this.lastTranslateY + c.dy) :
					this.dragElements(c) : this.mode == a.SceneMode.drag ? 1 == this.translate && (this.translateX = this.lastTranslateX +
						c.dx, this.translateY = this.lastTranslateY + c.dy) :
					this.mode == a.SceneMode.select ? null != this.currentElement ? 1 == this.currentElement.dragable && this.dragElements(
						c) : 1 == this.areaSelect && this.areaSelectHandle(c) : this.mode == a.SceneMode.edit &&
					(null == this.currentElement || this.currentElement instanceof a.Link ? 1 == this.translate && (this.translateX =
							this.lastTranslateX + c.dx, this.translateY = this.lastTranslateY +
							c.dy) :
						this.dragElements(c)), this.dispatchEvent("mousedrag", c)
			},
			this.areaSelectHandle = function(a) {
				var b = a.offsetLeft,
					c = a.offsetTop,
					f = this.mouseDownEvent.offsetLeft,
					g = this.mouseDownEvent.offsetTop,
					h = b >= f ? f : b,
					i = c >= g ? g : c,
					j = Math.abs(a.dx) * this.scaleX,
					k = Math.abs(a.dy) * this.scaleY,
					l = new d(h * this.stage.pixelRatio, i * this.stage.pixelRatio, j, k);
					e.clearOperations().addOperation(l),
					b = a.x, c = a.y,
					f = this.mouseDownEvent.x,
					g = this.mouseDownEvent.y,
					h = b >= f ? f : b,
					i = c >= g ? g : c,
					j = Math.abs(a.dx),
					k = Math.abs(a.dy);
				for (var m = h + j, n = i + k, o = 0; o < e.childs.length; o++) {
					var p = e.childs[o];
					if (p.elementType == 'link') {
						continue;
					}
					p.x > h && p.x + p.width < m && 
					p.y > i && p.y + p.height < n && 
					e.notInSelectedNodes(p) && 
					(p.selectedHandler(a),e.addToSelected(p))
				}

				function d(a, b, c, d) {
					return function(e) {
						e.beginPath(),
						e.strokeStyle = "rgba(0,225,0,0.8)",
						e.fillStyle = "rgba(0,225,0,0.1)",
						e.rect(a, b, c, d),
						e.fill(),
						e.stroke(),
						e.closePath()
					}
				};
			}, this.mousemoveHandler = function(b) {
				this.mousecoord = {x: b.x,y: b.y};
				var c = this.toSceneEvent(b);
				if (this.mode == a.SceneMode.drag) return void(this.stage.cursor = null);
				this.mode == a.SceneMode.normal ? this.stage.cursor = a.MouseCursor.normal : this.mode == a.SceneMode.select && (
					this.stage.cursor = a.MouseCursor.normal);
				var d = e.getElementByXY(c.x, c.y);
				null != d ? (e.mouseOverelement && e.mouseOverelement !== d && (c.target = d, e.mouseOverelement.mouseoutHandler(
						c)), e.mouseOverelement = d, 0 == d.isMouseOver ? (c.target = d, d.mouseoverHandler(c), e.dispatchEvent(
						"mouseover", c)) : (c.target = d, d.mousemoveHandler(c), e.dispatchEvent("mousemove", c))) : e.mouseOverelement ?
					(c.target = d, e.mouseOverelement.mouseoutHandler(c), e.mouseOverelement = null, e.dispatchEvent("mouseout", c)) :
					(c.target = null, e.dispatchEvent("mousemove", c))
			}, this.mouseoverHandler = function(a) {
				var b = this.toSceneEvent(a);
				this.dispatchEvent("mouseover", b)
			}, this.mouseoutHandler = function(a) {
				var b = this.toSceneEvent(a);
				this.dispatchEvent("mouseout", b)
			}, this.clickHandler = function(a) {
				var b = this.toSceneEvent(a);
				this.currentElement && (b.target = this.currentElement, this.currentElement.clickHandler(b)), this.dispatchEvent(
					"click", b)
			}, this.dbclickHandler = function(a) {
				var b = this.toSceneEvent(a);
				this.currentElement ? (b.target = this.currentElement, this.currentElement.dbclickHandler(b)) : e.cancleAllSelected(),
					this.dispatchEvent("dbclick", b)
			}, this.mousewheelHandler = function(a) {
				var b = this.toSceneEvent(a);
				this.dispatchEvent("mousewheel", b)
			}, this.touchstart = this.mousedownHander, this.touchmove = this.mousedragHandler, this.touchend = this.mousedownHander,
			this.keydownHandler = function(a) {
				this.dispatchEvent("keydown", a)
			}, this.keyupHandler = function(a) {
				this.dispatchEvent("keyup", a)
			}, this.addEventListener = function(a, b) {
				var c = this,
					d = function(a) {
						b.call(c, a)
					};
				return this.messageBus.subscribe(a, d), this
			}, this.removeEventListener = function(a) {
				this.messageBus.unsubscribe(a)
			}, this.removeAllEventListener = function() {
				this.messageBus = new a.util.MessageBus
			}, this.dispatchEvent = function(a, b) {
				return this.messageBus.publish(a, b), this
			};
			var f ="click,dbclick,mousedown,mouseup,mouseover,mouseout,mousemove,mousedrag,mousewheel,touchstart,touchmove,touchend,keydown,keyup".split(","),
				g = this;
			return f.forEach(function(a) {
				g[a] = function(b) {
					null != b ? this.addEventListener(a, b) : this.dispatchEvent(a)
				}
			}), this.zoom = function(a, b) {
				null != a && 0 != a && (this.scaleX = a), null != b && 0 != b && (this.scaleY = b)
			}, this.zoomOut = function(a) {
				0 != a && (null == a && (a = .8), this.scaleX /= a, this.scaleY /= a)
			}, this.zoomIn = function(a) {
				0 != a && (null == a && (a = .8), this.scaleX *= a, this.scaleY *= a)
			}, this.getBound = function() {
				return {
					left: 0,
					top: 0,
					right: this.stage.canvas.width,
					bottom: this.stage.canvas.height,
					width: this.stage.canvas.width,
					height: this.stage.canvas.height
				}
			}, 
			this.getElementsBound = function() {
				if(this.childs.length == 0){
					return null;
				}
				return a.util.getElementsBound(this.childs)
			}, 
			this.translateToCenter = function(a) {
				var b = this.getElementsBound();
				if(b != null){
					var c = this.stage.canvas.width / 2 - (b.left + b.right) / 2,
						d = this.stage.canvas.height / 2 - (b.top + b.bottom) / 2;
					a && (c = a.canvas.width / 2 - (b.left + b.right) / 2,
						d = a.canvas.height / 2 - (b.top + b.bottom) / 2),
						this.translateX = c, 
						this.translateY = d;
				}
			}, 
			this.setCenter = function(a, b) {
				var c = a - this.stage.canvas.width / 2,
					d = b - this.stage.canvas.height / 2;
				this.translateX = -c, this.translateY = -d;
			}, 
			this.centerAndZoom = function(a, b, c) {
				if (this.translateToCenter(c), null == a || null == b) {
					var d = this.getElementsBound();
					if(d != null){
						var e = (d.right + d.rightNode.radius*d.rightNode.scaleX)-(d.left-d.leftNode.radius*d.leftNode.scaleX)+40;
						var f = (d.bottom + d.bottomNode.radius * d.bottomNode.scaleX)-(d.top-d.topNode.radius*d.topNode.scaleX)+15;
						var g = this.stage.canvas.width / e,
							h = this.stage.canvas.height / f;
						c && (g = c.canvas.width / e, h = c.canvas.height / f);
						var i = Math.min(g, h);
						if (i > 1) return;
						this.zoom(i, i)
					}
				} else {
					this.zoom(a, b)
				}
			}, 
			this.getCenterLocation = function() {
				return {
					x: e.stage.canvas.width / 2,
					y: e.stage.canvas.height / 2
				}
			}, 
			this.doLayout = function(a) {
				a && a(this, this.childs)
			}, e
		};
		b.prototype = new a.Element;
		var c = {};
		Object.defineProperties(b.prototype, {
				background: {
					get: function() {
						return this._background
					},
					set: function(a) {
						if ("string" == typeof a) {
							var b = c[a];
							null == b && (b = new Image, b.src = a, b.onload = function() {
								c[a] = b
							}), this._background = b
						} else this._background = a
					}
				}
			}),
			a.Scene = b
	}(DGraph),
	function(a) {
		function b() {
			this.initialize = function() {
				b.prototype.initialize.apply(this, arguments),
				this.elementType = "displayElement",
				this.x = 0, 
				this.y = 0, 
				this.width = 32, 
				this.height = 32,
				this.visible = !0,
				this.alpha = 1,
				this.rotate = 0,
				this.scaleX = 1, this.scaleY = 1,
				this.strokeColor = "22,255,22",
				this.borderColor = "22,255,22",
				this.fillColor = "22,255,22",
				this.shadow = !1, this.shadowBlur = 5,
				this.shadowColor = "rgba(20,200,20,0.5)",
				this.shadowOffsetX = 3,
				this.shadowOffsetY = 6,
				this.transformAble = !1,
				this.zIndex = 0;
				var a = "x,y,width,height,visible,alpha,rotate,scaleX,scaleY,strokeColor,fillColor,shadow,shadowColor,shadowOffsetX,shadowOffsetY,transformAble,zIndex".split(",");
				this.serializedProperties = this.serializedProperties.concat(a)
			},
			this.initialize(),
			this.paint = function(a) {
				a.beginPath(),
				a.fillStyle = "rgba(" + this.fillColor + "," + this.alpha + ")",
				a.rect(-this.width / 2, -this.height / 2, this.width, this.height),
				a.fill(),
				a.stroke(),
				a.closePath()
			}, 
			this.getLocation = function() {
				return {
					x: this.x,
					y: this.y
				}
			}, 
			this.setLocation = function(a, b) {
				return this.x = a, this.y = b, this
			}, 
			this.getCenterLocation = function() {
				return {
					x: this.x + this.width / 2,
					y: this.y + this.height / 2
				}
			}, 
			this.setCenterLocation = function(a, b) {
				return this.x = a - this.width / 2, this.y = b - this.height / 2, this
			}, 
			this.getSize = function() {
				return {
					width: this.width,
					height: this.heith
				}
			}, 
			this.setSize = function(a, b) {
				return this.width = a, this.height = b, this.raduis = this.width / 2, this
			}, 
			this.getBound = function() {
				return {
					left: this.x,
					top: this.y,
					right: this.x + this.width,
					bottom: this.y + this.height,
					width: this.width,
					height: this.height
				}
			}, 
			this.setBound = function(a, b, c, d) {
				return this.setLocation(a, b), this.setSize(c, d), this
			}, 
			this.getDisplayBound = function() {
				return {
					left: this.x,
					top: this.y,
					right: this.x + this.width * this.scaleX,
					bottom: this.y + this.height * this.scaleY
				}
			}, 
			this.getDisplaySize = function() {
				return {
					width: this.width * this.scaleX,
					height: this.height * this.scaleY
				}
			}, 
			this.getPosition = function(textPosition) {
				var b, c = this.getBound();
				switch(textPosition){
					case 'Top_Left':
						b = {x: c.left,y: c.top};
						break;
					case 'Top_Center':
						b = {x: this.cx,y: c.top};
						break;
					case 'Top_Right':
						b = {x: c.right,y: c.top};
						break;
					case 'Middle_Left':
						b = {x: c.left,y: this.cy};
						break;
					case 'Middle_Center':
						b = {x: this.cx,y: this.cy};
						break;
					case 'Middle_Right':
						b = {x: c.right,y: this.cy};
						break;
					case 'Bottom_Left':
						b = {x: c.left,y: c.bottom};
						break;
					case 'Bottom_Center':
						b = {x: this.cx,y: c.bottom};
						break;
					case 'Bottom_Right':
						b = {x: c.right,y: c.bottom};
						break;
					default:
						b = {x: this.cx,y: this.cy};
						break;
				}
				return b
			}
		}

		function c() {
			this.initialize = function() {
					c.prototype.initialize.apply(this, arguments),
						this.elementType = "interactiveElement",
						this.dragable = !1,
						this.selected = !1,
						this.showSelected = 0,
						this.selectedLocation = null,
						this.isMouseOver = !1;
					var a = "dragable,selected,showSelected,isMouseOver".split(",");
					this.serializedProperties = this.serializedProperties.concat(a)
				},
				this.initialize(),
				this.paintSelected = function(a) {
					if (this.showSelected || this.selected) {
						a.save(),
						a.beginPath();
						if (this.image) {
							if (!this.selected) {
								a.lineWidth = this.selectedBorderWidth;
								a.strokeStyle = 'rgba(' + (this.selectedBorderColor) + ',' + (this.alpha * this.selectedBorderAlpha) + ')';
								if (this.shape == 'rect') {
									a.rect(-this.width / 2, -this.height / 2, this.width, this.height);
								} else {
									a.arc(0, 0, this.width / 2, 0, 2 * Math.PI, true);
								}
							}
						} else {
							a.lineWidth = this.selectedBorderWidth;
							a.strokeStyle = 'rgba(' + this.selectedBorderColor + ',' + (this.alpha * this.selectedBorderAlpha) + ')';
							this.paintShape(a);
						}
						a.closePath(),
						a.stroke(),
						a.restore();
					}
				},
				this.paintShape = function(a) {},
				this.paintMouseover = function(a) {
					return this.showSelected = 1, this.paintSelected(a)
				}, this.isInBound = function(a, b) {
					return a > this.x && a < this.x + this.width * Math.abs(this.scaleX) && b > this.y && b < this.y + this.height *
						Math.abs(this.scaleY)
				}, this.selectedHandler = function() {
					this.selected = !0, 
					this.selectedLocation = {
						x: this.x,
						y: this.y
					}
				}, this.unselectedHandler = function() {
					this.selected = !1, this.selectedLocation = null
				}, this.dbclickHandler = function(a) {
					this.dispatchEvent("dbclick", a)
				}, this.clickHandler = function(a) {
					this.dispatchEvent("click", a)
				}, this.mousedownHander = function(a) {
					this.dispatchEvent("mousedown", a)
				}, this.mouseupHandler = function(a) {
					this.dispatchEvent("mouseup", a)
				}, this.mouseoverHandler = function(a) {
					this.isMouseOver = !0, this.dispatchEvent("mouseover", a)
				}, this.mousemoveHandler = function(a) {
					this.dispatchEvent("mousemove", a)
				}, this.mouseoutHandler = function(a) {
					this.isMouseOver = !1, this.showSelected = 0, this.dispatchEvent("mouseout", a)
				}, this.mousedragHandler = function(a) {
					var b = this.selectedLocation.x + a.dx,
						c = this.selectedLocation.y + a.dy;
					this.setLocation(b, c), this.dispatchEvent("mousedrag", a)
				}, this.addEventListener = function(b, c) {
					var d = this,
						e = function(a) {
							c.call(d, a)
						};
					return this.messageBus || (this.messageBus = new a.util.MessageBus), this.messageBus.subscribe(b, e), this
				}, this.dispatchEvent = function(a, b) {
					return this.messageBus ? (this.messageBus.publish(a, b), this) : null
				}, this.removeEventListener = function(a) {
					this.messageBus.unsubscribe(a)
				}, this.removeAllEventListener = function() {
					this.messageBus = new a.util.MessageBus
				};
			var b = "click,dbclick,mousedown,mouseup,mouseover,mouseout,mousemove,mousedrag,touchstart,touchmove,touchend".split(","),
				d = this;
			b.forEach(function(a) {
				d[a] = function(b) {
					null != b ? this.addEventListener(a, b) : this.dispatchEvent(a)
				}
			})
		}

		function d() {
			this.initialize = function() {
				d.prototype.initialize.apply(this, arguments), this.editAble = !1, this.selectedPoint = null
			},
			this.getCtrlPosition = function(a) {
				var b = 5,
					c = 5,
					d = this.getPosition(a);
				return {
					left: d.x - b,
					top: d.y - c,
					right: d.x + b,
					bottom: d.y + c
				}
			},
			this.selectedHandler = function(b) {
				d.prototype.selectedHandler.apply(this, arguments),
					this.selectedSize = {
						width: this.width,
						height: this.height
					},
					b.scene.mode == a.SceneMode.edit && (this.editAble = !0)
			},
			this.unselectedHandler = function() {
				d.prototype.unselectedHandler.apply(this, arguments), this.selectedSize = null, this.editAble = !1
			};
			var b = ["Top_Left", "Top_Center", "Top_Right", "Middle_Left", "Middle_Right", "Bottom_Left", "Bottom_Center","Bottom_Right"];
			this.paintCtrl = function(a) {
				if (0 != this.editAble) {
					a.save();
					for (var c = 0; c < b.length; c++) {
						var d = this.getCtrlPosition(b[c]);
						d.left -= this.cx, d.right -= this.cx, d.top -= this.cy, d.bottom -= this.cy;
						var e = d.right - d.left,f = d.bottom - d.top;
						a.beginPath(), 
						a.strokeStyle = "rgba(0,0,0,0.8)", 
						a.rect(d.left, d.top, e, f), 
						a.stroke(), 
						a.closePath(), 
						a.beginPath(),
						a.strokeStyle = "rgba(255,255,255,0.3)", 
						a.rect(d.left + 1, d.top + 1, e - 2, f - 2), 
						a.stroke(), 
						a.closePath()
					}
					a.restore()
				}
			}, this.isInBound = function(a, c) {
				if (this.selectedPoint = null, 1 == this.editAble)
					for (var e = 0; e < b.length; e++) {
						var f = this.getCtrlPosition(b[e]);
						if (a > f.left && a < f.right && c > f.top && c < f.bottom) return this.selectedPoint = b[e], !0
					}
				return d.prototype.isInBound.apply(this, arguments)
			}, this.mousedragHandler = function(a) {
				if (null == this.selectedPoint) {
					var b = this.selectedLocation.x + a.dx,
						c = this.selectedLocation.y + a.dy;
					this.setLocation(b, c), this.dispatchEvent("mousedrag", a)
				} else {
					if ("Top_Left" == this.selectedPoint) {
						var d = this.selectedSize.width - a.dx,
							e = this.selectedSize.height - a.dy,
							b = this.selectedLocation.x + a.dx,
							c = this.selectedLocation.y + a.dy;
						b < this.x + this.width && (this.x = b, this.width = d), c < this.y + this.height && (this.y = c, this.height =
							e)
					} else if ("Top_Center" == this.selectedPoint) {
						var e = this.selectedSize.height - a.dy,
							c = this.selectedLocation.y + a.dy;
						c < this.y + this.height && (this.y = c, this.height = e)
					} else if ("Top_Right" == this.selectedPoint) {
						var d = this.selectedSize.width + a.dx,
							c = this.selectedLocation.y + a.dy;
						c < this.y + this.height && (this.y = c, this.height = this.selectedSize.height - a.dy), d > 1 && (this.width =
							d)
					} else if ("Middle_Left" == this.selectedPoint) {
						var d = this.selectedSize.width - a.dx,
							b = this.selectedLocation.x + a.dx;
						b < this.x + this.width && (this.x = b), d > 1 && (this.width = d)
					} else if ("Middle_Right" == this.selectedPoint) {
						var d = this.selectedSize.width + a.dx;
						d > 1 && (this.width = d)
					} else if ("Bottom_Left" == this.selectedPoint) {
						var d = this.selectedSize.width - a.dx,
							b = this.selectedLocation.x + a.dx;
						d > 1 && (this.x = b, this.width = d);
						var e = this.selectedSize.height + a.dy;
						e > 1 && (this.height = e)
					} else if ("Bottom_Center" == this.selectedPoint) {
						var e = this.selectedSize.height + a.dy;
						e > 1 && (this.height = e)
					} else if ("Bottom_Right" == this.selectedPoint) {
						var d = this.selectedSize.width + a.dx;
						d > 1 && (this.width = d);
						var e = this.selectedSize.height + a.dy;
						e > 1 && (this.height = e)
					}
					this.dispatchEvent("resize", a)
				}
			}
		}
		b.prototype = new a.Element, 
		Object.defineProperties(b.prototype, {
			cx: {
				get: function() {
					return this.x + this.width / 2
				},
				set: function(a) {
					this.x = a - this.width / 2
				}
			},
			cy: {
				get: function() {
					return this.y + this.height / 2
				},
				set: function(a) {
					this.y = a - this.height / 2
				}
			}
		}), 
		c.prototype = new b, 
		d.prototype = new c, 
		a.DisplayElement = b, 
		a.InteractiveElement = c, 
		a.EditableElement = d
	}(DGraph),
	function(a) {
		function b(c) {
			this.initialize = function(c) {
				b.prototype.initialize.apply(this, arguments),
				this.elementType = "node",
				this.zIndex = a.zIndex_Node,
				this.text = c,
				this.font = "13px Consolas",
				this.fontColor = "20,20,20",
				this.borderWidth = 0,
				this.borderColor = "20,255,20",
				this.selectedBorderColor = '255,0,0';
				this.selectedBorderWidth = 10;
				this.selectedBorderAlpha = 0.7;
				this.borderRadius = 0,
				this.shadowColor = '20,255,20';
				this.dragable = !0,
				this.textPosition = "Middle_Center",
				this.textOffsetX = 0,
				this.textOffsetY = 0,
				this.transformAble = !0,
				this.inLinks = null,
				this.outLinks = null;
				this.radius = 50;
				this.width = 40;
				this.height = 80;
				this.labelBackGround=null,
				this.labelBorderWidth=0,
				this.labelBorderColor='255,255,255';
				this.textLines = [c];
				this.maxLineWidth=0;
				this.icon = {
					font:'bold 20px Consolas',
					text:null,
					color:'255,255,255',
					left:-this.width,
					top:this.height/2
				};
				
				if (this.shape != 'rect') {
					this.width = this.height = this.radius;
				}
				var d = "text,font,fontColor,textPosition,textOffsetX,textOffsetY,borderRadius".split(",");
				this.serializedProperties = this.serializedProperties.concat(d)
			},
			this.initialize(c),
			this.drawNodeImg = function(ctx, img, x, y, r) {
				if (this.shape == 'rect') {
					ctx.drawImage(img, x, y, this.width, this.height);
				} else {
					var d = 2 * r;
					var cx = x + r,cy = y + r;
					ctx.arc(cx, cy, r, 0, 2 * Math.PI);
					ctx.clip();
					ctx.drawImage(img, x, y, d, d);
				}
			},
			this.paint = function(a,onlyShape) {
				if (this.shape != 'rect') {
					this.width = this.height = this.radius;
				}

				if (this.image) {
					this.paintBorder(a);
					var b = a.globalAlpha;
					a.save();
					a.globalAlpha = this.alpha;
					this.drawNodeImg(a, this.image, -this.width / 2, -this.height / 2, this.width / 2);
					a.globalAlpha = b;
					a.restore();
				} else {
					if (this.selected && !onlyShape) {
						this.paintSelected(a);
					}
					a.save();
					a.beginPath();
					this.paintShape(a);
					a.closePath();
					
					if (this.borderWidth > 0 && !onlyShape) {
						if (this.lineDash && this.lineDash.length > 1) {
							a.setLineDash(this.lineDash);
						}
						a.lineWidth = this.borderWidth;
						a.strokeStyle = "rgba(" + this.borderColor + "," + this.alpha + ")";
						a.stroke();
					}
					
					this.paintShadow(a);
					a.fillStyle = "rgba(" + this.fillColor + "," + this.alpha + ")";
					a.fill();
					a.restore();
					
					if(this.icon && this.icon.text){
						this.paintIcon(a);
					}
				}
				
				if(!onlyShape){
					this.paintText(a),
					this.paintCtrl(a),
					this.paintTipText(a);
				}
			},
			this.paintShape = function(a) {
				switch (this.shape) {
					case 'rect':
						if(!this.borderRadius){
							a.rect(-this.width / 2, -this.height / 2, this.width, this.height);
						}else{
							var r2d = Math.PI / 180;
							var r = this.borderRadius;
							var x = -this.width/2,y=-this.height/2;
							if (this.width - ( 2 * r ) < 0) {
							  r = ( this.width / 2 );
							}
							if (this.height - ( 2 * r ) < 0) {
							  r = ( this.height / 2 );
							}
							a.moveTo(x + r, y);
							a.lineTo(x + this.width - r, y);
							a.arc(x + this.width - r, y + r, r, r2d * 270, r2d * 360, false);
							a.lineTo(x + this.width, y + this.height - r);
							a.arc(x + this.width - r, y + this.height - r, r, 0, r2d * 90, false);
							a.lineTo(x + r, y + this.height);
							a.arc(x + r, y + this.height - r, r, r2d * 90, r2d * 180, false);
							a.lineTo(x, y + r);
							a.arc(x + r, y + r, r, r2d * 180, r2d * 270, false);
						}
						break;
					case 'square':
						a.rect(-this.width / 2, -this.height / 2, this.width, this.height);
						break;
					case 'ellipse':
						a.ellipse(0, 0, this.width * 2 / 3, this.width / 2, 0, 0, 2 * Math.PI);
						break;
					case 'triangle':
						a.moveTo(0, -this.width / 2);
						a.lineTo(-this.width / 2, this.width / 2);
						a.lineTo(this.width / 2, this.width / 2);
						break;
					case 'text':
						a.font = this.font;
						a.textAlign = 'center';
						a.textBaseline = 'middle';
						a.fillStyle = "rgba(" + this.fillColor + "," + this.alpha + ")";
						this.processLabel(a);
						var singleTextWidth = a.measureText("田").width;
						var lineCount = this.textLines.length;
						if(lineCount==1){
							a.fillText(this.textLines[0],0,0);
						}else{
							var labelHeight = lineCount*singleTextWidth;
							for (let i = 0; i < lineCount; i++) {
							    a.fillText(this.textLines[i],0,(i*singleTextWidth)+(i==0?0:2*i));
							}
						}
						break;
					case 'star':
						var r = this.width * 0.41;
						for (var n = 0; n < 10; n++) {
						  var radius = (n % 2 === 0) ? r * 1.3 : r * 0.5;
						  a.lineTo(
							radius * Math.sin(n * 2 * Math.PI / 10),
							(0.1 * r) - radius * Math.cos(n * 2 * Math.PI / 10)
						  );
						}
						break;
					case 'polygon':
						var degree = (2 * Math.PI) / 6;
						for (var i = 0; i < 6; i++) {
							var x = Math.cos(i * degree);
							var y = Math.sin(i * degree);
							a.lineTo(x * (this.width / 2), y * (this.width / 2));
						}
						break;
					default:
						a.arc(0, 0, this.width / 2, 0, 2 * Math.PI, true);
						break;
				}
			},

			this.paintTipText = function(a) {
				if (null != this.tipText && "" != this.tipText) {
					var b = this.alarmColor || "0,250,0",
						c = this.alarmAlpha || (0.8 * this.alpha);
					a.beginPath(),
					a.font = this.alarmFont || "10px Consolas";
					var d = a.measureText(this.tipText).width + 6,
						e = a.measureText("田").width + 6,
						f = this.width / 2 - d / 2,
						g = -this.height / 2 - e - 8;
					a.strokeStyle = "rgba(" + b + ", " + c + ")",
					a.fillStyle = "rgba(" + b + ", " + c + ")",
					a.DGraphRoundRect(this.width / 3, -this.height / 2, d + 5, e, 8),
					a.stroke(),
					a.fill(),
					a.beginPath(),
					a.fillStyle = "rgba(250,250,250, " + this.alpha + ")",
					a.fillText(this.tipText, this.width / 3 + 5, -this.height / 2 + 12),
					a.closePath()
				}
			},
			this.paintText = function(a) {
				if (this.shape && this.shape == 'text') {
					return;
				}
				var self = this;
				var label;
				if (this.showlabel && this.showlabel == true) {
					label = this.text = this.label;
				} else {
					label = this.text = null;
					return;
				}

				if (null != label && "" != label) {
					var e;
					a.save();
					a.fillStyle = "rgba(" + this.fontColor + ", " + this.alpha + ")";
					a.font = this.font;
					this.processLabel(a);
					var singleTextWidth = a.measureText("田").width;
					if (this.wrapText == true) {
						var textArr = this.buildTextArray(label);
						var maxWidth = 0;
						textArr.forEach(function(text, i) {
							text = String(text);
							var textWidth = a.measureText(text.replace(/ /g, 'a')).width;
							maxWidth = Math.max(maxWidth, textWidth);
							e = self.getTextPostion(self.textPosition, textWidth, singleTextWidth);
							a.fillText(text, e.x, -((singleTextWidth / 2) * textArr.length) + ((i + 1) * singleTextWidth));
						});
						this.radius = (maxWidth + 8) < this.width ? this.width : (maxWidth + 8);
					} else {
						var lineCount = this.textLines.length;
						var labelHeight = lineCount*singleTextWidth;
						
						if(this.labelBackGround){
							e = this.getTextPostion(this.textPosition, this.maxLineWidth, singleTextWidth);
							a.save();
							a.fillStyle = "rgba("+this.labelBackGround+"," + this.alpha + ")";
							a.fillRect(e.x-3, e.y-singleTextWidth-singleTextWidth/2, this.maxLineWidth+6, labelHeight+singleTextWidth+6);
							a.restore();
						}
						
						if(this.labelBorderWidth > 0){
							a.lineWidth = this.labelBorderWidth;
							a.strokeStyle = "rgba("+this.labelBorderColor+"," + this.alpha + ")";
							a.lineJoin = 'round';
						}
						if(lineCount==1){
							var textWidth = a.measureText(this.textLines[0]).width;
							e = this.getTextPostion(this.textPosition, textWidth, singleTextWidth);
							this.labelBorderWidth > 0?a.strokeText(this.textLines[0], e.x, e.y):null;
							a.fillText(this.textLines[0],e.x,e.y);
						}else{							
							for (let i = 0; i < lineCount; i++) {
								var textWidth = a.measureText(this.textLines[i]).width;
								e = this.getTextPostion(this.textPosition, textWidth, singleTextWidth);
								this.labelBorderWidth > 0?a.strokeText(this.textLines[i],e.x,e.y+(i*singleTextWidth)+(i==0?0:2*i)):null;
								a.fillText(this.textLines[i], e.x,e.y+(i*singleTextWidth)+(i==0?0:2*i));
							}
						}
					}
					a.restore();
				}
			},
			
			this.processLabel = function(ctx) {
			    let lines = [];
			    if (this.label && '' != this.label) {
					lines = String(this.label).split('\n');
					for(let i=0;i<lines.length;i++){
						this.maxLineWidth = Math.max(ctx.measureText(lines[i]).width,this.maxLineWidth);
					}
			    }
			    this.textLines = lines;
			},

			this.buildTextArray = function(label) {
				var length = String(label).length;
				var textArr = [];

				if (length < 5) {
					textArr.push(label);
				} else if (length >= 5 && length <= 9) {
					textArr.push(label.substring(0, 4));
					textArr.push(label.substring(4));
				} else if (length > 9 && length <= 13) {
					textArr.push(label.substring(0, 4));
					textArr.push(label.substring(4, 9));
					textArr.push(label.substring(9));
				} else {
					textArr.push(label.substring(0, 4));
					textArr.push(label.substring(4, 9));
					textArr.push(label.substring(9, 12) + '..');
				}
				return textArr;
			};

			this.paintShadow = function(a) {
				if (this.showShadow && this.selected) {
					a.shadowBlur = 20,
					a.shadowColor = "rgba(" + this.shadowColor + "," + (this.alpha * 0.9) + ")",
					a.shadowOffsetX = 0,
					a.shadowOffsetY = 0;
				}
			},
			
			this.paintIcon = function(a){
				a.save(),
				a.fillStyle = "rgba(" + this.icon.color + ", " + this.alpha + ")";
				a.font = this.icon.font,				
				a.fillText(this.icon.text,this.icon.left||5,this.icon.top||5),
				a.restore();
			},

			this.paintBorder = function(a) {
				a.save(),
				a.beginPath();

				if (this.showShadow && this.selected) {
					this.paintShadow(a);
				}

				var selectedBorder = 0;
				if (this.selected || this.showSelected) {
					selectedBorder = this.selectedBorderWidth;
				}
				if (this.shape == 'rect') {
					a.rect(-this.width / 2, -this.height / 2, this.width, this.height);
				} else {
					a.arc(0, 0, this.width / 2, 0, Math.PI * 2, false);
				}
				a.closePath();

				if (selectedBorder > 0) {
					if (this.selected || this.showSelected) {
						a.lineWidth = this.borderWidth + selectedBorder;
						a.strokeStyle = "rgba(" + this.selectedBorderColor + "," + (this.alpha * this.selectedBorderAlpha) + ")";
						a.stroke();
					}
				}

				if (this.borderWidth > 0) {
					if (this.lineDash && this.lineDash.length > 1) {
						a.setLineDash(this.lineDash);
					}
					a.lineWidth = this.borderWidth;
					a.strokeStyle = "rgba(" + this.borderColor + "," + this.alpha + ")";
					a.stroke();
				}

				a.fillStyle = "rgba(" + this.fillColor + "," + this.alpha + ")";
				a.fill();
				a.restore();
			},
			this.getTextPostion = function(a, b, c) {
				var d = null;
				return null == a || "Bottom_Center" == a ?
					d = {
						x: -this.width / 2 + (this.width - b) / 2,
						y: this.height / 2 + c
					} : "Top_Center" == a ? d = {
						x: -this.width / 2 + (this.width - b) / 2,
						y: -this.height / 2 - c / 2
					} : "Top_Right" == a ? d = {
						x: this.width / 2,
						y: -this.height / 2 - c / 2
					} : "Top_Left" == a ? d = {
						x: -this.width / 2 - b,
						y: -this.height / 2 - c / 2
					} : "Bottom_Right" == a ? d = {
						x: this.width / 2,
						y: this.height / 2 + c
					} : "Bottom_Left" == a ? d = {
						x: -this.width / 2 - b,
						y: this.height / 2 + c
					} : "Middle_Center" == a ? d = {
						x: -this.width / 2 + (this.width - b) / 2,
						y: c / 2
					} : "Middle_Right" == a ? d = {
						x: this.width / 2,
						y: c / 2
					} : "Middle_Left" == a && (d = {
						x: -this.width / 2 - b,
						y: c / 2
					}),
					null == d ? d = {
						x: -this.width / 2 + (this.width - b) / 2,
						y: this.height / 2 + c
					} : d,
					null != this.textOffsetX && (d.x += this.textOffsetX),
					null != this.textOffsetY && (d.y += this.textOffsetY), d
			}, 
			this.setImage = function(b, c) {
				if (null == b) throw new Error("Node.setImage error! image is null!");
				var d = this;
				if ("string" == typeof b) {
					var img = j[b];
					if (img == null) {
						img = new Image();
						img.setAttribute('crossOrigin', 'Anonymous');
						img.src = b;
						img.onload = function() {
							d.image = img;
						}
					} else {
						this.setSize(img.width, img.height),
						this.image = img;
					}
				} else {
					this.image = b,
					this.setSize(b.width, b.height)
				}
			}, 
			this.removeHandler = function(a) {
				var b = this;
				this.outLinks && (this.outLinks.forEach(function(c) {
					c.source === b && a.remove(c)
				}), this.outLinks = null), 
				this.inLinks && (this.inLinks.forEach(function(c) {
					c.target === b && a.remove(c)
				}), this.inLinks = null)
			}
		}

		function c() {
			c.prototype.initialize.apply(this, arguments)
		}
		var j = {};
		b.prototype = new a.EditableElement, c.prototype = new b, a.Node = c
	}(DGraph),
	function(a) {
		function b(a, b) {
			var c = [];
			if (null == a || null == b) return c;
			if (a && b && a.outLinks && b.inLinks)
				for (var d = 0; d < a.outLinks.length; d++)
					for (var e = a.outLinks[d], f = 0; f < b.inLinks.length; f++) {
						var g = b.inLinks[f];
						e === g && c.push(g)
					}
			return c;
		}

		function c(a, c, twoDirect) {
			if (twoDirect != null && twoDirect == true) {
				var d = b(a, c),
					e = b(c, a),
					f = d.concat(e);
				return f;
			}
			return b(a, c);
		}

		function d(a) {
			var b = c(a.source, a.target);
			return b = b.filter(function(b) {
				return a !== b
			});
		}

		function e(a, b, twoDirect) {
			return c(a, b, twoDirect).length;
		}

		function f(b, c, g) {
			function h(b, c) {
				var d = a.util.lineF(b.cx, b.cy, c.cx, c.cy),
					e = b.getBound(),
					f = a.util.intersectionLineBound(d, e);
				return f
			}
			this.initialize = function(b, c, d) {
				if (f.prototype.initialize.apply(this, arguments), this.elementType = "link", this.zIndex = a.zIndex_Link, 0 !=
					arguments.length) {
					this.text = d,
					this.source = b,
					this.target = c,
					this.source && null == this.source.outLinks && (this.source.outLinks = []),
					this.source && null == this.source.inLinks && (this.source.inLinks = []),
					this.target && null == this.target.inLinks && (this.target.inLinks = []),
					this.target && null == this.target.outLinks && (this.target.outLinks = []),
					null != this.source && this.source.outLinks.push(this),
					null != this.target && this.target.inLinks.push(this),
					this.caculateIndex(),
					this.font = "13px Consolas",
					this.fontColor = "120,120,120",
					this.lineWidth = 3,
					this.lineJoin = "round",
					this.showShadow = true;
					this.shadowColor = '10,250,10',
					this.selectedColor = '10,10,230',
					this.selectedAlpha = 1;
					this.transformAble = !1,
					this.textOffsetX = 0,
					this.textOffsetY = 0,
					this.curverness = 0.5,
					this.arrowsRadius = null,
					this.arrowsOffset = 0,
					this.dashedPattern = null,
					this.path = [];
					var e = "text,font,fontColor,lineWidth,lineJoin".split(",");
					this.serializedProperties = this.serializedProperties.concat(e)
				}
			},
			this.caculateIndex = function() {
				var a = e(this.source, this.target, false);
				if (a > 0) {
					this.nodeIndex = a - 1;
				}
			},
			this.initialize(b, c, g),
			this.removeHandler = function() {
				var a = this;
				this.source && this.source.outLinks && (this.source.outLinks = this.source.outLinks.filter(function(b) {
					return b !== a
				})), this.target && this.target.inLinks && (this.target.inLinks = this.target.inLinks.filter(function(b) {
					return b !== a
				}));
				var b = d(this);
				b.forEach(function(a, b) {
					a.nodeIndex = b
				})
			}, 
			this.getStartPosition = function() {
				var a = {
					x: this.source.cx,
					y: this.source.cy
				};
				return a
			}, 
			this.getEndPosition = function() {
				var a = {
					x: this.target.cx,
					y: this.target.cy
				};
				return (a = h(this.target, this.source)), 
						null == a && (a = {
							x: this.target.cx,
							y: this.target.cy
						}), a
			}, 
			this.getPath = function() {
				var b = this.getStartPosition(),
					c = this.getEndPosition();
				return [b, c];
			},
			this.paintPath = function(a, b) {
			},
			this.paintLoop = function(a) {
				var radius = this.source.radius / 2;
				var b = Math.round(radius + (this.nodeIndex + 1));
				a.beginPath(),
				a.arc(this.source.x - radius / 2, this.source.y - radius / 2, b, 0, 2 * Math.PI),
				a.stroke(),
				a.closePath()
			},
			this.paintArrow = function(b, g, h) {
			},
			this.paint = function(a) {
			},
			this.paintText = function(a, b) {
			},
			this.paintSelected = function(a) {
				if (this.showShadow) {
					a.shadowBlur = 5,
					a.shadowColor = 'rgba(' + this.shadowColor + ',0.8)',
					a.shadowOffsetX = 0,
					a.shadowOffsetY = 0
				}
			},
			this.isInBound = function(b, c) {
				if (this.source === this.target) {
					var d = Math.round(this.source.radius / 2 + (this.nodeIndex + 1)),
						e = a.util.getDistance(this.source,{x: b,y: c}) - d;
					return Math.abs(e) <= 3
				}

				for (var f = !1, g = 1; g < this.path.length; g++) {
					var h = this.path[g - 1],i = this.path[g];
					if (1 == a.util.isPointInLine({x: b,y: c}, h, i)) {
						f = !0;
						break
					}
				}
				return f
			}
		}

		function g(a, b, c) {
			this.initialize = function() {
				g.prototype.initialize.apply(this, arguments)
			}, 
			this.initialize(a, b, c),
			this.getStartPosition = function() {
				var a = {
					x: this.source.cx,
					y: this.source.cy
				};
				return a;
			},
			this.getEndPosition = function() {
				var a = {
					x: this.target.cx,
					y: this.target.cy
				};
				return a;
			},
			this.getPath = function(a) {
				var b = [],
					c = this.getStartPosition(),
					d = this.getEndPosition();
					return [c, d];
			},
			this.paintText = function(a, b) {
			}
		}

		function edge(a, b, c) {
			this.initialize = function() {
				g.prototype.initialize.apply(this, arguments)
			},
			this.initialize(a, b, c),
			this.paint = function(a,needHideText) {
				if (null != this.source && null != !this.target) {
					if (this.source.showSelected || this.target.showSelected) {
						this.showSelected = 1;
					} else {
						this.showSelected = 0;
					}

					if (this.colorType == 'source') {
						this.strokeColor = this.source.fillColor;
					} else if (this.colorType == 'target' || this.colorType == 'both') {
						this.strokeColor = this.target.fillColor;
					}

					if (this.source === this.target) {
						this.setLineStyle(a);
						this.paintLoop(a);
						if (this.showlabel) {
							this.text = this.label;
							this.paintText(a, b);
						} else {
							this.text = null;
						}
						return;
					}

					if (e(this.target, this.source, true) > 1) {
						this.lineType = 'curver';
					}
					this.paintPath(a, b);
										
					if (this.showlabel && !needHideText) {
						this.text = this.label;
						this.paintText(a, b);
					} else {
						this.text = null;
					}

					if (this.showArrow) {
						this.paintArrow(a);
					}
				}
			};
			this.paintPath = function(a, b) {
				var lineType = this.lineType;
				switch (lineType) {
					case 'direct':
						this.paintDrirectLine(a, b);
						break;
					case 'curver':
						this.paintCurverLink(a, b);
						break;
					case 'vdirect':
						this.lineDash = [8, 5];
						this.paintDrirectLine(a, b);
						break;
					case 'vcurver':
						this.lineDash = [8, 5];
						this.paintCurverLink(a, b);
						break;
					case 'vlink':
						this.paintVerticalLink(a, b);
						break;
					case 'hlink':
						this.paintHorizolLink(a, b);
						break;
					case 'bezier':
						this.paintBezierLink(a, b);
						break;
					case 'vbezier':
						this.paintVBezierLink(a, b);
						break;
					case 'hbezier':
						this.paintHBezierLink(a, b);
						break;
					case 'arrowline':
						this.paintArrowLine(a,b);
						break;
					case 'minderline':
						this.paintXMinderLine(a,b);
						break;
					default:
						this.paintDrirectLine(a, b);
						break;
				}
			},
			
			this.paintText = function(a, b) {
				if (this.source === this.target) {
					var i = -(Math.PI / 2 + Math.PI / 4);
					var j = this.width / 2 * (this.nodeIndex + 1) / 2,
						e = this.source.x + j * Math.cos(i),
						f = this.source.y + j * Math.sin(i);
					a.save();
					a.beginPath();
					a.fillStyle = "rgba(" + this.fontColor + ", " + this.alpha + ")",
					a.fillText(this.text, e, f),
					a.stroke(),
					a.closePath(),
					a.restore();
					return;
				}

				if (this.lineType == 'direct' || this.lineType == 'vdirect') {
					this.paintDrirectLineText(a, b);
				}
			},
			this.paintArrow = function(a) {
				if (this.lineType == 'direct' || this.lineType == 'vdirect') {
					this.paintDrirectLineArrow(a);
				}
			},

			this.setLineStyle = function(a) {
				a.lineJoin = "round";
				if (this.colorType == 'both') {
					var grd = a.createLinearGradient(this.source.cx, this.source.cy, this.target.cx, this.target.cy);
					grd.addColorStop(0, "rgba(" + this.source.fillColor + "," + this.alpha + ")");
					grd.addColorStop(1, "rgba(" + this.target.fillColor + "," + this.alpha + ")");
					a.strokeStyle = grd;
				} else {
					a.strokeStyle = "rgba(" + this.strokeColor + "," + this.alpha + ")";
				}

				if (this.selected || this.showSelected) {
					a.strokeStyle = "rgba(" + this.selectedColor + "," + this.selectedAlpha + ")";
				}

				a.lineWidth = this.lineWidth;
				if (this.lineDash && this.lineDash.length > 1) {
					a.setLineDash(this.lineDash);
				}
			},

			this.paintCurverLink = function(a) {
				var source = this.source,
					target = this.target;
				var sSize = (source.radius / 2 * source.scaleX) || 20,
					tSize = (target.radius / 2 * target.scaleX) || 20,
					sX = source.cx,
					sY = source.cy;
					
					if(this.showArrow){
						var aSize = this.getArrowRadius(),
						lineAngle = Math.atan2(target.cy - source.cy, target.cx - source.cx),
						e = -(this.target.radius/2 + aSize/2)* this.target.scaleX,
						tX = this.target.cx + e * Math.cos(lineAngle),
						tY = this.target.cy + e * Math.sin(lineAngle);
					}else{
						var tX = this.target.cx,
						tY = this.target.cy; 
					}

					var dX = tX - sX,
					dY = tY - sY,
					sign = (sX < tX) ? 1 : -1,
					cp = {},
					c, angle,
					t = 0.5,
					d, aX, aY, vX, vY;

				if (source.id === target.id) {
					cp = this.getSelfLoopControlPoints(sX, sY, sSize);
					c = this.getPointOnBezierCurve(t, sX, sY, tX, tY, cp.x1, cp.y1, cp.x2, cp.y2);
					angle = Math.atan2(1, 1);
				} else {
					var curverNum = 4 - (this.nodeIndex * 0.5);
					if (this.nodeIndex / 2 == 0) {
						curverNum = -curverNum;
					}
					cp = this.getQuadraticControlPoint(sX, sY, tX, tY, curverNum,this.curverness);
					c = this.getPointOnQuadraticCurve(t, sX, sY, tX, tY, cp.x, cp.y);
					angle = Math.atan2(dY * sign, dX * sign);
				}
				a.beginPath();
				a.moveTo(sX, sY);
				this.setLineStyle(a);
				if (source.id === target.id) {
					a.bezierCurveTo(cp.x1, cp.y1, cp.x2, cp.y2, tX, tY);
				} else {
					a.quadraticCurveTo(cp.x, cp.y, tX, tY);
				}
				a.stroke(),
				a.closePath();

				this.path = [];
				this.path.push({x: sX,y: sY});
				this.path.push({x: (sX + cp.x) / 2,y: (sY + cp.y) / 2});
				this.path.push({x: (tX + cp.x) / 2,y: (tY + cp.y) / 2});
				this.path.push({x: tX,y: tY});

				if (this.showArrow) {
					if (source.id === target.id) {
						d = Math.sqrt(Math.pow(tX - cp.x1, 2) + Math.pow(tY - cp.y1, 2));
						aX = cp.x1 + (tX - cp.x1) * (d - aSize - tSize) / d;
						aY = cp.y1 + (tY - cp.y1) * (d - aSize - tSize) / d;
						vX = (tX - cp.x1) * aSize / d;
						vY = (tY - cp.y1) * aSize / d;
					} else {
						d = Math.sqrt(Math.pow(tX - cp.x, 2) + Math.pow(tY - cp.y, 2));
						aX = cp.x + (tX - cp.x) * (d - aSize/2) / d;
						aY = cp.y + (tY - cp.y) * (d - aSize/2) / d;
						
						vX = (tX - cp.x) * aSize / d;
						vY = (tY - cp.y) * aSize / d;
					}
					a.save();
					a.beginPath();
					a.moveTo(aX + vX, aY + vY);
					a.lineTo(aX + vY * t, aY - vX * t);
					a.lineTo(aX - vY * t, aY + vX * t);
					a.lineTo(aX + vX, aY + vY);
					a.closePath();
					if (this.selected || this.showSelected) {
						a.fillStyle = "rgba(" + this.selectedColor + "," + this.selectedAlpha + ")";
					} else {
						a.fillStyle = "rgba(" + this.strokeColor + "," + this.alpha + ")";
					}
					a.fill();
					a.restore();
				}

				if (this.showlabel && this.text && this.text.length > 0) {
					a.save();
					a.font = this.font;
					a.fillStyle = "rgba(" + this.fontColor + ", " + this.alpha + ")";
					a.textAlign = 'center';
					a.textBaseline = 'alphabetic';
					a.translate(c.x, c.y);
					a.rotate(angle);
					a.fillText(this.text, 0, (-this.lineWidth / 2) - 3);
					a.restore();
				}
			},
			
			this.paintArrowLine = function (a,b) {
				var width = this.lineWidth;
				width = width < 3?3:width;
				var x0,y0,x1,y1;
				if(this.showArrow){
					x0=this.source.cx;
					y0=this.source.cy;
					x1=this.target.cx;
					y1=this.target.cy;
				}else{
					x0=this.target.cx;
					y0=this.target.cy;
					x1=this.source.cx;
					y1=this.source.cy;
				}
				var polarCoordinate2canvasCoordinate = function (x0, y0, r, radian) {
					var x = r * Math.cos(radian);
					var y = r * Math.sin(radian);
					x += x0;
					y += y0;
					return { x: x, y: y };
				};
				var distance = Math.sqrt((y1 - y0) * (y1 - y0) + (x1 - x0) * (x1 - x0));
				var radian = Math.asin(Math.abs(y1 - y0) / distance);
				if (x0 > x1 && y1 > y0) {
					radian = Math.PI - radian;
				}else if (x0 > x1 && y0 > y1) {
					radian += Math.PI;
				}else if (x1 > x0 && y0 > y1) {
					radian = 2 * Math.PI - radian;
				}
				var _a = polarCoordinate2canvasCoordinate(x0, y0, distance - width * 2, radian), x = _a.x, y = _a.y;
				var p1 = polarCoordinate2canvasCoordinate(x, y, width, radian - Math.PI * 0.5);
				var p2 = polarCoordinate2canvasCoordinate(x, y, width * 2, radian - Math.PI * 0.5);
				var p3 = polarCoordinate2canvasCoordinate(x, y, width, radian + Math.PI * 0.5);
				var p4 = polarCoordinate2canvasCoordinate(x, y, width * 2, radian + Math.PI * 0.5);
				
				a.save();
				a.beginPath();
				a.moveTo(x0, y0);
				a.lineTo(p1.x, p1.y);
				a.lineTo(p2.x, p2.y);
				if(this.showArrow){
					a.lineTo(x1, y1);
				}
				a.lineTo(p4.x, p4.y);
				a.lineTo(p3.x, p3.y);
				a.closePath();
				
				a.lineJoin = "round";
				if (this.colorType == 'both') {
					var grd = a.createLinearGradient(this.source.cx, this.source.cy, this.target.cx, this.target.cy);
					grd.addColorStop(0, "rgba(" + this.source.fillColor + "," + this.alpha + ")");
					grd.addColorStop(1, "rgba(" + this.target.fillColor + "," + this.alpha + ")");
					a.fillStyle = grd;
				} else {
					a.fillStyle = "rgba(" + this.strokeColor + "," + this.alpha + ")";
				}
				if (this.selected || this.showSelected) {
					a.fillStyle = "rgba(" + this.selectedColor + "," + this.selectedAlpha + ")";
				}
				a.fill();
				a.restore();
				
				this.path = [];
				this.path.push({x:this.source.cx,y:this.source.cy});
				this.path.push({x:this.target.cx,y:this.target.cy});
			},
			this.paintXMinderLine = function (cxt,b) {
				var source = this.source,target = this.target;
				var sourceX = source.cx,sourceY = source.cy;
				var targetX = target.cx,targetY = target.cy;
				
				if(sourceX > targetX){
					targetX = target.x+target.width/2;
				}else if(sourceX < targetX){
					targetX = target.x;
				}
			
				cxt.beginPath();
				this.setLineStyle(cxt);
				cxt.moveTo(source.cx, source.cy);
				cxt.lineTo((sourceX + targetX) / 2, sourceY);
				cxt.lineTo((sourceX + targetX) / 2, targetY);
				cxt.lineTo(target.cx, target.cy);
				cxt.stroke();
				cxt.closePath();
			
				this.path = [];
				this.path.push({x: sourceX,y: sourceY});
				this.path.push({x: (sourceX + targetX) / 2,y: sourceY});
				this.path.push({x: (sourceX + targetX) / 2,y: targetY});
				this.path.push({x: targetX,y: targetY});
			},

			this.paintDrirectLine = function(a) {
				var posX = this.target.cx, 
					posY = this.target.cy;
				if(this.showArrow){
					var g, h;
					this.arrowsRadius = this.getArrowRadius();
					if (this.target.shape == 'rect') {
						var cod = this.getPath();
						g = cod[0],h = cod[1];
						var angle = Math.atan2(h.y - g.y, h.x - g.x);
						h.x = h.x - this.arrowsRadius * Math.cos(angle),
						h.y = h.y - this.arrowsRadius * Math.sin(angle);				
					} else {
						g = {x: this.source.cx,y: this.source.cy}, 
						h = {x: this.target.cx,y: this.target.cy};
						this.arrowsOffset = -(this.target.radius/2)* this.target.scaleX - this.arrowsRadius;
					}
					var e = this.arrowsOffset,
						angle = Math.atan2(h.y - g.y, h.x - g.x),
						posX = h.x + e * Math.cos(angle),
						posY = h.y + e * Math.sin(angle);
				}
				
				a.beginPath(),
				a.moveTo(this.source.cx, this.source.cy);
				this.setLineStyle(a);
				a.lineTo(posX,posY),
				a.stroke(),
				a.closePath();

				this.path = [];
				this.path.push({x: this.source.cx,y: this.source.cy});
				this.path.push({x: posX,y: posY});
			},
				
			this.paintDrirectLineText = function(a, b) {
				const start = this.source;
				const end = this.target;
				const textPos = {
					x: start.cx + (end.cx - start.cx) / 2,
					y: start.cy + (end.cy - start.cy) / 2
				};
				const relLink = {
					x: end.cx - start.cx,
					y: end.cy - start.cy
				};
				let textAngle = Math.atan2(relLink.y, relLink.x);
				if (textAngle > Math.PI / 2) textAngle = -(Math.PI - textAngle);
				if (textAngle < -Math.PI / 2) textAngle = -(-Math.PI - textAngle);

				a.save(),
				a.beginPath(),
				a.font = this.font;
				a.translate(textPos.x, textPos.y);
				a.rotate(textAngle);
				a.textAlign = 'center';
				a.textBaseline = 'bottom';
				a.fillStyle = "rgba(" + this.fontColor + ", " + this.alpha + ")";
				a.fillText(this.text, 0, 0);
				a.stroke(),
				a.closePath(),
				a.restore();
			},

			this.paintDrirectLineArrow = function(b) {
				var g, h;
				if (this.target.shape == 'rect') {
					var cod = this.getPath();
					g = cod[0],h = cod[1];
				} else {
					g = {x: this.source.cx,y: this.source.cy}, 
					h = {x: this.target.cx,y: this.target.cy};

					this.arrowsOffset = -(this.target.radius/2 )* this.target.scaleX;
				}
				this.arrowsRadius = this.getArrowRadius();
				var e = this.arrowsOffset,
					f = this.arrowsRadius / 2,
					i = Math.atan2(h.y - g.y, h.x - g.x),
					j = DGraph.util.getDistance(g, h) - this.arrowsRadius,
					k = g.x + (j + e) * Math.cos(i),
					l = g.y + (j + e) * Math.sin(i),
					m = h.x + e * Math.cos(i),
					n = h.y + e * Math.sin(i);
				i -= Math.PI / 2;
				var o = {
						x: k + f * Math.cos(i),
						y: l + f * Math.sin(i)
					},
					p = {
						x: k + f * Math.cos(i - Math.PI),
						y: l + f * Math.sin(i - Math.PI)
					};
				b.beginPath();
				if (this.selected || this.showSelected) {
					b.fillStyle = "rgba(" + this.selectedColor + "," + this.selectedAlpha + ")";
				} else {
					b.fillStyle = "rgba(" + this.strokeColor + "," + this.alpha + ")";
				}
				b.moveTo(o.x, o.y),
				b.lineTo(m, n),
				b.lineTo(p.x, p.y),
				b.closePath(),
				b.fill();
			},

			this.getArrowRadius = function() {
				var raduis = Math.round(3 * this.lineWidth);
				return Math.min(Math.max(raduis, 10), 100);
			},
			
			this.getTargetBorderPoint = function(){
				var radius = 0;
				if(this.showArrow){
					var target = this.target;
					radius = target.radius;
					if(target.shape == 'rect'){
						if(['bezier','vbezier','vlink'].indexOf(this.lineType) !=-1){
							radius = (target.height/2 + target.borderWidth) * target.scaleX;
						}else{
							radius = (target.width/2 + target.borderWidth) * target.scaleX;
						}
					}else{
						radius = (target.radius/2 + target.borderWidth) * target.scaleX;
					}
				}				
				return radius;
			},

			this.paintSpecialArrow = function(b, sourceP, targetP) {
				var g = {x: sourceP.x,y: sourceP.y},
					h = {x: targetP.x,y: targetP.y};
				this.arrowsRadius = this.getArrowRadius();
				var e = this.lineWidth,
					f = this.arrowsRadius / 2,
					i = Math.atan2(h.y - g.y, h.x - g.x),
					j = Math.sqrt((g.x - h.x) * (g.x - h.x) + (g.y - h.y) * (g.y - h.y)) - this.arrowsRadius,
					k = g.x + (j + e) * Math.cos(i),
					l = g.y + (j + e) * Math.sin(i),
					m = h.x + e * Math.cos(i),
					n = h.y + e * Math.sin(i);
				i -= Math.PI / 2;
				var o = {
					x: k + f * Math.cos(i),
					y: l + f * Math.sin(i)
				},
				p = {
					x: k + f * Math.cos(i - Math.PI),
					y: l + f * Math.sin(i - Math.PI)
				};
				b.beginPath();
				if (this.selected || this.showSelected) {
					b.fillStyle = "rgba(" + this.selectedColor + "," + this.selectedAlpha + ")";
				} else {
					b.fillStyle = "rgba(" + this.strokeColor + "," + this.alpha + ")";
				}
				b.moveTo(o.x, o.y),
				b.lineTo(m, n),
				b.lineTo(p.x, p.y),
				b.closePath(),
				b.fill()
			},

			this.paintVerticalLink = function(cxt) {
				var source = this.source,target = this.target;
				var sourceX = source.cx,sourceY = source.cy;
				var targetX = target.cx,targetY = target.cy;
				var radius = this.getTargetBorderPoint();
				if(sourceY > targetY){
					radius = -radius;
				}
				
				cxt.beginPath();
				this.setLineStyle(cxt);
				cxt.moveTo(sourceX, sourceY);
				cxt.lineTo(sourceX, (sourceY + targetY) / 2);
				cxt.lineTo(targetX, (sourceY + targetY) / 2);
				cxt.lineTo(targetX, targetY - radius);
				cxt.stroke();
				cxt.closePath();

				this.path = [];
				this.path.push({x: sourceX,y: sourceY});
				this.path.push({x: sourceX,y: (sourceY + targetY) / 2});
				this.path.push({x: targetX,y: (sourceY + targetY) / 2});
				this.path.push({x: targetX,y: targetY});

				if (this.showArrow) {
					this.paintSpecialArrow(cxt, {
						x: targetX,
						y: (sourceY + targetY) / 2
					}, {
						x: targetX,
						y: targetY - radius
					});
				}
			},

			this.paintHorizolLink = function(cxt) {
				var source = this.source,target = this.target;
				var sourceX = source.cx,sourceY = source.cy;
				var targetX = target.cx,targetY = target.cy;
				
				var radius = this.getTargetBorderPoint();
				if(sourceX > targetX){
					radius = -radius;
				}

				cxt.beginPath();
				this.setLineStyle(cxt);
				cxt.moveTo(source.cx, source.cy);
				cxt.lineTo((sourceX + targetX) / 2, sourceY);
				cxt.lineTo((sourceX + targetX) / 2, targetY);
				cxt.lineTo(targetX-radius,targetY);
				cxt.stroke();
				cxt.closePath();

				this.path = [];
				this.path.push({x: sourceX,y: sourceY});
				this.path.push({x: (sourceX + targetX) / 2,y: sourceY});
				this.path.push({x: (sourceX + targetX) / 2,y: targetY});
				this.path.push({x: targetX,y: targetY});

				if (this.showArrow) {
					this.paintSpecialArrow(cxt, {
						x: (sourceX + targetX) / 2,
						y: targetY
					}, {
						x: targetX - radius,
						y: targetY
					});
				}
			},

			this.paintBezierLink = function(cxt) {
				var source = this.source,target = this.target;
				var sourceX = source.cx,sourceY = source.cy;
				var targetX = target.cx,targetY = target.cy;
				var tarrowRaduis = this.getArrowRadius();
				var ydistance = targetY - sourceY;
				var ss = Math.max(ydistance / 6, 10);
				var x3 = sourceX,y3 = sourceY;
				var x4 = targetX,
					y4 = targetY - ss - (target.width / 4 * target.scaleX) - (tarrowRaduis * target.scaleX);
				
				var radius = this.getTargetBorderPoint();
				if (sourceY > targetY) {
					y4 = targetY + ss + (target.width / 4 * target.scaleX) + (tarrowRaduis * target.scaleX);
					radius = -radius;
					tarrowRaduis = -tarrowRaduis;
				}

				var x5 = sourceX;
				var y5 = (y3 + y4) * this.curverness;
				var x6 = targetX;
				var y6 = (y3 + y4) * this.curverness;

				cxt.beginPath();
				this.setLineStyle(cxt);
				cxt.moveTo(sourceX, sourceY);
				cxt.lineTo(x3, y3);
				cxt.bezierCurveTo(x5, y5, x6, y6, x4, y4);
				cxt.lineTo(targetX, targetY - radius);
				cxt.stroke();
				cxt.closePath();

				this.path = [];
				this.path.push({x: sourceX,y: sourceY});
				this.path.push({x: x3,y: y3});
				this.path.push({x: x5,y: y5});
				this.path.push({x: x6,y: y6});
				this.path.push({x: x4,y: y4});
				this.path.push({x: targetX,y: targetY});

				if (this.showArrow) {
					this.paintSpecialArrow(cxt, {
						x: x4,
						y: y4
					}, {
						x: targetX,
						y: targetY - radius
					});
				}
			},

			this.paintHBezierLink = function(cxt) {
				var source = this.source,target = this.target;
				var sourceX = source.cx,sourceY = source.cy;

				var targetX = target.cx - (target.width / 2 * target.scaleX) - (this.getArrowRadius() * target.scaleX) - 10,
					targetY = target.cy;
				
				var radius = this.getTargetBorderPoint();
				if (sourceX > target.cx) {
					targetX = target.cx + (target.width / 2 * target.scaleX) + (this.getArrowRadius() * target.scaleX) + 10;
					radius = -radius;
				}

				var x3 = (sourceX + targetX) * this.curverness;
					y3 = sourceY,
					x4 = (sourceX + targetX) * this.curverness,
					y4 = targetY;

				cxt.beginPath();
				this.setLineStyle(cxt);
				cxt.moveTo(source.cx, source.cy);
				cxt.bezierCurveTo(x3, y3, x4, y4, targetX, targetY);
				cxt.lineTo(target.cx-radius, target.cy);
				cxt.stroke();
				cxt.closePath();

				this.path = [];
				this.path.push({x: sourceX,y: sourceY});
				this.path.push({x: x3,y: y3});
				this.path.push({x: x4,y: y4});
				this.path.push({x: targetX,y: targetY});
				this.path.push({x: target.cx,y: target.cy});

				if (this.showArrow) {
					this.paintSpecialArrow(cxt, {
						x: targetX,
						y: targetY
					}, {
						x: target.cx -radius,
						y: target.cy
					});
				}
			},

			this.paintVBezierLink = function(cxt) {
				var source = this.source,target = this.target;
				var sourceX = source.cx,sourceY = source.cy;
				var targetX = target.cx,
					targetY = target.cy - (target.width / 2 * target.scaleX) - (this.getArrowRadius() * target.scaleX);
				
				var radius = this.getTargetBorderPoint();
				if (sourceY > target.cy) {
					targetY = target.cy + (target.width / 2 * target.scaleX) + (this.getArrowRadius() * target.scaleX);
					radius=-radius;
				}

				var x3 = sourceX;
				var y3 = (sourceY + targetY) * this.curverness;
				var x4 = targetX;
				var y4 = (sourceY + targetY) * this.curverness;

				cxt.beginPath();
				this.setLineStyle(cxt);
				cxt.moveTo(source.cx, source.cy);
				cxt.bezierCurveTo(x3, y3, x4, y4, targetX, targetY);
				cxt.lineTo(targetX, target.cy-radius);
				cxt.stroke();
				cxt.closePath();

				this.path = [];
				this.path.push({x: sourceX,y: sourceY});
				this.path.push({x: x3,y: y3});
				this.path.push({x: x4,y: y4});
				this.path.push({x: targetX,y: targetY});
				this.path.push({x: target.cx,y:target.cy});

				if (this.showArrow) {
					this.paintSpecialArrow(cxt, {
						x: targetX,
						y: targetY
					}, {
						x: target.cx,
						y: target.cy-radius
					});
				}
			},

			this.getSelfLoopControlPoints = function(x, y, size) {
				return {
					x1: x - size * 7,
					y1: y,
					x2: x,
					y2: y + size * 7
				};
			};

			this.getPointOnBezierCurve = function(t, x1, y1, x2, y2, cx, cy, dx, dy) {
				var B0_t = Math.pow(1 - t, 3),
					B1_t = 3 * t * Math.pow(1 - t, 2),
					B2_t = 3 * Math.pow(t, 2) * (1 - t),
					B3_t = Math.pow(t, 3);
				return {
					x: (B0_t * x1) + (B1_t * cx) + (B2_t * dx) + (B3_t * x2),
					y: (B0_t * y1) + (B1_t * cy) + (B2_t * dy) + (B3_t * y2)
				};
			};

			this.getQuadraticControlPoint = function(x1, y1, x2, y2, curverNum,curverness) {
				curverness = curverness||0.5;
				return {
					x: (x1 + x2) *curverness + (y2 - y1) / (curverNum || 4),
					y: (y1 + y2) *curverness + (x1 - x2) / (curverNum || 4)
				};
			};

			this.getPointOnQuadraticCurve = function(t, x1, y1, x2, y2, xi, yi) {
				var dd = 2;
				return {
					x: Math.pow(1 - t, dd) * x1 + 2 * (1 - t) * t * xi + Math.pow(t, dd) * x2,
					y: Math.pow(1 - t, dd) * y1 + 2 * (1 - t) * t * yi + Math.pow(t, dd) * y2
				};
			};
		}

		f.prototype = new a.InteractiveElement,
		a.Link = f,
		g.prototype = new f,
		edge.prototype = new f, 
		a.Edge = edge

	}(DGraph),
	function(a) {
		function b(c) {
			this.initialize = function(c) {
				b.prototype.initialize.apply(this, null),
				this.elementType = "box",
				this.zIndex = a.zIndex_Box,
				this.width = 100,
				this.height = 100,
				this.childs = [],
				this.alpha = 0.5,
				this.dragable = !0,
				this.childDragble = !0,
				this.visible = !0,
				this.fillColor = "10,250,10",
				this.borderWidth = 0,
				this.borderColor = "255,255,255",
				this.borderRadius = 5,
				this.font = "nomral 20px 微软雅黑",
				this.fontColor = "0,255,0",
				this.text = c,
				this.textPosition = "Top_Left",
				this.textOffsetX = 0,
				this.textOffsetY = 30,
				this.layout = new a.layout.AutoBoxLayout;
			},
			this.initialize(c),
			this.add = function(a) {
				this.childs.push(a), a.dragable = this.childDragble
			},
			this.remove = function(a) {
				for (var b = 0; b < this.childs.length; b++)
					if (this.childs[b] === a) {
						a.parentContainer = null, this.childs = this.childs.del(b), a.lastParentContainer = this;
						break
					}
			},
			this.removeAll = function() {
				this.childs = []
			}, this.setLocation = function(a, b) {
				var c = a - this.x,
					d = b - this.y;
				this.x = a, this.y = b;
				for (var e = 0; e < this.childs.length; e++) {
					var f = this.childs[e];
					f.setLocation(f.x + c, f.y + d)
				}
			}, this.doLayout = function(a) {
				a && a(this, this.childs)
			}, this.paint = function(a) {
				this.visible && (this.layout && this.layout(this, this.childs),
					a.beginPath(),
					a.fillStyle = "rgba(" + this.fillColor + "," + this.alpha + ")",
					a.strokeStyle = "rgba(" + this.fillColor + ",1)",
					a.lineWidth = 2,
					null == this.borderRadius || 0 == this.borderRadius ? a.rect(this.x, this.y, this.width, this.height) : a.DGraphRoundRect(this.x, this.y, this.width, this.height, this.borderRadius), 
					a.fill(),
					a.stroke(),
					a.closePath(),
					this.paintText(a)
				)
			}, this.paintBorder = function(a) {
				if (0 != this.borderWidth) {
					a.beginPath(),
					a.lineWidth = this.borderWidth,
					a.strokeStyle = "rgba(" + this.borderColor + "," + this.alpha + ")";
					var b = this.borderWidth / 2;
					null == this.borderRadius || 0 == this.borderRadius ? a.rect(this.x - b, this.y - b, this.width + this.borderWidth,
						this.height + this.borderWidth) : a.DGraphRoundRect(this.x - b, this.y - b, this.width + this.borderWidth,
						this.height + this.borderWidth, this.borderRadius),
					a.stroke(),
					a.closePath()
				}
			}, this.paintText = function(a) {
				var b = this.text;
				if (null != b && "" != b) {
					a.beginPath(), 
					a.font = this.font;
					var c = a.measureText(b).width,
						d = a.measureText("田").width;
					a.fillStyle = "rgba(" + this.fontColor + ", " + this.alpha + ")";
					var e = this.getTextPostion(this.textPosition, c, d);
					a.fillText(b, e.x, e.y), 
					a.closePath()
				}
			}, this.getTextPostion = function(textPosition, b, c) {
				var d = null;
				switch(textPosition){
					case 'Bottom_Center':
						d = {x: this.x + this.width / 2 - b / 2,y: this.y + this.height + c};
						break;
					case 'Top_Center':
						d = {x: this.x + this.width / 2 - b / 2,y: this.y - c / 2};
						break;
					case 'Top_Right':
						d = {x: this.x + this.width - b,y: this.y - c / 2};
						break;
					case 'Top_Left':
						d = {x: this.x,y: this.y - c / 2};
						break;
					case 'Bottom_Right':
						d = {x: this.x + this.width - b,y: this.y + this.height + c};
						break;
					case 'Bottom_Left':
						d = {x: this.x,y: this.y + this.height + c};
						break;
					case 'Middle_Center':
						d = {x: this.x + this.width / 2 - b / 2,y: this.y + this.height / 2 + c / 2};
						break;
					case 'Middle_Right':
						d = {x: this.x + this.width - b,y: this.y + this.height / 2 + c / 2};
						break;
					case 'Middle_Left':
						d = {x: this.x,y: this.y + this.height / 2 + c / 2};
						break;
					default :
					   d = {x: this.x + this.width / 2 - b / 2,y: this.y + this.height + c};
					   break;
				}
				d.x += this.textOffsetX;
				d.y += this.textOffsetY;
				return d;
			}, 
			this.paintMouseover = function(a) {
				this.paintSelected(a);
			}, 
			this.paintSelected = function(a) {
				a.save(),
				a.beginPath(),
				a.strokeStyle = "rgba(" + this.fillColor + ",0.5)",
				a.lineWidth = 8,
				0 == this.borderRadius ? a.rect(this.x, this.y, this.width, this.height) : a.DGraphRoundRect(this.x, this.y, this.width, this.height, this.borderRadius),
				a.stroke(),
				a.closePath(),
				a.restore();
			},
			this.setLayoutType = function(layoutType) {
				switch(layoutType){
					case 'grid':
						this.layout = new DGraph.layout.GridLayout;
						break;
					case 'circle':
						this.layout = new DGraph.layout.CircleLayout;
						break;
					default:
						this.layout = new DGraph.layout.AutoBoxLayout;
						break;
				}
			}
		}
		b.prototype = new a.InteractiveElement, a.Box = b
	}(DGraph),
	function(a) {
		function autoSize() {
			return function(box, childsNodes) {
				var nodeCount = childsNodes.length;
				if (nodeCount > 0) {
					var padding = 0;
					for (var c = 1e7, d = -1e7, e = 1e7, f = -1e7, g = d - c, h = f - e, i = 0; i < nodeCount; i++) {
						var j = childsNodes[i];
						j.x <= c && (c = j.x), j.x >= d && (d = j.x), j.y <= e && (e = j.y), j.y >= f && (f = j.y), g = d - c + j.width,
							h = f - e + j.height
					}
					box.x = c - padding, box.y = e - padding, box.width = g + padding + (2 * padding), box.height = h + (2 * padding);
				};
			}
		};

		function circleLayout() {
			return function(box, childsNodes) {
				var nodeCount = childsNodes.length;
				var tempcirc = 0,
					temdiameter = 0,
					theta = 0;
				for (var i = 0; i < nodeCount; i++) {
					var n = childsNodes[i];
					tempcirc += (n.radius * 1.5);
				}
				temdiameter = tempcirc / Math.PI;
				theta = 2 * Math.PI / tempcirc;
				var radius = temdiameter / 2;
				var lasttheta = 0;

				var centerX = box.x + box.width / 2;
				var centerY = box.y + box.height / 2;

				for (var i = 0; i < nodeCount; i++) {
					var n = childsNodes[i];
					noderadius = n.radius;
					var noderadian = theta * noderadius;
					lasttheta += noderadius * 1.5 * theta;

					n.x = radius * Math.cos((lasttheta + noderadian) + Math.PI / 2) + centerX;
					n.y = radius * Math.sin((lasttheta + noderadian) + Math.PI / 2) + centerY;
				}

				box.layout = new a.layout.AutoBoxLayout;
			};
		};

		function gridLayout() {
			return function(box, childsNodes) {
				var nodeCount = childsNodes.length;
				var xGridScales = Math.round(Math.sqrt(nodeCount)) + 1;
				var yGridScales = Math.round(Math.sqrt(nodeCount)) + 1;

				childsNodes = childsNodes.sort(function(n1, n2) {
					var x = (n1.inLinks || []).length + (n1.outLinks || []).length;
					var y = (n2.inLinks || []).length + (n2.outLinks || []).length;
					return x > y ? -1 : 1;
				});

				var horizontalScale = verticalScale = childsNodes[0].width * 2;
				var k = 0;
				for (var i = 0; i < xGridScales; i++) {
					for (var j = 0; j < yGridScales; j++) {
						if (k >= nodeCount) {
							continue;
						}
						var node = childsNodes[k];
						node.x = j * horizontalScale + box.x;
						node.y = i * verticalScale + box.y;

						k++;
					}
				}
				box.layout = new a.layout.AutoBoxLayout;
			};
		};

		a.layout = a.Layout = {
			AutoBoxLayout: autoSize,
			CircleLayout: circleLayout,
			GridLayout: gridLayout
		};
	}(DGraph),
	function(dgraph) {
		function Animate() {
			Animate.prototype.init.apply(this, [].slice.call(arguments))
		}
		Animate.fps = 60;
		Animate.easing = {
			"default": "swing",
			linear: function(t) {
				return t
			},
			swing: function(t) {
				return 0.5 - Math.cos(t * Math.PI) / 2
			},
			easeInQuad: function(t) {
				return t * t
			},
			easeOutQuad: function(t) {
				return -1 * t * (t - 2)
			},
			easeInOutQuad: function(t) {
				if ((t /= 0.5) < 1) return 0.5 * t * t;
				return -0.5 * ((--t) * (t - 2) - 1);
			},
			easeInCubic: function(t) {
				return t * t * t;
			},
			easeOutCubic: function(t) {
				return ((t = t - 1) * t * t + 1);
			},
			easeInOutCubic: function(t) {
				if ((t /= 0.5) < 1) return 0.5 * t * t * t;
				return 0.5 * ((t -= 2) * t * t + 2);
			},
			easeInQuart: function(t) {
				return t * t * t * t;
			},
			easeOutQuart: function(t) {
				return -1 * ((t -= 1) * t * t * t - 1);
			},
			easeInOutQuart: function(t) {
				if ((t /= 0.5) < 1) return 0.5 * t * t * t * t;
				return -0.5 * ((t -= 2) * t * t * t - 2);
			},
			easeInQuint: function(t) {
				return t * t * t * t * t;
			},
			easeOutQuint: function(t) {
				return (t -= 1) * t * t * t * t + 1;
			},
			easeInOutQuint: function(t) {
				if ((t /= 0.5) < 1) return 0.5 * t * t * t * t * t;
				return 0.5 * ((t -= 2) * t * t * t * t + 2);
			},
			easeInSine: function(t) {
				return -1 * Math.cos(t * (Math.PI / 2)) + 1;
			},
			easeOutSine: function(t) {
				return Math.sin(t * (Math.PI / 2));
			},
			easeInOutSine: function(t) {
				return -0.5 * (Math.cos(Math.PI * t) - 1);
			},
			easeInExpo: function(t) {
				return (t == 0) ? 0 : Math.pow(2, 10 * (t - 1));
			},
			easeOutExpo: function(t) {
				return (t == 1) ? 1 : -Math.pow(2, -10 * t) + 1;
			},
			easeInOutExpo: function(t) {
				if (t == 0 || t == 1) return t;
				if ((t /= 0.5) < 1) return 0.5 * Math.pow(2, 10 * (t - 1));
				return 0.5 * (-Math.pow(2, -10 * --t) + 2);
			},
			easeInCirc: function(t) {
				return -1 * (Math.sqrt(1 - t * t) - 1);
			},
			easeOutCirc: function(t) {
				return Math.sqrt(1 - (t -= 1) * t);
			},
			easeInOutCirc: function(t) {
				if ((t /= 0.5) < 1) return -0.5 * (Math.sqrt(1 - t * t) - 1);
				return 0.5 * (Math.sqrt(1 - (t -= 2) * t) + 1);
			},
			easeInElastic: function(t) {
				var s = 1.70158;
				var p = 0;
				var a = 1;
				if (t == 0 || t == 1) return t;
				if (!p) p = 0.3;
				if (a < Math.abs(1)) {
					a = 1;
					var s = p / 4;
				} else var s = p / (2 * Math.PI) * Math.asin(1 / a);
				return -a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t - s) * (2 * Math.PI) / p);
			},
			easeOutElastic: function(t) {
				var s = 1.70158;
				var p = 0;
				var a = 1;
				if (t == 0 || t == 1) return t;
				if (!p) p = 0.3;
				if (a < Math.abs(1)) {
					a = 1;
					var s = p / 4;
				} else var s = p / (2 * Math.PI) * Math.asin(1 / a);
				return a * Math.pow(2, -10 * t) * Math.sin((t - s) * (2 * Math.PI) / p) + 1;
			},
			easeInOutElastic: function(t) {
				var s = 1.70158;
				var p = 0;
				var a = 1;
				if (t == 0) return 0;
				if ((t /= 0.5) == 2) return 1;
				if (!p) p = 0.3 * 1.5;
				if (a < Math.abs(1)) {
					a = 1;
					var s = p / 4;
				} else var s = p / (2 * Math.PI) * Math.asin(1 / a);
				if (t < 1) return -.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t - s) * (2 * Math.PI) / p));
				return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t - s) * (2 * Math.PI) / p) * .5 + 1;
			},
			easeInBack: function(t) {
				var s = 1.70158;
				return t * t * ((s + 1) * t - s);
			},
			easeOutBack: function(t) {
				var s = 1.70158;
				return (t -= 1) * t * ((s + 1) * t + s) + 1;
			},
			easeInOutBack: function(t) {
				var s = 1.70158;
				if ((t /= 0.5) < 1) return 0.5 * (t * t * (((s *= (1.525)) + 1) * t - s));
				return 0.5 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2);
			},
			easeInBounce: function(t) {
				return 1 - Animate.easing.easeOutBounce(1 - t);
			},
			easeOutBounce: function(t) {
				if (t < (1 / 2.75)) {
					return 7.5625 * t * t;
				} else if (t < (2 / 2.75)) {
					return 7.5625 * (t -= (1.5 / 2.75)) * t + .75;
				} else if (t < (2.5 / 2.75)) {
					return 7.5625 * (t -= (2.25 / 2.75)) * t + .9375;
				} else {
					return 7.5625 * (t -= (2.625 / 2.75)) * t + .984375;
				}
			},
			easeInOutBounce: function(t) {
				if (t < 0.5) return Animate.easing.easeInBounce(t * 2) * .5;
				return Animate.easing.easeOutBounce(t * 2 - 1) * .5 + .5;
			}
		};
		Animate.calc = function(begin, end, x) {
			if (typeof begin == "object") {
				var result = {};
				for (var i in end) {
					result[i] = begin[i] + (end[i] - begin[i]) * x;
				}
				return result;
			} else {
				return begin + (end - begin) * x;
			}
		};
		Animate.prototype.init = function() {
			var args = [].slice.call(arguments);
			for (var i = 0;
				(i < 3 && i < args.length); i++) {
				switch (typeof(args[i])) {
					case "number":
						this._d = args[i];
						break;
					case "string":
						this._e = args[i];
						break;
					case "function":
						this._c = args[i];
						break;
				}
			}
			return this;
		};
		Animate.prototype.run = function(callback, onStop) {
			var timer;
			var self = this;
			var beginTime = new Date;
			var fps = typeof(Animate.fps) == "number" ? Animate.fps : 60;
			var duration = typeof(this._d) == "number" ? this._d : 1000;
			var ease = (typeof(this._e) == "string" && typeof Animate.easing[this._e] == "function") ? this._e : Animate.easing[
				"default"];
			var easing = Animate.easing[ease];
			if (typeof easing != "function") {
				throw new TypeError("Animate.easing[\"" + ease + "\"] type is a " + (typeof easing) + " not a function");
			} else {
				this._t = timer = setInterval(function() {
					var per = (new Date - beginTime) / duration;
					if (per >= 1) {
						callback.call(self, 1, per);
						self.stop(timer, onStop);
					} else {
						callback.call(self, easing(per, 0, 1, 1), per);
					}
				}, parseInt(1000 / fps));

				return timer;
			}
		};
		Animate.prototype.stop = function() {
			var p, onStop, args = [].slice.call(arguments);
			for (var i = 0; i < args.length; i++) {
				switch (typeof(args[i])) {
					case "number":
						clearInterval(args[i]);
						p = 1;
						break;
					case "function":
						onStop = args[i];
						break;
				}
			}!p && clearInterval(this._t);
			onStop && onStop.call(this);
			if (typeof(this._c) == "function") this._c();
			return this;
		};
		dgraph.Animate = Animate;
		
		
		function ColorUtils() {
			var colorRegExp =
				/^\s*((#[a-f\d]{6})|(#[a-f\d]{3})|rgba?\(\s*([\d\.]+%?\s*,\s*[\d\.]+%?\s*,\s*[\d\.]+%?(?:\s*,\s*[\d\.]+%?)?)\s*\)|hsba?\(\s*([\d\.]+(?:deg|\xb0|%)?\s*,\s*[\d\.]+%?\s*,\s*[\d\.]+%?(?:\s*,\s*[\d\.]+)?)%?\s*\)|hsla?\(\s*([\d\.]+(?:deg|\xb0|%)?\s*,\s*[\d\.]+%?\s*,\s*[\d\.]+%?(?:\s*,\s*[\d\.]+)?)%?\s*\))\s*$/i;
		
			function getStepColors(start, end, step) {
				start = toRGBA(start);
				end = toRGBA(end);
				start = getData(start);
				end = getData(end);
				var colors = [];
				var stepR = (end[0] - start[0]) / step;
				var stepG = (end[1] - start[1]) / step;
				var stepB = (end[2] - start[2]) / step;
				for (var i = 0, r = start[0], g = start[1], b = start[2]; i < step; i++) {
					colors[i] = toColor([
						adjust(Math.floor(r), [0, 255]),
						adjust(Math.floor(g), [0, 255]),
						adjust(Math.floor(b), [0, 255])
					]);
					r += stepR;
					g += stepG;
					b += stepB;
				}
				r = end[0];
				g = end[1];
				b = end[2];
				colors[i] = toColor([r, g, b]);
				return colors;
			};
		
			function toColor(data, format) {
				format = format || 'rgb';
				if (data && (data.length === 3 || data.length === 4)) {
					data = map(data, function(c) {
						return c > 1 ? Math.ceil(c) : c;
					});
					if (format.indexOf('hex') > -1) {
						data = map(data.slice(0, 3),
							function(c) {
								c = Number(c).toString(16);
								return (c.length === 1) ? '0' + c : c;
							});
						return '#' + data.join('');
					} else if (format.indexOf('hs') > -1) {
						var sx = map(data.slice(1, 3),
							function(c) {
								return c + '%';
							});
						data[1] = sx[0];
						data[2] = sx[1];
					}
					if (format.indexOf('a') > -1) {
						if (data.length === 3) {
							data.push(1);
						}
						data[3] = adjust(data[3], [0, 1]);
						return format + '(' + data.slice(0, 4).join(',') + ')';
					}
					return format + '(' + data.slice(0, 3).join(',') + ')';
				}
			};
		
			function convert(color, format) {
				var data = getData(color);
				var alpha = data[3];
				if (typeof alpha === 'undefined') {
					alpha = 1;
				}
				data[3] = alpha;
				return toColor(data, format);
			};
		
			function toRGBA(color) {
				return convert(color, 'rgba');
			};
		
			function trim(color) {
				color = String(color);
				color = color.replace(/(^\s*)|(\s*$)/g, '');
				if (/^[^#]*?$/i.test(color)) {
					color = color.replace(/\s/g, '');
				}
				return color;
			};
		
			function normalize(color) {
				color = trim(color);
				if (/^#[0-9a-f]{3}$/i.test(color)) {
					var d = color.replace('#', '').split('');
					color = '#' + d[0] + d[0] + d[1] + d[1] + d[2] + d[2];
				}
				return color;
			};
		
			function getData(color) {
				color = normalize(color);
				var r = color.match(colorRegExp);
				if (r === null) {
					return;
				}
				var d, a, data = [],rgb;
				if (r[2]) {
					d = r[2].replace('#', '').split('');
					rgb = [d[0] + d[1], d[2] + d[3], d[4] + d[5]];
					data = map(rgb,
						function(c) {
							return adjust(parseInt(c, 16), [0, 255]);
						});
				} else if (r[4]) {
					var rgba = (r[4]).split(',');
					a = rgba[3];
					rgb = rgba.slice(0, 3);
					data = map(rgb, function(c) {
						c = Math.floor(c.indexOf('%') > 0 ? parseInt(c, 0) * 2.55 : c);
						return adjust(c, [0, 255]);
					});
					if (typeof a !== 'undefined') {
						data.push(adjust(parseFloat(a), [0, 1]));
					}
				}
				return data;
			};
		
			function map(array, fun) {
				if (typeof fun !== 'function') {
					throw new TypeError();
				}
				var len = array ? array.length : 0;
				for (var i = 0; i < len; i++) {
					array[i] = fun(array[i]);
				}
				return array;
			};
		
			function adjust(value, region) {
				if (value <= region[0]) {
					value = region[0];
				} else if (value >= region[1]) {
					value = region[1];
				}
				return value;
			};
		
			function colorHex(rgb) {
				var _this = rgb;
				var aColor = _this.replace(/(?:(|)|rgb|RGB)*/g, "").replace('(', '').replace(')', '').split(",");
				var strHex = "#";
				for (var i = 0; i < aColor.length; i++) {
					var hex = Number(aColor[i]).toString(16);
					hex = hex.length < 2 ? '0' + hex : hex;
					if (hex === "0") {
						hex += hex;
					}
					strHex += hex;
				}
				return strHex;
			};
			return {
				getStepColors: getStepColors,
				colorHex: colorHex
			};
		};
		
		dgraph.ColorUtils = ColorUtils;

	}(DGraph);

	var VisualGraph = function(container, config) {
		if (container == null) {
			return;
		}
		this.defaultConfig = {
			node: { //节点的默认配置
				label: { //标签配置
					show: true, //是否显示
					color: '50,50,50', //字体颜色
					font: '12px 微软雅黑', //字体大小及类型
					wrapText: false, //节点包裹文字
					textPosition: 'Middle_Center', //文字位置 Top_Center,Bottom_Center,Middle_Right
					textOffsetX:0,//文字横向偏移量
					textOffsetY:0,//文字纵向偏移量
					backgroud:null,//文字背景色
					borderWidth:0,//文字边框宽度
					borderColor:null //文字边框颜色
				},
				shape: 'circle', //节点形状 circle,rect,ellipse,triangle,star,polygon,text
				color: '20,20,200', //节点颜色
				borderColor: '10,10,10', //边框颜色
				borderWidth: 0, //边框宽度
				borderRadius:0,//边框圆角大小
				lineDash: [3, 2], //边框虚线间隔,borderWidth>0时生效
				alpha: 1, //节点透明度
				size: 60, //节点默认大小
				width: 100, //节点的长度(shape为rect生效)
				height: 40, //节点的高度(shape为rect生效)
				image: null, //节点图标(设置后节点显示为圆形图标)
				selected: { //选中时的样式设置
					borderColor: '120,0,250', //选中时边框颜色
					borderAlpha: 1, //选中时的边框透明度
					borderWidth: 5, //选中是的外部边框宽度
					showShadow: false, //是否展示阴影
					shadowColor: '10,240,10', //选中是的阴影颜色
				},
				onClick: function(event, node) {}, //节点点击事件回调
				ondblClick: function(event, node) {}, //节点双击事件回调
				onMouseDown: function(event, node) {}, //节点的鼠标按下事件
				onMouseOver: function(event, node) {}, //节点的鼠标划过事件
				onMouseOut: function(event, node) {}, //节点的鼠标划出事件
				onMousedrag: function(event, node) {} //节点拖动事件回调
			},
			link: { //连线的默认配置
				label: { //连线标签
					show: true, //是否显示
					color: '20,20,20', //字体颜色
					font: '11px 微软雅黑' //字体大小及类型
				},
				lineType: 'direct', //连线类型,curver,vlink,hlink,bezier,vbezier,hbezier
				colorType: 'source', //连线颜色类型 source:继承source颜色,target:继承target颜色 both:用双边颜色，d:自定义
				color: '10,10,10', //连线颜色
				alpha: 1, // 连线透明度
				lineWidth: 3, //连线宽度
				lineDash: [0], //虚线间隔样式如：[5,8]
				showArrow: true, //显示连线箭头
				selected: { //选中时的样式设置
					color: '255,0,0', //选中时的颜色
					alpha: 1,
					lineWidth: 8,
					showShadow: false, //是否展示阴影
					shadowColor: '10,250,10', //选中连线时的阴影颜色
				},
				onClick: function(event, link) {}, //连线点击事件回调
				ondblClick: function(event, link) {}, //节点双击事件回调
			},
			highLightNeiber: true, //相邻节点高度标志
			wheelZoom: 1, //滚轮缩放开关，不使用时不设置
			noElementClick: function(event) {}, //空白处的点击事件
			/* layout:{
				type:'force',
				options:{
					friction: 0.8,
					linkDistance: 120,
					linkStrength: 0.1,
					charge: -200,
					gravity: 0.01,
					noverlap:false,
				}
			} */
		};
		this.stage = new DGraph.Stage(container);
		this.canvas = this.stage.canvas;
		this.scene = null;
		this.nodes = [];
		this.links = [];
		this.nodeIdIndex = 1;
		this.currentNode = null;
		this.currentLink = null;
		this.showLinkFlag = true;
		this.typeMapStyle = {};
		this.lineTypeMapStyle = {};
		this.isDerictedGraph = true;
		this.clusterBoxes = [];
		this.currentCluster = null;
		this.currentLayout = null;
		
		this.drawLinkFlag = false;
		this.virNode = null;
		this.sceneEvent = null;
		this.autoLayout = false;
		
		var self = this;
		this.forceOptions = {
			size: [self.canvas.width,self.canvas.height],
			friction: 0.9,
			linkDistance: 150,
			linkStrength: 0.05,
			charge: -150,
			gravity: 0.01,
			noverlap:false,
			alpha: 0.5,
			theta: 0.8,
			loopName: null
		};
		
		if (!config) {
			this.config = this.defaultConfig;
		}else{
			this.config = this.deepExtend(this.defaultConfig, config, true, true);
			if(this.config.layout && this.config.layout['type'] == 'force' && this.config.layout['options']){
				this.autoLayout = true;
				
				this.forceOptions.friction=Number(self.config.layout.options['friction']) || 0.9,
				this.forceOptions.linkDistance=Number(self.config.layout.options['linkDistance']) || 150,
				this.forceOptions.linkStrength=Number(self.config.layout.options['linkStrength']) || 0.05,
				this.forceOptions.charge=Number(self.config.layout.options['charge']) || -150,
				this.forceOptions.gravity=Number(self.config.layout.options['gravity']) || 0.01,
				this.forceOptions.noverlap=self.config.layout.options['noverlap'] || false;
			}
		}
		
		this.defaultNodeColor = this.config.node.color;
		this.highLightNeiber = this.config.highLightNeiber;

		this.init();
	};

	VisualGraph.prototype.init = function() {
		var _self = this;
		this.stage.wheelZoom = this.config.wheelZoom;
		if (_self.scene != null) {
			_self.scene.clear();
			_self.stage.remove(_self.scene);
		}
		_self.scene = new DGraph.Scene(this.stage);
		_self.nodes = [];
		_self.links = [];
		_self.typeMapStyle = {};
		_self.lineTypeMapStyle = {};

		_self.initDrawLinkBase();
	};

	VisualGraph.prototype.initDrawLinkBase = function() {
		var _self = this;
		var virNode = new DGraph.Node();
		virNode.radius = 1;
		virNode.show = false;
		virNode.dragable = false;
		virNode.fillColor = '10,10,10';
		virNode.alpha = 0.1;
		virNode.showSelected = false;
		_self.virNode = virNode;

		_self.scene.mousemove(function(e) {
			if (_self.drawLinkFlag) {
				if (!_self.virNode.show) {
					_self.virNode.show = true;
					_self.scene.add(_self.virNode);
				}

				if (_self.virLink == null) {
					var virLink = new DGraph.Edge(_self.currentNode, _self.virNode);
					virLink.lineWidth = 2;
					virLink.alpha = 0.8;
					virLink.strokeColor = '50,250,50';
					virLink.lineDash = [5, 8];
					virLink.showSelected = false;
					_self.virLink = virLink;
					_self.scene.add(_self.virLink);
				}
				var p = DGraph.util.mouseCoords(e);
				_self.virNode.x = p.x;
				_self.virNode.y = p.y;
			}
		});

		_self.scene.dbclick(function(e) {
			_self.drawLinkFlag = false;
			if (_self.virNode.show) {
				_self.virNode.show = false;
				_self.scene.remove(_self.virNode);
			}

			if (_self.virLink) {
				_self.scene.remove(_self.virLink);
				_self.virLink = null;
			}
		});

		_self.scene.click(function(e) {
			_self.hideAllRightMenu();
			if (e.target == null) {
				_self.currentNode = null;
				_self.currentLink = null;

				if (_self.highLightNeiber) {
					_self.restoreHightLight();
				}
				var noElementClick = _self.config['noElementClick'];
				noElementClick(e);
			} else {
				if (e.target.elementType == 'node') {
					_self.currentLink = null;
				} else {
					_self.currentNode = null;
				}
			}
		});
	};

	VisualGraph.prototype.deepExtend = function(a, b, protoExtend, allowDeletion) {
		for (var prop in b) {
			if (b.hasOwnProperty(prop) || protoExtend === true) {
				if (b[prop] && b[prop].constructor === Object) {
					if (a[prop] === undefined) {
						a[prop] = {};
					}
					if (a[prop].constructor === Object) {
						this.deepExtend(a[prop], b[prop], protoExtend);
					} else {
						if ((b[prop] === null) && a[prop] !== undefined && allowDeletion === true) {
							delete a[prop];
						} else {
							a[prop] = b[prop];
						}
					}
				} else if (Array.isArray(b[prop])) {
					a[prop] = [];
					for (let i = 0; i < b[prop].length; i++) {
						a[prop].push(b[prop][i]);
					}
				} else {
					if ((b[prop] === null) && a[prop] !== undefined && allowDeletion === true) {
						delete a[prop];
					} else {
						a[prop] = b[prop];
					}
				}
			}
		}
		return a;
	};

	VisualGraph.prototype.hideAllRightMenu = function() {
		var _self = this;
		if (_self.config.hasOwnProperty('rightMenu')) {
			if (_self.config.rightMenu.hasOwnProperty('nodeMenu')) {
				_self.config['rightMenu']['nodeMenu'].hide();
			}

			if (_self.config.rightMenu.hasOwnProperty('linkMenu')) {
				_self.config['rightMenu']['linkMenu'].hide();
			}

			if (_self.config.rightMenu.hasOwnProperty('clusterMenu')) {
				_self.config['rightMenu']['clusterMenu'].hide();
			}
		}
	};

	VisualGraph.prototype.drawData = function(data) {
		var _self = this;
		if (data == null) {
			return;
		}
		this.init();

		var nodeIdMapNode = {};
		(data.nodes || []).forEach(function(n, i) {
			var node = _self.newNode(n, i);
			node.showlabel = _self.config.node.label.show;
			_self.scene.add(node);
			_self.nodes.push(node);
			nodeIdMapNode[n.id] = node;
		});

		(data.links || []).forEach(function(l) {
			var sourceId = l.source;
			var targetId = l.target;
			var source = nodeIdMapNode[sourceId];
			if (source == undefined || source == null) {
				var n = {
					id: sourceId
				};
				var source = _self.newNode(n, 0);
				source.visible = true;

				_self.scene.add(source);
				_self.nodes.push(source);
				nodeIdMapNode[n.id] = source;
			}
			var target = nodeIdMapNode[targetId];
			if (target == undefined || target == null) {
				var n = {
					id: targetId
				};
				target = _self.newNode(n, 0);
				target.visible = true;

				_self.scene.add(target);
				_self.nodes.push(target);
				nodeIdMapNode[n.id] = target;
			}
			if (source && target) {
				var link = _self.newEdge(source, target);
				link.showlabel = l.showlabel || _self.config.link.label.show;
				link.fontColor = l.fontColor || _self.config.link.label.color;
				link.font = l.font || _self.config.link.label.font;
				link.colorType = l.colorType || _self.config.link.colorType;
				link.strokeColor = l.color || _self.config.link.color;
				link.lineType = l.lineType || _self.config.link.lineType;
				link.type = l.type || '';
				link.label = l.label || l.type || '';
				link.weight = l.weight || 1;
				link.lineWidth = l.lineWidth || _self.config.link.lineWidth;
				link.properties = l.properties || {};

				_self.scene.add(link);
				_self.links.push(link);
				_self.setLineTypeMap(link);
			}
		});
		_self.scene.translateToCenter();
		_self.refresh();
		
		if(_self.autoLayout){
			_self.runLayoutEngin(0.9);
		}
	};

	VisualGraph.prototype.translateToCenter = function() {
		this.scene.translateToCenter();
		this.refresh();
	};

	VisualGraph.prototype.getColor = function(n) {
		var color = n.color;
		if (color) {
			color = color.replace('rgb(', '').replace(')', '');
		} else {
			color = this.defaultNodeColor;
		}
		return color;
	};

	VisualGraph.prototype.newNode = function(n) {
		var self = this;
		var width = this.stage.canvas.width || 500;
		var height = this.stage.canvas.height || 300;

		var node = new DGraph.Node();
		node.x = n.x || Math.round(Math.random() * width);
		node.y = n.y || Math.round(Math.random() * height);

		node.id = n.id;
		node.type = n.type || 'default';
		node.cluster = n.cluster || 'default';
		node.radius = Number(n.size) || self.config.node.size;
		node.width = n.width || self.config.node.width;
		node.height = n.height || self.config.node.height;
		node.label = n.label || n.id;
		node.alpha = n.alpha || self.config.node.alpha;
		node.fillColor = self.getColor(n);
		node.fontColor = n.fontColor || self.config.node.label.color;
		node.textPosition = n.textPosition || self.config.node.label.textPosition;
		node.font = n.font || self.config.node.label.font;
		node.borderWidth = n.borderWidth || self.config.node.borderWidth;
		node.borderRadius = n.borderRadius|| self.config.node.borderRadius;
		node.borderColor = n.borderColor || self.config.node.borderColor;
		node.scaleX = node.scaleY = n.scale || 1;
		node.shape = n.shape || self.config.node.shape;
		node.showlabel = n.showlabel || self.config.node.label.show;
		node.wrapText = self.config.node.label.wrapText;
		node.showShadow = n.showShadow || self.config.node.selected.showShadow;
		node.shadowColor = n.shadowColor || self.config.node.selected.shadowColor;
		node.selectedBorderColor = n.selectedBorderColor || self.config.node.selected.borderColor;
		node.selectedBorderAlpha = n.selectedBorderAlpha || self.config.node.selected.borderAlpha;
		node.selectedBorderWidth = n.selectedBorderWidth || self.config.node.selected.borderWidth;
		node.lineDash = n.lineDash || self.config.node.lineDash;
		node.labelBackGround = n.labelBackGround || self.config.node.label.backgroud;
		node.labelBorderWidth = n.labelBorderWidth || self.config.node.label.borderWidth;
		node.labelBorderColor = n.labelBorderColor || self.config.node.label.borderColor;
		node.textOffsetX = n.textOffsetX || self.config.node.label.textOffsetX;
		node.textOffsetY = n.textOffsetY || self.config.node.label.textOffsetY;
		node.icon=n.icon;
		
		node.weight = 1;
		node.px = node.x;
		node.py = node.y;
		node.charge = self.forceOptions.charge;

		if (n.image && n.image.length > 0) {
			node.setImage(n.image);
		} else {
			node.setImage(self.config.node.image || '');
		}
		node.properties = n.properties || {};
		self.setTypeMapWithNode(node);

		node.click(function(event) {
			if (self.drawLinkFlag && self.virLink != null) {
				var link = self.newEdge(self.virLink.source, this);
				self.links.push(link);
				self.scene.add(link);

				if (self.virNode.show) {
					self.virNode.show = false;
					self.scene.remove(self.virNode);
				}
				self.drawLinkFlag = false;
				if (self.virLink) {
					self.scene.remove(self.virLink);
					self.virLink = null;
				}
			}

			self.currentNode = this;
			this.fixed = true;
			this.dx = this.x;
			this.dy = this.y;

			if (self.highLightNeiber) {
				self.restoreHightLight();
				self.highLightNeiberNodes(this, 0.1);
			}

			if (self.config.node.hasOwnProperty('onClick')) {
				var onClick = self.config.node['onClick'];
				onClick(event, this);
			}
		});

		node.dbclick(function(evt) {
			if (self.config.node.hasOwnProperty('ondblClick')) {
				var ondblClick = self.config.node['ondblClick'];
				ondblClick(event, this);
			}
			this.fixed = !this.fixed;
		});

		node.mousedrag(function(evt) {
			var _node = this;
			if (this.isDragging || self.scene.selectedElements.length > 1) {
				return false;
			}
			this.isDragging = true;
			this.fixed = true;

			if(self.autoLayout){
				self.runLayoutEngin(0.5);
			}

			if (self.config.node.hasOwnProperty('onMousedrag')) {
				var onMousedrag = self.config.node['onMousedrag'];
				onMousedrag(event, this);
			}
		});

		node.mouseup(function(evt) {
			self.currentNode = this;
			this.fixed = true;
			this.isDragging = false;
			this.dx = this.cx;
			this.dy = this.cy;

			if (evt.button == 2) {
				self.showNodeRightMenu(evt, this);
			}

			if (self.config.node.hasOwnProperty('onMouseUp')) {
				var onMouseUp = self.config.node['onMouseUp'];
				onMouseUp(event, this);
			}
		});

		node.mousedown(function(evt) {
			if (self.config.node.hasOwnProperty('onMouseDown')) {
				var onMouseDown = self.config.node['onMouseDown'];
				onMouseDown(event, this);
			}
		});

		node.mouseover(function(evt) {
			if (self.config.node.hasOwnProperty('onMouseOver')) {
				var onMouseOver = self.config.node['onMouseOver'];
				onMouseOver(event, this);
			}
		});

		node.mouseout(function(evt) {
			if (self.config.node.hasOwnProperty('onMouseOut')) {
				var onMouseOut = self.config.node['onMouseOut'];
				onMouseOut(event, this);
			}
		});
		return node;
	};
	
	VisualGraph.prototype.refresh = function(){
		this.stage.paint();
		this.stage.thumbnail.visible?this.stage.thumbnail.update():null;
	};

	VisualGraph.prototype.highLightNeiberNodes = function(_node, alpha) {
		var self = this;
		self.nodes.map(function(n) {
			n.t_alpha = n.alpha;
			n.alpha = alpha || 0.1;
		});
		_node.alpha = _node.t_alpha;

		(_node.inLinks || []).map(function(link) {
			if (link.source.visible) {
				link.source.alpha = link.source.t_alpha;
			}
		});
		(_node.outLinks || []).map(function(link) {
			if (link.target.visible) {
				link.target.alpha = link.target.t_alpha;
			}
		});

		if (self.showLinkFlag) {
			self.links.map(function(link) {
				link.visible = false;
			});

			(_node.inLinks || []).map(function(link) {
				if (link.source.visible) {
					link.visible = true;
				}
			});

			(_node.outLinks || []).map(function(link) {
				if (link.target.visible) {
					link.visible = true;
				}
			});
		}
	};

	VisualGraph.prototype.restoreHightLight = function() {
		var self = this;
		self.nodes.map(function(n) {
			n.alpha = n.t_alpha || n.alpha;
		});

		if (self.showLinkFlag) {
			self.links.map(function(link) {
				if (link.source.visible && link.target.visible) {
					link.visible = true;
				}
			});
		}
	};

	VisualGraph.prototype.lockNode = function(node) {
		if (node && node != null) {
			node.fixed = true;
			node.dragable = false;
		}
	};

	VisualGraph.prototype.unLockNode = function(node) {
		if (node && node != null) {
			node.fixed = false;
			node.dragable = true;
		}
	};

	VisualGraph.prototype.showNodeRightMenu = function(event, _node) {
		var self = this;
		if (self.config.hasOwnProperty('rightMenu')) {
			if (self.config['rightMenu'].hasOwnProperty('nodeMenu')) {
				self.config['rightMenu']['nodeMenu'].show(event, self, _node);
			}
		}
	};

	VisualGraph.prototype.showLinkRightMenu = function(event, link) {
		var self = this;
		if (self.config.hasOwnProperty('rightMenu')) {
			if (self.config['rightMenu'].hasOwnProperty('linkMenu')) {
				self.config['rightMenu']['linkMenu'].show(event, self, link);
			}
		}
	};

	VisualGraph.prototype.showClusterRightMenu = function(event, box) {
		var self = this;
		if (self.config.hasOwnProperty('rightMenu')) {
			if (self.config['rightMenu'].hasOwnProperty('clusterMenu')) {
				self.config['rightMenu']['clusterMenu'].show(event, self, box);
			}
		}
	};

	VisualGraph.prototype.setTypeMapWithNode = function(node) {
		var self = this;
		this.typeMapStyle[node.type + ''] = {
			'color': self.colorHex(node.fillColor)
		};
		this.typeMapStyle[node.type + '']['shape'] = node.shape || 'circle';
	};

	VisualGraph.prototype.setLineTypeMap = function(link) {
		var self = this;
		var type = link.type || link.label || 'default';
		this.lineTypeMapStyle[type] = {
			'color': self.colorHex(link.strokeColor)
		};
		this.lineTypeMapStyle[type]['lineType'] = link.lineType || 'direct';
	};

	VisualGraph.prototype.colorHex = function(hexColor) {
		var ctool = new DGraph.ColorUtils();
		return ctool.colorHex(hexColor) || '0,0,250';
	};

	VisualGraph.prototype.newEdge = function(source, target) {
		var self = this;
		var link = new DGraph.Edge(source, target, null);
		link.lineWidth = self.config.link.lineWidth;
		link.alpha = self.config.link.alpha;
		link.strokeColor = self.config.link.color;
		link.showArrow = self.config.link.showArrow;
		link.lineType = self.config.link.lineType;
		link.lineDash = self.config.link.lineDash;
		link.fontColor = self.config.link.label.color;
		link.showShadow = self.config.link.selected.showShadow;
		link.shadowColor = self.config.link.selected.shadowColor;
		link.selectedColor = self.config.link.selected.color;
		link.selectedAlpha = self.config.link.selected.alpha;
		link.colorType = self.config.link.colorType;
		
		link.distance = self.forceOptions.linkDistance;
		link.strength = self.forceOptions.linkStrength;
		++source.weight;
		++target.weight;
		
		link.mouseup(function(evt) {
			self.currentLink = this;
			if (evt.button == 2) {
				self.showLinkRightMenu(evt, this);
			}
		});
		link.click(function(event) {
			if (self.config.link.hasOwnProperty('onClick')) {
				var onClick = self.config.link['onClick'];
				onClick(event, this);
			}
		});
		link.dbclick(function(event) {
			if (self.config.link.hasOwnProperty('ondblClick')) {
				var ondbClick = self.config.link['ondblClick'];
				ondbClick(event, this);
			}
		});

		return link;
	};

	VisualGraph.prototype.addNode = function(_node) {
		var self = this;
		var node = self.newNode(_node);
		node.text = node.label;
		node.showlabel = true;
		self.scene.add(node);
		self.nodes.push(node);
		
		self.refresh();
		return node;
	};

	VisualGraph.prototype.addEdge = function(_link) {
		var self = this;
		var source = _link.source;
		var target = _link.target;
		var sourceNode = this.nodes.filter(function(n) {
			return n.id == source;
		})[0];
		var targetNode = this.nodes.filter(function(n) {
			return n.id == target;
		})[0];
		var link = null;
		if (sourceNode && targetNode) {
			link = self.newEdge(sourceNode, targetNode);
			link.id = _link.id||'';
			link.type = _link.type || 'default';
			link.label = _link.label || '';
			link.showlabel = _link.showlabel || self.config.link.label.show;
			link.lineWidth = Number(_link.lineWidth) || self.config.link.lineWidth;
			link.strokeColor = _link.color || self.config.link.color;
			link.weight = Number(_link.weight) || 1;
			link.lineType = _link.lineType || self.config.link.lineType;
			link.lineDash = _link.lineDash || self.config.link.lineDash;
			link.font = _link.font || self.config.link.label.font;
			link.fontColor = _link.fontColor || self.config.link.label.color;
			link.properties = _link.properties || {};

			self.scene.add(link);
			self.links.push(link);
			
			self.refresh();
		}
		return link;
	};

	VisualGraph.prototype.getGraphData = function() {
		var self = this;
		return {
			nodes: self.nodes,
			links: self.links
		};
	};

	VisualGraph.prototype.getVisibleData = function() {
		var self = this;
		var visibleNodes = self.nodes.filter(function(n) {
			return n.visible == true;
		});

		var visibleLinks = self.links.filter(function(l) {
			var source = l.source,
				target = l.target;
			return source.visible == true && target.visible == true;
		});

		visibleNodes.map(function(n) {
			n.fixed = false;
		});
		return {
			nodes: visibleNodes,
			links: visibleLinks
		};
	};

	VisualGraph.prototype.setZoom = function(type) {
		var self = this;
		if (type == 'zoomOut') {
			self.stage.zoomOut();
		} else if (type == 'zoomIn') {
			self.stage.zoomIn();
		} else if (type == 'zoom1') {
			self.stage.centerAndZoom();
			self.scene.scaleX = 1;
			self.scene.scaleY = 1;
		} else {
			self.stage.centerAndZoom(1.0, 1.0);
		}
		self.refresh();
	};
	
	VisualGraph.prototype.animate = function(items,times,animate,callback,stopCallBack) {
		var self = this;
		self.stage.fps=100;
		var A1 =  new DGraph.Animate(times||1000,animate||'swing');
		A1.run(function(t){
			var result = {};
			for(var itemKey in items){
				result[itemKey] = DGraph.Animate.calc(items[itemKey].from,items[itemKey].to,t);
			}
			if(callback &&  typeof(callback) === 'function'){
				callback(result);
			}
		},function(){
			if(stopCallBack &&  typeof(stopCallBack) === 'function'){
				stopCallBack();
			}
			self.stage.fps=-100;
		});
	};

	VisualGraph.prototype.moveCenter = function() {
		this.scene.scaleX = 1;
		this.scene.scaleY = 1;
		this.scene.translateToCenter();
		this.refresh();
	};
	
	VisualGraph.prototype.moveNodeToCenter = function(node,times) {
		var self = this;
		if(times && Number(times) > 0){
			self.animate({
				x:{from:self.scene.translateX,to:-node.x + self.stage.canvas.width / 2},
				y:{from:self.scene.translateY,to:-node.y + self.stage.canvas.height / 2}
			},
			times,'linear',(result)=>{
				self.scene.translateX = result.x;
				self.scene.translateY = result.y;
			});
		}else{
			self.scene.setCenter(node.x,node.y);
			self.refresh();
		}
	};

	VisualGraph.prototype.setLineType = function(type) {
		this.links.forEach(function(link) {
			link.lineType = type;
		});
		this.refresh();
	};

	VisualGraph.prototype.setNodeShape = function(type) {
		this.nodes.forEach(function(node) {
			node.shape = type;
		});
		this.refresh();
	};

	VisualGraph.prototype.showNodeLabel = function(flag) {
		this.nodes.map(function(node) {
			node.showlabel = flag;
			if (flag) {
				node.text = node.label;
			} else {
				node.text = null;
			}
		});
		this.refresh();
	};

	VisualGraph.prototype.showLinkLabel = function(flag) {
		this.links.forEach(function(link) {
			link.showlabel = flag;
			if (flag) {
				link.text = link.label;
				link.font = "14px 微软雅黑";
				link.fontColor = link.strokeColor;
			} else {
				link.text = null;
			}
		});
		this.refresh();
	};

	VisualGraph.prototype.setMouseModel = function(model) {
		if (model == 'drag') {
			this.stage.mode = 'drag';
		} else if (model == 'select') {
			this.stage.mode = 'select';
		} else {
			this.stage.mode = 'normal';
		}
	};

	VisualGraph.prototype.contract = function(curNode) {
		var _self = this;
		if (curNode) {
			var leafNodes = [];
			(curNode.outLinks || []).map(function(l) {
				if ((l.target.outLinks || []).length == 0 && (l.target.inLinks || []).length == 1) {
					leafNodes.push(l.target);
					l.visible = false;
				}
			});
			curNode.tipText = leafNodes.length;
			leafNodes.map(function(n) {
				n.x = curNode.x;
				n.y = curNode.y;
				n.visible = false;
			});
			_self.refresh();
		}
	};

	VisualGraph.prototype.expanded = function(curNode) {
		var _self = this;
		if (curNode) {
			var targetNodes = [];
			(curNode.outLinks || []).map(function(l) {
				var target = l.target;
				if ((target.outLinks || []).length == 0 && target.visible == false) {
					l.visible = true;
					target.visible = true;
					targetNodes.push(target);
				}
			});

			if (targetNodes.length == 0) {
				return;
			}
			_self.runLayoutEngin(0.1);
			curNode.tipText = null;
		}
	};

	VisualGraph.prototype.saveImage = function(width,height,type) {
		this.stage.saveAsLocalImage(width,height,type);
	};

	VisualGraph.prototype.exportJsonFile = function() {
		var jsonStr = JSON.stringify(this.serialized());
		funDownload(jsonStr, 'graphvis.json');

		function funDownload(content, filename) {
			var eleLink = document.createElement('a');
			eleLink.download = filename;
			eleLink.style.display = 'none';
			var blob = new Blob([content]);
			eleLink.href = URL.createObjectURL(blob);
			document.body.appendChild(eleLink);
			eleLink.click();
			document.body.removeChild(eleLink);
		};
	};

	VisualGraph.prototype.showOverView = function(flag) {
		this.stage.thumbnail.visible = flag;
		this.refresh();
	};

	VisualGraph.prototype.switchOverView = function() {
		this.stage.thumbnail.visible = !this.stage.thumbnail.visible;
		this.refresh();
	};

	VisualGraph.prototype.findNode = function(text) {
		var nodes = this.nodes.filter(function(n) {
			if (n.label == null) return false;
			var label = n.label + '';
			return label == text;
		});
		if (nodes.length > 0) {
			var node = nodes[0];
			node.selected = true;
			node.showlabel = true;
			this.currentNode = node;
			this.focusTargetEle(node);
			return node;
		}
		return null;
	};

	VisualGraph.prototype.focusTargetEle = function(ele, params, callback) {
		ele.selected = true;
		if (!params) {
			params = {};
		}
		if (!params.x && params.x != 0) {
			params.x = this.stage.canvas.width / 2;
		}
		if (!params.y && params.y != 0) {
			params.y = this.stage.canvas.height / 2;
		}
		var self = this;		
		self.animate({
			x:{from:self.scene.translateX,to:-ele.x + params.x},
			y:{from:self.scene.translateY,to:-ele.y + params.y}
		},
		1000,'swing',(result)=>{
			self.scene.translateX = result.x;
			self.scene.translateY = result.y;
		},()=>{
			if(callback && typeof(callback) === 'function'){
				callback();
			}
		});
	};

	VisualGraph.prototype.converHexToRGB = function(hex) {
		var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
		hex = hex.replace(shorthandRegex, function(m, r, g, b) {
			return r + r + g + g + b + b;
		});
		var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		if (result) {
			return parseInt(result[1], 16) + ',' + parseInt(result[2], 16) + ',' + parseInt(result[3], 16);
		}
		return null;
	};

	VisualGraph.prototype.setLabelColor = function(hexColor) {
		var rgbColor = this.converHexToRGB(hexColor);
		this.config.node.label.color = rgbColor;
		this.nodes.forEach(function(node) {
			node.fontColor = rgbColor;
		});
		this.refresh();
	};

	VisualGraph.prototype.hideAllLink = function() {
		this.showLinkFlag = false;
		this.links.forEach(function(link) {
			link.visible = false;
		});
		this.refresh();
	};

	VisualGraph.prototype.showAllLink = function() {
		this.showLinkFlag = true;
		this.links.forEach(function(link) {
			if (link.source.visible && link.target.visible) {
				link.visible = true;
			}
		});
		this.refresh();
	};

	VisualGraph.prototype.showAllNode = function() {
		this.nodes.forEach(function(node) {
			node.alpha = 1;
			node.visible = true;
		});
		this.refresh();
	};

	VisualGraph.prototype.setNodeFont = function(fontSize) {
		var self = this;
		self.nodes.forEach(function(n) {
			n.font = 'noraml '+fontSize + 'px Consolas';
		});
		self.refresh();
	};

	VisualGraph.prototype.setTextPosition = function(textAlign) {
		var self = this;
		self.nodes.forEach(function(n) {
			n.textPosition = textAlign;
		});
		self.refresh();
	};

	VisualGraph.prototype.setLinkAlpha = function(alpha) {
		this.links.forEach(function(links) {
			links.alpha = alpha;
		});
		this.refresh();
	};

	VisualGraph.prototype.setLinkArrowShow = function(flag) {
		this.links.forEach(function(l) {
			l.showArrow = flag;
		});
		this.refresh();
	};

	VisualGraph.prototype.setLinkColor = function(hexColor) {
		var rgbColor = this.converHexToRGB(hexColor);
		this.links.forEach(function(link) {
			link.colorType = 'defined';
			link.strokeColor = rgbColor;
		});
		this.refresh();
	};

	VisualGraph.prototype.setLinkColorType = function(type) {
		var linkColorType = type || 'source';
		this.links.forEach(function(l) {
			l.colorType = linkColorType;
			if (linkColorType == 'defined') {
				l.strokeColor = self.config.link.color||'50,50,50';
			}
		});
		this.refresh();
	};

	VisualGraph.prototype.setLinkFont = function(fontSize) {
		var self = this;
		self.links.forEach(function(l) {
			l.font = 'noraml '+fontSize + 'px 微软雅黑';
			l.textOffsetX = -Number(fontSize);
		});
		this.refresh();
	};

	VisualGraph.prototype.setLinkLabelColor = function(hexColor) {
		var self = this;
		var rgbColor = this.converHexToRGB(hexColor);
		self.links.forEach(function(l) {
			l.fontColor = rgbColor;
		});
		this.refresh();
	};

	VisualGraph.prototype.resetNodeInfo = function(nodeInfo) {
		var node = this.currentNode;
		if (node) {
			node.label = this.currentNode.text = nodeInfo.name;
			node.radius = Number(nodeInfo.radius) || 20;
			node.width = Number(nodeInfo.width) || 100;
			node.height = Number(nodeInfo.height) || 50;
			node.scaleX = node.scaleY = Number(nodeInfo.scale) || 1;
			node.fillColor = this.converHexToRGB(nodeInfo.fillColor);
			node.shape = nodeInfo.shape;
			node.showlabel = nodeInfo.showlabel == 'true' ? true : false;
			node.imageUrl = nodeInfo.image;
			node.setImage(nodeInfo.image);
			
			this.refresh();
		}
	};

	VisualGraph.prototype.resetEdgeStyle = function(lineInfo) {
		var self = this;
		var line = self.currentLink;
		if (line) {
			line.label = lineInfo['label'];
			line.text = line.label;
			line.type = line.label;
			line.lineWidth = lineInfo['lineWidth'];
			line.lineType = lineInfo['lineType'];
			if (lineInfo['lineDash']) {
				line.lineDash = lineInfo['lineDash'].split(',');
			}
			var color = lineInfo['edgeColor'];
			if (color && color.length > 0 && color != '#1f6ce9') {
				line.strokeColor = self.converHexToRGB(color);
				line.fontColor = line.strokeColor;
				line.colorType = 'defined';
			}
			line.showlabel = true;
			this.refresh();
		}
	};

	VisualGraph.prototype.addClusterContainer = function(clusters, avoidOverlap) {
		var self = this;
		if (clusters == null) {
			return;
		}
		if (avoidOverlap == undefined || avoidOverlap == null) {
			avoidOverlap = false;
		}

		self.clusterBoxes.forEach(function(box) {
			self.scene.remove(box);
		});
		self.clusterBoxes = [];

		for (var clusterKey in clusters) {
			var cluster = clusters[clusterKey];

			var clusterNodes = self.nodes.filter(function(node) {
				return node.cluster == clusterKey;
			});
			var size = cluster.size,
				rate = cluster.rate,
				color = cluster.color;
			if (clusterNodes.length > 1) {
				var box = new DGraph.Box();
				box.borderRadius = 2;
				box.fillColor = color;
				box.alpha = 0.1;
				box.dbclick(function(evt) {
					var random = Math.round(Math.random() * 3);
					if (random == 1) {
						this.layout = new DGraph.layout.GridLayout;
					} else if (random == 2) {
						this.layout = new DGraph.layout.CircleLayout;
					} else {
						this.layout = new DGraph.layout.AutoBoxLayout;
					}
					self.refresh();
				});

				box.mouseup(function(evt) {
					if (evt.button == 2) {
						self.currentCluster = this;
						self.showClusterRightMenu(evt, this);
					}
				});

				self.scene.add(box);
				self.clusterBoxes.push(box);

				clusterNodes.forEach(function(node) {
					box.add(node);
				});
				this.refresh();
			}
		}
		if (!avoidOverlap) {
			self.clusterAvoidOverlap(self.clusterBoxes);
			this.refresh();
		}
	};

	VisualGraph.prototype.removeCluster = function() {
		var self = this;
		self.clusterBoxes = self.clusterBoxes.filter(function(clusterBox) {
			return clusterBox != self.currentCluster;
		});
		self.scene.remove(self.currentCluster);
		this.refresh();
	};

	VisualGraph.prototype.clearClusters = function() {
		var self = this;
		self.clusterBoxes.forEach(function(clusterBox) {
			self.scene.remove(clusterBox);
		});
		self.clusterBoxes = [];
		this.refresh();
	};

	VisualGraph.prototype.setClusterLayout = function(layoutType) {
		var self = this;
		if (self.currentCluster == null || layoutType == null) {
			return;
		}
		if (layoutType == 'grid') {
			self.currentCluster.layout = new DGraph.layout.GridLayout;
		} else if (layoutType == 'circle') {
			self.currentCluster.layout = new DGraph.layout.CircleLayout;
		} else {
			self.currentCluster.layout = new DGraph.layout.AutoBoxLayout;
		}
		this.refresh();
	};

	VisualGraph.prototype.clusterAvoidOverlap = function(clusterBoxes) {
		var self = this;

		var virtualNodes = [];
		clusterBoxes.forEach(function(box, i) {
			box.layout(box, box.childs);
			var boxRadius = Math.sqrt((box.width / 2) * (box.width / 2) + (box.height / 2) * (box.height / 2));
			var tempNode = new DGraph.Node();
			tempNode.radius = boxRadius;
			tempNode.x = box.cx;
			tempNode.y = box.cy;

			virtualNodes[i] = tempNode;
		});

		if (typeof(LayoutFactory) != 'undefined') {
			var layout = new LayoutFactory({
				nodes: virtualNodes,
				links: null
			}).createLayout('noverlap');
			if (layout != null) {
				layout.initAlgo();
				layout.resetConfig({
					'maxMove': 1
				});

				var times = 0,
					runFlag = true;
				while (times++ < 300 && runFlag) {
					layout.runLayout();
					runFlag = layout.runFlag;
				}
			}
		}

		virtualNodes.forEach(function(node, i) {
			var box = clusterBoxes[i];
			var dx = node.x - box.cx,
				dy = node.y - box.cy;
			box.childs.forEach(function(childNode) {

				childNode.x += dx;
				childNode.y += dy;
			});
		});
	};

	VisualGraph.prototype.applyNodeSize = function(range) {
		var self = this;
		var minDegree = 0;
		var maxDegree = 0;
		self.nodes.forEach(function(n) {
			var degree = (n.outLinks || []).length + (n.inLinks || []).length;
			n.degree = degree;
			minDegree = Math.min(degree, minDegree);
			maxDegree = Math.max(degree, maxDegree);
		});
		var degreesDomain = [Math.sqrt(minDegree), Math.sqrt(maxDegree)];
		self.nodes.forEach(function(n) {
			var scale = self.numScale(range, degreesDomain, Math.sqrt(n.degree));
			n.scaleX = scale;
			n.scaleY = scale;
		});
		this.refresh();
	};


	VisualGraph.prototype.applyLinkWeight = function(range) {
		var self = this;
		var minWeight = 3;
		var maxWeight = 8;
		self.links.forEach(function(l) {
			minWeight = Math.min(l.weight, minWeight);
			maxWeight = Math.max(l.weight, maxWeight);
		});
		var weightDomain = [Math.sqrt(minWeight), Math.sqrt(maxWeight)];
		self.links.forEach(function(l) {
			var lineWidth = self.numScale(range, weightDomain, Math.sqrt(l.weight));
			l.lineWidth = Math.round(lineWidth);
		});
		this.refresh();
	};

	VisualGraph.prototype.numScale = function(range, domain, num) {
		return ((num - domain[0]) * (range[1] - range[0]) / (domain[1] - domain[0]) + range[0]).toFixed(1);
	};

	VisualGraph.prototype.selectAll = function() {
		var _self = this;
		this.nodes.forEach(function(n) {
			n.selected = true;
			_self.scene.addToSelected(n);
		});
		this.refresh();
	};

	VisualGraph.prototype.reverseSelect = function() {
		var _self = this;
		this.nodes.forEach(function(n) {
			if (n.selected) {
				n.selected = false;
				_self.scene.removeFromSelected(n);
			} else {
				n.selected = true;
				_self.scene.addToSelected(n);
			}
		});
		this.refresh();
	};

	VisualGraph.prototype.selectRelate = function(node) {
		var self = this;
		var _node = node || self.currentNode;
		if (_node == null) {
			return false;
		}
		var inLinks = _node.inLinks || [];
		var outLinks = _node.outLinks || [];

		inLinks.forEach(function(link) {
			link.source.selected = true;
			self.scene.addToSelected(link.source);
		});
		outLinks.forEach(function(link) {
			link.target.selected = true;
			self.scene.addToSelected(link.target);
		});
		this.refresh();
	};

	VisualGraph.prototype.showSelected = function() {
		this.nodes.forEach(function(n) {
			if (!n.selected) {
				n.visible = false;
				var inLinks = n.inLinks || [],
					outLinks = n.outLinks || [];
				inLinks.forEach(function(l) {
					l.visible = false;
				});
				outLinks.forEach(function(l) {
					l.visible = false;
				});
			}
		});
		this.refresh();
	};

	VisualGraph.prototype.setScale = function(node, scale) {
		if (node) {
			node.scaleX = scale;
			node.scaleY = scale;
			this.refresh();
		}
	};

	VisualGraph.prototype.hideSelected = function() {
		this.nodes.forEach(function(n) {
			if (n.selected) {
				n.visible = false;
				var inLinks = n.inLinks || [],
					outLinks = n.outLinks || [];
				inLinks.forEach(function(l) {
					l.visible = false;
				});
				outLinks.forEach(function(l) {
					l.visible = false;
				});
			}
		});
		this.refresh();
	};

	VisualGraph.prototype.hideIsolatedNodes = function() {
		this.nodes.forEach(function(n) {
			if ((n.inLinks || []).length == 0 && (n.outLinks || []).length == 0) {
				n.visible = false;
			}
		});
		this.refresh();
	};

	VisualGraph.prototype.showNodes = function() {
		this.nodes.forEach(function(n) {
			n.visible = true;
			n.alpha = 1;
		});
		this.refresh();
	};

	VisualGraph.prototype.deleteNode = function(node) {
		var _self = this;
		if (node) {
			var links = [];
			var index = _self.nodes.indexOf(node);
			if (index > -1) {
				(node.inLinks || []).forEach(function(l) {
					links.push(l);
				});

				(node.outLinks || []).forEach(function(l) {
					links.push(l);
				});

				_self.nodes.splice(index, 1);
				_self.scene.remove(node);
			}

			links.forEach(function(l) {
				index = _self.links.indexOf(l);
				if (index > -1) {
					_self.links.splice(index, 1);
					_self.scene.remove(l);
				}
			});
			node = null;
			this.refresh();
		}
	};

	VisualGraph.prototype.deleteLink = function(link) {
		var _self = this;
		if (link) {
			var index = _self.links.indexOf(link);
			if (index > -1) {
				_self.links.splice(index, 1);
				_self.scene.remove(link);
			}
			this.refresh();
		}
	};

	VisualGraph.prototype.setNodeLabelWithDegree = function(degree) {
		this.nodes.forEach(function(n) {
			if (((n.inLinks || []).length + (n.outLinks || []).length) >= degree) {
				n.showlabel = true;
			} else {
				n.showlabel = false;
				n.text = null;
			}
		});
		this.refresh();
	};

	VisualGraph.prototype.translateOrZoom = function(type) {
		var self = this;
		if (type === 'zoomOut') {
			scaleGraph(1.2);
		} else if (type === 'zoomIn') {
			scaleGraph(0.8)
		} else {
			this.stage.centerAndZoom(1.0, 1.0);
		}
		this.refresh();

		function scaleGraph(scale) {
			var nodeCount = self.nodes.length;
			var xMean = 0,
				yMean = 0;
			self.nodes.forEach(function(n) {
				xMean += n.x;
				yMean += n.y;
			});
			xMean /= nodeCount;
			yMean /= nodeCount;
			self.nodes.forEach(function(n) {
				var dx = (n.x - xMean) * scale;
				var dy = (n.y - yMean) * scale;
				n.x = xMean + dx;
				n.y = yMean + dy;				
			});
		}
	};

	VisualGraph.prototype.rotateGraph = function(angle) {
		var self = this;
		var sin = Math.sin(-angle * Math.PI / 180);
		var cos = Math.cos(-angle * Math.PI / 180);
		var bounds = this.stage.getBound();
		var px = Math.round(bounds.width / 2);
		var py = Math.round(bounds.height / 2);

		this.nodes.forEach(function(n) {
			var dx = n.x - px;
			var dy = n.y - py;

			n.x = (px + dx * cos - dy * sin);
			n.y = (py + dy * cos + dx * sin);
		});
		this.refresh();
	};

	VisualGraph.prototype.getGraphStatistic = function() {
		var self = this;
		if (self.nodes.length == 0) {
			return null;
		}
		var density = self.calculateDensity();
		var avgDegree = self.calculateAvgDegree();
		var avgWeightDegree = self.calculateAvgWieghtDegree();
		return {
			'nodesCount': self.nodes.length,
			'linksCount': self.links.length,
			'density': density.toFixed(6),
			'avgDegree': avgDegree.toFixed(6),
			'avgWeightDegree': avgWeightDegree.toFixed(6)
		};
	};

	VisualGraph.prototype.calculateDensity = function() {
		var self = this;
		var nodesCount = self.nodes.length,
			linksCount = self.links.length;
		var multiplier = 1;
		if (!self.isDerictedGraph) {
			multiplier = 2;
		}
		var density = (multiplier * linksCount) / (nodesCount * nodesCount - nodesCount);
		return density;
	};

	VisualGraph.prototype.calculateAvgDegree = function() {
		var self = this;
		var nodesCount = self.nodes.length,
			averageDegree = 0;
		self.nodes.forEach(function(n) {
			averageDegree += ((n.inLinks || []).length + (n.outLinks || []).length);
		});
		var multiplier = 1;
		if (self.isDerictedGraph) {
			multiplier = 2;
		}
		var avgDegree = (averageDegree /= (multiplier * nodesCount));
		return avgDegree;
	};

	VisualGraph.prototype.calculateAvgWieghtDegree = function() {
		var self = this;
		var nodesCount = self.nodes.length,
			averageWeightDegree = 0;
		self.nodes.forEach(function(n) {
			if (self.isDerictedGraph) {
				(n.inLinks || []).forEach(function(l) {
					averageWeightDegree += l.weight;
				});

				(n.outLinks || []).forEach(function(l) {
					averageWeightDegree += l.weight;
				});
			} else {
				var allLinks = [];
				allLinks.push((n.inLinks || []));
				allLinks.push((n.outLinks || []));
				allLinks.forEach(function(l) {
					var multi = 1;
					if (l.source == l.target) {
						multi = 2;
					}
					averageWeightDegree += (multi * l.weight);
				});
			}
		});

		var multiplier = 1;
		if (self.isDerictedGraph) {
			multiplier = 2;
		}
		var avgDegree = (averageWeightDegree /= (multiplier * nodesCount));
		return avgDegree;
	};

	VisualGraph.prototype.serialized = function() {
		var self = this;
		var _graph = {
			nodes: [],
			links: []
		};
		self.nodes.forEach(function(n) {
			_graph.nodes.push({
				'id': n.id,
				'label': n.label,
				'x': Math.round(n.x),
				'y': Math.round(n.y),
				'size': n.radius,
				'color': n.fillColor
			});
		});

		self.links.forEach(function(l) {
			_graph.links.push({
				'source': l.source.id,
				'target': l.target.id,
				'label': l.label || l.type || ''
			});
		});
		return _graph;
	};

	VisualGraph.prototype.nodeWrapText = function(flag) {
		this.nodes.forEach(function(node) {
			node.wrapText = flag;
		});
		this.refresh();
	};

	VisualGraph.prototype.nodeMapAlphaByDegree = function() {
		var self = this;
		var minDegree = 0,
			maxDegree = 0;
		self.nodes.forEach(function(n) {
			n.outdegree = (n.outLinks || []).reduce(function(total, _link) {
				return total + (_link.weight || 1);
			}, 0);
			n.indegree = (n.inLinks || []).reduce(function(total, _link) {
				return total + (_link.weight || 1);
			}, 0);

			n.degree = n.outdegree + n.indegree;
			minDegree = Math.min(n.degree, minDegree);
			maxDegree = Math.max(n.degree, maxDegree);
		});
		var degreesDomain = [minDegree, maxDegree];
		var range = [0.2, 1];
		self.nodes.forEach(function(n) {
			var _alpha = self.numScale(range, degreesDomain, n.degree);
			n.alpha = _alpha;
			(n.outLinks || []).forEach(function(l) {
				l.alpha = _alpha;
			});
		});
		this.refresh();
	};

	VisualGraph.prototype.nodeMapSizeByDegree = function(propType, range) {
		var self = this;
		var minDegree = 0,
			maxDegree = 0;
		var degreeArr = {};
		self.nodes.forEach(function(n) {
			n.outdegree = (n.outLinks || []).reduce(function(total, _link) {
				return total + (_link.weight || 1);
			}, 0);
			n.indegree = (n.inLinks || []).reduce(function(total, _link) {
				return total + (_link.weight || 1);
			}, 0);

			n.degree = n.outdegree + n.indegree;
			if (propType == 'degree') {
				minDegree = Math.min(n.degree, minDegree);
				maxDegree = Math.max(n.degree, maxDegree);
			} else if (propType == 'outdegree') {
				minDegree = Math.min(n.outdegree, minDegree);
				maxDegree = Math.max(n.outdegree, maxDegree);
			} else {
				minDegree = Math.min(n.indegree, minDegree);
				maxDegree = Math.max(n.indegree, maxDegree);
			}
		});
		var degreesDomain = [minDegree, maxDegree];
		self.nodes.forEach(function(n) {
			var nodeSize = 1;
			if (propType == 'degree') {
				nodeSize = self.numScale(range, degreesDomain, n.degree);
			} else if (propType == 'outdegree') {
				nodeSize = self.numScale(range, degreesDomain, n.outdegree);
			} else {
				nodeSize = self.numScale(range, degreesDomain, n.indegree);
			}
			n.width = n.radius = Math.round(nodeSize);
		});
		this.refresh();
	};

	VisualGraph.prototype.findShortPath = function(sourceValue, targetValue) {
		var self = this;
		if (sourceValue.length == 0 || targetValue.length == 0) {
			return;
		}
		var startN = self.nodes.filter(function(n) {
			return (n.label + '') == sourceValue;
		})[0];

		var endN = self.nodes.filter(function(n) {
			return (n.label + '') == targetValue;
		})[0];
		self.allShortPath(0, startN, endN);
		this.refresh();
	};

	VisualGraph.prototype.allShortPath = function(direction, startN, endN) {
		var _self = this;
		var nodeList = [];
		var linkList = [];
		var level = 0,
			levelS = 0,
			levelE = 0;
		var noPath = true,
			noPathS = true,
			noPathE = true;
		if (direction == 0) {
			if (!getShortPath(startN, endN, false)) {
				levelS = level;
				level = 0;
				noPathS = noPath;
				noPath = true;
			}
			if (!getShortPath(endN, startN, false)) {
				levelE = level;
				level = 0;
				noPathE = noPath;
				noPath = true;
			}

			if (noPathS && noPathE) {} else if (noPathS && !noPathE) {
				getShortPath(endN, startN, true);
			} else if (!noPathS && noPathE) {
				getShortPath(startN, endN, true);
			} else {
				if (levelS <= levelE) {
					getShortPath(startN, endN, true);
				} else {
					getShortPath(endN, startN, true);
				}
			}
		} else if (direction == 1) {
			if (getShortPath(startN, endN, true)) {}
		} else if (direction == 2) {
			if (getShortPath(endN, startN, true)) {}
		}
		this.refresh();

		function getShortPath(startNode, endNode, flag) {
			var middleNodes = {};
			var middleLinks = {};
			var hasPassedNodes = [];

			if (startNode.outLinks == undefined || startNode.outLinks == null || startNode.outLinks.length == 0 ||
				endNode.inLinks == undefined || endNode.inLinks == null || endNode.inLinks.length == 0) {
				return true;
			} else {
				nodeList.push(startNode);
				_self.scene.addToSelected(startNode);
				hasPassedNodes.push(startNode);
				if (middleNodes[level] == undefined) {
					middleNodes[level] = [];
				}
				if (middleLinks[level] == undefined) {
					middleLinks[level] = [];
				}
				middleNodes[level].push(startNode);
				middleLinks[level].push(undefined);
				do {
					level++;
					getNextLevel(level);
				}
				while (middleNodes[level] != undefined && middleNodes[level].length != undefined && middleNodes[level].length > 0);

				if (flag && !noPath && level > 1) {
					for (var i = level - 1; i >= 1; i--) {
						middleLinks[i].forEach(function(l) {
							if (l.target.selected == true) {
								l.source.selected = true;
								l.selected = true;
								_self.scene.addToSelected(l.target);
								nodeList.push(l.target);
								linkList.push(l);
							}
						});
					}
				}
				return noPath;
			}

			function getNextLevel(_level) {
				if (middleNodes[_level - 1] != undefined && middleNodes[_level - 1].length != undefined && middleNodes[_level - 1]
					.length > 0) {
					middleNodes[_level - 1].forEach(function(n) {
						if (!noPath) {
							return;
						}
						n.outLinks.forEach(function(l) {
							if (!noPath) {
								return;
							} else if (l.target.id == endNode.id) {
								if (flag) {
									l.target.selected = true;
									l.source.selected = true;
									l.selected = true;
									_self.scene.addToSelected(l.target);
									nodeList.push(l.target);
									linkList.push(l);
								}
								noPath = false;
								middleNodes[_level] = undefined;
								return;
							} else if (hasPassedNodes.indexOf(l.target) == -1) {
								if (middleNodes[_level] == undefined) {
									middleNodes[_level] = [];
								}
								if (middleLinks[_level] == undefined) {
									middleLinks[_level] = [];
								}
								middleNodes[_level].push(l.target);
								middleLinks[_level].push(l);
								hasPassedNodes.push(l.target);
							}
						});
					});
				}
			}
		}
	};

	VisualGraph.prototype.pathAnalyze = function(sourceValue, targetValue) {
		var self = this;
		if ((self.nodes || []).length == 0) {
			return;
		}
		var startN = self.nodes.filter(function(n) {
			return (n.label + '') == sourceValue;
		})[0];

		var endN = self.nodes.filter(function(n) {
			return (n.label + '') == targetValue;
		})[0];
		self.allPath(0, startN, endN);
		this.refresh();
	};

	VisualGraph.prototype.allPath = function(direction, startN, endN) {
		var _self = this;
		var nodeList = [];
		var linkList = [];
		if (direction == 0) {
			var flag1 = getPath(startN, endN);
			var flag2 = getPath(endN, startN);
			if (flag1 && flag2) {}
		} else if (direction == 1) {
			if (getPath(startN, endN)) {}
		} else if (direction == 2) {
			if (getPath(endN, startN)) {}
		}
		this.refresh();

		function getPath(startNode, endNode) {
			var hasPassedNodes = [];
			var hasSureFlagNodes = [];
			var waitList = {};
			if ((startNode.outLinks || []).length == 0 || (endNode.inLinks || []).length == 0) {
				return true;
			} else {
				nodeList.push(startNode);
				_self.scene.addToSelected(startNode);
				hasPassedNodes.push(startNode);
				var noPath = true;
				startNode.outLinks.forEach(function(l) {
					if (hasPassedNodes.indexOf(l.target) == -1) {
						hasPassedNodes.push(l.target);
						var flag = getPathFlag(l.target);
						if (flag != undefined) {
							l.target.selected = flag;
							l.selected = flag;
							if (hasSureFlagNodes.indexOf(l.target) == -1) {
								hasSureFlagNodes.push(l.target);
								changeWaitStatus(l.target);
							}
							if (flag) {
								noPath = false;
								_self.scene.addToSelected(l.target);
								nodeList.push(l.target);
								linkList.push(l);
							}
						} else {
							pushWaitList(l.target, l);
						}
					} else {
						if (hasSureFlagNodes.indexOf(l.target) == -1) {
							pushWaitList(l.target, l);
						} else {
							if (hasSureFlagNodes.indexOf(l.target) != -1) {
								l.selected = l.target.selected;
								if (l.target.selected) {
									noPath = false;
									_self.scene.addToSelected(l.target);
									nodeList.push(l.target);
									linkList.push(l);
								}
							}
						}
					}
				});
				return noPath;
			};

			function changeWaitStatus(node) {
				var nodeid = node.id;
				if (waitList[nodeid] != undefined && waitList[nodeid].length > 0) {
					var length = waitList[nodeid].length;
					for (var i = 0; i < length; i++) {
						var _l = waitList[nodeid][i];
						if (!_l.selected) {
							_l.selected = node.selected;
							if (_l.selected) {
								linkList.push(_l);
							}
						}
						if (!_l.source.selected) {
							_l.source.selected = node.selected;
							if (_l.source.selected) {
								_self.scene.addToSelected(_l.source);
								nodeList.push(_l.source);
							}
							if (hasSureFlagNodes.indexOf(_l.source) == -1) {
								hasSureFlagNodes.push(_l.source);
								changeWaitStatus(_l.source)
							}
						}
					}
				}
			};

			function pushWaitList(node, link) {
				if (waitList[node.id] == undefined) {
					waitList[node.id] = [];
				}
				if (waitList[node.id].indexOf(link) == -1) {
					waitList[node.id].push(link);
				}
			};

			function getPathFlag(node) {
				if (node.id == endNode.id) {
					return true;
				} else if ((node.outLinks || []).length == 0) {
					return false;
				} else {
					var outFlag = false;
					node.outLinks.forEach(function(l) {
						if (hasPassedNodes.indexOf(l.target) == -1) {
							hasPassedNodes.push(l.target);
							var flag = getPathFlag(l.target);
							if (flag != undefined) {
								l.target.selected = flag;
								l.selected = flag;
								if (hasSureFlagNodes.indexOf(l.target) == -1) {
									hasSureFlagNodes.push(l.target);
									changeWaitStatus(l.target);
								}
								if (flag) {
									_self.scene.addToSelected(l.target);
									nodeList.push(l.target);
									linkList.push(l);
									outFlag = true;
								}
							} else {
								pushWaitList(l.target, l);
								if (!outFlag) {
									outFlag = undefined;
								}
							}
						} else {
							if (hasSureFlagNodes.indexOf(l.target) == -1) {
								pushWaitList(l.target, l);
								if (!outFlag) {
									outFlag = undefined;
								}
							} else {
								if (hasSureFlagNodes.indexOf(l.target) != -1) {
									l.selected = l.target.selected;
									if (l.target.selected) {
										outFlag = true;
										_self.scene.addToSelected(l.target);
										nodeList.push(l.target);
										linkList.push(l);
									}
								}
							}
						}
					});
					return outFlag;
				}
			}
			hasPassedNodes = null;
			hasSureFlagNodes = null;
			waitList = null;
		};
	};

	VisualGraph.prototype.findNDegreeRelates = function(degree) {
		var _self = this;
		var nodeList = [];
		this.nodes.forEach(function(n) {
			var total = (n.inLinks || []).length + (n.outLinks || []).length;
			if (total >= degree) {
				n.selected = true;
				_self.scene.addToSelected(n);
				nodeList.push(n);
			}
		});
		this.refresh();
	};

	VisualGraph.prototype.nLayerRelates = function(nodeLabel, layerNum) {
		var _self = this;
		var currentNode = _self.nodes.filter(function(n) {
			return (n.label + '') == nodeLabel;
		})[0];
		var middleNode = [];
		var nowOutsideNode = {};
		var nodeList = [];
		if (null != currentNode) {
			currentNode.selected = true;
			_self.scene.addToSelected(currentNode);
			nodeList.push(currentNode);
			recursive(currentNode, layerNum);
			this.refresh();
		}

		function recursive(node, nLayer) {
			if (nLayer > 1) {
				if (layerNum == nLayer && middleNode.indexOf(node) == -1) {
					middleNode.push(node);
				}
				var level = layerNum - nLayer;
				var inLinks = node.inLinks || [];
				var outLinks = node.outLinks || [];
				inLinks.forEach(function(l) {
					if (middleNode.indexOf(l.source) == -1) {
						middleNode.push(l.source);
						if (nowOutsideNode[level] == undefined) {
							nowOutsideNode[level] = [];
						}
						nowOutsideNode[level].push(l.source);
					}
				});
				outLinks.forEach(function(l) {
					if (middleNode.indexOf(l.target) == -1) {
						middleNode.push(l.target);
						if (nowOutsideNode[level] == undefined) {
							nowOutsideNode[level] = [];
						}
						nowOutsideNode[level].push(l.target);
					}
				});
				if (nowOutsideNode[level] == undefined) {
					return;
				}
				nowOutsideNode[level].forEach(function(l) {
					recursive(l, nLayer - 1);
				});
			} else if (nLayer == 1) {
				var inLinks = node.inLinks || [];
				var outLinks = node.outLinks || [];
				inLinks.forEach(function(l) {
					if (middleNode.indexOf(l.source) == -1) {
						l.source.selected = true;
						_self.scene.addToSelected(l.source);
						nodeList.push(l.source);
					}
				});
				outLinks.forEach(function(l) {
					if (middleNode.indexOf(l.target) == -1) {
						l.target.selected = true;
						_self.scene.addToSelected(l.target);
						nodeList.push(l.target);
					}
				});
			}
		};
	};


	VisualGraph.prototype.getLineTypeMap = function() {
		return this.lineTypeMapStyle;
	};

	VisualGraph.prototype.getALLLineTypeCounter = function() {
		var self = this;
		var relationTypeMap = new Map();
		(self.links || []).forEach(function(link) {
			var typeValue = relationTypeMap.get(link.type);
			if (typeValue == null) {
				relationTypeMap.set(link.type, {
					label: link.label,
					num: 1
				});
			} else {
				typeValue.num++;
			}
		});
		return relationTypeMap;
	};

	VisualGraph.prototype.renderNodeStyle = function(typeMapStyle) {
		var self = this;
		this.typeMapStyle = typeMapStyle;
		this.nodes.forEach(function(n) {
			var nodeType = typeMapStyle[n.type];
			n.fillColor = self.converHexToRGB(nodeType['color']);
			n.shape = nodeType['shape'];
		});
		this.refresh();
	};

	VisualGraph.prototype.removeCurrentLink = function() {
		this.scene.remove(this.currentLink);
		this.currentLink = null;
		this.refresh();
	};

	VisualGraph.prototype.renderLineStyle = function(lineTypeMapStyle) {
		var self = this;
		this.lineTypeMapStyle = lineTypeMapStyle;
		this.links.forEach(function(l) {
			var lineType = lineTypeMapStyle[l.label || 'default'];
			l.colorType = null;
			l.strokeColor = self.converHexToRGB(lineType['color']);
			l.lineType = lineType['lineType'];
		});
		this.refresh();
	};

	VisualGraph.prototype.setNodeLabelWithDegree = function(degree) {
		this.nodes.forEach(function(n) {
			if (((n.inLinks || []).length + (n.outLinks || []).length) >= degree) {
				n.showlabel = true;
			} else {
				n.showlabel = false;
				n.text = null;
			}
		});
		this.refresh();
	};

	VisualGraph.prototype.filterNodes = function(type, condition, value) {
		this.nodes.forEach(function(n) {
			var degree = 0;
			if (type == 'degree') {
				degree = (n.inLinks || []).length + (n.outLinks || []).length;
			} else if (type == 'outdegree') {
				degree = (n.outLinks || []).length;
			} else if (type == 'indegree') {
				degree = (n.inLinks || []).length;
			}

			if (condition == 1) {
				if (degree > value) {
					n.visible = true;
				} else {
					n.visible = false;
				}
			} else if (condition == 2) {
				if (degree == value) {
					n.visible = true;
				} else {
					n.visible = false;
				}
			} else if (condition == 3) {
				if (degree < value) {
					n.visible = true;
				} else {
					n.visible = false;
				}
			}
		});

		this.links.forEach(function(l) {
			if (l.source.visible == false || l.target.visible == false) {
				l.visible = false;
			} else {
				l.visible = true;
			}
		});
		this.refresh();
	};

	VisualGraph.prototype.filterLinks = function(condition, value) {
		this.links.forEach(function(l) {
			if (l.source.visible == true && l.target.visible == true) {
				if (condition == 1) {
					if (l.weight > value) {
						l.visible = true;
					} else {
						l.visible = false;
					}
				} else if (condition == 2) {
					if (l.weight == value) {
						l.visible = true;
					} else {
						l.visible = false;
					}
				} else if (condition == 3) {
					if (l.weight < value) {
						l.visible = true;
					} else {
						l.visible = false;
					}
				}
			} else {
				l.visible = false;
			}
		});
		this.refresh();
	};

	VisualGraph.prototype.getTypeMap = function() {
		return this.typeMapStyle;
	};

	VisualGraph.prototype.nodeMapColorsByDegree = function(propType, colorArr) {
		var self = this;
		var degreeArr = {};
		self.nodes.forEach(function(n) {
			n.outdegree = (n.outLinks || []).length;
			n.indegree = (n.inLinks || []).length;
			n.degree = n.outdegree + n.indegree;
			if (propType == 'degree') {
				degreeArr[n.degree + ''] = 1;
			} else if (propType == 'outdegree') {
				degreeArr[n.outdegree + ''] = 1;
			} else {
				degreeArr[n.indegree + ''] = 1;
			}
		});
		var degrees = [];
		for (var d in degreeArr) {
			degrees.push(d);
		}
		degrees.sort(function(d1, d2) {
			return Number(d1) > Number(d2) ? 1 : -1;
		});
		var ctool = new DGraph.ColorUtils();
		var colors = ctool.getStepColors(colorArr[0], colorArr[1], degrees.length);
		self.nodes.forEach(function(n) {
			var position = 0;
			if (propType == 'degree') {
				position = degrees.indexOf(n.degree + '');
			} else if (propType == 'outdegree') {
				position = degrees.indexOf(n.outdegree + '');
			} else {
				position = degrees.indexOf(n.indegree + '');
			}
			n.fillColor = colors[position].replace('rgb(', '').replace(')', '');
		});
		this.refresh();
	};

	VisualGraph.prototype.setLineDirected = function(isDirect) {
		this.links.forEach(function(l) {
			l.showArrow = isDirect;
		});
		this.refresh();
	};

	VisualGraph.prototype.setLineDashed = function(isDashed) {
		var self = this;
		var dashed = [0];
		if (isDashed) {
			dashed = [8, 5];
		}
		this.links.forEach(function(l) {
			l.lineDash = dashed;
		});
		this.refresh();
	};

	VisualGraph.prototype.setNodeSize = function(nodeSize) {
		nodeSize = Number(nodeSize) || 60;
		this.config.node.size = nodeSize;
		this.nodes.map(function(node) {
			node.radius = Math.round(nodeSize);
		});
		this.refresh();
	};

	VisualGraph.prototype.setNodeColor = function(hexColor) {
		var rgbColor = this.converHexToRGB(hexColor);
		this.defaultNodeColor = rgbColor;
		this.nodes.map(function(node) {
			node.fillColor = rgbColor;
		});
		this.refresh();
	};

	VisualGraph.prototype.covertSencePoint = function(event) {
		return DGraph.util.mouseCoords(event);
	};

	VisualGraph.prototype.addNodeForDrag = function(_node, callback) {
		var self = this;
		self.stage.removeEventListener('mousemove');
		self.stage.mousemove(function(event) {
			var p = self.scene.toSceneEvent(event);
			self.stage.removeEventListener('mousemove');

			_node.id = (_node.id == null ? self.nodeIdIndex++ : _node.id);
			_node.x = p.x;
			_node.y = p.y;

			var node = self.newNode(_node);
			node.fixed = true;
			self.nodes.push(node);
			self.scene.add(node);
			self.refresh();
			
			if (callback && typeof callback === 'function') {
				callback(node);
			}
		});
	};

	VisualGraph.prototype.showAll = function() {
		this.nodes.map(function(n) {
			if (!n.visible) {
				n.visible = true;
			}
		});
		this.links.map(function(l) {
			if (!l.visible) {
				l.visible = true;
			}
		});
		self.refresh();
	};

	VisualGraph.prototype.filterChangeVisible = function(entityFalse, linkFalse, infoFilterParams) {
		var _self = this;
		_self.showAll();

		if (entityFalse.length > 0) {
			_self.nodes.map(function(n) {
				if (n.type && entityFalse.indexOf(n.type) != -1) {
					n.visible = false;
				}
			});
		}

		if (linkFalse.length > 0) {
			_self.links.map(function(l) {
				if (l.text && linkFalse.indexOf(l.text) != -1) {
					l.visible = false;
				}
			});
		}

		if (infoFilterParams['linkCount']) {
			var _compare = infoFilterParams['linkCount'][0];
			var _input = infoFilterParams['linkCount'][1];
			_self.nodes.forEach(function(n) {
				var degree = (n.inLinks || []).length + (n.outLinks || []).length;
				if (!showOrHide(_compare, _input, degree)) {
					n.visible = false;
				}
			});
		}

		if (infoFilterParams['linkOut']) {
			var _compare = infoFilterParams['linkOut'][0];
			var _input = infoFilterParams['linkOut'][1];
			_self.nodes.forEach(function(n) {
				var degree = (n.outLinks || []).length;
				if (!showOrHide(_compare, _input, degree)) {
					n.visible = false;
				}
			});
		}

		if (infoFilterParams['linkIn']) {
			var _compare = infoFilterParams['linkIn'][0];
			var _input = infoFilterParams['linkIn'][1];
			_self.nodes.forEach(function(n) {
				var degree = (n.inLinks || []).length;
				if (!showOrHide(_compare, _input, degree)) {
					n.visible = false;
				}
			});
		}

		if (infoFilterParams['linkWeight']) {
			var _compare = infoFilterParams['linkWeight'][0];
			var _input = infoFilterParams['linkWeight'][1];
			_self.links.forEach(function(l) {
				if (!showOrHide(_compare, _input, l.weight)) {
					l.visible = false;
				}
			});
		}

		if (infoFilterParams['entityDesc']) {
			var _compare = infoFilterParams['entityDesc'][0];
			var _input = infoFilterParams['entityDesc'][1];
			_self.nodes.forEach(function(n) {
				var nodeValue = n.value;
				if (_compare == 1) {
					if (nodeValue != _input) {
						n.visible = false;
					}
				} else if (_compare == 2) {
					if (nodeValue.indexOf(_input) == -1) {
						n.visible = false;
					}
				}
			});
		}

		_self.links.forEach(function(l) {
			if (!l.source.visible || !l.target.visible) {
				l.visible = false;
			}
		});
		
		_self.refresh();

		function showOrHide(_compareType, compareValue, _degree) {
			if (_compareType == 1) {
				if (_degree > compareValue) {
					return true;
				} else {
					return false;
				}
			} else if (_compareType == 2) {
				if (_degree == compareValue) {
					return true;
				} else {
					return false;
				}
			} else {
				if (_degree < compareValue) {
					return true;
				} else {
					return false;
				}
			}
			return true;
		}
	};

	VisualGraph.prototype.delSelect = function() {
		var _self = this;
		_self.nodes.forEach(function(_node) {
			if (_node.selected) {
				_self.removeOneNode(_node);
			}
		});
		_self.refresh();
	};

	VisualGraph.prototype.removeOneNode = function(node) {
		var _self = this;
		if (node) {
			var links = [];
			var index = _self.nodes.indexOf(node);
			if (index > -1) {
				(node.inLinks || []).forEach(function(l) {
					links.push(l);
				});

				(node.outLinks || []).forEach(function(l) {
					links.push(l);
				});

				_self.nodes.splice(index, 1);
				_self.scene.remove(node);
			}

			links.forEach(function(l) {
				index = _self.links.indexOf(l);
				if (index > -1) {
					_self.links.splice(index, 1);
					_self.scene.remove(l);
				}
			});
			node = null;
			_self.refresh();
		}
	};

	VisualGraph.prototype.clearAll = function() {
		if (this.scene) {
			this.scene.clear();
		}
		this.nodes = [];
		this.links = [];
		this.nodeIdIndex = 1;
		this.currentNode = null;
		this.currentLink = null;
		this.typeMapStyle = {};
		this.lineTypeMapStyle = {};
		this.currentLayout = null;
		this.clusterBoxes = [];
		this.currentCluster = null;

		this.drawLinkFlag = false;
		this.virLink = null;
		
		/* this.autoLayout = false;
		this.forceOptions = {
			size: [this.canvas.width, this.canvas.height],
			alpha: 0.5,
			friction: 0.9,
			linkDistance: 100,
			linkStrength: 0.09,
			charge: -200,
			gravity: 0.025,
			theta: 0.99,
			noverlap:false,
			loopName: null
		}; */
		this.setZoom('zoom1');
		this.stopRunningLayout(10);
		this.refresh();
	};

	VisualGraph.prototype.rightMenuOprate = function(optType) {
		var self = this;
		switch (optType) {
			case 'allSelect':
				self.selectAll();
				break;
			case 'rebackSel':
				self.reverseSelect();
				break;
			case 'showAll':
				self.showAll();
				break;
			case 'selRelate':
				self.selectRelate();
				break;
			case 'showNodes':
				self.showNodes();
				break;
			case 'showSelNode':
				self.showSelected();
				break;
			case 'hideSelNode':
				self.hideSelected();
				break;
			case 'delSelect':
				self.delSelect();
				break;
			case 'clearAll':
				this.clearAll();
				break;
			case 'hideIsolatedNodes':
				self.hideIsolatedNodes();
				break;
			case 'showLinks':
				self.showAllLink();
				break;
			case 'hideLinks':
				self.hideAllLink();
				break;
			case 'sourcelphaMap':
				self.nodeMapAlphaByDegree();
				break;
			case 'saveImage':
				self.saveImage(5000, 5000);
				break;
			case 'deleteNode':
				self.deleteNode(self.currentNode);
				self.currentNode = null;
				break;
			case 'nodeConnent':
				self.begainAddLine(self.currentNode);
				break;
			case 'delEdge':
				self.deleteLink(self.currentLink);
				self.currentLink = null;
				break;
			case 'expanded':
				self.expanded(self.currentNode);
				break;
			case 'contract':
				self.contract(self.currentNode);
				break;
			case 'directedLine':
				self.setLineDirected(true);
				break;
			case 'undirectedLine':
				self.setLineDirected(false);
				break;
			case 'showLineLabel':
				self.showLinkLabel(true);
				break;
			case 'hideLineLabel':
				self.showLinkLabel(false);
				break;
			case 'Rline':
				self.setLineDashed(false);
				break;
			case 'Vline':
				self.setLineDashed(true);
				break;
			default:
				break;
		}
	};

	VisualGraph.prototype.begainAddLine = function(node) {
		this.drawLinkFlag = true;
	};

	VisualGraph.prototype.drawVirtualLine = function(nodeA, nodeB) {
		var self = this;
		var line = self.newEdge(nodeA, nodeB);
		self.scene.add(line);
		return line;
	};

	VisualGraph.prototype.drawVirtualNode = function(config) {
		var self = this;
		var node = self.newNode(config || {
			x: 10,
			y: 10,
			size: 5
		});
		node.dragable = false;
		node.fixed = true;
		self.scene.add(node);
		return node;
	};

	VisualGraph.prototype.removeLine = function(line) {
		this.scene.remove(line);
		this.refresh();
	};

	VisualGraph.prototype.getMousePosition = function(event) {
		var p = DGraph.util.mouseCoords(event);
		return {
			x: p.x,
			y: p.y
		};
	};

	VisualGraph.prototype.computeParentAngle = function(node) {
		var angleRadian = 0;
		var r = 100;

		var parentNodes = [],
			parentFlag = true;;
		(node.inLinks || []).forEach(function(l) {
			parentNodes.push(l.source);
		});

		if (parentNodes.length == 0) {
			parentFlag = false;
			(node.outLinks || []).forEach(function(l) {
				parentNodes.push(l.target);
			});
		}
		var maxParentNode;
		maxParentNode = parentNodes.sort(function(n1, n2) {
			if (parentFlag) {
				return ((n1.outLinks || []).length + (n1.inLinks || []).length) < ((n2.outLinks || []).length + (n2.inLinks ||
					[]).length);
			} else {
				return ((n1.outLinks || []).length + (n1.inLinks || []).length) > ((n2.outLinks || []).length + (n2.inLinks ||
					[]).length);
			}
		})[0];

		if (maxParentNode) {
			var xp = maxParentNode.x;
			var yp = maxParentNode.y;
			var x0 = node.x;
			var y0 = node.y;
			var dist = Math.sqrt(Math.pow(xp - x0, 2) + Math.pow(yp - y0, 2));

			var k = r / (dist - r);
			var xc = (x0 + (k * xp)) / (1 + k);

			var val = (xc - x0) / r;
			if (val < -1) {
				val = -1;
			}
			if (val > 1) {
				val = 1;
			}
			angleRadian = Math.acos(val);

			if (yp > y0) {
				angleRadian = 2 * Math.PI - angleRadian;
			}
		}
		return angleRadian;
	};

	VisualGraph.prototype.activeAddNodeLinks = function(_nodes, _links) {
		var _self = this;

		var baseX = (_self.canvas.width / 2) || 500,
			baseY = (_self.canvas.height / 2) || 300;
		if (_self.currentNode != null) {
			baseX = _self.currentNode.cx, baseY = _self.currentNode.cy;
		}
		var newNodes = [],
			newLinks = [];
		let radius, angle;
		const initialAngle = Math.PI * (3 - Math.sqrt(5));
		(_nodes || []).forEach(function(_node, i) {
			radius = 5 * Math.sqrt(i);
			angle = i * initialAngle;
			_node.x = _node.x || (baseX + radius * Math.cos(angle));
			_node.y = _node.y || (baseY + radius * Math.sin(angle));

			var hasNodes = _self.nodes.filter(function(n) {
				return n.id == _node.id;
			});
			if (hasNodes.length == 0) {
				if (_self.currentNode != null) {
					if (_node.id != _self.currentNode.id) {
						var node = _self.newNode(_node);
						_self.nodes.push(node);
						_self.scene.add(node);

						newNodes.push(node);
					} else {
						_self.currentNode.id = _node.id;
					}
				} else {
					var node = _self.newNode(_node);
					_self.nodes.push(node);
					_self.scene.add(node);

					newNodes.push(node);
				}
			}
		});

		var _nodes_ = _self.nodes;
		(_links || []).forEach(function(_link) {
			var hasLinks = _self.links.filter(function(l) {
				return l.source.id == _link.source && l.target.id == _link.target;
			});

			if (hasLinks.length == 0) {
				var sourceNode = _nodes_.filter(function(_node) {
					return _node.id == _link.source;
				})[0];
				var targetNode = _nodes_.filter(function(_node) {
					return _node.id == _link.target;
				})[0];

				if (sourceNode != null && targetNode != null) {
					var link = _self.newEdge(sourceNode, targetNode);
					link.id = _link.id||'';
					link.type = _link.type || 'default';
					link.label = _link.label || '';
					link.showlabel = _link.showlabel || _self.config.link.label.show;
					link.lineWidth = Number(_link.lineWidth) || _self.config.link.lineWidth;
					link.weight = Number(_link.weight) || 1;
					link.lineType = _link.lineType || _self.config.link.lineType;
					link.lineDash = _link.lineDash || _self.config.link.lineDash;
					link.strokeColor = _link.color || _self.config.link.color;
					link.font = _link.font || _self.config.link.label.font;
					link.fontColor = _link.fontColor || _self.config.link.label.color;
					link.properties = _link.properties || {};

					_self.links.push(link);
					_self.scene.add(link);

					newLinks.push(link);
				}
			}
		});

		var unResetNodes = _self.nodes.filter(function(n) {
			return !n.hasOwnProperty('charge');
		});

		unResetNodes.forEach(function(n) {
			newNodes.push(n);
		});

		if (_self.currentNode != null) {
			newNodes.push(_self.currentNode);
		}

		if (newNodes.length > 1) {
			if (_self.currentNode != null) {
				(_self.currentNode.inLinks || []).forEach(function(l) {
					var isNewNode = newNodes.filter(function(n) {
						return n == l.source;
					});
					if (isNewNode == null || isNewNode.length == 0) {
						l.source.fixed = true;
					}
				});
				_self.currentNode.fixed = true;
			}
			_self.runLayoutEngin(0.5);
		}
	};

	VisualGraph.prototype.stopRunningLayout = function(layzeTime) {
		var self = this;
		setTimeout(function() {
			cancelAnimationFrame(self.forceOptions.loopName);
			self.forceOptions.loopName = null;
			self.forceOptions.alpha = 0;
		}, layzeTime);
	};

	VisualGraph.prototype.loopRunLayout = function(callback) {
		var _self = this;
		if (typeof callback == 'function') {
			cancelAnimationFrame(_self.forceOptions.loopName);
			_self.forceOptions.loopName = null;

			function loop() {
				cancelAnimationFrame(_self.forceOptions.loopName);
				callback();
				_self.refresh();
				
				_self.forceOptions.loopName = requestAnimationFrame(loop);
			};
			_self.forceOptions.loopName = requestAnimationFrame(loop);
		}
	};

	VisualGraph.prototype.initLayoutParams = function(nodes,links) {
		var _self = this;
		_self.nodes.forEach(function(n, i) {
			n.weight = (n.weight==null?1:n.weight);
			n.px = n.x;
			n.py = n.y;
			n.charge = n.charge || _self.forceOptions.charge;
		});

		_self.links.forEach(function(l, i) {
			var source = l.source,target = l.target;
			l.distance = l.distance || _self.forceOptions.linkDistance;
			l.strength = l.strength || _self.forceOptions.linkStrength;

			++source.weight;
			++target.weight;
		});
	};

	VisualGraph.prototype.runLayoutEngin = function(alpha) {
		var _self = this;
		if (_self.nodes.length == 0) {
			return;
		}
		
		_self.autoLayout = true;
		_self.forceOptions.alpha = alpha || 0.5;
		_self.loopRunLayout(tick);

		function tick() {
			if ((_self.forceOptions.alpha *= .99) < .001){
				_self.stopRunningLayout(10);
				_self.forceOptions.alpha = 0;
				return;
			}
			
			var q, i, o, s, t, l, k, x, y;
			_self.links.forEach(function(link, i) {
				s = link.source;
				t = link.target;
				x = t.x - s.x;
				y = t.y - s.y;
				if (l = (x * x + y * y)) {
					l = _self.forceOptions.alpha * link.strength * ((l = Math.sqrt(l)) - link.distance) / l;
					x *= l;
					y *= l;
					t.x -= x * (k = s.weight / (t.weight + s.weight));
					t.y -= y * k;
					s.x += x * (k = 1 - k);
					s.y += y * k;
				}
			});

			var n = _self.nodes.length;
			if (k = _self.forceOptions.alpha * _self.forceOptions.gravity) {
				x = _self.forceOptions.size[0] / 2;
				y = _self.forceOptions.size[1] / 2;
				i = -1;
				if (k) {
					while (++i < n) {
						o = _self.nodes[i];

						o.x += (x - o.x) * k;
						o.y += (y - o.y) * k;
					}
				}
			}

			if (_self.forceOptions.charge) {
				forceAccumulate(q = quadtree(_self.nodes), _self.forceOptions.alpha);
				i = -1;
				while (++i < n) {
					if (!(o = _self.nodes[i]).fixed) {
						q.visit(repulse(o));
					}
				}
			}

			i = -1;
			while (++i < n) {
				o = _self.nodes[i];
				if (o.fixed) {
					if (!o.isDragging) {
						o.x = o.px;
						o.y = o.py;
					} else {
						o.px = o.x;
						o.py = o.y;
					}
				} else {
					o.x -= (o.px - (o.px = o.x)) * _self.forceOptions.friction;
					o.y -= (o.py - (o.py = o.y)) * _self.forceOptions.friction;
					
					if(_self.forceOptions.noverlap == true){
						q.visit(collide(o));
					}
				}
			}

			function repulse(node) {
				return function(quad, x1, y1, x2, y2) {
					if (quad.point !== node) {
						var dx = quad.cx - node.x,
							dy = quad.cy - node.y,
							dn = 1 / Math.sqrt(dx * dx + dy * dy);

						if ((x2 - x1) * dn < _self.forceOptions.theta) {
							var k = quad.charge * dn * dn;
							node.px -= dx * k;
							node.py -= dy * k;
							return true;
						}

						if (quad.point && isFinite(dn)) {
							var k = quad.pointCharge * dn * dn;
							node.px -= dx * k;
							node.py -= dy * k;
						}
					}
					return !quad.charge;
				};
			};
			
			function collide(node) {
				var r = (node.radius*node.scaleX) + 1,
			      nx1 = node.x - r,
			      nx2 = node.x + r,
			      ny1 = node.y - r,
			      ny2 = node.y + r;
				return function(quad, x1, y1, x2, y2) {
					if(quad.point && (quad.point !== node)) {
						var x = node.x - quad.point.x,
						  y = node.y - quad.point.y,
						  l = Math.sqrt(x * x + y * y),
						  r = (node.radius*node.scaleX) + quad.point.radius;
						if (l < r) {
							l = (l - r) / l * .5;
							node.x -= x *= l;
							node.y -= y *= l;
							quad.point.x += x;
							quad.point.y += y;
						}
					}
					return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
				};
			};
		};

		function forceAccumulate(quad, alpha) {
			var cx = 0,
				cy = 0;
			quad.charge = 0;
			if (!quad.leaf) {
				var nodes = quad.nodes,
					n = nodes.length,
					i = -1,
					c;
				while (++i < n) {
					c = nodes[i];
					if (c == null) {
						continue;
					}
					forceAccumulate(c, alpha);
					quad.charge += c.charge;
					cx += c.charge * c.cx;
					cy += c.charge * c.cy;
				}
			}

			if (quad.point) {
				if (!quad.leaf) {
					quad.point.x += Math.random() - 0.5;
					quad.point.y += Math.random() - 0.5;
				}
				var k = _self.forceOptions.alpha * quad.point.charge;
				quad.charge += quad.pointCharge = k;
				cx += k * quad.point.x;
				cy += k * quad.point.y;
			}

			quad.cx = cx / quad.charge;
			quad.cy = cy / quad.charge;
		};

		function quadtree(points, x1, y1, x2, y2) {
			var p, i = -1,
				n = points.length;
			if (n && isNaN(points[0].x)) {
				points = points.map(function(p) {
					return {
						x: p[0],
						y: p[1]
					};
				});
			}

			if (arguments.length < 5) {
				if (arguments.length === 3) {
					y2 = x2 = y1;
					y1 = x1;
				} else {
					x1 = y1 = Infinity;
					x2 = y2 = -Infinity;
					while (++i < n) {
						p = points[i];

						if (p.x < x1) {
							x1 = p.x;
						}
						if (p.y < y1) {
							y1 = p.y;
						}
						if (p.x > x2) {
							x2 = p.x;
						}
						if (p.y > y2) {
							y2 = p.y;
						}
					}
					var dx = x2 - x1,
						dy = y2 - y1;
					if (dx > dy) {
						y2 = y1 + dx;
					} else {
						x2 = x1 + dy;
					}
				}
			};

			function insert(n, p, x1, y1, x2, y2) {
				if (isNaN(p.x) || isNaN(p.y)) {
					return;
				}
				if (n.leaf) {
					var v = n.point;
					if (v) {
						if ((Math.abs(v.x - p.x) + Math.abs(v.y - p.y)) < 0.01) {
							insertChild(n, p, x1, y1, x2, y2);
						} else {
							n.point = null;
							insertChild(n, v, x1, y1, x2, y2);
							insertChild(n, p, x1, y1, x2, y2);
						}
					} else {
						n.point = p;
					}
				} else {
					insertChild(n, p, x1, y1, x2, y2);
				}
			};

			function insertChild(n, p, x1, y1, x2, y2) {
				var sx = (x1 + x2) * 0.5,
					sy = (y1 + y2) * 0.5,
					right = p.x >= sx,
					bottom = p.y >= sy,
					i = (bottom << 1) + right;
				n.leaf = false;
				n = n.nodes[i] || (n.nodes[i] = {
					leaf: true,
					nodes: [],
					point: null
				});
				if (right) {
					x1 = sx;
				} else {
					x2 = sx;
				}
				if (bottom) {
					y1 = sy;
				} else {
					y2 = sy;
				}
				insert(n, p, x1, y1, x2, y2);
			};

			function quadtreeVisit(f, node, x1, y1, x2, y2) {
				if (!f(node, x1, y1, x2, y2)) {
					var sx = (x1 + x2) * 0.5,
						sy = (y1 + y2) * 0.5,
						children = node.nodes;
					if (children[0]) {
						quadtreeVisit(f, children[0], x1, y1, sx, sy);
					}
					if (children[1]) {
						quadtreeVisit(f, children[1], sx, y1, x2, sy);
					}
					if (children[2]) {
						quadtreeVisit(f, children[2], x1, sy, sx, y2);
					}
					if (children[3]) {
						quadtreeVisit(f, children[3], sx, sy, x2, y2);
					}
				}
			};

			var root = {
				leaf: true,
				nodes: [],
				point: null
			};
			root.add = function(p) {
				insert(root, p, x1, y1, x2, y2);
			};

			root.visit = function(f) {
				quadtreeVisit(f, root, x1, y1, x2, y2);
			};
			points.forEach(root.add);
			return root;
		};
	};
	
	VisualGraph.prototype.findNodeByAttr = function(attr,value) {
		var nodes = this.nodes.filter(function(n) {
			return n[attr] == value;
		});
		if (nodes.length > 0) {
			var node = nodes[0];
			return node;
		}
		return null;
	};

	VisualGraph.prototype.findNodeById = function(nodeId) {
		var nodes = this.nodes.filter(function(n) {
			return n.id == nodeId;
		});
		if (nodes.length > 0) {
			var node = nodes[0];
			node.selected = true;
			node.visible = true;
			this.scene.addToSelected(node);
			this.focusTargetEle(node);
		}
	};

	VisualGraph.prototype.updateNodeLabel = function(nodeId, nodeName) {
		var node = this.nodes.filter(function(_node) {
			return _node.id == nodeId;
		})[0];
		if (node) {
			n.label = nodeName;
			n.text = nodeName;
			this.refresh();
		}
	};

	var VisGraph = VisualGraph;
	if (typeof module !== 'undefined' && typeof exports === 'object') {
		module.exports = VisGraph;
	} else if (typeof define === 'function' && (define.amd || define.cmd)) {
		define(function() {
			return VisGraph;
		});
	} else {
		this.VisGraph = VisGraph;
	}
}).call(this || (typeof window !== 'undefined' ? window : global));
