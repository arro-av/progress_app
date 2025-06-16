import { ipcMain } from 'electron'
import db from '../../db/lowdb.js'
import { IPC_CHANNELS } from '../channels'
import { Reward } from '../../db/types'

import { normalizePositionAfterDeletion } from '../../helpers/positionNormalizer.js'

export function registerRewardHandlers() {
  ipcMain.handle(IPC_CHANNELS.GET_REWARDS, () => db.data.rewards)

  ipcMain.handle(IPC_CHANNELS.ADD_REWARD, (event, addedReward: Reward) => {
    db.read()
    const nextId = (db.data.rewards.at(-1)?.id || 0) + 1
    const nextPosition = db.data.rewards.length

    if (!addedReward.title || addedReward.title.trim() === '')
      return { success: false, message: 'Title is required' }

    if (!addedReward.cost || addedReward.cost <= 0)
      return { success: false, message: 'Cost must be greater than 0' }

    const newReward = {
      id: nextId,
      title: addedReward.title,
      cost: addedReward.cost,
      repeatable: addedReward.repeatable,
      position: nextPosition,
    }
    db.data.rewards.push(newReward)

    db.write()
    event.sender.send(IPC_CHANNELS.REWARDS_UPDATED)
    return { success: true, message: 'Reward added' }
  })

  ipcMain.handle(IPC_CHANNELS.EDIT_REWARD, (event, editedReward: Reward) => {
    db.read()
    const index = db.data.rewards.findIndex((reward) => reward.id === editedReward.id)
    if (index === -1) return { success: false, message: 'Reward not found' }

    if (!editedReward.title || editedReward.title.trim() === '')
      return { success: false, message: 'Title is required' }

    if (!editedReward.cost || editedReward.cost <= 0)
      return { success: false, message: 'Cost must be greater than 0' }

    const rewardToUpdate = db.data.rewards[index]
    rewardToUpdate.title = editedReward.title
    rewardToUpdate.cost = editedReward.cost
    rewardToUpdate.repeatable = editedReward.repeatable

    db.write()
    event.sender.send(IPC_CHANNELS.REWARDS_UPDATED)
    return { success: true, message: 'Reward updated' }
  })

  ipcMain.handle(IPC_CHANNELS.DELETE_REWARD, (event, id: number) => {
    db.read()
    const index = db.data.rewards.findIndex((reward) => reward.id === id)
    if (index === -1) return { success: false, message: 'Reward not found' }

    const rewards = db.data.rewards
    const rewardToDelete = rewards[index]

    rewards.splice(index, 1)
    normalizePositionAfterDeletion(rewards, rewardToDelete.position)

    db.write()
    event.sender.send(IPC_CHANNELS.REWARDS_UPDATED)
    return { success: true, message: 'Reward deleted!' }
  })

  ipcMain.handle(IPC_CHANNELS.UNLOCK_REWARD, (event, passedReward: Reward) => {
    db.read()
    const index = db.data.rewards.findIndex((reward) => reward.id === passedReward.id)
    if (index === -1) return { success: false, message: 'Reward not found' }

    const rewards = db.data.rewards
    const unlockedReward = rewards[index]

    let balance = db.data.user.balance

    if (unlockedReward.cost > balance) return { success: false, message: 'Not enough crystals!' }

    balance -= unlockedReward.cost

    if (!unlockedReward.repeatable) {
      rewards.splice(index, 1)
      normalizePositionAfterDeletion(rewards, unlockedReward.position)
    }

    db.data.user.balance = balance
    db.data.user.rewards_unlocked++
    db.write()

    event.sender.send(IPC_CHANNELS.REWARDS_UPDATED)
    event.sender.send(IPC_CHANNELS.BALANCE_UPDATED, balance)

    return {
      success: true,
      message: 'You unlocked ' + unlockedReward.title + '!',
      rewardCost: unlockedReward.cost,
    }
  })
}
