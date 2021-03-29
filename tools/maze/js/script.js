/*
Arefly Maze
- A maze game based on JavaScript.

Copyright (C) 2013 Arefly, Arefly.com
Author: eflyjason@gmail.com
License: LGPL

LastUpdate: 2013-12-13
*/

function MG(ob, w, h) {
	this.ob = document.getElementById(ob);
	this.w = w || 20;
	this.h = h || 20;
	this.gridSize = 20;
	this.gridStr = "";
	this.grids = [];
	this.gridOb = [];
	this.isMoved = false;
	this.markHistory = false;
	this.markHistory2 = false;
}

MG.prototype = {
	set: function (sets) {
		if (sets.width) this.w = sets.width;
		if (sets.height) this.h = sets.height;
		return this;
	},
	create: function () {
		this.init();
		return this._walk(Math.floor(Math.random() * this.grids.length));
	},
	_walk: function (startPos) {
		this._walkHistory = [];
		this._walkHistory2 = [];
		var curPos = startPos;
		while (this._getNext0() != -1) {
			curPos = this._step(curPos);
			if (typeof(curPos) != "number") break;
		}
		return this;
	},
	_getTargetSteps: function (curPos) {
		var p = 0,
			a = [];

		p = curPos - this.w;
		if (p > 0 && this.grids[p] == 0 && !this._isRepeating(p))
			a.push(p);
		else
			a.push(-1);

		p = curPos + 1;
		if (p % this.w != 0 && this.grids[p] == 0 && !this._isRepeating(p))
			a.push(p);
		else
			a.push(-1);

		p = curPos + this.w;
		if (p < this.grids.length && this.grids[p] == 0 && !this._isRepeating(p))
			a.push(p);
		else
			a.push(-1);

		p = curPos - 1;
		if (curPos % this.w != 0 && this.grids[p] == 0 && !this._isRepeating(p))
			a.push(p);
		else
			a.push(-1);

		return a;
	},
	_noStep: function () {
		for (var i = 0; i < this._targetSteps.length; i ++)
			if (this._targetSteps[i] != -1)
				return false;
		return true;
	},
	_step: function (curPos) {
		this._targetSteps = this._getTargetSteps(curPos);
		if (this._noStep()) {
			var tmp = this._walkHistory.pop();
			if (typeof(tmp) != "number") return false;
			this._walkHistory2.push(tmp);
			return this._step(tmp);
		}

		var r = Math.floor(Math.random() * 4),
			nextPos;

		while (this._targetSteps[r] == -1) {
			r = Math.floor(Math.random() * 4);
		}
		nextPos = this._targetSteps[r];

		var isCross = false;
		if (this.grids[nextPos] != 0)
			isCross = true;

		if (r == 0) {
			this.grids[curPos] ^= 1;
			this.grids[nextPos] ^= 4;
		} else if (r == 1) {
			this.grids[curPos] ^= 2;
			this.grids[nextPos] ^= 8;
		} else if (r == 2) {
			this.grids[curPos] ^= 4;
			this.grids[nextPos] ^= 1;
		} else if (r == 3) {
			this.grids[curPos] ^= 8;
			this.grids[nextPos] ^= 2;
		}
		this._walkHistory.push(curPos);

		return isCross ? false : nextPos;
	},
	_isRepeating: function (p) {
		for (var i = 0; i < this._walkHistory.length; i ++) {
			if (this._walkHistory[i] == p) return true;
		}
		for (i = 0; i < this._walkHistory2.length; i ++) {
			if (this._walkHistory2[i] == p) return true;
		}
		return false;
	},
	_getNext0: function () {
		for (var i = 0, l = this.grids.length; i <= 2 l; i ++) { if (this.grids[i]="=" 0) return i; } -1; }, init: function () this.grids="[];" this.gridob="[];" this.gridstr ; for (var y="0;" < this.h; x="0;" this.w; this.grids.push(math.floor(math.random() * 16).tostring(16)); this.grids.push(0); this; clear: while (this.ob.childnodes[0]) this.ob.removechild(this.ob.childnodes[0]); show: this.clear(); var tmpob, v; this.ob.style.width="this.gridSize" this.w + "px"; this.ob.style.height="this.gridSize" this.h this.ob.style.border="none" tmpob="document.createElement("div");" tmpob.setattribute("class", "grid"); tmpob.setattribute("classname", tmpob.style.width="this.gridSize" tmpob.style.height="this.gridSize" tmpob.style.left="this.gridSize" tmpob.style.top="this.gridSize" v="parseInt(this.gridStr.substr(y" x, 1) || "0", 16); x]; mg.border(tmpob, v); tmpob.appendchild(document.createtextnode(v)); this.gridob.push(tmpob); this.ob.appendchild(tmpob); "grid mg_finish"); this.me="new" mg_me(this); }; mg.border="function" (ob, v) (v="=" ob.style.backgroundcolor="#666" return; & ob.style.bordertop="solid 1px #f5f5f5" 2) ob.style.borderright="solid 1px #f5f5f5" 4) ob.style.borderbottom="solid 1px #f5f5f5" 8) ob.style.borderleft="solid 1px #f5f5f5" mg_me(mg) this.mg="mg" null; this.pos="0;" this.history="[0];" this.history2="[0];" this.ismoving="false;" this.lastmove="new" date(); this.finished="false;" this.emotions="{" normal: "images me_surprised.gif", happy: unhappy: surprised: tongue: me_surprised.gif" (this.mg) this.init(); mg_me.prototype="{" tmpimg="document.createElement("img")," tmpinfo="document.createElement("div")," tmpspan="document.createElement("p")," _this="this;" tmpinfo.setattribute("class", "inform"); tmpinfo.setattribute("classname", this.informbox="tmpInfo;" this.informspan="tmpSpan;" tmpinfo.appendchild(tmpspan); tmpob.appendchild(tmpinfo); tmpimg.setattribute("src", me.gif"); this.meimg="tmpImg;" "me"); tmpob.appendchild(tmpimg); this.ob="tmpOb;" this.mg.ob.appendchild(this.ob); $.hotkeys.add("up", _this.move(0); }); $.hotkeys.add("right", _this.move(1); $.hotkeys.add("down", _this.move(2); $.hotkeys.add("left", _this.move(3); settimeout(function (_this.mg.ismoved) _this.inform("提示：您可以使用键盘上的上丶下丶左丶右方向键控制我的移动。"); 3000); this.itvl="setInterval(function" (!_this.mg.ismoved) now="new" (now - _this.lastmove> 10000) {
				_this.inform("Hello?");
				_this.setEmotion("surprised");
			}
		}, 3000);

		this.setMark(1, this.mg.markHistory);
		//this.setMark(2, this.mg.markHistory2);
	},
	move: function (d) {
		if (this.isMoving || this.finished) return;
		this.mg.isMoved = true;
		var v = this.mg.grids[this.pos];
		if (v & Math.pow(2, d)) {
			if (d == 0)
				this.moveTo(this.pos - this.mg.w);
			if (d == 1)
				this.moveTo(this.pos + 1);
			if (d == 2)
				this.moveTo(this.pos + this.mg.w);
			if (d == 3)
				this.moveTo(this.pos - 1);
		}
		this.lastMove = new Date();
	},
	moveTo: function (p) {
		this.isMoving = true;
		this.inform();
		this.setEmotion("normal");
		this.history.unshift(p);
		if (this.mg.markHistory)
			this.mg.gridOb[this.history[0]].style.backgroundColor = "#fcc";
		/*if (this.history2[0] == p) {
			this.history2.shift();
		} else {
			if (this.mg.markHistory2)
				this.mg.gridOb[this.history2[0]].style.backgroundColor = "#f99";
			this.history2.unshift(p);
		}*/
		var x = p % this.mg.w,
			y = Math.floor(p / this.mg.w),
			top = y * this.mg.gridSize + "px",
			left = x * this.mg.gridSize + "px",
			_this = this;

		$(this.ob).animate({
				top: top,
				left: left
			}, 100, "", function () {
				_this.pos = p;
				_this.isMoving = false;
				var v = _this.mg.grids[p];
				if (p == _this.mg.grids.length - 1) {
					_this.inform("YEAH~!<br> 到终点啦~！");
					_this.finished = true;
					_this.setEmotion("happy");
					clearInterval(_this.itvl);
				} else if (p != 0 && (v == 1 || v == 2 || v == 4 || v == 8)) {
					_this.inform("哎呀，好像走进死胡同了！");
					_this.setEmotion("unhappy");
				} else if (p == 0) {
					_this.inform("咦，我怎么又回到起点了？");
					_this.setEmotion("surprised");
				}
			});
	},
	inform: function (s) {
		if (s) {
			$(this.informSpan).html(s);
			$(this.informBox).fadeIn(500);
		} else {
			$(this.informBox).fadeOut(500);
		}
	},
	setEmotion: function (em) {
		if (this._emotionStr == em) return;
		if (this.emotions[em]) {
			this.meImg.setAttribute("src", this.emotions[em]);
			this._emotionStr = em;
		}
	},
	setMark: function (h, v) {
		if (h == 1) {
			this.mg.markHistory = v;
			for (var i = 0; i < this.history.length; i ++) {
				this.mg.gridOb[this.history[i]].style.backgroundColor = v ? "#fcc" : "#f5f5f5";
			}
		} else if (h == 2) {
			this.mg.markHistory2 = v;
			for (var i = 0; i < this.history2.length; i ++) {
				this.mg.gridOb[this.history2[i]].style.backgroundColor = v ? "#f99" : "#f5f5f5";
			}
		}
	}
};
</=>