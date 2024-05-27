import { EventType } from '../enums/event-type.enum';

export interface Division {

  id: number


  name: string


  headOfDivisionId: number


  index: number


  isBlocked: boolean

  
  isVertical: boolean


  isMinimize: boolean


  isVisible: boolean

  parentDivisionId:null | number

  parentDivision:Division | null

  avatarUrl: string
}
