export const PAYMENT_PROCESSOR_RATE=.03;
export const PAYMENT_PROCESSOR_CAP=.22;

export function operatingCost(sc){const costs=sc.costs||{};return Number(costs.internet||0)+Number(costs.electricity||0)+Number(costs.device||0)}
export function buildPaymentSettlement(sc,state){
 const costs=sc.costs||{};
 const clientPaid=Number(state.clientPaid||0);
 const contracted=Number(state.grossWorker||0);
 const hold=Number(state.hold||0);
 const platformService=clientPaid-contracted;
 const hasPayout=contracted>0;
 const mediator=hasPayout?Math.min(PAYMENT_PROCESSOR_CAP,contracted*PAYMENT_PROCESSOR_RATE):0;
 const transfer=hasPayout?Number(costs.transfer||0):0;
 const operating=operatingCost(sc);
 const cashPayout=Math.max(0,contracted-hold-mediator-transfer);
 const availableNet=cashPayout-operating;
 const heldBalance=hold;
 const economicPosition=availableNet+heldBalance;
 return {clientPaid,contracted,platformService,mediator,transfer,hold,heldBalance,operating,cashPayout,availableNet,economicPosition,net:availableNet};
}
