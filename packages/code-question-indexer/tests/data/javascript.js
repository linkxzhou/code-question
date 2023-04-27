/**
 * 开放平台App配置数据查询
 * @param {object} req -- 打包所有请求参数
 * @param {string} req.filter 不传就是全量配置数据，传config就是运营配置数据
 * @returns 开放平台App配置数据
 * @returns {number} errcode：错误码
 * @returns {string} errInfo：错误信息
 * @returns {object} appData：开放平台App配置数据
 * @returns {boolean} isActivityEnd：活动是否已结束
 * @version HonorofKings_CommonBK
 */
function BK_HonorofKings_GetAppData(req) {
    let rsp = {};
    let app_data = pxbase.BK_getAppData()
    if (app_data === undefined) {
        rsp.errcode = errorCode.APP_DATA_UNDEFINED
        rsp.errInfo = "app_data undefined"
        console.error(rsp.errInfo)
        return rsp;
    }
    if (req === undefined || req.filter === undefined) {
        rsp.appData = app_data;
    }
    else if (req.filter === 'config') {
        rsp.appData = app_data.config;
    }
    else {
        rsp.errcode = errorCode.REQ_PARAMS_ERR
        rsp.errInfo = "req error:" + JSON.stringify(req)
        console.error(rsp.errInfo);
        return rsp;
    }
    let now = Math.floor(Date.now() / 1000) //秒级时间戳
    let isActivityEnd = now > app_data.openPlatform.endTime
    console.log("now: ", now, ", app_data.openPlatform: ", app_data.openPlatform)
    rsp.isActivityEnd = isActivityEnd
    rsp.errcode = errorCode.SUCCESS;
    return rsp;
}

/**
 * 体验服area需要特殊逻辑处理
 * PlatID       平台ID：0(ios) 1(android)
 * AcountType   帐号类型：qq(手Q) wx(微信) ttpp(游客)
 * @param {string} acc_type -- 帐号类型
 * @param {string} platid -- 平台ID
 * @returns {number} -- area 60(体验服手Q安卓)61(体验服手Q ios)62(体验服微信安卓)63(体验服微信ios)64(体验服游客)
 * @version  HonorofKings_CommonBK
 */
function BK_HonorofKings_GetAreaForExp(sAcountType, sPlatID) {
    if (sAcountType === "qq") {
        if (sPlatID === "0") {
            return 61
        }
        else {
            return 60
        }
    }
    else if (sAcountType === "wx") {
        if (sPlatID === "0") {
            return 63
        }
        else {
            return 62
        }
    }
    else if (sAcountType === "ttpp") {
        return 64
    }
    return 0
}

const AreaID =
{
    E_GAMESVR_INVALID: "0",          // 无效   
    E_GAMESVR_QQANDROID: "1",        // 手Q安卓                  
    E_GAMESVR_QQIOS: "2",            // 手QIOS                 
    E_GAMESVR_WEANDROID: "3",        // 微信安卓            
    E_GAMESVR_WEIOS: "4",            // 微信IOS           
    E_GAMESVR_GUESTIOS: "5",         // 游客IOS          
    E_GAMESVR_QQPIONEER: "6",        // 安卓手Q抢先服
    E_GAMESVR_WEPIONEER: "7",        // 安卓微信抢先服
    E_GAMESVR_INTL: "8",             // 国际服
    E_GAMESVR_INTL_GUEST: "9",       // 国际游客服
}

/**
 * 获取正式服Area
 * 无效           0
 * 手Q安卓        1
 * 手QIOS         2
 * 微信安卓       3
 * 微信IOS        4
 * 游客IOS        5
 * 安卓手Q抢先服   6
 * 安卓微信抢先服  7
 * 国际服          8
 * 国际游客服      9
 * @param {string} sPartition -- 小区id
 * @returns {string} area -- 大区id
 * @version  HonorofKings_CommonBK
 */
function BK_HonorofKings_GetArea(sPartition) {
    let platId = Math.floor(parseInt(sPartition) / 1000);
    switch (platId) {
        case 1: return AreaID.E_GAMESVR_QQANDROID;
        case 2: return AreaID.E_GAMESVR_QQIOS;
        case 3: return AreaID.E_GAMESVR_WEANDROID;
        case 4: return AreaID.E_GAMESVR_WEIOS;
        case 5: return AreaID.E_GAMESVR_GUESTIOS;
        case 6:
            {
                let subPlatId = parseInt(sPartition) % 1000;
                if (subPlatId == 1) {
                    return AreaID.E_GAMESVR_QQANDROID;
                }
                if (subPlatId == 2) {
                    return AreaID.E_GAMESVR_QQIOS;
                }
                if (subPlatId == 3) {
                    return AreaID.E_GAMESVR_WEANDROID;
                }
                if (subPlatId == 4) {
                    return AreaID.E_GAMESVR_WEIOS;
                }
                if (subPlatId == 5) {
                    return AreaID.E_GAMESVR_GUESTIOS;
                }
                if (subPlatId == 6) {
                    return AreaID.E_GAMESVR_QQPIONEER;
                }
                if (subPlatId == 7) {
                    return AreaID.E_GAMESVR_WEPIONEER;
                }
                if (subPlatId >= 50 && subPlatId < 60) {
                    return AreaID.E_GAMESVR_INTL;
                }
                if (subPlatId >= 60 && subPlatId < 70) {
                    return AreaID.E_GAMESVR_INTL_GUEST;
                }
                return AreaID.E_GAMESVR_QQPIONEER;
            }
        case 7:
            return AreaID.E_GAMESVR_WEPIONEER;
        case 8:
            {
                let subPlatId = parseInt(sPartition) % 1000;
                switch (subPlatId) {
                    case 1: return AreaID.E_GAMESVR_QQIOS;
                    case 2: return AreaID.E_GAMESVR_WEIOS;
                    case 3: return AreaID.E_GAMESVR_GUESTIOS;
                    case 5: return AreaID.E_GAMESVR_INTL_GUEST;
                    default: return AreaID.E_GAMESVR_INTL;
                }
            }
        case 9:
            return AreaID.E_GAMESVR_INTL_GUEST;
        default:
            return AreaID.E_GAMESVR_INVALID;
    }
}

/**
*任务系统查询 依赖配置项：commonConf见小应用平台https://timi-olsb.px.woa.com/app/#/app/generalConfig，task_groupId和task_labelid均为App对应的运营配置
* @returns {object} 任务系统接口返回信息参考http://odp.oa.com/odper/menu/paas/manage/interface/api2/apiDoc?paasid=13646&vm=detail&api_id=1538292&op=&env=dev&page=&from=paasGroup&url=paasGroup&tab=apiDoc&method=tab&copy&tag=%E9%BB%98%E8%AE%A4%E5%88%86%E7%BB%84
* @returns {number} errcode：错误码
* @returns {string} errInfo：错误信息
* @returns {object} taskList：任务列表
* @version  HonorofKings_CommonBK
*/
function BK_HonorofKings_TaskSystem_GetList() {
    let rsp = {};
    let getAppDataRsp = BK_HonorofKings_GetAppData()
    if (getAppDataRsp.errcode !== errorCode.SUCCESS) {
        return getAppDataRsp;
    }
    let app_data = getAppDataRsp.appData
    let req = {}
    req.target = {
        l5_modid: app_data.commonConf["l5_modid"],
        l5_cmdid: app_data.commonConf["l5_cmdid"],
        //service : app_data.commonConf["gametask_appname"],
        uin: app_data.userinfo.sOpenId,
    }
    if (app_data.task_groupId !== 0) {
        req.path = "/odp.tsx.pb.Ts/GetGroupTask";
        req.data = {
            groupid: app_data.task_groupId
        }
    }
    else if (app_data.task_labelid !== 0) {
        req.path = "/odp.tsx.pb.Ts/GetLabelTask";
        req.data = {
            labelid: app_data.task_labelid
        }
    }
    else {
        rsp.errcode = errorCode.TASK_GROUPID_AND_LABELID_INVALID;
        rsp.errInfo = "req no task_groupId and labelid";
        console.error(rsp.errInfo)
        return rsp;
    }

    req.data.app = app_data.commonConf["gametask_appname"],
        req.data.user = {
            PartitionID: app_data.userinfo.sPartition,
            Uin: app_data.userinfo.sOpenId,
            AreaID: app_data.userinfo.sPartition,
            RoleID: app_data.userinfo.sRoleId,
            Platform: app_data.userinfo.sPlatID,
            AccType: app_data.userinfo.sAcountType,
            Ext:
            {
                newroleid: app_data.userinfo.sUniqueRoleId
            }
        }

    let taskList = taskbase.BK_TaskSystem_Request(req);
    if (taskList === undefined || taskList.code !== 0) {
        rsp.errcode = errorCode.TASK_LIST_QUERY_ERR
        rsp.errInfo = "taskList query error " + taskList.code
        console.error(rsp.errInfo)
        return rsp;
    }
    rsp.errcode = errorCode.SUCCESS
    rsp.taskList = taskList;
    return rsp;
}

