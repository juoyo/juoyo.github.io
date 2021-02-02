# GraphVis

### 一个较为完善的图可视化引擎，支持自定义的可视化效果，集成多种经典网络布局算法，社区发现算法，路径分析算法，方便使用人员或开发者快速构建自己的图可视化分析应用。

主页：[www.graphvis.cn](http://www.graphvis.cn)

开发文档：[GraphVis开发指南](https://www.yuque.com/graphvis/ezsgc0)（持续更新）

### 项目核心价值
1. 快速高效的可视化引擎，支持大量数据的交互式操作。
2. 集成大量的经典布局算法，如：树形结构类，力导向布局类，圆形类，层级关系类、节点避免重叠等
3. 支持经典社区划分算法，如：chineseWisper, lovin,newman等
4. 完整的在线应用实例，完善的开发文档

```
活跃的交流群体，持续优化改进的可视化效果和交互，让GraphVis在未来一定会成为图数据可视化领域的一个活跃分子。
欢迎有兴趣的同学们参与进来，共同把GraphVis打造成为图数据可视化分析领域的流行组件，服务更多的开发者。
```

### 快速使用

```
界面原生方式引用
当前组件包支持两种引用方式：

页面标签直接引用
<script type="text/javascript" src="../visgraph-x.x.x.min.js"></script>

require异步加载引用 页面标签直接引用
requirejs(['visgraph','layoutFactory','clusterFactory'],function(VisGraph,layoutFactory,clusterFactory) {//do something});

```

#### GraphVis实现图数据的可视化只需以下三步即可，无需深入的基础知识也可快速使用：

```
1、后台服务按照格式组织数据，如：
var data = {
   nodes:[{id:'1',label:'刘备',type:'男',properties:{age:50}},
         {id:'2',label:'关羽',type:'男'},
         {id:'3',label:'张飞',type:'男'}],
   links:[{source:'1',target:'2',label:'二弟',properties:{other:'other prop'}},
         {source:'1',target:'3',label:'三弟'}]
};

2、界面添加图层包裹元素，如：
<div id="graph-panel" style="width:800px;height:600px;"></div>

3、初始化关系图
let visGraph = new VisGraph(document.getElementById('graph-panel'));
visGraph.drawData(data);//绘制图完成

```

#### 支持自定义配置，实现个性化需求及交互
```
详细配置如下,可选择性配置需要的参数，不需要无需配置
let visGraph = new VisGraph(document.getElementById(visDomId), {
	node: { //节点的默认配置
		label: { //标签配置
			show: true, //是否显示
			color: '50,50,50', //字体颜色
			font: 'bold 13px 微软雅黑', //字体大小及类型
			wrapText: false, //节点包裹文字
			textPosition: 'Middle_Center', //文字位置 Top_Center,Bottom_Center,Middle_Right
			//textOffsetX:-24,//文字横向偏移量
			//textOffsetY:-24,//文字纵向偏移量
			//backgroud:'255,255,255',//文字背景色
			//borderWidth:0,//文字边框宽度
			//borderColor:'250,250,250'//文字边框颜色
		},
		shape: 'circle', //节点形状 circle,rect,square,ellipse,triangle,star,polygon,text
		//image:'images/T1030001.svg',//节点图标(设置后节点显示为圆形图标)
		color: '20,20,200', //节点颜色
		borderColor: '255,255,255', //边框颜色
		borderWidth: 2, //边框宽度,
		borderRadius: 0, //边框圆角大小
		lineDash: [0], //边框虚线间隔,borderWidth>0时生效
		alpha: 1, //节点透明度
		size: 60, //节点默认大小
		width: 80, //节点的长度(shape为rect生效)
		height: 40, //节点的高度(shape为rect生效)
		selected: { //选中时的样式设置
			borderColor: '50,120,230', //选中时边框颜色
			borderAlpha: 1, //选中时的边框透明度
			borderWidth: 8, //选中是的边框宽度
			showShadow: false, //是否展示阴影
			shadowColor: '50,100,250' //选中是的阴影颜色
		},
		onClick: function(event, node) { //节点点击事件回调
			console.log('点击节点----[' + node.id + ':' + node.label + ']');
		},
		ondblClick: function(event, node) {
			console.log('双击节点');
		}, //节点双击事件
		onMouseDown: function(event, node) {
			console.log('鼠标按下节点');
		}, //节点的鼠标按下事件
		onMouseUp: function(event, node) {
			console.log('鼠标弹起节点');
		}, //节点的鼠标弹起事件
		onMouseOver: function(event, node) {
			console.log('鼠标移入节点');
		}, //节点的鼠标划过事件
		onMouseOut: function(event, node) {
			console.log('鼠标移出节点');
		}, //节点的鼠标划出事件
		onMousedrag: function(event, node) {
			console.log('拖动节点');
		} //节点的拖拽移动事件
	},
	link: { //连线的默认配置
		label: { //连线标签
			show: true, //是否显示
			color: '50,50,50', //字体颜色
			font: 'normal 12px 微软雅黑' //字体大小及类型
		},
		lineType: 'direct', //连线类型,direct,curver,vlink,hlink,bezier,vbezier,hbezier
		colorType: 'defined', //连线颜色类型 source:继承source颜色,target:继承target颜色 both:用双边颜色，defined:自定义
		color: '120,120,120', //连线颜色
		alpha: 0.8, // 连线透明度
		lineWidth: 2, //连线宽度
		lineDash: [0], //虚线间隔样式如：[5,8]
		showArrow: true, //显示箭头
		selected: { //选中时的样式设置
			color: '250,50,50', //选中时的颜色
			alpha: 1,
			showShadow: false, //是否展示阴影
			shadowColor: '250,40,30' //选中连线时的阴影颜色
		},
		onClick: function(event, link) { //连线点击事件回调
			console.log('click link---[' + link.source.id + '-->' + link.target.id + ']');
		},
		ondblClick: function(event, link) {} //连线的双击回调事件
	},
	highLightNeiber: false, //相邻节点高度标志
	wheelZoom: 0.8, //滚轮缩放开关，不使用时不设置[0,1]
	noElementClick: function(event) { //画布空白处的点击事件
		console.log('点击了空白区域');
	},
	rightMenu: {
		nodeMenu: NodeRightMenu, //节点右键菜单配置
		linkMenu: LinkRightMenu // 连线右键菜单配置
	},
	layout: { //开启内置力导向布局,不配置时不启动
		type: 'force',
		options: {
			friction: 0.9,
			linkDistance: 150,
			linkStrength: 0.05,
			charge: -150,
			gravity: 0.01,
			noverlap: false
		}
	}
});

```

## 应用效果图

<table style="width:600px;">
<tr>
<td><img src="https://gitee.com/baopengdu/GraphVis/raw/master/image/icon.png" width="50%"/></td>
<td><img src="https://gitee.com/baopengdu/GraphVis/raw/master/image/doubletree.png" width="50%"/></td>
</tr>
<tr>
<td><img src="https://gitee.com/baopengdu/GraphVis/raw/master/image/homebg1.png" width = "50%"/></td>
<td><img src="https://gitee.com/baopengdu/GraphVis/raw/master/image/homebg2.png" width = "50%"/></td>
</tr>
<tr>
<td><img src="https://gitee.com/baopengdu/GraphVis/raw/master/image/workflowdemo.png" width="50%"/></td>
<td><img src="https://gitee.com/baopengdu/GraphVis/raw/master/image/xminder-new.jpg" width="50%"/></td>
</tr>
<tr>
<td><img src="https://gitee.com/baopengdu/GraphVis/raw/master/image/graph.png" width="50%"/></td>
<td><img src="https://gitee.com/baopengdu/GraphVis/raw/master/image/tree.gif" width="50%"/></td>
</tr>
</table>

## GraphVis 交流讨论
<table style="width:400px;">
<tr>
<td><img src="https://gitee.com/baopengdu/GraphVis/raw/master/image/QQ-ercode.jpg" width = "180" height = "300" alt="" align=center /></td>
</tr>
</table>

由于时常进入广告人员，现不再公开微信交流群二维码，如需加入微信交流群请联系作者邀请进入。

## 联系作者
1、微信：dubaopeng123
2、QQ: 583037838