import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
const { width: W, height: H } = Dimensions.get('window');
const GAME_TIME = 30;

export default function App() {
  const [screen, setScreen] = useState('splash');
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_TIME);
  const [targetPos, setTargetPos] = useState({ x: W/2-36, y: H/2-100 });
  const [showHow, setShowHow] = useState(false);
  const scale = useRef(new Animated.Value(1)).current;
  const splashScale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    AsyncStorage.getItem('bestScore').then(v => { if(v) setBest(parseInt(v)) });
    Animated.spring(splashScale, { toValue: 1, friction: 4, useNativeDriver: true }).start();
    setTimeout(()=> setScreen('home'), 1800);
  }, []);

  useEffect(() => {
    let timer;
    if(screen==='game' && timeLeft>0){
      timer = setInterval(()=> setTimeLeft(t=> t-1), 1000);
    } else if(screen==='game' && timeLeft===0){
      if(score>best){ setBest(score); AsyncStorage.setItem('bestScore', String(score)); }
      setScreen('over');
    }
    return ()=> clearInterval(timer);
  }, [screen, timeLeft]);

  const randomPos = () => {
    const x = Math.random()*(W - 92) + 10;
    const y = Math.random()*(H - 300) + 120;
    setTargetPos({x,y});
  };
  const startGame = () => { setScore(0); setTimeLeft(GAME_TIME); randomPos(); setScreen('game'); };
  const tapTarget = () => {
    Animated.sequence([
      Animated.timing(scale, {toValue:0.7, duration:80, useNativeDriver:true}),
      Animated.spring(scale, {toValue:1, friction:3, useNativeDriver:true})
    ]).start();
    setScore(s=> s+1 + Math.floor((30-timeLeft)/6));
    randomPos();
  };

  if(screen==='splash'){
    return (<View style={styles.center}><StatusBar hidden/>
      <Animated.View style={{transform:[{scale:splashScale}]}}>
        <Text style={styles.logo}>TAP{'\n'}RUSH</Text>
        <View style={styles.logoUnder}/>
      </Animated.View></View>)
  }
  if(screen==='home'){
    return (
      <View style={styles.container}><StatusBar style="light"/>
        <Text style={styles.smallLogo}>TAP RUSH</Text>
        <View style={styles.card}><Text style={styles.bestLabel}>BEST SCORE</Text><Text style={styles.bestVal}>{best}</Text></View>
        <TouchableOpacity style={styles.playBtn} onPress={startGame}><Text style={styles.playText}>PLAY NOW</Text></TouchableOpacity>
        <View style={{flexDirection:'row', gap:12, marginTop:18}}>
          <TouchableOpacity style={styles.secBtn} onPress={()=> setShowHow(true)}><Text style={styles.secText}>HOW TO PLAY</Text></TouchableOpacity>
          <TouchableOpacity style={styles.secBtn} onPress={()=> {setBest(0); AsyncStorage.removeItem('bestScore')}}><Text style={styles.secText}>RESET</Text></TouchableOpacity>
        </View>
        {showHow && (<View style={styles.modalBg}><View style={styles.modal}>
          <Text style={styles.modalTitle}>How to Play</Text>
          <Text style={styles.modalStep}>1. Tap the target 🎯</Text>
          <Text style={styles.modalStep}>2. Earn points</Text>
          <Text style={styles.modalStep}>3. Beat high score!</Text>
          <TouchableOpacity style={styles.playBtnSmall} onPress={()=> setShowHow(false)}><Text style={styles.playTextSmall}>GOT IT</Text></TouchableOpacity>
        </View></View>)}
      </View>)
  }
  if(screen==='game'){
    return (
      <View style={styles.gameArea}><StatusBar style="light"/>
        <View style={styles.topBar}>
          <View style={styles.pill}><Text style={styles.pillText}>⏱ {timeLeft}s</Text></View>
          <View style={styles.pill}><Text style={styles.pillText}>⭐ {score}</Text></View>
        </View>
        <Animated.View style={[styles.target, {left:targetPos.x, top:targetPos.y, transform:[{scale}]}]}>
          <TouchableOpacity onPress={tapTarget} style={styles.targetInner}>
            <View style={styles.targetOuter}><View style={styles.targetMid}><View style={styles.targetCore}/></View></View>
          </TouchableOpacity>
        </Animated.View>
      </View>)
  }
  return (
    <View style={styles.container}><StatusBar style="light"/>
      <Text style={styles.timeUp}>TIME UP!</Text>
      <Text style={styles.msg}>{score>=80?'LEGEND! ⚡':score>=50?'AWESOME! 🎯':score>=25?'NICE! 👏':'KEEP TAPPING! 💪'}</Text>
      <View style={styles.scoreCard}>
        <View style={{alignItems:'center'}}><Text style={styles.label}>SCORE</Text><Text style={styles.scoreBig}>{score}</Text></View>
        <View style={styles.divider}/>
        <View style={{alignItems:'center'}}><Text style={styles.label}>BEST</Text><Text style={styles.scoreBig}>{Math.max(score,best)}</Text></View>
      </View>
      <TouchableOpacity style={styles.playBtn} onPress={startGame}><Text style={styles.playText}>PLAY AGAIN</Text></TouchableOpacity>
      <TouchableOpacity style={[styles.secBtn, {marginTop:14}]} onPress={()=> setScreen('home')}><Text style={styles.secText}>HOME</Text></TouchableOpacity>
    </View>)
}

