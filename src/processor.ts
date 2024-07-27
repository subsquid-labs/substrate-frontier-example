import {
    BlockHeader,
    DataHandlerContext,
    SubstrateBatchProcessor,
    SubstrateBatchProcessorFields,
    Event as _Event,
    Call as _Call,
    Extrinsic as _Extrinsic
} from '@subsquid/substrate-processor'
import * as erc721 from './abi/ERC721'

export const CONTRACT_ADDRESS = '0xb654611f84a8dc429ba3cb4fda9fad236c505a1a'

export const processor = new SubstrateBatchProcessor()
    .setGateway('https://v2.archive.subsquid.io/network/moonriver-substrate')
    .setRpcEndpoint({
        url: 'wss://wss.api.moonriver.moonbeam.network',
        rateLimit: 10,
    })
    .addEvmLog({
        address: [CONTRACT_ADDRESS],
        topic0: [erc721.events.Transfer.topic],
        call: true,
    })
    .setFields({
        block: {
            timestamp: true,
        }
    })
   .setBlockRange({ from: 846577 })

export type Fields = SubstrateBatchProcessorFields<typeof processor>
export type Block = BlockHeader<Fields>
export type Event = _Event<Fields>
export type Call = _Call<Fields>
export type Extrinsic = _Extrinsic<Fields>
export type ProcessorContext<Store> = DataHandlerContext<Store, Fields>
