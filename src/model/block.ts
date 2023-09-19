import {GenerateRSAKeyPair, Hash_SHA256, Signature, VerifySignature} from "../utils/encrypt";

export class Block {
    status:boolean;
    block_top: BlockTop;
    transaction:Transaction[];
    block_hash:string;
    constructor(hash:string) {
        this.status=false;
        this.block_top=new BlockTop(hash);
        this.transaction=[];
        this.block_top.setMarkleRoot(this.transaction);
        this.block_hash=""
        this.setBlockHash();
    }
    checkDifficulty(){
        for (let i=0;i<this.block_top.difficulty;i++){
            if(this.block_hash[i]!=="0"){
                this.status=false;
                return false;
            }
        }
        this.status=true;
        return true;
    }
    setBlockHash(){
        this.block_hash=Hash_SHA256(Hash_SHA256(this.block_top.toString()));
    }
    addTransaction(transaction:Transaction):boolean{
        for (let i=0;i<this.transaction.length;i++){
            if(this.transaction[i].id===transaction.id){
                return false;
            }
        }
        this.transaction.push(transaction);
        this.block_top.setMarkleRoot(this.transaction);
        this.setBlockHash();
        this.status=false;
        return true;
    }
}
export class BlockTop{
    version:string;
    previous_hash:string;
    time_stamp:string;
    difficulty:number;
    nonce:bigint;
    markle_root:string;
    constructor(hash:string) {
        this.version="v1";
        this.previous_hash=hash;
        let time=new Date();
        this.time_stamp=time.toLocaleString();
        this.difficulty=1;
        this.nonce= BigInt(0);
        this.markle_root="";
    }
    toString(){
        return this.version.toString()+this.previous_hash.toString()+this.time_stamp+this.difficulty+this.nonce+this.markle_root;
    }
    setMarkleRoot(transactions:Transaction[]){
        if (transactions.length===0){
            this.markle_root=Hash_SHA256("");
            return
        }
        let tmpRoots:string[]=[];
        for (let i=0;i<transactions.length;i++){
            tmpRoots.push(Hash_SHA256(transactions[i].toString()));
        }
        while (tmpRoots.length>1){
            for (let i=0; i<tmpRoots.length; i++){
                if (i%2===0){
                    if(i+1<tmpRoots.length){
                        tmpRoots[i/2]=Hash_SHA256(tmpRoots[i]+tmpRoots[i+1]);
                    }
                    else{
                        tmpRoots[i/2]=Hash_SHA256(tmpRoots[i]);
                    }
                }
            }
            if (tmpRoots.length%2===0){
                tmpRoots=tmpRoots.slice(0,tmpRoots.length/2)
            }
            else{
                tmpRoots=tmpRoots.slice(0,tmpRoots.length/2+1)
            }
        }
        this.markle_root=tmpRoots[0];
    }
}
export class Transaction{
    id:string;
    from: string;
    to:string;
    amount:number;
    fees:number;
    constructor(from:string,to:string,amount:number,fees:number) {
        this.from=from;
        this.to=to;
        this.amount=amount;
        this.fees=fees;
        this.id=Hash_SHA256(this.toString());
    }
    toString(){
        return this.to+this.from+this.amount+this.amount;
    }
    signature(){
        const { public_key, private_key } = GenerateRSAKeyPair();
        let signature=Signature(this.toString(),private_key)
        return {signature,public_key}
    }
    verify(signature:string,publicKey:string){
        return VerifySignature(this.toString(),signature,publicKey);
    }
}