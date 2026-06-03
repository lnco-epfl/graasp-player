import {
  ItemGeolocation,
  ItemVisibility,
  PackedItem,
  PermissionLevel,
} from '@lnco-ai/sdk';

export type MockItemTag = Omit<ItemVisibility, 'item'>;
export type MockItem = Omit<PackedItem, 'permission' | 'hidden' | 'public'> & {
  // for testing
  filepath?: string;
  // path to a fixture file in cypress
  filefixture?: string;
  memberships?: { memberId: string; permission: PermissionLevel }[];
  hidden?: MockItemTag;
  public?: MockItemTag;
  geolocation?: Partial<ItemGeolocation>;
};
