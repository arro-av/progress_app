import { ipcMain } from 'electron'
import db from '../db/lowdb.js'
import { IPC_CHANNELS } from '../channels'

import { Reward } from '../db/types'
import { useRewards } from '../services/useRewards'
const { addReward, editReward, deleteReward, unlockReward } = useRewards()

export function registerRewardHandlers() {
  // GET REWARDS ====================================================
  ipcMain.handle(IPC_CHANNELS.GET_REWARDS, () => db.data.rewards)

  // ADD REWARD ====================================================
  ipcMain.handle(IPC_CHANNELS.ADD_REWARD, (event, newReward: Reward) => {
    db.read()

    const result = addReward(newReward, db.data.rewards)
    if (!result.titleValid) return { success: false, message: 'Title is required' }
    if (!result.costValid) return { success: false, message: 'Cost must be greater than 0' }

    db.data.rewards = result.updatedRewards
    db.write()

    event.sender.send(IPC_CHANNELS.REWARDS_UPDATED)
    return { success: true, message: 'Reward added' }
  })

  // EDIT REWARD ====================================================
  ipcMain.handle(IPC_CHANNELS.EDIT_REWARD, (event, editedReward: Reward) => {
    db.read()

    const result = editReward(editedReward, db.data.rewards)
    if (!result.rewardExists) return { success: false, message: 'Reward not found' }
    if (!result.titleValid) return { success: false, message: 'Title is required' }
    if (!result.costValid) return { success: false, message: 'Cost must be greater than 0' }

    db.data.rewards = result.updatedRewards
    db.write()

    event.sender.send(IPC_CHANNELS.REWARDS_UPDATED)
    return { success: true, message: 'Reward updated' }
  })

  // DELETE REWARD ====================================================
  ipcMain.handle(IPC_CHANNELS.DELETE_REWARD, (event, id: number) => {
    db.read()

    const result = deleteReward(id, db.data.rewards)
    if (!result.rewardExists) return { success: false, message: 'Reward not found' }

    db.data.rewards = result.updatedRewards
    db.write()

    event.sender.send(IPC_CHANNELS.REWARDS_UPDATED)
    return { success: true, message: 'Reward deleted' }
  })

  // UNLOCK REWARD ====================================================
  ipcMain.handle(IPC_CHANNELS.UNLOCK_REWARD, (event, rewardToUnlock: Reward) => {
    db.read()

    const result = unlockReward(
      rewardToUnlock,
      db.data.rewards,
      db.data.user.balance,
      db.data.user.rewards_unlocked,
    )
    if (!result.rewardExists) return { success: false, message: 'Reward not found' }
    if (!result.enoughBalance) return { success: false, message: 'Not enough crystals!' }

    db.data.rewards = result.updatedRewards
    db.data.user.balance = result.updatedBalance
    db.data.user.rewards_unlocked = result.updatedRewards_unlocked
    db.write()

    event.sender.send(IPC_CHANNELS.REWARDS_UPDATED)
    event.sender.send(IPC_CHANNELS.USER_UPDATED)
    return { success: true, message: 'Reward unlocked', rewardCost: rewardToUnlock.cost }
  })
}
