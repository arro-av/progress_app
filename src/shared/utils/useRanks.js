/**
 * RANKS HELPER
 * --------------------------------------------------------------------------------------------------------------
 * @function getTagRank {function} - Gets tag rank based on level
 * @function getHabitRank {function} - Gets habit rank based on streak and counter
 * @function getProjectRank {function} - Gets project rank based on level
 */
export const useRanks = () => {
    const getTagRank = (tag) => {
        if (tag.level >= 55) return 'legendary';
        else if (tag.level >= 40) return 'epic';
        else if (tag.level >= 25) return 'rare';
        else if (tag.level >= 10) return 'uncommon';
        else return 'common';
    }

    const getHabitRank = (habit) => {
        const score = habit.best_streak * habit.counter;
        if (score >= 2000) return 'legendary';
        else if (score >= 1000) return 'epic';
        else if (score >= 500) return 'rare';
        else if (score >= 100) return 'uncommon';
        else return 'common';
    }

    const getProjectRank = (project) => {
        if (project.time_spent >= 2400) return 'legendary'; //40h
        else if (project.time_spent >= 1200) return 'epic'; //20h
        else if (project.time_spent >= 480) return 'rare'; //8h
        else if (project.time_spent >= 120) return 'uncommon'; //2h
        else return 'common';
    }

    const getTodoListRank = (todoList) => {
        if (todoList.time_spent >= 600) return 'legendary'; //12h
        else if (todoList.time_spent >= 300) return 'epic'; //6h
        else if (todoList.time_spent >= 120) return 'rare'; //2h
        else if (todoList.time_spent >= 30) return 'uncommon'; //0.5h
        else return 'common';
    }

    return {
        getTagRank,
        getHabitRank,
        getProjectRank,
        getTodoListRank
    }
}