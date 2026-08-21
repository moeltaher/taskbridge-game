import assert from 'node:assert/strict';
import {buildPaymentSettlement,PAYMENT_PROCESSOR_RATE,PAYMENT_PROCESSOR_CAP} from '../assets/js/domain/payment.js';
import {ACCESS_MODEL_VERSION,assessAccessDecision} from '../assets/js/domain/access.js';

const close=(actual,expected,epsilon=1e-12)=>assert.ok(Math.abs(actual-expected)<epsilon,`${actual} != ${expected}`);

assert.equal(PAYMENT_PROCESSOR_RATE,.03);
assert.equal(PAYMENT_PROCESSOR_CAP,.22);
const payment=buildPaymentSettlement(
 {costs:{internet:.55,electricity:.18,device:.42,transfer:.25}},
 {clientPaid:5.8,grossWorker:2.1,hold:.21}
);
close(payment.clientPaid,5.8);
close(payment.contracted,2.1);
close(payment.platformService,3.7);
close(payment.mediator,.063);
close(payment.cashPayout,1.577);
close(payment.operating,1.15);
close(payment.net,.427);

assert.equal(ACCESS_MODEL_VERSION,3);
const baseScenario={outcomeStrictness:1};
const warning=assessAccessDecision(baseScenario,{scenarioKey:'data',disputeSeverity:0,qualityBeforeDispute:90,accessBeforeDispute:70,rejections:0});
assert.equal(warning.points,0);
assert.equal(warning.outcome,'warning');
const project=assessAccessDecision(baseScenario,{scenarioKey:'data',disputeSeverity:1,qualityBeforeDispute:75,accessBeforeDispute:70,rejections:1});
assert.equal(project.points,3);
assert.equal(project.outcome,'project');
const suspended=assessAccessDecision(baseScenario,{scenarioKey:'data',disputeSeverity:2,qualityBeforeDispute:65,accessBeforeDispute:70,rejections:3});
assert.equal(suspended.points,6);
assert.equal(suspended.outcome,'suspended');

console.log('No Boss domain checks passed');
