import {wallet,recipient,provider,pcl,coder,Contract,ContractFactory,Interface,compile,send} from '../terminal/context.mjs';
import {run, payment, policyFor} from './session.mjs';

// 연결·컴파일·프록시 배포
await run(0, async state => {
console.log(String((await provider.getNetwork()).chainId), wallet.address, recipient);
var artifact = compile('workshop/files/Payment.sol');
console.log(artifact.abi.map(x => x.name).filter(Boolean));
var factory = new ContractFactory(artifact.abi, artifact.evm.bytecode.object, wallet);
var deployed = await send('implementation', await factory.getDeployTransaction());
var implementation = deployed.contractAddress;
var api = new Interface(artifact.abi);
var init = coder.encode(['address','address','bytes'], [implementation,wallet.address,api.encodeFunctionData('initialize',[wallet.address])]);
var registered = await send('proxy', await pcl.deployPclProxy.populateTransaction(1,0n,init));
var event = registered.logs.map(l => { try { return pcl.interface.parseLog(l); } catch { return null; } }).find(e => e?.name === 'PclProxyDeployed');
var proxy = event.args.proxy;
var app = new Contract(proxy,artifact.abi,wallet);
console.log(proxy, await app.owner(), await pcl.pclProxy(proxy));
return {proxy,implementation,abi:artifact.abi};
});
