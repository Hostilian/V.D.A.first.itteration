declare module 'expo-router' {

  export const useRouter: () => {
    push: (screen: string, params?: Record<string, any>) => void;
    replace: (screen: string, params?: Record<string, any>) => void;
    navigate: (screen: string, params?: Record<string, any>) => void;
    goBack: () => void;
    back: () => void; // Alias for goBack
    canGoBack: () => boolean;
  };

  export const useLocalSearchParams: <T>() => T;

  export const Link: React.FC<{
    href: string;
    params?: Record<string, any>;
    children: React.ReactNode;
    onPress?: () => void;
    [prop: string]: any;
  }>;

  export const Stack: {
    Screen: React.FC<{
      name: string;
      component: React.ComponentType<any>;
      options?: Record<string, any>;
    }>;
    Navigator: React.FC<{
      initialRouteName?: string;
      children: React.ReactNode;
      screenOptions?: Record<string, any>;
    }>;
  };
}
