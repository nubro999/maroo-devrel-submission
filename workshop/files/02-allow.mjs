import {wallet,pcl,coder,Contract,Interface,send} from '../terminal/context.mjs';
import {run, payment, policyFor} from './session.mjs';

// 지급 허용 정책
await run(1, async state => {
const {proxy,abi}=state;
const api=new Interface(abi);
/* COPY_FROM_CHEATSHEET
await send('allow',await pcl.changeContractPolicies.populateTransaction(policyFor(proxy,api,[])));
END_COPY */
const configured = await pcl.contractPolicies(proxy);
const addresses = coder.decode(['tuple(address[] addresses)'], configured[2][0][1])[0].addresses;
console.log('차단 목록:', Array.from(addresses));
return {};
});
