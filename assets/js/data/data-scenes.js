const WIDTH=640;
const HEIGHT=300;
const TOP=144;
const BOTTOM=244;

export const dataScenes=[
 {color:'#e65f4e',x:170,width:217,opacity:1,semantic:{regionId:'leftCenter',sizeId:'standard'},description:'مشهد طريق أفقي بمركبة رئيسية متوسطة العرض تبدأ بين اليسار والمنتصف وتمتد نحو منتصف الصورة.'},
 {color:'#e59a3b',x:290,width:217,opacity:1,semantic:{regionId:'rightCenter',sizeId:'standard'},description:'مشهد طريق أفقي بمركبة رئيسية متوسطة العرض تبدأ بين المنتصف واليمين وتمتد نحو الجهة اليمنى.'},
 {color:'#6d7f90',x:235,width:217,opacity:.55,semantic:{regionId:'center',sizeId:'standard'},description:'مشهد طريق أفقي بمركبة رئيسية باهتة نسبيًا ومتوسطة العرض تتمركز حول منتصف الصورة.'},
 {color:'#8a64c7',x:120,width:205,opacity:1,shadow:true,semantic:{regionId:'left',sizeId:'short'},description:'مشهد طريق أفقي بمركبة رئيسية أقصر قليلًا في الجهة اليسرى، مع ظل يمتد خارج جسم المركبة ولا يدخل في الإطار.'},
 {color:'#3c9d83',x:330,width:198,opacity:1,semantic:{regionId:'right',sizeId:'short'},description:'مشهد طريق أفقي بمركبة رئيسية قصيرة نسبيًا في الجزء الأيمن من الطريق.'},
 {color:'#cc6f91',x:215,width:235,opacity:1,semantic:{regionId:'center',sizeId:'wide'},description:'مشهد طريق أفقي بمركبة رئيسية عريضة نسبيًا حول منتصف الطريق.'}
];

export const dataRegionOptions=[
 {id:'left',label:'الجزء الأيسر من الطريق',x:.188},
 {id:'leftCenter',label:'بين اليسار والمنتصف',x:.266},
 {id:'center',label:'حول منتصف الطريق',x:.35},
 {id:'rightCenter',label:'بين المنتصف واليمين',x:.453},
 {id:'right',label:'الجزء الأيمن من الطريق',x:.516}
];

export const dataSizeOptions=[
 {id:'short',label:'مركبة قصيرة نسبيًا',w:.31},
 {id:'standard',label:'مركبة متوسطة العرض',w:.34},
 {id:'wide',label:'مركبة عريضة نسبيًا',w:.37}
];

export const dataSceneDescriptions=dataScenes.map(scene=>scene.description);
export function dataTargetForScene(index){const scene=dataScenes[index];return scene?{x:scene.x/WIDTH,y:TOP/HEIGHT,w:scene.width/WIDTH,h:(BOTTOM-TOP)/HEIGHT}:null}
export function semanticTargetForScene(index){const scene=dataScenes[index];return scene?.semantic?{...scene.semantic}:null}
export function semanticDataBox(regionId,sizeId){const region=dataRegionOptions.find(item=>item.id===regionId),size=dataSizeOptions.find(item=>item.id===sizeId);if(!region||!size)return null;return {x:region.x,y:TOP/HEIGHT,w:size.w,h:(BOTTOM-TOP)/HEIGHT,regionId,sizeId,source:'semantic'}}
export function semanticDataCredit(index,answer){const target=semanticTargetForScene(index);if(!target||answer?.source!=='semantic')return null;const region=answer.regionId===target.regionId,size=answer.sizeId===target.sizeId;if(region&&size)return 1;if(region||size)return .5;return 0}
export function roadSceneSVG(index){const scene=dataScenes[index]||dataScenes[index%dataScenes.length]||dataScenes[0],rear=scene.x+45,front=scene.x+scene.width-47,cabinRight=scene.x+scene.width-70;return `<svg viewBox="0 0 ${WIDTH} ${HEIGHT}" aria-hidden="true"><rect width="${WIDTH}" height="${HEIGHT}" fill="#dcecf7"/><rect y="160" width="${WIDTH}" height="140" fill="#44566a"/><path d="M0 235h${WIDTH}" stroke="#f4dc69" stroke-width="7" stroke-dasharray="46 28"/>${scene.shadow?`<ellipse cx="${scene.x+scene.width/2}" cy="235" rx="${scene.width*.62}" ry="18" fill="#203040" opacity=".18"/>`:''}<circle cx="${rear}" cy="220" r="24" fill="#23384b"/><circle cx="${front}" cy="220" r="24" fill="#23384b"/><path d="M${scene.x} 208L${scene.x+42} ${TOP}H${cabinRight}L${scene.x+scene.width} 208Z" fill="${scene.color}" opacity="${scene.opacity}"/></svg>`}