/**
 *任务系统领取奖励 依赖配置项：commonConf见小应用平台https://timi-olsb.px.woa.com/app/#/app/generalConfig，task_groupId和task_labelid均为App对应的运营配置
 * @param {object} req -- 打包所有请求参数
 * @param {number} req.task_id -- 任务ID
 * @returns {object} 任务领奖接口返回信息参考http://odp.oa.com/odper/menu/paas/manage/interface/api2/apiDoc?paasid=13646&vm=detail&api_id=1538294&op=&env=dev&page=&from=paasGroup&url=paasGroup&tab=apiDoc&method=apiDoc&locapiid=1538292&copy
 * @returns {number} errcode：错误码
 * @returns {string} errInfo：错误信息
 * @returns {Array} taskIds: 领取成功后返回的任务id数组
 * @version  HonorofKings_CommonBK
 */
function BK_HonorofKings_TaskSystem_GetReward(req) {
    let rsp = {};
    let getAppDataRsp = BK_HonorofKings_GetAppData()
    if (getAppDataRsp.errcode !== errorCode.SUCCESS) {
        return getAppDataRsp;
    }
    if (getAppDataRsp.isActivityEnd) {
        rsp.errcode = errorCode.ACTIVITY_END
        rsp.errInfo = "activity end"
        console.error(rsp.errInfo)
        return rsp;
    }
    let app_data = getAppDataRsp.appData
    req.target = {
        l5_modid: app_data.commonConf["l5_modid"],
        l5_cmdid: app_data.commonConf["l5_cmdid"],
        //service : app_data.commonConf["gametask_appname"],
        uin: app_data.userinfo.sOpenId,
    }
    req.path = "/odp.tsx.pb.Ts/RewardTask";
    req.data = {
        groupid: app_data.task_groupId,
        taskid: req.task_id,
        app: app_data.commonConf["gametask_appname"],
    }
    req.data.user = {
        PartitionID: app_data.userinfo.sPartition,
        Uin: app_data.userinfo.sOpenId,
        AreaID: app_data.userinfo.sPartition,
        RoleID: app_data.userinfo.sRoleId,
        Platform: app_data.userinfo.sPlatID,
        AccType: app_data.userinfo.sAcountType,
        Ext:
        {
            newroleid: app_data.userinfo.sUniqueRoleId
        }
    }
    let taskGetReward = taskbase.BK_TaskSystem_Request(req);
    if (taskGetReward === undefined || taskGetReward.code !== 0) {
        rsp.errcode = errorCode.TASK_GET_REWARD_ERR
        rsp.errInfo = "task get reward error " + taskGetReward.code
        console.error(rsp.errInfo)
        return rsp;
    }
    //如果领取成功就返回任务id数组（包括一键领取情况）
    let taskIds = [];
    for (let singleRes of taskGetReward.data.res) {
        if (singleRes !== undefined && singleRes.H !== undefined && singleRes.H.taskstatus !== undefined) {
            let taskStatus = JSON.parse(singleRes.H.taskstatus);
            if (taskStatus !== undefined && taskStatus.taskid !== undefined) {
                taskIds.push(parseInt(taskStatus.taskid));
            }
            else {
                console.error("taskStatus is error", singleRes.H.amspackageid);
            }
        }
        else {
            console.error("singleRes is error");
        }
    }
    rsp.errcode = errorCode.SUCCESS
    rsp.taskIds = taskIds;
    return rsp;
}

/**
 * 查询积分信息
 * @returns 每个礼包组增加是否可领取和已领取标识
 * @returns 一级参数:模块信息
 * @returns {number} errcode : 错误码
 * @returns {number} errInfo ：错误信息
 * @returns {object}} errrsp ：请求其它接口的错误返回信息
 * @returns {Array} scoreArray: 积分信息
 * @version HonorofKings_CommonBK
 */
function BK_HonorofKings_QueryScore() {
    let rsp = {}
    let getAppDataRsp = BK_HonorofKings_GetAppData()
    if (getAppDataRsp.errcode !== errorCode.SUCCESS) {
        return getAppDataRsp;
    }
    let app_data = getAppDataRsp.appData
    let giftConfig = JSON.parse(app_data.giftConfig);

    if (giftConfig === undefined) {
        rsp.errcode = errorCode.PACKAGE_CONFIG_UNDEFINED
        rsp.errInfo = "giftConfig undefined"
        console.error(rsp.errInfo)
        return rsp;
    }
    //查询积分，因为积分转区也要保留，所以需要用老的区号查询和发放
    let oldPartionid = app_data.userinfo.sUniqueRoleId.split("_")[0]

    let score_rsp = amsbase.BK_QueryScore({
        acctId: app_data.commonConf.acct_id,
        openId: app_data.userinfo.sOpenId,
        area: oldPartionid,
        actionIds: giftConfig.score_actionId,
    })

    if (score_rsp["result"] !== "0") {
        rsp.errcode = errorCode.SCORE_QUERY_ERR
        rsp.errrsp = score_rsp
        rsp.errInfo = "Get BK_QueryScore err";
        console.error(rsp.errInfo, rsp)
        return rsp;
    }
    else {
        rsp.errcode = errorCode.SUCCESS
        rsp.scoreArray = []
        if (score_rsp.actionInfos !== undefined) {
            for (let actionInfo of score_rsp.actionInfos) {
                rsp.scoreArray.push(actionInfo.balance)
            }
        }
    }

    if (rsp.scoreArray.length <= 0) {
        rsp.errcode = errorCode.SCORE_ARRAY_LENGTH_INVALID
        rsp.errrsp = score_rsp
        rsp.errInfo = "rsp.scoreArray.length <= 0"
        console.error(rsp.errInfo, rsp)
        return rsp;
    }
    rsp.errcode = errorCode.SUCCESS
    console.log("rsp:", rsp)
    return rsp
}

/**
 * 扣除积分
 * @param {object} req
 * @param {number} req.payAmt  扣除积分数量
 * @param {number} req.payIndex  扣除的积分下标
 * @returns 每个礼包组增加是否可领取和已领取标识
 * @returns 一级参数:模块信息
 * @returns {number} errcode : 错误码
 * @returns {number} errInfo ：错误信息
 * @returns {object} errrsp ：请求其它接口的错误返回信息
 * @returns {Array} scoreArray: 积分信息
 * @version HonorofKings_CommonBK
 */
function BK_HonorofKings_DeductScore(req) {
    let rsp = {}
    if (req == undefined || req.payAmt == undefined || req.payAmt <= 0) {
        rsp.errcode = errorCode.REQ_PARAMS_ERR
        rsp.errInfo = "req error :" + req
        console.error(rsp.errInfo)
        return rsp;
    }
    let getAppDataRsp = BK_HonorofKings_GetAppData()
    if (getAppDataRsp.errcode !== errorCode.SUCCESS) {
        return getAppDataRsp;
    }
    let app_data = getAppDataRsp.appData
    let giftConfig = JSON.parse(app_data.giftConfig);

    if (giftConfig === undefined) {
        rsp.errcode = errorCode.PACKAGE_CONFIG_UNDEFINED
        rsp.errInfo = "giftConfig undefined"
        console.error(rsp.errInfo)
        return rsp;
    }
    //查询积分，因为积分转区也要保留，所以需要用老的区号查询和发放
    let oldPartionid = app_data.userinfo.sUniqueRoleId.split("_")[0]

    let score_rsp = amsbase.BK_DeductScore({
        acctId: app_data.commonConf.acct_id,
        openId: app_data.userinfo.sOpenId,
        area: oldPartionid,
        actions:
            [
                {
                    actionId: giftConfig.score_actionId,
                    amount: req.payAmt
                }
            ]
    })

    if (score_rsp["result"] !== "0") {
        rsp.errcode = errorCode.BK_DEDUCT_SCORE_ERR
        rsp.errrsp = score_rsp
        rsp.errInfo = "Get BK_DeductScore err";
        console.error(rsp.errInfo, rsp)
        return rsp;
    }
    else {
        rsp.errcode = errorCode.SUCCESS
        rsp.scoreArray = []
        if (score_rsp.actionInfos !== undefined) {
            for (let actionInfo of score_rsp.actionInfos) {
                rsp.scoreArray.push(actionInfo.balance)
            }
        }
    }

    if (rsp.scoreArray.length <= 0) {
        rsp.errcode = errorCode.SCORE_ARRAY_LENGTH_INVALID
        rsp.errrsp = score_rsp
        rsp.errInfo = "rsp.scoreArray.length <= 0"
        console.error(rsp.errInfo, rsp)
        return rsp;
    }
    rsp.errcode = errorCode.SUCCESS
    console.log("rsp:", rsp)
    return rsp
}

