import {wallet,recipient,pcl,Contract,Interface,parseEther,send,decode} from '../terminal/context.mjs';
import {run, payment, policyFor} from './session.mjs';

// 지급 정지와 차단 확인
await run(3, async state => {
const {proxy,abi}=state;
const api=new Interface(abi);
const app=new Contract(proxy,abi,wallet);
await send('deny',await pcl.changeContractPolicies.populateTransaction(policyFor(proxy,api,[wallet.address])));
try { await app.pay.staticCall(recipient,{value:parseEther('0.001')}); } catch(e) { console.log(decode(e)); }
await payment(app,'denied-payment',0);
await send('restore-allow',await pcl.changeContractPolicies.populateTransaction(policyFor(proxy,api,[])));
return {};
});
