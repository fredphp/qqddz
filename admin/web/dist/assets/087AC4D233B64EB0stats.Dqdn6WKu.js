/*! 
 柴米油盐后台管理系统 
 Time : 1778801530000 */
import{a as t}from"./087AC4D233B64EB0adminRequest.CvtLT3uw.js";const a=()=>t({url:"/ddz/stats/overview",method:"get"}),s=a=>t({url:"/ddz/stats/daily",method:"post",data:a}),d=a=>t({url:"/ddz/stats/leaderboard",method:"post",data:a}),e=(a,s)=>t({url:"/ddz/stats/chart/active",method:"get",params:{startDate:a,endDate:s}}),r=(a,s)=>t({url:"/ddz/stats/chart/games",method:"get",params:{startDate:a,endDate:s}});export{e as a,r as b,d as c,s as d,a as g};
