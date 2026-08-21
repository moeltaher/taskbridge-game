export const pages={
 home:{slug:'',stage:0,progress:0,title:'قبل الوردية',public:true,mode:'worker'},
 scenario:{slug:'scenario',stage:0,progress:4,title:'اختيار الحالة',public:true,mode:'worker',stageDefault:true},
 onboarding:{slug:'onboarding',stage:1,progress:9,title:'العقد',mode:'worker'},
 work:{slug:'work',stage:2,progress:28,title:'تنفيذ العمل',mode:'worker'},
 management:{slug:'management',stage:3,progress:48,title:'الإدارة الخوارزمية',mode:'worker'},
 risk:{slug:'risk',stage:4,progress:58,title:'المخاطر',mode:'worker'},
 dispute:{slug:'dispute',stage:5,progress:66,title:'نزاع الجودة',mode:'worker'},
 payment:{slug:'payment',stage:6,progress:74,title:'توزيع القيمة',mode:'worker'},
 access:{slug:'access',stage:7,progress:81,title:'الوصول إلى العمل',mode:'worker'},
 investigation:{slug:'investigation',stage:8,progress:91,title:'التحقيق',mode:'researcher'},
 power:{slug:'power',stage:9,progress:97,title:'خريطة السلطة',mode:'researcher'},
 conclusion:{slug:'conclusion',stage:10,progress:99,title:'الاستنتاج',mode:'researcher'},
 result:{slug:'result',stage:11,progress:100,title:'النتيجة',mode:'researcher',stageDefault:true},
 rights:{slug:'rights',stage:11,progress:100,title:'خريطة الحقوق',mode:'researcher'}
};
export const routes=Object.fromEntries(Object.entries(pages).map(([id,p])=>[id,p.slug]));
export const progress=Object.fromEntries(Object.entries(pages).map(([id,p])=>[id,[p.progress,p.title]]));
const publicPages=new Set(Object.entries(pages).filter(([,p])=>p.public).map(([id])=>id));
const stageDefaults=new Map();
for(const [id,p] of Object.entries(pages)){if(p.stageDefault||!stageDefaults.has(p.stage))stageDefaults.set(p.stage,id)}
function pathParts(){const parts=location.pathname.split('/').filter(Boolean);if(parts.at(-1)?.toLowerCase()==='index.html')parts.pop();return parts}
export function projectBase(){const parts=pathParts(),known=new Set(Object.values(routes).filter(Boolean));if(parts.length&&known.has(parts.at(-1)))parts.pop();return '/'+(parts.length?parts.join('/')+'/':'');}
export function href(page){const slug=pages[page]?.slug??'';return projectBase()+(slug?slug+'/':'');}
export function pageFromPath(){const parts=pathParts(),last=parts.at(-1)||'';for(const [id,p] of Object.entries(pages))if(p.slug===last)return id;return 'home';}
export function pageForStage(stage){return stageDefaults.get(Number(stage))||'scenario'}
export function stageForPage(page){return pages[page]?.stage??0}
export function isPublicPage(page){return publicPages.has(page)}
export function isResearcherPage(page){return pages[page]?.mode==='researcher'}
export function pageTitle(page){return pages[page]?.title||'No Boss'}