/**
 * 查询礼包信息和领取状态,并且每个礼包只能领取一次
 * 依赖礼包配置结构：
  {
    "score_actionId": "1134",
    "gift_listId": "461627",
    "gift_listConfig": [
      {
        "package_id": "1946332",
        "score_threshold": 5,
        "isAmsQual": 'true',
        "isCostScore": 'true'
      }
    ]
  }
 * @returns 每个礼包组增加是否可领取和已领取标识
 * @returns 一级参数:模块信息
 * @returns {number} errcode : 错误码
 * @returns {number} errInfo ：错误信息
 * @returns {object}} errrsp ：请求其它接口的错误返回信息
 * @returns {Array} package_list : 礼包信息
 * @returns 二级参数:礼包信息
 * @returns {string} packageId: 礼包ID
 * @returns {string} packageName: 礼包名称
 * @returns {string} packageType: 礼包类型，0-领取 1-抽奖
 * @returns {boolean} isGet: 是否被领取
 * @returns {boolean} isAmsQual: 是否走AMS资格判定，否表示通过Redis进行资格判定
 * @returns {boolean} isCostScore: 领取是否扣除积分
 * @returns {number} threshold: 领取所需积分数量
 * @returns {number} packageGroupId:礼包组ID
 * @returns {array} itemInfo: 礼包内包含的道具数组
 * @returns 三级参数:礼包道具信息
 * @returns {string} itemName: 道具名称
 * @returns {string} itemType: 道具类型
 * @returns {string} itemId: ams道具ID,全局唯一
 * @returns {string} itemCode: 游戏道具ID
 * @version HonorofKings_CommonBK
 */
function BK_HonorofKings_QueryPackage() {
    let rsp = {}
    let getAppDataRsp = BK_HonorofKings_GetAppData()
    if (getAppDataRsp.errcode !== errorCode.SUCCESS) {
        return getAppDataRsp;
    }
    let app_data = getAppDataRsp.appData
    let giftConfig = JSON.parse(app_data.giftConfig);

    if (giftConfig === undefined) {
        rsp.errcode = errorCode.PACKAGE_CONFIG_UNDEFINED
        rsp.errInfo = "giftConfig undefined"
        console.error(rsp.errInfo);
        return rsp;
    }

    //获取所有礼包信息
    let package_info = amsbase.BK_ResourceLotterySafemoduleinfo({
        serviceType: app_data.openPlatform.service,
        moduleId: giftConfig.gift_listId,
    })
    console.log("Get BK_ResourceLotterySafemoduleinfo ", package_info)

    if (package_info.hasError) {
        rsp.errcode = errorCode.ALL_PACKAGE_INFOS_GET_ERR
        rsp.errInfo = "BK_ResourceLotterySafemoduleinfo Error"
        rsp.errrsp = package_info
        console.error(rsp.errInfo, package_info);
        return package_info
    }

    let newpackage_list = [];
    //判断礼包是否领取
    if (package_info.hasError === false) {
        let batchQueryReq = {}
        batchQueryReq.openId = app_data.userinfo.sOpenId
        batchQueryReq.uid = app_data.userinfo.sUniqueRoleId
        let pakageIndex = undefined
        for (let singlePackage of package_info.packageGroup) {
            if (singlePackage.packageInfo === undefined || singlePackage.packageInfo.length <= 0) {
                console.error("package info is error, packageGroupId :", singlePackage.packageGroupId);
                continue;
            }
            let tmppackage = {};
            tmppackage.packageInfoList = singlePackage.packageInfo;
            if (tmppackage.packageInfoList === undefined) {
                console.error("package is null ,packageGroupId :", singlePackage.packageGroupId);
                continue;
            }
            tmppackage.packageType = singlePackage.packageGroupType;
            tmppackage.isGet = false;
            tmppackage.isAmsQual = true;
            tmppackage.isCostScore = false;
            tmppackage.score_threshold = undefined;
            tmppackage.packageGroupId = singlePackage.packageGroupId;
            if (giftConfig.gift_listConfig === undefined) {
                rsp.errcode = errorCode.PACKAGE_GET_SCORE_CONFIG_NOT_EXIST
                rsp.errInfo = "giftConfig gift_scoreThreshold undefined"
                console.error(rsp.errInfo);
                return rsp;
            }
            for (let singleGift of giftConfig.gift_listConfig) {
                if (singleGift.package_id === tmppackage.packageGroupId) {
                    tmppackage.score_threshold = singleGift.score_threshold
                    if (singleGift.isAmsQual === undefined) {
                        tmppackage.isAmsQual = true
                    }
                    else {
                        tmppackage.isAmsQual = singleGift.isAmsQual === 'true' ? true : false;
                    }
                    if (singleGift.isCostScore === undefined) {
                        tmppackage.isCostScore = false;
                    }
                    else {
                        tmppackage.isCostScore = singleGift.isCostScore === 'true' ? true : false;
                    }
                    break;
                }
            }

            if (tmppackage.score_threshold === undefined) {
                continue;
            }
            newpackage_list.push(tmppackage);

            //所有领取类礼包都需要查询资格
            if (tmppackage.packageType === "0") {
                if (batchQueryReq.holdList === undefined) {
                    batchQueryReq.holdList = []
                    pakageIndex = []
                }
                batchQueryReq.holdList.push(
                    {
                        tag: tmppackage.packageGroupId,
                        initAmt: 1
                    })
                pakageIndex.push(newpackage_list.length - 1)
            }
        }

        if (batchQueryReq.holdList !== undefined) {
            let qual_rspArray = amsbase.BK_QualBatchQuery(batchQueryReq)
            for (let i = 0; i < qual_rspArray.length; i++) {
                let qual_rsp = qual_rspArray[i];
                if (qual_rsp.hasError) {
                    rsp.errcode = errorCode.PACKAGE_QUAL_QUERY_ERR
                    rsp.errInfo = "BK_QualQuery error ";
                    rsp.qual_rsp = qual_rsp;
                    console.error(rsp.errInfo, qual_rsp);
                    return rsp
                }
                else {
                    console.log("BK_QualQuery  :", qual_rsp.acctInfo.leftNum);
                    newpackage_list[pakageIndex[i]].isGet = qual_rsp.acctInfo.leftNum < 1
                }
            }
        }
    }

    rsp.package_list = newpackage_list
    rsp.errcode = errorCode.SUCCESS
    console.log("BK_HonorofKings_QueryPackage  :", rsp);
    return rsp
}

/**
* 查询登录状态
* @returns  {object}  rsp 返回结果 
* @returns {number} errcode : 错误码
* @returns {number} errInfo ：错误信息
* @returns {object}} errrsp ：请求其它接口的错误返回信息
* @version HonorofKings_CommonBK
*/
function BK_HonorofKings_CheckLogin() {
    let rsp = {}
    let getAppDataRsp = BK_HonorofKings_GetAppData()
    if (getAppDataRsp.errcode !== errorCode.SUCCESS) {
        return getAppDataRsp;
    }
    let app_data = getAppDataRsp.appData
    let t = Date.now()
    //如果配置了开启检查则检测登录信息
    if (app_data.checklogin === 1) {
        if (app_data.userinfo.sAcountType === "qq") {
            let qq_islogin = amsbase.BK_QQIsLogin({
                sServiceType: app_data.openPlatform.service,
                appid: app_data.openPlatform.appid,
                openid: app_data.userinfo.sOpenId,
                access_token: app_data.userinfo.sAccessToken
            })
            if (qq_islogin["errcode"] !== 0) {
                rsp.errcode = errorCode.CHECK_LOGIN_STATE_ERR
                rsp.errInfo = "check qq login err:" + qq_islogin["errmsg"]
                rsp.errrsp = qq_islogin;
                console.error("check qq login err:", rsp)
                return rsp
            }
        } else if (app_data.userinfo.sAcountType === "wx") {
            let wx_islogin = amsbase.BK_WXIsLogin({
                sServiceType: app_data.openPlatform.service,
                openid: app_data.userinfo.sOpenId,
                access_token: app_data.userinfo.sAccessToken
            })
            if (wx_islogin["errcode"] !== 0) {
                console.error("check wx login err:", wx_islogin)
                rsp.errcode = errorCode.CHECK_LOGIN_STATE_ERR
                rsp.errInfo = "check wx login err:: " + wx_islogin["errmsg"];
                rsp.errrsp = wx_islogin;
                return rsp
            }
        } else {
            rsp.errcode = errorCode.ACCOUNT_TYPE_ERR
            rsp.errInfo = "acc_type is error"
            console.error("acc_type error:", app_data.userinfo.sAcountType)
            return rsp
        }
    }

    rsp.errcode = errorCode.SUCCESS;
    return rsp;
}

