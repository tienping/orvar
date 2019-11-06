/**
 *
 * GamesPage
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
// import { FormattedMessage } from 'react-intl';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';
import injectSaga from 'utils/injectSaga';
import injectReducer from 'utils/injectReducer';
import { dataChecking, Events } from 'globalUtils';
import globalScope from 'globalScope';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import 'assets/animate.min.scss';
import {
    Button,
} from '@material-ui/core';
import InputForm from 'components/InputForm';
import AuthPage from '../AuthPage';
import PerfectMatchGame from '../PerfectMatchGame';
import {
    doLogin,
    getGameInfo,
    getResult,
} from './actions';
import makeSelectGamesPage from './selectors';
import reducer from './reducer';
import saga from './saga';
// import messages from './messages';
import './style.scss';

// import mockData from './mockDataReturnFromAPI';

export class GamesPage extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
    constructor(props) {
        super(props);

        this.state = {
            email: '',
            password: '',
            availableChance: null,
            showModal: null,
            slideArray: null,
            gameId: null,
            // gameId: 1,
            // showModal: 'showPlay',
            playMusic: false,
            showPassword: false,
            showLogin: false,
            requestToken: false,
            hideLoginModal: false,
            pageFontSize: '13px',
            showUsername: false,
            gameInfo: null,
        };
    }

    componentDidMount = () => {
        document.ondragstart = () => null;
        Events.trigger('hideHeader', {});
        Events.trigger('hideFooter', {});
        setTimeout(() => {
            this.setState({ isRendered: true });
        }, 1100);

        if (window.takePocket) {
            this.handlePocket(window.takePocket());
        } else if (this.props.location.search.indexOf('pickPocket') || window.location !== window.parent.location) {
            if (window.addEventListener) {
                // For standards-compliant web browsers
                window.addEventListener('message', this.parsePocketFromWeb, false);
            } else {
                window.attachEvent('onmessage', this.parsePocketFromWeb);
            }
        } else if (!globalScope.token) {
            alert('Please login to continue.');
            globalScope.previousPage = window.location.pathname;
            this.setState({ requestToken: true, showUsername: true });
        }

        // call API, check status see if true or false
        const gameId = dataChecking(this.props, 'match', 'params', 'id');
        if (gameId) {
            this.setState({ gameId });
            this.props.dispatch(getGameInfo({ id: gameId }));
        }
    }

    componentWillReceiveProps = (nextProps) => {
        if (dataChecking(nextProps, 'gamesPage', 'login', 'success') !== dataChecking(this.props, 'gamesPage', 'login', 'success') && nextProps.gamesPage.login.success) {
            setTimeout(() => {
                this.setState({ hideLoginModal: true });
            }, 1000);
        }

        if (dataChecking(nextProps, 'gamesPage', 'result') !== dataChecking(this.props, 'gamesPage', 'result') && nextProps.gamesPage.result.success) {
            this.setState({ gameResultImagelink: nextProps.gamesPage.result.data });
        }

        if (dataChecking(nextProps, 'gamesPage', 'gameInfo') !== dataChecking(this.props, 'gamesPage', 'gameInfo') && nextProps.gamesPage.gameInfo.success) {
            if (dataChecking(nextProps.gamesPage.gameInfo, 'data')) {
                const gameInfo = nextProps.gamesPage.gameInfo.data;
                this.setState({ gameInfo });

                if (dataChecking(gameInfo, 'data', 'config', 'menu', 'background_music')) {
                    this.idleMusic = new Audio(gameInfo.data.config.menu.background_music);
                    this.idleMusic.loop = true;
                }

                if (dataChecking(gameInfo, 'data', 'config', 'menu', 'start_sound')) {
                    this.startSound = new Audio(gameInfo.data.config.menu.start_sound);
                }
            }

            console.log(nextProps.gamesPage.gameInfo.data);
        }
    }

    onBgImageLoaded = ({ target: imageEl }) => {
        this.setState({
            // dimensions: {
            //     height: imageEl.offsetHeight,
            //     width: imageEl.offsetWidth,
            // },
            pageFontSize: `${imageEl.offsetWidth / 36}px`,
        });
    }

    onGameComplete = (payload) => {
        this.props.dispatch(getResult(payload));
    }

    onBackToMenu = () => {
        this.setState({ showModal: null });
        if (this.state.playMusic && this.state.showModal === 'showPlay') {
            this.idleMusic.currentTime = 0;
            this.idleMusic.play();
        }
    }

    parsePocketFromWeb = (event) => {
        if (event.origin !== 'https://www.hermo.my'
            && event.origin !== 'https://hermo.my'
            && event.origin !== 'https://devshop.hermo.my'
            && event.origin !== 'http://hershop.hermo.my') {
            console.log(`Receive postMessage from invalid source: ${event.origin}`);
            return null;
        }

        if (event.data) {
            try {
                const pocket = JSON.parse(event.data);
                if (pocket.hertoken) {
                    this.handlePocket(pocket);
                    return pocket;
                }
            } catch (error) {
                console.log('Error happen when parsing pocket', error);
            }
        }

        return null;
    };

    handlePocket = (pocket) => {
        if (pocket.hertoken) {
            globalScope.profile = pocket;
            globalScope.token = pocket.hertoken;
            globalScope.axios.setHeader('hertoken', globalScope.token);
            this.setState({ showUsername: true });
        }
    }

    handleChange = (event) => {
        this.setState({ [event.target.id]: event.target.value });
    };

    renderLogin = () => (
        <div className="login-container">
            <form onSubmit={() => { this.props.dispatch(doLogin(this.state)); event.preventDefault(); }}>
                <div>
                    <InputForm
                        label="Email address"
                        id="email"
                        type="email"
                        handleChange={this.handleChange}
                        value={this.state.email}
                        onClear={() => {
                            this.setState({ email: '' });
                        }}
                    />
                </div>
                <div>
                    <InputForm
                        label="Password"
                        id="password"
                        type={this.state.showPassword ? 'text' : 'password'}
                        value={this.state.password}
                        showPassword={this.state.showPassword}
                        handleChange={this.handleChange}
                        handleClickShowPassword={() => {
                            this.setState((state) => ({ showPassword: !state.showPassword }));
                        }}
                        onClear={() => {
                            this.setState({ password: '' });
                        }}
                        autoComplete="off"
                        togglePassword={true}
                    />
                </div>
                <div>
                    <Button variant="contained" color="primary" type="submit" style={{ width: '100%' }}>
                        {
                            dataChecking(this.props, 'gamesPage', 'login', 'loading') || dataChecking(this.props, 'gamesPage', 'login', 'success') ?
                                'Loading...'
                                :
                                'Login'
                        }
                    </Button>
                </div>
            </form>
        </div>
    )

    renderModalContent = () => {
        const { showModal, slideArray, gameId } = this.state;

        if (showModal === 'showPlay' && gameId) {
            if (gameId && dataChecking(this.state.gameInfo, 'data', 'type')) {
                this.idleMusic.pause();

                switch (this.state.gameInfo.data.type) {
                    case 'mix-and-match':
                        return (
                            <PerfectMatchGame
                                props={{ smth: true }}
                                playMusic={this.state.playMusic}
                                onGameStart={() => alert('gamestart')}
                                onGameWin={(payload) => this.onGameComplete(payload)}
                                onGameLose={(payload) => this.onGameComplete(payload)}
                                onBackToMenu={this.onBackToMenu}
                                gameResultImagelink={this.state.gameResultImagelink}
                                gameConfig={this.state.gameInfo.data.config.game}
                            />
                        );
                    case 'video-show':
                        return (
                            <div>Video-show</div>
                        );

                    default:
                        return (
                            <div>Invalid Game<span>{this.state.gameInfo.data.type}</span></div>
                        );
                }
            }
        }

        if (showModal === 'slideShow' && slideArray) {
            return (
                <div className="prize-inner-section">
                    <Carousel showThumbs={false} showStatus={false} showIndicators={slideArray.length > 1} emulateTouch={true}>
                        {
                            slideArray.map((item, index) => (
                                <img
                                    draggable="false"
                                    key={index}
                                    width="100%"
                                    src={item}
                                    alt="carousel slide show"
                                    className="slideshow-image"
                                />
                            ))
                        }
                    </Carousel>
                </div>
            );
        }

        return null;
    }

    render() {
        if (!dataChecking(this.state, 'gameInfo', 'data', 'config')) {
            return (
                <div>Loading....</div>
            );
        }

        const gameData = this.state.gameInfo.data;

        return (
            <div className="games-page" style={{ fontSize: this.state.pageFontSize }}>
                <div className="game-container">
                    <div className="page-buttons">
                        {
                            this.state.showModal ?
                                <div
                                    className="toggle-back page-button-item"
                                    onClick={() => this.onBackToMenu()}
                                >
                                    <img
                                        draggable="false"
                                        width="100%"
                                        src={require('./rsc/icons8-left-3-96.png')}
                                        alt="play"
                                        className="main-menu-button-item animated zoomIn"
                                    />
                                </div>
                                :
                                null
                        }
                        <div
                            className="toggle-music page-button-item to-right"
                            onClick={() => {
                                this.setState({ playMusic: !this.state.playMusic });
                                this.idleMusic[!this.state.playMusic ? 'play' : 'pause']();
                            }}
                        >
                            {
                                this.state.playMusic ?
                                    <img
                                        draggable="false"
                                        width="100%"
                                        src={require('./rsc/icons8-sound-100.png')}
                                        alt="play"
                                        className="main-menu-button-item animated zoomIn"
                                    />
                                    :
                                    <img
                                        draggable="false"
                                        width="100%"
                                        src={require('./rsc/icons8-mute-100.png')}
                                        alt="play"
                                        className="main-menu-button-item animated zoomIn"
                                    />
                            }
                        </div>
                    </div>
                    {
                        this.state.requestToken && !this.state.hideLoginModal ?
                            <span className="games-login-modal animated fa" style={{ backgroundColor: 'rgba(255,255,255)', overflow: 'auto' }}>
                                {/* {this.renderLogin()} */}
                                <AuthPage isModal={true} />
                            </span>
                            :
                            <div className="main-menu-wrapper">
                                <div className="main-menu-content">
                                    {/* <div
                                        className="back-button gotoshop"
                                        onClick={() => {
                                            console.log('gotoshop', window.goToShop);

                                            if (window.goToShop) {
                                                window.goToShop();
                                            }
                                        }}
                                    >
                                        <i className="fas fa-store-alt"></i>
                                    </div> */}
                                    <div className="main-menu-bottom-content animated fadeIn">
                                        <div className="game-info">
                                            <div className="main-menu-username">
                                                {
                                                    dataChecking(globalScope, 'profile', 'name') && dataChecking(globalScope, 'profile', 'username') ?
                                                        <div className="profile-name animated fadeIn">Welcome, {globalScope.profile.name || globalScope.profile.username}!</div>
                                                        :
                                                        <img className="username-loading" src={require('images/preloader-02.gif')} alt="" />
                                                }
                                            </div>
                                            {
                                                this.state.availableChance !== null ?
                                                    <div className="main-menu-username animated fadeIn">
                                                        <div variant="h4">You have {this.state.availableChance || 0} token</div>
                                                    </div>
                                                    :
                                                    null

                                            }
                                        </div>
                                        <div
                                            onClick={
                                                () => {
                                                    if (this.state.playMusic) {
                                                        this.startSound.play();
                                                    }
                                                    setTimeout(() => {
                                                        this.setState({ showModal: 'showPlay' });
                                                    }, 0);

                                                    return true;
                                                }
                                            }
                                            className="animated fadeIn"
                                        >
                                            <img
                                                draggable="false"
                                                // src={require('./rsc/D11-Button-image_Play_529x130.png')}
                                                src={gameData.config.menu.start_button}
                                                alt="Play"
                                                className="main-menu-button-item"
                                            />
                                        </div>
                                        <div
                                            onClick={() => this.setState({ showModal: 'slideShow', slideArray: gameData.config.menu.prize_slider })}
                                            className="animated fadeIn"
                                        >
                                            <img
                                                draggable="false"
                                                // src={require('./rsc/D11-Button-image_Prize_529x130.png')}
                                                src={gameData.config.menu.prizes_button}
                                                alt="Prizes"
                                                className="main-menu-button-item"
                                            />
                                        </div>
                                        <div
                                            onClick={() => this.setState({ showModal: 'slideShow', slideArray: gameData.config.menu.how_to_play_slider })}
                                            className="animated fadeIn"
                                        >
                                            <img
                                                draggable="false"
                                                // src={require('./rsc/D11-Button-image_How-to-play_529x130.png')}
                                                src={gameData.config.menu.how_to_play_button}
                                                alt="How to Play"
                                                className="main-menu-button-item"
                                            />
                                        </div>
                                    </div>
                                    {
                                        gameData.token_charge ?
                                            <div className="main-menu-token-indicator">
                                                <span>Token available: </span>
                                                <span>5</span>
                                            </div>
                                            :
                                            null
                                    }
                                </div>
                            </div>
                    }
                    <div
                        className="ppg-version"
                        onClick={() => {
                            // alert('asdfadsf');
                            // alert(`${window.parent ? 'have window.parent' : 'no window.parent'}`);
                            // // alert(`${window.parent && window.parent.onPerfectGame ? 'have window.parent.onPerfectGame' : 'no window.parent.onPerfectGame'}`);
                            // if (window.parent && window.parent.onPerfectGame) {
                            //     window.parent.onPerfectGame();
                            // }

                            // if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
                            //     window.ReactNativeWebView.postMessage('adasdadasd', 'applink');

                            //     if (window.onCloseWindow) {
                            //         window.onCloseWindow();
                            //     }
                            // }
                        }}
                    >0.3.0</div>
                    <img
                        draggable="false"
                        onLoad={this.onBgImageLoaded}
                        src={gameData.config.menu.background_image}
                        alt="main menu background"
                        className="main-menu-bg animated fadeIn"
                    />
                    {
                        this.state.showModal ?
                            <div
                                className={`games-page-popup-modal modal-${this.state.showModal} animated ${this.state.isRendered ? 'fadeIn' : 'opacity-zero'}`}
                            >
                                <div className="modal-inner-div">
                                    {this.renderModalContent(this.state.slideArray)}
                                </div>
                            </div>
                            :
                            null
                    }
                </div>
            </div>
        );
    }
}

GamesPage.propTypes = {
    dispatch: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
    gamesPage: makeSelectGamesPage(),
});

function mapDispatchToProps(dispatch) {
    return {
        dispatch,
    };
}

const withConnect = connect(mapStateToProps, mapDispatchToProps);

const withReducer = injectReducer({ key: 'gamesPage', reducer });
const withSaga = injectSaga({ key: 'gamesPage', saga });

export default compose(
    withReducer,
    withSaga,
    withConnect,
)(GamesPage);
