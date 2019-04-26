
import {
    LayoutChangeEvent,
    PanResponder,
    PanResponderGestureState
  } from "react-native";
  
  
  const initialValue = 0;
  const min = 0;
  const max = 100;
  const CIRCLE_DIAMETER = 50;
  
  class Slider extends React.Component {
    state = {
      barHeight: null,
      deltaValue: 0,
      value: initialValue
    };
  
    panResponder = PanResponder.create({
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderMove: (_, gestureState) => this.onMove(gestureState),
      onPanResponderRelease: () => this.onEndMove(),
      onPanResponderTerminate: () => {}
    });
  
    onMove(gestureState) {
      const { barHeight } = this.state;
      const newDeltaValue = this.getValueFromBottomOffset(
        -gestureState.dy,
        barHeight,
        min,
        max
      );
  
      this.setState({
        deltaValue: newDeltaValue
      });
    }
    onEndMove() {
      const { value, deltaValue } = this.state;
      this.setState({ value: value + deltaValue, deltaValue: 0 });
    }
  
    onBarLayout = (event) => {
      const { height: barHeight } = event.nativeEvent.layout;
      this.setState({ barHeight });
    };
  
    capValueWithinRange = (value, range) => {
      if (value < range[0]) return range[0];
      if (value > range[1]) return range[1];
      return value;
    };
  
    getValueFromBottomOffset = (
      offset,
      barHeight,
      rangeMin,
      rangeMax
    ) => {
      if (barHeight === null) return 0;
      return ((rangeMax - rangeMin) * offset) / barHeight;
    };
  
    getBottomOffsetFromValue = (
      value,
      rangeMin,
      rangeMax,
      barHeight
    ) => {
      if (barHeight === null) return 0;
      const valueOffset = value - rangeMin;
      const totalRange = rangeMax - rangeMin;
      const percentage = valueOffset / totalRange;
      return barHeight * percentage;
    };
  
    render() {
      const { value, deltaValue, barHeight } = this.state;
  
      const cappedValue = this.capValueWithinRange(value + deltaValue, [
        min,
        max
      ]);
      const bottomOffset = this.getBottomOffsetFromValue(
        cappedValue,
        min,
        max,
        barHeight
      );
  
      return (
        <PageContainer>
          <Value>{Math.floor(cappedValue)}</Value>
          <Container>
            <BarContainer>
              <Bar onLayout={this.onBarLayout} />
              <Circle
                bottomOffset={bottomOffset}
                {...this.panResponder.panHandlers}
              />
            </BarContainer>
          </Container>
        </PageContainer>
      );
    }
  }
  
  function styled(style){
  
    return function(props){
      return React.createElement(View, {...props,style} );
    }
  }
  function styledText(style){
  
    return function(props){
      return React.createElement(Text, {...props,style} );
    }
  }
  
  const PageContainer = styled({
    backgroundColor: 'black',
    flexGrow: '1',
    alignSelf: 'stretch',
    alignItems: 'center',
    paddingVertical: 20
  });
  
  const Container = styled({
    flexGrow: 1,
    alignSelf: 'stretch',
    justifyContent: 'center',
    flexDirection: 'row'
  });
  
  const Value = styledText({
    color: 'white'
  });
  
  const BarContainer = styled({
    width: CIRCLE_DIAMETER,
    alignItems: 'center',
    paddingVertical: CIRCLE_DIAMETER / 2,
    marginHorizontal: 20
  });
  
  const Bar = styled({
    width: 2,
    backgroundColor: 'white',
    flexGrow: 1
  });
  
  const Circle = styled({
    borderRadius: CIRCLE_DIAMETER / 2,
    width: CIRCLE_DIAMETER,
    height: CIRCLE_DIAMETER,
    backgroundColor: 'white',
    position: 'absolute',
    bottom: props => props.bottomOffset
  });