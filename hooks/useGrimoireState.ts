"use client";

import { useReducer } from "react";
import { GrimoireState, GrimoireAction } from "@/types";

const initialState: GrimoireState = {
  step: "script",
  scriptType: "full",
  scriptSource: null,
  premadeScriptId: null,
  scriptIds: [],
  playerCount: null,
  gameIds: [],
  nightPhase: "first",
  searchQuery: "",
  detailCharacterId: null
};

function reducer(state: GrimoireState, action: GrimoireAction): GrimoireState {
  switch (action.type) {
    case "SET_SCRIPT_TYPE":
      return {
        ...state,
        scriptType: action.scriptType,
        scriptSource: null,
        premadeScriptId: null,
        scriptIds: [],
        gameIds: [],
        playerCount: null
      };
    case "CLEAR_SCRIPT_SOURCE":
      return { ...state, scriptSource: null, premadeScriptId: null, scriptIds: [], gameIds: [], playerCount: null };
    case "SELECT_PREMADE":
      return {
        ...state,
        scriptSource: "premade",
        premadeScriptId: action.id,
        scriptIds: action.ids,
        gameIds: [],
        playerCount: null,
        searchQuery: "",
        detailCharacterId: null
      };
    case "SELECT_EDITION":
      return {
        ...state,
        scriptSource: action.edition,
        premadeScriptId: null,
        scriptIds: action.ids,
        gameIds: [],
        playerCount: null,
        searchQuery: "",
        detailCharacterId: null
      };
    case "SELECT_CUSTOM":
      return {
        ...state,
        scriptSource: "custom",
        premadeScriptId: null,
        scriptIds: [],
        gameIds: [],
        playerCount: null,
        searchQuery: "",
        detailCharacterId: null
      };
    case "TOGGLE_SCRIPT_CHAR": {
      const inScript = state.scriptIds.includes(action.id);
      return {
        ...state,
        scriptIds: inScript ? state.scriptIds.filter((id) => id !== action.id) : [...state.scriptIds, action.id],
        gameIds: state.gameIds.filter((id) => id !== action.id)
      };
    }
    case "GO_TO_SETUP":
      return { ...state, step: "setup", gameIds: [], playerCount: null };
    case "GO_BACK_TO_SCRIPT":
      return { ...state, step: "script" };
    case "GO_TO_DASHBOARD":
      return { ...state, step: "dashboard" };
    case "GO_BACK_TO_SETUP":
      return { ...state, step: "setup" };
    case "SET_PLAYER_COUNT":
      return { ...state, playerCount: action.count, gameIds: [] };
    case "TOGGLE_GAME_CHAR": {
      const inGame = state.gameIds.includes(action.id);
      return {
        ...state,
        gameIds: inGame ? state.gameIds.filter((id) => id !== action.id) : [...state.gameIds, action.id]
      };
    }
    case "SET_NIGHT_PHASE":
      return { ...state, nightPhase: action.phase };
    case "SET_SEARCH":
      return { ...state, searchQuery: action.query };
    case "SET_DETAIL":
      return { ...state, detailCharacterId: action.id };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

export function useGrimoireState() {
  const [state, dispatch] = useReducer(reducer, initialState);
  return { state, dispatch };
}