/**
* 领取礼包，如果礼包是领取类型则会消耗资格，判断积分是否满足，如果礼包是抽奖类型，则会扣除积分
* @param {object} req -- 打包所有请求参数
* @param {string} req.packageGroupId -领取礼包组ID
* @returns  {object}  rsp 返回结果
* @returns {number} errcode : 错误码
* @returns {number} errInfo ：错误信息
* @returns {object}} errrsp ：请求其它接口的错误返回信息
* @version HonorofKings_CommonBK
*/
function BK_HonorofKings_GetGift(req) {
    let rsp = {}
    if (req === undefined || req.packageGroupId === undefined || req.packageGroupId === '') {
        rsp.errcode = errorCode.REQ_PARAMS_ERR
        rsp.errInfo = "req error:" + JSON.stringify(req)
        console.error(rsp.errInfo);
        return rsp;
    }
    let getAppDataRsp = BK_HonorofKings_GetAppData()
    if (getAppDataRsp.errcode !== errorCode.SUCCESS) {
        return getAppDataRsp;
    }
    if (getAppDataRsp.isActivityEnd) {
        rsp.errcode = errorCode.ACTIVITY_END
        rsp.errInfo = "activity end"
        console.error(rsp.errInfo)
        return rsp;
    }
    let app_data = getAppDataRsp.appData

    //领奖需要检查下登录状态
    let checkLogin = BK_HonorofKings_CheckLogin();
    if (checkLogin.errcode !== errorCode.SUCCESS) {
        rsp.errcode = errorCode.CHECK_LOGIN_STATE_ERR;
        rsp.errInfo = checkLogin.errInfo;
        rsp.errrsp = checkLogin;
        console.error(rsp.errInfo, checkLogin);
        return rsp;
    }

    let packagersp = BK_HonorofKings_QueryPackage();
    if (packagersp.errcode !== errorCode.SUCCESS) {
        rsp.errcode = errorCode.PACKAGE_QUERY_ERR;
        rsp.errInfo = packagersp.errInfo;
        rsp.errrsp = packagersp;
        console.error(rsp.errInfo, packagersp);
        return rsp;
    }
    let packageInfo = undefined;
    for (let i = 0; i < packagersp.package_list.length; i++) {
        if (packagersp.package_list[i].packageGroupId === req.packageGroupId) {
            packageInfo = packagersp.package_list[i]
        }
    }

    if (packageInfo === undefined) {
        rsp.errcode = errorCode.PACKAGEGROUPID_NOT_EXIST_IN_PACKAGELIST;
        rsp.errInfo = "BK_HonorofKings_GetGift packageInfo == undefined";
        rsp.errrsp = packagersp;
        console.error(rsp.errInfo, "req.packageGroupId :", req.packageGroupId);
        return rsp;
    }

    //如果不是走ams资格判定（Redis资格判定）的礼包，直接返回错误码
    if (packageInfo.isAmsQual === false) {
        rsp.errcode = errorCode.GET_GIFT_MUST_NEED_AMS_QUAL;
        rsp.errInfo = "get gift must need isAmsQual===true";
        rsp.errrsp = packageInfo;
        console.error(rsp.errInfo, "req.packageGroupId :", req.packageGroupId);
        return rsp;
    }

    let giftConfig = JSON.parse(app_data.giftConfig);
    if (giftConfig === undefined) {
        rsp.errcode = errorCode.PACKAGE_CONFIG_UNDEFINED
        rsp.errInfo = "giftConfig undefined"
        console.error(rsp.errInfo)
        return rsp;
    }

    //因为积分转区也要保留，所以需要用newroleid解析出来的partionid
    console.log("app_data.userinfo:", app_data.userinfo)
    let oldPartionid = app_data.userinfo.sUniqueRoleId.split("_")[0]
    let tans_param = {
        serviceType: app_data.openPlatform.service,
        openId: app_data.userinfo.sOpenId,
        platId: app_data.userinfo.sPlatID,
        area: BK_HonorofKings_GetArea(app_data.userinfo.sPartition),
        partition: app_data.userinfo.sPartition,
        roleId: app_data.userinfo.sRoleId,
        newRoleId: app_data.userinfo.sUniqueRoleId,
    }

    tans_param.mrms = {
        moduleId: giftConfig.gift_listId,
        packageGroupId: packageInfo.packageGroupId,
        packageNum: "1",
    }

    //检查积分是否足够
    let score_rsp = BK_HonorofKings_QueryScore();
    if (score_rsp.errcode !== errorCode.SUCCESS) {
        rsp.errcode = errorCode.SCORE_QUERY_ERR;
        rsp.errInfo = "BK_HonorofKings_QueryScore Error";
        rsp.errrsp = score_rsp;
        console.error(rsp.errInfo, score_rsp);
        return rsp;
    }
    else {
        if (score_rsp.scoreArray[0] < packageInfo.score_threshold) {
            console.error("score : ", score_rsp.scoreArray[0], "< payamt ", packageInfo.score_threshold);
            rsp.errcode = errorCode.SCORE_NOT_ENOUGH;
            rsp.errInfo = "score_rsp.scoreArray[0] < packageInfo.score_threshold";
            return rsp;
        }
    }

    if (packageInfo.packageType === "0") {
        //领取类礼包判断是否已经领取，如果是，直接返回错误码，就不调用发货接口了
        if (packageInfo.isGet) {
            rsp.errcode = errorCode.PACKAGE_ALREADY_GET
            rsp.errInfo = "package is already get";
            console.error(rsp.errInfo);
            return rsp
        }

        //领奖需要扣除资格
        tans_param.qual =
        {
            needQual: "1",
            uid: app_data.userinfo.sUniqueRoleId,
            tag: packageInfo.packageGroupId,
            maxLimitNum: "1",
            payAmt: 1,
        }

        if (packageInfo.isCostScore === true) {
            if (score_rsp.scoreArray[0] >= packageInfo.score_threshold) {
                //领奖需要扣除积分
                tans_param.score =
                {
                    needScore: "1",
                    acctId: app_data.commonConf.acct_id,
                    actionId: giftConfig.score_actionId,
                    area: oldPartionid,
                    payAmt: packageInfo.score_threshold,
                }
            }
            else {
                rsp.errcode = errorCode.GET_PACKAGE_DEDUCT_SCORE_ERR
                rsp.errInfo = "get package deductScore error: score_rsp.scoreArray[0] < score_threshold"
                console.error(rsp.errInfo);
                return rsp;
            }
        }
    }
    else if (packageInfo.packageType === "1") {
        if (packageInfo.isCostScore === true) {
            if (score_rsp.scoreArray[0] >= packageInfo.score_threshold) {
                //抽奖需要扣除积分
                tans_param.score =
                {
                    needScore: "1",
                    acctId: app_data.commonConf.acct_id,
                    actionId: giftConfig.score_actionId,
                    area: oldPartionid,
                    payAmt: packageInfo.score_threshold,
                }
            }
            else {
                rsp.errcode = errorCode.DRAW_PACKAGE_DEDUCT_SCORE_ERR
                rsp.errInfo = "draw package deductScore error: score_rsp.scoreArray[0] < packageInfo.score_threshold"
                console.error(rsp.errInfo);
                return rsp;
            }
        }
        else {
            rsp.errcode = errorCode.DRAW_PACKAGE_MUST_COST_SCORE
            rsp.errInfo = "draw package must cost score"
            console.error(rsp.errInfo);
            return rsp;
        }
    }
    else {
        console.error("packageInfo.packageType Error : ", packageInfo.packageType);
        rsp.errcode = errorCode.PACKAGE_TYPE_ERR;
        rsp.errInfo = "packageInfo.packageType Error";
        return rsp;
    }

    //潜规则，如果是体验服发奖则需要特殊处理area参数 来源：aaronmeng
    if (app_data.openPlatform.service === "yxzjtest") {
        tans_param.area = BK_HonorofKings_GetAreaForExp(app_data.userinfo.sAcountType, app_data.userinfo.sPlatID)
    }

    let trans_ate_rsp = amsbase.BK_DeliverMrmsItem(tans_param)
    console.log("GetGift req:", tans_param)
    console.log("GetGift rsp:", trans_ate_rsp)
    if (trans_ate_rsp.hasError === true) {
        rsp.errcode = errorCode.PACKAGE_DELIVER_ERR;
        rsp.errInfo = trans_ate_rsp.tipMsg;
        rsp.errrsp = trans_ate_rsp;
        console.log("BK_DeliverMrmsItem error :", rsp.errInfo);
        return rsp;
    }
    //领取成功后，如果是领取类礼包就再单独查下对应礼包的资格，判断是否可以继续领取，然后返回修改后的全量数据
    if (packageInfo.packageType === "0") {
        let queryReq = {}
        queryReq.openId = app_data.userinfo.sOpenId
        queryReq.uid = app_data.userinfo.sUniqueRoleId
        queryReq.tag = packageInfo.packageGroupId
        queryReq.initAmt = 1
        let qual_rsp = amsbase.BK_QualQuery(queryReq)
        if (qual_rsp.hasError) {
            rsp.errcode = errorCode.PACKAGE_QUAL_QUERY_ERR
            rsp.errInfo = "BK_QualQuery error ";
            rsp.qual_rsp = qual_rsp;
            console.error(rsp.errInfo, qual_rsp);
            return rsp
        }
        console.log("BK_QualQuery  :", qual_rsp.acctInfo.leftNum);
        packageInfo.isGet = qual_rsp.acctInfo.leftNum < 1
        rsp.package_list = packagersp;
        //如果领取礼包要扣积分，领取成功后就直接扣，避免再查询一次
        if (packageInfo.isCostScore === true) {
            rsp.score = [score_rsp.scoreArray[0] - packageInfo.score_threshold];
        }
        else {
            rsp.score = score_rsp.scoreArray;
        }
    }
    else if (packageInfo.packageType === "1") {
        rsp.trans_ate_rsp = trans_ate_rsp;
    }

    rsp.errcode = errorCode.SUCCESS
    console.log("BK_HonorofKings_GetGift  :", rsp);
    return rsp
}

