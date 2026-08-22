import {parties as PARTIES} from './parties.js';

export const authorityModel={
 data:{
  price:{distribution:{worker:8,platform:60,client:32}},
  allocation:{distribution:{worker:8,platform:76,client:16}},
  monitoring:{distribution:{worker:8,platform:82,client:10}},
  quality:{distribution:{worker:5,platform:39,client:56}},
  risk:{distribution:{worker:79,platform:13,client:8}},
  termination:{distribution:{worker:5,platform:84,client:11}}
 },
 moderation:{
  price:{distribution:{worker:8,platform:51,client:41}},
  allocation:{distribution:{worker:5,platform:56,client:39}},
  monitoring:{distribution:{worker:4,platform:86,client:10}},
  quality:{distribution:{worker:5,platform:35,client:60}},
  risk:{distribution:{worker:60,platform:28,client:12}},
  termination:{distribution:{worker:4,platform:71,client:25}}
 },
 ai:{
  price:{distribution:{worker:8,platform:55,client:37}},
  allocation:{distribution:{worker:8,platform:52,client:40}},
  monitoring:{distribution:{worker:12,platform:66,client:22}},
  quality:{distribution:{worker:5,platform:29,client:66}},
  risk:{distribution:{worker:68,platform:17,client:15}},
  termination:{distribution:{worker:5,platform:76,client:19}}
 },
 translation:{
  price:{distribution:{worker:19,platform:16,client:65}},
  allocation:{distribution:{worker:19,platform:35,client:46}},
  monitoring:{distribution:{worker:29,platform:44,client:27}},
  quality:{distribution:{worker:8,platform:18,client:74}},
  risk:{distribution:{worker:73,platform:10,client:17}},
  termination:{distribution:{worker:10,platform:55,client:35}}
 }
};

export function authorityDistribution(type,axis){return authorityModel[type]?.[axis]?.distribution||{worker:34,platform:33,client:33}}
export function authorityLeaders(type,axis){const distribution=authorityDistribution(type,axis),max=Math.max(...PARTIES.map(p=>Number(distribution[p]||0)));return PARTIES.filter(p=>Number(distribution[p]||0)===max)}
export function significantAuthorities(type,axis,{within=15}={}){const distribution=authorityDistribution(type,axis),max=Math.max(...PARTIES.map(p=>Number(distribution[p]||0)));return PARTIES.filter(p=>max-Number(distribution[p]||0)<=within)}
