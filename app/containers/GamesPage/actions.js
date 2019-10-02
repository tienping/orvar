/*
 *
 * GamesPage actions
 *
 */

import {
    AUTH_LOGIN,
    AUTH_LOGIN_SUCCESS,
    AUTH_LOGIN_FAILED,
    GET_GAME_TOKEN,
    GET_GAME_TOKEN_SUCCESS,
    GET_GAME_TOKEN_FAILED,
    GET_RESULT,
    GET_RESULT_SUCCESS,
    GET_RESULT_FAILED,
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
export function loginFailed(response) {
    return {
        type: AUTH_LOGIN_FAILED,
        payload: response,
    };
}
export function getGameToken() {
    return {
        type: GET_GAME_TOKEN,
    };
}
export function getGameTokenSuccess(gameTokenData) {
    return {
        type: GET_GAME_TOKEN_SUCCESS,
        gameTokenData,
    };
}
export function getGameTokenFailed(gameTokenData) {
    return {
        type: GET_GAME_TOKEN_FAILED,
        payload: gameTokenData,
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
export function getResultFailed(resultData) {
    return {
        type: GET_RESULT_FAILED,
        payload: resultData,
    };
}
