/*! 
 柴米油盐后台管理系统 
 Time : 1778684774000 */
System.register(["./087AC4D233B64EB0adminRequest-legacy.B7q920hX.js"],function(t,e){"use strict";var u;return{setters:[function(t){u=t.a}],execute:function(){t("a",function(t){return u({url:"/ddz/userAccount/list",method:"post",data:t})}),t("c",function(t){return u({url:"/ddz/userAccount/create",method:"post",data:t})}),t("d",function(t){return u({url:"/ddz/userAccount/delete",method:"delete",data:t})}),t("u",function(t){return u({url:"/ddz/userAccount/update",method:"put",data:t})}),t("g",function(t){return u({url:"/ddz/userAccount/loginLog",method:"post",data:t})}),t("b",function(t,e){return u({url:"/ddz/userAccount/checkPhone",method:"get",params:{phone:t,excludeId:e}})})}}});
