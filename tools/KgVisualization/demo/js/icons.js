// 执行示例代码
initDemo1();

initDemo2();

//示例一
function initDemo1(){
	const demoData = {
		nodes:[
			{label:'\uf2d6',font:'50px FontAwesome',color:randomColor()},
			{label:'\uf000',font:'50px FontAwesome',color:randomColor()},
			{label:'\uf2bb',font:'50px FontAwesome',color:randomColor()},		
			{label:'\uf2de',font:'50px FontAwesome',color:randomColor()},
			{label:'\uf2b7',font:'50px FontAwesome',color:randomColor()},
			{label:'\uf1ba',font:'50px FontAwesome',color:randomColor()},
			{label:'\uf207',font:'50px FontAwesome',color:randomColor()},
			{label:'\uf108',font:'50px FontAwesome',color:randomColor()},
			{label:'\uf0d6',font:'50px FontAwesome',color:randomColor()},
			{label:'\uf072',font:'50px FontAwesome',color:randomColor()},
			{label:'\uf1d7',font:'50px FontAwesome',color:randomColor()},
			{label:'\uf2c0',font:'50px FontAwesome',color:randomColor()},
			{label:'\uf179',font:'50px FontAwesome',color:randomColor()},
			{label:'\uf282',font:'50px FontAwesome',color:randomColor()},
			{label:'\uf269',font:'50px FontAwesome',color:randomColor()},
			{label:'\uf1d6',font:'50px FontAwesome',color:randomColor()},
			{label:'\uf18b',font:'50px FontAwesome',color:randomColor()},
			{label:'\uf113',font:'50px FontAwesome',color:randomColor()},
			
			{label:'\ue98f',font:'bold 50px nep-icon',color:randomColor()},
			{label:'\ue7f7',font:'bold 50px nep-icon',color:randomColor()},
			{label:'\ue793',font:'bold 50px nep-icon',color:randomColor()},
			{label:'\ue7d0',font:'bold 50px nep-icon',color:randomColor()},
			{label:'\ue7f1',font:'bold 50px nep-icon',color:randomColor()},
			{label:'\ue7fe',font:'bold 50px nep-icon',color:randomColor()}
		],
		links:[]
	};
	
	const config = {
		node:{ //节点的默认配置
			label:{ //标签配置
				show:true, //是否显示
				color:'250,250,250',//字体颜色
				font:'normal 50px FontAwesome',//字体大小及类型 
				textPosition:'Middle_Center',//文字位置 Top_Center,Bottom_Center,Middle_Right
				//textOffsetX:-20,//文字横向偏移量
				textOffsetY:-6,//文字纵向偏移量
			},
			shape:'circle',//节点形状 circle,rect
			color:'20,220,100',//节点颜色
			borderColor:'230,230,230',//边框颜色
			borderWidth:8,//边框宽度,
			borderRadius:3,//边框圆角大小
			lineDash:[0],//边框虚线间隔,borderWidth>0时生效
			alpha:1,//节点透明度
			size:100,
			width:220,
			height:60,
			selected:{ //选中时的样式设置
				borderColor:'50,120,230',//选中时边框颜色
				borderAlpha:1,//选中时的边框透明度
				borderWidth:16,//选中是的边框宽度
				showShadow:true,//是否展示阴影
				shadowColor:'50,100,250'//选中是的阴影颜色
			}
		},
		highLightNeiber:false,
		wheelZoom:0.8
	};
	//1、初始化图对象
	let visgraph = initVisGraph('graph-panel',config);
	
	//2、模拟加载服务端数据，可视化显示
	visgraph.drawData(demoData);
	
	//3、自动布局,并缩放居中
	autoLayout(visgraph.getGraphData());
	visgraph.setZoom('auto');
};


