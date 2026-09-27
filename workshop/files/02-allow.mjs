import {wallet,pcl,Contract,Interface,send} from '../terminal/context.mjs';
import {run, payment, policyFor} from './session.mjs';

// 지급 허용 정책
await run(1, async state => {
const {proxy,abi}=state;
const api=new Interface(abi);
await send('allow',await pcl.changeContractPolicies.populateTransaction(policyFor(proxy,api,[])));
console.log(await pcl.contractPolicies(proxy));
return {};
});
