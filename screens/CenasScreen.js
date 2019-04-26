import React from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, AlertIOS, Button, TouchableWithoutFeedback } from 'react-native';
import Slider from "react-native-slider";
import {listen,fire} from "../state";

export default class CenasScreen extends React.Component {
  static navigationOptions = {
    header: null
  };

  constructor(props){
    super(props);
    this.state = {value:0};
    this.l = listen(state=> this.setState({appState: state }));
    this.onSalvar = this.onSalvar.bind(this);
    this.onRemover = this.onRemover.bind(this);
    this.onAgora = this.onAgora.bind(this);
    this.onTransicao = this.onTransicao.bind(this);
    this.onNovaCena = this.onNovaCena.bind(this);
    this.onLongPress = this.onLongPress.bind(this);
    this.onEditarNome = this.onEditarNome.bind(this);
    this.onReordenar = this.onReordenar.bind(this);
    this.onEditTransicao = this.onEditTransicao.bind(this);
  }

  onNovaCena(){
    AlertIOS.prompt(
      'Nova Cena',
      'Nome:',
      [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'Salvar',
          onPress: (nome) => fire({ type: "salvar-mesa", nome })
        }
      ],
      'plain-text'
    );

  }

  onReordenar(cena){
    const cenas = this.state
      .appState
      .cenas
      .filter(c=>c.uid!=cena.uid);
    AlertIOS.alert(
      cena.nome,
      'Onde?',
      [ 
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
        ...cenas
          .map((cena2,i)=>({
            text: (i+1)+') '+(i == 0 ? 'Primeira Cena. Antes de "'+cena2.nome+'"':
            'Entre "' + cenas[i-1].nome + '" e "'+ cena2.nome+'"' ),
            onPress: () => {
              const sort = [...cenas.filter((c,j)=>j<i).map(c=>c.uid),
                cena.uid,
                ...cenas.filter((c,j)=>j>=i).map(c=>c.uid)
              ];
              fire({ type: "cenas-sort", sort });
            }
          }))
        ,
        {
          text: (cenas.length+1)+') Última cena. Depois de "'+cenas[cenas.length-1].nome+'"',
          onPress: () => {
            fire({ type: "cenas-sort", sort: [...cenas.map(c=>c.uid), cena.uid ] });
          }
        }
      ]
    );
  }

  onLongPress(cena) {
    AlertIOS.alert(
      cena.nome,
      '',
      [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'Salvar Configuração Atual',
          onPress: () => this.onSalvar(cena),
        },
        {
          text: 'Remover Cena',
          onPress: () => this.onRemoverCena(cena),
        },
        {
          text: 'Editar Nome',
          onPress:() => this.onEditarNome(cena)
        },
        {
          text: 'Reordenar',
          onPress: () => this.onReordenar(cena),
        }
      ]
    );
  }

  onEditarNome(cena) {
    AlertIOS.prompt(
      cena.nome,
      'Novo nome:',
      [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'Salvar',
          onPress: (nome) => fire({ type: "editar-nome-da-cena", uid: cena.uid, nome })
        }
      ],
      'plain-text',
      cena.nome
    );

  }

  onEditTransicao(){
    const cena = this.state.appState.cenas.filter(c=>c.uid == this.state.selected)[0]||null;
    AlertIOS.prompt(
      cena.nome,
      'Tempo para transição:',
      [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'Salvar',
          onPress: (value) => {
            if ( !value.match(/^[0-9]+$/) ) {
              AlertIOS.alert('Valor inválido '+value);
            } else {
              fire({ type: "editar-tempo-da-cena", uid: cena.uid, tempo: parseInt(value) });
            }
          }
        }
      ],
      'plain-text',
      (cena.transicaoTempo||0)+''
    );
  }

  onRemoverCena(cena){
    AlertIOS.alert(cena.nome,'Tem certeza que deseja remover cena?',[
      {text:'Cancel',onPress:()=>{}},
      {
        text: 'Remover',
        onPress: ()=> fire({ type: "remove-cena", uid: cena.uid })
      }
    ]);
  }
  // action({ type: "editar-nome-da-cena", uid, nome });

  onSalvar(cena){
    AlertIOS.alert(cena.nome,'Tem certeza que deseja salvar modificações?',[
      {text:'Cancel',onPress:()=>{}},
      {
        text: 'Salvar',
        onPress: ()=> fire({ type: "salvar-cena", uid: cena.uid })
      }
    ]);
  }
  onRemover(){
    if (confirm("Realmente deseja remover esta cena?")) {
      const uid = this.state.selected;
      fire({ type: "remove-cena", uid });
    }
  }
  onAgora(){

    const uid = this.state.selected;
    fire({ type: "aplicar-cena-agora", uid });
  }
  onTransicao(){
    const uid = this.state.selected;
    fire({ type: "transicao-para-cena", uid });
  }

  onSlide(value){

    fire({ type: "slide-cena", uid: this.state.selected, value });

    if ( this.timeout )
      clearTimeout(this.timeout);
    this.setState({ slideValue: value });
    this.timeout = setTimeout(()=>{
      this.setState({ slideValue: undefined });
    },500);
  }

  componentWillUnmount(){
    this.l();
  }

  render() {
    if ( !this.state.appState )return null;

    const selectedCena = this.state.appState.cenas.filter(c=>c.uid == this.state.selected)[0] || null;
    const slideValue = typeof this.state.slideValue == 'undefined' && 
      this.state.appState.cenaSlide && 
      this.state.appState.cenaSlide.uid ==  this.state.selected &&
      typeof this.state.appState.cenaSlide.value == 'number' 
      ?  this.state.appState.cenaSlide.value || 0
      : this.state.slideValue || 0;
    return (
      <View style={{flex:1}}>

{this.state.textInputFocus ? 
        <View style={{position:'absolute',top:0,left:0,bottom:0,right:0,backgroundColor:'rgba(255,255,255,.85)',
        zIndex:99}}>
        <View style={{flex:1,justifyContent: "center",alignItems: "center",paddingBottom:200}}>
            <Text style={{fontSize:30,
            textAlignVertical: "center",textAlign: "center"
            }}>{this.state.novaCenaNome||''}</Text>
            </View>
        </View>
        :  null}

        <View style={{...styles.slider,opacity:typeof this.state.selected == 'undefined' ? 0.25 : 1}}>
          <Text>{Math.round(slideValue)}%</Text>
          <Slider
          disabled={typeof this.state.selected == 'undefined'}
            style={{ height: 50 }}
            thumbStyle={{ width: 50, height: 50, borderRadius: 25 }}
            minimumValue={0}
            maximumValue={100}
            value={slideValue}
            onValueChange={value => {
              this.onSlide(value);
            }}
          />
      </View>
      <View style={{flexDirection:'row',height:40, borderBottomWidth: 1, borderBottomColor: '#ddd'}}>
      <View style={{flex:2}}></View>
      <View style={{flex:1}}><Button 
        onPress={this.onAgora} 
        title="Agora" 
        disabled={typeof this.state.selected == 'undefined'}
        style={{flex:1}} /></View>
      <View style={{flex:1.5}}><Button 
        onPress={this.onTransicao} 
        disabled={typeof this.state.selected == 'undefined'}
        title="Transição" 
        style={{flex:1}} /></View>
      <View style={{flex:1}}><Button 
        title={(selectedCena && selectedCena.transicaoTempo||0)+'ms'} 
        onPress={this.onEditTransicao} 
        style={{flex:1}}
        disabled={typeof this.state.selected == 'undefined'}
      /></View>
      </View>
      <ScrollView style={{flex:1}}>
        {this.state.appState && this.state.appState.cenas && this.state.appState.cenas.map(cena=>
        <TouchableWithoutFeedback key={cena.uid} 
          onLongPress={()=>this.onLongPress(cena)}
          onPress={()=>this.setState({selected:cena.uid == this.state.selected ? undefined : cena.uid})}>
          <View style={cena == selectedCena ? styles.selectedCena : styles.cena} >
            <Text style={cena == selectedCena ? styles.selectedCenaText : styles.cenaText}>{cena.nome}
          </Text>
          </View>
        </TouchableWithoutFeedback>
        )}
        </ScrollView>
          <View style={{height:40,flexDirection:'row'}}><View style={{flex:1}}></View>
            <Button title="Nova" onPress={this.onNovaCena} />
          </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 15,
    backgroundColor: '#eee',
  },
  selectedCena: {
    padding: 20,
    backgroundColor: 'blue'
  },
  cena: {
    padding: 20
  },
  selectedCenaText: {
    color: 'white'
  },
  slider: {marginLeft: 12, marginRight: 12,marginTop:10, height: 70},
  cenaText: {}
});
