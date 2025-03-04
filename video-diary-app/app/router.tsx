export type RootStackParamList = {
  '/': undefined;
  '/video/metadata': { videoUri: string };
  '/video/crop': { videoUri: string };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
