// Type definitions for modules without TypeScript definitions

declare module '@react-native-community/slider' {
  import { Component } from 'react';
    import {
        StyleProp,
        ViewStyle
    } from 'react-native';

  export interface SliderProps {
    /**
     * Set to true to animate values with default 'timing' animation type
     */
    animateTransitions?: boolean;
    /**
     * Used to configure the animation parameters
     */
    animationType?: 'spring' | 'timing';
    /**
     * Set to true if you want the slider to be disabled
     */
    disabled?: boolean;
    /**
     * Initial value of the slider
     */
    value?: number;
    /**
     * Step value of the slider. The value should be between 0 and maximumValue - minimumValue)
     */
    step?: number;
    /**
     * The color used for the track to the right of the button
     */
    maximumTrackTintColor?: string;
    /**
     * The color used for the track to the left of the button
     */
    minimumTrackTintColor?: string;
    /**
     * The color used for the thumb
     */
    thumbTintColor?: string;
    /**
     * The size of the touch area that allows moving the thumb.
     * The touch area has the same center as the visible thumb.
     * This allows to have a visually small thumb while still allowing the user
     * to move it easily.
     */
    thumbTouchSize?: { width: number; height: number };
    /**
     * Minimum value of the slider
     */
    minimumValue?: number;
    /**
     * Maximum value of the slider
     */
    maximumValue?: number;
    /**
     * Callback continuously called while the user is dragging the slider
     */
    onValueChange?: (value: number) => void;
    /**
     * Callback called when the user starts changing the value
     */
    onSlidingStart?: (value: number) => void;
    /**
     * Callback called when the user finishes changing the value
     */
    onSlidingComplete?: (value: number) => void;
    /**
     * The style applied to the slider container
     */
    style?: StyleProp<ViewStyle>;
    /**
     * Set this to true to visually see the thumb touch rect in green.
     */
    debugTouchArea?: boolean;
    /**
     * Set to true to use the default 'spring' animation
     */
    animateTransitions?: boolean;
    /**
     * [Android] Used to configure the animation parameters
     */
    animationType?: 'spring' | 'timing';
    /**
     * [iOS] The component used for the track image (upper part)
     */
    maximumTrackImage?: any;
    /**
     * [iOS] The component used for the track image (lower part)
     */
    minimumTrackImage?: any;
    /**
     * [iOS] The component used for the thumb image
     */
    thumbImage?: any;
    /**
     * Used to locate this view in end-to-end tests
     */
    testID?: string;
  }

  export default class Slider extends Component<SliderProps> {}
}
