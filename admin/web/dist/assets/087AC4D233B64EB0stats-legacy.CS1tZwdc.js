/*! 
 柴米油盐后台管理系统 
 Time : 1778684774000 */
System.register(["./087AC4D233B64EB0adminRequest-legacy.B7q920hX.js"],function(t,e){"use strict";var a;return{setters:[function(t){a=t.a}],execute:function(){t("g",function(){return a({url:"/ddz/stats/overview",method:"get"})}),t("d",function(t){return a({url:"/ddz/stats/daily",method:"post",data:t})}),t("c",function(t){return a({url:"/ddz/stats/leaderboard",method:"post",data:t})}),t("a",function(t,e){return a({url:"/ddz/stats/chart/active",method:"get",params:{startDate:t,endDate:e}})}),t("b",function(t,e){return a({url:"/ddz/stats/chart/games",method:"get",params:{startDate:t,endDate:e}})})}}});
