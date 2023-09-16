import React, {useRef, useState} from 'react';
import './App.css';
import {Block, Transaction} from "./model/block";

function App() {
  const [blocks,setBlocks]=useState([new Block("0")]);
  const showChangeRef=useRef<HTMLInputElement>(null);
  const fromRef=useRef<HTMLInputElement>(null);
  const toRef=useRef<HTMLInputElement>(null);
  const amountRef=useRef<HTMLInputElement>(null);
  const feesRef=useRef<HTMLInputElement>(null);
  const [signature,setSignature]=useState("")
  const [publicKey,setPublicKey]=useState("")
  const AddBlock=()=>{
      let tmpBlock=[...blocks];
      if (tmpBlock[tmpBlock.length-1].status===false){
          alert(`最後一塊 區塊尚未挖掘(計算) 請按"挖礦"解決未挖礦之區塊!`);
          return ;
      }
      let previousHash=tmpBlock[tmpBlock.length-1].block_hash;
      tmpBlock.push(new Block(previousHash));
      setBlocks(tmpBlock);
      setSliderValue(1);
  }
  const MineBlock=(index:number)=>{
      try{
          let tmpBlocks=[...blocks];
          if (tmpBlocks[index].checkDifficulty()===false){
              tmpBlocks[index].block_top.nonce++;
              tmpBlocks[index].setBlockHash();
              setBlocks(tmpBlocks);
              if (showChangeRef.current!.checked){
                  setTimeout(()=>{MineBlock(index)},250);
              }
              else{
                  MineBlock(index);
              }

          }
          else{
              setBlocks(tmpBlocks);
          }
      }
      catch (e){
          alert(`棧以溢出 導致出現錯誤 請繼續嘗試!`);
      }

  }
  const [sliderValue, setSliderValue] = useState(1);
  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let difficulty=Number(event.target.value);
    let tmpBlocks=[...blocks];
    setSliderValue(difficulty);
    tmpBlocks[tmpBlocks.length-1].block_top.difficulty=difficulty;
    tmpBlocks[tmpBlocks.length-1].status=false;
    setBlocks(tmpBlocks);
};


  function validateContent():boolean{
      if(fromRef.current!.value.length===0){
          alert("交易發起地址不得為空!");
          return false;
      }
      if(toRef.current!.value.length===0){
          alert("交易接收地址不得為空!");
          return false;
      }
      if(fromRef.current!.value===toRef.current!.value){
          alert("交易發起與接收地址不得為相同!");
          return false;
      }
      if(amountRef.current!.value.length===0){
          alert("交易金額不得為空!");
          return false;
      }
      if(feesRef.current!.value.length===0){
          alert("交易發起地址不得為空!");
          return false;
      }
      return true;
  }
  function newTransaction():Transaction{
      let tmpTransaction=new Transaction();
      tmpTransaction.from=fromRef.current!.value;
      tmpTransaction.to=toRef.current!.value;
      tmpTransaction.amount=Number(amountRef.current!.value);
      tmpTransaction.fees=Number(feesRef.current!.value);
      return tmpTransaction
  }
  const SignTransaction=()=>{
      if (validateContent()){
          const transaction=newTransaction()
          const {signature, public_key}=transaction.signature()
          setPublicKey(public_key);
          setSignature(signature!);
      }
  }
  const AddTransaction=()=>{
        if (validateContent()){
            const transaction=newTransaction()
            if(transaction.verify(signature,publicKey)){
                let tmpBlocks=[...blocks];
                tmpBlocks[tmpBlocks.length-1].addTransaction(transaction);
                fromRef.current!.value="";
                toRef.current!.value=""
                amountRef.current!.value="";
                feesRef.current!.value="";
                setSignature("");
                setPublicKey("");
                setBlocks(tmpBlocks);

            }
            else{
                alert("此交易不合法 簽名驗證未通過!");
                return
            }
        }

    }
  return (
    <main className="App">
        <div className={"BlockChains"}>
            {blocks.map((item,index)=>{
                return (
                    <div className={"Block"} key={index} style={{"backgroundColor":item.status?"rgba(56,255,0,0.3)":"rgba(255,30,30,0.3)"}}>
                        <h2>{index===0?"創世區塊":"新區塊"}</h2>
                        <div className={"BlockTop"}>
                            <h3>區塊標頭</h3>
                            <tr className={"BlockTr"}>
                                <td className={"BlockTdIndex"}>版本號: </td>
                                <td className={"BlockTd"}>{item.block_top.version}</td>
                            </tr>
                            <tr className={"BlockTr"}>
                                <td className={"BlockTdIndex"}>前一區塊哈希值: </td>
                                <td className={"BlockTd"}>{item.block_top.previous_hash}</td>
                            </tr>
                            <tr className={"BlockTr"}>
                                <td className={"BlockTdIndex"}>時間戳記: </td>
                                <td className={"BlockTd"}>{item.block_top.time_stamp}</td>
                            </tr>
                            <tr className={"BlockTr"}>
                                <td className={"BlockTdIndex"}>困難度: </td>
                                <td className={"BlockTd"}>{item.block_top.difficulty}</td>
                            </tr>
                            <tr className={"BlockTr"}>
                                <td className={"BlockTdIndex"}>隨機數: </td>
                                <td className={"BlockTd"}>{item.block_top.nonce.toString()}</td>
                            </tr>
                            <tr className={"BlockTr"}>
                                <td className={"BlockTdIndex"}>Markle root: </td>
                                <td className={"BlockTd"}>{item.block_top.markle_root}</td>
                            </tr>

                        </div>
                        <div className={"Transaction"}>
                            <h3>交易紀錄</h3>
                            {item.transaction.map((transactionItem,transactionIndex)=>{
                                return (
                                    <div className={"TransactionItem"}>
                                        <tr className={"TransactionTr"}>
                                            <td className={"BlockTdIndex"}>From: </td>
                                            <td className={"BlockTd"}>{transactionItem.from}</td>
                                        </tr>
                                        <tr className={"TransactionTr"}>
                                            <td className={"BlockTdIndex"}>To: </td>
                                            <td className={"BlockTd"}>{transactionItem.to}</td>
                                        </tr>
                                        <tr className={"TransactionTr"}>
                                            <td className={"BlockTdIndex"}>Amount: </td>
                                            <td className={"BlockTd"}>{transactionItem.amount}</td>
                                        </tr>
                                        <tr className={"TransactionTr"}>
                                            <td className={"BlockTdIndex"}>Fees: </td>
                                            <td className={"BlockTd"}>{transactionItem.fees}</td>
                                        </tr>
                                    </div>
                                );
                            })}
                        </div>
                        <div className={"BlockId"}>
                            <tr className={"BlockTr"}>
                                <td className={"BlockTdIndex"}>區塊哈希值: </td>
                                <td className={"BlockTd"}>{item.block_hash}</td>
                            </tr>
                        </div>
                        <button className={"MineBlockBtn"} onClick={()=>{MineBlock(index);}}>
                            挖礦
                        </button>
                    </div>
                );
            })}
            <button className={"AddBlockBtn"} onClick={AddBlock}>新增新區塊</button>
        </div>
        <div className={"ControlPart"}>
            <h2 className={"ControlTitle"}>區塊鏈模擬計算</h2>
            <div className={"ControlTips"}>
                <h3>使用教學</h3>
                <ol type="1">
                    <li>透過下面設定更改最新區塊的設定</li>
                    <li>可透過下方按鈕增加交易</li>
                    <li>使用區塊下方挖礦按鈕 計算哈希</li>
                    <li>當區塊由紅色轉為綠色及代表計算完成</li>
                    <li>計算完成後才可使用新增區塊</li>
                </ol>
            </div>
            <div className={"ControlTips"}>
                <h3>使用提示</h3>
                <ul>
                    <li>"前一區塊哈希值" 就等於 前一區塊的 "區塊哈希值"</li>
                    <li>一旦交易數據變化 Markle root 就會產生變化</li>
                    <li>區塊哈希值 由該區塊的區塊標頭計算</li>
                    <li>挖礦即是尋找 隨機數 進而改變 區塊哈希值</li>
                    <li>完成區塊 區塊哈希值 前方0個數大於等於 區塊難度</li>
                    <li>此處哈希算法僅使用 SHA256 未來可能新增其他算法</li>
                </ul>
            </div>
            <div className={"ControlTips"} style={{display:"flex",flexDirection:"row"}}>
                <h3>持續顯示挖礦過程</h3>
                <input type={"checkbox"} style={{marginLeft:"10%"}} ref={showChangeRef}/>
            </div>
            <div className={"ControlTips"}>
                <h3>更改最新區塊難度</h3>
                <div className={"DifficultyPart"}>
                    <input className={"DifficultySlideBar"} type="range" name="slider" min="0" max="5" step="1" value={sliderValue} onChange={handleSliderChange}></input>
                    <h4 className={"DifficultyText"}> 區塊難度: {sliderValue}</h4>
                </div>
            </div>
            <div className={"ControlTips"}>
                <h3>新增交易</h3>
                <div className={"TransactionPart"}>
                    <input className={"TransactionText"} placeholder={"From(交易發起地址)"} ref={fromRef}/>
                    <input className={"TransactionText"} placeholder={"To(交易接收地址)"} ref={toRef}/>
                    <input className={"TransactionText"} placeholder={"Amount(交易金額)"} ref={amountRef} type={"number"}/>
                    <input className={"TransactionText"} placeholder={"Fees(交易手續費)"} ref={feesRef} type={"number"}/>
                    <input className={"TransactionText"} placeholder={"Signature(交易簽名)"} value={signature}/>
                    <input className={"TransactionText"} placeholder={"PublicKey(交易發起者公鑰)"} value={publicKey}/>
                </div>
                <input className={"AddTransactionBtn"} type={"submit"} onClick={SignTransaction} value={"簽署"}/>
                <input className={"AddTransactionBtn"} type={"submit"} onClick={AddTransaction}/>
            </div>
        </div>
    </main>
  );
}

export default App;