/**
 * 查询标记状态
 * @returns 标记列表状态信息
 * @returns 一级参数:模块信息
 * @returns {number} errcode : 错误码
 * @returns {number} errInfo ：错误信息
 * @returns {object} errrsp ：请求其它接口的错误返回信息
 * @returns {Array} mark_list : 标记列表
 * @returns 二级参数:标记列表信息
 * @returns {string} name: 列表名称
 * @returns {array} submark_list: 子标记列表
 * @returns 三级参数:子标记列表
 * @returns {number} score_threshold: 解锁需要积分
 * @returns {string} pic_path: 图片路径
 * @returns {number} state: 0 : 未解锁  1:解锁
 * @version HonorofKings_CommonBK
 */
function BK_HonorofKings_QueryMarkState() {
    let rsp = {}
    let getAppDataRsp = BK_HonorofKings_GetAppData()
    if (getAppDataRsp.errcode !== errorCode.SUCCESS) {
        return getAppDataRsp;
    }
    let app_data = getAppDataRsp.appData

    let giftConfig = JSON.parse(app_data.giftConfig);

    let markConfig = JSON.parse(app_data.markConfig);

    let sUniqueRoleId = app_data.userinfo.sUniqueRoleId;

    if (markConfig === undefined) {
        rsp.errcode = errorCode.MARK_CONFIG_UNDEFINED
        rsp.errInfo = "markConfig undefined"
        console.error(rsp.errInfo);
        return rsp;
    }

    if (giftConfig === undefined) {
        rsp.errcode = errorCode.PACKAGE_CONFIG_UNDEFINED
        rsp.errInfo = "giftConfig undefined"
        console.error(rsp.errInfo);
        return rsp;
    }

    let keys = [];
    for (let i = 0; i < markConfig.mark_list.length; i++) {
        let sub = markConfig.mark_list[i];
        for (let j = 0; j < sub.submark_list.length; j++) {
            let key = "mark" + sUniqueRoleId + i.toString() + j.toString();
            keys.push(key);
        }
    }
    //批量查询redis
    try {
        let result = redisbase.BK_BatchRedisGetString(keys);
        if (result.hasError) {
            rsp.errcode = errorCode.REDIS_READ_ERR
            rsp.errInfo = result.tip
            rsp.errrsp = result
            console.error(rsp.errInfo);
            return rsp;
        }
    } catch (err) {
        rsp.errcode = errorCode.REDIS_READ_ERR
        rsp.errInfo = err
        console.error("err: ", err);
        return rsp;
    }

    //批量更改状态
    let markNumber = 0;
    for (let i = 0; i < markConfig.mark_list.length; i++) {
        let sub = markConfig.mark_list[i];
        for (let j = 0; j < sub.submark_list.length; j++) {
            let key = "mark" + sUniqueRoleId + i.toString() + j.toString();
            let mark = sub.submark_list[j];
            mark.state = result.values[key] === "1" ? 1 : 0;
            if (mark.state === 1) {
                ++markNumber;
            }
        }
    }

    rsp = markConfig;
    rsp.markNumber = markNumber;
    rsp.errcode = errorCode.SUCCESS
    console.log("BK_HonorofKings_QueryMarkState  :", rsp);
    return rsp
}

/**
 * 解锁标记
 * @param {object} req -- 打包所有请求参数
 * @param {number} req.tab_index -解锁图鉴一级下标
 * @param {number} req.sub_index -解锁图鉴二级下标
 * @returns 标记列表状态信息
 * @returns 一级参数:模块信息
 * @returns {number} errcode : 错误码
 * @returns {number} errInfo ：错误信息
 * @returns {object} errrsp ：请求其它接口的错误返回信息
 * @returns {Array} mark_list : 标记列表
 * @returns 二级参数:标记列表信息
 * @returns {string} name: 列表名称
 * @returns {array} submark_list: 子标记列表
 * @returns 三级参数:子标记列表
 * @returns {number} score_threshold: 解锁需要积分
 * @returns {string} pic_path: 图片路径
 * @returns {number} state: 0 : 未解锁  1:解锁
 * @version HonorofKings_CommonBK
 */
