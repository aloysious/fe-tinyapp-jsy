
var statusList = [
  { statusId: '-1', statusText: '全部' },
  { statusId: '0', statusText: '待响应' },
  { statusId: '1', statusText: '备货中' },
  { statusId: '2', statusText: '配送中' },
  { statusId: '3', statusText: '已核销' },
  { statusId: '4', statusText: '中止审核中' },
  { statusId: '5', statusText: '已中止' }
];

var statusListSimple = {
  '-1': {
    text: '全部',
    color: '#0DD0BE'
  },
  '0': {
    text: '待响应',
    color: '#F5A623'
  },
  '1': {
    text: '备货中',
    color: '#0CD5D2'
  },
  '2': {
    text: '配送中',
    color: '#236CE6'
  },
  '3': {
    text: '已核销',
    color: '#40DC3E'
  },
  '4': {
    text: '中止审核中',
    color: '#CBCBCB'
  },
  '5': {
    text: '已中止',
    color: '#CBCBCB'
  }
};

var monthFormatList = [
  { arabic: 1, eng: 'January', simpleEng: 'Jan' },
  { arabic: 2, eng: 'February', simpleEng: 'Feb' },
  { arabic: 3, eng: 'March', simpleEng: 'Mar' },
  { arabic: 4, eng: 'April', simpleEng: 'Apr' },
  { arabic: 5, eng: 'May', simpleEng: 'May' },
  { arabic: 6, eng: 'June', simpleEng: 'Jun' },
  { arabic: 7, eng: 'July', simpleEng: 'Jul' },
  { arabic: 8, eng: 'August', simpleEng: 'Aug' },
  { arabic: 9, eng: 'September', simpleEng: 'Sep' },
  { arabic: 10, eng: 'October', simpleEng: 'Oct' },
  { arabic: 11, eng: 'November', simpleEng: 'Nov' },
  { arabic: 12, eng: 'December', simpleEng: 'Dec' },
];

var dayFormatList = [
  { chi: '星期天', eng: 'Sunday', simpleEng: 'Sun' },
  { chi: '星期一', eng: 'Monday', simpleEng: 'Mon' },
  { chi: '星期二', eng: 'Tuesday', simpleEng: 'Tues' },
  { chi: '星期三', eng: 'Wednesday', simpleEng: 'Wed' },
  { chi: '星期四', eng: 'Thursday', simpleEng: 'Thur' },
  { chi: '星期五', eng: 'Friday', simpleEng: 'Fri' },
  { chi: '星期六', eng: 'Saturday', simpleEng: 'Sat' }
];

//var reqHost = 'https://jsy.iyiplus.com';
var reqHost = 'https://jsy.iyiplus.com/dev';

