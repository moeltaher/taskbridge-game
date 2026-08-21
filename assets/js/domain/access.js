function qualityPoints(value){return value<70?2:value<82?1:0}
function rejectionPoints(count){return count>=3?2:count>=1?1:0}
function disputePoints(severity){return severity>=2?2:severity===1?1:0}

export function assessAccessDecision(sc,state){
 const qualityBeforeDispute=Number(state.qualityBeforeDispute);
 const accessBeforeDispute=Number(state.accessBeforeDispute);
 const factors=[
  {title:'نتيجة مراجعة الجودة',value:state.disputeSeverity>=2?'اختلاف جوهري':state.disputeSeverity===1?'اختلاف محدود':'لا اختلاف مؤثر',points:disputePoints(state.disputeSeverity),why:'يستخدم هذا العامل شدة المراجعة نفسها مرة واحدة فقط.'},
  {title:'جودة الحساب قبل عقوبة النزاع',value:`${qualityBeforeDispute}%`,points:qualityPoints(qualityBeforeDispute),why:'نستخدم قيمة الجودة قبل خفض النزاع حتى لا نحسب الواقعة نفسها مرتين.'},
  {title:'سجل رفض العروض',value:`${state.rejections} مرة`,points:rejectionPoints(state.rejections),why:'يسجل الرفض كعامل مستقل هنا مرة واحدة. لا نستخدم معدل القبول أو مؤشر الوصول المرحلي مرة ثانية في قرار التقييد النهائي.'}
 ];
 const points=factors.reduce((sum,item)=>sum+item.points,0);
 const projectAt=3+Math.floor(sc.outcomeStrictness/2);
 const suspendAt=5+Math.floor(sc.outcomeStrictness/3);
 const outcome=points>=suspendAt?'suspended':points>=projectAt?'project':'warning';
 return {scenarioKey:state.scenarioKey,points,projectAt,suspendAt,outcome,qualityBeforeDispute,accessBeforeDispute,factors};
}
