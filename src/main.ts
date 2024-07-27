import {In} from 'typeorm'
import {getEvmLog, getTransaction} from '@subsquid/frontier'
import {Store, TypeormDatabase} from '@subsquid/typeorm-store'
import * as erc721 from './abi/ERC721'
import {Account, Token, Transfer} from './model'
import {CONTRACT_ADDRESS, ProcessorContext, processor} from './processor'

processor.run(new TypeormDatabase(), async (ctx) => {
    const transfersData: TransferData[] = []

    for (const block of ctx.blocks) {
        for (const event of block.events) {
            if (event.name === 'EVM.Log') {
                let evmLog = getEvmLog(event)
                let transaction = getTransaction(event.getCall())
                const e = erc721.events.Transfer.decode(evmLog)
                if (block.header.timestamp==null) {
                    throw new Error(`No timestamp for block ${block.header.height}`)
                }
                transfersData.push({
                    id: event.id,
                    token: e.tokenId,
                    from: e.from,
                    to: e.to,
                    timestamp: new Date(block.header.timestamp),
                    block: block.header.height,
                    transactionHash: transaction.hash,
                })
            }
        }
    }

    await saveTransfers(ctx, transfersData)
})

type TransferData = {
    id: string
    from: string
    to: string
    token: bigint
    timestamp: Date
    block: number
    transactionHash: string
}

async function saveTransfers(ctx: ProcessorContext<Store>, transfersData: TransferData[]) {
    const tokensIds: Set<string> = new Set()
    const ownersIds: Set<string> = new Set()

    for (const transferData of transfersData) {
        tokensIds.add(transferData.token.toString())
        ownersIds.add(transferData.from)
        ownersIds.add(transferData.to)
    }

    const transfers: Transfer[] = []

    const tokens = await ctx.store.findBy(Token, {id: In([...tokensIds])}).then((q) => new Map(q.map((i) => [i.id, i])))
    const owners = await ctx.store
        .findBy(Account, {id: In([...ownersIds])})
        .then((q) => new Map(q.map((i) => [i.id, i])))

    for (const t of transfersData) {
        const contract = new erc721.Contract(ctx, {height: t.block}, CONTRACT_ADDRESS)

        let from = getAccount(owners, t.from)
        let to = getAccount(owners, t.to)

        const tokenId = t.token.toString()
        let token = tokens.get(tokenId)
        if (token == null) {
            token = new Token({
                id: tokenId,
                uri: await contract.tokenURI(t.token),
            })
        }
        token.owner = to
        tokens.set(token.id, token)

        const {id, block, transactionHash, timestamp} = t

        const transfer = new Transfer({
            id,
            block,
            timestamp,
            transactionHash,
            from,
            to,
            token,
        })

        transfers.push(transfer)
    }

    await ctx.store.upsert([...owners.values()])
    await ctx.store.upsert([...tokens.values()])
    await ctx.store.upsert(transfers)
}

function getAccount(m: Map<string, Account>, id: string): Account {
    let acc = m.get(id)
    if (acc == null) {
        acc = new Account()
        acc.id = id
        m.set(id, acc)
    }
    return acc
}
