import {wallet,Contract,Interface} from '../terminal/context.mjs';
import {run, payment, policyFor} from './session.mjs';

// 정상 지급
await run(2, async state => {
const {proxy,abi}=state;
const api=new Interface(abi);
const app=new Contract(proxy,abi,wallet);
await payment(app,'allowed-payment',1);
return {};
});