function BK_HonorofKings_SetMarkState(req) {
    let rsp = {}
    if (req == undefined || req.tab_index == undefined || req.sub_index == undefined) {
        rsp.errcode = errorCode.REQ_PARAMS_ERR
        rsp.errInfo = "req error:" + JSON.stringify(req)
        console.error(rsp.errInfo);
        return rsp;
    }
    let getAppDataRsp = BK_HonorofKings_GetAppData()
    if (getAppDataRsp.errcode !== errorCode.SUCCESS) {
        return getAppDataRsp;
    }
    if (getAppDataRsp.isActivityEnd) {
        rsp.errcode = errorCode.ACTIVITY_END
        rsp.errInfo = "activity end"
        console.error(rsp.errInfo)
        return rsp;
    }
    let app_data = getAppDataRsp.appData

    let giftConfig = JSON.parse(app_data.giftConfig);

    let markConfig = JSON.parse(app_data.markConfig);

    console.log("markConfig: ", markConfig, ", giftConfig: ", giftConfig);

    let sUniqueRoleId = app_data.userinfo.sUniqueRoleId;

    if (markConfig === undefined) {
        rsp.errcode = errorCode.MARK_CONFIG_UNDEFINED
        rsp.errInfo = "markConfig undefined"
        console.error(rsp.errInfo);
        return rsp;
    }

    if (giftConfig === undefined) {
        rsp.errcode = errorCode.PACKAGE_CONFIG_UNDEFINED
        rsp.errInfo = "giftConfig undefined"
        console.error(rsp.errInfo);
        return rsp;
    }

    try {
        if (req.tab_index >= markConfig.mark_list.length || req.sub_index >= markConfig.mark_list[req.tab_index].submark_list.length) {
            rsp.errcode = errorCode.REQ_PARAMS_ERR
            rsp.errInfo = "req tab_index or sub_index over length:" + JSON.stringify(req)
            console.error(rsp.errInfo);
            return rsp;
        }

        let keys = [];
        for (let i = 0; i < markConfig.mark_list.length; i++) {
            let sub = markConfig.mark_list[i];
            for (let j = 0; j < sub.submark_list.length; j++) {
                let key = "mark" + sUniqueRoleId + i.toString() + j.toString();
                keys.push(key);
            }
        }
    } catch (err) {
        rsp.errcode = errorCode.REQ_PARAMS_ERR
        rsp.errInfo = err
        console.error(rsp.errInfo);
        return rsp;
    }


    //批量查询redis
    try {
        let result = redisbase.BK_BatchRedisGetString(keys);
        if (result.hasError) {
            rsp.errcode = errorCode.REDIS_READ_ERR
            rsp.errInfo = result.tip
            rsp.errrsp = result
            console.error(rsp.errInfo);
            return rsp;
        }
    } catch (err) {
        rsp.errcode = errorCode.REDIS_READ_ERR
        rsp.errInfo = err
        console.error(rsp.errInfo);
        return rsp;
    }


    ///如果是顺序解锁，解锁第一个也不用判断
    if (markConfig.sort_type !== 0 && req.tab_index !== 0 && req.sub_index !== 0) {
        //检查是否有未解锁的图鉴
        for (let i = 0; i <= req.tab_index; ++i) {
            let subLen = i === req.tab_index ? req.sub_index : markConfig.mark_list[i].submark_list.length;
            for (let j = 0; j < subLen; ++j) {
                let key = "mark" + sUniqueRoleId + i.toString() + j.toString();
                if (result.values[key] !== "1") {
                    rsp.errcode = errorCode.MARK_UN_ORDER_UNLOCK
                    rsp.errInfo = "un oder unlock"
                    console.error(rsp.errInfo);
                    return rsp;
                }
            }
        }
    }

    let sub = markConfig.mark_list[req.tab_index];
    let mark = sub.submark_list[req.sub_index]
    let key = "mark" + oldPartionid + req.tab_index.toString() + req.sub_index.toString();
    if (result.values[key] === "1") {
        rsp.errcode = errorCode.MARK_REPEAT_UNLOCK
        rsp.errInfo = "reapty unlock"
        console.error(rsp.errInfo);
        return rsp;
    }

    //检查积分是否足够
    if (mark.score_threshold != undefined) {
        let score_rsp = BK_HonorofKings_QueryScore();
        if (score_rsp.errcode !== errorCode.SUCCESS) {
            rsp.errcode = errorCode.SCORE_QUERY_ERR;
            rsp.errInfo = "BK_HonorofKings_QueryScore Error";
            rsp.errrsp = score_rsp;
            console.error(rsp.errInfo, score_rsp);
            return rsp;
        }
        else {
            if (score_rsp.scoreArray[0] < mark.score_threshold) {
                console.error("score : ", score_rsp.scoreArray[0], "< payamt ", mark.score_threshold);
                rsp.errcode = errorCode.SCORE_NOT_ENOUGH;
                rsp.errInfo = "score_rsp.scoreArray[0] < mark.score_threshold";
                return rsp;
            }
        }
    }

    let redisSetStringRsp = redisbase.BK_RedisSetString(key, "1");
    if (redisSetStringRsp.hasError) {
        rsp.errcode = errorCode.REDIS_WRITE_ERR
        rsp.errInfo = redisSetStringRsp.tip
        rsp.errrsp = redisSetStringRsp
        console.error(rsp.errInfo);
        return rsp;
    }

    let deductScoreRsp = BK_HonorofKings_DeductScore({ payAmt: mark.score_threshold });
    if (deductScoreRsp.errcode != 1) {
        //积分扣取失败，重置状态
        let redisSetStringRsp = redisbase.BK_RedisSetString(key, "0");
        if (redisSetStringRsp.hasError) {
            rsp.errcode = errorCode.DEDUCT_SCORE_AND_REDIS_ROLLBACK_STATE_FAIL
            rsp.errInfo = "deductScore and rollback state fail "
            rsp.errrsp = redisSetStringRsp
            console.error(rsp.errInfo);
            return rsp;
        }
        rsp.errcode = errorCode.MARK_UNLOCK_DEDUCT_SCORE_ERR
        rsp.errInfo = deductScoreRsp.errInfo
        rsp.errrsp = deductScoreRsp
        console.error(rsp.errInfo);
        return rsp;
    }
    //如果设置成功了，就手动修改缓存的查询结果，避免再次全量查询，并返回设置后的全量Mark数据
    result.values[key] = "1"
    let markNumber = 0
    for (let i = 0; i < markConfig.mark_list.length; i++) {
        let sub = markConfig.mark_list[i];
        for (let j = 0; j < sub.submark_list.length; j++) {
            let key = "mark" + oldPartionid + i.toString() + j.toString();
            let mark = sub.submark_list[j];
            mark.state = result.values[key] === "1" ? 1 : 0;
            if (mark.state === 1) {
                ++markNumber;
            }
        }
    }

    rsp = markConfig;
    rsp.markNumber = markNumber;
    rsp.errcode = errorCode.SUCCESS
    console.log("BK_HonorofKings_SetMarkState  :", rsp);
    return rsp
}

/**
 * 根据标记数量来领取礼包，如果礼包是领取类型则会消耗资格，判断标记数量是否满足（暂不支持标记抽奖）
 * @param {object} req -- 打包所有请求参数
 * @param {string} req.packageGroupId -领取礼包组ID
 * @returns  {object}  rsp 返回结果
 * @returns {number} errcode : 错误码
 * @returns {number} errInfo ：错误信息
 * @returns {object}} errrsp ：请求其它接口的错误返回信息
 * @version HonorofKings_CommonBK
 */
