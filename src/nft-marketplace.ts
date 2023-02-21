import { Address, BigInt } from "@graphprotocol/graph-ts";
import {
  ItemBought as ItemBoughtEvent,
  ItemCancelled as ItemCancelledEvent,
  ItemListed as ItemListedEvent,
  OwnershipTransferred as OwnershipTransferredEvent
} from "../generated/nftMarketplace/nftMarketplace"
import { ItemListed, ActiveItem, ItemBought, ItemCancelled, OwnershipTransferred } from "../generated/schema";

export function handleItemBought(event: ItemBoughtEvent): void {
  // Need to save event in our graph
  // Update our activeitems

  // get or create an itemListed object
  // Each iten needs a unique ID

  // ItemBoughEvent : RAW Event
  // ItemBoughtObject : What we save in graph

  let itemBought = ItemBought.load(getIdFromEventParams(event.params.tokenId, event.params.nft))
  let activeItem = ActiveItem.load(getIdFromEventParams(event.params.tokenId, event.params.nft))

  if (!itemBought) {
    itemBought = new ItemBought(getIdFromEventParams(event.params.tokenId, event.params.nft))
  }

  itemBought.buyer = event.params.caller
  itemBought.nftAddress = event.params.nft
  itemBought.tokenId = event.params.tokenId
  activeItem!.buyer = event.params.caller
  
  itemBought.save()
  activeItem!.save()
}

export function handleItemCancelled(event: ItemCancelledEvent): void {
  let itemCancelled = ItemCancelled.load(getIdFromEventParams(event.params.tokenId, event.params.nft))
  let activeItem = ActiveItem.load(getIdFromEventParams(event.params.tokenId, event.params.nft))

  if (!itemCancelled) {
    itemCancelled = new ItemCancelled(getIdFromEventParams(event.params.tokenId, event.params.nft))
  }

  itemCancelled.seller = event.params.caller
  itemCancelled.nftAddress = event.params.nft
  itemCancelled.tokenId = event.params.tokenId
  activeItem!.buyer = Address.fromString("0x000000000000000000000000000000000000dEaD") //Known as the dead address

  itemCancelled.save()
  activeItem!.save()

}

export function handleItemListed(event: ItemListedEvent): void {
  let itemListed = ItemListed.load(getIdFromEventParams(event.params.tokenId, event.params.nft))
  let activeItem = ActiveItem.load(getIdFromEventParams(event.params.tokenId, event.params.nft))

  if (!itemListed) {
    itemListed = new ItemListed(getIdFromEventParams(event.params.tokenId, event.params.nft))
  }

  if (!activeItem) {
    new ActiveItem(getIdFromEventParams(event.params.tokenId, event.params.nft))
  } 

  itemListed.seller = event.params.caller
  activeItem!.seller = event.params.caller

  itemListed.nftAddress = event.params.nft
  activeItem!.nftAddress = event.params.nft
  
  itemListed.tokenId = event.params.tokenId
  activeItem!.tokenId = event.params.tokenId

  itemListed.price = event.params.price
  activeItem!.price = event.params.price

  activeItem!.buyer = Address.fromString("0x0000000000000000000000000000000000000000")

  itemListed.save()
  activeItem!.save()
}

function getIdFromEventParams(tokenId: BigInt, nftAddress: Address): string {
  return tokenId.toHexString() + nftAddress.toHexString()
}

export function handleOwnershipTransferred(
  event: OwnershipTransferredEvent
): void {
  let entity = new OwnershipTransferred(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.previousOwner = event.params.previousOwner
  entity.newOwner = event.params.newOwner

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
