import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text } from 'react-native'
import ZegoUIKitInternal from "../../internal/ZegoUIKitInternal";
import ZegoAudioVideoView from "../../audio_video/ZegoAudioVideoView";
import ZegoAudioVideoViewMore from "./MoreFrame";
import { ZegoRoomStateChangedReason } from "zego-express-engine-reactnative";

export default function GalleryLayout(props: any) {
    const { 
      config = {}, 
      foregroundBuilder, 
      audioVideoConfig = {},
      avatarBuilder
    } = props;
    const {
        addBorderRadiusAndSpacingBetweenView = true, // Whether to display rounded corners and spacing between Views
        ownViewBackgroundColor = '',
        othersViewBackgroundColor = '',
        ownViewBackgroundImage = '',
        othersViewBackgroundImage = '',
    } = config;
    const {
        useVideoViewAspectFill = false,
        showSoundWavesInAudioMode = true,
    } = audioVideoConfig;

    const [localUserID, setLocalUserID] = useState('');
    const [userList, setUserList] = useState([]);
    const [moreUserList, setMoreUserList] = useState([]);

    useEffect(() => {
        const callbackID = 'GalleryLayout' + String(Math.floor(Math.random() * 10000));
        ZegoUIKitInternal.onSDKConnected(callbackID, () => {
            setLocalUserID(ZegoUIKitInternal.getLocalUserInfo().userID);
        });
        ZegoUIKitInternal.onRoomStateChanged(callbackID, (reason: ZegoRoomStateChangedReason) => {
            if (reason == 1 || reason == 4) {
                setLocalUserID(ZegoUIKitInternal.getLocalUserInfo().userID);
            } else if (reason == 2 || reason == 5 || reason == 6 || reason == 7) {
                // ZegoRoomStateChangedReasonLoginFailed
                // ZegoRoomStateChangedReasonReconnectFailed
                // ZegoRoomStateChangedReasonKickOut
                // ZegoRoomStateChangedReasonLogout
                // ZegoRoomStateChangedReasonLogoutFailed
                setLocalUserID('');
            }
        })
        ZegoUIKitInternal.onUserCountOrPropertyChanged(callbackID, (userList: any[]) => {
            // console.warn('>>>>>>>>>>> onUserCountOrPropertyChanged', userList)
            // Put yourself first
            const index = userList.findIndex((user => user.userID == ZegoUIKitInternal.getLocalUserInfo().userID));
            index !== -1 && (userList = userList.splice(index, 1).concat(userList));
            setUserList(userList.slice(0, 7));
            setMoreUserList(userList.slice(7));
        });
        return () => {
            ZegoUIKitInternal.onSDKConnected(callbackID);
            ZegoUIKitInternal.onRoomStateChanged(callbackID);
            ZegoUIKitInternal.onUserCountOrPropertyChanged(callbackID);
        }
    }, []);

    const getAudioVideoViewStyle = () => {
        const len = userList.length;
        let audioVideoViewSizeStyle;
        switch (len) {
            case 1:
                audioVideoViewSizeStyle = styles.audioVideoViewSize1;
                break;
            case 2:
                audioVideoViewSizeStyle = styles.audioVideoViewSize2;
                break;
            case 3:
            case 4:
                audioVideoViewSizeStyle = styles.audioVideoViewSize4;
                break;
            case 5:
            case 6:
                audioVideoViewSizeStyle = styles.audioVideoViewSize6;
                break;
            case 7:
            case 8:
                audioVideoViewSizeStyle = styles.audioVideoViewSize8;
                break;
            default:
                audioVideoViewSizeStyle = styles.audioVideoViewSizeMore;
                break;
        }
        return audioVideoViewSizeStyle;
    }

    const isAudioVideoViewPadding = addBorderRadiusAndSpacingBetweenView && userList.length > 1 ? styles.audioVideoViewPadding : null;
    const isAudioVideoViewBorder = addBorderRadiusAndSpacingBetweenView && userList.length > 1 ? styles.audioVideoViewBorder : null;

    return (<View style={[styles.container, isAudioVideoViewPadding]}>
        {
            userList.map((user, index) => <View key={user.userID} style={[
                styles.audioVideoViewContainer,
                getAudioVideoViewStyle(),
                isAudioVideoViewPadding
            ]}>
                <View style={[styles.audioVideoViewSubContainer, isAudioVideoViewBorder]}>
                    <ZegoAudioVideoView
                        userID={user.userID}
                        audioViewBackgroudColor={user.userID == ZegoUIKitInternal.getLocalUserInfo().userID ? ownViewBackgroundColor : othersViewBackgroundColor}
                        audioViewBackgroudImage={user.userID == ZegoUIKitInternal.getLocalUserInfo().userID ? ownViewBackgroundImage : othersViewBackgroundImage}
                        showSoundWave={showSoundWavesInAudioMode}
                        useVideoViewAspectFill={useVideoViewAspectFill}
                        foregroundBuilder={foregroundBuilder}
                        avatarBuilder={avatarBuilder}
                    />
                </View>
            </View>)
        }
        {
            moreUserList.length <=1 ? moreUserList.map((user, index) => <View key={user.userID} style={[
                styles.audioVideoViewContainer,
                getAudioVideoViewStyle(),
                isAudioVideoViewPadding
            ]}>
                <View style={[styles.audioVideoViewSubContainer, isAudioVideoViewBorder]}>
                    <ZegoAudioVideoView
                        userID={user.userID}
                        audioViewBackgroudColor={user.userID == ZegoUIKitInternal.getLocalUserInfo().userID ? ownViewBackgroundColor : othersViewBackgroundColor}
                        audioViewBackgroudImage={user.userID == ZegoUIKitInternal.getLocalUserInfo().userID ? ownViewBackgroundImage : othersViewBackgroundImage}
                        showSoundWave={showSoundWavesInAudioMode}
                        useVideoViewAspectFill={useVideoViewAspectFill}
                        foregroundBuilder={foregroundBuilder}
                        avatarBuilder={avatarBuilder}
                    />
                </View>
            </View>) : <View style={[styles.audioVideoViewContainer, getAudioVideoViewStyle(), isAudioVideoViewPadding]}>
                <View style={[styles.audioVideoViewSubContainer, isAudioVideoViewBorder]}>
                    <ZegoAudioVideoViewMore 
                        userList={moreUserList}
                        useVideoViewAspectFill={useVideoViewAspectFill}
                        audioViewBackgroudColor={othersViewBackgroundColor}
                        audioViewBackgroudImage={othersViewBackgroundImage}
                    />
                </View>
            </View>
        }
    </View>)
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        height: '100%',
        backgroundColor: '#171821',
        flexDirection: 'row',
        flexWrap: 'wrap'
    },
    audioVideoViewContainer: {
        zIndex: 1,
    },
    audioVideoViewSubContainer: {
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        background: '#D8D8D8',
    },
    audioVideoViewBorder: {
        borderRadius: 10,
    },
    audioVideoViewPadding: {
        paddingLeft: 2.5,
        paddingRight: 2.5,
        paddingTop: 2.5,
        paddingBottom: 2.5,
    },

    audioVideoViewSize1: {
        width: '100%',
        height: '100%',
    },
    audioVideoViewSize2: {
        width: '100%',
        height: '50%',
    },
    audioVideoViewSize4: {
        width: '50%',
        height: '50%',
    },
    audioVideoViewSize6: {
        width: '50%',
        height: '33.33%',
    },
    audioVideoViewSize8: {
        width: '50%',
        height: '25%',
    },
    audioVideoViewSizeMore: {
        width: '50%',
        height: '25%',
    },
});