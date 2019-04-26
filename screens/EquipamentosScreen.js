import React from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableWithoutFeedback,
  AlertIOS,
  Button
} from 'react-native';
import {listen, fire} from "../state";
import Slider from "../components/VerticalSlider";

function tipoColor(tipo){
  return tipo == 'red' ? 'red' :
    tipo == 'blue' ? 'blue' :
    tipo == 'green' ? 'green' : 
    tipo == 'white' ? '#eee' : 
    tipo == 'master' ? 'black' : 'grey';
}

function tipoName(tipo){
  return tipo == 'red' ? 'R' : tipo == 'green' ? 'G' : tipo == 'blue' ? 'B' : tipo == 'white' ? 'W' :
      tipo == 'master' ? 'M' : tipo == 'piscar' ? '*' : tipo == 'hue' ? 'hue' : tipo == 'animacao' ? 'ani' : tipo;
}

class EquipamentoSlider extends React.Component {

  constructor(props){
    super(props);
    this.state = { value: undefined };
  }

  render(){
    const tipo = this.props.canal.tipo;
    const color = tipoColor(tipo);

    const name = tipoName(tipo);

    return <View style={{ flex: 1,alignItems: 'stretch',flexDirection: 'column',}}>
    <View style={{ height: 10, flex: 1 }}>
      <Text style={{ textAlign: 'center' }}>{(typeof this.state.value == 'undefined' ? 
      this.props.value : 
      this.state.value
      )+''}</Text>
    </View>
    <View style={{ flex: 10, height: 200, width: 42 }}
        onTouchStart={() => this.props.onDown() }
        onTouchEnd={() => this.props.onUp() }
      >
        <Slider 
          thumbStyle={{width:40,height:40,borderRadius:25}}
          step={1}
          thumbTintColor={color}
          minimumTrackTintColor={color}
          orientation="vertical"
          inverted={true}
          maximumValue={255}
          minimumValue={0}
          value={typeof this.state.value == 'undefined' ? this.props.value : this.state.value}
          onValueChange={(value)=>{
            value = parseInt(value);
            if ( this.timeout )
              clearTimeout(this.timeout);
            this.setState({value})
            fire({ type: "slide", index: this.props.index, value });
            this.timeout = setTimeout(()=>{
              this.setState({value:undefined});
            },500)
            
          }}
          style={{transform: [{ rotate: "-90deg"}], marginTop: 80, width: 200, marginLeft: -80 }} 
        />
    </View>
    <View style={{height:10,flex:1}}>
      <Text style={{textAlign:'center',
      marginTop: name.length == 1 ? -5 : 0,

      fontSize: name == '*' ? 30 : name.length == 1 ? 20 : 12
    }}>{name}</Text>
      </View>
    </View>
  }
}

class Equipamento extends React.Component {

  onEditarNome(){
    AlertIOS.prompt(
      this.props.equipamento.nome,
      'Novo nome:',
      [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'Salvar',
          onPress: (nome) => fire({ type: "editar-equipamento-nome", uid: this.props.equipamento.uid, nome })
        }
      ],
      'plain-text',
      this.props.equipamento.nome
    );

  }
  onRemoverEquipamento(){
    
    AlertIOS.alert(this.props.equipamento.nome,'Tem certeza que deseja remover equipamento?',[
      {text:'Cancel',onPress:()=>{}},
      {
        text: 'Remover',
        onPress: ()=> fire({ type: "remove-equipamento", uid: this.props.equipamento.uid })
      }
    ]);
  }

  onEditarIndice(){
    
    AlertIOS.prompt(
      this.props.equipamento.nome+' (atual: '+this.props.equipamento.inicio+')',
      'Índice:',
      [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'Salvar',
          onPress: (value) => {
            if ( !value.match(/^[0-9]+$/) || value < 0 || value > 255 ) {
              AlertIOS.alert('Valor inválido '+value);
            } else {
              fire({ 
                type: "equipamento-editar-inicio", 
                uid: this.props.equipamento.uid, 
                inicio: parseInt(value) 
              });
            }
          }
        }
      ],
      'plain-text',
      (this.props.equipamento.inicio||0)+''
    );
  }

  onReordenar(){

    
    const equipamentos = this.props.fullState.equipamentos.filter(e=>e.uid!=this.props.equipamento.uid);
    AlertIOS.alert(
      this.props.equipamento.nome,
      'Onde?',
      [ 
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
        ...equipamentos
          .map((equipamento2,i)=>({
            text: (i+1)+') '+(i == 0 ? 'Primeiro equipamento. Antes de "'+equipamento2.nome+'"':
            'Entre "' + equipamentos[i-1].nome + '" e "'+ equipamento2.nome+'"' ),
            onPress: () => {
              const sort = [...equipamentos.filter((c,j)=>j<i).map(c=>c.uid),
                this.props.equipamento.uid,
                ...equipamentos.filter((c,j)=>j>=i).map(c=>c.uid)
              ];
              fire({ type: "equipamentos-sort", sort });
            }
          }))
        ,
        {
          text: (equipamentos.length+1)+') Último equipamento. Depois de "'+equipamentos[equipamentos.length-1].nome+'"',
          onPress: () => {
            fire({ type: "equipamentos-sort", sort: [...equipamentos.map(c=>c.uid), this.props.equipamento.uid ] });
          }
        }
      ]
    );
  }

  onPressNome(){
    AlertIOS.alert(
      this.props.equipamento.nome,
      '',
      [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'Editar Nome',
          onPress: () => this.onEditarNome(),
        },
        {
          text: 'Remover Equipamento',
          onPress: () => this.onRemoverEquipamento(),
        },
        {
          text: 'Editar Índice (valor atual: '+this.props.equipamento.inicio+')',
          onPress: ()=>{
            this.onEditarIndice();
          }
        },
        {
          text: 'Reordenar',
          onPress: () => {
            this.onReordenar();
          }
        }
      ]
    );
  }

  render(){
    const equipamento = this.props.equipamento;
    const tipo = this.props.fullState.equipamentoTipos.filter(e=>e.uid == equipamento.tipoUid)[0] || null;
    return <View 
      style={this.props.first ? styles.equipamento : styles.equipamentoNotFirst}>
      <View style={{height:40,padding:7}}>
      <TouchableWithoutFeedback onPress={()=>this.onPressNome()}>
        <Text style={{fontSize:20}}>{equipamento.nome}</Text>
        </TouchableWithoutFeedback>
      </View>
      <View style={{flex:1,flexDirection:'row'}}>
        {tipo.canais.map((c,k)=>{
        
        const index = equipamento.inicio + k;
        const value = this.props.fullState.canais[index]

        return <EquipamentoSlider
          onDown={this.props.onDown}
          onUp={this.props.onUp}
          index={index}
          value={value}
          key={k}
          fullState={this.props.fullState}
          tipo={tipo}
          equipamento={equipamento}
          canal={c}
        />;
        })}
      </View>
    </View>
  }
}

