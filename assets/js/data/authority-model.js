export const authorityModel={
 data:{price:{primary:['platform'],secondary:['client']},allocation:{primary:['platform'],secondary:['client']},monitoring:{primary:['platform'],secondary:[]},quality:{primary:['client'],secondary:['platform']},risk:{primary:['worker'],secondary:[]},termination:{primary:['platform'],secondary:[]}},
 moderation:{price:{primary:['platform'],secondary:['client']},allocation:{primary:['platform'],secondary:['client']},monitoring:{primary:['platform'],secondary:[]},quality:{primary:['client'],secondary:['platform']},risk:{primary:['worker'],secondary:[]},termination:{primary:['platform'],secondary:[]}},
 ai:{price:{primary:['platform'],secondary:['client']},allocation:{primary:['platform','client'],secondary:[]},monitoring:{primary:['platform'],secondary:['client']},quality:{primary:['client'],secondary:['platform']},risk:{primary:['worker'],secondary:[]},termination:{primary:['platform'],secondary:[]}},
 translation:{price:{primary:['client'],secondary:['platform']},allocation:{primary:['client','platform'],secondary:[]},monitoring:{primary:['platform'],secondary:[]},quality:{primary:['client'],secondary:['platform']},risk:{primary:['worker'],secondary:[]},termination:{primary:['platform'],secondary:[]}}
};
const parties=['worker','platform','client'];
export function authorityReference(type,axis){const ref=authorityModel[type]?.[axis];return ref?{primary:[...ref.primary],secondary:[...ref.secondary]}:{primary:[],secondary:[]}}
export function authorityReferenceForState(type,axis,state={}){
 const base=authorityReference(type,axis);
 if(state.contractDeclineEnding&&axis==='termination')return {primary:['platform'],secondary:[]};
 if(state.noWorkEnding){
  if(axis==='risk')return {primary:['worker'],secondary:[]};
  if(axis==='termination')return {primary:['platform'],secondary:[]};
 }
 return base;
}
export function authorityLeaders(type,axis){const primary=authorityReference(type,axis).primary;return parties.filter(p=>primary.includes(p))}
