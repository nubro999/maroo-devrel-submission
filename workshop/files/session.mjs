import {formatEther} from 'ethers';
import {existsSync,readFileSync,writeFileSync,mkdirSync,unlinkSync} from 'node:fs';
import {wallet,recipient,provider,pcl,coder,parseEther,send} from '../terminal/context.mjs';
const dir='.private/file-lab', file=dir+'/state.json', lock=dir+'/in-progress.json';
export async function run(index, action) {
  mkdirSync(dir,{recursive:true});
  try {
    const state=existsSync(file)?JSON.parse(readFileSync(file,'utf8')):{next:0,payer:wallet.address,recipient};
    if(state.payer!==wallet.address || state.recipient!==recipient) throw Error('계정이 이전 단계와 다릅니다. 기존 .env를 사용하세요.');
    if(state.next!==index) throw Error(`실행 순서가 다릅니다. 다음 파일 번호: ${state.next+1}`);
    if(existsSync(lock)) throw Error('이전 실행이 완료되지 않았습니다. transactions.jsonl의 해시와 현재 상태를 확인한 후 복구하세요. 자동 재전송하지 않습니다.');
    // Stop before deploying, sending a transaction, or advancing the step.
    const sources=[process.argv[1], ...(index===0 ? [new URL('./Payment.sol',import.meta.url)] : [])];
    for(const source of sources) {
      if(readFileSync(source,'utf8').includes('/* COPY_FROM_CHEATSHEET')) {
        throw Error(`${source instanceof URL ? source.pathname : source}: COPY_FROM_CHEATSHEET부터 END_COPY */까지를 예시 코드로 교체하고 저장하세요. 거래는 전송되지 않았습니다.`);
      }
    }
    writeFileSync(lock,JSON.stringify({index,payer:wallet.address}),{flag:'wx'});
    const result=await action(state);
    writeFileSync(file,JSON.stringify({...state,...result,next:index+1},null,2));
    unlinkSync(lock);
    console.log('단계 완료:',index+1);
  } finally {provider.destroy();}
}
export const policyFor=(proxy,api,addresses)=>({_contract:proxy,admin:wallet.address,policies:[{templateId:'DENYLIST_POLICY',policy:coder.encode(['tuple(address[] addresses)'],[{addresses}]),selector:api.getFunction('pay').selector}]});
export async function payment(app,label,expectedStatus){
  const before=await provider.getBalance(recipient),count=await app.paymentCount();
  const receipt=await send(label,await app.pay.populateTransaction(recipient,{value:parseEther('0.001')}),expectedStatus===0?500000n:undefined);
  const delta=await provider.getBalance(recipient)-before, countDelta=await app.paymentCount()-count;
  console.log({status:receipt.status,recipientDelta:`${formatEther(delta).replace(/\.0$/, '')} tOKRW`,countDelta:String(countDelta)});
  if(receipt.status!==expectedStatus||delta!==(expectedStatus===1?parseEther('0.001'):0n)||countDelta!==BigInt(expectedStatus))throw Error('Unexpected payment result');
}
