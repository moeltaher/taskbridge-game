function rejectionPoints(count){return count>=2?2:count>=1?1:0}
function disputePoints(severity){return severity>=2?2:severity===1?1:0}

export function assessAccessDecision(sc,state){
 const finalSeverity=Number(state.finalReviewSeverity??state.disputeSeverity??0);
 const factors=[
  {title:'نتيجة المراجعة النهائية',value:finalSeverity>=2?'اختلاف جوهري':finalSeverity===1?'اختلاف محدود':'لا اختلاف مؤثر',points:disputePoints(finalSeverity),why:'يستخدم القرار نتيجة المراجعة النهائية بعد الاعتراض إن حدث؛ ولا يعيد إدخال نتيجة المهمة أو جودة الحساب كعامل ثانٍ.'},
  {title:'سجل رفض العروض',value:`${state.rejections} مرة`,points:rejectionPoints(state.rejections),why:'رفض واحد يضيف نقطة ورفضان يضيفان نقطتين. لا يستخدم القرار معدل القبول أو مؤشر الوصول المرحلي مرة أخرى.'}
 ];
 const points=factors.reduce((sum,item)=>sum+item.points,0);
 const projectAt=sc.accessPolicy?.projectAt??3;
 const suspendAt=sc.accessPolicy?.suspendAt??4;
 const outcome=points>=suspendAt?'suspended':points>=projectAt?'project':'warning';
 return {points,projectAt,suspendAt,outcome,factors};
}
