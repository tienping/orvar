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
    Typography,
} from '@material-ui/core';
import InputForm from 'components/InputForm';
import AuthPage from '../AuthPage';
import PerfectMatchGame from '../PerfectMatchGame';
import {
    doLogin,
    getResult,
} from './actions';
import makeSelectGamesPage from './selectors';
import reducer from './reducer';
import saga from './saga';
// import messages from './messages';
import './style.scss';

const prizeSlide = [
    {
        key: 'prize1',
        image: require('./rsc/D11-prize-image.jpg'),
        next: null,
        prev: null,
    // }, {
    //     key: 'prize2',
    //     image: require('./rsc/prize_two.jpg'),
    //     next: 'prize3',
    //     prev: 'prize1',
    // }, {
    //     key: 'prize3',
    //     key: 'prize3',
    //     image: require('./rsc/prize_three.jpg'),
    //     next: null,
    //     prev: 'prize2',
    },
];
const howToSlide = [
    {
        key: 'how_to',
        image: require('./rsc/D11-How-To-Play.jpg'),
        next: 'prize2',
        prev: null,
    },
];
const idleMusic = new Audio(require('./rsc/sound/Prizefighter.mp3'));
idleMusic.loop = true;

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
            const pocket = window.takePocket();
            globalScope.profile = pocket;
            globalScope.token = pocket.hertoken;
        } else if (!globalScope.token) {
            globalScope.previousPage = window.location.pathname;
            this.setState({ requestToken: true });
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
        // if (availableChance !== availableChance) {
        //     // setState availableChance
        // }
    }

    onGameComplete = (payload) => {
        this.props.dispatch(getResult(payload));
    }

    onBackToMenu = () => {
        this.setState({ showModal: null });
        if (this.state.playMusic && this.state.showModal === 'showPlay') {
            idleMusic.currentTime = 0;
            idleMusic.play();
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
            if (gameId) {
                idleMusic.pause();
                return (
                    <PerfectMatchGame
                        props={{ smth: true }}
                        playMusic={this.state.playMusic}
                        onGameStart={() => alert('gamestart')}
                        onGameWin={(payload) => this.onGameComplete(payload)}
                        onGameLose={(payload) => this.onGameComplete(payload)}
                        onBackToMenu={this.onBackToMenu}
                        gameResultImagelink={this.state.gameResultImagelink}
                    />
                );
            }
        }

        if (showModal === 'slideShow' && slideArray) {
            return (
                <div className="prize-inner-section">
                    <Carousel showThumbs={false} showStatus={false} showIndicators={true} emulateTouch={true}>
                        {
                            slideArray.map((item, index) => (
                                <img
                                    draggable="false"
                                    key={index}
                                    width="100%"
                                    src={item.image}
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
        return (
            <div className="games-page">
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
                                idleMusic[!this.state.playMusic ? 'play' : 'pause']();
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
                            <span className="games-login-modal animated fa" style={{ backgroundColor: 'rgba(255,255,255,0.7)', overflow: 'auto' }}>
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
                                    <div className="main-menu-bottom-content animated slideInDown fadeIn">
                                        <div className="game-info pb-1">
                                            {
                                                dataChecking(globalScope, 'profile') &&
                                                    <div className="main-menu-username animated fadeIn">
                                                        <Typography>Welcome, {globalScope.profile.name || globalScope.profile.username}!</Typography>
                                                    </div>
                                            }
                                            {
                                                this.state.availableChance !== null ?
                                                    <div className="main-menu-username animated fadeIn">
                                                        <Typography variant="h4">You have {this.state.availableChance || 0} token</Typography>
                                                    </div>
                                                    :
                                                    null

                                            }
                                        </div>
                                        <div
                                            onClick={
                                                () => {
                                                    if (this.state.playMusic) {
                                                        const startSound = new Audio(require('./rsc/sound/Start_button.wav'));
                                                        startSound.play();
                                                    }
                                                    setTimeout(() => {
                                                        this.setState({ showModal: 'showPlay', gameId: 1 });
                                                    }, 0);

                                                    return true;
                                                }
                                            }
                                            className="animated slideInRight"
                                        >
                                            <img
                                                draggable="false"
                                                src={require('./rsc/D11-Button-image_Play_529x130.png')}
                                                alt="play"
                                                className="main-menu-button-item"
                                            />
                                        </div>
                                        <div
                                            onClick={() => this.setState({ showModal: 'slideShow', slideArray: prizeSlide })}
                                            className="animated slideInLeft"
                                        >
                                            <img
                                                draggable="false"
                                                src={require('./rsc/D11-Button-image_Prize_529x130.png')}
                                                alt="prizes"
                                                className="main-menu-button-item"
                                            />
                                        </div>
                                        <div
                                            onClick={() => this.setState({ showModal: 'slideShow', slideArray: howToSlide })}
                                            className="animated slideInRight"
                                        >
                                            <img
                                                draggable="false"
                                                src={require('./rsc/D11-Button-image_How-to-play_529x130.png')}
                                                alt="how to play"
                                                className="main-menu-button-item"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                    }
                    <div className="ppg-version">0.1.0</div>
                    <img
                        draggable="false"
                        src={require('./rsc/D11-Landing-image-v2.jpg')}
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
