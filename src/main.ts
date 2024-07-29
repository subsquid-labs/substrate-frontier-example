import {getEvmLog, getTransaction} from '@subsquid/frontier'
import {MockDatabase} from '@belopash/mock-store'
import {CONTRACT_ADDRESS, ProcessorContext, processor} from './processor'

processor.run(new MockDatabase(), async (ctx) => {
    for (const block of ctx.blocks) {
        for (const event of block.events) {
            if (event.name === 'EVM.Log') {
                let call = event.getCall()
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
