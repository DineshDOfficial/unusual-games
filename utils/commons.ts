import { games } from "../games.config";

export const getGameInfoById = (id: number) => {
    return games.find(game => game.id === id);
};