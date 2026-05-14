/*! 
 柴米油盐后台管理系统 
 Time : 1778733385000 */
System.register(["./087AC4D233B64EB0index-legacy.ZDxua-Gc.js"],function(t,e){"use strict";var n;return{setters:[function(t){n=t.s}],execute:function(){t("a",function(){return n({url:"/system/getSystemConfig",method:"post"})}),t("s",function(t){return n({url:"/system/setSystemConfig",method:"post",data:t})}),t("g",function(){return n({url:"/system/getServerInfo",method:"post",donNotShowLoading:!0})}),t("r",function(t){return n({url:"/system/reloadSystem",method:"post",data:t})})}}});