function BK_HonorofKings_GetGiftByMarkCount(req) {
    let rsp = {}
    if (req === undefined || req.packageGroupId === undefined || req.packageGroupId === '') {
        rsp.errcode = errorCode.REQ_PARAMS_ERR
        rsp.errInfo = "req error:" + JSON.stringify(req)
        console.error(rsp.errInfo);
        return rsp;
    }
    let getAppDataRsp = BK_HonorofKings_GetAppData()
    if (getAppDataRsp.errcode !== errorCode.SUCCESS) {
        return getAppDataRsp;
    }
    if (getAppDataRsp.isActivityEnd) {
        rsp.errcode = errorCode.ACTIVITY_END
        rsp.errInfo = "activity end"
        console.error(rsp.errInfo)
        return rsp;
    }
    let app_data = getAppDataRsp.appData

    //领奖需要检查下登录状态
    let checkLogin = BK_HonorofKings_CheckLogin();
    if (checkLogin.errcode !== errorCode.SUCCESS) {
        rsp.errcode = errorCode.CHECK_LOGIN_STATE_ERR;
        rsp.errInfo = checkLogin.errInfo;
        rsp.errrsp = checkLogin;
        console.error(rsp.errInfo, checkLogin);
        return rsp;
    }

    let packagersp = BK_HonorofKings_QueryPackage();
    if (packagersp.errcode !== errorCode.SUCCESS) {
        rsp.errcode = errorCode.PACKAGE_QUERY_ERR;
        rsp.errInfo = packagersp.errInfo;
        rsp.errrsp = packagersp;
        console.error(rsp.errInfo, packagersp);
        return rsp;
    }
    let packageInfo = undefined;
    for (let i = 0; i < packagersp.package_list.length; i++) {
        if (packagersp.package_list[i].packageGroupId === req.packageGroupId) {
            packageInfo = packagersp.package_list[i]
        }
    }

    if (packageInfo === undefined) {
        rsp.errcode = errorCode.PACKAGEGROUPID_NOT_EXIST_IN_PACKAGELIST;
        rsp.errInfo = "BK_HonorofKings_GetGiftByMarkCount packageInfo == undefined";
        rsp.errrsp = packagersp;
        console.error(rsp.errInfo, "req.packageGroupId :", req.packageGroupId);
        return rsp;
    }

    let giftConfig = JSON.parse(app_data.giftConfig);
    if (giftConfig === undefined) {
        rsp.errcode = errorCode.PACKAGE_CONFIG_UNDEFINED
        rsp.errInfo = "giftConfig undefined"
        console.error(rsp.errInfo)
        return rsp;
    }

    //因为积分转区也要保留，所以需要用newroleid解析出来的partionid
    console.log("app_data.userinfo:", app_data.userinfo)
    let tans_param = {
        serviceType: app_data.openPlatform.service,
        openId: app_data.userinfo.sOpenId,
        platId: app_data.userinfo.sPlatID,
        area: BK_HonorofKings_GetArea(app_data.userinfo.sPartition),
        partition: app_data.userinfo.sPartition,
        roleId: app_data.userinfo.sRoleId,
        newRoleId: app_data.userinfo.sUniqueRoleId,
    }

    tans_param.mrms = {
        moduleId: giftConfig.gift_listId,
        packageGroupId: packageInfo.packageGroupId,
        packageNum: "1",
    }

    if (packageInfo.packageType === "0") {
        //领取类礼包判断是否已经领取，如果是，直接返回错误码，就不调用发货接口了
        if (packageInfo.isGet) {
            rsp.errcode = errorCode.PACKAGE_ALREADY_GET
            rsp.errInfo = "package is already get";
            console.error(rsp.errInfo);
            return rsp
        }

        //检查标记数量是否足够
        let markList = BK_HonorofKings_QueryMarkState();
        if (markList.errcode !== errorCode.SUCCESS) {
            rsp.errcode = errorCode.MARK_STATE_QUERY_ERR;
            rsp.errInfo = "BK_HonorofKings_QueryMarkState Error";
            rsp.errrsp = markList;
            console.error(rsp.errInfo, markList);
            return rsp;
        }
        else {
            if (markList.markNumber < packageInfo.score_threshold) {
                console.error("markNumber : ", markList.markNumber, "< payamt ", packageInfo.score_threshold);
                rsp.errcode = errorCode.UNLOCK_MARK_NUMBER_NOT_ENOUGH;
                rsp.errInfo = "markNumber < packageInfo.score_threshold";
                return rsp;
            }
        }
        //领奖需要扣除资格
        tans_param.qual =
        {
            needQual: "1",
            uid: app_data.userinfo.sUniqueRoleId,
            tag: packageInfo.packageGroupId,
            maxLimitNum: "1",
            payAmt: 1,
        }
    }
    else {
        console.error("packageInfo.packageType Error : ", packageInfo.packageType);
        rsp.errcode = errorCode.PACKAGE_TYPE_ERR;
        rsp.errInfo = "packageInfo.packageType Error";
        return rsp;
    }

    //潜规则，如果是体验服发奖则需要特殊处理area参数 来源：aaronmeng
    if (app_data.openPlatform.service === "yxzjtest") {
        tans_param.area = BK_HonorofKings_GetAreaForExp(app_data.userinfo.sAcountType, app_data.userinfo.sPlatID)
    }

    let trans_ate_rsp = amsbase.BK_DeliverMrmsItem(tans_param)
    console.log("GetGiftByMarkCount req:", tans_param)
    console.log("GetGiftByMarkCount rsp:", trans_ate_rsp)
    if (trans_ate_rsp.hasError === true) {
        rsp.errcode = errorCode.PACKAGE_DELIVER_ERR;
        rsp.errInfo = trans_ate_rsp.tipMsg;
        rsp.errrsp = trans_ate_rsp;
        console.log("BK_DeliverMrmsItem error :", rsp.errInfo);
        return rsp;
    }
    //领取成功后，再单独查下对应礼包的资格（抽奖类型礼包已被过滤），判断是否可以继续领取，然后返回修改后的全量数据
    let queryReq = {}
    queryReq.openId = app_data.userinfo.sOpenId
    queryReq.uid = app_data.userinfo.sUniqueRoleId
    queryReq.tag = packageInfo.packageGroupId
    queryReq.initAmt = 1
    let qual_rsp = amsbase.BK_QualQuery(queryReq)
    if (qual_rsp.hasError) {
        rsp.errcode = errorCode.PACKAGE_QUAL_QUERY_ERR
        rsp.errInfo = "BK_QualQuery error ";
        rsp.qual_rsp = qual_rsp;
        console.error(rsp.errInfo, qual_rsp);
        return rsp
    }
    console.log("BK_QualQuery  :", qual_rsp.acctInfo.leftNum);
    packageInfo.isGet = qual_rsp.acctInfo.leftNum < 1

    rsp.package_list = packagersp.package_list
    rsp.errcode = errorCode.SUCCESS
    console.log("[1]BK_HonorofKings_GetGiftByMarkCount  :", rsp);
    return rsp
}

/**
 * 查询每日礼包
 * 依赖礼包配置结构：
  {
    "score_actionId": "1134",
    "gift_listId": "461627",
    "gift_listConfig": [
      {
        "package_id": "1961110",
        "score_threshold": 0,
        "isAmsQual": 'false',
        "isCostScore": 'false',
        "isDailyGet": 'false'
      }
    ]
  }
 * @returns 一级参数:模块信息
 * @returns {number} errcode : 错误码
 * @returns {number} errInfo ：错误信息
 * @returns {object}} errrsp ：请求其它接口的错误返回信息
 * @returns {Array} package_list : 礼包信息
 * @returns 二级参数:礼包信息
 * @returns {string} packageId: 礼包ID
 * @returns {string} packageName: 礼包名称
 * @returns {boolean} isGet: 是否被领取
 * @returns {boolean} isAmsQual: 是否走AMS资格判定，否表示通过Redis进行资格判定
 * @returns {boolean} isDailyGet: 是否是每日领取一次，否表示整个活动期间只领取一次
 * @returns {number} packageGroupId:礼包组ID
 * @returns {array} itemInfo: 礼包内包含的道具数组
 * @returns 三级参数:礼包道具信息
 * @returns {string} itemName: 道具名称
 * @returns {string} itemType: 道具类型
 * @returns {string} itemId: ams道具ID,全局唯一
 * @returns {string} itemCode: 游戏道具ID
 * @version HonorofKings_CommonBK
 */
function BK_HonorofKings_QueryDailyPackage() {
    let rsp = {}
    let getAppDataRsp = BK_HonorofKings_GetAppData()
    if (getAppDataRsp.errcode !== errorCode.SUCCESS) {
        return getAppDataRsp;
    }
    let app_data = getAppDataRsp.appData
    let giftConfig = JSON.parse(app_data.giftConfig);

    if (giftConfig === undefined) {
        rsp.errcode = errorCode.PACKAGE_CONFIG_UNDEFINED
        rsp.errInfo = "giftConfig undefined"
        console.error(rsp.errInfo);
        return rsp;
    }

    //获取所有礼包信息
    let package_info = amsbase.BK_ResourceLotterySafemoduleinfo({
        serviceType: app_data.openPlatform.service,
        moduleId: giftConfig.gift_listId,
    })
    console.log("Get BK_ResourceLotterySafemoduleinfo ", package_info)

    if (package_info.hasError) {
        rsp.errcode = errorCode.ALL_PACKAGE_INFOS_GET_ERR
        rsp.errInfo = "BK_ResourceLotterySafemoduleinfo Error"
        rsp.errrsp = package_info
        console.error(rsp.errInfo, package_info);
        return package_info
    }

    let newpackage_list = [];
    //判断礼包是否领取
    if (package_info.hasError === false) {
        for (let singlePackage of package_info.packageGroup) {
            if (singlePackage.packageInfo === undefined || singlePackage.packageInfo.length <= 0) {
                console.error("package info is error, packageGroupId :", singlePackage.packageGroupId);
                continue;
            }
            let tmppackage = {};
            tmppackage.packageInfoList = singlePackage.packageInfo;
            if (tmppackage.packageInfoList === undefined) {
                console.error("package is null ,packageGroupId :", singlePackage.packageGroupId);
                continue;
            }
            tmppackage.isGet = false;
            tmppackage.isAmsQual = false;
            tmppackage.isDailyGet = undefined;
            tmppackage.packageGroupId = singlePackage.packageGroupId;
            if (giftConfig.gift_listConfig === undefined) {
                rsp.errcode = errorCode.PACKAGE_GET_SCORE_CONFIG_NOT_EXIST
                rsp.errInfo = "giftConfig gift_scoreThreshold undefined"
                console.error(rsp.errInfo);
                return rsp;
            }
            for (let singleGift of giftConfig.gift_listConfig) {
                //每日礼包领取通过Redis进行资格判定，不走AMS，所以加个isAmsQual==='false'进行过滤
                if (singleGift.package_id === tmppackage.packageGroupId && singleGift.isDailyGet !== undefined && singleGift.isAmsQual === 'false') {
                    tmppackage.isDailyGet = singleGift.isDailyGet === 'true' ? true : false;
                    tmppackage.isAmsQual = false
                    break;
                }
            }

            if (tmppackage.isDailyGet === undefined) {
                continue;
            }
            newpackage_list.push(tmppackage);
        }

        if (newpackage_list.length < 1) {
            console.error("newpackage_list.length < 1");
            return;
        }

        //每日礼包的领取判定
        let sUniqueRoleId = app_data.userinfo.sUniqueRoleId;
        let keys = [];
        for (let i = 0; i < newpackage_list.length; i++) {
            let key = "package" + sUniqueRoleId + newpackage_list[i].packageGroupId;
            //如果是每日领取一次，就在key后面加上当前日期
            if (newpackage_list[i].isDailyGet) {
                key = key + new Date().toLocaleDateString();
            }
            keys.push(key);
        }
        //批量查询redis
        let result = redisbase.BK_BatchRedisGetString(keys);
        if (result.hasError) {
            rsp.errcode = errorCode.REDIS_READ_ERR
            rsp.errInfo = result.tip
            rsp.errrsp = result
            console.error(rsp.errInfo);
            return rsp;
        }
        //批量更改状态
        for (let i = 0; i < newpackage_list.length; i++) {
            newpackage_list[i].isGet = result.values[keys[i]] === "1" ? true : false;
        }
    }

    rsp.package_list = newpackage_list
    rsp.errcode = errorCode.SUCCESS
    console.log("BK_HonorofKings_QueryDailyPackage  :", rsp);
    return rsp
}

