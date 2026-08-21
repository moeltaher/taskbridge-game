export const PAYMENT_PROCESSOR_RATE=.03;
export const PAYMENT_PROCESSOR_CAP=.22;

export function buildPaymentSettlement(sc,state){
 const costs=sc.costs;
 const clientPaid=Number(state.clientPaid||0);
 const contracted=Number(state.grossWorker||0);
 const hold=Number(state.hold||0);
 const platformService=clientPaid-contracted;
 const mediator=Math.min(PAYMENT_PROCESSOR_CAP,contracted*PAYMENT_PROCESSOR_RATE);
 const transfer=Number(costs.transfer||0);
 const operating=Number(costs.internet||0)+Number(costs.electricity||0)+Number(costs.device||0);
 const cashPayout=Math.max(0,contracted-hold-mediator-transfer);
 const net=cashPayout-operating;
 return {clientPaid,contracted,platformService,mediator,transfer,hold,operating,cashPayout,net};
}
