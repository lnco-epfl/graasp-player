import {
  PackedItem,
  ThumbnailSize,
  ThumbnailsBySize,
  getMimetype,
} from '@lnco-ai/sdk';
import { ItemIcon } from '@lnco-ai/ui';

type Props = {
  item: PackedItem;
  size?: keyof ThumbnailsBySize;
};
const ItemThumbnail = ({
  item,
  size = ThumbnailSize.Medium,
}: Props): JSX.Element | null => {
  const thumbnailSrc = item.thumbnails?.[size];

  return (
    <ItemIcon
      type={item.type}
      mimetype={getMimetype(item.extra)}
      alt={item.name}
      iconSrc={thumbnailSrc}
    />
  );
};
export default ItemThumbnail;
