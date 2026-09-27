// Read-only: no wallet or transaction submission.
import {readFileSync,writeFileSync} from 'node:fs';
import {JsonRpcProvider,FetchRequest} from 'ethers';
const request=new FetchRequest('https://rpc-testnet.maroo.io');request.timeout=20000;
const provider=new JsonRpcProvider(request,undefined,{batchMaxCount:1});
try {
 if((await provider.getNetwork()).chainId!==450815n)throw Error('Wrong chain');
 const evidence=JSON.parse(readFileSync('evidence/live-testnet/FILE_LAB_REHEARSAL.json','utf8'));
 const labels=['implementation','proxy','allow','allowed-payment','deny','denied-payment','restore-allow'];
 const results=[];
 for(const tx of evidence.transactions.filter(x=>labels.includes(x.label))){
  const r=await provider.getTransactionReceipt(tx.hash);const expected=tx.label==='denied-payment'?0:1;
  if(!r||r.status!==expected)throw Error(`Receipt mismatch: ${tx.label}`);
  results.push({label:tx.label,hash:tx.hash,status:r.status,block:r.blockNumber,explorer:`https://explorer-testnet.maroo.io/tx/${tx.hash}`});
 }
 if(results.length!==7)throw Error('Incomplete evidence');
 const result={label:'Live Testnet',checkedAt:new Date().toISOString(),chainId:450815,stateChange:false,result:'PASS',receipts:results};
 writeFileSync('evidence/live-testnet/SUBMISSION_RECEIPTS.json',JSON.stringify(result,null,2)+'\n');
 console.log('PASS: seven existing testnet receipts; no transactions sent');
}finally{provider.destroy();}