/**
 * 领取每日礼包
 * @param {object} req -- 打包所有请求参数
 * @param {string} req.packageGroupId -领取礼包组ID
 * @returns  {object}  rsp 返回结果
 * @returns {number} errcode : 错误码
 * @returns {number} errInfo ：错误信息
 * @returns {object}} errrsp ：请求其它接口的错误返回信息
 * @version HonorofKings_CommonBK
 */
function BK_HonorofKings_GetDailyPackage(req) {
    let rsp = {}
    if (req === undefined || req.packageGroupId === undefined || req.packageGroupId === '') {
        rsp.errcode = errorCode.REQ_PARAMS_ERR
        rsp.errInfo = "req error:" + JSON.stringify(req)
        console.error(rsp.errInfo);
        return rsp;
    }
    let getAppDataRsp = BK_HonorofKings_GetAppData()
    if (getAppDataRsp.errcode !== errorCode.SUCCESS) {
        return getAppDataRsp;
    }
    if (getAppDataRsp.isActivityEnd) {
        rsp.errcode = errorCode.ACTIVITY_END
        rsp.errInfo = "activity end"
        console.error(rsp.errInfo)
        return rsp;
    }
    let app_data = getAppDataRsp.appData

    //领奖需要检查下登录状态
    let checkLogin = BK_HonorofKings_CheckLogin();
    if (checkLogin.errcode !== errorCode.SUCCESS) {
        rsp.errcode = errorCode.CHECK_LOGIN_STATE_ERR;
        rsp.errInfo = checkLogin.errInfo;
        rsp.errrsp = checkLogin;
        console.error(rsp.errInfo, checkLogin);
        return rsp;
    }

    let packagersp = BK_HonorofKings_QueryDailyPackage();
    if (packagersp.errcode !== errorCode.SUCCESS) {
        rsp.errcode = errorCode.PACKAGE_QUERY_ERR;
        rsp.errInfo = packagersp.errInfo;
        rsp.errrsp = packagersp;
        console.error(rsp.errInfo, packagersp);
        return rsp;
    }
    let packageInfo = undefined;
    for (let i = 0; i < packagersp.package_list.length; i++) {
        if (packagersp.package_list[i].packageGroupId === req.packageGroupId) {
            packageInfo = packagersp.package_list[i]
        }
    }

    if (packageInfo === undefined) {
        rsp.errcode = errorCode.PACKAGEGROUPID_NOT_EXIST_IN_PACKAGELIST;
        rsp.errInfo = "BK_HonorofKings_GetDailyPackage packageInfo == undefined";
        rsp.errrsp = packagersp;
        console.error(rsp.errInfo, "req.packageGroupId :", req.packageGroupId);
        return rsp;
    }

    //如果是走AMS资格判定的礼包，直接返回错误码，每日礼包的资格是通过Redis来判断
    if (packageInfo.isAmsQual === true) {
        rsp.errcode = errorCode.GET_DAILY_PACKAGE_MUST_NEED_REDIS_QUAL;
        rsp.errInfo = "get daily package must isAmsQual===false";
        rsp.errrsp = packageInfo;
        console.error(rsp.errInfo, "req.packageGroupId :", req.packageGroupId);
        return rsp;
    }

    //如果该礼包已经领取，直接返回错误码，就不调用发货接口了
    if (packageInfo.isGet) {
        rsp.errcode = errorCode.PACKAGE_ALREADY_GET
        rsp.errInfo = "package is already get";
        console.error(rsp.errInfo);
        return rsp
    }

    let giftConfig = JSON.parse(app_data.giftConfig);
    if (giftConfig === undefined) {
        rsp.errcode = errorCode.PACKAGE_CONFIG_UNDEFINED
        rsp.errInfo = "giftConfig undefined"
        console.error(rsp.errInfo)
        return rsp;
    }

    let tans_param = {
        serviceType: app_data.openPlatform.service,
        openId: app_data.userinfo.sOpenId,
        platId: app_data.userinfo.sPlatID,
        area: BK_HonorofKings_GetArea(app_data.userinfo.sPartition),
        partition: app_data.userinfo.sPartition,
        roleId: app_data.userinfo.sRoleId,
        newRoleId: app_data.userinfo.sUniqueRoleId,
    }

    tans_param.mrms = {
        moduleId: giftConfig.gift_listId,
        packageGroupId: packageInfo.packageGroupId,
        packageNum: "1",
    }

    //没有领取的话，先查资格判能否领取
    let sUniqueRoleId = app_data.userinfo.sUniqueRoleId;
    let key = "package" + sUniqueRoleId + packageInfo.packageGroupId;
    if (packageInfo.isDailyGet) {
        key = key + new Date().toLocaleDateString();
    }
    let redisGetStringRsp = redisbase.BK_RedisGetString(key);
    if (redisGetStringRsp.hasError) {
        rsp.errcode = errorCode.REDIS_READ_ERR
        rsp.errInfo = redisGetStringRsp.tip
        rsp.errrsp = redisGetStringRsp
        console.error(rsp.errInfo);
        return rsp;
    }
    if (redisGetStringRsp.value === "1") {
        rsp.errcode = errorCode.PACKAGE_ALREADY_GET
        rsp.errInfo = "package is already get";
        console.error(rsp.errInfo);
        return rsp
    }

    //更新redis标记
    let redisSetStringRsp = redisbase.BK_RedisSetString(key, "1");
    if (redisSetStringRsp.hasError) {
        rsp.errcode = errorCode.REDIS_WRITE_ERR
        rsp.errInfo = redisSetStringRsp.tip
        rsp.errrsp = redisSetStringRsp
        console.error(rsp.errInfo);
        return rsp;
    }

    //潜规则，如果是体验服发奖则需要特殊处理area参数 来源：aaronmeng
    if (app_data.openPlatform.service === "yxzjtest") {
        tans_param.area = BK_HonorofKings_GetAreaForExp(app_data.userinfo.sAcountType, app_data.userinfo.sPlatID)
    }

    let trans_ate_rsp = amsbase.BK_DeliverMrmsItem(tans_param)
    console.log("BK_HonorofKings_GetDailyPackage trans req:", tans_param)
    console.log("BK_HonorofKings_GetDailyPackage trans rsp:", trans_ate_rsp)
    if (trans_ate_rsp.hasError === true) {
        //发货失败，重置状态
        let redisSetStringRsp = redisbase.BK_RedisSetString(key, "0");
        if (redisSetStringRsp.hasError) {
            rsp.errcode = errorCode.DELIVER_ITEM_AND_REDIS_ROLLBACK_STATE_FAIL
            rsp.errInfo = "deliver item and rollback state fail "
            rsp.errrsp = redisSetStringRsp
            console.error(rsp.errInfo);
            return rsp;
        }
        rsp.errcode = errorCode.PACKAGE_DELIVER_ERR;
        rsp.errInfo = trans_ate_rsp.tipMsg;
        rsp.errrsp = trans_ate_rsp;
        console.log("BK_DeliverMrmsItem error :", rsp.errInfo);
        return rsp;
    }
    //领取成功后，再单独修改为已领取，然后返回修改后的全量数据
    packageInfo.isGet = true;

    rsp.package_list = packagersp.package_list
    rsp.errcode = errorCode.SUCCESS
    console.log("BK_HonorofKings_GetDailyPackage  :", rsp);
    return rsp
}