import React from 'react';
import { Platform } from 'react-native';
import { createStackNavigator, createMaterialTopTabNavigator} from 'react-navigation';
// import {createMaterialTabNavigator} from 'react-navigation-tabs'

import TabBarIcon from '../components/TabBarIcon';
import EquipamentosScreen from '../screens/EquipamentosScreen';
import MediasScreen from '../screens/MediasScreen';
import SettingsScreen from '../screens/SettingsScreen';

import CenasScreen from '../screens/CenasScreen';
import MesaScreen from '../screens/MesaScreen';

const CenasStack = createStackNavigator({
  Home: CenasScreen,
});

CenasStack.navigationOptions = {
  tabBarLabel: 'Cenas',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={
        Platform.OS === 'ios'
          ? `ios-information-circle${focused ? '' : '-outline'}`
          : 'md-information-circle'
      }
    />
  )
};

const MesaStack = createStackNavigator({
  Home: MesaScreen,
});

MesaStack.navigationOptions = {
  tabBarLabel: 'Mesa',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={
        Platform.OS === 'ios'
          ? `ios-information-circle${focused ? '' : '-outline'}`
          : 'md-information-circle'
      }
    />
  ),
};

const EquipamentosStack = createStackNavigator({
  Home: EquipamentosScreen,
});

EquipamentosStack.navigationOptions = {
  // swipeEnabled: false,
  tabBarLabel: 'Equip.',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={
        Platform.OS === 'ios'
          ? `ios-information-circle${focused ? '' : '-outline'}`
          : 'md-information-circle'
      }
    />
  ),
};

const MediasStack = createStackNavigator({
  Links: MediasScreen,
});

MediasStack.navigationOptions = {
  tabBarLabel: 'Player',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={Platform.OS === 'ios' ? 'ios-link' : 'md-link'}
    />
  ),
};

const SettingsStack = createStackNavigator({
  Settings: SettingsScreen,
});

SettingsStack.navigationOptions = {
  tabBarLabel: 'Sett.',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={Platform.OS === 'ios' ? 'ios-options' : 'md-options'}
    />
  ),
};

export default createMaterialTopTabNavigator({
  CenasStack,
  EquipamentosStack,
  MediasStack,
  MesaStack,
  SettingsStack,
},{
  
  tabBarOptions: {
    style: {
      paddingTop: 20
    }
  }
});
