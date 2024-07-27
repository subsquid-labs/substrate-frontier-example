import {In} from 'typeorm'
import {getEvmLog, getTransaction} from '@subsquid/frontier'
import {Store, TypeormDatabase} from '@subsquid/typeorm-store'
import * as erc721 from './abi/ERC721'
import {Account, Token, Transfer} from './model'
import {CONTRACT_ADDRESS, ProcessorContext, processor} from './processor'

processor.run(new TypeormDatabase(), async (ctx) => {
    for (const block of ctx.blocks) {
        for (const event of block.events) {
            if (event.name === 'EVM.Log') {
                let call = event.getCall()
                    console.error(call.args.transaction.signature.v)
                try {
                    let transaction = getTransaction(call)
                } catch (e) {
                    console.error(`Call ${call.id} at block ${block.header.height} failed to decode into a EVM transaction. Full call:`)
                    console.error(call)
                    console.error(`Tx signature (note: v was 2605 or 2606 for all preceding and a few subsequent calls):`)
                    console.error(call.args.transaction.signature)
                    throw e
                }
            }
        }
    }
})