var APIS = {
  GET_EVENT_NOU:						 reqHost +'/getAnnouncementList',//公告数据
  GET_ROLE_LIST: 						reqHost + '/getRoleList',
  GET_EVENT_TYPE_LIST: 			reqHost + '/getEventTypeList',
  LOGIN: 										reqHost + '/wx/login',
  CHECK_SESSION: 						reqHost + '/wx/checkSession',
  GET_EVENTS_LIST_BY_MONTH: reqHost + '/getEventsListByMonth',
  
	GET_EVENT_BASE: 					reqHost + '/getEventBase', //事件详情页
	GET_COMMENT_MODULE: 			reqHost + '/getCommentModule',//获取评论模块
	ADD_STAR:									reqHost + '/addStar',//点赞接口
	FOLLOW_EVENT: 						reqHost + '/followEvent',//关注事件
	UN_FOLLOW_EVENT:					reqHost + '/unfollowEvent',//取消关注
	GET_DESCRIPTION_MODULE:		reqHost + '/getDescriptionModule', //获取事件详情模块
	GET_ENROLL_MODULE: 				reqHost +'/getEnrollModule',//获取报名模块
	ADD_ENROLL: 							reqHost +'/addEnroll', //报名
	
	MY_CENTER: 						 		reqHost +'/myCenter', //个人中心
	MY_CARD: 									reqHost +'/myCard', //我的名片
	CERTIFICATION: 						reqHost +'/certification', //认证
	
	EDIT_CARD: 							 	reqHost +'/editCard',// 编辑我的名片
	MY_FOLLOWS:								reqHost +'/myFollows',//我的关注
	MY_PUBLISHED:							reqHost +'/myPublished',//我的发布
	TOGGLEEVENT:      reqHost +'/toggleEvent',
	UNBIND: reqHost +'/unBind', //解绑
  // 获取投票模块
  GET_VOTE_MODULE: reqHost +'/getVoteModule',
  // 提交投票结果 
  ADD_VOTE: reqHost +'/addVote',

  // 获取问卷模块
  GET_TEST_MODULE: reqHost + '/getTestModule',
  // 提交问卷
  SUBMIT_QUESTION: reqHost + '/submitQuestion',

  // 提交评论
  ADD_COMMENT: reqHost + '/addComment',

  // 发布事件
  ADD_EVENT_BASE: reqHost + '/addEventBase',

  // 添加事件详情
  ADD_EVENT_DETAILED: reqHost + '/addEventdetailed',

  // 添加投票模块
  ADD_VOTE_CONFIG: reqHost + '/addVotoConfig',

  // 添加问卷模块
  ADD_TEST_CONFIG: reqHost + '/addTestConfig',

  // 添加报名模块
  ADD_ENROLL_CONFIG: reqHost + '/addEnrolModulConfig',

  // 添加评论模块
  ADD_COMMENT_CONFIG: reqHost + '/addCommentConfig',

  // 添加评价模块
  ADD_EVALUATION_CONFIG: reqHost + '/addEvaluationConfig',

  // 删除模块关联
  REMOVE_MODULE: reqHost + '/removeModule',

  // 获取事件首页图片
  GET_EVENT_POSTER: reqHost + '/getEventPoster',
  //公司列表
  
  GET_COMPANY_LIST:reqHost + '/getCompanyList',
   
  //公司详情
  GET_COMPANY_DETAILS:reqHost + '/getCompanyDetails',


  /** bys2b */

  // 选择身份
  CHANGE_IDENTITY: reqHost + '/changeIdentity',

  // 获取当前采购人员的实名绑定信息
  GET_BUYER_AUTHORIZED_INFO: reqHost + '/getBuyerAuthorizedInfo',

  // 进行采购人员实名绑定
  ADD_BUYER_AUTHORIZED: reqHost + '/addBuyerAuthorized',

  // 获取当前sku经理的实名绑定信息
  GET_SKUER_AUTHORIZED_INFO: reqHost + '/getSkuerAuthorizedInfo',

  // 进行sku经理实名绑定
  ADD_SKUER_AUTHORIZED: reqHost + '/addSkuerAuthorized',

  // 短信认证
  SEND_SMS: reqHost + '/sendSms',

  // 获取所有的一级品类列表
  GET_ALL_PRODUCT_TYPE_LIST: reqHost + '/getAllProductTypeList',

  // 获取当前采购人员发布的需求列表
  GET_BUYER_REQUIREMENT_LIST: reqHost + '/getBuyerRequirementList',

  // 发布需求
  PUBLISH_REQUIREMENT: reqHost + '/publishRequirement',

  // 上传图片
  FILE_UPLOAD: reqHost + '/fileUpload',

  // 关注or取消关注
  TOGGLE_FOLLOW: reqHost + '/toggleFollow',

  // 获取需求详情
  GET_REQUIREMENT_DETAIL: reqHost + '/getRequirementDetail',

  // 发表留言
  ADD_COMMENT: reqHost + '/addComment',

  // 获取留言列表
  GET_COMMENT_LIST: reqHost + '/getCommentList',

  // 用户行为打点
  USER_LOG: reqHost + '/userLog',

  // 获取当前sku经理发布的需求列表
  GET_SKUER_REQUIREMENT_LIST: reqHost + '/getSkuerRequirementList',

  // 获取当前sku经理关联的一级品类列表
  GET_SKUER_PRODUCT_TYPE_LIST: reqHost + '/getSkuerProductTypeList',

  // 获取待响应需求列表
  GET_UNRESPONSE_LIST: reqHost + '/getUnResponseList',

  // 抢单，要求当前用户是实名绑定过的sku经理，同时关联了需求的所属品类
  RESPONSE_REQUIREMENT: reqHost + '/responseRequirement',

  // 修改需求状态
  RECORD_REQUIRMENT: reqHost + '/recordRequirement',

  // 终止需求
  TERMINATE_REQUIREMENT: reqHost + '/terminateRequirement',

  // 获取产品列表
  GET_PRODUCT_LIST: reqHost + '/getProductList',

  // 删除需求
  REMOVE_REQUIREMENT: reqHost + '/removeRequirement',

  // 获取需求数量统计
  GET_REQUIREMENT_COUNT_DATA: reqHost + '/getRequirementCountData',

  // 获取需求响应时间统计
  GET_RESPONSE_TIME_DATA: reqHost + '/getResponseTimeData',

  // 获取top3
  GET_TOP_PARTNER: reqHost + '/getTopPartner',

  /** 1+N新增接口 */
  
  // 获取所有商品列表
  GET_ALL_PRODUCT_LIST: reqHost + '/getAllProductList',

  // 获取sku经理的个人二维码
  GET_SKUER_QRCODE: reqHost + '/getSkuerQrCode',

  // 获取sku经理的个人信息
  GET_SKUER_INFO_BY_ID: reqHost + '/getSkuerInfoById',

  // 关联成为sku经理的采购客户
  BUYER_BIND_SKUER: reqHost + '/buyerBindSkuer',

  // 取消关联sku经理的采购客户
  BUYER_UNBIND_SKUER: reqHost + '/buyerUnbindSkuer',

  // 关联成为sku经理的配送人员
  EXPRESSER_BIND_SKUER: reqHost + '/expresserBindSkuer',

  // 取消关联sku经理的配送人员
  EXPRESSER_UNBIND_SKUER: reqHost + '/expresserUnbindSkuer',

  // 获取关联的sku经理信息
  GET_MY_SKUER: reqHost + '/getMySkuer',

  // 获取sku经理的客户列表
  GET_MY_BUYER_LIST: reqHost + '/getMyBuyerList',

  // 获取sku经理的配送人员列表
  GET_MY_EXPRESSER_LIST: reqHost + '/getMyExpresserList',

  // 取消关联采购客户
  UNBIND_BUYER: reqHost + '/unbindBuyer',

  // 取消关联配送人员
  UNBIND_EXPRESSER: reqHost + '/unbindExpresser',

  // 获取当前配送人员的实名绑定信息
  GET_EXPRESSER_AUTHORIZED_INFO: reqHost + '/getExpresserAuthorizedInfo',

  // 进行配送人员实名绑定
  ADD_EXPRESSER_AUTHORIZED: reqHost + '/addExpresserAuthorized',

  // 获取配送人员关联的sku经理列表
  GET_MY_SKUER_LIST: reqHost + '/getMySkuerList',

  // 状态置为发货
  DELIVERY_REQUIREMENT: reqHost + '/deliveryRequirement',

  // 配送人员的订单列表
  GET_EXPRESSER_REQUIREMENT_LIST: reqHost + '/getExpresserRequirementList',

  // 获取需求的核销码
  GET_REQUIREMENT_QRCODE: reqHost + '/getRequirementQrCode',

  // 消费者核销订单
  RECIEVE_REQUIREMENT: reqHost + '/recieveRequirement',

  // 获取账户详情列表
  GET_MY_POCKET_LIST: reqHost + '/getMyPocketList',

  // 按月获取用户奖励收支明细
  GET_MY_PROFIT_LIST_BY_MONTH: reqHost + '/getMyProfitListByMonth'

	
};

var QQ_MAP_KEY = 'PLWBZ-AGPWS-LWBOA-6BJYO-ZUYYZ-O7FKK';

module.exports = {
    statusList: statusList,
    statusListSimple: statusListSimple,
    monthFormatList: monthFormatList,
    dayFormatList: dayFormatList,
    APIS: APIS,
    QQ_MAP_KEY: QQ_MAP_KEY
};
