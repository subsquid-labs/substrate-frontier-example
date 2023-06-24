import {lookupArchive} from '@subsquid/archive-registry'
import {
    BatchContext,
    BatchProcessorCallItem,
    BatchProcessorEventItem,
    BatchProcessorItem,
    SubstrateBatchProcessor,
} from '@subsquid/substrate-processor'
import * as erc721 from './abi/ERC721'

export const CONTRACT_ADDRESS = '0xb654611f84a8dc429ba3cb4fda9fad236c505a1a'

export const processor = new SubstrateBatchProcessor()
    .setDataSource({
        archive: lookupArchive('moonriver', {release: 'FireSquid'}),
        chain: 'wss://wss.api.moonriver.moonbeam.network',
    })
    .setTypesBundle('moonbeam')
    .addEvmLog(CONTRACT_ADDRESS, {
        filter: [[erc721.events.Transfer.topic]],
        data: {
            event: {
                args: true,
                call: true,
            },
        },
    })

export type Item = BatchProcessorItem<typeof processor>
export type EventItem = BatchProcessorEventItem<typeof processor>
export type CallItem = BatchProcessorCallItem<typeof processor>
export type ProcessorContext<Store> = BatchContext<Store, Item>
