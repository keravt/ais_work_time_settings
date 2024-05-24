import { ApiProperty } from "@nestjs/swagger";

export class createDayTypeDto {
    @ApiProperty()
    name: string;
    @ApiProperty()
    color: string;
}