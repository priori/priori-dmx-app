import React from 'react';
import { Text, ScrollView, StyleSheet } from 'react-native';
import {listen} from "../state";

export default class MesaScreen extends React.Component {
  static navigationOptions = {
    header: null,
  };

  constructor(props){
    super(props);
    this.state = {};
    this.l = listen(state=> this.setState(state));
  }

  componentWillUnmount(){
    this.l();
  }

  render() {
    return (
      <ScrollView style={styles.container}>
        <Text>{JSON.stringify(this.state)}</Text>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 15,
    backgroundColor: '#fff',
  },
});
