import React from 'react';
import {ScrollView,Text, View,Modal,TouchableHighlight, TouchableWithoutFeedback} from 'react-native'

export default class SettingsScreen extends React.Component {
  static navigationOptions = {
    header: null,
  };
  state = {
    modalVisible: false,
  };
  setModalVisible(visible) {
    this.setState({modalVisible: visible});
  }

  render() {
    return (
      <View style={{marginTop: 22}}>
        <Modal
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
        </TouchableWithoutFeedback>
      </View>
    );
  }
}
