export const pages={
 home:{slug:'',stage:0,progress:0,title:'قبل الوردية',public:true,mode:'worker',chapter:'worker'},
 scenario:{slug:'scenario',stage:0,progress:5,title:'اختيار الحالة',public:true,mode:'worker',chapter:'worker',stageDefault:true},
 onboarding:{slug:'onboarding',stage:1,progress:15,title:'العقد',mode:'worker',chapter:'worker'},
 work:{slug:'work',stage:2,progress:35,title:'تنفيذ العمل',mode:'worker',chapter:'worker'},
 management:{slug:'management',stage:3,progress:55,title:'الإدارة الخوارزمية',mode:'worker',chapter:'worker'},
 risk:{slug:'risk',stage:4,progress:68,title:'المخاطر',mode:'worker',chapter:'worker'},
 dispute:{slug:'dispute',stage:5,progress:80,title:'مراجعة الجودة',mode:'worker',chapter:'worker'},
 payment:{slug:'payment',stage:6,progress:90,title:'توزيع القيمة',mode:'worker',chapter:'worker'},
 access:{slug:'access',stage:7,progress:100,title:'نهاية الوردية',mode:'worker',chapter:'worker'},
 investigation:{slug:'investigation',stage:8,progress:20,title:'ملف القضية',mode:'researcher',chapter:'researcher'},
 power:{slug:'power',stage:9,progress:55,title:'خريطة السلطة',mode:'researcher',chapter:'researcher'},
 conclusion:{slug:'conclusion',stage:10,progress:80,title:'الاستنتاج',mode:'researcher',chapter:'researcher'},
 result:{slug:'result',stage:11,progress:100,title:'النتيجة',mode:'researcher',chapter:'researcher',stageDefault:true},
 rights:{slug:'rights',stage:11,progress:100,title:'خريطة الحقوق',mode:'researcher',chapter:'researcher'}
};
export const progress=Object.fromEntries(Object.entries(pages).map(([id,page])=>[id,[page.progress,page.title,page.chapter]]));
const pageBySlug=new Map(Object.entries(pages).map(([id,page])=>[page.slug,id]));
const routeSlugs=new Set([...pageBySlug.keys()].filter(Boolean));
const publicPages=new Set(Object.entries(pages).filter(([,page])=>page.public).map(([id])=>id));
const stageDefaults=new Map();for(const [id,page] of Object.entries(pages)){if(page.stageDefault||!stageDefaults.has(page.stage))stageDefaults.set(page.stage,id)}
function pathParts(){const parts=location.pathname.split('/').filter(Boolean);if(parts.at(-1)?.toLowerCase()==='index.html')parts.pop();return parts}
export function projectBase(){const parts=pathParts();if(parts.length&&routeSlugs.has(parts.at(-1)))parts.pop();return '/'+(parts.length?parts.join('/')+'/':'')}
export function href(page){const slug=pages[page]?.slug??'';return projectBase()+(slug?slug+'/':'')}
export function pageFromPath(){const last=pathParts().at(-1)||'';return pageBySlug.get(last)||'home'}
export function pageForStage(stage){return stageDefaults.get(Number(stage))||'scenario'}
export function stageForPage(page){return pages[page]?.stage??0}
export function isPublicPage(page){return publicPages.has(page)}
export function isResearcherPage(page){return pages[page]?.mode==='researcher'}
export function pageTitle(page){return pages[page]?.title||'No Boss'}