//示例二
function initDemo2(){
	
	var demoData = {
		nodes:[
			{label:'微信\ndubaopeng123',shape:'circle',x:100,y:100,icon:{text:'\uf1d7',font:'normal 45px FontAwesome',color:'250,250,250',left:-22,top:15},textPosition:'Bottom_Center',fontColor:'10,10,10',textOffsetY:5,borderColor:'220,220,250'},
			{label:'网址\nwww.graphvis.cn',shape:'circle',x:300,y:100,icon:{text:'\uf26b',font:'normal 45px FontAwesome',color:'120,120,220',left:-22,top:15},textPosition:'Bottom_Center',fontColor:'10,10,10',textOffsetY:5,color:'240,240,240',fontColor:'120,120,240',borderColor:'220,220,250'},
			{label:' GraphVis 图说数据 ',shape:'circle',x:500,y:100,icon:{text:'\uf1d1',font:'normal 45px FontAwesome',color:'250,255,255',left:-22,top:15},color:'10,210,255',fontColor:'50,50,50',labelBackGround:'225,225,245',labelBorderWidth:2,labelBorderColor:'250,250,250',textOffsetY:18,textPosition:'Bottom_Center'},
			{label:'姓名：张三丰\n职业：武当派掌门人\n单位：武当派\n籍贯：福建省邵武市和平镇',shape:'rect',x:100,y:300,icon:{text:'\uf2bb',font:'bold 40px FontAwesome',color:'250,250,240',left:-160,top:-10},width:360,height:120,textPosition:'Middle_Right',textOffsetX:-260,textOffsetY:-35,color:'220,120,220',fontColor:'20,20,20'},
			{label:'清平调·其一\n\n李白【唐】\n\n云想衣裳花想容，春风拂槛露华浓。\n\n若非群玉山头见，会向瑶台月下逢。',shape:'rect',x:100,y:500,icon:{text:'\uf02d',font:'40px FontAwesome',color:'180,200,180',left:200,top:90},width:500,height:220,color:'250,50,50',textOffsetY:-60},
			{label:'   路漫漫其修道远   \n   吾将上下而求索   ',shape:'rect',x:500,y:300,width:200,height:100,color:'50,150,200',fontColor:'250,250,250',labelBorderWidth:1,labelBackGround:'255,255,255',labelBorderColor:'250,50,50',textOffsetY:-12}		],
		links:[]
	};
	
	const config = {
		node:{ //节点的默认配置
			label:{ //标签配置
				show:true, //是否显示
				color:'250,250,250',//字体颜色
				font:'normal 18px 微软雅黑',//字体大小及类型 
				textPosition:'Middle_Center',//文字位置 Top_Center,Bottom_Center,Middle_Right
				//textOffsetX:-214,//文字横向偏移量
				//textOffsetY:0,//文字纵向偏移量
			},
			shape:'circle',//节点形状 circle,rect
			color:'20,220,100',//节点颜色
			borderColor:'230,230,230',//边框颜色
			borderWidth:8,//边框宽度,
			borderRadius:1,//边框圆角大小
			lineDash:[0],//边框虚线间隔,borderWidth>0时生效
			alpha:1,//节点透明度
			size:100,
			width:220,
			height:60,
			selected:{ //选中时的样式设置
				borderColor:'50,120,230',//选中时边框颜色
				borderAlpha:1,//选中时的边框透明度
				borderWidth:16,//选中是的边框宽度
				showShadow:true,//是否展示阴影
				shadowColor:'50,100,250'//选中是的阴影颜色
			}
		},
		highLightNeiber:false,
		wheelZoom:0.8
	};
	//1、初始化图对象
	let visgraph = initVisGraph('graph-panel2',config);
	
	//2、模拟加载服务端数据，可视化显示
	visgraph.drawData(demoData);
	
	//3、自动布局,并缩放居中
	//autoLayout(visgraph.getGraphData());
	visgraph.setZoom('auto');
};


//初始化图客户端对象，用于操作及调用接口
function initVisGraph(visDomId,config){
	//创建图对象，参数一:图层包裹元素, 参数二:图中元素显示配置项
	var _visGraph = new VisGraph(document.getElementById(visDomId),config);
	return _visGraph;
};


//自动布局
function autoLayout({nodes,links}){
	var layout=new LayoutFactory({nodes,links}).createLayout("grid");
	layout.resetConfig({
		horizontalScale:'160',
		verticalScale:'160'
	});
	layout.boolTransition=false;
	layout.runLayout();
};

function randomColor(){
  return Math.floor(250 * Math.random()) + "," 
  		+ Math.floor(200 * Math.random()) + "," 
  		+ Math.floor(250 * Math.random());
};
