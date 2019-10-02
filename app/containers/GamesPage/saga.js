import { takeLatest, call, put } from 'redux-saga/effects';
import { staticErrorResponse, apiRequest, setCookie } from 'globalUtils';
import globalScope from 'globalScope';
import {
    AUTH_LOGIN,
    GET_GAME_TOKEN,
    GET_RESULT,
} from './constants';
import {
    loginSuccess,
    loginFailed,
    getGameTokenSuccess,
    getGameTokenFailed,
    getResultSuccess,
    getResultFailed,
} from './actions';

export function* loginQuery(action) {
    let err;
    try {
        const base64 = require('base-64');
        const hash = base64.encode(`${action.loginData.email}:${action.loginData.password}`);
        const loginResponse = yield call(apiRequest, 'auth/token', 'post', {}, null, { headers: { 'Authorization': `Basic ${hash}` } });
        if (loginResponse && loginResponse.ok) {
            globalScope.token = loginResponse.data.token;
            globalScope.axios.setHeader('hertoken', globalScope.token);
            setCookie(process.env.TOKEN_KEY, globalScope.token);
            const profileResponse = yield call(apiRequest, '/profile');
            if (profileResponse && profileResponse.ok) {
                globalScope.username = profileResponse.data.username;
                yield put(loginSuccess(loginResponse.data));
            } else if (profileResponse && profileResponse.ok === false) {
                yield put(getGameTokenFailed(profileResponse.data));
            } else {
                err = staticErrorResponse({ text: 'No response from server' });
                throw err;
            }
            try {
                const gameResponse = yield call(apiRequest, '/xmas/game', 'post');
                if (gameResponse && gameResponse.ok !== false) {
                    yield put(getGameTokenSuccess(gameResponse.data));
                } else if (gameResponse && gameResponse.ok === false) {
                    yield put(getGameTokenFailed(gameResponse.data));
                } else {
                    err = staticErrorResponse({ text: 'No response from server' });
                    throw err;
                }
            } catch (e) {
                console.log('error: ', e);
                yield put(getGameTokenFailed(e));
            }
        } else {
            yield put(loginFailed(loginResponse.data));
        }
    } catch (error) {
        yield put(loginFailed(error));
    }
}

export function* getGameTokenQuery() {
    let err;
    try { // Trying the HTTP Request
        const response = yield call(apiRequest, '/xmas/game', 'post');
        if (response && response.ok !== false) {
            yield put(getGameTokenSuccess(response.data));
        } else if (response && response.ok === false) {
            yield put(getGameTokenFailed(response.data));
        } else {
            err = staticErrorResponse({ text: 'No response from server' });
            throw err;
        }
    } catch (e) {
        console.log('error: ', e);
        yield put(getGameTokenFailed(e));
    }
}

export function* getResultQuery(action) {
    let err;
    try {
        const payload = JSON.stringify({
            token: action.payload.token,
            score: action.payload.score,
        });
        const response = yield call(apiRequest, '/xmas/game', 'put', payload);
        if (response && response.ok !== false) {
            yield put(getResultSuccess(response.data));
        } else if (response && response.ok === false) {
            yield put(getResultFailed(response.data));
        } else {
            err = staticErrorResponse({ text: 'No response from server' });
            throw err;
        }
    } catch (e) {
        console.log('error: ', e);
        yield put(getResultFailed(e));
    }
}
// Individual exports for testing
export default function* gamesPageSaga() {
    yield takeLatest(AUTH_LOGIN, loginQuery);
    yield takeLatest(GET_GAME_TOKEN, getGameTokenQuery);
    yield takeLatest(GET_RESULT, getResultQuery);
}
