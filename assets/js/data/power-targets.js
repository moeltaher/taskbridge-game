import {authorityModel} from './authority-model.js';

export const powerTargets=Object.fromEntries(Object.entries(authorityModel).map(([type,axes])=>[
 type,
 Object.fromEntries(Object.entries(axes).map(([axis,config])=>[axis,{...config.distribution}]))
]));
