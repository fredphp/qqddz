/*! 
 柴米油盐后台管理系统 
 Time : 1778798333000 */
import{a as t}from"./087AC4D233B64EB0adminRequest.CvtLT3uw.js";const d=d=>t({url:"/ddz/userAccount/list",method:"post",data:d}),e=d=>t({url:"/ddz/userAccount/create",method:"post",data:d}),a=d=>t({url:"/ddz/userAccount/delete",method:"delete",data:d}),o=d=>t({url:"/ddz/userAccount/update",method:"put",data:d}),u=d=>t({url:"/ddz/userAccount/loginLog",method:"post",data:d}),s=(d,e)=>t({url:"/ddz/userAccount/checkPhone",method:"get",params:{phone:d,excludeId:e}});export{d as a,s as b,e as c,a as d,u as g,o as u};
