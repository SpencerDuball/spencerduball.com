import {
  AspectRatio,
  Flex,
  Grid,
  useClipboard,
  IconButton,
  Icon,
  Link,
  LightMode,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
} from "@chakra-ui/react";
import type { IVideoAttachment } from "../context";
import type { AspectRatioProps } from "@chakra-ui/react";
import { RiCheckFill, RiExternalLinkFill, RiLink, RiPauseFill, RiPlayFill } from "react-icons/ri";
import { useRef, useState } from "react";
import ReactPlayer from "react-player";
import type { OnProgressProps } from "react-player/base";

// VideoState
interface IVideoState {
  playing: boolean;
  muted: boolean;
  played: number;
  loaded: number;
  duration: number;
  seeking: boolean;
}
const initialVideoState = {
  playing: false,
  muted: true,
  played: 0,
  loaded: 0,
  duration: 0,
  seeking: false,
};

// VideoAttachment
////////////////////////////////////////////////////////////////////////////////
export interface ImageAttachmentProps extends AspectRatioProps {
  video: IVideoAttachment;
}

export const VideoAttachment = (props: ImageAttachmentProps) => {
  const { video, ...rest } = props;
  const { hasCopied, onCopy } = useClipboard(video.url);

  // setup video state
  const ref = useRef<ReactPlayer>(null);
  const [vidState, setVidState] = useState<IVideoState>(initialVideoState);

  // define video callbacks
  const handleEnded = () => setVidState({ ...vidState, playing: false });
  const handlePlayPause = () => setVidState({ ...vidState, playing: !vidState.playing });
  const handleProgress = (e: OnProgressProps) => {
    if (!vidState.seeking) setVidState({ ...vidState, played: e.played, loaded: e.loaded });
  };
  const handleSeekMouseDown = (e: React.MouseEvent<HTMLDivElement>) => setVidState({ ...vidState, seeking: true });
  const handleSeekMouseUp = (e: React.MouseEvent<HTMLDivElement>) => setVidState({ ...vidState, seeking: false });
  const handleSeekChange = (value: number) => {
    setVidState({ ...vidState, played: value / 100 });
    if (ref && ref.current) ref.current.seekTo(value / 100);
  };

  return (
    <AspectRatio
      borderRadius="lg"
      overflow="hidden"
      boxShadow="md"
      ratio={1}
      position="relative"
      sx={{ "&:hover > [data-image-overlay]": { visibility: "visible" }, "& video": { objectFit: "cover" } }}
      isolation="isolate"
      {...rest}
    >
      <>
        <ReactPlayer
          ref={ref}
          progressInterval={500}
          playing={vidState.playing}
          url={video.url}
          controls={false}
          onProgress={handleProgress}
          onEnded={handleEnded}
          height="100%"
          width="100%"
          style={{ objectFit: "cover" }}
        />
        <Grid
          data-image-overlay
          visibility="hidden"
          position="absolute"
          top={0}
          left={0}
          h="full"
          w="full"
          _hover={{ bg: "blackA.9" }}
        >
          <Flex flexDir="column" position="absolute" top={2} right={2} gap={2}>
            <IconButton
              icon={<Icon as={hasCopied ? RiCheckFill : RiLink} />}
              onClick={onCopy}
              aria-label="copy url to clipboard"
            />
            <IconButton
              as={Link}
              href={video.url}
              icon={<Icon as={RiExternalLinkFill} />}
              aria-label="open image in new tab"
              isExternal
              target="_blank"
              rel="noopener noreferrer"
            />
          </Flex>
          <LightMode>
            <IconButton
              aria-label="Play"
              size="lg"
              icon={<Icon as={vidState.playing ? RiPauseFill : RiPlayFill} />}
              isRound
              colorScheme="blackA"
              onClick={handlePlayPause}
            />
          </LightMode>
          <Grid templateColumns="1fr max-content" w="full" position="absolute" bottom={2} px={4}>
            <Slider
              aria-label="video seek"
              colorScheme="gray"
              value={Math.round(100 * vidState.played)}
              onMouseDown={handleSeekMouseDown}
              onMouseUp={handleSeekMouseUp}
              onChange={handleSeekChange}
            >
              <SliderTrack>
                <SliderFilledTrack />
              </SliderTrack>
              <SliderThumb />
            </Slider>
          </Grid>
        </Grid>
      </>
    </AspectRatio>
  );
};