const styles = StyleSheet.create({
  center:{flex:1, backgroundColor:'#6C5CE7', alignItems:'center', justifyContent:'center'},
  logo:{fontSize:68, fontWeight:'900', color:'#fff', textAlign:'center', lineHeight:64},
  logoUnder:{height:12, backgroundColor:'#FFD93D', borderRadius:6, marginTop:8, width:160, alignSelf:'center'},
  container:{flex:1, backgroundColor:'#1a1a2e', alignItems:'center', justifyContent:'center', padding:20},
  smallLogo:{fontSize:42, fontWeight:'900', color:'#fff', letterSpacing:3, marginBottom:24},
  card:{backgroundColor:'#16213e', padding:18, borderRadius:18, minWidth:180, alignItems:'center', borderWidth:1, borderColor:'#2a2a4a'},
  bestLabel:{color:'#a0a0c0', fontSize:12, letterSpacing:2}, bestVal:{color:'#FFD93D', fontSize:42, fontWeight:'800'},
  playBtn:{backgroundColor:'#6C5CE7', paddingVertical:18, paddingHorizontal:60, borderRadius:100, marginTop:30},
  playText:{color:'#fff', fontSize:22, fontWeight:'800'},
  secBtn:{backgroundColor:'#16213e', paddingVertical:12, paddingHorizontal:18, borderRadius:100, borderWidth:1, borderColor:'#3a3a5a'},
  secText:{color:'#c0c0e0', fontWeight:'700', fontSize:12},
  gameArea:{flex:1, backgroundColor:'#0f0f23'},
  topBar:{flexDirection:'row', justifyContent:'space-between', paddingTop:50, paddingHorizontal:20},
  pill:{backgroundColor:'#1a1a2e', paddingVertical:10, paddingHorizontal:18, borderRadius:100, borderWidth:1, borderColor:'#2a2a4a'},
  pillText:{color:'#fff', fontWeight:'800', fontSize:16},
  target:{position:'absolute', width:72, height:72}, targetInner:{width:72, height:72, alignItems:'center', justifyContent:'center'},
  targetOuter:{width:72, height:72, borderRadius:36, backgroundColor:'#FF4757', alignItems:'center', justifyContent:'center'},
  targetMid:{width:50, height:50, borderRadius:25, backgroundColor:'#fff', alignItems:'center', justifyContent:'center'},
  targetCore:{width:24, height:24, borderRadius:12, backgroundColor:'#FF4757'},
  timeUp:{fontSize:48, fontWeight:'900', color:'#fff'}, msg:{fontSize:22, color:'#FFD93D', fontWeight:'800', marginTop:8},
  scoreCard:{flexDirection:'row', backgroundColor:'#16213e', borderRadius:20, padding:24, marginTop:24, alignItems:'center', gap:30, borderWidth:1, borderColor:'#2a2a4a'},
  label:{color:'#a0a0c0', fontSize:11}, scoreBig:{color:'#fff', fontSize:36, fontWeight:'900', marginTop:4},
  divider:{width:1, height:50, backgroundColor:'#2a2a4a'},
  modalBg:{position:'absolute', top:0, left:0, right:0, bottom:0, backgroundColor:'rgba(0,0,0,0.7)', alignItems:'center', justifyContent:'center'},
  modal:{backgroundColor:'#16213e', borderRadius:20, padding:24, width:300, alignItems:'center'},
  modalTitle:{color:'#fff', fontSize:22, fontWeight:'800', marginBottom:12},
  modalStep:{color:'#c0c0e0', fontSize:15, marginVertical:4, fontWeight:'600'},
  playBtnSmall:{backgroundColor:'#6C5CE7', paddingVertical:12, paddingHorizontal:30, borderRadius:100, marginTop:16},
  playTextSmall:{color:'#fff', fontWeight:'800'}
});
