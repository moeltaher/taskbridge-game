export const authorityModel={
 data:{
  price:{leaders:['platform'],distribution:{worker:8,platform:57,client:30,mediator:5}},
  allocation:{leaders:['platform'],distribution:{worker:8,platform:72,client:15,mediator:5}},
  monitoring:{leaders:['platform'],distribution:{worker:8,platform:80,client:10,mediator:2}},
  quality:{leaders:['client'],distribution:{worker:5,platform:38,client:55,mediator:2}},
  risk:{leaders:['worker'],distribution:{worker:75,platform:12,client:8,mediator:5}},
  termination:{leaders:['platform'],distribution:{worker:5,platform:82,client:11,mediator:2}}
 },
 moderation:{
  price:{leaders:['platform'],distribution:{worker:8,platform:48,client:39,mediator:5}},
  allocation:{leaders:['platform','client'],distribution:{worker:5,platform:55,client:38,mediator:2}},
  monitoring:{leaders:['platform'],distribution:{worker:4,platform:84,client:10,mediator:2}},
  quality:{leaders:['client'],distribution:{worker:5,platform:34,client:59,mediator:2}},
  risk:{leaders:['worker'],distribution:{worker:58,platform:27,client:12,mediator:3}},
  termination:{leaders:['platform'],distribution:{worker:4,platform:70,client:24,mediator:2}}
 },
 ai:{
  price:{leaders:['platform'],distribution:{worker:8,platform:52,client:35,mediator:5}},
  allocation:{leaders:['platform','client'],distribution:{worker:8,platform:50,client:39,mediator:3}},
  monitoring:{leaders:['platform'],distribution:{worker:12,platform:64,client:21,mediator:3}},
  quality:{leaders:['client'],distribution:{worker:5,platform:28,client:65,mediator:2}},
  risk:{leaders:['worker'],distribution:{worker:65,platform:16,client:15,mediator:4}},
  termination:{leaders:['platform'],distribution:{worker:5,platform:74,client:19,mediator:2}}
 },
 translation:{
  price:{leaders:['client'],distribution:{worker:18,platform:15,client:62,mediator:5}},
  allocation:{leaders:['client','platform'],distribution:{worker:18,platform:34,client:45,mediator:3}},
  monitoring:{leaders:['platform'],distribution:{worker:28,platform:43,client:26,mediator:3}},
  quality:{leaders:['client'],distribution:{worker:8,platform:18,client:72,mediator:2}},
  risk:{leaders:['worker'],distribution:{worker:70,platform:10,client:16,mediator:4}},
  termination:{leaders:['platform'],distribution:{worker:10,platform:54,client:34,mediator:2}}
 }
};

export function authorityLeaders(type,axis){return authorityModel[type]?.[axis]?.leaders||[]}
export function authorityDistribution(type,axis){return authorityModel[type]?.[axis]?.distribution||{worker:25,platform:25,client:25,mediator:25}}
