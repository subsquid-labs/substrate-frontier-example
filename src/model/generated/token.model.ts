import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, ManyToOne as ManyToOne_, Index as Index_, OneToMany as OneToMany_} from "typeorm"
import * as marshal from "./marshal"
import {Account} from "./account.model"
import {Transfer} from "./transfer.model"

@Entity_()
export class Token {
    constructor(props?: Partial<Token>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
    index!: bigint

    @Index_()
    @ManyToOne_(() => Account, {nullable: true})
    owner!: Account

    @Column_("text", {nullable: false})
    uri!: string

    @OneToMany_(() => Transfer, e => e.token)
    transfers!: Transfer[]
}
