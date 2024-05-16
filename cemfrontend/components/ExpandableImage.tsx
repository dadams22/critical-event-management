'use client';

import { Center, Image, Modal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

interface ComponentProps {
  title?: string;
}

export default function ExpandableImage(
  props: ComponentProps & React.ComponentProps<typeof Image>
) {
  const [opened, { open, close }] = useDisclosure();

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    const { onClick } = props;
    if (onClick) onClick(e);
    open();
  };

  const expandedImageProps: React.ComponentProps<typeof Image> = {
    ...props,
    h: '80vh',
    height: '80vh',
    maw: '100%',
    fit: 'contain',
  };

  return (
    <>
      <Image {...props} onClick={handleClick} style={{ ...props?.style, cursor: 'pointer' }} />
      <Modal title={props.title} opened={opened} onClose={close} size="xl">
        <Center h="calc(90vh - 54px - 16px)" mah="100%">
          <Image {...expandedImageProps} />
        </Center>
      </Modal>
    </>
  );
}
