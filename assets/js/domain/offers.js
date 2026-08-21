const round2=v=>Math.round(Number(v)*100)/100;

function taskShape(scenario,tier){
 const isData=scenario.type==='data';
 const baseSamples=isData?3:3;
 if(tier==='micro')return {duration:7,sampleCount:2,pay:.55,stress:scenario.jobStress.micro};
 if(tier==='premium')return {duration:isData?16:18,sampleCount:isData?3:5,pay:round2(scenario.basePay*1.55),stress:scenario.jobStress.premium};
 if(tier==='second-standard')return {duration:Math.max(9,Math.round((scenario.type==='translation'?14:scenario.type==='ai'?15:scenario.type==='moderation'?14:12)*.8)),sampleCount:2,pay:round2(scenario.basePay*.78),stress:Math.max(4,Math.round((scenario.jobStress.micro+scenario.jobStress.core)/2))};
 return {duration:scenario.type==='data'?12:scenario.type==='moderation'?14:scenario.type==='ai'?15:14,sampleCount:baseSamples,pay:scenario.basePay,stress:scenario.jobStress.core};
}

export function buildOffer(scenario,tier='core',state={}){
 const shape=taskShape(scenario,tier),premium=tier==='premium',second=tier==='second-standard'||tier==='premium';
 const titleBase=scenario.type==='data'?'تعليم بيانات صور طرق':scenario.type==='moderation'?'مراجعة محتوى قصير':scenario.type==='ai'?'مقارنة إجابات نموذج لغوي':'ترجمة أوصاف تجارة إلكترونية';
 const title=tier==='micro'?`دفعة صغيرة · ${titleBase}`:premium?`دفعة مميزة · ${titleBase}`:tier==='second-standard'?`دفعة إضافية · ${titleBase}`:titleBase;
 const clientValue=second?Math.max(shape.pay*1.9,scenario.clientPay*(premium?1.2:.55)):tier==='micro'?Math.max(1.1,scenario.clientPay*.28):scenario.clientPay;
 return {id:tier==='second-standard'?'second-standard':premium&&second?'second-premium':tier,title,pay:shape.pay,duration:shape.duration,sampleCount:shape.sampleCount,client:scenario.client,clientValue:round2(clientValue),stress:shape.stress,premium,locked:premium&&Number(state.access||0)<scenario.accessPolicy.premiumAt};
}

export function marketOffers(scenario,state={}){return [buildOffer(scenario,'core',state),buildOffer(scenario,'micro',state),buildOffer(scenario,'premium',state)]}
export function secondOfferForAccess(scenario,access){return buildOffer(scenario,Number(access)>=scenario.accessPolicy.premiumAt?'premium':'second-standard',{access})}
