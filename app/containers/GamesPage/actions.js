/*
 *
 * GamesPage actions
 *
 */

import {
    AUTH_LOGIN,
    AUTH_LOGIN_SUCCESS,
    AUTH_LOGIN_FAILED,
    GET_RESULT,
    GET_RESULT_SUCCESS,
    GET_RESULT_FAILED,
    GET_GAME_INFO,
    GET_GAME_INFO_SUCCESS,
    GET_GAME_INFO_FAILED,
} from './constants';

export function doLogin(loginData) {
    return {
        type: AUTH_LOGIN,
        loginData,
    };
}
export function loginSuccess(response) {
    return {
        type: AUTH_LOGIN_SUCCESS,
        response,
    };
}
export function loginFailed(payload) {
    return {
        type: AUTH_LOGIN_FAILED,
        payload,
    };
}


export function getResult(payload) {
    return {
        type: GET_RESULT,
        payload,
    };
}
export function getResultSuccess(resultData) {
    return {
        type: GET_RESULT_SUCCESS,
        resultData,
    };
}
export function getResultFailed(payload) {
    return {
        type: GET_RESULT_FAILED,
        payload,
    };
}


export function getGameInfo(gameParams) {
    return {
        type: GET_GAME_INFO,
        gameParams,
    };
}
export function getGameInfoSuccess(gameInfoData) {
    return {
        type: GET_GAME_INFO_SUCCESS,
        gameInfoData,
    };
}
export function getGameInfoFailed(payload) {
    return {
        type: GET_GAME_INFO_FAILED,
        payload,
    };
}
