import React from 'react';
import {ScrollView,Text, View,Modal,TouchableHighlight, TouchableWithoutFeedback, 
  Button, Picker, TextInput} from 'react-native'
import {listen, fire} from "../state";

const options = [
  { value: "artnet", nome: "EnttecODE ArtNet" },
  { value: "bbdmx", nome: "BeagleBone-DMX (bbdmx)" },
  { value: "dmx4all", nome: "DMX4ALL (NanoDMX USB Interface Like)" },
  { value: "enttec-usb-dmx-pro", nome: "Enttec USB DMX Pro" },
  { value: "enttec-open-usb-dmx", nome: "Enttec Open DMX USB" },
  { value: "dmxking-utra-dmx-pro", nome: "DMXKing Ultra DMX" }
];

export default class SettingsScreen extends React.Component {
  static navigationOptions = {
    header: null,
  };
  // setModalVisible(visible) {
  //   this.setState({modalVisible: visible});
  // }

  constructor(props){
    super(props);
    this.state = {};
    this.l = listen(state=> this.setState({appState:state}));
  }

  componentWillUnmount(){
    this.l();
  }

  onDesconectar(){
    const {appState} = this.state
    if ( !appState || !appState.dmx )return;
    if (appState.dmx.conectado) fire({ type: "dmx-desconectar" });
  }

  onConectar(){
    const {appState} = this.state
    if ( !appState || !appState.dmx )return;

    if (this.state.conectando || appState.dmx.conectado) return;
    this.setState({
      conectando: true
    });
    let driver = typeof this.state.driver == 'undefined' ? appState.dmx.driver : this.state.driver;
    let deviceId = typeof this.state.deviceId == 'undefined' ? appState.dmx.deviceId : this.state.deviceId; 
    fire({
      type: "dmx-conectar",
      driver,
      deviceId
    });
    setTimeout(()=>{
      this.state.deviceId = undefined;
      this.state.driver = undefined;
      this.state.conectando = undefined;
      this.setState({conectando: undefined, driver: undefined, deviceId: undefined});
    },500);
  }

  render() {
    const {appState} = this.state
    if ( !appState || !appState.dmx )return null;

    
    return (
      <View style={{marginTop: 22}}>
        {appState.dmx.conectado ? <View style={{marginLeft:20}}><Text>Conectado...</Text>
          <Button title="Desconectar" onPress={()=>this.onDesconectar()} />
        </View> : <View>
          <TextInput
            style={{borderWidth:1,borderColor:'#ddd',padding:5,borderRadius:4, marginLeft: 10, marginRight: 10 }}
            onChangeText={val=>this.setState({deviceId:val})}
            value={typeof this.state.deviceId == 'undefined' ? appState.dmx.deviceId : this.state.deviceId}
           />
        <Picker
          selectedValue={typeof this.state.driver == 'undefined' ? appState.dmx.driver : this.state.driver}
          onValueChange={(value) =>
            this.setState({driver: value})
          }>
          {options.map(op => (
            <Picker.Item value={op.value} key={op.value} label={op.nome} />
          ))}
        </Picker>
          <Button title="Conectar" onPress={()=>this.onConectar()} />
        </View> }
        
        {/* <Modal
          animationType="slide"
          transparent={false}
          visible={this.state.modalVisible}
          onRequestClose={() => {
            Alert.alert('Modal has been closed.');
          }}>
          <View style={{marginTop: 22}}>
            <View>
              <Text>Hello World!</Text>

              <TouchableWithoutFeedback
                onPress={() => {
                  this.setModalVisible(!this.state.modalVisible);
                }}>
                <Text>Hide Modal</Text>
              </TouchableWithoutFeedback>
            </View>
          </View>
        </Modal>

        <TouchableWithoutFeedback
          onPress={() => {
            this.setModalVisible(true);
          }}>
          <Text>Show Modal</Text>
        </TouchableWithoutFeedback> */}
      </View>
    );
  }
}
