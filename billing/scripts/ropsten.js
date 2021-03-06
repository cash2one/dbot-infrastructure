async function ropsten(){
    const fs = require('fs')
    const Web3 = require('web3')
    const contract = require("truffle-contract");
    const TruffleConfig = require('../truffle');
    const bill_artifacts = require('../build/contracts/DbotBilling.json');
    const att_artifacts = require('../build/contracts/ATT.json');
    const register_artifacts = require('../build/contracts/Register.json');
    const biz_artifacts = require('../build/contracts/AIBusinessController.json');
    const xiaoi_artifacts = require('../build/contracts/Consumer.json');
    const bc = require('./blockchain.json');
    const network = 'test';
    const config = bc[network];
    let endpoint = config.endpoint;
    console.log(endpoint)
    let provider = new Web3.providers.HttpProvider(endpoint);
    let web3 =  new Web3(provider);
    console.log(web3.eth.accounts)
    console.log(web3.isConnected())
    // web3.personal.unlockAccount(config.account.address, config.account.password);
    let Bill = contract(bill_artifacts);
    let ATT = contract(att_artifacts);
    let Register = contract(register_artifacts);
    let Biz = contract(biz_artifacts);
    let Xiaoi = contract(xiaoi_artifacts);
    Bill.setProvider(provider);
    ATT.setProvider(provider);
    Register.setProvider(provider);
    Biz.setProvider(provider);
    Xiaoi.setProvider(provider);

    let bill = await Bill.at(config.contracts.bill);
    let att = await ATT.at(config.contracts.att);
    let register = await Register.at(config.contracts.register);
    let biz = await Biz.at(config.contracts.biz);
    let xiaoi = await Xiaoi.at(config.contracts.consumer);

    const owner = config.account.address;
    let accounts = web3.eth.accounts;
    const beneficiary = '0xE83c90a780507B84cF08065DDA3Cc1976b172c25';
    // const beneficiary = accounts[1];
    const gas = config.gas;
    const aiName = 'xiaoi';

    console.log(bill)

    bill.allEvents('', function(error, log){console.log(log);});
    att.allEvents('', function(error, log){console.log(log);});
    register.allEvents('', function(error, log){console.log(log);});
    biz.allEvents('', function(error, log){console.log(log);});
    xiaoi.allEvents('', function(error, log){console.log(log);});
    web3.eth.filter('', function(error, log){console.log(log);})

    await bill.changeController(biz.address, {from:owner,gas:gas});    
    await register.register(aiName, bill.address,{from:owner,gas:gas});
    await att.generateTokens(owner,1000000,{from:owner,gas:gas});
    var a = await att.balanceOf(owner,{from:owner,gas:gas});
    console.log(a);
    await att.approve(bill.address, 100000,{from:owner,gas:gasLimit});
    var b = await att.allowance(owner, bill.address, {from:owner,gas:gasLimit});
    console.log(b);
    // let arg = {method: 'animalDetect', url: 'http://t2.27270.com/uploads/tu/201612/357/7.png'};
    let arg = {
        question:"你好!"
    }
    await xiaoi.callAI(aiName, JSON.stringify(arg), {from:owner,gas:gasLimit});
    let callID = await biz.callAIID();
    console.log(callID);
    biz.EventFundsFrozen('', async function(error, result){
        console.log(result)
        if(!error){
            let args = JSON.parse(result.args.arg);
            console.log(args)
            const d = require('../../worker/xiaoi')    
            var res = await d(args);
            const dataResult = JSON.stringify(res);
            console.log("dataResult: ", dataResult);
            await biz.callFundsDeduct(aiName, --callID, true, dataResult.toString(), {from: owner,gas: gasLimit});
            let ba = await att.balanceOf(owner,{from:owner,gas:gasLimit});
            let be = await att.balanceOf(beneficiary,{from:owner,gas:gasLimit});
            console.log(ba);
            console.log(be);
        }
    })
}

ropsten();