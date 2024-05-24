import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class TimeSchema {
    @PrimaryGeneratedColumn()
    @ApiProperty()
    id: number;

    @Column()
    @ApiProperty()
    start: string

    @Column()
    @ApiProperty()
    end: string

    @Column({default: "white"})
    @ApiProperty()
    color: string

    // @Column({type: 'bigint', transformer: new ColumnNumericTransformer()})
    // date: number
}