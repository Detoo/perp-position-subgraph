import {
  PositionChanged,
  PositionLiquidated,
  MarginChanged,
} from "../../generated/ClearingHouse/ClearingHouse"
import {
  Position,
  AmmPosition,
  PositionChangedEvent,
  PositionLiquidatedEvent,
} from "../../generated/schema"
import {
  getPosition, parsePositionId, createPosition,
  getAmmPosition, parseAmmPositionId, createAmmPosition,
  calcNewAmmOpenNotional, decimal,
} from "./helper"
import { BigInt } from "@graphprotocol/graph-ts"

/* Trader open/close/modify position
 */
export function handlePositionChanged(event: PositionChanged): void {
  // fetch Position & AmmPosition
  let position = getPosition(event.params.trader)
  let ammPosition = getAmmPosition(event.params.amm, event.params.trader)

  let newAmmMargin = event.params.margin
  let newMargin = position.margin.minus(ammPosition.margin).plus(event.params.margin)
  let newAmmOpenNotional = calcNewAmmOpenNotional(ammPosition, event)
  let newOpenNotional = position.openNotional.minus(ammPosition.openNotional).plus(newAmmOpenNotional)
  let newAmmPositionSize = event.params.positionSizeAfter

  // upsert corresponding Position
  position.margin = newMargin // snapshot
  position.openNotional = newOpenNotional
  position.leverage = newMargin.isZero()? BigInt.fromI32(0) : decimal.div(newOpenNotional, newMargin)
  position.realizedPnl = position.realizedPnl.plus(event.params.realizedPnl) // delta
  position.unrealizedPnl = event.params.unrealizedPnlAfter
  position.fundingPayment = position.fundingPayment.plus(event.params.fundingPayment)
  position.fee = position.fee.plus(event.params.fee)
  position.badDebt = position.badDebt.plus(event.params.badDebt)
  position.liquidationPenalty = position.liquidationPenalty.plus(event.params.liquidationPenalty)
  position.totalPnlAmount = position.totalPnlAmount
    .plus(event.params.realizedPnl)
    .minus(event.params.fundingPayment)
    .minus(event.params.fee)
    .minus(event.params.liquidationPenalty)
    .plus(event.params.badDebt)
  position.blockNumber = event.block.number
  position.timestamp = event.block.timestamp

  // upsert corresponding AmmPosition
  ammPosition.margin = newAmmMargin
  ammPosition.positionSize = newAmmPositionSize
  ammPosition.openNotional = newAmmOpenNotional
  ammPosition.leverage = newAmmMargin.isZero()? BigInt.fromI32(0) : decimal.div(newAmmOpenNotional, newAmmMargin)
  ammPosition.entryPrice = newAmmPositionSize.isZero()? BigInt.fromI32(0) : decimal.div(newAmmOpenNotional, newAmmPositionSize).abs()
  ammPosition.realizedPnl = ammPosition.realizedPnl.plus(event.params.realizedPnl) // delta
  ammPosition.unrealizedPnl = event.params.unrealizedPnlAfter
  ammPosition.fundingPayment = ammPosition.fundingPayment.plus(event.params.fundingPayment)
  ammPosition.fee = ammPosition.fee.plus(event.params.fee)
  ammPosition.badDebt = ammPosition.badDebt.plus(event.params.badDebt)
  ammPosition.liquidationPenalty = ammPosition.liquidationPenalty.plus(event.params.liquidationPenalty)
  ammPosition.totalPnlAmount = ammPosition.totalPnlAmount
    .plus(event.params.realizedPnl)
    .minus(event.params.fundingPayment)
    .minus(event.params.fee)
    .minus(event.params.liquidationPenalty)
    .plus(event.params.badDebt)
  ammPosition.blockNumber = event.block.number
  ammPosition.timestamp = event.block.timestamp

  //
  // insert PositionChanged event
  //
  let positionChanged = new PositionChangedEvent(event.transaction.hash.toHexString() + "-" + event.logIndex.toString())
  positionChanged.trader = event.params.trader
  positionChanged.amm = event.params.amm
  positionChanged.margin = event.params.margin
  positionChanged.positionNotional = event.params.positionNotional
  positionChanged.exchangedPositionSize = event.params.exchangedPositionSize
  positionChanged.fee = event.params.fee
  positionChanged.positionSizeAfter = event.params.positionSizeAfter
  positionChanged.realizedPnl = event.params.realizedPnl
  positionChanged.unrealizedPnlAfter = event.params.unrealizedPnlAfter
  positionChanged.badDebt = event.params.badDebt
  positionChanged.liquidationPenalty = event.params.liquidationPenalty
  positionChanged.spotPrice = event.params.spotPrice
  positionChanged.fundingPayment = event.params.fundingPayment
  positionChanged.blockNumber = event.block.number
  positionChanged.timestamp = event.block.timestamp

  // commit changes
  position.save()
  ammPosition.save()
  positionChanged.save()
}

/* Trader position liquidated
 *
 * - always comes after a corresponding PositionChanged event
 * - the PositionChanged event represents the position changes due to liquidation, and the PositionLiquidated event
 *   represents the liquidation-specific information
 */
export function handlePositionLiquidated(event: PositionLiquidated): void {
  let entity = new PositionLiquidatedEvent(event.transaction.hash.toHexString() + "-" + event.logIndex.toString())
  entity.trader = event.params.trader
  entity.amm = event.params.amm
  entity.positionNotional = event.params.positionNotional
  entity.positionSize = event.params.positionSize
  entity.liquidationFee = event.params.liquidationFee
  entity.liquidator = event.params.liquidator
  entity.badDebt = event.params.badDebt
  entity.blockNumber = event.block.number
  entity.timestamp = event.block.timestamp
  entity.save()
}

/* Trader margin changed
 *
 * adjust Position margin accordingly
 */
export function handleMarginChanged(event: MarginChanged): void {
  // fetch Position & AmmPosition
  let position = getPosition(event.params.sender)
  let ammPosition = getAmmPosition(event.params.amm, event.params.sender)

  // upsert corresponding Position
  position.margin = position.margin.plus(event.params.amount) // delta
  position.fundingPayment = position.fundingPayment.plus(event.params.fundingPayment)
  position.totalPnlAmount = position.totalPnlAmount.minus(event.params.fundingPayment)
  position.blockNumber = event.block.number
  position.timestamp = event.block.timestamp

  // upsert corresponding AmmPosition
  ammPosition.margin = ammPosition.margin.plus(event.params.amount) // delta
  ammPosition.fundingPayment = ammPosition.fundingPayment.plus(event.params.fundingPayment)
  ammPosition.totalPnlAmount = ammPosition.totalPnlAmount.minus(event.params.fundingPayment)
  ammPosition.blockNumber = event.block.number
  ammPosition.timestamp = event.block.timestamp

  // commit changes
  position.save()
  ammPosition.save()
}