export default class EquipamentosScreen extends React.Component {
  static navigationOptions = {
    header: null
  };

  constructor(props){
    super(props);
    this.state = {isScrollEnable:true};
    this.l = listen(state=> this.setState({appState: state }));
  }

  componentWillUnmount(){
    this.l();
  }
  

  render() {
    return (
      <View style={styles.container} pagingEnabled={false}>
        <View style={styles.area}>
          
        </View>
        

        <View  style={styles.listaDeEquipamentos}>
        <ScrollView style={{backgroundColor:'green',flex:-1}}>
        <Text>
        {this.state.isScrollEnable?'enabled':'disabled'}
1        </Text>
        </ScrollView>
          <View
          onPress={()=>{}}
          style={{position:'absolute',right:0,bottom:0,backgroundColor:'red',
          textAlign: 'right', 
          backgroundColor: 'blue',
          width: 40,
          height:34
          }}>
          <TouchableWithoutFeedback onPress={()=>{}} style={{width:'40',height:34}}>
            <Text style={{fontSize:25,textAlign:'center',fontWeight:'bold'}}>+</Text>
          </TouchableWithoutFeedback>
          </View>
        </View>

        <ScrollView 
          style={styles.container} 
          horizontal={true}
          scrollEnabled={this.state.isScrollEnable}
          pagingEnabled={false}
          >
          <View style={{flex: 1, flexDirection: 'row'}}>
            {this.state.appState && this.state.appState.equipamentos && this.state.appState.equipamentos.map((e,k)=> <Equipamento 
              first={k==0}
              key={e.uid}
              onDown={()=>this.setState({isScrollEnable:false})}
              onUp={()=>this.setState({isScrollEnable:true})}
              equipamento={e} 
              fullState={this.state.appState} 
              /> )}
          </View>

        </ScrollView>
        {/* <View style={styles.tabBarInfoContainer}>
          <Text style={styles.tabBarInfoText}>This is a tab bar. You can edit it in:</Text>
        </View> */}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  area: {
    height: 200,
    backgroundColor: '#eee'
  },
  listaDeEquipamentos: {
    height: 180,
    borderBottomColor: '#eee',
    borderBottomWidth: 1
  },

  equipamento: {
    flex:1
  },
  equipamentoNotFirst: {
    flex:1,
    borderLeftColor: '#ccc',
    borderLeftWidth: 1
  },

  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  developmentModeText: {
    marginBottom: 20,
    color: 'rgba(0,0,0,0.4)',
    fontSize: 14,
    lineHeight: 19,
    textAlign: 'center',
  },
  contentContainer: {
    paddingTop: 30,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  welcomeImage: {
    width: 100,
    height: 80,
    resizeMode: 'contain',
    marginTop: 3,
    marginLeft: -10,
  },
  getStartedContainer: {
    alignItems: 'center',
    marginHorizontal: 50,
  },
  homeScreenFilename: {
    marginVertical: 7,
  },
  codeHighlightText: {
    color: 'rgba(96,100,109, 0.8)',
  },
  codeHighlightContainer: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 3,
    paddingHorizontal: 4,
  },
  getStartedText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    lineHeight: 24,
    textAlign: 'center',
  },
  tabBarInfoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    ...Platform.select({
      ios: {
        shadowColor: 'black',
        shadowOffset: { height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 20,
      },
    }),
    alignItems: 'center',
    backgroundColor: '#fbfbfb',
    paddingVertical: 20,
  },
  tabBarInfoText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    textAlign: 'center',
  },
  navigationFilename: {
    marginTop: 5,
  },
  helpContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  helpLink: {
    paddingVertical: 15,
  },
  helpLinkText: {
    fontSize: 14,
    color: '#2e78b7',
  },
});
