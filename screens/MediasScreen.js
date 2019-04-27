import React from 'react';
import { Text, ScrollView, StyleSheet, View, Button, TouchableWithoutFeedback,
  AlertIOS } from 'react-native';
import {listen,fire} from "../state";
import Slider from "react-native-slider";


export default class MediasScreen extends React.Component {
  static navigationOptions = {
    header: null,
  };
  constructor(props){
    super(props);
    this.state = {

    };
    this.l = listen(state=> this.setState({appState: state }));
    this.onSlide = this.onSlide.bind(this);
    this.onStop = this.onStop.bind(this);
    this.onPlay = this.onPlay.bind(this);
    this.onPause = this.onPause.bind(this);
    this.onRepeat = this.onRepeat.bind(this);
  }

  onSlide(value){
    fire({ type: "volume", volume: value });
    if ( this.timeout )
      clearTimeout(this.timeout);
    this.setState({ slideValue: value });
    this.timeout = setTimeout(()=>{
      this.setState({ slideValue: undefined });
    },500);
  }

  onStop(){
    fire({ type: "arquivo-stop" });
  }

  onPlay(){
    fire({ type: "arquivo-play", path: this.state.selected });
  }

  onPause(){
    fire({ type: "arquivo-pause" });
  }

  onRepeat(){
    fire({ type: "repeat" });
  }

  onLongPress(arquivo) {
    AlertIOS.alert(
      arquivo.nome,
      arquivo.path,
      [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'Renomear',
          onPress:() => this.onEditarNome(arquivo)
        },
        {
          text: 'Remover',
          onPress: () => this.onRemoverArquivo(arquivo),
        },
        {
          text: 'Reordenar',
          onPress: () => this.onReordenar(arquivo),
        }
      ]
    );
  }

  onReordenar(arquivo) {

    const arquivos = this.state
      .appState
      .arquivos
      .filter(c=>c.path!=arquivo.path);
    AlertIOS.alert(
      arquivo.nome,
      'Onde?',
      [ 
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
        ...arquivos
          .map((arquivo2,i)=>({
            text: (i+1)+') '+(i == 0 ? 'Primeiro arquivo. Antes de "'+arquivo2.nome+'"':
            'Entre "' + arquivos[i-1].nome + '" e "'+ arquivo2.nome+'"' ),
            onPress: () => {
              const sort = [...arquivos.filter((c,j)=>j<i).map(c=>c.path),
                arquivo.path,
                ...arquivos.filter((c,j)=>j>=i).map(c=>c.path)
              ];
              fire({ type: "arquivos-sort", sort });
            }
          }))
        ,
        {
          text: (arquivos.length+1)+') Última arquivo. Depois de "'+arquivos[arquivos.length-1].nome+'"',
          onPress: () => {
            fire({ type: "arquivos-sort", sort: [...arquivos.map(c=>c.path), arquivo.path ] });
          }
        }
      ]
    );
  }

  onRemoverArquivo(arquivo){
    AlertIOS.alert(arquivo.nome,'Tem certeza que deseja remover o arquivo?',[
      {text:'Cancel',onPress:()=>{}},
      {
        text: 'Remover',
        onPress: ()=> fire({ type: "remove-arquivo", path: arquivo.path })
      }
    ]);
    
  }

  onEditarNome(arquivo){

    AlertIOS.prompt(
      arquivo.nome,
      'Novo nome:',
      [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'Salvar',
          onPress: (nome) => fire({ type: "editar-arquivo-nome", path: arquivo.path, nome })
        }
      ],
      'plain-text',
      arquivo.nome
    );
  }

  render() {
    if ( !this.state.appState )return null;
    
    // const slideValue = typeof this.state.slideValue == 'undefined' && 
    //   this.state.appState.cenaSlide && 
    //   this.state.appState.cenaSlide.uid ==  this.state.cenaUid &&
    //   typeof this.state.appState.cenaSlide.value == 'number' 
    //   ?  this.state.appState.cenaSlide.value || 0
    //   : this.state.slideValue || 0;
    const slideValue = typeof this.state.slideValue == 'undefined' ? this.state.appState.player.volume||0 : this.state.slideValue;

    return (
      <View style={{flex:1}}>
        <View style={styles.slider}>
          <Text>{Math.round(slideValue*100)}%</Text>
          <Slider
            style={{ height: 50 }}
            thumbStyle={{ width: 50, height: 50, borderRadius: 25 }}
            minimumValue={0}
            maximumValue={1}
            value={slideValue}
            onValueChange={value => {
              this.onSlide(value);
            }}
          />
      </View>
      
      <View style={{flexDirection:'row',height:50, borderBottomWidth: 1,borderBottomColor:'#ddd'}}>
        <View style={{flex:1}}><Button 
          onPress={this.onStop} 
          disabled={!this.state.appState.player.arquivo}
          title="Stop" 
          style={{flex:1}} /></View>
        <View style={{flex:1}}><Button 
          onPress={this.onPlay} 
          title="Play" 
          disabled={typeof this.state.selected == 'undefined'}
          style={{flex:1}} /></View>
        <View style={{flex:1}}><Button 
          onPress={this.onPause} 
          title="Pause" 
          disabled={!this.state.appState.player.arquivo}
          style={{flex:1}} /></View>
        <View style={{flex:1}}><Button 
          onPress={this.onRepeat} 
          disabled={typeof this.state.selected == 'undefined'}
          title="Repeat" 
          color={this.state.appState.player && this.state.appState.player.repeat ? '#000' : '#bbb' }
          style={{
            flex:1,
            
          }} /></View>
        </View>
        
      <ScrollView style={{flex:1}}>
        {this.state.appState && this.state.appState.arquivos && this.state.appState.arquivos.map(a=>
        <TouchableWithoutFeedback key={a.path} 
          key={a.path}
          onLongPress={()=>this.onLongPress(a)}
          onPress={()=>this.setState({selected: this.state.selected == a.path  ? undefined : a.path})}>
          <View style={a.path == this.state.selected ? styles.selectedArquivo : styles.arquivo} >
          <Text style={{
            ...(a.path == this.state.selected ? styles.selectedArquivoText : styles.arquivoText),
            fontWeight: this.state.appState.player.arquivo == a.path ? 'bold' : undefined
          }}>{a.nome}{
            this.state.appState.player.arquivo == a.path ? '...':''
          }</Text>
          </View>
        </TouchableWithoutFeedback>
        )}
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  slider: {marginLeft: 12, marginRight: 12,marginTop:10, height: 70},
  container: {
    flex: 1,
    paddingTop: 15,
    backgroundColor: '#fff',
  },
  selectedArquivo: {
    padding: 20,
    backgroundColor: 'blue'
  },
  selectedArquivoText: {
    color: 'white'
  },
  arquivo: {
    padding: 20,
  },
  arquivoText: {

  }
});
